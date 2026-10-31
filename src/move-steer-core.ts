/**
 * The steering hand's physics, apart from the page (move-steer draws it).
 *
 * Inside the panel the pointer is not a place but a hand on a control. The
 * hand's travel builds tension on the control it holds — the control leans
 * and stretches the way the hand pulls — and once the travel passes the
 * control's threshold the hand lets go and lands on the next control that
 * way, which takes the hit. Let the hand rest and the tension goes: the
 * hand settles back in the middle of its control.
 */

/** The hand's travel per pointer pixel: the panel goes by quicker than the page. */
export const MOVE_STEER_GAIN = 2.4;
/** How far past a control's edge, in hand pixels, the hand still holds it. */
export const MOVE_STEER_MARGIN = 10;
/** The travel from a control's middle that lets go of it, whatever its size, in hand pixels. */
export const MOVE_STEER_REACH_MIN = 34;
export const MOVE_STEER_REACH_MAX = 70;
/** At the panel's edge the hand stretches this far past the reach, and no further. */
export const MOVE_STEER_RUBBER = 1.3;
/** A pause this long, in ms, lets the tension go. */
export const MOVE_STEER_REST_MS = 110;

export type MoveSteerBox = { left: number; top: number; right: number; bottom: number };
export type MoveSteerVec = { x: number; y: number };

const mid = (b: MoveSteerBox): MoveSteerVec => ({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 });

/**
 * How far the hand may travel from a control's middle before it lets go, per
 * axis. A control the hand points into (a list, a grid of tiles) is held all
 * the way to its edge, so every row in it can be reached; any other control
 * lets go at the same travel whatever its size, so the panel reads at one pace.
 */
export function moveSteerReach(b: MoveSteerBox, points: boolean): MoveSteerVec {
  const half = { x: (b.right - b.left) / 2 + MOVE_STEER_MARGIN, y: (b.bottom - b.top) / 2 + MOVE_STEER_MARGIN };
  if (points) return half;
  const clamp = (v: number) => Math.min(MOVE_STEER_REACH_MAX, Math.max(MOVE_STEER_REACH_MIN, v));
  return { x: clamp(half.x), y: clamp(half.y) };
}

/**
 * The control the hand lands on when it lets go of `from` going `dir` (one
 * axis, ±1): the nearest whose middle lies that way — within a cone, so a
 * control far off to the side never counts — closeness across the travel
 * counted twice so the hand keeps its row or column. -1 at the panel's edge:
 * nothing lies that way.
 */
export function moveSteerNext(from: MoveSteerBox, boxes: readonly MoveSteerBox[], at: MoveSteerVec, dir: MoveSteerVec) {
  const c = mid(from);
  let best = -1;
  let score = Infinity;
  boxes.forEach((b, i) => {
    if (b === from) return;
    const m = mid(b);
    let gap: number, across: number;
    // Only what lies that way, within a cone: a control far off to the
    // side is not "that way" just because it sits a little further along.
    const along = dir.x ? (m.x - c.x) * dir.x : (m.y - c.y) * dir.y;
    const aside = dir.x ? Math.abs(m.y - c.y) : Math.abs(m.x - c.x);
    if (along <= 1 || along < aside * 0.5) return;
    if (dir.x) {
      gap = dir.x > 0 ? Math.max(0, b.left - from.right) : Math.max(0, from.left - b.right);
      across = at.y < b.top ? b.top - at.y : at.y > b.bottom ? at.y - b.bottom : 0;
    } else {
      gap = dir.y > 0 ? Math.max(0, b.top - from.bottom) : Math.max(0, from.top - b.bottom);
      across = at.x < b.left ? b.left - at.x : at.x > b.right ? at.x - b.right : 0;
    }
    const s = gap + across * 2;
    if (s < score) { score = s; best = i; }
  });
  return best;
}

/**
 * The hand's travel, in hand pixels from the middle of what it holds, after
 * a move: where it now is, and every control it let go of on the way (`dir`
 * of each pass). A fast flick passes several. `next` answers the control
 * that way, or null at the panel's edge, where the hand stretches but stays.
 */
export function moveSteerTravel(
  offset: MoveSteerVec, reach: (step: number) => MoveSteerVec,
  next: (dir: MoveSteerVec, step: number, at: MoveSteerVec) => boolean,
) {
  const o = { ...offset };
  const passes: MoveSteerVec[] = [];
  for (let step = 0; step < 8; step++) {
    const r = reach(step);
    const ux = Math.abs(o.x) / r.x;
    const uy = Math.abs(o.y) / r.y;
    if (ux <= 1 && uy <= 1) break;
    const dir = ux >= uy ? { x: Math.sign(o.x), y: 0 } : { x: 0, y: Math.sign(o.y) };
    if (!next(dir, step, o)) {
      o.x = Math.max(-r.x * MOVE_STEER_RUBBER, Math.min(r.x * MOVE_STEER_RUBBER, o.x));
      o.y = Math.max(-r.y * MOVE_STEER_RUBBER, Math.min(r.y * MOVE_STEER_RUBBER, o.y));
      break;
    }
    passes.push(dir);
    // The hand lands in the middle of the next control, the travel past the
    // threshold carried on.
    if (dir.x) { o.x -= dir.x * r.x; o.y = 0; } else { o.y -= dir.y * r.y; o.x = 0; }
  }
  return { offset: o, passes };
}

/** A control's lean and stretch for a tension `u` (−1…1 at the threshold, per axis). */
export function moveSteerPose(u: MoveSteerVec, size: MoveSteerVec) {
  const ax = Math.tanh(u.x * 1.1);
  const ay = Math.tanh(u.y * 1.1);
  const sx = 1 + 0.045 * Math.abs(ax) - 0.02 * Math.abs(ay);
  const sy = 1 + 0.045 * Math.abs(ay) - 0.02 * Math.abs(ax);
  // The lean, plus half the stretch: the edge the hand pulls goes out, the
  // other stays close to where it was.
  return {
    tx: ax * 3 + Math.sign(ax) * (size.x * (sx - 1)) / 2,
    ty: ay * 3 + Math.sign(ay) * (size.y * (sy - 1)) / 2,
    sx, sy,
  };
}

/** A spring on a tension, balanced: it settles with one small overshoot. */
export type MoveSteerSpring = { x: number; y: number; vx: number; vy: number };
const STIFFNESS = 520;
const DAMPING = 2 * 0.62 * Math.sqrt(STIFFNESS);

/** One frame of a spring toward `to`; true while it still moves. */
export function moveSteerSpring(s: MoveSteerSpring, to: MoveSteerVec, dt: number) {
  const step = Math.min(dt, 1 / 30);
  s.vx += (STIFFNESS * (to.x - s.x) - DAMPING * s.vx) * step;
  s.vy += (STIFFNESS * (to.y - s.y) - DAMPING * s.vy) * step;
  s.x += s.vx * step;
  s.y += s.vy * step;
  return Math.abs(to.x - s.x) + Math.abs(to.y - s.y) > 0.002 || Math.abs(s.vx) + Math.abs(s.vy) > 0.02;
}

/** The knock a control takes when the hand lands on it, in tension per second. */
export const MOVE_STEER_KNOCK = 14;
