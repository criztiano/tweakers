import { describe, it, expect } from 'vitest';
import {
  buildWaveformLevels,
  fillRangePeaks,
  rangesDuration,
  waveformAsset,
  WAVEFORM_BASE_BUCKET,
} from '../src/waveform-asset';
import { fillPeaks } from '../src/waveform-dsp';

// A deterministic, sign-changing signal whose peaks differ bucket to bucket.
function signal(length: number, seed = 3): Float32Array {
  const out = new Float32Array(length);
  let s = seed;
  for (let i = 0; i < length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out[i] = Math.round(((s / 0x7fffffff) * 2 - 1) * 64) / 64;
  }
  return out;
}

describe('buildWaveformLevels', () => {
  it('folds the mono mix into a ladder whose rungs double', () => {
    const left = signal(1000, 1);
    const right = signal(1000, 2);
    const levels = buildWaveformLevels([left, right], 8);
    expect(levels[0].bucket).toBe(8);
    expect(levels[0].min.length).toBe(125);
    expect(levels[1].bucket).toBe(16);
    expect(levels.at(-1)!.min.length).toBe(1);
    // The top rung is the peak of the whole mix.
    let mn = 1;
    let mx = -1;
    for (let i = 0; i < 1000; i++) {
      const v = (left[i] + right[i]) / 2;
      mn = Math.min(mn, v);
      mx = Math.max(mx, v);
    }
    expect(levels.at(-1)!.min[0]).toBeCloseTo(mn, 6);
    expect(levels.at(-1)!.max[0]).toBeCloseTo(mx, 6);
  });
});

describe('fillRangePeaks', () => {
  const rate = 1000;
  const mono = signal(64 * 256);
  const levels = buildWaveformLevels([mono]);

  it('matches a full scan where columns fall on bucket boundaries', () => {
    const asset = waveformAsset(levels, rate, mono.length);
    const cols = 64;
    const min = new Float32Array(cols);
    const max = new Float32Array(cols);
    fillRangePeaks(asset, [{ start: 0, end: asset.duration }], 0, asset.duration, cols, min, max);
    const emin = new Float32Array(cols);
    const emax = new Float32Array(cols);
    fillPeaks(mono, cols, emin, emax);
    expect(Array.from(min)).toEqual(Array.from(emin));
    expect(Array.from(max)).toEqual(Array.from(emax));
  });

  it('reads samples directly below the finest rung', () => {
    const asset = waveformAsset(levels, rate, mono.length, [mono]);
    const cols = 10;
    const min = new Float32Array(cols);
    const max = new Float32Array(cols);
    // 100 frames over 10 columns: 10 frames each, finer than a 64-frame bucket.
    fillRangePeaks(asset, [{ start: 0, end: asset.duration }], 1, 1.1, cols, min, max);
    const emin = new Float32Array(cols);
    const emax = new Float32Array(cols);
    fillPeaks(mono.subarray(1000, 1100), cols, emin, emax);
    expect(Array.from(min)).toEqual(Array.from(emin));
    expect(Array.from(max)).toEqual(Array.from(emax));
  });

  it('plays the ranges back to back, as a trimmed copy would', () => {
    const asset = waveformAsset(levels, rate, mono.length, [mono]);
    const ranges = [
      { start: 0.512, end: 1.024 },
      { start: 4.096, end: 5.12 },
    ];
    const played = rangesDuration(ranges);
    expect(played).toBeCloseTo(1.536, 9);
    const copy = new Float32Array(Math.round(played * rate));
    copy.set(mono.subarray(512, 1024), 0);
    copy.set(mono.subarray(4096, 5120), 512);
    const cols = 24; // 64 frames a column, on bucket boundaries in both ranges
    const min = new Float32Array(cols);
    const max = new Float32Array(cols);
    fillRangePeaks(asset, ranges, 0, played, cols, min, max);
    const emin = new Float32Array(cols);
    const emax = new Float32Array(cols);
    fillPeaks(copy, cols, emin, emax);
    expect(Array.from(min)).toEqual(Array.from(emin));
    expect(Array.from(max)).toEqual(Array.from(emax));
  });

  it('reads past the end as silence', () => {
    const asset = waveformAsset(levels, rate, mono.length);
    const min = new Float32Array(2).fill(9);
    const max = new Float32Array(2).fill(9);
    fillRangePeaks(asset, [{ start: 0, end: asset.duration }], asset.duration, asset.duration + 1, 2, min, max);
    expect(Array.from(min)).toEqual([0, 0]);
    expect(Array.from(max)).toEqual([0, 0]);
  });

  it('keeps a column’s cost to buckets, not samples', () => {
    const long = waveformAsset(buildWaveformLevels([signal(48000 * 60)]), 48000, 48000 * 60);
    let reads = 0;
    const counted = { ...long, samples: () => { reads++; return null; } };
    const min = new Float32Array(1200);
    const max = new Float32Array(1200);
    fillRangePeaks(counted, [{ start: 0, end: 60 }], 0, 60, 1200, min, max);
    expect(reads).toBe(0);
    expect(WAVEFORM_BASE_BUCKET).toBe(64);
  });
});
