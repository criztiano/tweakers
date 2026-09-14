import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The panel's width math, pinned where it keeps breaking. A slot's size is a
// PERCENTAGE token, and a percentage resolves against whatever box reads it —
// so a token built for the whole control row, read again inside a box that is
// already a fraction of that row, shrinks the slot a second time. It has cost
// the kit two bugs already: the endless strip's slots squeezed to pills, and
// the dial row squeezed to 70px on any page narrower than eight columns, then
// floated off the pad columns underneath it. Both are the same mistake, so
// both are guarded here, from the stylesheet itself.

const css = readFileSync(
  fileURLToPath(new URL('../src/styles/theme.css', import.meta.url)),
  'utf8'
);

/** A rule's declarations, by selector — the first block that selector opens. */
const block = (selector: string): string => {
  const at = css.indexOf(`${selector} {`);
  expect(at, `no rule for ${selector}`).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf('}', at));
};

describe('the dial cluster and the pad grid, measured', () => {
  it('recovers the slot inside the grid, instead of taking an eighth of it again', () => {
    // --move-slot-base-w (and everything built from it) is an eighth of the
    // CONTROL ROW. The grid is already only --move-surface-cols slots of that
    // row, so anything inside it divides the grid by its own column count.
    expect(block('.tweakers-move-grid')).toMatch(/--move-slot-w:[^;]*--move-surface-cols/);
    expect(block('.tweakers-move-strip[data-scroll="true"]'))
      .toMatch(/--move-slot-w:[^;]*--move-surface-cols/);
  });

  it('sizes the dial row in grid slots, never in the row-wide cluster token', () => {
    const dials = block('.tweakers-move-dials');
    expect(dials).toMatch(/width:\s*calc\([^;]*--move-slot-w/);
    expect(dials).not.toMatch(/--move-cluster-w/);
  });

  it('starts the dial row where the pads start — column i is knob i on both', () => {
    // A dial row narrower than the pad row below it is narrower on the RIGHT:
    // the spare columns are the ones no control reached. Centring it would
    // slide every dial off the chip that belongs to it.
    expect(block('.tweakers-move-dials')).toMatch(/align-self:\s*start/);
  });
});
