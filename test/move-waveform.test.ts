import { describe, it, expect, beforeEach } from 'vitest';
import {
  MoveWaveformStore,
  defaultView,
  scrubBy,
  zoomBy,
  stepPosition,
  loopFromStep,
  loopSteps,
  MOVE_WAVEFORM_STEPS,
} from '../src/move-waveform';
import { WAVEFORM_MAX_ZOOM } from '../src/waveform-engine';

describe('the volume knob scrubs', () => {
  it('moves by detents and stops at both ends', () => {
    expect(scrubBy(0.5, 10)).toBeCloseTo(0.6, 6);
    expect(scrubBy(0.5, -10)).toBeCloseTo(0.4, 6);
    expect(scrubBy(0.02, -10)).toBe(0);
    expect(scrubBy(0.98, 10)).toBe(1);
  });

  it('gives Shift the fine layer, as the rest of the surface does', () => {
    expect(scrubBy(0.5, 1, true)).toBeCloseTo(0.502, 6);
    expect(scrubBy(0.5, 1, false)).toBeCloseTo(0.51, 6);
  });
});

describe('the wheel zooms', () => {
  it('is proportional, so out undoes in', () => {
    const inTen = zoomBy(1, 10);
    expect(inTen).toBeGreaterThan(1);
    expect(zoomBy(inTen, -10)).toBeCloseTo(1, 3);
  });

  it('holds between the whole sample and the engine\'s own ceiling', () => {
    expect(zoomBy(1, -20)).toBe(1);
    expect(zoomBy(WAVEFORM_MAX_ZOOM, 40)).toBe(WAVEFORM_MAX_ZOOM);
  });
});

describe('the step row marks the loop', () => {
  const view = defaultView();

  it('takes the in point, then the out point', () => {
    const first = loopFromStep(view, 4);
    expect(first.loop).toBe(null);
    expect(first.loopAnchor).toBe(4);

    const second = loopFromStep({ ...view, ...first }, 7);
    expect(second.loopAnchor).toBe(null);
    // 4 in, 7 out — the loop covers step 7 too, not the gap before it.
    expect(second.loop).toEqual({ start: 4 / 16, end: 8 / 16 });
  });

  it('reads the two presses in either order', () => {
    const down = loopFromStep({ ...view, loopAnchor: 12 }, 3);
    expect(down.loop).toEqual({ start: 3 / 16, end: 13 / 16 });
  });

  it('cancels rather than making a loop you cannot hear', () => {
    const same = loopFromStep({ ...view, loopAnchor: 5 }, 5);
    expect(same).toEqual({ loop: null, loopAnchor: null });
  });

  it('starts a new loop once one is set', () => {
    const set = { ...view, loop: { start: 0, end: 0.5 }, loopAnchor: null };
    expect(loopFromStep(set, 9)).toEqual({ loop: null, loopAnchor: 9 });
  });

  it('lights the span it covers, or the anchor while one is pending', () => {
    expect(loopSteps({ ...view, loop: { start: 4 / 16, end: 8 / 16 } })).toEqual([4, 5, 6, 7]);
    expect(loopSteps({ ...view, loopAnchor: 2 })).toEqual([2]);
    expect(loopSteps(view)).toEqual([]);
  });

  it('places every step along the sample', () => {
    expect(stepPosition(0)).toBe(0);
    expect(stepPosition(MOVE_WAVEFORM_STEPS)).toBe(1);
    expect(stepPosition(8)).toBe(0.5);
  });
});

describe('the registry', () => {
  beforeEach(() => {
    MoveWaveformStore.clearLoop();
    MoveWaveformStore.setView(defaultView());
  });

  it('claims the hardware while mounted and hands it back on release', () => {
    expect(MoveWaveformStore.isRegistered()).toBe(false);
    const release = MoveWaveformStore.register();
    expect(MoveWaveformStore.isRegistered()).toBe(true);
    release();
    expect(MoveWaveformStore.isRegistered()).toBe(false);
  });

  it('resets the view on release, so the next waveform starts clean', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.scrub(20);
    MoveWaveformStore.zoom(5);
    expect(MoveWaveformStore.getView().position).toBeGreaterThan(0);
    release();
    expect(MoveWaveformStore.getView()).toEqual(defaultView());
  });

  it('notifies on a real change and stays quiet otherwise', () => {
    let hits = 0;
    const stop = MoveWaveformStore.subscribe(() => { hits += 1; });
    MoveWaveformStore.scrub(5);
    const after = hits;
    expect(after).toBeGreaterThan(0);
    MoveWaveformStore.setView({ position: MoveWaveformStore.getView().position });
    expect(hits).toBe(after);
    stop();
  });

  it('drives the loop from step presses', () => {
    MoveWaveformStore.pressStep(2);
    expect(MoveWaveformStore.getView().loop).toBe(null);
    MoveWaveformStore.pressStep(5);
    expect(MoveWaveformStore.getView().loop).toEqual({ start: 2 / 16, end: 6 / 16 });
    MoveWaveformStore.clearLoop();
    expect(MoveWaveformStore.getView().loop).toBe(null);
  });
});
