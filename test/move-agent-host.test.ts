import { afterEach, describe, expect, it, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { collectGenes } from '../src/preset-genetics';
import { MoveAgentStore, applyAgentWrites, describeAgentControls, type MoveAgentAction, type MoveAgentOutcome, type MoveAgentReply, type MoveAgentRequest } from '../src/move-agent';
import type { MoveAgentEntry, MoveAgentSignal, MoveAgentTool } from '../src/move-agent-perception';

// What the first real host (a sampling editor) needed and the kit did not
// give: pages named by id, seats that are not values, a file that changes
// under a bind that does not, the edges of a request, and an undo that says
// why it could not.

const PANEL = 'agent-host-test';
const register = () => TweakStore.registerPanel(PANEL, 'Kick', {
  level: [0.5, 0, 1],
  _b2: { type: 'toggle', default: false, moveSlot: true, moveBlank: true },
  mute: false,
});

afterEach(() => {
  MoveAgentStore.close();
  MoveAgentStore.configure({
    ask: undefined, actions: undefined, scene: undefined, signals: undefined, editMap: undefined, tools: undefined,
    checkpoint: undefined, onRequest: undefined, panels: undefined,
  });
  TweakStore.unregisterPanel(PANEL);
  vi.restoreAllMocks();
});

function scripted(...replies: Partial<MoveAgentReply>[]) {
  const asked: MoveAgentRequest[] = [];
  const ask = async (request: MoveAgentRequest): Promise<MoveAgentReply> => {
    asked.push(structuredClone(request));
    return { writes: [], ...replies[Math.min(asked.length - 1, replies.length - 1)] };
  };
  return { asked, ask };
}

describe('the panels the agent may touch', () => {
  it('are named by id or by name, like the bind that carries them', () => {
    register();
    expect(describeAgentControls(PANEL).map((c) => c.id)).toEqual([`${PANEL}::level`, `${PANEL}::mute`]);
    expect(describeAgentControls('Kick').map((c) => c.id)).toEqual([`${PANEL}::level`, `${PANEL}::mute`]);
    expect(applyAgentWrites([{ id: `${PANEL}::level`, value: 0.8 }], [PANEL]).changed).toBe(1);
  });
});

describe('a held-open column is a seat, not a value', () => {
  it('is not offered to the agent, and a write to it lands nowhere', () => {
    register();
    expect(describeAgentControls().some((c) => c.id.endsWith('_b2'))).toBe(false);
    expect(applyAgentWrites([{ id: `${PANEL}::_b2`, value: true }]).changed).toBe(0);
    expect(TweakStore.getValue(PANEL, '_b2')).toBe(false);
  });

  it('is not a gene either: exploring presets never flips a seat', () => {
    register();
    expect(collectGenes(TweakStore.getPanel(PANEL)!.controls).map((g) => g.path)).toEqual(['level', 'mute']);
  });
});

describe('what depends on the open file is read fresh', () => {
  it('reads actions, signals and tools at every ask, and options and cost as the request is built', async () => {
    register();
    let file = 'a.mov';
    const samples: Record<string, string[]> = { 'a.mov': ['one'], 'b.mov': ['two', 'three'] };
    const ran: string[] = [];
    const action = (): MoveAgentAction => ({
      id: 'delete', label: `Delete from ${file}`, params: { sample: { type: 'string', options: () => samples[file] } },
      run: ({ sample }) => { ran.push(`${file}:${String(sample)}`); return () => {}; },
    });
    const signal = (): MoveAgentSignal => ({ id: 'shots', label: 'Shots', hint: '', cost: () => `about 5 s for ${file}`, state: () => 'ready', read: async () => [] });
    const look: MoveAgentTool = { id: 'look', label: 'Look', hint: '', kind: 'perceive', cost: () => `slow on ${file}`, run: async () => ({}) };
    const { asked, ask } = scripted({ actions: [{ id: 'delete', params: { sample: 'one' } }] }, { actions: [{ id: 'delete', params: { sample: 'one' } }, { id: 'delete', params: { sample: 'three' } }] });
    MoveAgentStore.configure({ ask, actions: () => [action()], signals: () => [signal()], tools: () => (file === 'a.mov' ? [look] : []) });
    MoveAgentStore.open();

    await MoveAgentStore.ask('delete one');
    expect(asked[0].actions).toEqual([{ id: 'delete', label: 'Delete from a.mov', params: { sample: { type: 'string', options: ['one'] } } }]);
    expect(asked[0].signals![0].cost).toBe('about 5 s for a.mov');
    expect(asked[0].tools!.map((t) => [t.id, t.cost])).toEqual([['read_signal', undefined], ['look', 'slow on a.mov']]);
    expect(ran).toEqual(['a.mov:one']);

    // another file opens: nobody calls configure again
    file = 'b.mov';
    await MoveAgentStore.ask('delete one and three');
    expect(asked[1].actions![0]).toMatchObject({ label: 'Delete from b.mov', params: { sample: { options: ['two', 'three'] } } });
    expect(asked[1].signals![0].cost).toBe('about 5 s for b.mov');
    expect(asked[1].tools!.map((t) => t.id)).toEqual(['read_signal']);
    // "one" is no sample of this file: fitted against the options as they are now, and skipped
    expect(ran).toEqual(['a.mov:one', 'b.mov:three']);
    expect(MoveAgentStore.getView()).toMatchObject({ acted: 1, skipped: 1 });
  });

  it('keeps plain values working', async () => {
    register();
    const { asked, ask } = scripted({});
    const actions: MoveAgentAction[] = [{ id: 'go', label: 'Go', params: { way: { type: 'string', options: ['up', 'down'] } }, run: () => {} }];
    MoveAgentStore.configure({ ask, actions });
    MoveAgentStore.open();
    await MoveAgentStore.ask('go');
    expect(asked[0].actions).toEqual([{ id: 'go', label: 'Go', params: { way: { type: 'string', options: ['up', 'down'] } } }]);
  });
});

describe('the edges of a request', () => {
  const outcomes = () => {
    const log: (string | MoveAgentOutcome)[] = [];
    return { log, onRequest: { begin: (prompt: string) => { log.push(`begin: ${prompt}`); }, end: (outcome: MoveAgentOutcome) => { log.push(outcome); } } };
  };

  it('begins before anything is read and ends with what landed; the checkpoint keeps its own place', async () => {
    register();
    const { log, onRequest } = outcomes();
    const { ask } = scripted({ actions: [{ id: 'go' }, { id: 'nope' }], writes: [{ id: `${PANEL}::level`, value: 1 }] });
    MoveAgentStore.configure({
      ask, onRequest,
      actions: () => { log.push('actions read'); return [{ id: 'go', label: 'Go', run: () => { log.push('ran'); return () => {}; } }]; },
      checkpoint: () => { log.push('checkpoint'); },
    });
    MoveAgentStore.open();
    await MoveAgentStore.ask('  go  ');
    expect(log).toEqual(['begin: go', 'actions read', 'checkpoint', 'ran', { changed: 1, acted: 1, skipped: 1, cancelled: false }]);
  });

  it('waits for begin, and ends once when the ask fails', async () => {
    register();
    const { log, onRequest } = outcomes();
    let release!: () => void;
    const asks = vi.fn(async (): Promise<MoveAgentReply> => { throw new Error('No answer.'); });
    MoveAgentStore.configure({ ask: asks, onRequest: { ...onRequest, begin: () => new Promise<void>((r) => { release = r; }) } });
    MoveAgentStore.open();
    const asking = MoveAgentStore.ask('anything');
    await Promise.resolve();
    expect(asks).not.toHaveBeenCalled();
    release();
    await asking;
    expect(log).toEqual([{ changed: 0, acted: 0, skipped: 0, cancelled: false, error: 'No answer.' }]);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'No answer.' });
  });

  it('ends as cancelled when the ask is let go, with nothing landed', async () => {
    register();
    const { log, onRequest } = outcomes();
    MoveAgentStore.configure({ onRequest, ask: (_request, signal) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))) });
    MoveAgentStore.open();
    const asking = MoveAgentStore.ask('change it');
    await Promise.resolve();
    MoveAgentStore.close();
    await asking;
    expect(log).toEqual(['begin: change it', { changed: 0, acted: 0, skipped: 0, cancelled: true }]);
  });

  it('says so at the end when there was nothing to turn, and carries an action\'s own failure', async () => {
    const { log, onRequest } = outcomes();
    MoveAgentStore.configure({ onRequest, ask: scripted({}).ask, panels: 'no such panel' });
    MoveAgentStore.open();
    await MoveAgentStore.ask('anything');
    expect(log[1]).toMatchObject({ error: 'Nothing here to turn.', cancelled: false });
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'Nothing here to turn.' });

    log.length = 0;
    MoveAgentStore.configure({ ask: scripted({ actions: [{ id: 'go' }] }).ask, actions: [{ id: 'go', label: 'Go', run: () => { throw new Error('no room'); } }] });
    await MoveAgentStore.ask('go');
    expect(log[1]).toEqual({ changed: 0, acted: 0, skipped: 0, cancelled: false, error: 'Go: no room' });
  });
});

describe('a step says what it found', () => {
  const FRAMES: MoveAgentEntry[] = [1, 2, 3].map((n) => ({ id: `frame:${n}`, type: 'frame', source: 'a.mov', t0: n }));
  const stepsOf = async (tools: MoveAgentTool[], call: { tool: string; params?: Record<string, unknown> }, signals?: MoveAgentSignal[]) => {
    register();
    const labels: string[] = [];
    MoveAgentStore.configure({ ask: scripted({ calls: [call] }, { message: 'Seen.' }).ask, tools, signals });
    const stop = MoveAgentStore.subscribe(() => { const step = MoveAgentStore.getView()?.steps[0]; if (step && labels[labels.length - 1] !== step.label) labels.push(step.label); });
    MoveAgentStore.open();
    await MoveAgentStore.ask('look');
    stop();
    return labels;
  };

  it('shows `progress` while it runs and `done` — handed the arguments and the result — once it has', async () => {
    const look: MoveAgentTool = {
      id: 'look', label: 'Look at the frames', hint: '', kind: 'perceive', progress: 'Looking at the frames…',
      params: { from: { type: 'number' }, to: { type: 'number' } },
      done: (params, result) => `Looked at ${result.entries?.length ?? 0} frames, ${String(params.from)}–${String(params.to)} s`,
      run: async () => ({ entries: FRAMES }),
    };
    expect(await stepsOf([look], { tool: 'look', params: { from: 2, to: 6 } })).toEqual(['Looking at the frames…', 'Looked at 3 frames, 2–6 s']);
  });

  it('takes a plain string, and falls back to the label without one or when `done` throws', async () => {
    const tool = (done?: MoveAgentTool['done']): MoveAgentTool => ({ id: 'listen', label: 'Listen', hint: '', kind: 'perceive', done, run: async () => ({}) });
    expect(await stepsOf([tool('Listened')], { tool: 'listen' })).toEqual(['Listen…', 'Listened']);
    MoveAgentStore.close(); TweakStore.unregisterPanel(PANEL);
    expect(await stepsOf([tool()], { tool: 'listen' })).toEqual(['Listen…', 'Listen']);
    MoveAgentStore.close(); TweakStore.unregisterPanel(PANEL);
    expect(await stepsOf([tool(() => { throw new Error('bad'); })], { tool: 'listen' })).toEqual(['Listen…', 'Listen']);
  });

  it('counts what a read gave the agent: the entries listed, after the query', async () => {
    const shots: MoveAgentSignal = { id: 'shots', label: 'Shots', hint: '', state: () => 'ready', read: async () => [
      { id: 'shot:1', type: 'shot', source: 'a.mov', t0: 0, t1: 4, label: 'street' },
      { id: 'shot:2', type: 'shot', source: 'a.mov', t0: 4, t1: 9, label: 'beach' },
      { id: 'shot:3', type: 'shot', source: 'a.mov', t0: 9, t1: 12, label: 'beach at night' },
    ] };
    expect(await stepsOf([], { tool: 'read_signal', params: { signal: 'shots' } }, [shots])).toEqual(['Reading the shots…', 'Read the shots — 3']);
    MoveAgentStore.close(); TweakStore.unregisterPanel(PANEL);
    expect(await stepsOf([], { tool: 'read_signal', params: { signal: 'shots', query: 'beach' } }, [shots])).toEqual(['Reading the shots…', 'Read the shots — 2']);
  });
});

describe('an undo that fails says why', () => {
  const landed = async (undos: (() => void)[]) => {
    register();
    const actions: MoveAgentAction[] = undos.map((undo, i) => ({ id: `a${i}`, label: `A${i}`, run: () => undo }));
    MoveAgentStore.configure({ ask: scripted({ actions: undos.map((_, i) => ({ id: `a${i}` })) }).ask, actions });
    MoveAgentStore.open();
    await MoveAgentStore.ask('do it');
  };

  it('shows the first reason, and keeps the rest where they can be found', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const second = new Error('The file is closed.');
    // undone last first: a1's reason is the first one met
    await landed([() => { throw second; }, () => { throw new Error('The edit was changed by hand since.'); }]);
    await MoveAgentStore.undo();
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'prompt', message: 'Could not undo: The edit was changed by hand since.' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][1]).toBe(second);
    expect(MoveAgentStore.canUndo()).toBe(false);
  });

  it('falls back to the plain line when the failure has no words', async () => {
    await landed([() => { throw new Error(''); }]);
    await MoveAgentStore.undo();
    expect(MoveAgentStore.getView()!.message).toBe('Some of it could not be undone.');
  });
});
