/**
 * Where a notification stands, and what it is allowed to say.
 *
 * Notifications land in the same air as the floating displays — centred over
 * the instrument, just above its top edge. That air is shared: the curve
 * composer, the audio modulator's waveform and the save-a-preset input all
 * live there, and any of them can come up while a notification is still on
 * screen. So the stack does not claim a fixed height above the panel; it
 * clears whatever is currently standing there and floats above the lot.
 *
 * The maths is here, free of React and the DOM, because "how high" is the one
 * part of this that has to be right every time.
 */

/**
 * What a notification is telling you. The word is the message; the hue only
 * repeats it, so a reader who cannot see the colour loses nothing.
 */
export const MOVE_NOTIFY_KINDS = ['info', 'success', 'warning', 'error'] as const;

export type MoveNotifyKind = (typeof MOVE_NOTIFY_KINDS)[number];

/**
 * The air the stack keeps under itself — the same gap the docked waveform
 * leaves over the panel, so the two read as one family of floats.
 */
export const MOVE_NOTIFY_GAP = 14;

/**
 * Everything the stack has to clear. The panel is always in the list; the rest
 * are the floats the kit already knows how to raise over it. Anything an app
 * floats there itself opts in with `data-move-float` rather than being fought
 * over — a display the stack cannot see is a display it will cover.
 */
export const MOVE_FLOAT_SELECTOR = [
  '.tweakers-move-root .tweakers-move',
  '.tweakers-move-wave[data-variant="dock"]',
  '.tweakers-move-curve',
  '.tweakers-move-preset-save',
  '[data-move-float]',
].join(', ');

/**
 * How far off the bottom of the window the stack sits, given the top edge of
 * every float currently on screen (viewport coordinates, as
 * `getBoundingClientRect().top` reports them).
 *
 * The highest edge wins: the stack rides over the tallest thing standing, and
 * over the bare panel when nothing else is up. With an empty floor — no panel,
 * no display — it rests one gap off the bottom rather than jumping to the
 * middle of nowhere.
 */
export function notifyDockBottom(
  tops: readonly number[],
  viewportHeight: number,
  gap: number = MOVE_NOTIFY_GAP
): number {
  let highest = Infinity;
  for (const top of tops) {
    if (Number.isFinite(top) && top < highest) highest = top;
  }
  if (!Number.isFinite(highest)) return gap;
  return Math.max(gap, Math.round(viewportHeight - highest) + gap);
}
