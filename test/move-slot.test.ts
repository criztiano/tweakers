import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveSlot } from '../src/components/MoveSlot';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

let renderer: ReactTestRenderer | undefined;
const id = 'move-slot-test';

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

function mount(config: TweakConfig, path: string | string[], props: Record<string, unknown> = {}) {
  TweakStore.registerPanel(id, 'Slots', config);
  act(() => { renderer = create(createElement(MoveSlot, { panel: 'Slots', path, ...props })); });
}
/** A pointer at `clientX` on a slot 120 wide at the page's origin. */
const pointer = (clientX: number, clientY = 70) => ({
  clientX, clientY, pointerId: 1, shiftKey: false,
  currentTarget: { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }) },
});
const key = (k: string) => ({ key: k, shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, preventDefault: vi.fn(), stopPropagation: vi.fn() });
const root = () => renderer!.root.findByProps({ className: 'tweakers-move-dial' });

describe('a Move slot placed on its own', () => {
  it('finds its control by panel name and draws the face the instrument would', () => {
    mount({ offset: { type: 'slider', min: -25, max: 25, default: -25, step: 1, moveVisual: { kind: 'offset', origin: 0.75 } } }, 'offset');
    expect(root().props['data-visual']).toBe('offset');
    expect(root().props['aria-valuenow']).toBe(-25);
    expect(renderer!.root.findByProps({ className: 'tweakers-move-offset-pin' }).props.style.left).toBe('25%');
  });

  it('turns under a drag, and the store — so the instrument too — moves with it', () => {
    mount({ amount: { type: 'slider', min: 0, max: 100, default: 0, step: 1 } }, 'amount');
    act(() => root().props.onPointerDown(pointer(60)));
    expect(TweakStore.getValues(id).amount).toBe(50);
    act(() => root().props.onPointerMove(pointer(110)));
    expect(TweakStore.getValues(id).amount).toBe(100);
    act(() => root().props.onPointerUp());
    // A move with no hand on the slot does nothing.
    act(() => root().props.onPointerMove(pointer(10)));
    expect(TweakStore.getValues(id).amount).toBe(100);
  });

  it('follows the store when something else turns the control', () => {
    mount({ amount: { type: 'slider', min: 0, max: 100, default: 0, step: 1 } }, 'amount');
    act(() => { TweakStore.updateValue(id, 'amount', 30); });
    expect(root().props['aria-valuenow']).toBe(30);
  });

  it('answers the keyboard like the instrument', () => {
    mount({ amount: { type: 'slider', min: 0, max: 100, default: 50, step: 1 } }, 'amount');
    act(() => root().props.onKeyDown(key('ArrowRight')));
    expect(TweakStore.getValues(id).amount).toBe(51);
    act(() => root().props.onKeyDown(key('End')));
    expect(TweakStore.getValues(id).amount).toBe(100);
  });

  it('holds still while its control is disabled', () => {
    mount({ amount: { type: 'slider', min: 0, max: 100, default: 0, step: 1 } }, 'amount');
    act(() => { TweakStore.setDisabled(id, 'amount', true); });
    act(() => root().props.onPointerDown(pointer(60)));
    expect(TweakStore.getValues(id).amount).toBe(0);
  });

  it('flips a switch on a click', () => {
    mount({ loop: { type: 'toggle', default: false } }, 'loop');
    const button = renderer!.root.findByProps({ role: 'switch' });
    act(() => button.props.onClick());
    expect(TweakStore.getValues(id).loop).toBe(true);
  });

  it('draws an instrument of several dials as one face, each dial its own zone', () => {
    mount({
      threshold: { type: 'slider', min: -50, max: 0, default: -10, step: 1, moveVisual: { kind: 'gate', role: 'threshold' } },
      lookahead: { type: 'slider', min: 0, max: 40, default: 12, step: 1, moveVisual: { kind: 'gate', role: 'lookahead' } },
      release: { type: 'slider', min: 10, max: 180, default: 95, step: 1, moveVisual: { kind: 'gate', role: 'release' } },
    }, ['threshold', 'lookahead', 'release']);
    expect(root().props['data-kind']).toBe('gate');
    const zones = renderer!.root.findAllByProps({ className: 'tweakers-move-face-zone' });
    expect(zones.map((z) => z.props['data-role'])).toEqual(['threshold', 'lookahead', 'release']);
    // The release bar, pressed at its top: all the way up.
    const zone = { ...pointer(0, 0), currentTarget: { setPointerCapture: vi.fn(), closest: () => null, getBoundingClientRect: () => ({ left: 0, top: 0, width: 4, height: 104 }) } };
    act(() => zones[2].props.onPointerDown(zone));
    expect(TweakStore.getValues(id).release).toBe(180);
  });

  it('draws a take’s start and end as one line', () => {
    mount({
      start: { type: 'slider', min: 0, max: 8, default: 2, step: 0.01, moveVisual: { kind: 'trim', edge: 'start' } },
      end: { type: 'slider', min: 0, max: 8, default: 6, step: 0.01, moveVisual: { kind: 'trim', edge: 'end' } },
    }, ['start', 'end']);
    expect(root().props['data-kind']).toBe('trim-span');
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-trim-span-zone' })).toHaveLength(2);
  });

  it('draws nothing, and says why, for a path that is not there or dials that are not one instrument', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount({ amount: { type: 'slider', min: 0, max: 1, default: 0 }, bias: { type: 'slider', min: 0, max: 1, default: 0 } }, 'missing');
    expect(renderer!.toJSON()).toBeNull();
    act(() => renderer!.update(createElement(MoveSlot, { panel: 'Slots', path: ['amount', 'bias'] })));
    expect(renderer!.toJSON()).toBeNull();
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('waits for a panel that registers after it', () => {
    act(() => { renderer = create(createElement(MoveSlot, { panel: 'Slots', path: 'amount' })); });
    expect(renderer!.toJSON()).toBeNull();
    act(() => { TweakStore.registerPanel(id, 'Slots', { amount: { type: 'slider', min: 0, max: 1, default: 0.5 } }); });
    expect(root().props['aria-label']).toBe('Amount');
  });
});
