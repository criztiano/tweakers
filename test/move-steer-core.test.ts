import { describe, expect, it } from 'vitest';
import {
  MOVE_STEER_REACH_MAX, MOVE_STEER_REACH_MIN, MOVE_STEER_MARGIN, MOVE_STEER_SLOW_MARGIN, MOVE_STEER_FULL_SPEED,
  moveSteerNext, moveSteerPose, moveSteerReach, moveSteerSpring, moveSteerMap, moveSteerMargin, moveSteerSettle, moveSteerLeaves, MOVE_STEER_EXIT_SLACK, type MoveSteerBox,
} from '../src/move-steer-core';

const box = (left: number, top: number, w: number, h: number): MoveSteerBox => ({ left, top, right: left + w, bottom: top + h });
// Three slots on a row, two pads under the first two.
const a = box(0, 0, 120, 160), b = box(130, 0, 120, 160), c = box(260, 0, 120, 160);
const p1 = box(0, 170, 120, 32), p2 = box(130, 170, 120, 32);
const all = [a, b, c, p1, p2];
const mid = (x: MoveSteerBox) => ({ x: (x.left + x.right) / 2, y: (x.top + x.bottom) / 2 });

describe('the next control the hand lands on', () => {
  it('goes along the row, and down to the pad under it', () => {
    expect(moveSteerNext(a, all, mid(a), { x: 1, y: 0 })).toBe(1);
    expect(moveSteerNext(b, all, mid(b), { x: -1, y: 0 })).toBe(0);
    expect(moveSteerNext(b, all, mid(b), { x: 0, y: 1 })).toBe(4);
    expect(moveSteerNext(p2, all, mid(p2), { x: 0, y: -1 })).toBe(1);
  });

  it('never counts a control far off to the side as that way', () => {
    const tab = box(-200, -60, 60, 24);
    const row = box(-200, 300, 120, 26);
    expect(moveSteerNext(row, [tab, row], mid(row), { x: -1, y: 0 })).toBe(-1);
    expect(moveSteerNext(row, [tab, row], mid(row), { x: 0, y: -1 })).toBe(0);
  });

  it('goes down to the pad a column over when none sits right below', () => {
    // A row of four pads, and the row under it holding only its first three.
    const row1 = [0, 1, 2, 3].map((i) => box(i * 130, 0, 120, 32));
    const row2 = [0, 1, 2].map((i) => box(i * 130, 36, 120, 32));
    const pads = [...row1, ...row2];
    const from = row1[3]!;
    expect(moveSteerNext(from, pads, mid(from), { x: 0, y: 1 })).toBe(6);
    expect(moveSteerSettle(from, pads, { x: mid(from).x, y: 60 }, 10)).toEqual({ index: 6, dir: { x: 0, y: 1 } });
  });

  it('finds nothing past the panel edge', () => {
    expect(moveSteerNext(c, all, mid(c), { x: 1, y: 0 })).toBe(-1);
    expect(moveSteerNext(a, all, mid(a), { x: 0, y: -1 })).toBe(-1);
  });
});

describe('the full pull', () => {
  it('is one pace for any control', () => {
    expect(moveSteerReach(a)).toEqual({ x: MOVE_STEER_REACH_MAX, y: MOVE_STEER_REACH_MAX });
    expect(moveSteerReach(p1)).toEqual({ x: MOVE_STEER_REACH_MAX, y: MOVE_STEER_REACH_MIN });
  });
});

describe('the hand on the pointer', () => {
  const gain = { x: 2, y: 1.5 };
  it('is where the pointer is, magnified around where it came in', () => {
    expect(moveSteerMap({ x: 100, y: 80 }, { x: 100, y: 0 }, gain, { x: 100, y: 0 })).toEqual({ x: 100, y: 80 });
    expect(moveSteerMap({ x: 100, y: 80 }, { x: 100, y: 0 }, gain, { x: 130, y: 20 })).toEqual({ x: 160, y: 110 });
  });

  it('never drifts: back where the pointer was, back where the hand was', () => {
    const start = { x: 100, y: 80 }, from = { x: 100, y: 0 };
    let p = from;
    for (const step of [{ x: 40, y: 10 }, { x: -90, y: 30 }, { x: 50, y: -40 }]) p = { x: p.x + step.x, y: p.y + step.y };
    expect(moveSteerMap(start, from, gain, p)).toEqual(start);
  });
});

describe('the hand holding and landing', () => {
  it('holds its control past the edge by the margin, then lands on the control it is over', () => {
    expect(moveSteerSettle(a, all, { x: 125, y: 80 }, 10)).toBeNull();
    expect(moveSteerSettle(a, all, { x: 140, y: 80 }, 10)).toEqual({ index: 1, dir: { x: 1, y: 0 } });
  });

  it('steps one row at a time down a stack of small pads, a slow move landing on the next', () => {
    const r1 = box(0, 0, 240, 32), r2 = box(0, 36, 120, 32), r3 = box(0, 72, 240, 32);
    const stack = [r1, r2, r3];
    // The hand already as deep as the third row: slow, it stops on the second.
    expect(moveSteerSettle(r1, stack, { x: 60, y: 80 }, moveSteerMargin(0))).toEqual({ index: 1, dir: { x: 0, y: 1 } });
    // Quick, it runs on to the third.
    expect(moveSteerSettle(r1, stack, { x: 60, y: 80 }, MOVE_STEER_MARGIN)).toEqual({ index: 2, dir: { x: 0, y: 1 } });
  });

  it('lands on the nearest that way from a gap, and on nothing past the edge', () => {
    expect(moveSteerSettle(a, all, { x: 60, y: 166 }, 0)).toEqual({ index: 3, dir: { x: 0, y: 1 } });
    expect(moveSteerSettle(c, all, { x: 600, y: 80 }, 10)).toBeNull();
  });

  it('holds on longer when the pointer crawls', () => {
    expect(moveSteerMargin(MOVE_STEER_FULL_SPEED)).toBe(MOVE_STEER_MARGIN);
    expect(moveSteerMargin(0)).toBe(MOVE_STEER_MARGIN + MOVE_STEER_SLOW_MARGIN);
    expect(moveSteerSettle(a, all, { x: 140, y: 80 }, moveSteerMargin(0))).toBeNull();
  });
});

describe('the lean', () => {
  it('stretches toward the pull and leans that way, and is still at rest', () => {
    const p = moveSteerPose({ x: 1, y: 0 }, { x: 120, y: 160 });
    expect(p.tx).toBeGreaterThan(0);
    expect(p.sx).toBeGreaterThan(1);
    expect(p.sy).toBeLessThan(1);
    expect(moveSteerPose({ x: 0, y: 0 }, { x: 120, y: 160 })).toEqual({ tx: 0, ty: 0, sx: 1, sy: 1 });
  });

  it('springs back to rest', () => {
    const s = { x: 1, y: 0, vx: 0, vy: 0 };
    let frames = 0;
    while (moveSteerSpring(s, { x: 0, y: 0 }, 1 / 60) && frames < 600) frames++;
    expect(frames).toBeLessThan(120);
    expect(Math.abs(s.x)).toBeLessThan(0.01);
  });
});

describe('the way out', () => {
  it('is right at the top for a move clearly up', () => {
    expect(moveSteerLeaves(1, { x: 0, y: -0.8 })).toBe(true);
    expect(moveSteerLeaves(0, { x: 0, y: -0.8 })).toBe(false);
  });

  it('holds a sideways move that strays up, until it goes the whole slack', () => {
    expect(moveSteerLeaves(20, { x: 0.8, y: -0.15 })).toBe(false);
    expect(moveSteerLeaves(MOVE_STEER_EXIT_SLACK, { x: 0.8, y: -0.15 })).toBe(true);
  });

  it('holds a slow creep up longer than a quick move up', () => {
    expect(moveSteerLeaves(12, { x: 0, y: -0.05 })).toBe(false);
    expect(moveSteerLeaves(12, { x: 0, y: -0.6 })).toBe(true);
  });
});
