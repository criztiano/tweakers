import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ListScreen } from '../src/components/ListScreen';
import {
  MoveSurfaceStore,
  moveScreenChecked,
  moveScreenRowLabel,
  type MoveScreenRow,
} from '../src/move-surface-store';
import { normalizeToggleDial, denormalizeToggleDial } from '../src/move-layout';

// The wheel screen's contract, written from the call sites in the app that
// drives it: a list whose rows say where they lead and what is switched on,
// a label helper for the 1-bit hardware screen, which has room for neither,
// and a selection channel the host owns.

describe('the list a wheel is walking', () => {
  const rows: MoveScreenRow[] = [
    'Ripped Tracks',
    { label: 'Load Sample', detail: 'dialog' },
    { label: 'Drums', detail: 'page', checked: true },
    { label: 'Back', detail: 'back' },
  ];

  it('reads a label off either form, and says which rows are on', () => {
    expect(rows.map(moveScreenRowLabel)).toEqual(['Ripped Tracks', 'Load Sample', 'Drums', 'Back']);
    expect(moveScreenChecked(rows)).toEqual([2]);
  });

  it('draws where a row leads, and what is switched on', () => {
    const html = renderToStaticMarkup(createElement(ListScreen, {
      items: rows.map((row, i) => ({
        value: String(i),
        label: moveScreenRowLabel(row),
        ...(typeof row === 'string' ? {} : { detail: row.detail, checked: row.checked }),
      })),
      value: '0',
    }));
    expect(html.match(/tweakers-list-screen-mark/g)).toHaveLength(3);   // not the plain row
    expect(html).toContain('data-detail="back"');
    expect(html).toContain('data-checked="true"');
  });

  it('carries a selection back to the host, and only for a row that exists', () => {
    const seen: number[] = [];
    const off = MoveSurfaceStore.onScreenSelect((i) => seen.push(i));
    MoveSurfaceStore.setScreen({ items: rows, index: 0 });
    MoveSurfaceStore.selectScreen(2);
    MoveSurfaceStore.selectScreen(9);          // past the end: nothing to select
    MoveSurfaceStore.selectScreen(-1);
    off();
    MoveSurfaceStore.selectScreen(1);          // detached: no longer listening
    expect(seen).toEqual([2]);
    MoveSurfaceStore.setScreen(null);
  });
});

describe('a boolean on a knob', () => {
  it('rides as the two ends of a dial, and halfway reads as on', () => {
    expect(normalizeToggleDial(true)).toBe(1);
    expect(normalizeToggleDial(false)).toBe(0);
    expect(denormalizeToggleDial(0.49)).toBe(false);
    expect(denormalizeToggleDial(0.5)).toBe(true);
    expect(denormalizeToggleDial(Number.NaN)).toBe(false);
  });
});

describe('the wheel screen on the panel', () => {
  it('shows the app’s list beside the slots, and reports the row clicked', async () => {
    const { act, create } = await import('react-test-renderer');
    const { MovePanel } = await import('../src/components/MovePanel');
    const { TweakStore } = await import('../src/store/TweakStore');
    const { vi } = await import('vitest');
    vi.stubGlobal('window', new EventTarget());

    const id = 'wheel-screen-panel';
    TweakStore.registerPanel(id, 'Wheel', { amount: 0.5 } as never);
    MoveSurfaceStore.setScreen({
      title: 'Tracks',
      items: ['Drums', { label: 'Bass', detail: 'page' }, { label: 'Keys', checked: true }],
      index: 1,
    });

    const taken: number[] = [];
    const off = MoveSurfaceStore.onScreenSelect((i) => taken.push(i));
    let renderer: ReturnType<typeof create> | undefined;
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Wheel', dock: 'flow', productionEnabled: true })); });

    const rows = renderer!.root.findAllByProps({ className: 'tweakers-list-screen-row' });
    expect(rows.map((r) => r.props['data-selected'])).toEqual([undefined, true, undefined]);
    act(() => { rows[2].props.onClick(); });
    expect(taken).toEqual([2]);

    off();
    act(() => renderer!.unmount());
    MoveSurfaceStore.setScreen(null);
    TweakStore.unregisterPanel(id);
    vi.unstubAllGlobals();
  });
});
