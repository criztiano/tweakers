import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOVE_CONNECTION_ASK_EVENT, MOVE_CONNECTION_EVENT, MoveConnection } from '../src/move-connection';

// The registry behind the connection dot: it keeps the kit's latest word, asks
// for it when a reader first arrives, and calls the Move live only when the
// bridge answers, the Move is there, and this page holds it.

let win: EventTarget;
const say = (detail: unknown) => win.dispatchEvent(new CustomEvent(MOVE_CONNECTION_EVENT, { detail }));

beforeEach(() => {
  win = new EventTarget();
  vi.stubGlobal('window', win);
});

afterEach(() => {
  MoveConnection.resetForTest();
  vi.unstubAllGlobals();
});

describe('MoveConnection', () => {
  it('reads as away until the kit says otherwise', () => {
    expect(MoveConnection.getState()).toEqual({ bridge: false, device: false, active: false });
    expect(MoveConnection.isLive()).toBe(false);
  });

  it('asks the kit once, when its first reader arrives', () => {
    const asked = vi.fn();
    win.addEventListener(MOVE_CONNECTION_ASK_EVENT, asked);
    MoveConnection.subscribe(() => {});
    MoveConnection.subscribe(() => {});
    expect(asked).toHaveBeenCalledTimes(1);
  });

  it('is live only with the bridge, the Move and the surface all at once', () => {
    const heard = vi.fn();
    MoveConnection.subscribe(heard);
    say({ bridge: true, device: true, active: false });
    expect(MoveConnection.isLive()).toBe(false);
    say({ bridge: true, device: true, active: true });
    expect(MoveConnection.isLive()).toBe(true);
    say({ bridge: true, device: false, active: false });
    expect(MoveConnection.isLive()).toBe(false);
    expect(heard).toHaveBeenCalledTimes(3);
  });

  it('stays quiet when the kit repeats itself', () => {
    const heard = vi.fn();
    MoveConnection.subscribe(heard);
    say({ bridge: true, device: true, active: true });
    say({ bridge: true, device: true, active: true });
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it('stops calling a reader that let go', () => {
    const heard = vi.fn();
    const off = MoveConnection.subscribe(heard);
    off();
    say({ bridge: true, device: true, active: true });
    expect(heard).not.toHaveBeenCalled();
    expect(MoveConnection.isLive()).toBe(true);
  });
});
