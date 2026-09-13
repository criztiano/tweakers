import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MoveFunctions, type MoveFunctionPress } from '../move-functions';
import { MOVE_FUNCTION_ICONS } from '../icons';
import { normalizeDeck, type MoveDeckAction } from '../move-deck-core';
import { MoveFunctionGlyphIcon } from './MoveFunctionChips';

/** How long a button stays lit after a press (screen or hardware). */
const PRESS_FLASH_MS = 160;

/** A deck action as the screen dresses it (Figma 935:537): the chip idiom —
 * the quiet slot surface by default, `highlight` for the pale hardware-key
 * look, one per deck for the action a view leans on. The icon is the key's
 * canonical glyph unless the action brings its own (a record dot). */
export type MoveDeckActionDress = MoveDeckAction & {
  variant?: 'highlight';
  icon?: ReactNode;
};

export interface MoveActionDeckProps {
  /** Up to four, one per deck key, in display order — see `normalizeDeck`. */
  actions: readonly MoveDeckActionDress[];
  className?: string;
}

function DeckButton({ action }: { action: MoveDeckActionDress }) {
  const [pressed, setPressed] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Hardware presses arrive as runs; screen clicks go through run() too, so
  // one listener flashes the button for both — the beat the key lights to.
  useEffect(() => {
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran !== action.button) return;
      setPressed(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [action.button]);

  return (
    <button
      type="button"
      className="tweakers-move-deck-action"
      data-name={action.button}
      data-variant={action.variant}
      data-pressed={pressed || undefined}
      disabled={action.disabled}
      onClick={() => {
        if (action.disabled) return;
        MoveFunctions.run(action.button, { shift: false });
      }}
    >
      {action.icon ?? <MoveFunctionGlyphIcon glyph={MOVE_FUNCTION_ICONS[action.button]} className="tweakers-move-deck-icon" />}
      <span className="tweakers-move-deck-label">{action.label}</span>
      {action.detail && <span className="tweakers-move-deck-detail">{action.detail}</span>}
    </button>
  );
}

/**
 * The action deck: a view's whole surface when it has nothing to set yet —
 * a start screen, a "what now" page — as up to four big buttons in the
 * page's middle, one per key whose meaning is the app's to give (the
 * Sampling key, Capture, Loop, Mute). Each speaks the chip voice — the slot
 * surface, or the pale key look for the one the view leans on — wearing its
 * key's glyph or an icon of its own, and the deck attaches the same
 * handler to that key through `MoveFunctions`: a screen click and a hardware
 * press run one function, both flash the button, and the key lights only
 * while its action is live — a disabled action leaves it dark. The deck is
 * the chip: its attachments render no header chip of their own.
 *
 * An alternative to the list screen and to a full panel, not a companion:
 * a view shows one of the three.
 */
export function MoveActionDeck({ actions, className }: MoveActionDeckProps) {
  const { actions: shown, warnings } = useMemo(
    () => normalizeDeck(actions) as { actions: MoveDeckActionDress[]; warnings: string[] },
    [actions]
  );

  useEffect(() => {
    for (const warning of warnings) console.warn(`[tweakers] action deck: ${warning}`);
  }, [warnings]);

  // The handlers are read through a ref so a view that rebuilds its actions
  // every render does not re-attach (and re-light) the keys each time; only
  // the set of live keys and their labels re-attaches.
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const signature = shown.map((a) => `${a.button}:${a.disabled ? '-' : '+'}${a.label}`).join('|');
  useEffect(() => {
    const detaches = shownRef.current
      .filter((a) => !a.disabled)
      .map((a) =>
        MoveFunctions.attach(
          a.button,
          (press: MoveFunctionPress) => shownRef.current.find((x) => x.button === a.button)?.onPress(press),
          { label: a.label, chip: false }
        )
      );
    return () => {
      for (const detach of detaches) detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (!shown.length) return null;
  return (
    <div className={className ? `tweakers-move-deck ${className}` : 'tweakers-move-deck'}>
      {shown.map((action) => (
        <DeckButton key={action.button} action={action} />
      ))}
    </div>
  );
}
