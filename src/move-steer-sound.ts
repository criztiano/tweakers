import { MOVE_STEER_LOCK_WAV } from './sounds/steer-lock';

/**
 * The steering hand's lock sound: a short tick when ⌘ takes a control
 * (move-steer), so the hand hears what it caught. Cri's pick, kept inside
 * the code (`sounds/steer-lock`); it plays as it is mastered. Without a
 * sound to play the hand draws its own quick falling tick instead, at
 * `MOVE_STEER_LOCK_GAIN`.
 */
export const MOVE_STEER_LOCK_SOUND: string | null = MOVE_STEER_LOCK_WAV;
/** How loud the drawn tick plays, 0…1 — under the hand, never over the music. */
export const MOVE_STEER_LOCK_GAIN = 0.12;

let audio: AudioContext | null = null;
let sample: Promise<AudioBuffer | null> | null = null;

const context = () => {
  if (audio) return audio;
  const Context = typeof window !== 'undefined' ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) : undefined;
  audio = Context ? new Context() : null;
  return audio;
};

const load = (ctx: AudioContext, src: string) => {
  sample ??= fetch(src)
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))
    .catch(() => null);
  return sample;
};

/** The placeholder: a tick falling from 1.6 kHz, gone in 70 ms. */
const tick = (ctx: AudioContext, at: number) => {
  const osc = ctx.createOscillator();
  const level = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1600, at);
  osc.frequency.exponentialRampToValueAtTime(900, at + 0.04);
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(MOVE_STEER_LOCK_GAIN, at + 0.003);
  level.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
  osc.connect(level).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.08);
};

/** Gets the lock sound ready, so the first ⌘ already hears it on time. */
export function primeMoveSteerLock() {
  const ctx = context();
  if (ctx && MOVE_STEER_LOCK_SOUND) void load(ctx, MOVE_STEER_LOCK_SOUND);
}

/** Plays the lock sound. Silent where the page has no audio, or before the user has touched the page. */
export function playMoveSteerLock() {
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  if (!MOVE_STEER_LOCK_SOUND) { tick(ctx, ctx.currentTime); return; }
  void load(ctx, MOVE_STEER_LOCK_SOUND).then((buffer) => {
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start();
  });
}
