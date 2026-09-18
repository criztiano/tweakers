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
// A press at (x, y), then the pointer's travel to (x + dx, y + dy): a slot
// turns from where it is — right or up raises — and a press alone moves nothing.
const target = { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }), closest: () => null };
const at = (clientX: number, clientY: number, extra: object = {}) => ({ clientX, clientY, pointerId: 1, shiftKey: false, button: 0, currentTarget: target, ...extra });
function drag(slot: { props: Record<string, (e: unknown) => void> }, dx: number, dy: number, from = at(0, 0)) {
  act(() => slot.props.onPointerDown(from));
  act(() => slot.props.onPointerMove({ ...from, clientX: from.clientX + dx, clientY: from.clientY + dy }));
  act(() => slot.props.onPointerUp({ ...from, clientX: from.clientX + dx, clientY: from.clientY + dy }));
}
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

  it('draws an offset as the room it can move in, the knob carrying the pin across it', () => {
    mount({
      offset: {
        type: 'slider', min: -25, max: 25, default: -25, step: 1,
        moveVisual: { kind: 'offset', origin: 0.75 },
      },
    });
    const face = () => dial('Offset').findByProps({ className: 'tweakers-move-offset' });
    const pin = () => dial('Offset').findByProps({ className: 'tweakers-move-offset-pin' });
    const way = () => dial('Offset').findAllByProps({ className: 'tweakers-move-offset-way' });
    expect(dial('Offset').props['data-visual']).toBe('offset');
    // A full turn back from three quarters along carries the pin half the room.
    expect(pin().props.style.left).toBe('25%');
    expect(face().props['data-moved']).toBe(true);
    expect(way()).toHaveLength(1);
    expect(way()[0].props['data-way']).toBe('back');
    // Parked, it fills nothing and offers both ways out.
    act(() => dial('Offset').props.onKeyDown(keyEvent('End')));
    act(() => dial('Offset').props.onKeyDown(keyEvent('Home')));
    expect(TweakStore.getValues(id).offset).toBe(-25);
    act(() => { TweakStore.updateValue(id, 'offset', 0); });
    expect(pin().props.style.left).toBe('75%');
    expect(face().props['data-moved']).toBeUndefined();
    expect(way().map((w) => w.props['data-way'])).toEqual(['back', 'forward']);
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
    // a press alone leaves the edge where it is; the drag turns it from there
    act(() => dial('End').props.onPointerDown(at(130, 0)));
    expect(TweakStore.getValues(id).end).toBe(0);
    act(() => dial('End').props.onPointerUp(at(130, 0)));
    drag(dial('End'), 50, 0); // half a 100px track to the right
    expect(TweakStore.getValues(id).end).toBe(5);
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
    // a bar turns like any dial: down lowers it from where it is
    drag(dial('Gate'), 0, 25);
    expect(TweakStore.getValues(id).gate).toBe(-40);
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
    // the speed turns from where it is, like every dial
    act(() => dial('Speed').props.onPointerDown(at(49, 0)));
    expect(TweakStore.getValues(id).speed).toBe(51);
    act(() => dial('Speed').props.onPointerUp(at(49, 0)));
    drag(dial('Speed'), 20, 0);
    expect(TweakStore.getValues(id).speed).toBe(71);
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
    const press = at(75, 75, { currentTarget: { ...target, closest: () => ({ querySelector: () => grid }) } });
    drag(dial('Hi'), 0, 25, press);
    expect(TweakStore.getValues(id)).toMatchObject({ hi: 100, hiMid: 75 });
  });

  it('draws channel dials side by side as one mixer, each fader in its own column', () => {
    const channel = (v: number, tone?: 'orange') => ({ type: 'slider', min: 0, max: 100, default: v, step: 1, moveVisual: { kind: 'channel', icon: 'disc-3', tone } }) as const;
    mount({ a: channel(0), b: channel(40, 'orange') });
    const face = renderer!.root.findByProps({ 'data-kind': 'channel' });
    expect(face.props.style.gridColumn).toBe('span 2');
    const fills = face.findAllByProps({ className: 'tweakers-move-channel-fill' });
    expect(fills.map((f) => [f.props.style['--move-face-at'], f.props['data-empty']])).toEqual([[0, true], [0.4, undefined]]);
    drag(dial('B'), 0, -35); // up raises the fader
    expect(TweakStore.getValues(id).b).toBe(75);
    expect(TweakStore.getValues(id).a).toBe(0);
  });

  it('draws x, y and z side by side as one stage, each column reading its own axis of it', () => {
    mount({
      x: { type: 'slider', min: 0, max: 1000, default: 250, step: 1, moveVisual: { kind: 'axis', axis: 'x' } },
      y: { type: 'slider', min: 0, max: 1000, default: 0, step: 1, moveVisual: { kind: 'axis', axis: 'y', down: true } },
      z: { type: 'slider', min: -500, max: 500, default: 0, step: 1, moveVisual: { kind: 'axis', axis: 'z' } },
    });
    const face = renderer!.root.findByProps({ 'data-kind': 'vector' });
    expect(face.props.style.gridColumn).toBe('span 3');
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-dial' })).toHaveLength(1);
    expect(dial('X').props['aria-orientation']).toBe('horizontal');
    expect(dial('Z').props['aria-orientation']).toBe('vertical');
    const stage = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 100 }) };
    const press = (clientX: number, clientY: number) => ({
      clientX, clientY, pointerId: 1, shiftKey: false,
      currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }), closest: () => ({ querySelector: () => stage }) },
    });
    // x reads across the stage, left to right
    act(() => dial('X').props.onPointerDown(press(300, 50)));
    expect(TweakStore.getValues(id).x).toBe(750);
    act(() => dial('X').props.onPointerUp());
    // a downward y reads top to bottom: pressing low on the stage is a large y
    act(() => dial('Y').props.onPointerDown(press(0, 80)));
    expect(TweakStore.getValues(id).y).toBe(800);
    act(() => dial('Y').props.onPointerUp());
    // z reads up the stage: the top is the far end
    act(() => dial('Z').props.onPointerDown(press(0, 25)));
    expect(TweakStore.getValues(id).z).toBe(250);
    act(() => dial('Z').props.onPointerUp());
  });

  it('keeps the ordinary faces when the axes are out of order or one is missing', () => {
    mount({
      y: { type: 'slider', min: 0, max: 100, default: 0, step: 1, moveVisual: { kind: 'axis', axis: 'y' } },
      x: { type: 'slider', min: 0, max: 100, default: 0, step: 1, moveVisual: { kind: 'axis', axis: 'x' } },
      z: { type: 'slider', min: 0, max: 100, default: 0, step: 1, moveVisual: { kind: 'axis', axis: 'z' } },
    });
    expect(renderer!.root.findAllByProps({ 'data-kind': 'vector' })).toHaveLength(0);
    // each axis keeps its own ordinary dial
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-dial' })).toHaveLength(3);
  });

  it('keeps the ordinary faces when the gate dials are out of order', () => {
    mount({
      look: { type: 'slider', min: 0, max: 40, default: 10, step: 1, moveVisual: { kind: 'gate', role: 'lookahead' } },
      gate: { type: 'slider', min: -80, max: 0, default: -20, step: 1, moveVisual: { kind: 'gate', role: 'threshold' } },
      release: { type: 'slider', min: 10, max: 510, default: 260, step: 5, moveVisual: { kind: 'gate', role: 'release' } },
    });
    expect(renderer!.root.findAllByProps({ 'data-kind': 'gate' })).toHaveLength(0);
  });

  it('draws a fade pair and a loop pair as two-pad lines, the cursor dragging their handles', () => {
    const edge = (value: number, max = 10) => ({ type: 'slider', min: 0, max, default: value, step: 0.01 }) as const;
    TweakStore.registerPanel(id, 'Visual', {
      ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`d${i}`, edge(5)])),
      loopStart: edge(2), loopEnd: edge(10), fadeIn: edge(0, 5), fadeOut: edge(2.5, 5),
    }, undefined, {
      movePads: { loopStart: 0, loopEnd: 1, fadeIn: 0, fadeOut: 1 },
      moveTopRow: ['loopStart', 'loopEnd'],
      moveEdges: [{ kind: 'loop', start: 'loopStart', end: 'loopEnd' }, { kind: 'fade', start: 'fadeIn', end: 'fadeOut' }],
    });
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Visual', dock: 'flow', productionEnabled: true })); });
    const face = (kind: string) => renderer!.root.findByProps({ className: 'tweakers-move-edges', 'data-kind': kind });
    const marker = (edge: string) => face('loop').findByProps({ className: 'tweakers-move-loop-marker', 'data-edge': edge });
    const fade = (edge: string) => face('fade').findByProps({ className: 'tweakers-move-fade', 'data-edge': edge });
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-pad', 'data-kind': 'value' })).toHaveLength(0);
    expect(marker('start').props.style.left).toBe('20%');
    expect(marker('start').props['data-moved']).toBe(true);
    expect(marker('end').props['data-moved']).toBeUndefined();
    expect(fade('in').props['data-moved']).toBeUndefined();
    expect(fade('out').props['data-moved']).toBe(true);
    expect(fade('out').props.style['--move-edge-at']).toBe('50%');
    // the cursor drags the marker nearest it: a 268px pill, its line inset 12px
    const drag = (clientX: number) => ({ clientX, pointerId: 1, currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, width: 268 }) } });
    act(() => face('loop').props.onPointerDown(drag(12 + 244 * 0.25)));
    act(() => face('loop').props.onPointerMove(drag(12 + 244 * 0.5)));
    act(() => face('loop').props.onPointerUp());
    expect(TweakStore.getValues(id)).toMatchObject({ loopStart: 5, loopEnd: 10 });
    act(() => face('loop').props.onPointerDown(drag(12 + 244 * 0.9)));
    expect(TweakStore.getValues(id).loopEnd).toBe(9);
    act(() => face('loop').props.onPointerUp());
    // a fade runs its own half, from its own end inward
    act(() => face('fade').props.onPointerDown(drag(12 + 244 * 0.8)));
    act(() => face('fade').props.onPointerUp());
    expect(TweakStore.getValues(id)).toMatchObject({ fadeIn: 0, fadeOut: 2 });
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
