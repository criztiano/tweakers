import { TweakStore, ModulationStore, MoveFunctions, type TweakConfig } from 'tweakers';

/**
 * The library's instrument: one page carrying every face a Move slot can
 * wear. It is deliberately longer than the hardware — twenty slots against
 * eight dials — because that is the thing being shown: the strip scrolls,
 * nothing is demoted to a chip, and the eight slots on screen — pads and all
 * — are the eight the knobs are holding.
 *
 * The order is the library's argument: the slots that fit almost any number
 * come first, and the ones that mean exactly one thing come last. Reading
 * left to right you go from "a value" to "a stereo width in semitones".
 */
export const PANEL_ID = 'move-kit';
export const PANEL_NAME = 'Move kit';

/** The shapes the curve picker draws — a sampler per option, 0..1 in and out. */
const SHAPES: Record<string, (t: number) => number> = {
  rise: (t) => t,
  fall: (t) => 1 - t,
  bell: (t) => Math.sin(t * Math.PI),
  ease: (t) => t * t * (3 - 2 * t),
  bounce: (t) => Math.abs(Math.sin(t * Math.PI * 2)) * (1 - t),
};

export const CONFIG = {
  /* ── the everyday dial: a name, a number, a bar ───────────────── */
  amount: { type: 'slider', default: 0.5, min: 0, max: 1, step: 0.01 },
  bias: { type: 'slider', default: 0, min: -1, max: 1, step: 0.01, bipolar: true },
  sweep: { type: 'slider', default: 0, min: 0, max: 1, step: 0.01 },

  /* ── picking one of a few: a glyph, a list, a shape ───────────── */
  direction: {
    type: 'select', default: 'forward',
    options: [
      { value: 'forward', label: 'Forward', icon: 'arrow-right' },
      { value: 'back', label: 'Back', icon: 'arrow-left' },
      { value: 'swing', label: 'Swing', icon: 'arrow-left-right' },
    ],
  },
  scale: {
    type: 'select', default: 'dorian',
    options: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'],
  },
  shape: {
    type: 'select', default: 'bell',
    options: [
      { value: 'rise', label: 'Rise' },
      { value: 'fall', label: 'Fall' },
      { value: 'bell', label: 'Bell' },
      { value: 'ease', label: 'Ease' },
      { value: 'bounce', label: 'Bounce' },
    ],
    preview: (name: string) => SHAPES[name] ?? null,
  },

  /* ── a switch that earned a slot of its own ───────────────────── */
  hold: false,
  /* the same switch, drawn: the picture of the thing it turns on, badged
     with a check while it is on and a ban while it is off */
  loop: { type: 'toggle', default: true, icon: 'repeat' },

  /* ── the small slots: the pad row under the dials. Each one names the
        column it sits in (see MOVE_PADS below), so it travels with the
        slot above it when the wheel moves them both. ──────────────── */
  sync: true,                                                  /* a switch */
  drive: { type: 'slider', default: 42, min: 0, max: 100, step: 1, unit: '%' },
  glide: { type: 'slider', default: 120, min: 0, max: 500, step: 1, unit: ' ms' },
  reset: { type: 'action', label: 'Reset' },                   /* a button */

  /* ── the small slots' own multi-slot control: a mode picker lying across
        the pads, one per option, the current one lit. Named, so the run
        says what it is switching. ─────────────────────────────────── */
  take: {
    type: 'select', default: 'b',
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ],
    moveTabs: 'named',
  },

  /* ── two hands on one control: the knob, and the volume knob ──── */
  band: { type: 'range', min: 0, max: 100, default: { min: 20, max: 80 } },
  spot: {
    type: 'xy',
    x: { min: -1, max: 1, bipolar: true },
    y: { min: 0, max: 10, bipolar: true },
    default: { x: 0, y: 5 },
    returnToCenter: true,
  },

  /* ── values a bar cannot say: a bearing, a colour, a shape ────── */
  heading: { type: 'slider', default: 270, min: 0, max: 360, step: 1, display: 'dial' },
  tint: { type: 'color', default: '#eb644dff', alpha: true },
  ramp: {
    type: 'gradient',
    form: 'ramp',
    default: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#1b2a4aff', position: 0 },
        { color: '#eb644dff', position: 0.55 },
        { color: '#f7e6b0ff', position: 1 },
      ],
    },
  },
  response: {
    type: 'transfer',
    default: { points: [{ x: 0, y: 0 }, { x: 0.45, y: 0.7 }, { x: 1, y: 1 }] },
  },
  tone: {
    type: 'filter',
    cutoff: { min: 20, max: 20000, step: 1, label: 'Freq' },
    resonance: { min: 0, max: 1, step: 0.01, label: 'Res' },
    default: { cutoff: 2400, resonance: 0.4 },
  },

  /* ── one meaning each: the specimens, drawn as what they are ──── */
  opacity: {
    type: 'slider', default: 0.65, min: 0, max: 1, step: 0.01,
    moveVisual: { kind: 'opacity' },
  },
  blur: {
    type: 'slider', default: 3, min: 0, max: 12, step: 0.1, unit: ' px',
    moveVisual: { kind: 'blur' },
  },
  pan: {
    type: 'slider', default: 0, min: -1, max: 1, step: 0.01, bipolar: true,
    moveVisual: { kind: 'pan' },
  },
  width: {
    type: 'slider', default: 1, min: 0, max: 2, step: 0.01, origin: 1, unit: '×',
    moveVisual: { kind: 'stereo-width' },
  },
  pitch: {
    type: 'slider', default: 0, min: -24, max: 24, step: 1, bipolar: true, unit: ' st',
    moveVisual: { kind: 'pitch' },
  },
  playback: {
    type: 'select', default: 'forward',
    options: [
      { value: 'forward', label: 'Forward' },
      { value: 'reverse', label: 'Reverse' },
      { value: 'ping-pong', label: 'Ping-pong' },
      { value: 'scissors', label: 'Scissors' },
    ],
    moveVisual: { kind: 'playback' },
  },
} satisfies TweakConfig;

/**
 * Where each small slot sits, by strip column. A column on a strip is a
 * place in the whole row rather than one of eight, so these pads ride under
 * the slots they belong to: the switch and the value under Amount, the
 * second value under Bias, the button under Shape.
 */
export const MOVE_PADS: Record<string, number> = {
  sync: 0,
  drive: 0,
  glide: 1,
  reset: 5,
  take: 2,          /* a strip: the column its run starts in, four pads wide */
};

/** The values the page was registered with — what the pad-row button puts
 *  back, and the thing a preset is measured against. */
let initialValues: Record<string, unknown> = {};

/** The button on the pad row: put the whole page back where it started. */
function resetTheStrip() {
  // An edit follows the loaded preset, so a reset would otherwise rewrite it.
  TweakStore.clearActivePreset(PANEL_ID);
  TweakStore.updateValues(PANEL_ID, initialValues as Record<string, never>);
}

/** The modulation slots the library runs: an LFO, an envelope, a curve. */
export const MOD_LFO = 0;
export const MOD_ENV = 1;
export const MOD_CURVE = 2;

/**
 * Registers the page, its modulation slots and the Copy button. Called once
 * at start-up; the modulation guards let a reload keep the slots it had.
 */
export function registerLibraryPanel() {
  TweakStore.registerPanel(PANEL_ID, PANEL_NAME, CONFIG, undefined, { movePads: MOVE_PADS });
  initialValues = { ...TweakStore.getValues(PANEL_ID) };

  // An LFO breathing Amount: a pulsing circle in the header, and a ring on
  // the slot whose arc runs from the value to where the modulation holds it.
  if (!ModulationStore.getSlot(MOD_LFO)) {
    ModulationStore.createSlot(MOD_LFO);
    ModulationStore.assign(PANEL_ID, 'amount', MOD_LFO, 0.6);
  }
  // An ADSR on Bias. An envelope rests until something gates it, so the
  // library turns Loop on to let it play its own gate and show the shape.
  if (!ModulationStore.getSlot(MOD_ENV)) {
    ModulationStore.createSlot(MOD_ENV, 'adsr');
    ModulationStore.updateSlotParams(MOD_ENV, { attack: 40, decay: 250, sustain: 0.4, release: 700, loop: true });
    ModulationStore.assign(PANEL_ID, 'bias', MOD_ENV, 0.8);
  }
  // A curve on Sweep: eased clips read once per pass. Tap its circle for the
  // composer, which floats over the panel.
  if (!ModulationStore.getSlot(MOD_CURVE)) {
    ModulationStore.createSlot(MOD_CURVE, 'curve');
    ModulationStore.assign(PANEL_ID, 'sweep', MOD_CURVE, 0.8);
  }

  // The pad-row button. An action's presses arrive on the panel's action
  // channel — the same one the on-screen row fires.
  TweakStore.subscribeActions(PANEL_ID, (path) => {
    if (path === 'reset') resetTheStrip();
  });

  seedPresets();

  // The Move's Copy button puts the whole page on the clipboard.
  MoveFunctions.attach('copy', () => {
    navigator.clipboard?.writeText(JSON.stringify(TweakStore.getValues(PANEL_ID), null, 2)).catch(() => {});
  });
}

/**
 * A few presets to walk through on the wheel. `savePreset` snapshots the
 * page as it stands, so each one is written by setting the values and
 * saving — the same thing the navigator's own save input does.
 *
 * They are deliberately far apart: browsing has to be visible from across
 * the room, and every row you rest on plays live.
 */
const PRESETS: { name: string; values: Record<string, number | string | boolean> }[] = [
  { name: 'Open', values: { amount: 0.5, bias: 0, opacity: 1, blur: 0, pan: 0, width: 1, pitch: 0, heading: 270, scale: 'dorian', playback: 'forward' } },
  { name: 'Smoke', values: { amount: 0.2, bias: -0.6, opacity: 0.35, blur: 9, pan: -0.5, width: 1.6, pitch: -12, heading: 200, scale: 'phrygian', playback: 'reverse' } },
  { name: 'Glass', values: { amount: 0.85, bias: 0.4, opacity: 0.8, blur: 1.5, pan: 0.3, width: 0.4, pitch: 7, heading: 45, scale: 'lydian', playback: 'ping-pong' } },
  { name: 'Ruin', values: { amount: 1, bias: 1, opacity: 0.6, blur: 12, pan: 1, width: 2, pitch: 24, heading: 120, scale: 'locrian', playback: 'scissors' } },
];

function seedPresets() {
  if (TweakStore.getPresets(PANEL_ID).length) return;      /* a reload keeps its own */
  const before = { ...TweakStore.getValues(PANEL_ID) };
  for (const preset of PRESETS) {
    // An edit follows the loaded preset: while one is active, every value
    // written goes into it. Saving leaves the new preset active, so writing
    // the next one would quietly rewrite the last — clear it first.
    TweakStore.clearActivePreset(PANEL_ID);
    for (const [path, value] of Object.entries(preset.values)) {
      TweakStore.updateValue(PANEL_ID, path, value);
    }
    TweakStore.savePreset(PANEL_ID, preset.name);
  }
  // The library opens on the values it was registered with, and on no preset.
  TweakStore.clearActivePreset(PANEL_ID);
  for (const [path, value] of Object.entries(before)) TweakStore.updateValue(PANEL_ID, path, value);
}
