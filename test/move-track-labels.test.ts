import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { LUCIDE_ICONS } from '../src/icons';
import { MOVE_PANEL_SETTINGS, moveTrackIcon, moveTrackLabelStyle } from '../src/move-track-labels';
import { TweakStore } from '../src/store/TweakStore';

// A page can wear a picture on the track row. Once one does, the kit's Panel
// page in the settings room chooses how the row reads — name, picture and
// name, or picture alone — and with no picture on the row the choice stands
// greyed out and names it is.

let renderer: ReactTestRenderer | undefined;

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  TweakStore.unregisterPanel('labels-a');
  TweakStore.unregisterPanel('labels-b');
  TweakStore.updateValue(MOVE_PANEL_SETTINGS, 'trackLabels', 'both');
  vi.unstubAllGlobals();
});

const mountPanel = (iconA?: string) => {
  TweakStore.registerPanel('labels-a', 'Alpha', { level: [0.5, 0, 1] }, undefined, { icon: iconA });
  TweakStore.registerPanel('labels-b', 'Beta', { level: [0.5, 0, 1] });
  act(() => {
    renderer = create(createElement(MovePanel, { panels: ['labels-a', 'labels-b'], dock: 'flow', productionEnabled: true }));
  });
};
const tracks = () => renderer!.root.findAll((n) => n.type === 'button' && n.props.className === 'tweakers-move-track');
const icons = (track: ReturnType<typeof tracks>[number]) =>
  track.findAll((n) => n.type === 'svg' && n.props.className === 'tweakers-move-track-icon');
const label = (track: ReturnType<typeof tracks>[number]) =>
  track.find((n) => n.type === 'span' && n.props.className === 'tweakers-move-track-label');

describe('track labels', () => {
  it('reads a known picture and ignores an unknown one', () => {
    expect(moveTrackIcon({ icon: 'waves' })).toBe('waves');
    expect(moveTrackIcon({ icon: 'no-such-icon' })).toBeUndefined();
    expect(moveTrackIcon({})).toBeUndefined();
  });

  it('shows names while no page carries a picture, whatever the setting', () => {
    expect(moveTrackLabelStyle({ trackLabels: 'icon' }, false)).toBe('name');
    expect(moveTrackLabelStyle({ trackLabels: 'icon' }, true)).toBe('icon');
    expect(moveTrackLabelStyle({}, true)).toBe('both');
  });

  it('draws the picture beside the name, and greys the choice out without one', () => {
    mountPanel('waves');
    const [a, b] = tracks();
    expect(icons(a)).toHaveLength(1);
    expect(icons(a)[0].findAllByType('path')).toHaveLength(LUCIDE_ICONS.waves.length);
    expect(label(a).props['data-hidden']).toBeUndefined();
    expect(icons(b)).toHaveLength(0);
    expect(TweakStore.isDisabled(MOVE_PANEL_SETTINGS, 'trackLabels')).toBe(false);

    act(() => renderer!.unmount());
    renderer = undefined;
    TweakStore.unregisterPanel('labels-a');
    mountPanel();
    expect(tracks().flatMap(icons)).toHaveLength(0);
    expect(TweakStore.isDisabled(MOVE_PANEL_SETTINGS, 'trackLabels')).toBe(true);
  });

  it('follows the Panel page: picture alone keeps the name for readers', () => {
    mountPanel('waves');
    act(() => TweakStore.updateValue(MOVE_PANEL_SETTINGS, 'trackLabels', 'icon'));
    const [a, b] = tracks();
    expect(icons(a)).toHaveLength(1);
    expect(label(a).props['data-hidden']).toBe(true);
    expect(a.props.title).toBe('Alpha');
    // A page with no picture keeps its name on show.
    expect(label(b).props['data-hidden']).toBeUndefined();

    act(() => TweakStore.updateValue(MOVE_PANEL_SETTINGS, 'trackLabels', 'name'));
    expect(icons(tracks()[0])).toHaveLength(0);
  });
});
