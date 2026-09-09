/**
 * What an app puts on the Move that its parameters cannot describe.
 *
 * The bridge kit builds pages out of the TweakStore, which covers every
 * control an app declares — dials, switches, value chips. An app that also
 * claims raw hardware (the two bottom pad rows, the sixteen step buttons)
 * owns that part itself and posts it to the surface directly, so the store
 * knows nothing about it. This is the same picture kept for the screen, so
 * the on-screen Move goes on mirroring what is in your hands.
 *
 * Set it from the same code that paints the hardware:
 *
 *   MoveSurfaceStore.setPadRows(2, steps.map((s, i) => ({
 *     x: i % 8, y: i < 8 ? 1 : 0, label: `${i + 17}`, lit: s.on,
 *   })));
 *
 * Leave it alone and the panel behaves exactly as it always has.
 */

import type { ListScreenDetail } from './components/ListScreen';

/** One pad on a claimed row. `y` is 0 for the bottom row, 1 for the one above. */
export interface MovePadCell {
  x: number;
  y: 0 | 1;
  /** What the pad is — a step number, a slice, a note name. */
  label?: string;
  /** CSS colour when lit. Omitted takes the panel's own accent. */
  color?: string;
  /** Lit right now. An unlit pad still shows it exists, dimmed. */
  lit?: boolean;
  /** Nothing here to press — the pad reads as empty rather than dim. */
  empty?: boolean;
}

/** One of the sixteen step buttons, when an app owns them. */
export interface MoveStepCell {
  /** 0–15. */
  step: number;
  color?: string;
  lit?: boolean;
}

/** One row of the app's list. A plain string is a row that settles a value
 * where it stands; the object form adds where the row leads and whether it is
 * switched on, which the panel draws as a mark at the row's end. */
export type MoveScreenRow =
  | string
  | { label: string; detail?: ListScreenDetail; checked?: boolean };

/** The app's list on the Move's own 128×64 screen. */
export interface MoveScreenList {
  title?: string;
  items: MoveScreenRow[];
  index: number;
}

/** A row's label, whichever form the host wrote it in. */
export const moveScreenRowLabel = (row: MoveScreenRow): string =>
  typeof row === 'string' ? row : row.label;

/** The rows a list has switched on, by index — what the hardware screen needs
 * to mark them, since it takes labels rather than rows. */
export const moveScreenChecked = (rows: MoveScreenRow[]): number[] =>
  rows.flatMap((row, i) => (typeof row !== 'string' && row.checked ? [i] : []));

export interface MoveSurfaceState {
  /** Pad rows the app claimed: 0 (none), 1 (the bottom row), or 2. */
  rows: 0 | 1 | 2;
  pads: MovePadCell[];
  /** null hands the step circles back to the modulation slots. */
  steps: MoveStepCell[] | null;
  screen: MoveScreenList | null;
}

type Listener = () => void;
type PressListener = (pad: { x: number; y: 0 | 1 }) => void;

const EMPTY: MoveSurfaceState = { rows: 0, pads: [], steps: null, screen: null };

let state: MoveSurfaceState = EMPTY;
const listeners = new Set<Listener>();
const pressListeners = new Set<PressListener>();
const screenSelectListeners = new Set<(index: number) => void>();

const emit = () => {
  for (const fn of listeners) fn();
};

/** Replace one field, and stay silent when nothing actually moved — the panel
 *  reads this through useSyncExternalStore, which re-renders on any new
 *  reference. Payloads are at most sixteen small cells, so comparing them
 *  serialized costs less than the render it saves. */
function patch<K extends keyof MoveSurfaceState>(key: K, value: MoveSurfaceState[K]) {
  if (JSON.stringify(state[key]) === JSON.stringify(value)) return;
  state = { ...state, [key]: value };
  emit();
}

const validPads = (pads: MovePadCell[]): MovePadCell[] =>
  pads.filter((p) => p.x >= 0 && p.x < 8 && (p.y === 0 || p.y === 1));

/** Rows and their cells are one piece of surface geometry. Publishing them
 * together prevents subscribers from ever painting the new row count with
 * the old cells (or the new cells inside the old row count). */
function patchPadRows(rows: 0 | 1 | 2, pads: MovePadCell[]) {
  const nextPads = validPads(pads);
  if (state.rows === rows && JSON.stringify(state.pads) === JSON.stringify(nextPads)) return;
  state = { ...state, rows, pads: nextPads };
  emit();
}

export const MoveSurfaceStore = {
  getState: (): MoveSurfaceState => state,

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** How many bottom pad rows the app took (matches `claims.pads` on the wire). */
  claimRows(rows: 0 | 1 | 2) {
    patch('rows', rows);
  },

  setPads(pads: MovePadCell[]) {
    patch('pads', validPads(pads));
  },

  /** Publish the claimed row count and its cells as one renderable state. */
  setPadRows(rows: 0 | 1 | 2, pads: MovePadCell[]) {
    patchPadRows(rows, pads);
  },

  setSteps(steps: MoveStepCell[] | null) {
    patch('steps', steps === null ? null : steps.filter((s) => s.step >= 0 && s.step < 16));
  },

  setScreen(screen: MoveScreenList | null) {
    patch('screen', screen);
  },

  /** Selection intent from the panel's wheel screen; the host owns the value,
   *  exactly as it owns what a hardware wheel turn means. */
  onScreenSelect(fn: (index: number) => void): () => void {
    screenSelectListeners.add(fn);
    return () => screenSelectListeners.delete(fn);
  },

  selectScreen(index: number) {
    if (!state.screen || !Number.isInteger(index) || index < 0 || index >= state.screen.items.length) return;
    for (const fn of screenSelectListeners) fn(index);
  },

  /** A tap on an on-screen pad, for the host to treat like a hardware press. */
  onPress(fn: PressListener): () => void {
    pressListeners.add(fn);
    return () => pressListeners.delete(fn);
  },

  press(x: number, y: 0 | 1) {
    for (const fn of pressListeners) fn({ x, y });
  },

  /** Hand the whole surface back — the panel returns to its plain layout. */
  reset() {
    if (state === EMPTY) return;
    state = EMPTY;
    emit();
  },
};
