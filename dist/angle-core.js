// src/angle-core.ts
var ANGLE_DEAD_ZONE_PX = 4;
function decimalsForStep(step) {
  const s = String(step);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}
function snapAngle(value, min, step) {
  if (!(step > 0)) return value;
  return parseFloat((min + Math.round((value - min) / step) * step).toFixed(decimalsForStep(step)));
}
function normalizeAngle(value, min, max, wrap) {
  const span = max - min;
  if (!wrap || span <= 0) return Math.min(max, Math.max(min, value));
  const t = ((value - min) % span + span) % span;
  return min + t;
}
function valueToBearing(value, min, max) {
  const span = max - min || 1;
  return (value - min) / span * 360;
}
function bearingToValue(bearing, min, max) {
  const span = max - min || 1;
  return min + (bearing % 360 + 360) % 360 / 360 * span;
}
function angleFromPointer(dx, dy, current, min, max, step, wrap) {
  if (Math.hypot(dx, dy) < ANGLE_DEAD_ZONE_PX) return null;
  const bearing = Math.atan2(dx, -dy) * 180 / Math.PI;
  let value = bearingToValue(bearing, min, max);
  if (wrap) {
    const span = max - min;
    while (value - current > span / 2) value -= span;
    while (current - value > span / 2) value += span;
  }
  return normalizeAngle(snapAngle(value, min, step), min, max, wrap);
}
function nudgeAngle(value, delta, min, max, step, wrap) {
  return normalizeAngle(snapAngle(value + delta * (step || 1), min, step), min, max, wrap);
}
function arcPath(from, to, radius, cx = 0, cy = 0) {
  const point = (deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return `${(cx + radius * Math.cos(rad)).toFixed(3)} ${(cy + radius * Math.sin(rad)).toFixed(3)}`;
  };
  const delta = to - from;
  if (Math.abs(delta) < 0.01) return "";
  if (Math.abs(delta) >= 359.99) {
    return `M ${point(from)} A ${radius} ${radius} 0 0 1 ${point(from + 180)} A ${radius} ${radius} 0 0 1 ${point(from + 359.99)}`;
  }
  return `M ${point(from)} A ${radius} ${radius} 0 ${Math.abs(delta) > 180 ? 1 : 0} ${delta > 0 ? 1 : 0} ${point(to)}`;
}
export {
  ANGLE_DEAD_ZONE_PX,
  angleFromPointer,
  arcPath,
  bearingToValue,
  normalizeAngle,
  nudgeAngle,
  snapAngle,
  valueToBearing
};
//# sourceMappingURL=angle-core.js.map