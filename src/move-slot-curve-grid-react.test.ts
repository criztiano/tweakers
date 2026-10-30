import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MOVE_SLOT_LIBRARY, MoveSlotCurveGridBody, moveSlotKind } from './components/move-slots';
import { enumShapePath } from './move-layout';
import type { ControlMeta } from './store/TweakStore';

// `display: 'grid'` with a `preview`: the chosen curve alone at rest, and a
// pop-up of tiles in the hand, one curve per option, the chosen one lit.
// Without a preview there is nothing to draw, so the select keeps its
// ordinary face.

const SHAPES: Record<string, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => 1 - (1 - t) * (1 - t),
  back: (t) => t * t * (2.7 * t - 1.7),
  elastic: (t) => 1 - Math.cos(t * Math.PI * 4.5) * (1 - t) ** 2,
};
const OPTIONS = Object.keys(SHAPES).map((value, i) => ({ value, label: value, group: i < 3 ? 'Plain' : 'Springs' }));
const select = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'select', path: 'ease', label: 'Easing', options: OPTIONS, ...extra } as ControlMeta);
const preview = (v: string) => SHAPES[v] ?? null;

/** Fake layout: the slot the pop-up is centred on, in a 1000px window. */
function render(activeIdx: number, slotLeft = 400) {
  const meta = select({ display: 'grid', preview });
  const shapes = OPTIONS.map((o) => enumShapePath(meta, o.value));
  const slot = { getBoundingClientRect: () => ({ left: slotLeft, width: 100, top: 0, height: 140 }) };
  const pop = { parentElement: slot, offsetWidth: 396, style: {} as Record<string, string> };
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      createElement(MoveSlotCurveGridBody, { label: 'Easing', options: OPTIONS, activeIdx, shapes }),
      {
        createNodeMock: (el) => {
          const cls = el.props.className;
          if (cls === 'tweakers-move-dial-pop') return pop;
          if (cls === 'tweakers-move-dial-grid') {
            return {
              scrollHeight: 200, clientHeight: 200, scrollTop: 0,
              querySelector: () => null, getBoundingClientRect: () => ({ top: 0, height: 200 }),
            };
          }
          return null;
        },
      }
    );
  });
  const byClass = (className: string): ReactTestInstance[] =>
    renderer.root.findAll((n) => typeof n.type === 'string' && n.props.className === className);
  return {
    pop,
    rest: () => byClass('tweakers-move-dial-tile tweakers-move-dial-rest'),
    heads: () => byClass('tweakers-move-dial-head'),
    grid: () => byClass('tweakers-move-dial-grid')[0],
    tiles: () => byClass('tweakers-move-dial-tile'),
    groups: () => byClass('tweakers-move-dial-grid-group'),
    tilePaths: () => byClass('tweakers-move-dial-tile').map((n) => n.findByType('path').props.d),
  };
}

describe('the curve grid (React)', () => {
  it('is asked for with display: grid, and only when there are shapes', () => {
    const grid = select({ display: 'grid', preview });
    assert.equal(moveSlotKind(grid, { enum: true, value: 'back', shape: enumShapePath(grid, 'back') }), 'curve-grid');
    // No preview: nothing to draw, the list stays.
    assert.equal(moveSlotKind(select({ display: 'grid' }), { enum: true, value: 'back' }), 'enum');
    // A preview without the ask keeps the one-curve face.
    const curve = select({ preview });
    assert.equal(moveSlotKind(curve, { enum: true, value: 'back', shape: enumShapePath(curve, 'back') }), 'curve');
    assert.equal(MOVE_SLOT_LIBRARY['curve-grid'].component, MoveSlotCurveGridBody);
  });

  it('draws one tile per option, each its own curve, the chosen one lit', () => {
    const slot = render(3);
    // The curves say what the control is: no name is drawn, the list keeps it.
    assert.equal(slot.heads().length, 0);
    assert.equal(slot.grid().props['aria-label'], 'Easing');
    const tiles = slot.tiles();
    assert.equal(tiles.length, OPTIONS.length);
    assert.deepEqual(tiles.map((t) => t.props['aria-label']), OPTIONS.map((o) => o.label));
    assert.deepEqual(tiles.map((t) => t.props['data-selected']), [undefined, undefined, undefined, true, undefined]);
    assert.equal(tiles[3].props['aria-selected'], true);
    const paths = slot.tilePaths();
    assert.equal(paths.length, OPTIONS.length);
    assert.equal(new Set(paths).size, OPTIONS.length);
  });

  it('fits an overshooting curve inside its tile', () => {
    const meta = select({ display: 'grid', preview });
    for (const name of ['back', 'elastic']) {
      const ys = [...enumShapePath(meta, name)!.matchAll(/[ML] [\d.-]+ ([\d.-]+)/g)].map((m) => Number(m[1]));
      assert.ok(Math.min(...ys) >= 0 && Math.max(...ys) <= 100, name);
    }
  });

  it('heads each family once, without counting it as a tile', () => {
    const slot = render(4);
    assert.deepEqual(slot.groups().map((g) => g.props.children), ['Plain', 'Springs']);
    assert.equal(slot.tiles().length, OPTIONS.length);
    assert.equal(slot.tiles()[4].props['data-selected'], true);
  });

  it('lays the resting dots on the curve, so both its ends sit on a dot', () => {
    const slot = render(3); // back: an anticipation, so its ends are not the corners
    const d = slot.tilePaths()[3];
    const nums = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    const [x0, y0, x1, y1] = [nums[0], nums[1], nums.at(-2)!, nums.at(-1)!];
    const dots = slot.rest()[0].findAll((n) => n.type === 'circle')
      .map((c) => [parseFloat(c.props.cx), parseFloat(c.props.cy)]);
    const near = (x: number, y: number) => dots.some(([cx, cy]) => Math.abs(cx - x) < 0.02 && Math.abs(cy - y) < 0.02);
    assert.ok(y0 < 100, 'the dip lifts the start off the floor');
    assert.ok(near(x0, y0), 'a dot under the start');
    assert.ok(near(x1, y1), 'a dot under the end');
  });

  it('rests on the chosen curve alone, on its tile', () => {
    const slot = render(3);
    const rest = slot.rest();
    assert.equal(rest.length, 1);
    assert.equal(rest[0].findByType('path').props.d, slot.tilePaths()[3]);
  });

  it('centres the pop-up on its slot, inside the window', () => {
    const innerWidth = globalThis.window?.innerWidth;
    (globalThis as { window?: unknown }).window ??= { innerWidth: 1000 } as unknown;
    try {
      const w = (globalThis.window as { innerWidth: number }).innerWidth;
      // Room either side: centred, (100 − 396) / 2 off the slot's left.
      assert.equal(render(0, 400).pop.style.left, '-148px');
      // At the window's left edge: pulled in to the 8px margin.
      assert.equal(render(0, 20).pop.style.left, '-12px');
      // At the right edge: pulled back inside.
      assert.equal(render(0, w - 60).pop.style.left, `${Math.round(w - 8 - 396 - (w - 60))}px`);
    } finally {
      if (innerWidth === undefined) delete (globalThis as { window?: unknown }).window;
    }
  });
});
