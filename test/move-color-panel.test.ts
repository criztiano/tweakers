import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel, MOVE_PAGE_EVENT } from '../src/components/MovePanel';
import { MoveColorStore, MOVE_COLOR_PALETTES } from '../src/move-color';
import { TweakStore } from '../src/store/TweakStore';
import { MoveSurfaceStore } from '../src/move-surface-store';
import { buildMovePages } from '../src/move-layout';
import { moveSlotKind } from '../src/components/move-slots';

const id = 'move-color-panel';
let renderer: ReactTestRenderer | undefined;
beforeEach(() => { vi.stubGlobal('window', new EventTarget()); });
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  MoveColorStore.close();
  MoveColorStore.setPalette(null);
  TweakStore.unregisterPanel(id);
  TweakStore.unregisterPanel(`${id}-other`);
  vi.unstubAllGlobals();
});

function mount() {
  TweakStore.registerPanel(id, 'ColorTest', { color: { type: 'color', default: '#ff0000', alpha: false }, toggle: false });
  act(() => { renderer = create(createElement(MovePanel, { panels: ['ColorTest', 'Other'], dock: 'flow', productionEnabled: true })); });
}
const slot = () => renderer!.root.findByProps({ 'data-kind': 'color' });
const grid = (label: string) => renderer!.root.findByProps({ role: 'group', 'aria-label': label });
const pointer = (x: number) => ({ clientX: x, clientY: 0, button: 0, pointerId: 1, shiftKey: false,
  currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ width: 100 }) } });

describe('Move color panel', () => {
  it('seats colors in dial slots and never in overflow chips', () => {
    mount();
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    expect(page.dials[0].type).toBe('color');
    expect(moveSlotKind(page.dials[0])).toBe('color');
    expect(page.values).toEqual([]);
    expect(slot().props['aria-expanded']).toBe(false);
    TweakStore.registerPanel(`${id}-other`, 'Other', {
      ...Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`dial${index}`, [0.5, 0, 1]])),
      late: { type: 'color', default: '#00ff00' },
    });
    const [fullPage] = buildMovePages([TweakStore.getPanel(`${id}-other`)!]);
    expect(fullPage.dials).toHaveLength(8);
    expect(fullPage.values).toEqual([]);
  });

  it('opens the editor with hue and lightness sliders and copiable readouts', () => {
    mount();
    act(() => slot().props.onClick());
    expect(renderer!.root.findByProps({ role: 'dialog' }).props['aria-label']).toBe('Color color editor');
    act(() => renderer!.root.findByProps({ 'aria-label': 'Hue' }).props.onChange({ target: { value: '120' } }));
    expect(MoveColorStore.read(id, 'color').h).toBe(120);
    act(() => renderer!.root.findByProps({ 'aria-label': 'Lightness' }).props.onChange({ target: { value: '0.25' } }));
    expect(MoveColorStore.read(id, 'color').l).toBe(0.25);
    /* the three copiable readouts sit in the header */
    for (const label of ['HSL', 'HEX', 'OKLCH']) {
      expect(renderer!.root.findByProps({ 'aria-label': `Copy ${label} value` })).toBeTruthy();
    }
  });

  it('supports opacity endpoints from the sequencer and the first pad row', () => {
    mount();
    act(() => MoveColorStore.open(id, 'color'));
    expect(grid('Color opacity sequencer').findAllByType('button')).toHaveLength(16);
    act(() => grid('Color opacity sequencer').findAllByType('button')[0].props.onClick());
    expect(MoveColorStore.read(id, 'color').a).toBe(0);
    expect(TweakStore.getValue(id, 'color')).toBe('#ff000000');
    act(() => grid('Color opacity sequencer').findAllByType('button')[15].props.onClick());
    expect(MoveColorStore.read(id, 'color').a).toBe(1);
    /* the mirrored pad row: eight levels, lit progressively up to the level */
    const pads = grid('Opacity pads').findAllByType('button');
    expect(pads).toHaveLength(8);
    act(() => pads[3].props.onClick());
    expect(MoveColorStore.read(id, 'color').a).toBeCloseTo(3 / 7);
    const lit = grid('Opacity pads').findAllByType('button').filter(pad => pad.props['data-on']);
    expect(lit).toHaveLength(4);
  });

  it('locks the dial to a palette, steps between its colours, and comes back via All colors', () => {
    mount();
    act(() => MoveColorStore.open(id, 'color'));
    act(() => MoveColorStore.openPicker());
    expect(MoveColorStore.isPickerOpen()).toBe(true);
    /* row 0 is "All colors"; row 1 the first palette */
    act(() => MoveColorStore.choosePicker(1));
    expect(MoveColorStore.getPaletteId()).toBe(MOVE_COLOR_PALETTES[0].id);
    expect(MoveColorStore.isPickerOpen()).toBe(false);
    act(() => MoveColorStore.setPaletteColor(5));
    expect(MoveColorStore.paletteIndex(id, 'color')).toBe(5);
    /* a turn is a step to the neighbouring palette colour */
    act(() => MoveColorStore.turn(id, 'color', 1));
    expect(MoveColorStore.paletteIndex(id, 'color')).toBe(6);
    act(() => MoveColorStore.turn(id, 'color', -1));
    expect(MoveColorStore.paletteIndex(id, 'color')).toBe(5);
    /* free hue writes snap onto the palette while it is locked */
    act(() => MoveColorStore.update(id, 'color', { h: 3 }));
    expect(MoveColorStore.paletteIndex(id, 'color')).not.toBeNull();
    act(() => { MoveColorStore.openPicker(); MoveColorStore.choosePicker(0); });
    expect(MoveColorStore.getPaletteId()).toBeNull();
  });

  it('distinguishes a tap from a hue drag and supports keyboard edits while closed', () => {
    mount();
    act(() => slot().props.onPointerDown(pointer(10)));
    act(() => slot().props.onPointerUp());
    act(() => slot().props.onClick());
    expect(MoveColorStore.getView()?.path).toBe('color');
    act(() => slot().props.onClick());
    act(() => slot().props.onPointerDown(pointer(10)));
    act(() => slot().props.onPointerMove(pointer(60)));
    act(() => slot().props.onPointerUp());
    act(() => slot().props.onClick());
    expect(MoveColorStore.read(id, 'color').h).toBe(180);
    expect(MoveColorStore.getView()).toBeNull();
    act(() => slot().props.onKeyDown({ key: 'ArrowRight', shiftKey: true, preventDefault: vi.fn(), stopPropagation: vi.fn() }));
    expect(MoveColorStore.read(id, 'color').h).toBeCloseTo(180.1);
  });

  it('disables the slot and open editor when the control becomes disabled', () => {
    mount();
    act(() => MoveColorStore.open(id, 'color'));
    act(() => TweakStore.setDisabled(id, 'color', true));
    expect(slot().props.disabled).toBe(true);
    expect(renderer!.root.findByProps({ 'aria-label': 'Hue' }).props.disabled).toBe(true);
    expect(grid('Opacity pads').findAllByType('button').every(button => button.props.disabled)).toBe(true);
  });

  it('closes on Escape, outside pointer, page change and unmount', () => {
    TweakStore.registerPanel(`${id}-other`, 'Other', { amount: [0.5, 0, 1] });
    mount();
    act(() => MoveColorStore.open(id, 'color'));
    const escape = new Event('keydown');
    Object.defineProperty(escape, 'key', { value: 'Escape' });
    act(() => window.dispatchEvent(escape));
    expect(MoveColorStore.getView()).toBeNull();
    act(() => MoveColorStore.open(id, 'color'));
    act(() => window.dispatchEvent(new Event('pointerdown')));
    expect(MoveColorStore.getView()).toBeNull();
    act(() => MoveColorStore.open(id, 'color'));
    act(() => window.dispatchEvent(new CustomEvent(MOVE_PAGE_EVENT, { detail: { pageId: `${id}-other` } })));
    expect(MoveColorStore.getView()).toBeNull();
    act(() => window.dispatchEvent(new CustomEvent(MOVE_PAGE_EVENT, { detail: { pageId: id } })));
    act(() => MoveColorStore.open(id, 'color'));
    act(() => renderer!.unmount());
    renderer = undefined;
    expect(MoveColorStore.getView()).toBeNull();
  });

  it('restores the application pad view after the editor closes', () => {
    mount();
    const before = MoveSurfaceStore.getState();
    const toggles = () => renderer!.root.findAllByProps({ 'data-kind': 'toggle' });
    expect(toggles()).toHaveLength(1);
    act(() => MoveColorStore.open(id, 'color'));
    expect(toggles()).toHaveLength(0);
    act(() => MoveColorStore.close());
    expect(toggles()).toHaveLength(1);
    expect(MoveSurfaceStore.getState()).toBe(before);
  });
});
