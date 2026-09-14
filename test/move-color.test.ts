import { afterEach, describe, expect, it } from 'vitest';
import { MoveColorStore, MOVE_GRADIENT_STOPS } from '../src/move-color';
import { TweakStore } from '../src/store/TweakStore';
import { parseHex } from '../src/color-core';
import type { GradientValue } from '../src/gradient-core';
let serial = 0;
const ids: string[] = [];
function panel(value = '#ff0000') {
  const id = `move-color-${++serial}`;
  ids.push(id); TweakStore.registerPanel(id, id, { tint: value }); return id;
}
function gradientPanel(stops = [
  { color: '#ff0000ff', position: 0 },
  { color: '#0000ffff', position: 0.5 },
  { color: '#00ff00ff', position: 1 },
]) {
  const id = `move-color-${++serial}`;
  ids.push(id);
  TweakStore.registerPanel(id, id, { ramp: { type: 'gradient' as const, default: { type: 'linear' as const, angle: 90, stops } } });
  return id;
}
const stopsOf = (id: string) => (TweakStore.getValue(id, 'ramp') as GradientValue).stops;
afterEach(() => { MoveColorStore.close(); ids.splice(0).forEach(id => TweakStore.unregisterPanel(id)); });
describe('Move color editing', () => {
  it('wraps hue and keeps luminosity and opacity independent', () => {
    const id = panel('#ff000080');
    MoveColorStore.turn(id, 'tint', -1);
    expect(MoveColorStore.read(id, 'tint').h).toBeCloseTo(359);
    MoveColorStore.turnLuminosity(id, 'tint', 5);
    expect(MoveColorStore.read(id, 'tint').l).toBeCloseTo(0.6);
    expect(parseHex(String(TweakStore.getValue(id, 'tint')))?.a).toBeCloseTo(128 / 255);
  });
  it('retains hue through black and white, then restores the selected color', () => {
    const id = panel(); MoveColorStore.open(id, 'tint');
    MoveColorStore.setHue(120); MoveColorStore.setLuminosity(0);
    expect(TweakStore.getValue(id, 'tint')).toBe('#000000');
    MoveColorStore.setLuminosity(1); MoveColorStore.setLuminosity(0.5);
    expect(TweakStore.getValue(id, 'tint')).toBe('#00ff00');
  });
  it('supports opacity endpoints and rejects nonfinite input', () => {
    const id = panel(); MoveColorStore.open(id, 'tint');
    MoveColorStore.setOpacity(0); expect(TweakStore.getValue(id, 'tint')).toBe('#ff000000');
    MoveColorStore.setOpacity(2); expect(TweakStore.getValue(id, 'tint')).toBe('#ff0000ff');
    MoveColorStore.setHue(NaN); expect(TweakStore.getValue(id, 'tint')).toBe('#ff0000ff');
  });
  it('a grid hue picks maximum saturation without changing lightness or opacity', () => {
    const id = panel('#80808080'); MoveColorStore.open(id, 'tint');
    const before = MoveColorStore.read(id, 'tint'); MoveColorStore.setHue(180);
    expect(MoveColorStore.read(id, 'tint')).toEqual({ ...before, h: 180, s: 1 });
  });
  it('keeps gray neutral when opacity changes', () => {
    const id = panel('#808080'); MoveColorStore.open(id, 'tint'); MoveColorStore.setOpacity(0.5);
    expect(TweakStore.getValue(id, 'tint')).toBe('#80808080');
  });
  it('follows external color changes and switches a single editor between slots', () => {
    const a = panel(), b = panel();
    MoveColorStore.open(a, 'tint'); MoveColorStore.setHue(120);
    TweakStore.updateValue(a, 'tint', '#0000ff');
    expect(MoveColorStore.read(a, 'tint').h).toBeCloseTo(240);
    MoveColorStore.toggle(b, 'tint'); expect(MoveColorStore.getView()?.panelId).toBe(b);
    MoveColorStore.toggle(b, 'tint'); expect(MoveColorStore.getView()).toBeNull();
    MoveColorStore.setHue(60); expect(TweakStore.getValue(a, 'tint')).toBe('#0000ff');
  });
});

describe('Move gradient editing', () => {
  it('opens on stop 1, and every dial edit lands on the selected stop alone', () => {
    const id = gradientPanel();
    MoveColorStore.open(id, 'ramp');
    expect(MoveColorStore.getStop()).toBe(0);
    expect(MoveColorStore.read(id, 'ramp').h).toBeCloseTo(0);
    MoveColorStore.selectStop(1);
    expect(MoveColorStore.read(id, 'ramp').h).toBeCloseTo(240);
    MoveColorStore.setHue(120);
    expect(stopsOf(id)[1].color).toBe('#00ff00ff');
    expect(stopsOf(id)[0].color).toBe('#ff0000ff');
    expect(stopsOf(id)[2].color).toBe('#00ff00ff');
    expect(MoveColorStore.hex(id, 'ramp')).toBe('#00ff00ff');
  });
  it('keeps a stop hex 8-digit and routes opacity to the selected stop', () => {
    const id = gradientPanel();
    MoveColorStore.open(id, 'ramp');
    MoveColorStore.setOpacity(0.5);
    expect(stopsOf(id)[0].color).toBe('#ff000080');
    expect(stopsOf(id)[1].color).toBe('#0000ffff');
  });
  it('clamps stop selection to the gradient and the four track buttons', () => {
    const id = gradientPanel();
    MoveColorStore.open(id, 'ramp');
    MoveColorStore.selectStop(9);
    expect(MoveColorStore.getStop()).toBe(2);
    expect(MOVE_GRADIENT_STOPS).toBe(4);
    MoveColorStore.selectStop(-3);
    expect(MoveColorStore.getStop()).toBe(0);
  });
  it('slides a stop only between its neighbours, so it never changes identity', () => {
    const id = gradientPanel();
    MoveColorStore.open(id, 'ramp');
    MoveColorStore.moveStop(id, 'ramp', 1, 0.9);
    expect(stopsOf(id)[1].position).toBeCloseTo(0.9);
    MoveColorStore.moveStop(id, 'ramp', 0, 0.95);
    expect(stopsOf(id)[0].position).toBeCloseTo(0.9);
    MoveColorStore.moveStop(id, 'ramp', 1, 2);
    expect(stopsOf(id)[1].position).toBeCloseTo(1);
    expect(stopsOf(id).map((s) => s.color)).toEqual(['#ff0000ff', '#0000ffff', '#00ff00ff']);
    MoveColorStore.moveStop(id, 'ramp', 1, NaN);
    expect(stopsOf(id)[1].position).toBeCloseTo(1);
  });
  it('turnStop nudges the selected stop by detents, fine with Shift', () => {
    const id = gradientPanel();
    MoveColorStore.open(id, 'ramp');
    MoveColorStore.selectStop(1);
    MoveColorStore.turnStop(id, 'ramp', 5);
    expect(stopsOf(id)[1].position).toBeCloseTo(0.55);
    MoveColorStore.turnStop(id, 'ramp', -1, true);
    expect(stopsOf(id)[1].position).toBeCloseTo(0.549);
  });
  it('reopening a different control starts back at stop 1', () => {
    const a = gradientPanel();
    MoveColorStore.open(a, 'ramp');
    MoveColorStore.selectStop(2);
    const b = gradientPanel();
    MoveColorStore.open(b, 'ramp');
    expect(MoveColorStore.getStop()).toBe(0);
  });
});
