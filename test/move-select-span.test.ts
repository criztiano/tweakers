import { afterEach, describe, expect, it } from 'vitest';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';
import { buildMovePages, dialSpan, isSpanContinuation, setMoveLayoutReporter, visibleColumns } from '../src/move-layout';
import { buildMoveStrip, stripStarts } from '../src/move-strip';

const ids: string[] = [];
let sequence = 0;
const select = { type: 'select', options: ['drums', 'bass'], default: 'bass' } as const;
const register = (config: TweakConfig, movePads?: Record<string, number>) => {
  const id = `select-span-${++sequence}`;
  ids.push(id);
  TweakStore.registerPanel(id, id, config, undefined, { movePads });
  return TweakStore.getPanel(id)!;
};
const options = () => ({ ...select, options: [...select.options] });

afterEach(() => {
  for (const id of ids.splice(0)) TweakStore.unregisterPanel(id);
  setMoveLayoutReporter(null);
});

describe('two-column select', () => {
  it('parses the requested span without changing selection or ordinary selects', () => {
    const panel = register({ plain: options(), wide: { ...options(), moveSpan: 2 } });
    expect(panel.controls.map(dialSpan)).toEqual([1, 2]);
    expect(panel.controls[1].moveSpan).toBe(2);
    expect(panel.values).toMatchObject({ plain: 'bass', wide: 'bass' });
    const [page] = buildMovePages([panel]);
    expect(page.dials.map((c) => c.path)).toEqual(['plain', 'wide', 'wide']);
    expect(page.dials[1]).toBe(page.dials[2]);
    expect(isSpanContinuation(page, 1)).toBe(false);
    expect(isSpanContinuation(page, 2)).toBe(true);
  });

  it('keeps following controls and their pads at the physical column after both slots', () => {
    const panel = register({ result: { ...options(), moveSpan: 2 }, gain: [0.5, 0, 1], mute: false }, { mute: 2 });
    const [page] = buildMovePages([panel]);
    expect(page.dials.map((c) => c.path)).toEqual(['result', 'result', 'gain']);
    expect(page.toggles[2]?.path).toBe('mute');
    expect(visibleColumns(page)).toEqual([0, 1, 2]);
  });

  it('fits in the final two columns, but never splits across the eight-column boundary', () => {
    const sliders = (count: number) => Object.fromEntries(Array.from({ length: count }, (_, i) => [`gain${i}`, [0.5, 0, 1]]));
    const [fits] = buildMovePages([register({ ...sliders(6), result: { ...options(), moveSpan: 2 } })]);
    expect(fits.dials.slice(6).map((c) => c.path)).toEqual(['result', 'result']);
    const issues: string[] = [];
    setMoveLayoutReporter((code) => issues.push(code));
    const [overflow] = buildMovePages([register({ ...sliders(7), result: { ...options(), moveSpan: 2 } })]);
    expect(overflow.dials).toHaveLength(7);
    expect(overflow.values.some((c) => c?.path === 'result')).toBe(false);
    expect(issues).toContain('dial-dropped');
  });

  it('treats the two columns as one stop on the optional scrolling strip', () => {
    const strip = buildMoveStrip(register({ gain: [0.5, 0, 1], result: { ...options(), moveSpan: 2 }, plain: options() }));
    expect(strip.dials.map((c) => c.path)).toEqual(['gain', 'result', 'result', 'plain']);
    expect(stripStarts(strip)).toEqual([0, 1, 3]);
  });

  it('keeps moveTabs on the pad row even if a dial span is specified', () => {
    const panel = register({ result: { ...options(), moveSpan: 2, moveTabs: true }, gain: [0.5, 0, 1] });
    const [page] = buildMovePages([panel]);
    expect(dialSpan(panel.controls[0])).toBe(1);
    expect(page.dials.map((c) => c.path)).toEqual(['gain']);
    expect(page.toggles.map((c) => c.path)).toEqual(['result', 'result']);
  });
});
