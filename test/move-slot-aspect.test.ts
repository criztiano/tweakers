import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { MoveSlot } from '../src/components/MoveSlot';
import { MOVE_SLOT_LIBRARY, MoveSlotAspectBody, MoveSlotDefaultBody, moveSlotKind } from '../src/components/move-slots';
import { buildMovePages, enumAspect, isMoveDial, parseAspect } from '../src/move-layout';
import { moveNextOption } from '../src/move-slot-core';
import { TweakStore, type ControlMeta, type TweakConfig } from '../src/store/TweakStore';

// Two faces a select can ask for on the Move: `aspect` draws the chosen
// proportion as a frame, `value` puts the chosen name up as the headline.
// Both stay stepped enum dials; only the drawing changes. A slider's value
// face can drop its bar with `track: false`.

const RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'];
const select = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'select', path: 'frame', label: 'Frame', options: RATIOS, ...extra } as ControlMeta);

describe('reading a proportion', () => {
  it('takes W:H, decimals included, and nothing else', () => {
    expect(parseAspect('16:9')).toEqual({ w: 16, h: 9 });
    expect(parseAspect(' 1.85 : 1 ')).toEqual({ w: 1.85, h: 1 });
    for (const bad of ['16x9', '16/9', 'wide', '0:1', '4:0', '', ':3', undefined, 16]) expect(parseAspect(bad)).toBeNull();
  });

  it('frames the current option, written with its label', () => {
    expect(enumAspect(select({ display: 'aspect' }), '9:16')).toEqual({ w: 9, h: 16, text: '9:16' });
    const named = select({ display: 'aspect', options: [{ value: '4:3', label: 'TV' }, { value: '16:9', label: 'HD' }] });
    expect(enumAspect(named, '16:9')).toEqual({ w: 16, h: 9, text: 'HD' });
    // an unknown value reads as the first option, as every enum dial does
    expect(enumAspect(named, 'nope')).toEqual({ w: 4, h: 3, text: 'TV' });
  });

  it('frames nothing unless the select asks, or the option is a proportion', () => {
    expect(enumAspect(select(), '16:9')).toBeNull();
    expect(enumAspect(select({ display: 'aspect', options: ['16:9', 'free'] }), 'free')).toBeNull();
  });
});

describe('which face a select wears', () => {
  it('names the aspect face, and falls back to the list for a value that is no proportion', () => {
    expect(moveSlotKind(select({ display: 'aspect' }), { enum: true, value: '4:3' })).toBe('aspect');
    expect(moveSlotKind(select({ display: 'aspect', options: ['16:9', 'free'] }), { enum: true, value: 'free' })).toBe('enum');
    expect(moveSlotKind(select(), { enum: true, value: '4:3' })).toBe('enum');
  });

  it('names the value face, over a glyph or a picture', () => {
    expect(moveSlotKind(select({ display: 'value' }), { enum: true, value: '4:3' })).toBe('value');
    expect(moveSlotKind(select({ display: 'value' }), { enum: true, value: '4:3', glyph: 'square' })).toBe('value');
    expect(moveSlotKind(select(), { enum: true, glyph: 'square' })).toBe('icon');
  });

  it('keeps a semantic drawing first: a lanes select stays lanes', () => {
    const lanes = select({ display: 'value', options: ['a', 'b'], moveVisual: { kind: 'lanes' } });
    expect(moveSlotKind(lanes, { enum: true, value: 'a' })).toBe('lanes');
  });

  it('is in the library', () => {
    expect(MOVE_SLOT_LIBRARY.aspect.component).toBe(MoveSlotAspectBody);
    expect(MOVE_SLOT_LIBRARY.value.component).toBe(MoveSlotDefaultBody);
  });
});

describe('the aspect frame', () => {
  it('carries the proportion and its words, and no cells unless asked', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotAspectBody, { label: 'Frame', w: 16, h: 9, text: '16:9' }));
    expect(html).toContain('<span class="tweakers-move-dial-tag">Frame</span>');
    expect(html).toContain(`--move-aspect:${16 / 9}`);
    expect(html).toContain('<span class="tweakers-move-dial-aspect-text">16:9</span>');
    expect(html).not.toContain('tweakers-move-dial-enum-cell');

    const cells = renderToStaticMarkup(createElement(MoveSlotAspectBody, {
      label: 'Frame', w: 1, h: 1, text: '1:1', options: RATIOS, activeIdx: 0, track: true,
    }));
    expect(cells.match(/tweakers-move-dial-enum-cell/g)).toHaveLength(5);
    expect(cells).toContain('data-track="true"');
  });
});

/* ── the faces on the panel and on a slot of their own ─────────────── */

let renderer: ReactTestRenderer | undefined;
const id = 'select-faces-page';
beforeEach(() => { vi.stubGlobal('window', new EventTarget()); });
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

const CONFIG = {
  frame: { type: 'select', default: '16:9', display: 'aspect', options: RATIOS },
  odd: { type: 'select', default: 'free', display: 'aspect', options: ['16:9', 'free'] },
  quality: { type: 'select', default: 'fine', display: 'value', options: [{ value: 'draft', label: 'Draft' }, { value: 'fine', label: 'Fine' }] },
  paged: { type: 'select', default: 'b', display: 'value', track: true, options: ['a', 'b', 'c'] },
  copies: { type: 'slider', default: 4, min: 1, max: 16, step: 1, display: 'value', track: false },
  decay: { type: 'slider', default: 250, min: 0, max: 2000, step: 1, unit: ' ms', display: 'value' },
} satisfies TweakConfig;

const slotIn = (root: ReactTestInstance, label: string) =>
  root.find((n) => n.type === 'div' && typeof n.props.className === 'string'
    && n.props.className.startsWith('tweakers-move-dial') && n.props['aria-label'] === label);
const byClass = (node: ReactTestInstance, className: string) => node.findAll((n) => n.props.className === className);

function checkFaces(root: ReactTestInstance) {
  const frame = slotIn(root, 'Frame');
  expect(frame.props['data-kind']).toBe('aspect');
  expect(frame.props['aria-valuetext']).toBe('16:9');
  expect(byClass(frame, 'tweakers-move-dial-aspect-frame')[0].props.style['--move-aspect']).toBeCloseTo(16 / 9);
  expect(byClass(frame, 'tweakers-move-dial-aspect-text')[0].props.children).toBe('16:9');
  expect(byClass(frame, 'tweakers-move-dial-screen')).toHaveLength(0);
  expect(byClass(frame, 'tweakers-move-dial-enum-cell')).toHaveLength(0);

  // not a proportion: the ordinary list
  const odd = slotIn(root, 'Odd');
  expect(odd.props['data-kind']).toBe('enum');
  expect(byClass(odd, 'tweakers-move-dial-screen')).toHaveLength(1);

  const quality = slotIn(root, 'Quality');
  expect(quality.props['data-kind']).toBe('value');
  expect(quality.props['data-sub']).toBe(true);
  expect(byClass(quality, 'tweakers-move-dial-sub').map((n) => n.props.children)).toEqual(['Quality']);
  expect(byClass(quality, 'tweakers-move-dial-value')[0].props.children).toBe('Fine');
  expect(byClass(quality, 'tweakers-move-dial-screen')).toHaveLength(0);
  expect(byClass(quality, 'tweakers-move-dial-bar')).toHaveLength(0);

  const paged = slotIn(root, 'Paged');
  expect(byClass(paged, 'tweakers-move-dial-enum-cell')).toHaveLength(3);
  expect(byClass(paged, 'tweakers-move-dial-enum-cell')[1].props['data-on']).toBe(true);

  const copies = slotIn(root, 'Copies');
  expect(copies.props['data-sub']).toBe(true);
  expect(byClass(copies, 'tweakers-move-dial-bar')).toHaveLength(0);
  expect(byClass(copies, 'tweakers-move-dial-readout')[0].props['data-bare']).toBe(true);

  // the value face keeps its bar unless the slider drops it
  expect(byClass(slotIn(root, 'Decay'), 'tweakers-move-dial-bar')).toHaveLength(1);
}

describe('the faces, drawn', () => {
  it('on the Move panel', () => {
    TweakStore.registerPanel(id, 'Faces', CONFIG);
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Faces', dock: 'flow', productionEnabled: true })); });
    checkFaces(renderer!.root);
  });

  it('on a MoveSlot of their own', () => {
    TweakStore.registerPanel(id, 'Faces', CONFIG);
    act(() => {
      renderer = create(createElement('div', null, ...Object.keys(CONFIG).map((path) =>
        createElement(MoveSlot, { key: path, panel: 'Faces', path }))));
    });
    checkFaces(renderer!.root);
  });
});

describe('still an enum dial', () => {
  it('is seated and stepped like any option picker', () => {
    TweakStore.registerPanel(id, 'Faces', CONFIG);
    const panel = TweakStore.getPanel(id)!;
    const [page] = buildMovePages([panel]);
    expect(page.dials.map((c) => c.path)).toEqual(['frame', 'odd', 'quality', 'paged', 'copies', 'decay']);
    const frame = page.dials[0];
    expect(isMoveDial(frame)).toBe(true);
    expect(frame.display).toBe('aspect');
    expect(page.dials[3].track).toBe(true);
    expect(page.dials[4].track).toBe(false);
    expect(moveNextOption(frame, '16:9')).toBe('9:16');
  });

  it('steps on a click, from the slot', () => {
    TweakStore.registerPanel(id, 'Faces', CONFIG);
    act(() => { renderer = create(createElement(MoveSlot, { panel: 'Faces', path: 'frame' })); });
    const slot = slotIn(renderer!.root, 'Frame');
    const target = { setPointerCapture() {}, querySelector: () => null, querySelectorAll: () => [], getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) };
    act(() => {
      slot.props.onPointerDown({ button: 0, clientX: 10, clientY: 10, pointerId: 1, currentTarget: target });
    });
    act(() => {
      slotIn(renderer!.root, 'Frame').props.onPointerUp({ button: 0, clientX: 10, clientY: 10, pointerId: 1, shiftKey: false, currentTarget: target });
    });
    expect(TweakStore.getValues(id).frame).toBe('9:16');
  });
});
