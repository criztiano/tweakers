/**
 * Everything the Move bridge kit reads, in one piece.
 *
 * The kit (`bindMove`, served by the move repo at /kit.js) ships alone: it
 * cannot import this package, so the registries it drives are handed to it.
 * Handing them one by one is how integrations break — a forgotten `color`
 * leaves every colour a dead slot and a balance unable to seat its colours,
 * a forgotten `surface` keeps the wheel's list off the Move's screen — and
 * only on the hardware, where nobody is looking while building. So there is
 * one bind, and it carries all of them:
 *
 *   import { TweakStore, moveKitOptions } from 'tweakers';
 *
 *   import('http://localhost:7787/kit.js')
 *     .then(m => m.bindMove(TweakStore, moveKitOptions()));
 *
 * Anything else the bind takes rides in the same call:
 * `moveKitOptions({ url, panels })`. A registry the app must keep for itself
 * — a sequencer that owns the step row, a raw client that owns the pads — is
 * declined by name with `null` (`moveKitOptions({ modulation: null })`), which
 * also tells the kit the gap is on purpose. Every registry is inert until the
 * page uses it, so carrying one the app never touches costs nothing.
 */

import { MovePadListStore } from './move-pad-list';
import { MoveColorStore } from './move-color';
import { MoveFunctions } from './move-functions';
import { MoveSurfaceStore } from './move-surface-store';
import { MoveTimelineStore } from './move-timeline';
import { MoveVolumeDisplay } from './move-volume';
import { MoveWaveformStore } from './move-waveform';
import { PresetExplorationStore } from './preset-exploration';
import { ModulationStore } from './store/ModulationStore';
import { movePoint, sampleTransfer } from './transfer-core';

export interface MoveKitOptions {
  padList: typeof MovePadListStore;
  functions: typeof MoveFunctions;
  modulation: typeof ModulationStore;
  color: typeof MoveColorStore;
  surface: typeof MoveSurfaceStore;
  waveform: typeof MoveWaveformStore;
  volume: typeof MoveVolumeDisplay;
  /** The curve maths a knob needs to hold one of a transfer's points. */
  transfer: { sample: typeof sampleTransfer; move: typeof movePoint };
  /** Preset exploration's 32 pads, behind a held Menu. */
  exploration: typeof PresetExplorationStore;
  /**
   * The hardware the page holds beyond its registries, forwarded in every
   * configure — live: `master` (the volume knob) reads true while a timeline
   * holds it. An app's own `claims` ride inside, and its `master` still wins.
   */
  claims: Record<string, unknown>;
}

/**
 * The claims, read at every configure. The kit spreads them into each
 * /configure it sends, and a timeline's mount and unmount push and release
 * the transport keys — which reconfigures — so the knob is claimed and handed
 * back on the same beat, with no second bookkeeping.
 */
function liveClaims(app?: Record<string, unknown> | null): Record<string, unknown> {
  const claims: Record<string, unknown> = { ...app };
  Object.defineProperty(claims, 'master', {
    enumerable: true,
    get: () => (app?.master ? app.master : MoveTimelineStore.claimsKnob() || undefined),
  });
  return claims;
}

/** What may ride along: any other bind option, and `null` to decline a
 *  registry on purpose. */
export type MoveKitOverrides = { [K in keyof MoveKitOptions]?: MoveKitOptions[K] | null } & Record<string, unknown>;

/** Every registry the bridge kit reads, keyed by its `bindMove` option. */
export function moveKitOptions<T extends MoveKitOverrides>(overrides?: T): Omit<MoveKitOptions, keyof T> & T {
  const app = overrides?.claims as Record<string, unknown> | null | undefined;
  return {
    padList: MovePadListStore,
    functions: MoveFunctions,
    modulation: ModulationStore,
    color: MoveColorStore,
    surface: MoveSurfaceStore,
    waveform: MoveWaveformStore,
    volume: MoveVolumeDisplay,
    transfer: { sample: sampleTransfer, move: movePoint },
    exploration: PresetExplorationStore,
    ...overrides,
    claims: app === null ? null : liveClaims(app),
  } as Omit<MoveKitOptions, keyof T> & T;
}
