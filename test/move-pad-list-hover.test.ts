import { createElement, useSyncExternalStore } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePadList } from '../src/components/MovePadList';
import { MovePadListStore } from '../src/move-pad-list';
import { MOVE_PANEL_SETTINGS } from '../src/move-track-labels';
import { TweakStore } from '../src/store/TweakStore';

let renderer: ReactTestRenderer | undefined;
let release: (() => void) | undefined;
const onSubmit = vi.fn();
beforeEach(() => vi.stubGlobal('window', new EventTarget()));
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  release?.();
  MovePadListStore.close();
  TweakStore.unregisterPanel(MOVE_PANEL_SETTINGS);
  onSubmit.mockReset();
  vi.unstubAllGlobals();
});

function Pad() {
  const view = useSyncExternalStore(MovePadListStore.subscribe, MovePadListStore.getView, MovePadListStore.getView);
  return createElement(MovePadList, { panelId: 'page', path: 'add', label: 'Add effect', view, disabled: false });
}
const mount = (hand: boolean) => {
  TweakStore.registerPanel(MOVE_PANEL_SETTINGS, 'Panel', { steerHand: { type: 'toggle', default: hand } });
  release = MovePadListStore.attach('page', 'add', {
    label: 'Add effect', single: true,
    options: [{ value: 'blur', label: 'Blur' }, { value: 'glow', label: 'Glow' }], onSubmit,
  });
  act(() => { renderer = create(createElement(Pad)); });
};
const anchor = () => renderer!.root.find((n) => n.props.className === 'tweakers-move-pad-list-anchor');
const pad = () => anchor().find((n) => n.type === 'button' && n.props['data-kind'] === 'list');
const rows = () => anchor().findAll((n) => n.type === 'button' && n.props.role === 'option');
const mouse = { pointerType: 'mouse' };

describe('a picker pad under a free pointer', () => {
  it('opens on hover and closes when the pointer leaves', () => {
    mount(false);
    act(() => anchor().props.onPointerEnter(mouse));
    expect(MovePadListStore.getView()?.path).toBe('add');
    expect(anchor().props['data-hover-open']).toBe(true);
    act(() => anchor().props.onPointerLeave(mouse));
    expect(MovePadListStore.getView()).toBeNull();
  });

  it('takes the row a click lands on; the pad itself takes none', async () => {
    mount(false);
    act(() => anchor().props.onPointerEnter(mouse));
    act(() => pad().props.onClick());
    expect(onSubmit).not.toHaveBeenCalled();
    await act(async () => { rows()[1].props.onClick(); });
    expect(onSubmit).toHaveBeenCalledWith(['glow']);
  });

  it('stays shut under the steering hand, and for a finger', () => {
    mount(true);
    act(() => anchor().props.onPointerEnter(mouse));
    expect(MovePadListStore.getView()).toBeNull();
    act(() => { TweakStore.updateValue(MOVE_PANEL_SETTINGS, 'steerHand', false); });
    act(() => anchor().props.onPointerEnter({ pointerType: 'touch' }));
    expect(MovePadListStore.getView()).toBeNull();
  });

  it('keeps a list a press opened when the pointer leaves', () => {
    mount(false);
    act(() => pad().props.onClick());
    act(() => anchor().props.onPointerLeave(mouse));
    expect(MovePadListStore.getView()?.path).toBe('add');
  });
});
