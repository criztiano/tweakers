import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TweakStore } from './store/TweakStore';
import { buildMovePages, movePadRows, moveAppPadRow } from './move-layout';
import { MoveSurfaceStore } from './move-surface-store';

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
  });

  it('keeps the plain order for a single claimed row', () => {
    const p = page();
    const rows = movePadRows(p, 1);
    assert.equal(rows[0], p.toggles);
    assert.equal(rows[1], p.values);
  });

  it('lifts the chips above the switches when both rows are claimed', () => {
    const p = page();
    const rows = movePadRows(p, 2);
    assert.equal(rows[0], p.values);
    assert.equal(rows[1], p.toggles);
  });

  it('places the claimed rows where the hardware puts them', () => {
    // nothing claimed: every screen row is a control row
    assert.deepEqual([0, 1, 2, 3].map((r) => moveAppPadRow(r, 0)), [null, null, null, null]);
    // one row: the bottom row alone, below the chips
    assert.deepEqual([0, 1, 2, 3].map((r) => moveAppPadRow(r, 1)), [null, null, 0, null]);
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
    const seen: { x: number; y: number }[] = [];
    const off = MoveSurfaceStore.onPress((p) => seen.push(p));
    MoveSurfaceStore.press(4, 1);
    off();
    MoveSurfaceStore.press(5, 0);
    assert.deepEqual(seen, [{ x: 4, y: 1 }]);
  });

  it('reset hands the whole surface back', () => {
    MoveSurfaceStore.claimRows(2);
    MoveSurfaceStore.setScreen({ items: ['a', 'b'], index: 1 });
    MoveSurfaceStore.reset();
    assert.deepEqual(MoveSurfaceStore.getState(), { rows: 0, pads: [], steps: null, screen: null });
  });
});
