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
var MOD_RING_RADIUS = 6;
var MOD_RING_CIRCUMFERENCE = 2 * Math.PI * MOD_RING_RADIUS;
var RING_SWEEP_START = 135 / 360;
var RING_SWEEP_LEN = 270 / 360;
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
  /* ── gates ────────────────────────────────────────────────────────── */
  /**
   * Note on / note off for a slot — what drives a gated modulator like the
   * ADSR:
   *
   *   ModulationStore.gate(0, true);    // key down
   *   ModulationStore.gate(0, false);   // key up — the release runs
   *
   * Free-running types (LFO, S&H) and slots on an external source ignore
   * it. The gate is live state, not a param: it is never persisted.
   */
  gate(index, on) {
    const slot = this.slots[index];
    const def = slot && getModType(slot.type);
    if (!slot || slot.source || !def?.gate) return;
    let state = this.states.get(index);
    if (state === void 0) {
      state = def.createState();
      this.states.set(index, state);
    }
    def.gate(state, on);
    this.ensureLoop();
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
          default: Number(slot.params[c.path]) || 0
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
  /**
   * A modulatable control's bounds, or null when it has none (or its panel
   * has not registered yet) — what a display needs to draw the modulation
   * against the control's own span.
   */
  getBounds(panelId, path) {
    const meta = this.resolveMeta(panelId, path);
    return meta ? { min: meta.min, max: meta.max } : null;
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
      this.signals[slot.index] = clamp2(def.tick(state, slot.params, step, this.bpm), -1, 1);
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