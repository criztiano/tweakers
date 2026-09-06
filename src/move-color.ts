import { formatHex, hslToRgb, parseHex, rgbToHsl, type HSLA } from './color-core';
import { TweakStore } from './store/TweakStore';

export interface MoveColorView { panelId: string; path: string }

/**
 * The colour wheel, in the hues the Move can actually light.
 *
 * The device drops the RGB command that would give a smooth ramp (verified on
 * hardware — every such pad came back the plain switch-on red), so the wheel is
 * its own pad palette: the entries that are saturated AND sit at one
 * brightness, sorted by hue. Sixteen of them, two rows of eight — the same
 * sixteen the pads show, so screen and hand pick from one wheel.
 */
export const MOVE_COLOR_WHEEL = [4, 18, 45, 78, 95, 120, 141, 158, 186, 204, 233, 244, 254, 271, 312, 351];
export const MOVE_COLOR_HUES = MOVE_COLOR_WHEEL.length;
export const MOVE_COLOR_STEPS = 16;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const hue = (n: number) => ((n % 360) + 360) % 360;

/** Which slot of the wheel a colour sits nearest, the long way round included. */
export const moveWheelSlot = (h: number): number => {
  const target = hue(h);
  let best = 0, bestGap = Infinity;
  MOVE_COLOR_WHEEL.forEach((wheelHue, index) => {
    const gap = Math.min(Math.abs(wheelHue - target), 360 - Math.abs(wheelHue - target));
    if (gap < bestGap) { bestGap = gap; best = index; }
  });
  return best;
};

/** Shared editor selection and color coordinates for the panel and Move bridge. */
class MoveColorStoreClass {
  private view: MoveColorView | null = null;
  private version = 0;
  private listeners = new Set<() => void>();
  // Remember hue/saturation at black and white, where RGB cannot retain them.
  private coordinates = new Map<string, { hex: string; color: HSLA }>();
  getView = (): MoveColorView | null => this.view;
  getVersion = (): number => this.version;
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };
  private notify() { this.version++; for (const fn of this.listeners) fn(); }
  open(panelId: string, path: string) {
    if (this.view?.panelId === panelId && this.view.path === path) return;
    this.view = { panelId, path };
    this.notify();
  }
  close() { if (this.view) { this.view = null; this.notify(); } }
  toggle(panelId: string, path: string) {
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    else this.open(panelId, path);
  }
  read(panelId: string, path: string): HSLA {
    const hex = String(TweakStore.getValue(panelId, path) ?? '#ff0000');
    const cached = this.coordinates.get(JSON.stringify([panelId, path]));
    if (cached?.hex === hex) return { ...cached.color };
    const color = rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 });
    if (color.s === 0) {
      color.h = cached?.color.h ?? 0;
      if (color.l === 0 || color.l === 1) color.s = cached?.color.s ?? 1;
    }
    return color;
  }
  update(panelId: string, path: string, patch: Partial<HSLA>) {
    if (!TweakStore.getPanel(panelId) || TweakStore.isDisabled(panelId, path) || Object.values(patch).some(n => !Number.isFinite(n))) return;
    const color = { ...this.read(panelId, path), ...patch };
    color.h = hue(color.h); color.s = clamp(color.s); color.l = clamp(color.l); color.a = clamp(color.a);
    const current = String(TweakStore.getValue(panelId, path) ?? '');
    const hex = formatHex(hslToRgb(color), color.a < 1 || current.length === 9 || current.length === 5);
    this.coordinates.set(JSON.stringify([panelId, path]), { hex, color });
    TweakStore.updateValue(panelId, path, hex);
    this.notify();
  }
  setHue(h: number) { if (this.view) this.update(this.view.panelId, this.view.path, { h, s: 1 }); }
  setLuminosity(l: number) { if (this.view) this.update(this.view.panelId, this.view.path, { l }); }
  setOpacity(a: number) { if (this.view) this.update(this.view.panelId, this.view.path, { a }); }
  turn(panelId: string, path: string, delta: number, fine = false) {
    this.update(panelId, path, { h: this.read(panelId, path).h + delta * (fine ? 0.1 : 1) });
  }
  turnLuminosity(panelId: string, path: string, delta: number, fine = false) {
    this.update(panelId, path, { l: this.read(panelId, path).l + delta * (fine ? 0.002 : 0.02) });
  }
}
export const MoveColorStore = new MoveColorStoreClass();
