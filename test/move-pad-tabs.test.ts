import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import type { PanelConfig, ControlMeta } from '../src/store/TweakStore';
import {
  buildMovePages,
  movePadRows,
  setMoveLayoutReporter,
  padSpan,
  moveTabCell,
  isMoveTabs,
  isMoveDial,
  MOVE_PADS,
  type MoveLayoutIssueCode,
} from '../src/move-layout';
import { buildMoveStrip } from '../src/move-strip';
import { MOVE_PAD_LIBRARY, MovePadTabsBody } from '../src/components/move-slots';

const tabs = (
  path: string,
  options: ControlMeta['options'],
  moveTabs: ControlMeta['moveTabs'] = true
): ControlMeta => ({ type: 'select', path, label: path, options, moveTabs });

const toggle = (path: string): ControlMeta => ({ type: 'toggle', path, label: path });

const panel = (controls: ControlMeta[], movePads?: Record<string, number>): PanelConfig => ({
  id: 'p',
  name: 'p',
  controls,
  values: {},
  shortcuts: {},
  ...(movePads ? { movePads } : {}),
});

const capture = () => {
  const issues: { code: MoveLayoutIssueCode; message: string }[] = [];
  setMoveLayoutReporter((code, message) => issues.push({ code, message }));
  return issues;
};

afterEach(() => setMoveLayoutReporter(null));

describe('a tabs strip on the small slots', () => {
  it('takes one pad per option in the switch row, and no dial', () => {
    const mode = tabs('mode', ['Loop', 'One shot', 'Gate']);
    expect(isMoveTabs(mode)).toBe(true);
    expect(isMoveDial(mode)).toBe(false);
    expect(padSpan(mode)).toBe(3);

    const [page] = buildMovePages([panel([mode])]);
    expect(page.dials).toEqual([]);
    expect(page.toggles.slice(0, 3).map((p) => p?.path)).toEqual(['mode', 'mode', 'mode']);
    expect(page.toggles[3]).toBeUndefined();
  });

  it('spends one more pad on its own name when it is named', () => {
    const mode = tabs('mode', ['Loop', 'One shot', 'Gate'], 'named');
    expect(padSpan(mode)).toBe(4);
    const [page] = buildMovePages([panel([mode])]);
    expect(page.toggles.filter((p) => p?.path === 'mode')).toHaveLength(4);
  });

  it('starts where movePads says, leaving the pads before it free', () => {
    const [page] = buildMovePages([
      panel([tabs('mode', ['A', 'B']), toggle('sync')], { mode: 4, sync: 0 }),
    ]);
    expect(page.toggles[4]?.path).toBe('mode');
    expect(page.toggles[5]?.path).toBe('mode');
    expect(page.toggles[0]?.path).toBe('sync');
  });

  it('lands as one piece or not at all — a broken run moves the whole strip', () => {
    const issues = capture();
    // 'sync' sits at 5, so the run 4..6 the strip asked for is broken.
    const [page] = buildMovePages([
      panel([toggle('sync'), tabs('mode', ['A', 'B', 'C'])], { sync: 5, mode: 4 }),
    ]);
    expect(page.toggles[5]?.path).toBe('sync');
    expect(page.toggles.slice(0, 3).map((p) => p?.path)).toEqual(['mode', 'mode', 'mode']);
    expect(issues).toContainEqual({
      code: 'pad-column-taken',
      message: "panel 'p': control 'mode': tabs column 4 has no run of 3 free pads — moved to column 0",
    });
  });

  it('drops a strip wider than the grid rather than shortening it', () => {
    const issues = capture();
    const nine = Array.from({ length: MOVE_PADS + 1 }, (_, i) => `o${i}`);
    const [page] = buildMovePages([panel([tabs('mode', nine)])]);
    expect(page.toggles.some((p) => p?.path === 'mode')).toBe(false);
    expect(issues).toContainEqual({
      code: 'tabs-oversized',
      message: `panel 'p': control 'mode': a ${MOVE_PADS + 1}-pad tabs strip is wider than the ${MOVE_PADS}-wide grid — dropped`,
    });
  });

  it('says so when the row has no run long enough left', () => {
    const issues = capture();
    const switches = Array.from({ length: MOVE_PADS - 1 }, (_, i) => toggle(`t${i}`));
    const [page] = buildMovePages([panel([...switches, tabs('mode', ['A', 'B', 'C'])])]);
    expect(page.toggles.some((p) => p?.path === 'mode')).toBe(false);
    expect(issues).toContainEqual({
      code: 'tabs-no-room',
      message: "panel 'p': control 'mode': the toggle row has no run of 3 free pads — dropped",
    });
  });

  it('stays an enum dial when it never asked for the pads', () => {
    const plain: ControlMeta = { type: 'select', path: 'mode', label: 'mode', options: ['A', 'B'] };
    expect(isMoveTabs(plain)).toBe(false);
    const [page] = buildMovePages([panel([plain])]);
    expect(page.dials[0]?.path).toBe('mode');
    expect(page.toggles).toEqual([]);
  });
});

describe('a tabs strip on the action row', () => {
  const action = (path: string): ControlMeta => ({ type: 'action', path, label: path });
  const sunk = (controls: ControlMeta[], movePads: Record<string, number>, moveActionRow = ['dir']): PanelConfig => ({
    ...panel(controls, movePads),
    moveActionRow,
  });

  it('lays its run on the action row when the panel names it in moveActionRow', () => {
    const issues = capture();
    // The switch row is full of other strips; the In / Out strip goes below.
    const [page] = buildMovePages([sunk(
      [tabs('a', ['1', '2', '3', '4']), tabs('b', ['1', '2', '3', '4']), tabs('dir', ['In', 'Out'])],
      { a: 0, b: 4, dir: 0 }
    )]);
    expect(page.toggles.map((p) => p?.path)).toEqual(['a', 'a', 'a', 'a', 'b', 'b', 'b', 'b']);
    expect(page.actions.slice(0, 2).map((p) => p?.path)).toEqual(['dir', 'dir']);
    const [, , actions] = movePadRows(page, 0);
    expect(moveTabCell(actions, 0)).toMatchObject({ head: false, option: 'In' });
    expect(moveTabCell(actions, 1)).toMatchObject({ head: false, option: 'Out' });
    expect(issues).toEqual([]);
  });

  it('stays on the switch row without moveActionRow', () => {
    const [page] = buildMovePages([panel([tabs('dir', ['In', 'Out'])], { dir: 0 })]);
    expect(page.toggles.slice(0, 2).map((p) => p?.path)).toEqual(['dir', 'dir']);
    expect(page.actions).toEqual([]);
  });

  it('lets the buttons named into its cells pack around it', () => {
    const issues = capture();
    const [page] = buildMovePages([sunk(
      [tabs('dir', ['In', 'Out']), action('play'), action('stop')],
      { dir: 0, play: 0, stop: 3 }
    )]);
    expect(page.actions.slice(0, 4).map((p) => p?.path)).toEqual(['dir', 'dir', 'play', 'stop']);
    expect(issues).toContainEqual({
      code: 'pad-column-taken',
      message: "panel 'p': control 'play': action column 0 already occupied by 'dir' — moved to column 2",
    });
  });

  it('moves a broken run whole, and says so when no run is left', () => {
    const issues = capture();
    const switches = Array.from({ length: MOVE_PADS }, (_, i) => toggle(`t${i}`));
    const [moved] = buildMovePages([sunk(
      [...switches, tabs('dir', ['In', 'Out', 'Hold'])],
      { dir: 6 }
    )]);
    // Columns 6..8 run off the grid: the strip falls back to the leftmost run,
    // and the full switch row above never comes into it.
    expect(moved.actions.slice(0, 3).map((p) => p?.path)).toEqual(['dir', 'dir', 'dir']);
    expect(moved.toggles.every((p) => p?.type === 'toggle')).toBe(true);
    expect(issues).toContainEqual({
      code: 'pad-column-taken',
      message: "panel 'p': control 'dir': tabs column 6 has no run of 3 free pads — moved to column 0",
    });

    const wide = Array.from({ length: MOVE_PADS - 1 }, (_, i) => `o${i}`);
    const [none] = buildMovePages([sunk([tabs('a', wide), tabs('dir', ['In', 'Out'])], {}, ['a', 'dir'])]);
    expect(none.actions.filter((p) => p?.path === 'dir')).toHaveLength(0);
    expect(issues).toContainEqual({
      code: 'tabs-no-room',
      message: "panel 'p': control 'dir': the action row has no run of 2 free pads — dropped",
    });
  });

  it('keeps a value chip sunk into one of its cells on the value row', () => {
    const issues = capture();
    const dials = Array.from({ length: 8 }, (_, i): ControlMeta => ({ type: 'slider', path: `d${i}`, label: `d${i}`, min: 0, max: 1 }));
    const low: ControlMeta = { type: 'slider', path: 'low', label: 'low', min: 0, max: 1 };
    const [page] = buildMovePages([sunk([...dials, tabs('dir', ['In', 'Out']), low], { dir: 0, low: 1 }, ['dir', 'low'])]);
    expect(page.actions.slice(0, 2).map((p) => p?.path)).toEqual(['dir', 'dir']);
    expect(page.actionValues).toBeUndefined();
    expect(page.values.some((p) => p?.path === 'low')).toBe(true);
    expect(issues).toContainEqual({
      code: 'action-row-taken',
      message: "panel 'p': control 'low': action-row column 1 holds 'dir' — the chip keeps the value row",
    });
  });
});

describe('a tabs strip on a scrolling strip', () => {
  it('claims its run in the switch row and never eats a slot', () => {
    const page = buildMoveStrip(panel(
      [{ type: 'slider', path: 'gain', label: 'gain', min: 0, max: 1 }, tabs('mode', ['A', 'B', 'C'], 'named')],
      { mode: 3 }
    ));
    expect(page.dials.map((d) => d.path)).toEqual(['gain']);
    expect(page.toggles.slice(3, 7).map((p) => p?.path)).toEqual(['mode', 'mode', 'mode', 'mode']);
    expect(page.values.some((v) => v?.path === 'mode')).toBe(false);
  });

  it('packs left when the strip names it no column', () => {
    const page = buildMoveStrip(panel([tabs('mode', ['A', 'B'])]));
    expect(page.toggles.slice(0, 2).map((p) => p?.path)).toEqual(['mode', 'mode']);
  });
});

describe('what each pad of a strip is', () => {
  const [page] = buildMovePages([panel([tabs('mode', ['A', 'B', 'C'], 'named')], { mode: 1 })]);

  it('reads the name pad and then one option per pad, from the row alone', () => {
    expect(moveTabCell(page.toggles, 1)).toMatchObject({ head: true, option: null, label: 'mode' });
    expect(moveTabCell(page.toggles, 2)).toMatchObject({ head: false, option: 'A', label: 'A' });
    expect(moveTabCell(page.toggles, 4)).toMatchObject({ head: false, option: 'C', label: 'C' });
  });

  it('is null for a pad no strip is lying across', () => {
    expect(moveTabCell(page.toggles, 0)).toBeNull();
    expect(moveTabCell(page.toggles, 5)).toBeNull();
  });

  it('gives an unnamed strip the first pad as an option, not a name', () => {
    const [plain] = buildMovePages([panel([tabs('mode', ['A', 'B'])])]);
    expect(moveTabCell(plain.toggles, 0)).toMatchObject({ head: false, option: 'A' });
  });
});

describe('the tabs face', () => {
  it('is the library entry, and lights the option the value names', () => {
    expect(MOVE_PAD_LIBRARY.tabs.component).toBe(MovePadTabsBody);
    const html = renderToStaticMarkup(createElement(MovePadTabsBody, {
      options: ['Loop', 'One shot', 'Gate'],
      activeIdx: 1,
    }));
    expect(html).toContain('Loop');
    expect(html).toContain('One shot');
    expect((html.match(/data-on="true"/g) ?? [])).toHaveLength(1);
    expect(html).not.toContain('tweakers-move-tabs-head');
  });

  it('draws the name pad ahead of the options when it is given one', () => {
    const html = renderToStaticMarkup(createElement(MovePadTabsBody, {
      name: 'Mode',
      options: ['Loop', 'Gate'],
      activeIdx: 0,
    }));
    expect(html.indexOf('Mode')).toBeLessThan(html.indexOf('Loop'));
    expect(html).toContain('tweakers-move-tabs-head');
  });

  it('wears an option’s glyph instead of its word', () => {
    const html = renderToStaticMarkup(createElement(MovePadTabsBody, {
      options: [{ value: 'repeat', label: 'Repeat', icon: 'repeat' }, 'Gate'],
      activeIdx: 0,
    }));
    expect(html).toContain('tweakers-move-tab-icon');
    expect(html).not.toContain('Repeat');
  });
});
