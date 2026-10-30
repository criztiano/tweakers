/**
 * A select whose options come in folders, on its own so node can test it
 * without React. A folder is a row with no value of its own: it names a run
 * of options, which may hold folders too. The control's value is always a
 * leaf — an option with a value — and leaf values are unique across the
 * whole tree, so a value alone says where in the tree it sits.
 *
 * The Move's slot shows one level at a time. Where the list is open — the
 * folder and the row the cursor is on — is the kit's own state, never the
 * value: turning walks the open level's rows, landing on a leaf selects it,
 * landing on a folder only moves the cursor, and a tap opens the folder
 * under the cursor (or, on the back row, goes up). Every rule lives here, so
 * the panel, a standalone slot and the hardware bridge agree.
 */

/** An option with a value: a plain string (its own value and label), or a
 *  value with a display label, an icon or a picture. */
export type SelectLeaf = string | {
  value: string; label: string; icon?: string; picture?: string;
  /** The family this option belongs to. A curve grid heads each run of
   *  options sharing one; it groups the drawing only, never the walk. */
  group?: string;
};

/** A run of options under one name. It has no value of its own; it opens. */
export type SelectFolder = { label: string; options: SelectOption[]; icon?: string };

/** One row a select offers: an option, or a folder of them. */
export type SelectOption = SelectLeaf | SelectFolder;

/**
 * Where a select's list is open: `open` is the folder path from the top —
 * each entry an index into the level above — and `cursor` the row the knob
 * is on in that level. `-1` is the back row, the way up, which only a level
 * inside a folder has.
 */
export type SelectPlace = { open: number[]; cursor: number };

/** A row of the open level, ready to draw. */
export type SelectLevelRow = {
  label: string;
  /** A leaf's value; a folder has none. */
  value?: string;
  folder: boolean;
  icon?: string;
  picture?: string;
  /** A folder holding the current value, somewhere inside it. */
  holds?: boolean;
};

/** The open level: what the list shows and where its cursor is. */
export type SelectLevel = {
  open: number[];
  rows: SelectLevelRow[];
  /** What the open level is: the control's name at the top, the folder's inside one. */
  title: string;
  /** The level above, by name — the control's own name one level in — or
   *  null at the top, where there is nowhere to go back to. */
  back: string | null;
  cursor: number;
};

export const isSelectFolder = (option: unknown): option is SelectFolder =>
  typeof option === 'object' && option !== null && !('value' in option) &&
  Array.isArray((option as SelectFolder).options);

/** Whether a select's options carry any folder at all. */
export const selectHasFolders = (options: readonly unknown[]) => options.some(isSelectFolder);

export const selectLeafValue = (leaf: SelectLeaf) => (typeof leaf === 'string' ? leaf : leaf.value);
export const selectLeafLabel = (leaf: SelectLeaf) => (typeof leaf === 'string' ? leaf : leaf.label ?? leaf.value);

/** Every leaf of the tree, in reading order — a folder's options where the
 *  folder stands. A flat select's options come back as they are. */
export function selectLeaves(options: readonly SelectOption[]): SelectLeaf[] {
  return options.flatMap((option) => (isSelectFolder(option) ? selectLeaves(option.options) : [option]));
}

/** The rows of the level at `open`, or null when the path leads nowhere. */
export function selectLevelOptions(options: readonly SelectOption[], open: readonly number[]): readonly SelectOption[] | null {
  let level: readonly SelectOption[] = options;
  for (const i of open) {
    const folder = level[i];
    if (!isSelectFolder(folder)) return null;
    level = folder.options;
  }
  return level;
}

/** Where a value sits: the index path to its leaf, folders first — null for
 *  a value no leaf carries. */
export function selectPathOf(options: readonly SelectOption[], value: unknown): number[] | null {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (isSelectFolder(option)) {
      const inner = selectPathOf(option.options, value);
      if (inner) return [i, ...inner];
    } else if (selectLeafValue(option) === value) return [i];
  }
  return null;
}

/** The place a value puts the list in: its folder open, the cursor on it.
 *  A value no leaf carries opens the top, on its first row. */
export function selectPlaceOf(options: readonly SelectOption[], value: unknown): SelectPlace {
  const path = selectPathOf(options, value);
  return path ? { open: path.slice(0, -1), cursor: path[path.length - 1] } : { open: [], cursor: 0 };
}

/** A place made safe for the tree: a path leading nowhere falls back to the
 *  top, and the cursor stays on the level — the back row included, inside a
 *  folder. */
export function selectFitPlace(options: readonly SelectOption[], place: SelectPlace): SelectPlace {
  const level = selectLevelOptions(options, place.open);
  const open = level ? [...place.open] : [];
  const rows = (level ?? options).length;
  const low = open.length ? -1 : 0;
  const cursor = Number.isFinite(place.cursor) ? Math.round(place.cursor) : 0;
  return { open, cursor: Math.max(low, Math.min(Math.max(low, rows - 1), cursor)) };
}

/** The open level as the slot draws it. */
export function selectLevel(options: readonly SelectOption[], label: string, place: SelectPlace, value: unknown): SelectLevel {
  const fit = selectFitPlace(options, place);
  const level = selectLevelOptions(options, fit.open) ?? options;
  const path = selectPathOf(options, value);
  // The value's path runs through this level when it starts with the open path.
  const holds = path && fit.open.every((i, k) => path[k] === i) ? path[fit.open.length] : -1;
  const name = (open: number[]) => {
    const parent = selectLevelOptions(options, open.slice(0, -1));
    const folder = parent?.[open[open.length - 1]];
    return isSelectFolder(folder) ? folder.label : label;
  };
  return {
    open: fit.open,
    rows: level.map((option, i) => isSelectFolder(option)
      ? { label: option.label, folder: true, icon: option.icon, ...(i === holds ? { holds: true } : {}) }
      : {
          label: selectLeafLabel(option), value: selectLeafValue(option), folder: false,
          ...(typeof option !== 'string' && option.icon ? { icon: option.icon } : {}),
          ...(typeof option !== 'string' && option.picture ? { picture: option.picture } : {}),
        }),
    title: fit.open.length ? name(fit.open) : label,
    back: fit.open.length ? name(fit.open.slice(0, -1)) : null,
    cursor: fit.cursor,
  };
}

/**
 * The cursor walked to row `to` of the open level (-1, the back row, inside
 * a folder): clamped to the level, and landing on a leaf selects it — the
 * leaf's value comes back to be written. A folder or the back row only moves
 * the cursor.
 */
export function selectWalk(options: readonly SelectOption[], place: SelectPlace, to: number): { place: SelectPlace; value?: string } {
  const next = selectFitPlace(options, { open: place.open, cursor: to });
  const row = selectLevelOptions(options, next.open)?.[next.cursor];
  return row === undefined || isSelectFolder(row) ? { place: next } : { place: next, value: selectLeafValue(row) };
}

/**
 * A tap: on a folder it opens, the cursor landing on the row that leads to
 * the current value when the value is inside, else on the back row. On the
 * back row it goes up, the cursor landing on the folder it left. On a leaf
 * it changes nothing — the leaf is already selected.
 */
export function selectTap(options: readonly SelectOption[], place: SelectPlace, value: unknown): SelectPlace {
  const fit = selectFitPlace(options, place);
  if (fit.cursor < 0) return { open: fit.open.slice(0, -1), cursor: fit.open[fit.open.length - 1] ?? 0 };
  const row = selectLevelOptions(options, fit.open)?.[fit.cursor];
  if (!isSelectFolder(row)) return fit;
  const open = [...fit.open, fit.cursor];
  const path = selectPathOf(options, value);
  const inside = path && open.every((i, k) => path[k] === i) && path.length > open.length;
  return { open, cursor: inside ? path[open.length] : -1 };
}
