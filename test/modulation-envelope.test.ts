import { describe, it, expect, afterEach } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore } from '../src/store/ModulationStore';
import {
  MOD_SETTINGS_PANEL,
  ENVELOPE_DEF,
  ENV_HZ_MIN,
  ENV_HZ_MAX,
  envHz,
  type ModulationParams,
} from '../src/modulation-core';
import { buildModMovePage } from '../src/move-layout';

afterEach(() => {
  ModulationStore.clear();
});

/** Drive the follower with a constant input level over fixed steps. */
const follow = (
  params: ModulationParams,
  feed: { level: number; steps: number }[],
  input: ((lo: number, hi: number) => number) | null = null,
  dt = 0.01
) => {
  const state = ENVELOPE_DEF.createState();
  const p = { ...ENVELOPE_DEF.defaults, ...params };
  const out: number[] = [];
  for (const { level, steps } of feed) {
    for (let i = 0; i < steps; i++) {
      out.push(ENVELOPE_DEF.tick(state, p, dt, 120, input ?? (() => level)));
    }
  }
  return out;
};

describe('the filter dial mapping', () => {
  it('spans the audible band exponentially', () => {
    expect(envHz(0)).toBeCloseTo(ENV_HZ_MIN, 5);
    expect(envHz(1)).toBeCloseTo(ENV_HZ_MAX, 5);
    expect(envHz(0.5)).toBeCloseTo(Math.sqrt(ENV_HZ_MIN * ENV_HZ_MAX), 3);
    expect(envHz(-1)).toBeCloseTo(ENV_HZ_MIN, 5);   // clamped
  });
});

describe('the envelope follower', () => {
  it('rests at silence without any audio input', () => {
    const state = ENVELOPE_DEF.createState();
    expect(ENVELOPE_DEF.tick(state, ENVELOPE_DEF.defaults, 0.016, 120)).toBe(0);
    expect(ENVELOPE_DEF.tick(state, ENVELOPE_DEF.defaults, 0.016, 120, null)).toBe(0);
  });

  it('rises fast and falls slow, per the two time controls', () => {
    // 20 ms rise: near the top after 100 ms; 250 ms fall: still well up
    // 100 ms after the input stops.
    const out = follow({ rise: 20, fall: 250, delay: 0 }, [
      { level: 1, steps: 10 },
      { level: 0, steps: 10 },
    ]);
    expect(out[9]).toBeGreaterThan(0.95);
    expect(out[19]).toBeGreaterThan(0.5);
    expect(out[19]).toBeLessThan(0.8);
  });

  it('is instant when rise and fall sit at 0', () => {
    const out = follow({ rise: 0, fall: 0 }, [
      { level: 0.7, steps: 1 },
      { level: 0, steps: 1 },
    ]);
    expect(out[0]).toBeCloseTo(0.7, 5);
    expect(out[1]).toBe(0);
  });

  it('scales the input with gain in dB and clamps at full', () => {
    const quiet = follow({ gain: -6, rise: 0, fall: 0 }, [{ level: 0.5, steps: 1 }]);
    expect(quiet[0]).toBeCloseTo(0.5 * Math.pow(10, -6 / 20), 4);
    const hot = follow({ gain: 24, rise: 0, fall: 0 }, [{ level: 0.5, steps: 1 }]);
    expect(hot[0]).toBe(1);
  });

  it('hears the input late by the delay', () => {
    // 50 ms delay at 10 ms steps: silence for 5 ticks, then the level.
    const out = follow({ delay: 50, rise: 0, fall: 0 }, [{ level: 1, steps: 8 }]);
    expect(out.slice(0, 4)).toEqual([0, 0, 0, 0]);
    expect(out[6]).toBe(1);
  });

  it('asks the input for the lo/hi band, ends swapped into order', () => {
    const windows: [number, number][] = [];
    const input = (lo: number, hi: number) => {
      windows.push([lo, hi]);
      return 0;
    };
    follow({ lo: 0.75, hi: 0.25 }, [{ level: 0, steps: 1 }], input);
    const [lo, hi] = windows[0];
    expect(lo).toBeCloseTo(envHz(0.25), 3);
    expect(hi).toBeCloseTo(envHz(0.75), 3);
  });

  it('always outputs a unipolar 0..1 signal', () => {
    const out = follow({ gain: 24, rise: 0, fall: 0 }, [
      { level: 1, steps: 3 },
      { level: 0, steps: 3 },
    ]);
    for (const v of out) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

/** An AnalyserNode stand-in: a spectrum hot only inside [hotLo, hotHi) bins. */
const fakeAnalyser = (bins: number, hotLo: number, hotHi: number, sampleRate = 44100) =>
  ({
    frequencyBinCount: bins,
    context: { sampleRate },
    getByteFrequencyData(data: Uint8Array) {
      data.fill(0);
      for (let b = hotLo; b < hotHi; b++) data[b] = 255;
    },
  } as unknown as AnalyserNode);

describe('audio inputs on the store', () => {
  it('feeds an envelope slot the band level of the registered input', () => {
    // 1024 bins over 22.05 kHz Nyquist ≈ 21.5 Hz/bin; energy near 430–650 Hz.
    const off = ModulationStore.registerAudioInput('main', () => fakeAnalyser(1024, 20, 30));
    ModulationStore.createSlot(0, 'envelope');
    ModulationStore.updateSlotParams(0, { rise: 0, fall: 0 });
    ModulationStore.tick(0.016);
    expect(ModulationStore.getSignal(0)).toBe(1);

    // Confine the follower to the top of the band — the energy vanishes.
    ModulationStore.updateSlotParams(0, { lo: 0.9, hi: 1 });
    ModulationStore.tick(0.016);
    expect(ModulationStore.getSignal(0)).toBe(0);
    off();
  });

  it('falls back to the first input when the chosen source is gone', () => {
    const off = ModulationStore.registerAudioInput('only', () => fakeAnalyser(64, 1, 64));
    ModulationStore.createSlot(1, 'envelope');
    ModulationStore.updateSlotParams(1, { rise: 0, fall: 0, source: 'missing' });
    ModulationStore.tick(0.016);
    expect(ModulationStore.getSignal(1)).toBe(1);
    off();
  });

  it('stays silent with no inputs registered', () => {
    ModulationStore.createSlot(2, 'envelope');
    ModulationStore.updateSlotParams(2, { rise: 0, fall: 0 });
    ModulationStore.tick(0.016);
    expect(ModulationStore.getSignal(2)).toBe(0);
  });
});

describe('the envelope settings page', () => {
  it('lays out gain, rise, fall, delay, and the two filter dials — no source select below two inputs', () => {
    ModulationStore.createSlot(4, 'envelope');
    ModulationStore.openSettings(4);
    const panel = TweakStore.getPanel(MOD_SETTINGS_PANEL)!;
    expect(panel.name).toBe('Envelope 5');
    expect(panel.controls.map((c) => c.path)).toEqual(
      ['type', 'gain', 'rise', 'fall', 'delay', 'lo', 'hi']
    );
    const page = buildModMovePage(panel);
    expect(page.dials.map((c) => c.path)).toEqual(
      ['type', 'gain', 'rise', 'fall', 'delay', 'lo', 'hi']
    );
  });

  it('offers the source select once two audio inputs exist, and tracks late registration', () => {
    const offA = ModulationStore.registerAudioInput('drums', () => null);
    ModulationStore.createSlot(0, 'envelope');
    ModulationStore.openSettings(0);
    // One input: nothing to choose.
    expect(TweakStore.getPanel(MOD_SETTINGS_PANEL)!.controls.some((c) => c.path === 'source')).toBe(false);

    // A second input arrives while the page is open — the select appears.
    const offB = ModulationStore.registerAudioInput('bass', () => null);
    const controls = TweakStore.getPanel(MOD_SETTINGS_PANEL)!.controls;
    const source = controls.find((c) => c.path === 'source')!;
    expect(source.options).toEqual(['drums', 'bass']);
    expect(controls.map((c) => c.path)).toEqual(
      ['type', 'gain', 'rise', 'fall', 'delay', 'source', 'lo', 'hi']
    );

    // Picking a source lands the id in the slot params.
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'source', 'bass');
    expect(ModulationStore.getSlot(0)!.params.source).toBe('bass');
    offA();
    offB();
  });

  it('switches an LFO slot to the envelope from the type enum', () => {
    ModulationStore.createSlot(0);
    ModulationStore.openSettings(0);
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'type', 'envelope');
    expect(ModulationStore.getSlot(0)!.type).toBe('envelope');
    expect(ModulationStore.getSlot(0)!.params).toEqual(ENVELOPE_DEF.defaults);
    expect(TweakStore.getPanel(MOD_SETTINGS_PANEL)!.name).toBe('Envelope 1');
  });
});
