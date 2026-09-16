import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel, MOVE_OVERRIDE_EVENT } from '../src/components/MovePanel';
import { MoveMultibandDisplay } from '../src/components/MoveMultibandDisplay';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

let renderer: ReactTestRenderer | undefined;
const id = 'move-visual-interaction';

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

function mount(config: TweakConfig) {
  TweakStore.registerPanel(id, 'Visual', config);
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Visual', dock: 'flow', productionEnabled: true })); });
}
const dial = (label: string) => renderer!.root.findByProps({ role: 'slider', 'aria-label': label });
const keyEvent = (key: string, shiftKey = false) => ({ key, shiftKey, preventDefault: vi.fn(), stopPropagation: vi.fn() });
const pointer = (clientX: number, shiftKey = false) => ({
  clientX, clientY: 0, pointerId: 1, shiftKey,
  currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }) },
});
const opacity = { type: 'slider', min: 0, max: 1, default: 0.5, step: 0.01, moveVisual: { kind: 'opacity' } } as const;

describe('MovePanel semantic interactions', () => {
  it('exposes the current domain and commits keyboard edits to the shared store', () => {
    mount({ opacity });
    expect(dial('Opacity').props['aria-valuenow']).toBe(0.5);
    expect(dial('Opacity').props['aria-valuetext']).toBe('50%');
    const right = keyEvent('ArrowRight');
    act(() => dial('Opacity').props.onKeyDown(right));
    expect(TweakStore.getValues(id).opacity).toBe(0.51);
    expect(dial('Opacity').props['aria-valuetext']).toBe('51%');
    expect(right.preventDefault).toHaveBeenCalledOnce();
    act(() => dial('Opacity').props.onKeyDown(keyEvent('End')));
    expect(TweakStore.getValues(id).opacity).toBe(1);
    act(() => dial('Opacity').props.onKeyDown(keyEvent('Home')));
    expect(TweakStore.getValues(id).opacity).toBe(0);
  });

  it('updates the rendered specimens when shared values change', () => {
    mount({
      opacity,
      blur: { type: 'slider', min: 0, max: 12, default: 0, moveVisual: { kind: 'blur' } },
      pan: { type: 'slider', min: -1, max: 1, default: 0, moveVisual: { kind: 'pan' } },
      pitch: { type: 'slider', min: -12, max: 12, default: 0, moveVisual: { kind: 'pitch' } },
    });
    const solid = (label: string) => dial(label).findByProps({ className: 'tweakers-move-visual-solid' });
    const point = () => dial('Pan').findByProps({ className: 'tweakers-move-visual-point' });
    const triangle = () => dial('Pitch').findByProps({ className: 'tweakers-move-visual-pitch-marker' });
    expect(solid('Opacity').props.opacity).toBe(0.5);
    expect(solid('Blur').props.style.filter).toBe('blur(0px)');
    expect(point().props.cx).toBe(50);
    expect(triangle().props['data-offset']).toBeUndefined();
    act(() => {
      for (const label of ['Opacity', 'Blur', 'Pan', 'Pitch']) dial(label).props.onKeyDown(keyEvent('End'));
    });
    expect(solid('Opacity').props.opacity).toBe(1);
    expect(solid('Blur').props.style.filter).not.toBe('blur(0px)');
    expect(point().props.cx).toBe(84);
    expect(point().props['data-offset']).toBe(true);
    expect(triangle().props.d).toBe('M92 22l-5 -7h10z');
    expect(triangle().props['data-offset']).toBe(true);
  });

  it('draws a trim start beside a trim end as one line, each column editing its own edge', () => {
    mount({
      start: { type: 'slider', min: 0, max: 10, default: 2, step: 0.01, moveVisual: { kind: 'trim', edge: 'start' } },
      end: { type: 'slider', min: 0, max: 10, default: 10, step: 0.01, moveVisual: { kind: 'trim', edge: 'end' } },
    });
    const span = renderer!.root.findByProps({ 'data-kind': 'trim-span' });
    const flag = (edge: string) => span.findByProps({ className: 'tweakers-move-trim-span-flag', 'data-edge': edge });
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-dial' })).toHaveLength(1);
    expect(flag('start').props.style.left).toBe('20%');
    expect(flag('start').props['data-offset']).toBe(true);
    expect(flag('end').props.style.left).toBe('100%');
    expect(flag('end').props['data-offset']).toBeUndefined();
    act(() => dial('End').props.onKeyDown(keyEvent('Home')));
    expect(TweakStore.getValues(id)).toMatchObject({ start: 2, end: 0 });
    // the drag reads the whole line, not the touched column
    const zone = { ...pointer(130), currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, width: 120 }), parentElement: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 260, height: 140 }) } } };
    act(() => dial('End').props.onPointerDown(zone));
    expect(TweakStore.getValues(id).end).toBe(5); // the middle of a 260px line inset 14px each side
    act(() => dial('End').props.onPointerUp());
    expect(flag('end').props['data-offset']).toBe(true);
  });

  it('draws threshold, look-ahead and release side by side as one gate, each column editing its own dial', () => {
    mount({
      gate: { type: 'slider', min: -80, max: 0, default: -20, step: 1, moveVisual: { kind: 'gate', role: 'threshold' } },
      look: { type: 'slider', min: 0, max: 40, default: 10, step: 1, moveVisual: { kind: 'gate', role: 'lookahead' } },
      release: { type: 'slider', min: 10, max: 510, default: 260, step: 5, moveVisual: { kind: 'gate', role: 'release' } },
    });
    const face = renderer!.root.findByProps({ 'data-kind': 'gate' });
    const bar = (role: string) => face.findByProps({ className: 'tweakers-move-face-bar', 'data-role': role });
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-dial' })).toHaveLength(1);
    expect(bar('threshold').props.style['--move-face-at']).toBe(0.75);
    expect(bar('release').props.style['--move-face-at']).toBe(0.5);
    act(() => dial('Release').props.onKeyDown(keyEvent('End')));
    expect(TweakStore.getValues(id)).toMatchObject({ gate: -20, look: 10, release: 510 });
    // a bar's drag reads its own drawn track, top to bottom
    const track = { getBoundingClientRect: () => ({ left: 0, top: 30, width: 4, height: 84 }) };
    const press = { clientX: 0, clientY: 32 + 40, pointerId: 1, shiftKey: false, currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }), closest: () => ({ querySelector: () => track }) } };
    act(() => dial('Gate').props.onPointerDown(press));
    expect(TweakStore.getValues(id).gate).toBe(-40);
    act(() => dial('Gate').props.onPointerUp());
  });

  it('draws an amount, a speed and band dials as one multiband face, band chips joining the curve', () => {
    const blank = { type: 'toggle', default: false, moveSlot: true, moveBlank: true } as const;
    const band = (k: number, v: number) => ({ type: 'slider', min: 0, max: 100, default: v, step: 1, moveVisual: { kind: 'multiband', role: 'band', band: k } }) as const;
    TweakStore.registerPanel(id, 'Visual', {
      clean: { type: 'slider', min: 0, max: 100, default: 50, step: 1, moveVisual: { kind: 'multiband', role: 'amount', icon: 'broom-sparkles' } },
      speed: { type: 'slider', min: 1, max: 101, default: 51, step: 1, moveVisual: { kind: 'multiband', role: 'speed' } },
      hi: band(0, 100), mid: band(2, 50), sub: band(5, 0),
      _5: blank, _6: blank, _7: blank,
      hiMid: band(1, 80), loMid: band(3, 40), bass: band(4, 20),
    }, undefined, { movePads: { hiMid: 2, loMid: 3, bass: 4 }, moveTopRow: ['hiMid', 'loMid', 'bass'] });
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Visual', dock: 'flow', productionEnabled: true })); });
    const face = renderer!.root.findByProps({ 'data-kind': 'multiband' });
    expect(face.props.style.gridColumn).toBe('span 5');
    // the face and the three held-open columns after it
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-dial' })).toHaveLength(4);
    const curve = face.findByType(MoveMultibandDisplay).props.bands.map((b: { position: number }) => b.position);
    // each point sits at its own band's value, so a drag's point stays under the finger
    expect(curve).toEqual([1, 0.8, 0.5, 0.4, 0.2, 0]);
    act(() => dial('Mid').props.onKeyDown(keyEvent('End')));
    expect(TweakStore.getValues(id).mid).toBe(100);
    const moved = renderer!.root.findByProps({ 'data-kind': 'multiband' }).findByType(MoveMultibandDisplay).props.bands.map((b: { position: number }) => b.position);
    expect(moved[2]).toBe(1);
    // the speed turns round its gauge: straight up is the middle
    const gauge = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 98, height: 64 }) };
    const press = { clientX: 49, clientY: 0, pointerId: 1, shiftKey: false, currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }), closest: () => ({ querySelector: () => gauge }) } };
    act(() => dial('Speed').props.onPointerDown(press));
    expect(TweakStore.getValues(id).speed).toBe(51);
    act(() => dial('Speed').props.onPointerDown({ ...press, clientX: 98, clientY: 42 }));
    expect(TweakStore.getValues(id).speed).toBeCloseTo(1 + 100 * (0.5 + 90 / 220), 0);
    act(() => dial('Speed').props.onPointerUp());
  });

  it('takes the band under the cursor on the band grid, pads included', () => {
    const blank = { type: 'toggle', default: false, moveSlot: true, moveBlank: true } as const;
    const band = (k: number, v: number) => ({ type: 'slider', min: 0, max: 100, default: v, step: 1, moveVisual: { kind: 'multiband', role: 'band', band: k } }) as const;
    TweakStore.registerPanel(id, 'Visual', {
      clean: { type: 'slider', min: 0, max: 100, default: 50, step: 1, moveVisual: { kind: 'multiband', role: 'amount' } },
      speed: { type: 'slider', min: 0, max: 100, default: 50, step: 1, moveVisual: { kind: 'multiband', role: 'speed' } },
      hi: band(0, 100), mid: band(2, 100), sub: band(5, 100),
      _5: blank, _6: blank, _7: blank,
      hiMid: band(1, 100), loMid: band(3, 100), bass: band(4, 100),
    }, undefined, { movePads: { hiMid: 2, loMid: 3, bass: 4 }, moveTopRow: ['hiMid', 'loMid', 'bass'] });
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Visual', dock: 'flow', productionEnabled: true })); });
    const grid = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 100 }) };
    // x 75 of 300 is the second of six bands: Hi mid, on a pad
    const press = { clientX: 75, clientY: 75, pointerId: 1, shiftKey: false, currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }), closest: () => ({ querySelector: () => grid }) } };
    act(() => dial('Hi').props.onPointerDown(press));
    expect(TweakStore.getValues(id)).toMatchObject({ hi: 100, hiMid: 25 });
    act(() => dial('Hi').props.onPointerUp());
  });

  it('draws channel dials side by side as one mixer, each fader in its own column', () => {
    const channel = (v: number, tone?: 'orange') => ({ type: 'slider', min: 0, max: 100, default: v, step: 1, moveVisual: { kind: 'channel', icon: 'disc-3', tone } }) as const;
    mount({ a: channel(0), b: channel(40, 'orange') });
    const face = renderer!.root.findByProps({ 'data-kind': 'channel' });
    expect(face.props.style.gridColumn).toBe('span 2');
    const fills = face.findAllByProps({ className: 'tweakers-move-channel-fill' });
    expect(fills.map((f) => [f.props.style['--move-face-at'], f.props['data-empty']])).toEqual([[0, true], [0.4, undefined]]);
    const well = { getBoundingClientRect: () => ({ left: 0, top: 40, width: 100, height: 100 }) };
    const press = { clientX: 0, clientY: 65, pointerId: 1, shiftKey: false, currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }), closest: () => ({ querySelector: (q: string) => (q === '[data-track="channel-1"]' ? well : null) }) } };
    act(() => dial('B').props.onPointerDown(press));
    expect(TweakStore.getValues(id).b).toBe(75);
    act(() => dial('B').props.onPointerUp());
  });

  it('keeps the ordinary faces when the gate dials are out of order', () => {
    mount({
      look: { type: 'slider', min: 0, max: 40, default: 10, step: 1, moveVisual: { kind: 'gate', role: 'lookahead' } },
      gate: { type: 'slider', min: -80, max: 0, default: -20, step: 1, moveVisual: { kind: 'gate', role: 'threshold' } },
      release: { type: 'slider', min: 10, max: 510, default: 260, step: 5, moveVisual: { kind: 'gate', role: 'release' } },
    });
    expect(renderer!.root.findAllByProps({ 'data-kind': 'gate' })).toHaveLength(0);
  });

  it('keeps pointer dragging and shift fine dragging on the existing mapping', () => {
    mount({ opacity });
    act(() => dial('Opacity').props.onPointerDown(pointer(60)));
    expect(TweakStore.getValues(id).opacity).toBe(0.5);
    act(() => dial('Opacity').props.onPointerMove(pointer(70, true)));
    expect(TweakStore.getValues(id).opacity).toBe(0.5);
    act(() => dial('Opacity').props.onPointerMove(pointer(90, true)));
    expect(TweakStore.getValues(id).opacity).toBe(0.52);
    act(() => dial('Opacity').props.onPointerUp());
  });

  it('responds to runtime disabled state and blocks key, pointer and in-progress drag edits', () => {
    mount({ opacity });
    act(() => dial('Opacity').props.onPointerDown(pointer(60)));
    act(() => TweakStore.setDisabled(id, 'opacity', true));
    expect(dial('Opacity').props['aria-disabled']).toBe(true);
    expect(dial('Opacity').props.tabIndex).toBe(-1);
    act(() => {
      dial('Opacity').props.onKeyDown(keyEvent('End'));
      dial('Opacity').props.onPointerDown(pointer(110));
      dial('Opacity').props.onPointerMove(pointer(110));
    });
    expect(TweakStore.getValues(id).opacity).toBe(0.5);
    act(() => TweakStore.setDisabled(id, 'opacity', false));
    act(() => dial('Opacity').props.onKeyDown(keyEvent('End')));
    expect(TweakStore.getValues(id).opacity).toBe(1);
  });

  it('steps app playback values and names the selected mode to assistive technology', () => {
    mount({ direction: { type: 'select', options: [{ value: 'f', label: 'Forward' }, { value: 'r', label: 'Reverse' }], moveVisual: { kind: 'playback', modes: { f: 'forward', r: 'reverse' } } } });
    act(() => dial('Direction').props.onKeyDown(keyEvent('ArrowRight')));
    expect(TweakStore.getValues(id).direction).toBe('r');
    expect(dial('Direction').props['aria-valuetext']).toBe('Reverse');
    expect(dial('Direction').props['data-visual']).toBe('playback');
    act(() => TweakStore.setDisabled(id, 'direction', true));
    act(() => dial('Direction').props.onKeyDown(keyEvent('Home')));
    expect(TweakStore.getValues(id).direction).toBe('r');
  });

  it('draws and edits the substituted chip’s own metadata for screen holds and hardware latches', () => {
    const config: TweakConfig = { opacity };
    for (let index = 1; index < 8; index++) config[`dial${index}`] = [0.5, 0, 1];
    config.blur = { type: 'slider', min: 0, max: 12, default: 3, step: 0.1, moveVisual: { kind: 'blur' } };
    mount(config);
    const chip = renderer!.root.findByProps({ 'data-kind': 'value' });
    act(() => chip.props.onPointerDown(pointer(60)));
    expect(dial('Blur').props['data-visual']).toBe('blur');
    act(() => dial('Blur').props.onKeyDown(keyEvent('End')));
    expect(TweakStore.getValues(id).blur).toBe(12);
    expect(TweakStore.getValues(id).opacity).toBe(0.5);
    act(() => chip.props.onPointerCancel());
    expect(dial('Opacity').props['data-visual']).toBe('opacity');
    act(() => window.dispatchEvent(new CustomEvent(MOVE_OVERRIDE_EVENT, { detail: { pageId: id, latched: { blur: true } } })));
    expect(dial('Blur').props['data-visual']).toBe('blur');
  });
});
