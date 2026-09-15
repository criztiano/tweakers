import { describe, expect, it } from 'vitest';
import {
  MovePadListStore, moveKitOptions, MoveColorStore, MoveFunctions, MoveSurfaceStore, MoveVolumeDisplay,
  MoveWaveformStore, ModulationStore, PresetExplorationStore, TweakStore, movePoint, sampleTransfer,
} from '../src/index';

// The one bind. The bridge kit ships alone, so every registry it reads is
// handed over — and each one an integrator forgot switched a feature off on
// the hardware only (Perlin's balance lost its colours for want of `color`).
// The bundle carries them all, and the registries tell the store when the
// page puts one to use, so the kit can name a gap instead of hiding it.

describe('moveKitOptions', () => {
  it('carries every registry the kit reads, under its bindMove option name', () => {
    const o = moveKitOptions();
    expect(o.padList).toBe(MovePadListStore);
    expect(o.functions).toBe(MoveFunctions);
    expect(o.modulation).toBe(ModulationStore);
    expect(o.color).toBe(MoveColorStore);
    expect(o.surface).toBe(MoveSurfaceStore);
    expect(o.waveform).toBe(MoveWaveformStore);
    expect(o.volume).toBe(MoveVolumeDisplay);
    expect(o.transfer).toEqual({ sample: sampleTransfer, move: movePoint });
    expect(o.exploration).toBe(PresetExplorationStore);
    // Nothing else: a new registry lands here AND in this list, together.
    expect(Object.keys(o).sort()).toEqual(
      ['color', 'exploration', 'functions', 'modulation', 'padList', 'surface', 'transfer', 'volume', 'waveform'],
    );
  });

  it('takes the rest of the bind in the same call, and a null declines a registry', () => {
    const o = moveKitOptions({ url: 'http://localhost:7799', modulation: null });
    expect(o.url).toBe('http://localhost:7799');
    expect(o.modulation).toBeNull();
    expect(o.color).toBe(MoveColorStore);
  });

  it('is a fresh object each call, so one bind cannot edit another', () => {
    const a = moveKitOptions();
    (a as Record<string, unknown>).color = null;
    expect(moveKitOptions().color).toBe(MoveColorStore);
  });
});

describe('the registries note what the page uses', () => {
  const uses = () => TweakStore.getMoveKitUses();

  it('stays quiet about a registry nobody has touched', () => {
    // An empty claim or a cleared list is not a use.
    MoveSurfaceStore.claimRows(0);
    MoveSurfaceStore.setScreen(null);
    MoveSurfaceStore.setSteps(null);
    expect(uses()).not.toContain('surface');
  });

  it('the wheel list, a pad claim or a step picture marks the surface', () => {
    MoveSurfaceStore.setScreen({ items: ['Perlin Noise'], index: 0 });
    expect(uses()).toContain('surface');
    MoveSurfaceStore.reset();
  });

  it('an attached button marks the functions', () => {
    const detach = MoveFunctions.attach('undo', () => {});
    expect(uses()).toContain('functions');
    detach();
  });

  it('a volume readout marks the volume', () => {
    MoveVolumeDisplay.set({ label: 'gain', value: '0 dB' });
    expect(uses()).toContain('volume');
    MoveVolumeDisplay.clear();
  });

  it('a mounted waveform marks the waveform', () => {
    const release = MoveWaveformStore.register();
    expect(uses()).toContain('waveform');
    release();
  });

  it('a modulator marks the modulation', () => {
    ModulationStore.createSlot(0, 'lfo');
    expect(uses()).toContain('modulation');
    ModulationStore.removeSlot(0);
  });
});
