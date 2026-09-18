import { describe, expect, it } from 'vitest';
import type { ControlMeta } from '../src/store/TweakStore';
import {
  moveDialKey, moveRangeValue, moveFilterValue, moveXYValue,
  moveXYRest, moveNeedleValue, moveTransferValue, moveRampStop, moveRampValue, moveDialReading,
  moveRangeReading, moveChipValue, moveXYGrid, moveShapePath, movePressStart, movePressTravel, movePressEnd,
  moveTurnValue, moveTurnExtent, moveOptionStep, moveNextOption, type MoveFineAnchor, type MovePress,
} from '../src/move-slot-core';

const slider = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'slider', path: 'v', label: 'Value', min: 0, max: 100, step: 1, ...extra } as ControlMeta);
/** A slot 120 wide at the page's origin: its track runs 10..110. */
const box = { left: 0, top: 0, width: 120, height: 140 };
const at = (clientX: number, clientY = 70, shiftKey = false) => ({ clientX, clientY, shiftKey });
const fine = () => ({ current: null as MoveFineAnchor | null });

describe('a slot read by the pointer', () => {
  it('turns a dial from where it is: right or up raises, a track’s width is the whole range', () => {
    const p = movePressStart('v', at(60), 0.5);
    expect(moveTurnExtent(box)).toBe(100);
    expect(moveTurnValue(slider(), p, at(80), 100)).toBe(70);
    expect(moveTurnValue(slider(), p, at(60, 50), 100)).toBe(70);      // 20px up
    expect(moveTurnValue(slider(), p, at(60, 100), 100)).toBe(20);     // 30px down
    expect(moveTurnValue(slider(), p, at(500), 100)).toBe(100);
  });

  it('keeps a still press a tap, and rebases on Shift so the value never jumps', () => {
    const press = { current: movePressStart('v', at(60), 0.5) as MovePress | null };
    expect(movePressTravel(press, 'v', at(62), () => 0.5)).toBeNull();  // within the slip
    const p = movePressTravel(press, 'v', at(70, 70, true), () => 0.6)!;
    expect(p).toMatchObject({ moved: true, shift: true, ax: 70, v: 0.6 });
    expect(moveTurnValue(slider(), p, at(120, 70, true), 100)).toBe(65); // 50px at a tenth
    expect(movePressEnd(press, 'v')).toBe(false);                      // it travelled
    press.current = movePressStart('v', at(60), 0.5);
    expect(movePressEnd(press, 'v')).toBe(true);                       // a tap
  });

  it('steps a choice with the drag, and moves it on with a click', () => {
    const select = { type: 'select', path: 's', label: 'S', options: ['a', 'b', 'c'] } as ControlMeta;
    const p = movePressStart('s', at(60), 0);
    expect(moveOptionStep(select, 'a', p, at(70))).toBeUndefined();     // short of a detent
    expect(moveOptionStep(select, 'a', p, at(90))).toBe('b');
    expect(moveOptionStep(select, 'a', p, at(60, 130))).toBe('c');      // down is the next too
    expect(moveNextOption(select, 'b')).toBe('c');
    expect(moveNextOption(select, 'c')).toBe('a');
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
