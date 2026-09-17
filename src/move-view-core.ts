/**
 * How one view of a Move app gives way to the next, on its own so node can
 * test it without React or a browser.
 *
 * A view is the whole surface an app shows at a time — a deck, a list, a
 * panel. Changing it is a place change, and the eye needs to be told where
 * it went: deeper along the way (`forward`), back out (`back`), into a
 * workspace (`open`) or out of one (`close`), or across to a sibling
 * (`swap`). Each of those is a choreography of two layers, the view leaving
 * and the view arriving, and this file is the choreography.
 *
 * The rules the numbers keep:
 * - Leaving is quick and arriving takes its time. The old view is gone
 *   before the new one is legible, so the two never read as one smeared
 *   picture.
 * - Only opacity and transform move — the compositor plays them, and
 *   nothing lays out while a view changes.
 * - Movement settles on a critically damped spring: fast off the mark, no
 *   overshoot. An instrument does not wobble.
 * - Distances are small. The view travels a hint of the way, enough to say
 *   which way you went, never a full slide across the window.
 * - Reduced motion keeps the fade and drops every movement.
 *
 * Waiting is part of the same grammar. Work that lands fast never shows a
 * wait at all; work that does not shows one, and a wait that came up stays
 * long enough to be read, so nothing blinks.
 */

import { springParams, springProgress, springSettleDuration } from './transition-math';

/** Where a view change goes, as the eye should read it. */
export const MOVE_VIEW_MOTIONS = ['forward', 'back', 'open', 'close', 'swap'] as const;

export type MoveViewMotion = (typeof MOVE_VIEW_MOTIONS)[number];

/** The kit's own two changes, around a wait: a view giving way to its wait,
 *  and the wait handing a view back unchanged (a failure, a cancel). */
export type MoveViewChange = MoveViewMotion | 'wait' | 'resume';

/**
 * The timing of a wait. Feel constants: retune one only with a stated feel
 * goal.
 */
export const MOVE_VIEW_WAIT = {
  /** Work that lands inside this never shows a wait — under a fifth of a
   *  second still reads as the press answering. */
  delay: 200,
  /** A wait that came up stays at least this long from its first frame, so
   *  it is read rather than glimpsed. */
  hold: 500,
  /** One step of the wait's eight-light sweep; eight of them are one pass. */
  sweepStep: 70,
} as const;

/** The spring every view movement settles on: no bounce, 0.3 s to the eye. */
export const MOVE_VIEW_SPRING = { type: 'spring', visualDuration: 0.3, bounce: 0 } as const;

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

/** The two layers of a view change. */
export interface MoveViewChoreography {
  leaving: MoveViewLayer;
  arriving: MoveViewLayer;
}

/** A fade that accelerates away — leaving should not linger. */
export const MOVE_VIEW_EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
/** A fade that decelerates in — the kit's own ease-out. */
export const MOVE_VIEW_EASE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';

/**
 * A spring as a CSS `linear()` easing, sampled from the same closed form the
 * timeline scrubs with — so the browser plays a real spring without a frame
 * loop. Returns the easing and the time it takes to settle, which is the
 * animation's duration.
 */
export function springEasing(
  spring: { type: 'spring'; visualDuration?: number; bounce?: number } = MOVE_VIEW_SPRING,
  samples = 24
): { easing: string; duration: number } {
  const params = springParams(spring);
  const seconds = springSettleDuration(params);
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * seconds;
    const value = i === samples ? 1 : springProgress(t, params);
    points.push(String(Math.round(value * 10000) / 10000));
  }
  return { easing: `linear(${points.join(', ')})`, duration: Math.round(seconds * 1000) };
}

const fade = (from: number, to: number, duration: number, delay: number, easing: string): MoveViewTween<number> => ({
  from,
  to,
  duration,
  delay,
  easing,
});

/** The fades, shared by every change: out fast, in unhurried and a beat late. */
const FADE_OUT = 110;
const FADE_IN = 200;
const FADE_IN_DELAY = 40;

/** How far a view travels, as a transform on each end of each change. */
const TRAVEL: Record<MoveViewChange, { leaving?: [string, string]; arriving?: [string, string] }> = {
  forward: { leaving: ['translateX(0px)', 'translateX(-12px)'], arriving: ['translateX(20px)', 'translateX(0px)'] },
  back: { leaving: ['translateX(0px)', 'translateX(12px)'], arriving: ['translateX(-20px)', 'translateX(0px)'] },
  // into a workspace: it comes up to meet you, and what you left passes by
  open: { leaving: ['scale(1)', 'scale(1.015)'], arriving: ['scale(0.975)', 'scale(1)'] },
  close: { leaving: ['scale(1)', 'scale(0.975)'], arriving: ['scale(1.015)', 'scale(1)'] },
  swap: {},
  // a view steps back a hair while its wait comes up; the wait holds still
  wait: { leaving: ['scale(1)', 'scale(0.985)'] },
  resume: { arriving: ['scale(0.985)', 'scale(1)'] },
};

/**
 * The two layers of a change. `reduced` is the reader's reduced-motion
 * setting: the fades stay, shortened, and nothing travels.
 */
export function moveViewChoreography(change: MoveViewChange, reduced = false, spring = springEasing()): MoveViewChoreography {
  if (reduced) {
    return {
      leaving: { fade: fade(1, 0, 90, 0, 'linear') },
      arriving: { fade: fade(0, 1, 140, 0, 'linear') },
    };
  }
  const travel = TRAVEL[change] ?? {};
  const move = (ends?: [string, string]): MoveViewTween<string> | undefined =>
    ends ? { from: ends[0], to: ends[1], duration: spring.duration, delay: 0, easing: spring.easing } : undefined;
  // the wait comes up slower than a view: it is not an answer yet
  const arriveDelay = change === 'wait' ? 80 : FADE_IN_DELAY;
  const arriveFade = change === 'wait' ? 220 : change === 'swap' ? 160 : FADE_IN;
  const leaving: MoveViewLayer = { fade: fade(1, 0, change === 'wait' ? 140 : FADE_OUT, 0, MOVE_VIEW_EASE_IN) };
  const arriving: MoveViewLayer = { fade: fade(0, 1, arriveFade, arriveDelay, MOVE_VIEW_EASE_OUT) };
  const leavingMove = move(travel.leaving);
  const arrivingMove = move(travel.arriving);
  if (leavingMove) leaving.move = leavingMove;
  if (arrivingMove) arriving.move = arrivingMove;
  return { leaving, arriving };
}

/** How long the whole change runs, both layers done — ms. */
export function moveViewChangeDuration(choreography: MoveViewChoreography): number {
  const end = (layer: MoveViewLayer) =>
    Math.max(
      layer.fade.delay + layer.fade.duration,
      layer.move ? layer.move.delay + layer.move.duration : 0
    );
  return Math.max(end(choreography.leaving), end(choreography.arriving));
}

/**
 * How long a finished piece of work still holds its wait up, so the wait is
 * read rather than glimpsed. `shownAt` is when the wait came up, `null` when
 * the work landed before it ever did — then nothing holds.
 */
export function moveViewHoldRemaining(shownAt: number | null, now: number, hold: number = MOVE_VIEW_WAIT.hold): number {
  if (shownAt === null) return 0;
  return Math.max(0, shownAt + hold - now);
}
