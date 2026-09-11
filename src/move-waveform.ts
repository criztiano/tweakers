import { WAVEFORM_MAX_ZOOM } from './waveform-engine';
import type { WaveformLoop } from './waveform-engine';
import { MoveVolumeDisplay } from './move-volume';

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
  private registered = false;
  private editor = false;
  private progressSource: (() => number) | null = null;
  private duration: number | null = null;
  private listeners = new Set<Listener>();
  private version = 0;

  /** Claim the wheel, the volume knob and the step row. Returns the release. */
  register(): () => void {
    this.registered = true;
    // The knob is ours now, so it says so: the volume readout follows the
    // playhead for as long as we hold the claim, and is handed back with it.
    MoveVolumeDisplay.set({ label: 'time', getValue: () => this.readout() });
    this.notify();
    return () => {
      this.registered = false;
      this.editor = false;
      this.progressSource = null;
      this.duration = null;
      this.view = defaultView();
      MoveVolumeDisplay.clear();
      this.notify();
    };
  }

  isRegistered(): boolean {
    return this.registered;
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
    return this.registered && this.editor;
  }

  /** The kit claims and routes the bottom pad row while the editor is up. */
  wantsPads(): boolean {
    return this.registered && this.editor;
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
