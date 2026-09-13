import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PanelConfig, ControlMeta } from '../src/store/TweakStore';
import {
  buildMovePages,
  reportMoveLayoutIssue,
  setMoveLayoutReporter,
  MOVE_TRACKS,
  MOVE_DIALS,
  MOVE_PADS,
  type MoveLayoutIssueCode,
} from '../src/move-layout';

const control = (path: string, extra: Partial<ControlMeta> = {}): ControlMeta => ({
  type: 'slider',
  path,
  label: path,
  min: 0,
  max: 1,
  ...extra,
});

const panel = (id: string, controls: ControlMeta[], movePads?: Record<string, number>): PanelConfig => ({
  id,
  name: id,
  controls,
  values: {},
  shortcuts: {},
  ...(movePads ? { movePads } : {}),
});

/** Capture every issue the builder reports; restored after each test. */
const capture = () => {
  const issues: { code: MoveLayoutIssueCode; message: string }[] = [];
  setMoveLayoutReporter((code, message) => issues.push({ code, message }));
  return issues;
};

afterEach(() => setMoveLayoutReporter(null));

describe('the layout builder says what it drops', () => {
  it('names a panel past the 4 tracks — and still returns 4 pages', () => {
    const issues = capture();
    const panels = ['a', 'b', 'c', 'd', 'extra'].map((id) => panel(id, [control(`${id}.x`)]));
    const pages = buildMovePages(panels);
    expect(pages).toHaveLength(MOVE_TRACKS);
    expect(pages.map((p) => p.panel.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(issues).toContainEqual({
      code: 'panel-dropped',
      message: `panel 'extra' dropped — hardware has ${MOVE_TRACKS} tracks`,
    });
  });

  it('stays silent for a layout that fits', () => {
    const issues = capture();
    buildMovePages([panel('fits', [control('gain'), control('mute', { type: 'toggle' })])]);
    expect(issues).toEqual([]);
  });

  it('calls out a movePads column off the 8-wide grid — the control auto-packs as before', () => {
    const issues = capture();
    const [page] = buildMovePages([
      panel('p', [control('mute', { type: 'toggle' })], { mute: 12 }),
    ]);
    expect(page.toggles[0]?.path).toBe('mute');
    expect(issues).toContainEqual({
      code: 'pad-column-invalid',
      message: `panel 'p': control 'mute': movePads column 12 is off the ${MOVE_PADS}-wide grid — ignored`,
    });
  });

  it('rejects a fractional column the same way', () => {
    const issues = capture();
    buildMovePages([panel('p', [control('mute', { type: 'toggle' })], { mute: 2.5 })]);
    expect(issues.map((i) => i.code)).toContain('pad-column-invalid');
  });

  it('reports a collision and where the pad went instead — layout unchanged', () => {
    const issues = capture();
    const [page] = buildMovePages([
      panel(
        'p',
        [control('one', { type: 'toggle' }), control('two', { type: 'toggle' })],
        { one: 3, two: 3 }
      ),
    ]);
    expect(page.toggles[3]?.path).toBe('one');
    expect(page.toggles[0]?.path).toBe('two');
    expect(issues).toContainEqual({
      code: 'pad-column-taken',
      message: "panel 'p': control 'two': toggle column 3 already occupied by 'one' — moved to column 0",
    });
  });

  it('says when a full pad row swallows a control', () => {
    const issues = capture();
    const toggles = Array.from({ length: MOVE_PADS + 1 }, (_, i) =>
      control(`t${i}`, { type: 'toggle' })
    );
    const [page] = buildMovePages([panel('p', toggles)]);
    expect(page.toggles).toHaveLength(MOVE_PADS);
    expect(issues).toContainEqual({
      code: 'pad-row-full',
      message: `panel 'p': control 't${MOVE_PADS}': the toggle row's ${MOVE_PADS} pads are all taken — dropped`,
    });
  });

  it('says when a two-handed dial finds no column and cannot be a chip', () => {
    const issues = capture();
    const sliders = Array.from({ length: MOVE_DIALS }, (_, i) => control(`s${i}`));
    const [page] = buildMovePages([
      panel('p', [...sliders, control('pos', { type: 'xy' })]),
    ]);
    expect(page.dials).toHaveLength(MOVE_DIALS);
    expect(page.dials).not.toContain(page.values.find((v) => v?.path === 'pos'));
    expect(page.values.some((v) => v?.path === 'pos')).toBe(false);
    expect(issues).toContainEqual({
      code: 'dial-dropped',
      message: "panel 'p': control 'pos' (xy) needs a dial column and none is left — dropped",
    });
  });

  it('warns to the console once per unique message when no reporter is set', () => {
    setMoveLayoutReporter(null);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    reportMoveLayoutIssue('panel-dropped', 'dedupe-proof message');
    reportMoveLayoutIssue('panel-dropped', 'dedupe-proof message');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('Move layout: dedupe-proof message');
    warn.mockRestore();
  });
});
