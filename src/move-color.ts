import { formatHex, hslToRgb, parseHex, rgbToHsl, type HSLA } from './color-core';
import { setStopColor, type GradientValue } from './gradient-core';
import { TweakStore } from './store/TweakStore';

export interface MoveColorView { panelId: string; path: string }

/** How many stops the Move's gradient editor drives — one per track button.
 *  A gradient with more stops keeps the plain ramp slot (drag its stops on
 *  screen); the integrated editor is for the 2–4 stop ramps the hardware can
 *  hold in one hand. */
export const MOVE_GRADIENT_STOPS = 4;

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

/** Palette hexes as HSLA, parsed once per set of colours — an app's lock can
 *  keep its id while its colours change. */
const paletteCoords = new Map<string, HSLA[]>();
const paletteHsl = (palette: MoveColorPalette): HSLA[] => {
  const key = `${palette.id}:${palette.colors.join()}`;
  const cached = paletteCoords.get(key);
  if (cached) return cached;
  const coords = palette.colors.map((hex) => rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }));
  paletteCoords.set(key, coords);
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

/** Shared editor selection and color coordinates for the panel and Move bridge.
 *  One editor serves two value shapes: a plain hex colour, and a gradient —
 *  there the editor holds a SELECTED STOP (one of up to four, the track
 *  buttons' count) and every hue/luminosity/opacity edit lands on that stop. */
class MoveColorStoreClass {
  private view: MoveColorView | null = null;
  private version = 0;
  private listeners = new Set<() => void>();
  // Remember hue/saturation at black and white, where RGB cannot retain them.
  private coordinates = new Map<string, { hex: string; color: HSLA }>();
  /** The palette the dial is locked to — null is the whole wheel. */
  private paletteId: string | null = null;
  /** The app's own palette, holding EVERY colour control to its colours —
   *  open or not. It outranks the editor's navigator, which it closes. */
  private lock: MoveColorPalette | null = null;
  /** The app's own palettes, when it has a set of its own: the navigator lists
   *  these instead of the built-in ones. */
  private hostPalettes: MoveColorPalette[] | null = null;
  private onPickPalette: ((id: string | null) => void) | null = null;
  /** The palette navigator behind Menu while the editor is open. */
  private picker = false;
  private pickerCursor = 0;
  /** The gradient stop the editor is on — meaningless for a plain colour. */
  private stop = 0;
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
    this.stop = 0;
    this.notify();
  }
  close() { if (this.view || this.picker) { this.view = null; this.picker = false; this.notify(); } }
  toggle(panelId: string, path: string) {
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    else this.open(panelId, path);
  }

  /* ---- the gradient shape under a control, when it has one ---- */

  /** The control's gradient value, or null when it holds a plain colour. */
  gradient(panelId: string, path: string): GradientValue | null {
    const v = TweakStore.getValue(panelId, path);
    return v && typeof v === 'object' && Array.isArray((v as GradientValue).stops) && (v as GradientValue).stops.length >= 2
      ? (v as GradientValue)
      : null;
  }
  /** How many stops the editor can hold — 0 for a plain colour. */
  stopCount(panelId: string, path: string): number {
    return Math.min(this.gradient(panelId, path)?.stops.length ?? 0, MOVE_GRADIENT_STOPS);
  }
  getStop = (): number => this.stop;
  /** Land the editor on a stop — the track buttons' gesture. */
  selectStop(index: number) {
    if (!this.view) return;
    const count = this.stopCount(this.view.panelId, this.view.path);
    const next = Math.max(0, Math.min(Math.max(0, count - 1), Math.round(index)));
    if (next === this.stop) return;
    this.stop = next;
    this.notify();
  }
  /** A stop's position along the ramp, 0..1 — 0 when out of range. */
  stopPosition(panelId: string, path: string, index: number): number {
    return Number(this.gradient(panelId, path)?.stops[index]?.position) || 0;
  }
  /** Slide a stop, clamped between its neighbours so the held stop never
   *  changes identity under the hand moving it — the ramp slot's own rule. */
  moveStop(panelId: string, path: string, index: number, position: number) {
    const g = this.gradient(panelId, path);
    if (!g || TweakStore.isDisabled(panelId, path) || !Number.isFinite(position)) return;
    if (index < 0 || index >= g.stops.length) return;
    const lo = index > 0 ? g.stops[index - 1].position : 0;
    const hi = index < g.stops.length - 1 ? g.stops[index + 1].position : 1;
    const next = Math.min(hi, Math.max(lo, position));
    if (next === g.stops[index].position) return;
    TweakStore.updateValue(panelId, path, {
      ...g,
      stops: g.stops.map((s, i) => (i === index ? { ...s, position: next } : s)),
    });
    this.notify();
  }
  /** Slide the selected stop by wheel/dial detents — the hold-a-track gesture. */
  turnStop(panelId: string, path: string, delta: number, fine = false) {
    this.moveStop(panelId, path, this.stop,
      this.stopPosition(panelId, path, this.stop) + delta * (fine ? 0.001 : 0.01));
  }

  /** Where a control's colour lives: the hex itself, or the stop's colour. */
  private hexAt(panelId: string, path: string, stop: number | null): string {
    const g = stop === null ? null : this.gradient(panelId, path);
    if (g && stop !== null) return String(g.stops[Math.min(stop, g.stops.length - 1)]?.color ?? '#ff0000ff');
    return String(TweakStore.getValue(panelId, path) ?? '#ff0000');
  }
  /** The selected coordinate target: the stop the editor is on, when the
   *  control is a gradient; the control itself otherwise. */
  private targetStop(panelId: string, path: string): number | null {
    return this.gradient(panelId, path) ? Math.min(this.stop, this.stopCount(panelId, path) - 1) : null;
  }
  read(panelId: string, path: string): HSLA {
    return this.readStop(panelId, path, this.targetStop(panelId, path));
  }
  /** The colour under the editor as hex — the selected stop's for a gradient. */
  hex(panelId: string, path: string): string {
    return this.hexAt(panelId, path, this.targetStop(panelId, path));
  }
  /** A specific stop's coordinates (null = the plain colour) — what the stop
   *  row and the hardware's track lights paint. */
  readStop(panelId: string, path: string, stop: number | null): HSLA {
    const hex = this.hexAt(panelId, path, stop);
    const cached = this.coordinates.get(JSON.stringify([panelId, path, stop]));
    if (cached?.hex === hex) return { ...cached.color };
    const color = rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 });
    if (color.s === 0) {
      color.h = cached?.color.h ?? 0;
      if (color.l === 0 || color.l === 1) color.s = cached?.color.s ?? 1;
    }
    return color;
  }
  update(panelId: string, path: string, patch: Partial<HSLA>) {
    this.updateStop(panelId, path, this.targetStop(panelId, path), patch);
  }
  updateStop(panelId: string, path: string, stop: number | null, patch: Partial<HSLA>) {
    if (!TweakStore.getPanel(panelId) || TweakStore.isDisabled(panelId, path) || Object.values(patch).some(n => !Number.isFinite(n))) return;
    const color = { ...this.readStop(panelId, path, stop), ...patch };
    color.h = hue(color.h); color.s = clamp(color.s); color.l = clamp(color.l); color.a = clamp(color.a);
    // Locked to a palette, the open dial only paints its colours: the hue is
    // a position on the segmented wheel and the written hex is the segment's
    // colour. The cache keeps the position, so the hardware's knob value is
    // never snapped back under it. Alpha stays free — it belongs to the pads.
    // The lock is per stop: every stop of an open gradient snaps the same way.
    const palette = this.lockFor(panelId, path);
    const snapped = palette ? paletteHsl(palette)[paletteAt(palette, color.h)] : null;
    const painted = snapped ? { ...color, h: snapped.h, s: snapped.s, l: snapped.l } : color;
    const g = stop === null ? null : this.gradient(panelId, path);
    // A gradient stop is always #rrggbbaa; a plain colour keeps its shape.
    const current = this.hexAt(panelId, path, stop);
    const hex = formatHex(hslToRgb(painted), !!g || painted.a < 1 || current.length === 9 || current.length === 5);
    this.coordinates.set(JSON.stringify([panelId, path, stop]), { hex, color });
    if (g && stop !== null) TweakStore.updateValue(panelId, path, setStopColor(g, stop, hex));
    else TweakStore.updateValue(panelId, path, hex);
    this.notify();
  }
  setHue(h: number) { if (this.view) this.update(this.view.panelId, this.view.path, { h, s: 1 }); }
  setLuminosity(l: number) { if (this.view) this.update(this.view.panelId, this.view.path, { l }); }
  setOpacity(a: number) { if (this.view) this.update(this.view.panelId, this.view.path, { a }); }
  turn(panelId: string, path: string, delta: number, fine = false) {
    // With a palette locked in, a turn is a step to the next of its colours.
    const palette = this.lockFor(panelId, path);
    if (palette && delta) {
      const at = this.paletteAtValue(palette, panelId, path);
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

  getPaletteId = (): string | null => this.lock?.id ?? this.paletteId;
  getPalette = (): MoveColorPalette | null =>
    this.lock ?? (this.paletteId ? this.palettes().find((p) => p.id === this.paletteId) ?? null : null);

  /**
   * The app's own palettes, in the navigator the instrument already has: the rows
   * list these instead of the built-in ones, the first row ("All colors") still
   * means no palette, and a choice goes back through `onPick` — the app owns what
   * a palette means, and answers by locking one (`lockPalette`). With a set
   * installed the navigator opens on its own, with no colour editor up, so a
   * palette can be an app-wide setting rather than one control's.
   *
   * `null` gives the navigator the built-in palettes back.
   */
  setPalettes(palettes: readonly MoveColorPalette[] | null, onPick?: (id: string | null) => void) {
    const next = palettes && palettes.length > 0 ? palettes.map((p) => ({ ...p, colors: [...p.colors] })) : null;
    this.hostPalettes = next;
    this.onPickPalette = next ? onPick ?? null : null;
    this.picker = false;
    this.pickerCursor = 0;
    this.notify();
  }
  /** The palettes the navigator lists — the app's when it has some. */
  palettes = (): MoveColorPalette[] => this.hostPalettes ?? MOVE_COLOR_PALETTES;
  /** The palette a control's edits snap to: the app's lock on every control,
   *  else the navigator's choice on the one the editor has open. */
  private lockFor(panelId: string, path: string): MoveColorPalette | null {
    if (this.lock) return this.lock;
    return this.view?.panelId === panelId && this.view.path === path ? this.getPalette() : null;
  }

  /**
   * Hold every colour control in the app to one palette — an app-wide
   * setting, not the editor's: a turn steps through its colours, a drag or a
   * write through the editor lands on the nearest segment, on screen and on
   * the hardware, open editor or not. The navigator behind Menu stands down
   * while the lock holds, since the palette is the app's to choose. `null`
   * hands every control back its whole wheel. Values the app writes itself
   * are the app's to keep on the palette.
   */
  lockPalette(palette: MoveColorPalette | null) {
    const next = palette && palette.colors.length > 0 ? { ...palette, colors: [...palette.colors] } : null;
    const same = next?.id === this.lock?.id && next?.colors.join() === this.lock?.colors.join();
    if (same) return;
    this.lock = next;
    this.picker = false;
    this.notify();
  }
  getLock = (): MoveColorPalette | null => this.lock;
  /** Which palette colour the open control sits on — null off-palette. */
  paletteIndex(panelId: string, path: string): number | null {
    const palette = this.getPalette();
    return palette ? this.paletteAtValue(palette, panelId, path) : null;
  }
  /** Which palette colour a control holds: the colour it IS, when it is one of
   *  them — a value the app wrote carries no position on the segmented wheel —
   *  else the segment its hue sits in. */
  private paletteAtValue(palette: MoveColorPalette, panelId: string, path: string): number {
    const hex = this.hex(panelId, path).slice(0, 7).toLowerCase();
    const exact = palette.colors.findIndex((color) => color.slice(0, 7).toLowerCase() === hex);
    return exact >= 0 ? exact : paletteAt(palette, this.read(panelId, path).h);
  }
  /** Lock the open editor to a palette (null = back to all colours), and
   *  bring its colour onto the palette right away — the nearest of its hues,
   *  then that segment's centre so a turn steps cleanly from there. */
  setPalette(id: string | null) {
    if (this.lock) return;
    this.paletteId = id && this.palettes().some((p) => p.id === id) ? id : null;
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

  isPickerOpen = (): boolean => this.picker && (!!this.view || !!this.hostPalettes);
  getPickerCursor = (): number => this.pickerCursor;
  openPicker() {
    // The app's own set is reachable whether or not a colour is open, and whether
    // or not one of its palettes is in force; the built-in set is the editor's.
    if (this.picker || (!this.hostPalettes && (!this.view || this.lock))) return;
    const at = this.palettes().findIndex((p) => p.id === this.getPaletteId());
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
    const next = Math.max(0, Math.min(this.palettes().length, this.pickerCursor + step));
    if (next === this.pickerCursor) return;
    this.pickerCursor = next;
    this.notify();
  }
  /** Rest the cursor on a row — a search landing the wheel on the next match. */
  setPickerCursor(cursor: number) {
    if (!this.isPickerOpen()) return;
    const next = Math.max(0, Math.min(this.palettes().length, cursor));
    if (next === this.pickerCursor) return;
    this.pickerCursor = next;
    this.notify();
  }
  /** Keep the cursor's row: the palette locks in and the navigator dismisses. */
  confirmPicker() {
    if (!this.isPickerOpen()) return;
    const id = this.pickerCursor === 0 ? null : this.palettes()[this.pickerCursor - 1]?.id ?? null;
    if (this.onPickPalette) {
      this.picker = false;
      this.notify();
      this.onPickPalette(id);
      return;
    }
    this.setPalette(id);
  }
  /** A clicked row: cursor and confirm in one. */
  choosePicker(cursor: number) {
    if (!this.isPickerOpen()) return;
    this.pickerCursor = Math.max(0, Math.min(this.palettes().length, cursor));
    this.confirmPicker();
  }
}
export const MoveColorStore = new MoveColorStoreClass();
