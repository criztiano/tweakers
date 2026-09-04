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

export const FILTER_AXIS_DEFAULTS: { cutoff: FilterAxis; resonance: FilterAxis } = {
  cutoff: { min: 0, max: 1, step: 0, label: 'Freq' },
  resonance: { min: 0, max: 1, step: 0, label: 'Res' },
};

export function resolveFilterAxis(
  axis: FilterAxisConfig | undefined,
  hand: 'cutoff' | 'resonance'
): FilterAxis {
  const base = FILTER_AXIS_DEFAULTS[hand];
  return {
    min: axis?.min ?? base.min,
    max: axis?.max ?? base.max,
    step: axis?.step ?? base.step,
    label: axis?.label ?? base.label,
    formatValue: axis?.formatValue,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const snap = (v: number, axis: FilterAxis): number => {
  let out = clamp(Number.isFinite(v) ? v : axis.min, axis.min, axis.max);
  if (axis.step > 0) out = clamp(axis.min + Math.round((out - axis.min) / axis.step) * axis.step, axis.min, axis.max);
  return Number(out.toFixed(6));
};

/**
 * A stored/config value clamped into both axes. Missing hands fall back to
 * a wide-open filter — cutoff at max, resonance at min — the setting that
 * changes the sound least.
 */
export function normalizeFilterValue(
  value: unknown,
  cutoffAxis: FilterAxis,
  resonanceAxis: FilterAxis
): FilterValue {
  const v = (typeof value === 'object' && value !== null ? value : {}) as Partial<FilterValue>;
  return {
    cutoff: snap(typeof v.cutoff === 'number' ? v.cutoff : cutoffAxis.max, cutoffAxis),
    resonance: snap(typeof v.resonance === 'number' ? v.resonance : resonanceAxis.min, resonanceAxis),
  };
}

/** One hand's position 0..1 along its axis. */
export const filterHand01 = (v: number, axis: FilterAxis): number => {
  const n = (v - axis.min) / (axis.max - axis.min || 1);
  return clamp(Number.isFinite(n) ? n : 0, 0, 1);
};

/** A hand position 0..1 back to the axis's real value. */
export const filterHandValue = (v01: number, axis: FilterAxis): number =>
  snap(axis.min + clamp(v01, 0, 1) * (axis.max - axis.min), axis);

/** The filter shapes the built-in response can draw — the biquad family. */
export type FilterShapeType = 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'peak';

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
export function filterShapeResponse(
  type: FilterShapeType,
  cutoff01: number,
  resonance01: number
): FilterResponse {
  // The knee sweeps 3 decades; Q sweeps ~0.7 (no bump) to ~10 (a real peak).
  const fc = Math.pow(10, -3 + 3 * clamp(cutoff01, 0, 1));
  const q = 0.707 * Math.pow(14, clamp(resonance01, 0, 1));
  // The peak shape's boost rides resonance instead of Q: up to +18 dB.
  const a = Math.pow(10, (clamp(resonance01, 0, 1) * 18) / 40);
  return (t: number) => {
    const f = Math.pow(10, -3 + 3 * clamp(t, 0, 1));
    const w = f / fc;
    const w2 = w * w;
    const den = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / q, 2));
    let mag: number;
    switch (type) {
      case 'highpass': mag = w2 / den; break;
      case 'bandpass': mag = (w / q) / den; break;
      case 'notch': mag = Math.abs(1 - w2) / den; break;
      case 'peak':
        mag = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow((w * a) / q, 2)) /
              Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / (a * q), 2));
        break;
      default: mag = 1 / den;
    }
    // Clamp the top only — a peak can't escape the ceiling. The bottom is
    // left open so a rolloff keeps descending past the floor instead of
    // bending flat against it (the drawing clips the overshoot), which is
    // what turns the old kink at the floor back into a smooth fall.
    return Math.min((20 * Math.log10(Math.max(mag, 1e-6)) + FILTER_DB_FLOOR) / (FILTER_DB_FLOOR + FILTER_DB_CEIL), 1);
  };
}

/** The lowpass face of `filterShapeResponse` — the shape a bare config gets. */
export function defaultFilterResponse(cutoff01: number, resonance01: number): FilterResponse {
  return filterShapeResponse('lowpass', cutoff01, resonance01);
}

/** The default response's dB window: floor 36 below unity, ceiling 24 above. */
export const FILTER_DB_FLOOR = 36;
export const FILTER_DB_CEIL = 24;

/** Enough points for a clean knee at two-slot width, and no more. */
export const FILTER_SHAPE_SAMPLES = 96;

/**
 * The response drawn as an SVG path across a 100×100 box, y pointing up —
 * the 2-slot picture. The sampler's 0..1 gain is taken at its word, never
 * refitted: the window is the sampler's own calibration, so an open filter
 * draws as a line near the top, a rising resonance grows its peak into real
 * headroom, and a rolloff keeps falling past the box's bottom (the display
 * clips the overshoot) instead of bending flat into a kink at the floor.
 * The top holds at the box edge so a peak never escapes upward.
 */
export function filterResponsePath(
  response: FilterResponse,
  samples: number = FILTER_SHAPE_SAMPLES
): string | null {
  const pts: number[] = [];
  for (let i = 0; i < samples; i++) {
    let y: number;
    try {
      y = response(i / (samples - 1));
    } catch {
      return null; /* a throwing response draws nothing */
    }
    if (!Number.isFinite(y)) return null;
    // Top clamped to the box; bottom allowed a box-height of overshoot, so
    // the steepest rolloff runs cleanly off the bottom edge and is clipped
    // by the display rather than flattened into a corner at y=100.
    pts.push(Math.min(1, Math.max(-1, y)));
  }
  return pts
    .map((y, i) =>
      `${i ? 'L' : 'M'} ${((i / (samples - 1)) * 100).toFixed(2)} ${((1 - y) * 100).toFixed(2)}`)
    .join(' ');
}
