import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LFO_DEF,
  SH_DEF,
  ADSR_DEF,
  CURVE_DEF,
  envelopePoints,
  envelopeJoints,
  envWaveParam,
  envWaveFlipParam,
  ENV_WAVE_STAGES,
  modPageLayout,
  modPageWidth,
} from './modulation-core';
import { LUCIDE_ICONS } from './icons';

// The modulator pages draw themselves: the LFO and S&H texture pads show
// the wave their axes are shaping, and the ADSR's four dials each draw one
// stage of a single envelope picture whose segments meet at the slot edges.
// These tests pin the drawings' contracts, not their pixels.

describe('LFO preview', () => {
  it('returns the asked-for samples, each 0..1, and holds still', () => {
    const params = { ...LFO_DEF.defaults };
    const a = LFO_DEF.preview!(params, 32);
    const b = LFO_DEF.preview!(params, 32);
    assert.equal(a.points.length, 32);
    assert.ok(a.points.every((p) => p >= 0 && p <= 1));
    assert.deepEqual(a.points, b.points);
  });

  it('names the wave from its shape', () => {
    assert.equal(LFO_DEF.preview!({ ...LFO_DEF.defaults, width: 0.5 }, 16).label, 'Tri');
    assert.equal(LFO_DEF.preview!({ ...LFO_DEF.defaults, width: 0.1 }, 16).label, 'Saw');
    assert.equal(LFO_DEF.preview!({ ...LFO_DEF.defaults, width: 0.9 }, 16).label, 'Ramp');
    assert.equal(LFO_DEF.preview!({ ...LFO_DEF.defaults, smooth: 0.8 }, 16).label, 'Sine');
  });

  it('the width skew moves the wave, and smooth flattens its corners', () => {
    const tri = LFO_DEF.preview!({ ...LFO_DEF.defaults, width: 0.5 }, 64).points;
    const saw = LFO_DEF.preview!({ ...LFO_DEF.defaults, width: 0.05 }, 64).points;
    assert.notDeepEqual(tri, saw);
    const sharp = LFO_DEF.preview!({ ...LFO_DEF.defaults, smooth: 0 }, 64).points;
    const soft = LFO_DEF.preview!({ ...LFO_DEF.defaults, smooth: 1 }, 64).points;
    const swing = (pts: number[]) => Math.max(...pts) - Math.min(...pts);
    assert.ok(swing(soft) < swing(sharp));
  });

  it('jitter and smooth are their own dials, and the rate dial hosts the scope', () => {
    for (const def of [LFO_DEF, SH_DEF]) {
      const layout = modPageLayout(def.controls, def.defaults);
      assert.ok(layout.dials.some((d) => d.path === 'jitter'));
      assert.ok(layout.dials.some((d) => d.path === 'smooth'));
      assert.equal(layout.dials.find((d) => d.path === 'rate')?.scope, true);
      assert.ok(!layout.dials.some((d) => d.path === 'scope'));
    }
  });
});

describe('S&H preview', () => {
  it('is deterministic and bounded', () => {
    const params = { ...SH_DEF.defaults };
    const a = SH_DEF.preview!(params, 48);
    const b = SH_DEF.preview!(params, 48);
    assert.deepEqual(a.points, b.points);
    assert.ok(a.points.every((p) => p >= 0 && p <= 1));
  });

  it('offset lifts the whole run, depth scales its throw', () => {
    const mean = (pts: number[]) => pts.reduce((s, p) => s + p, 0) / pts.length;
    const centred = SH_DEF.preview!({ ...SH_DEF.defaults, offset: 0 }, 48).points;
    const lifted = SH_DEF.preview!({ ...SH_DEF.defaults, offset: 0.8 }, 48).points;
    assert.ok(mean(lifted) > mean(centred));
    const flat = SH_DEF.preview!({ ...SH_DEF.defaults, depth: 0, offset: 0 }, 48).points;
    assert.ok(flat.every((p) => Math.abs(p - 0.5) < 1e-9));
  });

  it('smooth renames the steps to a drift', () => {
    assert.equal(SH_DEF.preview!({ ...SH_DEF.defaults, smooth: 0 }, 16).label, 'Steps');
    assert.equal(SH_DEF.preview!({ ...SH_DEF.defaults, smooth: 0.8 }, 16).label, 'Drift');
  });
});

describe('ADSR envelope picture', () => {
  const params = { ...ADSR_DEF.defaults, attack: 200, decay: 500, sustain: 0.4, release: 1000 };

  it('draws the whole shape: rest, full, the sustain plateau, rest', () => {
    const pts = envelopePoints(params, 257);
    assert.ok(pts[0] < 0.05);                                  // starts at rest
    assert.ok(Math.max(...pts) > 0.99);                        // reaches full (to sampling)
    assert.ok(Math.abs(pts[pts.length - 1]) < 1e-9);           // ends at rest
    const plateau = pts.filter((p) => Math.abs(p - 0.4) < 1e-9);
    assert.ok(plateau.length > 20);                            // sustain holds flat
  });

  it('a longer stage takes a wider share of the picture', () => {
    const rise = (pts: number[]) => pts.findIndex((p) => p > 0.98);
    const quick = envelopePoints({ ...params, attack: 50 }, 257);
    const slow = envelopePoints({ ...params, attack: 1900 }, 257);
    assert.ok(rise(slow) > rise(quick));
  });

  it('even instant stages keep an edge, and the plateau never vanishes', () => {
    const pts = envelopePoints({ attack: 2000, decay: 2000, sustain: 0.5, release: 4000 }, 257);
    const plateau = pts.filter((p) => Math.abs(p - 0.5) < 1e-9);
    assert.ok(plateau.length > 10);
  });

  it('the page layout tags each dial with its stage', () => {
    const layout = modPageLayout(ADSR_DEF.controls, ADSR_DEF.defaults);
    const stageOf = (path: string) => layout.dials.find((d) => d.path === path)?.stage;
    assert.equal(stageOf('attack'), 'attack');
    assert.equal(stageOf('decay'), 'decay');
    assert.equal(stageOf('sustain'), 'sustain');
    assert.equal(stageOf('release'), 'release');
  });

  it('loop takes a big slot of its own, leaving every pad to the bend gesture', () => {
    const layout = modPageLayout(ADSR_DEF.controls, ADSR_DEF.defaults);
    assert.equal(layout.dials[layout.dials.length - 1]?.path, 'loop');
    assert.ok(layout.toggles.every((t) => t === null));
  });

  it('the joints sit on the line: peak, landing, and the sustain edge', () => {
    const joints = envelopeJoints(params);
    assert.equal(joints.length, 3);
    assert.equal(joints[0].stage, 'attack');
    assert.ok(Math.abs(joints[0].y - 1) < 1e-9);
    assert.ok(Math.abs(joints[1].y - 0.4) < 1e-9);
    assert.ok(Math.abs(joints[2].y - 0.4) < 1e-9);
    assert.ok(joints[0].x < joints[1].x && joints[1].x < joints[2].x);
  });

  it('a curve bends its own ramp, in the picture and in the signal', () => {
    const mid = (curve: number) => {
      const pts = envelopePoints({ ...params, decay: 1000, decayCurve: curve }, 257);
      const joints = envelopeJoints({ ...params, decay: 1000 });
      const t = (joints[0].x + joints[1].x) / 2;                // decay midpoint
      return pts[Math.round(t * 256)];
    };
    const straight = mid(0);
    assert.ok(mid(1) < straight);                               // bends toward the floor early
    assert.ok(mid(-1) > straight);                              // holds up, then drops

    // The engine's ramp bends the same way the drawing does.
    const run = (curve: number) => {
      const state = ADSR_DEF.createState();
      const p = { ...ADSR_DEF.defaults, attack: 100, attackCurve: curve };
      ADSR_DEF.gate!(state, true);
      ADSR_DEF.tick(state, p, 0.05, 120);                       // halfway up the attack
      return ADSR_DEF.tick(state, p, 0, 120);
    };
    assert.ok(run(1) > run(0) && run(0) > run(-1));
  });
});

// The envelope's second dimension: a sine per stage, exactly as long as the
// stage it rides, multiplied into it. These pin what that means — the shape
// dips but its joints hold, the flip turns it over, and the sustain's wave,
// which has no stage length to take, follows the tempo instead.
describe('ADSR stage waves', () => {
  const params = { ...ADSR_DEF.defaults, attack: 200, decay: 500, sustain: 0.4, release: 1000 };
  const at = (pts: number[], t: number) => pts[Math.round(t * (pts.length - 1))];

  it('rests at zero: the envelope ships as itself', () => {
    for (const stage of ENV_WAVE_STAGES) {
      assert.equal(ADSR_DEF.defaults[envWaveParam(stage)], 0);
      assert.equal(ADSR_DEF.defaults[envWaveFlipParam(stage)], false);
    }
    assert.deepEqual(
      envelopePoints(params, 129),
      envelopePoints({ ...params, attackWave: 0, decayWave: 0 }, 129)
    );
  });

  it('a full wave takes the stage to nothing in its middle and hands it back at full', () => {
    const waved = envelopePoints({ ...params, attackWave: 1 }, 257);
    const joints = envelopeJoints(params);
    assert.ok(at(waved, joints[0].x / 2) < 0.02);                // the attack's middle: gone
    assert.ok(at(waved, joints[0].x) > 0.99);                    // its peak: exactly where it was
    assert.ok(Math.max(...waved) > 0.99);
  });

  it('flipping mirrors it: the stage swells toward full instead of toward nothing', () => {
    const plain = envelopePoints(params, 257);
    const dip = envelopePoints({ ...params, decayWave: 1 }, 257);
    const swell = envelopePoints({ ...params, decayWave: 1, decayWaveFlip: true }, 257);
    const joints = envelopeJoints(params);
    const mid = (joints[0].x + joints[1].x) / 2;
    assert.ok(at(dip, mid) < 0.02);                              // pulled to nothing
    assert.ok(at(swell, mid) > 0.99);                            // …and to full, mirrored
    assert.ok(at(plain, mid) > 0.02 && at(plain, mid) < 0.99);   // the ramp it rides sits between
  });

  it('never falls off a cliff: whichever way it goes, the joints hold', () => {
    const joints = envelopeJoints(params);
    for (const flip of [false, true]) {
      // Sampled fine enough that a ramp's own steepness is a small step and
      // a cliff at a joint would still be a whole one.
      const pts = envelopePoints({ ...params, decayWave: 0.9, decayWaveFlip: flip }, 4097);
      assert.ok(Math.abs(at(pts, joints[0].x + 0.002) - 1) < 0.02, `start held, flip=${flip}`);
      assert.ok(Math.abs(at(pts, joints[1].x - 0.002) - 0.4) < 0.02, `end held, flip=${flip}`);
      const step = Math.max(...pts.slice(1).map((v, i) => Math.abs(v - pts[i])));
      assert.ok(step < 0.05, `smooth, flip=${flip} (biggest step ${step})`);
    }
  });

  it('every stage carries its own, and only its own', () => {
    const joints = envelopeJoints(params);
    const only = envelopePoints({ ...params, releaseWave: 1 }, 257);
    assert.ok(at(only, joints[0].x / 2) > 0.5);                  // the attack is untouched
    assert.ok(at(only, (joints[2].x + 1) / 2) < 0.02);           // the release is not
  });

  it('the signal moves with the picture: the wave rides the ramp', () => {
    const p = { ...ADSR_DEF.defaults, attack: 100, attackCurve: 0, attackWave: 1 };
    const state = ADSR_DEF.createState();
    ADSR_DEF.gate!(state, true);
    assert.ok(ADSR_DEF.tick(state, p, 0.05, 120) < 0.02);        // halfway up: pulled to nothing
    assert.ok(ADSR_DEF.tick(state, p, 0.05, 120) > 0.99);        // the peak still lands full
  });

  it('the sustain has no length of its own, so its wave keeps the tempo', () => {
    const p = { ...ADSR_DEF.defaults, attack: 10, decay: 300, sustain: 0.6, sustainWave: 1 };
    const dips = (bpm: number) => {
      const state = ADSR_DEF.createState();
      ADSR_DEF.gate!(state, true);
      ADSR_DEF.tick(state, p, 0.31, bpm);                        // straight through to the hold
      let down = false;
      let n = 0;
      for (let i = 0; i < 400; i++) {
        const v = ADSR_DEF.tick(state, p, 1 / 400, bpm);         // one second of the hold
        if (!down && v < 0.05) { down = true; n++; }
        else if (down && v > 0.2) down = false;
      }
      return n;
    };
    assert.equal(dips(120), 2);                                  // a cycle a beat
    assert.equal(dips(240), 4);                                  // twice the tempo, twice the wave
  });

  it('leaves the whole gesture to the pads — no stage wave takes a dial', () => {
    const layout = modPageLayout(ADSR_DEF.controls, ADSR_DEF.defaults);
    const paths = layout.dials.map((d) => d.path);
    for (const stage of ENV_WAVE_STAGES) assert.ok(!paths.includes(envWaveParam(stage)));
    assert.ok(layout.values.every((v) => v === null));
  });
});

describe('settings-page furniture', () => {
  it('every page is as wide as the widest type, so switching never reflows', () => {
    const width = modPageWidth();
    const curve = 1 + modPageLayout(CURVE_DEF.controls, CURVE_DEF.defaults).dials.length;
    assert.equal(width, Math.min(8, curve));                   // curve is the widest today
    const lfo = 1 + modPageLayout(LFO_DEF.controls, LFO_DEF.defaults).dials.length;
    assert.ok(width >= lfo);
  });

  it('the direction select shows as icons, and the glyphs exist', () => {
    const direction = CURVE_DEF.controls.find((c) => c.path === 'direction');
    const icons = (direction?.options ?? []).map((o) => (typeof o === 'string' ? null : o.icon));
    assert.deepEqual(icons, ['arrow-right', 'arrow-left-right', 'arrow-left']);
    for (const name of icons) assert.ok(LUCIDE_ICONS[name!], `missing glyph ${name}`);
  });
});
