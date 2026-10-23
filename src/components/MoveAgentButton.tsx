import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { MoveAgentStore } from '../move-agent';
import type { TweakTheme } from '../theme';
import { MoveSlotGlyph } from './move-slots';

/**
 * The agent's own way in on screen, pinned to the window's top-right corner
 * opposite the Menu button: a click opens the conversation as the sheet, or
 * closes the prompt that is open. It needs no key of the instrument — a key
 * like Sampling means something else on most pages (Keep, on a grid) — so
 * the agent is one click away wherever the person is. Shown only for a host
 * that asks for it (`MoveAgentOptions.button`); hidden while the sheet stands
 * over its corner.
 */
export function MoveAgentButton({ theme }: { theme: TweakTheme }) {
  useSyncExternalStore(MoveAgentStore.subscribe, MoveAgentStore.getVersion, () => 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const view = MoveAgentStore.getView();
  if (!mounted || !MoveAgentStore.hasButton() || view?.sheet || typeof document === 'undefined') return null;
  return createPortal(
    <div className="tweakers-root tweakers-move-surface tweakers-move-agent-corner-button" data-theme={theme}>
      <button
        type="button"
        className="tweakers-move-menu-button"
        aria-label={view ? 'Close the agent' : 'Talk to the agent'}
        aria-expanded={!!view}
        title={view ? 'Close the agent' : 'Talk to the agent'}
        data-open={view ? true : undefined}
        onClick={() => (view ? MoveAgentStore.close() : MoveAgentStore.openSheet())}
      >
        <MoveSlotGlyph name="message-circle" className="tweakers-move-menu-icon" />
      </button>
    </div>,
    document.body,
  );
}
