import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveViews } from '../src/move-views';
import { MoveFunctions } from '../src/move-functions';
import { MoveSurfaceStore } from '../src/move-surface-store';
import { MOVE_VIEW_WAIT, type MoveViewChange } from '../src/move-view-core';

// The registry's sequencing, without a browser: the runner records which
// change ran and lands the update at once; the clock is vitest's.

let changes: MoveViewChange[] = [];
const detaches: (() => void)[] = [];

/** Work the test settles by hand. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.useFakeTimers();
  changes = [];
  MoveViews.configureForTest({
    runner: (change, update) => {
      changes.push(change);
      update();
      return Promise.resolve();
    },
  });
  detaches.push(MoveFunctions.attach('capture', () => {}, { label: 'Load file' }));
});

afterEach(() => {
  MoveViews.resetForTest();
  for (const detach of detaches.splice(0)) detach();
  vi.useRealTimers();
});

describe('MoveViews.go', () => {
  it('runs the change with its motion', async () => {
    let page = 'deck';
    await MoveViews.go(() => { page = 'record'; }, 'forward');
    expect(page).toBe('record');
    expect(changes).toEqual(['forward']);
  });
});

describe('MoveViews.load', () => {
  it('shows no wait for work that lands inside the delay, and arrives with its motion', async () => {
    const work = deferred<string>();
    let opened = '';
    const done = MoveViews.load(() => work.promise, { title: 'Opening', arrive: (v) => { opened = v; } });
    expect(MoveViews.getState()).toEqual({ busy: true, wait: null });
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay - 50);
    work.resolve('take.wav');
    await expect(done).resolves.toBe('take.wav');
    expect(opened).toBe('take.wav');
    expect(changes).toEqual(['open']);
    expect(MoveViews.getState()).toEqual({ busy: false, wait: null });
  });

  it('darkens every key the moment work starts, and hands them back when it lands', async () => {
    const work = deferred<void>();
    expect(MoveFunctions.list()).toEqual(['capture']);
    const done = MoveViews.load(() => work.promise, { title: 'Opening' });
    expect(MoveFunctions.list()).toEqual([]);
    work.resolve();
    await done;
    expect(MoveFunctions.list()).toEqual(['capture']);
  });

  it('keeps the keys the arriving view attaches', async () => {
    const work = deferred<void>();
    const done = MoveViews.load(() => work.promise, {
      title: 'Opening',
      arrive: () => { detaches.push(MoveFunctions.attach('rec', () => {})); },
    });
    work.resolve();
    await done;
    expect(MoveFunctions.list()).toEqual(['capture', 'rec']);
  });

  it('brings a wait up after the delay, on screen and on the Move', async () => {
    const work = deferred<void>();
    void MoveViews.load(() => work.promise, { title: 'Opening', detail: 'take.wav' });
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay);
    expect(changes).toEqual(['wait']);
    expect(MoveViews.getState().wait).toEqual({ title: 'Opening', detail: 'take.wav', cancelable: false });
    expect(MoveSurfaceStore.getState().wait).toEqual({ title: 'Opening', detail: 'take.wav' });
  });

  it('holds a wait that came up until it has been read, then arrives', async () => {
    const work = deferred<void>();
    let arrived = false;
    const done = MoveViews.load(() => work.promise, { title: 'Opening', arrive: () => { arrived = true; }, motion: 'forward' });
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay + 10);
    work.resolve();
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.hold - 20);
    expect(arrived).toBe(false);
    await vi.advanceTimersByTimeAsync(20);
    await done;
    expect(arrived).toBe(true);
    expect(changes).toEqual(['wait', 'forward']);
    expect(MoveSurfaceStore.getState().wait).toBeNull();
  });

  it('hands the view back after a failure, then rejects', async () => {
    const work = deferred<void>();
    const done = MoveViews.load(() => work.promise, { title: 'Opening', arrive: () => { throw new Error('never'); } });
    const settled = done.catch((error: Error) => error.message);
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay);
    work.reject(new Error('disk full'));
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.hold);
    expect(await settled).toBe('disk full');
    expect(changes).toEqual(['wait', 'resume']);
    expect(MoveViews.getState()).toEqual({ busy: false, wait: null });
    expect(MoveFunctions.list()).toEqual(['capture']);
  });

  it('rejects a fast failure without moving anything', async () => {
    const done = MoveViews.load(() => Promise.reject(new Error('gone')), { title: 'Opening' });
    await expect(done).rejects.toThrow('gone');
    expect(changes).toEqual([]);
  });

  it('lets a superseded load go: its result never arrives', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const arrived: string[] = [];
    let firstSignal: AbortSignal | undefined;
    const a = MoveViews.load(({ signal }) => { firstSignal = signal; return first.promise; }, { title: 'Opening', arrive: (v) => arrived.push(v) });
    await vi.advanceTimersByTimeAsync(0);
    const b = MoveViews.load(() => second.promise, { title: 'Opening', arrive: (v) => arrived.push(v) });
    await expect(a).resolves.toBeUndefined();
    expect(firstSignal?.aborted).toBe(true);
    first.resolve('old');
    second.resolve('new');
    await b;
    expect(arrived).toEqual(['new']);
    expect(MoveFunctions.list()).toEqual(['capture']);
  });

  it('keeps a standing wait up when a new load replaces the work under it', async () => {
    void MoveViews.load(() => new Promise(() => {}), { title: 'Saving' });
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay);
    void MoveViews.load(() => new Promise(() => {}), { title: 'Opening' });
    expect(changes).toEqual(['wait']);
    expect(MoveViews.getState().wait?.title).toBe('Opening');
  });

  it('lets a wait go when the app changes view itself', async () => {
    const work = deferred<void>();
    const done = MoveViews.load(() => work.promise, { title: 'Opening', arrive: () => { throw new Error('never'); } });
    let page = '';
    await MoveViews.go(() => { page = 'start'; }, 'close');
    await expect(done).resolves.toBeUndefined();
    expect(page).toBe('start');
    expect(MoveViews.getState().busy).toBe(false);
    expect(MoveFunctions.list()).toEqual(['capture']);
  });

  it('changes what the wait says as the work moves on', async () => {
    const saved = deferred<void>();
    void MoveViews.load(async ({ say }) => {
      await saved.promise;
      say('Opening', 'take.wav');
      return new Promise<void>(() => {});
    }, { title: 'Saving' });
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay);
    expect(MoveViews.getState().wait?.title).toBe('Saving');
    saved.resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(MoveViews.getState().wait?.title).toBe('Opening');
    expect(MoveSurfaceStore.getState().wait).toEqual({ title: 'Opening', detail: 'take.wav' });
  });
});

describe('a cancelable wait', () => {
  it('lights Back as the way out, and Back abandons the work', async () => {
    let signal: AbortSignal | undefined;
    const done = MoveViews.load((task) => { signal = task.signal; return new Promise<void>(() => {}); }, { title: 'Importing', cancelable: true });
    expect(MoveFunctions.list()).toEqual(['back']);
    await vi.advanceTimersByTimeAsync(MOVE_VIEW_WAIT.delay);
    MoveFunctions.run('back');
    await expect(done).resolves.toBeUndefined();
    expect(signal?.aborted).toBe(true);
    expect(changes).toEqual(['wait', 'resume']);
    expect(MoveFunctions.list()).toEqual(['capture']);
  });

  it('cannot be cancelled when it did not say so', async () => {
    void MoveViews.load(() => new Promise(() => {}), { title: 'Opening' });
    expect(MoveViews.cancel()).toBe(false);
    expect(MoveViews.getState().busy).toBe(true);
  });
});

describe('the wheel during a wait', () => {
  it('consumes the wheel while work runs, and lets it through after', async () => {
    // A browser runs the capture listener first at the target, ahead of any
    // app listener; node's EventTarget runs listeners in the order added, so
    // the app's listener is added after the wait's here.
    const target = new EventTarget();
    vi.stubGlobal('window', target);
    const turns: number[] = [];
    const work = deferred<void>();
    const done = MoveViews.load(() => work.promise, { title: 'Opening' });
    target.addEventListener('move-tweakers:jog', () => turns.push(1));
    const consumed = !target.dispatchEvent(new CustomEvent('move-tweakers:jog', { cancelable: true }));
    expect(consumed).toBe(true);
    expect(turns).toEqual([]);
    work.resolve();
    await done;
    expect(target.dispatchEvent(new CustomEvent('move-tweakers:jog', { cancelable: true }))).toBe(true);
    expect(turns).toEqual([1]);
    vi.unstubAllGlobals();
  });
});

describe('the browser runner', () => {
  it('lands a change at once where there is no view transition, and reports a failing one', async () => {
    const { viewTransitionRunner } = await import('../src/move-views');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let landed = false;
    await viewTransitionRunner('forward', () => { landed = true; });
    expect(landed).toBe(true);
    await expect(viewTransitionRunner('open', () => { throw new Error('bad arrive'); })).resolves.toBeUndefined();
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });
});
