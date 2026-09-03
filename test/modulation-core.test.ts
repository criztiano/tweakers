import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  MOD_SLOTS,
  MOD_COLORS,
  modColor,
  modKey,
  applyModulation,
  registerModType,
  getModType,
  listModTypes,
  lfoSyncedHz,
  LFO_DEF,
  LFO_SYNC_DIVISIONS,
  SH_DEF,
  modRingArc,
  MOD_RING_CIRCUMFERENCE,
  type ModTypeDef,
} from '../src/modulation-core';

describe('palette and keys', () => {
  it('carries one colour per slot and wraps the index', () => {
    expect(MOD_COLORS).toHaveLength(MOD_SLOTS);
    expect(modColor(0)).toBe(MOD_COLORS[0]);
    expect(modColor(MOD_SLOTS + 3)).toBe(MOD_COLORS[3]);
    expect(modColor(-1)).toBe(MOD_COLORS[MOD_SLOTS - 1]);
  });

  it('keys panel and path unambiguously', () => {
    // 'a.b'+'c' and 'a'+'b.c' must not collide the way naive joins do.
    expect(modKey('a.b', 'c')).not.toBe(modKey('a', 'b.c'));
  });
});

describe('applyModulation', () => {
  it('sweeps around the base in the control units', () => {
    // amount 1 at full signal reaches half a span away from the base.
    expect(applyModulation(50, 1, 1, 0, 100)).toBe(100);
    expect(applyModulation(50, -1, 1, 0, 100)).toBe(0);
    expect(applyModulation(50, 1, 0.5, 0, 100)).toBe(75);
    expect(applyModulation(50, 0, 1, 0, 100)).toBe(50);
  });

  it('clamps to the control bounds and sane inputs', () => {
    expect(applyModulation(90, 1, 1, 0, 100)).toBe(100);   // no overshoot
    expect(applyModulation(10, -1, 1, 0, 100)).toBe(0);
    expect(applyModulation(50, 5, 1, 0, 100)).toBe(100);   // wild signal clamped
    expect(applyModulation(50, 1, 9, 0, 100)).toBe(100);   // wild amount clamped
  });
});

describe('the modulation ring', () => {
  // The dash pattern rides the circle's path: SVG draws it clockwise from 3
  // o'clock, so a fraction f of the circumference sits at 360f° round from there.
  const at = (length: number, offset: number) => ({
    length: length * MOD_RING_CIRCUMFERENCE,
    offset: offset * MOD_RING_CIRCUMFERENCE,
  });
  const close = (got: { length: number; offset: number }, want: { length: number; offset: number }) => {
    expect(got.length).toBeCloseTo(want.length, 5);
    expect(got.offset).toBeCloseTo(want.offset, 5);
  };

  it('draws nothing when the modulation is not moving the value', () => {
    expect(modRingArc(0.5, 0.5).length).toBe(0);
  });

  it('spans the sweep between two values, a knob 270° from the bottom-left', () => {
    // The whole travel: bottom-left round to bottom-right, starting 135° in.
    close(modRingArc(0, 1), at(270 / 360, -135 / 360));
    // Base at mid (top) up to the maximum: the last quarter of the sweep.
    close(modRingArc(0.5, 1), at(135 / 360, -270 / 360));
  });

  it('draws the same arc whichever end it is given first', () => {
    close(modRingArc(0.8, 0.3), modRingArc(0.3, 0.8));
  });

  it('clamps values that run past the control bounds', () => {
    // A base near the ceiling with a big modulation must not wrap the ring.
    close(modRingArc(0.9, 1.6), modRingArc(0.9, 1));
    close(modRingArc(0.1, -0.6), modRingArc(0.1, 0));
    expect(modRingArc(-3, 4).length).toBeCloseTo(MOD_RING_CIRCUMFERENCE * (270 / 360), 5);
  });

  it('never draws more than the ring holds', () => {
    for (let i = 0; i <= 20; i++) {
      for (let j = 0; j <= 20; j++) {
        const arc = modRingArc(i / 20, j / 20);
        expect(arc.length).toBeGreaterThanOrEqual(0);
        expect(arc.length).toBeLessThanOrEqual(MOD_RING_CIRCUMFERENCE);
        expect(arc.offset).toBeLessThanOrEqual(0);
      }
    }
  });
});

describe('the type registry', () => {
  it('ships the LFO and the S&H, in that order', () => {
    expect(getModType('lfo')).toBe(LFO_DEF);
    expect(getModType('sh')).toBe(SH_DEF);
    expect(listModTypes().map((d) => d.type)).toEqual(['lfo', 'sh']);
  });

  it('accepts new types', () => {
    const def: ModTypeDef = {
      type: 'curve',
      label: 'Curve',
      defaults: { rate: 1 },
      controls: [],
      createState: () => ({}),
      tick: () => 0,
    };
    registerModType(def);
    expect(getModType('curve')).toBe(def);
    expect(listModTypes()).toContain(def);
  });
});

describe('the LFO', () => {
  const tick = (params: Record<string, number | boolean>, dts: number[]) => {
    const state = LFO_DEF.createState();
    const p = { ...LFO_DEF.defaults, ...params };
    return dts.map((dt) => LFO_DEF.tick(state, p, dt, 120));
  };

  it('runs a symmetric triangle at the set rate', () => {
    // 1 Hz, quarter-second steps: mid-rise, peak, mid-fall, trough.
    const out = tick({ rate: 1, jitter: 0, smooth: 0 }, [0.25, 0.25, 0.25, 0.25]);
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[1]).toBeCloseTo(1, 5);
    expect(out[2]).toBeCloseTo(0, 5);
    expect(out[3]).toBeCloseTo(-1, 5);
  });

  it('skews the peak with width', () => {
    // width 0.25 puts the peak a quarter of the way into the cycle.
    const out = tick({ rate: 1, width: 0.25 }, [0.25]);
    expect(out[0]).toBeCloseTo(1, 5);
  });

  it('offsets with phase', () => {
    // A half-cycle phase offset starts the ramp at the peak.
    const out = tick({ rate: 1, phase: 0.5 }, [0.25]);
    expect(out[0]).toBeCloseTo(0, 5);   // 0.25 + 0.5 → falling edge midpoint
  });

  it('follows the tempo when synced', () => {
    // Division "1/4" is one beat: at 120 BPM that's 2 Hz — an eighth of a
    // second lands mid-rise.
    const quarterIx = LFO_SYNC_DIVISIONS.findIndex((d) => d.label === '1/4');
    expect(lfoSyncedHz(quarterIx, 120)).toBeCloseTo(2, 5);
    const out = tick({ sync: true, division: quarterIx }, [0.125, 0.125]);
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[1]).toBeCloseTo(1, 5);
  });

  it('slews with smooth instead of jumping', () => {
    const raw = tick({ rate: 1, smooth: 0 }, [0.25, 0.25]);
    const soft = tick({ rate: 1, smooth: 1 }, [0.25, 0.25]);
    const rawJump = Math.abs(raw[1] - raw[0]);
    const softJump = Math.abs(soft[1] - soft[0]);
    expect(softJump).toBeLessThan(rawJump);
  });

  it('stays inside -1..1 with jitter on', () => {
    const state = LFO_DEF.createState();
    const p = { ...LFO_DEF.defaults, rate: 8, jitter: 1 };
    for (let i = 0; i < 200; i++) {
      const v = LFO_DEF.tick(state, p, 0.016, 120);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('the S&H', () => {
  const run = (params: Record<string, number | boolean>, steps: number, dt = 0.01) => {
    const state = SH_DEF.createState();
    const p = { ...SH_DEF.defaults, ...params };
    return Array.from({ length: steps }, () => SH_DEF.tick(state, p, dt, 120));
  };

  afterEach(() => vi.restoreAllMocks());

  it('lays out rate, depth, offset dials and the jitter/smooth texture pad', () => {
    expect(SH_DEF.controls.map((c) => c.path)).toEqual(['rate', 'depth', 'offset', 'texture']);
    const xy = SH_DEF.controls.find((c) => c.type === 'xy')!;
    expect([xy.xParam, xy.yParam]).toEqual(['jitter', 'smooth']);
  });

  it('holds a value between samples and redraws at the rate', () => {
    // Each sample draws twice: the held value, then the hold length.
    const draws = [0.9, 0.5, 0.1, 0.5];
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => draws[Math.min(i++, draws.length - 1)]);
    // 2 Hz → a fresh draw every 0.5 s; dt 0.01 → 50 ticks per hold.
    const out = run({ rate: 2 }, 60);
    expect(out[0]).toBeCloseTo(0.8, 5);                     // 0.9 mapped to -1..1
    expect(new Set(out.slice(0, 50)).size).toBe(1);         // held flat
    expect(out[55]).toBeCloseTo(-0.8, 5);                   // the next draw landed
  });

  it('scales the throw with depth and biases with offset, clamped', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1);            // every draw = +1
    expect(run({ rate: 1, depth: 0.25 }, 1)[0]).toBeCloseTo(0.25, 5);
    expect(run({ rate: 1, depth: 0, offset: -0.5 }, 1)[0]).toBeCloseTo(-0.5, 5);
    expect(run({ rate: 1, depth: 1, offset: 1 }, 1)[0]).toBe(1);
  });

  it('slews with smooth instead of stepping', () => {
    const draws = [1, 0.5, 0, 0.5];                          // held +1, then held -1
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => draws[Math.min(i++, draws.length - 1)]);
    const out = run({ rate: 2, smooth: 1 }, 60);
    expect(Math.abs(out[51] - out[50])).toBeLessThan(0.1);  // gliding after the redraw…
    expect(out[55]).toBeLessThan(out[50]);                  // …in the right direction
  });

  it('varies the hold lengths with jitter', () => {
    // Per sample: held draw (ignored), then length draw — short, then long.
    const seq = [0.5, 0, 0.5, 1];
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => seq[i++ % seq.length]);
    const state = SH_DEF.createState() as { wait: number };
    const p = { ...SH_DEF.defaults, rate: 1, jitter: 1 };
    SH_DEF.tick(state, p, 0.01, 120);
    const first = state.wait;
    state.wait = 0;
    SH_DEF.tick(state, p, 0.01, 120);
    expect(state.wait).toBeGreaterThan(first);
  });

  it('stays inside -1..1 with everything cranked', () => {
    const out = run({ rate: 30, jitter: 1, smooth: 0.3, offset: 0.8 }, 500, 0.016);
    for (const v of out) {
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
