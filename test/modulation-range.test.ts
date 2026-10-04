import { describe, it, expect, afterEach } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore } from '../src/store/ModulationStore';
import {
  MOD_SETTINGS_PANEL,
  getModType,
  modRange,
  modRangeArc,
  rangeSignal,
  type ModRange,
} from '../src/modulation-core';

let panelSeq = 0;
const registered: string[] = [];

afterEach(() => {
  ModulationStore.clear();
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
});

/** A 0..100 slider at 50, wired to an LFO frozen at the top of its wave. */
function lfoAtPeak(range: ModRange, amount = 0.5) {
  const id = `mod-range-${++panelSeq}`;
  TweakStore.registerPanel(id, id, { speed: [50, 0, 100] as [number, number, number] });
  registered.push(id);
  ModulationStore.createSlot(0);
  ModulationStore.assign(id, 'speed', 0, amount);
  ModulationStore.updateSlotParams(0, { rate: 1, jitter: 0, smooth: 0, phase: 0, range });
  ModulationStore.tick(0.5);
  return id;
}

describe('a modulation range', () => {
  it('defaults by type: both ways for the LFO and S&H, up for the envelope, curve and audio', () => {
    const defaults = Object.fromEntries(
      (['lfo', 'sh', 'adsr', 'curve', 'audio'] as const).map((t) => [t, getModType(t)!.defaults.range])
    );
    expect(defaults).toEqual({ lfo: 'bipolar', sh: 'bipolar', adsr: 'positive', curve: 'positive', audio: 'positive' });
  });

  it('keeps a both-ways slot sweeping half the span each side at full depth', () => {
    const id = lfoAtPeak('bipolar');
    expect(ModulationStore.getOffset(id, 'speed')).toBeCloseTo(25);
  });

  it('pushes a one-way slot a whole span in its direction at full depth', () => {
    const up = lfoAtPeak('positive');
    expect(ModulationStore.getOffset(up, 'speed')).toBeCloseTo(50);
    ModulationStore.clear();
    const down = lfoAtPeak('negative');
    expect(ModulationStore.getOffset(down, 'speed')).toBeCloseTo(-50);
  });

  it('reads the level apart from the signal: the shape, whichever way it pushes', () => {
    lfoAtPeak('negative');
    expect(ModulationStore.getLevel(0)).toBeCloseTo(1);
    expect(ModulationStore.getSignal(0)).toBeCloseTo(-1);
  });

  it('never pushes an envelope below the value it lifts from', () => {
    const id = `mod-range-${++panelSeq}`;
    TweakStore.registerPanel(id, id, { speed: [50, 0, 100] as [number, number, number] });
    registered.push(id);
    ModulationStore.createSlot(1, 'adsr');
    ModulationStore.updateSlotParams(1, { loop: true });
    ModulationStore.assign(id, 'speed', 1, 1);
    let lowest = Infinity;
    for (let i = 0; i < 120; i++) {
      ModulationStore.tick(1 / 60);
      lowest = Math.min(lowest, ModulationStore.getOffset(id, 'speed'));
    }
    expect(lowest).toBeGreaterThanOrEqual(0);
  });

  it('is picked from a chip under the type picker, on every modulator page', () => {
    ModulationStore.createSlot(2, 'curve');
    ModulationStore.openSettings(2);
    expect(ModulationStore.getSettingsLayout()!.values[0]).toEqual({ path: 'range' });
    expect(TweakStore.getValues(MOD_SETTINGS_PANEL).range).toBe('positive');
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'range', 'negative');
    expect(modRange(ModulationStore.getSlot(2)!)).toBe('negative');
  });
});

describe('the range math', () => {
  it('turns a level into the signal each range sends', () => {
    expect(rangeSignal(0.25, 'positive')).toBe(0.25);
    expect(rangeSignal(0.25, 'negative')).toBe(-0.25);
    expect(rangeSignal(0.25, 'bipolar')).toBe(-0.5);
  });

  it('draws the ring from where each range starts', () => {
    expect(modRangeArc('positive', 0.5)).toEqual({ from: 0, to: 0.5 });
    expect(modRangeArc('negative', -0.5)).toEqual({ from: 0.5, to: 1 });
    expect(modRangeArc('bipolar', 0)).toEqual({ from: 0.5, to: 0.5 });
  });
});
