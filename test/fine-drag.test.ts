import { describe, it, expect } from 'vitest';
import { fineDragValue } from '../src/shortcut-utils';

// Shift-fine dragging: while a drag is in progress, shift switches pointer
// travel to a 0.1× RELATIVE delta from the value where shift went down. The
// component rebases the anchor on every shift transition, so these tests pin
// both the scaling math and the no-jump rebase property.

describe('fineDragValue', () => {
  it('applies pointer travel at 0.1× by default', () => {
    // 50px of travel on a 100px track over 0..1 is 0.5 absolute — fine mode
    // turns it into a 0.05 creep.
    expect(
      fineDragValue({ startValue: 0.5, startPos: 0, pos: 50, extentPx: 100, min: 0, max: 1 })
    ).toBeCloseTo(0.55, 10);
  });

  it('scales to the track extent and value range', () => {
    expect(
      fineDragValue({ startValue: 100, startPos: 20, pos: 220, extentPx: 400, min: 0, max: 200, factor: 0.1 })
    ).toBeCloseTo(110, 10);
  });

  it('moves backwards for negative travel', () => {
    expect(
      fineDragValue({ startValue: 0.5, startPos: 100, pos: 60, extentPx: 100, min: 0, max: 1 })
    ).toBeCloseTo(0.46, 10);
  });

  it('clamps to the bounds', () => {
    expect(
      fineDragValue({ startValue: 0.99, startPos: 0, pos: 5000, extentPx: 100, min: 0, max: 1 })
    ).toBe(1);
    expect(
      fineDragValue({ startValue: 0.01, startPos: 0, pos: -5000, extentPx: 100, min: 0, max: 1 })
    ).toBe(0);
  });

  it('returns the anchor value exactly at the anchor position (no jump on rebase)', () => {
    // A shift press/release rebases the anchor at the current value + pointer;
    // the very next sample at that same pointer must reproduce the value.
    expect(
      fineDragValue({ startValue: 0.371, startPos: 42, pos: 42, extentPx: 100, min: 0, max: 1 })
    ).toBe(0.371);
    expect(
      fineDragValue({ startValue: 0.371, startPos: 42, pos: 42, extentPx: 100, min: 0, max: 1, factor: 1 })
    ).toBe(0.371);
  });

  it('factor 1 tracks at full rate (post-release relative tracking)', () => {
    expect(
      fineDragValue({ startValue: 0.2, startPos: 0, pos: 30, extentPx: 100, min: 0, max: 1, factor: 1 })
    ).toBeCloseTo(0.5, 10);
  });

  it('guards a zero-width track (no NaN, still clamped)', () => {
    const v = fineDragValue({ startValue: 0.5, startPos: 0, pos: 10, extentPx: 0, min: 0, max: 1 });
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });
});
