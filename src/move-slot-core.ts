import type { ControlMeta } from './store/TweakStore';
import {
  normalizeDial, denormalizeDial, normalizeRangeDial, denormalizeRangeDial, denormalizeEnumDial,
  normalizeFilterDial, denormalizeFilterDial, dialOrigin, isEnumDial, enumIndex, enumOptionLabel,
} from './move-layout';
import { fineDragValue } from './shortcut-utils';
import { resolveAxis, valueFromPoint, pointFromValue, normalizeValue, centerValue, applyDetentAxis, type XYValue } from './xy-pad-core';
import { nearestHandle, type RangeValue } from './range-slider-core';
import { angleFromPointer } from './angle-core';
import { normalizeTransfer, movePoint, nearestPoint } from './transfer-core';
import { normalizeGradient, type GradientValue } from './gradient-core';
import { moveKeyboardValue } from './move-visual-core';
import { MOVE_GAUGE } from './components/move-slots';

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
/** The trim span's line sits this much further in than a dial's track. */
export const MOVE_TRIM_SPAN_PAD = 4;
/** A face bar's marker height — must match .tweakers-move-face-bar-marker. */
export const MOVE_FACE_MARKER = 4;
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

/** A 0..1 place read off a horizontal track, fine drag included. */
function trackPlace(e: MoveSlotPointer, box: MoveSlotBox, inset: number, fine: MoveGestureRef<MoveFineAnchor | null>, from: () => number) {
  const span = box.width - inset * 2;
  const anchor = moveFineAnchor(fine, e, from);
  return anchor
    ? fineDragValue({ startValue: anchor.v as number, startPos: anchor.x, pos: e.clientX, extentPx: span || 1, min: 0, max: 1, factor: anchor.shift ? 0.1 : 1 })
    : clamp01((e.clientX - box.left - inset) / (span || 1));
}

/**
 * A dial: the whole slot is the hotspot, and the pointer's place along the
 * track sets the value — the library Slider's card. `inset` is how far in
 * from the box's sides the track runs.
 */
export function moveDialValue(
  meta: ControlMeta, value: unknown, e: MoveSlotPointer, box: MoveSlotBox,
  fine: MoveGestureRef<MoveFineAnchor | null>, inset = MOVE_DIAL_TRACK_INSET,
) {
  return denormalizeDial(meta, trackPlace(e, box, inset, fine, () => normalizeDial(meta, value)));
}

/** A stepped choice: the pointer's place picks the nearest option. */
export function moveEnumValue(meta: ControlMeta, e: MoveSlotPointer, box: MoveSlotBox) {
  const span = box.width - MOVE_DIAL_TRACK_INSET * 2;
  return denormalizeEnumDial(meta, clamp01((e.clientX - box.left - MOVE_DIAL_TRACK_INSET) / (span || 1)));
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

/** The drawn part a face dial's drag reads — found on the face the press
 *  landed in, or the pressed element itself where the face draws none. */
export function moveFaceBox(target: Element, role: MoveFaceRole, track?: string): MoveSlotBox {
  const face = target.closest?.('.tweakers-move-dial');
  const name = track ?? (role === 'band' ? 'grid' : role);
  return (face?.querySelector(`[data-track="${name}"]`) ?? target).getBoundingClientRect();
}

/**
 * A multi-slot instrument's dial reads its own drawn part: a bar or the band
 * grid top (most) to bottom (least), the look-ahead's line left to right, the
 * speed's gauge round its dome.
 */
export function moveFaceValue(
  meta: ControlMeta, value: unknown, role: MoveFaceRole, e: MoveSlotPointer, box: MoveSlotBox,
  fine: MoveGestureRef<MoveFineAnchor | null>,
) {
  let v01: number;
  if (role === 'speed') {
    const dx = e.clientX - (box.left + box.width / 2);
    const dy = e.clientY - (box.top + (box.height * MOVE_GAUGE.top) / MOVE_GAUGE.height);
    const bearing = (Math.atan2(dx, -dy) * 180) / Math.PI;
    v01 = clamp01((bearing + MOVE_GAUGE.sweep) / (MOVE_GAUGE.sweep * 2));
  } else {
    const vertical = role !== 'lookahead';
    const marker = role === 'band' || role === 'channel' ? 0 : MOVE_FACE_MARKER;
    const extent = (vertical ? box.height - marker : box.width) || 1;
    const anchor = moveFineAnchor(fine, e, () => normalizeDial(meta, value));
    v01 = anchor
      ? fineDragValue({ startValue: anchor.v as number, startPos: vertical ? -anchor.y : anchor.x, pos: vertical ? -e.clientY : e.clientX, extentPx: extent, min: 0, max: 1, factor: anchor.shift ? 0.1 : 1 })
      : clamp01(vertical ? 1 - (e.clientY - box.top - marker / 2) / extent : (e.clientX - box.left) / extent);
  }
  return denormalizeDial(meta, v01);
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
