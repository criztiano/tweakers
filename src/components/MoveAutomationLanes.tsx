import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { splitAtWrap, type AutomationLane } from '../automation-core';
import type { AutomationLanesStore } from '../automation-store';
import { formatTimelineTick, timelineRowHeight, timelineTicks } from '../move-timeline';
import { isDevDefault } from '../env';
import type { TweakTheme } from '../theme';

/** How far a docked card floats above the panel — the waveform's gap. */
const DOCK_GAP = 14;
/** Pointer travel that turns a press into a drag. */
const DRAG_PX = 4;
/** The room a ruler number needs before the card's edge. */
const LABEL_EDGE_PX = 28;
/** The pinch's gain: wheel pixels to zoom, exponential so in and out match. */
const PINCH_GAIN = 0.01;

export interface MoveAutomationLanesProps {
  /** The lanes to show and edit — the host's `AutomationLanesStore`. */
  store: AutomationLanesStore;
  /**
   * `dock` floats above the Move panel, as wide as the window allows up to
   * 960px — the timeline's place. `page` is a card wherever the app puts it.
   */
  variant?: 'dock' | 'page';
  /** A click on the ruler: the host moves its clock to `time` seconds. */
  onSeek?: (time: number) => void;
  /** The playhead, the selection and a held lane's mark — the host's signature. */
  accent?: string;
  /** The card's name, in its corner. */
  title?: string;
  /** What the card says with no lane yet. */
  emptyLabel?: string;
  theme?: TweakTheme;
  productionEnabled?: boolean;
  className?: string;
}

type Drag =
  | { kind: 'point'; key: string; index: number; x: number; y: number; t: number; moved: boolean }
  | { kind: 'range'; key: string; x: number; from: number; moved: boolean }
  | { kind: 'seek' };

/**
 * Automation lanes, on the Move's surface — one row per recorded control, its
 * value over the pass drawn as a curve on the timeline's card.
 *
 * The card draws and edits; it records nothing and claims nothing. The host
 * clocks the store, the store's `claimRec` gives the Move's Rec key to takes,
 * and the card follows: the playhead and a take's band move with the host's
 * clock, and a lane a hand is holding wears a mark by its name.
 *
 * Click a lane to open it. On an open lane: drag a point (Shift keeps its
 * time), double-click to add one or to delete the one under the pointer, drag
 * across empty space to select a stretch; Smooth, Clear and Delete lane are
 * on the bar under the rows, and Delete / Backspace clears the stretch or
 * deletes the point. Click the ruler to jump. Pinch (or Ctrl + wheel) zooms
 * around the pointer, a sideways scroll pans.
 */
export function MoveAutomationLanes({
  store,
  variant = 'dock',
  onSeek,
  accent,
  title = 'Automation',
  emptyLabel,
  theme = 'system',
  productionEnabled = isDevDefault,
  className,
}: MoveAutomationLanesProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useSyncExternalStore(
    useCallback((cb: () => void) => store.subscribe(cb), [store]),
    () => store.getVersion(),
    () => 0
  );
  const lanes = store.timeline().lanes;
  const selection = store.getSelection();
  const recording = store.isRecording();
  const view = store.getWindow();

  // The pass's length only names the ruler; it is read off the host's clock.
  const [duration, setDuration] = useState(() => store.clock().duration);

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
  }, [mounted, productionEnabled]);

  /** Phase to a share of the lane's width. */
  const share = (t: number) => (view.span > 0 ? (t - view.start) / view.span : 0);
  const phaseAt = (clientX: number) => {
    const rect = rulerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    return Math.min(1, Math.max(0, view.start + ((clientX - rect.left) / rect.width) * view.span));
  };
  const phaseAtRef = useRef(phaseAt);
  phaseAtRef.current = phaseAt;

  // ── what moves every frame: written straight to the elements ──
  const playheadRef = useRef<HTMLDivElement>(null);
  const takeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef(new Map<string, { name: HTMLDivElement | null; lane: HTMLDivElement | null; live: SVGPathElement | null }>());
  const frame = useRef({ view, width, lanes });
  frame.current = { view, width, lanes };
  const durationRef = useRef(duration);
  useEffect(() => {
    if (!productionEnabled) return;
    let raf = requestAnimationFrame(function paint() {
      const { view: w, width: px, lanes: shown } = frame.current;
      const clock = store.clock();
      if (clock.duration !== durationRef.current) {
        durationRef.current = clock.duration;
        setDuration(clock.duration);
      }
      const phase = clock.duration > 0 ? Math.min(1, Math.max(0, clock.time / clock.duration)) : 0;
      const at = w.span > 0 ? ((phase - w.start) / w.span) * px : 0;
      const head = playheadRef.current;
      if (head) {
        head.style.transform = `translateX(${at}px)`;
        head.style.visibility = w.span > 0 && px > 0 && at >= -1 && at <= px + 1 ? 'visible' : 'hidden';
      }
      // The take's band: from where it started to the playhead, over the end of
      // the pass when it wrapped; all of it once the pass has come round.
      const take = store.take();
      const bands = take ? (take.laps > 0 ? [{ from: 0, to: 1 }] : splitAtWrap(take.from, phase)) : [];
      takeRefs.current.forEach((el, i) => {
        if (!el) return;
        const band = bands[i];
        if (!band || w.span <= 0) {
          el.style.display = 'none';
          return;
        }
        const left = Math.max(0, ((band.from - w.start) / w.span) * px);
        const right = Math.min(px, ((band.to - w.start) / w.span) * px);
        el.style.display = right > left ? 'block' : 'none';
        el.style.left = `${left}px`;
        el.style.width = `${Math.max(0, right - left)}px`;
      });
      for (const lane of shown) {
        const row = rowRefs.current.get(lane.key);
        if (!row) continue;
        const held = store.isHeld(lane.key);
        for (const el of [row.name, row.lane]) {
          if (el && (el.dataset.writing !== undefined) !== held) {
            if (held) el.dataset.writing = '';
            else delete el.dataset.writing;
          }
        }
        if (row.live) {
          const span = store.liveSpan(lane.key);
          const d = span && w.span > 0 ? curvePath(lane, span.samples, w.start, w.span) : '';
          if (row.live.getAttribute('d') !== d) row.live.setAttribute('d', d);
        }
      }
      raf = requestAnimationFrame(paint);
    });
    return () => cancelAnimationFrame(raf);
  }, [store, productionEnabled]);

  // ── pointer gestures ──
  const drag = useRef<Drag | null>(null);

  const valueAtY = (lane: AutomationLane, clientY: number, plot: Element) => {
    const rect = plot.getBoundingClientRect();
    const share = rect.height > 0 ? 1 - (clientY - rect.top) / rect.height : 0.5;
    return lane.min + Math.min(1, Math.max(0, share)) * (lane.max - lane.min);
  };

  const onRulerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !onSeek) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { kind: 'seek' };
    onSeek(phaseAt(e.clientX) * duration);
  };
  const onRulerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.kind === 'seek') onSeek?.(phaseAt(e.clientX) * duration);
  };

  const onPlotDown = (e: ReactPointerEvent<HTMLDivElement>, lane: AutomationLane) => {
    if (e.button !== 0) return;
    e.preventDefault();
    cardRef.current?.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture(e.pointerId);
    const handle = (e.target as HTMLElement).closest<HTMLElement>('[data-point]');
    if (handle && selection.key === lane.key) {
      const index = Number(handle.dataset.point);
      store.select({ key: lane.key, point: index });
      drag.current = { kind: 'point', key: lane.key, index, x: e.clientX, y: e.clientY, t: lane.points[index]?.t ?? 0, moved: false };
      return;
    }
    drag.current = { kind: 'range', key: lane.key, x: e.clientX, from: phaseAt(e.clientX), moved: false };
  };

  const onPlotMove = (e: ReactPointerEvent<HTMLDivElement>, lane: AutomationLane) => {
    const d = drag.current;
    if (!d || d.kind === 'seek') return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, d.kind === 'point' ? e.clientY - d.y : 0) <= DRAG_PX) return;
      d.moved = true;
    }
    if (d.kind === 'point') {
      // Shift moves the value only — the point keeps its moment.
      store.movePoint(d.key, d.index, e.shiftKey ? d.t : phaseAt(e.clientX), valueAtY(lane, e.clientY, e.currentTarget), { drag: true });
    } else {
      store.select({ key: d.key, range: { from: d.from, to: phaseAt(e.clientX) } });
    }
  };

  const onPlotUp = () => {
    const d = drag.current;
    drag.current = null;
    // A still press on a lane opens it, and lets go of a point or a stretch.
    if (d?.kind === 'range' && !d.moved) store.select({ key: d.key });
  };

  const onPlotDoubleClick = (e: React.MouseEvent<HTMLDivElement>, lane: AutomationLane) => {
    if (selection.key !== lane.key) return;
    const handle = (e.target as HTMLElement).closest<HTMLElement>('[data-point]');
    if (handle) store.deletePoint(lane.key, Number(handle.dataset.point));
    else store.addPoint(lane.key, phaseAt(e.clientX), valueAtY(lane, e.clientY, e.currentTarget));
  };

  // ── keys, on the card only ──
  const cardRef = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const key = selection.key;
    if (e.key === 'Escape' && key) {
      e.stopPropagation();
      store.select(selection.point !== null || selection.range ? { key } : {});
      return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && key) {
      e.preventDefault();
      e.stopPropagation();
      if (selection.range) store.clearRange(key, selection.range.from, selection.range.to);
      else if (selection.point !== null) store.deletePoint(key, selection.point);
    }
  };

  // ── the wheel: pinch zooms around the pointer, a sideways scroll pans ──
  const displayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        store.zoomTo(store.getView().zoom * Math.exp(-e.deltaY * PINCH_GAIN), phaseAtRef.current(e.clientX));
        return;
      }
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!sideways || store.getView().zoom <= 1) return;
      e.preventDefault();
      const w = store.getWindow();
      const px = frame.current.width;
      if (px > 0) store.panTo(w.start + (sideways / px) * w.span);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [store, mounted, productionEnabled]);

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

  if (!productionEnabled) return null;

  const ticks = timelineTicks(view.start * duration, view.span * duration, width);
  const tickX = (seconds: number) => (duration > 0 ? share(seconds / duration) * width : 0);
  const rowHeight = timelineRowHeight(Math.max(1, lanes.length));
  const selected = selection.key ? lanes.find((l) => l.key === selection.key) : undefined;
  const editable = !!selected && !recording;

  const card = (
    <div
      ref={cardRef}
      className={`tweakers-move-surface tweakers-move-timeline tweakers-move-automation${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-recording={recording || undefined}
      data-rows={rowHeight}
      tabIndex={0}
      aria-label={title}
      onKeyDown={onKeyDown}
      style={{
        ...(accent ? { '--move-timeline-accent': accent } : {}),
        ...(variant === 'dock' ? { bottom: `${dockBottom}px` } : {}),
      } as CSSProperties}
    >
      <div ref={displayRef} className="tweakers-move-timeline-display">
        <div className="tweakers-move-timeline-corner">
          <span className="tweakers-move-timeline-title">{title}</span>
        </div>
        <div
          ref={rulerRef}
          className="tweakers-move-timeline-ruler"
          data-seek={onSeek ? true : undefined}
          onPointerDown={onRulerDown}
          onPointerMove={onRulerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          title={onSeek ? 'Click to jump' : undefined}
        >
          {[0, 1].map((i) => (
            <div key={i} ref={(el) => { takeRefs.current[i] = el; }} className="tweakers-move-timeline-take" style={{ display: 'none' }} />
          ))}
          {ticks.minor.map((t) => (
            <span key={`m${t}`} className="tweakers-move-timeline-tick" style={{ left: `${tickX(t)}px` }} />
          ))}
          {ticks.major.map((t) => (
            <span key={`M${t}`} className="tweakers-move-timeline-tick" data-major style={{ left: `${tickX(t)}px` }}>
              {tickX(t) < width - LABEL_EDGE_PX && <span className="tweakers-move-timeline-tick-label">{formatTimelineTick(t, ticks.step)}</span>}
            </span>
          ))}
        </div>
        <div className="tweakers-move-timeline-names">
          {lanes.map((lane) => (
            <div
              key={lane.key}
              ref={(el) => { row(rowRefs.current, lane.key).name = el; }}
              className="tweakers-move-timeline-name tweakers-move-automation-name"
              data-selected={lane.key === selection.key || undefined}
              title={lane.label}
              onPointerDown={() => store.select(lane.key === selection.key ? {} : { key: lane.key })}
            >
              {lane.label}
            </div>
          ))}
          {!lanes.length && <div className="tweakers-move-timeline-name" aria-hidden="true" />}
        </div>
        <div className="tweakers-move-timeline-lanes tweakers-move-automation-lanes">
          {lanes.map((lane) => {
            const open = lane.key === selection.key;
            const range = open && selection.range ? selection.range : null;
            return (
              <div
                key={lane.key}
                ref={(el) => { row(rowRefs.current, lane.key).lane = el; }}
                className="tweakers-move-timeline-lane tweakers-move-automation-lane"
                data-selected={open || undefined}
              >
                <div
                  className="tweakers-move-automation-plot"
                  onPointerDown={(e) => onPlotDown(e, lane)}
                  onPointerMove={(e) => onPlotMove(e, lane)}
                  onPointerUp={onPlotUp}
                  onPointerCancel={onPlotUp}
                  onDoubleClick={(e) => onPlotDoubleClick(e, lane)}
                >
                  {range && (
                    <div
                      className="tweakers-move-automation-range"
                      style={{ left: `${share(range.from) * 100}%`, width: `${(share(range.to) - share(range.from)) * 100}%` }}
                    />
                  )}
                  <svg className="tweakers-move-automation-curve" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
                    <path className="tweakers-move-automation-area" d={areaPath(lane, view.start, view.span)} />
                    <path className="tweakers-move-automation-line" d={curvePath(lane, lane.points, view.start, view.span)} />
                    <path ref={(el) => { row(rowRefs.current, lane.key).live = el; }} className="tweakers-move-automation-live" />
                  </svg>
                  {open && lane.points.map((p, i) => {
                    const x = share(p.t);
                    if (x < -0.02 || x > 1.02) return null;
                    return (
                      <span
                        key={i}
                        className="tweakers-move-automation-point"
                        data-point={i}
                        data-selected={selection.point === i || undefined}
                        style={{ left: `${x * 100}%`, top: `${(1 - norm(lane, p.v)) * 100}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!lanes.length && (
            <div className="tweakers-move-timeline-lane tweakers-move-automation-empty">
              {emptyLabel ?? (recording ? 'Turn a control to record' : 'Record a take to draw a lane')}
            </div>
          )}
        </div>
        <div className="tweakers-move-timeline-heads" aria-hidden="true">
          <div ref={playheadRef} className="tweakers-move-timeline-playhead" />
        </div>
        <div className="tweakers-move-automation-bar">
          <span className="tweakers-move-automation-readout">
            {selected ? readout(selected, selection, duration) : lanes.length ? 'Click a lane to edit it' : ''}
          </span>
          <button
            type="button"
            className="tweakers-move-automation-tool"
            disabled={!editable}
            title="Smooth the lane, or the selected stretch · Shift smooths harder"
            onClick={(e) => selected && store.smooth(selected.key, e.shiftKey)}
          >
            Smooth
          </button>
          <button
            type="button"
            className="tweakers-move-automation-tool"
            disabled={!editable || !selection.range}
            title="Clear the selected stretch to a straight run"
            onClick={() => selected && selection.range && store.clearRange(selected.key, selection.range.from, selection.range.to)}
          >
            Clear
          </button>
          <button
            type="button"
            className="tweakers-move-automation-tool"
            disabled={!editable}
            title="Delete the lane — the control is its own again"
            onClick={() => selected && store.deleteLane(selected.key)}
          >
            Delete lane
          </button>
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

function row(rows: Map<string, { name: HTMLDivElement | null; lane: HTMLDivElement | null; live: SVGPathElement | null }>, key: string) {
  let entry = rows.get(key);
  if (!entry) rows.set(key, (entry = { name: null, lane: null, live: null }));
  return entry;
}

/** A value as a share of its lane's range, 0 at the bottom. */
const norm = (lane: AutomationLane, v: number) => (lane.max > lane.min ? (v - lane.min) / (lane.max - lane.min) : 0.5);

const fmt = (n: number) => String(Number(n.toFixed(4)));

/**
 * The lane's curve in the plot's unit square (x across the window, y down
 * from the top of the range), held flat before its first point and after its
 * last. Drawn with a non-scaling stroke, so the line stays crisp at any zoom
 * and any row height.
 */
function curvePath(lane: AutomationLane, points: readonly { t: number; v: number }[], start: number, span: number): string {
  if (!points.length || !(span > 0)) return '';
  const x = (t: number) => fmt((t - start) / span);
  const y = (v: number) => fmt(1 - norm(lane, v));
  const first = points[0];
  const last = points[points.length - 1];
  // A live stretch is drawn where it is; a lane reaches across the whole pass.
  const reach = points === lane.points;
  let d = `M${x(reach ? Math.min(0, first.t) : first.t)} ${y(first.v)}`;
  let prevY = y(first.v);
  for (let i = reach ? 0 : 1; i < points.length; i++) {
    const p = points[i];
    if (lane.interp === 'hold') d += `H${x(p.t)}`;
    const py = y(p.v);
    d += lane.interp === 'hold' ? (py !== prevY ? `V${py}` : '') : `L${x(p.t)} ${py}`;
    prevY = py;
  }
  if (reach) d += `H${x(Math.max(1, last.t))}`;
  return d;
}

function areaPath(lane: AutomationLane, start: number, span: number): string {
  const line = curvePath(lane, lane.points, start, span);
  if (!line) return '';
  // The line ends on the pass's right edge; down to the floor, back, and close.
  const x0 = fmt((Math.min(0, lane.points[0].t) - start) / span);
  return `${line}V1H${x0}Z`;
}

/** The bar's reading for what is selected: a point's moment and value, or a stretch's span. */
function readout(lane: AutomationLane, selection: { point: number | null; range: { from: number; to: number } | null }, duration: number): string {
  const time = (t: number) => `${(t * duration).toFixed(2)}s`;
  const value = (v: number) => {
    const step = (lane.max - lane.min) / 1000;
    const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
    return v.toFixed(decimals);
  };
  if (selection.range) return `${lane.label} · ${time(selection.range.from)} – ${time(selection.range.to)}`;
  const point = selection.point !== null ? lane.points[selection.point] : undefined;
  if (point) return `${lane.label} · ${time(point.t)} · ${value(point.v)}`;
  return `${lane.label} · ${lane.points.length} point${lane.points.length === 1 ? '' : 's'}`;
}
