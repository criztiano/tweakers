import { describe, it, expect, afterEach } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';

// The balance control: a 0..1 mix between two sibling color params. The dial
// is a plain bounded number on the wire; the two color paths ride the meta so
// the slot can draw the blend it is standing between.

let panelSeq = 0;
const freshId = () => `balance-test-${++panelSeq}`;

const registered: string[] = [];
const register = (id: string, config: Parameters<typeof TweakStore.registerPanel>[2]) => {
  TweakStore.registerPanel(id, id, config);
  registered.push(id);
};

afterEach(() => {
  while (registered.length) TweakStore.unregisterPanel(registered.pop()!);
});

describe('balance control parsing', () => {
  it('registers as a bounded 0..1 control carrying its two color paths', () => {
    const id = freshId();
    register(id, {
      colorA: '#ff0000',
      colorB: '#0000ff',
      mix: { type: 'balance' as const, a: 'colorA', b: 'colorB', default: 0.25 },
    });
    const control = TweakStore.getPanels().find((p) => p.id === id)!.controls.find((c) => c.path === 'mix')!;
    expect(control.type).toBe('balance');
    expect(control.balanceA).toBe('colorA');
    expect(control.balanceB).toBe('colorB');
    expect(control.min).toBe(0);
    expect(control.max).toBe(1);
    expect(TweakStore.getValue(id, 'mix')).toBe(0.25);
  });

  it('rests at the even blend without a default, and clamps a wild one', () => {
    const id = freshId();
    register(id, {
      low: { type: 'balance' as const, a: 'x', b: 'y' },
      hot: { type: 'balance' as const, a: 'x', b: 'y', default: 7 },
    });
    expect(TweakStore.getValue(id, 'low')).toBe(0.5);
    expect(TweakStore.getValue(id, 'hot')).toBe(1);
  });

  it('preserves a live mix across a config edit and drops a lost shape', () => {
    const id = freshId();
    const config = { mix: { type: 'balance' as const, a: 'a', b: 'b', default: 0.5 } };
    register(id, config);
    TweakStore.updateValue(id, 'mix', 0.8);
    TweakStore.updatePanel(id, id, config);
    expect(TweakStore.getValue(id, 'mix')).toBe(0.8);
    TweakStore.updateValue(id, 'mix', 'sideways' as never);
    TweakStore.updatePanel(id, id, config);
    expect(TweakStore.getValue(id, 'mix')).toBe(0.5);
  });

  it('is a control, never a folder', () => {
    const id = freshId();
    register(id, { mix: { type: 'balance' as const, a: 'a', b: 'b' } });
    const panel = TweakStore.getPanels().find((p) => p.id === id)!;
    expect(panel.controls[0].children).toBeUndefined();
    expect(panel.controls[0].type).toBe('balance');
  });
});
