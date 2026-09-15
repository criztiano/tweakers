// src/waveform-asset.ts
var WAVEFORM_BASE_BUCKET = 64;
function buildWaveformLevels(channels, base = WAVEFORM_BASE_BUCKET) {
  const length = channels[0]?.length ?? 0;
  const n = Math.max(1, Math.ceil(length / base));
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  const count = channels.length;
  for (let b = 0; b < n; b++) {
    const s0 = b * base;
    const s1 = Math.min(length, s0 + base);
    let mn = 1;
    let mx = -1;
    for (let i = s0; i < s1; i++) {
      let v = 0;
      for (let c = 0; c < count; c++) v += channels[c][i];
      v /= count;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (s1 <= s0) mn = mx = 0;
    min[b] = mn;
    max[b] = mx;
  }
  const levels = [{ bucket: base, min, max }];
  for (let prev = levels[0]; prev.min.length > 1; ) {
    const m = Math.ceil(prev.min.length / 2);
    const next = { bucket: prev.bucket * 2, min: new Float32Array(m), max: new Float32Array(m) };
    for (let i = 0; i < m; i++) {
      const j = 2 * i + 1 < prev.min.length ? 2 * i + 1 : 2 * i;
      next.min[i] = Math.min(prev.min[2 * i], prev.min[j]);
      next.max[i] = Math.max(prev.max[2 * i], prev.max[j]);
    }
    levels.push(next);
    prev = next;
  }
  return levels;
}
function mixRange(channels, start, end) {
  const out = new Float32Array(Math.max(0, end - start));
  for (const channel of channels) {
    for (let i = 0; i < out.length; i++) out[i] += channel[start + i] / channels.length;
  }
  return out;
}
function waveformAssetFromBuffer(buffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  return waveformAsset(buildWaveformLevels(channels), buffer.sampleRate, buffer.length, channels);
}
function waveformAsset(levels, sampleRate, length, channels) {
  return {
    sampleRate,
    length,
    duration: length / sampleRate,
    levels,
    samples: channels?.length ? (start, end) => {
      const s0 = Math.max(0, Math.min(length, Math.floor(start)));
      const s1 = Math.max(s0, Math.min(length, Math.ceil(end)));
      return channels.length === 1 ? channels[0].subarray(s0, s1) : mixRange(channels, s0, s1);
    } : void 0
  };
}
function rangesDuration(ranges) {
  let total = 0;
  for (const r of ranges) total += Math.max(0, r.end - r.start);
  return total;
}
function playedRanges(asset, ranges) {
  return ranges ?? [{ start: 0, end: asset.duration }];
}
function spanPeak(asset, s0, s1, out) {
  const span = s1 - s0;
  if (span <= 0) return;
  const levels = asset.levels;
  if (span < levels[0].bucket && asset.samples) {
    const data = asset.samples(s0, s1);
    if (data) {
      let mn2 = out[0];
      let mx2 = out[1];
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v < mn2) mn2 = v;
        if (v > mx2) mx2 = v;
      }
      out[0] = mn2;
      out[1] = mx2;
      return;
    }
  }
  let k = 0;
  while (k + 1 < levels.length && levels[k + 1].bucket * 4 <= span) k++;
  const level = levels[k];
  const b0 = Math.floor(s0 / level.bucket);
  const b1 = Math.min(level.min.length, Math.max(b0 + 1, Math.ceil(s1 / level.bucket)));
  let mn = out[0];
  let mx = out[1];
  for (let b = b0; b < b1; b++) {
    if (level.min[b] < mn) mn = level.min[b];
    if (level.max[b] > mx) mx = level.max[b];
  }
  out[0] = mn;
  out[1] = mx;
}
var FRAME_EPSILON = 1e-6;
function fillRangePeaks(asset, ranges, t0, t1, cols, min, max) {
  const sr = asset.sampleRate;
  const step = (t1 - t0) / Math.max(1, cols);
  const out = [1, -1];
  let r = 0;
  let base = 0;
  for (let x = 0; x < cols; x++) {
    const c0 = t0 + x * step;
    const c1 = c0 + step;
    while (r < ranges.length && base + (ranges[r].end - ranges[r].start) <= c0) {
      base += ranges[r].end - ranges[r].start;
      r++;
    }
    out[0] = 1;
    out[1] = -1;
    let at = base;
    for (let i = r; i < ranges.length && at < c1; i++) {
      const len = ranges[i].end - ranges[i].start;
      const a = Math.max(c0, at);
      const b = Math.min(c1, at + len);
      if (b > a) {
        const s0 = Math.floor((ranges[i].start + (a - at)) * sr + FRAME_EPSILON);
        const s1 = Math.min(asset.length, Math.max(s0 + 1, Math.ceil((ranges[i].start + (b - at)) * sr - FRAME_EPSILON)));
        if (s0 < asset.length) spanPeak(asset, s0, s1, out);
      }
      at += len;
    }
    if (out[0] > out[1]) out[0] = out[1] = 0;
    min[x] = out[0];
    max[x] = out[1];
  }
}
function rangeEnvelope(asset, ranges, t0, t1, seg) {
  const played = rangesDuration(ranges);
  if (!(seg > 0) || played <= 0) return [];
  const k0 = Math.max(0, Math.floor(t0 / seg));
  const k1 = Math.min(Math.ceil(played / seg), Math.ceil(t1 / seg));
  const n = k1 - k0 + 1;
  if (n < 1) return [];
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  fillRangePeaks(asset, ranges, (k0 - 0.5) * seg, (k1 + 0.5) * seg, n, min, max);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ t: Math.min(played, (k0 + i) * seg), amp: Math.max(Math.abs(min[i]), Math.abs(max[i])) });
  }
  return out;
}
export {
  WAVEFORM_BASE_BUCKET,
  buildWaveformLevels,
  fillRangePeaks,
  mixRange,
  playedRanges,
  rangeEnvelope,
  rangesDuration,
  waveformAsset,
  waveformAssetFromBuffer
};
//# sourceMappingURL=waveform-asset.js.map