import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveFilterAxis,
  normalizeFilterValue,
  filterHand01,
  filterHandValue,
  defaultFilterResponse,
  filterResponsePath,
} from './filter-core';
import { TweakStore } from './store/TweakStore';
import { buildMovePages, visibleColumns, dialSpan, isSpanContinuation, normalizeFilterDial, denormalizeFilterDial, filterShapePath, MOVE_DIALS } from './move-layout';

let seq = 0;
const nextId = () => `filter-core-${++seq}`;

describe('filter core', () => {
  it('resolves axes with kit defaults and app overrides', () => {
    const ca = resolveFilterAxis(undefined, 'cutoff');
    assert.deepEqual([ca.min, ca.max, ca.label], [0, 1, 'Freq']);
    const ra = resolveFilterAxis({ min: 0, max: 100, step: 1, label: 'Q' }, 'resonance');
    assert.deepEqual([ra.min, ra.max, ra.step, ra.label], [0, 100, 1, 'Q']);
  });

  it('normalizes a missing value to the open filter', () => {
    const ca = resolveFilterAxis({ min: 0, max: 100 }, 'cutoff');
    const ra = resolveFilterAxis({ min: 0, max: 100 }, 'resonance');
    assert.deepEqual(normalizeFilterValue(undefined, ca, ra), { cutoff: 100, resonance: 0 });
    // Out-of-range hands clamp; steps snap.
    const stepped = resolveFilterAxis({ min: 0, max: 10, step: 1 }, 'cutoff');
    assert.deepEqual(normalizeFilterValue({ cutoff: 4.4, resonance: -5 }, stepped, ra), { cutoff: 4, resonance: 0 });
  });

  it('round-trips hand positions through the axis', () => {
    const axis = resolveFilterAxis({ min: 20, max: 20000 }, 'cutoff');
    assert.equal(filterHand01(20, axis), 0);
    assert.equal(filterHand01(20000, axis), 1);
    assert.equal(filterHandValue(filterHand01(440, axis), axis), 440);
  });

  it('draws the response in its own calibration, never refitted', () => {
    const ys = (c01: number, r01: number) => {
      const d = filterResponsePath(defaultFilterResponse(c01, r01))!;
      return [...d.matchAll(/[ML] [\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]));
    };
    // A mid lowpass: passband below the top (headroom), rolloff on the floor.
    const flat = ys(0.5, 0);
    assert.ok(Math.min(...flat) > 0);
    assert.equal(Math.max(...flat), 100);
    // Raising resonance grows the peak into that headroom — never a clip:
    // the resonant peak sits strictly higher (smaller y) than the passband.
    const peaked = ys(0.5, 0.9);
    assert.ok(Math.min(...peaked) < Math.min(...flat));
    assert.ok(Math.min(...peaked) > 0);
    // A constant response draws flat at its own height, not mid-air.
    const open = filterResponsePath(() => 1)!;
    assert.ok([...open.matchAll(/[ML] [\d.]+ ([\d.]+)/g)].every((m) => Number(m[1]) === 0));
  });

  it('a throwing response draws nothing', () => {
    assert.equal(filterResponsePath(() => { throw new Error('nope'); }), null);
  });
});

describe('filter on the move layout', () => {
  it('claims two dial columns as one control', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      gain: [0.5, 0, 1],
      filter: { type: 'filter', cutoff: { min: 0, max: 100 }, resonance: { min: 0, max: 100 } },
      drive: [0.2, 0, 1],
    } as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.dials[0].path, 'gain');
    assert.equal(page.dials[1].path, 'filter');
    assert.equal(page.dials[2].path, 'filter');
    assert.equal(page.dials[1], page.dials[2]);
    assert.equal(page.dials[3].path, 'drive');
    assert.equal(dialSpan(page.dials[1]), 2);
    assert.ok(!isSpanContinuation(page, 1));
    assert.ok(isSpanContinuation(page, 2));
    assert.deepEqual(visibleColumns(page), [0, 1, 2, 3]);
  });

  it('a filter that no longer fits is passed over, narrow dials still land', () => {
    const id = nextId();
    const config: Record<string, unknown> = {};
    for (let i = 0; i < 7; i++) config[`dial${i}`] = [0.5, 0, 1];
    config.filter = { type: 'filter' };
    config.last = [0.1, 0, 1];
    TweakStore.registerPanel(id, id, config as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.dials.filter((d, i) => page.dials.indexOf(d) === i).length, MOVE_DIALS);
    assert.equal(page.dials[7].path, 'last');
    // The filter never falls back to a value chip — it is a two-handed dial.
    assert.ok(!page.values.some((v) => v?.path === 'filter'));
  });

  it('normalizes and denormalizes the two hands like any dial pair', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      filter: { type: 'filter', default: { cutoff: 50, resonance: 25 }, cutoff: { min: 0, max: 100, step: 1 }, resonance: { min: 0, max: 100, step: 1 } },
    } as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    const meta = page.dials[0];
    const values = TweakStore.getValues(id)!;
    assert.deepEqual(values['filter'], { cutoff: 50, resonance: 25 });
    assert.deepEqual(normalizeFilterDial(meta, values['filter']), { cutoff: 0.5, resonance: 0.25 });
    assert.deepEqual(denormalizeFilterDial(meta, 0.75, 0.1), { cutoff: 75, resonance: 10 });
    assert.ok(filterShapePath(meta, values['filter'])!.startsWith('M '));
  });

  it('draws through the app response when the config brings one', () => {
    const id = nextId();
    let saw: number[] = [];
    TweakStore.registerPanel(id, id, {
      filter: {
        type: 'filter',
        response: (c01: number, r01: number) => { saw = [c01, r01]; return (t: number) => t; },
      },
    } as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    const d = filterShapePath(page.dials[0], TweakStore.getValues(id)!['filter']);
    assert.ok(d && d.endsWith('L 100.00 0.00'));
    assert.deepEqual(saw, [1, 0]); /* open filter: cutoff max, resonance min */
  });
});
