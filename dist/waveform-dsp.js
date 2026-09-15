// src/waveform-dsp.ts
function mixToMono(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const len = buffer.length;
  const out = new Float32Array(len);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) out[i] += data[i] / buffer.numberOfChannels;
  }
  return out;
}
function fillPeaks(data, cols, min, max) {
  const step = data.length / cols;
  for (let x = 0; x < cols; x++) {
    const start = Math.floor(x * step);
    const end = Math.max(start + 1, Math.min(data.length, Math.floor((x + 1) * step)));
    let mn = 1;
    let mx = -1;
    for (let i = start; i < end; i++) {
      const v = data[i];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    min[x] = mn;
    max[x] = mx;
  }
}
function barPeaks(p, cols, pitch) {
  const step = Math.max(1, Math.round(pitch));
  const out = [];
  for (let x = 0; x < cols; x += step) {
    let mn = 1;
    let mx = -1;
    for (let i = x; i < x + step && i < cols; i++) {
      if (p.min[i] < mn) mn = p.min[i];
      if (p.max[i] > mx) mx = p.max[i];
    }
    out.push({ x, min: mn, max: mx });
  }
  return out;
}
function sampleEnvelope(data, from, to, seg) {
  const out = [];
  if (!data.length || !(seg > 0)) return out;
  const k0 = Math.max(0, Math.floor(from / seg));
  const k1 = Math.min(Math.ceil(data.length / seg), Math.ceil(to / seg));
  for (let k = k0; k <= k1; k++) {
    const pos = Math.min(data.length, k * seg);
    const start = Math.max(0, Math.floor((k - 0.5) * seg));
    const end = Math.max(start + 1, Math.min(data.length, Math.floor((k + 0.5) * seg)));
    let a = 0;
    for (let i = start; i < end && i < data.length; i++) {
      const m = Math.abs(data[i]);
      if (m > a) a = m;
    }
    out.push({ pos, amp: a });
  }
  return out;
}
function envelope(p, cols, n) {
  const out = new Array(n);
  const seg = cols / n;
  for (let k = 0; k < n; k++) {
    const start = Math.floor(k * seg);
    const end = Math.max(start + 1, Math.min(cols, Math.floor((k + 1) * seg)));
    let a = 0;
    for (let x = start; x < end; x++) {
      const m = Math.max(Math.abs(p.min[x]), Math.abs(p.max[x]));
      if (m > a) a = m;
    }
    out[k] = a;
  }
  return out;
}
export {
  barPeaks,
  envelope,
  fillPeaks,
  mixToMono,
  sampleEnvelope
};
//# sourceMappingURL=waveform-dsp.js.map