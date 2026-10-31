import { describe, expect, it } from 'vitest';
import {
  MOVE_STEER_REACH_MAX, MOVE_STEER_REACH_MIN, MOVE_STEER_RUBBER, moveSteerNext, moveSteerPose, moveSteerReach,
  moveSteerSpring, moveSteerTravel, moveSteerGlide, moveSteerGlideRate, moveSteerPace, MOVE_STEER_CRAWL, MOVE_STEER_FULL_SPEED, MOVE_STEER_BUMP, MOVE_STEER_CLOSE, type MoveSteerBox,
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

  it('finds nothing past the panel edge', () => {
    expect(moveSteerNext(c, all, mid(c), { x: 1, y: 0 })).toBe(-1);
    expect(moveSteerNext(a, all, mid(a), { x: 0, y: -1 })).toBe(-1);
  });
});

describe('how far the hand goes before it lets go', () => {
  it('is one pace for any control, and the whole of a control it points into', () => {
    expect(moveSteerReach(a, false)).toEqual({ x: MOVE_STEER_REACH_MAX, y: MOVE_STEER_REACH_MAX });
    expect(moveSteerReach(p1, false)).toEqual({ x: MOVE_STEER_REACH_MAX, y: MOVE_STEER_REACH_MIN });
    expect(moveSteerReach(a, true)).toEqual({ x: 70, y: 90 });
  });
});

describe('the hand travelling', () => {
  const reach = () => ({ x: 70, y: 70 });
  it('holds while the travel stays under the threshold', () => {
    expect(moveSteerTravel({ x: 60, y: 0 }, reach, () => true)).toEqual({ offset: { x: 60, y: 0 }, passes: [] });
  });

  it('lets go past it, lands in the middle of the next control and carries the rest on', () => {
    const r = moveSteerTravel({ x: 80, y: 5 }, reach, () => true);
    expect(r.passes).toEqual([{ x: 1, y: 0 }]);
    expect(r.offset).toEqual({ x: 10, y: 0 });
  });

  it('passes several controls on a flick', () => {
    expect(moveSteerTravel({ x: -150, y: 0 }, reach, () => true).passes).toHaveLength(2);
  });

  it('stretches at the panel edge but never passes it', () => {
    const r = moveSteerTravel({ x: 400, y: 0 }, reach, () => false);
    expect(r.passes).toEqual([]);
    expect(r.offset.x).toBe(70 * MOVE_STEER_RUBBER);
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

describe('the way in and out', () => {
  it('moves the arrow only as the pointer moves, a little more at first', () => {
    const at = { x: 0, y: 0 }, real = { x: 300, y: 0 };
    expect(moveSteerGlide(at, real, { x: 0, y: 0 }, 0, 1)).toEqual(at);
    expect(moveSteerGlide(at, real, { x: 0, y: -10 }, 0, 0)).toEqual({ x: 0, y: -10 * (1 + MOVE_STEER_BUMP) });
    expect(moveSteerGlide(at, real, { x: 0, y: -10 }, 5000, 0).y).toBeCloseTo(-10, 5);
  });

  it('gets where it is going within its travel, whatever the gap', () => {
    let at = { x: 0, y: 0 };
    const real = { x: 300, y: -40 };
    const rate = moveSteerGlideRate(Math.hypot(real.x - at.x, real.y - at.y));
    const d = { x: 0, y: -8 };
    for (let travel = 0; travel < MOVE_STEER_CLOSE + 8; travel += 8) {
      real.y += d.y;
      at = moveSteerGlide(at, real, d, 1000, rate);
    }
    expect(Math.hypot(at.x - real.x, at.y - real.y)).toBeLessThan(1);
  });
});

describe('the hand following the pointer\'s speed', () => {
  it('crawls when the pointer crawls, and takes its full pace when it moves', () => {
    expect(moveSteerPace(0)).toBe(MOVE_STEER_CRAWL);
    expect(moveSteerPace(MOVE_STEER_FULL_SPEED)).toBe(1);
    expect(moveSteerPace(5)).toBe(1);
    expect(moveSteerPace(MOVE_STEER_FULL_SPEED / 2)).toBeGreaterThan(MOVE_STEER_CRAWL);
    expect(moveSteerPace(MOVE_STEER_FULL_SPEED / 2)).toBeLessThan(1);
  });
});
