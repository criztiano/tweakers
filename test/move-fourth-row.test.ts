import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { MovePadList } from '../src/components/MovePadList';
import { MOVE_PAD_LIBRARY, MoveOffsetRoom, MovePadCurveBody, MovePadOffsetBody } from '../src/components/move-slots';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

const id = 'fourth-row';
let renderer: ReactTestRenderer | undefined;
beforeEach(() => vi.stubGlobal('window', new EventTarget()));
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

/** Eight dials, so the rest land on the pads. */
const dials = Object.fromEntries(
  Array.from({ length: 8 }, (_, i) => [`d${i}`, { type: 'slider', min: 0, max: 1, default: 0.5 }]),
) as TweakConfig;
const config: TweakConfig = {
  ...dials,
  side: { type: 'select', default: 'in', moveTabs: true, options: ['in', 'out', 'set'] },
  autoPlay: false,
  playIn: { type: 'action', label: 'In' },
  curve: { type: 'action', label: 'Curve: Snappy', face: { kind: 'curve', points: [0, 0.8, 1] } },
};
const pads = { side: 0, autoPlay: 5, playIn: 6, curve: 1 };

const mount = (options: Record<string, unknown>) => {
  TweakStore.registerPanel(id, 'Rows', config, undefined, { movePads: pads, ...options });
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Rows', dock: 'flow', productionEnabled: true })); });
  return renderer!.root;
};
const rows = (root: ReactTestRenderer['root']) =>
  root.findAll((n) => typeof n.type === 'string' && n.props['data-pad-row'] !== undefined).map((n) => n.props['data-pad-row']);

describe('the fourth pad row on screen', () => {
  it('draws the row only when the page puts something on it', () => {
    expect(rows(mount({ moveTopRow: ['curve'] }))).toEqual([0, 2]);
    act(() => renderer?.unmount());
    expect(rows(mount({ moveTopRow: ['curve'], moveBottomRow: ['side', 'autoPlay', 'playIn'] }))).toEqual([0, 3]);
  });

  it('keeps a switch a switch there: a press flips it', () => {
    const root = mount({ moveBottomRow: ['side', 'autoPlay', 'playIn'] });
    const row = root.find((n) => typeof n.type === 'string' && n.props['data-pad-row'] === 3);
    const pad = row.find((n) => typeof n.type === 'string' && n.props['data-kind'] === 'toggle');
    act(() => pad.props.onClick());
    expect(TweakStore.getValues(id).autoPlay).toBe(true);
    expect(row.findAll((n) => n.props.role === 'tab')).toHaveLength(3);
  });
});

describe('an action wearing a face', () => {
  it('draws the face, keeps its name as the accessible name and tip, and still runs', () => {
    const root = mount({});
    const pad = root.find((n) => typeof n.type === 'string' && n.props['data-face'] === 'curve');
    expect(pad.props['data-kind']).toBe('action');
    expect([pad.props['aria-label'], pad.props.title]).toEqual(['Curve: Snappy', 'Curve: Snappy']);
    expect(pad.findAll((n) => n.props.className === 'tweakers-move-pad-title')).toHaveLength(0);
    const ran = vi.fn();
    const off = TweakStore.subscribeActions(id, ran);
    act(() => pad.props.onClick());
    off();
    expect(ran).toHaveBeenCalledWith('curve');
  });

  it('leaves a button with no face exactly as it was', () => {
    const root = mount({});
    const pad = root.find((n) => typeof n.type === 'string' && n.props['data-kind'] === 'action' && n.props['data-face'] === undefined);
    expect([pad.props['aria-label'], pad.props.title]).toEqual([undefined, undefined]);
    expect(pad.find((n) => n.props.className === 'tweakers-move-pad-title').props.children).toBe('In');
  });

  it('wears it on a menu pad too', () => {
    const html = renderToStaticMarkup(createElement(MovePadList, {
      panelId: id, path: 'curve', label: 'Curve: Snappy', view: null, disabled: false,
      face: { kind: 'offset', origin: 0.5, position: 0.7, back: true, forward: true },
    }));
    expect(html).toContain('data-face="offset"');
    expect(html).toContain('aria-label="Curve: Snappy"');
    expect(html).toContain('tweakers-move-offset');
  });

  it('is drawn by the big faces’ own parts', () => {
    expect(MOVE_PAD_LIBRARY.curve.component).toBe(MovePadCurveBody);
    expect(MOVE_PAD_LIBRARY.offset.component).toBe(MovePadOffsetBody);
    const curve = renderToStaticMarkup(createElement(MovePadCurveBody, { d: 'M 0 100 L 100 0' }));
    expect(curve).toContain('class="tweakers-move-dial-tile tweakers-move-dial-rest"');
    expect(curve).toContain('tweakers-move-dial-dots');
    const room = { origin: 0.5, position: 0.25, back: true, forward: true };
    expect(renderToStaticMarkup(createElement(MovePadOffsetBody, room))).toBe(renderToStaticMarkup(createElement(MoveOffsetRoom, room)));
  });
});

describe('a chip wearing the offset face', () => {
  it('draws the room at pad size, stays a scrubbable value chip, and keeps its reading as the tip', () => {
    TweakStore.registerPanel(id, 'Rows', {
      ...dials,
      nudge: { type: 'slider', min: -0.5, max: 0.5, step: 0.01, default: 0.25, unit: 's', moveChip: true,
        moveVisual: { kind: 'offset', origin: 0.5 } },
    } as TweakConfig, undefined, { movePads: { nudge: 2 } });
    act(() => { renderer = create(createElement(MovePanel, { panels: 'Rows', dock: 'flow', productionEnabled: true })); });
    const pad = renderer!.root.find((n) => typeof n.type === 'string' && n.props['data-face'] === 'offset');
    expect(pad.props['data-kind']).toBe('value');
    expect(pad.props['data-scrub']).toBe(true);
    expect(pad.props.title).toMatch(/^Nudge: /);
    expect(pad.findAllByType(MoveOffsetRoom)).toHaveLength(1);
    expect(pad.findAll((n) => n.props.className === 'tweakers-move-pad-number')).toHaveLength(0);
  });
});
