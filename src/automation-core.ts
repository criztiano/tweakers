/**
 * Automation lanes — the pure core.
 *
 * A lane is one control's value over one pass of the host's clock: a list of
 * points on normalised time (`t` is a phase, 0 at the start of the pass, 1 at
 * its end) and in the control's own units (`v` between the lane's `min` and
 * `max`). Phase, not seconds, so a lane stretches with its pass when the host
 * changes the length — the way a synced LFO does. The host's duration is only
 * for the ruler.
 *
 * Between two points the value is a straight line (`linear`) or stays put
 * until the next one (`hold`). Two points at one `t` are a jump, and the
 * curve takes the later one from that instant on (right-continuous). Before
 * the first point and after the last the curve stays at their values, so a
 * lane answers every `t`: a new lane starts flat at the control's value and
 * covers the whole pass from its first moment.
 *
 * Everything here returns new objects and touches nothing else — the store
 * (`automation-store.ts`) holds state, the card draws it.
 */

export type AutomationInterp = 'linear' | 'hold';

export interface AutomationPoint {
  /** Phase of the pass, 0..1. */
  t: number;
  /** The value, in the control's own units. */
  v: number;
}

export interface AutomationRange {
  min: number;
  max: number;
}

export interface AutomationLane extends AutomationRange {
  /** The host's name for the control this lane drives. */
  key: string;
  /** What the card calls it. */
  label: string;
  interp: AutomationInterp;
  /** Sorted by `t`. Never empty. */
  points: readonly AutomationPoint[];
}

export interface AutomationTimeline {
  readonly lanes: readonly AutomationLane[];
}

/** A stretch of one control written by a hand: what replaces the lane between `from` and `to`. */
export interface AutomationSpan {
  key: string;
  from: number;
  to: number;
  samples: AutomationPoint[];
}

/** Where a playing read left off in a lane, so the next read starts there. */
export interface AutomationCursor {
  index: number;
}

/** How far a simplified curve may stray from the drawn one: 0.4% of the
 *  control's range — under a dial's step on any control the kit draws. */
export const AUTOMATION_TOLERANCE = 0.004;

/** How many steps a smoothing pass resamples a lane into. */
export const AUTOMATION_SMOOTH_SAMPLES = 240;

export const EMPTY_TIMELINE: AutomationTimeline = Object.freeze({ lanes: Object.freeze([]) as readonly AutomationLane[] });

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const spanOf = (range: AutomationRange) => (range.max - range.min > 0 ? range.max - range.min : 1);

/** The last index whose point is at or before `t` — the point the curve is
 *  leaving at `t`. -1 when `t` is before every point. */
function pointAtOrBefore(points: readonly AutomationPoint[], t: number, cursor?: AutomationCursor): number {
  const n = points.length;
  let lo = 0;
  let hi = n - 1;
  // A playing read moves forward a frame at a time: walk on from where the
  // last one stopped, and fall back to the search when it jumped.
  if (cursor && cursor.index >= 0 && cursor.index < n && points[cursor.index].t <= t) {
    let i = cursor.index;
    for (let step = 0; step < 4 && i + 1 < n && points[i + 1].t <= t; step++) i++;
    if (i + 1 >= n || points[i + 1].t > t) {
      cursor.index = i;
      return i;
    }
    lo = i;
  }
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t <= t) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (cursor) cursor.index = Math.max(0, found);
  return found;
}

/** The curve between two neighbours at `t`. */
function between(a: AutomationPoint, b: AutomationPoint, t: number, interp: AutomationInterp): number {
  if (interp === 'hold' || b.t <= a.t) return a.v;
  return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t);
}

/** The lane's value at phase `t`. Pass a cursor to make a playing read cheap. */
export function valueAt(lane: Pick<AutomationLane, 'points' | 'interp' | 'min'>, t: number, cursor?: AutomationCursor): number {
  const { points } = lane;
  if (!points.length) return lane.min;
  const i = pointAtOrBefore(points, t, cursor);
  if (i < 0) return points[0].v;
  if (i >= points.length - 1) return points[points.length - 1].v;
  return between(points[i], points[i + 1], t, lane.interp);
}

/** The value the curve arrives at `t` with — the one before a jump there. */
export function valueBefore(lane: Pick<AutomationLane, 'points' | 'interp' | 'min'>, t: number): number {
  const { points } = lane;
  if (!points.length) return lane.min;
  // The last point strictly before `t`.
  let lo = 0;
  let hi = points.length - 1;
  let i = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t < t) {
      i = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (i < 0) return points[0].v;
  if (i >= points.length - 1) return points[points.length - 1].v;
  return between(points[i], points[i + 1], t, lane.interp);
}

/** A lane that holds `base` for the whole pass — what a control was before its first take. */
export function createLane(key: string, label: string, min: number, max: number, base: number, interp: AutomationInterp = 'linear'): AutomationLane {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const v = clamp(Number.isFinite(base) ? base : lo, lo, hi);
  return { key, label, min: lo, max: hi, interp, points: [{ t: 0, v }, { t: 1, v }] };
}

/**
 * Fewer points, the same curve: Ramer-Douglas-Peucker on the VERTICAL error —
 * how far the value strays at that moment, as a share of the control's range
 * — because a lane is read at a time, never along its length. Endpoints stay,
 * and so does every jump (two points at one `t`): each run between them is
 * simplified on its own. A `hold` lane keeps a point only where the value
 * changes. Iterative, so a long take cannot overflow the stack.
 */
export function simplify(
  points: readonly AutomationPoint[],
  range: AutomationRange,
  tolerance = AUTOMATION_TOLERANCE,
  interp: AutomationInterp = 'linear'
): AutomationPoint[] {
  const n = points.length;
  if (n <= 2) return points.map((p) => ({ t: p.t, v: p.v }));
  const span = spanOf(range);
  const limit = Math.max(0, tolerance);
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  for (let i = 1; i < n; i++) {
    if (points[i].t === points[i - 1].t) keep[i] = keep[i - 1] = 1;
  }
  if (interp === 'hold') {
    const out: AutomationPoint[] = [];
    for (let i = 0; i < n; i++) {
      const last = out[out.length - 1];
      if (keep[i] || !last || Math.abs(points[i].v - last.v) / span > limit) out.push({ t: points[i].t, v: points[i].v });
    }
    return out;
  }
  const stack: [number, number][] = [];
  let a = 0;
  for (let i = 1; i < n; i++) {
    if (!keep[i]) continue;
    if (i - a > 1) stack.push([a, i]);
    a = i;
  }
  while (stack.length) {
    const [lo, hi] = stack.pop()!;
    const p = points[lo];
    const q = points[hi];
    let worst = -1;
    let at = -1;
    for (let i = lo + 1; i < hi; i++) {
      const expected = q.t > p.t ? p.v + ((q.v - p.v) * (points[i].t - p.t)) / (q.t - p.t) : p.v;
      const error = Math.abs(points[i].v - expected) / span;
      if (error > worst) {
        worst = error;
        at = i;
      }
    }
    if (worst > limit && at > 0) {
      keep[at] = 1;
      if (at - lo > 1) stack.push([lo, at]);
      if (hi - at > 1) stack.push([at, hi]);
    }
  }
  const out: AutomationPoint[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push({ t: points[i].t, v: points[i].v });
  return out;
}

/** Normalise a hand's samples: inside the span, in time order, and at most two
 *  values per instant — where it was and where it went, a jump. */
function cleanSamples(samples: readonly AutomationPoint[], from: number, to: number, range: AutomationRange): AutomationPoint[] {
  const sorted = samples
    .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.v))
    .map((s, i) => ({ t: clamp(s.t, from, to), v: clamp(s.v, range.min, range.max), i }))
    .sort((p, q) => p.t - q.t || p.i - q.i);
  const out: AutomationPoint[] = [];
  for (const s of sorted) {
    const n = out.length;
    if (n >= 2 && out[n - 1].t === s.t && out[n - 2].t === s.t) out[n - 1].v = s.v;
    else out.push({ t: s.t, v: s.v });
  }
  return out;
}

/**
 * Smooth a lane's shape: resample it into `AUTOMATION_SMOOTH_SAMPLES` steps,
 * blur with a Gaussian whose width is `amount` × 5% of the pass, and simplify
 * again. Pressing it again smooths again. With a `span` only that stretch
 * changes, and the change fades in and out at its edges so no jump appears
 * where it meets the rest of the lane.
 */
export function smooth(
  lane: AutomationLane,
  amount: number,
  span?: { from: number; to: number },
  tolerance = AUTOMATION_TOLERANCE
): AutomationPoint[] {
  const sigma = clamp(amount, 0, 4) * 0.05;
  if (!(sigma > 0)) return simplify(lane.points, lane, tolerance, lane.interp);
  const from = span ? clamp01(Math.min(span.from, span.to)) : 0;
  const to = span ? clamp01(Math.max(span.from, span.to)) : 1;
  if (!(to > from)) return lane.points.map((p) => ({ ...p }));
  const n = AUTOMATION_SMOOTH_SAMPLES;
  // The kernel's own resolution: fixed in taps, so a narrow span costs no more.
  const step = sigma / 8;
  const reach = 24;
  const weights: number[] = [];
  let total = 0;
  for (let k = -reach; k <= reach; k++) {
    const w = Math.exp(-((k * step) ** 2) / (2 * sigma * sigma));
    weights.push(w);
    total += w;
  }
  // A narrow span fades its change in and out over at most a third of itself.
  const fade = span ? Math.min(sigma * 2, (to - from) / 3) : 0;
  const cursor: AutomationCursor = { index: 0 };
  const samples: AutomationPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    let sum = 0;
    for (let k = -reach; k <= reach; k++) {
      // The pass ends where it ends: the curve outside 0..1 is its edge value.
      sum += weights[k + reach] * valueAt(lane, clamp01(t + k * step));
    }
    let v = sum / total;
    if (fade > 0) {
      const edge = Math.min(t - from, to - t) / fade;
      if (edge < 1) {
        const mix = edge <= 0 ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * edge);
        const original = valueAt(lane, t, cursor);
        v = original + (v - original) * mix;
      }
    }
    samples.push({ t, v: clamp(v, lane.min, lane.max) });
  }
  const smoothed = simplify(samples, lane, tolerance, lane.interp);
  if (!span) return smoothed;
  const before = lane.points.filter((p) => p.t < from);
  const after = lane.points.filter((p) => p.t > to);
  return [...before.map((p) => ({ ...p })), ...smoothed, ...after.map((p) => ({ ...p }))];
}

/**
 * Overdub: a hand's span replaces the lane between `from` and `to`, and only
 * there. The lane keeps its value up to `from` and from `to` on exactly —
 * a point pins each edge at the old curve's value — so the written stretch
 * meets the rest with a straight jump rather than a ramp across untouched
 * time. The span's samples are simplified on the way in.
 */
export function mergeSpan(lane: AutomationLane, span: Pick<AutomationSpan, 'from' | 'to' | 'samples'>, tolerance = AUTOMATION_TOLERANCE): AutomationLane {
  const from = clamp01(Math.min(span.from, span.to));
  const to = clamp01(Math.max(span.from, span.to));
  const samples = cleanSamples(span.samples, from, to, lane);
  if (!samples.length || !(to - from > 1e-9)) return lane;
  // The hand's value reaches both edges: before its first sample it was
  // already there, after its last it stayed.
  if (samples[0].t > from) samples.unshift({ t: from, v: samples[0].v });
  if (samples[samples.length - 1].t < to) samples.push({ t: to, v: samples[samples.length - 1].v });
  const written = simplify(samples, lane, tolerance, lane.interp);
  const left = valueBefore(lane, from);
  const right = valueAt(lane, to);
  const points: AutomationPoint[] = [];
  for (const p of lane.points) if (p.t < from) points.push({ ...p });
  if (from > 0) points.push({ t: from, v: left });
  points.push(...written);
  if (to < 1) points.push({ t: to, v: right });
  for (const p of lane.points) if (p.t > to) points.push({ ...p });
  return { ...lane, points: dropRedundantJumps(points) };
}

/** A jump to the value it already had is no jump: drop the doubled point. */
function dropRedundantJumps(points: AutomationPoint[]): AutomationPoint[] {
  return points.filter((p, i) => !(i > 0 && p.t === points[i - 1].t && p.v === points[i - 1].v));
}

/** A stretch of the pass that may run over its end, as one or two plain stretches. */
export function splitAtWrap(from: number, to: number): { from: number; to: number }[] {
  const a = clamp01(from);
  const b = clamp01(to);
  if (a <= b) return [{ from: a, to: b }];
  return [{ from: a, to: 1 }, { from: 0, to: b }];
}

/**
 * Clear a stretch: every point inside it goes, and the curve runs straight
 * from where it entered to where it leaves — the edges stay where they were.
 */
export function clearRange(lane: AutomationLane, from: number, to: number): AutomationLane {
  const a = clamp01(Math.min(from, to));
  const b = clamp01(Math.max(from, to));
  if (!(b > a)) return lane;
  const left = valueBefore(lane, a);
  const right = valueAt(lane, b);
  const points: AutomationPoint[] = [];
  for (const p of lane.points) if (p.t < a) points.push({ ...p });
  points.push({ t: a, v: left });
  points.push({ t: b, v: right });
  for (const p of lane.points) if (p.t > b) points.push({ ...p });
  return { ...lane, points: dropRedundantJumps(points) };
}

/**
 * Move one point. It stays between its neighbours in time (it may meet them,
 * which makes a jump) and inside the control's range in value. A point on
 * either end of the pass keeps its time, so the lane keeps its reach.
 */
export function movePoint(lane: AutomationLane, index: number, t: number, v: number): AutomationLane {
  const { points } = lane;
  if (index < 0 || index >= points.length) return lane;
  const prev = points[index - 1];
  const next = points[index + 1];
  const current = points[index];
  const pinned = (index === 0 && current.t === 0) || (index === points.length - 1 && current.t === 1);
  const nextT = pinned ? current.t : clamp(Number.isFinite(t) ? t : current.t, prev ? prev.t : 0, next ? next.t : 1);
  const nextV = clamp(Number.isFinite(v) ? v : current.v, lane.min, lane.max);
  if (nextT === current.t && nextV === current.v) return lane;
  const copy = points.map((p) => ({ ...p }));
  copy[index] = { t: nextT, v: nextV };
  return { ...lane, points: copy };
}

/** Add a point at `t` — on the curve unless a value is given. Returns the new lane and where the point landed. */
export function addPoint(lane: AutomationLane, t: number, v?: number): { lane: AutomationLane; index: number } {
  const at = clamp01(Number.isFinite(t) ? t : 0);
  const value = clamp(v !== undefined && Number.isFinite(v) ? v : valueAt(lane, at), lane.min, lane.max);
  let index = lane.points.length;
  for (let i = 0; i < lane.points.length; i++) {
    if (lane.points[i].t > at) {
      index = i;
      break;
    }
  }
  const points = lane.points.map((p) => ({ ...p }));
  points.splice(index, 0, { t: at, v: value });
  return { lane: { ...lane, points }, index };
}

/** Remove one point. A lane's last point stays — deleting the lane is a different act. */
export function deletePoint(lane: AutomationLane, index: number): AutomationLane {
  if (lane.points.length <= 1 || index < 0 || index >= lane.points.length) return lane;
  return { ...lane, points: lane.points.filter((_, i) => i !== index).map((p) => ({ ...p })) };
}

export function laneByKey(timeline: AutomationTimeline, key: string): AutomationLane | undefined {
  return timeline.lanes.find((lane) => lane.key === key);
}

/** Put a lane in: in place of the one with its key, else at the end. */
export function upsertLane(timeline: AutomationTimeline, lane: AutomationLane): AutomationTimeline {
  const at = timeline.lanes.findIndex((l) => l.key === lane.key);
  if (at < 0) return { lanes: [...timeline.lanes, lane] };
  const lanes = timeline.lanes.slice();
  lanes[at] = lane;
  return { lanes };
}

export function removeLane(timeline: AutomationTimeline, key: string): AutomationTimeline {
  if (!timeline.lanes.some((l) => l.key === key)) return timeline;
  return { lanes: timeline.lanes.filter((l) => l.key !== key) };
}

/** Every lane's value at phase `t`, by key. */
export function sampleTimeline(timeline: AutomationTimeline, t: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const lane of timeline.lanes) out.set(lane.key, valueAt(lane, t));
  return out;
}

/**
 * Rename every lane's key — for a copy whose controls have new ids. A key
 * mapped to null drops its lane; two lanes mapped to one key keep the first.
 */
export function remapKeys(timeline: AutomationTimeline, map: (key: string) => string | null | undefined): AutomationTimeline {
  const seen = new Set<string>();
  const lanes: AutomationLane[] = [];
  for (const lane of timeline.lanes) {
    const key = map(lane.key);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    lanes.push(key === lane.key ? lane : { ...lane, key });
  }
  return { lanes };
}

/** One point from a saved file: `{ t, v }` or the compact `[t, v]`. */
function readPoint(raw: unknown): AutomationPoint | null {
  const pair = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [(raw as { t?: unknown }).t, (raw as { v?: unknown }).v] : null;
  if (!pair) return null;
  const t = Number(pair[0]);
  const v = Number(pair[1]);
  return Number.isFinite(t) && Number.isFinite(v) ? { t, v } : null;
}

/**
 * Read a timeline from anything — a saved file, a message — into one the
 * store can play. Bad numbers go, points are sorted and clamped, a lane with
 * no usable range, key or point goes, the first of two lanes on one key
 * stays. Never throws: a broken lane costs that lane, not the timeline.
 */
export function validateTimeline(raw: unknown): AutomationTimeline {
  const list = raw && typeof raw === 'object' ? (raw as { lanes?: unknown }).lanes : null;
  if (!Array.isArray(list)) return { lanes: [] };
  const seen = new Set<string>();
  const lanes: AutomationLane[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const key = typeof e.key === 'string' ? e.key : '';
    if (!key || seen.has(key)) continue;
    const a = Number(e.min);
    const b = Number(e.max);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) continue;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const rawPoints = Array.isArray(e.points) ? e.points : [];
    const points = rawPoints
      .map(readPoint)
      .filter((p): p is AutomationPoint => !!p)
      .map((p, i) => ({ t: clamp01(p.t), v: clamp(p.v, min, max), i }))
      .sort((p, q) => p.t - q.t || p.i - q.i)
      .map(({ t, v }) => ({ t, v }));
    if (!points.length) continue;
    seen.add(key);
    lanes.push({
      key,
      label: typeof e.label === 'string' && e.label ? e.label : key,
      min,
      max,
      interp: e.interp === 'hold' ? 'hold' : 'linear',
      points,
    });
  }
  return { lanes };
}
