/**
 * How one view of a Move app gives way to the next, on its own so node can
 * test it without React or a browser.
 *
 * A view is the whole surface an app shows at a time — a deck, a list, a
 * panel. Changing it is a place change, and the app names which one it is:
 * deeper along the way (`forward`), back out (`back`), into a workspace
 * (`open`) or out of one (`close`), or across to a sibling (`swap`). The
 * names are the app's intent; every one of them is presented the same way.
 *
 * The presentation is a zoom-through: the view leaving grows past you to
 * 105% as it fades out, the view arriving grows up from 95% as it fades in,
 * both on one exponential ease-in-out over a second. The two layers share
 * the curve exactly, so their opacities always add up to one: laid over
 * each other additively they cross without a dip in light. Only opacity
 * and transform move — the compositor plays them, and nothing lays out.
 * Reduced motion keeps a short crossfade and drops the zoom.
 *
 * The curve is quiet for its first third: the arriving view is still under
 * a tenth of its light for 384 ms. A change that lands inside that window
 * can take the arriving view's place unseen; one that lands later waits for
 * the pictures to land. That window is part of the choreography (`quiet`).
 *
 * Waiting is part of the same grammar. Work that lands fast never shows a
 * wait at all; work that does not shows one, and a wait that has come into
 * sight stays until it has arrived and been read, so nothing blinks.
 */

/** Where a view change goes, as the app names it. */
export const MOVE_VIEW_MOTIONS = ['forward', 'back', 'open', 'close', 'swap'] as const;

export type MoveViewMotion = (typeof MOVE_VIEW_MOTIONS)[number];

/** The kit's own two changes, around a wait: a view giving way to its wait,
 *  and the wait handing a view back unchanged (a failure, a cancel). */
export type MoveViewChange = MoveViewMotion | 'wait' | 'resume';

/**
 * The zoom-through. Feel constants, set by Cri: retune one only with a
 * stated feel goal.
 */
export const MOVE_VIEW_PRESENTATION = {
  /** ms, both layers, start to settle */
  duration: 1000,
  /** where the arriving view grows up from */
  enterScale: 0.95,
  /** where the leaving view grows out to */
  exitScale: 1.05,
  /** the arriving view's light below which a swap goes unseen */
  quietLight: 0.1,
} as const;

/** Reduced motion: a plain crossfade, short, no zoom. */
export const MOVE_VIEW_REDUCED = { duration: 180 } as const;

/**
 * The timing of a wait. Feel constants: retune one only with a stated feel
 * goal.
 */
export const MOVE_VIEW_WAIT = {
  /** Work that lands inside this never shows a wait — under a fifth of a
   *  second still reads as the press answering. */
  delay: 200,
  /** A wait that came into sight stays this long after it has arrived, so
   *  it is read rather than glimpsed. */
  hold: 500,
  /** One step of the wait's eight-light sweep; eight of them are one pass. */
  sweepStep: 70,
} as const;

/** Exponential ease-in-out, exactly: flat off the mark, all of the travel
 *  through the middle, flat into the landing. */
export function expoInOut(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2;
}

/**
 * A curve as a CSS `linear()` easing, sampled evenly — so the browser plays
 * the exact curve on the compositor, with no frame loop. 96 samples keep
 * expo in-out within 0.15% everywhere — under a pixel of zoom on any screen.
 */
export function linearEasing(curve: (x: number) => number, samples = 96): string {
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) points.push(String(Math.round(curve(i / samples) * 10000) / 10000));
  return `linear(${points.join(', ')})`;
}

/** The same curve as a cubic Bézier, for a browser without `linear()`. */
export const MOVE_VIEW_EXPO_BEZIER = 'cubic-bezier(0.87, 0, 0.13, 1)';

/** One animated value, from → to. */
export interface MoveViewTween<T> {
  from: T;
  to: T;
  /** ms */
  duration: number;
  /** ms */
  delay: number;
  /** A CSS easing string. */
  easing: string;
}

/** One layer's part: always a fade, and a transform unless it holds still. */
export interface MoveViewLayer {
  fade: MoveViewTween<number>;
  move?: MoveViewTween<string>;
}

/** The two layers of a view change, how long it runs, and how long the
 *  arriving view stays out of sight (both ms). */
export interface MoveViewChoreography {
  leaving: MoveViewLayer;
  arriving: MoveViewLayer;
  duration: number;
  quiet: number;
}

/** When a curve first reaches `light`, as a share of its run. */
function reaches(curve: (x: number) => number, light: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (curve(mid) < light) lo = mid;
    else hi = mid;
  }
  return hi;
}

const EXPO_EASING = linearEasing(expoInOut);
const EXPO_QUIET = Math.round(reaches(expoInOut, MOVE_VIEW_PRESENTATION.quietLight) * MOVE_VIEW_PRESENTATION.duration);

/**
 * The two layers of a change. Every change is the same zoom-through;
 * `reduced` is the reader's reduced-motion setting, which keeps a short
 * crossfade and drops the zoom.
 */
export function moveViewChoreography(_change: MoveViewChange, reduced = false): MoveViewChoreography {
  if (reduced) {
    const { duration } = MOVE_VIEW_REDUCED;
    const tween = (from: number, to: number): MoveViewTween<number> => ({ from, to, duration, delay: 0, easing: 'linear' });
    return {
      leaving: { fade: tween(1, 0) },
      arriving: { fade: tween(0, 1) },
      duration,
      quiet: Math.round(duration * MOVE_VIEW_PRESENTATION.quietLight),
    };
  }
  const { duration, enterScale, exitScale } = MOVE_VIEW_PRESENTATION;
  const tween = <T,>(from: T, to: T): MoveViewTween<T> => ({ from, to, duration, delay: 0, easing: EXPO_EASING });
  return {
    leaving: { fade: tween(1, 0), move: tween('scale(1)', `scale(${exitScale})`) },
    arriving: { fade: tween(0, 1), move: tween(`scale(${enterScale})`, 'scale(1)') },
    duration,
    quiet: EXPO_QUIET,
  };
}

/** How long the whole change runs, both layers done — ms. */
export function moveViewChangeDuration(choreography: MoveViewChoreography): number {
  const end = (layer: MoveViewLayer) =>
    Math.max(layer.fade.delay + layer.fade.duration, layer.move ? layer.move.delay + layer.move.duration : 0);
  return Math.max(end(choreography.leaving), end(choreography.arriving));
}

/**
 * How long a finished piece of work still holds its wait, so the wait is
 * read rather than glimpsed. `shownAt` is when the wait began to come up,
 * `null` when the work landed before it ever did. Work that lands while the
 * wait is still out of sight holds nothing — its view takes the wait's place
 * unseen; work that lands later holds until the wait has arrived and been
 * read.
 */
export function moveViewHoldRemaining(
  shownAt: number | null,
  now: number,
  choreography: Pick<MoveViewChoreography, 'duration' | 'quiet'>,
  hold: number = MOVE_VIEW_WAIT.hold
): number {
  if (shownAt === null || now - shownAt < choreography.quiet) return 0;
  return Math.max(0, shownAt + choreography.duration + hold - now);
}
