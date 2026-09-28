import { createRoot } from 'react-dom/client';
import { MovePanel } from '../src/components/MovePanel';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore } from '../src/store/ModulationStore';
import { MoveFunctions } from '../src/move-functions';
import { MovePresetStore } from '../src/move-presets';
import { MoveSurfaceStore, type MoveScreenRow } from '../src/move-surface-store';
import { MoveAgentStore } from '../src/move-agent';
import { toAudioBuffer } from '../src/move-waveform';
import { MoveVolumeDisplay } from '../src/move-volume';
import { moveKitOptions } from '../src/move-kit';
import { formatAgentTime, type MoveAgentBoundary, type MoveAgentEntry, type MoveAgentOptions, type MoveAgentSegment } from '../src';
import { setAudioModBuffer } from '../src/modulation-core';
import '../src/styles/theme.css';

// Two pages, so the track buttons have something to switch between. Tone
// carries a stacked pair of pads under Level, so the page has the full
// slot-and-pads height — the wheel screen beside it runs the same height.
TweakStore.registerPanel('tone', 'Tone', {
  level: [0.6, 0, 1],
  drive: [0.25, 0, 1],
  air: [0.4, 0, 1],
  width: [0.5, 0, 1],
  punch: true,
  soft: false,
}, undefined, { movePads: { punch: 0, soft: 0 }, icon: 'audio-lines' });
TweakStore.registerPanel('space', 'Space', {
  size: [0.35, 0, 1],
  decay: [0.5, 0, 1],
  mix: [0.3, 0, 1],
}, undefined, { icon: 'waves' });

// The colour system, all three faces on one page: the integrated gradient
// editor in a big slot (tap it — the track row becomes its stops), two small
// colour selectors on the pad row, and the balance dial blending them.
TweakStore.registerPanel('paint', 'Paint', {
  ramp: { type: 'gradient', default: { type: 'linear', angle: 90, stops: [
    { color: '#1b2a4aff', position: 0 },
    { color: '#eb644dff', position: 0.55 },
    { color: '#f7e6b0ff', position: 1 },
  ] } },
  glow: [0.4, 0, 1],
  inkA: { type: 'color', default: '#632ad5' },
  inkB: { type: 'color', default: '#fccff7' },
  blend: { type: 'balance', a: 'inkA', b: 'inkB', default: 0.5 },
}, undefined, { icon: 'sparkles' });

// The settings room: master controls behind the Set Overview button
// (Shift + Step 1 on the hardware, the S key here). Named in MovePanel's
// `settings` prop below, so it never takes a track.
TweakStore.registerPanel('settings', 'Settings', {
  output: [0.8, 0, 1],
  latency: [0.2, 0, 1],
  brightness: [0.6, 0, 1],
  contrast: [0.5, 0, 1],
  midiChannel: { type: 'select', default: '1', options: ['1', '2', '3', '4'] },
  tuning: [440, 400, 480, 1],
  sleep: [0.3, 0, 1],
  ghost: [0.1, 0, 1],
  wake: [0.5, 0, 1],
  dim: [0.4, 0, 1],
  autosave: true,
  clicks: false,
});
// A second room page — the track buttons switch between these while the
// room is open, completely separate from Tone/Space.
TweakStore.registerPanel('system', 'System', {
  cpuGuard: [0.5, 0, 1],
  logLevel: { type: 'select', default: 'warn', options: ['off', 'warn', 'info', 'debug'] },
  telemetry: false,
});

// A few presets to walk through on the wheel.
for (const [name, level, drive, air] of [
  ['Clean', 0.5, 0.05, 0.3],
  ['Crunch', 0.7, 0.55, 0.45],
  ['Fuzz', 0.85, 0.9, 0.2],
  ['Whisper', 0.2, 0.0, 0.8],
] as const) {
  TweakStore.updateValue('tone', 'level', level);
  TweakStore.updateValue('tone', 'drive', drive);
  TweakStore.updateValue('tone', 'air', air);
  TweakStore.savePreset('tone', name);
}
TweakStore.clearActivePreset('tone');

// A looping ADSR on the first step, driving the tone level, with its
// settings page already open — so the envelope, its bend pads and its wave
// pads are the first thing on the surface. A track button puts the plain
// pages back.
// The slot persists, so this only lays it out the first time — whatever you
// shape here survives the reload.
if (!ModulationStore.getSlot(0)) {
  ModulationStore.createSlot(0, 'adsr');
  ModulationStore.updateSlotParams(0, { loop: true, attack: 400, decay: 700, release: 900 });
  ModulationStore.assign('tone', 'level', 0, 1);
}
ModulationStore.openSettings(0);

// A sample for the audio modulator — a two-second drum-ish loop, synthesized
// so the demo needs no files: eight decaying hits, alternating boom and snap.
// Tap the second step circle to open the slot and float the waveform editor:
// wheel (or scroll) zooms, volume knob scrubs, steps bracket the loop, the
// bottom pads jump around the shown window, Play/Loop run the transport.
{
  const rate = 44100;
  const seconds = 2;
  const data = new Float32Array(rate * seconds);
  for (let hit = 0; hit < 8; hit++) {
    const at = Math.floor((hit / 8) * data.length);
    const boom = hit % 2 === 0;
    const len = Math.floor(rate * (boom ? 0.22 : 0.12));
    for (let i = 0; i < len && at + i < data.length; i++) {
      const t = i / rate;
      const env = Math.exp(-t * (boom ? 18 : 42));
      const body = boom ? Math.sin(2 * Math.PI * 55 * t) : Math.sin(2 * Math.PI * 220 * t) * 0.4;
      const snap = boom ? 0 : (Math.random() * 2 - 1) * 0.5;
      data[at + i] += (body + snap) * env * 0.9;
    }
  }
  setAudioModBuffer(toAudioBuffer(data, rate));
  if (!ModulationStore.getSlot(1)) {
    ModulationStore.createSlot(1, 'audio');
    ModulationStore.assign('tone', 'drive', 1, 1);
  }
}

// The app's own list, on the wheel screen beside the slots: rows that settle
// a value where they stand, rows that lead somewhere, and rows you switch on
// and off. The host owns what a row means — a click is intent, exactly like a
// wheel turn — so the ticks and the cursor are kept right here. A modulator's
// settings page takes the surface over, list included: press a track button
// to put the pages (and this) back.
const TRACKS: MoveScreenRow[] = [
  'Drums',
  { label: 'Bass', checked: true },
  { label: 'Keys', checked: false },
  { label: 'Sends', detail: 'page' },
  { label: 'Rename…', detail: 'dialog' },
  { label: 'Back', detail: 'back' },
];
let cursor = 0;
const showTracks = () => MoveSurfaceStore.setScreen({ title: 'Tracks', items: TRACKS, index: cursor });
MoveSurfaceStore.onScreenSelect((index) => {
  cursor = index;
  // A row that leads somewhere is not a thing you switch: taking it is the
  // whole gesture. The others tick on and off under the cursor.
  const row = TRACKS[index];
  if (typeof row !== 'string' && row.checked !== undefined) row.checked = !row.checked;
  showTracks();
});
showTracks();

// The app's own function buttons — attached means lit on the hardware, and
// a labelled chip button (capture, loop, mute, sample) gets its header chip
// for free: one function, two surfaces. Capture snapshots the tone page
// into a preset — dressed in the kit's blue to show the palette option —
// and Loop flips the first modulator's loop in the quiet slot voice. Undo
// resets the dials with no chip: a printed key says what it does from the
// hardware.
let takes = 0;
MoveFunctions.attach('capture', () => {
  TweakStore.savePreset('tone', `Take ${++takes}`);
}, { label: 'Snapshot', chip: { color: 'blue' } });
MoveFunctions.attach('undo', () => {
  for (const [path, value] of [['level', 0.6], ['drive', 0.25], ['air', 0.4], ['width', 0.5]] as const) {
    TweakStore.updateValue('tone', path, value);
  }
});
MoveFunctions.attach('loop', () => {
  const slot = ModulationStore.getSlot(0);
  if (slot) ModulationStore.updateSlotParams(0, { loop: !slot.params.loop });
}, { label: 'Env loop' });

// The volume dial reads as the demo's session clock, so the header pill has
// a live readout beside the chips.
const startedAt = Date.now();
MoveVolumeDisplay.set({
  getValue: () => {
    const s = Math.floor((Date.now() - startedAt) / 1000);
    return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  },
});

// Keyboard stand-ins for the hardware. M = the Menu button (tap opens and
// dismisses; Shift+M is the long press, the save input). Holding C is the
// Mute button held — the compare, relayed raw like the kit does it.
// Backspace = Back, Enter = jog click, arrows = wheel detents. Shift+Enter is
// the wheel held down — the agent's prompt — relayed like the kit does it.
const muteEvent = (pressed: boolean, shift: boolean) =>
  !window.dispatchEvent(new CustomEvent('move-tweakers:mute', { detail: { pressed, shift }, cancelable: true }));
window.addEventListener('keydown', (e) => {
  if (e.repeat || e.target instanceof HTMLInputElement) return;
  if (e.key.toLowerCase() === 'm') MoveFunctions.run('menu', { shift: e.shiftKey, hold: e.shiftKey });
  else if (e.key.toLowerCase() === 'c') muteEvent(true, e.shiftKey);
  else if (e.key === ' ') { e.preventDefault(); MoveFunctions.run('play', {}); }
  else if (e.key.toLowerCase() === 'l') MoveFunctions.run('loop', {});
  else if (e.key.toLowerCase() === 's') MoveFunctions.run('set_overview', { shift: true, step: 0 });
  else if (e.key === 'Backspace') MoveFunctions.run('back', {});
  else if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); window.dispatchEvent(new CustomEvent('move-tweakers:jog-hold', { detail: { shift: false }, cancelable: true })); }
  else if (e.key === 'Enter') MovePresetStore.confirm();
  else if (e.key === 'ArrowDown') MovePresetStore.scroll(1);
  else if (e.key === 'ArrowUp') MovePresetStore.scroll(-1);
});
window.addEventListener('keyup', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key.toLowerCase() === 'c') muteEvent(false, e.shiftKey);
});

// A pretend media host, so the agent's senses can be tried with no editor
// behind them. One 60-second source, indexed by hand in SOURCE time: shots,
// bars, and where the singer comes in. The edit keeps two pieces of it —
// 5–25 s, then 40–55 s — so shot:2 and shot:4 are cut through (`partial`),
// shot:3 is gone, and everything after the join has moved. Hold the wheel
// (Shift+Enter) and ask "what shots are here?", "look at the join", or "trim
// to where the vocal comes in": the first read of the signal takes a second
// and a half, the look draws its own frames, and the trim only logs.
const SOURCE = 'demo.mov';
const INDEX: MoveAgentEntry[] = [
  { id: 'shot:1', type: 'shot', source: SOURCE, t0: 0, t1: 8, label: 'street, morning' },
  { id: 'shot:2', type: 'shot', source: SOURCE, t0: 8, t1: 22, label: 'beach, two people' },
  { id: 'shot:3', type: 'shot', source: SOURCE, t0: 22, t1: 41, label: 'interview, close' },
  { id: 'shot:4', type: 'shot', source: SOURCE, t0: 41, t1: 60, label: 'beach, sunset' },
  ...Array.from({ length: 30 }, (_, i): MoveAgentEntry => ({ id: `bar:${i + 1}`, type: 'bar', source: SOURCE, t0: i * 2 })),
  { id: 'vocal_in:1', type: 'event', source: SOURCE, t0: 12.4, label: 'vocals enter' },
  { id: 'vocal_in:2', type: 'event', source: SOURCE, t0: 44.2, label: 'vocals enter, second verse' },
];
const EDIT: MoveAgentSegment[] = [
  { source: SOURCE, srcIn: 5, srcOut: 25, at: 0 },
  { source: SOURCE, srcIn: 40, srcOut: 55, at: 20 },
];
let indexed = false;
const pretendHost: MoveAgentOptions = {
  context: 'A demo: tone and colour panels, and a pretend 35-second edit of one video with music.',
  editMap: () => EDIT,
  scene: () => ({
    edit: EDIT.map((s) => `${s.source} ${s.srcIn}–${s.srcOut} s, at ${formatAgentTime(s.at)}`),
    // Entries listed here are known boundaries from the start, with no read.
    entries: INDEX.filter((e) => e.id === 'vocal_in:1'),
  }),
  signals: [{
    id: 'structure', label: 'Structure', hint: 'Shots (with what is in them), bars, and where the vocal comes in.',
    cost: 'about 2 s the first time',
    state: () => (indexed ? 'ready' : 'missing'),
    read: async (range, signal) => {
      if (!indexed) await new Promise<void>((done, fail) => {
        const timer = setTimeout(done, 1500);
        signal.addEventListener('abort', () => { clearTimeout(timer); fail(new Error('aborted')); }, { once: true });
      });
      indexed = true;
      return range ? INDEX.filter((e) => range.some((r) => e.source === r.source && (e.t1 ?? e.t0) >= r.t0 && e.t0 <= r.t1)) : INDEX;
    },
  }],
  tools: [{
    id: 'look', label: 'Look at the frames', kind: 'perceive', progress: 'Looking at the frames…',
    hint: 'A contact sheet of a timeline range: six frames, each with its time drawn in. Only to check or refine what a signal already found.',
    cost: 'a few seconds',
    params: { from: { type: 'number', min: 0, max: 35, hint: 'timeline seconds' }, to: { type: 'number', min: 0, max: 35, hint: 'timeline seconds' } },
    run: async ({ from, to }) => {
      const a = Math.min(from as number, to as number), b = Math.max(from as number, to as number), tiles = 6;
      const canvas = Object.assign(document.createElement('canvas'), { width: tiles * 160, height: 90 });
      const ctx = canvas.getContext('2d')!;
      const times = Array.from({ length: tiles }, (_, i) => a + ((b - a) * (i + 0.5)) / tiles);
      times.forEach((t, i) => {
        // A frame is its shot's colour: a cut shows as a change of colour.
        const segment = EDIT.find((s) => t >= s.at && t < s.at + (s.srcOut - s.srcIn));
        const src = segment ? segment.srcIn + (t - segment.at) : -1;
        const shot = INDEX.findIndex((e) => e.type === 'shot' && src >= e.t0 && src < (e.t1 ?? e.t0));
        ctx.fillStyle = shot < 0 ? '#111' : `hsl(${shot * 80 + 20} 55% 42%)`;
        ctx.fillRect(i * 160, 0, 158, 90);
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(formatAgentTime(t), i * 160 + 8, 80);
      });
      return { text: `Six frames, left to right, at ${times.map(formatAgentTime).join(', ')}.`, images: [{ name: 'frames.jpg', dataUrl: canvas.toDataURL('image/jpeg', 0.8) }] };
    },
  }],
  actions: [{
    id: 'trim_to', label: 'Trim to', hint: 'End the edit at a boundary. Name the boundary; never a time.',
    params: { at: { type: 'boundary', hint: 'an edge of an entry a signal or the scene has shown' } },
    run: ({ at }) => {
      const { entry, edge, sourceTime, time } = at as MoveAgentBoundary;
      console.log(`[demo] trim to the ${edge} of ${entry}: source ${formatAgentTime(sourceTime)}, timeline ${time === undefined ? 'not in the edit' : formatAgentTime(time)}`);
      return () => console.log(`[demo] trim to ${entry} undone`);
    },
  }],
  checkpoint: () => console.log('[demo] checkpoint before the edit lands'),
};

// The hardware, when the bridge is up: knobs, track buttons, Menu, wheel.
// No bridge (or no Move) is fine — the keyboard stand-ins above still work.
//
// `?bridge=http://localhost:7799` points the demo at another bridge — a
// private local-engine one on a spare port. That is how this page is checked
// in a browser nobody is sitting at: there is one Move, and whoever binds it
// owns it, so an automated run takes its own bridge and leaves the live one
// to the hand playing it. (The kit refuses the live bridge from an automated
// browser anyway; this is what it refuses you IN FAVOUR of.)
const bridge = (new URLSearchParams(location.search).get('bridge') || 'http://localhost:7787')
  .replace(/\/+$/, '');
// @ts-ignore — remote module, no types
import(/* @vite-ignore */ `${bridge}/kit.js`)
  .then((m) => m.bindMove(TweakStore, moveKitOptions({ url: bridge, agent: pretendHost })))
  // No bridge, no bind — the agent still follows `?bridge=`, for a bridge that serves no kit.
  .catch(() => { moveKitOptions({ url: bridge, agent: pretendHost }); });

// Debug handles for poking the live stores from the console.
(window as any).__tweakers = { TweakStore, MovePresetStore, MoveFunctions, MoveAgentStore };

createRoot(document.getElementById('root')!).render(
  <MovePanel productionEnabled theme="dark" settings={["Settings", "System"]} />
);
