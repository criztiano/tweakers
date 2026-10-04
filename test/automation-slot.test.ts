import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLane, laneByKey, type AutomationTimeline } from '../src/automation-core';
import { AutomationLanesStore, type AutomationCommit } from '../src/automation-store';
import type { AutomationSlotHandle } from '../src/automation-slot';
import { MOD_SETTINGS_PANEL, MOD_SLOTS } from '../src/modulation-core';
import { moveKitOptions } from '../src/move-kit';
import { MoveFunctions } from '../src/move-functions';
import { MoveSurfaceStore } from '../src/move-surface-store';
import { MoveVolumeDisplay } from '../src/move-volume';
import { ModulationStore } from '../src/store/ModulationStore';
import { TweakStore } from '../src/store/TweakStore';

// The automation slot on the step row, and timeline control mode — the
// slot's page — driven the way the hardware drives it: keys through
// MoveFunctions, the knob and the wheel as the kit's window events, the step
// row through MoveSurfaceStore, the dials through the page's panel.

const DURATION = 4;

const twoLanes = (): AutomationTimeline => ({
  lanes: [
    { ...createLane('chaos', 'Chaos', 0, 10, 5), points: [{ t: 0, v: 5 }, { t: 0.5, v: 8 }, { t: 1, v: 2 }] },
    createLane('grain', 'Grain', 0, 4, 1),
  ],
});

let target: EventTarget;
let handle: AutomationSlotHandle | null = null;

function rig(timeline: AutomationTimeline = twoLanes(), options: { present?: boolean } = {}) {
  const clock = { time: 1, duration: DURATION, playing: false };
  const commits: AutomationCommit[] = [];
  const seeks: number[] = [];
  const store = new AutomationLanesStore({ clock: () => clock, play: () => { clock.playing = true; }, commit: (c) => commits.push(c) });
  store.load('scene', timeline);
  handle = store.attachSlot({
    ...options,
    onSeek: (time) => {
      seeks.push(time);
      clock.time = time;
    },
  });
  return { clock, store, commits, seeks, handle };
}

const event = (type: string, detail: Record<string, unknown>) => target.dispatchEvent(new CustomEvent(type, { detail, cancelable: true }));
const selection = (store: AutomationLanesStore) => store.getSelection();

beforeEach(() => {
  target = Object.assign(new EventTarget(), { requestAnimationFrame: () => 1 });
  vi.stubGlobal('window', target);
});

afterEach(() => {
  handle?.release();
  handle = null;
  ModulationStore.clear();
  MoveSurfaceStore.reset();
  vi.unstubAllGlobals();
});

describe('the automation slot', () => {
  it('holds the first free step while lanes exist, keeps it, and hands it back when they go', () => {
    ModulationStore.createSlot(0);
    const { store, handle } = rig();
    expect(handle.index()).toBe(1);
    expect(ModulationStore.getSlot(1)?.type).toBe('automation');
    // A lower step freeing up does not move it: the step is its address.
    ModulationStore.removeSlot(0);
    expect(handle.index()).toBe(1);
    // No lanes in front, no slot.
    store.load('empty', { lanes: [] });
    expect(handle.index()).toBeNull();
    expect(ModulationStore.getSlot(1)).toBeNull();
  });

  it('follows the host’s word over the timeline in front, and waits for a step on a full row', () => {
    for (let i = 0; i < MOD_SLOTS; i++) ModulationStore.createSlot(i);
    const { handle } = rig({ lanes: [] }, { present: true });
    expect(handle.index()).toBeNull();
    ModulationStore.removeSlot(6);
    expect(handle.index()).toBe(6);
    handle.setPresent(false);
    expect(handle.index()).toBeNull();
  });

  it('opens on a tap, takes no wire, and a hold deletes nothing', () => {
    const { handle } = rig();
    const index = handle.index()!;
    const id = 'slot-test-panel';
    TweakStore.registerPanel(id, id, { speed: [50, 0, 100] as [number, number, number] });
    ModulationStore.noteTouch(id, 'speed');
    // The kit's step tap: no wire, so the page opens.
    expect(ModulationStore.assignFromStep(index).action).toBe('none');
    ModulationStore.openSettings(index);
    expect(handle.isOpen()).toBe(true);
    expect(ModulationStore.getAssignment(id, 'speed')).toBeUndefined();
    // The long press.
    ModulationStore.removeSlot(index);
    expect(ModulationStore.getSlot(index)?.type).toBe('automation');
    expect(handle.isOpen()).toBe(true);
    TweakStore.unregisterPanel(id);
  });
});

describe('timeline control mode', () => {
  it('lays out four dials, Smooth pressable, and stands on a lane and a point', () => {
    const { store, handle } = rig();
    handle.open();
    expect(ModulationStore.getSettingsLayout()?.dials).toEqual([{ path: 'lane' }, { path: 'time' }, { path: 'value' }, { path: 'smooth', cycle: true }]);
    // The playhead at 1s of 4: the point nearest a quarter in is the first.
    expect(selection(store)).toMatchObject({ key: 'chaos', point: 0 });
    expect(TweakStore.getValue(MOD_SETTINGS_PANEL, 'lane')).toBe('chaos');
  });

  it('walks lanes and points on the arrows, adds and deletes, and hands every key back', () => {
    const before = MoveFunctions.list();
    const { store, handle, clock } = rig();
    handle.open();
    MoveFunctions.run('right');
    expect(selection(store).point).toBe(1);
    MoveFunctions.run('right');
    MoveFunctions.run('right');
    expect(selection(store).point).toBe(2);
    MoveFunctions.run('down');
    expect(selection(store).key).toBe('grain');
    MoveFunctions.run('up');
    expect(selection(store).key).toBe('chaos');
    // Copy: a point at the playhead.
    clock.time = 3;
    MoveFunctions.run('copy');
    const lane = laneByKey(store.timeline(), 'chaos')!;
    expect(lane.points.some((p) => p.t === 0.75)).toBe(true);
    expect(lane.points[selection(store).point!].t).toBe(0.75);
    MoveFunctions.run('delete');
    expect(laneByKey(store.timeline(), 'chaos')!.points.some((p) => p.t === 0.75)).toBe(false);
    MoveFunctions.run('delete', { shift: true });
    expect(laneByKey(store.timeline(), 'chaos')).toBeUndefined();
    expect(selection(store).key).toBe('grain');
    MoveFunctions.run('back');
    expect(handle.isOpen()).toBe(false);
    expect(MoveFunctions.list()).toEqual(before);
  });

  it('scrubs on the volume knob through the host, zooms on the wheel, and holds the knob only while open', () => {
    const options = moveKitOptions();
    const { store, handle, seeks } = rig();
    expect({ ...options.claims }.master).toBeUndefined();
    handle.open();
    expect({ ...options.claims }.master).toBe(true);
    expect(MoveVolumeDisplay.get()?.label).toBe('time');
    expect(event('move-tweakers:volume', { delta: 3, shift: false })).toBe(false);
    expect(seeks.at(-1)).toBeGreaterThan(1);
    const coarse = seeks.at(-1)! - 1;
    const at = seeks.at(-1)!;
    event('move-tweakers:volume', { delta: 3, shift: true });
    expect(seeks.at(-1)! - at).toBeGreaterThan(0);
    expect(seeks.at(-1)! - at).toBeLessThan(coarse);
    event('move-tweakers:jog', { delta: 4 });
    expect(store.getView().zoom).toBeGreaterThan(1);
    event('move-tweakers:jog-click', {});
    expect(store.getView().zoom).toBe(1);
    handle.close();
    expect(MoveVolumeDisplay.claimsKnob()).toBe(false);
    const count = seeks.length;
    expect(event('move-tweakers:volume', { delta: 3 })).toBe(true);
    expect(seeks.length).toBe(count);
  });

  it('turns the dials into edits: lane, point time, point value, and Smooth on its press', () => {
    const { store, handle, commits } = rig();
    handle.open();
    MoveFunctions.run('right');
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'value', 9);
    expect(laneByKey(store.timeline(), 'chaos')!.points[1].v).toBe(9);
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'time', 1.6);
    expect(laneByKey(store.timeline(), 'chaos')!.points[1].t).toBeCloseTo(0.4, 6);
    // Both turns coalesce, as a drag does: one undo for the gesture.
    expect(commits.every((c) => c.kind === 'edit' && c.coalesce === 'auto:chaos:drag')).toBe(true);
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'lane', 'grain');
    expect(selection(store).key).toBe('grain');
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'lane', 'chaos');
    const n = commits.length;
    TweakStore.updateValue(MOD_SETTINGS_PANEL, 'smooth', 2);
    expect(commits.length).toBe(n);
    expect(ModulationStore.tapSettingsControl('smooth')).toBe(true);
    expect(commits.length).toBe(n + 1);
    expect(commits.at(-1)).toMatchObject({ kind: 'edit' });
  });

  it('cuts the step row into slices of the shown window: a tap jumps, a held step and a tap select, the slot’s step leaves', () => {
    const { store, handle, seeks } = rig();
    const index = handle.index()!;
    handle.open();
    expect(MoveSurfaceStore.ownsSteps()).toBe(true);
    const cells = MoveSurfaceStore.getState().steps!;
    expect(cells).toHaveLength(16);
    expect(cells[index]).toMatchObject({ lit: true });
    // Slice 8 of a whole pass is its middle: 2s of 4, and the point there.
    MoveSurfaceStore.pressStep(8);
    MoveSurfaceStore.releaseStep(8);
    expect(seeks.at(-1)).toBe(2);
    expect(selection(store)).toMatchObject({ key: 'chaos', point: 1 });
    // Held 4, tapped 11: slices 4 through 11.
    MoveSurfaceStore.pressStep(4);
    MoveSurfaceStore.pressStep(11);
    MoveSurfaceStore.releaseStep(11);
    MoveSurfaceStore.releaseStep(4);
    expect(selection(store).range).toEqual({ from: 0.25, to: 0.75 });
    // With a stretch selected, Delete clears it.
    MoveFunctions.run('delete');
    expect(laneByKey(store.timeline(), 'chaos')!.points.filter((p) => p.t > 0.25 && p.t < 0.75)).toEqual([]);
    MoveSurfaceStore.pressStep(index);
    expect(handle.isOpen()).toBe(false);
    expect(MoveSurfaceStore.ownsSteps()).toBe(false);
    expect(MoveSurfaceStore.getState().steps).toBeNull();
  });

  it('closes, and frees its step, when it is let go', () => {
    const { handle } = rig();
    const index = handle.index()!;
    handle.open();
    handle.release();
    expect(ModulationStore.getSettings()).toBeNull();
    expect(ModulationStore.getSlot(index)).toBeNull();
    expect(MoveSurfaceStore.ownsSteps()).toBe(false);
  });
});
