import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MoveFunctions, MOVE_FUNCTION_BUTTONS, MOVE_FUNCTION_MANIFEST, MOVE_SPECIAL_BUTTONS } from './move-functions';

// The function library: the app attaches actions to the Move's function
// buttons (undo, copy, arrows...), the bridge kit lists the attached names
// to light them on the hardware and runs them per press. These tests pin
// that contract on the library side.

describe('move functions', () => {
  it('runs the attached action with the shift flag, and detaches cleanly', () => {
    const calls: { name: string; shift: boolean }[] = [];
    const detach = MoveFunctions.attach('undo', (press) => calls.push(press));
    assert.ok(MoveFunctions.list().includes('undo'));

    MoveFunctions.run('undo');
    MoveFunctions.run('undo', { shift: true });
    assert.deepEqual(calls, [
      { name: 'undo', shift: false },
      { name: 'undo', shift: true },
    ]);

    detach();
    assert.ok(!MoveFunctions.list().includes('undo'));
    MoveFunctions.run('undo');
    assert.equal(calls.length, 2);
  });

  it('replaces on re-attach; a stale detach does not remove the newer action', () => {
    const calls: string[] = [];
    const detachFirst = MoveFunctions.attach('copy', () => calls.push('first'));
    const detachSecond = MoveFunctions.attach('copy', () => calls.push('second'));

    MoveFunctions.run('copy');
    assert.deepEqual(calls, ['second']);

    detachFirst();
    assert.ok(MoveFunctions.list().includes('copy'));
    detachSecond();
    assert.ok(!MoveFunctions.list().includes('copy'));
  });

  it('notifies subscribers when attachments change', () => {
    let notified = 0;
    const unsubscribe = MoveFunctions.subscribe(() => { notified++; });

    const detach = MoveFunctions.attach('mute', () => {});
    assert.equal(notified, 1);
    detach();
    assert.equal(notified, 2);

    unsubscribe();
    const detach2 = MoveFunctions.attach('mute', () => {});
    assert.equal(notified, 2);
    detach2();
  });

  it('warns and no-ops on names that are not Move function buttons', () => {
    const original = console.warn;
    let warned = 0;
    console.warn = () => { warned++; };
    try {
      // Reserved names (shift, tracks) are not attachable.
      const detach = MoveFunctions.attach('shift' as never, () => {});
      assert.equal(warned, 1);
      assert.deepEqual(MoveFunctions.list(), []);
      detach();
    } finally {
      console.warn = original;
    }
  });

  it('covers the wire protocol buttons, without the reserved ones', () => {
    for (const reserved of ['shift', 'track1', 'track2', 'track3', 'track4']) {
      assert.ok(!(MOVE_FUNCTION_BUTTONS as readonly string[]).includes(reserved));
    }
    assert.ok(MOVE_FUNCTION_BUTTONS.includes('undo'));
    assert.ok(MOVE_FUNCTION_BUTTONS.includes('copy'));
  });

  it('names buttons as the hardware prints them, and marks the special ones', () => {
    // Names match the wire protocol — no aliases, no integration confusion.
    assert.ok(MOVE_FUNCTION_BUTTONS.includes('sample'));
    assert.equal(MOVE_FUNCTION_MANIFEST.length, MOVE_FUNCTION_BUTTONS.length);

    // Special buttons carry no fixed meaning — each app decides.
    assert.deepEqual(MOVE_SPECIAL_BUTTONS, ['sample', 'loop', 'capture', 'menu', 'back', 'jog_click']);

    const calls: string[] = [];
    const detach = MoveFunctions.attach('sample', ({ name }) => calls.push(name));
    MoveFunctions.run('sample');
    assert.deepEqual(calls, ['sample']);
    detach();
  });
});
