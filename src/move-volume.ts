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
 *
 * Something that takes the knob itself — a timeline, a modulator's page —
 * claims it instead, with the readout that names what it now does:
 *
 *   const release = MoveVolumeDisplay.claim({ label: 'time', getValue });
 *
 * While a claim stands its readout is the one shown, the kit asks the Move
 * for the knob (`claims.master`), and the knob is the claim's: the newest
 * claim is in front, and its release hands the knob and the pill back to
 * whatever stood under it. Plain `set`/`clear` keep writing what shows
 * once every claim has let go.
 */

import { TweakStore } from './store/TweakStore';

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
  private claims: MoveVolumeDisplayState[] = [];
  private listeners = new Set<() => void>();

  /** Show the pill with this readout — replaces any previous one. Under a
   *  claim it waits, and shows once the claims let go. */
  set(state: MoveVolumeDisplayState): void {
    // the Move's screen shows it only through the kit's `volume` option
    TweakStore.noteMoveKitUse('volume');
    this.state = state;
    this.notify();
  }

  /** Hide the pill (once no claim holds the knob). */
  clear(): void {
    this.state = null;
    this.notify();
  }

  /** The current readout — the newest claim's, else the one set — or null
   *  when the pill is hidden. */
  get(): MoveVolumeDisplayState | null {
    return this.claims[this.claims.length - 1] ?? this.state;
  }

  /**
   * Take the volume knob for as long as the returned release, naming what it
   * does with `readout`. The newest claim holds the knob: an older one
   * whose readout is no longer `get()` must leave the knob's turns alone.
   */
  claim(readout: MoveVolumeDisplayState): () => void {
    TweakStore.noteMoveKitUse('volume');
    this.claims.push(readout);
    this.notify();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const at = this.claims.indexOf(readout);
      if (at >= 0) this.claims.splice(at, 1);
      this.notify();
    };
  }

  /** Whether anything holds the knob — read live by the kit's claims. */
  claimsKnob(): boolean {
    return this.claims.length > 0;
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
