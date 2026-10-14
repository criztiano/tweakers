import { describe, expect, it } from 'vitest';
import {
  IDENTITY_TRANSFORM,
  assertTransformRoundTrip,
  canvasMatrix,
  clampLayerTransform,
  layerModelMatrix,
  projectPoint,
} from '../src/layer-transform-core';

describe('layer transform', () => {
  it('projects and unprojects every placement, and bakes a group back exactly', () => {
    const { worst, bakeWorst, cases } = assertTransformRoundTrip();
    expect(cases).toBeGreaterThan(1000);
    expect(worst).toBeLessThan(1e-6);
    expect(bakeWorst).toBeLessThan(0.01);
  });

  it('turns and scales about the anchor, then moves from it', () => {
    const t = { ...IDENTITY_TRANSFORM, x: 10, y: 20, scale: 2, rotation: Math.PI / 2 };
    const model = layerModelMatrix(t, { x: 100, y: 100 }, 400, 400);
    // The anchor stays put, then moves by (x, y).
    expect(projectPoint(model, 100, 100)).toEqual({ x: 110, y: 120 });
    // A point 10 px right of the anchor lands 20 px below it.
    const p = projectPoint(model, 110, 100);
    expect(p.x).toBeCloseTo(110);
    expect(p.y).toBeCloseTo(140);
  });

  it('hands a 2D canvas the same plane the model draws', () => {
    const model = layerModelMatrix({ ...IDENTITY_TRANSFORM, x: 5, flipX: true }, { x: 50, y: 0 }, 100, 100);
    const [a, b, c, d, e, f] = canvasMatrix(model);
    const x = 30;
    const y = 40;
    expect(a * x + c * y + e).toBeCloseTo(projectPoint(model, x, y).x);
    expect(b * x + d * y + f).toBeCloseTo(projectPoint(model, x, y).y);
  });

  it('clamps out-of-range fields and wraps the turn', () => {
    const t = clampLayerTransform({ scale: 100, rotation: 3 * Math.PI, x: Number.NaN });
    expect(t.scale).toBe(8);
    expect(t.rotation).toBeCloseTo(Math.PI);
    expect(t.x).toBe(0);
  });
});
