import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { TweakStore, type PresetProvider } from '../src/store/TweakStore';
import { MovePresetStore } from '../src/move-presets';

// Each test gets its own panel id; unregister keeps the singleton clean.
let panelSeq = 0;
const freshId = () => `move-presets-test-${++panelSeq}`;

const registered: string[] = [];
const register = (id: string) => {
  TweakStore.registerPanel(id, id, { level: [0.5, 0, 1] as [number, number, number] });
  registered.push(id);
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  MovePresetStore.cancelSave();
  MovePresetStore.close();
  vi.runAllTimers();
  vi.useRealTimers();
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
});

describe('MovePresetStore view lifecycle', () => {
  it('opens in the enter phase, then settles open', () => {
    const id = freshId();
    register(id);
    MovePresetStore.open(id);
    expect(MovePresetStore.getView()).toMatchObject({ panelId: id, phase: 'enter' });
    vi.advanceTimersByTime(50);
    expect(MovePresetStore.getView()?.phase).toBe('open');
  });

  it('toggle closes an open view and the closing phase unmounts after the exit beat', () => {
    const id = freshId();
    register(id);
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.toggle(id);
    expect(MovePresetStore.getView()?.phase).toBe('closing');
    vi.advanceTimersByTime(500);
    expect(MovePresetStore.getView()).toBeNull();
  });

  it('opens with the cursor on the active preset', () => {
    const id = freshId();
    register(id);
    const a = TweakStore.savePreset(id, 'A');
    TweakStore.savePreset(id, 'B');
    TweakStore.loadPreset(id, a);
    MovePresetStore.open(id);
    expect(MovePresetStore.getView()?.cursor).toBe(a);
  });
});

describe('MovePresetStore wheel walk and confirm', () => {
  it('scroll steps the cursor and stops at the list ends', () => {
    const id = freshId();
    register(id);
    const a = TweakStore.savePreset(id, 'A');
    const b = TweakStore.savePreset(id, 'B');
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.scroll(-1);
    expect(MovePresetStore.getView()?.cursor).toBe(a);
    MovePresetStore.scroll(1);
    MovePresetStore.scroll(1);
    expect(MovePresetStore.getView()?.cursor).toBe(b);
  });

  it('confirm applies the cursor preset, marks it chosen, and self-dismisses after the linger', () => {
    const id = freshId();
    register(id);
    const a = TweakStore.savePreset(id, 'A');
    TweakStore.updateValue(id, 'level', 0.9);
    TweakStore.savePreset(id, 'B');
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.scroll(-10);
    MovePresetStore.confirm();
    expect(MovePresetStore.getView()?.chosen).toBe(a);
    expect(TweakStore.getActivePresetId(id)).toBe(a);
    // After the choice the wheel is done — further scrolls are ignored.
    MovePresetStore.scroll(1);
    expect(MovePresetStore.getView()?.cursor).toBe(a);
    vi.advanceTimersByTime(800);
    expect(MovePresetStore.getView()?.phase).toBe('closing');
    vi.advanceTimersByTime(500);
    expect(MovePresetStore.getView()).toBeNull();
  });

  it('routes selection through a host provider when one is set', () => {
    const id = freshId();
    register(id);
    const provider: PresetProvider = {
      presets: [{ id: 'warm', label: 'Warm' }, { id: 'cold', label: 'Cold' }],
      activeId: 'cold',
      onSelect: vi.fn(),
      onCreate: vi.fn(),
    };
    TweakStore.setPresetProvider(id, provider);
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    expect(MovePresetStore.getView()?.cursor).toBe('cold');
    MovePresetStore.choose('warm');
    expect(provider.onSelect).toHaveBeenCalledWith('warm');
    TweakStore.setPresetProvider(id, null);
  });
});

describe('MovePresetStore browse preview, compare and revert', () => {
  // Saved with no active preset engaged, so the fixture itself cannot trip
  // the store's auto-save-into-active-preset behaviour.
  const setup = () => {
    const id = freshId();
    register(id);
    TweakStore.updateValue(id, 'level', 0.1);
    const a = TweakStore.savePreset(id, 'A');
    TweakStore.clearActivePreset(id);
    TweakStore.updateValue(id, 'level', 0.9);
    const b = TweakStore.savePreset(id, 'B');
    TweakStore.clearActivePreset(id);
    TweakStore.updateValue(id, 'level', 0.5); // the pre-navigator sound
    return { id, a, b };
  };

  it('scrolling previews the rested row live without touching what is saved', () => {
    const { id, b } = setup();
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.scroll(10); // cursor to B
    expect(MovePresetStore.getView()?.cursor).toBe(b);
    expect(TweakStore.getValues(id).level).toBe(0.9); // B is sounding
    // …but nothing was recorded: no active preset, presets untouched.
    expect(TweakStore.getActivePresetId(id)).toBeNull();
    expect(TweakStore.getPresets(id).map((p) => p.values.level)).toEqual([0.1, 0.9]);
  });

  it('cancel (Back / Menu tap) restores the pre-navigator values and dismisses', () => {
    const { id } = setup();
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.scroll(10);
    expect(TweakStore.getValues(id).level).toBe(0.9);
    MovePresetStore.cancel();
    expect(TweakStore.getValues(id).level).toBe(0.5);
    expect(MovePresetStore.getView()?.phase).toBe('closing');
    vi.advanceTimersByTime(500);
    expect(MovePresetStore.getView()).toBeNull();
  });

  it('the compare hold plays the pre-navigator sound, release returns the preview', () => {
    const { id } = setup();
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.scroll(10); // cursor to B, level 0.9
    expect(TweakStore.getValues(id).level).toBe(0.9);
    MovePresetStore.compareStart();
    expect(MovePresetStore.getView()?.comparing).toBe(true);
    expect(TweakStore.getValues(id).level).toBe(0.5);
    MovePresetStore.compareEnd();
    expect(MovePresetStore.getView()?.comparing).toBe(false);
    expect(TweakStore.getValues(id).level).toBe(0.9);
  });

  it('confirm after previewing loads the preset for real', () => {
    const { id, b } = setup();
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.scroll(10);
    MovePresetStore.confirm();
    expect(TweakStore.getActivePresetId(id)).toBe(b);
    expect(TweakStore.getValues(id).level).toBe(0.9);
    // Cancel after a confirm takes nothing back.
    MovePresetStore.cancel();
    expect(TweakStore.getValues(id).level).toBe(0.9);
  });

  it('setPreviewEnabled(false) browses silently — values move only on confirm', () => {
    const { id, b } = setup();
    MovePresetStore.setPreviewEnabled(false);
    try {
      MovePresetStore.open(id);
      vi.advanceTimersByTime(50);
      MovePresetStore.scroll(10); // cursor to B
      expect(TweakStore.getValues(id).level).toBe(0.5); // untouched while browsing
      MovePresetStore.compareStart();
      expect(MovePresetStore.getView()?.comparing).toBe(false); // nothing to compare
      MovePresetStore.confirm();
      expect(TweakStore.getActivePresetId(id)).toBe(b);
      expect(TweakStore.getValues(id).level).toBe(0.9);
    } finally {
      MovePresetStore.setPreviewEnabled(true);
    }
  });
});

describe('MovePresetStore save', () => {
  it('beginSave suggests the next name and commitSave keeps a typed one', () => {
    const id = freshId();
    register(id);
    TweakStore.savePreset(id, 'A');
    MovePresetStore.beginSave(id);
    expect(MovePresetStore.getSaving()).toMatchObject({ panelId: id, suggested: 'Preset 2' });
    MovePresetStore.commitSave('  Sunset  ');
    expect(MovePresetStore.getSaving()).toBeNull();
    expect(TweakStore.getPresets(id).map((p) => p.name)).toEqual(['A', 'Sunset']);
  });

  it('an empty commit falls back to the suggestion, and cancel saves nothing', () => {
    const id = freshId();
    register(id);
    MovePresetStore.beginSave(id);
    MovePresetStore.commitSave('   ');
    expect(TweakStore.getPresets(id).map((p) => p.name)).toEqual(['Preset 1']);
    MovePresetStore.beginSave(id);
    MovePresetStore.cancelSave();
    expect(TweakStore.getPresets(id)).toHaveLength(1);
  });
});
