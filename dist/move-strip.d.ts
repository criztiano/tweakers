import { P as PanelConfig, C as ControlMeta } from './TweakStore-Bm9zJFG-.js';
import { MovePage } from './move-layout.js';
import './gradient-core.js';
import './color-core.js';
import './xy-pad-core.js';
import './transfer-core.js';
import './filter-core.js';
import './range-slider-core.js';
import './modulation-core.js';
import './curve-composer-core.js';

/**
 * What earns a slot on the strip: everything the hardware would turn, plus
 * the switches — a toggle with no column named for it takes a big slot of its
 * own, which is a face the kit already has.
 */
declare const isStripSlot: (c: ControlMeta) => boolean;
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
declare function buildMoveStrip(panel: PanelConfig): MovePage;
/** The columns where a control begins — the places the window may stop. */
declare function stripStarts(page: MovePage): number[];
/**
 * Every scroll position the window can hold, in order. The window always
 * starts on a whole control — landing on the second half of a filter would
 * put a knob on half a picture — and the run ends at the first position that
 * reaches the last column, so the tail is reachable without scrolling into
 * a row of empty sockets.
 */
declare function stripOffsets(page: MovePage, cols?: number): number[];
/** The nearest scroll position to `offset` — how a stale offset is repaired. */
declare function clampStripOffset(page: MovePage, offset: number, cols?: number): number;
/**
 * The wheel, in slots: `delta` steps along the stops, clamped at both ends.
 * One detent of the Move's big wheel is one control, whatever its width.
 */
declare function stepStripOffset(page: MovePage, offset: number, delta: number, cols?: number): number;
/**
 * The arrows, in windows: a whole screen of slots at a time, landing on the
 * first stop at or past where the jump lands (and never overshooting the
 * end). The wheel walks; the arrows turn the page.
 */
declare function pageStripOffset(page: MovePage, offset: number, dir: number, cols?: number): number;
/**
 * Which strip column each dial is holding, left to right — `-1` for a dial
 * the strip has run out for. These are the 8 controls you can turn right now,
 * and what the bridge points the hardware's knobs at.
 */
declare function stripDialColumns(page: MovePage, offset: number, cols?: number): number[];
/** The controls those columns hold, in dial order — what the kit is told. */
declare function stripDialSlots(page: MovePage, offset: number, cols?: number): (ControlMeta | undefined)[];
/**
 * The pad rows under that window, in hardware columns — the small slots the
 * eight pads are showing right now. A pad lives at a strip column like its
 * slot does, so the window that picks the dials picks these with it: scroll
 * on and the chip leaves with the dial it belongs to.
 */
declare function stripWindowPads(page: MovePage, offset: number, cols?: number): {
    toggles: (ControlMeta | undefined)[];
    values: (ControlMeta | undefined)[];
    actions: (ControlMeta | undefined)[];
};
/** How many controls the strip holds — the number the position readout counts. */
declare const stripSlotCount: (page: MovePage) => number;
/** Which control the window starts on, 0-based — the other half of that readout. */
declare const stripSlotIndex: (page: MovePage, offset: number) => number;

export { buildMoveStrip, clampStripOffset, isStripSlot, pageStripOffset, stepStripOffset, stripDialColumns, stripDialSlots, stripOffsets, stripSlotCount, stripSlotIndex, stripStarts, stripWindowPads };
