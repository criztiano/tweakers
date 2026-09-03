/**
 * The Move's volume-dial readout, offered to the app as a tiny display slot.
 *
 * The MovePanel keeps a dark pill in its header for whatever the volume
 * dial currently means in the app — a playhead time, a zoom level, a gain.
 * The app fills it:
 *
 *   import { MoveVolumeDisplay } from 'tweakers';
 *
 *   MoveVolumeDisplay.set({ label: 'gain', value: '-6.0 dB' });        // static
 *   MoveVolumeDisplay.set({ getValue: () => formatTime(playhead) });   // live
 *   MoveVolumeDisplay.clear();
 *
 * A static `value` renders as-is; a `getValue` is polled every frame while
 * the panel is on screen, for readouts that move (a waveform playhead).
 * When nothing is set, the pill disappears.
 */

export interface MoveVolumeDisplayState {
  /** A short name for what the dial edits — dimmed ahead of the value. */
  label?: string;
  /** A static readout string. */
  value?: string;
  /** A live readout, polled per animation frame while the panel is mounted. */
  getValue?: () => string;
}

class MoveVolumeDisplayClass {
  private state: MoveVolumeDisplayState | null = null;
  private listeners = new Set<() => void>();

  /** Show the pill with this readout — replaces any previous one. */
  set(state: MoveVolumeDisplayState): void {
    this.state = state;
    this.notify();
  }

  /** Hide the pill. */
  clear(): void {
    this.state = null;
    this.notify();
  }

  /** The current readout, or null when the pill is hidden. */
  get(): MoveVolumeDisplayState | null {
    return this.state;
  }

  /** Notified when the readout is set or cleared. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) l();
  }
}

export const MoveVolumeDisplay = new MoveVolumeDisplayClass();
