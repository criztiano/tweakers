import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { TweakStore, type ControlMeta, type PanelConfig } from '../store/TweakStore';
import { ModulationStore } from '../store/ModulationStore';
import { MoveColorStore, MOVE_GRADIENT_STOPS } from '../move-color';
import { normalizeGradient, rampCss } from '../gradient-core';
import { normalizeTransfer, sampleTransfer } from '../transfer-core';
import { resolveAxis, pointFromValue, normalizeValue, type XYValue } from '../xy-pad-core';
import { resolveFilterAxis, normalizeFilterValue } from '../filter-core';
import { valueToBearing } from '../angle-core';
import {
  normalizeDial, normalizeRangeDial, dialOrigin, isEnumDial, enumIndex, enumOptionLabel, enumOptionIcon,
  enumShapePath, filterShapePath,
} from '../move-layout';
import {
  moveNumericDrawing, movePlaybackMode, moveVisualReading, moveTrimSpan, moveGateSpan, moveVectorAxes, moveMultibandSpan,
  moveChannelPosition,
} from '../move-visual-core';
import {
  MOVE_TAP_SLOP, moveDialKey, moveRangeValue,
  moveFilterValue, moveXYValue, moveXYRest, moveNeedleValue, moveTransferValue, moveRampStop, moveRampValue,
  moveDialPercent, moveDialReading, moveRangeReading, moveChipValue, moveXYGrid,
  moveShapePath, movePressStart, movePressTravel, movePressEnd, moveTurnValue, moveTurnExtent, moveOptionStep,
  moveNextOption, type MoveFaceRole, type MoveFineAnchor, type MovePress,
} from '../move-slot-core';
import {
  moveSlotKind, MoveSlotDefaultBody, MoveSlotEnumBody, MoveSlotXYBody, MoveSlotRangeBody, MoveSlotFilterBody,
  MoveSlotNumericBody, MoveSlotTrimSpanBody, MoveSlotGateBody, MoveSlotVectorBody, MoveSlotMultibandBody, MoveSlotChannelBody,
  MoveSlotToggleBody, MoveSlotMetronomeBody, MoveSlotTransferBody, MoveSlotRampBody, MoveSlotDialBody,
} from './move-slots';
import { MoveColorSlot } from './MoveColor';
import { MoveModRing } from './ModRing';
import { MoveGateDisplay } from './MoveGateDisplay';
import { MoveMultibandDisplay } from './MoveMultibandDisplay';

export interface MoveSlotProps {
  /** The registered panel the control lives in — its id or its name. */
  panel: string;
  /**
   * The control this slot is, by path. Several paths draw an instrument made
   * of several dials, when they read as one: a take's start and end, a gate's
   * threshold, look-ahead and release, a multiband cleaner's amount, speed
   * and bands, a mixer's channels — each keeping its own drag zone.
   */
  path: string | string[];
  /** The value is the headline and the name a tag on top — the face a chip
   *  wears when a dial borrows it. */
  valueFirst?: boolean;
  className?: string;
  style?: CSSProperties;
}

const flat = (controls: ControlMeta[], out: ControlMeta[] = []): ControlMeta[] => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};

const findPanel = (panel: string): PanelConfig | undefined =>
  TweakStore.getPanel(panel) ?? TweakStore.getPanels().find((p) => p.name === panel);

/** Warn once per slot about paths that do not make an instrument. */
const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[tweakers] MoveSlot: ${message}`);
}

/**
 * One Move slot, live, anywhere on the page: the face a control wears in the
 * instrument, answering the pointer and the keyboard the way it does there —
 * the drag rules are the instrument's own (move-slot-core), so a slot feels
 * the same wherever it is placed.
 *
 * It reads and writes the shared store, so a slot and the instrument holding
 * the same control stay one control: turn either and both move. It claims no
 * hardware — the Move keeps following the instrument on screen.
 *
 * Every face a single control can wear is here, and the instruments built of
 * several dials. The faces that only live on a modulator's page (the scope,
 * the envelope) belong to that page.
 */
export function MoveSlot({ panel, path, valueFirst = false, className, style }: MoveSlotProps) {
  // The panel may register after the slot mounts, or be replaced by a
  // re-registration: the slot follows it by name.
  const config = useSyncExternalStore(
    useCallback((cb) => TweakStore.subscribeGlobal(cb), []),
    () => findPanel(panel),
    () => undefined,
  );
  const panelId = config?.id;
  const values = useSyncExternalStore(
    useCallback((cb) => (panelId ? TweakStore.subscribe(panelId, cb) : () => {}), [panelId]),
    () => (panelId ? TweakStore.getValues(panelId) : undefined),
    () => undefined,
  );
  // A sampler or a response repointed by the host lands on this channel,
  // one beat behind the value change that caused it.
  useSyncExternalStore(
    useCallback((cb) => (panelId ? TweakStore.subscribeControlState(panelId, cb) : () => {}), [panelId]),
    () => 0,
    () => 0,
  );
  useSyncExternalStore(
    useCallback((cb) => ModulationStore.subscribe(cb), []),
    () => ModulationStore.getVersion(),
    () => 0,
  );
  useSyncExternalStore(MoveColorStore.subscribe, MoveColorStore.getVersion, () => 0);

  // The gesture state a drag keeps between events.
  const fine = useRef<MoveFineAnchor | null>(null);
  const rangeHandle = useRef<'min' | 'max'>('min');
  const filterHand = useRef<'cutoff' | 'resonance'>('cutoff');
  const faceDrag = useRef<ControlMeta | null>(null);
  const press = useRef<MovePress | null>(null);
  const tap = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [dragPath, setDragPath] = useState<string | null>(null);
  const [heldPoint, setHeldPoint] = useState(0);
  const [heldStop, setHeldStop] = useState(0);

  if (!config || !values || !panelId) return null;
  const paths = Array.isArray(path) ? path : [path];
  const controls = flat(config.controls);
  const metas = paths.map((p) => controls.find((c) => c.path === p));
  if (metas.some((m) => !m)) {
    warnOnce(`${panel}:${paths.join(',')}`, `no control at ${paths.filter((_, k) => !metas[k]).join(', ')} in "${panel}".`);
    return null;
  }
  const all = metas as ControlMeta[];
  const write = (meta: ControlMeta, next: unknown) => TweakStore.updateValue(panelId, meta.path, next as never);
  const off = (meta: ControlMeta) => TweakStore.isDisabled(panelId, meta.path);
  const cls = className ? `tweakers-move-dial ${className}` : 'tweakers-move-dial';

  /** A drag on `meta`: capture, arm modulation, and hand each event to `turn`. */
  const drag = (meta: ControlMeta, turn: (e: ReactPointerEvent<HTMLElement>, down: boolean) => void, release?: () => void) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (off(meta)) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
      fine.current = null;
      setDragPath(meta.path);
      ModulationStore.noteTouch(panelId, meta.path);
      turn(e, true);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (dragPath === meta.path && !off(meta)) turn(e, false);
    },
    onPointerUp: () => { setDragPath(null); fine.current = null; release?.(); },
    onPointerCancel: () => { setDragPath(null); fine.current = null; },
  });

  /* A one-value slot turns from where it is and a press alone never moves
     it; an option slot steps on a click; a still Shift+click puts either
     back to its default — the instrument's own rules (move-slot-core). */
  const begin = (e: ReactPointerEvent<HTMLElement>, meta: ControlMeta, v: number) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    fine.current = null;
    press.current = movePressStart(meta.path, e, v);
    setDragPath(meta.path);
    ModulationStore.noteTouch(panelId!, meta.path);
  };
  const end = (meta: ControlMeta) => {
    setDragPath(null);
    return movePressEnd(press, meta.path);
  };
  const reset = (meta: ControlMeta) => {
    const first = TweakStore.getDefault(panelId!, meta.path);
    if (first !== undefined && !off(meta)) write(meta, first);
  };
  const turn = (meta: ControlMeta) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button <= 0 && !off(meta)) begin(e, meta, normalizeDial(meta, values![meta.path]));
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      const p = movePressTravel(press, meta.path, e, () => normalizeDial(meta, values![meta.path]));
      if (p && !off(meta)) write(meta, moveTurnValue(meta, p, e, moveTurnExtent(e.currentTarget.getBoundingClientRect())));
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => { if (end(meta) && e.shiftKey) reset(meta); },
    onPointerCancel: () => { end(meta); },
  });
  const step = (meta: ControlMeta) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button <= 0 && !off(meta)) begin(e, meta, enumIndex(meta, values![meta.path]));
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      const p = movePressTravel(press, meta.path, e, () => enumIndex(meta, values![meta.path]));
      const next = p && !off(meta) ? moveOptionStep(meta, values![meta.path], p, e) : undefined;
      if (next !== undefined) write(meta, next);
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      if (!end(meta) || off(meta)) return;
      const next = e.shiftKey ? TweakStore.getDefault(panelId!, meta.path) : moveNextOption(meta, values![meta.path]);
      if (next !== undefined) write(meta, next);
    },
    onPointerCancel: () => { end(meta); },
  });

  const keys = (meta: ControlMeta) => (e: ReactKeyboardEvent<HTMLElement>) => {
    if (off(meta)) return;
    const next = moveDialKey(meta, values[meta.path], e);
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    ModulationStore.noteTouch(panelId, meta.path);
    write(meta, next);
  };

  /** A slider's accessible name and reading, for a slot or a zone. */
  const slider = (meta: ControlMeta) => ({
    role: 'slider' as const,
    tabIndex: off(meta) ? -1 : 0,
    'aria-label': meta.label,
    'aria-valuemin': meta.min ?? 0,
    'aria-valuemax': meta.max ?? 1,
    'aria-valuenow': Number(values[meta.path]),
    'aria-valuetext': moveVisualReading(meta, Number(values[meta.path])),
    'aria-orientation': 'horizontal' as const,
    'aria-disabled': off(meta) || undefined,
    'data-disabled': off(meta) || undefined,
    onKeyDown: keys(meta),
  });

  /** An instrument of several dials: a take, a gate, a cleaner, a mixer. */
  const face = (dials: ControlMeta[]): ReactNode => {
    const vals = values!;
    const reading = (m: ControlMeta) => ({
      label: m.label, value: moveVisualReading(m, Number(vals[m.path])), active: dragPath === m.path,
    });

    const take = dials.length === 2 ? moveTrimSpan(dials[0], vals[dials[0].path], dials[1], vals[dials[1].path]) : null;
    if (take) {
      const edges = [
        { edge: 'start' as const, meta: dials[0], position: take.start },
        { edge: 'end' as const, meta: dials[1], position: take.end },
      ];
      const side = (e: typeof edges[number]) => ({
        ...reading(e.meta), position: e.position,
        moved: e.edge === 'start' ? e.position > 1e-9 : e.position < 1 - 1e-9,
      });
      return (
        <div className={cls} style={style} data-kind="trim-span" data-active={edges.some((e) => dragPath === e.meta.path) || undefined}>
          <MoveSlotTrimSpanBody start={side(edges[0])} end={side(edges[1])} />
          <div className="tweakers-move-trim-span-zones">
            {edges.map((e) => (
              <div key={e.meta.path} className="tweakers-move-trim-span-zone" {...slider(e.meta)} {...turn(e.meta)}>
                <MoveModRing panelId={panelId!} path={e.meta.path} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    type Dial = { role: MoveFaceRole; meta: ControlMeta; position: number; track?: string };
    let kind: 'gate' | 'vector' | 'multiband' | 'channel';
    let parts: Dial[];
    let body: ReactNode;
    const shown = (d: Dial) => ({ ...reading(d.meta), position: d.position });
    const gate = dials.length === 3 ? moveGateSpan(dials.map((m) => [m, vals[m.path]])) : null;
    const place = dials.length === 3 ? moveVectorAxes(dials.map((m) => [m, vals[m.path]])) : null;
    const cleaner = dials.length >= 3
      ? moveMultibandSpan(dials.map((m) => [m, vals[m.path]]), dials.slice(2).map((m) => [m, vals[m.path]]))
      : null;
    const channels = dials.map((m) => moveChannelPosition(m, vals[m.path]));
    if (gate) {
      kind = 'gate';
      parts = (['threshold', 'lookahead', 'release'] as const).map((role, k) => ({ role, meta: dials[k], position: gate[role] }));
      body = (
        <MoveSlotGateBody threshold={shown(parts[0])} lookahead={shown(parts[1])} release={shown(parts[2])}>
          <MoveGateDisplay panelId={panelId} threshold={parts[0].position} />
        </MoveSlotGateBody>
      );
    } else if (place) {
      kind = 'vector';
      parts = (['x', 'y', 'z'] as const).map((axis, k) => ({ role: `axis-${axis}` as const, meta: dials[k], position: place[axis] }));
      body = <MoveSlotVectorBody x={shown(parts[0])} y={shown(parts[1])} z={shown(parts[2])} down={place.down} />;
    } else if (cleaner) {
      kind = 'multiband';
      parts = dials.map((meta, k) => ({
        role: k === 0 ? 'amount' : k === 1 ? 'speed' : 'band',
        meta,
        position: k === 0 ? cleaner.amount : k === 1 ? cleaner.speed : cleaner.bands.find((b) => b.meta === meta)!.position,
      }));
      const visual = dials[0].moveVisual;
      body = (
        <MoveSlotMultibandBody amount={shown(parts[0])} speed={shown(parts[1])} bands={parts.slice(2).map(shown)}
          icon={visual?.kind === 'multiband' && visual.role === 'amount' ? visual.icon : undefined}>
          <MoveMultibandDisplay panelId={panelId}
            bands={cleaner.bands.map((b) => ({ position: b.position, active: dragPath === b.meta.path }))} />
        </MoveSlotMultibandBody>
      );
    } else if (channels.every((c) => c !== null)) {
      kind = 'channel';
      parts = dials.map((meta, k) => ({ role: 'channel', meta, position: channels[k]!, track: `channel-${k}` }));
      body = (
        <MoveSlotChannelBody channels={parts.map((d) => {
          const visual = d.meta.moveVisual;
          return { ...shown(d), ...(visual?.kind === 'channel' ? { icon: visual.icon, tone: visual.tone } : {}) };
        })} />
      );
    } else {
      warnOnce(`${panel}:${dials.map((d) => d.path).join(',')}`,
        `${dials.map((d) => d.path).join(', ')} do not draw as one instrument — give each its own slot.`);
      return null;
    }
    return (
      <div className={cls} style={style} data-kind={kind} data-active={parts.some((d) => dragPath === d.meta.path) || undefined}>
        {body}
        <div className="tweakers-move-face-zones">
          {parts.map((d) => (
            <div key={d.meta.path} className="tweakers-move-face-zone" data-role={d.role} {...slider(d.meta)}
              aria-orientation={d.role === 'lookahead' || d.role === 'axis-x' ? 'horizontal' : 'vertical'}
              onPointerDown={(e) => {
                // On the band grid the press takes the band under it.
                let m = d.meta;
                if (d.role === 'band' && cleaner) {
                  const grid = e.currentTarget.closest?.('.tweakers-move-dial')?.querySelector('[data-track="grid"]')?.getBoundingClientRect();
                  if (grid?.width) {
                    const k = Math.floor(((e.clientX - grid.left) / grid.width) * cleaner.bands.length);
                    m = cleaner.bands[Math.max(0, Math.min(cleaner.bands.length - 1, k))].meta;
                  }
                }
                faceDrag.current = m;
                turn(m).onPointerDown(e);
              }}
              onPointerMove={(e) => { if (faceDrag.current) turn(faceDrag.current).onPointerMove(e); }}
              onPointerUp={(e) => { if (faceDrag.current) turn(faceDrag.current).onPointerUp(e); faceDrag.current = null; }}
              onPointerCancel={() => { if (faceDrag.current) turn(faceDrag.current).onPointerCancel(); faceDrag.current = null; }}
            >
              <MoveModRing panelId={panelId!} path={d.meta.path} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (all.length > 1) return face(all);
  const meta = all[0];
  const value = values[meta.path];
  const active = dragPath === meta.path;

  if (meta.type === 'color') {
    const view = MoveColorStore.getView();
    return (
      <MoveColorSlot panelId={panelId} meta={meta} active={active} className={className} style={style}
        open={view?.panelId === panelId && view.path === meta.path} />
    );
  }

  if (meta.type === 'toggle') {
    const checked = value === true;
    const kind = moveSlotKind(meta);
    return (
      <button type="button" className={cls} style={style} data-kind={kind} data-on={checked || undefined}
        role="switch" aria-label={meta.label} aria-checked={checked} disabled={off(meta)}
        onClick={() => { if (!off(meta)) write(meta, !checked); }}>
        <MoveModRing panelId={panelId} path={meta.path} />
        {kind === 'metronome' ? (
          <MoveSlotMetronomeBody label={meta.label} checked={checked}
            swing={meta.moveVisual?.kind === 'metronome' ? meta.moveVisual.swing : undefined} />
        ) : (
          <MoveSlotToggleBody label={meta.label} checked={checked} icon={meta.icon} onIcon={meta.onIcon} offIcon={meta.offIcon} />
        )}
      </button>
    );
  }

  if (meta.type === 'filter') {
    const fv = normalizeFilterValue(value, resolveFilterAxis(meta.cutoffAxis, 'cutoff'), resolveFilterAxis(meta.resonanceAxis, 'resonance'));
    return (
      <div className={cls} style={style} data-kind="filter" data-active={active || undefined}
        data-disabled={meta.filterEnabled === false || undefined}
        {...drag(meta, (e, down) => write(meta, moveFilterValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), filterHand, fine, down)))}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotFilterBody meta={meta} value={fv} shape={filterShapePath(meta, value)} />
      </div>
    );
  }

  // A ramp: a drag slides the nearest stop; a still press is a tap, which
  // opens the colour editor wherever the page has one.
  if (meta.type === 'gradient') {
    const g = normalizeGradient(value as never);
    const editable = g.stops.length <= MOVE_GRADIENT_STOPS;
    const view = MoveColorStore.getView();
    const open = view?.panelId === panelId && view.path === meta.path;
    const index = Math.min(open ? MoveColorStore.getStop() : heldStop, g.stops.length - 1);
    return (
      <div className={cls} style={style} data-kind="ramp" data-active={active || open || undefined}
        role={editable ? 'button' : undefined} aria-expanded={editable ? open : undefined} aria-haspopup={editable ? 'dialog' : undefined}
        {...drag(meta, (e, down) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (down) {
            tap.current = { x: e.clientX, y: e.clientY, moved: false };
            const picked = moveRampStop(values[meta.path], e, rect);
            setHeldStop(picked);
            if (open) MoveColorStore.selectStop(picked);
            return;                        /* the press only picks — moving writes */
          }
          const t = tap.current;
          if (!t || (!t.moved && Math.hypot(e.clientX - t.x, e.clientY - t.y) < MOVE_TAP_SLOP)) return;
          t.moved = true;
          write(meta, moveRampValue(values[meta.path], e, rect, index));
        }, () => {
          const tapped = tap.current && !tap.current.moved;
          tap.current = null;
          if (tapped && editable && !off(meta)) MoveColorStore.toggle(panelId, meta.path);
        })}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotRampBody label={meta.label} value={`${index + 1}/${g.stops.length}`} css={rampCss(g.stops)}
          stop={g.stops[index]?.position ?? null} stops={open ? g.stops.map((s) => s.position) : undefined} />
      </div>
    );
  }

  if (meta.type === 'balance') {
    const a = String(values[meta.balanceA ?? ''] ?? '#000000');
    const b = String(values[meta.balanceB ?? ''] ?? '#ffffff');
    const v = Math.min(1, Math.max(0, Number(value ?? 0.5)));
    return (
      <div className={cls} style={style} data-kind="balance" data-active={active || undefined} {...slider(meta)}
        {...turn(meta)}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotRampBody label={meta.label} value={`${Math.round(v * 100)}%`}
          css={rampCss([{ color: a, position: 0 }, { color: b, position: 1 }])} stop={v} />
      </div>
    );
  }

  if (meta.type === 'slider' && meta.display === 'dial') {
    const min = meta.min ?? 0, max = meta.max ?? 1;
    const v = Number(value ?? min);
    return (
      <div className={cls} style={style} data-kind="dial" data-active={active || undefined} {...slider(meta)}
        {...drag(meta, (e) => {
          const next = moveNeedleValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect());
          if (next !== null) write(meta, next);
        })}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotDialBody label={meta.label}
          value={`${Number(v.toFixed(2))}${meta.unit ?? (Math.abs(max - min) >= 180 ? '°' : '')}`}
          bearing={valueToBearing(v, min, max)} origin={valueToBearing(meta.origin ?? min, min, max)} />
      </div>
    );
  }

  if (meta.type === 'transfer') {
    const points = normalizeTransfer(value).points;
    const index = Math.min(heldPoint, points.length - 1);
    const held = points[index]!;
    return (
      <div className={cls} style={style} data-kind="transfer" data-active={active || undefined}
        {...drag(meta, (e, down) => {
          const next = moveTransferValue(values[meta.path], e, e.currentTarget.getBoundingClientRect(), heldPoint, down);
          if (down) setHeldPoint(next.held);
          write(meta, next.value);
        })}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotTransferBody label={meta.label} value={`${index + 1}/${points.length}`}
          shape={moveShapePath(Array.from({ length: 48 }, (_, k) => sampleTransfer(points, k / 47)))}
          point={{ x: held.x, y: 1 - held.y }} />
      </div>
    );
  }

  if (meta.type === 'xy') {
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    const pos = pointFromValue(normalizeValue(value as Partial<XYValue>, xa, ya), xa, ya);
    return (
      <div className={cls} style={style} data-kind="xy" data-sub={valueFirst || undefined} data-active={active || undefined}
        {...drag(meta, (e) => write(meta, moveXYValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), fine)), () => {
          const rest = moveXYRest(meta);
          if (rest) write(meta, rest);
        })}>
        {valueFirst && <span className="tweakers-move-dial-sub">{meta.label}</span>}
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotXYBody label={meta.label} value={`${Math.round(pos.x * 100)}·${Math.round((1 - pos.y) * 100)}`}
          position={pos} gridN={moveXYGrid(meta)} />
      </div>
    );
  }

  if (meta.type === 'range') {
    const pos = normalizeRangeDial(meta, value);
    return (
      <div className={cls} style={style} data-kind="range" data-active={active || undefined}
        {...drag(meta, (e, down) => write(meta, moveRangeValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), rangeHandle, fine, down)))}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotRangeBody label={meta.label} value={moveRangeReading(meta, value)} lo={pos.lo} hi={pos.hi} />
      </div>
    );
  }

  if (isEnumDial(meta)) {
    const options = meta.options ?? [];
    const activeIdx = enumIndex(meta, value);
    const option = options[activeIdx];
    const optionLabel = enumOptionLabel(option as never);
    const shape = enumShapePath(meta, value);
    const playback = movePlaybackMode(meta, value);
    return (
      <div className={cls} style={style} data-kind="enum" data-visual={playback ? 'playback' : undefined}
        data-shape={shape ? true : undefined} data-active={active || undefined}
        {...slider(meta)} aria-valuemin={0} aria-valuemax={Math.max(0, options.length - 1)} aria-valuenow={activeIdx} aria-valuetext={optionLabel}
        {...step(meta)}>
        <MoveModRing panelId={panelId} path={meta.path} />
        <MoveSlotEnumBody label={meta.label} optionLabel={optionLabel} options={options} activeIdx={activeIdx}
          shape={shape} glyph={enumOptionIcon(option as never)} playback={playback} />
      </div>
    );
  }

  // A plain dial: the basic slot, its value-first twin, or a numeric meaning
  // drawn as what it is.
  const drawing = moveNumericDrawing(meta, value);
  const origin01 = dialOrigin(meta);
  const originPct = origin01 > 0 ? origin01 * 100 : null;
  // A borrowed chip turns the value first, and so does the app's own ask
  // (`display: 'value'`), wherever the slot stands.
  const first = valueFirst || (meta.type === 'slider' && meta.display === 'value');
  const chip = first ? moveChipValue(meta, value) : null;
  return (
    <div className={cls} style={style} data-active={active || undefined} data-sub={(!drawing && first) || undefined}
      data-visual={drawing?.kind} {...slider(meta)}
      {...turn(meta)}>
      {!drawing && first && <span className="tweakers-move-dial-sub">{meta.label}</span>}
      <MoveModRing panelId={panelId} path={meta.path} />
      {drawing ? (
        <MoveSlotNumericBody label={meta.label} value={moveVisualReading(meta, Number(value))} drawing={drawing} />
      ) : (
        <MoveSlotDefaultBody
          label={meta.label}
          value={chip ? `${chip.num}${chip.unit ? ` ${chip.unit}` : ''}` : moveDialReading(meta, value)}
          pct={moveDialPercent(meta, value)}
          originPct={originPct}
          atOrigin={originPct != null && Math.abs(normalizeDial(meta, value) - origin01) < 1e-6}
        />
      )}
    </div>
  );
}
