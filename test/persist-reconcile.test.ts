import { describe, it, expect, afterEach, vi } from 'vitest';
import { TweakStore, type TweakConfig, type TweakValue } from '../src/store/TweakStore';
import { buildMovePages, MOVE_DIALS } from '../src/move-layout';
import { resolvePersistTarget, savePersisted, loadPersisted } from '../src/store/persist';

// The lego rule, pinned: registration is the source of truth. Persisted
// state from an OLDER config shape is reconciled against the CURRENT
// registration — compatible values survive, incompatible ones drop, and
// nothing on the shelf can change the built layout. The scenario mirrors the
// real regression: a panel reworked from a gradient ramp to the balance
// pattern (two colour chips + a balance dial), loaded in a browser still
// holding the old shape.

type GlobalWithWindow = { window?: unknown };

function mockStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => { map.set(k, String(v)); },
    removeItem: (k: string) => { map.delete(k); },
  };
}

const g = globalThis as GlobalWithWindow;
const originalWindow = g.window;

function installWindow() {
  g.window = { localStorage: mockStorage() };
}

const registered: string[] = [];
const register = (id: string, config: TweakConfig, persist = true) => {
  TweakStore.registerPanel(id, id, config, undefined, persist ? { persist: true } : {});
  registered.push(id);
};

afterEach(() => {
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
  if (originalWindow === undefined) delete g.window;
  else g.window = originalWindow;
  vi.restoreAllMocks();
});

/** The reworked panel: colour is a balance — the old shape had a ramp. */
const NEW_CONFIG: TweakConfig = {
  speed: [1, 0, 4] as [number, number, number],
  threshold: [0.5, 0, 1] as [number, number, number],
  mode: { type: 'select', options: ['fbm', 'ridged'] },
  colorA: { type: 'color', default: '#632ad5' },
  colorB: { type: 'color', default: '#fccff7' },
  balance: { type: 'balance', a: 'colorA', b: 'colorB', default: 0.5 },
};

/** A plausible stale blob: saved when the panel was ramp-shaped. */
const STALE_BLOB: Record<string, TweakValue> = {
  speed: 2.5,                                     // still a slider — survives
  threshold: 7,                                   // out of range — clamps
  mode: 'retired-mode',                           // option gone — drops
  colorA: '#111111',                              // still a colour — survives
  colorRamp: { stops: [{ color: '#632ad5', position: 0 }, { color: '#fccff7', position: 1 }] },
  balance: '#632ad5',                             // was never a mix — drops
};

function seedStale(id: string) {
  savePersisted(resolvePersistTarget('panel', id, true), STALE_BLOB);
}

/** Layout as comparable data: which control path holds each column. */
const layoutShape = (id: string) => {
  const page = buildMovePages([TweakStore.getPanel(id)!])[0];
  const paths = (row: (undefined | { path: string })[]) =>
    Array.from({ length: MOVE_DIALS }, (_, i) => row[i]?.path ?? null);
  return {
    dials: paths(page.dials),
    toggles: paths(page.toggles),
    values: paths(page.values),
    actions: paths(page.actions),
  };
};

describe('persisted state vs the current registration (the lego rule)', () => {
  it('a mismatched persisted shape cannot change the built layout', () => {
    installWindow();
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    register('reconcile-clean', NEW_CONFIG, false);
    const clean = layoutShape('reconcile-clean');

    seedStale('reconcile-stale');
    register('reconcile-stale', NEW_CONFIG);
    const stale = layoutShape('reconcile-stale');

    expect(stale).toEqual(clean);
    // The balance keeps its dial, its colours their auto-seated chips.
    expect(stale.dials).toContain('balance');
    expect(stale.toggles).toContain('colorA');
    expect(stale.values).toContain('colorB');
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('compatible values survive a reshape; incompatible ones drop, once said', () => {
    installWindow();
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    seedStale('reconcile-values');
    register('reconcile-values', NEW_CONFIG);
    const values = TweakStore.getValues('reconcile-values');

    expect(values.speed).toBe(2.5);                 // survived
    expect(values.colorA).toBe('#111111');          // survived
    expect(values.threshold).toBe(1);               // clamped into range
    expect(values.mode).toBe('fbm');                // stale option → default
    expect(values.balance).toBe(0.5);               // stale type → default
    expect('colorRamp' in values).toBe(false);      // stale path → gone
    expect(info).toHaveBeenCalledTimes(1);
    expect(String(info.mock.calls[0][0])).toContain('colorRamp');
  });

  it('a persisted transition mode is kept only for a transition control', () => {
    installWindow();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const id = 'reconcile-mode';
    savePersisted(resolvePersistTarget('panel', id, true), {
      'pop.__mode': 'advanced',
      'speed.__mode': 'advanced',
      pop: { type: 'spring', stiffness: 200, damping: 20 },
    });
    register(id, {
      pop: { type: 'spring' },
      speed: [1, 0, 4] as [number, number, number],
    });
    expect(TweakStore.getTransitionMode(id, 'pop')).toBe('advanced');
    expect(TweakStore.getValues(id)['speed.__mode']).toBeUndefined();
  });

  it('a stale active tab falls back to the first tab', () => {
    installWindow();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const id = 'reconcile-tab';
    savePersisted(resolvePersistTarget('panel', id, true), { _tab: 'retiredTab' });
    register(id, {
      _tabs: true,
      shape: { size: [1, 0, 2] as [number, number, number] },
      motion: { rate: [1, 0, 2] as [number, number, number] },
    });
    expect(TweakStore.getValues(id)._tab).toBe('shape');
  });

  it('saves reconciled values back, so the shelf converges on the new shape', () => {
    installWindow();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const id = 'reconcile-resave';
    seedStale(id);
    register(id, NEW_CONFIG);
    TweakStore.updateValue(id, 'speed', 3);
    const saved = loadPersisted<Record<string, TweakValue>>(resolvePersistTarget('panel', id, true));
    expect(saved?.speed).toBe(3);
    expect(saved && 'colorRamp' in saved).toBe(false);
  });
});

describe('presets vs the current registration', () => {
  // The decision, pinned: a preset is never invalidated wholesale. Its living
  // paths apply (normalized by the control now at each path), its dead paths
  // are ignored at apply time, and paths it never named keep the panel's
  // current values. Regained paths revive on the next apply.
  it('drops a preset\'s dead paths and keeps the rest', () => {
    register('preset-reshape', {
      size: [10, 0, 100] as [number, number, number],
      legacy: true,
    }, false);
    TweakStore.updateValue('preset-reshape', 'size', 80);
    TweakStore.updateValue('preset-reshape', 'legacy', false);
    const presetId = TweakStore.savePreset('preset-reshape', 'Captured');
    // Step off the preset so later edits stop auto-saving into it.
    TweakStore.clearActivePreset('preset-reshape');

    // The panel reshapes: `legacy` leaves, `extra` arrives, size's range shrinks.
    TweakStore.updatePanel('preset-reshape', 'preset-reshape', {
      size: [10, 0, 50] as [number, number, number],
      extra: 'hello',
    });
    TweakStore.updateValue('preset-reshape', 'size', 5);
    TweakStore.updateValue('preset-reshape', 'extra', 'edited');

    TweakStore.loadPreset('preset-reshape', presetId);
    const values = TweakStore.getValues('preset-reshape');
    expect(values.size).toBe(50);                    // preset's 80, clamped to the new range
    expect(values.extra).toBe('edited');             // never in the preset — keeps current
    expect('legacy' in values).toBe(false);          // dead path stays dead
  });

  it('previewValues reconciles the same way', () => {
    register('preset-preview', { amount: [0.5, 0, 1] as [number, number, number] }, false);
    TweakStore.previewValues('preset-preview', {
      amount: 9,                                     // out of range — clamps
      ghost: 1,                                      // unknown path — ignored
    } as Record<string, TweakValue>);
    const values = TweakStore.getValues('preset-preview');
    expect(values.amount).toBe(1);
    expect('ghost' in values).toBe(false);
  });
});
