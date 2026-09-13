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

// The gradient's integrated editor, the small colour pad and the balance
// slot — the colour system's three new faces, on one page.
describe('Move gradient, balance and small colour panel', () => {
  const gid = `${id}-gradient`;
  const rect = { left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40 };
  const point = (x: number) => ({ clientX: x, clientY: 0, button: 0, pointerId: 1, shiftKey: false,
    currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => rect } });
  function mountGradient() {
    TweakStore.registerPanel(gid, 'Ramp', {
      ramp: { type: 'gradient', default: { type: 'linear', angle: 90, stops: [
        { color: '#ff0000ff', position: 0 },
        { color: '#0000ffff', position: 1 },
      ] } },
      colorA: { type: 'color', default: '#ff0000' },
      colorB: { type: 'color', default: '#0000ff' },
      mix: { type: 'balance', a: 'colorA', b: 'colorB', default: 0.5 },
    });
    act(() => { renderer = create(createElement(MovePanel, { panels: ['Ramp'], dock: 'flow', productionEnabled: true })); });
  }
  afterEach(() => { TweakStore.unregisterPanel(gid); });
  const ramp = () => renderer!.root.findByProps({ 'data-kind': 'ramp' });

  it('a still tap on the ramp slot opens the editor; a drag slides a stop instead', () => {
    mountGradient();
    act(() => ramp().props.onPointerDown(point(90)));
    act(() => ramp().props.onPointerMove(point(60)));
    act(() => ramp().props.onPointerUp());
    expect(MoveColorStore.getView()).toBeNull();
    const g = TweakStore.getValue(gid, 'ramp') as { stops: { position: number }[] };
    expect(g.stops[1].position).toBeLessThan(1);
    act(() => ramp().props.onPointerDown(point(90)));
    act(() => ramp().props.onPointerUp());
    expect(MoveColorStore.getView()?.path).toBe('ramp');
  });

  it('the track row becomes the stop row while the editor is open, and hands back on close', () => {
    mountGradient();
    act(() => MoveColorStore.open(gid, 'ramp'));
    const stopRow = renderer!.root.findByProps({ 'aria-label': 'Ramp stops' });
    const tabs = stopRow.findAllByType('button');
    expect(tabs).toHaveLength(2);
    act(() => tabs[1].props.onClick());
    expect(MoveColorStore.getStop()).toBe(1);
    /* the dials now edit stop 2 */
    act(() => renderer!.root.findByProps({ 'aria-label': 'Hue' }).props.onChange({ target: { value: '120' } }));
    const g = TweakStore.getValue(gid, 'ramp') as { stops: { color: string }[] };
    expect(g.stops[1].color).toBe('#00ff00ff');
    expect(g.stops[0].color).toBe('#ff0000ff');
    act(() => MoveColorStore.close());
    expect(renderer!.root.findAllByProps({ 'aria-label': 'Ramp stops' })).toHaveLength(0);
  });

  it('the editor shows the ramp with draggable, selectable stop handles', () => {
    mountGradient();
    act(() => MoveColorStore.open(gid, 'ramp'));
    const handles = renderer!.root.findByProps({ 'aria-label': 'Gradient stops' }).findAllByType('button');
    expect(handles).toHaveLength(2);
    act(() => handles[1].props.onPointerDown({ ...point(100), currentTarget: { setPointerCapture: vi.fn(), closest: () => null, getBoundingClientRect: () => rect } }));
    expect(MoveColorStore.getStop()).toBe(1);
  });

  it('a balance seats its colours in its own column, wearing their store values', () => {
    mountGradient();
    // Zero movePads declared: the balance placed both — a on the switch row,
    // b on the value row of its own column (dial 2, after ramp).
    const [page] = buildMovePages([TweakStore.getPanel(gid)!]);
    const at = page.dials.findIndex((d) => d?.path === 'mix');
    expect(page.toggles[at]?.path).toBe('colorA');
    expect(page.values[at]?.path).toBe('colorB');
    // The swatches carry the store's colours with no app wiring.
    const pads = renderer!.root.findAllByProps({ 'data-kind': 'color' }).filter((n) => n.type === 'button');
    const swatch = (pad: (typeof pads)[number]) =>
      pad.findByProps({ className: 'tweakers-move-pad-swatch' }).findAllByType('span').at(-1)!.props.style.background;
    expect(pads.map(swatch)).toEqual(['#ff0000', '#0000ff']);
    act(() => TweakStore.updateValue(gid, 'colorA', '#00ff00'));
    expect(swatch(renderer!.root.findAllByProps({ 'data-kind': 'color' }).filter((n) => n.type === 'button')[0])).toBe('#00ff00');
  });

  // Colour chips follow the small-slot grammar every value chip does: TAP
  // latches the chip onto the dial above, HOLD peeks; the slot then IS the
  // big colour slot, so its own tap is the door to the editor. A pad tap
  // never opens the editor.
  const colorPads = () => renderer!.root.findAllByProps({ 'data-kind': 'color' }).filter((n) => n.type === 'button' && n.props.className === 'tweakers-move-pad');
  const colorSlot = () => renderer!.root.findAllByProps({ 'data-kind': 'color' }).filter((n) => n.type === 'button' && n.props.className === 'tweakers-move-dial');
  const pad = (label: string) => colorPads().find((n) => n.props['aria-label'] === label)!;
  const tapPad = (label: string) => {
    act(() => pad(label).props.onPointerDown({ pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }));
    act(() => pad(label).props.onPointerUp());
  };

  it('a colour pad tap latches its chip into the slot above — it never opens the editor', () => {
    mountGradient();
    const latches: unknown[] = [];
    window.addEventListener('move-tweakers:latch', (e) => latches.push((e as CustomEvent).detail));
    expect(colorPads()).toHaveLength(2);
    expect(colorSlot()).toHaveLength(0);
    tapPad('Color A');
    expect(MoveColorStore.getView()).toBeNull();
    expect(pad('Color A').props['data-latched']).toBe(true);
    expect(latches).toEqual([{ pageId: gid, path: 'colorA', latched: true }]);
    // the balance's slot now holds Color A as the big colour slot, pulsing with its chip
    expect(colorSlot()).toHaveLength(1);
    expect(colorSlot()[0].props['aria-label']).toMatch(/^Color A/);
    expect(colorSlot()[0].props['data-latched']).toBe(true);
    expect(renderer!.root.findAllByProps({ 'data-kind': 'balance' })).toHaveLength(0);
    // the slot's own tap is the big colour slot's door to the editor
    act(() => colorSlot()[0].props.onClick());
    expect(MoveColorStore.getView()?.path).toBe('colorA');
    act(() => MoveColorStore.close());
    // latching B releases A — one knob, one owner — and tapping B again lets go
    tapPad('Color B');
    expect(colorSlot()[0].props['aria-label']).toMatch(/^Color B/);
    expect(pad('Color A').props['data-latched']).toBeUndefined();
    tapPad('Color B');
    expect(colorSlot()).toHaveLength(0);
    expect(renderer!.root.findAllByProps({ 'data-kind': 'balance' })).toHaveLength(1);
  });

  it('holding a colour pad peeks: the slot holds the colour until release, and nothing latches', () => {
    mountGradient();
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
    act(() => pad('Color B').props.onPointerDown({ pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }));
    expect(pad('Color B').props['data-held']).toBe(true);
    expect(colorSlot()[0].props['aria-label']).toMatch(/^Color B/);
    now.mockReturnValue(2000);                     // well past a tap
    act(() => pad('Color B').props.onPointerUp());
    expect(pad('Color B').props['data-latched']).toBeUndefined();
    expect(colorSlot()).toHaveLength(0);
    expect(MoveColorStore.getView()).toBeNull();
    now.mockRestore();
  });

  it('a colour chip and a slider chip answer the same gestures, with the same events', () => {
    const cid = `${id}-chips`;
    const config: Record<string, unknown> = {};
    for (let i = 0; i < 8; i++) config[`d${i}`] = [0.5, 0, 1];
    config.extra = [0.2, 0, 1];
    config.ink = { type: 'color', default: '#00ff00' };
    TweakStore.registerPanel(cid, 'Chips', config as never, undefined, { movePads: { ink: 5 } });
    act(() => { renderer = create(createElement(MovePanel, { panels: ['Chips'], dock: 'flow', productionEnabled: true })); });
    const chip = (kind: string) => renderer!.root.findAll((n) => n.type === 'button' && n.props.className === 'tweakers-move-pad' && n.props['data-kind'] === kind)[0];
    const slotLabels = () => renderer!.root.findAll((n) => n.props.className === 'tweakers-move-dial' && n.props['aria-label'] !== undefined).map((n) => String(n.props['aria-label']));
    const latches: { path: string }[] = [];
    window.addEventListener('move-tweakers:latch', (e) => latches.push((e as CustomEvent).detail));
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
    for (const [kind, label] of [['value', 'Extra'], ['color', 'Ink']] as const) {
      const before = slotLabels();
      now.mockReturnValue(1000);
      // same handlers, no click shortcut on either
      expect(chip(kind).props.onClick).toBeUndefined();
      // hold peeks
      act(() => chip(kind).props.onPointerDown({ pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }));
      expect(chip(kind).props['data-held']).toBe(true);
      expect(slotLabels().some((l) => l.startsWith(label))).toBe(true);
      now.mockReturnValue(5000);
      act(() => chip(kind).props.onPointerUp());
      expect(slotLabels()).toEqual(before);
      expect(chip(kind).props['data-latched']).toBeUndefined();
      // tap latches, tap again releases
      act(() => chip(kind).props.onPointerDown({ pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }));
      act(() => chip(kind).props.onPointerUp());
      expect(chip(kind).props['data-latched']).toBe(true);
      expect(slotLabels().some((l) => l.startsWith(label))).toBe(true);
      act(() => chip(kind).props.onPointerDown({ pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }));
      act(() => chip(kind).props.onPointerUp());
      expect(chip(kind).props['data-latched']).toBeUndefined();
      expect(slotLabels()).toEqual(before);
    }
    expect(latches.map((l) => l.path)).toEqual(['extra', 'extra', 'ink', 'ink']);
    expect(MoveColorStore.getView()).toBeNull();
    now.mockRestore();
    TweakStore.unregisterPanel(cid);
  });

  it('the hardware latching a switch-row colour substitutes it on screen too', () => {
    mountGradient();
    act(() => window.dispatchEvent(new CustomEvent('move-tweakers:override', { detail: { pageId: gid, held: {}, latched: { colorA: true } } })));
    expect(colorSlot()[0].props['aria-label']).toMatch(/^Color A/);
    expect(pad('Color A').props['data-latched']).toBe(true);
  });

  it('the balance slot blends its two colours and drags like a dial', () => {
    mountGradient();
    const slot = renderer!.root.findByProps({ 'data-kind': 'balance' });
    act(() => slot.props.onPointerDown(point(50)));
    expect(TweakStore.getValue(gid, 'mix')).toBeCloseTo(0.5, 5);
    act(() => slot.props.onPointerMove(point(100)));
    expect(TweakStore.getValue(gid, 'mix')).toBe(1);
    act(() => slot.props.onPointerUp());
  });
});
