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
    /* a toggle sits in the column of the dial declared just before it */
    assert.equal(page.toggles[1]?.path, 'mute');
    assert.equal(page.toggles[2]?.path, 'nested.wet');
    assert.equal(page.toggles[0], undefined);
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
    /* overflow chips land in the last dial's column; a taken column drops */
    assert.equal(page.values[7]?.path, 'dial8');
    assert.equal(page.values.filter(Boolean).length, 1);
    assert.equal(page.toggles[7]?.path, 'mute', 'the toggle also pairs with the last dial — but its column is its own row');
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
    /* interleaved pads walk the columns with their dials, capping at 8 */
    assert.deepEqual(pages[0].toggles.map((t) => t.path),
      Array.from({ length: MOVE_PADS }, (_, i) => `pad${i}`));
    /* only column 7 is free for overflow chips; the rest drop */
    assert.equal(pages[0].values[7]?.path, 'dial8');
    assert.equal(pages[0].values.filter(Boolean).length, 1);
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
    /* the xy takes a dial slot, so scalars overflow into the last free column;
       the late xy never chips */
    assert.equal(page.values[7]?.path, 'dial7');
    assert.equal(page.values.filter(Boolean).length, 1);
  });

  it('a moveChip control becomes a chip under its preceding dial, not a dial', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      time: [0.5, 0, 1],
      pitch: { type: 'slider', default: 0, min: -12, max: 12, moveChip: true },
      shape: [0.5, 0, 1],
      reso: { type: 'number', default: 0.5, min: 0, max: 1, moveChip: true },
    } as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.deepEqual(page.dials.map((d) => d.path), ['time', 'shape']);
    assert.equal(page.values[0]?.path, 'pitch');   /* under time (dial 0) */
    assert.equal(page.values[1]?.path, 'reso');    /* under shape (dial 1) */
  });

  it('a taken column falls forward to the next free one', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      big: [0.5, 0, 1],
      a: false,
      b: false,
      c: false,
    });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.deepEqual(page.toggles.slice(0, 3).map((t) => t.path), ['a', 'b', 'c']);
  });

  /* THE shared fixture — the kit's test/kit-pad-columns.test.mjs lays out the
     identical panel and must land the identical columns. Change one, change
     both. */
  it('lays out the shared fixture panel kit-identically', () => {
    const id = nextId();
    TweakStore.registerPanel(id, id, {
      d1: [0.5, 0, 1],
      t1: false,
      d2: [0.5, 0, 1],
      s1: { type: 'slider', default: 0, min: 0, max: 1, moveChip: true },
      s2: { type: 'number', default: 0, min: 0, max: 1, moveChip: true },
      e1: [0.5, 0, 1], e2: [0.5, 0, 1], e3: [0.5, 0, 1], e4: [0.5, 0, 1],
      e5: [0.5, 0, 1], e6: [0.5, 0, 1], e7: [0.5, 0, 1],
    } as never);
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    assert.deepEqual(page.dials.map((d) => d.path), ['d1', 'd2', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6']);
    assert.equal(page.toggles[0]?.path, 't1');
    assert.equal(page.values[1]?.path, 's1');
    assert.equal(page.values[2]?.path, 's2');
    assert.equal(page.values[7]?.path, 'e7');      /* past the dial budget */
    assert.equal(page.values.filter(Boolean).length, 3);
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
    assert.equal(page.values[7]?.path, 'dial7');
    assert.equal(page.values.filter(Boolean).length, 1);
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
    assert.equal(page.values[7]?.path, 'dial7');
    assert.equal(page.values.filter(Boolean).length, 1);
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
