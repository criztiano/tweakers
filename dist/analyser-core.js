// src/analyser-core.ts
function byteFreqToUnit(v) {
  return v / 255;
}
function byteTimeToUnit(v) {
  return (v - 128) / 128;
}
function binRange(point, points, bins, scale, loBin = 1, hiBin = bins) {
  if (bins <= 2) return { start: Math.max(0, bins - 1), end: Math.max(1, bins) };
  const lo = Math.max(1, Math.min(bins - 1, loBin));
  const hi = Math.max(lo + 1, Math.min(bins, hiBin));
  const at = (t) => scale === "log" ? lo * Math.pow(hi / lo, t) : lo + (hi - lo) * t;
  let start = Math.floor(at(point / points));
  start = Math.max(lo, Math.min(hi - 1, start));
  const end = Math.max(start + 1, Math.min(hi, Math.floor(at((point + 1) / points))));
  return { start, end };
}
function hzWindowToBins(rangeHz, nyquistHz, bins) {
  const [loHz, hiHz] = rangeHz;
  if (!Number.isFinite(loHz) || !Number.isFinite(hiHz) || !(nyquistHz > 0) || bins <= 2) return null;
  if (!(hiHz > loHz) || hiHz <= 0) return null;
  const toBin = (hz) => hz / nyquistHz * bins;
  const loBin = Math.max(1, Math.min(bins - 1, toBin(Math.max(0, loHz))));
  const hiBin = Math.max(loBin + 1, Math.min(bins, toBin(hiHz)));
  return { loBin, hiBin };
}
function markerT(bin, scale, loBin, hiBin) {
  if (!Number.isFinite(bin) || !(hiBin > loBin) || loBin <= 0) return null;
  const t = scale === "log" ? Math.log(bin / loBin) / Math.log(hiBin / loBin) : (bin - loBin) / (hiBin - loBin);
  return t >= 0 && t <= 1 && Number.isFinite(t) ? t : null;
}
function fillFrequencyTargets(data, out, scale, loBin = 1, hiBin = data.length) {
  const points = out.length;
  for (let i = 0; i < points; i++) {
    const { start, end } = binRange(i, points, data.length, scale, loBin, hiBin);
    let mx = 0;
    for (let b = start; b < end; b++) {
      if (data[b] > mx) mx = data[b];
    }
    out[i] = byteFreqToUnit(mx);
  }
}
function fillWaveformMinMax(data, cols, min, max) {
  const step = data.length / cols;
  for (let x = 0; x < cols; x++) {
    const start = Math.floor(x * step);
    const end = Math.max(start + 1, Math.min(data.length, Math.floor((x + 1) * step)));
    let mn = 1;
    let mx = -1;
    for (let i = start; i < end; i++) {
      const v = byteTimeToUnit(data[i]);
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    min[x] = mn;
    max[x] = mx;
  }
}
function resampleWaveform(data, out) {
  const n = out.length;
  if (!n) return;
  if (!data.length) {
    out.fill(0);
    return;
  }
  if (n === 1 || data.length === 1) {
    out.fill(byteTimeToUnit(data[0]));
    return;
  }
  const step = (data.length - 1) / (n - 1);
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const j = Math.floor(x);
    const a = byteTimeToUnit(data[j]);
    const b = byteTimeToUnit(data[Math.min(data.length - 1, j + 1)]);
    out[i] = a + (b - a) * (x - j);
  }
}
function risingZeroCross(data) {
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1] < 128 && data[i] >= 128) return i;
  }
  return 0;
}
function peakLevel(data) {
  let mx = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Math.abs(byteTimeToUnit(data[i]));
    if (v > mx) mx = v;
  }
  return mx;
}
function advanceSweep(history, head, prevLevel, level, dtCols) {
  const n = history.length;
  if (!n) return 0;
  const d = Math.min(dtCols, n);
  const next = head + d;
  for (let c = Math.floor(head) + 1; c <= Math.floor(next); c++) {
    const t = d > 0 ? (c - head) / d : 1;
    history[(c % n + n) % n] = prevLevel + (level - prevLevel) * t;
  }
  return (next % n + n) % n;
}
var SPRING_MAX_STEP = 1 / 240;
function stepSprings(pos, vel, targets, stiffness, damping, dt) {
  let remaining = dt;
  while (remaining > 0) {
    const h = Math.min(remaining, SPRING_MAX_STEP);
    remaining -= h;
    for (let i = 0; i < pos.length; i++) {
      const accel = -stiffness * (pos[i] - targets[i]) - damping * vel[i];
      vel[i] += accel * h;
      pos[i] += vel[i] * h;
    }
  }
}
var SPRING_DEFAULT_STIFFNESS = 120;
var SPRING_DEFAULT_DAMPING = 14;
function normalizeSpring(spring) {
  if (!spring) return null;
  const raw = spring === true ? {} : spring;
  return {
    stiffness: Math.min(1e3, Math.max(1, raw.stiffness ?? SPRING_DEFAULT_STIFFNESS)),
    damping: Math.min(100, Math.max(1, raw.damping ?? SPRING_DEFAULT_DAMPING))
  };
}
function columnWidth(dpr, pixelSize) {
  return Math.max(1, Math.round(dpr) * Math.max(1, Math.round(pixelSize)));
}
function quantizeToGrid(v, colW) {
  return Math.round(v / colW) * colW;
}
export {
  SPRING_DEFAULT_DAMPING,
  SPRING_DEFAULT_STIFFNESS,
  advanceSweep,
  binRange,
  byteFreqToUnit,
  byteTimeToUnit,
  columnWidth,
  fillFrequencyTargets,
  fillWaveformMinMax,
  hzWindowToBins,
  markerT,
  normalizeSpring,
  peakLevel,
  quantizeToGrid,
  resampleWaveform,
  risingZeroCross,
  stepSprings
};
//# sourceMappingURL=analyser-core.js.map