import { describe, expect, it } from 'vitest';
import {
  isSelectFolder, selectFitPlace, selectHasFolders, selectLeaves, selectLevel, selectPathOf, selectPlaceOf, selectTap,
  selectWalk, type SelectOption,
} from '../src/select-tree-core';

// Type, the control: two plain options, a folder of blurs (one of them a
// folder of its own), and a folder of noises.
const TREE: SelectOption[] = [
  'none',
  { value: 'sharpen', label: 'Sharpen' },
  {
    label: 'Blur',
    options: [
      { value: 'gaussian', label: 'Gaussian' },
      'box',
      { label: 'Motion', options: ['linear', 'radial'] },
    ],
  },
  { label: 'Noise', icon: 'waves', options: ['grain', 'static'] },
];

describe('the option tree', () => {
  it('tells a folder from an option: a folder has options and no value', () => {
    expect(isSelectFolder(TREE[2])).toBe(true);
    expect(isSelectFolder(TREE[1])).toBe(false);
    expect(isSelectFolder('none')).toBe(false);
    expect(isSelectFolder({ value: 'x', label: 'X', options: [] })).toBe(false);
    expect(selectHasFolders(TREE)).toBe(true);
    expect(selectHasFolders(['a', { value: 'b', label: 'B' }])).toBe(false);
  });

  it('reads its leaves in order, a folder’s where the folder stands', () => {
    expect(selectLeaves(TREE).map((o) => (typeof o === 'string' ? o : o.value)))
      .toEqual(['none', 'sharpen', 'gaussian', 'box', 'linear', 'radial', 'grain', 'static']);
    const flat = ['a', { value: 'b', label: 'B' }];
    expect(selectLeaves(flat)).toEqual(flat);
  });

  it('finds where a value sits, folders first', () => {
    expect(selectPathOf(TREE, 'sharpen')).toEqual([1]);
    expect(selectPathOf(TREE, 'box')).toEqual([2, 1]);
    expect(selectPathOf(TREE, 'radial')).toEqual([2, 2, 1]);
    expect(selectPathOf(TREE, 'missing')).toBeNull();
  });

  it('opens on the value’s folder with the cursor on it, or the top for a stranger', () => {
    expect(selectPlaceOf(TREE, 'radial')).toEqual({ open: [2, 2], cursor: 1 });
    expect(selectPlaceOf(TREE, 'none')).toEqual({ open: [], cursor: 0 });
    expect(selectPlaceOf(TREE, 'missing')).toEqual({ open: [], cursor: 0 });
  });

  it('keeps a place on the tree: a dead path is the top, the cursor stays on the level', () => {
    expect(selectFitPlace(TREE, { open: [0], cursor: 1 })).toEqual({ open: [], cursor: 1 });
    expect(selectFitPlace(TREE, { open: [], cursor: -1 })).toEqual({ open: [], cursor: 0 });
    expect(selectFitPlace(TREE, { open: [2], cursor: -4 })).toEqual({ open: [2], cursor: -1 });
    expect(selectFitPlace(TREE, { open: [2], cursor: 9 })).toEqual({ open: [2], cursor: 2 });
  });
});

describe('a level', () => {
  it('at the top: the control names it, folders are marked, no way back', () => {
    const level = selectLevel(TREE, 'Type', { open: [], cursor: 0 }, 'box');
    expect(level.title).toBe('Type');
    expect(level.back).toBeNull();
    expect(level.rows.map((r) => [r.label, r.folder])).toEqual([
      ['none', false], ['Sharpen', false], ['Blur', true], ['Noise', true],
    ]);
    // the folder holding the value says so; the others do not
    expect(level.rows[2].holds).toBe(true);
    expect(level.rows[3].holds).toBeUndefined();
    expect(level.rows[3].icon).toBe('waves');
  });

  it('one folder in: the folder names it, the back pill names the control', () => {
    const level = selectLevel(TREE, 'Type', { open: [2], cursor: 1 }, 'box');
    expect(level.title).toBe('Blur');
    expect(level.back).toBe('Type');
    expect(level.rows.map((r) => r.value ?? r.label)).toEqual(['gaussian', 'box', 'Motion']);
  });

  it('two folders in: the back pill names the folder above', () => {
    const level = selectLevel(TREE, 'Type', { open: [2, 2], cursor: -1 }, 'box');
    expect(level.title).toBe('Motion');
    expect(level.back).toBe('Blur');
    expect(level.cursor).toBe(-1);
  });
});

describe('walking a level', () => {
  it('landing on an option selects it', () => {
    expect(selectWalk(TREE, { open: [], cursor: 0 }, 1)).toEqual({ place: { open: [], cursor: 1 }, value: 'sharpen' });
    expect(selectWalk(TREE, { open: [2], cursor: 0 }, 1)).toEqual({ place: { open: [2], cursor: 1 }, value: 'box' });
  });

  it('landing on a folder only moves the cursor', () => {
    expect(selectWalk(TREE, { open: [], cursor: 1 }, 2)).toEqual({ place: { open: [], cursor: 2 } });
  });

  it('up past the first row inside a folder is the back pill; at the top it stops', () => {
    expect(selectWalk(TREE, { open: [2], cursor: 0 }, -1)).toEqual({ place: { open: [2], cursor: -1 } });
    expect(selectWalk(TREE, { open: [2], cursor: 0 }, -5)).toEqual({ place: { open: [2], cursor: -1 } });
    expect(selectWalk(TREE, { open: [], cursor: 0 }, -1)).toEqual({ place: { open: [], cursor: 0 }, value: 'none' });
  });

  it('stops at the last row', () => {
    expect(selectWalk(TREE, { open: [3], cursor: 0 }, 7).place).toEqual({ open: [3], cursor: 1 });
  });
});

describe('a tap', () => {
  it('opens a folder on the way to the value when the value is inside', () => {
    expect(selectTap(TREE, { open: [], cursor: 2 }, 'box')).toEqual({ open: [2], cursor: 1 });
    // deeper inside: the cursor lands on the folder that leads there
    expect(selectTap(TREE, { open: [], cursor: 2 }, 'radial')).toEqual({ open: [2], cursor: 2 });
  });

  it('opens a folder on the back pill when the value is elsewhere', () => {
    expect(selectTap(TREE, { open: [], cursor: 3 }, 'box')).toEqual({ open: [3], cursor: -1 });
  });

  it('on the back pill goes up, the cursor on the folder it left', () => {
    expect(selectTap(TREE, { open: [2, 2], cursor: -1 }, 'box')).toEqual({ open: [2], cursor: 2 });
    expect(selectTap(TREE, { open: [2], cursor: -1 }, 'box')).toEqual({ open: [], cursor: 2 });
  });

  it('on an option changes nothing: it is already selected', () => {
    expect(selectTap(TREE, { open: [2], cursor: 1 }, 'box')).toEqual({ open: [2], cursor: 1 });
  });
});
