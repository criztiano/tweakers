import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { MoveSearchStore, moveSearchFilter, moveSearchMatch } from '../src/move-search';
import { MoveSurfaceStore } from '../src/move-surface-store';
import { MovePresetStore } from '../src/move-presets';
import { MoveColorStore, MOVE_COLOR_PALETTES } from '../src/move-color';

// Search, on whichever list has the wheel: the query narrows the rows, the
// wheel walks what is left, and the list's own store keeps its cursor.

describe('the query against a label', () => {
  it('keeps a row when every word occurs, any case, any order', () => {
    expect(moveSearchMatch('Film Grain', 'grain')).toBe(true);
    expect(moveSearchMatch('Film Grain', 'GRAIN film')).toBe(true);
    expect(moveSearchMatch('Film Grain', 'grain bloom')).toBe(false);
  });

  it('an empty query keeps everything', () => {
    expect(moveSearchFilter(['Bloom', 'Grain', 'Trails'], '   ')).toEqual([0, 1, 2]);
  });

  it('filters to indices, in list order', () => {
    expect(moveSearchFilter(['Bloom', 'Grain', 'Trails', 'Rain'], 'ai')).toEqual([1, 2, 3]);
    expect(moveSearchFilter(['Bloom', 'Grain'], 'zzz')).toEqual([]);
  });
});

describe('MoveSearchStore', () => {
  afterEach(() => {
    MoveSearchStore.close();
    MoveSurfaceStore.reset();
  });

  it('opens once, takes a query, and closes', () => {
    const seen: number[] = [];
    const off = MoveSearchStore.subscribe(() => seen.push(MoveSearchStore.getVersion()));
    MoveSearchStore.open('presets');
    expect(MoveSearchStore.getView()).toEqual({ target: 'presets', query: '', cursor: 0 });
    MoveSearchStore.open('screen', 4);            // already open: the first search holds
    expect(MoveSearchStore.getView()?.target).toBe('presets');
    MoveSearchStore.setQuery('gr');
    MoveSearchStore.setQuery('gr');               // a repeat says nothing
    expect(MoveSearchStore.getView()?.query).toBe('gr');
    MoveSearchStore.close();
    MoveSearchStore.close();
    expect(MoveSearchStore.isOpen()).toBe(false);
    expect(seen.length).toBe(3);
    off();
  });

  it('carries a wheel-list search out through the surface store, for the device', () => {
    MoveSurfaceStore.setScreen({ title: 'Effects', items: ['Bloom', 'Grain'], index: 1 });
    MoveSearchStore.open('screen', 1);
    expect(MoveSurfaceStore.getState().search).toEqual({ query: '', index: 1 });
    MoveSearchStore.setQuery('gr');
    MoveSearchStore.setCursor(1);
    expect(MoveSurfaceStore.getState().search).toEqual({ query: 'gr', index: 1 });
    MoveSearchStore.close();
    expect(MoveSurfaceStore.getState().search).toBeNull();
  });

  it('keeps the other lists off the device — the hardware screen is the wheel list alone', () => {
    MoveSearchStore.open('presets');
    MoveSearchStore.setQuery('a');
    expect(MoveSurfaceStore.getState().search).toBeNull();
  });
});

describe('the lists a search rests the wheel on', () => {
  const id = 'move-search-presets';
  beforeEach(() => {
    vi.useFakeTimers();
    TweakStore.registerPanel(id, id, { level: [0.5, 0, 1] as [number, number, number] });
  });
  afterEach(() => {
    MovePresetStore.close();
    vi.runAllTimers();
    vi.useRealTimers();
    TweakStore.unregisterPanel(id);
  });

  it('the preset navigator rests on a row by id and previews it like a wheel turn', () => {
    const a = TweakStore.savePreset(id, 'Alpha');
    TweakStore.updateValue(id, 'level', 0.9);
    const b = TweakStore.savePreset(id, 'Beta');
    TweakStore.loadPreset(id, a);
    MovePresetStore.open(id);
    vi.advanceTimersByTime(50);
    MovePresetStore.rest(b);
    expect(MovePresetStore.getView()?.cursor).toBe(b);
    expect(TweakStore.getValue(id, 'level')).toBe(0.9);
    MovePresetStore.rest('not-a-preset');
    expect(MovePresetStore.getView()?.cursor).toBe(b);
  });

  it('the palette navigator rests on a row by index, clamped to its rows', () => {
    // No colour editor open: the picker is closed and refuses the cursor.
    MoveColorStore.setPickerCursor(2);
    expect(MoveColorStore.getPickerCursor()).toBe(0);
    expect(MOVE_COLOR_PALETTES.length).toBeGreaterThan(0);
  });
});
