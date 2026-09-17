import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { MoveConnection } from '../move-connection';

export interface MoveConnectionDotProps {
  className?: string;
}

/**
 * Whether the Move is with this app, in six pixels at the window's bottom-left
 * corner: emerald while the Move is connected and following this app, red
 * while it is not — no bridge, no Move, or another app holding it. It says
 * the same in words to a screen reader and on hover.
 *
 * Mount one, anywhere; it pins itself to the window, clear of the views and
 * their transitions.
 */
export function MoveConnectionDot({ className }: MoveConnectionDotProps) {
  const live = useSyncExternalStore(MoveConnection.subscribe, MoveConnection.isLive, () => false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === 'undefined') return null;

  const label = live ? 'Move connected' : 'Move not connected';
  return createPortal(
    <div
      className={`tweakers-root tweakers-move-surface tweakers-move-link${className ? ` ${className}` : ''}`}
      data-live={live || undefined}
      role="status"
      aria-label={label}
      title={label}
    >
      <span className="tweakers-move-link-dot" aria-hidden="true" />
    </div>,
    document.body
  );
}
