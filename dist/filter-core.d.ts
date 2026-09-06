/**
 * The filter control's core — the kit's first 2-slot control. One control,
 * two hands: cutoff on the left, resonance on the right. On the Move it
 * claims two dial slots and draws its magnitude response across both; on
 * the hardware the left column's knob turns cutoff and the right column's
 * knob turns resonance, each an ordinary one-column dial to the bridge.
 *
 * Everything here is framework-free so every surface (the inline panel row,
 * the Move slot, the hardware mapping) answers "what does this filter look
 * like" through one door.
 */
interface FilterAxis {
    min: number;
    max: number;
    step: number;
    /** The small readout's name for this hand. */
    label: string;
    formatValue?: (value: number) => string;
}
interface FilterAxisConfig {
    min?: number;
    max?: number;
    step?: number;
    default?: number;
    label?: string;
    formatValue?: (value: number) => string;
}
interface FilterValue {
    cutoff: number;
    resonance: number;
}
/** A frequency-response sampler: t sweeps the spectrum 0..1, y is 0..1 gain. */
type FilterResponse = (t: number) => number;
declare const FILTER_AXIS_DEFAULTS: {
    cutoff: FilterAxis;
    resonance: FilterAxis;
};
declare function resolveFilterAxis(axis: FilterAxisConfig | undefined, hand: 'cutoff' | 'resonance'): FilterAxis;
/**
 * A stored/config value clamped into both axes. Missing hands fall back to
 * a wide-open filter — cutoff at max, resonance at min — the setting that
 * changes the sound least.
 */
declare function normalizeFilterValue(value: unknown, cutoffAxis: FilterAxis, resonanceAxis: FilterAxis): FilterValue;
/** One hand's position 0..1 along its axis. */
declare const filterHand01: (v: number, axis: FilterAxis) => number;
/** A hand position 0..1 back to the axis's real value. */
declare const filterHandValue: (v01: number, axis: FilterAxis) => number;
/** The filter shapes the built-in response can draw — the biquad family. */
type FilterShapeType = 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'peak';
/**
 * The built-in response — a true 2-pole biquad magnitude over a log
 * frequency sweep, on a dB ruler with headroom above unity: the biggest
 * peak Q allows (+20 dB) still fits under the ceiling, so a rising
 * resonance grows the bump instead of flattening it against the top of the
 * band; only the stopband tail meets a hard edge — the floor, where a
 * rolloff belongs. Every shape is its analog prototype's own magnitude,
 * not a lowpass mirrored or averaged into an approximation. Apps with a
 * real DSP engine pass their own `response` so the drawing tells no lies;
 * this one is for configs that just want an honest picture.
 */
declare function filterShapeResponse(type: FilterShapeType, cutoff01: number, resonance01: number): FilterResponse;
/** The lowpass face of `filterShapeResponse` — the shape a bare config gets. */
declare function defaultFilterResponse(cutoff01: number, resonance01: number): FilterResponse;
/** The default response's dB window: floor 36 below unity, ceiling 24 above. */
declare const FILTER_DB_FLOOR = 36;
declare const FILTER_DB_CEIL = 24;
/** Enough points for a clean knee at two-slot width, and no more. */
declare const FILTER_SHAPE_SAMPLES = 96;
/**
 * The response drawn as an SVG path across a 100×100 box, y pointing up —
 * the 2-slot picture. The sampler's 0..1 gain is taken at its word, never
 * refitted: the window is the sampler's own calibration, so an open filter
 * draws as a line near the top, a rising resonance grows its peak into real
 * headroom, and a rolloff keeps falling past the box's bottom (the display
 * clips the overshoot) instead of bending flat into a kink at the floor.
 * The top holds at the box edge so a peak never escapes upward.
 */
declare function filterResponsePath(response: FilterResponse, samples?: number): string | null;

export { FILTER_AXIS_DEFAULTS, FILTER_DB_CEIL, FILTER_DB_FLOOR, FILTER_SHAPE_SAMPLES, type FilterAxis, type FilterAxisConfig, type FilterResponse, type FilterShapeType, type FilterValue, defaultFilterResponse, filterHand01, filterHandValue, filterResponsePath, filterShapeResponse, normalizeFilterValue, resolveFilterAxis };
