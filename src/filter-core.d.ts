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
export interface FilterAxis {
    min: number;
    max: number;
    step: number;
    /** The small readout's name for this hand. */
    label: string;
    formatValue?: (value: number) => string;
}
export interface FilterAxisConfig {
    min?: number;
    max?: number;
    step?: number;
    default?: number;
    label?: string;
    formatValue?: (value: number) => string;
}
export interface FilterValue {
    cutoff: number;
    resonance: number;
}
/** A frequency-response sampler: t sweeps the spectrum 0..1, y is 0..1 gain. */
export type FilterResponse = (t: number) => number;
export declare const FILTER_AXIS_DEFAULTS: {
    cutoff: FilterAxis;
    resonance: FilterAxis;
};
export declare function resolveFilterAxis(axis: FilterAxisConfig | undefined, hand: 'cutoff' | 'resonance'): FilterAxis;
/**
 * A stored/config value clamped into both axes. Missing hands fall back to
 * a wide-open filter — cutoff at max, resonance at min — the setting that
 * changes the sound least.
 */
export declare function normalizeFilterValue(value: unknown, cutoffAxis: FilterAxis, resonanceAxis: FilterAxis): FilterValue;
/** One hand's position 0..1 along its axis. */
export declare const filterHand01: (v: number, axis: FilterAxis) => number;
/** A hand position 0..1 back to the axis's real value. */
export declare const filterHandValue: (v01: number, axis: FilterAxis) => number;
/**
 * The built-in response — a 2-pole lowpass magnitude over a log frequency
 * sweep, with the resonance peak riding the knee. Apps with a real DSP
 * engine pass their own `response` so the drawing tells no lies; this one
 * is for configs that just want the picture.
 */
export declare function defaultFilterResponse(cutoff01: number, resonance01: number): FilterResponse;
/** The default response's dB window: floor 36 below unity, ceiling 24 above. */
export declare const FILTER_DB_FLOOR = 36;
export declare const FILTER_DB_CEIL = 24;
/** Enough points for a clean knee at two-slot width, and no more. */
export declare const FILTER_SHAPE_SAMPLES = 96;
/**
 * The response drawn as an SVG path across a 100×100 box, y pointing up —
 * the 2-slot picture. The sampler's 0..1 gain is taken at its word, never
 * refitted: the window is the sampler's own calibration, so an open filter
 * draws as a line near the top, a rolloff reaches the floor, and a rising
 * resonance grows its peak into real headroom instead of being stretched
 * (or clipped) to the band. Out-of-range samples clamp to the box edges.
 */
export declare function filterResponsePath(response: FilterResponse, samples?: number): string | null;
//# sourceMappingURL=filter-core.d.ts.map