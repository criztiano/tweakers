import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  followWindow,
  formatTimelineTick,
  MOVE_TIMELINE_MAX_ZOOM,
  MoveTimelineStore,
  packTimelineRows,
  timelineClock,
  timelineRowHeight,
  timelineTicks,
  timelineWindow,
  zoomWindow,
} from '../src/move-timeline';
import { MoveFunctions } from '../src/move-functions';
import { moveKitOptions } from '../src/move-kit';
import { MoveSurfaceStore } from '../src/move-surface-store';
import { MoveVolumeDisplay } from '../src/move-volume';
import { TimelineStore } from '../src/store/TimelineStore';

// A timeline on the Move: the window maths that decides what the card shows,
// and the claim that hands a timeline the knob, the wheel and the transport.

describe('the window', () => {
  it('shows 1/zoom of the timeline and never runs past either end', () => {
    expect(timelineWindow(24, 1, 5)).toEqual({ start: 0, span: 24 });
    expect(timelineWindow(24, 4, 10)).toEqual({ start: 10, span: 6 });
    expect(timelineWindow(24, 4, 22)).toEqual({ start: 18, span: 6 });
    expect(timelineWindow(24, 4, -3)).toEqual({ start: 0, span: 6 });
    expect(timelineWindow(0, 4, 3)).toEqual({ start: 0, span: 0 });
  });

  it('holds still while the playhead is on screen, and turns the page when it leaves', () => {
    expect(followWindow(12, 24, 4, 10)).toBe(10);
    // Forward: the playhead lands a quarter in.
    expect(followWindow(16.5, 24, 4, 10)).toBeCloseTo(15, 6);
    // Backward: a quarter from the end, so the way it came stays in sight.
    expect(followWindow(8, 24, 4, 10)).toBeCloseTo(3.5, 6);
    expect(followWindow(23.9, 24, 4, 10)).toBe(18);
  });

  it('zooms around the anchor where it stands, or the middle when it is off screen', () => {
    const next = zoomWindow(12, 24, 2, 6, 4);
    expect(next.zoom).toBe(4);
    // The anchor sat halfway across a 12s window; it sits halfway across the 6s one.
    expect(next.start).toBeCloseTo(9, 6);
    const off = zoomWindow(1, 24, 2, 6, 4);
    expect(off.start).toBeCloseTo(9, 6);
    expect(zoomWindow(12, 24, 1, 0, 10_000).zoom).toBe(MOVE_TIMELINE_MAX_ZOOM);
    expect(zoomWindow(12, 24, 2, 6, 0.2)).toEqual({ zoom: 1, start: 0 });
  });
});

describe('the ruler', () => {
  it('counts by a round step about the spacing apart, with ticks between', () => {
    const ruler = timelineTicks(0, 24, 736);
    expect(ruler.step).toBe(5);
    expect(ruler.major).toEqual([0, 5, 10, 15, 20]);
    expect(ruler.minor).toContain(1);
    expect(ruler.minor).not.toContain(5);
  });

  it('keeps counting cleanly when zoomed into a fraction of a second', () => {
    const ruler = timelineTicks(3.1, 0.5, 736);
    expect(ruler.step).toBe(0.1);
    expect(ruler.major).toEqual([3.1, 3.2, 3.3, 3.4, 3.5, 3.6]);
    expect(formatTimelineTick(3.2, ruler.step)).toBe('3.2s');
    expect(formatTimelineTick(75, 15)).toBe('1:15');
  });

  it('draws nothing it cannot place', () => {
    expect(timelineTicks(0, 0, 736)).toEqual({ step: 1, major: [], minor: [] });
    expect(timelineTicks(0, 10, 0)).toEqual({ step: 1, major: [], minor: [] });
  });
});

describe('a layer', () => {
  it('is one row until its clips overlap, placed earliest first', () => {
    expect(packTimelineRows([{ at: 0, end: 2 }, { at: 3, end: 4 }, { at: 5, end: 9 }])).toEqual([0, 0, 0]);
    expect(packTimelineRows([{ at: 0, end: 4 }, { at: 3, end: 5 }, { at: 4, end: 6 }])).toEqual([0, 1, 0]);
    // Config order is not time order: the rows still pack.
    expect(packTimelineRows([{ at: 6, end: 8 }, { at: 0, end: 2 }])).toEqual([0, 0]);
  });
});

it('thins its rows as layers pile up, and squeezes them on request', () => {
  expect(timelineRowHeight(1)).toBe(18);
  expect(timelineRowHeight(5)).toBe(18);
  expect(timelineRowHeight(6)).toBe(14);
  expect(timelineRowHeight(7)).toBe(14);
  expect(timelineRowHeight(8)).toBe(10);
  expect(timelineRowHeight(30)).toBe(10);
  expect(timelineRowHeight(2, true)).toBe(4);
});

it('reads the clock as m:ss:cc', () => {
  expect(timelineClock(0)).toBe('0:00:00');
  expect(timelineClock(83.456)).toBe('1:23:45');
  expect(timelineClock(-1)).toBe('0:00:00');
});

describe('playing once', () => {
  beforeEach(() => {
    vi.stubGlobal('window', Object.assign(new EventTarget(), { requestAnimationFrame: () => 1 }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('runs to the end and stops on it, and plays again from the top', () => {
    const id = 'plays-once';
    TimelineStore.register({ id, name: id, duration: 2, loop: false, loopStart: 0, clips: [] }, { autoplay: false });
    expect(TimelineStore.isLooping(id)).toBe(true);
    TimelineStore.setLooping(id, false);
    TimelineStore.seek(id, 1.5);
    TimelineStore.play(id);
    (TimelineStore as unknown as { tick: (now: number) => void }).tick(performance.now() + 1000);
    expect(TimelineStore.getTransport(id)).toMatchObject({ time: 2, playing: false });
    TimelineStore.play(id);
    expect(TimelineStore.getTransport(id)).toMatchObject({ time: 0, playing: true });
    TimelineStore.pause(id);
    TimelineStore.unregister(id);
  });
});

describe('a timeline on the surface', () => {
  const id = 'surface-timeline';
  let target: EventTarget;
  const turn = (delta: number, shift = false) =>
    !target.dispatchEvent(new CustomEvent('move-tweakers:volume', { detail: { delta, shift }, cancelable: true }));
  const jog = (delta: number) =>
    !target.dispatchEvent(new CustomEvent('move-tweakers:jog', { detail: { delta }, cancelable: true }));

  beforeEach(() => {
    target = Object.assign(new EventTarget(), { requestAnimationFrame: () => 1 });
    vi.stubGlobal('window', target);
    TimelineStore.register({ id, name: id, duration: 24, loop: false, loopStart: 0, clips: [] }, { autoplay: false });
  });
  afterEach(() => {
    TimelineStore.unregister(id);
    MoveSurfaceStore.reset();
    vi.unstubAllGlobals();
  });

  it('takes the transport keys, names the knob, and hands both back', () => {
    const release = MoveTimelineStore.register(id);
    expect(MoveTimelineStore.claimsKnob()).toBe(true);
    expect(MoveFunctions.list()).toEqual(expect.arrayContaining(['play', 'loop']));
    // No record handler, no Rec: a lit key that records nothing is a lie.
    expect(MoveFunctions.list()).not.toContain('rec');
    expect(MoveVolumeDisplay.get()?.label).toBe('time');
    // The keys carry no chips — the clock already wears all three.
    expect(MoveFunctions.chips().map((c) => c.name)).not.toContain('loop');

    MoveFunctions.run('play');
    expect(TimelineStore.getTransport(id).playing).toBe(true);
    MoveFunctions.run('play');
    expect(TimelineStore.getTransport(id).playing).toBe(false);
    MoveFunctions.run('loop');
    expect(TimelineStore.isLooping(id)).toBe(false);
    MoveFunctions.run('loop');
    TimelineStore.setLoopRegion(id, 2, 4);
    MoveFunctions.run('loop', { shift: true });
    expect(TimelineStore.getLoopRegion(id)).toBeUndefined();

    release();
    expect(MoveTimelineStore.claimsKnob()).toBe(false);
    expect(MoveFunctions.list()).not.toContain('play');
    expect(MoveVolumeDisplay.get()).toBeNull();
    expect(turn(1)).toBe(false);
  });

  it('scrubs on the volume knob with the waveform’s feel, and consumes the turn', () => {
    const release = MoveTimelineStore.register(id);
    TimelineStore.seek(id, 10);
    expect(turn(1)).toBe(true);
    // A slow detent on a 24s timeline: the 25ms floor.
    expect(TimelineStore.getTransport(id).time).toBeCloseTo(10.025, 4);
    turn(-1, true);
    expect(TimelineStore.getTransport(id).time).toBeCloseTo(10.02, 4);
    release();
  });

  it('zooms on the wheel around the playhead — only on a turn nobody else took', async () => {
    const release = MoveTimelineStore.register(id);
    TimelineStore.seek(id, 12);
    // Never consumed: whoever else listens keeps first claim on the wheel.
    expect(jog(10)).toBe(false);
    await Promise.resolve();
    expect(MoveTimelineStore.getZoom()).toBeGreaterThan(2);
    const w = MoveTimelineStore.getWindow();
    expect(12).toBeGreaterThanOrEqual(w.start);
    expect(12).toBeLessThanOrEqual(w.start + w.span);

    // A scrolling strip that answers the wheel — added AFTER the timeline.
    const zoom = MoveTimelineStore.getZoom();
    const strip = (e: Event) => e.preventDefault();
    target.addEventListener('move-tweakers:jog', strip);
    expect(jog(4)).toBe(true);
    await Promise.resolve();
    expect(MoveTimelineStore.getZoom()).toBe(zoom);
    target.removeEventListener('move-tweakers:jog', strip);

    // A list on the wheel screen has it too.
    MoveSurfaceStore.setScreen({ items: ['One', 'Two'], index: 0 });
    jog(4);
    await Promise.resolve();
    expect(MoveTimelineStore.getZoom()).toBe(zoom);
    release();
  });

  it('records when the app says what recording means, and a stopped transport ends the take', () => {
    const heard: boolean[] = [];
    const release = MoveTimelineStore.register(id, { onRecord: (on) => heard.push(on) });
    expect(MoveFunctions.list()).toContain('rec');
    TimelineStore.seek(id, 3);
    MoveFunctions.run('rec');
    expect(MoveTimelineStore.isRecording()).toBe(true);
    expect(MoveTimelineStore.recordingFrom()).toBe(3);
    // Recording rolls a standing transport.
    expect(TimelineStore.getTransport(id).playing).toBe(true);
    TimelineStore.pause(id);
    expect(MoveTimelineStore.isRecording()).toBe(false);
    expect(heard).toEqual([true, false]);
    release();
  });

  it('gives the hands to the newest timeline, and back to the one underneath', () => {
    const other = 'surface-timeline-2';
    TimelineStore.register({ id: other, name: other, duration: 8, loop: false, loopStart: 0, clips: [] }, { autoplay: false });
    const first = MoveTimelineStore.register(id);
    const second = MoveTimelineStore.register(other);
    expect(MoveTimelineStore.activeId()).toBe(other);
    MoveFunctions.run('play');
    expect(TimelineStore.getTransport(other).playing).toBe(true);
    expect(TimelineStore.getTransport(id).playing).toBe(false);
    TimelineStore.pause(other);
    second();
    expect(MoveTimelineStore.activeId()).toBe(id);
    expect(MoveFunctions.list()).toContain('play');
    first();
    TimelineStore.unregister(other);
  });

  it('claims the volume knob in the kit’s configure while a timeline holds it', () => {
    const options = moveKitOptions();
    // The kit spreads the claims into each configure; the spread reads them live.
    expect({ ...options.claims }.master).toBeUndefined();
    const release = MoveTimelineStore.register(id);
    expect({ ...options.claims }.master).toBe(true);
    release();
    expect(JSON.parse(JSON.stringify({ ...options.claims }))).toEqual({});
    // An app's own claims ride inside, and its master stands on its own.
    const app = moveKitOptions({ claims: { pads: true, master: true } });
    expect({ ...app.claims }).toEqual({ pads: true, master: true });
    expect(moveKitOptions({ claims: null }).claims).toBeNull();
  });
});
