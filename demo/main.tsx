import { createRoot } from 'react-dom/client';
import { MovePanel } from '../src/components/MovePanel';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore } from '../src/store/ModulationStore';
import { MoveColorStore } from '../src/move-color';
import { MoveFunctions } from '../src/move-functions';
import { MovePresetStore } from '../src/move-presets';
import '../src/styles/theme.css';

// Two pages, so the track buttons have something to switch between.
TweakStore.registerPanel('tone', 'Tone', {
  level: [0.6, 0, 1],
  drive: [0.25, 0, 1],
  air: [0.4, 0, 1],
  width: [0.5, 0, 1],
});
TweakStore.registerPanel('space', 'Space', {
  size: [0.35, 0, 1],
  decay: [0.5, 0, 1],
  mix: [0.3, 0, 1],
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

// Keyboard stand-ins for the hardware. M = the Menu button (tap opens and
// dismisses; Shift+M is the long press, the save input). Holding C is the
// Mute button held — the compare, relayed raw like the kit does it.
// Backspace = Back, Enter = jog click, arrows = wheel detents.
const muteEvent = (pressed: boolean, shift: boolean) =>
  !window.dispatchEvent(new CustomEvent('move-tweakers:mute', { detail: { pressed, shift }, cancelable: true }));
window.addEventListener('keydown', (e) => {
  if (e.repeat || e.target instanceof HTMLInputElement) return;
  if (e.key.toLowerCase() === 'm') MoveFunctions.run('menu', { shift: e.shiftKey, hold: e.shiftKey });
  else if (e.key.toLowerCase() === 'c') muteEvent(true, e.shiftKey);
  else if (e.key === 'Backspace') MoveFunctions.run('back', {});
  else if (e.key === 'Enter') MovePresetStore.confirm();
  else if (e.key === 'ArrowDown') MovePresetStore.scroll(1);
  else if (e.key === 'ArrowUp') MovePresetStore.scroll(-1);
});
window.addEventListener('keyup', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key.toLowerCase() === 'c') muteEvent(false, e.shiftKey);
});

// The hardware, when the bridge is up: knobs, track buttons, Menu, wheel.
// No bridge (or no Move) is fine — the keyboard stand-ins above still work.
// @ts-ignore — remote module, no types
import(/* @vite-ignore */ 'http://localhost:7787/kit.js')
  .then((m) => m.bindMove(TweakStore, {
    functions: MoveFunctions,
    modulation: ModulationStore,
    color: MoveColorStore,
  }))
  .catch(() => {});

// Debug handles for poking the live stores from the console.
(window as any).__tweakers = { TweakStore, MovePresetStore, MoveFunctions };

createRoot(document.getElementById('root')!).render(
  <MovePanel productionEnabled theme="dark" />
);
