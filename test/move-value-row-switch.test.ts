import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { buildMovePages } from '../src/move-layout';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

const id = 'value-row-switch';
let renderer: ReactTestRenderer | undefined;
beforeEach(() => vi.stubGlobal('window', new EventTarget()));
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

/** Eight dials, so the rest land on the pads. */
const dials = Object.fromEntries(
  Array.from({ length: 8 }, (_, i) => [`d${i}`, { type: 'slider', min: 0, max: 1, default: 0.5 }]),
) as TweakConfig;
const config: TweakConfig = {
  ...dials,
  bell: { type: 'slider', min: 0, max: 1, default: 0.25 },
  flip: false,
};

describe('a switch on the value row', () => {
  it('leaves its top cell to the chip that shapes the control, and sits under it', () => {
    TweakStore.registerPanel(id, 'Row', config, undefined, {
      movePads: { bell: 0, flip: 0 }, moveTopRow: ['bell'], moveValueRow: ['flip'],
    });
    const [page] = buildMovePages([TweakStore.getPanel(id)!]);
    expect(page.toggles[0]).toBeUndefined();
    expect(page.topValues?.[0]?.path).toBe('bell');
    expect(page.valueActions?.[0]?.path).toBe('flip');
  });

  it('is still a switch there: a press flips it', () => {
    TweakStore.registerPanel(id, 'Row', config, undefined, {
      movePads: { bell: 0, flip: 0 }, moveTopRow: ['bell'], moveValueRow: ['flip'],
    });
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Row', dock: 'flow', productionEnabled: true })); });
    const row = renderer!.root.findAll((n) => n.props['data-pad-row'] !== undefined && typeof n.type === 'string')[1];
    const pad = row.findAll((n) => n.props['data-kind'] === 'toggle' && typeof n.type === 'string')[0];
    expect(pad).toBeDefined();
    act(() => pad.props.onClick());
    expect(TweakStore.getValues(id).flip).toBe(true);
  });
});
