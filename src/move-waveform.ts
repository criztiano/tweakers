import { WAVEFORM_MAX_ZOOM, WAVEFORM_MODES } from './waveform-engine';
import type { WaveformLoop, WaveformMode } from './waveform-engine';
import { MoveVolumeDisplay } from './move-volume';
import { TweakStore, type TweakValue } from './store/TweakStore';

/**
 * A waveform on the Move surface.
 *
 * The panel gives an app its knobs; this gives it the sample they are acting
 * on. The hardware split follows the shape of the gesture rather than the
 * shape of the API: the big wheel is a scrub-and-zoom wheel on every deck ever
 * built, so it zooms; the volume knob is the one continuous control a hand
 * finds without looking, so it scrubs; and the step row is sixteen positions
 * along a bar, so it marks the loop.
 *
 * Everything here is pure but for the registry — the maths is what decides how
 * the instrument feels, so it is testable on its own.
 */

/** Placements. All three draw the same waveform; they differ in where it sits. */
export type MoveWaveformVariant =
  /** In the page, wherever the app puts it — a card on the app's own surface. */
  | 'page'
  /** Slot-sized, playhead pinned at the centre and the wave running past it. */
  | 'slot'
  /** Floating above the Move panel, the width of the surface it belongs to. */
  | 'dock';

/** The view state the hardware drives, shared by every surface showing it. */
export type MoveWaveformView = {
  /** Play position, 0..1. */
  position: number;
  /** 1 = whole sample. */
  zoom: number;
  loop: WaveformLoop | null;
  /** The step a pending loop started from, or null when no loop is being drawn. */
  loopAnchor: number | null;
};

/**
 * How the waveform is drawn — the look, as distinct from the view. The look
 * is the user's, not the app's: it lives on the kit's own settings page in
 * the settings room and persists per machine, so a sample reads the same
 * way in every app on this Move.
 */
export type MoveWaveformStyle = {
  mode: WaveformMode;
  /** Pixelated / striped: the bar width multiplier, an integer in `MOVE_WAVEFORM_PIXEL_RANGE`. */
  pixelSize: number;
  grid: boolean;
  bands: boolean;
  baseline: boolean;
};

/** The kit's waveform settings page — a hidden `kit` panel, room-only. */
export const MOVE_WAVEFORM_PANEL = 'move-waveform';
/** The bar widths the settings page offers: 1× to 6×, every integer. */
export const MOVE_WAVEFORM_PIXEL_RANGE = [1, 6] as const;

const MODE_LABELS: Record<WaveformMode, string> = { smooth: 'Smooth', pixelated: 'Pixel', striped: 'Striped', spaced: 'Spaced' };
const clampPixelSize = (v: number) =>
  Math.min(MOVE_WAVEFORM_PIXEL_RANGE[1], Math.max(MOVE_WAVEFORM_PIXEL_RANGE[0], Math.round(v)));

export function defaultStyle(): MoveWaveformStyle {
  return { mode: 'pixelated', pixelSize: 2, grid: false, bands: false, baseline: true };
}

/** The settings page's values, read back as a style; anything unset falls to `base`. */
export function styleFromValues(values: Record<string, TweakValue> | undefined, base: MoveWaveformStyle): MoveWaveformStyle {
  if (!values) return base;
  const mode = WAVEFORM_MODES.find((m) => m === values.style) ?? base.mode;
  const size = typeof values.resolution === 'number' && Number.isFinite(values.resolution)
    ? clampPixelSize(values.resolution)
    : base.pixelSize;
  const flag = (v: TweakValue, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    mode,
    pixelSize: size,
    grid: flag(values.grid, base.grid),
    bands: flag(values.bands, base.bands),
    baseline: flag(values.baseline, base.baseline),
  };
}

export const MOVE_WAVEFORM_STEPS = 16;
/** The bottom pad row: eight subdivisions of the window on screen. */
export const MOVE_WAVEFORM_PADS = 8;

/** A slow tick of the volume knob — the finest scrub move, a share of the shown window. */
export const SCRUB_PER_DETENT = 0.00025;
/** Shift is the fine layer everywhere else on this surface; it is here too. */
export const SCRUB_FINE = 0.00005;
/**
 * The encoder batches a fast turn into one event (±5, ±12 in a single
 * delta) — the batch size IS the turn's speed. Bending it superlinear
 * makes the knob two instruments: creep to land on a sample, spin to
 * cross it.
 */
export const SCRUB_ACCEL = 1.2;
/** Ignore pathological encoder batches beyond a deliberate fast spin. */
export const SCRUB_MAX_BATCH = 24;
/** A wheel detent is a proportion of the current zoom, so it feels the same
 *  going in as coming out. */
export const ZOOM_PER_DETENT = 0.08;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function defaultView(): MoveWaveformView {
  return { position: 0, zoom: 1, loop: null, loopAnchor: null };
}

/**
 * The volume knob scrubs: a signed detent count moves the play position. The
 * step is a share of the shown window, not of the sample — zoomed in eight
 * times, a detent moves an eighth as far, so the knob's precision follows
 * the eye's. Speed bends the step: a slow turn (delta ±1) moves by the
 * finest step, a spin (a batched delta) superlinearly more. Shift stays
 * plainly linear — the surgical layer never surprises.
 */
export function scrubBy(position: number, delta: number, fine = false, zoom = 1): number {
  const detents = Math.min(SCRUB_MAX_BATCH, Math.abs(delta));
  const magnitude = fine ? detents : Math.pow(detents, SCRUB_ACCEL);
  const step = (fine ? SCRUB_FINE : SCRUB_PER_DETENT) / Math.max(1, zoom);
  const next = clamp01(position + Math.sign(delta) * magnitude * step);
  // Snap the ends: a scrub that lands a thousandth short of the start is a
  // scrub to the start, and the number it feeds is a read position.
  return Number(next.toFixed(6));
}

/**
 * The wheel zooms, proportionally — each detent is a percentage of where you
 * already are, so ten clicks out undo ten clicks in.
 */
export function zoomBy(zoom: number, delta: number): number {
  const next = zoom * Math.pow(1 + ZOOM_PER_DETENT, delta);
  return Number(Math.min(WAVEFORM_MAX_ZOOM, Math.max(1, next)).toFixed(6));
}

/** Where step `index` sits along the sample, 0..1. */
export const stepPosition = (index: number, steps = MOVE_WAVEFORM_STEPS) =>
  Math.min(1, Math.max(0, index / Math.max(1, steps)));

/**
 * The step row as a loop bar: the first press drops the in point, the second
 * the out point, and a press with a loop already set starts a new one. Pressing
 * the anchor twice cancels rather than making a zero-length loop — a loop you
 * cannot hear is never what the second press meant.
 */
export function loopFromStep(
  view: MoveWaveformView,
  index: number,
  steps = MOVE_WAVEFORM_STEPS
): Pick<MoveWaveformView, 'loop' | 'loopAnchor'> {
  if (view.loopAnchor === null || view.loop) {
    return { loop: null, loopAnchor: index };
  }
  if (index === view.loopAnchor) {
    return { loop: null, loopAnchor: null };
  }
  const a = Math.min(view.loopAnchor, index);
  const b = Math.max(view.loopAnchor, index);
  // The out point closes the far edge of the step it was pressed on, so a
  // two-step loop covers both of them rather than the gap between.
  return {
    loop: { start: stepPosition(a, steps), end: stepPosition(b + 1, steps) },
    loopAnchor: null,
  };
}

/**
 * The window the engine is showing: 1/zoom of the sample, centred on the
 * playhead and clamped to the edges — the same framing the renderer does,
 * kept pure here so the pad row can address what is actually on screen.
 */
export function visibleWindow(position: number, zoom: number): { start: number; span: number } {
  const span = 1 / Math.max(1, zoom);
  let start = clamp01(position) - span / 2;
  if (start < 0) start = 0;
  else if (start > 1 - span) start = 1 - span;
  return { start, span };
}

/** Where pad `index` lands in the shown window, 0..1 of the sample. */
export const padPosition = (
  window: { start: number; span: number },
  index: number,
  pads = MOVE_WAVEFORM_PADS
) => clamp01(window.start + (Math.min(pads - 1, Math.max(0, index)) / pads) * window.span);

/** Pad `index`'s subdivision of the shown window, as a loop. */
export function padSection(
  window: { start: number; span: number },
  index: number,
  pads = MOVE_WAVEFORM_PADS
): WaveformLoop {
  const start = padPosition(window, index, pads);
  return { start, end: clamp01(start + window.span / pads) };
}

/** Which steps light: the loop's span, or the lone anchor while one is pending. */
export function loopSteps(view: MoveWaveformView, steps = MOVE_WAVEFORM_STEPS): number[] {
  if (view.loop) {
    const from = Math.floor(view.loop.start * steps);
    const to = Math.ceil(view.loop.end * steps) - 1;
    const lit: number[] = [];
    for (let i = Math.max(0, from); i <= Math.min(steps - 1, to); i++) lit.push(i);
    return lit;
  }
  return view.loopAnchor === null ? [] : [view.loopAnchor];
}

// ---------------------------------------------------------------------------
// Registry — one waveform at a time, because there is one wheel and one volume
// knob. Registering tells the bridge kit to claim them; unregistering hands
// them back, so an app that hides its waveform gets its tempo knob returned.
// ---------------------------------------------------------------------------

type Listener = () => void;

class MoveWaveformStoreClass {
  private view: MoveWaveformView = defaultView();
  /** Live claims — the app's display and the room's preview can both be up. */
  private claims = 0;
  private buffer: AudioBuffer | null = null;
  private editor = false;
  private progressSource: (() => number) | null = null;
  private duration: number | null = null;
  private listeners = new Set<Listener>();
  private version = 0;

  /**
   * Claim the wheel, the volume knob and the step row. Returns the release.
   * The first claim also puts the kit's Waveform page in the settings room,
   * seeded with the app's own look (`style`); the page stays once it is
   * there — a room does not lose a page because the display it dresses is
   * off screen for a moment — and its saved values win over the seed.
   */
  register(style?: Partial<MoveWaveformStyle>): () => void {
    this.claims += 1;
    this.ensureSettings(style);
    // The knob is ours now, so it says so: the volume readout follows the
    // playhead for as long as we hold the claim, and is handed back with it.
    if (this.claims === 1) MoveVolumeDisplay.set({ label: 'time', getValue: () => this.readout() });
    this.notify();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.claims -= 1;
      if (this.claims > 0) {
        this.notify();
        return;
      }
      this.editor = false;
      this.progressSource = null;
      this.duration = null;
      this.buffer = null;
      this.view = defaultView();
      MoveVolumeDisplay.clear();
      this.notify();
    };
  }

  isRegistered(): boolean {
    return this.claims > 0;
  }

  /** The sample on the surface right now — what the room's preview shows. */
  setBuffer(buffer: AudioBuffer | null): void {
    this.buffer = buffer;
    this.setDuration(buffer?.duration ?? null);
  }

  getBuffer(): AudioBuffer | null {
    return this.buffer;
  }

  /**
   * The kit's Waveform settings page: how the sample is drawn — the style,
   * the bar width, the grid, the EQ bands and the centre line. One hidden
   * `kit` panel that `MovePanel` shows in the settings room and the bridge
   * kit syncs like any page, so the look is set from the hardware too.
   * Idempotent: the panel puts it there at mount, a claiming waveform
   * seeds it if it gets there first, and saved values win over any seed.
   */
  ensureSettings(style?: Partial<MoveWaveformStyle>): void {
    if (TweakStore.getPanel(MOVE_WAVEFORM_PANEL)) return;
    const seed = { ...defaultStyle(), ...style };
    TweakStore.registerPanel(
      MOVE_WAVEFORM_PANEL,
      'Waveform',
      {
        style: {
          type: 'select',
          default: seed.mode,
          options: WAVEFORM_MODES.map((m) => ({ value: m, label: MODE_LABELS[m] })),
        },
        // The bar width as the headline value — "2×" — the way the old
        // resolution slider read.
        resolution: {
          type: 'slider',
          default: clampPixelSize(seed.pixelSize),
          min: MOVE_WAVEFORM_PIXEL_RANGE[0],
          max: MOVE_WAVEFORM_PIXEL_RANGE[1],
          step: 1,
          formatValue: (v: number) => `${Math.round(v)}×`,
        },
        // The three overlays as pictures with a state badge — what each
        // switch is about, and whether it is on.
        grid: { type: 'toggle', default: seed.grid, moveSlot: true, icon: 'grid-2x2' },
        bands: { type: 'toggle', default: seed.bands, moveSlot: true, label: 'EQ bands', icon: 'audio-lines' },
        baseline: { type: 'toggle', default: seed.baseline, moveSlot: true, label: 'Centre line', icon: 'activity' },
      },
      undefined,
      { kind: 'kit', persist: true }
    );
    // A saved value from an older page shape (the width was once a named
    // option) is not a value the dial can show: it goes back to the seed.
    const saved = TweakStore.getValues(MOVE_WAVEFORM_PANEL);
    if (typeof saved.resolution !== 'number') TweakStore.updateValue(MOVE_WAVEFORM_PANEL, 'resolution', clampPixelSize(seed.pixelSize));
  }

  /** The look the settings page holds right now (the defaults until one is registered). */
  getStyle(): MoveWaveformStyle {
    return styleFromValues(TweakStore.getPanel(MOVE_WAVEFORM_PANEL) && TweakStore.getValues(MOVE_WAVEFORM_PANEL), defaultStyle());
  }

  /** The settings page's values, a stable snapshot per change — for `useSyncExternalStore`. */
  getStyleSnapshot(): Record<string, TweakValue> {
    return TweakStore.getValues(MOVE_WAVEFORM_PANEL);
  }

  subscribeStyle(fn: Listener): () => void {
    return TweakStore.subscribe(MOVE_WAVEFORM_PANEL, fn);
  }

  /**
   * Editor mode — the floating waveform is up and owns the whole surface:
   * every step is the loop bar (a slot's own step included), and the bottom
   * pad row addresses the shown window. Off, the waveform keeps its polite
   * claims: the wheel, the knob, and only the steps nobody else holds.
   */
  setEditor(on: boolean): void {
    if (this.editor === on) return;
    this.editor = on;
    this.notify();
  }

  /** The kit routes every step press here while the editor is up. */
  wantsSteps(): boolean {
    return this.claims > 0 && this.editor;
  }

  /** The kit claims and routes the bottom pad row while the editor is up. */
  wantsPads(): boolean {
    return this.claims > 0 && this.editor;
  }

  /**
   * Where the playhead actually is, for framing — during playback the shown
   * window follows the engine's position, not the last scrub. The editor
   * mount provides it; without one the scrub position stands in.
   */
  setProgressSource(fn: (() => number) | null): void {
    this.progressSource = fn;
  }

  /**
   * How long the sample is, in seconds. With it the volume readout counts
   * real time; without it the same readout is a percentage of the sample,
   * which is still true — a position always reads as something.
   */
  setDuration(seconds: number | null): void {
    this.duration = seconds != null && seconds > 0 && Number.isFinite(seconds) ? seconds : null;
  }

  /** What the volume knob is editing right now, ready to print. */
  readout(): string {
    const at = clamp01(this.progressSource ? this.progressSource() : this.view.position);
    if (this.duration === null) return `${Math.round(at * 100)}%`;
    const total = at * this.duration;
    const minutes = Math.floor(total / 60);
    const seconds = total - minutes * 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds.toFixed(1)}`;
  }

  getView(): MoveWaveformView {
    return this.view;
  }

  getVersion(): number {
    return this.version;
  }

  /** Patch the view. A patch that changes nothing notifies nobody. */
  setView(patch: Partial<MoveWaveformView>): void {
    const next = { ...this.view, ...patch };
    if (
      next.position === this.view.position &&
      next.zoom === this.view.zoom &&
      next.loopAnchor === this.view.loopAnchor &&
      next.loop?.start === this.view.loop?.start &&
      next.loop?.end === this.view.loop?.end
    ) {
      return;
    }
    this.view = next;
    this.notify();
  }

  scrub(delta: number, fine = false): void {
    this.setView({ position: scrubBy(this.view.position, delta, fine, this.view.zoom) });
  }

  zoom(delta: number): void {
    this.setView({ zoom: zoomBy(this.view.zoom, delta) });
  }

  pressStep(index: number): void {
    this.setView(loopFromStep(this.view, index));
  }

  /** A held step lets the loop go — the remove gesture, from any step. */
  holdStep(_index: number): void {
    this.clearLoop();
  }

  /**
   * The bottom pad row, over the shown window: a tap jumps the playhead to
   * that subdivision (preview it), a hold selects it as the loop.
   */
  pressPad(index: number, hold = false): void {
    const at = this.progressSource ? clamp01(this.progressSource()) : this.view.position;
    const window = visibleWindow(at, this.view.zoom);
    if (hold) this.setView({ loop: padSection(window, index), loopAnchor: null });
    else this.setView({ position: padPosition(window, index) });
  }

  clearLoop(): void {
    this.setView({ loop: null, loopAnchor: null });
  }

  /** The steps the loop covers — what the hardware lights. */
  loopSteps(): number[] {
    return loopSteps(this.view);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify(): void {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
}

export const MoveWaveformStore = new MoveWaveformStoreClass();

/** The stand-in loop's length, seconds — two bars at 120. */
export const MOVE_WAVEFORM_DEMO_SECONDS = 4;

let demoSample: AudioBuffer | null = null;

/**
 * A sample to look at when the app has none on the surface: two bars of
 * kick, snare and hat, synthesized once and kept — so the Waveform page
 * always has a wave to dress, whatever the app has loaded. Duck-typed the
 * way every reader here reads a buffer, so it needs no AudioContext.
 */
export function moveWaveformDemoSample(): AudioBuffer {
  if (demoSample) return demoSample;
  const rate = 44100;
  const data = new Float32Array(rate * MOVE_WAVEFORM_DEMO_SECONDS);
  // A deterministic noise, so the snare reads the same on every load.
  let seed = 7;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;
  };
  const beat = rate / 2;
  for (let n = 0; n < 8; n++) {
    const at = n * beat;
    // Kick on every beat: a sine that drops from 120 Hz to 45 Hz.
    for (let i = 0; i < rate * 0.3 && at + i < data.length; i++) {
      const t = i / rate;
      const f = 45 + 75 * Math.exp(-t * 30);
      data[at + i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.9;
    }
    // Snare on 2 and 4: noise with a short body.
    if (n % 2 === 1) {
      for (let i = 0; i < rate * 0.18 && at + i < data.length; i++) {
        const t = i / rate;
        data[at + i] += (noise() * 0.6 + Math.sin(2 * Math.PI * 190 * t) * 0.3) * Math.exp(-t * 22);
      }
    }
    // Hats on the off-beats: a tick of bright noise.
    const off = at + beat / 2;
    for (let i = 0; i < rate * 0.05 && off + i < data.length; i++) {
      data[off + i] += noise() * 0.25 * Math.exp(-(i / rate) * 90);
    }
  }
  demoSample = toAudioBuffer(data, rate);
  return demoSample;
}

/**
 * Mono samples as an AudioBuffer: a real one where the browser has the
 * constructor — the EQ split renders offline and needs the real thing —
 * and a duck-typed stand-in elsewhere (node, the tests), which every reader
 * here reads the same way.
 */
export function toAudioBuffer(data: Float32Array, sampleRate: number): AudioBuffer {
  if (typeof AudioBuffer !== 'undefined') {
    try {
      const buffer = new AudioBuffer({ length: data.length, sampleRate, numberOfChannels: 1 });
      buffer.copyToChannel(data as Float32Array<ArrayBuffer>, 0);
      return buffer;
    } catch {
      /* no constructor support — the stand-in below reads the same */
    }
  }
  return {
    numberOfChannels: 1,
    length: data.length,
    duration: data.length / sampleRate,
    sampleRate,
    getChannelData: () => data,
  } as unknown as AudioBuffer;
}
