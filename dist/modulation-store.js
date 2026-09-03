// src/store/ModulationStore.ts
import { TweakStore } from "tweakers/store";

// src/store/persist.ts
var STORAGE_VERSION = "v1";
function resolvePersistTarget(kind, id, persist) {
  if (!persist) return null;
  const config = persist === true ? {} : persist;
  const base = config.key ?? id;
  if (!base) return null;
  return {
    key: `tweakers:${STORAGE_VERSION}:${kind}:${base}`,
    storage: config.storage ?? "localStorage"
  };
}
function getStorage(name) {
  try {
    if (typeof window === "undefined") return null;
    return name === "sessionStorage" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}
function loadPersisted(target) {
  if (!target) return null;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return null;
    const raw = storage.getItem(target.key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function savePersisted(target, value) {
  if (!target) return;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return;
    storage.setItem(target.key, JSON.stringify(value));
  } catch {
  }
}
function clearPersisted(target) {
  if (!target) return;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return;
    storage.removeItem(target.key);
  } catch {
  }
}

// src/modulation-core.ts
var MOD_SLOTS = 16;
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

// src/analyser-core.ts
function byteFreqToUnit(v) {
  return v / 255;
}
function hzWindowToBins(rangeHz, nyquistHz, bins) {
  const [loHz, hiHz] = rangeHz;
  if (!Number.isFinite(loHz) || !Number.isFinite(hiHz) || !(nyquistHz > 0) || bins <= 2) return null;
  if (!(hiHz > loHz) || hiHz <= 0) return null;
  const toBin = (hz) => hz / nyquistHz * bins;
  const loBin = Math.max(1, Math.min(bins - 1, toBin(Math.max(0, loHz))));
  const hiBin = Math.max(loBin + 1, Math.min(bins, toBin(hiHz)));
  return { loBin, hiBin };
}
var SPRING_MAX_STEP = 1 / 240;

// src/store/ModulationStore.ts
var MOD_TOUCH_GRACE_MS = 4e3;
var PERSIST_TARGET = resolvePersistTarget("modulation", "global", true);
var clamp2 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var ModulationStoreClass = class {
  constructor() {
    this.slots = Array(MOD_SLOTS).fill(null);
    this.assignments = /* @__PURE__ */ new Map();
    this.states = /* @__PURE__ */ new Map();
    this.signals = Array(MOD_SLOTS).fill(0);
    this.sources = /* @__PURE__ */ new Map();
    this.sourceValues = /* @__PURE__ */ new Map();
    this.audioInputs = /* @__PURE__ */ new Map();
    /** Reused per-input spectrum buffers — one read per input per tick. */
    this.freqData = /* @__PURE__ */ new Map();
    this.metas = /* @__PURE__ */ new Map();
    this.bpm = 120;
    this.touched = null;
    this.settingsIndex = null;
    this.settingsUnsub = null;
    this.applyingSettings = false;
    this.structListeners = /* @__PURE__ */ new Set();
    this.frameListeners = /* @__PURE__ */ new Set();
    this.version = 0;
    this.rafId = null;
    this.lastTick = 0;
    this.loop = (now) => {
      this.tick(Math.max(0, (now - this.lastTick) / 1e3));
      this.lastTick = now;
      this.rafId = this.slots.some(Boolean) ? window.requestAnimationFrame(this.loop) : null;
    };
    const saved = loadPersisted(PERSIST_TARGET);
    if (saved) {
      for (const slot of saved.slots ?? []) {
        const i = Math.round(Number(slot?.index));
        if (i >= 0 && i < MOD_SLOTS && slot.type && slot.params) {
          this.slots[i] = { ...slot, index: i, params: { ...slot.params } };
        }
      }
      for (const a of saved.assignments ?? []) {
        if (a?.panelId && a.path && this.slots[a.slot]) {
          this.assignments.set(modKey(a.panelId, a.path), { ...a });
        }
      }
    }
    TweakStore.subscribeGlobal(() => this.metas.clear());
    this.ensureLoop();
  }
  /* ── slots ────────────────────────────────────────────────────────── */
  /** Create a modulation in a step's slot; an occupied slot is returned as-is. */
  createSlot(index, type = "lfo") {
    if (!Number.isInteger(index) || index < 0 || index >= MOD_SLOTS) return null;
    const existing = this.slots[index];
    if (existing) return existing;
    const def = getModType(type);
    if (!def) {
      console.warn(`[tweakers] modulator type "${type}" is not registered`);
      return null;
    }
    const slot = { index, type, params: { ...def.defaults } };
    this.slots[index] = slot;
    this.states.set(index, def.createState());
    this.changed();
    this.ensureLoop();
    return slot;
  }
  getSlot(index) {
    return this.slots[index] ?? null;
  }
  /** The occupied slots, index order — the track row's circles. */
  getSlots() {
    return this.slots.filter((s) => s !== null);
  }
  updateSlotParams(index, patch) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.params = { ...slot.params, ...patch };
    this.changed();
  }
  /** Switch a slot's modulator type — fresh defaults, fresh state. */
  setSlotType(index, type) {
    const slot = this.slots[index];
    const def = getModType(type);
    if (!slot || !def) return;
    slot.type = type;
    slot.params = { ...def.defaults };
    this.states.set(index, def.createState());
    this.changed();
  }
  /** Point a slot at an external source (null returns it to the engine). */
  setSlotSource(index, sourceId) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.source = sourceId;
    this.changed();
  }
  /** Remove a slot's modulation and every assignment wired to it. */
  removeSlot(index) {
    if (!this.slots[index]) return;
    if (this.settingsIndex === index) this.closeSettings();
    this.slots[index] = null;
    this.states.delete(index);
    this.signals[index] = 0;
    for (const [key, a] of this.assignments) {
      if (a.slot === index) this.assignments.delete(key);
    }
    this.changed();
  }
  /* ── assignments ──────────────────────────────────────────────────── */
  /**
   * Wire a control to a slot. Only bounded numeric controls (slider, number
   * with min/max) can be modulated; anything else is refused. A control not
   * yet registered is accepted on trust and resolves when its panel appears.
   */
  assign(panelId, path, slot, amount = 0.5) {
    if (!this.slots[slot]) return false;
    if (panelId === MOD_SETTINGS_PANEL) return false;
    if (TweakStore.getPanel(panelId) && !this.resolveMeta(panelId, path)) {
      console.warn(`[tweakers] "${path}" is not a bounded numeric control; it cannot take a modulation`);
      return false;
    }
    this.assignments.set(modKey(panelId, path), {
      panelId,
      path,
      slot,
      amount: clamp2(Number(amount) || 0, 0, 1)
    });
    this.changed();
    return true;
  }
  unassign(panelId, path) {
    if (this.assignments.delete(modKey(panelId, path))) this.changed();
  }
  getAssignment(panelId, path) {
    return this.assignments.get(modKey(panelId, path));
  }
  getAssignments() {
    return [...this.assignments.values()];
  }
  assignmentsForSlot(index) {
    return this.getAssignments().filter((a) => a.slot === index);
  }
  setAmount(panelId, path, amount) {
    const a = this.assignments.get(modKey(panelId, path));
    if (!a) return;
    a.amount = clamp2(Number(amount) || 0, 0, 1);
    this.changed();
  }
  /* ── the assignment gesture ───────────────────────────────────────── */
  /** A finger on a control — panel pointer, hardware knob. Arms assignment. */
  noteTouch(panelId, path) {
    this.touched = { panelId, path, at: Date.now() };
  }
  /**
   * A step-button press (hardware step or on-screen circle): with a control
   * armed, create the slot's modulation if needed and toggle the control
   * onto it. Returns what happened, for lights and readouts.
   */
  assignFromStep(index) {
    const t = this.touched;
    const armed = t && Date.now() - t.at < MOD_TOUCH_GRACE_MS;
    if (!armed) return { action: "none", slot: this.getSlot(index) };
    const existing = this.assignments.get(modKey(t.panelId, t.path));
    if (this.slots[index] && existing?.slot === index) {
      this.unassign(t.panelId, t.path);
      return { action: "unassigned", slot: this.getSlot(index) };
    }
    const created = !this.slots[index];
    const slot = this.createSlot(index);
    if (!slot) return { action: "none", slot: null };
    if (!this.assign(t.panelId, t.path, index)) {
      if (created) this.removeSlot(index);
      return { action: "none", slot: this.getSlot(index) };
    }
    return { action: created ? "created" : "assigned", slot };
  }
  /* ── the settings page ────────────────────────────────────────────── */
  /**
   * Open a slot's settings (hold its step button): registers one hidden
   * TweakStore panel (`mod-settings`, kind 'modulation') built from the
   * modulator's own control list, with the type enum ahead of it. Every
   * edit on that panel — screen or hardware, the kit syncs it like any
   * page — flows back into the slot's params. Returns the panel id.
   */
  openSettings(index) {
    const slot = this.slots[index];
    const def = slot && getModType(slot.type);
    if (!slot || !def) return null;
    this.closeSettings();
    this.settingsIndex = index;
    this.registerSettingsPanel(slot, def);
    this.settingsUnsub = TweakStore.subscribe(MOD_SETTINGS_PANEL, () => this.onSettingsChange());
    this.changed();
    return MOD_SETTINGS_PANEL;
  }
  closeSettings() {
    if (this.settingsIndex === null) return;
    this.settingsUnsub?.();
    this.settingsUnsub = null;
    this.settingsIndex = null;
    TweakStore.unregisterPanel(MOD_SETTINGS_PANEL);
    this.changed();
  }
  /** The open settings page, or null — the panel to render as the Move page. */
  getSettings() {
    return this.settingsIndex === null ? null : { index: this.settingsIndex, panelId: MOD_SETTINGS_PANEL };
  }
  registerSettingsPanel(slot, def) {
    const config = {
      type: {
        type: "select",
        options: listModTypes().map((d) => ({ value: d.type, label: d.label })),
        default: slot.type
      }
    };
    for (const c of def.controls) {
      if (c.type === "slider") {
        config[c.path] = {
          type: "slider",
          min: c.min ?? 0,
          max: c.max ?? 1,
          step: c.step,
          unit: c.unit,
          formatValue: c.formatValue,
          bipolar: c.bipolar,
          default: Number(slot.params[c.path]) || 0
        };
      } else if (c.type === "select" && c.sourceOptions) {
        const inputs = this.getAudioInputs();
        if (inputs.length < 2) continue;
        const current = slot.params[c.path];
        config[c.path] = {
          type: "select",
          options: inputs,
          default: typeof current === "string" && inputs.includes(current) ? current : inputs[0]
        };
      } else if (c.type === "toggle") {
        config[c.path] = !!slot.params[c.path];
      } else if (c.type === "xy" && c.xParam && c.yParam) {
        config[c.path] = {
          type: "xy",
          x: c.xAxis,
          y: c.yAxis,
          default: { x: Number(slot.params[c.xParam]) || 0, y: Number(slot.params[c.yParam]) || 0 }
        };
      }
    }
    this.applyingSettings = true;
    TweakStore.registerPanel(
      MOD_SETTINGS_PANEL,
      `${def.label} ${slot.index + 1}`,
      config,
      void 0,
      { kind: "modulation" }
    );
    this.applyingSettings = false;
  }
  /** Rebuild the open settings page in place — the source select tracks the inputs. */
  refreshSettingsPanel() {
    if (this.settingsIndex === null) return;
    const slot = this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    if (slot && def) this.registerSettingsPanel(slot, def);
  }
  /** A settings-panel edit — screen or hardware — lands in the slot's params. */
  onSettingsChange() {
    if (this.applyingSettings || this.settingsIndex === null) return;
    const slot = this.slots[this.settingsIndex];
    if (!slot) return;
    const values = TweakStore.getValues(MOD_SETTINGS_PANEL);
    const nextType = values.type;
    if (nextType && nextType !== slot.type && getModType(nextType)) {
      this.setSlotType(slot.index, nextType);
      this.registerSettingsPanel(this.slots[slot.index], getModType(nextType));
      return;
    }
    const def = getModType(slot.type);
    if (!def) return;
    const patch = {};
    for (const c of def.controls) {
      const v = values[c.path];
      if (c.type === "xy" && c.xParam && c.yParam) {
        const xy = v;
        if (xy && typeof xy === "object") {
          patch[c.xParam] = Number(xy.x) || 0;
          patch[c.yParam] = Number(xy.y) || 0;
        }
      } else if (c.type === "select") {
        if (typeof v === "string") patch[c.path] = v;
      } else if (c.type === "toggle") {
        patch[c.path] = !!v;
      } else if (typeof v === "number" && Number.isFinite(v)) {
        patch[c.path] = v;
      }
    }
    this.updateSlotParams(slot.index, patch);
  }
  /* ── external sources ─────────────────────────────────────────────── */
  /** Offer an app-side modulator to the slots; returns an unregister fn. */
  registerSource(id, config = {}) {
    this.sources.set(id, config);
    this.changed();
    return () => {
      if (this.sources.get(id) === config) {
        this.sources.delete(id);
        this.sourceValues.delete(id);
        this.changed();
      }
    };
  }
  /** Push a source's signal (-1..1) at any rate; the engine mirrors the latest. */
  setSourceValue(id, value) {
    this.sourceValues.set(id, clamp2(Number(value) || 0, -1, 1));
  }
  getSources() {
    return [...this.sources.keys()];
  }
  /* ── audio inputs — what the envelope follower hears ──────────────── */
  /**
   * Hand over live audio as a named input: an AnalyserNode getter, read at
   * frame time (a getter, so the node can exist only after the app's audio
   * starts on a user gesture). Returns an unregister fn. Registering while
   * a follower's settings page is open refreshes its source select.
   */
  registerAudioInput(id, get) {
    this.audioInputs.set(id, get);
    this.refreshSettingsPanel();
    this.changed();
    return () => {
      if (this.audioInputs.get(id) === get) {
        this.audioInputs.delete(id);
        this.freqData.delete(id);
        this.refreshSettingsPanel();
        this.changed();
      }
    };
  }
  getAudioInputs() {
    return [...this.audioInputs.keys()];
  }
  /**
   * The band sampler served to a slot's modulator: its chosen source when
   * that input is registered, else the first registered input, else null
   * (the follower hears silence). Levels are the band's spectral peak —
   * the same reduction the analyser visualizer draws.
   */
  audioInputFor(slot) {
    const chosen = typeof slot.params.source === "string" ? slot.params.source : "";
    const id = this.audioInputs.has(chosen) ? chosen : this.getAudioInputs()[0];
    if (id === void 0) return null;
    const analyser = this.audioInputs.get(id)?.();
    if (!analyser) return null;
    return (loHz, hiHz) => {
      const bins = analyser.frequencyBinCount;
      if (!bins) return 0;
      let data = this.freqData.get(id);
      if (!data || data.length !== bins) {
        data = new Uint8Array(bins);
        this.freqData.set(id, data);
      }
      analyser.getByteFrequencyData(data);
      const nyquist = (analyser.context?.sampleRate ?? 44100) / 2;
      const w = hzWindowToBins([loHz, hiHz], nyquist, bins);
      const start = w ? Math.floor(w.loBin) : 1;
      const end = Math.min(bins, w ? Math.ceil(w.hiBin) : bins);
      let mx = 0;
      for (let b = start; b < end; b++) {
        if (data[b] > mx) mx = data[b];
      }
      return byteFreqToUnit(mx);
    };
  }
  /* ── tempo ────────────────────────────────────────────────────────── */
  setTempo(bpm) {
    const next = clamp2(Number(bpm) || 0, 20, 999);
    if (next === this.bpm) return;
    this.bpm = next;
    this.changed();
  }
  getTempo() {
    return this.bpm;
  }
  /* ── reading the modulated layer ──────────────────────────────────── */
  /** A slot's live signal, -1..1. */
  getSignal(index) {
    return this.signals[index] ?? 0;
  }
  /** The modulation's contribution to one control, in the control's units. */
  getOffset(panelId, path) {
    const a = this.assignments.get(modKey(panelId, path));
    if (!a) return 0;
    const slot = this.slots[a.slot];
    if (!slot) return 0;
    if (slot.source && !this.sources.get(slot.source)?.applies) return 0;
    const meta = this.resolveMeta(panelId, path);
    if (!meta) return 0;
    const base = Number(TweakStore.getValue(panelId, path));
    if (!Number.isFinite(base)) return 0;
    return applyModulation(base, this.signals[a.slot], a.amount, meta.min, meta.max) - base;
  }
  /** One control's value with its modulation applied — the frame-time read. */
  getValue(panelId, path) {
    const base = Number(TweakStore.getValue(panelId, path));
    return base + this.getOffset(panelId, path);
  }
  /**
   * A panel's values with every modulation applied — a fresh snapshot per
   * call, meant to be pulled once per frame in place of `TweakStore.getValues`.
   */
  getValues(panelId) {
    const out = { ...TweakStore.getValues(panelId) };
    for (const a of this.assignments.values()) {
      if (a.panelId !== panelId) continue;
      const offset = this.getOffset(panelId, a.path);
      if (offset !== 0) out[a.path] = Number(out[a.path]) + offset;
    }
    return out;
  }
  /* ── subscriptions ────────────────────────────────────────────────── */
  /** Structural changes: slots, assignments, sources, tempo. */
  subscribe(listener) {
    this.structListeners.add(listener);
    return () => this.structListeners.delete(listener);
  }
  /** Every engine frame — for pulsing circles, dots, and step lights. */
  subscribeFrames(listener) {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }
  /** Bumped on every structural change — a stable snapshot for UI stores. */
  getVersion() {
    return this.version;
  }
  /* ── the engine ───────────────────────────────────────────────────── */
  /**
   * Advance every slot by `dt` seconds and refresh the signals. The RAF
   * loop calls this per frame; headless hosts and tests may drive it
   * directly with their own clock.
   */
  tick(dt) {
    const step = clamp2(Number(dt) || 0, 0, 1);
    for (const slot of this.slots) {
      if (!slot) continue;
      if (slot.source) {
        const src = this.sources.get(slot.source);
        let v = this.sourceValues.get(slot.source) ?? 0;
        if (src?.sample) {
          try {
            v = clamp2(Number(src.sample(slot)) || 0, -1, 1);
          } catch {
            v = 0;
          }
        }
        this.signals[slot.index] = v;
        continue;
      }
      const def = getModType(slot.type);
      if (!def) continue;
      let state = this.states.get(slot.index);
      if (state === void 0) {
        state = def.createState();
        this.states.set(slot.index, state);
      }
      this.signals[slot.index] = clamp2(
        def.tick(state, slot.params, step, this.bpm, this.audioInputFor(slot)),
        -1,
        1
      );
    }
    this.frameListeners.forEach((fn) => fn());
  }
  /** Wipe every slot, assignment, and the persisted shelf. */
  clear() {
    this.closeSettings();
    this.slots.fill(null);
    this.assignments.clear();
    this.states.clear();
    this.signals.fill(0);
    this.touched = null;
    clearPersisted(PERSIST_TARGET);
    this.changed();
  }
  ensureLoop() {
    if (this.rafId !== null || typeof window === "undefined") return;
    if (!this.slots.some(Boolean)) return;
    this.lastTick = performance.now();
    this.rafId = window.requestAnimationFrame(this.loop);
  }
  resolveMeta(panelId, path) {
    const key = modKey(panelId, path);
    const cached = this.metas.get(key);
    if (cached !== void 0) return cached;
    const panel = TweakStore.getPanel(panelId);
    if (!panel) return null;
    const meta = findControl(panel.controls, path);
    const numeric = meta && (meta.type === "slider" || meta.type === "number") && Number.isFinite(meta.min) && Number.isFinite(meta.max) ? { min: meta.min, max: meta.max } : null;
    this.metas.set(key, numeric);
    return numeric;
  }
  changed() {
    this.version++;
    savePersisted(PERSIST_TARGET, {
      slots: this.getSlots(),
      assignments: this.getAssignments()
    });
    this.structListeners.forEach((fn) => fn());
    this.ensureLoop();
  }
};
function findControl(controls, path) {
  for (const c of controls) {
    if (c.children) {
      const hit = findControl(c.children, path);
      if (hit) return hit;
    } else if (c.path === path) {
      return c;
    }
  }
  return null;
}
var ModulationStore = /* @__PURE__ */ new ModulationStoreClass();
export {
  MOD_TOUCH_GRACE_MS,
  ModulationStore
};
//# sourceMappingURL=modulation-store.js.map