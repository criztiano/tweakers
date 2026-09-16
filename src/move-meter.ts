/**
 * A live picture's feed. The kit cannot hear the app's audio, so the app
 * attaches a reader per panel; a face on screen calls it once a frame.
 */
export type MoveMeter<T> = {
  /** Feed a panel's face. Returns the detach. */
  attach(panelId: string, read: () => T | null): () => void;
  read(panelId: string): T | null;
};

export function createMoveMeter<T>(): MoveMeter<T> {
  const readers = new Map<string, () => T | null>();
  return {
    attach(panelId, read) {
      readers.set(panelId, read);
      return () => {
        if (readers.get(panelId) === read) readers.delete(panelId);
      };
    },
    read(panelId) {
      return readers.get(panelId)?.() ?? null;
    },
  };
}
