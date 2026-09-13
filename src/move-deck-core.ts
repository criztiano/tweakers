/**
 * The action deck's rule, on its own so node can test it without React: a
 * view that has nothing to set yet — a start screen, a "what now" page —
 * hands the Move at most four actions, one per key whose meaning is the
 * app's to give (`MOVE_CHIP_BUTTONS`: Sampling, Capture, Mute, Loop). The
 * deck shows each as a big button in the page's middle and attaches the same
 * handler to the hardware key, so the screen and the hand agree.
 */

import { MOVE_CHIP_BUTTONS, type MoveFunctionPress } from './move-functions';

/** The keys a deck action may ride — the four chip buttons, no others. */
export type MoveDeckButton = (typeof MOVE_CHIP_BUTTONS)[number];

/** How many actions a deck carries at most: one per deck key. */
export const MOVE_DECK_MAX = MOVE_CHIP_BUTTONS.length;

export interface MoveDeckAction {
  /** The hardware key this action rides; it fixes the button's look. */
  button: MoveDeckButton;
  /** What the action does in this app — the big button's word. */
  label: string;
  /** A quieter second line under the label ("or drop a file here"). */
  detail?: string;
  /** Runs on a screen click and on the hardware press alike. */
  onPress: (press: MoveFunctionPress) => void;
  /** A disabled action dims, runs nothing and leaves its key dark. */
  disabled?: boolean;
}

/**
 * Keep what the deck can show, in the order given: an action on a key that
 * is not a deck key is dropped, a second action on a key already taken is
 * dropped (the first wins — one key, one meaning), and anything past the
 * fourth is dropped. Every drop is named so the app can hear about it.
 */
export function normalizeDeck(actions: readonly MoveDeckAction[]): {
  actions: MoveDeckAction[];
  warnings: string[];
} {
  const kept: MoveDeckAction[] = [];
  const warnings: string[] = [];
  const taken = new Set<string>();
  for (const action of actions) {
    if (!(MOVE_CHIP_BUTTONS as readonly string[]).includes(action.button)) {
      warnings.push(`"${action.button}" is not a deck key; expected one of: ${MOVE_CHIP_BUTTONS.join(', ')}`);
      continue;
    }
    if (taken.has(action.button)) {
      warnings.push(`"${action.button}" already carries "${kept.find((a) => a.button === action.button)?.label}"; "${action.label}" dropped`);
      continue;
    }
    if (kept.length >= MOVE_DECK_MAX) {
      warnings.push(`a deck carries at most ${MOVE_DECK_MAX} actions; "${action.label}" dropped`);
      continue;
    }
    taken.add(action.button);
    kept.push(action);
  }
  return { actions: kept, warnings };
}
