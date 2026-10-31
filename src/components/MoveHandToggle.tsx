import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { TweakStore } from '../store/TweakStore';
import { MOVE_PANEL_SETTINGS } from '../move-track-labels';
import type { TweakTheme } from '../theme';
import { MoveSlotGlyph } from './move-slots';

/**
 * The steering hand's switch, beside the Menu button in the window's
 * top-left corner: on, the pointer over the panel's controls is the hand
 * (move-steer); off, the pointer stays free, and the control under it is the
 * one in the hand — ⌘, two fingers and the keys still turn it. It is the
 * Panel settings page's `steerHand`, so the choice persists.
 */
export function MoveHandToggle({ theme }: { theme: TweakTheme }) {
  const on = useSyncExternalStore(
    useCallback((cb) => TweakStore.subscribe(MOVE_PANEL_SETTINGS, cb), []),
    () => TweakStore.getValues(MOVE_PANEL_SETTINGS)?.steerHand !== false,
    () => true,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === 'undefined' || !TweakStore.getPanel(MOVE_PANEL_SETTINGS)) return null;
  return createPortal(
    <div className="tweakers-root tweakers-move-surface tweakers-move-hand-toggle" data-theme={theme}>
      <button
        type="button"
        className="tweakers-move-menu-button"
        aria-label="Panel hand"
        aria-pressed={on}
        title={on ? 'Panel hand: the pointer holds the controls' : 'Panel hand: off — the pointer moves freely'}
        data-open={on || undefined}
        onClick={() => TweakStore.updateValue(MOVE_PANEL_SETTINGS, 'steerHand', !on)}
      >
        <MoveSlotGlyph name="mouse-pointer-2" className="tweakers-move-menu-icon" />
      </button>
    </div>,
    document.body,
  );
}
