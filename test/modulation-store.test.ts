import { describe, it, expect, afterEach, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore, MOD_TOUCH_GRACE_MS } from '../src/store/ModulationStore';

// Each test gets its own panel id; unregister keeps the singletons clean.
let panelSeq = 0;
const freshId = () => `mod-test-${++panelSeq}`;

const registered: string[] = [];
const register = (id: string, config: Parameters<typeof TweakStore.registerPanel>[2]) => {
  TweakStore.registerPanel(id, id, config);
  registered.push(id);
};

afterEach(() => {
  ModulationStore.clear();
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
  vi.useRealTimers();
});

// A slider at mid-span with a slot pinned to full signal: getValue must read
// base + amount * span/2 without ever writing the store.
const pinned = (id: string, amount = 0.5) => {
  register(id, { speed: [50, 0, 100] as [number, number, number] });
  const slot = ModulationStore.createSlot(0)!;
  ModulationStore.assign(id, 'speed', 0, amount);
  // Freeze the LFO at its peak: phase lands exactly on the triangle top.
  ModulationStore.updateSlotParams(0, { rate: 1, jitter: 0, smooth: 0, phase: 0 });
  ModulationStore.tick(0.5);
  return slot;
};

describe('slots', () => {
  it('creates, lists, and refuses out-of-range or unknown types', () => {
    const slot = ModulationStore.createSlot(3);
    expect(slot).toMatchObject({ index: 3, type: 'lfo' });
    expect(ModulationStore.createSlot(3)).toBe(slot);       // occupied → same slot
    expect(ModulationStore.getSlots()).toHaveLength(1);
    expect(ModulationStore.createSlot(16)).toBeNull();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(ModulationStore.createSlot(4, 'curve')).toBeNull();   // not registered
    warn.mockRestore();
  });

  it('drops a removed slot and every assignment wired to it', () => {
    const id = freshId();
    pinned(id);
    expect(ModulationStore.getAssignment(id, 'speed')).toBeDefined();
    ModulationStore.removeSlot(0);
    expect(ModulationStore.getSlot(0)).toBeNull();
    expect(ModulationStore.getAssignment(id, 'speed')).toBeUndefined();
    expect(ModulationStore.getSignal(0)).toBe(0);
  });
});

describe('assignments', () => {
  it('refuses controls that are not bounded numerics', () => {
    const id = freshId();
    register(id, { on: true });
    ModulationStore.createSlot(0);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(ModulationStore.assign(id, 'on', 0)).toBe(false);
    warn.mockRestore();
  });

  it('accepts a not-yet-registered control on trust', () => {
    ModulationStore.createSlot(0);
    expect(ModulationStore.assign('later-panel', 'speed', 0)).toBe(true);
    // No panel, no bounds — the modulation contributes nothing yet.
    expect(ModulationStore.getOffset('later-panel', 'speed')).toBe(0);
  });
});

describe('reading the modulated layer', () => {
  it('applies the signal around the base without touching the store', () => {
    const id = freshId();
    pinned(id, 0.5);
    expect(ModulationStore.getSignal(0)).toBeCloseTo(1, 5);
    expect(ModulationStore.getValue(id, 'speed')).toBeCloseTo(75, 5);
    expect(TweakStore.getValue(id, 'speed')).toBe(50);      // base untouched
  });

  it('overlays a whole panel snapshot and clamps at the bounds', () => {
    const id = freshId();
    pinned(id, 1);
    TweakStore.updateValue(id, 'speed', 90);
    const values = ModulationStore.getValues(id);
    expect(values.speed).toBe(100);                          // 90 + 50 clamped
  });

  it('tracks a moving base immediately', () => {
    const id = freshId();
    pinned(id, 0.5);
    TweakStore.updateValue(id, 'speed', 10);
    expect(ModulationStore.getValue(id, 'speed')).toBeCloseTo(35, 5);
  });
});

describe('the assignment gesture', () => {
  it('touch + step creates, re-press unassigns, grace expires', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });

    // Nothing armed: the press does nothing.
    expect(ModulationStore.assignFromStep(2).action).toBe('none');

    ModulationStore.noteTouch(id, 'speed');
    expect(ModulationStore.assignFromStep(2).action).toBe('created');
    expect(ModulationStore.getAssignment(id, 'speed')?.slot).toBe(2);

    // Same control, same step: toggles the wire off, the slot stays.
    ModulationStore.noteTouch(id, 'speed');
    expect(ModulationStore.assignFromStep(2).action).toBe('unassigned');
    expect(ModulationStore.getSlot(2)).not.toBeNull();

    // An expired touch no longer arms anything.
    ModulationStore.noteTouch(id, 'speed');
    vi.setSystemTime(MOD_TOUCH_GRACE_MS + 1);
    expect(ModulationStore.assignFromStep(2).action).toBe('none');
  });

  it('rolls back a slot created for a control that refuses the wire', () => {
    const id = freshId();
    register(id, { on: true });
    ModulationStore.noteTouch(id, 'on');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(ModulationStore.assignFromStep(5).action).toBe('none');
    warn.mockRestore();
    expect(ModulationStore.getSlot(5)).toBeNull();          // no orphan slot
  });
});

describe('external sources', () => {
  it('mirrors a pushed source for display without applying it', () => {
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });
    ModulationStore.createSlot(0);
    ModulationStore.assign(id, 'speed', 0, 1);
    ModulationStore.registerSource('env', {});               // display only
    ModulationStore.setSlotSource(0, 'env');
    ModulationStore.setSourceValue('env', 0.5);
    ModulationStore.tick(0.016);
    expect(ModulationStore.getSignal(0)).toBe(0.5);          // the circle pulses…
    expect(ModulationStore.getValue(id, 'speed')).toBe(50);  // …the value stays the app's
  });

  it('applies a sampled source when it asks to', () => {
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });
    ModulationStore.createSlot(0);
    ModulationStore.assign(id, 'speed', 0, 1);
    const off = ModulationStore.registerSource('lfo-native', { sample: () => 1, applies: true });
    ModulationStore.setSlotSource(0, 'lfo-native');
    ModulationStore.tick(0.016);
    expect(ModulationStore.getValue(id, 'speed')).toBe(100);
    off();
    expect(ModulationStore.getSources()).not.toContain('lfo-native');
  });
});
