import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';
import { buildMovePages, isMoveDial, setMoveLayoutReporter, visibleColumns } from '../src/move-layout';
import { buildMoveStrip } from '../src/move-strip';
import { MOVE_SLOT_LIBRARY, MoveSlotMultiselectBody, moveSlotKind } from '../src/components/move-slots';
import {
  moveListAria, moveListKey, moveListRowAt, moveListWalk, moveMultiselectChecked, moveMultiselectToggle, movePressStart,
} from '../src/move-slot-core';

const ids: string[] = [];
let sequence = 0;
const register = (config: TweakConfig, movePads?: Record<string, number>) => {
  const id = `multiselect-dial-${++sequence}`;
  ids.push(id);
  TweakStore.registerPanel(id, id, config, undefined, { movePads });
  return TweakStore.getPanel(id)!;
};
const models = (options: (string | { value: string; label: string })[] = ['flux', 'sdxl', 'recraft'], defaults: string[] = []) =>
  ({ type: 'multiselect' as const, options, default: defaults });
const sliders = (count: number) => Object.fromEntries(Array.from({ length: count }, (_, i) => [`gain${i}`, [0.5, 0, 1]]));

afterEach(() => {
  for (const id of ids.splice(0)) TweakStore.unregisterPanel(id);
  setMoveLayoutReporter(null);
});

describe('a multiselect on the Move', () => {
  it('is seated as a dial of one column, in the order it is declared', () => {
    const panel = register({ amount: [0.5, 0, 1], models: models(), seed: [1, 0, 9, 1] });
    const [page] = buildMovePages([panel]);
    expect(page.dials.map((c) => c.path)).toEqual(['amount', 'models', 'seed']);
    expect(visibleColumns(page)).toEqual([0, 1, 2]);
    expect(isMoveDial(page.dials[1])).toBe(true);
  });

  it('holds its column with no rows yet, so a list still loading never shifts the page', () => {
    const [page] = buildMovePages([register({ models: models([]), amount: [0.5, 0, 1] })]);
    expect(page.dials.map((c) => c.path)).toEqual(['models', 'amount']);
  });

  it('is never a value chip: past the eighth column it is dropped, out loud', () => {
    const issues: string[] = [];
    setMoveLayoutReporter((code) => issues.push(code));
    const [page] = buildMovePages([register({ ...sliders(8), models: models() })]);
    expect(page.dials).toHaveLength(8);
    expect(page.dials.some((c) => c.path === 'models')).toBe(false);
    expect([...page.values, ...page.toggles, ...page.actions].some((c) => c?.path === 'models')).toBe(false);
    expect(issues).toContain('dial-dropped');
  });

  it('ignores a movePads column, like every dial', () => {
    const issues: string[] = [];
    setMoveLayoutReporter((code) => issues.push(code));
    const [page] = buildMovePages([register({ models: models() }, { models: 3 })]);
    expect(page.dials[0].path).toBe('models');
    expect(page.values.some((c) => c?.path === 'models')).toBe(false);
    expect(issues).toContain('pad-column-on-dial');
  });

  it('is one stop on the scrolling strip', () => {
    const strip = buildMoveStrip(register({ amount: [0.5, 0, 1], models: models() }));
    expect(strip.dials.map((c) => c.path)).toEqual(['amount', 'models']);
  });

  it('wears the multiselect face from the library', () => {
    const [meta] = register({ models: models() }).controls;
    expect(moveSlotKind(meta)).toBe('multiselect');
    expect(MOVE_SLOT_LIBRARY.multiselect.component).toBe(MoveSlotMultiselectBody);
  });
});

describe('the multiselect config', () => {
  it('takes plain strings as rows that are their own value and label', () => {
    const [meta] = register({ models: models(['Flux', { value: 'sdxl', label: 'SDXL' }]) }).controls;
    expect(meta.multiSelectOptions).toEqual([{ value: 'Flux', label: 'Flux' }, { value: 'sdxl', label: 'SDXL' }]);
  });

  it('keeps one cursor per control, clamped to its rows, on the control-state channel', () => {
    const panel = register({ models: models() });
    let calls = 0;
    const off = TweakStore.subscribeControlState(panel.id, () => { calls++; });
    expect(TweakStore.getListCursor(panel.id, 'models')).toBe(0);
    TweakStore.setListCursor(panel.id, 'models', 2);
    expect(TweakStore.getListCursor(panel.id, 'models')).toBe(2);
    TweakStore.setListCursor(panel.id, 'models', 9);
    expect(TweakStore.getListCursor(panel.id, 'models')).toBe(2);
    expect(calls).toBe(1);
    // the cursor is not the value
    expect(TweakStore.getValue(panel.id, 'models')).toEqual([]);
    off();
  });

  it('pulls a cursor back in when the rows shrink under it', () => {
    const panel = register({ models: models() });
    TweakStore.setListCursor(panel.id, 'models', 2);
    TweakStore.updatePanel(panel.id, panel.id, { models: models(['flux']) });
    expect(TweakStore.getListCursor(panel.id, 'models')).toBe(0);
  });
});

describe('ticking rows', () => {
  const meta = () => register({ models: models() }).controls[0];

  it('adds and removes a row, the value always in option order', () => {
    const m = meta();
    expect(moveMultiselectToggle(m, ['recraft'], 'flux')).toEqual(['flux', 'recraft']);
    expect(moveMultiselectToggle(m, ['flux', 'recraft'], 'flux')).toEqual(['recraft']);
    expect(moveMultiselectToggle(m, [], 'sdxl')).toEqual(['sdxl']);
  });

  it('drops values the rows no longer offer, and reads a bad value as nothing chosen', () => {
    const m = meta();
    expect(moveMultiselectChecked(m, ['gone', 'sdxl'])).toEqual(['sdxl']);
    expect(moveMultiselectChecked(m, 'flux')).toEqual([]);
    expect(moveMultiselectToggle(m, ['gone'], 'flux')).toEqual(['flux']);
  });

  it('writes string[] through the store like any value', () => {
    const panel = register({ models: models() });
    const [m] = panel.controls;
    TweakStore.updateValue(panel.id, 'models', moveMultiselectToggle(m, TweakStore.getValue(panel.id, 'models'), 'sdxl'));
    expect(TweakStore.getValue(panel.id, 'models')).toEqual(['sdxl']);
  });
});

describe('the list gestures', () => {
  it('walks a row per row height of travel, down being the next row', () => {
    const p = movePressStart('models', { clientX: 0, clientY: 100, shiftKey: false }, 1);
    expect(moveListWalk(p, { clientX: 0, clientY: 133, shiftKey: false }, 5)).toBe(3);
    expect(moveListWalk(p, { clientX: 0, clientY: 60, shiftKey: false }, 5)).toBe(0);
    expect(moveListWalk(p, { clientX: 0, clientY: 900, shiftKey: false }, 5)).toBe(4);
  });

  it('finds the row a still press landed on, and none off the rows', () => {
    const rows = [0, 1, 2].map((i) => ({ left: 0, top: 20 + i * 20, width: 100, height: 20 }));
    expect(moveListRowAt(rows, null, { clientX: 50, clientY: 45, shiftKey: false })).toBe(1);
    expect(moveListRowAt(rows, null, { clientX: 50, clientY: 5, shiftKey: false })).toBe(-1);
    // a row scrolled up behind the head is not under the press: the head is
    const view = { left: 0, top: 40, width: 100, height: 40 };
    expect(moveListRowAt(rows, view, { clientX: 50, clientY: 30, shiftKey: false })).toBe(-1);
    expect(moveListRowAt(rows, view, { clientX: 50, clientY: 65, shiftKey: false })).toBe(2);
  });

  it('answers the arrows, the ends, and Enter or Space as a tick', () => {
    const key = (k: string) => ({ key: k, altKey: false, ctrlKey: false, metaKey: false });
    expect(moveListKey(1, 4, key('ArrowDown'))).toEqual({ cursor: 2 });
    expect(moveListKey(0, 4, key('ArrowUp'))).toEqual({ cursor: 0 });
    expect(moveListKey(1, 4, key('End'))).toEqual({ cursor: 3 });
    expect(moveListKey(1, 4, key(' '))).toBe('toggle');
    expect(moveListKey(1, 4, key('a'))).toBeNull();
    expect(moveListKey(1, 4, { ...key('ArrowDown'), metaKey: true })).toBeNull();
  });

  it('reads the cursor row aloud with whether it is chosen', () => {
    const aria = moveListAria('Models', [{ value: 'a', label: 'Flux' }, { value: 'b', label: 'SDXL' }], ['b'], 1);
    expect(aria['aria-valuetext']).toBe('SDXL, chosen (1 chosen)');
  });
});

describe('the multiselect face', () => {
  const options = [{ value: 'a', label: 'Flux' }, { value: 'b', label: 'SDXL' }, { value: 'c', label: 'Recraft' }];

  it('ticks the chosen rows, lights the cursor row and counts the ticks in the head', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotMultiselectBody, { label: 'Models', options, checked: ['a', 'c'], cursor: 1 }));
    expect(html.match(/data-checked="true"/g)).toHaveLength(2);
    expect(html).toMatch(/data-selected="true"[^>]*><span class="tweakers-list-screen-label">SDXL/);
    expect(html).toContain('<span class="tweakers-move-dial-head" data-badge="true">Models</span>');
    expect(html).toMatch(/<span class="tweakers-move-dial-count"[^>]*>2<\/span>/);
    expect(html).toContain('aria-multiselectable="true"');
  });

  it('keeps the badge up at zero, dimmed', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotMultiselectBody, { label: 'Models', options, checked: [], cursor: 0 }));
    expect(html).toMatch(/<span class="tweakers-move-dial-count" data-zero="true"[^>]*>0<\/span>/);
  });

  it('says so when there is nothing to choose', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotMultiselectBody, { label: 'Models', options: [], checked: [], cursor: 0 }));
    expect(html).toContain('Nothing to choose');
    expect(html).not.toContain('tweakers-list-screen-row');
  });
});
