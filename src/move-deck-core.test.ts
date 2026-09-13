import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDeck, MOVE_DECK_MAX, type MoveDeckAction } from './move-deck-core';

// The action deck's rule: at most four actions, one per chip key, in the
// order given. These pin what the deck keeps and what it names as dropped.

const noop = () => {};
const action = (button: string, label = button): MoveDeckAction =>
  ({ button, label, onPress: noop }) as MoveDeckAction;

describe('action deck', () => {
  it('keeps the order given and one action per key', () => {
    const { actions, warnings } = normalizeDeck([action('capture', 'Load'), action('sample', 'Record')]);
    assert.deepEqual(actions.map((a) => a.label), ['Load', 'Record']);
    assert.deepEqual(warnings, []);
  });

  it('drops a second action on a taken key — the first wins', () => {
    const { actions, warnings } = normalizeDeck([action('loop', 'A'), action('loop', 'B')]);
    assert.deepEqual(actions.map((a) => a.label), ['A']);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /"loop" already carries "A"; "B" dropped/);
  });

  it('refuses keys that are not deck keys', () => {
    const { actions, warnings } = normalizeDeck([action('undo'), action('mute')]);
    assert.deepEqual(actions.map((a) => a.button), ['mute']);
    assert.match(warnings[0], /"undo" is not a deck key/);
  });

  it('carries at most four', () => {
    assert.equal(MOVE_DECK_MAX, 4);
    const { actions, warnings } = normalizeDeck([
      action('sample'), action('capture'), action('mute'), action('loop'), action('sample', 'again'),
    ]);
    assert.equal(actions.length, 4);
    assert.equal(warnings.length, 1);
  });
});
