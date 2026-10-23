import { afterEach, describe, expect, it, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { MoveFunctions } from '../src/move-functions';
import { MoveAgentStore, type MoveAgentAsk, type MoveAgentStream } from '../src/move-agent';

// The conversation a long session needs: every ask kept as a thread, the
// prompt as a sheet beside the work, and a host that asks the person with
// buttons before it spends — and waits, however long, for the press.

const PANEL = 'agent-sheet-test';
const register = () => TweakStore.registerPanel(PANEL, 'Look', { level: [0.5, 0, 1] });

afterEach(() => {
  MoveAgentStore.close();
  MoveAgentStore.newChat();
  MoveAgentStore.configure({ ask: undefined, actions: undefined, timeoutMs: undefined, onNewChat: undefined });
  TweakStore.unregisterPanel(PANEL);
  vi.useRealTimers();
});

/** An ask that hands its stream out and waits until the test lets it answer. */
function held() {
  let stream!: MoveAgentStream;
  let answer!: (message: string) => void;
  const started = new Promise<void>((ready) => {
    const ask: MoveAgentAsk = (_request, _signal, s) => {
      stream = s;
      ready();
      return new Promise((resolve) => { answer = (message) => resolve({ writes: [], message }); });
    };
    MoveAgentStore.configure({ ask });
  });
  return { started, stream: () => stream, answer: (message: string) => answer(message) };
}

describe('the thread', () => {
  it('keeps every ask, and outlives the prompt closing', async () => {
    register();
    MoveAgentStore.configure({ ask: async (request) => ({ writes: [], message: `said: ${request.prompt}` }) });
    MoveAgentStore.open(PANEL);
    await MoveAgentStore.ask('one');
    await MoveAgentStore.ask('two');
    MoveAgentStore.close();
    expect(MoveAgentStore.getThread().map((t) => [t.prompt, t.message, t.phase])).toEqual([['one', 'said: one', 'done'], ['two', 'said: two', 'done']]);
  });

  it('keeps a failed ask with its reason, and a let-go one as stopped', async () => {
    register();
    MoveAgentStore.configure({ ask: async () => { throw new Error('No answer.'); } });
    MoveAgentStore.open(PANEL);
    await MoveAgentStore.ask('one');
    const h = held();
    const asking = MoveAgentStore.ask('two');
    await h.started;
    MoveAgentStore.close();
    await asking;
    expect(MoveAgentStore.getThread().map((t) => [t.message, t.phase])).toEqual([['No answer.', 'error'], ['Stopped.', 'done']]);
  });

  it('starts again on New chat, and the host forgets its side', async () => {
    register();
    const forget = vi.fn();
    MoveAgentStore.configure({ ask: async () => ({ writes: [], message: 'ok' }), onNewChat: forget });
    MoveAgentStore.open(PANEL);
    await MoveAgentStore.ask('one');
    expect(MoveAgentStore.hasNewChat()).toBe(true);
    MoveAgentStore.newChat();
    expect(MoveAgentStore.getThread()).toEqual([]);
    expect(forget).toHaveBeenCalledOnce();
  });
});

describe('the sheet', () => {
  it('is the same prompt: the box turns into it with the ask in the air, and back', async () => {
    register();
    const h = held();
    MoveAgentStore.open(PANEL);
    const asking = MoveAgentStore.ask('one');
    await h.started;
    MoveAgentStore.openSheet();
    expect(MoveAgentStore.getView()).toMatchObject({ sheet: true, phase: 'thinking', prompt: 'one' });
    h.answer('done');
    await asking;
    expect(MoveAgentStore.getView()).toMatchObject({ sheet: true, phase: 'done' });
    MoveAgentStore.setSheet(false);
    expect(MoveAgentStore.isSheet()).toBe(false);
  });

  it('opens on its own when nothing is open', () => {
    MoveAgentStore.openSheet(PANEL);
    expect(MoveAgentStore.isSheet()).toBe(true);
  });
});

describe('asking the person', () => {
  it('waits on the press and hands back the id; the question and the answer stay as a step', async () => {
    register();
    const h = held();
    MoveAgentStore.open(PANEL);
    const asking = MoveAgentStore.ask('run it');
    await h.started;
    const pressed = h.stream().choose([{ id: 'run', label: 'Run · $0.24', tone: 'go' }, { id: 'cancel', label: 'Cancel', tone: 'quiet' }], 'Twelve pictures.');
    expect(MoveAgentStore.isChoosing()).toBe(true);
    expect(MoveAgentStore.getView()).toMatchObject({ message: 'Twelve pictures.', choices: [{ id: 'run' }, { id: 'cancel' }] });
    MoveAgentStore.chooseGo();
    await expect(pressed).resolves.toBe('run');
    expect(MoveAgentStore.getView()?.choices).toBeUndefined();
    h.answer('Ran it.');
    await asking;
    expect(MoveAgentStore.getThread()[0].steps).toEqual([{ label: 'Twelve pictures. — Run · $0.24', state: 'done' }]);
  });

  it('presses only a go button for the host: with none, nothing is pressed', async () => {
    register();
    const h = held();
    MoveAgentStore.open(PANEL);
    void MoveAgentStore.ask('run it');
    await h.started;
    void h.stream().choose([{ id: 'run', label: 'Run' }, { id: 'cancel', label: 'Cancel', tone: 'quiet' }]);
    MoveAgentStore.chooseGo();
    expect(MoveAgentStore.isChoosing()).toBe(true);
  });

  it('takes Back as no, and leaves the prompt open', async () => {
    register();
    const h = held();
    MoveAgentStore.open(PANEL);
    void MoveAgentStore.ask('run it');
    await h.started;
    const pressed = h.stream().choose([{ id: 'run', label: 'Run' }]);
    MoveFunctions.run('back');
    await expect(pressed).resolves.toBeNull();
    expect(MoveAgentStore.isOpen()).toBe(true);
    expect(MoveAgentStore.isChoosing()).toBe(false);
  });

  it('answers null when the prompt closes under it', async () => {
    register();
    const h = held();
    MoveAgentStore.open(PANEL);
    void MoveAgentStore.ask('run it');
    await h.started;
    const pressed = h.stream().choose([{ id: 'run', label: 'Run' }]);
    MoveAgentStore.close();
    await expect(pressed).resolves.toBeNull();
  });

  it('stops the time budget while it waits', async () => {
    vi.useFakeTimers();
    register();
    const h = held();
    MoveAgentStore.configure({ timeoutMs: 1000 });
    MoveAgentStore.open(PANEL);
    const asking = MoveAgentStore.ask('run it');
    await h.started;
    const pressed = h.stream().choose([{ id: 'run', label: 'Run' }]);
    await vi.advanceTimersByTimeAsync(5000);
    expect(MoveAgentStore.getView()?.phase).toBe('thinking');
    MoveAgentStore.choose('run');
    await expect(pressed).resolves.toBe('run');
    h.answer('ok');
    await asking;
    expect(MoveAgentStore.getView()?.phase).toBe('done');
  });
});

describe('a host step', () => {
  it('shows while the work runs and finishes with new words; one left running is kept as failed', async () => {
    register();
    const h = held();
    MoveAgentStore.open(PANEL);
    const asking = MoveAgentStore.ask('run it');
    await h.started;
    const ran = h.stream().step('Running 12 pictures…');
    expect(MoveAgentStore.getView()?.steps).toEqual([{ label: 'Running 12 pictures…', state: 'running' }]);
    ran('done', 'Ran 12 pictures');
    h.stream().step('Looking…');
    h.answer('ok');
    await asking;
    expect(MoveAgentStore.getThread()[0].steps).toEqual([{ label: 'Ran 12 pictures', state: 'done' }, { label: 'Looking…', state: 'failed' }]);
  });
});
