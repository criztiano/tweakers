import { describe, it, expect, beforeEach } from 'vitest';
import {
  MoveWaveformStore,
  defaultView,
  scrubBy,
  zoomBy,
  stepPosition,
  loopFromStep,
  loopSteps,
  visibleWindow,
  padPosition,
  padSection,
  MOVE_WAVEFORM_STEPS,
  MOVE_WAVEFORM_PADS,
} from '../src/move-waveform';
import { WAVEFORM_MAX_ZOOM } from '../src/waveform-engine';

describe('the volume knob scrubs', () => {
  it('moves by the finest step on a slow tick and stops at both ends', () => {
    expect(scrubBy(0.5, 1)).toBeCloseTo(0.502, 6);
    expect(scrubBy(0.5, -1)).toBeCloseTo(0.498, 6);
    expect(scrubBy(0.001, -20)).toBe(0);
    expect(scrubBy(0.999, 20)).toBe(1);
  });

  it('bends a batched (fast) turn superlinear — spin to travel', () => {
    const spin = scrubBy(0.5, 10) - 0.5;
    expect(spin).toBeCloseTo(Math.pow(10, 1.6) * 0.002, 6);
    // Ten slow ticks land short of one batched ten — speed buys reach.
    expect(spin).toBeGreaterThan(10 * 0.002);
  });

  it('gives Shift the fine layer, linear and unaccelerated', () => {
    expect(scrubBy(0.5, 1, true)).toBeCloseTo(0.5004, 6);
    expect(scrubBy(0.5, 10, true)).toBeCloseTo(0.504, 6);
  });

  it('follows the zoom: a tick moves a share of the window, not the sample', () => {
    expect(scrubBy(0.5, 1, false, 4)).toBeCloseTo(0.5005, 6);
    expect(scrubBy(0.5, 1, true, 8)).toBeCloseTo(0.50005, 6);
    // Zoomed out it is exactly the plain step.
    expect(scrubBy(0.5, 1, false, 1)).toBeCloseTo(scrubBy(0.5, 1), 6);
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

  it('a held step lets the loop go', () => {
    MoveWaveformStore.pressStep(2);
    MoveWaveformStore.pressStep(5);
    expect(MoveWaveformStore.getView().loop).not.toBe(null);
    MoveWaveformStore.holdStep(3);
    expect(MoveWaveformStore.getView().loop).toBe(null);
    expect(MoveWaveformStore.getView().loopAnchor).toBe(null);
  });
});

describe('the shown window', () => {
  it('is the whole sample at zoom 1', () => {
    expect(visibleWindow(0.5, 1)).toEqual({ start: 0, span: 1 });
  });

  it('centres on the playhead and clamps to the edges, like the renderer', () => {
    expect(visibleWindow(0.5, 4)).toEqual({ start: 0.375, span: 0.25 });
    expect(visibleWindow(0, 4).start).toBe(0);
    expect(visibleWindow(1, 4).start).toBeCloseTo(0.75, 6);
  });

  it('addresses its eighths from the pad row', () => {
    const window = visibleWindow(0.5, 4);
    expect(padPosition(window, 0)).toBe(window.start);
    expect(padPosition(window, 4)).toBeCloseTo(0.5, 6);
    const section = padSection(window, 2);
    expect(section.start).toBeCloseTo(window.start + (2 / MOVE_WAVEFORM_PADS) * window.span, 6);
    expect(section.end - section.start).toBeCloseTo(window.span / MOVE_WAVEFORM_PADS, 6);
  });
});

describe('the editor claim', () => {
  it('widens the waveform to the whole row and the pads, and hands back on release', () => {
    const release = MoveWaveformStore.register();
    expect(MoveWaveformStore.wantsSteps()).toBe(false);
    MoveWaveformStore.setEditor(true);
    expect(MoveWaveformStore.wantsSteps()).toBe(true);
    expect(MoveWaveformStore.wantsPads()).toBe(true);
    release();
    expect(MoveWaveformStore.wantsSteps()).toBe(false);
    expect(MoveWaveformStore.wantsPads()).toBe(false);
  });

  it('never claims without a mounted waveform, whatever the editor says', () => {
    MoveWaveformStore.setEditor(true);
    expect(MoveWaveformStore.wantsSteps()).toBe(false);
    MoveWaveformStore.setEditor(false);
  });

  it('a pad tap jumps the playhead into that eighth of the shown window', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ zoom: 4, position: 0.5 });
    MoveWaveformStore.pressPad(0);
    expect(MoveWaveformStore.getView().position).toBeCloseTo(0.375, 6);
    release();
  });

  it('a held pad selects that eighth as the loop', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ zoom: 1, position: 0 });
    MoveWaveformStore.pressPad(2, true);
    expect(MoveWaveformStore.getView().loop).toEqual({ start: 2 / 8, end: 3 / 8 });
    release();
  });

  it('frames on the live playhead when a progress source is set', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ zoom: 4, position: 0 });
    MoveWaveformStore.setProgressSource(() => 0.5);
    MoveWaveformStore.pressPad(0);
    // The window is centred on the playing position, not the last scrub.
    expect(MoveWaveformStore.getView().position).toBeCloseTo(0.375, 6);
    release();
  });
});
