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
 * presses reach its handlers — and only the pictures move (a pointer waits
 * for them: the browser keeps a moving picture out of reach). A second
 * change never cuts the first: it takes the arriving view's place while
 * that is still out of sight, and otherwise plays once the first has
 * landed. Without the API (or on a hidden tab) the change just lands.
 *
 * A wait is honest in the hand before it is visible on the screen. The
 * moment work starts the view goes inert and every key goes dark — nothing
 * there can be pressed into doing something twice, not even a key the view
 * attaches again while it waits — the Move's wheel walks nothing, and the
 * computer's keys reach nothing but Escape. Work that lands fast never shows a wait; work that does
 * not brings it up, on the screen and on the Move's own display, and holds
 * it long enough to be read. `cancelable` lights Back to abandon the wait.
 * The newest intent wins: a second `load` or a `go` supersedes a running
 * wait, whose result is then let go.
 */

import { flushSync } from 'react-dom';
import { MoveFunctions } from './move-functions';
import { MoveSurfaceStore } from './move-surface-store';
import {
  MOVE_VIEW_EXPO_BEZIER,
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
  /** When the wait began to come up; null while it has not. */
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

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A layer's fade and zoom as one animation where they share their timing
 *  (they always do, but for reduced motion's fade alone), so the two can
 *  never drift apart by a frame. */
function play(root: HTMLElement, layer: MoveViewLayer, pseudoElement: string) {
  const { fade, move } = layer;
  const together = move && move.duration === fade.duration && move.delay === fade.delay && move.easing === fade.easing;
  const run = (frames: Keyframe[], tween: { duration: number; delay: number; easing: string }) => {
    const timing = { duration: tween.duration, delay: tween.delay, fill: 'both' as const, pseudoElement };
    try {
      root.animate(frames, { ...timing, easing: tween.easing });
    } catch {
      // a browser without linear() still plays expo in-out, as a Bézier
      root.animate(frames, { ...timing, easing: MOVE_VIEW_EXPO_BEZIER });
    }
  };
  if (together) {
    run([{ opacity: fade.from, transform: move.from }, { opacity: fade.to, transform: move.to }], fade);
    return;
  }
  run([{ opacity: fade.from }, { opacity: fade.to }], fade);
  if (move) run([{ transform: move.from }, { transform: move.to }], move);
}

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

/** The change on screen now. */
interface Playing {
  /** Updates still waiting for the old picture to be taken; null once they ran. */
  queue: (() => void)[] | null;
  /** When the pictures began to move; null until they do. */
  movingAt: number | null;
  /** How long the arriving picture stays out of sight, ms. */
  quiet: number;
  /** Changes asked for once the arriving picture was in sight: they wait
   *  for this one to land, then play as one — the last change's name wins. */
  next: { change: MoveViewChange; updates: (() => void)[]; resolve: () => void; landed: Promise<void> } | null;
  updated: Promise<void>;
}

let playing: Playing | null = null;

const VIEWPORT_SHEET = '.tweakers-move[data-dock="viewport"]';
const SHEET_ATTR = 'data-tweakers-move-view-sheet';

function runUpdates(updates: (() => void)[]) {
  flushSync(() => {
    for (const update of updates) {
      try {
        update();
      } catch (error) {
        console.error('[tweakers] a view change failed', error);
      }
    }
  });
}

type AnimatableDocument = ViewTransitionDocument & { startViewTransition: NonNullable<ViewTransitionDocument['startViewTransition']> };

/** A change can play: the API is there, a stage is mounted, the tab is seen. */
const animatable = (doc: ViewTransitionDocument | null): doc is AnimatableDocument =>
  !!doc?.startViewTransition && stages > 0 && doc.visibilityState !== 'hidden';

function startChange(doc: AnimatableDocument, change: MoveViewChange, updates: (() => void)[]): Promise<void> {
  const root = doc.documentElement;
  const plan = moveViewChoreography(change, reducedMotion());
  // The viewport sheet is a picture of its own, named only while exactly
  // one stands: a second would share the name and void the whole change.
  const sheetBefore = doc.querySelectorAll(VIEWPORT_SHEET).length === 1;
  let sheetAfter = sheetBefore;
  root.setAttribute(MOVE_VIEW_CHANGE_ATTR, change);
  root.toggleAttribute(SHEET_ATTR, sheetBefore);
  const entry: Playing = { queue: [...updates], movingAt: null, quiet: plan.quiet, next: null, updated: Promise.resolve() };
  const transition = doc.startViewTransition(() => {
    const queue = entry.queue ?? [];
    entry.queue = null;
    runUpdates(queue);
    sheetAfter = doc.querySelectorAll(VIEWPORT_SHEET).length === 1;
    if (sheetAfter) root.setAttribute(SHEET_ATTR, '');
  });
  entry.updated = transition.updateCallbackDone.catch(() => {});
  playing = entry;
  transition.ready
    .then(() => {
      entry.movingAt = performance.now();
      play(root, plan.leaving, `::view-transition-old(${MOVE_VIEW_STAGE_NAME})`);
      play(root, plan.arriving, `::view-transition-new(${MOVE_VIEW_STAGE_NAME})`);
      // a sheet that comes or goes with the view makes the same entrance;
      // one on both sides holds still
      if (sheetBefore && !sheetAfter) play(root, plan.leaving, `::view-transition-old(${MOVE_VIEW_PANEL_NAME})`);
      if (!sheetBefore && sheetAfter) play(root, plan.arriving, `::view-transition-new(${MOVE_VIEW_PANEL_NAME})`);
    })
    .catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (playing !== entry) return;
      playing = null;
      root.removeAttribute(MOVE_VIEW_CHANGE_ATTR);
      root.removeAttribute(SHEET_ATTR);
      const next = entry.next;
      if (!next) return;
      // the stage may be gone, or the tab hidden, by the time this one lands
      if (animatable(doc)) void startChange(doc, next.change, next.updates).then(next.resolve);
      else {
        runUpdates(next.updates);
        next.resolve();
      }
    });
  return entry.updated;
}

/**
 * The runner the kit uses: a same-document view transition scoped to the
 * stage, its two pictures moved by the choreography.
 *
 * The app's update commits the moment the old picture is taken, so the new
 * view is live — its keys lit, its list on the Move — while the pictures
 * move. A change asked for while one is playing never cuts it:
 * - before the old picture is taken, it joins that same change;
 * - while the arriving picture is still out of sight (`quiet`), it lands in
 *   place at once, and the picture on its way in is simply the newer view;
 * - after that, it waits for the pictures to land and plays next, and every
 *   change asked for meanwhile joins it.
 */
export const viewTransitionRunner: MoveViewRunner = (change, update) => {
  const doc = typeof document === 'undefined' ? null : (document as ViewTransitionDocument);
  if (!animatable(doc)) {
    // lands the same way the animated change does: a failing update is
    // reported, and never leaves a wait standing
    try {
      update();
    } catch (error) {
      console.error('[tweakers] a view change failed', error);
    }
    return Promise.resolve();
  }
  const now = playing;
  if (now?.queue) {
    now.queue.push(update);
    return now.updated;
  }
  if (now && (now.movingAt === null || performance.now() - now.movingAt < now.quiet)) {
    runUpdates([update]);
    return Promise.resolve();
  }
  if (now) {
    if (!now.next) {
      let resolve!: () => void;
      const landed = new Promise<void>((r) => { resolve = r; });
      now.next = { change, updates: [], resolve, landed };
    }
    now.next.change = change;
    now.next.updates.push(update);
    return now.next.landed;
  }
  return startChange(doc, change, [update]);
};

let runner: MoveViewRunner = viewTransitionRunner;
let timers = {
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
  clearTimeout: (id: ReturnType<typeof setTimeout> | undefined) => clearTimeout(id),
  now: () => Date.now(),
};

/* ---- the hand, while work runs ----------------------------------------- */

/** Darken every key and keep it dark — the view behind the wait stays
 *  mounted and may attach again as its state moves — with Back as the way
 *  out when the wait may be abandoned. The wheel walks nothing, and the
 *  computer's keys reach nothing but Escape, which is Back. Returns the
 *  release. */
function holdInput(cancelable: boolean): () => void {
  const wake = MoveFunctions.suspend(cancelable ? ['back'] : [], { sealed: true });
  const releaseBack = cancelable ? MoveFunctions.push('back', () => MoveViews.cancel(), { chip: false }) : null;
  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const onKey = (event: Event) => {
    event.stopImmediatePropagation();
    if ((event as KeyboardEvent).key !== 'Escape') return;
    event.preventDefault();
    MoveViews.cancel();
  };
  const win = typeof window === 'undefined' ? null : window;
  for (const type of JOG_EVENTS) win?.addEventListener(type, swallow, { capture: true });
  win?.addEventListener('keydown', onKey, { capture: true });
  return () => {
    for (const type of JOG_EVENTS) win?.removeEventListener(type, swallow, { capture: true });
    win?.removeEventListener('keydown', onKey, { capture: true });
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
        release: holdInput(!!options.cancelable),
        drop: () => resolve(undefined),
      };
      // the hand is answered before the screen is: keys dark from this frame
      was?.release();
      running = task;
      // the wait comes up inside a transition, a frame or a whole change after
      // its timer — by then the work may have been let go, and a wait nobody
      // runs must not stand. It counts as shown from the moment it is.
      const show = () => {
        if (running !== task) return;
        if (task.shownAt === null) task.shownAt = timers.now();
        setState({ busy: true, wait: task.wait });
        MoveSurfaceStore.setWait({ title: task.wait.title, ...(task.wait.detail ? { detail: task.wait.detail } : {}) });
      };
      if (task.shownAt !== null) show();
      else {
        setState({ busy: true, wait: null });
        task.timer = timers.setTimeout(() => {
          if (running !== task) return;
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
        const hold = moveViewHoldRemaining(task.shownAt, timers.now(), moveViewChoreography('wait', reducedMotion()));
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
