// src/modulation-core.ts
var MOD_SLOTS = 16;
var MOD_COLORS = [
  "#ff5f45",
  // 0  coral
  "#ff8a2b",
  // 1  orange
  "#ffb61e",
  // 2  amber
  "#f4d942",
  // 3  yellow
  "#b8e03c",
  // 4  lime
  "#6fd435",
  // 5  green
  "#3bcf6d",
  // 6  emerald
  "#2ed3ab",
  // 7  teal
  "#33c6e8",
  // 8  cyan
  "#3d9bff",
  // 9  azure
  "#5f7bff",
  // 10 blue
  "#8a6bff",
  // 11 violet
  "#b45cff",
  // 12 purple
  "#e04ef0",
  // 13 magenta
  "#ff4fb0",
  // 14 pink
  "#ff4f6e"
  // 15 rose
];
var modColor = (index) => MOD_COLORS[(index % MOD_SLOTS + MOD_SLOTS) % MOD_SLOTS];
var registry = /* @__PURE__ */ new Map();
function registerModType(def) {
  registry.set(def.type, def);
}
var getModType = (type) => registry.get(type);
var listModTypes = () => [...registry.values()];
var MOD_SETTINGS_PANEL = "mod-settings";
var modKey = (panelId, path) => `${panelId}\0${path}`;
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clamp01 = (v) => clamp(Number(v) || 0, 0, 1);
function applyModulation(base, signal, amount, min, max) {
  const offset = clamp(signal, -1, 1) * clamp01(amount) * (max - min) / 2;
  return clamp(base + offset, min, max);
}
var MOD_RING_RADIUS = 6;
var MOD_RING_CIRCUMFERENCE = 2 * Math.PI * MOD_RING_RADIUS;
var RING_SWEEP_START = 135 / 360;
var RING_SWEEP_LEN = 270 / 360;
function modRingArc(from01, to01) {
  const a = RING_SWEEP_START + clamp01(from01) * RING_SWEEP_LEN;
  const b = RING_SWEEP_START + clamp01(to01) * RING_SWEEP_LEN;
  return {
    length: Math.abs(b - a) * MOD_RING_CIRCUMFERENCE,
    offset: -Math.min(a, b) * MOD_RING_CIRCUMFERENCE
  };
}
var LFO_SYNC_DIVISIONS = [
  { label: "4", beats: 16 },
  { label: "2", beats: 8 },
  { label: "1", beats: 4 },
  { label: "1/2", beats: 2 },
  { label: "1/4", beats: 1 },
  { label: "1/8", beats: 0.5 },
  { label: "1/16", beats: 0.25 },
  { label: "1/32", beats: 0.125 }
];
function lfoSyncedHz(division, bpm) {
  const i = clamp(Math.round(Number(division) || 0), 0, LFO_SYNC_DIVISIONS.length - 1);
  return (Number(bpm) || 120) / 60 / LFO_SYNC_DIVISIONS[i].beats;
}
var LFO_DEF = {
  type: "lfo",
  label: "LFO",
  defaults: { rate: 1, division: 4, phase: 0, width: 0.5, jitter: 0, smooth: 0, sync: false },
  controls: [
    { type: "slider", path: "rate", label: "Rate", min: 0.02, max: 20, step: 0.01, unit: "Hz" },
    { type: "toggle", path: "sync", label: "Sync" },
    { type: "slider", path: "phase", label: "Phase", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "width", label: "Width", min: 0, max: 1, step: 0.01 },
    {
      type: "xy",
      path: "texture",
      label: "Texture",
      xParam: "jitter",
      yParam: "smooth",
      xAxis: { min: 0, max: 1, step: 0.01, label: "Jitter" },
      yAxis: { min: 0, max: 1, step: 0.01, label: "Smooth" }
    }
  ],
  createState: () => ({ phase: 0, drift: 0, driftTarget: 0, out: null }),
  tick(state, params, dt, bpm) {
    const s = state;
    const hz = params.sync ? lfoSyncedHz(Number(params.division) || 0, bpm) : Math.max(0, Number(params.rate) || 0);
    const before = s.phase;
    s.phase = (s.phase + dt * hz) % 1;
    if (s.phase < before) s.driftTarget = (Math.random() * 2 - 1) * clamp01(params.jitter);
    if (!clamp01(params.jitter)) {
      s.drift = 0;
      s.driftTarget = 0;
    } else s.drift += (s.driftTarget - s.drift) * Math.min(1, dt * hz * 4);
    const w = clamp(Number(params.width) || 0, 0.01, 0.99);
    const ph = (s.phase + clamp01(params.phase)) % 1;
    const tri = ph < w ? ph / w : 1 - (ph - w) / (1 - w);
    let v = clamp(tri * 2 - 1 + s.drift, -1, 1);
    const smooth = clamp01(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  }
};
registerModType(LFO_DEF);
var SH_DEF = {
  type: "sh",
  label: "S&H",
  defaults: { rate: 4, depth: 1, offset: 0, jitter: 0, smooth: 0 },
  controls: [
    { type: "slider", path: "rate", label: "Rate", min: 0.1, max: 30, step: 0.01, unit: "Hz" },
    { type: "slider", path: "depth", label: "Depth", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "offset", label: "Offset", min: -1, max: 1, step: 0.01 },
    {
      type: "xy",
      path: "texture",
      label: "Texture",
      xParam: "jitter",
      yParam: "smooth",
      xAxis: { min: 0, max: 1, step: 0.01, label: "Jitter" },
      yAxis: { min: 0, max: 1, step: 0.01, label: "Smooth" }
    }
  ],
  createState: () => ({ wait: 0, held: 0, out: null }),
  tick(state, params, dt) {
    const s = state;
    s.wait -= dt;
    if (s.out === null || s.wait <= 0) {
      s.held = Math.random() * 2 - 1;
      const hz = Math.max(0.01, Number(params.rate) || 0);
      const len = 1 / hz * (1 + (Math.random() * 2 - 1) * clamp01(params.jitter) * 0.9);
      s.wait = Math.max(5e-3, len);
    }
    const offset = clamp(Number(params.offset) || 0, -1, 1);
    let v = clamp(s.held * clamp01(params.depth) + offset, -1, 1);
    const smooth = clamp01(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  }
};
registerModType(SH_DEF);
var secs = (ms) => Math.max(0, Number(ms) || 0) / 1e3;
var adsrEase = (p) => 1 - (1 - p) * (1 - p);
function adsrStageLength(stage, params) {
  if (stage === "attack") return secs(params.attack);
  if (stage === "decay") return secs(params.decay);
  if (stage === "release") return secs(params.release);
  return Infinity;
}
var ADSR_DEF = {
  type: "adsr",
  label: "ADSR",
  defaults: { attack: 10, decay: 300, sustain: 0.6, release: 600, loop: false },
  controls: [
    { type: "slider", path: "attack", label: "Attack", min: 0, max: 2e3, step: 1, unit: "ms" },
    { type: "slider", path: "decay", label: "Decay", min: 0, max: 2e3, step: 1, unit: "ms" },
    { type: "slider", path: "sustain", label: "Sustain", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "release", label: "Release", min: 0, max: 4e3, step: 1, unit: "ms" },
    { type: "toggle", path: "loop", label: "Loop" }
  ],
  createState: () => ({ stage: "idle", t: 0, from: 0, env: 0, gate: false }),
  gate(state, on) {
    const s = state;
    s.gate = on;
    if (on) {
      s.stage = "attack";
      s.t = 0;
      s.from = s.env;
    } else if (s.stage !== "idle") {
      s.stage = "release";
      s.t = 0;
      s.from = s.env;
    }
  },
  tick(state, params, dt) {
    const s = state;
    const loop = !!params.loop;
    const sustain = clamp01(params.sustain);
    if (s.stage === "idle") {
      if (!loop) return s.env = 0;
      s.stage = "attack";
      s.t = 0;
      s.from = 0;
    }
    s.t += dt;
    for (let guard = 0; guard < 4; guard++) {
      const len2 = adsrStageLength(s.stage, params);
      if (s.t < len2) break;
      s.t -= len2;
      if (s.stage === "attack") {
        s.stage = "decay";
        s.from = 1;
      } else if (s.stage === "decay") {
        s.stage = s.gate ? "sustain" : "release";
        s.from = sustain;
      } else {
        s.stage = loop ? "attack" : "idle";
        s.from = 0;
      }
    }
    const len = adsrStageLength(s.stage, params);
    const shaped = adsrEase(len > 0 && Number.isFinite(len) ? Math.min(1, s.t / len) : 1);
    if (s.stage === "attack") s.env = s.from + (1 - s.from) * shaped;
    else if (s.stage === "decay") s.env = s.from + (sustain - s.from) * shaped;
    else if (s.stage === "sustain") s.env = sustain;
    else if (s.stage === "release") s.env = s.from * (1 - shaped);
    else s.env = 0;
    return clamp01(s.env);
  }
};
registerModType(ADSR_DEF);
var ENV_HZ_MIN = 20;
var ENV_HZ_MAX = 2e4;
var envHz = (t) => ENV_HZ_MIN * Math.pow(ENV_HZ_MAX / ENV_HZ_MIN, clamp01(t));
var fmtHz = (t) => {
  const hz = envHz(t);
  return hz >= 1e3 ? `${(hz / 1e3).toFixed(1)} kHz` : `${Math.round(hz)} Hz`;
};
var ENVELOPE_DEF = {
  type: "envelope",
  label: "Envelope",
  defaults: { gain: 0, rise: 20, fall: 250, delay: 0, source: "", lo: 0, hi: 1 },
  controls: [
    { type: "slider", path: "gain", label: "Gain", min: -24, max: 24, step: 0.1, unit: "dB", bipolar: true },
    { type: "slider", path: "rise", label: "Rise", min: 0, max: 1e3, step: 1, unit: "ms" },
    { type: "slider", path: "fall", label: "Fall", min: 0, max: 2e3, step: 1, unit: "ms" },
    { type: "slider", path: "delay", label: "Delay", min: 0, max: 1e3, step: 1, unit: "ms" },
    { type: "select", path: "source", label: "Source", sourceOptions: true },
    { type: "slider", path: "lo", label: "Lo Cut", min: 0, max: 1, step: 0.01, formatValue: fmtHz },
    { type: "slider", path: "hi", label: "Hi Cut", min: 0, max: 1, step: 0.01, formatValue: fmtHz }
  ],
  createState: () => ({ now: 0, line: [], env: 0 }),
  tick(state, params, dt, _bpm, input) {
    const s = state;
    s.now += dt;
    const lo = clamp01(params.lo);
    const hi = clamp01(params.hi);
    const raw = input ? clamp01(input(envHz(Math.min(lo, hi)), envHz(Math.max(lo, hi)))) : 0;
    const gainDb = clamp(Number(params.gain) || 0, -24, 24);
    const level = clamp01(raw * Math.pow(10, gainDb / 20));
    const delayS = clamp(Number(params.delay) || 0, 0, 2e3) / 1e3;
    let target = level;
    if (delayS > 0) {
      s.line.push({ t: s.now, v: level });
      const readAt = s.now - delayS;
      while (s.line.length > 1 && s.line[1].t <= readAt) s.line.shift();
      target = s.line[0].t <= readAt ? s.line[0].v : 0;
    } else if (s.line.length) {
      s.line.length = 0;
    }
    const tauS = Math.max(0, Number(target > s.env ? params.rise : params.fall) || 0) / 1e3;
    const k = tauS > 0 ? 1 - Math.exp(-dt / tauS) : 1;
    s.env = clamp01(s.env + (target - s.env) * k);
    return s.env;
  }
};
registerModType(ENVELOPE_DEF);
export {
  ADSR_DEF,
  ENVELOPE_DEF,
  ENV_HZ_MAX,
  ENV_HZ_MIN,
  LFO_DEF,
  LFO_SYNC_DIVISIONS,
  MOD_COLORS,
  MOD_RING_CIRCUMFERENCE,
  MOD_RING_RADIUS,
  MOD_SETTINGS_PANEL,
  MOD_SLOTS,
  SH_DEF,
  applyModulation,
  envHz,
  getModType,
  lfoSyncedHz,
  listModTypes,
  modColor,
  modKey,
  modRingArc,
  registerModType
};
//# sourceMappingURL=modulation-core.js.map