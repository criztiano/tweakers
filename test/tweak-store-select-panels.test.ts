import { describe, it, expect, afterEach } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';

// A root that names its panels draws those and nothing else — the capability
// that lets an app put one panel surface in the sidebar and a rack of others
// in the main pane without the two roots fighting over the same registry.

let seq = 0;
const registered: string[] = [];

/** Register under a unique id so the singleton stays clean between tests. */
const register = (name: string, id = `select-panels-${++seq}`) => {
  TweakStore.registerPanel(id, name, { level: 0.5 });
  registered.push(id);
  return id;
};

afterEach(() => {
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
});

const names = (only?: string | string[]) => TweakStore.selectPanels(only).map((p) => p.name);

describe('TweakStore.selectPanels', () => {
  it('returns every settings panel when nothing is named', () => {
    register('global');
    register('stage 1');
    expect(names()).toEqual(['global', 'stage 1']);
  });

  it('returns only the named panels, in the order named', () => {
    register('global');
    register('stage 1');
    register('stage 2');
    expect(names(['stage 2', 'stage 1'])).toEqual(['stage 2', 'stage 1']);
  });

  it('accepts a single name', () => {
    register('global');
    register('stage 1');
    expect(names('global')).toEqual(['global']);
  });

  it('leaves a gap for a name that has not registered yet', () => {
    register('stage 1');
    expect(names(['stage 1', 'stage 2'])).toEqual(['stage 1']);
  });

  // The bridge kit's `panels` takes an id or a name, and an app that names its
  // pages by id (a page renamed after what is on it) hands the same list to
  // the mirror and the agent: one rule for all three.
  it('takes a panel by its id as well as by its name, in the order named', () => {
    const global = register('global');
    const stage = register('stage 1');
    expect(names([stage, 'global'])).toEqual(['stage 1', 'global']);
    expect(names(global)).toEqual(['global']);
  });

  it('reads a key as an id before it reads it as a name', () => {
    register('drums', 'select-panels-bass');       // named like nothing else
    register('select-panels-bass', 'select-panels-other');   // NAMED like the first one's id
    expect(TweakStore.selectPanels('select-panels-bass').map((p) => p.id)).toEqual(['select-panels-bass']);
  });

  it('draws nothing when the filter is empty', () => {
    register('global');
    expect(names([])).toEqual([]);
  });
});
