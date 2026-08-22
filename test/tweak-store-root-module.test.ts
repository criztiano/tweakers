import { describe, it, expect, afterEach } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';

// `_enabled` at the root of a config makes the whole panel a module: the title
// carries the switch, exactly as a module folder's header does one level down.

let seq = 0;
const registered: string[] = [];

const register = (config: Parameters<typeof TweakStore.registerPanel>[2]) => {
  const id = `root-module-${++seq}`;
  TweakStore.registerPanel(id, id, config);
  registered.push(id);
  return id;
};

afterEach(() => {
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
});

describe('a panel root that declared _enabled', () => {
  it('is flagged as a module', () => {
    const id = register({ _enabled: false, drive: 0.5 });
    expect(TweakStore.getPanels().find((p) => p.id === id)?.module).toBe(true);
  });

  it('leaves an ordinary panel unflagged', () => {
    const id = register({ drive: 0.5 });
    expect(TweakStore.getPanels().find((p) => p.id === id)?.module).toBeUndefined();
  });

  it('holds the switch as a plain `_enabled` value', () => {
    const id = register({ _enabled: false, drive: 0.5 });
    expect(TweakStore.getValues(id)['_enabled']).toBe(false);
    TweakStore.updateValue(id, '_enabled', true);
    expect(TweakStore.getValues(id)['_enabled']).toBe(true);
  });

  it('does not turn the switch into a control row', () => {
    const id = register({ _enabled: false, drive: 0.5 });
    const controls = TweakStore.getPanels().find((p) => p.id === id)!.controls;
    expect(controls.map((c) => c.path)).toEqual(['drive']);
  });

  it('drops the flag when the config stops declaring it', () => {
    const id = register({ _enabled: false, drive: 0.5 });
    TweakStore.updatePanel(id, id, { drive: 0.5 });
    expect(TweakStore.getPanels().find((p) => p.id === id)?.module).toBeUndefined();
  });
});
