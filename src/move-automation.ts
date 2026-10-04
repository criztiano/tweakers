import type { AutomationLanesStore } from './automation-store';
import { MOVE_CONNECTION_EVENT } from './move-connection';

/** The bridge kit's knob-touch event (`MOVE_TOUCH_EVENT` in MovePanel) — named
 *  here too so this module does not pull the panel in. */
const TOUCH_EVENT = 'move-tweakers:touch';

/**
 * The Move's capacitive knobs, fed to an automation store: a finger on a knob
 * is a hand on the control under it, before any turn. The kit says touch on
 * every state frame (`{ pageId, touched }`, by control path, for the page on
 * the hardware); this keeps what it said last and passes on each change. A
 * page change lets go of everything the old page held, and so does the Move
 * going away — a finger the stream can no longer report must not hold a lane
 * forever.
 *
 * `resolve` names a page's control in the store's keys, or null for a
 * control automation does not drive. Returns the release.
 */
export function listenMoveTouch(store: Pick<AutomationLanesStore, 'touch'>, resolve: (pageId: string, path: string) => string | null | undefined): () => void {
  if (typeof window === 'undefined') return () => {};
  let page: string | null = null;
  let held = new Set<string>();

  const release = () => {
    for (const key of held) store.touch(key, false);
    held = new Set();
  };

  const onTouch = (event: Event) => {
    const detail = (event as CustomEvent<{ pageId?: string; touched?: Record<string, boolean> } | null>).detail;
    const pageId = typeof detail?.pageId === 'string' ? detail.pageId : null;
    if (pageId !== page) {
      release();
      page = pageId;
    }
    if (!pageId) return;
    const now = new Set<string>();
    for (const [path, on] of Object.entries(detail?.touched ?? {})) {
      if (!on) continue;
      const key = resolve(pageId, path);
      if (key) now.add(key);
    }
    for (const key of held) if (!now.has(key)) store.touch(key, false);
    for (const key of now) if (!held.has(key)) store.touch(key, true);
    held = now;
  };

  const onConnection = (event: Event) => {
    const d = (event as CustomEvent<{ bridge?: boolean; device?: boolean; active?: boolean } | null>).detail;
    if (!(d?.bridge && d.device && d.active)) {
      release();
      page = null;
    }
  };

  window.addEventListener(TOUCH_EVENT, onTouch);
  window.addEventListener(MOVE_CONNECTION_EVENT, onConnection);
  return () => {
    window.removeEventListener(TOUCH_EVENT, onTouch);
    window.removeEventListener(MOVE_CONNECTION_EVENT, onConnection);
    release();
  };
}
