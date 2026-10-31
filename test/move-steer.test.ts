import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ControlMeta, TweakConfig } from '../src/store/TweakStore';
import { moveSteerAxis, moveSteerHeld, moveSteerKey, MOVE_STEER_AXIS_SLOP, type MoveSteerLock } from '../src/move-steer';
import { moveSteerAnchor, moveRangeSteer, moveXYValue, type MoveFineAnchor } from '../src/move-slot-core';

// The panel test marks its events by hand: the real hand sends DOM pointer
// events, which a node environment has none of.
vi.mock('../src/move-steer', async (original) => ({
  ...(await original<typeof import('../src/move-steer')>()),
  isMoveSteer: (e: { steer?: boolean }) => !!e.steer,
}));
const { MovePanel } = await import('../src/components/MovePanel');
const { TweakStore } = await import('../src/store/TweakStore');

const lock = (): MoveSteerLock => ({ axis: null, x: 0, y: 0 });

describe('Shift on a two-handed slot', () => {
  it('holds still until the travel says which axis, then moves only that one, the gathered travel included', () => {
    const l = lock();
    expect(moveSteerAxis(l, 2, 1)).toEqual({ dx: 0, dy: 0 });
    expect(l.axis).toBeNull();
    expect(moveSteerAxis(l, 2, 1)).toEqual({ dx: 4, dy: 0 });
    expect(l.axis).toBe('x');
    expect(moveSteerAxis(l, 3, -9)).toEqual({ dx: 3, dy: 0 });
  });

  it('locks up and down when the hand goes that way more', () => {
    const l = lock();
    expect(moveSteerAxis(l, 1, -MOVE_STEER_AXIS_SLOP)).toEqual({ dx: 0, dy: -MOVE_STEER_AXIS_SLOP });
    expect(l.axis).toBe('y');
    expect(moveSteerAxis(l, 8, 2)).toEqual({ dx: 0, dy: 2 });
  });
});

describe('the steering key', () => {
  it('is ⌘ on a Mac and Ctrl elsewhere', () => {
    expect(moveSteerKey(true)).toBe('Meta');
    expect(moveSteerKey(false)).toBe('Control');
    expect(moveSteerHeld({ metaKey: true, ctrlKey: false }, true)).toBe(true);
    expect(moveSteerHeld({ metaKey: true, ctrlKey: false }, false)).toBe(false);
    expect(moveSteerHeld({ metaKey: false, ctrlKey: true }, false)).toBe(true);
  });
});

/** A slot 120 wide at the page's origin: its track runs 10..110. */
const box = { left: 0, top: 0, width: 120, height: 140 };
const at = (clientX: number, clientY: number) => ({ clientX, clientY, shiftKey: false });

describe('a range in the steering hand', () => {
  const range = { type: 'range', path: 'r', label: 'R', min: 0, max: 100 } as ControlMeta;
  const anchor = (lo: number, hi: number): MoveFineAnchor => ({ shift: false, x: 60, y: 70, v: { lo, hi } });

  it('turns the low end across and the high end up, a track of travel for the whole range', () => {
    expect(moveRangeSteer(range, at(70, 70), box, anchor(0.2, 0.6))).toEqual({ min: 30, max: 60 });
    expect(moveRangeSteer(range, at(60, 50), box, anchor(0.2, 0.6))).toEqual({ min: 20, max: 80 });
  });

  it('never lets the low end pass the high one', () => {
    expect(moveRangeSteer(range, at(160, 70), box, anchor(0.2, 0.6))).toEqual({ min: 60, max: 60 });
    expect(moveRangeSteer(range, at(60, 140), box, anchor(0.2, 0.6))).toEqual({ min: 0, max: 0 });
  });
});

describe('an xy pad in the steering hand', () => {
  it('moves its point from where it is, never to the pointer', () => {
    const xy = { type: 'xy', path: 'p', label: 'P', xAxis: { min: 0, max: 1 }, yAxis: { min: 0, max: 1 } } as ControlMeta;
    const fine = { current: null as MoveFineAnchor | null };
    // The point sits at the field's top-left corner; the hand is far from it.
    moveSteerAnchor(fine, at(100, 100), () => ({ x: 0.1, y: 0.1 }));
    const still = moveXYValue(xy, { x: 0.1, y: 0.9 }, at(100, 100), box, fine);
    expect(still.x).toBeCloseTo(0.1, 5);
    const moved = moveXYValue(xy, { x: 0.1, y: 0.9 }, at(110.3, 100), box, fine);
    expect(moved.x).toBeCloseTo(0.2, 5);
  });
});

describe('the panel under the steering hand', () => {
  const id = 'steer';
  let renderer: ReactTestRenderer | undefined;
  beforeEach(() => vi.stubGlobal('window', new EventTarget()));
  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    TweakStore.unregisterPanel(id);
    vi.unstubAllGlobals();
  });

  const config: TweakConfig = {
    span: { type: 'range', label: 'Span', min: 0, max: 100, default: { min: 20, max: 60 } },
    heading: { type: 'slider', label: 'Heading', min: 0, max: 360, step: 1, default: 90, display: 'dial' },
  } as TweakConfig;
  const mount = () => {
    TweakStore.registerPanel(id, 'Steer', config);
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Steer', dock: 'flow', productionEnabled: true })); });
  };
  const slot = (kind: string) => renderer!.root.find((n: ReactTestInstance) => typeof n.type === 'string' && n.props['data-kind'] === kind);
  const target = { setPointerCapture: vi.fn(), getBoundingClientRect: () => box };
  const steer = (x: number, y: number) => ({ ...at(x, y), button: 0, pointerId: 1, currentTarget: target, steer: true });

  it('marks the two-handed slots, and a range takes both ends at once', () => {
    mount();
    expect(slot('range').props['data-hands']).toBe('2');
    act(() => slot('range').props.onPointerDown(steer(100, 70)));
    expect(TweakStore.getValues(id).span).toEqual({ min: 20, max: 60 });
    act(() => slot('range').props.onPointerMove(steer(110, 60)));
    expect(TweakStore.getValues(id).span).toEqual({ min: 30, max: 70 });
    act(() => slot('range').props.onPointerCancel(steer(110, 60)));
  });

  it('turns a needle as its knob does, never pointing it at the hand', () => {
    mount();
    act(() => slot('dial').props.onPointerDown(steer(5, 5)));
    expect(TweakStore.getValues(id).heading).toBe(90);
    act(() => slot('dial').props.onPointerMove(steer(15, 5)));
    expect(TweakStore.getValues(id).heading).toBe(126);
    act(() => slot('dial').props.onPointerCancel(steer(15, 5)));
  });
});
