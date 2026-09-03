import type { ControlMeta } from './store/TweakStore';

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
export const MOD_SLOTS = 16;

/**
 * The modulation palette, one colour per slot — sixteen hues around the
 * wheel, tuned to sit with the Move's track colours on the dark panel.
 */
export const MOD_COLORS = [
  '#ff5f45', // 0  coral
  '#ff8a2b', // 1  orange
  '#ffb61e', // 2  amber
  '#f4d942', // 3  yellow
  '#b8e03c', // 4  lime
  '#6fd435', // 5  green
  '#3bcf6d', // 6  emerald
  '#2ed3ab', // 7  teal
  '#33c6e8', // 8  cyan
  '#3d9bff', // 9  azure
  '#5f7bff', // 10 blue
  '#8a6bff', // 11 violet
  '#b45cff', // 12 purple
  '#e04ef0', // 13 magenta
  '#ff4fb0', // 14 pink
  '#ff4f6e', // 15 rose
];

/** A slot's palette colour — the one constant identity it keeps. */
export const modColor = (index: number) =>
  MOD_COLORS[((index % MOD_SLOTS) + MOD_SLOTS) % MOD_SLOTS];

export type ModulationType = 'lfo' | 'adsr' | 'envelope' | 'curve' | 'sh' | 'sequencer';

/** Modulator settings — flat and JSON-safe, like TweakStore values. */
export type ModulationParams = Record<string, number | boolean>;

export interface ModulationSlot {
  /** 0..15 — the Move step button that created it, and its palette index. */
  index: number;
  type: ModulationType;
  params: ModulationParams;
  /** External source id (a DSP app's own modulator); null = internal engine. */
  source?: string | null;
}

export interface ModulationAssignment {
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
export type ModControlMeta = ControlMeta & { xParam?: string; yParam?: string };

/**
 * One modulator type, pluggable: LFO ships with the kit, the others
 * (envelope, curve, S&H, sequencer) register through the same door.
 * `tick` advances the modulator by `dt` seconds and returns the signal,
 * always -1..1; `state` is whatever `createState` returned — the engine
 * never looks inside it.
 */
export interface ModTypeDef {
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

const registry = new Map<ModulationType, ModTypeDef>();

/** Plug a modulator type in; registering a type again replaces it. */
export function registerModType(def: ModTypeDef): void {
  registry.set(def.type, def);
}

export const getModType = (type: ModulationType): ModTypeDef | undefined => registry.get(type);

/** The registered types, registration order — the settings page's type enum. */
export const listModTypes = (): ModTypeDef[] => [...registry.values()];

/** The one modulator-settings panel, registered by `ModulationStore.openSettings`. */
export const MOD_SETTINGS_PANEL = 'mod-settings';

/** Assignment map key — panel and path, joined on a character paths can't hold. */
export const modKey = (panelId: string, path: string) => `${panelId}\u0000${path}`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: unknown) => clamp(Number(v) || 0, 0, 1);

/**
 * A signal applied to a control: a bipolar sweep around the base value in
 * the control's own units, clamped to its bounds — the control keeps its
 * base, the modulation dances around it.
 */
export function applyModulation(
  base: number,
  signal: number,
  amount: number,
  min: number,
  max: number
): number {
  const offset = clamp(signal, -1, 1) * clamp01(amount) * (max - min) / 2;
  return clamp(base + offset, min, max);
}

/* ── the modulation ring ──────────────────────────────────────────────── */

/**
 * The ring a modulated control wears: a dial drawn as an SVG circle of this
 * radius, sweeping a knob's 270° from the bottom-left so a value sits at the
 * angle the control's own dial would point.
 */
export const MOD_RING_RADIUS = 6;
export const MOD_RING_CIRCUMFERENCE = 2 * Math.PI * MOD_RING_RADIUS;

const RING_SWEEP_START = 135 / 360;
const RING_SWEEP_LEN = 270 / 360;

/**
 * The arc between two values (each 0..1 of the control's span), as the dash
 * pattern that draws it: SVG lays a circle's path clockwise from 3 o'clock,
 * so a dash of `length` pushed to `offset` lands exactly on the arc.
 * Feed it base and modulated value and the ring shows where the modulation
 * is holding the control right now.
 */
export function modRingArc(from01: number, to01: number): { length: number; offset: number } {
  const a = RING_SWEEP_START + clamp01(from01) * RING_SWEEP_LEN;
  const b = RING_SWEEP_START + clamp01(to01) * RING_SWEEP_LEN;
  return {
    length: Math.abs(b - a) * MOD_RING_CIRCUMFERENCE,
    offset: -Math.min(a, b) * MOD_RING_CIRCUMFERENCE,
  };
}

/* ── LFO — the kit's built-in modulator type ──────────────────────────── */

/** Tempo-sync divisions, cycle length in beats (4/4 bars down to 1/32). */
export const LFO_SYNC_DIVISIONS = [
  { label: '4', beats: 16 },
  { label: '2', beats: 8 },
  { label: '1', beats: 4 },
  { label: '1/2', beats: 2 },
  { label: '1/4', beats: 1 },
  { label: '1/8', beats: 0.5 },
  { label: '1/16', beats: 0.25 },
  { label: '1/32', beats: 0.125 },
];

/** A synced LFO's frequency: the division's cycle length at this tempo. */
export function lfoSyncedHz(division: number, bpm: number): number {
  const i = clamp(Math.round(Number(division) || 0), 0, LFO_SYNC_DIVISIONS.length - 1);
  return (Number(bpm) || 120) / 60 / LFO_SYNC_DIVISIONS[i].beats;
}

interface LfoState {
  phase: number;
  /** The jitter layer: an offset easing toward a per-cycle random target. */
  drift: number;
  driftTarget: number;
  /** Last output, for the smooth (slew) filter; null until the first tick. */
  out: number | null;
}

/**
 * The LFO: a width-skewed triangle (0.5 symmetric, toward 0/1 a saw either
 * way), phase-offset, with jitter (a random offset renewed each cycle) and
 * smooth (a slew that rounds corners toward sine and softens jitter steps).
 */
export const LFO_DEF: ModTypeDef = {
  type: 'lfo',
  label: 'LFO',
  defaults: { rate: 1, division: 4, phase: 0, width: 0.5, jitter: 0, smooth: 0, sync: false },
  controls: [
    { type: 'slider', path: 'rate', label: 'Rate', min: 0.02, max: 20, step: 0.01, unit: 'Hz' },
    { type: 'toggle', path: 'sync', label: 'Sync' },
    { type: 'slider', path: 'phase', label: 'Phase', min: 0, max: 1, step: 0.01 },
    { type: 'slider', path: 'width', label: 'Width', min: 0, max: 1, step: 0.01 },
    {
      type: 'xy',
      path: 'texture',
      label: 'Texture',
      xParam: 'jitter',
      yParam: 'smooth',
      xAxis: { min: 0, max: 1, step: 0.01, label: 'Jitter' },
      yAxis: { min: 0, max: 1, step: 0.01, label: 'Smooth' },
    },
  ],
  createState: (): LfoState => ({ phase: 0, drift: 0, driftTarget: 0, out: null }),
  tick(state, params, dt, bpm) {
    const s = state as LfoState;
    const hz = params.sync
      ? lfoSyncedHz(Number(params.division) || 0, bpm)
      : Math.max(0, Number(params.rate) || 0);

    const before = s.phase;
    s.phase = (s.phase + dt * hz) % 1;
    // A wrapped cycle draws the next jitter target; drift eases toward it
    // over about a quarter cycle, so jitter reads as wobble, not steps.
    if (s.phase < before) s.driftTarget = (Math.random() * 2 - 1) * clamp01(params.jitter);
    if (!clamp01(params.jitter)) { s.drift = 0; s.driftTarget = 0; }
    else s.drift += (s.driftTarget - s.drift) * Math.min(1, dt * hz * 4);

    const w = clamp(Number(params.width) || 0, 0.01, 0.99);
    const ph = (s.phase + clamp01(params.phase)) % 1;
    const tri = ph < w ? ph / w : 1 - (ph - w) / (1 - w);
    let v = clamp(tri * 2 - 1 + s.drift, -1, 1);

    const smooth = clamp01(params.smooth);
    if (smooth > 0 && s.out !== null) {
      // One-pole slew; tau grows with the square so the low half stays subtle.
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
};

registerModType(LFO_DEF);

/* ── S&H — stepped random, the second built-in type ───────────────────── */

interface ShState {
  /** Seconds left on the current hold; expiring draws the next sample. */
  wait: number;
  /** The held random value, -1..1 before depth. */
  held: number;
  /** Last output, for the smooth (slew) filter; null until the first tick. */
  out: number | null;
}

/**
 * Sample & hold: a new random value at every rate tick, held until the
 * next. Depth scales the throw, offset biases the whole signal, jitter
 * randomizes each hold's length (drunken clock), and smooth is the same
 * slew as the LFO's — at 0 hard steps, up high a wandering drift.
 */
export const SH_DEF: ModTypeDef = {
  type: 'sh',
  label: 'S&H',
  defaults: { rate: 4, depth: 1, offset: 0, jitter: 0, smooth: 0 },
  controls: [
    { type: 'slider', path: 'rate', label: 'Rate', min: 0.1, max: 30, step: 0.01, unit: 'Hz' },
    { type: 'slider', path: 'depth', label: 'Depth', min: 0, max: 1, step: 0.01 },
    { type: 'slider', path: 'offset', label: 'Offset', min: -1, max: 1, step: 0.01 },
    {
      type: 'xy',
      path: 'texture',
      label: 'Texture',
      xParam: 'jitter',
      yParam: 'smooth',
      xAxis: { min: 0, max: 1, step: 0.01, label: 'Jitter' },
      yAxis: { min: 0, max: 1, step: 0.01, label: 'Smooth' },
    },
  ],
  createState: (): ShState => ({ wait: 0, held: 0, out: null }),
  tick(state, params, dt) {
    const s = state as ShState;
    s.wait -= dt;
    if (s.out === null || s.wait <= 0) {
      s.held = Math.random() * 2 - 1;
      // Jitter stretches or shrinks each hold at random, up to ±90%.
      const hz = Math.max(0.01, Number(params.rate) || 0);
      const len = (1 / hz) * (1 + (Math.random() * 2 - 1) * clamp01(params.jitter) * 0.9);
      s.wait = Math.max(0.005, len);
    }

    const offset = clamp(Number(params.offset) || 0, -1, 1);
    let v = clamp(s.held * clamp01(params.depth) + offset, -1, 1);

    const smooth = clamp01(params.smooth);
    if (smooth > 0 && s.out !== null) {
      // One-pole slew; tau grows with the square so the low half stays subtle.
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
};

registerModType(SH_DEF);

/* ── ADSR — the shaped envelope, the third built-in type ──────────────── */

type AdsrStage = 'idle' | 'attack' | 'decay' | 'sustain' | 'release';

interface AdsrState {
  stage: AdsrStage;
  /** Seconds into the current stage. */
  t: number;
  /** The level the stage started from — a retrigger ramps from where it is. */
  from: number;
  /** The signal, 0..1. */
  env: number;
  /** Gate held (note on). Loop mode runs without one. */
  gate: boolean;
}

const secs = (ms: unknown) => Math.max(0, Number(ms) || 0) / 1000;

/** An analog ramp's ease: quick off the mark, tapering into the target. */
const adsrEase = (p: number) => 1 - (1 - p) * (1 - p);

/** A stage's length in seconds; a held sustain never ends on its own. */
function adsrStageLength(stage: AdsrStage, params: ModulationParams): number {
  if (stage === 'attack') return secs(params.attack);
  if (stage === 'decay') return secs(params.decay);
  if (stage === 'release') return secs(params.release);
  return Infinity;
}

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
export const ADSR_DEF: ModTypeDef = {
  type: 'adsr',
  label: 'ADSR',
  defaults: { attack: 10, decay: 300, sustain: 0.6, release: 600, loop: false },
  controls: [
    { type: 'slider', path: 'attack', label: 'Attack', min: 0, max: 2000, step: 1, unit: 'ms' },
    { type: 'slider', path: 'decay', label: 'Decay', min: 0, max: 2000, step: 1, unit: 'ms' },
    { type: 'slider', path: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01 },
    { type: 'slider', path: 'release', label: 'Release', min: 0, max: 4000, step: 1, unit: 'ms' },
    { type: 'toggle', path: 'loop', label: 'Loop' },
  ],
  createState: (): AdsrState => ({ stage: 'idle', t: 0, from: 0, env: 0, gate: false }),
  gate(state, on) {
    const s = state as AdsrState;
    s.gate = on;
    if (on) {
      s.stage = 'attack';
      s.t = 0;
      s.from = s.env;                         // a retrigger climbs from here
    } else if (s.stage !== 'idle') {
      s.stage = 'release';
      s.t = 0;
      s.from = s.env;
    }
  },
  tick(state, params, dt) {
    const s = state as AdsrState;
    const loop = !!params.loop;
    const sustain = clamp01(params.sustain);

    if (s.stage === 'idle') {
      if (!loop) return (s.env = 0);
      s.stage = 'attack';                     // loop mode gates itself
      s.t = 0;
      s.from = 0;
    }

    s.t += dt;
    // Each stage hands its overflow to the next, so a stage shorter than a
    // frame still passes through instead of holding the envelope up.
    for (let guard = 0; guard < 4; guard++) {
      const len = adsrStageLength(s.stage, params);
      if (s.t < len) break;
      s.t -= len;
      if (s.stage === 'attack') {
        s.stage = 'decay';
        s.from = 1;
      } else if (s.stage === 'decay') {
        // The gate holds the sustain; without one, decay falls straight on
        // into the release — an AD shape, and the loop's whole cycle.
        s.stage = s.gate ? 'sustain' : 'release';
        s.from = sustain;
      } else {
        s.stage = loop ? 'attack' : 'idle';   // release ended
        s.from = 0;
      }
    }

    const len = adsrStageLength(s.stage, params);
    const shaped = adsrEase(len > 0 && Number.isFinite(len) ? Math.min(1, s.t / len) : 1);
    if (s.stage === 'attack') s.env = s.from + (1 - s.from) * shaped;
    else if (s.stage === 'decay') s.env = s.from + (sustain - s.from) * shaped;
    else if (s.stage === 'sustain') s.env = sustain;
    else if (s.stage === 'release') s.env = s.from * (1 - shaped);
    else s.env = 0;
    return clamp01(s.env);
  },
};

registerModType(ADSR_DEF);
