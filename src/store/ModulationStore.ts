import { TweakStore } from './TweakStore';
import type { ControlMeta } from './TweakStore';
import { resolvePersistTarget, loadPersisted, savePersisted, clearPersisted } from './persist';
import {
  MOD_SLOTS,
  MOD_SETTINGS_PANEL,
  modKey,
  getModType,
  listModTypes,
  applyModulation,
  type ModTypeDef,
  type ModulationSlot,
  type ModulationType,
  type ModulationParams,
  type ModulationAssignment,
  type ModAudioInput,
} from '../modulation-core';
import { hzWindowToBins, byteFreqToUnit } from '../analyser-core';

/**
 * The modulation layer's runtime — a singleton beside the TweakStore.
 *
 * It owns the 16 slots, the control assignments, and the engine: one
 * self-halting requestAnimationFrame loop (the TimelineStore's pattern)
 * that advances every internal modulator and mirrors every external
 * source once per frame. Modulated values NEVER enter the TweakStore —
 * consumers pull them at frame time:
 *
 *   const speed = ModulationStore.getValue('fx', 'blob.speed');   // one path
 *   const params = ModulationStore.getValues('fx');               // whole panel
 *
 * Both return the stored base values with the live modulation applied on
 * top, clamped to each control's own bounds. Reading per frame is the
 * contract — nothing is pushed, so frame ordering stays in the app's hands.
 *
 * DSP apps whose modulators live on the audio side register them instead:
 *
 *   ModulationStore.registerSource('lfo-1', { sample: () => native.lfo1 });
 *   // or push at any rate: ModulationStore.setSourceValue('lfo-1', v);
 *
 * Audio-listening modulators (the envelope follower) need something to
 * hear. Apps hand over live audio as named inputs — the same late-getter
 * pattern the analyser rows use, since audio contexts start on a gesture:
 *
 *   ModulationStore.registerAudioInput('drums', () => analyser);   // an AnalyserNode
 *
 * The engine reads each input's spectrum once per frame and serves band
 * levels to whichever slots follow it; a follower's source select lists
 * the registered inputs (and only appears when there is more than one).
 *
 * A slot pointing at a source shows its signal (circle, dots, step light)
 * but applies nothing to values unless the source says `applies: true` —
 * the app's own engine already did, at audio rate.
 *
 * The assignment gesture: touching a control (`noteTouch`, wired into the
 * panel and the bridge kit) arms it for a few seconds; a step-button press
 * (`assignFromStep`) then creates the slot's modulation if needed and
 * toggles the control onto it.
 *
 * Slots and assignments persist to localStorage (fail-soft, like panel
 * values), so a prototype's modulation setup survives a reload.
 */

/** A touched control stays armed for assignment this long. */
export const MOD_TOUCH_GRACE_MS = 4000;

export interface ModulationSourceConfig {
  /** Pulled once per frame by the engine; omit it to push with `setSourceValue`. */
  sample?: (slot: ModulationSlot) => number;
  /**
   * When true the library applies this source's signal to assigned values.
   * DSP apps that modulate on their own side leave it false (display only).
   */
  applies?: boolean;
}

export type ModStepAction = 'created' | 'assigned' | 'unassigned' | 'none';

type Listener = () => void;
type NumericMeta = { min: number; max: number };

interface PersistedModulation {
  slots: ModulationSlot[];
  assignments: ModulationAssignment[];
}

const PERSIST_TARGET = resolvePersistTarget('modulation', 'global', true);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

class ModulationStoreClass {
  private slots: (ModulationSlot | null)[] = Array(MOD_SLOTS).fill(null);
  private assignments = new Map<string, ModulationAssignment>();
  private states = new Map<number, unknown>();
  private signals: number[] = Array(MOD_SLOTS).fill(0);
  private sources = new Map<string, ModulationSourceConfig>();
  private sourceValues = new Map<string, number>();
  private audioInputs = new Map<string, () => AnalyserNode | null>();
  /** Reused per-input spectrum buffers — one read per input per tick. */
  private freqData = new Map<string, Uint8Array<ArrayBuffer>>();
  private metas = new Map<string, NumericMeta | null>();
  private bpm = 120;
  private touched: { panelId: string; path: string; at: number } | null = null;
  private settingsIndex: number | null = null;
  private settingsUnsub: (() => void) | null = null;
  private applyingSettings = false;
  private structListeners = new Set<Listener>();
  private frameListeners = new Set<Listener>();
  private version = 0;
  private rafId: number | null = null;
  private lastTick = 0;

  constructor() {
    const saved = loadPersisted<PersistedModulation>(PERSIST_TARGET);
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
    // Control bounds are cached per assignment; panel add/remove (the only
    // structural signal the TweakStore emits) invalidates the cache.
    TweakStore.subscribeGlobal(() => this.metas.clear());
    this.ensureLoop();
  }

  /* ── slots ────────────────────────────────────────────────────────── */

  /** Create a modulation in a step's slot; an occupied slot is returned as-is. */
  createSlot(index: number, type: ModulationType = 'lfo'): ModulationSlot | null {
    if (!Number.isInteger(index) || index < 0 || index >= MOD_SLOTS) return null;
    const existing = this.slots[index];
    if (existing) return existing;
    const def = getModType(type);
    if (!def) {
      console.warn(`[tweakers] modulator type "${type}" is not registered`);
      return null;
    }
    const slot: ModulationSlot = { index, type, params: { ...def.defaults } };
    this.slots[index] = slot;
    this.states.set(index, def.createState());
    this.changed();
    this.ensureLoop();
    return slot;
  }

  getSlot(index: number): ModulationSlot | null {
    return this.slots[index] ?? null;
  }

  /** The occupied slots, index order — the track row's circles. */
  getSlots(): ModulationSlot[] {
    return this.slots.filter((s): s is ModulationSlot => s !== null);
  }

  updateSlotParams(index: number, patch: ModulationParams): void {
    const slot = this.slots[index];
    if (!slot) return;
    slot.params = { ...slot.params, ...patch };
    this.changed();
  }

  /** Switch a slot's modulator type — fresh defaults, fresh state. */
  setSlotType(index: number, type: ModulationType): void {
    const slot = this.slots[index];
    const def = getModType(type);
    if (!slot || !def) return;
    slot.type = type;
    slot.params = { ...def.defaults };
    this.states.set(index, def.createState());
    this.changed();
  }

  /** Point a slot at an external source (null returns it to the engine). */
  setSlotSource(index: number, sourceId: string | null): void {
    const slot = this.slots[index];
    if (!slot) return;
    slot.source = sourceId;
    this.changed();
  }

  /** Remove a slot's modulation and every assignment wired to it. */
  removeSlot(index: number): void {
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
  assign(panelId: string, path: string, slot: number, amount = 0.5): boolean {
    if (!this.slots[slot]) return false;
    if (panelId === MOD_SETTINGS_PANEL) return false;   // a modulator can't modulate its own page

    if (TweakStore.getPanel(panelId) && !this.resolveMeta(panelId, path)) {
      console.warn(`[tweakers] "${path}" is not a bounded numeric control; it cannot take a modulation`);
      return false;
    }
    this.assignments.set(modKey(panelId, path), {
      panelId,
      path,
      slot,
      amount: clamp(Number(amount) || 0, 0, 1),
    });
    this.changed();
    return true;
  }

  unassign(panelId: string, path: string): void {
    if (this.assignments.delete(modKey(panelId, path))) this.changed();
  }

  getAssignment(panelId: string, path: string): ModulationAssignment | undefined {
    return this.assignments.get(modKey(panelId, path));
  }

  getAssignments(): ModulationAssignment[] {
    return [...this.assignments.values()];
  }

  assignmentsForSlot(index: number): ModulationAssignment[] {
    return this.getAssignments().filter((a) => a.slot === index);
  }

  setAmount(panelId: string, path: string, amount: number): void {
    const a = this.assignments.get(modKey(panelId, path));
    if (!a) return;
    a.amount = clamp(Number(amount) || 0, 0, 1);
    this.changed();
  }

  /* ── the assignment gesture ───────────────────────────────────────── */

  /** A finger on a control — panel pointer, hardware knob. Arms assignment. */
  noteTouch(panelId: string, path: string): void {
    this.touched = { panelId, path, at: Date.now() };
  }

  /**
   * A step-button press (hardware step or on-screen circle): with a control
   * armed, create the slot's modulation if needed and toggle the control
   * onto it. Returns what happened, for lights and readouts.
   */
  assignFromStep(index: number): { action: ModStepAction; slot: ModulationSlot | null } {
    const t = this.touched;
    const armed = t && Date.now() - t.at < MOD_TOUCH_GRACE_MS;
    if (!armed) return { action: 'none', slot: this.getSlot(index) };

    const existing = this.assignments.get(modKey(t.panelId, t.path));
    if (this.slots[index] && existing?.slot === index) {
      this.unassign(t.panelId, t.path);
      return { action: 'unassigned', slot: this.getSlot(index) };
    }

    const created = !this.slots[index];
    const slot = this.createSlot(index);
    if (!slot) return { action: 'none', slot: null };
    if (!this.assign(t.panelId, t.path, index)) {
      if (created) this.removeSlot(index);
      return { action: 'none', slot: this.getSlot(index) };
    }
    return { action: created ? 'created' : 'assigned', slot };
  }

  /* ── the settings page ────────────────────────────────────────────── */

  /**
   * Open a slot's settings (hold its step button): registers one hidden
   * TweakStore panel (`mod-settings`, kind 'modulation') built from the
   * modulator's own control list, with the type enum ahead of it. Every
   * edit on that panel — screen or hardware, the kit syncs it like any
   * page — flows back into the slot's params. Returns the panel id.
   */
  openSettings(index: number): string | null {
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

  closeSettings(): void {
    if (this.settingsIndex === null) return;
    this.settingsUnsub?.();
    this.settingsUnsub = null;
    this.settingsIndex = null;
    TweakStore.unregisterPanel(MOD_SETTINGS_PANEL);
    this.changed();
  }

  /** The open settings page, or null — the panel to render as the Move page. */
  getSettings(): { index: number; panelId: string } | null {
    return this.settingsIndex === null ? null : { index: this.settingsIndex, panelId: MOD_SETTINGS_PANEL };
  }

  private registerSettingsPanel(slot: ModulationSlot, def: ModTypeDef): void {
    const config: Record<string, unknown> = {
      type: {
        type: 'select',
        options: listModTypes().map((d) => ({ value: d.type, label: d.label })),
        default: slot.type,
      },
    };
    for (const c of def.controls) {
      if (c.type === 'slider') {
        config[c.path] = {
          type: 'slider',
          min: c.min ?? 0,
          max: c.max ?? 1,
          step: c.step,
          unit: c.unit,
          formatValue: c.formatValue,
          bipolar: c.bipolar,
          default: Number(slot.params[c.path]) || 0,
        };
      } else if (c.type === 'select' && c.sourceOptions) {
        // The source select lists the registered audio inputs — and only
        // exists while there is a real choice to make.
        const inputs = this.getAudioInputs();
        if (inputs.length < 2) continue;
        const current = slot.params[c.path];
        config[c.path] = {
          type: 'select',
          options: inputs,
          default: typeof current === 'string' && inputs.includes(current) ? current : inputs[0],
        };
      } else if (c.type === 'toggle') {
        config[c.path] = !!slot.params[c.path];
      } else if (c.type === 'xy' && c.xParam && c.yParam) {
        config[c.path] = {
          type: 'xy',
          x: c.xAxis,
          y: c.yAxis,
          default: { x: Number(slot.params[c.xParam]) || 0, y: Number(slot.params[c.yParam]) || 0 },
        };
      }
    }
    // Registering writes the panel's values, which pings our own
    // subscription — the guard keeps that echo from re-writing the params.
    this.applyingSettings = true;
    TweakStore.registerPanel(
      MOD_SETTINGS_PANEL,
      `${def.label} ${slot.index + 1}`,
      config as Parameters<typeof TweakStore.registerPanel>[2],
      undefined,
      { kind: 'modulation' }
    );
    this.applyingSettings = false;
  }

  /** Rebuild the open settings page in place — the source select tracks the inputs. */
  private refreshSettingsPanel(): void {
    if (this.settingsIndex === null) return;
    const slot = this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    if (slot && def) this.registerSettingsPanel(slot, def);
  }

  /** A settings-panel edit — screen or hardware — lands in the slot's params. */
  private onSettingsChange(): void {
    if (this.applyingSettings || this.settingsIndex === null) return;
    const slot = this.slots[this.settingsIndex];
    if (!slot) return;
    const values = TweakStore.getValues(MOD_SETTINGS_PANEL);

    // A type switch swaps the params and rebuilds the page for the new
    // modulator's controls.
    const nextType = values.type as ModulationType;
    if (nextType && nextType !== slot.type && getModType(nextType)) {
      this.setSlotType(slot.index, nextType);
      this.registerSettingsPanel(this.slots[slot.index]!, getModType(nextType)!);
      return;
    }

    const def = getModType(slot.type);
    if (!def) return;
    const patch: ModulationParams = {};
    for (const c of def.controls) {
      const v = values[c.path];
      if (c.type === 'xy' && c.xParam && c.yParam) {
        const xy = v as { x?: number; y?: number } | undefined;
        if (xy && typeof xy === 'object') {
          patch[c.xParam] = Number(xy.x) || 0;
          patch[c.yParam] = Number(xy.y) || 0;
        }
      } else if (c.type === 'select') {
        if (typeof v === 'string') patch[c.path] = v;
      } else if (c.type === 'toggle') {
        patch[c.path] = !!v;
      } else if (typeof v === 'number' && Number.isFinite(v)) {
        patch[c.path] = v;
      }
    }
    this.updateSlotParams(slot.index, patch);
  }

  /* ── external sources ─────────────────────────────────────────────── */

  /** Offer an app-side modulator to the slots; returns an unregister fn. */
  registerSource(id: string, config: ModulationSourceConfig = {}): () => void {
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
  setSourceValue(id: string, value: number): void {
    this.sourceValues.set(id, clamp(Number(value) || 0, -1, 1));
  }

  getSources(): string[] {
    return [...this.sources.keys()];
  }

  /* ── audio inputs — what the envelope follower hears ──────────────── */

  /**
   * Hand over live audio as a named input: an AnalyserNode getter, read at
   * frame time (a getter, so the node can exist only after the app's audio
   * starts on a user gesture). Returns an unregister fn. Registering while
   * a follower's settings page is open refreshes its source select.
   */
  registerAudioInput(id: string, get: () => AnalyserNode | null): () => void {
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

  getAudioInputs(): string[] {
    return [...this.audioInputs.keys()];
  }

  /**
   * The band sampler served to a slot's modulator: its chosen source when
   * that input is registered, else the first registered input, else null
   * (the follower hears silence). Levels are the band's spectral peak —
   * the same reduction the analyser visualizer draws.
   */
  private audioInputFor(slot: ModulationSlot): ModAudioInput | null {
    const chosen = typeof slot.params.source === 'string' ? slot.params.source : '';
    const id = this.audioInputs.has(chosen) ? chosen : this.getAudioInputs()[0];
    if (id === undefined) return null;
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

  setTempo(bpm: number): void {
    const next = clamp(Number(bpm) || 0, 20, 999);
    if (next === this.bpm) return;
    this.bpm = next;
    this.changed();
  }

  getTempo(): number {
    return this.bpm;
  }

  /* ── reading the modulated layer ──────────────────────────────────── */

  /** A slot's live signal, -1..1. */
  getSignal(index: number): number {
    return this.signals[index] ?? 0;
  }

  /** The modulation's contribution to one control, in the control's units. */
  getOffset(panelId: string, path: string): number {
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
  getValue(panelId: string, path: string): number {
    const base = Number(TweakStore.getValue(panelId, path));
    return base + this.getOffset(panelId, path);
  }

  /**
   * A panel's values with every modulation applied — a fresh snapshot per
   * call, meant to be pulled once per frame in place of `TweakStore.getValues`.
   */
  getValues(panelId: string): Record<string, unknown> {
    const out: Record<string, unknown> = { ...TweakStore.getValues(panelId) };
    for (const a of this.assignments.values()) {
      if (a.panelId !== panelId) continue;
      const offset = this.getOffset(panelId, a.path);
      if (offset !== 0) out[a.path] = Number(out[a.path]) + offset;
    }
    return out;
  }

  /* ── subscriptions ────────────────────────────────────────────────── */

  /** Structural changes: slots, assignments, sources, tempo. */
  subscribe(listener: Listener): () => void {
    this.structListeners.add(listener);
    return () => this.structListeners.delete(listener);
  }

  /** Every engine frame — for pulsing circles, dots, and step lights. */
  subscribeFrames(listener: Listener): () => void {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  /** Bumped on every structural change — a stable snapshot for UI stores. */
  getVersion(): number {
    return this.version;
  }

  /* ── the engine ───────────────────────────────────────────────────── */

  /**
   * Advance every slot by `dt` seconds and refresh the signals. The RAF
   * loop calls this per frame; headless hosts and tests may drive it
   * directly with their own clock.
   */
  tick(dt: number): void {
    const step = clamp(Number(dt) || 0, 0, 1);
    for (const slot of this.slots) {
      if (!slot) continue;
      if (slot.source) {
        const src = this.sources.get(slot.source);
        let v = this.sourceValues.get(slot.source) ?? 0;
        if (src?.sample) {
          try { v = clamp(Number(src.sample(slot)) || 0, -1, 1); } catch { v = 0; }
        }
        this.signals[slot.index] = v;
        continue;
      }
      const def = getModType(slot.type);
      if (!def) continue;                       // type not registered (yet)
      let state = this.states.get(slot.index);
      if (state === undefined) {
        state = def.createState();
        this.states.set(slot.index, state);
      }
      this.signals[slot.index] = clamp(
        def.tick(state, slot.params, step, this.bpm, this.audioInputFor(slot)),
        -1,
        1
      );
    }
    this.frameListeners.forEach((fn) => fn());
  }

  /** Wipe every slot, assignment, and the persisted shelf. */
  clear(): void {
    this.closeSettings();
    this.slots.fill(null);
    this.assignments.clear();
    this.states.clear();
    this.signals.fill(0);
    this.touched = null;
    clearPersisted(PERSIST_TARGET);
    this.changed();
  }

  private ensureLoop(): void {
    if (this.rafId !== null || typeof window === 'undefined') return;
    if (!this.slots.some(Boolean)) return;
    this.lastTick = performance.now();
    this.rafId = window.requestAnimationFrame(this.loop);
  }

  private loop = (now: number): void => {
    this.tick(Math.max(0, (now - this.lastTick) / 1000));
    this.lastTick = now;
    // Self-halting: the loop lives only while modulations exist.
    this.rafId = this.slots.some(Boolean) ? window.requestAnimationFrame(this.loop) : null;
  };

  private resolveMeta(panelId: string, path: string): NumericMeta | null {
    const key = modKey(panelId, path);
    const cached = this.metas.get(key);
    if (cached !== undefined) return cached;
    const panel = TweakStore.getPanel(panelId);
    if (!panel) return null;                    // not registered yet — don't cache
    const meta = findControl(panel.controls, path);
    const numeric =
      meta &&
      (meta.type === 'slider' || meta.type === 'number') &&
      Number.isFinite(meta.min) && Number.isFinite(meta.max)
        ? { min: meta.min as number, max: meta.max as number }
        : null;
    this.metas.set(key, numeric);
    return numeric;
  }

  private changed(): void {
    this.version++;
    savePersisted(PERSIST_TARGET, {
      slots: this.getSlots(),
      assignments: this.getAssignments(),
    } satisfies PersistedModulation);
    this.structListeners.forEach((fn) => fn());
    this.ensureLoop();
  }
}

function findControl(controls: ControlMeta[], path: string): ControlMeta | null {
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

// PURE lets bundlers drop the modulation layer for apps that never touch it.
export const ModulationStore = /* @__PURE__ */ new ModulationStoreClass();
