import { formatHex, hslToRgb, parseHex, rgbToHsl, type HSLA } from './color-core';
import { TweakStore } from './store/TweakStore';

export interface MoveColorView { panelId: string; path: string }

/** A named palette the colour dial can be locked to: sixteen colours, the
 *  dial stepping between them instead of sweeping the whole wheel. */
export interface MoveColorPalette { id: string; name: string; colors: string[] }

/** The built-in palettes the menu button offers while the editor is open. */
export const MOVE_COLOR_PALETTES: MoveColorPalette[] = [
  { id: 'move', name: 'Move 16', colors: [
    '#ff4d07', '#ff9d00', '#ffd500', '#a8e000', '#52bd06', '#00c78b', '#00c2d1', '#4274f4',
    '#2f5cc4', '#8a5cf5', '#b04cff', '#d83dff', '#ff3d9a', '#ff5d5d', '#c96f4a', '#9e9e88',
  ] },
  { id: 'ember', name: 'Ember', colors: [
    '#fff3c4', '#ffe28a', '#ffd166', '#ffb703', '#fb8500', '#f77f00', '#f4623a', '#ef476f',
    '#e63946', '#d62828', '#b5171e', '#9d0208', '#7f1d1d', '#6a040f', '#4a0404', '#2b0000',
  ] },
  { id: 'ocean', name: 'Ocean', colors: [
    '#e0fbfc', '#bee9e8', '#98f5e1', '#62d9c4', '#2ec4b6', '#06d6a0', '#00b4d8', '#48cae4',
    '#4cc9f0', '#4895ef', '#4361ee', '#3a0ca3', '#264653', '#1d3557', '#14213d', '#0b132b',
  ] },
  { id: 'meadow', name: 'Meadow', colors: [
    '#f7ffe0', '#e9f5db', '#d8f3a3', '#ccff33', '#9ef01a', '#70e000', '#52bd06', '#38b000',
    '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#606c38', '#3a5a40', '#283618',
  ] },
  { id: 'neon', name: 'Neon', colors: [
    '#f5f5f5', '#eaff00', '#c8ff00', '#39ff14', '#00ffab', '#00fff7', '#00d0ff', '#3d5aff',
    '#7b2bff', '#b026ff', '#e600ff', '#ff00c8', '#ff2079', '#ff3131', '#ff5f1f', '#ff9e00',
  ] },
];

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
/** The first pad row while the editor is open: an eight-level opacity bar. */
export const MOVE_OPACITY_PADS = 8;
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

/** Palette hexes as HSLA, parsed once per palette. */
const paletteCoords = new Map<string, HSLA[]>();
const paletteHsl = (palette: MoveColorPalette): HSLA[] => {
  const cached = paletteCoords.get(palette.id);
  if (cached) return cached;
  const coords = palette.colors.map((hex) => rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }));
  paletteCoords.set(palette.id, coords);
  return coords;
};

/** The palette colour a hue lands nearest, the long way round included. */
const paletteSlot = (palette: MoveColorPalette, h: number): number => {
  const target = hue(h);
  let best = 0, bestGap = Infinity;
  paletteHsl(palette).forEach((color, index) => {
    const gap = Math.min(Math.abs(color.h - target), 360 - Math.abs(color.h - target));
    if (gap < bestGap) { bestGap = gap; best = index; }
  });
  return best;
};

/* While a palette is locked, the dial's hue is a POSITION on the wheel, not
 * a colour: the wheel divides into equal segments, one per palette entry, so
 * a turn scrolls the set evenly however its hues are spaced. The position is
 * what the store remembers and what the hardware holds — only the painted
 * hex snaps to the segment's colour, so nothing echoes back and fights the
 * knob. */
const paletteAt = (palette: MoveColorPalette, h: number): number =>
  Math.min(palette.colors.length - 1, Math.floor(hue(h) / 360 * palette.colors.length));
const paletteCenter = (palette: MoveColorPalette, index: number): number =>
  (index + 0.5) * 360 / palette.colors.length;

/** Shared editor selection and color coordinates for the panel and Move bridge. */
class MoveColorStoreClass {
  private view: MoveColorView | null = null;
  private version = 0;
  private listeners = new Set<() => void>();
  // Remember hue/saturation at black and white, where RGB cannot retain them.
  private coordinates = new Map<string, { hex: string; color: HSLA }>();
  /** The palette the dial is locked to — null is the whole wheel. */
  private paletteId: string | null = null;
  /** The palette navigator behind Menu while the editor is open. */
  private picker = false;
  private pickerCursor = 0;
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
  close() { if (this.view || this.picker) { this.view = null; this.picker = false; this.notify(); } }
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
    // Locked to a palette, the open dial only paints its colours: the hue is
    // a position on the segmented wheel and the written hex is the segment's
    // colour. The cache keeps the position, so the hardware's knob value is
    // never snapped back under it. Alpha stays free — it belongs to the pads.
    const palette = this.view?.panelId === panelId && this.view.path === path ? this.getPalette() : null;
    const snapped = palette ? paletteHsl(palette)[paletteAt(palette, color.h)] : null;
    const painted = snapped ? { ...color, h: snapped.h, s: snapped.s, l: snapped.l } : color;
    const current = String(TweakStore.getValue(panelId, path) ?? '');
    const hex = formatHex(hslToRgb(painted), painted.a < 1 || current.length === 9 || current.length === 5);
    this.coordinates.set(JSON.stringify([panelId, path]), { hex, color });
    TweakStore.updateValue(panelId, path, hex);
    this.notify();
  }
  setHue(h: number) { if (this.view) this.update(this.view.panelId, this.view.path, { h, s: 1 }); }
  setLuminosity(l: number) { if (this.view) this.update(this.view.panelId, this.view.path, { l }); }
  setOpacity(a: number) { if (this.view) this.update(this.view.panelId, this.view.path, { a }); }
  turn(panelId: string, path: string, delta: number, fine = false) {
    // With a palette locked in, a turn is a step to the next of its colours.
    const palette = this.view?.panelId === panelId && this.view.path === path ? this.getPalette() : null;
    if (palette && delta) {
      const at = paletteAt(palette, this.read(panelId, path).h);
      const next = (at + Math.sign(delta) + palette.colors.length) % palette.colors.length;
      this.update(panelId, path, { h: paletteCenter(palette, next) });
      return;
    }
    this.update(panelId, path, { h: this.read(panelId, path).h + delta * (fine ? 0.1 : 1) });
  }
  turnLuminosity(panelId: string, path: string, delta: number, fine = false) {
    this.update(panelId, path, { l: this.read(panelId, path).l + delta * (fine ? 0.002 : 0.02) });
  }

  /* ---- the palette lock and its navigator ---- */

  getPaletteId = (): string | null => this.paletteId;
  getPalette = (): MoveColorPalette | null =>
    this.paletteId ? MOVE_COLOR_PALETTES.find((p) => p.id === this.paletteId) ?? null : null;
  /** Which palette colour the open control sits on — null off-palette. */
  paletteIndex(panelId: string, path: string): number | null {
    const palette = this.getPalette();
    return palette ? paletteAt(palette, this.read(panelId, path).h) : null;
  }
  /** Lock the open editor to a palette (null = back to all colours), and
   *  bring its colour onto the palette right away — the nearest of its hues,
   *  then that segment's centre so a turn steps cleanly from there. */
  setPalette(id: string | null) {
    this.paletteId = id && MOVE_COLOR_PALETTES.some((p) => p.id === id) ? id : null;
    this.picker = false;
    const palette = this.getPalette();
    if (palette && this.view) {
      const nearest = paletteSlot(palette, this.read(this.view.panelId, this.view.path).h);
      this.update(this.view.panelId, this.view.path, { h: paletteCenter(palette, nearest) });
    }
    this.notify();
  }
  /** Jump straight to one of the locked palette's colours. */
  setPaletteColor(index: number) {
    const palette = this.getPalette();
    if (palette && this.view) this.update(this.view.panelId, this.view.path, { h: paletteCenter(palette, index) });
  }

  isPickerOpen = (): boolean => this.picker && !!this.view;
  getPickerCursor = (): number => this.pickerCursor;
  openPicker() {
    if (!this.view || this.picker) return;
    const at = MOVE_COLOR_PALETTES.findIndex((p) => p.id === this.paletteId);
    this.pickerCursor = at < 0 ? 0 : at + 1; // row 0 is "All colors"
    this.picker = true;
    this.notify();
  }
  closePicker() { if (this.picker) { this.picker = false; this.notify(); } }
  togglePicker() { if (this.picker) this.closePicker(); else this.openPicker(); }
  /** Walk the navigator's cursor by wheel detents. */
  movePickerCursor(delta: number) {
    if (!this.isPickerOpen() || !delta) return;
    const step = Math.round(delta) || Math.sign(delta);
    const next = Math.max(0, Math.min(MOVE_COLOR_PALETTES.length, this.pickerCursor + step));
    if (next === this.pickerCursor) return;
    this.pickerCursor = next;
    this.notify();
  }
  /** Keep the cursor's row: the palette locks in and the navigator dismisses. */
  confirmPicker() {
    if (!this.isPickerOpen()) return;
    this.setPalette(this.pickerCursor === 0 ? null : MOVE_COLOR_PALETTES[this.pickerCursor - 1]?.id ?? null);
  }
  /** A clicked row: cursor and confirm in one. */
  choosePicker(cursor: number) {
    if (!this.isPickerOpen()) return;
    this.pickerCursor = Math.max(0, Math.min(MOVE_COLOR_PALETTES.length, cursor));
    this.confirmPicker();
  }
}
export const MoveColorStore = new MoveColorStoreClass();
