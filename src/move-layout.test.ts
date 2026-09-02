import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TweakStore } from './store/TweakStore';
import { buildMovePages, normalizeDial, denormalizeDial, MOVE_TRACKS, MOVE_DIALS, MOVE_PADS } from './move-layout';

// The MovePanel mirrors the bridge kit's v0 mapping: first 4 panels are the
// track pages, sliders and bounded numbers fill the 8 dials, toggles the
// hardware pads. Bounded params beyond the dials overflow into the pad grid
// as value chips. These tests pin that contract on the library side.

let seq = 0;
const nextId = () => `move-layout-${++seq}`;

describe('move layout', () => {
  it('maps sliders and bounded numbers to dials, toggles to pads', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      gain: [0.5, 0, 1],
      count: { type: 'number', default: 3, min: 0, max: 10 },
      free: { type: 'number', default: 3 },
      mute: false,
      nested: { depth: [0.2, 0, 1], wet: true },
    });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.deepEqual(page.dials.map((d) => d.path), ['gain', 'count', 'nested.depth']);
    assert.deepEqual(page.pads.map((p) => [p.kind, p.meta.path]), [
      ['toggle', 'mute'],
      ['toggle', 'nested.wet'],
    ]);
  });

  it('overflows bounded params past the 8 dials into value chips, after the toggles', () => {
    const id = nextId();
    const config: Record<string, unknown> = {};
    for (let i = 0; i < 11; i++) config[`dial${i}`] = [0.5, 0, 1];
    config.mute = false;
    TweakStore.registerPanel(id, id, config as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.dials.length, MOVE_DIALS);
    assert.deepEqual(page.pads.map((p) => [p.kind, p.meta.path]), [
      ['toggle', 'mute'],
      ['value', 'dial8'],
      ['value', 'dial9'],
      ['value', 'dial10'],
    ]);
  });

  it('caps pages at 4 tracks and toggles at the 8 hardware pads', () => {
    const ids = Array.from({ length: 6 }, () => nextId());
    const config: Record<string, unknown> = {};
    for (let i = 0; i < 12; i++) {
      config[`dial${i}`] = [0.5, 0, 1];
      config[`pad${i}`] = false;
    }
    for (const id of ids) TweakStore.registerPanel(id, id, config as never);
    const pages = buildMovePages(ids.map((id) => TweakStore.getPanel(id)!));
    assert.equal(pages.length, MOVE_TRACKS);
    assert.equal(pages[0].dials.length, MOVE_DIALS);
    assert.equal(pages[0].pads.filter((p) => p.kind === 'toggle').length, MOVE_PADS);
    assert.equal(pages[0].pads.filter((p) => p.kind === 'value').length, 4);
  });

  it('normalizes dial values to 0..1 with clamping', () => {
    const meta = { type: 'slider', path: 'x', label: 'X', min: 10, max: 20 } as const;
    assert.equal(normalizeDial(meta as never, 15), 0.5);
    assert.equal(normalizeDial(meta as never, 5), 0);
    assert.equal(normalizeDial(meta as never, 25), 1);
    assert.equal(normalizeDial(meta as never, 'junk'), 0);
  });

  it('denormalizes kit-identically, honouring step', () => {
    const meta = { type: 'slider', path: 'x', label: 'X', min: 0, max: 10, step: 0.5 } as const;
    assert.equal(denormalizeDial(meta as never, 0.52), 5);
    assert.equal(denormalizeDial(meta as never, -1), 0);
    assert.equal(denormalizeDial(meta as never, 2), 10);
  });
});
