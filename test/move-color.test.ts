import { afterEach, describe, expect, it } from 'vitest';
import { MoveColorStore } from '../src/move-color';
import { TweakStore } from '../src/store/TweakStore';
import { parseHex } from '../src/color-core';
let serial = 0;
const ids: string[] = [];
function panel(value = '#ff0000') {
  const id = `move-color-${++serial}`;
  ids.push(id); TweakStore.registerPanel(id, id, { tint: value }); return id;
}
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
