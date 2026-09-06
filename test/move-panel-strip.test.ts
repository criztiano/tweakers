import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel, MOVE_JOG_EVENT, MOVE_STRIP_EVENT } from '../src/components/MovePanel';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';
import { MOVE_DIALS } from '../src/move-layout';
import { MoveFunctions } from '../src/move-functions';

let renderer: ReactTestRenderer | undefined;
const id = 'move-strip-panel';

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

/** Twenty sliders — two and a half screens of dials. */
const many = (count: number): TweakConfig =>
  Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`p${i}`, { type: 'slider', min: 0, max: 1, default: 0.5 }])
  ) as TweakConfig;

function mount(config: TweakConfig, scroll = true, options?: { movePads?: Record<string, number> }) {
  TweakStore.registerPanel(id, 'Strip', config, undefined, options);
  act(() => {
    renderer = create(createElement(MovePanel, {
      panels: 'Strip', dock: 'flow', productionEnabled: true, scroll,
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
