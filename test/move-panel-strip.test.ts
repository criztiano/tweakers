import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel, MOVE_JOG_EVENT, MOVE_STRIP_EVENT } from '../src/components/MovePanel';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';
import { MOVE_DIALS } from '../src/move-layout';
import { MoveFunctions } from '../src/move-functions';
import { MoveSurfaceStore } from '../src/move-surface-store';

let renderer: ReactTestRenderer | undefined;
const id = 'move-strip-panel';

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  TweakStore.unregisterPanel(`${id}-second`);
  MoveSurfaceStore.reset();
  vi.unstubAllGlobals();
});

/** Twenty sliders — two and a half screens of dials. */
const many = (count: number): TweakConfig =>
  Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`p${i}`, { type: 'slider', min: 0, max: 1, default: 0.5 }])
  ) as TweakConfig;

function mount(config: TweakConfig, scroll = true, options?: { movePads?: Record<string, number> }, headerStart?: React.ReactNode) {
  TweakStore.registerPanel(id, 'Strip', config, undefined, options);
  act(() => {
    renderer = create(createElement(MovePanel, {
      panels: 'Strip', dock: 'flow', productionEnabled: true, scroll,
      headerStart,
    }));
  });
}

const byClass = (className: string) =>
  renderer!.root.findAll((n) => n.props.className === className);
const strip = () => byClass('tweakers-move-strip')[0];
const rail = () => byClass('tweakers-move-rail')[0];
const pads = () => byClass('tweakers-move-pad');
const labels = () =>
  byClass('tweakers-move-dial-label').map((n) => n.props.children as string);
const padTitles = () =>
  byClass('tweakers-move-pad-title').map((n) => n.props.children as string);
const jog = (delta: number) => {
  act(() => { window.dispatchEvent(new CustomEvent(MOVE_JOG_EVENT, { detail: { delta } })); });
};

describe('the scrolling panel', () => {
  it('places a view status in the start of the native panel header', () => {
    mount(many(1), false, undefined, createElement('output', { 'data-testid': 'view-status' }, 'Zoom 4×'));
    const header = byClass('tweakers-move-tracks-group')[0];
    expect(header.findByProps({ 'data-testid': 'view-status' }).props.children).toBe('Zoom 4×');
  });

  it('shows native page labels in the top-left header when tracks paginate', () => {
    TweakStore.registerPanel(id, 'EXTRA', many(1));
    TweakStore.registerPanel(`${id}-second`, 'DRUMS', many(1));
    act(() => {
      renderer = create(createElement(MovePanel, { dock: 'flow', productionEnabled: true }));
    });
    const tabs = renderer!.root.findByProps({ role: 'tablist', 'aria-label': 'Move pages' });
    expect(tabs.findAllByProps({ role: 'tab' }).map((node) => node.findByProps({ className: 'tweakers-move-track-label' }).props.children))
      .toEqual(['EXTRA', 'DRUMS']);
    expect(tabs.findAllByProps({ role: 'tab' }).map((node) => node.props['aria-selected']))
      .toEqual([true, false]);
    expect(renderer!.root.findByProps({ role: 'tabpanel' }).props['aria-labelledby'])
      .toBe(tabs.findAllByProps({ role: 'tab' })[0].props.id);
  });

  it('selects stable page ids while showing real part names and shared controls', () => {
    const ids = ['extra-part-snare', 'extra-part-kick'];
    const common: TweakConfig = {
      BPM: { type: 'slider', default: 126, min: 20, max: 400, step: 0.01 },
      '÷2  ·  ×2': { type: 'slider', default: 0, min: -1, max: 1, step: 1, origin: 0, bipolar: true },
    };
    const options = { labels: { BPM: 'BPM', '÷2  ·  ×2': '÷2 · ×2' } };
    TweakStore.registerPanel(ids[0], 'SNARE', common, undefined, options);
    TweakStore.registerPanel(ids[1], 'KICK', common, undefined, options);
    act(() => {
      renderer = create(createElement(MovePanel, {
        panels: ids, dock: 'flow', productionEnabled: true,
      }));
    });

    const tabs = renderer!.root.findByProps({ role: 'tablist', 'aria-label': 'Move pages' });
    expect(tabs.findAllByProps({ role: 'tab' }).map((node) =>
      node.findByProps({ className: 'tweakers-move-track-label' }).props.children
    )).toEqual(['SNARE', 'KICK']);
    expect(labels()).toEqual(['BPM', '÷2 · ×2']);

    act(() => tabs.findAllByProps({ role: 'tab' })[1].props.onClick());
    expect(labels()).toEqual(['BPM', '÷2 · ×2']);
    expect(tabs.findAllByProps({ role: 'tab' }).map((node) => node.props['aria-selected']))
      .toEqual([false, true]);

    TweakStore.unregisterPanel(ids[0]);
    TweakStore.unregisterPanel(ids[1]);
  });

  it('keeps app pads in the Move matrix when the dial cluster has only two columns', () => {
    MoveSurfaceStore.claimRows(2);
    MoveSurfaceStore.setPads([
      ...Array.from({ length: 4 }, (_, x) => ({ x, y: 1 as const, label: `Nav ${x + 1}`, lit: true })),
      ...Array.from({ length: 8 }, (_, x) => ({ x, y: 0 as const, label: `Slice ${x + 1}`, lit: false })),
    ]);
    mount(many(2), false);

    const grid = byClass('tweakers-move-grid')[0];
    const rows = byClass('tweakers-move-pads');
    expect(grid.props['data-pad-columns']).toBe(8);
    expect(rows.length).toBeLessThanOrEqual(4);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.props['data-pad-columns']).toBe(8);
      expect(row.children).toHaveLength(8);
    }
    expect(rows[0].findAllByProps({ 'data-kind': 'app' }).map((pad) => pad.findByProps({ className: 'tweakers-move-pad-title' }).props.children))
      .toEqual(['Nav 1', 'Nav 2', 'Nav 3', 'Nav 4']);
    expect(rows[1].findAllByProps({ 'data-kind': 'app' })).toHaveLength(8);
  });

  it('keeps claimed step/loop points off-screen while retaining pad feedback', () => {
    MoveSurfaceStore.setSteps([{ step: 0, lit: true }, { step: 7, lit: false }]);
    MoveSurfaceStore.claimRows(1);
    MoveSurfaceStore.setPads([{ x: 0, y: 0, label: 'Slice 1', lit: false }]);
    mount(many(1), false);

    expect(byClass('tweakers-move-mod-dot')).toHaveLength(0);
    const pad = renderer!.root.findByProps({ 'data-kind': 'app' });
    act(() => pad.props.onPointerDown({ pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }));
    expect(renderer!.root.findByProps({ 'data-kind': 'app' }).props['data-held']).toBe(true);
    act(() => renderer!.root.findByProps({ 'data-kind': 'app' }).props.onPointerCancel());
    expect(renderer!.root.findByProps({ 'data-kind': 'app' }).props['data-held']).toBeUndefined();
  });

  it('keeps every control at slot size instead of demoting the overflow', () => {
    mount(many(20));
    expect(labels()).toHaveLength(20);
    expect(pads()).toHaveLength(0);
    expect(strip().props.style['--move-strip-len']).toBe(20);
  });

  it('moves the window one control per wheel detent', () => {
    mount(many(20));
    expect(strip().props.style['--move-offset']).toBe(0);
    jog(3);
    expect(strip().props.style['--move-offset']).toBe(3);
    expect(rail().props['aria-label']).toBe('Slots 4–11 of 20');
    jog(-1);
    expect(strip().props.style['--move-offset']).toBe(2);
  });

  it('stops at both ends of the set', () => {
    mount(many(20));
    jog(-5);
    expect(strip().props.style['--move-offset']).toBe(0);
    jog(99);
    expect(strip().props.style['--move-offset']).toBe(12);   /* 20 slots − 8 dials */
  });

  it('does not scroll a set the dials already hold', () => {
    mount(many(5));
    jog(2);
    expect(strip().props.style['--move-offset']).toBe(0);
  });

  it('walks the window from the keyboard and reads out where it is', () => {
    mount(many(20));
    expect(rail().props['aria-label']).toBe('Slots 1–8 of 20');
    act(() => rail().props.onKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() }));
    expect(rail().props['aria-label']).toBe('Slots 2–9 of 20');
    act(() => rail().props.onKeyDown({ key: 'End', preventDefault: vi.fn() }));
    expect(rail().props['aria-label']).toBe('Slots 13–20 of 20');
    act(() => rail().props.onKeyDown({ key: 'Home', preventDefault: vi.fn() }));
    expect(rail().props['aria-valuenow']).toBe(0);
  });

  it('counts the readout in controls, not columns — a filter is one slot of two', () => {
    mount({ ...many(9), tone: { type: 'filter', default: { cutoff: 0.5, resonance: 0.2 } } });
    // 9 sliders + a 2-column filter = 11 columns, 10 controls. The first
    // window holds 8 columns, which is 8 of those controls.
    expect(rail().props['aria-label']).toBe('Slots 1–8 of 10');
    act(() => rail().props.onKeyDown({ key: 'End', preventDefault: vi.fn() }));
    expect(rail().props['aria-label']).toBe('Slots 4–10 of 10');   /* the filter is in view */
  });

  it('turns the page from the Move arrows, eight slots at a time', () => {
    mount(many(20));
    expect(MoveFunctions.list()).toEqual(expect.arrayContaining(['left', 'right']));
    act(() => { MoveFunctions.run('right', { name: 'right', shift: false }); });
    expect(rail().props['aria-label']).toBe('Slots 9–16 of 20');
    act(() => { MoveFunctions.run('right', { name: 'right', shift: false }); });
    expect(rail().props['aria-label']).toBe('Slots 13–20 of 20');
    act(() => { MoveFunctions.run('left', { name: 'left', shift: false }); });
    expect(rail().props['aria-label']).toBe('Slots 5–12 of 20');
  });

  it('leaves the arrows alone when the app has already wired them', () => {
    const mine = vi.fn();
    const detach = MoveFunctions.attach('right', mine);
    mount(many(20));
    act(() => { MoveFunctions.run('right', { name: 'right', shift: false }); });
    expect(mine).toHaveBeenCalledOnce();
    expect(rail().props['aria-label']).toBe('Slots 1–8 of 20');
    detach();
  });

  it('pages from the keyboard with shift and the page keys', () => {
    mount(many(20));
    act(() => rail().props.onKeyDown({ key: 'ArrowRight', shiftKey: true, preventDefault: vi.fn() }));
    expect(rail().props['aria-label']).toBe('Slots 9–16 of 20');
    act(() => rail().props.onKeyDown({ key: 'PageUp', preventDefault: vi.fn() }));
    expect(rail().props['aria-label']).toBe('Slots 1–8 of 20');
  });

  it('tells the bridge which columns the dials now hold', () => {
    const seen: Record<string, unknown>[] = [];
    window.addEventListener(MOVE_STRIP_EVENT, (e) => seen.push((e as CustomEvent).detail));
    mount(many(20));
    jog(2);
    const { pads, ...window8 } = seen.at(-1)!;
    expect(window8).toEqual({
      pageId: id,
      offset: 2,
      columns: [2, 3, 4, 5, 6, 7, 8, 9],
      paths: ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'],
    });
    // No pads on this page: the rows go out empty rather than absent, so the
    // hardware's pads go dark instead of keeping the last page's.
    expect(pads).toEqual({
      toggles: Array(8).fill(null),
      values: Array(8).fill(null),
      actions: Array(8).fill(null),
    });
  });

  it('leaves the ordinary page alone — past the dials, values still become chips', () => {
    mount(many(12), false);
    expect(byClass('tweakers-move-rail')).toHaveLength(0);
    expect(pads().length).toBeGreaterThan(0);
  });
});

describe('small slots on the strip', () => {
  const withPads = () => mount(
    {
      ...many(10),
      sync: false,
      drive: { type: 'slider', min: 0, max: 1, default: 0.4 },
      clear: { type: 'action', onClick: () => {} },
    } as TweakConfig,
    true,
    { movePads: { sync: 2, drive: 2, clear: 5 } }
  );

  it('carries the pad rows, each cell under the slot it belongs to', () => {
    withPads();
    expect(padTitles()).toEqual(expect.arrayContaining(['Sync', 'Drive', 'Clear']));
    // A switch takes the first pad row, a value the second, a button the one
    // under those — the same three rows the hardware has.
    const rows = byClass('tweakers-move-pads');
    expect(rows).toHaveLength(3);
  });

  it('keeps a padded control out of the slot row — it is a pad, not both', () => {
    withPads();
    expect(labels()).not.toContain('Sync');
    expect(labels()).not.toContain('Drive');
    expect(labels()).toHaveLength(10);
  });

  it('tells the bridge where the pads are, so the hardware lights them', () => {
    const seen: Record<string, unknown>[] = [];
    window.addEventListener(MOVE_STRIP_EVENT, (e) => seen.push((e as CustomEvent).detail));
    withPads();
    const pads = seen.at(-1)!.pads as Record<string, (string | null)[]>;
    expect(pads.toggles[2]).toBe('sync');
    expect(pads.values[2]).toBe('drive');
    expect(pads.actions[5]).toBe('clear');
    // Scrolled on, they ride to the columns their slots moved to.
    jog(2);
    const moved = seen.at(-1)!.pads as Record<string, (string | null)[]>;
    expect(moved.toggles[0]).toBe('sync');
    expect(moved.actions[3]).toBe('clear');
  });

  it('scrolls the pads with the slots — one strip, one window', () => {
    withPads();
    // The pad rows live inside the translated strip, so they move with it.
    expect(strip().findAll((n) => n.props.className === 'tweakers-move-pads')).toHaveLength(3);
    // Ten slots against eight dials: the window stops two along.
    jog(3);
    expect(strip().props.style['--move-offset']).toBe(2);
  });
});
