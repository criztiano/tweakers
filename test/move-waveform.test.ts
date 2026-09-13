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
  MOVE_WAVEFORM_PANEL,
  MOVE_WAVEFORM_PIXEL_RANGE,
  moveWaveformDemoSample,
  defaultStyle,
  styleFromValues,
} from '../src/move-waveform';
import { WAVEFORM_MAX_ZOOM } from '../src/waveform-engine';
import { MoveVolumeDisplay } from '../src/move-volume';
import { TweakStore } from '../src/store/TweakStore';

describe('the volume knob scrubs', () => {
  it('moves by the finest step on a slow tick and stops at both ends', () => {
    expect(scrubBy(0.5, 1)).toBeCloseTo(0.50025, 6);
    expect(scrubBy(0.5, -1)).toBeCloseTo(0.49975, 6);
    expect(scrubBy(0.001, -20)).toBe(0);
    expect(scrubBy(0.999, 20)).toBe(1);
  });

  it('bends a batched (fast) turn superlinear — spin to travel', () => {
    const spin = scrubBy(0.5, 10) - 0.5;
    expect(spin).toBeCloseTo(Math.pow(10, 1.2) * 0.00025, 6);
    // Ten slow ticks land short of one batched ten — speed buys reach.
    expect(spin).toBeGreaterThan(10 * 0.00025);
  });

  it('gives Shift the fine layer, linear and unaccelerated', () => {
    expect(scrubBy(0.5, 1, true)).toBeCloseTo(0.50005, 6);
    expect(scrubBy(0.5, 10, true)).toBeCloseTo(0.5005, 6);
  });

  it('follows the zoom: a tick moves a share of the window, not the sample', () => {
    expect(scrubBy(0.5, 1, false, 4)).toBeCloseTo(0.5000625, 6);
    expect(scrubBy(0.5, 1, true, 8)).toBeCloseTo(0.50000625, 6);
    // Zoomed out it is exactly the plain step.
    expect(scrubBy(0.5, 1, false, 1)).toBeCloseTo(scrubBy(0.5, 1), 6);
  });

  it('caps pathological batched deltas from the hardware encoder', () => {
    expect(scrubBy(0.5, 1000)).toBe(scrubBy(0.5, 24));
    expect(scrubBy(0.5, -1000, true)).toBe(scrubBy(0.5, -24, true));
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

  it('carries a clock for the panel, m:ss:cc of the playhead', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ position: 0.5 });
    // With no duration a position is still readable — as a percentage.
    expect(MoveWaveformStore.readout()).toBe('50%');
    expect(MoveWaveformStore.clock()).toBe('0:00:00');
    MoveWaveformStore.setDuration(90);
    expect(MoveWaveformStore.readout()).toBe('0:45.0');
    expect(MoveWaveformStore.clock()).toBe('0:45:00');
    MoveWaveformStore.setView({ position: 1 });
    expect(MoveWaveformStore.clock()).toBe('1:30:00');
    release();
  });

  it('reads the engine playhead during playback, not the last scrub', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setDuration(10);
    MoveWaveformStore.setView({ position: 0 });
    MoveWaveformStore.setProgressSource(() => 0.25);
    expect(MoveWaveformStore.readout()).toBe('0:02.5');
    expect(MoveWaveformStore.clock()).toBe('0:02:50');
    release();
  });

  it('scrubs from the engine playhead, so a turn mid-play carries on from the play', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ position: 0 });
    MoveWaveformStore.setProgressSource(() => 0.5);
    MoveWaveformStore.scrub(1, false, 1000);
    expect(MoveWaveformStore.getView().position).toBeCloseTo(scrubBy(0.5, 1), 6);
    release();
  });

  it('chains the detents of one turn, so a lagging seek loses none of them', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ position: 0 });
    MoveWaveformStore.setProgressSource(() => 0.5); // the engine, still where the turn began
    MoveWaveformStore.scrub(1, false, 1000);
    MoveWaveformStore.scrub(1, false, 1050);
    MoveWaveformStore.scrub(1, false, 1100);
    expect(MoveWaveformStore.getView().position).toBeCloseTo(scrubBy(scrubBy(scrubBy(0.5, 1), 1), 1), 6);
    // Mid-turn the knob's landing is the playhead, for the drawing and the clock.
    expect(MoveWaveformStore.isScrubbing(1200)).toBe(true);
    expect(MoveWaveformStore.playhead(1200)).toBeCloseTo(MoveWaveformStore.getView().position, 6);
    // A new turn, later, starts from the engine again.
    expect(MoveWaveformStore.isScrubbing(5000)).toBe(false);
    MoveWaveformStore.scrub(1, false, 5000);
    expect(MoveWaveformStore.getView().position).toBeCloseTo(scrubBy(0.5, 1), 6);
    release();
  });

  it('never moves less than real time on a short sample', () => {
    // Long sample: the share rules, as approved.
    expect(scrubBy(0.5, 1, false, 1, 180)).toBeCloseTo(scrubBy(0.5, 1), 6);
    // Five seconds: a slow detent is 25 ms of it, Shift 5 ms.
    expect(scrubBy(0.5, 1, false, 1, 5) - 0.5).toBeCloseTo(0.025 / 5, 6);
    expect(scrubBy(0.5, 1, true, 1, 5) - 0.5).toBeCloseTo(0.005 / 5, 6);
    // The floor follows the zoom like the share does.
    expect(scrubBy(0.5, 1, false, 4, 5) - 0.5).toBeCloseTo(0.025 / 5 / 4, 6);
  });

  it('wears the host transport and drops it with the claim', () => {
    const release = MoveWaveformStore.register();
    expect(MoveWaveformStore.getTransport()).toBe(null);
    MoveWaveformStore.setTransport({ playing: true, loopOn: false });
    expect(MoveWaveformStore.getTransport()).toEqual({ playing: true, loopOn: false });
    release();
    expect(MoveWaveformStore.getTransport()).toBe(null);
  });

  it('forgets the sample length on release', () => {
    const first = MoveWaveformStore.register();
    MoveWaveformStore.setDuration(60);
    first();
    const second = MoveWaveformStore.register();
    MoveWaveformStore.setView({ position: 0.5 });
    expect(MoveWaveformStore.readout()).toBe('50%');
    second();
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

describe('the look lives in the settings room', () => {
  beforeEach(() => TweakStore.unregisterPanel(MOVE_WAVEFORM_PANEL));

  it('puts the Waveform page in the room on the first claim, seeded with the app\'s look', () => {
    expect(TweakStore.getPanel(MOVE_WAVEFORM_PANEL)).toBeUndefined();
    const release = MoveWaveformStore.register({ mode: 'striped', pixelSize: 4, grid: true });
    const page = TweakStore.getPanel(MOVE_WAVEFORM_PANEL);
    expect(page?.kind).toBe('kit');
    expect(page?.name).toBe('Waveform');
    expect(MoveWaveformStore.getStyle()).toEqual({ mode: 'striped', pixelSize: 4, grid: true, bands: false, baseline: true });
    release();
    // The page stays: a room does not lose a page because its display is off screen.
    expect(TweakStore.getPanel(MOVE_WAVEFORM_PANEL)).toBeDefined();
  });

  it('is there from the panel\'s mount, before any sample has shown', () => {
    MoveWaveformStore.ensureSettings();
    expect(TweakStore.getPanel(MOVE_WAVEFORM_PANEL)?.kind).toBe('kit');
    // A later claim keeps the page as it is — no re-seed, no duplicate.
    MoveWaveformStore.ensureSettings({ mode: 'striped' });
    expect(MoveWaveformStore.getStyle().mode).toBe('pixelated');
  });

  it('never sits on the app\'s own page row', () => {
    const release = MoveWaveformStore.register();
    expect(TweakStore.getPanels('panel').some((p) => p.id === MOVE_WAVEFORM_PANEL)).toBe(false);
    release();
  });

  it('reads the page\'s values back as the style every waveform draws with', () => {
    const release = MoveWaveformStore.register();
    TweakStore.updateValue(MOVE_WAVEFORM_PANEL, 'style', 'smooth');
    TweakStore.updateValue(MOVE_WAVEFORM_PANEL, 'resolution', 6);
    TweakStore.updateValue(MOVE_WAVEFORM_PANEL, 'baseline', false);
    expect(MoveWaveformStore.getStyle()).toEqual({ mode: 'smooth', pixelSize: 6, grid: false, bands: false, baseline: false });
    release();
  });

  it('offers bar widths from 1× to 6× as the headline value, and every style', () => {
    expect(MOVE_WAVEFORM_PIXEL_RANGE).toEqual([1, 6]);
    expect(styleFromValues({ style: 'striped', resolution: 1 }, defaultStyle()).mode).toBe('striped');
    expect(styleFromValues({ style: 'striped', resolution: 1 }, defaultStyle()).pixelSize).toBe(1);
    // Off the range it clamps; anything unset — or nonsense — falls back to
    // the app's own look.
    expect(styleFromValues({ resolution: 40 }, defaultStyle()).pixelSize).toBe(6);
    expect(styleFromValues({ style: 'neon', resolution: '3×' }, defaultStyle())).toEqual(defaultStyle());
    expect(styleFromValues(undefined, defaultStyle())).toEqual(defaultStyle());
  });

  it('shows the three overlays as pictures and the bar width as a value', () => {
    MoveWaveformStore.ensureSettings();
    const controls = TweakStore.getPanel(MOVE_WAVEFORM_PANEL)!.controls;
    const by = (path: string) => controls.find((c) => c.path === path)!;
    expect(by('grid').icon).toBe('grid-2x2');
    expect(by('bands').icon).toBe('audio-lines');
    expect(by('baseline').icon).toBe('activity');
    expect(by('resolution').type).toBe('slider');
    expect(by('resolution').formatValue?.(2)).toBe('2×');
  });
});

describe('striped bars stretch the wave', () => {
  beforeEach(() => TweakStore.unregisterPanel(MOVE_WAVEFORM_PANEL));

  it('so the pads and the small screens frame half the window the zoom names', () => {
    const release = MoveWaveformStore.register();
    MoveWaveformStore.setView({ zoom: 2, position: 0.5 });
    expect(MoveWaveformStore.shownZoom()).toBe(2);
    TweakStore.updateValue(MOVE_WAVEFORM_PANEL, 'style', 'striped');
    expect(MoveWaveformStore.shownZoom()).toBe(4);
    // Pad 0 lands at the start of the window the card actually shows.
    MoveWaveformStore.pressPad(0);
    expect(MoveWaveformStore.getView().position).toBeCloseTo(0.375, 6);
    release();
  });
});

describe('two displays can hold the claim', () => {
  it('keeps the hardware until the last one lets go', () => {
    const a = MoveWaveformStore.register();
    const b = MoveWaveformStore.register();
    expect(MoveWaveformStore.isRegistered()).toBe(true);
    a();
    expect(MoveWaveformStore.isRegistered()).toBe(true);
    expect(MoveVolumeDisplay.get()?.label).toBe('time');
    b();
    expect(MoveWaveformStore.isRegistered()).toBe(false);
    expect(MoveVolumeDisplay.get()).toBe(null);
    // A release used twice is one release.
    a();
    expect(MoveWaveformStore.isRegistered()).toBe(false);
  });

  it('remembers the sample on the surface, and forgets it with the last claim', () => {
    const release = MoveWaveformStore.register();
    const sample = moveWaveformDemoSample();
    MoveWaveformStore.setBuffer(sample);
    expect(MoveWaveformStore.getBuffer()).toBe(sample);
    expect(sample.duration).toBe(4);
    expect(sample.getChannelData(0).some((v) => Math.abs(v) > 0.5)).toBe(true);
    release();
    expect(MoveWaveformStore.getBuffer()).toBe(null);
  });
});
