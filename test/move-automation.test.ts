import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomationLanesStore } from '../src/automation-store';
import { MOVE_CONNECTION_EVENT } from '../src/move-connection';
import { MoveFunctions } from '../src/move-functions';
import { listenMoveTouch } from '../src/move-automation';

// Automation on the Move: the Rec key, and the knobs' touch feeding the hands.

function storeOn(clock = { time: 0, duration: 2, playing: true }) {
  const commit = vi.fn();
  const store = new AutomationLanesStore({ clock: () => clock, play: () => {}, commit });
  store.load('a', { lanes: [] });
  return { store, commit };
}

describe('the Rec key', () => {
  it('records takes while claimed, Shift drops the one running, and the release gives Rec back', () => {
    const before = vi.fn();
    const detach = MoveFunctions.attach('rec', before, { label: 'Old' });
    const { store, commit } = storeOn();
    const release = store.claimRec();
    expect(MoveFunctions.label('rec')).toBe('Record');

    MoveFunctions.run('rec');
    expect(store.isRecording()).toBe(true);
    store.edit('in:x', 3, { label: 'X', min: 0, max: 4, before: 1 });
    MoveFunctions.run('rec', { shift: true });
    expect(store.isRecording()).toBe(false);
    expect(commit).not.toHaveBeenCalled();

    MoveFunctions.run('rec');
    store.edit('in:x', 3, { label: 'X', min: 0, max: 4, before: 1 });
    MoveFunctions.run('rec');
    expect(commit).toHaveBeenCalledOnce();
    expect(before).not.toHaveBeenCalled();

    release();
    MoveFunctions.run('rec');
    expect(before).toHaveBeenCalledOnce();
    expect(MoveFunctions.label('rec')).toBe('Old');
    detach();
  });

  it('Shift + Rec with no take running starts one', () => {
    const { store } = storeOn();
    const release = store.claimRec();
    MoveFunctions.run('rec', { shift: true });
    expect(store.isRecording()).toBe(true);
    store.cancelTake();
    release();
  });
});

describe('the knobs’ touch', () => {
  let target: EventTarget;
  beforeEach(() => {
    target = new EventTarget();
    vi.stubGlobal('window', target);
  });
  afterEach(() => vi.unstubAllGlobals());

  const say = (pageId: string, touched: Record<string, boolean>) =>
    target.dispatchEvent(new CustomEvent('move-tweakers:touch', { detail: { pageId, touched } }));

  it('passes on each change, by the store’s keys, ignoring controls it does not drive', () => {
    const touch = vi.fn();
    const off = listenMoveTouch({ touch }, (page, path) => (path === 'skip' ? null : `${page}/${path}`));
    say('stage', { speed: true, skip: true });
    say('stage', { speed: true, skip: true });
    expect(touch.mock.calls).toEqual([['stage/speed', true]]);
    say('stage', { speed: true, grain: true });
    say('stage', { grain: true });
    expect(touch.mock.calls.slice(1)).toEqual([['stage/grain', true], ['stage/speed', false]]);
    off();
    expect(touch.mock.calls.at(-1)).toEqual(['stage/grain', false]);
  });

  it('lets go of everything on a page change, and when the Move goes away', () => {
    const touch = vi.fn();
    const off = listenMoveTouch({ touch }, (page, path) => `${page}/${path}`);
    say('stage', { speed: true });
    say('paint', { size: true });
    expect(touch.mock.calls).toEqual([['stage/speed', true], ['stage/speed', false], ['paint/size', true]]);
    target.dispatchEvent(new CustomEvent(MOVE_CONNECTION_EVENT, { detail: { bridge: true, device: false, active: false } }));
    expect(touch.mock.calls.at(-1)).toEqual(['paint/size', false]);
    off();
    expect(touch).toHaveBeenCalledTimes(4);
  });

  it('speaks the panel’s own event name', async () => {
    const { MOVE_TOUCH_EVENT } = await import('../src/components/MovePanel');
    expect(MOVE_TOUCH_EVENT).toBe('move-tweakers:touch');
  });
});
