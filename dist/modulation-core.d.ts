import { C as ControlMeta } from './TweakStore-DJZN26nW.js';
import './range-slider-core.js';

/**
 * The modulation layer's shared ground — types, palette, math, and the
 * modulator-type registry, all framework-neutral.
 *
 * A modulation lives in one of 16 slots, one per Move sequencer step button:
 * touch a control and press a step to create the modulation there and wire
 * the control to it. Each slot carries a modulator (an LFO, an envelope
 * follower, a curve...) and a palette colour; the same colour marks the
 * slot's circle in the track row and a dot on every control it drives.
 *
 * The modulated value NEVER enters the TweakStore: a control keeps the
 * number the user set (the base), and the modulation is a live layer read
 * at frame time through the ModulationStore. That keeps presets, the
 * persistence shelf, and the bridge kit's diffing on the stored value —
 * nothing loops, nothing thrashes — the same shape Pixture's audio mods
 * proved out.
 *
 * Modulator types register through `registerModType`, so each type (LFO,
 * envelope, curve, S&H, sequencer) plugs in independently: defaults, the
 * settings-page controls, and a stateful `tick` that advances the signal.
 * A slot can instead point at an external source (a DSP app's own LFO or
 * follower) registered on the ModulationStore — same slot, same colours,
 * but the engine only mirrors the signal it is given.
 */
/** One slot per Move sequencer step button. */
declare const MOD_SLOTS = 16;
/**
 * The modulation palette, one colour per slot — sixteen hues around the
 * wheel, tuned to sit with the Move's track colours on the dark panel.
 */
declare const MOD_COLORS: string[];
/** A slot's palette colour — the one constant identity it keeps. */
declare const modColor: (index: number) => string;
type ModulationType = 'lfo' | 'envelope' | 'curve' | 'sh' | 'sequencer';
/** Modulator settings — flat and JSON-safe, like TweakStore values. */
type ModulationParams = Record<string, number | boolean | string>;
interface ModulationSlot {
    /** 0..15 — the Move step button that created it, and its palette index. */
    index: number;
    type: ModulationType;
    params: ModulationParams;
    /** External source id (a DSP app's own modulator); null = internal engine. */
    source?: string | null;
}
interface ModulationAssignment {
    panelId: string;
    path: string;
    /** The slot driving this control. */
    slot: number;
    /** Sweep depth 0..1 — at 1 the signal swings the control's full span. */
    amount: number;
}
/**
 * Settings-page control metadata — ControlMeta plus the xy mapping (an xy
 * control on a modulator page edits two scalar params, xParam/yParam, rather
 * than storing an {x, y} object) and the source marker: a select flagged
 * `sourceOptions` lists the ModulationStore's registered audio inputs, and
 * only appears when there is a real choice to make.
 */
type ModControlMeta = ControlMeta & {
    xParam?: string;
    yParam?: string;
    sourceOptions?: boolean;
};
/**
 * Live audio handed to a modulator by the engine: the band level 0..1
 * inside a frequency window — an envelope follower's raw material.
 */
type ModAudioInput = (loHz: number, hiHz: number) => number;
/**
 * One modulator type, pluggable: LFO ships with the kit, the others
 * (envelope, curve, S&H, sequencer) register through the same door.
 * `tick` advances the modulator by `dt` seconds and returns the signal,
 * always -1..1; `state` is whatever `createState` returned — the engine
 * never looks inside it. Types that listen to audio (the envelope follower)
 * read the engine-provided `input`; the others ignore it.
 */
interface ModTypeDef {
    type: ModulationType;
    label: string;
    defaults: ModulationParams;
    /** The settings-page layout, in slot order: dials, toggles, the xy pad. */
    controls: ModControlMeta[];
    createState(): unknown;
    tick(state: unknown, params: ModulationParams, dt: number, bpm: number, input?: ModAudioInput | null): number;
}
/** Plug a modulator type in; registering a type again replaces it. */
declare function registerModType(def: ModTypeDef): void;
declare const getModType: (type: ModulationType) => ModTypeDef | undefined;
/** The registered types, registration order — the settings page's type enum. */
declare const listModTypes: () => ModTypeDef[];
/** The one modulator-settings panel, registered by `ModulationStore.openSettings`. */
declare const MOD_SETTINGS_PANEL = "mod-settings";
/** Assignment map key — panel and path, joined on a character paths can't hold. */
declare const modKey: (panelId: string, path: string) => string;
/**
 * A signal applied to a control: a bipolar sweep around the base value in
 * the control's own units, clamped to its bounds — the control keeps its
 * base, the modulation dances around it.
 */
declare function applyModulation(base: number, signal: number, amount: number, min: number, max: number): number;
/** Tempo-sync divisions, cycle length in beats (4/4 bars down to 1/32). */
declare const LFO_SYNC_DIVISIONS: {
    label: string;
    beats: number;
}[];
/** A synced LFO's frequency: the division's cycle length at this tempo. */
declare function lfoSyncedHz(division: number, bpm: number): number;
/**
 * The LFO: a width-skewed triangle (0.5 symmetric, toward 0/1 a saw either
 * way), phase-offset, with jitter (a random offset renewed each cycle) and
 * smooth (a slew that rounds corners toward sine and softens jitter steps).
 */
declare const LFO_DEF: ModTypeDef;
/** The filter dials' frequency span — the audible band. */
declare const ENV_HZ_MIN = 20;
declare const ENV_HZ_MAX = 20000;
/**
 * A filter dial's position 0..1 → Hz, exponential across the audible band —
 * equal knob travel covers equal musical distance (20·1000^t).
 */
declare const envHz: (t: number) => number;
/**
 * The envelope follower: the band level of an audio input (lo/hi confine it
 * to a frequency window — follow just the kick, just the hiss), through
 * gain, an optional delay, and rise/fall smoothing. The signal is unipolar
 * 0..1: silence rests the control at its base value, level pushes it up to
 * `amount` of the span. Which audio it follows comes from the engine — apps
 * register inputs on the ModulationStore (`registerAudioInput`), and the
 * source select appears once there is more than one to choose from.
 */
declare const ENVELOPE_DEF: ModTypeDef;

export { ENVELOPE_DEF, ENV_HZ_MAX, ENV_HZ_MIN, LFO_DEF, LFO_SYNC_DIVISIONS, MOD_COLORS, MOD_SETTINGS_PANEL, MOD_SLOTS, type ModAudioInput, type ModControlMeta, type ModTypeDef, type ModulationAssignment, type ModulationParams, type ModulationSlot, type ModulationType, applyModulation, envHz, getModType, lfoSyncedHz, listModTypes, modColor, modKey, registerModType };
