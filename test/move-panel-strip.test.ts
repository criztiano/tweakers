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

function mount(config: TweakConfig, scroll = true) {
  TweakStore.registerPanel(id, 'Strip', config);
  act(() => {
    renderer = create(createElement(MovePanel, {
      panels: 'Strip', dock: 'flow', productionEnabled: true, scroll,
    }));
  });
}

const byClass = (className: string) =>
  renderer!.root.findAll((n) => n.props.className === className);
const dials = () => byClass('tweakers-move-dials')[0];
const dots = () => byClass('tweakers-move-dots')[0];
const dotList = () => byClass('tweakers-move-dot');
const labels = () =>
  byClass('tweakers-move-dial-label').map((n) => n.props.children as string);
const jog = (delta: number) => {
  act(() => { window.dispatchEvent(new CustomEvent(MOVE_JOG_EVENT, { detail: { delta } })); });
};

describe('the scrolling panel', () => {
  it('keeps every control at slot size instead of demoting the overflow', () => {
    mount(many(20));
    expect(labels()).toHaveLength(20);
    expect(byClass('tweakers-move-pad')).toHaveLength(0);
    expect(dials().props.style['--move-strip-len']).toBe(20);
  });

  it('shows eight dots — one per dial, naming the control it holds', () => {
    mount(many(20));
    expect(dotList()).toHaveLength(MOVE_DIALS);
    expect(dotList().map((d) => d.props.title)).toEqual([
      'Dial 1 — P0', 'Dial 2 — P1', 'Dial 3 — P2', 'Dial 4 — P3',
      'Dial 5 — P4', 'Dial 6 — P5', 'Dial 7 — P6', 'Dial 8 — P7',
    ]);
  });

  it('darkens the dots the strip has run out for', () => {
    mount(many(3));
    expect(dotList().map((d) => d.props['data-on'])).toEqual([
      true, true, true, undefined, undefined, undefined, undefined, undefined,
    ]);
  });

  it('moves the window one control per wheel detent, and says which are live', () => {
    mount(many(20));
    expect(dials().props.style['--move-offset']).toBe(0);
    jog(3);
    expect(dials().props.style['--move-offset']).toBe(3);
    expect(dotList()[0].props.title).toBe('Dial 1 — P3');
    jog(-1);
    expect(dials().props.style['--move-offset']).toBe(2);
  });

  it('stops at both ends of the set', () => {
    mount(many(20));
    jog(-5);
    expect(dials().props.style['--move-offset']).toBe(0);
    jog(99);
    expect(dials().props.style['--move-offset']).toBe(12);   /* 20 slots − 8 dials */
  });

  it('does not scroll a set the dials already hold', () => {
    mount(many(5));
    jog(2);
    expect(dials().props.style['--move-offset']).toBe(0);
  });

  it('walks the window from the keyboard and reads out where it is', () => {
    mount(many(20));
    expect(dots().props['aria-label']).toBe('Slots 1–8 of 20');
    act(() => dots().props.onKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() }));
    expect(dots().props['aria-label']).toBe('Slots 2–9 of 20');
    act(() => dots().props.onKeyDown({ key: 'End', preventDefault: vi.fn() }));
    expect(dots().props['aria-label']).toBe('Slots 13–20 of 20');
    act(() => dots().props.onKeyDown({ key: 'Home', preventDefault: vi.fn() }));
    expect(dots().props['aria-valuenow']).toBe(0);
  });

  it('counts the readout in controls, not columns — a filter is one slot of two', () => {
    mount({ ...many(9), tone: { type: 'filter', default: { cutoff: 0.5, resonance: 0.2 } } });
    // 9 sliders + a 2-column filter = 11 columns, 10 controls. The first
    // window holds 8 columns, which is 8 of those controls.
    expect(dots().props['aria-label']).toBe('Slots 1–8 of 10');
    act(() => dots().props.onKeyDown({ key: 'End', preventDefault: vi.fn() }));
    expect(dots().props['aria-label']).toBe('Slots 4–10 of 10');   /* the filter is in view */
  });

  it('turns the page from the Move arrows, eight slots at a time', () => {
    mount(many(20));
    expect(MoveFunctions.list()).toEqual(expect.arrayContaining(['left', 'right']));
    act(() => { MoveFunctions.run('right', { name: 'right', shift: false }); });
    expect(dots().props['aria-label']).toBe('Slots 9–16 of 20');
    act(() => { MoveFunctions.run('right', { name: 'right', shift: false }); });
    expect(dots().props['aria-label']).toBe('Slots 13–20 of 20');
    act(() => { MoveFunctions.run('left', { name: 'left', shift: false }); });
    expect(dots().props['aria-label']).toBe('Slots 5–12 of 20');
  });

  it('leaves the arrows alone when the app has already wired them', () => {
    const mine = vi.fn();
    const detach = MoveFunctions.attach('right', mine);
    mount(many(20));
    act(() => { MoveFunctions.run('right', { name: 'right', shift: false }); });
    expect(mine).toHaveBeenCalledOnce();
    expect(dots().props['aria-label']).toBe('Slots 1–8 of 20');
    detach();
  });

  it('pages from the keyboard with shift and the page keys', () => {
    mount(many(20));
    act(() => dots().props.onKeyDown({ key: 'ArrowRight', shiftKey: true, preventDefault: vi.fn() }));
    expect(dots().props['aria-label']).toBe('Slots 9–16 of 20');
    act(() => dots().props.onKeyDown({ key: 'PageUp', preventDefault: vi.fn() }));
    expect(dots().props['aria-label']).toBe('Slots 1–8 of 20');
  });

  it('tells the bridge which columns the dials now hold', () => {
    const seen: unknown[] = [];
    window.addEventListener(MOVE_STRIP_EVENT, (e) => seen.push((e as CustomEvent).detail));
    mount(many(20));
    jog(2);
    expect(seen.at(-1)).toEqual({
      pageId: id,
      offset: 2,
      columns: [2, 3, 4, 5, 6, 7, 8, 9],
      paths: ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'],
    });
  });

  it('leaves the ordinary page alone — past the dials, values still become chips', () => {
    mount(many(12), false);
    expect(byClass('tweakers-move-dots')).toHaveLength(0);
    expect(byClass('tweakers-move-pad').length).toBeGreaterThan(0);
  });
});
