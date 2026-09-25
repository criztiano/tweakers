import { MoveColorStore } from './move-color';
import { MoveFunctions } from './move-functions';
import { MovePresetStore } from './move-presets';
import { MoveSearchStore } from './move-search';
import { MoveSurfaceStore } from './move-surface-store';
import { MoveVolumeDisplay, type MoveVolumeDisplayState } from './move-volume';
import { MoveWaveformStore, scrubBy, zoomBy } from './move-waveform';
import { PresetExplorationStore } from './preset-exploration';
import { TimelineStore } from './store/TimelineStore';

/**
 * A timeline on the Move surface.
 *
 * The timeline runtime (`useMoveTimeline`, `TimelineStore`) keeps the clock and
 * the clips; this gives one of them the instrument. The hands are the ones a
 * sample already has, because a timeline is the same gesture over a longer
 * thing: the volume knob scrubs the playhead, the big wheel zooms, its press
 * shows the whole timeline again. The transport lives on the printed keys —
 * Play runs it, Loop switches looping (Shift + Loop lets a loop region go),
 * Rec records when the app says what recording means — and the panel's clock
 * wears all three.
 *
 * One timeline holds the surface at a time: there is one knob. The newest
 * claim is in front; an older one waits under it and gets the hands back when
 * the front one lets go.
 *
 * The window maths is pure and exported — how far a detent travels and where
 * the view turns its page decide how the instrument feels.
 */

/** How far in the wheel goes: a few frames of a long take across the card. */
export const MOVE_TIMELINE_MAX_ZOOM = 256;

/** Where a playhead that walked off the window lands when the page turns —
 *  a quarter in, so the view keeps some of what just played. */
const PAGE_LEAD = 0.25;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The stretch on screen: 1/zoom of the timeline from `start`, kept inside it. */
export function timelineWindow(duration: number, zoom: number, start: number): { start: number; span: number } {
  const whole = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const span = whole / Math.max(1, zoom);
  return { start: clamp(Number.isFinite(start) ? start : 0, 0, Math.max(0, whole - span)), span };
}

/**
 * Where the window starts so the playhead stays on it. A playhead on screen
 * moves nothing — a view that slides under a moving hand is a view nobody can
 * read. One that leaves turns the page: forward it lands a quarter in, backward
 * a quarter from the end, so the way it came stays in sight.
 */
export function followWindow(time: number, duration: number, zoom: number, start: number): number {
  const w = timelineWindow(duration, zoom, start);
  if (w.span <= 0 || time >= w.start && time <= w.start + w.span) return w.start;
  const lead = time < w.start ? w.span * (1 - PAGE_LEAD) : w.span * PAGE_LEAD;
  return timelineWindow(duration, zoom, time - lead).start;
}

/**
 * The window at a new zoom, holding `anchor` where it stands on screen — the
 * playhead for the wheel, the pointer for a pinch. An anchor off screen zooms
 * around the middle of what is shown.
 */
export function zoomWindow(anchor: number, duration: number, zoom: number, start: number, nextZoom: number): { zoom: number; start: number } {
  const next = clamp(nextZoom, 1, MOVE_TIMELINE_MAX_ZOOM);
  const w = timelineWindow(duration, zoom, start);
  const onScreen = w.span > 0 && anchor >= w.start && anchor <= w.start + w.span;
  const at = onScreen ? anchor : w.start + w.span / 2;
  const ratio = w.span > 0 ? (at - w.start) / w.span : 0;
  const nextSpan = timelineWindow(duration, next, 0).span;
  return { zoom: next, start: timelineWindow(duration, next, at - ratio * nextSpan).start };
}

/** The ruler's steps, in seconds — each a round number a reader can count by. */
const TICK_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

/**
 * The ruler for a window `width` pixels wide: numbered ticks about `spacing`
 * apart on a round step, and unnumbered ones between them.
 */
export function timelineTicks(start: number, span: number, width: number, spacing = 96): { step: number; major: number[]; minor: number[] } {
  if (!(span > 0) || !(width > 0)) return { step: 1, major: [], minor: [] };
  const wanted = (spacing / width) * span;
  const step = TICK_STEPS.find((s) => s >= wanted) ?? TICK_STEPS[TICK_STEPS.length - 1];
  const leading = Number(String(step).replace(/[0.]/g, '')[0]);
  const parts = step === 15 ? 3 : leading === 2 ? 4 : 5;
  const minorStep = step / parts;
  const major: number[] = [];
  const minor: number[] = [];
  const first = Math.ceil((start - 1e-9) / minorStep);
  const last = Math.floor((start + span + 1e-9) / minorStep);
  for (let i = first; i <= last; i++) {
    const t = Number((i * minorStep).toFixed(6));
    (i % parts === 0 ? major : minor).push(t);
  }
  return { step, major, minor };
}

/** A ruler number: minutes and seconds on whole steps, seconds below them. */
export function formatTimelineTick(time: number, step: number): string {
  if (step >= 1) return `${Math.floor(time / 60)}:${String(Math.round(time % 60)).padStart(2, '0')}`;
  const decimals = step >= 0.1 ? 1 : 2;
  return `${time.toFixed(decimals)}s`;
}

/**
 * A layer's clips, packed into as few rows as they need: each clip takes the
 * first row where it overlaps nothing, in the order given. A layer whose
 * clips never meet is one row — the Move's display has height for a handful
 * of rows, not one per clip. Clips are placed earliest first; the rows come
 * back in the order the spans were given.
 */
export function packTimelineRows(spans: readonly { at: number; end: number }[]): number[] {
  const rowEnds: number[] = [];
  const rows = new Array<number>(spans.length);
  const order = spans.map((_, i) => i).sort((a, b) => spans[a].at - spans[b].at || a - b);
  for (const i of order) {
    const { at, end } = spans[i];
    let row = rowEnds.findIndex((rowEnd) => rowEnd <= at + 1e-9);
    if (row < 0) row = rowEnds.push(end) - 1;
    else rowEnds[row] = end;
    rows[i] = row;
  }
  return rows;
}

/**
 * How tall a row is, in px, for this many rows. The card keeps its roomy
 * rows until the layers crowd it — six rows go to 14px, eight to 10px — so
 * a growing edit costs the screen above it as little height as it can.
 * `compact` is the screen's own choice: 4px rows, shapes only, no names.
 */
export function timelineRowHeight(rows: number, compact = false): 18 | 14 | 10 | 4 {
  if (compact) return 4;
  if (rows >= 8) return 10;
  if (rows >= 6) return 14;
  return 18;
}

/** The panel's clock: m:ss:cc — the waveform's, so every transport reads alike. */
export function timelineClock(time: number): string {
  const t = Math.max(0, Number.isFinite(time) ? time : 0);
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(Math.floor((t % 1) * 100)).padStart(2, '0')}`;
}

/** What the knob names on the Move's screen: m:ss.s, as the waveform's readout. */
function timelineReadout(time: number): string {
  const t = Math.max(0, time);
  const minutes = Math.floor(t / 60);
  const seconds = t - minutes * 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds.toFixed(1)}`;
}

export interface MoveTimelineClaimOptions {
  /**
   * What recording means in this app. With it the Rec key is the timeline's
   * and the clock carries a record button; the handler hears `true` when a
   * take starts and `false` when it ends — on Rec again, or when the
   * transport stops under it. Without it, Rec stays unclaimed: a lit key
   * that records nothing is a lie.
   */
  onRecord?: (recording: boolean) => void;
}

type Listener = () => void;
type Claim = { id: string; options: MoveTimelineClaimOptions };

/** The overlays that own the wheel while they stand — read from their stores,
 *  never from listener order. */
const wheelTaken = () => {
  const presets = MovePresetStore.getView();
  return (
    MoveSearchStore.isOpen() ||
    (!!presets && presets.phase !== 'closing') ||
    !!MoveColorStore.getView() ||
    !!PresetExplorationStore.getState() ||
    !!MoveSurfaceStore.getState().screen ||
    MoveWaveformStore.wantsSteps()
  );
};

const VOLUME_EVENT = 'move-tweakers:volume';
const JOG_EVENT = 'move-tweakers:jog';
const JOG_CLICK_EVENT = 'move-tweakers:jog-click';

class MoveTimelineStoreClass {
  private claims: Claim[] = [];
  private zoom = 1;
  private start = 0;
  private recording = false;
  private recordFrom = 0;
  private teardown: (() => void) | null = null;
  private listeners = new Set<Listener>();
  private version = 0;

  /**
   * Put a timeline on the surface: the knob, the wheel and the transport keys
   * are its until the returned release. The knob names itself as the
   * timeline's time, on the panel and on the Move's screen.
   */
  register(id: string, options: MoveTimelineClaimOptions = {}): () => void {
    const claim: Claim = { id, options };
    this.claims.push(claim);
    this.hold(claim);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const front = this.front() === claim;
      this.claims = this.claims.filter((c) => c !== claim);
      if (!front) return;
      const next = this.front();
      if (next) this.hold(next);
      else this.letGo();
    };
  }

  /** The timeline holding the surface, or null. */
  activeId(): string | null {
    return this.front()?.id ?? null;
  }

  isRegistered(): boolean {
    return this.claims.length > 0;
  }

  /** True while a timeline holds the volume knob — read by the kit's claims. */
  claimsKnob(): boolean {
    return this.claims.length > 0;
  }

  /** Whether the timeline in front records — the clock's Rec button follows. */
  canRecord(): boolean {
    return !!this.front()?.options.onRecord;
  }

  isRecording(): boolean {
    return this.recording;
  }

  /** Where the take in progress started, in seconds. */
  recordingFrom(): number {
    return this.recordFrom;
  }

  getZoom(): number {
    return this.zoom;
  }

  /** The window on screen for the timeline in front. */
  getWindow(): { start: number; span: number } {
    const id = this.activeId();
    return timelineWindow(id ? TimelineStore.getTransport(id).duration : 0, this.zoom, this.start);
  }

  /** The clock the panel shows: m:ss:cc of the playhead. */
  clock(): string {
    const id = this.activeId();
    return timelineClock(id ? TimelineStore.getTransport(id).time : 0);
  }

  // ── the transport, as the keys and the clock run it ──

  togglePlay(): void {
    const id = this.activeId();
    if (!id) return;
    if (TimelineStore.getTransport(id).playing) TimelineStore.pause(id);
    else TimelineStore.play(id);
  }

  toggleLoop(): void {
    const id = this.activeId();
    if (id) TimelineStore.setLooping(id, !TimelineStore.isLooping(id));
  }

  /** Let the loop region go — looping, if on, runs the whole timeline again. */
  clearLoopRegion(): void {
    const id = this.activeId();
    if (id) TimelineStore.clearLoopRegion(id);
  }

  /** Start a take (rolling the transport if it stands still), or end the one running. */
  toggleRecord(): void {
    const claim = this.front();
    if (!claim?.options.onRecord) return;
    if (this.recording) {
      this.stopRecording();
      return;
    }
    const transport = TimelineStore.getTransport(claim.id);
    this.recording = true;
    this.recordFrom = transport.time >= transport.duration ? 0 : transport.time;
    this.notify();
    claim.options.onRecord(true);
    if (!transport.playing) TimelineStore.play(claim.id);
  }

  // ── the hands ──

  /** The volume knob: the waveform's scrub — its feel, over the shown window. */
  scrub(delta: number, fine = false): void {
    const id = this.activeId();
    if (!id || !delta) return;
    const { time, duration } = TimelineStore.getTransport(id);
    if (duration <= 0) return;
    const at = scrubBy(time / duration, delta, fine, this.zoom, duration) * duration;
    TimelineStore.seek(id, at);
  }

  /** The wheel: proportional zoom, around the playhead. */
  zoomBy(delta: number): void {
    const id = this.activeId();
    if (!id || !delta) return;
    const { time } = TimelineStore.getTransport(id);
    this.zoomTo(zoomBy(this.zoom, delta), time);
  }

  /** Zoom to a level around `anchor` seconds — the playhead, or a pointer. */
  zoomTo(zoom: number, anchor: number): void {
    const id = this.activeId();
    if (!id) return;
    const { duration } = TimelineStore.getTransport(id);
    const next = zoomWindow(anchor, duration, this.zoom, this.start, zoom);
    this.setView(next.zoom, next.start);
  }

  /** Slide the window to start at `start` seconds, keeping the zoom. */
  panTo(start: number): void {
    this.setView(this.zoom, start);
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

  private front(): Claim | undefined {
    return this.claims[this.claims.length - 1];
  }

  private setView(zoom: number, start: number): void {
    const id = this.activeId();
    const duration = id ? TimelineStore.getTransport(id).duration : 0;
    const nextZoom = clamp(zoom, 1, MOVE_TIMELINE_MAX_ZOOM);
    const nextStart = timelineWindow(duration, nextZoom, start).start;
    if (nextZoom === this.zoom && nextStart === this.start) return;
    this.zoom = nextZoom;
    this.start = nextStart;
    this.notify();
  }

  private stopRecording(): void {
    if (!this.recording) return;
    this.recording = false;
    this.notify();
    this.front()?.options.onRecord?.(false);
  }

  /** Wire the hardware to `claim`, replacing whatever held it. */
  private hold(claim: Claim): void {
    this.letGo(claim);
    const { id } = claim;

    // The knob says what it is doing, on the panel and the Move's screen.
    const readout: MoveVolumeDisplayState = {
      label: 'time',
      getValue: () => timelineReadout(TimelineStore.getTransport(id).time),
    };
    MoveVolumeDisplay.set(readout);

    // The keys. Pushed, so whatever the app had on them comes back; no chips,
    // because the clock already carries all three. Pushing after the claim is
    // in the list matters: the kit reconfigures on a key change, and that
    // configure is where it reads the knob claim.
    const keys = [
      MoveFunctions.push('play', () => this.togglePlay(), { label: 'Play', chip: false }),
      MoveFunctions.push('loop', ({ shift }) => (shift ? this.clearLoopRegion() : this.toggleLoop()), { label: 'Loop', chip: false }),
      ...(claim.options.onRecord ? [MoveFunctions.push('rec', () => this.toggleRecord(), { label: 'Record', chip: false })] : []),
    ];

    const onVolume = (event: Event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      const detail = (event as CustomEvent).detail ?? {};
      this.scrub(Number(detail.delta) || 0, !!detail.shift);
    };
    // The wheel is the timeline's last: a list, a scrolling strip or a wait
    // may all be listening, in whatever order they were added. So the
    // timeline never takes the turn — it acts after every listener has had
    // it, and only on a turn nobody else took.
    const unclaimed = (event: Event, act: () => void) => {
      if (event.defaultPrevented || wheelTaken()) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented && !wheelTaken() && this.activeId() === id) act();
      });
    };
    const onJog = (event: Event) =>
      unclaimed(event, () => this.zoomBy(Number((event as CustomEvent).detail?.delta) || 0));
    const onJogClick = (event: Event) => unclaimed(event, () => this.setView(1, 0));
    const win = typeof window !== 'undefined' ? window : null;
    win?.addEventListener(VOLUME_EVENT, onVolume);
    win?.addEventListener(JOG_EVENT, onJog);
    win?.addEventListener(JOG_CLICK_EVENT, onJogClick);

    // The transport: the view follows the playhead, and a take ends when the
    // transport stops under it.
    const offTransport = TimelineStore.subscribe(id, () => {
      const transport = TimelineStore.getTransport(id);
      if (this.recording && !transport.playing) this.stopRecording();
      const start = followWindow(transport.time, transport.duration, this.zoom, this.start);
      if (start !== this.start) this.setView(this.zoom, start);
    });

    this.zoom = 1;
    this.start = 0;
    this.teardown = () => {
      offTransport();
      win?.removeEventListener(VOLUME_EVENT, onVolume);
      win?.removeEventListener(JOG_EVENT, onJog);
      win?.removeEventListener(JOG_CLICK_EVENT, onJogClick);
      if (this.recording) {
        this.recording = false;
        claim.options.onRecord?.(false);
      }
      for (const release of keys) release();
      if (MoveVolumeDisplay.get() === readout) MoveVolumeDisplay.clear();
    };
    this.notify();
  }

  /** Hand the hardware back. `next` is the claim about to take it, if any. */
  private letGo(next?: Claim): void {
    const teardown = this.teardown;
    this.teardown = null;
    teardown?.();
    if (!next) this.notify();
  }

  private notify(): void {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
}

export const MoveTimelineStore = new MoveTimelineStoreClass();
