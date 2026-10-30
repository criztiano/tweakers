import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { MoveSlot } from '../src/components/MoveSlot';
import { MOVE_SLOT_LIBRARY, MoveSlotArrowsBody, MoveSlotDialBody, moveSlotKind } from '../src/components/move-slots';
import { buildMovePages, enumArrows, isMoveDial, parseArrow } from '../src/move-layout';
import { moveArrowAt, moveArrowDirAt, moveNextOption } from '../src/move-slot-core';
import { TweakStore, type ControlMeta, type TweakConfig } from '../src/store/TweakStore';

// A select can ask to be drawn as the directions it picks between
// (`display: 'arrows'`): a plate with an arrow per option, the chosen one
// lit. It stays a stepped enum dial; a still press on an arrow takes it.

const WAYS = ['up', 'right', 'down', 'left'];
const select = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'select', path: 'wind', label: 'Wind', options: WAYS, display: 'arrows', ...extra } as ControlMeta);

describe('reading a direction', () => {
  it('takes the four ways and the compass, in any case, and nothing else', () => {
    expect(parseArrow('up')).toBe('up');
    expect(parseArrow(' East ')).toBe('right');
    expect(parseArrow('SOUTH')).toBe('down');
    expect(parseArrow('west')).toBe('left');
    for (const bad of ['forward', 'upward', '', 'n', undefined, 0]) expect(parseArrow(bad)).toBeNull();
  });

  it('draws an arrow per option, clockwise from the top, each with the option it picks', () => {
    const left = select({ options: ['left', 'right'] });
    expect(enumArrows(left, 'right')).toEqual({
      arrows: [{ dir: 'right', index: 1 }, { dir: 'left', index: 0 }],
      chosen: 'right',
    });
    const named = select({ options: [{ value: 'North', label: 'From below' }, { value: 'west', label: 'From the right' }, { value: 'south', label: 'From above' }] });
    expect(enumArrows(named, 'south')).toEqual({
      arrows: [{ dir: 'up', index: 0 }, { dir: 'down', index: 2 }, { dir: 'left', index: 1 }],
      chosen: 'down',
    });
    // an unknown value reads as the first option, as every enum dial does
    expect(enumArrows(select(), 'nope')?.chosen).toBe('up');
  });

  it('draws nothing unless the select asks, with two to four distinct directions', () => {
    expect(enumArrows(select({ display: undefined }), 'up')).toBeNull();
    expect(enumArrows(select({ options: ['up', 'sideways'] }), 'up')).toBeNull();
    expect(enumArrows(select({ options: ['up', 'north'] }), 'up')).toBeNull();
    expect(enumArrows(select({ options: ['up'] }), 'up')).toBeNull();
    expect(enumArrows(select({ options: ['up', 'right', 'down', 'left', 'east'] }), 'up')).toBeNull();
  });
});

describe('which face a select wears', () => {
  it('names the arrows face, and falls back to the list for options that are no directions', () => {
    expect(moveSlotKind(select(), { enum: true, value: 'down' })).toBe('arrows');
    expect(moveSlotKind(select({ options: ['up', 'sideways'] }), { enum: true, value: 'up' })).toBe('enum');
    expect(moveSlotKind(select({ display: undefined }), { enum: true, value: 'up' })).toBe('enum');
  });

  it('is in the library', () => {
    expect(MOVE_SLOT_LIBRARY.arrows.component).toBe(MoveSlotArrowsBody);
  });
});

describe('the arrows plate', () => {
  it('draws only the options, the chosen one lit, the name a tag', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotArrowsBody, { label: 'Wind', directions: ['left', 'right'], chosen: 'right' }));
    expect(html).toContain('<span class="tweakers-move-dial-tag">Wind</span>');
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/class="tweakers-move-dial-arrow"/g)).toHaveLength(2);
    expect(html).toContain('data-dir="right" data-on="true"');
    expect(html).not.toMatch(/data-dir="left" data-on/);
    expect(html).not.toContain('data-dir="up"');
    // every arrow is the up one turned about the centre
    expect(html).toContain('transform="rotate(90 12 12)"');
    expect(html).toContain('transform="rotate(270 12 12)"');
  });
});

describe('a tap on an arrow', () => {
  const box = { left: 100, top: 200, width: 80, height: 80 };
  const at = (x: number, y: number) => ({ clientX: box.left + x, clientY: box.top + y });

  it('reads the plate by its quarters, cut along the diagonals', () => {
    expect(moveArrowDirAt(box, at(40, 5))).toBe('up');
    expect(moveArrowDirAt(box, at(75, 40))).toBe('right');
    expect(moveArrowDirAt(box, at(40, 75))).toBe('down');
    expect(moveArrowDirAt(box, at(5, 40))).toBe('left');
    // near a corner: whichever side the press is closer to
    expect(moveArrowDirAt(box, at(70, 20))).toBe('right');
    expect(moveArrowDirAt(box, at(60, 4))).toBe('up');
    // the very centre points nowhere, and neither does a press off the plate
    expect(moveArrowDirAt(box, at(40, 40))).toBeNull();
    expect(moveArrowDirAt(box, at(-1, 40))).toBeNull();
    expect(moveArrowDirAt(box, at(40, 80))).toBeNull();
  });

  it('takes the option under it, and nothing in a quarter with no arrow', () => {
    const { arrows } = enumArrows(select({ options: ['left', 'right'] }), 'left')!;
    expect(moveArrowAt(arrows, box, at(75, 40))).toBe(1);
    expect(moveArrowAt(arrows, box, at(5, 40))).toBe(0);
    expect(moveArrowAt(arrows, box, at(40, 5))).toBe(-1);
    expect(moveArrowAt(arrows, box, at(-20, 40))).toBe(-1);
  });
});

/* ── the face on the panel and on a slot of its own ─────────────── */

let renderer: ReactTestRenderer | undefined;
const id = 'select-arrows-page';
beforeEach(() => { vi.stubGlobal('window', new EventTarget()); });
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

const CONFIG = {
  wind: {
    type: 'select', default: 'right', display: 'arrows',
    options: [
      { value: 'up', label: 'From below' },
      { value: 'right', label: 'From the left' },
      { value: 'down', label: 'From above' },
      { value: 'left', label: 'From the right' },
    ],
  },
  odd: { type: 'select', default: 'up', display: 'arrows', options: ['up', 'sideways'] },
} satisfies TweakConfig;

const slotIn = (root: ReactTestInstance, label: string) =>
  root.find((n) => n.type === 'div' && typeof n.props.className === 'string'
    && n.props.className.startsWith('tweakers-move-dial') && n.props['aria-label'] === label);
const byClass = (node: ReactTestInstance, className: string) => node.findAll((n) => n.props.className === className);

function checkFaces(root: ReactTestInstance) {
  const wind = slotIn(root, 'Wind');
  expect(wind.props['data-kind']).toBe('arrows');
  expect(wind.props.role).toBe('slider');
  expect(wind.props['aria-valuetext']).toBe('From the left');
  const arrows = byClass(wind, 'tweakers-move-dial-arrow');
  expect(arrows.map((a) => a.props['data-dir'])).toEqual(['up', 'right', 'down', 'left']);
  expect(arrows.filter((a) => a.props['data-on']).map((a) => a.props['data-dir'])).toEqual(['right']);
  expect(byClass(wind, 'tweakers-move-dial-screen')).toHaveLength(0);

  // not a direction: the ordinary list
  const odd = slotIn(root, 'Odd');
  expect(odd.props['data-kind']).toBe('enum');
  expect(byClass(odd, 'tweakers-move-dial-screen')).toHaveLength(1);
}

/** A slot element whose plate fills a 100px box from (0, 0). */
const slotTarget = {
  setPointerCapture() {},
  querySelector: (sel: string) => (sel.includes('arrows-plate') ? { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } : null),
  querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
};

/** A still press at (x, y) on the Wind slot. */
function tap(x: number, y: number) {
  act(() => {
    slotIn(renderer!.root, 'Wind').props.onPointerDown({ button: 0, clientX: x, clientY: y, pointerId: 1, currentTarget: slotTarget });
  });
  act(() => {
    slotIn(renderer!.root, 'Wind').props.onPointerUp({ button: 0, clientX: x, clientY: y, pointerId: 1, shiftKey: false, currentTarget: slotTarget });
  });
}

describe('the face, drawn', () => {
  it('on the Move panel', () => {
    TweakStore.registerPanel(id, 'Arrows', CONFIG);
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Arrows', dock: 'flow', productionEnabled: true })); });
    checkFaces(renderer!.root);
  });

  it('on a MoveSlot of its own', () => {
    TweakStore.registerPanel(id, 'Arrows', CONFIG);
    act(() => {
      renderer = create(createElement('div', null, ...Object.keys(CONFIG).map((path) =>
        createElement(MoveSlot, { key: path, panel: 'Arrows', path }))));
    });
    checkFaces(renderer!.root);
  });
});

describe('still an enum dial', () => {
  it('is seated and stepped like any option picker', () => {
    TweakStore.registerPanel(id, 'Arrows', CONFIG);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    const wind = page.dials[0];
    expect(isMoveDial(wind)).toBe(true);
    expect(wind.display).toBe('arrows');
    expect(moveNextOption(wind, 'right')).toBe('down');
  });

  it('takes the arrow a tap lands on, and steps on a tap anywhere else — on a slot of its own', () => {
    TweakStore.registerPanel(id, 'Arrows', CONFIG);
    act(() => { renderer = create(createElement(MoveSlot, { panel: 'Arrows', path: 'wind' })); });
    tap(5, 50);                                    /* the left quarter */
    expect(TweakStore.getValues(id).wind).toBe('left');
    tap(50, 95);                                   /* the bottom quarter */
    expect(TweakStore.getValues(id).wind).toBe('down');
    tap(50, 50);                                   /* the centre: steps on */
    expect(TweakStore.getValues(id).wind).toBe('left');
  });

  it('takes the arrow a tap lands on — on the Move panel', () => {
    TweakStore.registerPanel(id, 'Arrows', CONFIG);
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Arrows', dock: 'flow', productionEnabled: true })); });
    tap(50, 5);                                    /* the top quarter */
    expect(TweakStore.getValues(id).wind).toBe('up');
  });
});

describe('the dial face', () => {
  const dial = (bearing: number, origin: number) =>
    renderToStaticMarkup(createElement(MoveSlotDialBody, { label: 'Heading', value: `${bearing}°`, bearing, origin }));
  const ticks = (html: string) => Array.from(html.matchAll(/<path class="tweakers-move-needle-tick"( data-major="true")?( data-lit="true")? d="([^"]*)"/g))
    .map(([, major, lit, d]) => ({ major: !!major, lit: !!lit, count: d.match(/M/g)?.length ?? 0 }));

  it('is only marks: a tick every 5°, the needle a mark in the ring, the value in its middle, the name a tag on top', () => {
    const html = dial(90, 0);
    const [fine, major] = ticks(html);
    expect(fine).toEqual({ major: false, lit: false, count: 60 });
    expect(major).toEqual({ major: true, lit: false, count: 12 });
    expect(html).not.toContain('<circle');
    expect(html).not.toContain('tweakers-move-slot-display');
    expect(html).toContain('<span class="tweakers-move-dial-tag">Heading</span>');
    expect(html).toContain('<span class="tweakers-move-dial-ring-value">90°</span>');
    // the needle is a mark in the ring, not a hand from the centre, drawn over the ticks
    expect(html.indexOf('tweakers-move-needle-hand')).toBeGreaterThan(html.lastIndexOf('tweakers-move-needle-tick'));
    expect(html).not.toMatch(/needle-hand" x1="0" y1="0"/);
    expect(html).toMatch(/needle-hand" x1="8\.400" y1="0\.000" x2="11\.000" y2="0\.000"/);
  });

  it('lights the ticks the needle has swept from its origin, and none on the origin', () => {
    const lit = ticks(dial(90, 0)).filter((t) => t.lit);
    // 0..90 both ends taken: 0, 30, 60, 90 major, the fifteen between fine
    expect(lit).toEqual([{ major: false, lit: true, count: 15 }, { major: true, lit: true, count: 4 }]);
    expect(ticks(dial(45, 45)).filter((t) => t.lit).map((t) => t.count)).toEqual([0, 0]);
  });
});
