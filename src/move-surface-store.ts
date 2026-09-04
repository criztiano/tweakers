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
 *   MoveSurfaceStore.claimRows(2);
 *   MoveSurfaceStore.setPads(steps.map((s, i) => ({
 *     x: i % 8, y: i < 8 ? 1 : 0, label: `${i + 17}`, lit: s.on,
 *   })));
 *
 * Leave it alone and the panel behaves exactly as it always has.
 */

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

/** The app's list on the Move's own 128×64 screen. */
export interface MoveScreenList {
  title?: string;
  items: string[];
  index: number;
}

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
    patch('pads', pads.filter((p) => p.x >= 0 && p.x < 8 && (p.y === 0 || p.y === 1)));
  },

  setSteps(steps: MoveStepCell[] | null) {
    patch('steps', steps === null ? null : steps.filter((s) => s.step >= 0 && s.step < 16));
  },

  setScreen(screen: MoveScreenList | null) {
    patch('screen', screen);
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
