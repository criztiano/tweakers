/**
 * How many rows one wheel event walks a list.
 *
 * The Move reports its wheel as counts per message, and an ordinary turn
 * lands two or three of them at once — walked one row per count, a list
 * skips rows unless the hand creeps. A burst of up to `MOVE_WHEEL_ROW_SLACK`
 * counts walks one row, so a steady turn never jumps; a real spin still
 * flies, short by the slack. The computer's single steps (±1) are untouched.
 */
export const MOVE_WHEEL_ROW_SLACK = 3;

export function moveWheelRows(delta: number): number {
  const counts = Math.abs(Math.round(delta)) || (delta ? 1 : 0);
  if (!counts) return 0;
  const rows = counts <= MOVE_WHEEL_ROW_SLACK ? 1 : counts - (MOVE_WHEEL_ROW_SLACK - 1);
  return Math.sign(delta) * rows;
}
