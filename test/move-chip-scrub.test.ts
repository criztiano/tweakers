import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { TweakStore, type ControlMeta, type TweakConfig } from '../src/store/TweakStore';
import { moveChipScrubs } from '../src/move-slot-core';

const id = 'chip-scrub';
let renderer: ReactTestRenderer | undefined;
beforeEach(() => vi.stubGlobal('window', new EventTarget()));
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Eight dials fill the knobs; what follows sits on the pads as chips.
const config: TweakConfig = {
  a: [0.5, 0, 1], b: [0.5, 0, 1], c: [0.5, 0, 1], d: [0.5, 0, 1],
  e: [0.5, 0, 1], f: [0.5, 0, 1], g: [0.5, 0, 1], h: [0.5, 0, 1],
  drive: { type: 'slider', default: 50, min: 0, max: 100, step: 1, label: 'Drive' },
};

const mount = () => {
  TweakStore.registerPanel(id, 'Chips', config);
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Chips', dock: 'flow', productionEnabled: true })); });
};
const chips = () => renderer!.root.findAll((n) => typeof n.type === 'string' && n.props['data-kind'] === 'value' && n.props['data-scrub']);
const chipOf = (label: string) => chips().find((n) => n.findAll((c) => c.children.includes(label)).length > 0)!;
// A chip 120 wide: its track runs 10..110, so 10px of travel is a tenth.
const target = { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 32 }) };
const at = (clientX: number, clientY = 16) => ({ clientX, clientY, shiftKey: false, button: 0, pointerId: 1, currentTarget: target });
const values = () => TweakStore.getValues(id);

describe('a chip under the cursor', () => {
  it('scrubs a number in place, and a drag never latches it', () => {
    mount();
    act(() => chipOf('Drive').props.onPointerDown(at(60)));
    act(() => chipOf('Drive').props.onPointerMove(at(80)));
    expect(values().drive).toBe(70);
    act(() => chipOf('Drive').props.onPointerUp(at(80)));
    expect(chipOf('Drive').props['data-latched']).toBeUndefined();
  });

  it('still latches on a still tap, as on the Move', () => {
    mount();
    act(() => chipOf('Drive').props.onPointerDown(at(60)));
    act(() => chipOf('Drive').props.onPointerUp(at(60)));
    expect(chipOf('Drive').props['data-latched']).toBe(true);
    expect(values().drive).toBe(50);
  });
});

describe('which chips scrub', () => {
  it('a number does; a colour and a filter’s resonance keep the Move’s gesture', () => {
    expect(moveChipScrubs({ type: 'slider', path: 'x', label: 'X' } as ControlMeta)).toBe(true);
    expect(moveChipScrubs({ type: 'color', path: 'x', label: 'X' } as ControlMeta)).toBe(false);
    expect(moveChipScrubs({ type: 'slider', path: 'x', label: 'X', resonanceOf: 'tone' } as ControlMeta)).toBe(false);
  });
});
