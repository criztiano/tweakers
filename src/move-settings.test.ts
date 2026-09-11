import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MoveSettingsView } from './move-settings';

describe('the settings view store', () => {
  beforeEach(() => MoveSettingsView.close());

  it('opens, closes and toggles', () => {
    assert.equal(MoveSettingsView.isOpen(), false);
    MoveSettingsView.toggle();
    assert.equal(MoveSettingsView.isOpen(), true);
    MoveSettingsView.toggle();
    assert.equal(MoveSettingsView.isOpen(), false);
    MoveSettingsView.open();
    MoveSettingsView.open();
    assert.equal(MoveSettingsView.isOpen(), true);
  });

  it('notifies once per change, and never on a repeat', () => {
    let calls = 0;
    const unsub = MoveSettingsView.subscribe(() => calls++);
    MoveSettingsView.open();
    MoveSettingsView.open();   // already open — silent
    MoveSettingsView.close();
    assert.equal(calls, 2);
    unsub();
    MoveSettingsView.open();
    assert.equal(calls, 2);
  });
});
