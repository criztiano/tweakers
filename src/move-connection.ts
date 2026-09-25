/**
 * Whether the Move is with this page, as the bridge kit says it.
 *
 * The kit (`bindMove`) owns the event stream, so it is the one that knows:
 * it says `move-tweakers:connection` on the window — the bridge answering,
 * the Move itself there, and this page holding it — every time that changes.
 * This registry keeps the latest word, so anything drawing it (the
 * connection dot) reads a value rather than waiting for the next change; a
 * reader that arrives late asks (`move-tweakers:connection-ask`) and the kit
 * answers at once. With no kit bound — no bridge running — nothing is ever
 * said, and the Move reads as away.
 */

/** Said by the kit on every change of the connection. */
export const MOVE_CONNECTION_EVENT = 'move-tweakers:connection';
/** Said by a late reader, for the kit to say the connection again. */
export const MOVE_CONNECTION_ASK_EVENT = 'move-tweakers:connection-ask';

export interface MoveConnectionState {
  /** The bridge's event stream is open. */
  bridge: boolean;
  /** The Move itself is there, driving the surface. */
  device: boolean;
  /** This page holds the surface: on screen, its layout the one on the Move. */
  active: boolean;
}

const AWAY: MoveConnectionState = { bridge: false, device: false, active: false };

let state: MoveConnectionState = AWAY;
const listeners = new Set<() => void>();
let hearing = false;

function hear(event: Event) {
  const detail = (event as CustomEvent<Partial<MoveConnectionState> | null>).detail;
  const next: MoveConnectionState = { bridge: !!detail?.bridge, device: !!detail?.device, active: !!detail?.active };
  if (next.bridge === state.bridge && next.device === state.device && next.active === state.active) return;
  state = next;
  for (const fn of listeners) fn();
}

export const MoveConnection = {
  getState: (): MoveConnectionState => state,

  /** The Move is connected and following this page — all three at once. */
  isLive: (): boolean => state.bridge && state.device && state.active,

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    if (!hearing && typeof window !== 'undefined') {
      hearing = true;
      window.addEventListener(MOVE_CONNECTION_EVENT, hear);
      window.dispatchEvent(new CustomEvent(MOVE_CONNECTION_ASK_EVENT));
    }
    return () => {
      listeners.delete(fn);
    };
  },

  /** @internal Tests start from a page that has heard nothing. */
  resetForTest() {
    if (hearing && typeof window !== 'undefined') window.removeEventListener(MOVE_CONNECTION_EVENT, hear);
    hearing = false;
    state = AWAY;
    listeners.clear();
  },
};
