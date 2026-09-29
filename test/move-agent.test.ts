import { afterEach, describe, expect, it } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { MoveAgentStore, applyAgentWrites, describeAgentControls, restoreAgentWrites, runAgentActions, type MoveAgentAction } from '../src/move-agent';
import { MoveFunctions } from '../src/move-functions';

const PANEL = 'agent-test';
const register = () => TweakStore.registerPanel(PANEL, 'Look', {
  blur: [4, 0, 20, 1],
  tone: { warmth: [0.5, 0, 1] },
  mode: { type: 'select', options: ['soft', 'hard'], default: 'soft' },
  glow: true,
  point: { type: 'xy', default: { x: 0.2, y: 0.8 } },
  tint: { type: 'color', default: '#ff0000' },
});

afterEach(() => { MoveAgentStore.close(); MoveAgentStore.configure({ actions: undefined, scene: undefined, brief: undefined, ask: undefined, attachments: undefined, onShiftTap: undefined }); TweakStore.unregisterPanel(PANEL); });

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

describe('the agent uses the app\'s verbs', () => {
  const timeline = () => {
    const clips = ['intro', 'interview', 'beach'];
    const actions: MoveAgentAction[] = [
      { id: 'move', label: 'Move clip', params: { clip: { type: 'string', options: ['intro', 'interview', 'beach'] }, index: { type: 'number', min: 0, max: 2, step: 1 } },
        run: ({ clip, index }) => {
          const was = [...clips];
          clips.splice(clips.indexOf(clip as string), 1);
          clips.splice(index as number, 0, clip as string);
          return () => { clips.splice(0, clips.length, ...was); };
        } },
      { id: 'export', label: 'Export', run: () => { throw new Error('disk full'); } },
    ];
    return { clips, actions };
  };

  it('fits the arguments, skips what does not fit, and hands back the undos', async () => {
    const { clips, actions } = timeline();
    const result = await runAgentActions([
      { id: 'move', params: { clip: 'beach', index: 0.6 } },      // stepped to 1
      { id: 'move', params: { clip: 'nobody', index: 0 } },       // not an option
      { id: 'move', params: { clip: 'intro' } },                  // an argument missing
      { id: 'erase', params: {} },                                // never offered
    ], actions);
    expect(result).toMatchObject({ ran: 1, undoable: true });
    expect(clips).toEqual(['intro', 'beach', 'interview']);
  });

  it('stops at a verb that fails, and says which', async () => {
    const { clips, actions } = timeline();
    const result = await runAgentActions([{ id: 'export' }, { id: 'move', params: { clip: 'beach', index: 0 } }], actions);
    expect(result).toMatchObject({ ran: 0, error: 'Export: disk full' });
    expect(clips).toEqual(['intro', 'interview', 'beach']);
  });

  it('sends the brief, the scene and the verbs, runs them before the writes, and undoes both', async () => {
    register();
    const { clips, actions } = timeline();
    let asked: any;
    MoveAgentStore.configure({ panels: 'Look', brief: 'Punchy means more blur.', actions, scene: () => ({ clips: [...clips] }), ask: async (request) => {
      asked = request;
      return { actions: [{ id: 'move', params: { clip: 'beach', index: 0 } }], writes: [{ id: `${PANEL}::blur`, value: 9 }], message: 'Done.' };
    } });
    MoveAgentStore.open();
    await MoveAgentStore.ask('beach first, punchy');
    expect(asked).toMatchObject({ brief: 'Punchy means more blur.', scene: { clips: ['intro', 'interview', 'beach'] } });
    expect(asked.actions[0]).toMatchObject({ id: 'move', label: 'Move clip' });
    expect(asked.actions[0].run).toBeUndefined();
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', changed: 1, acted: 1 });
    expect(clips).toEqual(['beach', 'intro', 'interview']);
    await MoveAgentStore.undo();
    expect(clips).toEqual(['intro', 'interview', 'beach']);
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
  });
});

describe('the prompt as a place', () => {
  it('holds the Back key while it is open, and gives it back on close', () => {
    let hostBack = 0;
    const off = MoveFunctions.attach('back', () => { hostBack++; });
    MoveAgentStore.open();
    MoveFunctions.run('back');
    expect(MoveAgentStore.isOpen()).toBe(false);
    MoveFunctions.run('back');
    expect(hostBack).toBe(1);
    off();
  });

  it('takes pictures only when the host asks for them, and hands them to the verbs', async () => {
    register();
    const picture = new File([new Uint8Array([1, 2, 3])], 'hat.png', { type: 'image/png' });
    const text = new File(['no'], 'notes.txt', { type: 'text/plain' });
    MoveAgentStore.open();
    MoveAgentStore.attach([picture]);
    expect(MoveAgentStore.getView()?.attachments).toHaveLength(0);
    MoveAgentStore.close();

    let got: File[] = [];
    let named: unknown;
    const edit: MoveAgentAction = { id: 'edit', label: 'Edit', run: (_params, { attachments }) => { got = attachments; } };
    MoveAgentStore.configure({ panels: 'Look', attachments: true, actions: [edit], ask: async (request) => {
      named = request.attachments;
      return { writes: [], actions: [{ id: 'edit' }] };
    } });
    MoveAgentStore.open();
    MoveAgentStore.attach([picture, text]);
    expect(MoveAgentStore.getView()?.attachments.map((a) => a.name)).toEqual(['hat.png']);
    await MoveAgentStore.ask('give her the hat');
    expect(named).toEqual([{ name: 'hat.png', type: 'image/png' }]);
    expect(got).toEqual([picture]);
    const id = MoveAgentStore.getView()!.attachments[0].id;
    MoveAgentStore.detach(id);
    expect(MoveAgentStore.getView()?.attachments).toHaveLength(0);
  });
});
