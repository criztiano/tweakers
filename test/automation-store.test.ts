import { describe, expect, it, vi } from 'vitest';
import { createLane, laneByKey, valueAt, valueBefore, type AutomationTimeline } from '../src/automation-core';
import { AutomationLanesStore, type AutomationCommit } from '../src/automation-store';
import { MoveFunctions } from '../src/move-functions';

// The store between a host's clock and its controls, run on a fake clock: a
// pass of `duration` seconds that the test walks a frame at a time.

const META = { label: 'Chaos', min: 0, max: 10, before: 5 };
const FRAME = 1 / 60;

function rig(duration = 2) {
  const clock = { time: 0, duration, playing: false };
  let ms = 0;
  const commits: AutomationCommit[] = [];
  const play = vi.fn(() => {
    clock.playing = true;
  });
  const store = new AutomationLanesStore({ clock: () => clock, play, commit: (c) => commits.push(c) }, { now: () => ms });
  /** Walk the clock forward by `seconds`, a frame at a time, looping the pass. */
  const run = (seconds: number, each?: (time: number) => void) => {
    const frames = Math.round(seconds / FRAME);
    for (let i = 0; i < frames; i++) {
      clock.time += FRAME;
      if (clock.time >= clock.duration) clock.time -= clock.duration;
      ms += FRAME * 1000;
      each?.(clock.time);
      store.tick();
    }
  };
  return { clock, store, commits, play, run, wait: (m: number) => (ms += m) };
}

const flat = (key = 'in:chaos', base = 5): AutomationTimeline => ({ lanes: [createLane(key, 'Chaos', 0, 10, base)] });
const lane = (tl: AutomationTimeline, key = 'in:chaos') => laneByKey(tl, key)!;

describe('a take', () => {
  it('lights Rec for as long as it runs — ended or dropped', () => {
    const { store } = rig();
    store.load('a', { lanes: [] });
    store.startTake();
    expect(MoveFunctions.isOn('rec')).toBe(true);
    store.endTake();
    expect(MoveFunctions.isOn('rec')).toBe(false);
    store.startTake();
    store.cancelTake();
    expect(MoveFunctions.isOn('rec')).toBe(false);
  });

  it('rolls a stopped transport, and commits once across every timeline it wrote', () => {
    const { store, commits, play, run } = rig();
    store.load('a', { lanes: [] });
    store.startTake();
    expect(play).toHaveBeenCalledOnce();
    run(0.3);
    store.edit('in:chaos', 8, META);
    run(0.2, () => store.edit('in:chaos', 8, META));
    store.load('b', { lanes: [] });
    run(0.3, () => store.edit('in:grain', 2, { label: 'Grain', min: 0, max: 4, before: 1 }));
    expect(commits).toEqual([]);
    store.endTake();
    expect(commits).toHaveLength(1);
    const take = commits[0] as Extract<AutomationCommit, { kind: 'take' }>;
    expect(take.kind).toBe('take');
    expect([...take.timelines.keys()].sort()).toEqual(['a', 'b']);
    // A new lane starts flat at the control's value before the take.
    const a = lane(take.timelines.get('a')!);
    expect(valueAt(a, 0.05)).toBe(5);
    expect(valueAt(a, 0.2)).toBe(8);
    expect(lane(take.timelines.get('b')!, 'in:grain').label).toBe('Grain');
    expect(store.timeline()).toBe(take.timelines.get('b'));
  });

  it('starts writing where the finger landed, when it landed just before the turn', () => {
    const { store, commits, run } = rig();
    store.load('a', flat());
    store.startTake();
    run(0.4);
    store.touch('in:chaos', true);
    run(0.2);
    store.edit('in:chaos', 8, META);
    run(0.4);
    store.touch('in:chaos', false);
    run(0.2);
    store.endTake();
    const written = lane((commits[0] as Extract<AutomationCommit, { kind: 'take' }>).timelines.get('a')!);
    // Untouched before the finger; held from the touch; the turn; back after the lift.
    expect(valueAt(written, 0.1)).toBe(5);
    expect(valueBefore(written, 0.2)).toBeCloseTo(5, 9);
    expect(valueAt(written, 0.25)).toBeCloseTo(5, 6);
    expect(valueAt(written, 0.4)).toBe(8);
    expect(valueAt(written, 0.6)).toBe(5);
  });

  it('with no touch feed, a control stays held for holdMs after its last move', () => {
    const { store, commits, run } = rig();
    store.load('a', flat());
    store.startTake();
    run(0.4);
    store.edit('in:chaos', 8, META);
    expect(store.isHeld('in:chaos')).toBe(true);
    run(0.2);
    expect(store.isHeld('in:chaos')).toBe(true);
    run(0.2);
    expect(store.isHeld('in:chaos')).toBe(false);
    run(0.6);
    store.endTake();
    const written = lane((commits[0] as Extract<AutomationCommit, { kind: 'take' }>).timelines.get('a')!);
    expect(valueAt(written, 0.19)).toBe(5);
    expect(valueAt(written, 0.25)).toBe(8);
    expect(valueAt(written, 0.6)).toBe(5);
  });

  it('keeps overdubbing as the pass comes round, and plays each pass back on the next', () => {
    const { store, commits, run } = rig(1);
    store.load('a', flat());
    store.startTake();
    run(0.2);
    run(0.2, () => store.edit('in:chaos', 9, META));
    run(0.7);
    // Second pass: the first pass's write plays back.
    expect(store.take()?.laps).toBe(1);
    expect(store.isHeld('in:chaos')).toBe(false);
    expect(store.sample().get('in:chaos')).toBe(5);
    run(0.2);
    expect(store.sample().get('in:chaos')).toBe(9);
    run(0.2);
    run(0.1, () => store.edit('in:chaos', 1, META));
    run(0.5);
    store.endTake();
    expect(commits).toHaveLength(1);
    const written = lane((commits[0] as Extract<AutomationCommit, { kind: 'take' }>).timelines.get('a')!);
    expect(valueAt(written, 0.3)).toBe(9);
    expect(valueAt(written, 0.55)).toBe(1);
    expect(valueAt(written, 0.95)).toBe(5);
  });

  it('closes at the end of the pass and writes on from its start when the host says it wrapped', () => {
    const { store, commits, clock, run } = rig(1);
    store.load('a', flat());
    store.startTake();
    run(0.8);
    run(0.15, () => store.edit('in:chaos', 9, META));
    clock.time = 0;
    store.passWrapped();
    run(0.1, () => store.edit('in:chaos', 9, META));
    run(0.5);
    store.endTake();
    const written = lane((commits[0] as Extract<AutomationCommit, { kind: 'take' }>).timelines.get('a')!);
    expect(valueAt(written, 0.99)).toBe(9);
    expect(valueAt(written, 0.05)).toBe(9);
    expect(valueAt(written, 0.5)).toBe(5);
  });

  it('a dropped take commits nothing and leaves the lanes as they were', () => {
    const { store, commits, run } = rig();
    const before = flat();
    store.load('a', before);
    store.startTake();
    run(0.3, () => store.edit('in:chaos', 9, META));
    run(0.3, () => store.edit('in:new', 1, { label: 'New', min: 0, max: 2, before: 0 }));
    store.cancelTake();
    expect(commits).toEqual([]);
    expect(store.timeline()).toBe(before);
    expect(store.has('in:new')).toBe(false);
  });
});

describe('a hand outside a take', () => {
  it('wins while it holds, writes nothing, and hands back to the lane', () => {
    const { store, commits, run, wait } = rig();
    store.load('a', flat());
    expect(store.edit('in:other', 3, META)).toBe(false);
    run(0.2);
    expect(store.edit('in:chaos', 7, META)).toBe(true);
    expect(store.sample().get('in:chaos')).toBe(7);
    expect(store.valueFor('in:chaos')).toBe(7);
    wait(400);
    store.tick();
    expect(store.sample().get('in:chaos')).toBe(5);
    expect(commits).toEqual([]);
    expect(store.timeline()).toEqual(flat());
  });

  it('a touch holds the value it found under the finger until it lifts', () => {
    const { store, run } = rig();
    store.load('a', { lanes: [{ ...createLane('in:chaos', 'Chaos', 0, 10, 0), points: [{ t: 0, v: 0 }, { t: 1, v: 10 }] }] });
    run(0.5);
    store.touch('in:chaos', true);
    run(1);
    expect(store.sample().get('in:chaos')).toBeCloseTo(2.5, 1);
    store.touch('in:chaos', false);
    expect(store.sample().get('in:chaos')).toBeCloseTo(7.5, 1);
  });
});

describe('editing on the card', () => {
  it('commits each edit, a drag as one coalesced run, and refuses while a take writes', () => {
    const { store, commits } = rig();
    store.load('a', flat());
    expect(store.movePoint('in:chaos', 0, 0, 2, { drag: true })).toBe(true);
    expect(commits.at(-1)).toMatchObject({ kind: 'edit', id: 'a', coalesce: 'auto:in:chaos:drag' });
    expect(store.addPoint('in:chaos', 0.5, 9)).toBe(1);
    expect(store.getSelection()).toEqual({ key: 'in:chaos', point: 1, range: null });
    expect(valueAt(lane(store.timeline()), 0.5)).toBe(9);
    store.startTake();
    expect(store.deleteLane('in:chaos')).toBe(false);
    store.cancelTake();
    expect(store.deleteLane('in:chaos')).toBe(true);
    expect(commits.at(-1)).toEqual({ kind: 'edit', id: 'a', timeline: { lanes: [] } });
    expect(store.getSelection().key).toBeNull();
  });

  it('smooths over the selected stretch only', () => {
    const { store } = rig();
    store.load('a', { lanes: [{ ...createLane('in:chaos', 'Chaos', 0, 10, 0), points: [{ t: 0, v: 0 }, { t: 0.5, v: 0 }, { t: 0.5, v: 10 }, { t: 1, v: 10 }] }] });
    store.select({ key: 'in:chaos', range: { from: 0.3, to: 0.7 } });
    expect(store.smooth('in:chaos')).toBe(true);
    const out = lane(store.timeline());
    expect(valueAt(out, 0.1)).toBe(0);
    expect(valueAt(out, 0.5)).toBeGreaterThan(1);
    expect(valueAt(out, 0.5)).toBeLessThan(9);
  });
});
