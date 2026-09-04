import { describe, it, expect } from 'vitest';
import {
  CURVE_DEF,
  CURVE_MAX_CLIPS,
  curveComposition,
  curveDuration,
  modPageLayout,
  visibleModControls,
  type ModulationParams,
} from '../src/modulation-core';
import type { CurveSegment } from '../src/curve-composer-core';

/** A slot's own params, the way the store hands them out. */
const params = (patch: ModulationParams = {}): ModulationParams => ({
  ...(JSON.parse(JSON.stringify(CURVE_DEF.defaults)) as ModulationParams),
  ...patch,
});

const clipsOf = (p: ModulationParams) => p.clips as unknown as CurveSegment[];
const paths = (row: ({ path: string } | null)[]) => row.map((s) => s?.path ?? null);

/** Apply a patch the way ModulationStore.updateSlotParams does. */
const patch = (p: ModulationParams, next: ModulationParams) => CURVE_DEF.normalize!(p, next);

/** Run the modulator for `seconds` and return the last signal. */
function play(p: ModulationParams, seconds: number, dt = 1 / 60, bpm = 120) {
  const state = CURVE_DEF.createState();
  let out = 0;
  for (let t = 0; t < seconds; t += dt) out = CURVE_DEF.tick(state, p, dt, bpm);
  return out;
}

describe('the curve page', () => {
  it('puts the eight dials in order, with the small slots under their own', () => {
    const layout = modPageLayout(CURVE_DEF.controls, params({ signal: 'trigger' }));
    // The kind picker takes the first big slot ahead of these (the store
    // prepends it), so these are the seven that follow it.
    expect(paths(layout.dials)).toEqual([
      'curve', 'duration', 'direction', 'gap', 'anticipate', 'overshoot', 'segments',
    ]);
    // Sync sits under Duration, Signal under Sync; Flip under Direction,
    // with the trigger count beside Signal in the same chip row.
    expect(paths(layout.toggles)).toEqual([null, 'sync', 'flip']);
    expect(paths(layout.values)).toEqual([null, 'signal', 'triggers']);
  });

  it('hides the trigger count outside trigger mode', () => {
    const layout = modPageLayout(CURVE_DEF.controls, params());
    expect(paths(layout.values)).toEqual([null, 'signal']);
    expect(visibleModControls(CURVE_DEF, params()).map((c) => c.path)).not.toContain('triggers');
    expect(visibleModControls(CURVE_DEF, params({ signal: 'trigger' })).map((c) => c.path))
      .toContain('triggers');
  });

  it('marks the curve dial as the one that draws the preview and cycles', () => {
    const curve = modPageLayout(CURVE_DEF.controls, params()).dials[0];
    expect(curve).toEqual({ path: 'curve', preview: true, cycle: true });
  });
});

describe('the shape dials and the selected clip', () => {
  it('writes a shape dial into the clip the arrows are on', () => {
    let p = patch(params(), { segments: 3 });
    p = patch(p, { selected: 1 });
    p = patch(p, { curvature: 0.5, steepness: -0.25, anticipate: 0.3, overshoot: 0.1 });
    const clips = clipsOf(p);
    expect(clips[1]).toMatchObject({ curvature: 0.5, steepness: -0.25, anticipate: 0.3, overshoot: 0.1 });
    expect(clips[0]).toMatchObject({ curvature: 0, steepness: 0 });
  });

  it('reads the next clip back out when the selection moves', () => {
    let p = patch(params(), { segments: 2 });
    p = patch(p, { curvature: 0.8 });          // shape clip 1
    p = patch(p, { selected: 1 });             // walk to clip 2...
    expect(p.curvature).toBe(0);               // ...whose shape the dials now show
    p = patch(p, { selected: 0 });
    expect(p.curvature).toBe(0.8);
  });

  it('keeps the count dial, the clip list and the selection in agreement', () => {
    let p = patch(params(), { segments: 4 });
    expect(clipsOf(p)).toHaveLength(4);
    expect(clipsOf(p).every((c) => c.weight === 1)).toBe(true);   // re-divided evenly
    p = patch(p, { selected: 3 });
    p = patch(p, { segments: 2 });
    expect(clipsOf(p)).toHaveLength(2);
    expect(p.selected).toBe(1);                                   // pulled back inside
    expect(patch(p, { segments: 99 }).segments).toBe(CURVE_MAX_CLIPS);
    expect(patch(p, { segments: 0 }).segments).toBe(1);
  });
});

describe('the arrows, Delete and the knob tap', () => {
  it('walks the clips with the arrows, wrapping both ways', () => {
    const p = patch(params(), { segments: 3 });
    expect(CURVE_DEF.buttons!.right(p)).toEqual({ selected: 1 });
    expect(CURVE_DEF.buttons!.left(p)).toEqual({ selected: 2 });
    expect(CURVE_DEF.buttons!.right(patch(p, { selected: 2 }))).toEqual({ selected: 0 });
  });

  it('drops the selected clip, and never the last one', () => {
    let p = patch(params(), { segments: 3 });
    p = patch(p, { selected: 1 });
    p = patch(p, CURVE_DEF.buttons!.delete(p) as ModulationParams);
    expect(clipsOf(p)).toHaveLength(2);
    p = patch(p, CURVE_DEF.buttons!.delete(p) as ModulationParams);
    expect(clipsOf(p)).toHaveLength(1);
    expect(CURVE_DEF.buttons!.delete(p)).toBeUndefined();
  });

  it('cycles the selected clip through the vocabulary, shape reset', () => {
    const cycle = CURVE_DEF.controls.find((c) => c.path === 'curve')!.cycle!;
    let p = patch(params(), { curvature: 0.6 });
    expect(clipsOf(p)[0].type).toBe('easeInOut');
    p = patch(p, cycle(p));
    expect(clipsOf(p)[0].type).toBe('spring');
    expect(p.curvature).toBe(0);                 // the dials follow the fresh clip
    p = patch(p, cycle(p));
    expect(clipsOf(p)[0].type).toBe('linear');
  });
});

describe('playing a pass', () => {
  it('reads the composition bipolar, and flip turns it over', () => {
    const p = patch(params({ duration: 1 }), { curvature: 0, steepness: 0 });
    const rising = play(p, 0.9);
    const falling = play({ ...p, flip: true }, 0.9);
    expect(rising).toBeGreaterThan(0.5);         // near the top of the walk
    expect(falling).toBeLessThan(-0.5);          // the same walk, upside down
    expect(rising).toBeGreaterThanOrEqual(-1);
    expect(rising).toBeLessThanOrEqual(1);
  });

  it('snaps a synced pass to the nearest tempo division', () => {
    expect(curveDuration(params({ duration: 3 }), 120)).toBe(3);
    // At 120 bpm a beat is 0.5 s: 1.9 s lands on the 1/1 bar (2 s).
    expect(curveDuration(params({ duration: 1.9, sync: true }), 120)).toBeCloseTo(2, 6);
    expect(curveDuration(params({ duration: 0.3, sync: true }), 120)).toBeCloseTo(0.25, 6);
    expect(curveDuration(params({ duration: 999 }), 120)).toBe(60);
  });

  it('fires decaying pulses in trigger mode', () => {
    const p = patch(params({ duration: 1, signal: 'trigger', triggers: 5 }), {});
    const state = CURVE_DEF.createState();
    const out: number[] = [];
    for (let i = 0; i < 60; i++) out.push(CURVE_DEF.tick(state, p, 1 / 60, 120));
    // A level crossed fires a full pulse; between crossings it decays away,
    // so the pass reads as gates rather than as one long hold.
    expect(out.filter((v) => v > 0.99).length).toBeGreaterThan(1);
    expect(out.filter((v) => v < 0.1).length).toBeGreaterThan(10);
    expect(out.every((v) => v >= 0 && v <= 1)).toBe(true);
  });

  it('reads the direction and the gap straight off the params', () => {
    const comp = curveComposition(params({ direction: 'mirror', gap: 0.4, segments: 2 }));
    expect(comp.direction).toBe('mirror');
    expect(comp.gap).toBe(0.4);
    expect(comp.driver).toBeNull();
    expect(curveComposition(params({ direction: 'nonsense' })).direction).toBe('forward');
  });
});

describe('the preview', () => {
  it('samples the selected clip and names it', () => {
    let p = patch(params(), { segments: 2 });
    p = patch(p, { selected: 1 });
    const preview = CURVE_DEF.preview!(p, 16);
    expect(preview.points).toHaveLength(16);
    expect(preview.points.every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(preview.points[0]).toBeLessThan(preview.points[15]);
    expect(preview.label).toBe('Ease InOut 2/2');
  });
});
