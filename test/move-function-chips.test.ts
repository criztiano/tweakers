import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveFunctionChips } from '../src/components/MoveFunctionChips';
import { MovePanel } from '../src/components/MovePanel';
import { MoveFunctions, type MoveFunctionPress } from '../src/move-functions';
import { MOVE_FUNCTION_ICONS } from '../src/icons';
import { MOVE_PALETTE } from '../src/move-palette';
import { TweakStore } from '../src/store/TweakStore';

// The store→component lifecycle: an app attaches a chip-button function
// with a label and the chip row shows it — the key's canonical icon, the
// label saying what the button does HERE, and a click that runs the very
// handler the hardware key runs. No label = no chip (a chip never wears a
// hardware name); buttons outside MOVE_CHIP_BUTTONS never chip; a push
// stands in while it holds the button.

let renderer: ReactTestRenderer | undefined;
const offs: (() => void)[] = [];
const attach = (...args: Parameters<typeof MoveFunctions.attach>) => {
  const off = MoveFunctions.attach(...args);
  offs.push(off);
  return off;
};

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  for (const off of offs.splice(0)) off();
  TweakStore.unregisterPanel('chips-page');
  vi.unstubAllGlobals();
});

function mount(element = createElement(MoveFunctionChips)) {
  act(() => { renderer = create(element); });
}
const chips = () => renderer!.root.findAllByProps({ className: 'tweakers-move-chip' });
const chipText = (chip: ReturnType<typeof chips>[number]) =>
  chip.children.filter((c): c is string => typeof c === 'string').join('');

describe('MoveFunctionChips', () => {
  it('shows a labelled chip per attached chip button and removes it on detach', () => {
    mount();
    expect(chips()).toHaveLength(0);

    const detach = attach('capture', () => {}, { label: 'Load video' });
    let all!: ReturnType<typeof chips>;
    act(() => { all = chips(); });
    expect(all).toHaveLength(1);
    expect(all[0].props['data-name']).toBe('capture');
    expect(chipText(all[0])).toBe('Load video');
    // The key's canonical icon, from the shared map — apps cannot drift.
    expect(all[0].findByType('svg').props.viewBox).toBe(MOVE_FUNCTION_ICONS.capture.viewBox);

    act(() => detach());
    expect(chips()).toHaveLength(0);
  });

  it('renders no chip without a label — a chip never wears a hardware name', () => {
    // This is the double-chip bug's pin: an unlabelled jog_click once drew a
    // generic "Enter" beside the Sampling key's labelled chip. Unlabelled
    // attachments light the key and nothing else.
    attach('sample', () => {}, { label: 'Snapshot' });
    attach('mute', () => {});
    attach('jog_click', () => {}, { label: 'Replay' }); // wheel click: never a chip
    mount();
    const all = chips();
    expect(all).toHaveLength(1);
    expect(chipText(all[0])).toBe('Snapshot');
  });

  it('never chips buttons outside the whitelist, however labelled', () => {
    for (const name of ['play', 'undo', 'copy', 'delete', 'left', 'right', 'up', 'down'] as const) {
      attach(name, () => {}, { label: 'Real action' });
    }
    mount();
    expect(chips()).toHaveLength(0);
  });

  it('runs the attached handler on click — one function, two surfaces', () => {
    const presses: MoveFunctionPress[] = [];
    attach('loop', (press) => presses.push(press), { label: 'Random image' });
    mount();
    act(() => chips()[0].props.onClick());
    expect(presses).toEqual([{ name: 'loop', shift: false, hold: false }]);
  });

  it('dresses in the slot voice by default, highlight or palette colour on request', () => {
    attach('capture', () => {}, { label: 'Load video' });
    attach('loop', () => {}, { label: 'Random image', chip: { variant: 'highlight' } });
    attach('mute', () => {}, { label: 'Bypass', chip: { color: 'blue' } });
    mount();
    const [mute, loop, capture] = [
      chips().find((c) => c.props['data-name'] === 'mute')!,
      chips().find((c) => c.props['data-name'] === 'loop')!,
      chips().find((c) => c.props['data-name'] === 'capture')!,
    ];
    expect(capture.props['data-variant']).toBeUndefined();
    expect(capture.props.style).toBeUndefined();
    expect(loop.props['data-variant']).toBe('highlight');
    // Only the kit's own palette ever colours a chip.
    expect(mute.props['data-color']).toBe('blue');
    expect(mute.props.style).toEqual({ background: MOVE_PALETTE.blue });
  });

  it('reflects a push while it holds the button, and the release restores', () => {
    attach('mute', () => {}, { label: 'Bypass' });
    mount();
    expect(chipText(chips()[0])).toBe('Bypass');

    let release!: () => void;
    act(() => { release = MoveFunctions.push('mute', () => {}, { label: 'Compare' }); });
    expect(chipText(chips()[0])).toBe('Compare');

    // An unlabelled borrow hides the chip rather than lie about the press.
    let releaseHidden!: () => void;
    act(() => { releaseHidden = MoveFunctions.push('mute', () => {}); });
    expect(chips()).toHaveLength(0);
    act(() => releaseHidden());
    expect(chipText(chips()[0])).toBe('Compare');

    act(() => release());
    expect(chipText(chips()[0])).toBe('Bypass');
  });

  it('flashes on a hardware run, and rests after the flash', () => {
    vi.useFakeTimers();
    try {
      attach('loop', () => {}, { label: 'Random image' });
      mount();
      expect(chips()[0].props['data-pressed']).toBeUndefined();
      act(() => MoveFunctions.run('loop'));
      expect(chips()[0].props['data-pressed']).toBe(true);
      act(() => { vi.runAllTimers(); });
      expect(chips()[0].props['data-pressed']).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('MovePanel function chip placement', () => {
  const mountPanel = (functionChips?: 'clock' | 'tracks' | 'none') => {
    TweakStore.registerPanel('chips-page', 'Chips', { level: [0.5, 0, 1] });
    mount(createElement(MovePanel, { panels: 'Chips', dock: 'flow', productionEnabled: true, functionChips }));
  };
  const rowClass = () => {
    const row = renderer!.root.findAllByProps({ className: 'tweakers-move-chips' })[0];
    let node = row.parent;
    while (node && !node.props?.className) node = node.parent;
    return node?.props.className as string;
  };

  it('defaults to the clock seat — the header cluster, left of the readout', () => {
    attach('capture', () => {}, { label: 'Load video' });
    mountPanel();
    expect(rowClass()).toBe('tweakers-move-actions');
  });

  it('moves to the track-label end on functionChips="tracks"', () => {
    attach('capture', () => {}, { label: 'Load video' });
    mountPanel('tracks');
    expect(rowClass()).toBe('tweakers-move-tracks-group');
  });

  it('renders no chips on functionChips="none"', () => {
    attach('capture', () => {}, { label: 'Load video' });
    mountPanel('none');
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-chips' })).toHaveLength(0);
  });
});
