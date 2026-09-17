/**
 * The Move app's views, and the changes between them.
 *
 * An app shows one view at a time — a deck, a list, a panel — and moves
 * between them on a press, a click or a finished piece of work. Swapped
 * bare, the window jumps and the eye loses its place; waited on bare, a
 * press seems to do nothing. This registry makes every change a movement
 * with a direction, and every wait a place of its own:
 *
 *   import { MoveViews } from 'tweakers';
 *
 *   // a change the app makes now
 *   MoveViews.go(() => setPage('record'), 'forward');
 *
 *   // a change that waits on work
 *   MoveViews.load(() => api.openProject(path), {
 *     title: 'Opening',
 *     detail: fileName,
 *     arrive: (project) => dispatch({ type: 'open-project', project }),
 *   }).catch((error) => moveNotify.add({ type: 'error', title: 'Could not open', description: String(error) }));
 *
 * and the app wraps its views in one `MoveViewStage`.
 *
 * The change is the browser's own view transition: the view leaving is a
 * picture while the view arriving is already live, so the app commits at
 * once — the new view's keys light, its list reaches the Move, the Move's
 * presses reach its handlers — and only the pictures move. Nothing in the
 * hand waits on an animation (a pointer does, for the change's few hundred
 * ms: the browser keeps a moving picture out of reach); a second change
 * started mid-way cuts the first to its end and moves on from there.
 * Without the API (or on a hidden tab) the change just lands.
 *
 * A wait is honest in the hand before it is visible on the screen. The
 * moment work starts the view goes inert and every key goes dark — nothing
 * there can be pressed into doing something twice — and the Move's wheel
 * walks nothing. Work that lands fast never shows a wait; work that does
 * not brings it up, on the screen and on the Move's own display, and holds
 * it long enough to be read. `cancelable` lights Back to abandon the wait.
 * The newest intent wins: a second `load` or a `go` supersedes a running
 * wait, whose result is then let go.
 */

import { flushSync } from 'react-dom';
import { MoveFunctions } from './move-functions';
import { MoveSurfaceStore } from './move-surface-store';
import {
  MOVE_VIEW_WAIT,
  moveViewChoreography,
  moveViewHoldRemaining,
  type MoveViewChange,
  type MoveViewLayer,
  type MoveViewMotion,
} from './move-view-core';

/** The wait a view is showing. */
export interface MoveViewWait {
  /** What is happening, in a word or two: "Opening", "Importing". */
  title: string;
  /** What it is happening to — a file name, a source. */
  detail?: string;
  /** Back abandons it, and the wait shows a way out. */
  cancelable: boolean;
}

export interface MoveViewsState {
  /** Work is running: the view is inert and its keys dark until it lands. */
  busy: boolean;
  /** The wait on screen, once the work outlasted the delay. */
  wait: MoveViewWait | null;
}

/** What a piece of work is handed. */
export interface MoveViewTask {
  /** Aborted when the wait is cancelled or superseded — pass it to fetch. */
  signal: AbortSignal;
  /** Change what the wait says as the work moves on ("Saving" → "Opening"). */
  say(title: string, detail?: string): void;
}

export interface MoveViewLoadOptions<T> {
  title: string;
  detail?: string;
  /** The view change the result makes. Runs inside the transition. Without
   *  it the wait simply leaves and hands the same view back. */
  arrive?: (value: T) => void;
  /** How the result's view arrives. `open` by default. */
  motion?: MoveViewMotion;
  /** Back abandons the wait (and aborts `signal`). */
  cancelable?: boolean;
}

/**
 * Runs one view change: calls `update` exactly once, animating around it
 * when it can. Resolves once `update` has run.
 */
export type MoveViewRunner = (change: MoveViewChange, update: () => void) => Promise<void>;

/** The view-transition name the stage wears while a change runs. */
export const MOVE_VIEW_STAGE_NAME = 'tweakers-move-view';
/** The name a viewport-docked MovePanel wears, so the sheet moves on its own. */
export const MOVE_VIEW_PANEL_NAME = 'tweakers-move-view-panel';
/** On `<html>` while a change runs: the change's name. The stylesheet scopes
 *  every view-transition rule to it, so the rest of the page is untouched. */
export const MOVE_VIEW_CHANGE_ATTR = 'data-tweakers-move-view';

/* The Move's wheel, as the kit hands it out (MovePanel's MOVE_JOG_EVENT and
   MOVE_JOG_CLICK_EVENT, spelt here to keep the registry free of the panel). */
const JOG_EVENTS = ['move-tweakers:jog', 'move-tweakers:jog-click'];

type Listener = () => void;

const IDLE: MoveViewsState = { busy: false, wait: null };

interface Running {
  controller: AbortController;
  wait: MoveViewWait;
  /** When the wait came up; null while it has not. */
  shownAt: number | null;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Hands the keys and the wheel back. */
  release: () => void;
  /** Settles the caller's promise as let go. */
  drop: () => void;
}

let state: MoveViewsState = IDLE;
const listeners = new Set<Listener>();
let running: Running | null = null;
let stages = 0;

const emit = () => {
  for (const fn of listeners) fn();
};

function setState(next: MoveViewsState) {
  if (next.busy === state.busy && JSON.stringify(next.wait) === JSON.stringify(state.wait)) return;
  state = next;
  emit();
}

/* ---- the browser's view transition ------------------------------------- */

let active: { skipTransition(): void } | null = null;

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function play(root: HTMLElement, layer: MoveViewLayer, pseudoElement: string) {
  const { fade, move } = layer;
  root.animate([{ opacity: fade.from }, { opacity: fade.to }], {
    duration: fade.duration,
    delay: fade.delay,
    easing: fade.easing,
    fill: 'both',
    pseudoElement,
  });
  if (!move) return;
  const frames = [{ transform: move.from }, { transform: move.to }];
  const timing = { duration: move.duration, delay: move.delay, fill: 'both' as const, pseudoElement };
  try {
    root.animate(frames, { ...timing, easing: move.easing });
  } catch {
    // a browser without linear() easing still gets the kit's ease-out
    root.animate(frames, { ...timing, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  }
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
  };
};

/** The runner the kit uses: a same-document view transition scoped to the
 *  stage, its two pictures moved by the choreography. */
export const viewTransitionRunner: MoveViewRunner = (change, update) => {
  const doc = typeof document === 'undefined' ? null : (document as ViewTransitionDocument);
  if (!doc?.startViewTransition || !stages || doc.visibilityState === 'hidden') {
    // lands the same way the animated change does: a failing update is
    // reported, and never leaves a wait standing
    try {
      update();
    } catch (error) {
      console.error('[tweakers] a view change failed', error);
    }
    return Promise.resolve();
  }
  const root = doc.documentElement;
  // A second viewport panel would share the sheet's name, and a duplicate
  // name throws the whole transition away — then the sheet rides with the page.
  const sheets = doc.querySelectorAll('.tweakers-move[data-dock="viewport"]').length;
  active?.skipTransition();
  root.setAttribute(MOVE_VIEW_CHANGE_ATTR, change);
  root.toggleAttribute('data-tweakers-move-view-sheet', sheets === 1);
  const transition = doc.startViewTransition(() => {
    flushSync(update);
  });
  active = transition;
  const plan = moveViewChoreography(change, reducedMotion());
  transition.ready
    .then(() => {
      play(root, plan.leaving, `::view-transition-old(${MOVE_VIEW_STAGE_NAME})`);
      play(root, plan.arriving, `::view-transition-new(${MOVE_VIEW_STAGE_NAME})`);
    })
    .catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (active !== transition) return;
      active = null;
      root.removeAttribute(MOVE_VIEW_CHANGE_ATTR);
      root.removeAttribute('data-tweakers-move-view-sheet');
    });
  return transition.updateCallbackDone.catch((error) => {
    console.error('[tweakers] a view change failed', error);
  });
};

let runner: MoveViewRunner = viewTransitionRunner;
let timers = {
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
  clearTimeout: (id: ReturnType<typeof setTimeout> | undefined) => clearTimeout(id),
  now: () => Date.now(),
};

/* ---- the hand, while work runs ----------------------------------------- */

/** Darken every key (Back stays, as the way out, when the wait may be
 *  abandoned) and let the wheel walk nothing. Returns the release. */
function holdHardware(cancelable: boolean): () => void {
  const wake = MoveFunctions.suspend();
  const releaseBack = cancelable ? MoveFunctions.push('back', () => MoveViews.cancel(), { chip: false }) : null;
  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const win = typeof window === 'undefined' ? null : window;
  for (const type of JOG_EVENTS) win?.addEventListener(type, swallow, { capture: true });
  return () => {
    for (const type of JOG_EVENTS) win?.removeEventListener(type, swallow, { capture: true });
    releaseBack?.();
    wake();
  };
}

/** Let the running wait go, without touching what the screen shows. */
function letGo(): Running | null {
  const was = running;
  if (!was) return null;
  running = null;
  timers.clearTimeout(was.timer);
  was.controller.abort();
  was.drop();
  return was;
}

/** Hand the view back: the keys, the wheel, the stage, the Move's screen. */
function settle(was: Running | null, update?: () => void) {
  was?.release();
  setState(IDLE);
  MoveSurfaceStore.setWait(null);
  update?.();
}

export const MoveViews = {
  getState: (): MoveViewsState => state,

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /**
   * Change the view now. `update` is the app's own state change — a
   * setState, a dispatch — and runs inside the transition; `motion` says
   * which way it goes. A wait still running is let go first.
   */
  go(update: () => void, motion: MoveViewMotion = 'swap'): Promise<void> {
    const was = letGo();
    return runner(motion, () => settle(was, update));
  },

  /**
   * Change the view once work lands. The view goes inert and its keys dark
   * at once; a wait comes up if the work outlasts the delay, and stays until
   * it has been read. Resolves with the work's value after `arrive` ran,
   * rejects with its error after the wait handed the view back, and
   * resolves `undefined` when the wait was cancelled or superseded.
   */
  load<T>(work: (task: MoveViewTask) => Promise<T>, options: MoveViewLoadOptions<T>): Promise<T | undefined> {
    const was = letGo();
    return new Promise<T | undefined>((resolve, reject) => {
      const wait: MoveViewWait = { title: options.title, cancelable: !!options.cancelable };
      if (options.detail) wait.detail = options.detail;
      const task: Running = {
        controller: new AbortController(),
        wait,
        // a wait already up for the work this one replaces stays up
        shownAt: was && state.wait ? was.shownAt : null,
        timer: undefined,
        release: holdHardware(!!options.cancelable),
        drop: () => resolve(undefined),
      };
      // the hand is answered before the screen is: keys dark from this frame
      was?.release();
      running = task;
      const show = () => {
        setState({ busy: true, wait: task.wait });
        MoveSurfaceStore.setWait({ title: task.wait.title, ...(task.wait.detail ? { detail: task.wait.detail } : {}) });
      };
      if (task.shownAt !== null) show();
      else {
        setState({ busy: true, wait: null });
        task.timer = timers.setTimeout(() => {
          if (running !== task) return;
          task.shownAt = timers.now();
          void runner('wait', show);
        }, MOVE_VIEW_WAIT.delay);
      }

      const say = (title: string, detail?: string) => {
        if (running !== task) return;
        task.wait = { title, cancelable: task.wait.cancelable, ...(detail ? { detail } : {}) };
        if (task.shownAt !== null) show();
      };

      const finish = (landed: () => void) => {
        if (running !== task) return;
        const hold = moveViewHoldRemaining(task.shownAt, timers.now());
        const end = () => {
          if (running !== task) return;
          running = null;
          timers.clearTimeout(task.timer);
          landed();
        };
        if (hold > 0) task.timer = timers.setTimeout(end, hold);
        else end();
      };

      Promise.resolve()
        .then(() => work({ signal: task.controller.signal, say }))
        .then(
          (value) =>
            finish(() => {
              const arrive = options.arrive;
              if (arrive) {
                void runner(options.motion ?? 'open', () => settle(task, () => arrive(value))).then(() => resolve(value));
              } else if (task.shownAt !== null) {
                void runner('resume', () => settle(task)).then(() => resolve(value));
              } else {
                settle(task);
                resolve(value);
              }
            }),
          (error: unknown) =>
            finish(() => {
              const back = task.shownAt !== null ? runner('resume', () => settle(task)) : (settle(task), Promise.resolve());
              void back.then(() => reject(error));
            })
        );
    });
  },

  /** Abandon a cancelable wait: the work's signal aborts and the view comes
   *  back as it was. Returns whether there was one to abandon. */
  cancel(): boolean {
    if (!running?.wait.cancelable) return false;
    const was = letGo()!;
    if (was.shownAt === null) settle(was);
    else void runner('resume', () => settle(was));
    return true;
  },

  /** @internal The stage counts itself in: without one mounted, changes land
   *  unanimated and a wait has nowhere to show. */
  mountStage(): () => void {
    stages++;
    if (stages > 1) console.warn('[tweakers] more than one MoveViewStage is mounted; an app has one stage for all its views');
    return () => {
      stages--;
    };
  },

  /** @internal Tests drive the registry without a browser. */
  configureForTest(options: { runner?: MoveViewRunner; timers?: Partial<typeof timers> }) {
    if (options.runner) runner = options.runner;
    if (options.timers) timers = { ...timers, ...options.timers };
  },

  /** @internal */
  resetForTest() {
    letGo()?.release();
    state = IDLE;
    running = null;
    runner = viewTransitionRunner;
    MoveSurfaceStore.setWait(null);
  },
};
