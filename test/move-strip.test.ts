import { describe, expect, it } from 'vitest';
import type { PanelConfig, ControlMeta } from '../src/store/TweakStore';
import {
  buildMoveStrip,
  stripStarts,
  stripOffsets,
  clampStripOffset,
  stepStripOffset,
  pageStripOffset,
  stripDialColumns,
  stripDialSlots,
  stripSlotCount,
  stripSlotIndex,
} from '../src/move-strip';

const control = (path: string, extra: Partial<ControlMeta> = {}): ControlMeta => ({
  type: 'slider',
  path,
  label: path,
  min: 0,
  max: 1,
  ...extra,
});

const panel = (controls: ControlMeta[]): PanelConfig => ({
  id: 'strip',
  name: 'Strip',
  controls,
  values: {},
  shortcuts: {},
});

const sliders = (count: number) =>
  Array.from({ length: count }, (_, i) => control(`s${i}`));

describe('the endless strip', () => {
  it('keeps every control at slot size instead of dropping the overflow to chips', () => {
    const page = buildMoveStrip(panel(sliders(20)));
    expect(page.dials).toHaveLength(20);
    expect(page.values).toEqual([]);
    expect(page.toggles).toEqual([]);
  });

  it('gives a toggle a slot of its own — with no pad rows, there is nowhere else', () => {
    const page = buildMoveStrip(panel([control('mute', { type: 'toggle' }), control('gain')]));
    expect(page.dials.map((d) => d.path)).toEqual(['mute', 'gain']);
  });

  it('leaves out what no slot can draw — an action has no face', () => {
    const page = buildMoveStrip(panel([control('run', { type: 'action' }), control('gain')]));
    expect(page.dials.map((d) => d.path)).toEqual(['gain']);
  });

  it('reads controls out of folders in declaration order', () => {
    const page = buildMoveStrip(panel([
      control('tone', { type: 'folder', children: [control('a'), control('b')] }),
      control('c'),
    ]));
    expect(page.dials.map((d) => d.path)).toEqual(['a', 'b', 'c']);
  });

  it('sits a 2-slot filter in both of its columns', () => {
    const page = buildMoveStrip(panel([control('a'), control('flt', { type: 'filter' }), control('b')]));
    expect(page.dials.map((d) => d.path)).toEqual(['a', 'flt', 'flt', 'b']);
    expect(stripStarts(page)).toEqual([0, 1, 3]);
  });
});

describe('where the window may stop', () => {
  it('stops on whole controls, ending at the first window that reaches the last one', () => {
    const page = buildMoveStrip(panel(sliders(11)));
    expect(stripOffsets(page)).toEqual([0, 1, 2, 3]);
  });

  it('never splits a 2-slot control across the edge of the window', () => {
    // 4 sliders, a filter (2 columns), 4 more sliders — 10 columns in all.
    const page = buildMoveStrip(panel([
      ...sliders(4),
      control('flt', { type: 'filter' }),
      ...Array.from({ length: 4 }, (_, i) => control(`t${i}`)),
    ]));
    expect(stripStarts(page)).toEqual([0, 1, 2, 3, 4, 6, 7, 8, 9]);
    // 2 is skipped as a stop only when it would leave the filter half-shown:
    // every offset here is a control start, and the run ends once the window
    // covers column 9.
    expect(stripOffsets(page)).toEqual([0, 1, 2]);
  });

  it('holds still when the whole set already fits the dials', () => {
    const page = buildMoveStrip(panel(sliders(5)));
    expect(stripOffsets(page)).toEqual([0]);
    expect(stepStripOffset(page, 0, 3)).toBe(0);
  });

  it('has one stop for an empty page rather than none', () => {
    const page = buildMoveStrip(panel([]));
    expect(stripOffsets(page)).toEqual([0]);
    expect(clampStripOffset(page, 4)).toBe(0);
  });
});

describe('the wheel', () => {
  const page = buildMoveStrip(panel(sliders(20)));

  it('moves one control per detent, in both directions', () => {
    expect(stepStripOffset(page, 0, 1)).toBe(1);
    expect(stepStripOffset(page, 5, -2)).toBe(3);
  });

  it('stops at both ends instead of wrapping', () => {
    expect(stepStripOffset(page, 0, -4)).toBe(0);
    expect(stepStripOffset(page, 11, 5)).toBe(12);
  });

  it('repairs a stale offset onto the nearest stop', () => {
    expect(clampStripOffset(page, 99)).toBe(12);
    expect(clampStripOffset(page, -3)).toBe(0);
  });
});

describe('the arrows', () => {
  it('turns the page: a whole window of slots at a time', () => {
    const page = buildMoveStrip(panel(sliders(20)));
    expect(pageStripOffset(page, 0, 1)).toBe(8);
    expect(pageStripOffset(page, 8, 1)).toBe(12);      /* the last window */
    expect(pageStripOffset(page, 12, -1)).toBe(4);
    expect(pageStripOffset(page, 4, -1)).toBe(0);
  });

  it('stops at both ends rather than wrapping', () => {
    const page = buildMoveStrip(panel(sliders(20)));
    expect(pageStripOffset(page, 12, 1)).toBe(12);
    expect(pageStripOffset(page, 0, -1)).toBe(0);
  });

  it('lands on a whole control when a 2-slot one straddles the jump', () => {
    // 6 sliders, a filter (columns 6-7), 6 more — 14 columns.
    const page = buildMoveStrip(panel([
      ...sliders(6),
      control('flt', { type: 'filter' }),
      ...Array.from({ length: 6 }, (_, i) => control(`t${i}`)),
    ]));
    expect(stripStarts(page)).toEqual([0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]);
    // A full page would land on column 8, past the last window the strip has:
    // the jump stops at column 6, which starts the filter and shows the tail
    // whole rather than cutting a two-column control at the edge.
    expect(pageStripOffset(page, 0, 1)).toBe(6);
    expect(pageStripOffset(page, 6, -1)).toBe(0);
  });
});

describe('the dot row', () => {
  const page = buildMoveStrip(panel(sliders(10)));

  it('names the 8 controls the dials are holding', () => {
    expect(stripDialColumns(page, 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(stripDialSlots(page, 2).map((m) => m?.path)).toEqual([
      's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
    ]);
  });

  it('marks a dial the strip has run out for', () => {
    const short = buildMoveStrip(panel(sliders(3)));
    expect(stripDialColumns(short, 0)).toEqual([0, 1, 2, -1, -1, -1, -1, -1]);
    expect(stripDialSlots(short, 0).slice(3).every((m) => m === undefined)).toBe(true);
  });

  it('counts controls, not columns, for the position readout', () => {
    const withFilter = buildMoveStrip(panel([
      ...sliders(3),
      control('flt', { type: 'filter' }),
      ...sliders(3),
    ]));
    expect(withFilter.dials).toHaveLength(8);
    expect(stripSlotCount(withFilter)).toBe(7);
    expect(stripSlotIndex(withFilter, 3)).toBe(3);   /* the filter is the 4th control */
  });
});
