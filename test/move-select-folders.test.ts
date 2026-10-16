import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';
import { buildMovePages, isEnumDial } from '../src/move-layout';
import { MOVE_SLOT_LIBRARY, MoveSlotEnumBody, moveSlotKind } from '../src/components/move-slots';
import {
  moveChipValue, moveListBackAt, moveSelectAria, moveSelectClick, moveSelectFromWalk, moveSelectWalkCount,
  moveSelectWalkIndex,
} from '../src/move-slot-core';

const ids: string[] = [];
let sequence = 0;
const register = (config: TweakConfig) => {
  const id = `select-folders-${++sequence}`;
  ids.push(id);
  TweakStore.registerPanel(id, id, config);
  return id;
};

afterEach(() => {
  for (const id of ids.splice(0)) TweakStore.unregisterPanel(id);
});

const type = (fallback?: string) => ({
  type: 'select' as const,
  ...(fallback ? { default: fallback } : {}),
  options: [
    'none',
    { label: 'Blur', options: [{ value: 'gaussian', label: 'Gaussian' }, 'box'] },
    { label: 'Noise', options: ['grain', { label: 'Colour', options: ['red', 'blue'] }] },
  ],
});

const meta = (id: string, path = 'type') => TweakStore.getPanel(id)!.controls.find((c) => c.path === path)!;

describe('a select with folders, in the store', () => {
  it('lists its leaves as its options and keeps the tree beside them', () => {
    const id = register({ type: type() });
    const m = meta(id);
    expect(m.options!.map((o) => (typeof o === 'string' ? o : o.value)))
      .toEqual(['none', 'gaussian', 'box', 'grain', 'red', 'blue']);
    expect(m.optionTree).toHaveLength(3);
    // with no default, the first leaf
    expect(TweakStore.getValue(id, 'type')).toBe('none');
  });

  it('leaves a flat select exactly as it was', () => {
    const id = register({ mode: { type: 'select', options: ['a', { value: 'b', label: 'B' }] } });
    const m = meta(id, 'mode');
    expect(m.options).toEqual(['a', { value: 'b', label: 'B' }]);
    expect('optionTree' in m).toBe(false);
    expect(TweakStore.getSelectLevel(id, 'mode')).toBeNull();
  });

  it('takes a default inside a folder, and a dial on the Move', () => {
    const id = register({ type: type('box') });
    expect(TweakStore.getValue(id, 'type')).toBe('box');
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    expect(page.dials.map((c) => c.path)).toEqual(['type']);
    expect(isEnumDial(page.dials[0])).toBe(true);
  });

  it('opens on the value’s folder, the cursor on the value', () => {
    const id = register({ type: type('box') });
    const level = TweakStore.getSelectLevel(id, 'type')!;
    expect(level).toMatchObject({ open: [1], title: 'Blur', back: 'Type', cursor: 1 });
  });

  it('turning selects an option it lands on, and only moves the cursor onto a folder', () => {
    const id = register({ type: type() });
    TweakStore.setSelectCursor(id, 'type', 1);
    expect(TweakStore.getValue(id, 'type')).toBe('none');
    expect(TweakStore.getSelectLevel(id, 'type')!.cursor).toBe(1);
    TweakStore.tapSelect(id, 'type');
    // the value is not in Blur: the cursor waits on the back pill
    expect(TweakStore.getSelectLevel(id, 'type')).toMatchObject({ open: [1], cursor: -1, back: 'Type' });
    expect(TweakStore.getValue(id, 'type')).toBe('none');
    TweakStore.setSelectCursor(id, 'type', 0);
    expect(TweakStore.getValue(id, 'type')).toBe('gaussian');
    TweakStore.setSelectCursor(id, 'type', -1);
    expect(TweakStore.getValue(id, 'type')).toBe('gaussian');
    TweakStore.tapSelect(id, 'type');
    expect(TweakStore.getSelectLevel(id, 'type')).toMatchObject({ open: [], cursor: 1 });
    expect(TweakStore.getSelectLevel(id, 'type')!.rows[1].holds).toBe(true);
  });

  it('follows a value changed from outside — an undo, a preset, the app', () => {
    const id = register({ type: type() });
    TweakStore.setSelectCursor(id, 'type', 2);
    TweakStore.tapSelect(id, 'type');
    expect(TweakStore.getSelectLevel(id, 'type')!.open).toEqual([2]);
    TweakStore.updateValue(id, 'type', 'box');
    expect(TweakStore.getSelectLevel(id, 'type')).toMatchObject({ open: [1], cursor: 1 });
    TweakStore.updateValue(id, 'type', 'blue');
    expect(TweakStore.getSelectLevel(id, 'type')).toMatchObject({ open: [2, 1], cursor: 1, title: 'Colour', back: 'Noise' });
  });

  it('announces a move of the cursor on the control-state channel, and nothing for a standstill', () => {
    const id = register({ type: type() });
    let heard = 0;
    const off = TweakStore.subscribeControlState(id, () => { heard++; });
    TweakStore.setSelectCursor(id, 'type', 1);
    expect(heard).toBe(1);
    TweakStore.setSelectCursor(id, 'type', 1);
    expect(heard).toBe(1);
    TweakStore.tapSelect(id, 'type');
    expect(heard).toBe(2);
    off();
  });
});

describe('a select with folders, on the slot', () => {
  it('wears the folders face, a member of the library', () => {
    const id = register({ type: type() });
    expect(moveSlotKind(meta(id), { enum: true, value: 'none' })).toBe('folders');
    expect(MOVE_SLOT_LIBRARY.folders.component).toBe(MoveSlotEnumBody);
  });

  it('draws one level: folder rows with the page chevron, the folder holding the value lit', () => {
    const id = register({ type: type('red') });
    TweakStore.updateValue(id, 'type', 'red');
    TweakStore.setSelectCursor(id, 'type', -1);
    TweakStore.tapSelect(id, 'type');
    TweakStore.setSelectCursor(id, 'type', -1);
    TweakStore.tapSelect(id, 'type');
    const level = TweakStore.getSelectLevel(id, 'type')!;
    expect(level).toMatchObject({ open: [], cursor: 2 });
    const html = renderToStaticMarkup(createElement(MoveSlotEnumBody, {
      label: 'Type', optionLabel: 'red', options: meta(id).options!, activeIdx: 4, shape: null, glyph: null, level,
    }));
    expect(html).toContain('<span class="tweakers-move-dial-head">Type</span>');
    expect(html).not.toContain('tweakers-list-screen-back');
    expect(html.match(/data-detail="page"/g)).toHaveLength(2);
    // Noise holds the value and has the cursor: lit, and selected
    expect(html).toMatch(/data-selected="true"[^>]*data-detail="page" data-checked="true"/);
  });

  it('inside a folder, names the folder and wears the back pill — lit while the cursor is on it', () => {
    const id = register({ type: type() });
    TweakStore.setSelectCursor(id, 'type', 1);
    TweakStore.tapSelect(id, 'type');
    const level = TweakStore.getSelectLevel(id, 'type')!;
    const html = renderToStaticMarkup(createElement(MoveSlotEnumBody, {
      label: 'Type', optionLabel: 'none', options: meta(id).options!, activeIdx: 0, shape: null, glyph: null, level,
    }));
    expect(html).toContain('<span class="tweakers-move-dial-head">Blur</span>');
    expect(html).toMatch(/class="tweakers-list-screen-back" aria-label="Back to Type" data-selected="true"/);
    expect(html).not.toMatch(/tweakers-list-screen-row" data-selected/);
    // the pill counts as a row of the grown screen
    expect(html).toContain('--move-list-count:3');
  });

  it('still reads out the selected option, wherever the list is open', () => {
    const id = register({ type: type('box') });
    TweakStore.setSelectCursor(id, 'type', -1);
    TweakStore.tapSelect(id, 'type');
    expect(moveChipValue(meta(id), TweakStore.getValue(id, 'type')).num).toBe('box');
  });
});

describe('the folder list’s gestures', () => {
  const top = { open: [], title: 'Type', back: null, cursor: 1, rows: [
    { label: 'none', value: 'none', folder: false }, { label: 'Blur', folder: true },
  ] };
  const inside = { open: [1], title: 'Blur', back: 'Type', cursor: -1, rows: [
    { label: 'Gaussian', value: 'gaussian', folder: false }, { label: 'box', value: 'box', folder: false },
  ] };

  it('walks the back pill as the first row inside a folder', () => {
    expect(moveSelectWalkCount(top)).toBe(2);
    expect(moveSelectWalkIndex(top)).toBe(1);
    expect(moveSelectWalkCount(inside)).toBe(3);
    expect(moveSelectWalkIndex(inside)).toBe(0);
    expect(moveSelectFromWalk(inside, 0)).toBe(-1);
    expect(moveSelectFromWalk(inside, 2)).toBe(1);
  });

  it('a click is a tap where it lands', () => {
    // a folder row: the cursor goes there and it opens
    expect(moveSelectClick(top, 1, false)).toEqual({ cursor: 1, tap: true });
    // an option row: the cursor goes there, which selects it
    expect(moveSelectClick(top, 0, false)).toEqual({ cursor: 0, tap: false });
    // the pill: up
    expect(moveSelectClick(inside, -1, true)).toEqual({ cursor: -1, tap: true });
    // the head: the cursor's own row is tapped
    expect(moveSelectClick(top, -1, false)).toEqual({ tap: true });
  });

  it('finds a press on the pill', () => {
    const pill = { left: 4, top: 20, width: 60, height: 14 };
    expect(moveListBackAt(pill, { clientX: 10, clientY: 25, shiftKey: false })).toBe(true);
    expect(moveListBackAt(pill, { clientX: 10, clientY: 40, shiftKey: false })).toBe(false);
    expect(moveListBackAt(null, { clientX: 10, clientY: 25, shiftKey: false })).toBe(false);
  });

  it('reads the cursor row aloud', () => {
    expect(moveSelectAria('Type', inside, 'box')['aria-valuetext']).toBe('Back to Type');
    expect(moveSelectAria('Type', top, 'none')['aria-valuetext']).toBe('Blur, folder');
    expect(moveSelectAria('Type', { ...inside, cursor: 1 }, 'box')['aria-valuetext']).toBe('box, chosen (in Blur)');
  });
});
