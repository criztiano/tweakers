import { createElement } from 'react';
import { create } from 'react-test-renderer';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MoveSlotReadout, splitReadoutUnit } from './components/move-slots';

describe('splitReadoutUnit', () => {
  it('lifts the unit off the number', () => {
    assert.deepEqual(splitReadoutUnit('250 ms'), { num: '250', unit: 'ms' });
    assert.deepEqual(splitReadoutUnit('-6.0 dB'), { num: '-6.0', unit: 'dB' });
    assert.deepEqual(splitReadoutUnit('+3 st'), { num: '+3', unit: 'st' });
    assert.deepEqual(splitReadoutUnit('-12 dB/oct'), { num: '-12', unit: 'dB/oct' });
  });

  it('keeps a one-character unit on the line, and leaves a bare number, a fraction, a range and a name whole', () => {
    for (const v of ['64%', '12°', '+0.5', '1/16', '0.20–0.80', 'Sine', 'C#4']) {
      assert.deepEqual(splitReadoutUnit(v), { num: v, unit: null });
    }
  });
});

describe('MoveSlotReadout', () => {
  it('stacks the unit under the number', () => {
    const root = create(createElement(MoveSlotReadout, { label: 'Delay', value: '250 ms' })).root;
    const number = root.findByProps({ className: 'tweakers-move-dial-number' });
    const unit = root.findByProps({ className: 'tweakers-move-dial-unit' });
    assert.equal(number.children.join(''), '250');
    assert.equal(unit.children.join(''), 'ms');
  });

  it('keeps a unitless value as one span', () => {
    const root = create(createElement(MoveSlotReadout, { label: 'Rate', value: '1/16' })).root;
    assert.equal(root.findAllByProps({ className: 'tweakers-move-dial-unit' }).length, 0);
    assert.equal(root.findByProps({ className: 'tweakers-move-dial-value' }).children.join(''), '1/16');
  });
});
