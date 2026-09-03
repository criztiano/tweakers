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
type ModulationType = 'lfo' | 'adsr' | 'envelope' | 'curve' | 'sh' | 'sequencer';
/** Modulator settings — flat and JSON-safe, like TweakStore values. */
type ModulationParams = Record<string, number | boolean>;
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
 * Settings-page control metadata — ControlMeta plus the xy mapping: an xy
 * control on a modulator page edits two scalar params (xParam/yParam)
 * rather than storing an {x, y} object.
 */
type ModControlMeta = ControlMeta & {
    xParam?: string;
    yParam?: string;
};
/**
 * One modulator type, pluggable: LFO ships with the kit, the others
 * (envelope, curve, S&H, sequencer) register through the same door.
 * `tick` advances the modulator by `dt` seconds and returns the signal,
 * always -1..1; `state` is whatever `createState` returned — the engine
 * never looks inside it.
 */
interface ModTypeDef {
    type: ModulationType;
    label: string;
    defaults: ModulationParams;
    /** The settings-page layout, in slot order: dials, toggles, the xy pad. */
    controls: ModControlMeta[];
    createState(): unknown;
    tick(state: unknown, params: ModulationParams, dt: number, bpm: number): number;
    /**
     * Note on / note off, for the types that take a gate (the ADSR). The
     * store's `gate(slot, on)` lands here; free-running types (LFO, S&H)
     * leave it out and the store ignores the call.
     */
    gate?(state: unknown, on: boolean): void;
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
/**
 * The ring a modulated control wears: a dial drawn as an SVG circle of this
 * radius, sweeping a knob's 270° from the bottom-left so a value sits at the
 * angle the control's own dial would point.
 */
declare const MOD_RING_RADIUS = 6;
declare const MOD_RING_CIRCUMFERENCE: number;
/**
 * The arc between two values (each 0..1 of the control's span), as the dash
 * pattern that draws it: SVG lays a circle's path clockwise from 3 o'clock,
 * so a dash of `length` pushed to `offset` lands exactly on the arc.
 * Feed it base and modulated value and the ring shows where the modulation
 * is holding the control right now.
 */
declare function modRingArc(from01: number, to01: number): {
    length: number;
    offset: number;
};
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
/**
 * Sample & hold: a new random value at every rate tick, held until the
 * next. Depth scales the throw, offset biases the whole signal, jitter
 * randomizes each hold's length (drunken clock), and smooth is the same
 * slew as the LFO's — at 0 hard steps, up high a wandering drift.
 */
declare const SH_DEF: ModTypeDef;
/**
 * The ADSR: attack up to full, decay down to the sustain level, sustain
 * held while the gate is on, release back to rest. The signal is unipolar
 * 0..1 — at rest the control sits on its base value, and the envelope
 * lifts it up to `amount` of the span.
 *
 * A gate drives it — `ModulationStore.gate(slot, on)`, from a note, a pad,
 * a hardware step — and a fresh slot rests at zero until the host sends
 * one. That is the shape an app integrates against; a DSP app whose own
 * envelope already runs at audio rate points the slot at a source instead
 * and the kit just shows the signal.
 *
 * Loop is the exception, for demos and for prototyping with no host: with
 * it on the envelope plays its own gate, running attack → decay → release
 * over and over.
 */
declare const ADSR_DEF: ModTypeDef;

export { ADSR_DEF, LFO_DEF, LFO_SYNC_DIVISIONS, MOD_COLORS, MOD_RING_CIRCUMFERENCE, MOD_RING_RADIUS, MOD_SETTINGS_PANEL, MOD_SLOTS, type ModControlMeta, type ModTypeDef, type ModulationAssignment, type ModulationParams, type ModulationSlot, type ModulationType, SH_DEF, applyModulation, getModType, lfoSyncedHz, listModTypes, modColor, modKey, modRingArc, registerModType };
