import { describe, expect, it } from 'vitest';
import { moveWheelRows } from './move-wheel';

describe('moveWheelRows', () => {
  it('walks one row for a burst an ordinary turn lands', () => {
    for (const d of [1, 2, 3]) {
      expect(moveWheelRows(d)).toBe(1);
      expect(moveWheelRows(-d)).toBe(-1);
    }
  });

  it('lets a real spin still fly, short by the slack', () => {
    expect(moveWheelRows(4)).toBe(2);
    expect(moveWheelRows(-12)).toBe(-10);
  });

  it('never moves on nothing and never stalls on a fraction', () => {
    expect(moveWheelRows(0)).toBe(0);
    expect(moveWheelRows(0.3)).toBe(1);
    expect(moveWheelRows(-0.3)).toBe(-1);
  });
});
