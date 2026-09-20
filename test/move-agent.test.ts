import { afterEach, describe, expect, it } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { MoveAgentStore, applyAgentWrites, describeAgentControls, restoreAgentWrites } from '../src/move-agent';

const PANEL = 'agent-test';
const register = () => TweakStore.registerPanel(PANEL, 'Look', {
  blur: [4, 0, 20, 1],
  tone: { warmth: [0.5, 0, 1] },
  mode: { type: 'select', options: ['soft', 'hard'], default: 'soft' },
  glow: true,
  point: { type: 'xy', default: { x: 0.2, y: 0.8 } },
  tint: { type: 'color', default: '#ff0000' },
});

afterEach(() => { MoveAgentStore.close(); TweakStore.unregisterPanel(PANEL); });

describe('the agent reads the store', () => {
  it('describes every writable value with its limits and where it stands', () => {
    register();
    const controls = describeAgentControls('Look');
    const byId = Object.fromEntries(controls.map((c) => [c.id, c]));
    expect(byId[`${PANEL}::blur`]).toMatchObject({ kind: 'number', min: 0, max: 20, step: 1, value: 4, panel: 'Look' });
    expect(byId[`${PANEL}::tone.warmth`]).toMatchObject({ kind: 'number', value: 0.5 });
    expect(byId[`${PANEL}::mode`]).toMatchObject({ kind: 'category', options: ['soft', 'hard'], value: 'soft' });
    expect(byId[`${PANEL}::glow`]).toMatchObject({ kind: 'category', options: [false, true], value: true });
    expect(byId[`${PANEL}::point:x`]).toMatchObject({ kind: 'number', value: 0.2 });
    expect(byId[`${PANEL}::tint`]).toMatchObject({ kind: 'color', value: '#ff0000' });
  });
});

describe('the agent writes through the store', () => {
  it('fits each write to its control, drops what fits none, and undoes as one', () => {
    register();
    const { before, changed } = applyAgentWrites([
      { id: `${PANEL}::blur`, value: 99.4 },          // clamped to the range
      { id: `${PANEL}::mode`, value: 'hard' },
      { id: `${PANEL}::mode`, value: 'nonsense' },    // not an option
      { id: `${PANEL}::glow`, value: 'false' },       // a switch, spelled out
      { id: `${PANEL}::point:y`, value: 0.1 },        // one axis, the other kept
      { id: `${PANEL}::tint`, value: 'not a colour' },
      { id: `${PANEL}::tint`, value: '#00ff88' },
      { id: `${PANEL}::ghost`, value: 1 },            // no such control
      { id: `${PANEL}::tone.warmth`, value: 0.5 },    // already there
    ], 'Look');
    expect(changed).toBe(5);
    expect(TweakStore.getValues(PANEL)).toMatchObject({
      blur: 20, mode: 'hard', glow: false, point: { x: 0.2, y: 0.1 }, tint: '#00ff88', 'tone.warmth': 0.5,
    });
    restoreAgentWrites(before);
    expect(TweakStore.getValues(PANEL)).toMatchObject({
      blur: 4, mode: 'soft', glow: true, point: { x: 0.2, y: 0.8 }, tint: '#ff0000',
    });
  });

  it('asks the host transport, lands the reply, and takes it back on undo', async () => {
    register();
    let asked: unknown;
    MoveAgentStore.configure({ panels: 'Look', context: 'a test', ask: async (request) => {
      asked = request;
      return { writes: [{ id: `${PANEL}::blur`, value: 12 }], message: 'Softer.' };
    } });
    MoveAgentStore.open(PANEL);
    await MoveAgentStore.ask('  make it softer ');
    expect(asked).toMatchObject({ prompt: 'make it softer', context: 'a test', focus: 'Look' });
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', changed: 1, message: 'Softer.' });
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(12);
    MoveAgentStore.undo();
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
    expect(MoveAgentStore.canUndo()).toBe(false);
  });

  it('says why when the transport fails, and changes nothing', async () => {
    register();
    MoveAgentStore.configure({ panels: 'Look', ask: async () => { throw new Error('The Move bridge is not answering.'); } });
    MoveAgentStore.open();
    await MoveAgentStore.ask('anything');
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'The Move bridge is not answering.' });
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
  });
});
