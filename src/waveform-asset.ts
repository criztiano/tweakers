// A decoded sample as the waveform draws it: min/max peaks at a ladder of
// resolutions, computed once, so a frame reads a few buckets per column rather
// than every sample in the window. DOM-free — the peaks are plain typed arrays,
// built in a worker if the host likes, and posted across as they are.

/** One rung of the ladder: the min and max of every `bucket` samples. */
export type WaveformLevel = { bucket: number; min: Float32Array; max: Float32Array };

/**
 * An immutable sample for the waveform. The peaks cover the whole mono mix;
 * `samples`, when there is one, reads the mix itself for zooms finer than the
 * finest rung — a short window, so reading it per frame stays cheap.
 */
export interface WaveformAsset {
  sampleRate: number;
  /** Frames in the sample. */
  length: number;
  /** Seconds. */
  duration: number;
  /** Finest first; each rung's bucket is twice the one before. */
  levels: WaveformLevel[];
  /** The mono mix over frames [start, end), or null when only the peaks are kept. */
  samples?: (start: number, end: number) => Float32Array | null;
}

/** A retained stretch of the source, in its seconds. The waveform plays the stretches back to back. */
export type WaveformRange = { start: number; end: number };

/** The finest rung. Below it, the samples are read directly. */
export const WAVEFORM_BASE_BUCKET = 64;

/**
 * The peak ladder of the channels' mono mix. Nothing full-length is allocated
 * beyond the finest rung: the mix is folded into buckets as it is read.
 */
export function buildWaveformLevels(channels: Float32Array[], base = WAVEFORM_BASE_BUCKET): WaveformLevel[] {
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
  const levels: WaveformLevel[] = [{ bucket: base, min, max }];
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

/** The mono mix of `channels` over [start, end). */
export function mixRange(channels: Float32Array[], start: number, end: number): Float32Array {
  const out = new Float32Array(Math.max(0, end - start));
  for (const channel of channels) {
    for (let i = 0; i < out.length; i++) out[i] += channel[start + i] / channels.length;
  }
  return out;
}

/** An asset over an AudioBuffer (or anything shaped like one): peaks built here, samples read from it. */
export function waveformAssetFromBuffer(buffer: AudioBuffer): WaveformAsset {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  return waveformAsset(buildWaveformLevels(channels), buffer.sampleRate, buffer.length, channels);
}

/** An asset from peaks built elsewhere (a worker), reading fine detail from `channels` when given. */
export function waveformAsset(
  levels: WaveformLevel[],
  sampleRate: number,
  length: number,
  channels?: Float32Array[] | null
): WaveformAsset {
  return {
    sampleRate,
    length,
    duration: length / sampleRate,
    levels,
    samples: channels?.length
      ? (start, end) => {
          const s0 = Math.max(0, Math.min(length, Math.floor(start)));
          const s1 = Math.max(s0, Math.min(length, Math.ceil(end)));
          return channels.length === 1 ? channels[0].subarray(s0, s1) : mixRange(channels, s0, s1);
        }
      : undefined,
  };
}

/** The ranges' total, in seconds — the length of the sample as it plays. */
export function rangesDuration(ranges: WaveformRange[]): number {
  let total = 0;
  for (const r of ranges) total += Math.max(0, r.end - r.start);
  return total;
}

/** The ranges an asset plays: the given ones, or the whole of it. */
export function playedRanges(asset: WaveformAsset, ranges?: WaveformRange[] | null): WaveformRange[] {
  return ranges ?? [{ start: 0, end: asset.duration }];
}

/**
 * Min/max of the frames [s0, s1) from the coarsest rung whose buckets sit
 * well inside the span — or from the samples, when the span is finer than the
 * finest rung and the asset can read them. Writes into `out` as [min, max].
 */
function spanPeak(asset: WaveformAsset, s0: number, s1: number, out: [number, number]) {
  const span = s1 - s0;
  if (span <= 0) return;
  const levels = asset.levels;
  if (span < levels[0].bucket && asset.samples) {
    const data = asset.samples(s0, s1);
    if (data) {
      let mn = out[0];
      let mx = out[1];
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      out[0] = mn;
      out[1] = mx;
      return;
    }
  }
  // A rung whose buckets are a quarter of the span or finer: the buckets
  // straddling the edges then add little beyond the column's own frames.
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

const FRAME_EPSILON = 1e-6;

/**
 * Per-column peaks over the played time [t0, t1) seconds, where played time
 * runs through `ranges` back to back. Columns with nothing under them read
 * as silence. The cost follows the columns, never the samples on screen.
 */
export function fillRangePeaks(
  asset: WaveformAsset,
  ranges: WaveformRange[],
  t0: number,
  t1: number,
  cols: number,
  min: Float32Array,
  max: Float32Array
) {
  const sr = asset.sampleRate;
  const step = (t1 - t0) / Math.max(1, cols);
  const out: [number, number] = [1, -1];
  // Walk the ranges alongside the columns: `r` is the range holding the
  // column's start, `base` the played time where that range begins.
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
        // Frame edges tolerate float drift: 0.256 s × 1000 is 255.99999…
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

/**
 * A simplified symmetric envelope pinned to played time rather than the view:
 * point `k` sits at `k * seg` seconds and reads the peak amplitude over the
 * `seg` seconds centred on it. The points covering [t0, t1] come back with
 * their times, so a window sliding along shows the same shape moving, never
 * a reshaped one.
 */
export function rangeEnvelope(
  asset: WaveformAsset,
  ranges: WaveformRange[],
  t0: number,
  t1: number,
  seg: number
): { t: number; amp: number }[] {
  const played = rangesDuration(ranges);
  if (!(seg > 0) || played <= 0) return [];
  const k0 = Math.max(0, Math.floor(t0 / seg));
  const k1 = Math.min(Math.ceil(played / seg), Math.ceil(t1 / seg));
  const n = k1 - k0 + 1;
  if (n < 1) return [];
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  fillRangePeaks(asset, ranges, (k0 - 0.5) * seg, (k1 + 0.5) * seg, n, min, max);
  const out: { t: number; amp: number }[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ t: Math.min(played, (k0 + i) * seg), amp: Math.max(Math.abs(min[i]), Math.abs(max[i])) });
  }
  return out;
}
