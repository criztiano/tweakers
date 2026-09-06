// src/transfer-core.ts
var DEFAULT_TRANSFER = { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] };
var TRANSFER_MIN_GAP = 0.02;
var TRANSFER_MAX_POINTS = 12;
var clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
var finite = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
function normalizeTransfer(value) {
  const raw = value?.points;
  if (!Array.isArray(raw) || raw.length < 2) return { points: DEFAULT_TRANSFER.points.map((p) => ({ ...p })) };
  const points = raw.map((p) => ({ x: clamp01(finite(p?.x, 0)), y: clamp01(finite(p?.y, 0)) })).sort((a, b) => a.x - b.x);
  points[0].x = 0;
  points[points.length - 1].x = 1;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (points[i].x - out[out.length - 1].x < TRANSFER_MIN_GAP) continue;
    if (1 - points[i].x < TRANSFER_MIN_GAP) continue;
    out.push(points[i]);
  }
  out.push(points[points.length - 1]);
  return { points: out.slice(0, TRANSFER_MAX_POINTS) };
}
function tangents(points) {
  const n = points.length;
  const secant = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    secant[i] = dx > 0 ? (points[i + 1].y - points[i].y) / dx : 0;
  }
  const m = new Array(n);
  m[0] = secant[0];
  m[n - 1] = secant[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = secant[i - 1] * secant[i] <= 0 ? 0 : (secant[i - 1] + secant[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (secant[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / secant[i];
    const b = m[i + 1] / secant[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      m[i] = 3 / h * a * secant[i];
      m[i + 1] = 3 / h * b * secant[i];
    }
  }
  return m;
}
function sampleTransfer(points, x) {
  if (!points.length) return clamp01(x);
  if (points.length === 1) return points[0].y;
  const t = clamp01(finite(x, 0));
  if (t <= points[0].x) return points[0].y;
  const last = points[points.length - 1];
  if (t >= last.x) return last.y;
  let i = 0;
  while (i < points.length - 2 && points[i + 1].x < t) i++;
  const p0 = points[i], p1 = points[i + 1];
  const h = p1.x - p0.x;
  if (h <= 0) return p1.y;
  const m = tangents(points);
  const s = (t - p0.x) / h;
  const s2 = s * s, s3 = s2 * s;
  return clamp01(
    (2 * s3 - 3 * s2 + 1) * p0.y + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * p1.y + (s3 - s2) * h * m[i + 1]
  );
}
function transferLut(points, size = 256) {
  const out = new Float32Array(size);
  for (let i = 0; i < size; i++) out[i] = sampleTransfer(points, size === 1 ? 0 : i / (size - 1));
  return out;
}
function insertPoint(points, x, y) {
  const next = normalizeTransfer({ points: [...points, { x: clamp01(x), y: clamp01(y) }] }).points;
  const index = next.findIndex((p) => Math.abs(p.x - clamp01(x)) < 1e-9);
  return { points: next, index: index < 0 ? 0 : index };
}
function removePoint(points, index) {
  if (index <= 0 || index >= points.length - 1) return points;
  return points.filter((_, i) => i !== index);
}
function movePoint(points, index, x, y) {
  if (index < 0 || index >= points.length) return points;
  const out = points.map((p) => ({ ...p }));
  const ny = clamp01(finite(y, 0));
  if (index === 0 || index === points.length - 1) {
    out[index].y = ny;
    return out;
  }
  const lo = out[index - 1].x + TRANSFER_MIN_GAP;
  const hi = out[index + 1].x - TRANSFER_MIN_GAP;
  out[index] = { x: hi < lo ? out[index].x : Math.min(hi, Math.max(lo, clamp01(finite(x, 0)))), y: ny };
  return out;
}
function nearestPoint(points, x, y, tolerance) {
  let best = -1, bestD = tolerance;
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - x, points[i].y - y);
    if (d <= bestD) {
      best = i;
      bestD = d;
    }
  }
  return best;
}
function isIdentityTransfer(points) {
  return points.length === 2 && points[0].x === 0 && points[0].y === 0 && points[1].x === 1 && points[1].y === 1;
}
export {
  DEFAULT_TRANSFER,
  TRANSFER_MAX_POINTS,
  TRANSFER_MIN_GAP,
  insertPoint,
  isIdentityTransfer,
  movePoint,
  nearestPoint,
  normalizeTransfer,
  removePoint,
  sampleTransfer,
  transferLut
};
//# sourceMappingURL=transfer-core.js.map