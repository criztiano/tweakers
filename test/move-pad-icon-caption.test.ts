import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

const id = 'pad-icon-caption';
let renderer: ReactTestRenderer | undefined;
beforeEach(() => vi.stubGlobal('window', new EventTarget()));
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

/** Eight dials, so the switches land on the pads. */
const dials = Object.fromEntries(
  Array.from({ length: 8 }, (_, i) => [`d${i}`, { type: 'slider', min: 0, max: 1, default: 0.5 }]),
) as TweakConfig;

function mount(config: TweakConfig) {
  TweakStore.registerPanel(id, 'Caption', { ...dials, ...config }, undefined, {
    movePads: Object.fromEntries(Object.keys(config).map((path, i) => [path, i])),
  });
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Caption', dock: 'flow', productionEnabled: true })); });
}

const pad = (label: string): ReactTestInstance =>
  renderer!.root.find((n) => typeof n.type === 'string' && n.props.className === 'tweakers-move-pad' && n.props.title === label);
const words = (node: ReactTestInstance) =>
  node.findAll((n) => n.props.className === 'tweakers-move-pad-title' && typeof n.type === 'string').map((n) => n.children.join(''));

describe('a switch pad wearing a picture and a caption', () => {
  it('shows the picture in place of the name, and the words in force beside it', () => {
    mount({ thinking: { type: 'toggle', default: true, label: 'Thinking', icon: 'brain', caption: { off: 'Minimal', on: 'High' } } });
    const thinking = pad('Thinking');
    expect(thinking.props['data-kind']).toBe('icon');
    expect(thinking.props['data-on']).toBe(true);
    expect(thinking.findAll((n) => n.props.className === 'tweakers-move-pad-icon-label' && typeof n.type === 'string')).toHaveLength(1);
    expect(words(thinking)).toEqual(['High']);
    expect(thinking.props['aria-label']).toBe('Thinking: High');
  });

  it('turns its words with the press, and the pad goes dark', () => {
    mount({ thinking: { type: 'toggle', default: true, label: 'Thinking', icon: 'brain', caption: { off: 'Minimal', on: 'High' } } });
    act(() => pad('Thinking').props.onClick());
    expect(TweakStore.getValues(id).thinking).toBe(false);
    expect(pad('Thinking').props['data-on']).toBe(false);
    expect(words(pad('Thinking'))).toEqual(['Minimal']);
  });

  it('keeps one string for both states', () => {
    mount({ cue: { type: 'toggle', default: false, label: 'Monitor', icon: 'headphones', caption: 'Cue' } });
    expect(words(pad('Monitor'))).toEqual(['Cue']);
    act(() => pad('Monitor').props.onClick());
    expect(words(pad('Monitor'))).toEqual(['Cue']);
  });

  it('leaves a picture with no caption alone, and ignores a caption with no picture', () => {
    mount({
      solo: { type: 'toggle', default: false, label: 'Solo', icon: 'headphones' },
      sync: { type: 'toggle', default: false, label: 'Sync', caption: 'unused' },
    });
    const solo = pad('Solo');
    expect(solo.props['aria-label']).toBe('Solo');
    expect(words(solo)).toEqual([]);
    const sync = renderer!.root.find((n) => typeof n.type === 'string' && n.props['data-kind'] === 'toggle');
    expect(words(sync)).toEqual(['Sync']);
  });
});
