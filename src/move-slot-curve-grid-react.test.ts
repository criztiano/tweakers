import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MOVE_SLOT_LIBRARY, MoveSlotCurveGridBody, moveSlotKind } from './components/move-slots';
import { enumShapePath } from './move-layout';
import type { ControlMeta } from './store/TweakStore';

// `display: 'grid'` with a `preview`: the list screen laid out as tiles, one
// curve per option, the chosen one lit. Without a preview there is nothing
// to draw, so the select keeps its ordinary face.

const SHAPES: Record<string, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => 1 - (1 - t) * (1 - t),
  back: (t) => t * t * (2.7 * t - 1.7),
  elastic: (t) => 1 - Math.cos(t * Math.PI * 4.5) * (1 - t) ** 2,
};
const OPTIONS = Object.keys(SHAPES).map((value) => ({ value, label: value }));
const select = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'select', path: 'ease', label: 'Easing', options: OPTIONS, ...extra } as ControlMeta);
const preview = (v: string) => SHAPES[v] ?? null;

/** Fake layout: the slot, its head, and a grid whose whole run is `content`
 *  tall — the numbers the screen asks for once it is laid out. */
function render(activeIdx: number, content: number) {
  const meta = select({ display: 'grid', preview });
  const shapes = OPTIONS.map((o) => enumShapePath(meta, o.value));
  const slot = { clientHeight: 140 };
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      createElement(MoveSlotCurveGridBody, { label: 'Easing', options: OPTIONS, activeIdx, shapes }),
      {
        createNodeMock: (el) => {
          const cls = el.props.className;
          if (cls === 'tweakers-move-dial-screen') return { parentElement: slot };
          if (cls === 'tweakers-move-dial-head') return { offsetHeight: 18 };
          if (cls === 'tweakers-move-dial-grid') {
            return {
              scrollHeight: content, clientHeight: Math.min(content, 122), scrollTop: 0,
              querySelector: () => null, getBoundingClientRect: () => ({ top: 0, height: 122 }),
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
    screen: () => byClass('tweakers-move-dial-screen')[0],
    head: () => byClass('tweakers-move-dial-head')[0],
    tiles: () => byClass('tweakers-move-dial-tile'),
    paths: () => renderer.root.findAll((n) => n.type === 'path').map((n) => n.props.d),
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
    const slot = render(3, 122);
    assert.equal(slot.head().props.children, 'Easing');
    const tiles = slot.tiles();
    assert.equal(tiles.length, OPTIONS.length);
    assert.deepEqual(tiles.map((t) => t.props['aria-label']), OPTIONS.map((o) => o.label));
    assert.deepEqual(tiles.map((t) => t.props['data-selected']), [undefined, undefined, undefined, true, undefined]);
    assert.equal(tiles[3].props['aria-selected'], true);
    const paths = slot.paths();
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

  it('grows on touch only when the tiles run past the room under the head', () => {
    // 140 slot − 18 head = 122 at rest.
    assert.equal(render(0, 122).screen().props['data-grow'], undefined);
    assert.equal(render(0, 300).screen().props['data-grow'], true);
  });
});
