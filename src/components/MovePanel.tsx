import { useEffect, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TweakStore, PanelConfig, ControlMeta } from '../store/TweakStore';
import { isDevDefault } from '../env';
import type { TweakTheme } from './TweakRoot';
import { buildMovePages, normalizeDial, denormalizeDial, normalizeRangeDial, denormalizeRangeDial, dialOrigin, MOVE_TRACKS, MOVE_DIALS } from '../move-layout';
import { resolveAxis, valueFromPoint, pointFromValue, normalizeValue, centerValue, applyDetentAxis, type XYValue } from '../xy-pad-core';

interface MovePanelProps {
  theme?: TweakTheme;
  productionEnabled?: boolean;
  /** Mirror only the named panels, in the order given — same option the bridge kit takes. */
  panels?: string | string[];
}

/** The Move's four track colours, in track order (Figma node 802:321). */
export const MOVE_TRACK_COLORS = ['#4274f4', '#d83dff', '#ff4d07', '#52bd06'];

/** The on-screen pad grid is the full Move grid: 4 rows of 8 (Figma 802:319). */
const PAD_ROWS = 4;
const PAD_COLS = 8;

/** The slider track's inset from the dial slot's edges (Figma 802:767). */
const DIAL_TRACK_INSET = 10;

/** The xy field's inset within its slot — must match .tweakers-move-xy. */
const XY_INSET = { left: 8, top: 8, right: 9, bottom: 8 };

/** Default grid when an xy control leaves `grid` on — the XYPad's 5×5. */
const XY_GRID_DEFAULT = 5;

/** Press shorter than this is a tap (latch); longer is a hold (peek). */
const TAP_MS = 300;

/**
 * The bridge kit's window events, keyed by control path:
 * - touch (in): `{ pageId, touched }` — a finger on a physical knob.
 * - override (in): `{ pageId, held, latched }` — hardware value-pad holds
 *   and latches, so the screen mirrors them.
 * - latch (out): `{ pageId, path, latched }` — a screen tap latching or
 *   releasing a value chip, for the kit to relay to the hardware.
 */
export const MOVE_TOUCH_EVENT = 'move-tweakers:touch';
export const MOVE_OVERRIDE_EVENT = 'move-tweakers:override';
export const MOVE_LATCH_EVENT = 'move-tweakers:latch';

/**
 * The Move's control surface docked to the bottom edge, laid out to Cri's
 * Figma spec (file USU9CW2vC3SrvKsnHVnYGi, node 802:319; slot components
 * 802:756 and 800:1737): a track row of four coloured markers, 8 dial
 * slots hosting slider ports, and the pad grid — toggle chips on the
 * first row, value chips on the second, at the same columns as their
 * hardware pads (move-layout keeps both surfaces in agreement).
 *
 * Value chips substitute the dial in their column: hold one to peek at
 * its value in the dial slot, tap to latch it in — the chip inverts and
 * pulses until tapped again. The same gestures on the physical pads
 * arrive through the kit's override event and read identically here.
 *
 * An xy control takes a dial slot as a 2D pad: the field draws behind the
 * label (no slider at the bottom) with crosshair lines meeting at the dot.
 * Dragging the slot sets both axes; on the hardware the column's knob
 * turns X, and the volume knob turns Y while that knob is touched.
 *
 * A range control keeps the slider look but its fill is the span between
 * the two ends — dragging moves the nearer end, and on the hardware the
 * column's knob moves the low end while the volume knob moves the high
 * end while that knob is touched. Bipolar/origin sliders anchor their
 * fill at the origin and read as a signed offset.
 */
export function MovePanel({ theme = 'system', productionEnabled = isDevDefault, panels: only }: MovePanelProps) {
  if (!productionEnabled) return null;
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [track, setTrack] = useState(0);
  const [dragPath, setDragPath] = useState<string | null>(null);
  // Hardware presence, by control path — from the bridge kit's window events.
  const [handTouch, setHandTouch] = useState<Record<string, boolean>>({});
  const [hwHeld, setHwHeld] = useState<Record<string, boolean>>({});
  const [hwLatched, setHwLatched] = useState<Record<string, boolean>>({});
  // Screen-side value-chip substitution: a held chip peeks, a tapped chip latches.
  const [held, setHeld] = useState<{ col: number; meta: ControlMeta } | null>(null);
  const [latched, setLatched] = useState<Record<number, ControlMeta | undefined>>({});
  const holdStart = useRef(0);
  const [mounted, setMounted] = useState(false);

  const onlyKey = Array.isArray(only) ? only.join(' ') : only;
  const read = useCallback(
    () => TweakStore.selectPanels(onlyKey === undefined ? undefined : onlyKey.split(' ')),
    [onlyKey]
  );

  useEffect(() => {
    setMounted(true);
    setPanels(read());
    return TweakStore.subscribeGlobal(() => setPanels(read()));
  }, [read]);

  const pages = buildMovePages(panels);
  const page = pages[Math.min(track, Math.max(0, pages.length - 1))];
  const pageId = page?.panel.id;

  // Subscribe to the active page's value changes (per-panel channel only).
  const values = useSyncExternalStore(
    useCallback((cb) => (pageId ? TweakStore.subscribe(pageId, cb) : () => {}), [pageId]),
    () => (pageId ? TweakStore.getValues(pageId) : undefined),
    () => undefined
  );

  // Hardware presence: a finger on a knob, a held or latched value pad.
  useEffect(() => {
    const forPage = (detail: { pageId?: string } | undefined, map: unknown) =>
      detail && detail.pageId === pageId ? (map as Record<string, boolean>) ?? {} : {};
    const onTouch = (e: Event) => {
      const d = (e as CustomEvent).detail;
      setHandTouch(forPage(d, d?.touched));
    };
    const onOverride = (e: Event) => {
      const d = (e as CustomEvent).detail;
      setHwHeld(forPage(d, d?.held));
      setHwLatched(forPage(d, d?.latched));
    };
    window.addEventListener(MOVE_TOUCH_EVENT, onTouch);
    window.addEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    return () => {
      window.removeEventListener(MOVE_TOUCH_EVENT, onTouch);
      window.removeEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    };
  }, [pageId]);

  // Substitutions belong to their page — switching tracks releases them.
  useEffect(() => {
    setHeld(null);
    setLatched({});
  }, [pageId]);

  if (!mounted || typeof window === 'undefined' || pages.length === 0 || !page || !values) return null;

  const slots = <T,>(items: T[], count: number) =>
    Array.from({ length: count }, (_, i) => items[i]);

  // The readout is the dial's position, 0–100 — the same normalized number
  // the Move itself works in.
  const dialPercent = (meta: ControlMeta) =>
    Math.round(normalizeDial(meta, values[meta.path]) * 100);

  // The value chip shows the real value: number in bold, unit trailing.
  const chipValue = (meta: ControlMeta): { num: string; unit?: string } => {
    const n = Number(values[meta.path]);
    if (!Number.isFinite(n)) return { num: '' };
    if (meta.formatValue) return { num: meta.formatValue(n) };
    const num = Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString();
    return { num, unit: meta.unit };
  };

  // Whole-slot hotspot, position-on-the-track sets the value — the same feel
  // as the library Slider's card.
  const dialFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const v01 = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeDial(meta, v01));
  };

  // A range slot moves whichever end sits nearer to the pointer; the
  // denormalizer keeps the pair ordered when a drag crosses over.
  const rangeFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const t = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    const r = normalizeRangeDial(meta, values[meta.path]);
    const nearLo = Math.abs(t - r.lo) <= Math.abs(t - r.hi);
    TweakStore.updateValue(
      page.panel.id,
      meta.path,
      denormalizeRangeDial(meta, nearLo ? t : r.lo, nearLo ? r.hi : t)
    );
  };

  // An xy slot maps the pointer through the same core as the library XYPad:
  // value mapping, snap-to-grid, and the escapable centre detent all included.
  const xyFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width - XY_INSET.left - XY_INSET.right;
    const h = rect.height - XY_INSET.top - XY_INSET.bottom;
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left - XY_INSET.left) / (w || 1)));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top - XY_INSET.top) / (h || 1)));
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    const raw = valueFromPoint({ x: px, y: py }, xa, ya, !!meta.snap);
    const origin = pointFromValue(centerValue(xa, ya), xa, ya);
    TweakStore.updateValue(page.panel.id, meta.path, {
      x: applyDetentAxis(raw.x, xa, Math.abs(px - origin.x) * (w || 1)),
      y: applyDetentAxis(raw.y, ya, Math.abs(py - origin.y) * (h || 1)),
    });
  };

  // Joystick-style pads rest at their centre when the pointer lets go.
  const xyRelease = (meta: ControlMeta) => {
    setDragPath(null);
    if (!meta.returnToCenter) return;
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    TweakStore.updateValue(page.panel.id, meta.path, normalizeValue(centerValue(xa, ya), xa, ya, !!meta.snap));
  };

  const chipLatched = (col: number, meta: ControlMeta) =>
    latched[col]?.path === meta.path || !!hwLatched[meta.path];

  // What a dial column actually edits: a held chip wins (screen or pad),
  // then a latched one, then the column's own dial.
  const dialAt = (col: number): ControlMeta | undefined => {
    if (held && held.col === col) return held.meta;
    const hw = page.values[col];
    if (hw && hwHeld[hw.path]) return hw;
    if (latched[col]) return latched[col];
    if (hw && hwLatched[hw.path]) return hw;
    return page.dials[col];
  };

  const pressChip = (e: React.PointerEvent<HTMLElement>, col: number, meta: ControlMeta) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    holdStart.current = Date.now();
    setHeld({ col, meta });
  };

  const releaseChip = (col: number, meta: ControlMeta) => {
    setHeld(null);
    if (Date.now() - holdStart.current >= TAP_MS) return;
    const wasLatched = chipLatched(col, meta);
    setLatched((prev) => ({ ...prev, [col]: wasLatched ? undefined : meta }));
    // Tell the hardware side; the kit relays it when the bridge is up.
    window.dispatchEvent(new CustomEvent(MOVE_LATCH_EVENT, {
      detail: { pageId: page.panel.id, path: meta.path, latched: !wasLatched },
    }));
  };

  const padRows: (ControlMeta[])[] = [page.toggles, page.values, [], []];

  const content = (
    <div className="tweakers-root tweakers-move-root" data-theme={theme}>
      <div className="tweakers-move">
        <div className="tweakers-move-inner">
          <div className="tweakers-move-tracks">
            {slots(pages, MOVE_TRACKS).map((pg, i) => (
              <button
                key={pg ? pg.panel.id : `empty-${i}`}
                className="tweakers-move-track"
                data-active={pg ? pg === page : undefined}
                data-empty={pg ? undefined : true}
                disabled={!pg}
                onClick={() => setTrack(i)}
              >
                <span className="tweakers-move-track-marker" style={{ background: MOVE_TRACK_COLORS[i] }} />
                {pg && <span className="tweakers-move-track-label">{pg.panel.name}</span>}
              </button>
            ))}
          </div>

          <div className="tweakers-move-grid">
            <div className="tweakers-move-dials">
              {Array.from({ length: MOVE_DIALS }, (_, i) => {
                const meta = dialAt(i);
                if (!meta) return <div key={`empty-${i}`} className="tweakers-move-dial" data-empty="true" />;
                const active =
                  dragPath === meta.path ||
                  !!handTouch[meta.path] ||
                  !!hwHeld[meta.path] ||
                  (held !== null && held.col === i);
                // An xy control fills its slot with the pad — the field draws
                // behind the label and there is no slider at the bottom.
                if (meta.type === 'xy') {
                  const xa = resolveAxis(meta.xAxis);
                  const ya = resolveAxis(meta.yAxis);
                  const pos = pointFromValue(
                    normalizeValue(values[meta.path] as Partial<XYValue>, xa, ya),
                    xa, ya
                  );
                  // Grid semantics match the XYPad: on by default (5×5), a
                  // number for N×N, density multiplies, false hides.
                  const gridBase = meta.grid === false ? 0 : typeof meta.grid === 'number' ? meta.grid : XY_GRID_DEFAULT;
                  const gridN = gridBase > 0 ? Math.round(gridBase * Math.max(0, meta.density ?? 1)) : 0;
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="xy"
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        setDragPath(meta.path);
                        xyFromPointer(e, meta);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) xyFromPointer(e, meta);
                      }}
                      onPointerUp={() => xyRelease(meta)}
                      onPointerCancel={() => xyRelease(meta)}
                    >
                      <div className="tweakers-move-xy">
                        {gridN > 0 && (
                          <span
                            className="tweakers-move-xy-grid"
                            style={{
                              '--tweak-xy-grid-step-x': `${100 / gridN}%`,
                              '--tweak-xy-grid-step-y': `${100 / gridN}%`,
                            } as React.CSSProperties}
                          />
                        )}
                        <span className="tweakers-move-xy-line" data-axis="x" style={{ top: `${pos.y * 100}%` }} />
                        <span className="tweakers-move-xy-line" data-axis="y" style={{ left: `${pos.x * 100}%` }} />
                        <span className="tweakers-move-xy-dot" style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }} />
                      </div>
                      <div className="tweakers-move-dial-readout">
                        <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                          {meta.label}
                        </span>
                        <span className="tweakers-move-dial-value">
                          {Math.round(pos.x * 100)}·{Math.round((1 - pos.y) * 100)}
                        </span>
                      </div>
                    </div>
                  );
                }
                // A range control keeps the slider look but the fill is the
                // span between its two ends; drag moves the nearer end.
                if (meta.type === 'range') {
                  const r = normalizeRangeDial(meta, values[meta.path]);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="range"
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        setDragPath(meta.path);
                        rangeFromPointer(e, meta);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) rangeFromPointer(e, meta);
                      }}
                      onPointerUp={() => setDragPath(null)}
                      onPointerCancel={() => setDragPath(null)}
                    >
                      <div className="tweakers-move-dial-readout">
                        <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                          {meta.label}
                        </span>
                        <span className="tweakers-move-dial-value">
                          {Math.round(r.lo * 100)}–{Math.round(r.hi * 100)}%
                        </span>
                      </div>
                      <div className="tweakers-move-dial-bar">
                        <div
                          className="tweakers-move-dial-fill"
                          style={{ marginLeft: `${r.lo * 100}%`, width: `${(r.hi - r.lo) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                }
                // The slot pulses with its chip while a latched value sits in it.
                const latchedHere =
                  latched[i]?.path === meta.path || (page.values[i]?.path === meta.path && !!hwLatched[meta.path]);
                // A bipolar/origin slider anchors its fill at the origin and
                // reads as a signed offset instead of 0–100.
                const o01 = dialOrigin(meta);
                const v01 = normalizeDial(meta, values[meta.path]);
                const signed = Math.round((v01 - o01) * 100);
                return (
                  <div
                    key={meta.path}
                    className="tweakers-move-dial"
                    data-active={active || undefined}
                    data-latched={latchedHere || undefined}
                    onPointerDown={(e) => {
                      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                      setDragPath(meta.path);
                      dialFromPointer(e, meta);
                    }}
                    onPointerMove={(e) => {
                      if (dragPath === meta.path) dialFromPointer(e, meta);
                    }}
                    onPointerUp={() => setDragPath(null)}
                    onPointerCancel={() => setDragPath(null)}
                  >
                    <div className="tweakers-move-dial-readout">
                      <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                        {meta.label}
                      </span>
                      <span className="tweakers-move-dial-value">
                        {o01 > 0 ? `${signed > 0 ? '+' : ''}${signed}%` : `${dialPercent(meta)}%`}
                      </span>
                    </div>
                    <div className="tweakers-move-dial-bar">
                      <div
                        className="tweakers-move-dial-fill"
                        style={o01 > 0
                          ? { marginLeft: `${Math.min(v01, o01) * 100}%`, width: `${Math.abs(v01 - o01) * 100}%` }
                          : { width: `${dialPercent(meta)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trailing empty pad rows collapse: a row shows only if it, or any
                row after it, has something in it — so gaps inside the grid hold
                their place, but the panel never ends on dead rows. */}
            {Array.from({ length: PAD_ROWS }, (_, row) => row)
              .filter((row) => padRows.slice(row).some((r) => r.length > 0))
              .map((row) => (
                <div key={row} className="tweakers-move-pads">
                  {Array.from({ length: PAD_COLS }, (_, col) => {
                    const meta = padRows[row][col];
                    if (!meta) return <div key={`empty-${col}`} className="tweakers-move-pad" data-empty="true" />;
                    if (row === 0) {
                      return (
                        <button
                          key={meta.path}
                          className="tweakers-move-pad"
                          data-kind="toggle"
                          data-on={!!values[meta.path]}
                          onClick={() => TweakStore.updateValue(page.panel.id, meta.path, !values[meta.path])}
                        >
                          <span className="tweakers-move-pad-indicator" />
                          <span className="tweakers-move-pad-title">{meta.label}</span>
                        </button>
                      );
                    }
                    const value = chipValue(meta);
                    return (
                      <button
                        key={meta.path}
                        className="tweakers-move-pad"
                        data-kind="value"
                        data-held={(held !== null && held.meta.path === meta.path) || hwHeld[meta.path] || undefined}
                        data-latched={chipLatched(col, meta) || undefined}
                        onPointerDown={(e) => pressChip(e, col, meta)}
                        onPointerUp={() => releaseChip(col, meta)}
                        onPointerCancel={() => setHeld(null)}
                      >
                        <span className="tweakers-move-pad-title">{meta.label}</span>
                        <span className="tweakers-move-pad-reading">
                          <span className="tweakers-move-pad-number">{value.num}</span>
                          {value.unit && <span>{value.unit}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
