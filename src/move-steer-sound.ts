/**
 * The steering hand's lock sound: a short tick when ⌘ takes a control
 * (move-steer), so the hand hears what it caught.
 *
 * PLACEHOLDER: until Cri picks the real sound it is drawn here, a quick
 * falling tick. To put the real one in, add the file as
 * `src/sounds/steer-lock.<wav|mp3|ogg>`, give tsup the `dataurl` loader for
 * that extension (the sound then rides inside the bundle, so no app needs a
 * loader of its own), import it here and set `MOVE_STEER_LOCK_SOUND` to the
 * import. The file plays as it is mastered.
 */
export const MOVE_STEER_LOCK_SOUND: string | null = null;
/** How loud the placeholder tick plays, 0…1 — under the hand, never over the music. */
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
