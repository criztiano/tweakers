import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { MovePanel } from '../src/components/MovePanel';
import { TweakStore } from '../src/store/TweakStore';
import { MoveAgentStore, type MoveAgentAsk, type MoveAgentStream } from '../src/move-agent';
import '../src/styles/theme.css';

/*
 * The agent's prompt, every state one click away. A pretend transport plays
 * each scenario — a wait, a question back, a reply that streams with options
 * landing as they are written, a plain Done, a failure — against the real
 * box, so it can be looked at and tuned without a bridge or a model.
 */

TweakStore.registerPanel('tone', 'Tone', {
  level: [0.6, 0, 1],
  drive: [0.25, 0, 1],
  air: [0.4, 0, 1],
  width: [0.5, 0, 1],
}, undefined, { icon: 'audio-lines' });

// What the "write option" verb has landed, shown in the lab's sidebar.
let options: string[] = [];
const listeners = new Set<() => void>();
const setOptions = (next: string[]) => { options = next; listeners.forEach((fn) => fn()); };
const useOptions = () => useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => options);

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((done, fail) => {
  const timer = setTimeout(done, ms);
  signal.addEventListener('abort', () => { clearTimeout(timer); fail(new Error('aborted')); }, { once: true });
});

/** Say a sentence a few words at a time, the way a model writes it. */
async function stream(text: string, out: MoveAgentStream, signal: AbortSignal) {
  const words = text.split(' ');
  for (let i = 1; i <= words.length; i++) {
    await wait(45, signal);
    out.say(words.slice(0, i).join(' '));
  }
}

const OPTIONS = [
  'A wide beach at first light, two figures small against pale sand, long soft shadows.',
  'Close on hands sorting shells, warm side light, shallow focus, the sea a blur behind.',
  'An aerial view: the tide line as one bright curve across the frame, people as dots.',
  'Dusk, the same beach, a single lantern, deep blue sky with the last orange at the edge.',
];

type Scenario = (out: MoveAgentStream, signal: AbortSignal) => Promise<Awaited<ReturnType<MoveAgentAsk>>>;
const SCENARIOS: Record<string, { label: string; ask: string; run: Scenario }> = {
  question: {
    label: 'Receive a question back', ask: 'a picture of a beach',
    run: async (out, signal) => {
      await wait(1600, signal);
      await stream('What time of day are you after — first light, midday, or dusk? And should there be people in it?', out, signal);
      // What is typed next gets options back.
      scenario = SCENARIOS.options.run;
      return { writes: [] };
    },
  },
  options: {
    label: 'Reply streams, options land one by one', ask: 'morning and dusk, a couple of people',
    run: async (out, signal) => {
      await wait(1200, signal);
      await stream('Four takes: two at first light, one from above, one at dusk.', out, signal);
      for (let i = 0; i < OPTIONS.length; i++) {
        await wait(700, signal);
        await out.act({ id: 'write_option', params: { text: OPTIONS[i] } });
      }
      return { writes: [] };
    },
  },
  done: {
    label: 'Done — the dials turned', ask: 'warmer and wider',
    run: async (_out, signal) => {
      await wait(1400, signal);
      return { writes: [{ id: 'tone::drive', value: 0.55 }, { id: 'tone::width', value: 0.85 }] };
    },
  },
  long: {
    label: 'A long wait', ask: 'rethink the whole look from scratch, slowly',
    run: async (out, signal) => {
      await wait(6000, signal);
      await stream('Here is a calmer start: less drive, more air.', out, signal);
      return { writes: [{ id: 'tone::drive', value: 0.1 }, { id: 'tone::air', value: 0.8 }] };
    },
  },
  error: {
    label: 'Delivery failure', ask: 'brighter',
    run: async (_out, signal) => {
      await wait(1000, signal);
      throw new Error('The agent did not answer. Try again.');
    },
  },
};

let scenario: Scenario = SCENARIOS.question.run;
MoveAgentStore.configure({
  panels: ['tone'],
  actions: [{
    id: 'write_option', label: 'Write an option', params: { text: { type: 'string' } },
    run: ({ text }) => {
      const before = options;
      setOptions([...options, String(text)]);
      return () => setOptions(before);
    },
  }],
  // What is typed plays the scenario last chosen.
  ask: (_request, signal, out) => scenario(out, signal),
});

function play(key: keyof typeof SCENARIOS) {
  const s = SCENARIOS[key];
  scenario = s.run;
  MoveAgentStore.open('tone');
  void MoveAgentStore.ask(s.ask);
}

function Lab() {
  const landed = useOptions();
  return (
    <>
      <nav className="lab">
        <h1>Agent prompt lab</h1>
        <h2>Open</h2>
        <button type="button" onClick={() => { MoveAgentStore.close(); MoveAgentStore.open('tone'); }}>New conversation</button>
        <button type="button" onClick={() => MoveAgentStore.close()}>Close</button>
        <h2>Ask</h2>
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <button key={key} type="button" onClick={() => play(key)}>{s.label}</button>
        ))}
        <h2>After</h2>
        <button type="button" onClick={() => void MoveAgentStore.undo()}>Undo the last answer</button>
        <h2>Options landed</h2>
        {landed.length ? <ol>{landed.map((o, i) => <li key={i}>{o}</li>)}</ol> : <ol><li style={{ listStyle: 'none', marginLeft: -20 }}>none yet</li></ol>}
      </nav>
      <div className="stage">
        <MovePanel productionEnabled theme="dark" dock="flow" />
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Lab />);
