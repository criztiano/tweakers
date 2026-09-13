import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MoveFunctions, MOVE_FUNCTION_BUTTONS, MOVE_FUNCTION_MANIFEST, MOVE_SPECIAL_BUTTONS, MOVE_STEP_FUNCTIONS } from './move-functions';

// The function library: the app attaches actions to the Move's function
// buttons (undo, copy, arrows...), the bridge kit lists the attached names
// to light them on the hardware and runs them per press. These tests pin
// that contract on the library side.

describe('move functions', () => {
  it('runs the attached action with the shift flag, and detaches cleanly', () => {
    const calls: { name: string; shift: boolean; hold?: boolean }[] = [];
    const detach = MoveFunctions.attach('undo', (press) => calls.push(press));
    assert.ok(MoveFunctions.list().includes('undo'));

    MoveFunctions.run('undo');
    MoveFunctions.run('undo', { shift: true });
    // Every press carries both flags: shift, and the long press a button
    // like Menu answers differently.
    assert.deepEqual(calls, [
      { name: 'undo', shift: false, hold: false },
      { name: 'undo', shift: true, hold: false },
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

  it('carries an optional label per attachment, cleared on detach and on plain re-attach', () => {
    const detach = MoveFunctions.attach('capture', () => {}, { label: 'add marker' });
    assert.equal(MoveFunctions.label('capture'), 'add marker');
    assert.ok(MoveFunctions.list().includes('capture'));

    // Re-attaching without a label drops the old one — no stale screen names.
    const detach2 = MoveFunctions.attach('capture', () => {});
    assert.equal(MoveFunctions.label('capture'), undefined);

    const detach3 = MoveFunctions.attach('capture', () => {}, { label: 'confirm' });
    assert.equal(MoveFunctions.label('capture'), 'confirm');
    detach3();
    assert.equal(MoveFunctions.label('capture'), undefined);
    assert.ok(!MoveFunctions.list().includes('capture'));
    detach();
    detach2();
  });

  it('notifies run listeners on every run, with the full press', () => {
    const runs: { name: string; shift: boolean }[] = [];
    const unsubscribe = MoveFunctions.subscribeRuns((name, press) => runs.push({ name, shift: press.shift }));

    // Fires even with nothing attached — presses are observable regardless.
    MoveFunctions.run('jog_click');
    const detach = MoveFunctions.attach('jog_click', () => {}, { label: 'enter' });
    MoveFunctions.run('jog_click', { shift: true });
    assert.deepEqual(runs, [
      { name: 'jog_click', shift: false },
      { name: 'jog_click', shift: true },
    ]);

    unsubscribe();
    MoveFunctions.run('jog_click');
    assert.equal(runs.length, 2);
    detach();
  });

  it('lists chips in manifest order, only for chip buttons carrying a label', () => {
    const detachLoop = MoveFunctions.attach('loop', () => {}, { label: 'Cycle take' });
    const detachCapture = MoveFunctions.attach('capture', () => {}, { label: 'Grab frame' });

    // Manifest order, not attach order — the chip row never reshuffles.
    assert.deepEqual(MoveFunctions.chips(), [
      { name: 'loop', label: 'Cycle take' },
      { name: 'capture', label: 'Grab frame' },
    ]);

    detachCapture();
    assert.deepEqual(MoveFunctions.chips().map((c) => c.name), ['loop']);
    detachLoop();
    assert.deepEqual(MoveFunctions.chips(), []);
  });

  it('never chips a button outside MOVE_CHIP_BUTTONS, however labelled', () => {
    // Play is the time indicator's story; the printed keys and the wheel
    // click stay hardware-only lights; the Shift layer never surfaces.
    const offs = (['play', 'undo', 'copy', 'delete', 'up', 'jog_click', 'quantize', 'set_overview'] as const).map(
      (name) => MoveFunctions.attach(name, () => {}, { label: 'Something real' })
    );
    assert.equal(MoveFunctions.list().length, 8);
    assert.deepEqual(MoveFunctions.chips(), []);
    for (const off of offs) off();
  });

  it('no label, no chip — a chip describes the app action, never the key', () => {
    const detach = MoveFunctions.attach('sample', () => {});
    assert.ok(MoveFunctions.list().includes('sample')); // still lit on the hardware
    assert.deepEqual(MoveFunctions.chips(), []);
    detach();

    // chip: false hides one even with a label — the panel's own plumbing.
    const detach2 = MoveFunctions.attach('loop', () => {}, { label: 'Loop', chip: false });
    assert.deepEqual(MoveFunctions.chips(), []);
    detach2();
  });

  it('dresses a chip only in the kit palette; junk colours are dropped', () => {
    const detach = MoveFunctions.attach('capture', () => {}, {
      label: 'Grab frame',
      chip: { variant: 'highlight', color: 'blue' },
    });
    assert.deepEqual(MoveFunctions.chips(), [
      { name: 'capture', label: 'Grab frame', variant: 'highlight', color: 'blue' },
    ]);
    detach();

    // A colour outside MOVE_PALETTE never reaches the screen.
    const detach2 = MoveFunctions.attach('capture', () => {}, {
      label: 'Grab frame',
      chip: { color: '#ff0000' as never },
    });
    assert.deepEqual(MoveFunctions.chips(), [{ name: 'capture', label: 'Grab frame' }]);
    detach2();
  });

  it('push replaces the chip while held; release restores label and visibility', () => {
    const detach = MoveFunctions.attach('mute', () => {}, { label: 'Bypass' });
    assert.deepEqual(MoveFunctions.chips(), [{ name: 'mute', label: 'Bypass' }]);

    // A visible overlay stands in — the chip says what a press runs now.
    const releaseVisible = MoveFunctions.push('mute', () => {}, { label: 'Compare' });
    assert.deepEqual(MoveFunctions.chips(), [{ name: 'mute', label: 'Compare' }]);
    releaseVisible();
    assert.deepEqual(MoveFunctions.chips(), [{ name: 'mute', label: 'Bypass' }]);

    // An unlabelled overlay hides the chip — it would otherwise lie about
    // what a press runs.
    const releaseHidden = MoveFunctions.push('mute', () => {});
    assert.deepEqual(MoveFunctions.chips(), []);
    releaseHidden();
    assert.deepEqual(MoveFunctions.chips(), [{ name: 'mute', label: 'Bypass' }]);

    detach();
    assert.deepEqual(MoveFunctions.chips(), []);
  });

  it('names buttons as the hardware prints them, and marks the special ones', () => {
    // Names match the wire protocol — no aliases, no integration confusion.
    assert.ok(MOVE_FUNCTION_BUTTONS.includes('sample'));
    assert.equal(MOVE_FUNCTION_MANIFEST.length, MOVE_FUNCTION_BUTTONS.length);

    // Special buttons carry no fixed meaning — each app decides.
    assert.deepEqual(MOVE_SPECIAL_BUTTONS, ['sample', 'loop', 'capture', 'menu', 'back', 'jog_click']);
    // The Shift layer of the step row: one name per step, in step order.
    assert.equal(MOVE_STEP_FUNCTIONS.length, 16);
    assert.equal(MOVE_STEP_FUNCTIONS[0], 'set_overview');
    assert.equal(MOVE_STEP_FUNCTIONS[15], 'quantize');
    assert.ok(MOVE_FUNCTION_BUTTONS.includes('setup'));
    const stepCalls: unknown[] = [];
    const detachSetup = MoveFunctions.attach('setup', (press) => stepCalls.push(press));
    MoveFunctions.run('setup', { shift: true, step: 1 });
    assert.deepEqual(stepCalls, [{ name: 'setup', shift: true, hold: false, step: 1 }]);
    detachSetup();

    const calls: string[] = [];
    const detach = MoveFunctions.attach('sample', ({ name }) => calls.push(name));
    MoveFunctions.run('sample');
    assert.deepEqual(calls, ['sample']);
    detach();
  });
});
