import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveFunctionChips } from '../src/components/MoveFunctionChips';
import { MovePanel } from '../src/components/MovePanel';
import { MoveFunctions, type MoveFunctionPress } from '../src/move-functions';
import { MOVE_FUNCTION_ICONS } from '../src/icons';
import { TweakStore } from '../src/store/TweakStore';

// The store→component lifecycle: an app attaches a function and the chip
// row shows it — same icon everywhere, the attach's label (or the printed
// name), and a click that runs the very handler the hardware key runs.
// Detach removes it, a push stands in while it holds the button, and the
// reserved names never render.

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
  it('shows a chip per attached function and removes it on detach', () => {
    mount();
    expect(chips()).toHaveLength(0);

    const detach = attach('capture', () => {}, { label: 'Load video' });
    let all!: ReturnType<typeof chips>;
    act(() => { all = chips(); });
    expect(all).toHaveLength(1);
    expect(all[0].props['data-name']).toBe('capture');
    expect(chipText(all[0])).toBe('Load video');

    act(() => detach());
    expect(chips()).toHaveLength(0);
  });

  it('wears the printed name without a label, and the canonical icon always', () => {
    attach('undo', () => {});
    attach('jog_click', () => {});
    mount();
    const [undo, enter] = chips();
    expect(chipText(undo)).toBe('Undo');
    expect(chipText(enter)).toBe('Enter');
    // One icon per hardware key, from the shared map — apps cannot drift.
    expect(undo.findByType('svg').props.viewBox).toBe(MOVE_FUNCTION_ICONS.undo.viewBox);
    expect(enter.findByType('svg').props.viewBox).toBe(MOVE_FUNCTION_ICONS.jog_click.viewBox);
  });

  it('runs the attached handler on click — one function, two surfaces', () => {
    const presses: MoveFunctionPress[] = [];
    attach('loop', (press) => presses.push(press));
    attach('quantize', (press) => presses.push(press));
    mount();
    const [loop, quantize] = chips();
    act(() => loop.props.onClick());
    // A Shift-layer chip presses as the hardware does: shift, with its step.
    act(() => quantize.props.onClick());
    expect(presses).toEqual([
      { name: 'loop', shift: false, hold: false },
      { name: 'quantize', shift: true, hold: false, step: 15 },
    ]);
  });

  it('reflects a push while it holds the button, and the release restores', () => {
    attach('back', () => {}, { label: 'Leave' });
    mount();
    expect(chipText(chips()[0])).toBe('Leave');

    let release!: () => void;
    act(() => { release = MoveFunctions.push('back', () => {}, { label: 'revert' }); });
    expect(chipText(chips()[0])).toBe('revert');

    // The panel's own borrows are chipless — the chip hides rather than lie.
    let releaseHidden!: () => void;
    act(() => { releaseHidden = MoveFunctions.push('back', () => {}, { chip: false }); });
    expect(chips()).toHaveLength(0);
    act(() => releaseHidden());
    expect(chipText(chips()[0])).toBe('revert');

    act(() => release());
    expect(chipText(chips()[0])).toBe('Leave');
  });

  it('never renders the reserved buttons or chip:false attachments', () => {
    attach('set_overview', () => {});
    attach('setup', () => {});
    attach('step13', () => {});
    attach('right', () => {}, { label: 'Next 8', chip: false });
    mount();
    expect(chips()).toHaveLength(0);
  });

  it('flashes on a hardware run, and rests after the flash', () => {
    vi.useFakeTimers();
    try {
      attach('play', () => {});
      mount();
      expect(chips()[0].props['data-pressed']).toBeUndefined();
      act(() => MoveFunctions.run('play'));
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
    attach('capture', () => {});
    mountPanel();
    expect(rowClass()).toBe('tweakers-move-actions');
  });

  it('moves to the track-label end on functionChips="tracks"', () => {
    attach('capture', () => {});
    mountPanel('tracks');
    expect(rowClass()).toBe('tweakers-move-tracks-group');
  });

  it('renders no chips on functionChips="none"', () => {
    attach('capture', () => {});
    mountPanel('none');
    expect(renderer!.root.findAllByProps({ className: 'tweakers-move-chips' })).toHaveLength(0);
  });
});
