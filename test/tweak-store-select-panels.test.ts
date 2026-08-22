import { describe, it, expect, afterEach } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';

// A root that names its panels draws those and nothing else — the capability
// that lets an app put one panel surface in the sidebar and a rack of others
// in the main pane without the two roots fighting over the same registry.

let seq = 0;
const registered: string[] = [];

/** Register under a unique id so the singleton stays clean between tests. */
const register = (name: string) => {
  const id = `select-panels-${++seq}`;
  TweakStore.registerPanel(id, name, { level: 0.5 });
  registered.push(id);
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

  it('draws nothing when the filter is empty', () => {
    register('global');
    expect(names([])).toEqual([]);
  });
});
