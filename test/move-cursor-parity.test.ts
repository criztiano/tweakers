import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MovePanel } from '../src/components/MovePanel';
import { MoveMenuButton } from '../src/components/MoveMenuButton';
import { MoveColorStore } from '../src/move-color';
import { MoveFunctions } from '../src/move-functions';
import { attachMoveKeys, moveKeyButton } from '../src/move-keys';
import { MovePadListStore } from '../src/move-pad-list';
import { TweakStore, type TweakConfig } from '../src/store/TweakStore';

// The Menu button portals to the window; the test renderer draws it in place.
vi.mock('react-dom', async (actual) => ({ ...(await actual<typeof import('react-dom')>()), createPortal: (node: unknown) => node }));

/* The cursor answers the panel the way the hand answers the Move: a drag
   turns a slot from where it is, an option slot steps on a click, a list
   walks down, a colour takes both hands, and Shift+click is Shift+tap. */

let renderer: ReactTestRenderer | undefined;
const id = 'move-cursor-parity';
const detach: (() => void)[] = [];

beforeEach(() => { vi.stubGlobal('window', new EventTarget()); });
afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  for (const off of detach.splice(0)) off();
  MoveColorStore.close();
  TweakStore.unregisterPanel(id);
  vi.unstubAllGlobals();
});

function mount(config: TweakConfig, options?: Parameters<typeof TweakStore.registerPanel>[3]) {
  TweakStore.registerPanel(id, 'Parity', config, undefined, options);
  act(() => { renderer = create(createElement(MovePanel, { panels: 'Parity', dock: 'flow', productionEnabled: true })); });
}
const values = () => TweakStore.getValues(id);
const target = { setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 140 }) };
const at = (clientX: number, clientY: number, shiftKey = false) => ({ clientX, clientY, shiftKey, button: 0, pointerId: 1, currentTarget: target });
type Slot = { props: Record<string, (e?: unknown) => void> };
const press = (slot: Slot, shiftKey = false) => {
  act(() => slot.props.onPointerDown(at(50, 50, shiftKey)));
  act(() => slot.props.onPointerUp(at(50, 50, shiftKey)));
};
const drag = (slot: Slot, dx: number, dy: number) => {
  act(() => slot.props.onPointerDown(at(50, 50)));
  act(() => slot.props.onPointerMove(at(50 + dx, 50 + dy)));
  act(() => slot.props.onPointerUp(at(50 + dx, 50 + dy)));
};
const slider = (label: string) => renderer!.root.findByProps({ role: 'slider', 'aria-label': label }) as unknown as Slot;

describe('a value slot under the cursor', () => {
  it('never jumps on a press, turns from where it is on either axis, and resets on Shift+click', () => {
    mount({ amount: { type: 'slider', min: 0, max: 1, default: 0.5, step: 0.01 } });
    press(slider('Amount'));
    expect(values().amount).toBe(0.5);
    drag(slider('Amount'), 20, 0);            // right raises: 20 of a 100px track
    expect(values().amount).toBe(0.7);
    drag(slider('Amount'), 0, 30);            // down lowers
    expect(values().amount).toBe(0.4);
    drag(slider('Amount'), 0, -10);           // up raises
    expect(values().amount).toBe(0.5);
    drag(slider('Amount'), 30, 0);
    press(slider('Amount'), true);             // Shift+click is the knob's Shift+tap
    expect(values().amount).toBe(0.5);
  });

  it('keeps the declared default for the reset, whatever the edits since', () => {
    mount({ amount: { type: 'slider', min: 0, max: 10, default: 3, step: 1 } });
    act(() => TweakStore.updateValue(id, 'amount', 9));
    expect(TweakStore.getDefault(id, 'amount')).toBe(3);
    press(slider('Amount'), true);
    expect(values().amount).toBe(3);
  });
});

describe('an option slot under the cursor', () => {
  const mode = { type: 'select', options: ['a', 'b', 'c'], default: 'a' } as const;

  it('moves on to the next option on a click, round to the first after the last', () => {
    mount({ mode });
    press(slider('Mode'));
    expect(values().mode).toBe('b');
    press(slider('Mode'));
    press(slider('Mode'));
    expect(values().mode).toBe('a');
  });

  it('steps with a drag — right or down is the next — and resets on Shift+click', () => {
    mount({ mode });
    drag(slider('Mode'), 50, 0);              // two detents
    expect(values().mode).toBe('c');
    drag(slider('Mode'), 0, -24);             // up is the one before
    expect(values().mode).toBe('b');
    press(slider('Mode'), true);
    expect(values().mode).toBe('a');
  });
});

describe('a list dial under the cursor', () => {
  it('walks the rows up and down, and a press alone keeps the cursor', () => {
    mount({ amount: [0.5, 0, 1], extract: { type: 'action' } }, { movePads: { extract: 0 } });
    detach.push(MovePadListStore.attach(id, 'extract', {
      label: 'Parts', submitLabel: 'Extract', onSubmit: () => {},
      options: ['a', 'b', 'c', 'd'].map((value) => ({ value, label: value })),
    }));
    act(() => MovePadListStore.open(id, 'extract'));
    const list = () => renderer!.root.findByProps({ 'data-pad-list-dial': 'true' }) as unknown as Slot;
    press(list());
    expect(MovePadListStore.getView()?.cursor).toBe(0);
    drag(list(), 0, 40);                       // down two rows
    expect(MovePadListStore.getView()?.cursor).toBe(2);
    drag(list(), 60, -16);                     // across does nothing; up one row
    expect(MovePadListStore.getView()?.cursor).toBe(1);
    act(() => MovePadListStore.close());
  });
});

describe('a colour slot under the cursor', () => {
  it('turns hue across and luminosity up and down, and restores its colour on Shift+click', () => {
    mount({ color: { type: 'color', default: '#ff0000', alpha: false } });
    const slot = () => renderer!.root.findByProps({ 'data-kind': 'color' }) as unknown as Slot;
    const width = { ...target, getBoundingClientRect: () => ({ width: 100 }) };
    act(() => slot().props.onPointerDown({ ...at(10, 50), currentTarget: width }));
    act(() => slot().props.onPointerMove({ ...at(10, 30), currentTarget: width }));
    act(() => slot().props.onPointerUp());
    expect(MoveColorStore.read(id, 'color').l).toBeCloseTo(0.7);
    expect(MoveColorStore.read(id, 'color').h).toBe(0);
    act(() => slot().props.onClick({ shiftKey: false }));    // the drag's own click is swallowed
    expect(MoveColorStore.getView()).toBeNull();
    act(() => slot().props.onClick({ shiftKey: true }));
    expect(values().color).toBe('#ff0000');
    expect(MoveColorStore.getView()).toBeNull();
  });
});

describe("the computer's keys for the editing buttons", () => {
  const key = (init: Partial<KeyboardEvent>) => {
    const event = new Event('keydown', { cancelable: true });
    for (const [k, v] of Object.entries({ metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...init })) {
      Object.defineProperty(event, k, { value: v });
    }
    return event as KeyboardEvent;
  };

  it('maps ⌘Z, ⌘C and Backspace/Delete to Undo, Copy and Delete', () => {
    expect(moveKeyButton(key({ key: 'z', metaKey: true }))).toBe('undo');
    expect(moveKeyButton(key({ key: 'Z', ctrlKey: true, shiftKey: true }))).toBe('undo');
    expect(moveKeyButton(key({ key: 'c', metaKey: true }))).toBe('copy');
    expect(moveKeyButton(key({ key: 'Backspace' }))).toBe('delete');
    expect(moveKeyButton(key({ key: 'Delete' }))).toBe('delete');
    expect(moveKeyButton(key({ key: 'Backspace', metaKey: true }))).toBeNull();
    expect(moveKeyButton(key({ key: 'z' }))).toBeNull();
  });

  it('runs what the button holds, and leaves a key alone when nothing is attached', () => {
    const release = attachMoveKeys();
    detach.push(release);
    const deleted = vi.fn();
    const undone = vi.fn();
    const backspace = key({ key: 'Backspace' });
    window.dispatchEvent(backspace);
    expect(backspace.defaultPrevented).toBe(false);
    detach.push(MoveFunctions.attach('delete', deleted), MoveFunctions.attach('undo', undone));
    window.dispatchEvent(key({ key: 'Backspace' }));
    window.dispatchEvent(key({ key: 'z', metaKey: true, shiftKey: true }));
    expect(deleted).toHaveBeenCalledOnce();
    expect(undone).toHaveBeenCalledWith(expect.objectContaining({ name: 'undo', shift: true }));
    // two panels ask, one listener answers
    const second = attachMoveKeys();
    window.dispatchEvent(key({ key: 'Delete' }));
    expect(deleted).toHaveBeenCalledTimes(2);
    second();
  });
});

describe('the Menu button on screen', () => {
  it('shows while Menu is attached and runs a click as a press, Shift+click as Shift', () => {
    vi.stubGlobal('document', { body: {} });
    const menu = vi.fn();
    detach.push(MoveFunctions.attach('menu', menu));
    let button: ReactTestRenderer | undefined;
    act(() => { button = create(createElement(MoveMenuButton, { theme: 'dark', open: false, label: 'Presets' }), { createNodeMock: () => ({}) }); });
    const el = button!.root.findByProps({ className: 'tweakers-move-menu-button' });
    expect(el.props['aria-label']).toBe('Presets');
    act(() => el.props.onPointerDown({ button: 0 }));
    act(() => el.props.onPointerUp({ shiftKey: false }));
    act(() => el.props.onPointerDown({ button: 0 }));
    act(() => el.props.onPointerUp({ shiftKey: true }));
    expect(menu.mock.calls.map(([p]) => [p.shift, p.hold])).toEqual([[false, false], [true, false]]);
    act(() => button!.unmount());
  });
});

describe('the curve modulator under the cursor', () => {
  it("takes a still click on its shape dial as the knob's tap: the clip moves to its next shape", async () => {
    const { ModulationStore } = await import('../src/store/ModulationStore');
    // the settings page's live scope and composer tick on frames
    Object.assign(window, { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} });
    vi.stubGlobal('requestAnimationFrame', () => 0);
    vi.stubGlobal('cancelAnimationFrame', () => {});
    mount({ amount: [0.5, 0, 1] });
    act(() => { ModulationStore.createSlot(0, 'curve'); ModulationStore.openSettings(0); });
    const params = () => ModulationStore.getSlots().find((s) => s?.index === 0)!.params;
    const xy = () => renderer!.root.findByProps({ 'data-kind': 'xy' }) as unknown as Slot;
    const clips = JSON.stringify(params().clips);
    const curvature = params().curvature;
    press(xy());
    expect(JSON.stringify(params().clips)).not.toBe(clips);   // cycled
    expect(params().curvature).toBe(curvature);                // the point stayed put
    act(() => ModulationStore.clear());
  });
});
