import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sliderShapePath } from './move-layout';
import type { ControlMeta } from './store/TweakStore';

// A slider's `shape`: the picture its value makes, drawn in a fixed range so
// the value's size reads as the drawing's size.

const ys = (d: string) => [...d.matchAll(/[ML] [\d.-]+ ([\d.-]+)/g)].map((m) => Number(m[1]));
const bend = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'slider', path: 'bend', label: 'Bend', min: -1, max: 1, shape: (v: number) => (t: number) => v * Math.sin(Math.PI * t), ...extra } as ControlMeta);

describe('a slider that draws its shape', () => {
  it('draws nothing without a shape, or for anything but a slider', () => {
    assert.equal(sliderShapePath({ type: 'slider', path: 'a', label: 'A', min: 0, max: 1 } as ControlMeta, 0.5), null);
    assert.equal(sliderShapePath({ ...bend(), type: 'select' } as ControlMeta, 0.5), null);
  });

  it('draws in its fixed range: zero is the middle line, a bigger value a bigger shape', () => {
    assert.ok(ys(sliderShapePath(bend(), 0)!).every((y) => Math.abs(y - 50) < 1e-6));
    const half = Math.min(...ys(sliderShapePath(bend(), 0.5)!));
    const full = Math.min(...ys(sliderShapePath(bend(), 1)!));
    assert.ok(Math.abs(half - 25) < 0.5, `half reaches a quarter up (${half})`);
    assert.ok(Math.abs(full - 0) < 0.5, `full reaches the top (${full})`);
  });

  it('holds a shape past its range at the edge, and takes a domain of its own', () => {
    const over = ys(sliderShapePath(bend({ shape: () => (t) => 3 * t }), 1)!);
    assert.ok(Math.min(...over) >= 0 && Math.max(...over) <= 100);
    const wide = Math.min(...ys(sliderShapePath(bend({ shapeDomain: [-2, 2] }), 1)!));
    assert.ok(Math.abs(wide - 25) < 0.5, `in −2..2 a reach of 1 is a quarter up (${wide})`);
  });
});
