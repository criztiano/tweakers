// src/filter-core.ts
var FILTER_AXIS_DEFAULTS = {
  cutoff: { min: 0, max: 1, step: 0, label: "Freq" },
  resonance: { min: 0, max: 1, step: 0, label: "Res" }
};
function resolveFilterAxis(axis, hand) {
  const base = FILTER_AXIS_DEFAULTS[hand];
  return {
    min: axis?.min ?? base.min,
    max: axis?.max ?? base.max,
    step: axis?.step ?? base.step,
    label: axis?.label ?? base.label,
    formatValue: axis?.formatValue
  };
}
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var snap = (v, axis) => {
  let out = clamp(Number.isFinite(v) ? v : axis.min, axis.min, axis.max);
  if (axis.step > 0) out = clamp(axis.min + Math.round((out - axis.min) / axis.step) * axis.step, axis.min, axis.max);
  return Number(out.toFixed(6));
};
function normalizeFilterValue(value, cutoffAxis, resonanceAxis) {
  const v = typeof value === "object" && value !== null ? value : {};
  return {
    cutoff: snap(typeof v.cutoff === "number" ? v.cutoff : cutoffAxis.max, cutoffAxis),
    resonance: snap(typeof v.resonance === "number" ? v.resonance : resonanceAxis.min, resonanceAxis)
  };
}
var filterHand01 = (v, axis) => {
  const n = (v - axis.min) / (axis.max - axis.min || 1);
  return clamp(Number.isFinite(n) ? n : 0, 0, 1);
};
var filterHandValue = (v01, axis) => snap(axis.min + clamp(v01, 0, 1) * (axis.max - axis.min), axis);
function filterShapeResponse(type, cutoff01, resonance01) {
  const fc = Math.pow(10, -3 + 3 * clamp(cutoff01, 0, 1));
  const q = 0.707 * Math.pow(14, clamp(resonance01, 0, 1));
  const a = Math.pow(10, clamp(resonance01, 0, 1) * 18 / 40);
  return (t) => {
    const f = Math.pow(10, -3 + 3 * clamp(t, 0, 1));
    const w = f / fc;
    const w2 = w * w;
    const den = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / q, 2));
    let mag;
    switch (type) {
      case "highpass":
        mag = w2 / den;
        break;
      case "bandpass":
        mag = w / q / den;
        break;
      case "notch":
        mag = Math.abs(1 - w2) / den;
        break;
      case "peak":
        mag = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w * a / q, 2)) / Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / (a * q), 2));
        break;
      default:
        mag = 1 / den;
    }
    return Math.min((20 * Math.log10(Math.max(mag, 1e-6)) + FILTER_DB_FLOOR) / (FILTER_DB_FLOOR + FILTER_DB_CEIL), 1);
  };
}
function defaultFilterResponse(cutoff01, resonance01) {
  return filterShapeResponse("lowpass", cutoff01, resonance01);
}
var FILTER_DB_FLOOR = 36;
var FILTER_DB_CEIL = 24;
var FILTER_SHAPE_SAMPLES = 96;
function filterResponsePath(response, samples = FILTER_SHAPE_SAMPLES) {
  const pts = [];
  for (let i = 0; i < samples; i++) {
    let y;
    try {
      y = response(i / (samples - 1));
    } catch {
      return null;
    }
    if (!Number.isFinite(y)) return null;
    pts.push(Math.min(1, Math.max(-1, y)));
  }
  return pts.map((y, i) => `${i ? "L" : "M"} ${(i / (samples - 1) * 100).toFixed(2)} ${((1 - y) * 100).toFixed(2)}`).join(" ");
}
export {
  FILTER_AXIS_DEFAULTS,
  FILTER_DB_CEIL,
  FILTER_DB_FLOOR,
  FILTER_SHAPE_SAMPLES,
  defaultFilterResponse,
  filterHand01,
  filterHandValue,
  filterResponsePath,
  filterShapeResponse,
  normalizeFilterValue,
  resolveFilterAxis
};
//# sourceMappingURL=filter-core.js.map