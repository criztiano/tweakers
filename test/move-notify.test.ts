import { describe, it, expect } from 'vitest';
import {
  MOVE_FLOAT_SELECTOR,
  MOVE_NOTIFY_GAP,
  MOVE_NOTIFY_KINDS,
  notifyDockBottom,
} from '../src/move-notify';

// A 900px-tall window with a 300px panel on the floor: its top edge is at 600.
const VIEWPORT = 900;
const PANEL_TOP = 600;

describe('notifyDockBottom', () => {
  it('rests one gap off the bottom when nothing is standing', () => {
    expect(notifyDockBottom([], VIEWPORT)).toBe(MOVE_NOTIFY_GAP);
  });

  it('clears the panel when the panel is all there is', () => {
    expect(notifyDockBottom([PANEL_TOP], VIEWPORT)).toBe(300 + MOVE_NOTIFY_GAP);
  });

  it('rises over a display that comes up above the panel', () => {
    // A docked waveform floating over the panel: its top edge is higher.
    const waveTop = 380;
    expect(notifyDockBottom([PANEL_TOP, waveTop], VIEWPORT)).toBe(520 + MOVE_NOTIFY_GAP);
  });

  it('takes the highest edge whatever order the floats arrive in', () => {
    const tops = [PANEL_TOP, 380, 455];
    expect(notifyDockBottom(tops, VIEWPORT)).toBe(notifyDockBottom([...tops].reverse(), VIEWPORT));
  });

  it('settles back down when the display goes', () => {
    const raised = notifyDockBottom([PANEL_TOP, 380], VIEWPORT);
    const settled = notifyDockBottom([PANEL_TOP], VIEWPORT);
    expect(settled).toBeLessThan(raised);
    expect(settled).toBe(300 + MOVE_NOTIFY_GAP);
  });

  it('never sinks below the gap, even when a float hangs off the bottom edge', () => {
    expect(notifyDockBottom([VIEWPORT + 200], VIEWPORT)).toBe(MOVE_NOTIFY_GAP);
  });

  it('ignores an edge it cannot measure', () => {
    expect(notifyDockBottom([Number.NaN, PANEL_TOP], VIEWPORT)).toBe(300 + MOVE_NOTIFY_GAP);
    expect(notifyDockBottom([Number.NaN], VIEWPORT)).toBe(MOVE_NOTIFY_GAP);
  });

  it('rounds a fractional edge rather than passing it on as a fraction', () => {
    expect(Number.isInteger(notifyDockBottom([600.4], VIEWPORT))).toBe(true);
  });
});

describe('the floats the stack has to clear', () => {
  it('names the panel, both docked displays, the save input, and the app opt-in', () => {
    for (const part of [
      '.tweakers-move-root .tweakers-move',
      '.tweakers-move-wave[data-variant="dock"]',
      '.tweakers-move-curve',
      '.tweakers-move-preset-save',
      '[data-move-float]',
    ]) {
      expect(MOVE_FLOAT_SELECTOR).toContain(part);
    }
  });
});

describe('the kinds', () => {
  it('is the four the palette has a meaning for, info first', () => {
    expect(MOVE_NOTIFY_KINDS).toEqual(['info', 'success', 'warning', 'error']);
  });
});
