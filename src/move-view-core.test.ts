import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOVE_VIEW_MOTIONS,
  MOVE_VIEW_WAIT,
  moveViewChangeDuration,
  moveViewChoreography,
  moveViewHoldRemaining,
  springEasing,
  type MoveViewChange,
} from './move-view-core';

// A view change's choreography and a wait's timing. These pin the grammar —
// leaving is quicker than arriving, only opacity and transform move, reduced
// motion travels nowhere — rather than every number.

const CHANGES: MoveViewChange[] = [...MOVE_VIEW_MOTIONS, 'wait', 'resume'];
const linearPoints = (easing: string) => easing.slice('linear('.length, -1).split(',').map(Number);

describe('view choreography', () => {
  it('always fades the leaving view out and the arriving view in', () => {
    for (const change of CHANGES) {
      const { leaving, arriving } = moveViewChoreography(change);
      assert.deepEqual([leaving.fade.from, leaving.fade.to], [1, 0], change);
      assert.deepEqual([arriving.fade.from, arriving.fade.to], [0, 1], change);
    }
  });

  it('has the leaving view gone before the arriving one is legible', () => {
    for (const change of CHANGES) {
      const { leaving, arriving } = moveViewChoreography(change);
      assert.ok(leaving.fade.delay + leaving.fade.duration < arriving.fade.delay + arriving.fade.duration, change);
      assert.ok(arriving.fade.delay > 0, `${change} arrives a beat late`);
    }
  });

  it('mirrors forward and back, open and close', () => {
    const forward = moveViewChoreography('forward');
    const back = moveViewChoreography('back');
    assert.equal(forward.arriving.move?.from, 'translateX(20px)');
    assert.equal(back.arriving.move?.from, 'translateX(-20px)');
    assert.equal(forward.leaving.move?.to, 'translateX(-12px)');
    assert.equal(back.leaving.move?.to, 'translateX(12px)');
    const open = moveViewChoreography('open');
    const close = moveViewChoreography('close');
    assert.equal(open.arriving.move?.from, close.leaving.move?.to);
    assert.equal(open.leaving.move?.to, close.arriving.move?.from);
  });

  it('moves nothing in a swap, and holds the wait itself still', () => {
    const swap = moveViewChoreography('swap');
    assert.equal(swap.leaving.move, undefined);
    assert.equal(swap.arriving.move, undefined);
    assert.equal(moveViewChoreography('wait').arriving.move, undefined);
  });

  it('keeps only the fades under reduced motion, and keeps them short', () => {
    for (const change of CHANGES) {
      const plan = moveViewChoreography(change, true);
      assert.equal(plan.leaving.move, undefined, change);
      assert.equal(plan.arriving.move, undefined, change);
      assert.ok(moveViewChangeDuration(plan) <= 150, change);
    }
  });

  it('finishes every change well under half a second', () => {
    for (const change of CHANGES) assert.ok(moveViewChangeDuration(moveViewChoreography(change)) < 400, change);
  });
});

describe('spring easing', () => {
  it('runs from 0 to exactly 1 without overshoot', () => {
    const { easing, duration } = springEasing();
    const points = linearPoints(easing);
    assert.equal(points[0], 0);
    assert.equal(points.at(-1), 1);
    for (let i = 1; i < points.length; i++) assert.ok(points[i] >= points[i - 1], `sample ${i} never falls back`);
    assert.ok(points.every((p) => p <= 1));
    assert.ok(duration >= 250 && duration <= 350, `settles in ${duration} ms`);
  });

  it('is fast off the mark — half way inside the first third', () => {
    const points = linearPoints(springEasing().easing);
    assert.ok(points[Math.floor(points.length / 3)] > 0.5);
  });
});

describe('wait timing', () => {
  it('holds nothing when the work landed before the wait came up', () => {
    assert.equal(moveViewHoldRemaining(null, 1000), 0);
  });

  it('holds a wait that came up until it has been read', () => {
    assert.equal(moveViewHoldRemaining(1000, 1100), MOVE_VIEW_WAIT.hold - 100);
    assert.equal(moveViewHoldRemaining(1000, 1000 + MOVE_VIEW_WAIT.hold + 1), 0);
  });

  it('shows no wait for work that answers like a press', () => {
    assert.ok(MOVE_VIEW_WAIT.delay <= 250);
    assert.ok(MOVE_VIEW_WAIT.hold >= MOVE_VIEW_WAIT.sweepStep * 4, 'a held wait shows at least half a sweep');
  });
});
