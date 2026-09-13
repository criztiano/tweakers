/**
 * Search, on whichever list the wheel is walking.
 *
 * Holding the Move's Capture key opens a search on the list that has the
 * wheel right now — the app's own wheel list by default, the preset navigator
 * while it is up, the palette navigator inside the colour editor. Typing on
 * the computer keyboard narrows the rows as the letters land, the wheel
 * walks what is left, and taking a row (the jog click, Enter, a click) or
 * Back closes the search. Every list gets it the same way, so no app has to
 * build its own.
 *
 * The store holds only the search itself — which list, the typed query, and
 * for the app's wheel list the row the wheel rests on. The list's own store
 * keeps owning its cursor and its rows; the panel does the filtering with
 * `moveSearchFilter`, and the surface store carries the query out to the
 * hardware screen so the device's list narrows with the screen's.
 */

import { MoveSurfaceStore } from './move-surface-store';

/** The list a search is running on. */
export type MoveSearchTarget = 'screen' | 'presets' | 'palette';

export interface MoveSearchView {
  target: MoveSearchTarget;
  query: string;
  /** For the `screen` target: the row (index into the app's full list) the
   *  wheel rests on. The other targets keep their cursor in their own store. */
  cursor: number;
}

/** True when every word of the query occurs in the label, any case. */
export function moveSearchMatch(label: string, query: string): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const hay = label.toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

/** The indices of the labels the query keeps, in list order. */
export function moveSearchFilter(labels: string[], query: string): number[] {
  return labels.flatMap((label, i) => (moveSearchMatch(label, query) ? [i] : []));
}

class MoveSearchStoreClass {
  private view: MoveSearchView | null = null;
  private version = 0;
  private listeners = new Set<() => void>();

  getView = (): MoveSearchView | null => this.view;
  isOpen = (): boolean => !!this.view;
  getVersion = (): number => this.version;
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };

  private set(next: MoveSearchView | null) {
    this.view = next;
    // The device screen narrows with the wheel list: the query and the
    // resting row ride out through the surface store, the kit reads them.
    MoveSurfaceStore.setSearch(next?.target === 'screen' ? { query: next.query, index: next.cursor } : null);
    this.version++;
    for (const fn of this.listeners) fn();
  }

  /** Open on a list, with an empty query. Already open: nothing changes. */
  open(target: MoveSearchTarget, cursor = 0) {
    if (this.view) return;
    this.set({ target, query: '', cursor });
  }

  close() {
    if (this.view) this.set(null);
  }

  setQuery(query: string) {
    if (!this.view || this.view.query === query) return;
    this.set({ ...this.view, query });
  }

  /** The `screen` target's resting row, an index into the app's full list. */
  setCursor(cursor: number) {
    if (!this.view || this.view.cursor === cursor) return;
    this.set({ ...this.view, cursor });
  }
}

export const MoveSearchStore = new MoveSearchStoreClass();
