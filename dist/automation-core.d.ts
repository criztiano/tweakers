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
 * until the next one (`hold`). A `color` lane carries a colour as one packed
 * 24-bit RGB number (`packColor`), and blends between its points in OKLab —
 * the straight line a reader sees as an even fade. Two points at one `t` are a jump, and the
 * curve takes the later one from that instant on (right-continuous). Before
 * the first point and after the last the curve stays at their values, so a
 * lane answers every `t`: a new lane starts flat at the control's value and
 * covers the whole pass from its first moment.
 *
 * Everything here returns new objects and touches nothing else — the store
 * (`automation-store.ts`) holds state, the card draws it.
 */
type AutomationInterp = 'linear' | 'hold' | 'color';
/** A colour lane's whole range: every packed 24-bit RGB value. */
declare const AUTOMATION_COLOR_MAX = 16777215;
interface AutomationPoint {
    /** Phase of the pass, 0..1. */
    t: number;
    /** The value, in the control's own units. */
    v: number;
}
interface AutomationRange {
    min: number;
    max: number;
}
interface AutomationLane extends AutomationRange {
    /** The host's name for the control this lane drives. */
    key: string;
    /** What the card calls it. */
    label: string;
    interp: AutomationInterp;
    /** Sorted by `t`. Never empty. */
    points: readonly AutomationPoint[];
}
interface AutomationTimeline {
    readonly lanes: readonly AutomationLane[];
}
/** A stretch of one control written by a hand: what replaces the lane between `from` and `to`. */
interface AutomationSpan {
    key: string;
    from: number;
    to: number;
    samples: AutomationPoint[];
}
/** Where a playing read left off in a lane, so the next read starts there. */
interface AutomationCursor {
    index: number;
}
/** How far a simplified curve may stray from the drawn one: 0.4% of the
 *  control's range — under a dial's step on any control the kit draws. */
declare const AUTOMATION_TOLERANCE = 0.004;
/** How many steps a smoothing pass resamples a lane into. */
declare const AUTOMATION_SMOOTH_SAMPLES = 240;
declare const EMPTY_TIMELINE: AutomationTimeline;
/** A colour as a colour lane carries it: `#rgb` or `#rrggbb` (alpha is
 *  dropped) to one 24-bit number. Anything unreadable is black. */
declare function packColor(hex: string): number;
/** A colour lane's value as `#rrggbb`. */
declare function unpackColor(v: number): string;
/** The colour `t` of the way from `a` to `b`, blended in OKLab. */
declare function mixColor(a: number, b: number, t: number): number;
/**
 * How far apart two colours look: their distance in OKLab, where black to
 * white is 1 — so a colour lane's tolerance is a share of that, the way a
 * number lane's is a share of its range.
 */
declare function colorDistance(a: number, b: number): number;
/** A value as the lane can hold it: inside its range, and a whole packed
 *  colour on a colour lane. */
declare function fitValue(lane: AutomationRange & {
    interp?: AutomationInterp;
}, v: number): number;
/** The lane's value at phase `t`. Pass a cursor to make a playing read cheap. */
declare function valueAt(lane: Pick<AutomationLane, 'points' | 'interp' | 'min'>, t: number, cursor?: AutomationCursor): number;
/** The value the curve arrives at `t` with — the one before a jump there. */
declare function valueBefore(lane: Pick<AutomationLane, 'points' | 'interp' | 'min'>, t: number): number;
/**
 * A lane that holds `base` for the whole pass — what a control was before its
 * first take. A colour lane always spans every packed colour, whatever range
 * it is given.
 */
declare function createLane(key: string, label: string, min: number, max: number, base: number, interp?: AutomationInterp): AutomationLane;
/**
 * Fewer points, the same curve: Ramer-Douglas-Peucker on the VERTICAL error —
 * how far the value strays at that moment, as a share of the control's range
 * — because a lane is read at a time, never along its length. Endpoints stay,
 * and so does every jump (two points at one `t`): each run between them is
 * simplified on its own. A `hold` lane keeps a point only where the value
 * changes. A `color` lane measures the error as the OKLab distance from the
 * blend the simplified curve would show (black to white is 1), so a fade
 * keeps the points a reader could tell apart. Iterative, so a long take
 * cannot overflow the stack.
 */
declare function simplify(points: readonly AutomationPoint[], range: AutomationRange, tolerance?: number, interp?: AutomationInterp): AutomationPoint[];
/**
 * Smooth a lane's shape: resample it into `AUTOMATION_SMOOTH_SAMPLES` steps,
 * blur with a Gaussian whose width is `amount` × 5% of the pass, and simplify
 * again. Pressing it again smooths again. With a `span` only that stretch
 * changes, and the change fades in and out at its edges so no jump appears
 * where it meets the rest of the lane. A colour lane does not smooth — a
 * blur of colours is a muddy one — and comes back as it was.
 */
declare function smooth(lane: AutomationLane, amount: number, span?: {
    from: number;
    to: number;
}, tolerance?: number): AutomationPoint[];
/**
 * Overdub: a hand's span replaces the lane between `from` and `to`, and only
 * there. The lane keeps its value up to `from` and from `to` on exactly —
 * a point pins each edge at the old curve's value — so the written stretch
 * meets the rest with a straight jump rather than a ramp across untouched
 * time. The span's samples are simplified on the way in.
 */
declare function mergeSpan(lane: AutomationLane, span: Pick<AutomationSpan, 'from' | 'to' | 'samples'>, tolerance?: number): AutomationLane;
/** A stretch of the pass that may run over its end, as one or two plain stretches. */
declare function splitAtWrap(from: number, to: number): {
    from: number;
    to: number;
}[];
/**
 * Clear a stretch: every point inside it goes, and the curve runs straight
 * from where it entered to where it leaves — the edges stay where they were.
 */
declare function clearRange(lane: AutomationLane, from: number, to: number): AutomationLane;
/**
 * Move one point. It stays between its neighbours in time (it may meet them,
 * which makes a jump) and inside the control's range in value. A point on
 * either end of the pass keeps its time, so the lane keeps its reach.
 */
declare function movePoint(lane: AutomationLane, index: number, t: number, v: number): AutomationLane;
/** Add a point at `t` — on the curve unless a value is given. Returns the new lane and where the point landed. */
declare function addPoint(lane: AutomationLane, t: number, v?: number): {
    lane: AutomationLane;
    index: number;
};
/** Remove one point. A lane's last point stays — deleting the lane is a different act. */
declare function deletePoint(lane: AutomationLane, index: number): AutomationLane;
declare function laneByKey(timeline: AutomationTimeline, key: string): AutomationLane | undefined;
/** Put a lane in: in place of the one with its key, else at the end. */
declare function upsertLane(timeline: AutomationTimeline, lane: AutomationLane): AutomationTimeline;
declare function removeLane(timeline: AutomationTimeline, key: string): AutomationTimeline;
/** Every lane's value at phase `t`, by key. */
declare function sampleTimeline(timeline: AutomationTimeline, t: number): Map<string, number>;
/**
 * Rename every lane's key — for a copy whose controls have new ids. A key
 * mapped to null drops its lane; two lanes mapped to one key keep the first.
 */
declare function remapKeys(timeline: AutomationTimeline, map: (key: string) => string | null | undefined): AutomationTimeline;
/**
 * Read a timeline from anything — a saved file, a message — into one the
 * store can play. Bad numbers go, points are sorted and clamped, a lane with
 * no usable range, key or point goes, the first of two lanes on one key
 * stays. Never throws: a broken lane costs that lane, not the timeline.
 */
declare function validateTimeline(raw: unknown): AutomationTimeline;

export { AUTOMATION_COLOR_MAX, AUTOMATION_SMOOTH_SAMPLES, AUTOMATION_TOLERANCE, type AutomationCursor, type AutomationInterp, type AutomationLane, type AutomationPoint, type AutomationRange, type AutomationSpan, type AutomationTimeline, EMPTY_TIMELINE, addPoint, clearRange, colorDistance, createLane, deletePoint, fitValue, laneByKey, mergeSpan, mixColor, movePoint, packColor, remapKeys, removeLane, sampleTimeline, simplify, smooth, splitAtWrap, unpackColor, upsertLane, validateTimeline, valueAt, valueBefore };
