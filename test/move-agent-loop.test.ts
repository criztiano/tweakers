import { afterEach, describe, expect, it, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { MoveAgentStore, runAgentActions, type MoveAgentAction, type MoveAgentReply, type MoveAgentRequest } from '../src/move-agent';
import type { MoveAgentBoundary, MoveAgentEntry, MoveAgentSegment, MoveAgentSignal, MoveAgentSourceRange, MoveAgentTool } from '../src/move-agent-perception';

const PANEL = 'agent-loop-test';
const register = () => TweakStore.registerPanel(PANEL, 'Look', { blur: [4, 0, 20, 1] });

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  MoveAgentStore.close();
  MoveAgentStore.configure({
    url: undefined, ask: undefined, actions: undefined, scene: undefined, brief: undefined, context: undefined,
    signals: undefined, editMap: undefined, tools: undefined, maxPasses: undefined, checkpoint: undefined,
  });
  TweakStore.unregisterPanel(PANEL);
});

/** A pretend source: three shots, one the edit cuts through, and where the singer comes in. */
const SHOTS: MoveAgentEntry[] = [
  { id: 'shot:1', type: 'shot', source: 'a.mov', t0: 0, t1: 12, label: 'street' },
  { id: 'shot:2', type: 'shot', source: 'a.mov', t0: 12, t1: 30, label: 'beach, two people' },
  { id: 'shot:3', type: 'shot', source: 'a.mov', t0: 30, t1: 60, label: 'interview' },
];
const MAP: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 0 }, { source: 'a.mov', srcIn: 40, srcOut: 50, at: 10 }];

function host() {
  const reads: (MoveAgentSourceRange[] | undefined)[] = [];
  let state: 'missing' | 'ready' = 'missing';
  const shots: MoveAgentSignal = {
    id: 'shots', label: 'Shots', hint: 'Where the picture cuts.', cost: 'about 5 s',
    state: () => state,
    read: async (range) => { reads.push(range); state = 'ready'; return SHOTS; },
  };
  const trims: MoveAgentBoundary[] = [];
  const log: string[] = [];
  const actions: MoveAgentAction[] = [{
    id: 'trim_to', label: 'Trim to', params: { at: { type: 'boundary' } },
    run: ({ at }) => { trims.push(at as MoveAgentBoundary); log.push('trim'); return () => { trims.pop(); log.push('untrim'); }; },
  }];
  return { reads, shots, trims, log, actions };
}

/** A transport that plays back a script, one reply per pass, and keeps what it was sent. */
function scripted(...replies: (Partial<MoveAgentReply> | ((request: MoveAgentRequest) => Partial<MoveAgentReply>))[]) {
  const asked: MoveAgentRequest[] = [];
  const ask = async (request: MoveAgentRequest): Promise<MoveAgentReply> => {
    asked.push(structuredClone(request));
    const next = replies[Math.min(asked.length - 1, replies.length - 1)];
    return { writes: [], ...(typeof next === 'function' ? next(request) : next) };
  };
  return { asked, ask };
}

describe('the agent takes a few passes', () => {
  it('reads, looks, then answers: calls run, history rides, passes count down, one undo takes it all back', async () => {
    register();
    const { reads, shots, trims, log, actions } = host();
    const looked: unknown[] = [];
    const look: MoveAgentTool = {
      id: 'look', label: 'Look at the frames', hint: 'A contact sheet of a timeline range.', kind: 'perceive', progress: 'Looking at the frames…',
      params: { around: { type: 'boundary' }, n: { type: 'number', min: 1, max: 12, step: 1 } },
      run: async (params) => { looked.push(params); return { text: '4 tiles', images: [{ name: 'sheet.png', dataUrl: 'data:image/png;base64,AAAA' }] }; },
    };
    const { asked, ask } = scripted(
      { calls: [{ tool: 'read_signal', params: { signal: 'shots', from: 0, to: 10, query: 'beach' } }] },
      { calls: [{ tool: 'look', params: { around: { entry: 'shot:2', edge: 'end' }, n: 30 } }] },
      { actions: [{ id: 'trim_to', params: { at: { entry: 'shot:2', edge: 'end' } } }], writes: [{ id: `${PANEL}::blur`, value: 9 }], message: 'Trimmed to the beach.' },
    );
    const checkpoint = vi.fn(() => { log.push('checkpoint'); });
    const labels: string[][] = [];
    MoveAgentStore.configure({ panels: 'Look', actions, signals: [shots], tools: [look], editMap: () => MAP, checkpoint, ask });
    const stop = MoveAgentStore.subscribe(() => { const steps = MoveAgentStore.getView()?.steps; if (steps?.length) labels.push(steps.map((s) => `${s.label} · ${s.state}`)); });
    MoveAgentStore.open();
    await MoveAgentStore.ask('end on the beach shot');
    stop();

    expect(asked).toHaveLength(3);
    expect(asked.map((r) => r.passesLeft)).toEqual([2, 1, 0]);
    // The menu rides in every request, with the state as it stands.
    expect(asked[0].signals).toEqual([{ id: 'shots', label: 'Shots', hint: 'Where the picture cuts.', state: 'missing', cost: 'about 5 s' }]);
    expect(asked[1].signals![0].state).toBe('ready');
    expect(asked[0].tools!.map((t) => t.id)).toEqual(['read_signal', 'look']);
    expect(asked[0].tools![1]).toEqual({ id: 'look', label: 'Look at the frames', hint: look.hint, kind: 'perceive', params: look.params });
    expect(asked[0].tools![0].params!.signal).toEqual({ type: 'string', options: ['shots'] });
    expect(asked[0].history).toBeUndefined();

    // Timeline 0–10 went back through the map to source 10–20, and only that was read.
    expect(reads).toEqual([[{ source: 'a.mov', t0: 10, t1: 20 }]]);
    expect(asked[1].history).toEqual([{
      calls: [{ tool: 'read_signal', params: { signal: 'shots', from: 0, to: 10, query: 'beach' } }],
      results: [{ tool: 'read_signal', text: 'shot:2 | shot | 00:02.000–00:10.000 | beach, two people | partial' }],
    }]);
    expect(asked[2].history).toHaveLength(2);
    expect(asked[2].history![1]).toEqual({
      calls: [{ tool: 'look', params: { around: { entry: 'shot:2', edge: 'end' }, n: 30 } }],
      results: [{ tool: 'look', text: '4 tiles', images: [{ name: 'sheet.png', dataUrl: 'data:image/png;base64,AAAA' }] }],
    });
    // The tool got its arguments fitted, and its boundary already a time.
    expect(looked).toEqual([{ around: { entry: 'shot:2', edge: 'end', source: 'a.mov', sourceTime: 30 }, n: 12 }]);

    expect(labels[0]).toEqual(['Reading the shots… · running']);
    expect(labels[labels.length - 1]).toEqual(['Read the shots · done', 'Look at the frames · done']);
    expect(labels).toContainEqual(['Read the shots · done', 'Looking at the frames… · running']);

    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', changed: 1, acted: 1, skipped: 0, message: 'Trimmed to the beach.' });
    expect(trims).toEqual([{ entry: 'shot:2', edge: 'end', source: 'a.mov', sourceTime: 30 }]);
    expect(checkpoint).toHaveBeenCalledTimes(1);
    expect(log).toEqual(['checkpoint', 'trim']);
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(9);

    await MoveAgentStore.undo();
    expect(log).toEqual(['checkpoint', 'trim', 'untrim']);
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
    expect(MoveAgentStore.canUndo()).toBe(false);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'prompt', message: 'Undone.', steps: [] });
  });

  it('runs the calls of one pass at once, and tells the agent when one fails', async () => {
    register();
    const started: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const tool = (id: string, run: MoveAgentTool['run']): MoveAgentTool => ({ id, label: id, hint: '', kind: 'read', run });
    const { asked, ask } = scripted({ calls: [{ tool: 'slow' }, { tool: 'fast' }, { tool: 'broken' }, { tool: 'nobody' }] }, { message: 'Seen.' });
    MoveAgentStore.configure({ panels: 'Look', ask, tools: [
      tool('slow', async () => { started.push('slow'); await gate; return { text: 'slow done' }; }),
      tool('fast', async () => { started.push('fast'); release(); return { text: 'fast done' }; }),
      tool('broken', async () => { throw new Error('no file'); }),
    ] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('look around');   // would hang if `fast` waited for `slow`
    expect(started).toEqual(['slow', 'fast']);
    expect(asked[1].history![0].results).toEqual([
      { tool: 'slow', text: 'slow done' }, { tool: 'fast', text: 'fast done' },
      { tool: 'broken', error: 'no file' }, { tool: 'nobody', error: 'No such tool.' },
    ]);
    expect(MoveAgentStore.getView()!.steps.map((s) => s.state)).toEqual(['done', 'done', 'failed', 'failed']);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', message: 'Seen.' });
  });

  it('stops at maxPasses, however long the agent would keep looking', async () => {
    register();
    const run = vi.fn(async () => ({ text: 'more' }));
    const { asked, ask } = scripted({ calls: [{ tool: 'peek' }] });
    MoveAgentStore.configure({ panels: 'Look', ask, maxPasses: 2, tools: [{ id: 'peek', label: 'Peek', hint: '', kind: 'read', run }] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('keep looking');
    expect(asked.map((r) => r.passesLeft)).toEqual([1, 0]);
    expect(run).toHaveBeenCalledTimes(1);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', changed: 0, message: 'It kept looking and ran out of passes. Nothing changed.' });
  });

  it('defaults to three passes', async () => {
    register();
    const { asked, ask } = scripted({ calls: [{ tool: 'peek' }] });
    MoveAgentStore.configure({ panels: 'Look', ask, tools: [{ id: 'peek', label: 'Peek', hint: '', kind: 'read', run: async () => ({}) }] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('keep looking');
    expect(asked.map((r) => r.passesLeft)).toEqual([2, 1, 0]);
  });

  it('lands nothing when it is let go in the middle of a tool, and aborts the tool', async () => {
    register();
    const { actions, trims } = host();
    let aborted = false, running!: () => void;
    const isRunning = new Promise<void>((r) => { running = r; });
    const stuck: MoveAgentTool = { id: 'stuck', label: 'Stuck', hint: '', kind: 'perceive',
      run: (_params, signal) => new Promise(() => { signal.addEventListener('abort', () => { aborted = true; }); running(); }) };
    const { asked, ask } = scripted({ calls: [{ tool: 'stuck' }] }, { writes: [{ id: `${PANEL}::blur`, value: 9 }], actions: [{ id: 'trim_to', params: { at: { entry: 'shot:2', edge: 'end' } } }] });
    const checkpoint = vi.fn();
    MoveAgentStore.configure({ panels: 'Look', ask, actions, tools: [stuck], checkpoint, scene: () => ({ entries: SHOTS }) });
    MoveAgentStore.open();
    const asking = MoveAgentStore.ask('look');
    await isRunning;
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'thinking', steps: [{ label: 'Stuck…', state: 'running' }] });
    MoveAgentStore.close();
    await asking;
    expect(aborted).toBe(true);
    expect(asked).toHaveLength(1);
    expect(MoveAgentStore.getView()).toBeNull();
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
    expect(trims).toEqual([]);
    expect(checkpoint).not.toHaveBeenCalled();
    expect(MoveAgentStore.canUndo()).toBe(false);
  });

  it('stops at 120 seconds with nothing landed, and says so', async () => {
    vi.useFakeTimers();
    register();
    const { asked, ask } = scripted({ calls: [{ tool: 'stuck' }] }, { writes: [{ id: `${PANEL}::blur`, value: 9 }] });
    MoveAgentStore.configure({ panels: 'Look', ask, tools: [{ id: 'stuck', label: 'Stuck', hint: '', kind: 'perceive', run: () => new Promise(() => {}) }] });
    MoveAgentStore.open();
    const asking = MoveAgentStore.ask('look');
    await vi.advanceTimersByTimeAsync(119_000);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'thinking' });
    await vi.advanceTimersByTimeAsync(1_000);
    await asking;
    expect(asked).toHaveLength(1);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'That took too long, so it was stopped. Nothing changed.' });
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
  });

  it('lands nothing when the checkpoint fails', async () => {
    register();
    const { actions, trims } = host();
    const { ask } = scripted({ actions: [{ id: 'trim_to', params: { at: { entry: 'shot:2', edge: 'end' } } }], writes: [{ id: `${PANEL}::blur`, value: 9 }] });
    MoveAgentStore.configure({ panels: 'Look', ask, actions, scene: () => ({ entries: SHOTS }), checkpoint: () => { throw new Error('Could not save first.'); } });
    MoveAgentStore.open();
    await MoveAgentStore.ask('trim');
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'Could not save first.' });
    expect(trims).toEqual([]);
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(4);
  });
});

describe('boundaries, in the loop', () => {
  it('knows the entries the scene lists, with no pass spent; skips and counts a boundary nobody has seen', async () => {
    register();
    const { actions, trims } = host();
    const { asked, ask } = scripted({ actions: [
      { id: 'trim_to', params: { at: { entry: 'shot:99', edge: 'end' } } },
      { id: 'trim_to', params: { at: { entry: 'shot:2', edge: 'start' } } },
    ] });
    MoveAgentStore.configure({ panels: 'Look', ask, actions, editMap: () => MAP, scene: () => ({ clips: 2, entries: SHOTS }) });
    MoveAgentStore.open();
    await MoveAgentStore.ask('start on the beach');
    expect(asked).toHaveLength(1);
    expect(asked[0].passesLeft).toBeUndefined();
    expect(trims).toEqual([{ entry: 'shot:2', edge: 'start', source: 'a.mov', sourceTime: 12, time: 2 }]);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', acted: 1, skipped: 1 });
  });

  it('resolves each boundary as its action comes up, through the edit as the last one left it', async () => {
    let at = 0;
    const times: (number | undefined)[] = [];
    const action: MoveAgentAction = { id: 'nudge', label: 'Nudge', params: { to: { type: 'boundary' } },
      run: ({ to }) => { times.push((to as MoveAgentBoundary).time); at += 100; } };
    const known: MoveAgentEntry[] = [{ id: 'bar:1', type: 'bar', source: 'a.mov', t0: 5 }];
    const { resolveBoundary } = await import('../src/move-agent-perception');
    const result = await runAgentActions(
      [{ id: 'nudge', params: { to: { entry: 'bar:1', edge: 'start' } } }, { id: 'nudge', params: { to: 'bar:1 start' } }, { id: 'nudge', params: { to: { entry: 'bar:1' } as never } }],
      [action], (ref) => resolveBoundary(ref, known, [{ source: 'a.mov', srcIn: 0, srcOut: 10, at }]));
    expect(times).toEqual([5, 105]);
    expect(result).toMatchObject({ ran: 2, skipped: 1, undoable: false });
  });

  it('skips a boundary action outright when nothing can resolve it', async () => {
    const run = vi.fn();
    const result = await runAgentActions([{ id: 'trim_to', params: { at: { entry: 'shot:2', edge: 'end' } } }], [{ id: 'trim_to', label: 'Trim to', params: { at: { type: 'boundary' } }, run }]);
    expect(result).toMatchObject({ ran: 0, skipped: 1 });
    expect(run).not.toHaveBeenCalled();
  });
});

describe('signals are lazy', () => {
  it('sends the menu and computes nothing when the agent does not ask', async () => {
    register();
    const { reads, shots } = host();
    const { asked, ask } = scripted({ writes: [{ id: `${PANEL}::blur`, value: 9 }] });
    MoveAgentStore.configure({ panels: 'Look', ask, signals: [shots], editMap: () => MAP });
    MoveAgentStore.open();
    await MoveAgentStore.ask('softer');
    expect(asked).toHaveLength(1);
    expect(asked[0].signals![0]).toMatchObject({ id: 'shots', state: 'missing' });
    expect(asked[0].tools!.map((t) => t.id)).toEqual(['read_signal']);
    expect(reads).toEqual([]);
    expect(TweakStore.getValue(PANEL, 'blur')).toBe(9);
  });

  it('reads the whole edit for no range, hands a whole-file signal no range, and never reads what is unavailable', async () => {
    register();
    const { reads, shots } = host();
    const wholeReads: unknown[] = [];
    const bars: MoveAgentSignal = { id: 'bars', label: 'Bars', hint: '', whole: true, state: () => 'ready',
      read: async (range) => { wholeReads.push(range); return [{ id: 'bar:1', type: 'bar', source: 'a.mov', t0: 15 }, { id: 'bar:2', type: 'bar', source: 'a.mov', t0: 45 }, { id: 'bar:3', type: 'bar', source: 'a.mov', t0: 55 }]; } };
    const stemsRead = vi.fn(async () => []);
    const stems: MoveAgentSignal = { id: 'stems', label: 'Stems', hint: '', cost: 'extract the stems first', state: () => 'unavailable', read: stemsRead };
    const { asked, ask } = scripted({ calls: [
      { tool: 'read_signal', params: { signal: 'shots' } }, { tool: 'read_signal', params: { signal: 'bars', from: 9, to: 20 } },
      { tool: 'read_signal', params: { signal: 'stems' } }, { tool: 'read_signal', params: { signal: 'ghosts' } },
      { tool: 'read_signal', params: { signal: 'shots', from: 500 } },
    ] }, {});
    MoveAgentStore.configure({ panels: 'Look', ask, signals: [shots, bars, stems], editMap: () => MAP });
    MoveAgentStore.open();
    await MoveAgentStore.ask('what is here');
    expect(reads).toEqual([[{ source: 'a.mov', t0: 10, t1: 20 }, { source: 'a.mov', t0: 40, t1: 50 }]]);
    expect(wholeReads).toEqual([undefined]);
    expect(stemsRead).not.toHaveBeenCalled();
    const results = asked[1].history![0].results;
    expect(results[0].text!.split('\n')).toEqual([
      'shot:1 | shot | 00:00.000–00:02.000 | street | partial',
      'shot:2 | shot | 00:02.000–00:10.000 | beach, two people | partial',
      'shot:3 | shot | 00:10.000–00:20.000 | interview | partial',
    ]);
    expect(results[1].text).toBe('bar:2 | bar | 00:15.000');   // bar:1 is outside 9–20 on the timeline, bar:3 outside the edit
    expect(results[2]).toEqual({ tool: 'read_signal', error: 'Stems cannot be read here (extract the stems first).' });
    expect(results[3].error).toBe('The arguments do not fit what the tool takes.');
    expect(results[4].text).toBe('Nothing of the edit is in that range.');
  });

  it('reads the timeline as the source when the host has no edit map', async () => {
    register();
    const { reads, shots } = host();
    const { asked, ask } = scripted({ calls: [{ tool: 'read_signal', params: { signal: 'shots', from: 20, to: 40 } }] }, {});
    MoveAgentStore.configure({ panels: 'Look', ask, signals: [shots] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('what is here');
    expect(reads).toEqual([undefined]);
    expect(asked[1].history![0].results[0].text!.split('\n')).toEqual(['shot:2 | shot | 00:12.000–00:30.000 | beach, two people', 'shot:3 | shot | 00:30.000–01:00.000 | interview']);
  });

  it('holds a pass to the images the bridge will take, and the step says what was left out', async () => {
    register();
    const images = Array.from({ length: 11 }, (_, i) => ({ name: `${i}.png`, dataUrl: i === 0 ? `data:image/png;base64,${'A'.repeat(900_000)}` : i === 1 ? 'data:image/webp;base64,AAAA' : 'data:image/png;base64,AAAA' }));
    const { asked, ask } = scripted({ calls: [{ tool: 'look' }, { tool: 'glance' }] }, {});
    MoveAgentStore.configure({ panels: 'Look', ask, tools: [
      { id: 'look', label: 'Look', hint: '', kind: 'perceive', run: async () => ({ text: 'eleven tiles', images }) },
      { id: 'glance', label: 'Glance', hint: '', kind: 'perceive', run: async () => ({ images: [{ name: 'late.png', dataUrl: 'data:image/png;base64,AAAA' }] }) },
    ] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('look');
    const [look, glance] = asked[1].history![0].results;
    expect(look.images!.map((i) => i.name)).toEqual(['2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png']);
    expect(look.text).toBe('eleven tiles (3 images left out: at most 8 a pass, JPEG or PNG, under 600 KB each)');
    expect(glance).toEqual({ tool: 'glance', text: '(1 image left out: at most 8 a pass, JPEG or PNG, under 600 KB each)', images: undefined });
    expect(MoveAgentStore.getView()!.steps).toEqual([
      { label: 'Look — 3 images left out: at most 8 a pass, JPEG or PNG, under 600 KB each', state: 'done' },
      { label: 'Glance — 1 image left out: at most 8 a pass, JPEG or PNG, under 600 KB each', state: 'failed' },
    ]);
  });

  it('shows what the bridge says when it refuses a pass', async () => {
    register();
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/capabilities')) return new Response(JSON.stringify({ passes: true, images: true }), { status: 200 });
      const body = JSON.parse(init!.body as string) as MoveAgentRequest;
      return body.history ? new Response(JSON.stringify({ error: 'Too many images in one pass.' }), { status: 413 })
        : new Response(JSON.stringify({ calls: [{ tool: 'peek' }], writes: [], actions: [], message: '' }), { status: 200 });
    }));
    MoveAgentStore.configure({ panels: 'Look', url: 'http://strict.test/agent', tools: [{ id: 'peek', label: 'Peek', hint: '', kind: 'read', run: async () => ({ text: 'seen' }) }] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('look');
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'Too many images in one pass.', steps: [{ label: 'Peek', state: 'done' }], changed: 0 });
  });
});

describe('the handshake with the bridge', () => {
  const bridge = (capabilities: (() => Response | Promise<Response>), replies: Partial<MoveAgentReply>[]) => {
    const seen: { url: string; body?: MoveAgentRequest }[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      seen.push({ url, body: init?.body ? JSON.parse(init.body as string) : undefined });
      if (url.endsWith('/capabilities')) return capabilities();
      const posts = seen.filter((s) => s.body).length;
      return new Response(JSON.stringify({ writes: [], ...replies[Math.min(posts - 1, replies.length - 1)] }), { status: 200 });
    }));
    return seen;
  };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  const peek = (): MoveAgentTool => ({ id: 'peek', label: 'Peek', hint: '', kind: 'read', run: vi.fn(async () => ({ text: 'seen' })) });

  it('falls back to the single pass of today when the bridge is older: no tools, no signals, calls ignored', async () => {
    register();
    const { reads, shots } = host();
    const tool = peek();
    const seen = bridge(() => json({ error: 'not found' }, 404), [{ calls: [{ tool: 'peek' }], writes: [{ id: `${PANEL}::blur`, value: 9 }], message: 'Softer.' }]);
    MoveAgentStore.configure({ panels: 'Look', url: 'http://old.test/agent', signals: [shots], tools: [tool], editMap: () => MAP });
    MoveAgentStore.open();
    await MoveAgentStore.ask('softer');
    expect(seen.map((s) => s.url)).toEqual(['http://old.test/agent/capabilities', 'http://old.test/agent']);
    expect(Object.keys(seen[1].body!).sort()).toEqual(['controls', 'prompt']);
    expect(tool.run).not.toHaveBeenCalled();
    expect(reads).toEqual([]);
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'done', changed: 1, message: 'Softer.', steps: [] });
  });

  it('falls back the same way when nothing answers, or the answer has no passes', async () => {
    register();
    for (const [url, capabilities] of [
      ['http://down.test/agent', () => { throw new TypeError('fetch failed'); }],
      ['http://v1.test/agent', () => json({ agent: 1 })],
      ['http://odd.test/agent', () => new Response('<html>', { status: 200 })],
    ] as const) {
      const seen = bridge(capabilities, [{ message: 'ok' }]);
      MoveAgentStore.configure({ panels: 'Look', url, tools: [peek()] });
      MoveAgentStore.open();
      await MoveAgentStore.ask('softer');
      expect(seen[1].body!.tools).toBeUndefined();
      expect(seen[1].body!.passesLeft).toBeUndefined();
      MoveAgentStore.close();
    }
  });

  it('offers its senses to a bridge that takes passes, asks it once, and keeps to the fewer passes of the two', async () => {
    register();
    const tool = peek();
    const seen = bridge(() => json({ agent: 2, passes: true, images: true, maxPasses: 2 }), [{ calls: [{ tool: 'peek' }] }, { message: 'Seen.' }]);
    MoveAgentStore.configure({ panels: 'Look', url: 'http://new.test/agent/', tools: [tool], maxPasses: 5 });
    MoveAgentStore.open();
    await MoveAgentStore.ask('look');
    await MoveAgentStore.ask('look again');
    // Two passes, then a second ask answered at once — and the bridge was asked what it can do only the first time.
    expect(seen.map((s) => s.url)).toEqual(['http://new.test/agent/capabilities', 'http://new.test/agent/', 'http://new.test/agent/', 'http://new.test/agent/']);
    expect(seen[1].body).toMatchObject({ passesLeft: 1, tools: [{ id: 'peek' }] });
    expect(seen[2].body).toMatchObject({ passesLeft: 0, history: [{ calls: [{ tool: 'peek' }], results: [{ tool: 'peek', text: 'seen' }] }] });
    expect(seen[3].body).toMatchObject({ prompt: 'look again', passesLeft: 1 });
    expect(tool.run).toHaveBeenCalledTimes(1);
  });

  it('asks again after the bridge has failed', async () => {
    register();
    let up = true;
    const seen: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      seen.push(url);
      if (url.endsWith('/capabilities')) return json({ passes: true });
      return up ? json({ writes: [], message: 'ok' }) : json({ error: 'The agent failed.' }, 500);
    }));
    MoveAgentStore.configure({ panels: 'Look', url: 'http://flaky.test/agent', tools: [peek()] });
    MoveAgentStore.open();
    await MoveAgentStore.ask('one');
    up = false;
    await MoveAgentStore.ask('two');
    expect(MoveAgentStore.getView()).toMatchObject({ phase: 'error', message: 'The agent failed.' });
    up = true;
    await MoveAgentStore.ask('three');
    expect(seen.filter((u) => u.endsWith('/capabilities'))).toHaveLength(2);
  });

  it('does not ask at all when the host offers nothing to perceive with', async () => {
    register();
    const seen = bridge(() => json({ passes: true }), [{ message: 'ok' }]);
    MoveAgentStore.configure({ panels: 'Look', url: 'http://plain.test/agent' });
    MoveAgentStore.open();
    await MoveAgentStore.ask('softer');
    expect(seen.map((s) => s.url)).toEqual(['http://plain.test/agent']);
  });
});
