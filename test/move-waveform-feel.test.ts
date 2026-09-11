import { describe, it, expect } from 'vitest';
import { scrubBy } from '../src/move-waveform';

/**
 * The scrub feel, pinned.
 *
 * `move-waveform.test.ts` next door checks that the maths is the maths. This
 * file checks how the knob FEELS in a hand: how far a slow turn creeps, how far
 * a flick throws, how fine Shift gets. It is deliberately written in
 * milliseconds of a real sample rather than in the constants, so it keeps
 * meaning something after a refactor moves the numbers around.
 *
 * ── APPROVED FEEL VALUES — approved 2026-09-10 ─────────────────────────────
 * Measured on an eight-second sample, the volume knob at zoom 1:
 *
 *   one slow detent .............  2.0 ms   place the playhead on a transient
 *   a slow turn, 40 detents ..... 80.0 ms   creep across a hit
 *   a flick, batched delta 12 ... 39.5 ms   ~1.6x the same detents taken slowly
 *   the hardest spin, delta 24 .. 90.6 ms   the fastest the encoder reports
 *   one Shift detent ............  0.4 ms   5x finer, and flat — no acceleration
 *
 * These are Cri's approved values. They are held to +/-20 %, so an honest
 * nudge still passes and a real retune fails loudly. This has been silently
 * retuned 8x once before, with the old tests simply rewritten to match — so
 * if a change to SCRUB_PER_DETENT, SCRUB_FINE, SCRUB_ACCEL or SCRUB_MAX_BATCH
 * breaks this file, DO NOT rewrite the numbers. Either keep the feel, or
 * state the feel goal in the commit message and re-approve these values.
 * ───────────────────────────────────────────────────────────────────────────
 */

/** Something to feel the numbers against: eight seconds, a bar of a loop. */
const SAMPLE_MS = 8000;

/** How far a scrub carried the playhead, in milliseconds of that sample. */
const travel = (from: number, to: number) => Math.abs(to - from) * SAMPLE_MS;

/** A slow turn: one detent per event, the way a hand creeps toward a hit.
 *  A negative count turns the knob the other way. */
function slowTurn(from: number, detents: number, fine = false, zoom = 1) {
  const tick = Math.sign(detents) || 1;
  let position = from;
  for (let i = 0; i < Math.abs(detents); i += 1) position = scrubBy(position, tick, fine, zoom);
  return position;
}

/** Feel is a budget, not an equation. */
const TOLERANCE = 0.2;
function expectFeel(actualMs: number, approvedMs: number) {
  expect(actualMs).toBeGreaterThan(approvedMs * (1 - TOLERANCE));
  expect(actualMs).toBeLessThan(approvedMs * (1 + TOLERANCE));
}

describe('the volume knob creeps', () => {
  it('places the playhead to about two milliseconds on one slow detent', () => {
    const step = travel(0.5, scrubBy(0.5, 1));
    expect(step).toBeGreaterThan(0); // a dead knob is not a fine knob
    expectFeel(step, 2);
  });

  it('crosses about eighty milliseconds over a slow forty-detent turn', () => {
    expectFeel(travel(0.5, slowTurn(0.5, 40)), 80);
  });

  it('walks back exactly as far as it walked out', () => {
    expect(travel(0.5, slowTurn(0.5, -40))).toBeCloseTo(travel(0.5, slowTurn(0.5, 40)), 6);
    expect(travel(0.5, scrubBy(0.5, -12))).toBeCloseTo(travel(0.5, scrubBy(0.5, 12)), 6);
  });
});

describe('the volume knob spins', () => {
  it('throws further on a flick than on the same detents taken slowly', () => {
    const flick = travel(0.5, scrubBy(0.5, 12));
    const crept = travel(0.5, slowTurn(0.5, 12));
    expectFeel(flick, 39.5);
    // Speed buys reach — that is the whole point of the acceleration.
    expect(flick / crept).toBeGreaterThan(1.4);
  });

  it('tops out at about ninety milliseconds, however hard the encoder is spun', () => {
    const spin = travel(0.5, scrubBy(0.5, 24));
    expectFeel(spin, 90.6);
    // A garbage batch from the hardware must not launch the playhead.
    expect(travel(0.5, scrubBy(0.5, 1000))).toBeCloseTo(spin, 6);
  });
});

describe('Shift is the surgical layer', () => {
  it('is several times finer than the plain knob', () => {
    const fine = travel(0.5, scrubBy(0.5, 1, true));
    expectFeel(fine, 0.4);
    expect(travel(0.5, scrubBy(0.5, 1)) / fine).toBeGreaterThanOrEqual(4);
  });

  it('stays flat — a spin under Shift never accelerates', () => {
    const one = travel(0.5, scrubBy(0.5, 1, true));
    expect(travel(0.5, scrubBy(0.5, 10, true))).toBeCloseTo(10 * one, 6);
    expect(travel(0.5, scrubBy(0.5, 24, true))).toBeCloseTo(24 * one, 6);
  });
});

describe('the precision follows the eye', () => {
  it('moves the playhead the same distance on screen at every zoom', () => {
    for (const zoom of [1, 4, 8, 16]) {
      // Zoomed in 8x the window is an eighth as wide, so an eighth of the
      // travel is the same gap on screen.
      expectFeel(travel(0.5, slowTurn(0.5, 40, false, zoom)) * zoom, 80);
    }
  });
});
