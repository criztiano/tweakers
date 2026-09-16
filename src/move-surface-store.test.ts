import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TweakStore } from './store/TweakStore';
import { buildMovePages, movePadRows, moveAppPadRow } from './move-layout';
import { MoveSurfaceStore } from './move-surface-store';
import { MoveWaveformStore } from './move-waveform';

// The pad grid shuffles when an app claims the bottom rows for itself, and
// the panel has to shuffle with it or the two surfaces stop matching. These
// pin the rule, and the little store the host paints through.

let seq = 0;
const nextId = () => `move-surface-${++seq}`;

function page() {
  const id = nextId();
  TweakStore.registerPanel(id, id, {
    gain: [0.5, 0, 1],
    tone: [0.5, 0, 1],
    mute: false,
    // nine bounded params in total, so one overflows into a value chip
    a: [0, 0, 1], b: [0, 0, 1], c: [0, 0, 1], d: [0, 0, 1],
    e: [0, 0, 1], f: [0, 0, 1], g: [0, 0, 1],
  });
  return buildMovePages([TweakStore.getPanel(id)!])[0];
}

describe('pad rows under a claim', () => {
  it('keeps switches above chips when the app claims nothing', () => {
    const p = page();
    const rows = movePadRows(p, 0);
    assert.equal(rows[0], p.toggles);
    assert.equal(rows[1], p.values);
    assert.equal(rows[2], p.actions);
  });

  it('keeps the plain order — actions included — for a single claimed row', () => {
    const p = page();
    const rows = movePadRows(p, 1);
    assert.equal(rows[0], p.toggles);
    assert.equal(rows[1], p.values);
    assert.equal(rows[2], p.actions);
  });

  it('keeps switches above chips when both rows are claimed — the actions yield', () => {
    const p = page();
    const rows = movePadRows(p, 2);
    assert.equal(rows[0], p.toggles);
    assert.equal(rows[1], p.values);
    assert.deepEqual(rows[2], []);
  });

  it('places the claimed rows where the hardware puts them', () => {
    // nothing claimed: every screen row is a control row
    assert.deepEqual([0, 1, 2, 3].map((r) => moveAppPadRow(r, 0)), [null, null, null, null]);
    // one row: the bottom row alone, below the action pads
    assert.deepEqual([0, 1, 2, 3].map((r) => moveAppPadRow(r, 1)), [null, null, null, 0]);
    // two rows: y=1 then y=0, filling the grid out
    assert.deepEqual([0, 1, 2, 3].map((r) => moveAppPadRow(r, 2)), [null, null, 1, 0]);
  });
});

describe('the surface store', () => {
  beforeEach(() => MoveSurfaceStore.reset());

  it('starts empty and hands the step circles to the modulations', () => {
    const s = MoveSurfaceStore.getState();
    assert.equal(s.rows, 0);
    assert.deepEqual(s.pads, []);
    assert.equal(s.steps, null);
    assert.equal(s.screen, null);
  });

  it('notifies on a real change and stays quiet on a repeat', () => {
    let calls = 0;
    const off = MoveSurfaceStore.subscribe(() => { calls++; });
    MoveSurfaceStore.claimRows(2);
    MoveSurfaceStore.setPads([{ x: 0, y: 0, label: '1', lit: true }]);
    assert.equal(calls, 2);
    MoveSurfaceStore.setPads([{ x: 0, y: 0, label: '1', lit: true }]);
    MoveSurfaceStore.claimRows(2);
    assert.equal(calls, 2);
    off();
  });

  it('publishes row geometry and pad cells atomically', () => {
    const seen: { rows: number; labels: (string | undefined)[] }[] = [];
    const off = MoveSurfaceStore.subscribe(() => {
      const snapshot = MoveSurfaceStore.getState();
      seen.push({ rows: snapshot.rows, labels: snapshot.pads.map((pad) => pad.label) });
    });

    MoveSurfaceStore.setPadRows(2, [
      { x: 0, y: 1, label: 'bar−' },
      { x: 0, y: 0, label: 'slice 1' },
    ]);
    MoveSurfaceStore.setPadRows(2, [
      { x: 0, y: 1, label: 'bar−' },
      { x: 0, y: 0, label: 'slice 1' },
    ]);

    assert.deepEqual(seen, [{ rows: 2, labels: ['bar−', 'slice 1'] }]);
    off();
  });

  it('keeps a stable snapshot between changes', () => {
    MoveSurfaceStore.claimRows(1);
    const first = MoveSurfaceStore.getState();
    assert.equal(MoveSurfaceStore.getState(), first);
    MoveSurfaceStore.claimRows(2);
    assert.notEqual(MoveSurfaceStore.getState(), first);
  });

  it('drops pads and steps that are off the hardware', () => {
    MoveSurfaceStore.setPads([
      { x: 0, y: 0 }, { x: 8, y: 0 }, { x: -1, y: 1 }, { x: 3, y: 2 as 0 },
    ]);
    assert.deepEqual(MoveSurfaceStore.getState().pads, [{ x: 0, y: 0 }]);
    MoveSurfaceStore.setSteps([{ step: 0 }, { step: 16 }, { step: -1 }]);
    assert.deepEqual(MoveSurfaceStore.getState().steps, [{ step: 0 }]);
  });

  it('an empty step list is still the app\'s — only null gives the row back', () => {
    MoveSurfaceStore.setSteps([]);
    assert.deepEqual(MoveSurfaceStore.getState().steps, []);
    MoveSurfaceStore.setSteps(null);
    assert.equal(MoveSurfaceStore.getState().steps, null);
  });

  it('relays an on-screen pad tap to the host', () => {
    const seen: { x: number; y: number; shift: boolean }[] = [];
    const off = MoveSurfaceStore.onPress((p) => seen.push(p));
    MoveSurfaceStore.press(4, 1);
    MoveSurfaceStore.press(2, 0, true);
    off();
    MoveSurfaceStore.press(5, 0);
    assert.deepEqual(seen, [{ x: 4, y: 1, shift: false }, { x: 2, y: 0, shift: true }]);
  });

  it('reset hands the whole surface back', () => {
    MoveSurfaceStore.claimRows(2);
    MoveSurfaceStore.setScreen({ items: ['a', 'b'], index: 1 });
    MoveSurfaceStore.reset();
    assert.deepEqual(MoveSurfaceStore.getState(), { rows: 0, pads: [], padsLabel: null, steps: null, screen: null, search: null });
  });
});

describe('app-owned steps', () => {
  it('holds the row while a listener is attached, routes presses to it, and hands the row back', () => {
    const heard: { index: number; shift: boolean }[] = [];
    let changes = 0;
    const unsub = MoveSurfaceStore.subscribe(() => changes++);
    assert.equal(MoveSurfaceStore.ownsSteps(), false);
    const release = MoveSurfaceStore.onStep((step) => heard.push(step));
    assert.equal(MoveSurfaceStore.ownsSteps(), true);
    MoveSurfaceStore.pressStep(3);
    MoveSurfaceStore.pressStep(15, true);
    MoveSurfaceStore.pressStep(16);
    assert.deepEqual(heard, [{ index: 3, shift: false }, { index: 15, shift: true }]);
    release();
    assert.equal(MoveSurfaceStore.ownsSteps(), false);
    MoveSurfaceStore.pressStep(4);
    assert.equal(heard.length, 2);
    assert.equal(changes, 2, 'taking and handing back the row each tell the kit');
    unsub();
  });

  it('takes the step a kit sends to the waveform, and lights what the app lights instead of the loop', () => {
    const heard: number[] = [];
    const release = MoveSurfaceStore.onStep(({ index }) => heard.push(index));
    MoveSurfaceStore.setSteps([{ step: 0 }, { step: 1, lit: true }, { step: 2 }]);
    const loop = MoveWaveformStore.getView().loop;
    MoveWaveformStore.pressStep(2);
    MoveWaveformStore.holdStep(0);
    assert.deepEqual(heard, [2, 0]);
    assert.deepEqual(MoveWaveformStore.getView().loop, loop, 'the loop is left alone');
    assert.deepEqual(MoveWaveformStore.loopSteps(), [1]);
    release();
    MoveSurfaceStore.setSteps(null);
  });
});
