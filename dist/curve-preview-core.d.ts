type CurvePoint = {
    /** Sample position, 0..1 across the row's width. */
    t: number;
    /** Normalized value, 0..1 within the fitted domain (0 = domain min). */
    v: number;
};
type CurvePlot = {
    /**
     * Polyline segments in normalized [0,1]² space. Non-finite samples are
     * skipped and split the stroke, so a partially-defined curve still draws
     * its defined stretches.
     */
    segments: CurvePoint[][];
    /** The y-range the segments were fitted to (explicit, or auto-fit + padding). */
    domain: [number, number];
    /** Normalized position of y=0 when the domain spans it, else null. */
    baseline: number | null;
};
declare const CURVE_SAMPLE_COUNT = 160;
declare const CURVE_MIN_HEIGHT = 32;
declare const CURVE_MAX_HEIGHT = 160;
declare const CURVE_DEFAULT_HEIGHT = 64;
/** Auto-fit headroom on each side, as a fraction of the value span. */
declare const CURVE_FIT_PADDING = 0.05;
/** Resolve a curve config's height: default 64, clamped to a sensible band. */
declare function clampCurveHeight(height?: number): number;
/**
 * Sample a host-supplied curve across t ∈ [0,1] and normalize it into unit
 * space. A throwing or non-finite sample never poisons the plot: that point is
 * dropped and the stroke breaks around it. An invalid or degenerate explicit
 * domain (non-finite, or min ≥ max) falls back to auto-fit.
 */
declare function plotCurve(sample: (t: number) => number, options?: {
    count?: number;
    domain?: [number, number];
}): CurvePlot;
/**
 * Filter reference markers down to drawable x positions: finite numbers in
 * [0, 1]. Out-of-range or non-finite entries are skipped, never clamped — a
 * marker is a reference line, and moving it would lie about where it sits.
 */
declare function normalizeCurveMarkers(markers?: readonly number[]): number[];
/** Map a normalized value (0 = domain min) to a y pixel, inset by `pad`. */
declare function curveY(v: number, height: number, pad?: number): number;
/** SVG path data for a plot's segments; each segment is its own subpath. */
declare function curvePathData(segments: CurvePoint[][], width: number, height: number, pad?: number): string;

export { CURVE_DEFAULT_HEIGHT, CURVE_FIT_PADDING, CURVE_MAX_HEIGHT, CURVE_MIN_HEIGHT, CURVE_SAMPLE_COUNT, type CurvePlot, type CurvePoint, clampCurveHeight, curvePathData, curveY, normalizeCurveMarkers, plotCurve };
