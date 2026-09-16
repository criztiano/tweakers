import { createElement } from 'react';
import { create } from 'react-test-renderer';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { moveBandCuts, MOVE_BAND_W, MOVE_BAND_H } from './move-visual-core';
import { MovePadBandBody } from './components/move-slots';

describe('moveBandCuts', () => {
  it('stands an open band on the floor corners, each cut a sliver at its edge', () => {
    const { low, high } = moveBandCuts(0, 1);
    assert.equal(low, `M 0 0 L 12 0 Q 4 0 3.18 8 L 0 ${MOVE_BAND_H} L 0 ${MOVE_BAND_H} Z`);
    assert.equal(high, `M ${MOVE_BAND_W} 0 L 67 0 Q 75 0 75.82 8 L ${MOVE_BAND_W} ${MOVE_BAND_H} L ${MOVE_BAND_W} ${MOVE_BAND_H} Z`);
  });

  it('puts each foot at its place, and meets the shoulders in the middle when the cuts pass', () => {
    assert.match(moveBandCuts(0, 0.5).high, / L 39.5 39 L 79 39 Z$/);
    const { low, high } = moveBandCuts(0.6, 0.4);
    assert.equal(low, 'M 0 0 L 47.4 0 Q 47.4 0 47.4 0 L 47.4 39 L 0 39 Z');
    assert.equal(high, 'M 79 0 L 47.4 0 Q 47.4 0 47.4 0 L 47.4 39 L 79 39 Z');
  });
});

describe('MovePadBandBody', () => {
  it('turns a moved cut yellow and captions the hands in row order', () => {
    const root = create(createElement(MovePadBandBody, {
      low: { at: 0, cut: false }, high: { at: 0.7, cut: true, latched: true }, upper: 'low',
    })).root;
    const cuts = root.findAllByProps({ className: 'tweakers-move-band-cut' });
    assert.deepEqual(cuts.map((c) => c.props['data-cut']), [undefined, true]);
    const captions = root.findAllByProps({ className: 'tweakers-move-band-caption' });
    assert.deepEqual(captions.map((c) => c.children.join('')), ['Lo', 'Hi']);
    assert.deepEqual(captions.map((c) => c.props['data-latched']), [undefined, true]);
  });
});
