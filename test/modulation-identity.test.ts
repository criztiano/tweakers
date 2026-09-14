import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Modulation assignments follow the panel's NAME, not its id: gallery-style
// hosts mint positional ids (`gallery-N`) per mount, so after a reload the
// same id belongs to a different effect. A persisted wire must wait for the
// panel it was made on — never land on whoever inherited its old id.

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
const MOD_KEY = 'tweakers:v1:modulation:global';

/** A fresh module graph (fresh singletons) over a seeded localStorage. */
async function freshStores(persisted?: unknown) {
  vi.resetModules();
  const storage = mockStorage();
  if (persisted !== undefined) storage.setItem(MOD_KEY, JSON.stringify(persisted));
  g.window = { localStorage: storage, requestAnimationFrame: () => 0 };
  const { TweakStore } = await import('../src/store/TweakStore');
  const { ModulationStore } = await import('../src/store/ModulationStore');
  return { TweakStore, ModulationStore, storage };
}

beforeEach(() => { vi.resetModules(); });
afterEach(() => {
  if (originalWindow === undefined) delete g.window;
  else g.window = originalWindow;
  vi.resetModules();
});

const SPEED = { speed: [50, 0, 100] as [number, number, number] };

describe('assignment identity across reloads', () => {
  it('a saved wire waits for its panel name, not whoever took its old id', async () => {
    const { TweakStore, ModulationStore } = await freshStores({
      slots: [{ index: 0, type: 'lfo', params: {} }],
      assignments: [
        { panelId: 'gallery-1', path: 'speed', slot: 0, amount: 0.5, panelName: 'Perlin Noise' },
      ],
    });

    // The reloaded session opens a DIFFERENT effect first — it gets gallery-1.
    TweakStore.registerPanel('gallery-1', 'Metaballs', SPEED);
    expect(ModulationStore.getAssignment('gallery-1', 'speed')).toBeUndefined();

    // The effect the wire was made on registers under a fresh positional id.
    TweakStore.registerPanel('gallery-2', 'Perlin Noise', SPEED);
    const bound = ModulationStore.getAssignment('gallery-2', 'speed');
    expect(bound).toMatchObject({ slot: 0, amount: 0.5, panelName: 'Perlin Noise' });
    expect(ModulationStore.getAssignment('gallery-1', 'speed')).toBeUndefined();

    TweakStore.unregisterPanel('gallery-1');
    TweakStore.unregisterPanel('gallery-2');
  });

  it('a nameless legacy record still binds by id', async () => {
    const { TweakStore, ModulationStore } = await freshStores({
      slots: [{ index: 0, type: 'lfo', params: {} }],
      assignments: [{ panelId: 'fx', path: 'speed', slot: 0, amount: 0.25 }],
    });
    TweakStore.registerPanel('fx', 'FX', SPEED);
    expect(ModulationStore.getAssignment('fx', 'speed')).toMatchObject({ amount: 0.25 });
    TweakStore.unregisterPanel('fx');
  });

  it('an unbound wire survives further saves while its panel never shows', async () => {
    const { TweakStore, ModulationStore, storage } = await freshStores({
      slots: [{ index: 0, type: 'lfo', params: {} }],
      assignments: [
        { panelId: 'gallery-3', path: 'speed', slot: 0, amount: 0.5, panelName: 'Perlin Noise' },
      ],
    });
    // Something unrelated changes and persists.
    TweakStore.registerPanel('gallery-1', 'Metaballs', SPEED);
    ModulationStore.createSlot(1);
    const saved = JSON.parse(storage.getItem(MOD_KEY)!);
    expect(saved.assignments).toContainEqual(
      expect.objectContaining({ path: 'speed', panelName: 'Perlin Noise' })
    );
    TweakStore.unregisterPanel('gallery-1');
  });

  it('re-keys a live wire when its panel re-registers under a new id', async () => {
    const { TweakStore, ModulationStore } = await freshStores();
    TweakStore.registerPanel('gallery-1', 'Perlin Noise', SPEED);
    ModulationStore.createSlot(0);
    expect(ModulationStore.assign('gallery-1', 'speed', 0, 0.7)).toBe(true);

    // The gallery switches effects and back: same name, fresh id.
    TweakStore.unregisterPanel('gallery-1');
    TweakStore.registerPanel('gallery-2', 'Metaballs', SPEED);
    TweakStore.registerPanel('gallery-3', 'Perlin Noise', SPEED);

    expect(ModulationStore.getAssignment('gallery-3', 'speed')).toMatchObject({ amount: 0.7 });
    expect(ModulationStore.getAssignment('gallery-1', 'speed')).toBeUndefined();
    expect(ModulationStore.getAssignment('gallery-2', 'speed')).toBeUndefined();

    TweakStore.unregisterPanel('gallery-2');
    TweakStore.unregisterPanel('gallery-3');
  });

  it('a new wire records the panel name it will persist under', async () => {
    const { TweakStore, ModulationStore, storage } = await freshStores();
    TweakStore.registerPanel('gallery-1', 'Perlin Noise', SPEED);
    ModulationStore.createSlot(0);
    ModulationStore.assign('gallery-1', 'speed', 0);
    const saved = JSON.parse(storage.getItem(MOD_KEY)!);
    expect(saved.assignments[0]).toMatchObject({
      panelId: 'gallery-1',
      panelName: 'Perlin Noise',
    });
    TweakStore.unregisterPanel('gallery-1');
  });
});
