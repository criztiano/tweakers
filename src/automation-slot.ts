import { packColor, unpackColor, type AutomationLane } from './automation-core';
import type { AutomationLanesStore } from './automation-store';
import { modColor, type ModPageLayout, type ModSlotPage } from './modulation-core';
import { MoveColorStore } from './move-color';
import { MoveFunctions, type MoveFunctionButton, type MoveFunctionPress } from './move-functions';
import { MovePresetStore } from './move-presets';
import { MoveSearchStore } from './move-search';
import { MoveSurfaceStore, type MoveStepCell } from './move-surface-store';
import { followWindow, timelineReadout } from './move-timeline';
import { MoveVolumeDisplay } from './move-volume';
import { scrubBy, zoomBy } from './move-waveform';
import { PresetExplorationStore } from './preset-exploration';
import { ModulationStore } from './store/ModulationStore';
import { TweakStore } from './store/TweakStore';

/**
 * Automation on the step row: the lanes take a modulation slot, and its step
 * opens TIMELINE CONTROL MODE — the lanes card over the panel, and the Move's
 * hands on it.
 *
 * The slot is lent (`ModulationStore.lendSlot`): it holds the first free step
 * while the host says lanes exist, keeps that step for as long as they do,
 * lights it steady in its colour, and is never saved — the host owns the
 * lanes, so the host brings the slot back. A tap on its step opens the mode;
 * a hold deletes nothing.
 *
 * In the mode (the slot's page):
 *   - knob 1 picks the lane, knob 2 moves the selected point in time, knob 3
 *     sets its value, knob 4 sets how hard Smooth smooths — and its press
 *     smooths the lane, or the selected stretch;
 *   - the volume knob scrubs the host's clock (Shift: fine), the wheel zooms
 *     around the playhead and its press shows the whole pass;
 *   - up / down walk the lanes, left / right the points;
 *   - Delete deletes the point, or clears the stretch; Shift + Delete deletes
 *     the lane; Copy adds a point at the playhead;
 *   - the step row is the shown window in sixteen slices: a tap jumps there
 *     and picks the point nearest it, a held step and a tapped one select the
 *     stretch between them;
 *   - Back, or the slot's own step, leaves.
 * Play and Rec keep their transport meaning. Everything borrowed — the keys,
 * the knob, the step row — is pushed while the mode is open and handed back
 * when it closes, so whatever the host had there comes back.
 */

export interface AutomationSlotOptions {
  /**
   * Whether the host has lanes worth a slot. Omit it and the slot follows
   * the timeline in front: there while it has a lane. A host whose lanes
   * live in several timelines (scenes) says it for all of them, and calls
   * `setPresent` as that changes.
   */
  present?: boolean;
  /** The volume knob and the step row move the host's clock to `time` seconds. */
  onSeek?: (time: number) => void;
  /** The card's accent — the host's signature, as on `MoveAutomationLanes`. */
  accent?: string;
  /** The card's name, in its corner. */
  title?: string;
}

export interface AutomationSlotHandle {
  /** Lanes exist (or no longer do): the slot takes its step, or hands it back. */
  setPresent(present: boolean): void;
  /** The step the slot holds, 0–15, or null while it holds none. */
  index(): number | null;
  /** Whether timeline control mode is open — a host hides its own docked card meanwhile. */
  isOpen(): boolean;
  /** Open the mode, as a tap on the slot's step does. */
  open(): void;
  /** Leave the mode, as Back does. */
  close(): void;
  /** Detach: the mode closes and the step goes free. */
  release(): void;
}

/** The mode's page, its four dials. */
const DIALS = ['lane', 'time', 'value', 'smooth'] as const;
/** How many slices the step row cuts the shown window into. */
const STEPS = 16;
/** The smooth dial: its reach, and a press's amount before it is turned. */
const SMOOTH_MIN = 0.25;
const SMOOTH_MAX = 4;
const SMOOTH_DEFAULT = 1;

const EVENTS = {
  volume: 'move-tweakers:volume',
  jog: 'move-tweakers:jog',
  jogClick: 'move-tweakers:jog-click',
} as const;

/** The overlays that hold the wheel over any page — a search, the preset
 *  navigator, a colour editor, exploration. The mode yields to them. */
const wheelTaken = () => {
  const presets = MovePresetStore.getView();
  return MoveSearchStore.isOpen() || (!!presets && presets.phase !== 'closing') || !!MoveColorStore.getView() || !!PresetExplorationStore.getState();
};

/** The slots that are open for a card, by step — the panel's overlay finds its store here. */
const lent = new Map<number, AutomationSlot>();

/** The automation slot on step `index`, if one is lent there. */
export const automationSlotAt = (index: number): AutomationSlot | undefined => lent.get(index);

/** The point of `lane` nearest `phase`. */
function nearestPoint(lane: AutomationLane, phase: number): number {
  let best = 0;
  for (let i = 1; i < lane.points.length; i++) {
    if (Math.abs(lane.points[i].t - phase) < Math.abs(lane.points[best].t - phase)) best = i;
  }
  return best;
}

/** A value dial's step: about a thousand across the lane's range, rounded to a readable size. */
function valueStep(lane: AutomationLane): number {
  const raw = (lane.max - lane.min) / 1000;
  if (!(raw > 0)) return 0.001;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return pow;
}

export class AutomationSlot implements ModSlotPage {
  private slot: number | null = null;
  private present: boolean | null;
  private syncing = false;
  private released = false;
  private panelId: string | null = null;
  private teardown: (() => void) | null = null;
  /** The page's structure — re-registered when it changes, values written otherwise. */
  private shape = '';
  private applying = false;
  private smoothAmount = SMOOTH_DEFAULT;
  /** Steps held down in the mode, when the kit reports releases. */
  private held = new Set<number>();
  /** The step last tapped — the far end a Shift + click on the screen reaches from. */
  private anchor: number | null = null;
  private lastLights = '';
  /** What the page last wrote to its point dials — a dial is a hand's only
   *  once it reads something else. */
  private written: { time?: unknown; value?: unknown } = {};
  private readonly offStore: () => void;
  private readonly offModulation: () => void;
  readonly handle: AutomationSlotHandle;

  constructor(
    private readonly store: AutomationLanesStore,
    private readonly options: AutomationSlotOptions,
    private readonly changed: () => void
  ) {
    this.present = options.present ?? null;
    this.offStore = store.subscribe(() => this.onStore());
    // A full row frees a step when a modulator goes: try again then.
    this.offModulation = ModulationStore.subscribe(() => this.sync());
    this.handle = {
      setPresent: (present) => {
        this.present = present;
        this.sync();
      },
      index: () => this.slot,
      isOpen: () => this.teardown !== null,
      open: () => {
        if (this.slot !== null && !this.teardown) ModulationStore.openSettings(this.slot);
      },
      close: () => {
        if (this.teardown) ModulationStore.closeSettings();
      },
      release: () => this.release(),
    };
    this.sync();
  }

  /** What the panel's overlay hands the card. */
  card(): { store: AutomationLanesStore; onSeek?: (time: number) => void; accent?: string; title?: string } {
    return { store: this.store, onSeek: this.options.onSeek, accent: this.options.accent, title: this.options.title };
  }

  release(): void {
    if (this.released) return;
    this.released = true;
    this.offStore();
    this.offModulation();
    this.present = false;
    this.syncing = false;
    this.giveBack();
  }

  /** Once a frame, from the store's tick: the step row's lit slice follows the playhead. */
  frame(): void {
    if (this.teardown) this.paintSteps();
  }

  // ── the slot ──

  private wanted(): boolean {
    if (this.released) return false;
    return this.present ?? this.store.timeline().lanes.length > 0;
  }

  private sync(): void {
    if (this.syncing) return;
    this.syncing = true;
    try {
      if (this.wanted()) {
        if (this.slot === null) {
          const index = ModulationStore.lendSlot('automation', this);
          if (index !== null) {
            this.slot = index;
            lent.set(index, this);
            this.changed();
          }
        }
      } else {
        this.giveBack();
      }
    } finally {
      this.syncing = false;
    }
  }

  private giveBack(): void {
    if (this.slot === null) return;
    const index = this.slot;
    this.slot = null;
    lent.delete(index);
    ModulationStore.returnSlot(index);
    this.changed();
  }

  private onStore(): void {
    this.sync();
    if (this.teardown) this.refresh();
  }

  // ── the page ──

  open(panelId: string): void {
    this.panelId = panelId;
    this.held.clear();
    this.anchor = null;
    this.lastLights = '';
    // The mode always stands on a lane, and on a point of it.
    const sel = this.store.getSelection();
    const lanes = this.store.timeline().lanes;
    const lane = lanes.find((l) => l.key === sel.key) ?? lanes[0];
    if (lane && (sel.key !== lane.key || (sel.point === null && !sel.range))) {
      this.store.select({ key: lane.key, point: nearestPoint(lane, this.phase()) });
    }
    this.register();
    const offPanel = TweakStore.subscribe(panelId, () => this.onPanel());

    // The knob first: a key change reconfigures the kit, and that configure
    // is where it reads the knob claim.
    const releaseKnob = MoveVolumeDisplay.claim({ label: 'time', getValue: () => timelineReadout(this.store.clock().time) });
    const keys: [MoveFunctionButton, (press: MoveFunctionPress) => void, string][] = [
      ['back', () => ModulationStore.closeSettings(), 'Leave'],
      ['up', () => this.walkLane(-1), 'Previous lane'],
      ['down', () => this.walkLane(1), 'Next lane'],
      ['left', () => this.walkPoint(-1), 'Previous point'],
      ['right', () => this.walkPoint(1), 'Next point'],
      ['delete', ({ shift }) => this.remove(shift), 'Delete'],
      ['copy', () => this.addAtPlayhead(), 'Add point'],
    ];
    const releaseKeys = keys.map(([name, run, label]) => MoveFunctions.push(name, run, { label, chip: false }));

    const win = typeof window !== 'undefined' ? window : null;
    const onVolume = (event: Event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      const detail = (event as CustomEvent).detail ?? {};
      this.scrub(Number(detail.delta) || 0, !!detail.shift);
    };
    const onJog = (event: Event) => {
      if (event.defaultPrevented || wheelTaken()) return;
      event.preventDefault();
      const delta = Number((event as CustomEvent).detail?.delta) || 0;
      if (delta) this.store.zoomTo(zoomBy(this.store.getView().zoom, delta), this.phase());
    };
    const onJogClick = (event: Event) => {
      if (event.defaultPrevented || wheelTaken()) return;
      event.preventDefault();
      this.store.resetView();
    };
    win?.addEventListener(EVENTS.volume, onVolume);
    win?.addEventListener(EVENTS.jog, onJog);
    win?.addEventListener(EVENTS.jogClick, onJogClick);

    // The step row: the shown window, in slices, for as long as the mode is up.
    const stepsBefore = MoveSurfaceStore.getState().steps;
    const offSteps = MoveSurfaceStore.onStep(({ index, shift }) => this.pressStep(index, shift));
    const offReleases = MoveSurfaceStore.onStepRelease(({ index }) => this.held.delete(index));
    this.paintSteps();

    this.teardown = () => {
      offPanel();
      win?.removeEventListener(EVENTS.volume, onVolume);
      win?.removeEventListener(EVENTS.jog, onJog);
      win?.removeEventListener(EVENTS.jogClick, onJogClick);
      offSteps();
      offReleases();
      MoveSurfaceStore.setSteps(stepsBefore);
      for (const release of releaseKeys) release();
      releaseKnob();
    };
    this.changed();
  }

  close(): void {
    const teardown = this.teardown;
    this.teardown = null;
    this.panelId = null;
    this.shape = '';
    this.held.clear();
    teardown?.();
    this.changed();
  }

  layout(): ModPageLayout {
    return {
      dials: DIALS.map((path) => (path === 'smooth' ? { path, cycle: true } : { path })),
      toggles: DIALS.map(() => null),
      values: DIALS.map(() => null),
    };
  }

  /** A press on the Smooth knob smooths. */
  tap(path: string): boolean {
    if (path !== 'smooth') return false;
    this.smoothNow();
    return true;
  }

  // ── the hands ──

  /** The volume knob: the waveform's scrub, over the shown window. */
  scrub(delta: number, fine = false): void {
    const { duration } = this.store.clock();
    if (!delta || !(duration > 0) || !this.options.onSeek) return;
    const next = scrubBy(this.phase(), delta, fine, this.store.getView().zoom, duration);
    this.options.onSeek(next * duration);
  }

  walkLane(dir: number): void {
    const lanes = this.store.timeline().lanes;
    if (!lanes.length) return;
    const at = lanes.findIndex((l) => l.key === this.store.getSelection().key);
    const lane = lanes[at < 0 ? 0 : Math.min(lanes.length - 1, Math.max(0, at + dir))];
    this.store.select({ key: lane.key, point: nearestPoint(lane, this.phase()) });
  }

  walkPoint(dir: number): void {
    const lane = this.lane();
    if (!lane) return;
    const sel = this.store.getSelection();
    let point: number;
    if (sel.point !== null) point = Math.min(lane.points.length - 1, Math.max(0, sel.point + dir));
    else if (sel.range) point = nearestPoint(lane, dir < 0 ? sel.range.from : sel.range.to);
    else point = nearestPoint(lane, this.phase());
    this.store.select({ key: lane.key, point });
    this.reveal(lane.points[point].t);
  }

  /** Delete the point, or clear the stretch; with Shift, the whole lane. */
  remove(shift = false): void {
    const lane = this.lane();
    if (!lane) return;
    const sel = this.store.getSelection();
    if (shift) {
      const lanes = this.store.timeline().lanes;
      const at = lanes.indexOf(lane);
      if (!this.store.deleteLane(lane.key)) return;
      const next = this.store.timeline().lanes[Math.min(at, this.store.timeline().lanes.length - 1)];
      if (next) this.store.select({ key: next.key, point: nearestPoint(next, this.phase()) });
      return;
    }
    if (sel.range) {
      this.store.clearRange(lane.key, sel.range.from, sel.range.to);
      return;
    }
    if (sel.point === null || !this.store.deletePoint(lane.key, sel.point)) return;
    const after = this.lane();
    if (after) this.store.select({ key: after.key, point: Math.max(0, Math.min(after.points.length - 1, sel.point - 1)) });
  }

  addAtPlayhead(): void {
    const lane = this.lane();
    if (lane) this.store.addPoint(lane.key, this.phase());
  }

  smoothNow(): void {
    const lane = this.lane();
    if (lane) this.store.smooth(lane.key, this.smoothAmount);
  }

  /**
   * A step in the mode. Held with another: the stretch between them. The
   * slot's own step: leave. Any other: jump the clock to that slice of the
   * shown window and stand on the point nearest it. Shift (a click on the
   * screen) reaches from the step last tapped, the way a held step does.
   */
  pressStep(index: number, shift = false): void {
    const other = MoveSurfaceStore.stepReleases() ? [...this.held].find((step) => step !== index) : undefined;
    const from = other ?? (shift ? this.anchor ?? undefined : undefined);
    if (MoveSurfaceStore.stepReleases()) this.held.add(index);
    const lane = this.lane();
    if (from !== undefined) {
      if (lane) this.store.select({ key: lane.key, range: { from: this.sliceStart(Math.min(from, index)), to: this.sliceStart(Math.max(from, index) + 1) } });
      return;
    }
    if (index === this.slot) {
      ModulationStore.closeSettings();
      return;
    }
    this.anchor = index;
    const at = this.sliceStart(index);
    const { duration } = this.store.clock();
    if (this.options.onSeek && duration > 0) this.options.onSeek(at * duration);
    if (lane) this.store.select({ key: lane.key, point: nearestPoint(lane, at) });
  }

  // ── internals ──

  private phase(): number {
    const { time, duration } = this.store.clock();
    return duration > 0 && Number.isFinite(time) ? Math.min(1, Math.max(0, time / duration)) : 0;
  }

  private lane(): AutomationLane | undefined {
    const key = this.store.getSelection().key;
    return key ? this.store.timeline().lanes.find((l) => l.key === key) : undefined;
  }

  /** Where slice `i` of the shown window starts, in phase. */
  private sliceStart(i: number): number {
    const w = this.store.getWindow();
    return Math.min(1, Math.max(0, w.start + (w.span * i) / STEPS));
  }

  /** Slide the window so a point walked to is on the card. */
  private reveal(t: number): void {
    const view = this.store.getView();
    const start = followWindow(t, 1, view.zoom, view.start);
    if (start !== view.start) this.store.panTo(start);
  }

  /** The step row: the selected stretch lit, else the slice holding the
   *  playhead; the slot's own step in its colour — the way out. */
  private paintSteps(): void {
    const w = this.store.getWindow();
    const sel = this.store.getSelection();
    const phase = this.phase();
    // A slice's own start lands a hair under its index in floating point:
    // the nudge keeps it in its slice.
    const slice = (t: number) => (w.span > 0 ? Math.floor(((t - w.start) / w.span) * STEPS + 1e-9) : -1);
    const lit = new Set<number>();
    if (sel.range) {
      for (let i = Math.max(0, slice(sel.range.from)); i <= Math.min(STEPS - 1, slice(sel.range.to - 1e-9)); i++) lit.add(i);
    } else {
      const at = slice(phase);
      if (at >= 0 && at < STEPS) lit.add(at);
    }
    const cells: MoveStepCell[] = Array.from({ length: STEPS }, (_, step) =>
      step === this.slot ? { step, lit: true, color: modColor(step), group: 0 } : { step, lit: lit.has(step), group: 0 }
    );
    const key = `${this.slot}:${cells.map((c) => (c.lit ? 1 : 0)).join('')}`;
    if (key === this.lastLights) return;
    this.lastLights = key;
    MoveSurfaceStore.setSteps(cells);
  }

  /** The page's controls, from the lanes and the selection as they stand. */
  private config(): { shape: string; config: Record<string, unknown> } {
    const lanes = this.store.timeline().lanes;
    const lane = this.lane();
    const sel = this.store.getSelection();
    const point = lane && sel.point !== null ? lane.points[sel.point] : undefined;
    const duration = Math.max(0.01, this.store.clock().duration);
    const color = lane?.interp === 'color';
    const shape = JSON.stringify([
      lanes.map((l) => [l.key, l.label]),
      lane ? [lane.key, lane.interp, lane.min, lane.max] : null,
      duration,
    ]);
    const config: Record<string, unknown> = {
      lane: {
        type: 'select',
        options: lanes.length ? lanes.map((l) => ({ value: l.key, label: l.label })) : [{ value: '', label: 'No lanes' }],
        default: lane?.key ?? '',
      },
      time: { type: 'slider', min: 0, max: duration, step: 0.01, unit: 's', default: point ? point.t * duration : 0 },
      value: color
        ? { type: 'color', default: unpackColor(point?.v ?? 0) }
        : {
            type: 'slider',
            min: lane?.min ?? 0,
            max: lane && lane.max > lane.min ? lane.max : 1,
            step: lane ? valueStep(lane) : 0.01,
            default: point?.v ?? lane?.min ?? 0,
          },
      smooth: {
        type: 'slider',
        min: SMOOTH_MIN,
        max: SMOOTH_MAX,
        step: 0.25,
        default: this.smoothAmount,
        // The screen's press; the hardware's arrives through `tap`.
        onTap: () => this.smoothNow(),
      },
    };
    return { shape, config };
  }

  private register(): void {
    if (!this.panelId) return;
    const { shape, config } = this.config();
    this.shape = shape;
    this.applying = true;
    TweakStore.registerPanel(this.panelId, this.options.title ?? 'Automation', config as Parameters<typeof TweakStore.registerPanel>[2], undefined, { kind: 'modulation' });
    this.applying = false;
    const values = TweakStore.getValues(this.panelId);
    this.written = { time: values.time, value: values.value };
    this.markDisabled();
  }

  /** The lanes or the selection moved: the page follows. */
  private refresh(): void {
    if (!this.panelId) return;
    const { shape } = this.config();
    if (shape !== this.shape) this.register();
    else this.writeValues();
    this.paintSteps();
  }

  private writeValues(): void {
    const id = this.panelId;
    if (!id) return;
    const lane = this.lane();
    const sel = this.store.getSelection();
    const point = lane && sel.point !== null ? lane.points[sel.point] : undefined;
    const duration = this.store.clock().duration;
    const values = TweakStore.getValues(id);
    const guarded = this.applying;
    this.applying = true;
    const write = (path: string, v: unknown) => {
      if (values[path] !== v) TweakStore.updateValue(id, path, v as never);
    };
    write('lane', lane?.key ?? '');
    if (point) {
      write('time', point.t * duration);
      write('value', lane?.interp === 'color' ? unpackColor(point.v) : point.v);
    }
    write('smooth', this.smoothAmount);
    this.applying = guarded;
    const now = TweakStore.getValues(id);
    this.written = { time: now.time, value: now.value };
    this.markDisabled();
  }

  /** A point dial with no point under it, or Smooth on a colour lane, does nothing — and says so. */
  private markDisabled(): void {
    const id = this.panelId;
    if (!id) return;
    const lane = this.lane();
    const pointless = !lane || this.store.getSelection().point === null;
    TweakStore.setDisabled(id, 'time', pointless);
    TweakStore.setDisabled(id, 'value', pointless);
    TweakStore.setDisabled(id, 'smooth', !lane || lane.interp === 'color');
  }

  /** A dial turned — on the screen or the Move. */
  private onPanel(): void {
    const id = this.panelId;
    if (this.applying || !id) return;
    const values = TweakStore.getValues(id);
    const smooth = Number(values.smooth);
    if (Number.isFinite(smooth)) this.smoothAmount = Math.min(SMOOTH_MAX, Math.max(SMOOTH_MIN, smooth));
    const lanes = this.store.timeline().lanes;
    const sel = this.store.getSelection();
    const key = typeof values.lane === 'string' ? values.lane : '';
    if (key && key !== sel.key) {
      const lane = lanes.find((l) => l.key === key);
      if (lane) this.store.select({ key, point: nearestPoint(lane, this.phase()) });
      return;
    }
    const lane = this.lane();
    if (!lane || sel.point === null) return;
    const point = lane.points[sel.point];
    if (!point) return;
    const { duration } = this.store.clock();
    const turnedTime = values.time !== this.written.time && Number.isFinite(Number(values.time)) && duration > 0;
    const turnedValue = values.value !== this.written.value;
    if (!turnedTime && !turnedValue) return;
    const t = turnedTime ? Number(values.time) / duration : point.t;
    const v = !turnedValue
      ? point.v
      : lane.interp === 'color'
        ? typeof values.value === 'string' ? packColor(values.value) : point.v
        : Number.isFinite(Number(values.value)) ? Number(values.value) : point.v;
    if (!this.store.movePoint(lane.key, sel.point, t, v, { drag: true })) this.writeValues();
  }
}
