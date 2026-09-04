import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MoveVolumeDisplay } from './move-volume';

// The volume-dial readout: the app sets a static or live string, the
// MovePanel shows it in the header's dark pill and clears when told to.

describe('move volume display', () => {
  it('holds the readout, notifies on set and clear, and hides when cleared', () => {
    let notified = 0;
    const unsubscribe = MoveVolumeDisplay.subscribe(() => { notified++; });

    assert.equal(MoveVolumeDisplay.get(), null);
    MoveVolumeDisplay.set({ label: 'gain', value: '-6.0 dB' });
    assert.equal(notified, 1);
    assert.deepEqual(MoveVolumeDisplay.get(), { label: 'gain', value: '-6.0 dB' });

    // Replaces, never merges — the pill shows exactly what was last set.
    MoveVolumeDisplay.set({ value: '0:00:00' });
    assert.equal(notified, 2);
    assert.deepEqual(MoveVolumeDisplay.get(), { value: '0:00:00' });

    MoveVolumeDisplay.clear();
    assert.equal(notified, 3);
    assert.equal(MoveVolumeDisplay.get(), null);

    unsubscribe();
    MoveVolumeDisplay.set({ value: 'x' });
    assert.equal(notified, 3);
    MoveVolumeDisplay.clear();
  });

  it('carries a live getValue for per-frame readouts', () => {
    let t = 0;
    MoveVolumeDisplay.set({ getValue: () => `0:00:0${t}` });
    const state = MoveVolumeDisplay.get();
    assert.equal(state?.getValue?.(), '0:00:00');
    t = 7;
    assert.equal(state?.getValue?.(), '0:00:07');
    MoveVolumeDisplay.clear();
  });
});
