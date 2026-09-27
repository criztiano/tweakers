import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

const id = 'filter-column';
let renderer: ReactTestRenderer | undefined;
beforeEach(() => vi.stubGlobal('window', new EventTarget()));
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const config: TweakConfig = {
  gain: [0.5, 0, 1],
  tone: {
    type: 'filter', moveVertical: true, default: { cutoff: 50, resonance: 0.4 },
    cutoff: { min: 0, max: 100, step: 1, label: 'Freq' },
    resonance: { min: 0, max: 1, step: 0.01, label: 'Res' },
  },
};

const mount = () => {
  TweakStore.registerPanel(id, 'Tone', config);
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Tone', dock: 'flow', productionEnabled: true })); });
};
const host = (pick: (n: ReactTestInstance) => boolean) =>
  renderer!.root.findAll((n) => typeof n.type === 'string' && pick(n));
const slot = () => host((n) => n.props['data-kind'] === 'filter')[0];
const chip = () => host((n) => n.props['data-pad-row'] === 0)[0]
  .findAll((n) => typeof n.type === 'string' && n.props['data-kind'] === 'value')[0];
const text = (n: ReactTestInstance) =>
  n.findAll((c) => typeof c.type === 'string' && typeof c.props.className === 'string' && /dial-(label|value)|pad-(title|number)/.test(c.props.className))
    .flatMap((c) => c.children.filter((k): k is string => typeof k === 'string'));
const target = { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }) };
const pointer = (clientX: number) => ({ clientX, clientY: 70, shiftKey: false, button: 0, pointerId: 1, currentTarget: target });
const drag = (x: number) => {
  act(() => slot().props.onPointerDown(pointer(x)));
  act(() => slot().props.onPointerUp(pointer(x)));
};
const tap = () => {
  act(() => chip().props.onPointerDown(pointer(0)));
  act(() => chip().props.onPointerUp(pointer(0)));
};

describe('a filter standing in one column, on the panel', () => {
  it('draws one slot whose drag turns the cutoff, and a Res chip under it', () => {
    mount();
    expect(slot().props['data-vertical']).toBe(true);
    expect(text(slot())).toEqual(['Freq', '50']);
    expect(text(chip())).toEqual(['Res', '0.4']);
    drag(110);
    expect(TweakStore.getValues(id).tone).toEqual({ cutoff: 100, resonance: 0.4 });
  });

  it('a tapped chip latches the slot to the resonance: editing it writes the pair, cutoff untouched', () => {
    mount();
    tap();
    expect(chip().props['data-latched']).toBe(true);
    expect(slot().props['data-latched']).toBe(true);
    expect(text(slot())).toEqual(['Res', '0.4']);
    drag(60);
    expect(TweakStore.getValues(id).tone).toEqual({ cutoff: 50, resonance: 0.5 });
    expect(TweakStore.getValues(id)['tone:resonance']).toBeUndefined();
    // Tapped again, the knob is the cutoff's once more.
    tap();
    expect(slot().props['data-latched']).toBeUndefined();
    drag(10);
    expect(TweakStore.getValues(id).tone).toEqual({ cutoff: 0, resonance: 0.5 });
  });

  it('a held chip peeks: the slot is the resonance only while it is down', () => {
    mount();
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000);
    act(() => chip().props.onPointerDown(pointer(0)));
    expect(text(slot())).toEqual(['Res', '0.4']);
    now.mockReturnValue(5_000);
    act(() => chip().props.onPointerUp(pointer(0)));
    expect(chip().props['data-latched']).toBeUndefined();
    expect(text(slot())).toEqual(['Freq', '50']);
  });

  it('a hardware latch on the chip reads the same', () => {
    mount();
    act(() => { window.dispatchEvent(new CustomEvent('move-tweakers:override', { detail: { pageId: id, held: {}, latched: { 'tone:resonance': true } } })); });
    expect(chip().props['data-latched']).toBe(true);
    expect(text(slot())).toEqual(['Res', '0.4']);
  });
});
