import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MOVE_FLOAT_GAP, moveFloatSitsInside } from '../src/move-float';

// The agent's prompt and the preset's name float above the panel with
// `bottom: 100%`. That only means "above the panel" when the panel is the box
// they hang from — and a panel docked in the page's flow was not positioned,
// so an app that docked it that way got a prompt above the whole page, out of
// sight. Guarded from the stylesheet itself, like the grid's geometry.

const css = readFileSync(fileURLToPath(new URL('../src/styles/theme.css', import.meta.url)), 'utf8');
const block = (selector: string): string => {
  const at = css.indexOf(`${selector} {`);
  expect(at, `no rule for ${selector}`).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf('}', at));
};

describe('what floats above the panel', () => {
  it('hangs from the panel in every dock', () => {
    expect(block('.tweakers-move[data-dock="viewport"]')).toMatch(/position:\s*fixed/);
    expect(block('.tweakers-move[data-dock="flow"]')).toMatch(/position:\s*relative/);
    expect(block('.tweakers-move-preset-save')).toMatch(/position:\s*absolute/);
    expect(block('.tweakers-move-preset-save')).toMatch(new RegExp(`bottom:\\s*calc\\(100% \\+ ${MOVE_FLOAT_GAP}px\\)`));
  });

  it('sits inside the top of the panel when it is told there is no room above', () => {
    const inside = block('.tweakers-move-preset-save[data-inside]');
    expect(inside).toMatch(/top:\s*10px/);
    expect(inside).toMatch(/bottom:\s*auto/);
  });

  it('has no room when the box and its gap do not fit between the viewport top and the panel', () => {
    expect(moveFloatSitsInside(400, 60)).toBe(false);          // a panel at the bottom of the page
    expect(moveFloatSitsInside(70, 60)).toBe(false);           // exactly fits: 70 - 10 - 60 = 0
    expect(moveFloatSitsInside(69, 60)).toBe(true);
    expect(moveFloatSitsInside(0, 60)).toBe(true);             // a flow panel at the top of the page
    expect(moveFloatSitsInside(-200, 60)).toBe(true);          // scrolled past
    expect(moveFloatSitsInside(120, 140)).toBe(true);          // the prompt grew: steps under the field
    expect(moveFloatSitsInside(Number.NaN, 60)).toBe(false);   // nothing measured yet: where it always was
  });
});
