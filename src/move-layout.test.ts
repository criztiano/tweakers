import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TweakStore } from './store/TweakStore';
import { buildMovePages, normalizeDial, denormalizeDial, normalizeXYDial, denormalizeXYDial, normalizeRangeDial, denormalizeRangeDial, dialOrigin, MOVE_TRACKS, MOVE_DIALS, MOVE_PADS } from './move-layout';

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
    assert.deepEqual(page.toggles.map((t) => t.path), ['mute', 'nested.wet']);
    assert.deepEqual(page.values, []);
  });

  it('overflows bounded params past the 8 dials into the value row', () => {
    const id = nextId();
    const config: Record<string, unknown> = {};
    for (let i = 0; i < 11; i++) config[`dial${i}`] = [0.5, 0, 1];
    config.mute = false;
    TweakStore.registerPanel(id, id, config as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.dials.length, MOVE_DIALS);
    assert.deepEqual(page.toggles.map((t) => t.path), ['mute']);
    assert.deepEqual(page.values.map((v) => v.path), ['dial8', 'dial9', 'dial10']);
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
    assert.equal(pages[0].toggles.length, MOVE_PADS);
    assert.equal(pages[0].values.length, 4);
  });

  it('gives an xy control a dial slot, never a value chip', () => {
    const id = nextId();
    const config: Record<string, unknown> = {
      pad: { type: 'xy', x: { min: -1, max: 1 }, y: { min: 0, max: 10 }, default: { x: 0, y: 5 } },
    };
    for (let i = 0; i < 9; i++) config[`dial${i}`] = [0.5, 0, 1];
    config.late = { type: 'xy', default: { x: 0.5, y: 0.5 } };
    TweakStore.registerPanel(id, id, config as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.dials[0].path, 'pad');
    assert.equal(page.dials[0].type, 'xy');
    /* the xy takes a dial slot, so two scalars overflow; the late xy never chips */
    assert.deepEqual(page.values.map((v) => v.path), ['dial7', 'dial8']);
  });

  it('seats hand-placed pads in their own column, packing the rest around them', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      density: [0.5, 0, 1],
      size: [0.5, 0, 1],
      speed: [0.5, 0, 1],
      tempo: [120, 30, 300],
      scan: false,
      scanSpeed: [0.5, 0, 2],
      sync: false,
      loose: false,
    } as never, undefined, { movePads: { scan: 2, scanSpeed: 2, sync: 3 } });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    // The placed chip leaves the dial pool even though slots were free.
    assert.deepEqual(page.dials.map((d) => d.path), ['density', 'size', 'speed', 'tempo']);
    assert.equal(page.toggles[2].path, 'scan');
    assert.equal(page.toggles[3].path, 'sync');
    assert.equal(page.toggles[0].path, 'loose');   /* unplaced: leftmost free */
    assert.equal(page.toggles[1], undefined);
    assert.equal(page.values[2].path, 'scanSpeed');
    assert.equal(page.values[0], undefined);
  });

  it('puts hand-placed actions on the action row and leaves the rest off the surface', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      gain: [0.5, 0, 1],
      comb: { type: 'action' },
      randomize: { type: 'action' },
    } as never, undefined, { movePads: { comb: 5 } });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.actions[5].path, 'comb');
    assert.equal(page.actions.filter(Boolean).length, 1);
  });

  it('ignores a pad column on a control that cannot be a chip', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      shape: { type: 'select', options: ['a', 'b'], default: 'a' },
      band: { type: 'range', min: 0, max: 1 },
    } as never, undefined, { movePads: { shape: 4, band: 5 } });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.deepEqual(page.dials.map((d) => d.path), ['shape', 'band']);
    assert.equal(page.values.filter(Boolean).length, 0);
  });

  it('packs a pad whose column is taken rather than dropping it', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      first: false,
      second: false,
    } as never, undefined, { movePads: { first: 3, second: 3 } });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.toggles[3].path, 'first');
    assert.equal(page.toggles[0].path, 'second');
  });

  it('normalizes and denormalizes xy pads per axis, kit-identically', () => {
    const meta = {
      type: 'xy', path: 'pad', label: 'Pad',
      xAxis: { min: -1, max: 1 }, yAxis: { min: 0, max: 10, step: 0.5 },
    } as const;
    assert.deepEqual(normalizeXYDial(meta as never, { x: 0, y: 7.5 }), { x: 0.5, y: 0.75 });
    assert.deepEqual(normalizeXYDial(meta as never, { x: -4, y: 99 }), { x: 0, y: 1 });
    assert.deepEqual(normalizeXYDial(meta as never, undefined), { x: 0, y: 0 });
    const v = denormalizeXYDial(meta as never, 0.75, 0.53);
    assert.equal(v.x, 0.5);
    assert.equal(v.y, 5.5);                     /* 5.3 snapped to the 0.5 step */
  });

  it('gives a range control a dial slot, never a value chip', () => {
    const id = nextId();
    const config: Record<string, unknown> = {
      band: { type: 'range', min: 0, max: 100, default: { min: 20, max: 80 } },
    };
    for (let i = 0; i < 8; i++) config[`dial${i}`] = [0.5, 0, 1];
    config.lateBand = { type: 'range', min: 0, max: 1 };
    TweakStore.registerPanel(id, id, config as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.equal(page.dials[0].path, 'band');
    assert.equal(page.dials[0].type, 'range');
    /* the range takes a dial slot, so one scalar overflows; the late range never chips */
    assert.deepEqual(page.values.map((v) => v.path), ['dial7']);
  });

  it('gives a select an enum dial slot in column order, never a chip — the kit rule', () => {
    const id = nextId();
    const config: Record<string, unknown> = {
      shape: { type: 'select', options: ['solid', 'outline'], default: 'solid' },
    };
    for (let i = 0; i < 8; i++) config[`dial${i}`] = [0.5, 0, 1];
    config.mode = { type: 'select', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], default: 'a' };
    TweakStore.registerPanel(id, id, config as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    /* the select claims dial slot 1 exactly like the kit maps it — the two
       surfaces must agree on columns (regression: PhotoStack off-by-one) */
    assert.equal(page.dials[0].path, 'shape');
    assert.equal(page.dials[0].type, 'select');
    assert.deepEqual(page.values.map((v) => v.path), ['dial7']);
  });

  it('normalizes and denormalizes range ends, ordered and kit-identically', () => {
    const meta = { type: 'range', path: 'band', label: 'Band', min: 0, max: 100, step: 5 } as const;
    assert.deepEqual(normalizeRangeDial(meta as never, { min: 20, max: 80 }), { lo: 0.2, hi: 0.8 });
    assert.deepEqual(normalizeRangeDial(meta as never, undefined), { lo: 0, hi: 0 });
    assert.deepEqual(denormalizeRangeDial(meta as never, 0.33, 0.77), { min: 35, max: 75 });
    /* crossed ends come back ordered */
    assert.deepEqual(denormalizeRangeDial(meta as never, 0.9, 0.1), { min: 10, max: 90 });
  });

  it('anchors bipolar and origin sliders, and leaves plain ones at zero', () => {
    const bipolar = { type: 'slider', path: 'pan', label: 'Pan', min: -1, max: 1, bipolar: true } as const;
    assert.equal(dialOrigin(bipolar as never), 0.5);
    const origined = { type: 'slider', path: 'trim', label: 'Trim', min: 0, max: 20, origin: 5 } as const;
    assert.equal(dialOrigin(origined as never), 0.25);
    const plain = { type: 'slider', path: 'gain', label: 'Gain', min: 0, max: 1 } as const;
    assert.equal(dialOrigin(plain as never), 0);
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
