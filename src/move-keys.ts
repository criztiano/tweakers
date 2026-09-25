import { MoveFunctions, type MoveFunctionButton } from './move-functions';

/**
 * The computer's keys for the Move's editing buttons, so a hand on the
 * keyboard has what a hand on the Move has: ⌘Z (Ctrl+Z) is Undo, ⇧⌘Z its
 * Shift layer; Backspace and Delete are Delete; ⌘C is Copy. A key runs only
 * what is attached to its button — nothing attached, the browser keeps it —
 * and never while a text field has the keys, or while a selection of text
 * is what ⌘C would copy. A handler that already took the key
 * (preventDefault) keeps it.
 */
export function moveKeyButton(event: KeyboardEvent): MoveFunctionButton | null {
  const mod = event.metaKey || event.ctrlKey;
  if (event.altKey) return null;
  const key = event.key.toLowerCase();
  if (mod && key === 'z') return 'undo';
  if (mod && key === 'c') return 'copy';
  if (!mod && (event.key === 'Backspace' || event.key === 'Delete')) return 'delete';
  return null;
}

const typing = (target: EventTarget | null): boolean => {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return true;
  return false;
};

const onKey = (event: KeyboardEvent) => {
  if (event.defaultPrevented || typing(event.target)) return;
  const name = moveKeyButton(event);
  if (!name || !MoveFunctions.list().includes(name)) return;
  if (name === 'copy' && String(window.getSelection?.() ?? '').length > 0) return;
  event.preventDefault();
  MoveFunctions.run(name, { shift: event.shiftKey });
};

let holders = 0;

/** Listen for the keys while any panel is up; one listener however many
 *  panels ask. Returns the release. */
export function attachMoveKeys(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (holders++ === 0) window.addEventListener('keydown', onKey);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--holders === 0) window.removeEventListener('keydown', onKey);
  };
}
