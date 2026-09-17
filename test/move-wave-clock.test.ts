import { createElement, Fragment } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { MoveWaveform, type MoveWaveformProps } from '../src/components/MoveWaveform';
import { MoveFunctions } from '../src/move-functions';
import { MoveWaveformStore } from '../src/move-waveform';
import { TweakStore } from '../src/store/TweakStore';

// The clock a host's waveform puts in the panel's corner: the transport's
// state around the time, each state a key that runs what the hardware key
// runs. A host that records gets a record key beside Play; one that does
// not keeps the clock it always had.

let renderer: ReactTestRenderer | undefined;
const id = 'wave-clock-page';

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  TweakStore.registerPanel(id, 'Clock', { gain: [0.5, 0, 1] });
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

const tree = (transport: MoveWaveformProps['transport']) =>
  createElement(Fragment, null,
    createElement(MovePanel, { panels: 'Clock', dock: 'flow', productionEnabled: true }),
    createElement(MoveWaveform, { productionEnabled: true, transport }));

function mount(transport: MoveWaveformProps['transport']) {
  act(() => { renderer = create(tree(transport)); });
}

const keys = () => renderer!.root.findAll((n) => n.type === 'button' && n.props.className === 'tweakers-move-wave-key');
const key = (name: string) => keys().find((n) => n.props['data-name'] === name)!;
const lit = (name: string) => key(name).findByType('svg').props['data-on'];
const pill = () => renderer!.root.find((n) => n.type === 'div' && n.props.className === 'tweakers-move-volume tweakers-move-wave-time');

describe('the waveform clock', () => {
  it('keeps play and loop for a host that does not record, and leaves Rec alone', () => {
    const onPlay = vi.fn();
    const onLoop = vi.fn();
    mount({ playing: false, loopOn: true, onPlay, onLoop });

    expect(keys().map((n) => n.props['data-name'])).toEqual(['play', 'loop']);
    expect(pill().props['data-record']).toBeUndefined();
    expect(MoveWaveformStore.getTransport()).toEqual({ playing: false, loopOn: true });
    expect(MoveFunctions.list()).not.toContain('rec');

    // each key names what a press does now
    expect(key('play').props['aria-label']).toBe('Play');
    expect(key('loop').props['aria-label']).toBe('Loop off');
    expect(lit('loop')).toBe(true);

    act(() => key('play').props.onClick());
    act(() => key('loop').props.onClick());
    expect(onPlay).toHaveBeenCalledOnce();
    expect(onLoop).toHaveBeenCalledOnce();
  });

  it('takes the Rec key for a host that records, and draws it beside Play', () => {
    const onRecord = vi.fn();
    const transport = { playing: true, loopOn: false, onPlay: () => {}, onLoop: () => {}, onRecord };
    mount({ ...transport, recording: false });

    expect(keys().map((n) => n.props['data-name'])).toEqual(['play', 'rec', 'loop']);
    expect(pill().props['data-record']).toBe(true);
    expect(key('play').props['aria-label']).toBe('Stop');
    expect(key('rec').props['aria-label']).toBe('Record');
    expect(lit('rec')).toBeUndefined();

    // a click and a hardware press are one action
    act(() => key('rec').props.onClick());
    act(() => MoveFunctions.run('rec'));
    expect(onRecord).toHaveBeenCalledTimes(2);

    act(() => renderer!.update(tree({ ...transport, recording: true })));
    expect(MoveWaveformStore.getTransport()).toEqual({ playing: true, loopOn: false, recording: true });
    expect(key('rec').props['aria-label']).toBe('Stop recording');
    expect(lit('rec')).toBe(true);

    // the key goes back to the app with the card
    act(() => renderer!.update(createElement(MovePanel, { panels: 'Clock', dock: 'flow', productionEnabled: true })));
    expect(MoveFunctions.list()).not.toContain('rec');
    expect(keys()).toHaveLength(0);
  });
});
