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

export type ModulationType = 'lfo' | 'envelope' | 'curve' | 'sh' | 'sequencer';

/** Modulator settings — flat and JSON-safe, like TweakStore values. */
export type ModulationParams = Record<string, number | boolean | string>;

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
 * Settings-page control metadata — ControlMeta plus the xy mapping (an xy
 * control on a modulator page edits two scalar params, xParam/yParam, rather
 * than storing an {x, y} object) and the source marker: a select flagged
 * `sourceOptions` lists the ModulationStore's registered audio inputs, and
 * only appears when there is a real choice to make.
 */
export type ModControlMeta = ControlMeta & {
  xParam?: string;
  yParam?: string;
  sourceOptions?: boolean;
};

/**
 * Live audio handed to a modulator by the engine: the band level 0..1
 * inside a frequency window — an envelope follower's raw material.
 */
export type ModAudioInput = (loHz: number, hiHz: number) => number;

/**
 * One modulator type, pluggable: LFO ships with the kit, the others
 * (envelope, curve, S&H, sequencer) register through the same door.
 * `tick` advances the modulator by `dt` seconds and returns the signal,
 * always -1..1; `state` is whatever `createState` returned — the engine
 * never looks inside it. Types that listen to audio (the envelope follower)
 * read the engine-provided `input`; the others ignore it.
 */
export interface ModTypeDef {
  type: ModulationType;
  label: string;
  defaults: ModulationParams;
  /** The settings-page layout, in slot order: dials, toggles, the xy pad. */
  controls: ModControlMeta[];
  createState(): unknown;
  tick(
    state: unknown,
    params: ModulationParams,
    dt: number,
    bpm: number,
    input?: ModAudioInput | null
  ): number;
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

/* ── Envelope follower — rides the app's audio ────────────────────────── */

/** The filter dials' frequency span — the audible band. */
export const ENV_HZ_MIN = 20;
export const ENV_HZ_MAX = 20000;

/**
 * A filter dial's position 0..1 → Hz, exponential across the audible band —
 * equal knob travel covers equal musical distance (20·1000^t).
 */
export const envHz = (t: number) =>
  ENV_HZ_MIN * Math.pow(ENV_HZ_MAX / ENV_HZ_MIN, clamp01(t));

const fmtHz = (t: number) => {
  const hz = envHz(t);
  return hz >= 1000 ? `${(hz / 1000).toFixed(1)} kHz` : `${Math.round(hz)} Hz`;
};

interface EnvState {
  /** The follower's own clock, the delay line's time base. */
  now: number;
  /** Time-tagged input history — the delay line, trimmed to the delay. */
  line: { t: number; v: number }[];
  /** The followed level 0..1 — the signal itself. */
  env: number;
}

/**
 * The envelope follower: the band level of an audio input (lo/hi confine it
 * to a frequency window — follow just the kick, just the hiss), through
 * gain, an optional delay, and rise/fall smoothing. The signal is unipolar
 * 0..1: silence rests the control at its base value, level pushes it up to
 * `amount` of the span. Which audio it follows comes from the engine — apps
 * register inputs on the ModulationStore (`registerAudioInput`), and the
 * source select appears once there is more than one to choose from.
 */
export const ENVELOPE_DEF: ModTypeDef = {
  type: 'envelope',
  label: 'Envelope',
  defaults: { gain: 0, rise: 20, fall: 250, delay: 0, source: '', lo: 0, hi: 1 },
  controls: [
    { type: 'slider', path: 'gain', label: 'Gain', min: -24, max: 24, step: 0.1, unit: 'dB', bipolar: true },
    { type: 'slider', path: 'rise', label: 'Rise', min: 0, max: 1000, step: 1, unit: 'ms' },
    { type: 'slider', path: 'fall', label: 'Fall', min: 0, max: 2000, step: 1, unit: 'ms' },
    { type: 'slider', path: 'delay', label: 'Delay', min: 0, max: 1000, step: 1, unit: 'ms' },
    { type: 'select', path: 'source', label: 'Source', sourceOptions: true },
    { type: 'slider', path: 'lo', label: 'Lo Cut', min: 0, max: 1, step: 0.01, formatValue: fmtHz },
    { type: 'slider', path: 'hi', label: 'Hi Cut', min: 0, max: 1, step: 0.01, formatValue: fmtHz },
  ],
  createState: (): EnvState => ({ now: 0, line: [], env: 0 }),
  tick(state, params, dt, _bpm, input) {
    const s = state as EnvState;
    s.now += dt;

    // The band window; crossed dials just swap so the window never inverts.
    const lo = clamp01(params.lo);
    const hi = clamp01(params.hi);
    const raw = input ? clamp01(input(envHz(Math.min(lo, hi)), envHz(Math.max(lo, hi)))) : 0;
    const gainDb = clamp(Number(params.gain) || 0, -24, 24);
    const level = clamp01(raw * Math.pow(10, gainDb / 20));

    // The delay line: read `delay` ms behind the head; until history reaches
    // that far back (startup), the follower hears silence.
    const delayS = clamp(Number(params.delay) || 0, 0, 2000) / 1000;
    let target = level;
    if (delayS > 0) {
      s.line.push({ t: s.now, v: level });
      const readAt = s.now - delayS;
      while (s.line.length > 1 && s.line[1].t <= readAt) s.line.shift();
      target = s.line[0].t <= readAt ? s.line[0].v : 0;
    } else if (s.line.length) {
      s.line.length = 0;
    }

    // Rise/fall one-pole, picked by direction; 0 ms is instant.
    const tauS = Math.max(0, Number(target > s.env ? params.rise : params.fall) || 0) / 1000;
    const k = tauS > 0 ? 1 - Math.exp(-dt / tauS) : 1;
    s.env = clamp01(s.env + (target - s.env) * k);
    return s.env;
  },
};

registerModType(ENVELOPE_DEF);
