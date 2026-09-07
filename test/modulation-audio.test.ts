import { describe, it, expect, afterEach } from 'vitest';
import { AUDIO_DEF, setAudioModBuffer, getAudioModBuffer, audioModLevel } from '../src/modulation-core';

/**
 * A sample the tests can reason about: one second, silent in the first half,
 * full-scale in the second — the envelope reads 0 then 1, and every position
 * maps to a known level. Duck-typed the way the DSP helpers read it.
 */
function halfLoudBuffer(seconds = 1, rate = 8000): AudioBuffer {
  const length = seconds * rate;
  const data = new Float32Array(length);
  for (let i = length / 2; i < length; i++) data[i] = i % 2 ? 1 : -1;
  return {
    numberOfChannels: 1,
    length,
    duration: seconds,
    sampleRate: rate,
    getChannelData: () => data,
  } as unknown as AudioBuffer;
}

const tickTo = (state: unknown, params: Record<string, unknown>, seconds: number, step = 1 / 60) => {
  let out = 0;
  for (let t = 0; t < seconds; t += step) out = AUDIO_DEF.tick(state, params as never, step, 120);
  return out;
};

afterEach(() => setAudioModBuffer(null));

describe('the sample shelf', () => {
  it('keeps the buffer for the visualizer and the envelope for the engine', () => {
    const buffer = halfLoudBuffer();
    setAudioModBuffer(buffer);
    expect(getAudioModBuffer()).toBe(buffer);
    expect(audioModLevel(0.25)).toBe(0);
    expect(audioModLevel(0.75)).toBeCloseTo(1, 2);
    setAudioModBuffer(null);
    expect(getAudioModBuffer()).toBe(null);
    expect(audioModLevel(0.75)).toBe(0);
  });
});

describe('the audio modulator', () => {
  it('is silent — zero, not negative — with no sample loaded', () => {
    const state = AUDIO_DEF.createState();
    expect(AUDIO_DEF.tick(state, AUDIO_DEF.defaults, 1 / 60, 120)).toBe(0);
  });

  it('follows the sample: quiet half low, loud half high', () => {
    setAudioModBuffer(halfLoudBuffer());
    const state = AUDIO_DEF.createState();
    const params = { ...AUDIO_DEF.defaults };
    // A quarter second in: still in the silent half.
    expect(tickTo(state, params, 0.25)).toBeCloseTo(-1, 1);
    // Well past the middle: the loud half.
    expect(tickTo(state, params, 0.4)).toBeCloseTo(1, 1);
  });

  it('seeks when the position param changes, and only then', () => {
    setAudioModBuffer(halfLoudBuffer());
    const state = AUDIO_DEF.createState();
    const params = { ...AUDIO_DEF.defaults, playing: false, position: 0.75 };
    AUDIO_DEF.tick(state, params, 1 / 60, 120);
    expect(AUDIO_DEF.phase!(state)).toBeCloseTo(0.75, 6);
    // The same value again is not a new seek — the phase stays put.
    AUDIO_DEF.tick(state, params, 1 / 60, 120);
    expect(AUDIO_DEF.phase!(state)).toBeCloseTo(0.75, 6);
  });

  it('runs the loop the brackets describe', () => {
    setAudioModBuffer(halfLoudBuffer());
    const state = AUDIO_DEF.createState();
    const params = { ...AUDIO_DEF.defaults, loopStart: 0.5, loopEnd: 0.6, position: 0.5 };
    tickTo(state, params, 2);
    const pos = AUDIO_DEF.phase!(state);
    expect(pos).toBeGreaterThanOrEqual(0.5);
    expect(pos).toBeLessThan(0.6);
  });

  it('with the loop off, plays to the end and holds', () => {
    setAudioModBuffer(halfLoudBuffer());
    const state = AUDIO_DEF.createState();
    const params = { ...AUDIO_DEF.defaults, loopOn: false };
    tickTo(state, params, 3);
    expect(AUDIO_DEF.phase!(state)).toBe(1);
  });

  it('speed runs the tape faster', () => {
    setAudioModBuffer(halfLoudBuffer(2));
    const slow = AUDIO_DEF.createState();
    const fast = AUDIO_DEF.createState();
    tickTo(slow, { ...AUDIO_DEF.defaults, loopOn: false, speed: 1 }, 0.5);
    tickTo(fast, { ...AUDIO_DEF.defaults, loopOn: false, speed: 2 }, 0.5);
    expect(AUDIO_DEF.phase!(fast)).toBeCloseTo(AUDIO_DEF.phase!(slow) * 2, 3);
  });

  it('a note on retriggers from the last seek', () => {
    setAudioModBuffer(halfLoudBuffer());
    const state = AUDIO_DEF.createState();
    const params = { ...AUDIO_DEF.defaults, position: 0.2, loopOn: false };
    tickTo(state, params, 0.5);
    expect(AUDIO_DEF.phase!(state)).toBeGreaterThan(0.2);
    AUDIO_DEF.gate!(state, true);
    expect(AUDIO_DEF.phase!(state)).toBeCloseTo(0.2, 6);
  });

  it('Delete drops the loop brackets', () => {
    const patch = AUDIO_DEF.buttons!.delete({ ...AUDIO_DEF.defaults, loopStart: 0.25, loopEnd: 0.5 });
    expect(patch).toEqual({ loopStart: 0, loopEnd: 1 });
  });

  it('draws the sample as its preview, and says when there is none', () => {
    expect(AUDIO_DEF.preview!({}, 8).label).toBe('No sample');
    setAudioModBuffer(halfLoudBuffer());
    const { points, label } = AUDIO_DEF.preview!({}, 32);
    expect(label).toBe('Audio');
    expect(points[4]).toBe(0);
    expect(points[28]).toBeCloseTo(1, 2);
  });
});
