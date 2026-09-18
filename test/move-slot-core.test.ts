import { describe, expect, it } from 'vitest';
import type { ControlMeta } from '../src/store/TweakStore';
import {
  MOVE_DIAL_TRACK_INSET, moveDialValue, moveDialKey, moveEnumValue, moveRangeValue, moveFilterValue, moveXYValue,
  moveXYRest, moveNeedleValue, moveTransferValue, moveRampStop, moveRampValue, moveFaceValue, moveDialReading,
  moveRangeReading, moveChipValue, moveXYGrid, moveShapePath, type MoveFineAnchor,
} from '../src/move-slot-core';

const slider = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'slider', path: 'v', label: 'Value', min: 0, max: 100, step: 1, ...extra } as ControlMeta);
/** A slot 120 wide at the page's origin: its track runs 10..110. */
const box = { left: 0, top: 0, width: 120, height: 140 };
const at = (clientX: number, clientY = 70, shiftKey = false) => ({ clientX, clientY, shiftKey });
const fine = () => ({ current: null as MoveFineAnchor | null });

describe('a slot read by the pointer', () => {
  it('sets a dial from where the pointer is on its track', () => {
    expect(moveDialValue(slider(), 0, at(MOVE_DIAL_TRACK_INSET), box, fine())).toBe(0);
    expect(moveDialValue(slider(), 0, at(60), box, fine())).toBe(50);
    expect(moveDialValue(slider(), 0, at(500), box, fine())).toBe(100);
  });

  it('creeps at a tenth while shift is held, and carries on from where shift let go', () => {
    const f = fine();
    // Shift down at x=60 on a value of 50: a 50px move is a tenth of the 100px track's worth.
    expect(moveDialValue(slider(), 50, at(60, 70, true), box, f)).toBe(50);
    expect(moveDialValue(slider(), 50, at(110, 70, true), box, f)).toBe(55);
    // Shift up: the drag goes on at full rate from here, it does not jump to the pointer.
    expect(moveDialValue(slider(), 55, at(110), box, f)).toBe(55);
    expect(moveDialValue(slider(), 55, at(100), box, f)).toBe(45);
  });

  it('steps a choice to the nearest option', () => {
    const select = { type: 'select', path: 's', label: 'S', options: ['a', 'b', 'c'] } as ControlMeta;
    expect(moveEnumValue(select, at(12), box)).toBe('a');
    expect(moveEnumValue(select, at(60), box)).toBe('b');
    expect(moveEnumValue(select, at(108), box)).toBe('c');
  });

  it('lets a range drag keep the handle it took, and never cross the other', () => {
    const range = { type: 'range', path: 'r', label: 'R', min: 0, max: 100 } as ControlMeta;
    const handle = { current: 'min' as 'min' | 'max' };
    const f = fine();
    // Pressed near the high end: the high handle is taken.
    expect(moveRangeValue(range, { min: 20, max: 80 }, at(88), box, handle, f, true)).toEqual({ min: 20, max: 78 });
    expect(handle.current).toBe('max');
    // Dragged past the low handle: it stops there rather than swapping.
    expect(moveRangeValue(range, { min: 20, max: 78 }, at(15), box, handle, f, false)).toEqual({ min: 20, max: 20 });
  });

  it('turns the filter hand the press landed on: cutoff on the left half, resonance on the right', () => {
    const filter = {
      type: 'filter', path: 'f', label: 'F',
      cutoffAxis: { min: 0, max: 100, step: 1 }, resonanceAxis: { min: 0, max: 1, step: 0.01 },
    } as ControlMeta;
    const hand = { current: 'cutoff' as 'cutoff' | 'resonance' };
    const wide = { left: 0, top: 0, width: 240, height: 140 };
    const left = moveFilterValue(filter, { cutoff: 10, resonance: 0.5 }, at(65), wide, hand, fine(), true);
    expect(hand.current).toBe('cutoff');
    expect(left).toMatchObject({ resonance: 0.5 });
    const right = moveFilterValue(filter, { cutoff: 10, resonance: 0.5 }, at(240), wide, hand, fine(), true);
    expect(hand.current).toBe('resonance');
    expect(right).toMatchObject({ cutoff: 10, resonance: 1 });
  });

  it('moves an xy pad through the XYPad core, and brings a spring-loaded one back to centre', () => {
    const xy = { type: 'xy', path: 'p', label: 'P', xAxis: { min: 0, max: 1 }, yAxis: { min: 0, max: 1 } } as ControlMeta;
    const moved = moveXYValue(xy, { x: 0.5, y: 0.5 }, at(8, 8), box, fine());
    expect(moved.x).toBeCloseTo(0);
    expect(moved.y).toBeCloseTo(1);                     // the top of the pad is the top of y
    expect(moveXYRest(xy)).toBeNull();
    const stick = { ...xy, xAxis: { min: -1, max: 1, bipolar: true }, yAxis: { min: -1, max: 1, bipolar: true }, returnToCenter: true } as ControlMeta;
    expect(moveXYRest(stick)).toEqual({ x: 0, y: 0 });
  });

  it('follows a needle round its centre', () => {
    const heading = slider({ min: 0, max: 360, display: 'dial' });
    // Straight right of the centre is a quarter turn.
    expect(moveNeedleValue(heading, 0, at(120, 70), box)).toBe(90);
  });

  it('picks the nearest curve point on press and moves it', () => {
    const curve = { points: [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }] };
    // Near the middle point: it is taken, and follows the pointer.
    const down = moveTransferValue(curve, at(8 + 0.5 * 103, 8 + 0.45 * 124), box, 0, true);
    expect(down.held).toBe(1);
    expect(down.value.points[1].y).toBeCloseTo(0.55);
    // Nowhere near a point: the one already held keeps the hand.
    expect(moveTransferValue(curve, at(8 + 0.5 * 103, 8 + 0.1 * 124), box, 2, true).held).toBe(2);
  });

  it('slides a ramp stop, and keeps it between its neighbours', () => {
    const ramp = { type: 'linear', angle: 90, stops: [
      { color: '#000000ff', position: 0 }, { color: '#888888ff', position: 0.5 }, { color: '#ffffffff', position: 1 },
    ] };
    expect(moveRampStop(ramp, at(62), box)).toBe(1);
    const past = moveRampValue(ramp, at(200), box, 1);
    expect(past.stops[1].position).toBe(1);             // stops at its neighbour, never past it
  });

  it('reads a face bar top to bottom, most at the top', () => {
    const bar = { left: 0, top: 0, width: 4, height: 104 };
    expect(moveFaceValue(slider(), 0, 'threshold', at(2, 2), bar, fine())).toBe(100);
    expect(moveFaceValue(slider(), 0, 'threshold', at(2, 102), bar, fine())).toBe(0);
    // The look-ahead's line runs left to right.
    expect(moveFaceValue(slider(), 0, 'lookahead', at(2, 50), bar, fine())).toBe(50);
  });
});

describe('what a slot reads out', () => {
  it('reads a dial in its own domain, or as the Move’s 0–100 position', () => {
    expect(moveDialReading(slider({ min: 0, max: 1, step: 0.01 }), 0.4)).toBe('40%');
    expect(moveDialReading(slider({ unit: ' ms' }), 25)).toBe('25 ms');
    expect(moveDialReading(slider({ min: -10, max: 10, bipolar: true }), 3)).toBe('+3');
    expect(moveRangeReading({ type: 'range', path: 'r', label: 'R' } as ControlMeta, { min: 2, max: 8 })).toBe('2–8');
    expect(moveChipValue(slider({ unit: 'ms' }), 120)).toEqual({ num: '120', unit: 'ms' });
  });

  it('keys: arrows step, and a chord belongs to the page', () => {
    const plain = { key: 'ArrowRight', shiftKey: false, altKey: false, ctrlKey: false, metaKey: false };
    expect(moveDialKey(slider(), 50, plain)).toBe(51);
    expect(moveDialKey(slider(), 50, { ...plain, metaKey: true })).toBeNull();
    expect(moveDialKey(slider(), 50, { ...plain, key: 'x' })).toBeNull();
  });

  it('draws the XYPad’s grid and a sampled shape', () => {
    expect(moveXYGrid({ type: 'xy' } as ControlMeta)).toBe(5);
    expect(moveXYGrid({ type: 'xy', grid: false } as ControlMeta)).toBe(0);
    expect(moveXYGrid({ type: 'xy', grid: 4, density: 2 } as ControlMeta)).toBe(8);
    expect(moveShapePath([0, 1])).toBe('M 0.00 100.00 L 100.00 0.00');
    expect(moveShapePath([0.5])).toBe('');
  });
});
