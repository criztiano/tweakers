import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { MoveFunctions } from '../move-functions';
import { MOVE_FUNCTION_ICONS } from '../icons';
import type { TweakTheme } from '../theme';
import { MoveFunctionGlyphIcon } from './MoveFunctionChips';

/** A press held this long is the Menu button's hold — the kit's long press. */
export const MOVE_MENU_HOLD_MS = 450;

/**
 * The Move's Menu button on screen, pinned to the window's top-right corner:
 * a click is a press — the preset navigator, or the palettes while the
 * colour editor is up — a held press is the hold (exploration), and
 * Shift+click the Shift layer (save). It runs whatever Menu means right now,
 * so screen and hardware can never disagree. `open` lights it while what it
 * opened is up.
 */
export function MoveMenuButton({ theme, open, label }: { theme: TweakTheme; open: boolean; label: string }) {
  const attached = useSyncExternalStore((fn) => MoveFunctions.subscribe(fn), () => MoveFunctions.list().includes('menu'), () => false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!mounted || !attached || typeof document === 'undefined') return null;

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return createPortal(
    <div className="tweakers-root tweakers-move-surface tweakers-move-menu" data-theme={theme}>
      <button
        type="button"
        className="tweakers-move-menu-button"
        aria-label={label}
        aria-expanded={open}
        title={label}
        data-open={open || undefined}
        onPointerDown={(e) => {
          if (e.button > 0) return;
          cancel();
          timer.current = setTimeout(() => {
            timer.current = null;
            MoveFunctions.run('menu', { hold: true });
          }, MOVE_MENU_HOLD_MS);
        }}
        onPointerUp={(e) => {
          if (!timer.current) return;
          cancel();
          MoveFunctions.run('menu', { shift: e.shiftKey });
        }}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onClick={(e) => {
          // The keyboard's Enter and Space arrive as a click with no pointer.
          if (e.detail === 0) MoveFunctions.run('menu', { shift: e.shiftKey });
        }}
      >
        <MoveFunctionGlyphIcon glyph={MOVE_FUNCTION_ICONS.menu} className="tweakers-move-menu-icon" />
      </button>
    </div>,
    document.body
  );
}
