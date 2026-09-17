import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { formatLabel, TweakStore } from '../store/TweakStore';
import { TimelineStore, type TimelineClipMeta, type TimelineLoopRegion } from '../store/TimelineStore';
import {
  clampClipMove,
  clampClipResizeEnd,
  clampClipResizeStart,
  clampStepResize,
  computeClipStaticFromValues,
  formatSeconds,
  type TimelineClipStatic,
} from '../timeline-core';
import {
  formatTimelineTick,
  MoveTimelineStore,
  packTimelineRows,
  timelineTicks,
  timelineWindow,
  type MoveTimelineClaimOptions,
} from '../move-timeline';
import { MoveFunctions } from '../move-functions';
import { ICON_LOOP, ICON_PLAY } from '../icons';
import { isDevDefault } from '../env';
import type { TweakTheme } from '../theme';

/** How far a docked timeline floats above the panel — the waveform's gap. */
const DOCK_GAP = 14;
/** Pointer travel that turns a press into a drag: a ruler click seeks, a
 *  ruler drag draws a loop; a clip click jumps to it, a clip drag moves it. */
const DRAG_PX = 4;
/** A clip narrower than this still takes a finger. */
const MIN_CLIP_PX = 6;
/** Bars wide enough to carry their length in words. */
const LABEL_CLIP_PX = 48;
/** The room a ruler number needs before the card's edge. */
const LABEL_EDGE_PX = 28;
/** The pinch's gain: wheel pixels to zoom, exponential so in and out match. */
const PINCH_GAIN = 0.01;

export interface MoveTimelineProps {
  /** The timeline to show — the `id` `useMoveTimeline` returned. */
  id: string;
  /** What Rec does here (see `MoveTimelineClaimOptions.onRecord`). Without
   *  it the timeline records nothing and the Rec key stays the app's. */
  onRecord?: MoveTimelineClaimOptions['onRecord'];
  /**
   * `dock` floats above the Move panel, as wide as the window allows up to
   * 960px — the waveform editor's place. `page` is a card wherever the app puts it.
   */
  variant?: 'dock' | 'page';
  /** The playhead and the loop band — the host's signature on the card. */
  accent?: string;
  theme?: TweakTheme;
  productionEnabled?: boolean;
  className?: string;
}

type Row = {
  key: string;
  label: string;
  clips: { meta: TimelineClipMeta; stat: TimelineClipStatic }[];
};

/**
 * The timeline, on the Move's surface — the clips a `useMoveTimeline` defined,
 * on a display card of the waveform's family, driven by the waveform's hands.
 *
 * Mounting one puts its timeline on the instrument (`MoveTimelineStore`): the
 * volume knob scrubs, the wheel zooms, its press shows everything; Play, Loop
 * and Rec are the transport's; the panel's volume corner turns into its clock.
 * On the card: click the ruler to jump, drag it to draw a loop, drag the
 * lanes to scrub; drag a clip to move it, its edges to retime it, the joins
 * of a sequence to retime its legs. Pinch (or Ctrl + wheel) zooms around the
 * pointer, a sideways scroll pans.
 *
 * A layer (a group of clips in the config) is one row, split only where its
 * clips overlap.
 */
export function MoveTimeline({
  id,
  onRecord,
  variant = 'dock',
  accent,
  theme = 'system',
  productionEnabled = isDevDefault,
  className,
}: MoveTimelineProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Claim the instrument for as long as the card is up. The record handler is
  // read through a ref: a host's inline function must not re-claim per render.
  const recordRef = useRef(onRecord);
  recordRef.current = onRecord;
  const records = !!onRecord;
  useEffect(() => {
    if (!productionEnabled) return;
    return MoveTimelineStore.register(id, records ? { onRecord: (on) => recordRef.current?.(on) } : {});
  }, [productionEnabled, id, records]);

  const meta = useSyncExternalStore(
    useCallback((cb) => TimelineStore.subscribeGlobal(cb), []),
    () => TimelineStore.getTimeline(id),
    () => TimelineStore.getTimeline(id)
  );
  const values = useSyncExternalStore(
    useCallback((cb) => TweakStore.subscribe(id, cb), [id]),
    () => TweakStore.getValues(id),
    () => TweakStore.getValues(id)
  );
  useSyncExternalStore(
    useCallback((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.getVersion(),
    () => 0
  );
  const subscribeTransport = useCallback((cb: () => void) => TimelineStore.subscribe(id, cb), [id]);
  const region = useSyncExternalStore(subscribeTransport, () => TimelineStore.getLoopRegion(id), () => undefined);
  const looping = useSyncExternalStore(subscribeTransport, () => TimelineStore.isLooping(id), () => true);
  const inFront = MoveTimelineStore.activeId() === id;
  const recording = inFront && MoveTimelineStore.isRecording();

  const duration = meta?.duration ?? 0;
  const view = inFront ? MoveTimelineStore.getWindow() : timelineWindow(duration, 1, 0);

  // The ruler's width is the lanes' width: seconds to pixels.
  const rulerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler) return;
    const measure = () => setWidth(Math.round(ruler.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ruler);
    return () => ro.disconnect();
  }, [mounted, meta !== undefined]);
  const pxPerSecond = view.span > 0 && width > 0 ? width / view.span : 0;
  const x = (t: number) => (t - view.start) * pxPerSecond;
  const timeAt = (clientX: number) => {
    const rect = rulerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    return Math.min(duration, Math.max(0, view.start + ((clientX - rect.left) / rect.width) * view.span));
  };

  // The rows: a clip of its own is a row; a layer is one, split where it overlaps.
  // While a hand is on a clip the rows hold still, whatever the clip crosses.
  const heldRows = useRef<Row[] | null>(null);
  const [holding, setHolding] = useState(false);
  const liveRows = useMemo(() => buildRows(meta?.clips ?? [], values, duration), [meta, values, duration]);
  const rows = holding && heldRows.current ? refreshRows(heldRows.current, values, duration) : liveRows;

  // The playhead and the take in progress move every frame: written straight
  // to their elements, so a playing timeline re-renders nothing.
  const playheadRef = useRef<HTMLDivElement>(null);
  const takeRef = useRef<HTMLDivElement>(null);
  const frame = useRef({ start: view.start, pxPerSecond, width });
  frame.current = { start: view.start, pxPerSecond, width };
  useEffect(() => {
    const paint = () => {
      const { start, pxPerSecond: pps, width: w } = frame.current;
      const { time } = TimelineStore.getTransport(id);
      const at = (time - start) * pps;
      const head = playheadRef.current;
      if (head) {
        head.style.transform = `translateX(${at}px)`;
        head.style.visibility = pps > 0 && at >= -1 && at <= w + 1 ? 'visible' : 'hidden';
      }
      const take = takeRef.current;
      if (take) {
        const from = Math.max(0, (MoveTimelineStore.recordingFrom() - start) * pps);
        take.style.left = `${from}px`;
        take.style.width = `${Math.max(0, Math.min(w, at) - from)}px`;
      }
    };
    paint();
    return TimelineStore.subscribe(id, paint);
  }, [id, view.start, pxPerSecond, width, recording]);

  // ── the ruler: a click jumps, a drag draws the loop ──
  const [loopDraft, setLoopDraft] = useState<TimelineLoopRegion | null>(null);
  const rulerDrag = useRef<{ x: number; from: number; moved: boolean } | null>(null);
  const onRulerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    rulerDrag.current = { x: e.clientX, from: timeAt(e.clientX), moved: false };
  };
  const onRulerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = rulerDrag.current;
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) <= DRAG_PX) return;
    drag.moved = true;
    const to = timeAt(e.clientX);
    setLoopDraft({ start: Math.min(drag.from, to), end: Math.max(drag.from, to) });
  };
  const onRulerUp = () => {
    const drag = rulerDrag.current;
    rulerDrag.current = null;
    if (!drag) return;
    if (drag.moved && loopDraft) {
      // Drawing a loop means wanting it heard: looping comes on with it.
      TimelineStore.setLoopRegion(id, loopDraft.start, loopDraft.end);
      TimelineStore.setLooping(id, true);
    } else if (!drag.moved) {
      TimelineStore.seek(id, drag.from);
    }
    setLoopDraft(null);
  };
  const onRulerCancel = () => {
    rulerDrag.current = null;
    setLoopDraft(null);
  };

  // ── the lanes: a drag scrubs, pausing the tape while the hand is on it ──
  const scrub = useRef<{ wasPlaying: boolean } | null>(null);
  const onLanesDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.tweakers-move-timeline-clip')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    scrub.current = { wasPlaying: TimelineStore.getTransport(id).playing };
    TimelineStore.pause(id);
    TimelineStore.seek(id, timeAt(e.clientX));
  };
  const onLanesMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scrub.current) TimelineStore.seek(id, timeAt(e.clientX));
  };
  const onLanesUp = () => {
    if (scrub.current?.wasPlaying) TimelineStore.play(id);
    scrub.current = null;
  };

  // ── the wheel: pinch zooms around the pointer, a sideways scroll pans ──
  const displayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (MoveTimelineStore.activeId() !== id) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        MoveTimelineStore.zoomTo(MoveTimelineStore.getZoom() * Math.exp(-e.deltaY * PINCH_GAIN), timeAtRef.current(e.clientX));
        return;
      }
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!sideways || MoveTimelineStore.getZoom() <= 1) return;
      e.preventDefault();
      const w = MoveTimelineStore.getWindow();
      const pps = frame.current.pxPerSecond;
      if (pps > 0) MoveTimelineStore.panTo(w.start + sideways / pps);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [id, mounted, meta !== undefined]);
  const timeAtRef = useRef(timeAt);
  timeAtRef.current = timeAt;

  // A docked card rides above whatever height the panel happens to be.
  const [dockBottom, setDockBottom] = useState(DOCK_GAP);
  useEffect(() => {
    if (variant !== 'dock' || typeof window === 'undefined') return;
    const panel = () => document.querySelector('.tweakers-move-root .tweakers-move');
    const measure = () => {
      const h = panel()?.getBoundingClientRect().height ?? 0;
      setDockBottom(h > 0 ? h + DOCK_GAP : DOCK_GAP);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const el = panel();
    if (el) ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [variant, mounted]);

  if (!productionEnabled || !meta) return null;

  const ticks = timelineTicks(view.start, view.span, width);
  const shownLoop = loopDraft ?? region ?? null;

  const card = (
    <div
      className={`tweakers-move-surface tweakers-move-timeline${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-recording={recording || undefined}
      style={{
        ...(accent ? { '--move-timeline-accent': accent } : {}),
        ...(variant === 'dock' ? { bottom: `${dockBottom}px` } : {}),
      } as CSSProperties}
    >
      <div ref={displayRef} className="tweakers-move-timeline-display">
        <div className="tweakers-move-timeline-corner">
          <span className="tweakers-move-timeline-title">{meta.name}</span>
        </div>
        <div
          ref={rulerRef}
          className="tweakers-move-timeline-ruler"
          onPointerDown={onRulerDown}
          onPointerMove={onRulerMove}
          onPointerUp={onRulerUp}
          onPointerCancel={onRulerCancel}
          onDoubleClick={() => TimelineStore.clearLoopRegion(id)}
          title="Click to jump · drag to loop · double-click to let the loop go"
        >
          {shownLoop && pxPerSecond > 0 && (
            <div
              className="tweakers-move-timeline-loop"
              data-on={(looping || loopDraft) ? true : undefined}
              style={{ left: `${x(shownLoop.start)}px`, width: `${Math.max(1, (shownLoop.end - shownLoop.start) * pxPerSecond)}px` }}
            />
          )}
          {recording && <div ref={takeRef} className="tweakers-move-timeline-take" />}
          {ticks.minor.map((t) => (
            <span key={`m${t}`} className="tweakers-move-timeline-tick" style={{ left: `${x(t)}px` }} />
          ))}
          {ticks.major.map((t) => (
            <span key={`M${t}`} className="tweakers-move-timeline-tick" data-major style={{ left: `${x(t)}px` }}>
              {/* A number with no room left before the edge is a number cut in half. */}
              {x(t) < width - LABEL_EDGE_PX && <span className="tweakers-move-timeline-tick-label">{formatTimelineTick(t, ticks.step)}</span>}
            </span>
          ))}
        </div>
        <div className="tweakers-move-timeline-names">
          {rows.map((row) => (
            <div key={row.key} className="tweakers-move-timeline-name" title={row.label}>{row.label}</div>
          ))}
        </div>
        <div
          className="tweakers-move-timeline-lanes"
          onPointerDown={onLanesDown}
          onPointerMove={onLanesMove}
          onPointerUp={onLanesUp}
          onPointerCancel={onLanesUp}
        >
          {shownLoop && looping && pxPerSecond > 0 && (
            <div
              className="tweakers-move-timeline-loop-lanes"
              style={{ left: `${x(shownLoop.start)}px`, width: `${Math.max(1, (shownLoop.end - shownLoop.start) * pxPerSecond)}px` }}
            />
          )}
          {rows.map((row) => (
            <div key={row.key} className="tweakers-move-timeline-lane">
              {row.clips.map(({ meta: clip, stat }) => (
                <TimelineClipBar
                  key={clip.key}
                  timelineId={id}
                  clip={clip}
                  stat={stat}
                  duration={duration}
                  viewStart={view.start}
                  viewEnd={view.start + view.span}
                  pxPerSecond={pxPerSecond}
                  onHold={(on) => {
                    heldRows.current = on ? liveRows : null;
                    setHolding(on);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="tweakers-move-timeline-heads" aria-hidden="true">
          <div ref={playheadRef} className="tweakers-move-timeline-playhead" />
        </div>
      </div>
    </div>
  );

  if (variant !== 'dock') return card;
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div className="tweakers-root tweakers-move-root" data-theme={theme} data-timeline-dock="true">
      {card}
    </div>,
    document.body
  );
}

function buildRows(clips: TimelineClipMeta[], values: Record<string, unknown>, duration: number): Row[] {
  const rows: Row[] = [];
  const layers = new Map<string, TimelineClipMeta[]>();
  for (const clip of clips) {
    if (!clip.group) {
      rows.push({ key: clip.key, label: clip.label, clips: [{ meta: clip, stat: computeClipStaticFromValues(values as never, clip, duration) }] });
      continue;
    }
    let layer = layers.get(clip.group);
    if (!layer) {
      layer = [];
      layers.set(clip.group, layer);
      // The layer takes its place where its first clip stood in the config.
      rows.push({ key: `layer:${clip.group}`, label: formatLabel(clip.group), clips: [] });
    }
    layer.push(clip);
  }
  return rows.flatMap((row) => {
    if (!row.key.startsWith('layer:')) return [row];
    const group = row.key.slice('layer:'.length);
    const members = (layers.get(group) ?? []).map((clip) => ({ meta: clip, stat: computeClipStaticFromValues(values as never, clip, duration) }));
    const packed = packTimelineRows(members.map(({ stat }) => ({ at: stat.at, end: stat.loop === 'repeat' ? duration : stat.at + stat.duration })));
    const count = members.length ? Math.max(...packed) + 1 : 1;
    return Array.from({ length: count }, (_, i) => ({
      key: `${row.key}:${i}`,
      label: i === 0 ? row.label : '',
      clips: members.filter((_, m) => packed[m] === i),
    }));
  });
}

/** The held layout with fresh values: the same rows, the clips where they are now. */
function refreshRows(rows: Row[], values: Record<string, unknown>, duration: number): Row[] {
  return rows.map((row) => ({
    ...row,
    clips: row.clips.map(({ meta }) => ({ meta, stat: computeClipStaticFromValues(values as never, meta, duration) })),
  }));
}

type ClipDrag = {
  mode: 'move' | 'start' | 'end' | 'join';
  join?: number;
  x: number;
  at: number;
  duration: number;
  legs?: number[];
  moved: boolean;
};

/**
 * One clip: a bar of ink on the display. Its body moves it, its edges retime
 * it, the joins in a sequence retime the legs either side. A spring's length
 * is its physics', so a spring keeps its edges. A looping clip repeats in
 * ghost bars to the end of the timeline.
 */
function TimelineClipBar({
  timelineId,
  clip,
  stat,
  duration,
  viewStart,
  viewEnd,
  pxPerSecond,
  onHold,
}: {
  timelineId: string;
  clip: TimelineClipMeta;
  stat: TimelineClipStatic;
  duration: number;
  viewStart: number;
  viewEnd: number;
  pxPerSecond: number;
  onHold: (holding: boolean) => void;
}) {
  const drag = useRef<ClipDrag | null>(null);
  const [dragging, setDragging] = useState(false);
  const legs = stat.explicitSteps ? stat.tracks[0]?.steps ?? [] : [];
  const composite = !!clip.tracks?.length;
  const fixed = composite || (legs.length ? false : stat.isPhysics);
  const resizable = !fixed && stat.duration > 0;

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const target = e.target as HTMLElement;
    const join = target.dataset.join;
    const edge = target.dataset.edge as 'start' | 'end' | undefined;
    drag.current = {
      mode: join !== undefined ? 'join' : edge && resizable ? edge : 'move',
      join: join !== undefined ? Number(join) : undefined,
      x: e.clientX,
      at: stat.at,
      duration: stat.duration,
      legs: legs.map((leg) => leg.duration),
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    onHold(true);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || pxPerSecond <= 0) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) <= DRAG_PX) return;
      d.moved = true;
      setDragging(true);
    }
    const dt = dx / pxPerSecond;
    if (d.mode === 'join' && d.legs && d.join !== undefined) {
      // Retiming a leg ripples the legs after it — the bar grows or shrinks.
      const others = d.legs.reduce((sum, leg, i) => (i === d.join ? sum : sum + leg), 0);
      TweakStore.updateValue(timelineId, `${clip.key}.${legs[d.join].key ?? ''}.duration`, clampStepResize(d.legs[d.join] + dt, d.at, others, duration));
    } else if (d.mode === 'move') {
      TweakStore.updateValue(timelineId, `${clip.key}.at`, clampClipMove(d.at + dt, d.duration, duration));
    } else if (d.mode === 'end') {
      TweakStore.updateValue(timelineId, `${clip.key}.duration`, clampClipResizeEnd(d.duration + dt, d.at, duration));
    } else if (d.legs?.length) {
      // The start of a sequence trades time between its place and its first leg.
      const next = clampClipResizeStart(Math.max(0, d.at + dt), d.at, d.legs[0]);
      TweakStore.updateValues(timelineId, { [`${clip.key}.at`]: next.at, [`${clip.key}.${legs[0].key ?? ''}.duration`]: next.duration });
    } else {
      const next = clampClipResizeStart(Math.max(0, d.at + dt), d.at, d.duration);
      TweakStore.updateValues(timelineId, { [`${clip.key}.at`]: next.at, [`${clip.key}.duration`]: next.duration });
    }
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    onHold(false);
    // A still press is a jump to where the clip starts.
    if (d && !d.moved) TimelineStore.seek(timelineId, d.at);
  };

  const onCancel = () => {
    drag.current = null;
    setDragging(false);
    onHold(false);
  };

  if (pxPerSecond <= 0) return null;
  const left = (stat.at - viewStart) * pxPerSecond;
  const width = Math.max(MIN_CLIP_PX, stat.duration * pxPerSecond);
  const repeats = stat.loop === 'repeat' && stat.duration > 0;
  const ghosts: number[] = [];
  if (repeats) {
    const first = Math.max(1, Math.floor((viewStart - stat.at) / stat.duration));
    for (let i = first; i < first + 512; i++) {
      const start = stat.at + stat.duration * i;
      if (start >= Math.min(duration, viewEnd) - 1e-6) break;
      ghosts.push(start);
    }
  }
  const joins: number[] = [];
  let run = 0;
  for (const leg of legs) {
    run += leg.duration;
    joins.push(run);
  }
  const length = `${fixed && !composite ? '~' : ''}${formatSeconds(stat.duration)}`;

  return (
    <>
      {ghosts.map((start) => (
        <div
          key={start}
          className="tweakers-move-timeline-ghost"
          aria-hidden="true"
          style={{ left: `${(start - viewStart) * pxPerSecond}px`, width: `${Math.max(1, Math.min(stat.duration, duration - start) * pxPerSecond - 2)}px` }}
        />
      ))}
      <div
        className="tweakers-move-timeline-clip"
        data-composite={composite || undefined}
        data-dragging={dragging || undefined}
        data-marker={!stat.tracks.length || undefined}
        style={{ left: `${left}px`, width: `${width}px` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        title={`${clip.label} — ${formatSeconds(stat.at)} for ${length}${repeats ? ', repeating' : ''}`}
      >
        {legs.length > 1 && joins.slice(0, -1).map((at, i) => (
          <span key={`j${i}`} className="tweakers-move-timeline-join" data-join={i} style={{ left: `${at * pxPerSecond}px` }} />
        ))}
        {width > LABEL_CLIP_PX && <span className="tweakers-move-timeline-clip-length">{length}</span>}
        {resizable && !legs.length && <span className="tweakers-move-timeline-edge" data-edge="start" />}
        {resizable && !legs.length && <span className="tweakers-move-timeline-edge" data-edge="end" />}
        {legs.length > 0 && !legs[legs.length - 1].isPhysics && (
          <span className="tweakers-move-timeline-edge" data-edge="end" data-join={legs.length - 1} />
        )}
      </div>
    </>
  );
}

/**
 * The timeline's zoom, in the panel's track corner while a timeline holds the
 * wheel — the waveform editor's readout, saying what the wheel is doing.
 */
export function MoveTimelineZoom() {
  useSyncExternalStore(
    useCallback((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.getVersion(),
    () => 0
  );
  return (
    <div className="tweakers-move-wave-zoom">
      <span className="tweakers-move-wave-zoom-dot" />
      <span className="tweakers-move-wave-zoom-label">
        Zoom {parseFloat(MoveTimelineStore.getZoom().toFixed(1))}x
      </span>
    </div>
  );
}

/**
 * The timeline's clock, in the panel's volume corner while a timeline holds
 * the knob: the playhead's time with the transport around it — Play at its
 * left, Loop and (when the app records) Rec at its right. Each is lit while
 * on and runs exactly what its hardware key runs, so a click and a press are
 * one gesture. The time is written to its span every frame at a fixed
 * width, so the pill never breathes.
 */
export function MoveTimelineClock() {
  useSyncExternalStore(
    useCallback((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.getVersion(),
    () => 0
  );
  const id = MoveTimelineStore.activeId() ?? '';
  const subscribe = useCallback((cb: () => void) => TimelineStore.subscribe(id, cb), [id]);
  const playing = useSyncExternalStore(subscribe, () => TimelineStore.getTransport(id).playing, () => false);
  const looping = useSyncExternalStore(subscribe, () => TimelineStore.isLooping(id), () => true);
  const recording = MoveTimelineStore.isRecording();
  const canRecord = MoveTimelineStore.canRecord();

  const clockRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = requestAnimationFrame(function tick() {
      const text = MoveTimelineStore.clock();
      if (clockRef.current && clockRef.current.textContent !== text) clockRef.current.textContent = text;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="tweakers-move-volume tweakers-move-timeline-clock" data-record={canRecord || undefined}>
      <button
        type="button"
        className="tweakers-move-timeline-key"
        data-on={playing || undefined}
        aria-label={playing ? 'Pause' : 'Play'}
        aria-pressed={playing}
        onClick={(e) => MoveFunctions.run('play', { shift: e.shiftKey })}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={ICON_PLAY} fill="currentColor" />
        </svg>
      </button>
      <span ref={clockRef} className="tweakers-move-volume-value">{MoveTimelineStore.clock()}</span>
      <button
        type="button"
        className="tweakers-move-timeline-key"
        data-on={looping || undefined}
        aria-label="Loop"
        aria-pressed={looping}
        title="Loop · Shift-click lets the loop region go"
        onClick={(e) => MoveFunctions.run('loop', { shift: e.shiftKey })}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {ICON_LOOP.map((d) => (
            <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
      </button>
      {canRecord && (
        <button
          type="button"
          className="tweakers-move-timeline-key"
          data-name="rec"
          data-on={recording || undefined}
          aria-label="Record"
          aria-pressed={recording}
          onClick={(e) => MoveFunctions.run('rec', { shift: e.shiftKey })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
