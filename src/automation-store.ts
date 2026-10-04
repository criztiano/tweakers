import {
  addPoint as addLanePoint,
  AUTOMATION_TOLERANCE,
  clearRange as clearLaneRange,
  createLane,
  deletePoint as deleteLanePoint,
  EMPTY_TIMELINE,
  laneByKey,
  mergeSpan,
  movePoint as moveLanePoint,
  removeLane,
  smooth as smoothLane,
  upsertLane,
  valueAt,
  type AutomationCursor,
  type AutomationInterp,
  type AutomationLane,
  type AutomationPoint,
  type AutomationTimeline,
} from './automation-core';
import { MoveFunctions } from './move-functions';
import { MOVE_TIMELINE_MAX_ZOOM, timelineWindow, zoomWindow } from './move-timeline';

/**
 * Automation lanes — the store between a host's clock and its controls.
 *
 * The host owns time and the document: it says where the pass is, starts the
 * transport when a take needs it, and receives every change as one commit it
 * can put on its undo. This store owns everything in between — the take in
 * progress, the hands on the controls, the working copy a take writes into,
 * the card's selection and view — and never keeps a clock of its own.
 *
 *   const lanes = new AutomationLanesStore({
 *     clock: () => ({ time: scene.time, duration: scene.length, playing: transport.running }),
 *     play: () => transport.start(),
 *     commit: (change) => history.transaction(() => save(change)),
 *   });
 *   lanes.claimRec();                       // the Move's Rec records takes
 *   lanes.load(scene.id, scene.automation); // on entering a scene, after undo, on open
 *   // every frame:
 *   lanes.tick();
 *   const values = lanes.sample();          // key → value, the hand's while it holds one
 *   // when a control moves:
 *   if (lanes.edit(key, value, { label, min, max, before })) return; // the lane took it
 *
 * Recording is overdub. A take replaces a lane only where its control was
 * moved, and keeps writing on every pass while it runs: what one pass wrote
 * plays back on the next. A control with no lane gets one at its first move,
 * flat at its value before the take. When the take ends the whole of it —
 * every timeline it wrote — is ONE commit.
 *
 * A hand wins. A touched control (`touch`, from the Move's capacitive knobs)
 * holds its value under the finger, and so does one that is being moved; it
 * goes back to its lane when the finger lifts, or `holdMs` after its last
 * move when nothing says touch (a mouse). Outside a take that is all a hand
 * does: it never writes.
 */

export interface AutomationClock {
  /** Where the pass is, in the host's seconds. */
  time: number;
  /** How long the pass is, in seconds. */
  duration: number;
  playing: boolean;
}

export type AutomationCommit =
  | { kind: 'take'; timelines: ReadonlyMap<string, AutomationTimeline> }
  | { kind: 'edit'; id: string; timeline: AutomationTimeline; coalesce?: string };

export interface AutomationHost {
  clock(): AutomationClock;
  /** Start the transport — a take started on a stopped clock rolls it. */
  play(): void;
  /** One undoable change: a whole take, or one edit made on the card. */
  commit(change: AutomationCommit): void;
}

export interface AutomationStoreOptions {
  /** How long a control with no touch feed (a mouse) stays held after its last move. */
  holdMs?: number;
  /** A touch this recent when the first move comes starts the take's write at the touch. */
  touchAuthorityMs?: number;
  /** How far a written curve may stray from the hand, as a share of the range. */
  tolerance?: number;
  /** The wall clock, in ms — for tests. */
  now?: () => number;
}

/** What the store needs to know about a control the first time it writes it. */
export interface AutomationEditMeta {
  label: string;
  min: number;
  max: number;
  /** The control's value before this move — a new lane starts flat at it. */
  before: number;
  interp?: AutomationInterp;
}

export interface AutomationSelection {
  key: string | null;
  /** A point on the selected lane, by index. */
  point: number | null;
  /** A stretch of the selected lane, in phase. */
  range: { from: number; to: number } | null;
}

export interface AutomationView {
  zoom: number;
  /** The phase at the card's left edge. */
  start: number;
}

/** A hand's stretch in progress, on the timeline in front. */
interface OpenSpan {
  from: number;
  samples: AutomationPoint[];
}

type Listener = () => void;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const NO_SELECTION: AutomationSelection = { key: null, point: null, range: null };
/** A smoothing press: one pass, or a strong one with Shift. */
const SMOOTH_AMOUNT = 1;
const SMOOTH_STRONG = 3;
/** A clock that went back more than half the pass looped; less is a seek. */
const WRAP_JUMP = 0.5;

const wallClock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export class AutomationLanesStore {
  private readonly host: AutomationHost;
  private readonly holdMs: number;
  private readonly touchAuthorityMs: number;
  private readonly tolerance: number;
  private readonly now: () => number;

  private currentId: string | null = null;
  private current: AutomationTimeline = EMPTY_TIMELINE;

  private recording = false;
  /** The timelines this take has written, by id — committed as one on its end. */
  private working = new Map<string, AutomationTimeline>();
  private takeStart = 0;
  private laps = 0;
  private spans = new Map<string, OpenSpan>();
  private lastPhase = 0;

  private touches = new Map<string, { at: number; phase: number }>();
  private hands = new Map<string, { value: number; at: number }>();
  private metas = new Map<string, AutomationEditMeta>();
  private cursors = new Map<string, AutomationCursor>();

  private selection: AutomationSelection = NO_SELECTION;
  private view: AutomationView = { zoom: 1, start: 0 };

  private listeners = new Set<Listener>();
  private version = 0;

  constructor(host: AutomationHost, options: AutomationStoreOptions = {}) {
    this.host = host;
    this.holdMs = options.holdMs ?? 300;
    this.touchAuthorityMs = options.touchAuthorityMs ?? 1500;
    this.tolerance = options.tolerance ?? AUTOMATION_TOLERANCE;
    this.now = options.now ?? wallClock;
  }

  // ── the document ──

  /**
   * The timeline in front: on entering a scene, after an undo, on opening a
   * file. A take keeps running across it — what it wrote into the timeline
   * it leaves stays in the take, closed at the end of that pass, and a hand
   * still on a control carries on writing here.
   */
  load(id: string, timeline: AutomationTimeline): void {
    const leaving = id !== this.currentId;
    if (this.recording && leaving && this.currentId !== null) this.closeSpans(1);
    this.currentId = id;
    this.current = timeline;
    this.cursors.clear();
    if (this.recording && leaving) {
      this.lastPhase = this.phase();
      for (const key of [...this.hands.keys()]) if (this.isHeld(key)) this.openSpan(key, this.lastPhase);
    }
    if (this.selection.key && !laneByKey(this.timeline(), this.selection.key)) this.selection = NO_SELECTION;
    this.notify();
  }

  /** The host's clock, read through — the card's playhead polls it every frame. */
  clock(): AutomationClock {
    return this.host.clock();
  }

  /** The id of the timeline in front, or null before the first `load`. */
  id(): string | null {
    return this.currentId;
  }

  /** The timeline in front — a take's working copy while it writes one. */
  timeline(): AutomationTimeline {
    if (this.recording && this.currentId !== null) return this.working.get(this.currentId) ?? this.current;
    return this.current;
  }

  /** Whether a control has a lane here. */
  has(key: string): boolean {
    return !!laneByKey(this.timeline(), key);
  }

  // ── the take ──

  isRecording(): boolean {
    return this.recording;
  }

  /** Start a take, rolling the transport if it stands still. */
  startTake(): void {
    if (this.recording) return;
    this.recording = true;
    this.working = new Map();
    this.spans.clear();
    this.takeStart = this.phase();
    this.lastPhase = this.takeStart;
    this.laps = 0;
    MoveFunctions.setOn('rec', true);
    if (!this.host.clock().playing) this.host.play();
    this.notify();
  }

  /** End the take: close every stretch and hand the host what it wrote, as one commit. */
  endTake(): void {
    if (!this.recording) return;
    this.closeSpans(Math.max(this.phase(), 0));
    const written = this.working;
    this.recording = false;
    MoveFunctions.setOn('rec', false);
    this.working = new Map();
    if (this.currentId !== null) this.current = written.get(this.currentId) ?? this.current;
    if (written.size) this.host.commit({ kind: 'take', timelines: written });
    this.notify();
  }

  /** Drop the take: nothing it wrote reaches the document. */
  cancelTake(): void {
    if (!this.recording) return;
    this.recording = false;
    MoveFunctions.setOn('rec', false);
    this.working = new Map();
    this.spans.clear();
    // A hand on a control the take had just given a lane has nothing to hold.
    for (const key of [...this.hands.keys()]) if (!laneByKey(this.current, key)) this.hands.delete(key);
    this.cursors.clear();
    this.notify();
  }

  toggleTake(): void {
    if (this.recording) this.endTake();
    else this.startTake();
  }

  /** Where the take started (phase) and how many times the pass has come round since. */
  take(): { from: number; laps: number } | null {
    return this.recording ? { from: this.takeStart, laps: this.laps } : null;
  }

  /** The stretch a hand is writing right now, for the card to draw. */
  liveSpan(key: string): { from: number; samples: readonly AutomationPoint[] } | undefined {
    return this.spans.get(key);
  }

  // ── the hands ──

  /**
   * A finger on a control, or off it. While it rests, a control with a lane
   * holds its value under it. Call it again while it rests to say it still
   * does (the Move's stream repeats it) — that changes nothing.
   */
  touch(key: string, on: boolean): void {
    const now = this.now();
    if (on) {
      if (this.touches.has(key)) return;
      const phase = this.phase();
      this.touches.set(key, { at: now, phase });
      const lane = laneByKey(this.timeline(), key);
      if (lane && !this.hands.has(key)) this.hands.set(key, { value: valueAt(lane, phase), at: now });
      return;
    }
    if (!this.touches.delete(key)) return;
    // Lifted: back to the lane now, not a hold later — a finger says when it goes.
    this.hands.delete(key);
    if (this.spans.has(key)) {
      this.closeSpan(key, this.phase());
      this.notify();
    }
  }

  /**
   * A control moved. Returns true when the store took the move — a take is
   * writing it, or it has a lane its hand now holds — and the host must not
   * apply it as an ordinary edit. False: not automation's business.
   */
  edit(key: string, value: number, meta: AutomationEditMeta): boolean {
    this.metas.set(key, meta);
    const now = this.now();
    let lane = laneByKey(this.timeline(), key);
    if (!this.recording || this.currentId === null) {
      if (!lane) return false;
      this.hands.set(key, { value: clamp(value, lane.min, lane.max), at: now });
      return true;
    }
    if (!lane) {
      lane = createLane(key, meta.label, meta.min, meta.max, meta.before, meta.interp);
      this.write(upsertLane(this.timeline(), lane));
      this.notify();
    }
    const v = clamp(value, lane.min, lane.max);
    const held = this.hands.get(key);
    const phase = this.phase();
    if (!this.spans.has(key)) {
      // A finger that landed just before this move starts the write where it
      // landed — what was heard from then on is what the hand held.
      const touch = this.touches.get(key);
      const from = touch && now - touch.at <= this.touchAuthorityMs && touch.phase <= phase ? touch.phase : phase;
      const before = held && this.isHeld(key) ? held.value : valueAt(lane, from);
      const samples: AutomationPoint[] = [{ t: from, v: before }];
      // Held until now, then the turn: a jump at this instant.
      if (phase > from) samples.push({ t: phase, v: before });
      this.spans.set(key, { from, samples });
    }
    this.spans.get(key)!.samples.push({ t: phase, v });
    this.hands.set(key, { value: v, at: now });
    return true;
  }

  /** Whether a hand holds this control right now — its lane is not playing. */
  isHeld(key: string): boolean {
    if (this.touches.has(key)) return this.hands.has(key);
    const hand = this.hands.get(key);
    return !!hand && this.now() - hand.at < this.holdMs;
  }

  // ── the clock ──

  /**
   * Once a frame, from the host's loop: lets go of hands that went quiet,
   * extends the stretches being written, and notices the pass coming round
   * (or a seek) when the host did not say so with `passWrapped`.
   */
  tick(time?: number): void {
    const phase = this.phase(time);
    let changed = false;
    if (this.recording && phase < this.lastPhase - 1e-6) {
      if (this.lastPhase - phase > WRAP_JUMP) {
        this.wrap();
      } else {
        // A seek back: what was written so far stays, the hands write on from here.
        this.closeSpans(this.lastPhase);
        for (const key of [...this.hands.keys()]) if (this.isHeld(key)) this.openSpan(key, phase);
      }
      changed = true;
    }
    for (const key of [...this.hands.keys()]) {
      if (this.isHeld(key)) continue;
      this.hands.delete(key);
      if (this.spans.has(key)) {
        this.closeSpan(key, phase);
        changed = true;
      }
    }
    if (this.recording) {
      for (const [key, span] of this.spans) {
        const hand = this.hands.get(key);
        const last = span.samples[span.samples.length - 1];
        if (hand && phase > last.t) span.samples.push({ t: phase, v: hand.value });
      }
    }
    this.lastPhase = phase;
    if (changed) this.notify();
  }

  /**
   * The pass came round (the host looped or re-entered it). A take keeps
   * going: what this pass wrote joins its lanes, so the next pass plays it,
   * and a hand still holding a control writes on from the top.
   */
  passWrapped(): void {
    if (this.recording) {
      this.wrap();
      this.notify();
    }
    this.lastPhase = 0;
  }

  // ── reading ──

  /**
   * Every lane's value now, by key — a hand's while it holds the control.
   * Read once a frame; the host's playback reads this, not the lanes.
   */
  sample(time?: number): ReadonlyMap<string, number> {
    const phase = this.phase(time);
    const out = new Map<string, number>();
    for (const lane of this.timeline().lanes) out.set(lane.key, this.read(lane, phase));
    return out;
  }

  /** One control's value now: its hand's, else its lane's; undefined with neither. */
  valueFor(key: string, time?: number): number | undefined {
    const lane = laneByKey(this.timeline(), key);
    return lane ? this.read(lane, this.phase(time)) : undefined;
  }

  // ── editing on the card — each one undoable, each refused while a take writes ──

  /** Move a point; a drag passes `drag` so its steps are one undo. */
  movePoint(key: string, index: number, t: number, v: number, options: { drag?: boolean } = {}): boolean {
    return this.editLane(key, (lane) => moveLanePoint(lane, index, t, v), options.drag ? `auto:${key}:drag` : undefined);
  }

  /** Add a point at `t` (on the curve unless `v` is given); returns its index, or -1. */
  addPoint(key: string, t: number, v?: number): number {
    let at = -1;
    this.editLane(key, (lane) => {
      const added = addLanePoint(lane, t, v);
      at = added.index;
      return added.lane;
    });
    if (at >= 0) this.select({ key, point: at });
    return at;
  }

  deletePoint(key: string, index: number): boolean {
    const done = this.editLane(key, (lane) => deleteLanePoint(lane, index));
    if (done && this.selection.key === key) this.select({ key });
    return done;
  }

  /** Clear a stretch of a lane to a straight run across it. */
  clearRange(key: string, from: number, to: number): boolean {
    const done = this.editLane(key, (lane) => clearLaneRange(lane, from, to));
    if (done) this.select({ key });
    return done;
  }

  /** One smoothing pass — over the selected stretch when the lane has one. */
  smooth(key: string, strong = false): boolean {
    const range = this.selection.key === key ? this.selection.range ?? undefined : undefined;
    const done = this.editLane(key, (lane) => ({ ...lane, points: smoothLane(lane, strong ? SMOOTH_STRONG : SMOOTH_AMOUNT, range, this.tolerance) }));
    // The points were all redrawn: a selected one is no longer the one it was.
    if (done && this.selection.key === key) this.select({ key, range });
    return done;
  }

  /** Delete a lane: the control is its slider's again. */
  deleteLane(key: string): boolean {
    const done = this.editLane(key, () => null);
    if (done) {
      this.hands.delete(key);
      if (this.selection.key === key) this.selection = NO_SELECTION;
      this.notify();
    }
    return done;
  }

  // ── the card's own state ──

  getSelection(): AutomationSelection {
    return this.selection;
  }

  select(next: { key?: string | null; point?: number | null; range?: { from: number; to: number } | null }): void {
    const key = next.key ?? null;
    const lane = key ? laneByKey(this.timeline(), key) : undefined;
    const point = lane && next.point != null && next.point >= 0 && next.point < lane.points.length ? next.point : null;
    const range = lane && next.range && Math.abs(next.range.to - next.range.from) > 1e-6
      ? { from: clamp(Math.min(next.range.from, next.range.to), 0, 1), to: clamp(Math.max(next.range.from, next.range.to), 0, 1) }
      : null;
    const selection: AutomationSelection = lane ? { key, point, range } : NO_SELECTION;
    const same = selection.key === this.selection.key && selection.point === this.selection.point
      && selection.range?.from === this.selection.range?.from && selection.range?.to === this.selection.range?.to;
    if (same) return;
    this.selection = selection;
    this.notify();
  }

  getView(): AutomationView {
    return this.view;
  }

  /** The stretch of the pass on the card, in phase. */
  getWindow(): { start: number; span: number } {
    return timelineWindow(1, this.view.zoom, this.view.start);
  }

  /** Zoom around `anchor` (a phase) — the pointer for a pinch. */
  zoomTo(zoom: number, anchor: number): void {
    const next = zoomWindow(anchor, 1, this.view.zoom, this.view.start, zoom);
    this.setView(next.zoom, next.start);
  }

  panTo(start: number): void {
    this.setView(this.view.zoom, start);
  }

  resetView(): void {
    this.setView(1, 0);
  }

  // ── the hardware ──

  /**
   * The Move's Rec key records takes until the returned release: Rec starts
   * and ends one, Shift + Rec drops the one running. Pushed, so whatever had
   * Rec before gets it back on release; the newest claim on Rec wins, so do
   * not put a `MoveTimeline` with `onRecord` up beside it. No knob, no wheel.
   */
  claimRec(options: { label?: string } = {}): () => void {
    return MoveFunctions.push(
      'rec',
      ({ shift }) => (shift && this.recording ? this.cancelTake() : this.toggleTake()),
      { label: options.label ?? 'Record', chip: false }
    );
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  getVersion(): number {
    return this.version;
  }

  // ── internals ──

  /** The pass's phase at `time` (seconds), or now. */
  private phase(time?: number): number {
    const clock = this.host.clock();
    const t = time ?? clock.time;
    return clock.duration > 0 && Number.isFinite(t) ? clamp(t / clock.duration, 0, 1) : 0;
  }

  private read(lane: AutomationLane, phase: number): number {
    const hand = this.hands.get(lane.key);
    if (hand && this.isHeld(lane.key)) return hand.value;
    let cursor = this.cursors.get(lane.key);
    if (!cursor) this.cursors.set(lane.key, (cursor = { index: 0 }));
    return valueAt(lane, phase, cursor);
  }

  /** Put a timeline in front: into the take while one writes, else as the document's. */
  private write(timeline: AutomationTimeline): void {
    if (this.currentId === null) return;
    if (this.recording) this.working.set(this.currentId, timeline);
    else this.current = timeline;
  }

  private openSpan(key: string, phase: number): void {
    const hand = this.hands.get(key);
    if (!hand || this.spans.has(key)) return;
    if (!laneByKey(this.timeline(), key)) {
      const meta = this.metas.get(key);
      if (!meta) return;
      this.write(upsertLane(this.timeline(), createLane(key, meta.label, meta.min, meta.max, meta.before, meta.interp)));
    }
    this.spans.set(key, { from: phase, samples: [{ t: phase, v: hand.value }] });
  }

  /** Close a hand's stretch at `phase` and lay it into its lane. */
  private closeSpan(key: string, phase: number): void {
    const span = this.spans.get(key);
    this.spans.delete(key);
    if (!span) return;
    const lane = laneByKey(this.timeline(), key);
    if (!lane) return;
    const last = span.samples[span.samples.length - 1];
    const to = Math.max(phase, last.t);
    if (to > last.t) span.samples.push({ t: to, v: last.v });
    this.write(upsertLane(this.timeline(), mergeSpan(lane, { from: span.from, to, samples: span.samples }, this.tolerance)));
    this.cursors.delete(key);
  }

  private closeSpans(phase: number): void {
    for (const key of [...this.spans.keys()]) this.closeSpan(key, phase);
  }

  /** The pass came round mid-take: close at its end, write on from its start. */
  private wrap(): void {
    const writing = [...this.spans.keys()];
    this.closeSpans(1);
    this.laps += 1;
    for (const key of writing) if (this.isHeld(key)) this.openSpan(key, 0);
    this.lastPhase = 0;
  }

  /** One edit on the card: the lane in front, changed and committed as one undo. */
  private editLane(key: string, change: (lane: AutomationLane) => AutomationLane | null, coalesce?: string): boolean {
    if (this.recording || this.currentId === null) return false;
    const lane = laneByKey(this.current, key);
    if (!lane) return false;
    const next = change(lane);
    if (next === lane) return false;
    const timeline = next ? upsertLane(this.current, next) : removeLane(this.current, key);
    this.current = timeline;
    this.cursors.delete(key);
    this.host.commit({ kind: 'edit', id: this.currentId, timeline, ...(coalesce ? { coalesce } : {}) });
    this.notify();
    return true;
  }

  private setView(zoom: number, start: number): void {
    const nextZoom = clamp(zoom, 1, MOVE_TIMELINE_MAX_ZOOM);
    const nextStart = timelineWindow(1, nextZoom, start).start;
    if (nextZoom === this.view.zoom && nextStart === this.view.start) return;
    this.view = { zoom: nextZoom, start: nextStart };
    this.notify();
  }

  private notify(): void {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
}
