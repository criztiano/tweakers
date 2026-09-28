import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { moveSlotKind } from '../src/components/move-slots';
import { TweakStore, type ControlMeta, type TweakConfig } from '../src/store/TweakStore';

// A slider whose number already says what it is asks for its value first
// (`display: 'value'`): the value is the headline at rest and the name a
// tag — the presentation a focused panel gives every such dial, nothing new
// drawn. `display: 'dial'` keeps its needle.

let renderer: ReactTestRenderer | undefined;
const id = 'value-first-page';

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

function mount(config: TweakConfig) {
  TweakStore.registerPanel(id, 'Values', config);
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Values', dock: 'flow', productionEnabled: true })); });
}
const slot = (label: string) => renderer!.root.find((n) => n.type === 'div' && n.props.className === 'tweakers-move-dial' && n.props['aria-label'] === label);
const tag = (label: string) => slot(label).findAll((n) => n.type === 'span' && n.props.className === 'tweakers-move-dial-sub');

const slider = (extra: Partial<ControlMeta> = {}): ControlMeta =>
  ({ type: 'slider', path: 'decay', label: 'Decay', min: 0, max: 2000, ...extra } as ControlMeta);

describe('a slider that shows its value first', () => {
  it('names the value face when the app asks, and keeps every other face', () => {
    expect(moveSlotKind(slider({ display: 'value' }))).toBe('value');
    expect(moveSlotKind(slider())).toBe('default');
    expect(moveSlotKind(slider({ display: 'track' }))).toBe('default');
    expect(moveSlotKind(slider({ display: 'dial' }))).toBe('dial');
    // a drawing still wins: the picture already is the value
    expect(moveSlotKind(slider({ display: 'value', min: -12, max: 12, moveVisual: { kind: 'pitch' } }))).toBe('pitch');
    // only a slider can ask
    expect(moveSlotKind({ type: 'number', path: 'n', label: 'N', min: 0, max: 10, display: 'value' } as ControlMeta)).toBe('default');
  });

  it('draws the value as the headline and the name as a tag, whatever the range', () => {
    mount({
      decay: { type: 'slider', default: 250, min: 0, max: 2000, step: 1, unit: ' ms', display: 'value' },
      mix: { type: 'slider', default: 0.4, min: 0, max: 1, step: 0.01, display: 'value' },
      amount: { type: 'slider', default: 0.5, min: 0, max: 1, step: 0.01 },
    });
    expect(TweakStore.getPanel(id)!.controls[0].display).toBe('value');

    expect(slot('Decay').props['data-sub']).toBe(true);
    expect(tag('Decay').map((n) => n.props.children)).toEqual(['Decay']);
    expect(slot('Decay').findByProps({ className: 'tweakers-move-dial-number' }).props.children).toBe('250');

    // a plain 0..1 amount keeps its big name — unless the app asked
    expect(slot('Mix').props['data-sub']).toBe(true);
    expect(slot('Amount').props['data-sub']).toBeUndefined();
    expect(tag('Amount')).toHaveLength(0);
  });

  it('leaves a dial slider its needle', () => {
    mount({ heading: { type: 'slider', default: 90, min: 0, max: 360, step: 1, display: 'dial' } });
    const dial = renderer!.root.findByProps({ 'data-kind': 'dial' });
    expect(dial.props['data-sub']).toBeUndefined();
    expect(dial.findAllByProps({ className: 'tweakers-move-dial-sub' })).toHaveLength(0);
  });
});
