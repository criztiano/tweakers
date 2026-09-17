import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOVE_VIEW_MOTIONS,
  MOVE_VIEW_PRESENTATION,
  MOVE_VIEW_REDUCED,
  MOVE_VIEW_WAIT,
  expoInOut,
  linearEasing,
  moveViewChangeDuration,
  moveViewChoreography,
  moveViewHoldRemaining,
  type MoveViewChange,
} from './move-view-core';

// A view change's choreography and a wait's timing. The zoom-through is
// Cri's: 95% up to 100% fading in, 100% up to 105% fading out, expo in-out
// over a second. These pin that, and the rules that keep it clean — one
// curve for both layers, only opacity and transform, reduced motion
// zooming nowhere — and when a wait holds.

const CHANGES: MoveViewChange[] = [...MOVE_VIEW_MOTIONS, 'wait', 'resume'];
const linearPoints = (easing: string) => easing.slice('linear('.length, -1).split(',').map(Number);

describe('the zoom-through', () => {
  it('fades the leaving view out growing to 105%, and the arriving view in growing from 95%', () => {
    for (const change of CHANGES) {
      const { leaving, arriving } = moveViewChoreography(change);
      assert.deepEqual([leaving.fade.from, leaving.fade.to], [1, 0], change);
      assert.deepEqual([arriving.fade.from, arriving.fade.to], [0, 1], change);
      assert.deepEqual([leaving.move?.from, leaving.move?.to], ['scale(1)', 'scale(1.05)'], change);
      assert.deepEqual([arriving.move?.from, arriving.move?.to], ['scale(0.95)', 'scale(1)'], change);
    }
  });

  it('runs every layer on one curve over one second, from the same instant', () => {
    for (const change of CHANGES) {
      const plan = moveViewChoreography(change);
      const tweens = [plan.leaving.fade, plan.leaving.move!, plan.arriving.fade, plan.arriving.move!];
      for (const tween of tweens) {
        assert.equal(tween.duration, 1000, change);
        assert.equal(tween.delay, 0, change);
        assert.equal(tween.easing, tweens[0].easing, `${change}: the opacities add up to one only on a shared curve`);
      }
      assert.equal(moveViewChangeDuration(plan), MOVE_VIEW_PRESENTATION.duration);
      assert.equal(plan.duration, MOVE_VIEW_PRESENTATION.duration);
    }
  });

  it('keeps a short crossfade and zooms nowhere under reduced motion', () => {
    for (const change of CHANGES) {
      const plan = moveViewChoreography(change, true);
      assert.equal(plan.leaving.move, undefined, change);
      assert.equal(plan.arriving.move, undefined, change);
      assert.equal(moveViewChangeDuration(plan), MOVE_VIEW_REDUCED.duration);
    }
  });

  it('keeps the arriving view out of sight for the curve’s quiet first stretch', () => {
    const { quiet } = moveViewChoreography('open');
    assert.ok(expoInOut(quiet / 1000) <= MOVE_VIEW_PRESENTATION.quietLight + 0.001);
    assert.ok(expoInOut((quiet + 20) / 1000) > MOVE_VIEW_PRESENTATION.quietLight);
    assert.equal(quiet, 384);
  });
});

describe('expo in-out', () => {
  it('is the exponential curve: flat ends, half way at the middle, symmetric', () => {
    assert.equal(expoInOut(0), 0);
    assert.equal(expoInOut(1), 1);
    assert.equal(expoInOut(0.5), 0.5);
    assert.ok(expoInOut(0.2) < 0.01);
    for (const x of [0.1, 0.3, 0.45]) assert.ok(Math.abs(expoInOut(x) + expoInOut(1 - x) - 1) < 1e-12);
  });

  it('plays as a linear() easing that never falls back and stays within 0.15%', () => {
    const points = linearPoints(linearEasing(expoInOut));
    assert.equal(points.length, 97);
    assert.equal(points[0], 0);
    assert.equal(points.at(-1), 1);
    for (let i = 1; i < points.length; i++) assert.ok(points[i] >= points[i - 1]);
    let worst = 0;
    for (let i = 0; i <= 1000; i++) {
      const x = i / 1000;
      const at = Math.min(95, Math.floor(x * 96));
      const t = x * 96 - at;
      worst = Math.max(worst, Math.abs(points[at] + (points[at + 1] - points[at]) * t - expoInOut(x)));
    }
    assert.ok(worst < 0.0015, `worst ${worst}`);
  });
});

describe('wait timing', () => {
  const plan = moveViewChoreography('wait');

  it('holds nothing when the work landed before the wait came up', () => {
    assert.equal(moveViewHoldRemaining(null, 1000, plan), 0);
  });

  it('holds nothing while the wait is still out of sight — the view takes its place unseen', () => {
    assert.equal(moveViewHoldRemaining(1000, 1000 + plan.quiet - 1, plan), 0);
  });

  it('holds a wait that came into sight until it has arrived and been read', () => {
    assert.equal(moveViewHoldRemaining(1000, 1000 + plan.quiet, plan), plan.duration + MOVE_VIEW_WAIT.hold - plan.quiet);
    assert.equal(moveViewHoldRemaining(1000, 1000 + plan.duration + MOVE_VIEW_WAIT.hold + 1, plan), 0);
  });

  it('shows no wait for work that answers like a press', () => {
    assert.ok(MOVE_VIEW_WAIT.delay <= 250);
  });
});
