import { describe, expect, it } from 'vitest';
import {
  addPoint,
  AUTOMATION_COLOR_MAX,
  AUTOMATION_TOLERANCE,
  clearRange,
  colorDistance,
  createLane,
  deletePoint,
  mergeSpan,
  mixColor,
  movePoint,
  packColor,
  remapKeys,
  removeLane,
  sampleTimeline,
  simplify,
  smooth,
  splitAtWrap,
  unpackColor,
  upsertLane,
  validateTimeline,
  valueAt,
  valueBefore,
  type AutomationLane,
  type AutomationPoint,
} from '../src/automation-core';

// The pure core of automation lanes: how a lane reads, and every edit that
// returns a new one.

const lane = (points: AutomationPoint[], extra: Partial<AutomationLane> = {}): AutomationLane => ({
  key: 'chaos',
  label: 'Chaos',
  min: 0,
  max: 10,
  interp: 'linear',
  points,
  ...extra,
});

describe('reading a lane', () => {
  it('runs straight between points and stays at the end values outside them', () => {
    const l = lane([{ t: 0.2, v: 2 }, { t: 0.6, v: 6 }]);
    expect(valueAt(l, 0)).toBe(2);
    expect(valueAt(l, 0.4)).toBeCloseTo(4, 9);
    expect(valueAt(l, 1)).toBe(6);
  });

  it('takes the later value at a jump, and the earlier one just before it', () => {
    const l = lane([{ t: 0, v: 1 }, { t: 0.5, v: 1 }, { t: 0.5, v: 9 }, { t: 1, v: 9 }]);
    expect(valueAt(l, 0.5)).toBe(9);
    expect(valueAt(l, 0.4999)).toBeCloseTo(1, 9);
    expect(valueBefore(l, 0.5)).toBe(1);
  });

  it('holds until the next point on a hold lane', () => {
    const l = lane([{ t: 0, v: 1 }, { t: 0.5, v: 5 }], { interp: 'hold' });
    expect(valueAt(l, 0.49)).toBe(1);
    expect(valueAt(l, 0.5)).toBe(5);
  });

  it('reads the same through a cursor, playing forward and after a jump back', () => {
    const points = Array.from({ length: 50 }, (_, i) => ({ t: i / 49, v: (i * 7) % 10 }));
    const l = lane(points);
    const cursor = { index: 0 };
    for (let k = 0; k <= 300; k++) {
      const t = k / 300;
      expect(valueAt(l, t, cursor)).toBeCloseTo(valueAt(l, t), 9);
    }
    expect(valueAt(l, 0.1, cursor)).toBeCloseTo(valueAt(l, 0.1), 9);
  });

  it('a new lane holds its base for the whole pass, clamped to its range', () => {
    const l = createLane('k', 'K', 0, 10, 12);
    expect(l.points).toEqual([{ t: 0, v: 10 }, { t: 1, v: 10 }]);
    expect(valueAt(l, 0.37)).toBe(10);
  });
});

describe('simplify', () => {
  it('keeps every point within the tolerance of the drawn curve, vertically', () => {
    const points = Array.from({ length: 400 }, (_, i) => {
      const t = i / 399;
      return { t, v: 5 + 4 * Math.sin(t * Math.PI * 4) };
    });
    const out = simplify(points, { min: 0, max: 10 }, 0.004);
    expect(out.length).toBeLessThan(points.length / 4);
    expect(out[0]).toEqual(points[0]);
    expect(out[out.length - 1]).toEqual(points[points.length - 1]);
    const simplified = lane(out);
    for (const p of points) expect(Math.abs(valueAt(simplified, p.t) - p.v) / 10).toBeLessThanOrEqual(0.004 + 1e-9);
  });

  it('never drops either side of a jump', () => {
    const points = [{ t: 0, v: 1 }, { t: 0.25, v: 1 }, { t: 0.5, v: 1 }, { t: 0.5, v: 8 }, { t: 0.75, v: 8 }, { t: 1, v: 8 }];
    expect(simplify(points, { min: 0, max: 10 })).toEqual([{ t: 0, v: 1 }, { t: 0.5, v: 1 }, { t: 0.5, v: 8 }, { t: 1, v: 8 }]);
  });
});

describe('overdub', () => {
  const ramp = lane([{ t: 0, v: 0 }, { t: 1, v: 10 }]);

  it('replaces only the written stretch, with straight jumps at its edges', () => {
    const merged = mergeSpan(ramp, { from: 0.4, to: 0.6, samples: [{ t: 0.4, v: 2 }, { t: 0.5, v: 3 }, { t: 0.6, v: 2 }] });
    for (const t of [0, 0.1, 0.3, 0.399, 0.6001, 0.8, 1]) {
      if (t < 0.4 || t > 0.6) expect(valueAt(merged, t)).toBeCloseTo(valueAt(ramp, t), 6);
    }
    expect(valueBefore(merged, 0.4)).toBeCloseTo(4, 9);
    expect(valueAt(merged, 0.4)).toBe(2);
    expect(valueAt(merged, 0.5)).toBe(3);
    expect(valueBefore(merged, 0.6)).toBe(2);
    expect(valueAt(merged, 0.6)).toBeCloseTo(6, 9);
  });

  it('carries the hand to both edges when its samples start late or end early', () => {
    const merged = mergeSpan(ramp, { from: 0.2, to: 0.8, samples: [{ t: 0.5, v: 7 }] });
    expect(valueAt(merged, 0.2)).toBe(7);
    expect(valueBefore(merged, 0.8)).toBe(7);
    expect(valueAt(merged, 0.9)).toBeCloseTo(9, 9);
  });

  it('a stretch over the end of the pass is two stretches', () => {
    expect(splitAtWrap(0.2, 0.7)).toEqual([{ from: 0.2, to: 0.7 }]);
    expect(splitAtWrap(0.8, 0.1)).toEqual([{ from: 0.8, to: 1 }, { from: 0, to: 0.1 }]);
  });
});

describe('editing', () => {
  const base = lane([{ t: 0, v: 0 }, { t: 0.3, v: 6 }, { t: 0.6, v: 2 }, { t: 1, v: 10 }]);

  it('clears a stretch to a straight run between where it enters and leaves', () => {
    const cleared = clearRange(base, 0.2, 0.8);
    expect(cleared.points.filter((p) => p.t > 0.2 && p.t < 0.8)).toEqual([]);
    expect(valueAt(cleared, 0.2)).toBeCloseTo(4, 9);
    expect(valueAt(cleared, 0.8)).toBeCloseTo(6, 9);
    expect(valueAt(cleared, 0.5)).toBeCloseTo(5, 9);
    expect(valueAt(cleared, 0.1)).toBeCloseTo(valueAt(base, 0.1), 9);
  });

  it('keeps a moved point between its neighbours and inside the range, and the ends on the ends', () => {
    expect(movePoint(base, 1, 0.9, 20).points[1]).toEqual({ t: 0.6, v: 10 });
    expect(movePoint(base, 2, 0.1, -3).points[2]).toEqual({ t: 0.3, v: 0 });
    expect(movePoint(base, 0, 0.5, 4).points[0]).toEqual({ t: 0, v: 4 });
    expect(movePoint(base, 3, 0.5, 4).points[3]).toEqual({ t: 1, v: 4 });
  });

  it('adds a point on the curve, and never deletes the last one', () => {
    const { lane: added, index } = addPoint(base, 0.45);
    expect(index).toBe(2);
    expect(added.points[2]).toEqual({ t: 0.45, v: valueAt(base, 0.45) });
    const single = lane([{ t: 0.5, v: 3 }]);
    expect(deletePoint(single, 0)).toBe(single);
    expect(deletePoint(base, 1).points).toHaveLength(3);
  });

  it('a smoothing pass flattens a jittery take into fewer points', () => {
    const points = Array.from({ length: 241 }, (_, i) => ({ t: i / 240, v: 5 + (i % 2 ? 1.5 : -1.5) + 2 * Math.sin((i / 240) * Math.PI * 2) }));
    const jittery = lane(points);
    const smoothed = smooth(jittery, 1);
    expect(smoothed.length).toBeLessThan(points.length / 4);
    const after = lane(smoothed);
    expect(Math.abs(valueAt(after, 0.5) - valueAt(after, 0.5 + 1 / 240))).toBeLessThan(0.2);
  });

  it('smoothing a stretch leaves the rest of the lane alone and meets it without a jump', () => {
    const steps = lane([{ t: 0, v: 0 }, { t: 0.5, v: 0 }, { t: 0.5, v: 10 }, { t: 1, v: 10 }]);
    const out = lane(smooth(steps, 1, { from: 0.3, to: 0.7 }));
    expect(valueAt(out, 0.1)).toBe(0);
    expect(valueAt(out, 0.9)).toBe(10);
    expect(valueAt(out, 0.3)).toBeCloseTo(0, 6);
    expect(valueAt(out, 0.7)).toBeCloseTo(10, 6);
    expect(valueAt(out, 0.5)).toBeGreaterThan(2);
    expect(valueAt(out, 0.5)).toBeLessThan(8);
  });
});

describe('timelines', () => {
  it('upserts, removes, samples and renames lanes', () => {
    const a = createLane('in:a', 'A', 0, 1, 0.25);
    const b = createLane('in:b', 'B', 0, 1, 0.75);
    let tl = upsertLane(upsertLane({ lanes: [] }, a), b);
    tl = upsertLane(tl, { ...a, label: 'A2' });
    expect(tl.lanes.map((l) => l.label)).toEqual(['A2', 'B']);
    expect(sampleTimeline(tl, 0.5)).toEqual(new Map([['in:a', 0.25], ['in:b', 0.75]]));
    expect(removeLane(tl, 'in:a').lanes.map((l) => l.key)).toEqual(['in:b']);
    const renamed = remapKeys(tl, (key) => (key === 'in:a' ? 'in:c' : null));
    expect(renamed.lanes.map((l) => l.key)).toEqual(['in:c']);
  });

  it('reads a saved timeline defensively: compact pairs, sorted, clamped, bad lanes dropped', () => {
    const tl = validateTimeline({
      lanes: [
        { key: 'in:a', label: 'A', min: 0, max: 1, points: [[0.8, 2], [0.2, 0.5], ['x', 1]] },
        { key: 'in:a', label: 'dup', min: 0, max: 1, points: [[0, 0]] },
        { key: 'in:b', min: 3, max: 3, points: [[0, 3]] },
        { key: 'in:c', min: 5, max: -5, interp: 'hold', points: [{ t: -1, v: 0 }] },
        { key: 'in:d', min: 0, max: 1, points: [] },
        null,
      ],
    });
    expect(tl.lanes.map((l) => l.key)).toEqual(['in:a', 'in:c']);
    expect(tl.lanes[0].points).toEqual([{ t: 0.2, v: 0.5 }, { t: 0.8, v: 1 }]);
    expect(tl.lanes[1]).toMatchObject({ label: 'in:c', min: -5, max: 5, interp: 'hold', points: [{ t: 0, v: 0 }] });
    expect(validateTimeline('nonsense')).toEqual({ lanes: [] });
  });
});

describe('colour lanes', () => {
  const RED = packColor('#ff0000');
  const BLUE = packColor('#0000ff');
  const colorLane = (points: AutomationPoint[]): AutomationLane => ({
    key: 'fill',
    label: 'Fill',
    min: 0,
    max: AUTOMATION_COLOR_MAX,
    interp: 'color',
    points,
  });

  it('packs and unpacks a colour as one 24-bit number', () => {
    expect(packColor('#ff8000')).toBe(0xff8000);
    expect(packColor('#f80')).toBe(0xff8800);
    expect(packColor('#ff800080')).toBe(0xff8000);
    expect(packColor('nonsense')).toBe(0);
    expect(unpackColor(0xff8000)).toBe('#ff8000');
    expect(unpackColor(-4)).toBe('#000000');
  });

  it('blends between points in OKLab, never through the muddy sRGB midpoint', () => {
    const lane = colorLane([{ t: 0, v: RED }, { t: 1, v: BLUE }]);
    expect(valueAt(lane, 0)).toBe(RED);
    expect(valueAt(lane, 1)).toBe(BLUE);
    const mid = valueAt(lane, 0.5);
    expect(Number.isInteger(mid)).toBe(true);
    // The sRGB average of red and blue is #800080; OKLab keeps it lighter.
    expect(mid).not.toBe(0x800080);
    expect(colorDistance(mid, mixColor(RED, BLUE, 0.5))).toBe(0);
    const { r, b } = { r: (mid >> 16) & 255, b: mid & 255 };
    expect(r).toBeGreaterThan(0x80);
    expect(b).toBeGreaterThan(0x80);
  });

  it('a new colour lane spans every colour, whatever range it was handed', () => {
    const lane = createLane('fill', 'Fill', 0, 1, RED, 'color');
    expect(lane.min).toBe(0);
    expect(lane.max).toBe(AUTOMATION_COLOR_MAX);
    expect(lane.points[0].v).toBe(RED);
  });

  it('simplifies by how far apart the colours look, and keeps a fade it can see', () => {
    // A straight OKLab fade sampled finely simplifies to its two ends…
    const fade = Array.from({ length: 41 }, (_, i) => ({ t: i / 40, v: mixColor(RED, BLUE, i / 40) }));
    expect(simplify(fade, colorLane([]), AUTOMATION_TOLERANCE, 'color')).toEqual([fade[0], fade[40]]);
    // …while a detour through green in the middle stays.
    const GREEN = packColor('#00ff00');
    const detour = [{ t: 0, v: RED }, { t: 0.5, v: GREEN }, { t: 1, v: BLUE }];
    expect(simplify(detour, colorLane([]), AUTOMATION_TOLERANCE, 'color')).toHaveLength(3);
  });

  it('refuses to smooth, and merges a hand’s colours as whole colours', () => {
    const lane = colorLane([{ t: 0, v: RED }, { t: 1, v: RED }]);
    expect(smooth(lane, 2)).toEqual(lane.points);
    const merged = mergeSpan(lane, { from: 0.25, to: 0.5, samples: [{ t: 0.25, v: BLUE + 0.4 }, { t: 0.5, v: BLUE }] });
    expect(valueAt(merged, 0.4)).toBe(BLUE);
    expect(merged.points.every((p) => Number.isInteger(p.v))).toBe(true);
    expect(valueAt(merged, 0.75)).toBe(RED);
  });

  it('reads back from a file as a colour lane', () => {
    const tl = validateTimeline({ lanes: [{ key: 'fill', label: 'Fill', min: 3, max: 3, interp: 'color', points: [[0, RED], [1, 0x1ffffff]] }] });
    expect(tl.lanes).toHaveLength(1);
    expect(tl.lanes[0].interp).toBe('color');
    expect(tl.lanes[0].max).toBe(AUTOMATION_COLOR_MAX);
    expect(tl.lanes[0].points[1].v).toBe(AUTOMATION_COLOR_MAX);
  });
});
