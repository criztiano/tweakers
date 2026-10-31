/**
 * The steering hand's physics, apart from the page (move-steer draws it).
 *
 * Inside the panel the pointer is not a place but a hand on a control. The
 * hand is where the real pointer is, magnified around where it came in
 * (`moveSteerMap`) — never travel added up, so the hand and the real pointer
 * can never drift apart, and the real pointer is where the arrow comes back.
 * The hand holds its control until it is past the control's edge by a
 * margin that grows when the pointer moves slowly (`moveSteerMargin`), then
 * lands on the control it is over, or the nearest that way
 * (`moveSteerSettle`), which takes the hit. Pulling at a control leans and
 * stretches it; a rest lets the tension go.
 */

/** The hand's travel per pointer pixel, across and up and down: the panel goes by quicker than the page (Cri's feel test, 2× and 1.5×). */
export const MOVE_STEER_GAIN_X = 2;
export const MOVE_STEER_GAIN_Y = 1.5;

/** How far past a control's edge, in hand pixels, a quick hand still holds it… */
export const MOVE_STEER_MARGIN = 10;
/** …and how much further a crawling one does, so a careful move never slips past more than the control it means. */
export const MOVE_STEER_SLOW_MARGIN = 50;
/** The pointer speed, in px/ms, from which the hand holds by the quick margin alone. */
export const MOVE_STEER_FULL_SPEED = 0.6;

/** How far past its control's edge the hand still holds it, for a pointer `speed` (px/ms), eased. */
export function moveSteerMargin(speed: number) {
  const t = Math.min(1, Math.max(0, speed / MOVE_STEER_FULL_SPEED));
  return MOVE_STEER_MARGIN + MOVE_STEER_SLOW_MARGIN * (1 - t * t * (3 - 2 * t));
}

/** The tension a pull needs to read in full, from a control's middle, in hand pixels. */
export const MOVE_STEER_REACH_MIN = 34;
export const MOVE_STEER_REACH_MAX = 70;
/** A pause this long, in ms, lets the tension go. */
export const MOVE_STEER_REST_MS = 110;

export type MoveSteerBox = { left: number; top: number; right: number; bottom: number };
export type MoveSteerVec = { x: number; y: number };

const mid = (b: MoveSteerBox): MoveSteerVec => ({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 });

/** How far a pull from a control's middle reads as full tension, per axis: one pace for every control. */
export function moveSteerReach(b: MoveSteerBox): MoveSteerVec {
  const clamp = (v: number) => Math.min(MOVE_STEER_REACH_MAX, Math.max(MOVE_STEER_REACH_MIN, v));
  return { x: clamp((b.right - b.left) / 2 + MOVE_STEER_MARGIN), y: clamp((b.bottom - b.top) / 2 + MOVE_STEER_MARGIN) };
}

/**
 * Where the hand is for the real pointer `at`: the hand point `hand` where
 * the pointer was `from`, the pointer's way since magnified by `gain`. The
 * same pointer place is always the same hand place.
 */
export function moveSteerMap(hand: MoveSteerVec, from: MoveSteerVec, gain: MoveSteerVec, at: MoveSteerVec): MoveSteerVec {
  return { x: hand.x + (at.x - from.x) * gain.x, y: hand.y + (at.y - from.y) * gain.y };
}

/**
 * The control the hand lands on, or null while it still holds `from`: it
 * holds it until it is past its edge by `margin`, then takes the control it
 * is over, else the nearest that way (`moveSteerNext`); `dir` is the way it
 * went, for the knock. Null at the panel's edge too.
 */
export function moveSteerSettle(from: MoveSteerBox, boxes: readonly MoveSteerBox[], at: MoveSteerVec, margin: number) {
  if (at.x >= from.left - margin && at.x <= from.right + margin && at.y >= from.top - margin && at.y <= from.bottom + margin) return null;
  const ox = at.x < from.left ? at.x - from.left : at.x > from.right ? at.x - from.right : 0;
  const oy = at.y < from.top ? at.y - from.top : at.y > from.bottom ? at.y - from.bottom : 0;
  const dir = Math.abs(ox) >= Math.abs(oy) ? { x: Math.sign(ox), y: 0 } : { x: 0, y: Math.sign(oy) };
  const over = boxes.findIndex((b) => b !== from && at.x >= b.left && at.x <= b.right && at.y >= b.top && at.y <= b.bottom);
  if (over >= 0) return { index: over, dir };
  const next = moveSteerNext(from, boxes, at, dir);
  return next >= 0 ? { index: next, dir } : null;
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
