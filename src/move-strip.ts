import type { PanelConfig, ControlMeta } from './store/TweakStore';
import { MOVE_DIALS, dialSpan, padSpan, isMoveDial, isMoveTabs, type MovePage } from './move-layout';

/**
 * The endless strip — a page with more slots than the Move has dials.
 *
 * The ordinary page (`buildMovePages`) is the hardware's own shape: 8 dials,
 * and everything past them drops to a value chip. A library, a preset browser,
 * a synth with forty parameters has no such page. The strip keeps every
 * control at full slot size in one long row and shows a window of it: the big
 * wheel moves the window, the 8 dials always hold the 8 slots in view, and the
 * pads that belong to them travel alongside. Nothing is demoted to fit.
 *
 * Everything here is the geometry alone — which control sits in which column,
 * and which columns a given scroll position shows. The gestures, the wheel
 * and the drawing stay with the MovePanel, so the whole rule can be read and
 * tested on its own, exactly like `move-layout`.
 *
 * A strip IS a `MovePage`: the same four rows, just longer than 8 — so every
 * slot face, pad face, span rule and modulation ring the panel already draws
 * works on it unchanged.
 */

const flat = (controls: ControlMeta[], out: ControlMeta[] = []): ControlMeta[] => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};

/**
 * What earns a slot on the strip: everything the hardware would turn, plus
 * the switches — a toggle with no column named for it takes a big slot of its
 * own, which is a face the kit already has.
 */
export const isStripSlot = (c: ControlMeta): boolean =>
  isMoveDial(c) || c.type === 'toggle';

/**
 * The panel's controls as one long row of columns. A span-2 control (the
 * filter) sits in both of its columns, the same bookkeeping the 8-wide page
 * keeps — so `isSpanContinuation` and the occupancy checks need no second
 * rule for the strip.
 *
 * The small slots come too. `movePads` names the column a pad sits in, and
 * on a strip that column is a place in the whole row rather than one of
 * eight — so a chip travels with the dial it belongs to when the wheel moves
 * them both. A control given a column is a pad and nothing else: it does not
 * also eat a slot on the way past.
 */
export function buildMoveStrip(panel: PanelConfig): MovePage {
  const controls = flat(panel.controls);
  const column = (c: ControlMeta): number | null => {
    const n = panel.movePads?.[c.path];
    return typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n : null;
  };

  const dials: ControlMeta[] = [];
  for (const c of controls) {
    if (!isStripSlot(c) || column(c) !== null) continue;
    for (let s = 0; s < dialSpan(c); s++) dials.push(c);
  }

  // The pad rows, indexed by the same columns the slots use: switches on the
  // first, values on the second, the app's buttons under those.
  const toggles: ControlMeta[] = [];
  const values: ControlMeta[] = [];
  const actions: ControlMeta[] = [];
  // A tabs strip claims a RUN of pads in the switch row, not a pad — the same
  // multi-slot rule the 8-wide page keeps, on the strip's own unbounded row.
  // It starts at the column it names, and packs left when it names none;
  // there is always a run free out past the end, so it never disappears.
  const placeRun = (c: ControlMeta, col: number | null) => {
    const span = padSpan(c);
    const fits = (start: number) =>
      Array.from({ length: span }, (_, k) => toggles[start + k]).every((p) => p === undefined);
    let start = col !== null && fits(col) ? col : -1;
    for (let i = 0; start < 0; i++) {
      if (fits(i)) start = i;
    }
    for (let k = 0; k < span; k++) toggles[start + k] = c;
  };
  for (const c of controls) {
    if (isMoveTabs(c)) {
      placeRun(c, column(c));
      continue;
    }
    const col = column(c);
    if (col === null) continue;
    const row = c.type === 'toggle' ? toggles : c.type === 'action' ? actions : values;
    if (row[col] === undefined) row[col] = c;
  }
  return { panel, dials, toggles, values, actions };
}

/** The columns where a control begins — the places the window may stop. */
export function stripStarts(page: MovePage): number[] {
  const starts: number[] = [];
  for (let i = 0; i < page.dials.length; i++) {
    if (i === 0 || page.dials[i] !== page.dials[i - 1]) starts.push(i);
  }
  return starts;
}

/**
 * Every scroll position the window can hold, in order. The window always
 * starts on a whole control — landing on the second half of a filter would
 * put a knob on half a picture — and the run ends at the first position that
 * reaches the last column, so the tail is reachable without scrolling into
 * a row of empty sockets.
 */
export function stripOffsets(page: MovePage, cols: number = MOVE_DIALS): number[] {
  const len = page.dials.length;
  const offsets: number[] = [];
  for (const start of stripStarts(page)) {
    offsets.push(start);
    if (start + cols >= len) break;
  }
  return offsets.length ? offsets : [0];
}

/** The nearest scroll position to `offset` — how a stale offset is repaired. */
export function clampStripOffset(page: MovePage, offset: number, cols: number = MOVE_DIALS): number {
  const offsets = stripOffsets(page, cols);
  let best = offsets[0];
  for (const o of offsets) {
    if (Math.abs(o - offset) < Math.abs(best - offset)) best = o;
  }
  return best;
}

/**
 * The wheel, in slots: `delta` steps along the stops, clamped at both ends.
 * One detent of the Move's big wheel is one control, whatever its width.
 */
export function stepStripOffset(
  page: MovePage,
  offset: number,
  delta: number,
  cols: number = MOVE_DIALS
): number {
  const offsets = stripOffsets(page, cols);
  const from = offsets.indexOf(clampStripOffset(page, offset, cols));
  return offsets[Math.min(offsets.length - 1, Math.max(0, from + delta))];
}

/**
 * The arrows, in windows: a whole screen of slots at a time, landing on the
 * first stop at or past where the jump lands (and never overshooting the
 * end). The wheel walks; the arrows turn the page.
 */
export function pageStripOffset(
  page: MovePage,
  offset: number,
  dir: number,
  cols: number = MOVE_DIALS
): number {
  if (!dir) return clampStripOffset(page, offset, cols);
  const offsets = stripOffsets(page, cols);
  const target = clampStripOffset(page, offset, cols) + Math.sign(dir) * cols;
  // Forward lands on the first stop at or past the target; back on the last
  // stop at or before it. Either way the window keeps whole controls.
  const candidates = dir > 0
    ? offsets.filter((o) => o >= target)
    : offsets.filter((o) => o <= target);
  if (candidates.length) return dir > 0 ? candidates[0] : candidates[candidates.length - 1];
  return dir > 0 ? offsets[offsets.length - 1] : offsets[0];
}

/**
 * Which strip column each dial is holding, left to right — `-1` for a dial
 * the strip has run out for. These are the 8 controls you can turn right now,
 * and what the bridge points the hardware's knobs at.
 */
export function stripDialColumns(
  page: MovePage,
  offset: number,
  cols: number = MOVE_DIALS
): number[] {
  return Array.from({ length: cols }, (_, i) => {
    const col = offset + i;
    return col < page.dials.length ? col : -1;
  });
}

/** The controls those columns hold, in dial order — what the kit is told. */
export function stripDialSlots(
  page: MovePage,
  offset: number,
  cols: number = MOVE_DIALS
): (ControlMeta | undefined)[] {
  return stripDialColumns(page, offset, cols).map((col) => (col < 0 ? undefined : page.dials[col]));
}

/**
 * The pad rows under that window, in hardware columns — the small slots the
 * eight pads are showing right now. A pad lives at a strip column like its
 * slot does, so the window that picks the dials picks these with it: scroll
 * on and the chip leaves with the dial it belongs to.
 */
export function stripWindowPads(
  page: MovePage,
  offset: number,
  cols: number = MOVE_DIALS
): { toggles: (ControlMeta | undefined)[]; values: (ControlMeta | undefined)[]; actions: (ControlMeta | undefined)[] } {
  const row = (cells: ControlMeta[]) =>
    Array.from({ length: cols }, (_, i) => cells[offset + i]);
  return { toggles: row(page.toggles), values: row(page.values), actions: row(page.actions) };
}

/** How many controls the strip holds — the number the position readout counts. */
export const stripSlotCount = (page: MovePage): number => stripStarts(page).length;

/** Which control the window starts on, 0-based — the other half of that readout. */
export const stripSlotIndex = (page: MovePage, offset: number): number =>
  stripStarts(page).filter((start) => start < offset).length;
