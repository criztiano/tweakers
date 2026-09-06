import { MoveFunctions, MovePresetStore, MOVE_JOG_EVENT, MOVE_JOG_CLICK_EVENT, MOVE_MUTE_EVENT } from 'tweakers';

/**
 * The Move's buttons, on a keyboard — so the library can be worked without
 * the hardware plugged in, and so every gesture in it has a way to be tried.
 *
 * The events are the kit's own, dispatched exactly as the bridge dispatches
 * them (cancelable, same detail), and the buttons run through MoveFunctions:
 * nothing here is a second code path, it is the same wire with fingers made
 * of keys.
 */
export const KEYS: { keys: string; button: string; what: string }[] = [
  { keys: 'M', button: 'Menu', what: 'opens the preset navigator — tap again to put your settings back' },
  { keys: 'Shift M', button: 'Menu, held', what: 'the save input: name what is on the slots now' },
  { keys: '↑ ↓', button: 'the big wheel', what: 'walks the open list — every row plays as you rest on it' },
  { keys: '← →', button: 'the arrows', what: 'pages the slots, eight at a time' },
  { keys: 'Enter', button: 'the wheel pressed', what: 'keeps the row you are on' },
  { keys: 'Backspace', button: 'Back', what: 'puts your old settings back and dismisses' },
  { keys: 'C held', button: 'Mute, held', what: 'plays the settings you came in with, to compare' },
  { keys: 'wheel', button: 'the big wheel', what: 'over the panel: the strip, or the open list' },
];

const jog = (delta: number, shift = false) =>
  window.dispatchEvent(new CustomEvent(MOVE_JOG_EVENT, { detail: { delta, shift }, cancelable: true }));
const mute = (pressed: boolean, shift: boolean) =>
  window.dispatchEvent(new CustomEvent(MOVE_MUTE_EVENT, { detail: { pressed, shift }, cancelable: true }));

/** Wires the stand-ins to the window; returns a teardown. */
export function bindKeyboardHardware(): () => void {
  const typing = (e: KeyboardEvent) =>
    e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat || typing(e)) return;
    const key = e.key.toLowerCase();
    if (key === 'm') MoveFunctions.run('menu', { shift: e.shiftKey, hold: e.shiftKey });
    else if (key === 'c') mute(true, e.shiftKey);
    else if (e.key === 'Backspace') MoveFunctions.run('back', {});
    else if (e.key === 'Enter') window.dispatchEvent(new CustomEvent(MOVE_JOG_CLICK_EVENT, { detail: { shift: e.shiftKey }, cancelable: true }));
    else if (e.key === 'ArrowDown') jog(1, e.shiftKey);
    else if (e.key === 'ArrowUp') jog(-1, e.shiftKey);
    else if (e.key === 'ArrowRight') MoveFunctions.run('right', { shift: e.shiftKey });
    else if (e.key === 'ArrowLeft') MoveFunctions.run('left', { shift: e.shiftKey });
    else return;
    e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (typing(e)) return;
    if (e.key.toLowerCase() === 'c') mute(false, e.shiftKey);
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
}

/** The Menu button, for a page that has one on screen instead of in the hand. */
export const openPresets = (panelId: string) => MovePresetStore.toggle(panelId);
export const savePreset = (panelId: string) => MovePresetStore.beginSave(panelId);
