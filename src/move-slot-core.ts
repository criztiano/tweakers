import type { ControlMeta } from './store/TweakStore';
import {
  normalizeDial, denormalizeDial, normalizeRangeDial, denormalizeRangeDial,
  normalizeFilterDial, denormalizeFilterDial, dialOrigin, isEnumDial, enumIndex, enumOptionLabel,
} from './move-layout';
import { fineDragValue } from './shortcut-utils';
import { resolveAxis, valueFromPoint, pointFromValue, normalizeValue, centerValue, applyDetentAxis, type XYValue } from './xy-pad-core';
import { nearestHandle, type RangeValue } from './range-slider-core';
import { angleFromPointer } from './angle-core';
import { normalizeTransfer, movePoint, nearestPoint } from './transfer-core';
import { normalizeGradient, type GradientValue } from './gradient-core';
import { moveKeyboardValue } from './move-visual-core';

/**
 * A big slot's hand: how a pointer on a slot's face turns the value under
 * it, and what the slot reads out. The instrument (`MovePanel`) and a slot
 * placed on its own (`MoveSlot`) both drive their faces through here, so a
 * drag feels the same wherever the face is drawn.
 *
 * Every function answers the next value and writes nothing — the caller owns
 * the store, and the gesture state it keeps between events (the fine anchor,
 * the handle a range drag took) rides in a ref it passes in.
 */

/** The slider track's inset from the dial slot's edges (Figma 802:767). */
export const MOVE_DIAL_TRACK_INSET = 10;
/** The xy field's inset within its slot — must match .tweakers-move-xy. */
export const MOVE_XY_INSET = { left: 8, top: 8, right: 9, bottom: 8 };
/** Default grid when an xy control leaves `grid` on — the XYPad's 5×5. */
export const MOVE_XY_GRID_DEFAULT = 5;
/** A finger never holds perfectly still: this much slip, in px, stays a tap. */
export const MOVE_TAP_SLOP = 3;

/** The parts of a pointer event a slot reads. */
export type MoveSlotPointer = { clientX: number; clientY: number; shiftKey: boolean };
/** The box a slot reads the pointer against — a DOMRect will do. */
export type MoveSlotBox = { left: number; top: number; width: number; height: number };
/** Where a fine (shift) drag took hold: the pointer then, and the value then. */
export type MoveFineAnchor = { shift: boolean; x: number; y: number; v: unknown };
export type MoveGestureRef<T> = { current: T };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Rebase the fine anchor on every shift transition: a press mid-drag
 * snapshots the value and pointer there; a release snapshots again, so
 * tracking carries on at 1× from the release point instead of jumping to
 * the cursor. Null until shift has been touched — the drag is absolute.
 */
export function moveFineAnchor(fine: MoveGestureRef<MoveFineAnchor | null>, e: MoveSlotPointer, snapshot: () => unknown) {
  if (e.shiftKey ? !fine.current?.shift : fine.current?.shift) {
    fine.current = { shift: e.shiftKey, x: e.clientX, y: e.clientY, v: snapshot() };
  }
  return fine.current;
}

/**
 * The keyboard on a focused slot: arrows step, shift steps fine, Home and End
 * go to the ends. Null for any key that is not an edit — or any chord, which
 * belongs to the page.
 */
export function moveDialKey(
  meta: ControlMeta, value: unknown,
  e: { key: string; shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean },
) {
  if (e.altKey || e.ctrlKey || e.metaKey) return null;
  return moveKeyboardValue(meta, value, e.key, e.shiftKey);
}

/**
 * A range: the press takes the nearer handle and keeps it for the gesture;
 * the other handle pins its bound, so the pair stays in order — the
 * RangeSlider's own rule.
 */
export function moveRangeValue(
  meta: ControlMeta, value: unknown, e: MoveSlotPointer, box: MoveSlotBox,
  handle: MoveGestureRef<'min' | 'max'>, fine: MoveGestureRef<MoveFineAnchor | null>, down: boolean,
): RangeValue {
  const span = box.width - MOVE_DIAL_TRACK_INSET * 2;
  const cur = normalizeRangeDial(meta, value);
  let p01 = clamp01((e.clientX - box.left - MOVE_DIAL_TRACK_INSET) / (span || 1));
  if (down) handle.current = nearestHandle(p01, { min: cur.lo, max: cur.hi });
  const anchor = moveFineAnchor(fine, e, () => cur);
  if (anchor) {
    const a = anchor.v as { lo: number; hi: number };
    p01 = fineDragValue({
      startValue: handle.current === 'min' ? a.lo : a.hi,
      startPos: anchor.x, pos: e.clientX, extentPx: span || 1, min: 0, max: 1, factor: anchor.shift ? 0.1 : 1,
    });
  }
  const next = handle.current === 'min' ? { lo: Math.min(p01, cur.hi), hi: cur.hi } : { lo: cur.lo, hi: Math.max(p01, cur.lo) };
  return denormalizeRangeDial(meta, next.lo, next.hi);
}

/**
 * A filter is two dials wearing one picture: the half the press lands in
 * picks the hand — left cutoff, right resonance — and keeps it for the
 * gesture; the pointer's travel across that half turns it.
 */
export function moveFilterValue(
  meta: ControlMeta, value: unknown, e: MoveSlotPointer, box: MoveSlotBox,
  hand: MoveGestureRef<'cutoff' | 'resonance'>, fine: MoveGestureRef<MoveFineAnchor | null>, down: boolean,
) {
  const half = box.width / 2;
  if (down) hand.current = e.clientX - box.left < half ? 'cutoff' : 'resonance';
  const left = hand.current === 'cutoff' ? box.left + MOVE_DIAL_TRACK_INSET : box.left + half;
  const span = half - MOVE_DIAL_TRACK_INSET;
  const cur = normalizeFilterDial(meta, value);
  const anchor = moveFineAnchor(fine, e, () => cur);
  const v01 = anchor
    ? fineDragValue({
      startValue: hand.current === 'cutoff' ? (anchor.v as typeof cur).cutoff : (anchor.v as typeof cur).resonance,
      startPos: anchor.x, pos: e.clientX, extentPx: span || 1, min: 0, max: 1, factor: anchor.shift ? 0.1 : 1,
    })
    : clamp01((e.clientX - left) / (span || 1));
  return hand.current === 'cutoff'
    ? denormalizeFilterDial(meta, v01, cur.resonance)
    : denormalizeFilterDial(meta, cur.cutoff, v01);
}

/**
 * An xy pad maps the pointer through the same core as the library XYPad —
 * value mapping, snap-to-grid and the escapable centre detent included. Fine
 * mode only changes how the point is read off the pointer: shift creeps at
 * 0.1× on both axes.
 */
export function moveXYValue(
  meta: ControlMeta, value: unknown, e: MoveSlotPointer, box: MoveSlotBox,
  fine: MoveGestureRef<MoveFineAnchor | null>,
) {
  const w = box.width - MOVE_XY_INSET.left - MOVE_XY_INSET.right;
  const h = box.height - MOVE_XY_INSET.top - MOVE_XY_INSET.bottom;
  const xa = resolveAxis(meta.xAxis);
  const ya = resolveAxis(meta.yAxis);
  const anchor = moveFineAnchor(fine, e, () => pointFromValue(normalizeValue(value as Partial<XYValue>, xa, ya), xa, ya));
  let px: number, py: number;
  if (anchor) {
    const a = anchor.v as { x: number; y: number };
    const factor = anchor.shift ? 0.1 : 1;
    px = fineDragValue({ startValue: a.x, startPos: anchor.x, pos: e.clientX, extentPx: w || 1, min: 0, max: 1, factor });
    py = fineDragValue({ startValue: a.y, startPos: anchor.y, pos: e.clientY, extentPx: h || 1, min: 0, max: 1, factor });
  } else {
    px = clamp01((e.clientX - box.left - MOVE_XY_INSET.left) / (w || 1));
    py = clamp01((e.clientY - box.top - MOVE_XY_INSET.top) / (h || 1));
  }
  const raw = valueFromPoint({ x: px, y: py }, xa, ya, !!meta.snap);
  const origin = pointFromValue(centerValue(xa, ya), xa, ya);
  return {
    x: applyDetentAxis(raw.x, xa, Math.abs(px - origin.x) * (w || 1)),
    y: applyDetentAxis(raw.y, ya, Math.abs(py - origin.y) * (h || 1)),
  };
}

/** Where a joystick-style pad comes to rest when it is let go, or null for
 *  a pad that stays where it was put. */
export function moveXYRest(meta: ControlMeta) {
  if (!meta.returnToCenter) return null;
  const xa = resolveAxis(meta.xAxis);
  const ya = resolveAxis(meta.yAxis);
  return normalizeValue(centerValue(xa, ya), xa, ya, !!meta.snap);
}

/** A needle follows the pointer round its centre — dragging a bearing along
 *  a track is the gesture a needle exists to replace. Null off the face. */
export function moveNeedleValue(meta: ControlMeta, value: unknown, e: MoveSlotPointer, box: MoveSlotBox) {
  const min = meta.min ?? 0, max = meta.max ?? 1;
  const wraps = meta.wrap ?? Math.abs(max - min) >= 360;
  return angleFromPointer(
    e.clientX - (box.left + box.width / 2),
    e.clientY - (box.top + box.height / 2),
    Number(value ?? min), min, max, meta.step ?? 1, wraps,
  );
}

/**
 * A transfer curve: the press picks the nearest point (or keeps the one held
 * when none is near) and the drag moves it. Answers the curve and the point
 * now held.
 */
export function moveTransferValue(value: unknown, e: MoveSlotPointer, box: MoveSlotBox, held: number, down: boolean) {
  const w = box.width - MOVE_XY_INSET.left - MOVE_XY_INSET.right;
  const h = box.height - MOVE_XY_INSET.top - MOVE_XY_INSET.bottom;
  const x = clamp01((e.clientX - box.left - MOVE_XY_INSET.left) / (w || 1));
  const y = 1 - clamp01((e.clientY - box.top - MOVE_XY_INSET.top) / (h || 1));
  const points = normalizeTransfer(value).points;
  let index = held;
  if (down) {
    const hit = nearestPoint(points, x, y, 0.18);
    if (hit >= 0) index = hit;
  }
  index = Math.min(index, points.length - 1);
  return { held: index, value: { points: movePoint(points, index, x, y) } };
}

/** Where along a ramp the pointer is, 0..1. */
const rampPlace = (e: MoveSlotPointer, box: MoveSlotBox) =>
  clamp01((e.clientX - box.left - MOVE_XY_INSET.left) / ((box.width - MOVE_XY_INSET.left - MOVE_XY_INSET.right) || 1));

/** The ramp stop nearest the pointer — what a press on a ramp picks. */
export function moveRampStop(value: unknown, e: MoveSlotPointer, box: MoveSlotBox) {
  const x = rampPlace(e, box);
  const { stops } = normalizeGradient(value as never);
  let best = 0;
  stops.forEach((st, i) => {
    if (Math.abs(st.position - x) < Math.abs(stops[best]!.position - x)) best = i;
  });
  return best;
}

/** A ramp stop slid to the pointer. Stops keep their order: one dragged past
 *  its neighbour would reorder the ramp under the hand holding it. */
export function moveRampValue(value: unknown, e: MoveSlotPointer, box: MoveSlotBox, index: number): GradientValue {
  const x = rampPlace(e, box);
  const g = normalizeGradient(value as never);
  const lo = index > 0 ? g.stops[index - 1]!.position : 0;
  const hi = index < g.stops.length - 1 ? g.stops[index + 1]!.position : 1;
  return { ...g, stops: g.stops.map((st, i) => (i === index ? { ...st, position: Math.min(hi, Math.max(lo, x)) } : st)) };
}

/** The part a dial is drawn as on a multi-slot instrument's face. */
export type MoveFaceRole = 'threshold' | 'lookahead' | 'release' | 'amount' | 'speed' | 'band' | 'channel';

/* ── the turn: a slot answers the cursor as its knob answers the hand ── */

/** The pointer travel that steps an option slot to its neighbour. */
export const MOVE_OPTION_DETENT = 24;
/** The pointer travel that walks a list one row — a row's own height. */
export const MOVE_LIST_ROW_TRAVEL = 16;

/**
 * A press on a slot: where it went down, whether it has travelled past a
 * tap's slip yet, and the anchor its travel is read from — the value and the
 * pointer where it started, rebased whenever Shift goes down or up.
 */
export type MovePress = { path: string; x: number; y: number; moved: boolean; shift: boolean; ax: number; ay: number; v: number };

export const movePressStart = (path: string, e: MoveSlotPointer, v: number): MovePress =>
  ({ path, x: e.clientX, y: e.clientY, moved: false, shift: e.shiftKey, ax: e.clientX, ay: e.clientY, v });

/** The press on `path`, once it has really travelled — null while it is still a tap. */
export function movePressTravel(press: MoveGestureRef<MovePress | null>, path: string, e: MoveSlotPointer, snapshot: () => number) {
  const p = press.current;
  if (!p || p.path !== path) return null;
  if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < MOVE_TAP_SLOP) return null;
  p.moved = true;
  if (p.shift !== e.shiftKey) Object.assign(p, { shift: e.shiftKey, ax: e.clientX, ay: e.clientY, v: snapshot() });
  return p;
}

/** Ends the press on `path`; true when it never travelled — a tap. */
export function movePressEnd(press: MoveGestureRef<MovePress | null>, path: string) {
  const p = press.current;
  press.current = null;
  return !!p && p.path === path && !p.moved;
}

/**
 * A one-value slot turns from where it is: right or up raises it, left or
 * down lowers it, and `extent` px of travel is the whole range — Shift
 * creeps at 0.1×. A press alone never moves it.
 */
export function moveTurnValue(meta: ControlMeta, p: MovePress, e: MoveSlotPointer, extent: number) {
  const travel = (e.clientX - p.ax) - (e.clientY - p.ay);
  return denormalizeDial(meta, clamp01(p.v + (travel / (extent || 1)) * (p.shift ? 0.1 : 1)));
}

/** How far a slot's travel runs for its whole range: its track's width. */
export const moveTurnExtent = (box: MoveSlotBox) => Math.max(1, box.width - MOVE_DIAL_TRACK_INSET * 2);

const optionValue = (meta: ControlMeta, i: number) => {
  const option = (meta.options ?? [])[i];
  return option === undefined ? undefined : typeof option === 'string' ? option : option.value;
};

/**
 * An option slot steps with the drag — right or down is the next option, a
 * list reading downward — one option per detent of travel. Undefined while
 * the drag has not reached a different option.
 */
export function moveOptionStep(meta: ControlMeta, value: unknown, p: MovePress, e: MoveSlotPointer) {
  const last = (meta.options ?? []).length - 1;
  const steps = Math.trunc(((e.clientX - p.ax) + (e.clientY - p.ay)) / MOVE_OPTION_DETENT);
  const next = Math.max(0, Math.min(last, p.v + steps));
  return next === enumIndex(meta, value) ? undefined : optionValue(meta, next);
}

/** A click on an option slot moves it on — round to the first after the last. */
export function moveNextOption(meta: ControlMeta, value: unknown) {
  const count = (meta.options ?? []).length;
  return count ? optionValue(meta, (enumIndex(meta, value) + 1) % count) : undefined;
}

/* ── what a slot reads out ─────────────────────────────────────── */

/** The dial's position, 0–100 — the same normalized number the Move works in. */
export const moveDialPercent = (meta: ControlMeta, value: unknown) => Math.round(normalizeDial(meta, value) * 100);

const plainNumber = (n: number) => (Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString());

/**
 * A dial reads out in its own domain when it has one — a formatter or a unit
 * ("2.84 s", "48 px") — and as the Move's 0–100 position otherwise. A bipolar
 * dial keeps its signed number either way.
 */
export function moveDialReading(meta: ControlMeta, value: unknown): string {
  const n = Number(value);
  const bipolar = dialOrigin(meta) > 0;
  if (!bipolar && !meta.formatValue && !meta.unit) return `${moveDialPercent(meta, value)}%`;
  if (!Number.isFinite(n)) return '';
  if (meta.formatValue) return meta.formatValue(n);
  const num = plainNumber(n);
  if (!bipolar) return `${num}${meta.unit ?? ''}`;
  return n > 0 ? `+${num}` : num;
}

/** A range reads out `lo–hi`, each bound formatted like a value chip. */
export function moveRangeReading(meta: ControlMeta, value: unknown): string {
  const v = (value ?? {}) as Partial<RangeValue>;
  const fmt = (n: number | undefined) => (n == null || !Number.isFinite(n) ? '' : meta.formatValue ? meta.formatValue(n) : plainNumber(n));
  return `${fmt(v.min)}–${fmt(v.max)}`;
}

/** The real value, the way a value chip shows it: the number, its unit
 *  trailing — or, for a choice, the option it is on. */
export function moveChipValue(meta: ControlMeta, value: unknown): { num: string; unit?: string } {
  if (isEnumDial(meta)) {
    return { num: String(enumOptionLabel((meta.options ?? [])[enumIndex(meta, value)] as never)) };
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return { num: '' };
  if (meta.formatValue) return { num: meta.formatValue(n) };
  return { num: plainNumber(n), unit: meta.unit };
}

/** An xy pad's grid, as the XYPad draws it: 5×5 unless the control says
 *  otherwise, `density` multiplying it, `false` hiding it. */
export function moveXYGrid(meta: ControlMeta) {
  const base = meta.grid === false ? 0 : typeof meta.grid === 'number' ? meta.grid : MOVE_XY_GRID_DEFAULT;
  return base > 0 ? Math.round(base * Math.max(0, meta.density ?? 1)) : 0;
}

/** Samples (each 0..1, left to right) as a path across a 100 × 100 box, y
 *  down — how a slot draws a shape it has sampled. */
export function moveShapePath(points: number[]): string {
  if (points.length < 2) return '';
  return points
    .map((v, i) => `${i ? 'L' : 'M'} ${((i / (points.length - 1)) * 100).toFixed(2)} ${((1 - v) * 100).toFixed(2)}`)
    .join(' ');
}
