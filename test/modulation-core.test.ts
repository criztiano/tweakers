import { describe, it, expect } from 'vitest';
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

describe('the type registry', () => {
  it('ships the LFO and accepts new types', () => {
    expect(getModType('lfo')).toBe(LFO_DEF);
    const def: ModTypeDef = {
      type: 'sh',
      label: 'S&H',
      defaults: { rate: 1 },
      controls: [],
      createState: () => ({}),
      tick: () => 0,
    };
    registerModType(def);
    expect(getModType('sh')).toBe(def);
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
