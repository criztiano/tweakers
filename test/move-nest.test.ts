import { createElement } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { MoveFunctions } from '../src/move-functions';
import { TweakStore, type ControlMeta, type TweakConfig } from '../src/store/TweakStore';
import {
  buildMovePages, movePadRows, moveNestChildren, visibleColumns, setMoveLayoutReporter, MOVE_DIALS, type MoveLayoutIssueCode,
} from '../src/move-layout';
import { buildMoveStrip } from '../src/move-strip';
import { MOVE_DOUBLE_TAP_MS, moveIsDoubleTap, moveTapMark, moveTapTravel } from '../src/move-slot-core';

const id = 'move-nest';
const slider = (extra: Record<string, unknown> = {}) => ({ type: 'slider', default: 0.5, min: 0, max: 1, step: 0.01, ...extra });

/** A text effect's page: Dispersion has more to it than one dial holds. */
const config: TweakConfig = {
  amount: slider(),
  curve: { type: 'select', default: 'ease', options: ['linear', 'ease', 'snap'] },
  dispersion: slider(),
  spread: slider({ moveNest: 'dispersion' }),
  angle: slider({ moveNest: 'dispersion' }),
  chaos: { type: 'select', default: 'calm', options: ['calm', 'wild'], moveNest: 'dispersion' },
  blur: slider(),
} as TweakConfig;

const issues: [MoveLayoutIssueCode, string][] = [];
beforeEach(() => {
  issues.length = 0;
  setMoveLayoutReporter((code, message) => issues.push([code, message]));
});
afterEach(() => {
  setMoveLayoutReporter(null);
  TweakStore.unregisterPanel(id);
});

const page = (cfg: TweakConfig = config, options?: Record<string, unknown>) => {
  TweakStore.registerPanel(id, id, cfg, undefined, options);
  return buildMovePages([TweakStore.getPanel(id)!])[0];
};
const paths = (metas: (ControlMeta | undefined)[]) => metas.map((m) => m?.path);

describe('a dial’s nested layer: the layout', () => {
  it('drops the children from the page and seats them behind their dial, in order', () => {
    const p = page();
    expect(paths(p.dials)).toEqual(['amount', 'curve', 'dispersion', 'blur']);
    expect(visibleColumns(p)).toEqual([0, 1, 2, 3]);
    expect(paths(moveNestChildren(p, 'dispersion'))).toEqual(['spread', 'angle', 'chaos']);
    expect(Object.keys(p.nested ?? {})).toEqual(['dispersion']);
    expect(moveNestChildren(p, 'blur')).toEqual([]);
    expect(issues).toEqual([]);
  });

  it('threads moveNest from any config onto its control', () => {
    page();
    const controls = TweakStore.getPanel(id)!.controls;
    expect(controls.find((c) => c.path === 'chaos')?.moveNest).toBe('dispersion');
    expect(controls.find((c) => c.path === 'dispersion')?.moveNest).toBeUndefined();
  });

  it('keeps a child off the pads even when the dials are full — it is not an overflow chip', () => {
    const full = Object.fromEntries(Array.from({ length: MOVE_DIALS }, (_, i) => [`d${i}`, slider()]));
    const p = page({ ...full, extra: slider({ moveNest: 'd2' }) } as TweakConfig);
    expect(p.dials).toHaveLength(MOVE_DIALS);
    expect(movePadRows(p, 0).flat().filter(Boolean)).toEqual([]);
    expect(paths(moveNestChildren(p, 'd2'))).toEqual(['extra']);
  });

  it('names its dial the way moveSlotGroups does — by path, folder and all', () => {
    const p = page({ fx: { dispersion: slider(), spread: slider({ moveNest: 'fx.dispersion' }) } } as TweakConfig);
    expect(paths(p.dials)).toEqual(['fx.dispersion']);
    expect(paths(moveNestChildren(p, 'fx.dispersion'))).toEqual(['fx.spread']);
  });

  it('says so, and shows nothing, when the named dial is not on the page', () => {
    const p = page({
      amount: slider(),
      lost: slider({ moveNest: 'nowhere' }),
      jitter: slider({ moveChip: true }),
      onChip: slider({ moveNest: 'jitter' }),
      deeper: slider({ moveNest: 'lost' }),
    } as TweakConfig, { movePads: { jitter: 0 } });
    expect(paths(p.dials)).toEqual(['amount']);
    expect(p.nested).toBeUndefined();
    expect(movePadRows(p, 0).flat().filter(Boolean).map((m) => m.path)).toEqual(['jitter']);
    expect(issues.map(([code]) => code)).toEqual(['nest-no-parent', 'nest-no-parent', 'nest-no-parent']);
    expect(issues[0][1]).toBe("panel 'move-nest': control 'lost' names moveNest 'nowhere', and there is no such control — not shown");
    expect(issues[1][1]).toBe("panel 'move-nest': control 'onChip' names moveNest 'jitter', which holds no dial on the page — not shown");
  });

  it('holds only what can be a big slot, and only eight columns of it', () => {
    const kids = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`k${i}`, slider({ moveNest: 'amount' })]));
    const p = page({
      amount: slider(),
      go: { type: 'action', label: 'Go', moveNest: 'amount' },
      onOff: { type: 'toggle', default: false, moveNest: 'amount' },
      ...kids,
    } as TweakConfig);
    expect(paths(moveNestChildren(p, 'amount'))).toEqual(['onOff', 'k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6']);
    expect(issues.map(([code]) => code)).toEqual(['nest-not-a-slot', 'nest-full']);
  });

  it('leaves the endless strip alone: it has room for every slot', () => {
    TweakStore.registerPanel(id, id, config);
    const strip = buildMoveStrip(TweakStore.getPanel(id)!);
    expect(strip.nested).toBeUndefined();
    expect(paths(strip.dials)).toContain('spread');
  });
});

describe('the double tap', () => {
  const at = (clientX: number, clientY = 0) => ({ clientX, clientY, shiftKey: false });

  it('is two still presses on one dial, close together', () => {
    const mark = moveTapMark('dispersion', at(10), 1000, 0.5);
    expect(moveIsDoubleTap(mark, 'dispersion', 1000 + MOVE_DOUBLE_TAP_MS)).toBe(true);
    expect(moveIsDoubleTap(mark, 'dispersion', 1001 + MOVE_DOUBLE_TAP_MS)).toBe(false);
    expect(moveIsDoubleTap(mark, 'blur', 1100)).toBe(false);
    expect(moveIsDoubleTap(null, 'dispersion', 1100)).toBe(false);
  });

  it('never follows a drag', () => {
    const mark = moveTapMark('dispersion', at(10), 1000, 0.5);
    moveTapTravel(mark, at(11));
    expect(moveIsDoubleTap(mark, 'dispersion', 1100)).toBe(true);
    moveTapTravel(mark, at(20));
    expect(moveIsDoubleTap(mark, 'dispersion', 1100)).toBe(false);
  });
});

describe('a dial’s nested layer: the panel', () => {
  let renderer: ReactTestRenderer | undefined;
  beforeEach(() => vi.stubGlobal('window', new EventTarget()));
  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    vi.unstubAllGlobals();
  });

  // The dial row is 4 columns of 100 with 4px gaps; a cell knows its column
  // by where it stands along it.
  const cell = (col: number) => ({ getBoundingClientRect: () => ({ left: col * 104, top: 0, width: 100, height: 140 }) });
  const row = { contains: () => true, querySelectorAll: () => [], getBoundingClientRect: () => ({ left: 0, top: 0, width: 412, height: 140 }) };
  const press = (col: number, timeStamp: number) => ({
    button: 0, buttons: 1, clientX: col * 104 + 50, clientY: 70, shiftKey: false, timeStamp, pointerId: 1,
    target: { closest: () => cell(col) },
    currentTarget: { setPointerCapture: () => {}, querySelector: () => null, querySelectorAll: () => [], getBoundingClientRect: () => cell(col).getBoundingClientRect() },
    stopPropagation: vi.fn(), preventDefault: vi.fn(),
  });

  const mount = () => {
    TweakStore.registerPanel(id, 'Text', config);
    act(() => {
      renderer = create(createElement(MovePanel, { panels: 'Text', dock: 'flow', productionEnabled: true }), {
        createNodeMock: (el) => (el.props.className === 'tweakers-move-dials' ? row : null),
      });
    });
    return renderer!.root;
  };
  const dials = (root: ReactTestInstance) => root.find((n) => n.props.className === 'tweakers-move-dials');
  const sheet = (root: ReactTestInstance) => root.findAll((n) => n.props.className === 'tweakers-move-nest-sheet');
  const enumDial = (root: ReactTestInstance) => root.find((n) => n.type === 'div' && n.props['aria-label'] === 'Curve' && n.props.role === 'slider');

  it('marks the dial that has more inside, and only that one', () => {
    const root = mount();
    const marks = root.findAll((n) => n.props.className === 'tweakers-move-nest-mark');
    expect(marks.map((m) => m.props.style.gridColumn)).toEqual(['3 / span 1']);
  });

  it('opens on a double tap, and swallows the second press whole', () => {
    const root = mount();
    act(() => dials(root).props.onPointerDownCapture(press(2, 1000)));
    act(() => dials(root).props.onPointerUpCapture(press(2, 1050)));
    const second = press(2, 1200);
    act(() => dials(root).props.onPointerDownCapture(second));
    expect(second.stopPropagation).toHaveBeenCalled();
    expect(sheet(root)).toHaveLength(1);
    expect(root.find((n) => n.props.className === 'tweakers-move-nest-back').findAll((n) => n.children.includes('Dispersion')).length).toBeGreaterThan(0);
    const click = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    act(() => dials(root).props.onClickCapture(click));
    expect(click.stopPropagation).toHaveBeenCalled();
    // and the next click is the dial's again
    const next = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    act(() => dials(root).props.onClickCapture(next));
    expect(next.stopPropagation).not.toHaveBeenCalled();
  });

  it('puts back what the first tap changed — an option stepped on the way', () => {
    const root = mount();
    // the Curve dial is an option slot: a still click moves it on, so give it the layer
    TweakStore.updatePanel(id, 'Text', { ...config, spread: slider({ moveNest: 'curve' }) } as TweakConfig);
    act(() => dials(root).props.onPointerDownCapture(press(1, 1000)));
    act(() => enumDial(root).props.onPointerDown(press(1, 1000)));
    act(() => enumDial(root).props.onPointerUp(press(1, 1040)));
    expect(TweakStore.getValues(id).curve).toBe('snap');
    act(() => dials(root).props.onPointerDownCapture(press(1, 1200)));
    expect(TweakStore.getValues(id).curve).toBe('ease');
    expect(sheet(root)).toHaveLength(1);
  });

  it('does not open on two taps too far apart, or on a dial with nothing inside', () => {
    const root = mount();
    act(() => dials(root).props.onPointerDownCapture(press(2, 1000)));
    act(() => dials(root).props.onPointerDownCapture(press(2, 1000 + MOVE_DOUBLE_TAP_MS + 1)));
    act(() => dials(root).props.onPointerDownCapture(press(3, 2000)));
    act(() => dials(root).props.onPointerDownCapture(press(3, 2100)));
    expect(sheet(root)).toHaveLength(0);
  });

  it('opens on Enter, takes Back while it stands, and closes from its back tab', () => {
    const root = mount();
    const key = { key: 'Enter', repeat: false, target: { closest: () => cell(2) }, stopPropagation: vi.fn(), preventDefault: vi.fn() };
    act(() => dials(root).props.onKeyDownCapture(key));
    expect(key.preventDefault).toHaveBeenCalled();
    expect(sheet(root)).toHaveLength(1);
    expect(MoveFunctions.list()).toContain('back');
    act(() => root.find((n) => n.props.className === 'tweakers-move-nest-back').props.onClick());
    expect(sheet(root)).toHaveLength(0);
    expect(MoveFunctions.list()).not.toContain('back');
  });

  it('closes when the dial leaves the page', () => {
    const root = mount();
    act(() => dials(root).props.onPointerDownCapture(press(2, 1000)));
    act(() => dials(root).props.onPointerDownCapture(press(2, 1200)));
    expect(sheet(root)).toHaveLength(1);
    const { dispersion: _gone, ...rest } = config as Record<string, unknown>;
    act(() => TweakStore.updatePanel(id, 'Text', rest as TweakConfig));
    expect(sheet(root)).toHaveLength(0);
  });
});
