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
var modKey = (panelId, path) => `${panelId}\0${path}`;
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clamp01 = (v) => clamp(Number(v) || 0, 0, 1);
function applyModulation(base, signal, amount, min, max) {
  const offset = clamp(signal, -1, 1) * clamp01(amount) * (max - min) / 2;
  return clamp(base + offset, min, max);
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
export {
  LFO_DEF,
  LFO_SYNC_DIVISIONS,
  MOD_COLORS,
  MOD_SLOTS,
  applyModulation,
  getModType,
  lfoSyncedHz,
  listModTypes,
  modColor,
  modKey,
  registerModType
};
//# sourceMappingURL=modulation-core.js.map