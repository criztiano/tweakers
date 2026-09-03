import React, { useEffect, useRef, useState } from 'react';
import { MoveFunctions, type MoveFunctionButton } from '../move-functions';
import { ICON_MOVE_CAPTURE, ICON_MOVE_ENTER } from '../icons';

/** How long the button stays lit after a press (screen or hardware). */
const PRESS_FLASH_MS = 160;

/** Which hardware function each kind rides — fixed, like the colours.
 * `shift` is absent on purpose: Shift is reserved and never claimable,
 * so a shift pill rides no function at all. */
const KIND_FUNCTION: Record<'enter' | 'capture', MoveFunctionButton> = {
  enter: 'jog_click',
  capture: 'capture',
};

export interface MoveActionButtonProps {
  /**
   * The hardware button this action rides, which fixes the styling:
   * `enter` is the wheel's click — track 4's green with the dot glyph —
   * `capture` is the capture button — track 1's blue with the
   * four-corners glyph — and `shift` is the shift key — the surface's
   * light neutral, wearing the same dot in the pill's dark text colour.
   * The pairing matches the physical Move, so the on-screen button
   * always looks like the key that triggers it.
   * Shift is reserved on the hardware and never claimable, so
   * `kind="shift"` is purely visual: it runs no Move function, only its
   * own `onPress` — the app wires the hardware gesture (a shift tap)
   * itself.
   */
  kind: 'enter' | 'capture' | 'shift';
  /** The label. */
  children: React.ReactNode;
  /** Runs after the attached Move function, on a screen click. */
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A free-standing Move action button, placed wherever the view wants it —
 * the same pill the panel header used to carry. Clicking it runs whatever
 * the app attached to the matching hardware button (`jog_click` for enter,
 * `capture` for capture) through MoveFunctions, and both screen clicks and
 * hardware presses flash it briefly. Disabled buttons dim to 40% and run
 * nothing. Every kind carries its hardware glyph — the shift pill wears the
 * enter dot in black, since a shift tap confirms the same way.
 */
export function MoveActionButton({ kind, children, onPress, disabled, className }: MoveActionButtonProps) {
  const name = kind === 'shift' ? null : KIND_FUNCTION[kind];
  const [pressed, setPressed] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash = () => {
    setPressed(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS);
  };

  // Hardware presses arrive as runs; screen clicks go through run() too, so
  // one listener flashes the button for both. A shift pill rides no function,
  // so it has nothing to listen for — its clicks flash it directly below.
  useEffect(() => {
    if (!name) return () => clearTimeout(flashTimer.current);
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran === name) flash();
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [name]);

  return (
    <button
      className={className ? `tweakers-move-action ${className}` : 'tweakers-move-action'}
      data-kind={kind}
      data-pressed={pressed || undefined}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        if (name) MoveFunctions.run(name, { name, shift: false });
        else flash();
        onPress?.();
      }}
    >
      {kind === 'capture' ? (
        <svg className="tweakers-move-action-icon" width="14" height="14" viewBox={ICON_MOVE_CAPTURE.viewBox} fill="none">
          <path d={ICON_MOVE_CAPTURE.path} fill="currentColor" />
        </svg>
      ) : (
        // Enter and shift share the dot: it is drawn with currentColor, so it
        // comes out light-on-green on the enter pill and black on the light
        // shift pill without a second asset.
        <svg className="tweakers-move-action-icon" width="12" height="12" viewBox={ICON_MOVE_ENTER.viewBox} fill="none">
          <circle {...ICON_MOVE_ENTER.circle} fill="currentColor" />
        </svg>
      )}
      {children}
    </button>
  );
}
