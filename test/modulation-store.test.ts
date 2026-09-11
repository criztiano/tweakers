import { describe, it, expect, afterEach, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore, MOD_TOUCH_GRACE_MS } from '../src/store/ModulationStore';
import { MOD_SETTINGS_PANEL } from '../src/modulation-core';
import { buildModMovePage } from '../src/move-layout';

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
    expect(ModulationStore.createSlot(4, 'envelope')).toBeNull();   // not registered
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

  // The owner's hardware bug: a freshly created modulator would not open its
  // settings — the touch that created it stayed armed for the whole grace,
  // so the next tap read as "toggle the wire off" instead of "open".
  it('spends the arm on use: a fresh slot opens on the very next tap', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });

    // Touch a knob, tap a step: the modulator is created and wired.
    ModulationStore.noteTouch(id, 'speed');
    expect(ModulationStore.assignFromStep(2).action).toBe('created');

    // The immediate re-press — still inside the touch grace — must report
    // none (so the caller opens the settings view), not unwire the slot.
    vi.setSystemTime(500);
    expect(ModulationStore.assignFromStep(2).action).toBe('none');
    expect(ModulationStore.getAssignment(id, 'speed')?.slot).toBe(2);
  });

  it('the kit mapping gesture (hold + touch calls assign directly) spends the arm too', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });

    // The kit's hold-a-step-touch-a-knob path: createSlot + assign, with the
    // ~10 Hz state stream sustaining the touch on every following frame.
    ModulationStore.noteTouch(id, 'speed');
    ModulationStore.createSlot(3);
    expect(ModulationStore.assign(id, 'speed', 3)).toBe(true);
    vi.setSystemTime(100);
    ModulationStore.noteTouch(id, 'speed', true);
    vi.setSystemTime(200);
    ModulationStore.noteTouch(id, 'speed', true);

    // The finger lifts; the very next tap opens instead of unwiring.
    vi.setSystemTime(700);
    expect(ModulationStore.assignFromStep(3).action).toBe('none');
    expect(ModulationStore.getAssignment(id, 'speed')?.slot).toBe(3);

    // A FRESH touch re-arms: now the tap is the deliberate unwire.
    ModulationStore.noteTouch(id, 'speed');
    expect(ModulationStore.assignFromStep(3).action).toBe('unassigned');
  });

  // The owner's other hardware bug: with a settings view open, its own knobs
  // armed themselves, and every attempt to add a modulator created a slot
  // only to roll it straight back — "i tried to add more and I just can't".
  it('the settings page arms nothing, so an open view cannot block new slots', () => {
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });
    ModulationStore.createSlot(0);
    ModulationStore.openSettings(0);
    ModulationStore.noteTouch(MOD_SETTINGS_PANEL, 'rate');
    const version = ModulationStore.getVersion();
    expect(ModulationStore.assignFromStep(5).action).toBe('none');
    expect(ModulationStore.getSlot(5)).toBeNull();
    // No create-and-roll-back churn either — the press was simply not armed.
    expect(ModulationStore.getVersion()).toBe(version);
    ModulationStore.closeSettings();
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

describe('gates', () => {
  it('runs a gated ADSR slot and lifts the control while it is held', () => {
    const id = freshId();
    register(id, { speed: [50, 0, 100] as [number, number, number] });
    ModulationStore.createSlot(0, 'adsr');
    ModulationStore.updateSlotParams(0, {
      attack: 0, decay: 0, sustain: 1, release: 100, loop: false,
    });
    ModulationStore.assign(id, 'speed', 0, 1);

    ModulationStore.tick(0.016);
    expect(ModulationStore.getValue(id, 'speed')).toBe(50);  // no gate, no lift

    ModulationStore.gate(0, true);
    ModulationStore.tick(0.016);
    expect(ModulationStore.getValue(id, 'speed')).toBe(100); // held wide open

    ModulationStore.gate(0, false);
    ModulationStore.tick(0.2);                               // past the release
    expect(ModulationStore.getValue(id, 'speed')).toBe(50);
  });

  it('lets a free-running slot ignore the gate', () => {
    ModulationStore.createSlot(0);                           // an LFO
    expect(() => ModulationStore.gate(0, true)).not.toThrow();
    expect(() => ModulationStore.gate(5, true)).not.toThrow(); // empty slot
  });
});

describe('the envelope settings page', () => {
  it('keeps both pad rows free under every stage — the bend and wave gestures sit there', () => {
    ModulationStore.createSlot(0, 'adsr');
    ModulationStore.openSettings(0);
    const layout = ModulationStore.getSettingsLayout()!;
    const page = buildModMovePage(TweakStore.getPanel(MOD_SETTINGS_PANEL)!, layout);

    const stageCols = layout.dials.flatMap((d, i) => (d.stage ? [i] : []));
    expect(stageCols).toHaveLength(4);
    for (const col of stageCols) {
      expect(page.toggles[col]).toBeUndefined();             // the bend row
      expect(page.values[col]).toBeUndefined();              // the wave row
    }
    // Both rows have to exist at all: the panel collapses away trailing rows
    // with nothing in them, and would take the gestures with them.
    expect(page.toggles.length).toBeGreaterThan(0);
    expect(page.values.length).toBeGreaterThan(0);
    ModulationStore.closeSettings();
  });
});
