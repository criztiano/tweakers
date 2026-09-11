import { P as PanelConfig, C as ControlMeta } from './TweakStore-DAd_7fkv.js';
import { ModPageLayout } from './modulation-core.js';
import { XYValue } from './xy-pad-core.js';
import { RangeValue } from './range-slider-core.js';
import { FilterValue } from './filter-core.js';
import './gradient-core.js';
import './color-core.js';
import './transfer-core.js';
import './curve-composer-core.js';

/**
 * The Move's control surface, as the bridge kit maps it (move-tweakers v0):
 * the first 4 panels become pages behind the track buttons, sliders and
 * bounded numbers become the 8 dials, toggles become pads. An xy control
 * takes a dial slot too — the pad draws behind the label, its knob turns
 * the X axis, and the volume knob turns Y while that knob is touched. A
 * range control claims a slot the same way: its knob moves the low end,
 * the volume knob the high end while touched. A select with real choices
 * claims one as a stepped enum dial — the knob's 0..1 position maps to an
 * option index, step 1/(count-1). Bounded params
 * beyond the 8 dials overflow into the pad grid as value chips — each one
 * related, by column, to the dial above it, which it can substitute (hold
 * to peek, tap to latch). The on-screen MovePanel mirrors this mapping so
 * screen and hardware always show the same layout.
 */
declare const MOVE_TRACKS = 4;
declare const MOVE_DIALS = 8;
declare const MOVE_PADS = 8;
interface MovePage {
    panel: PanelConfig;
    dials: ControlMeta[];
    /** Switch chips — the hardware's top pad row (y=3 on the device). */
    toggles: ControlMeta[];
    /** Overflow value chips — the hardware's value pad row (y=2). Value i sits
     *  at column i on both surfaces, pairing it with the dial in that column. */
    values: ControlMeta[];
    /** Action pads — the row under the values (y=1 on the device).
     *  Placed by hand only, through the panel's `movePads` map. */
    actions: ControlMeta[];
}
/** A select with real choices becomes an enum dial — the kit's exact rule. */
declare const isEnumDial: (c: ControlMeta) => boolean;
/** A switch the page is about: it claims a dial slot rather than a pad. */
declare const isToggleDial: (c: ControlMeta) => boolean;
/** Everything the hardware turns: the controls that claim a dial slot. */
declare const isMoveDial: (c: ControlMeta) => boolean;
/**
 * How many dial columns a control claims. The filter is the kit's first
 * 2-slot control: its picture spans two columns, and on the hardware the
 * left column's knob turns cutoff while the right column's turns resonance.
 */
declare const dialSpan: (c: ControlMeta | undefined) => number;
/** True when column i only continues the span-2 dial sitting at i-1. */
declare const isSpanContinuation: (page: MovePage, i: number) => boolean;
/**
 * The modulator-settings page (hold a step button): the kind picker takes
 * the first big slot, the modulator's own controls follow, and everything
 * else drops into the column of the dial declared just before it — the
 * LFO's tempo-sync pad below its rate dial, the curve's sync and signal
 * below its duration dial.
 *
 * `layout` is the ModulationStore's own placement (`getSettingsLayout`), the
 * single list both surfaces read; without it the same rule is re-derived
 * from the panel, which is enough for a modulator with no small slots.
 */
declare function buildModMovePage(panel: PanelConfig, layout?: ModPageLayout | null): MovePage;
/**
 * The builder's warning channel. The layout itself never changes — panels
 * past the 4 tracks still drop, oversized dials still pass over, colliding
 * pad columns still relocate — but each of those quiet decisions is said
 * out loud here, once per unique message, so a layout that "works until
 * you look at the hardware" announces itself in the console instead.
 * Tests (and apps that want the feed) can swap the sink with
 * `setMoveLayoutReporter`; `null` restores the deduped console.warn.
 */
type MoveLayoutIssueCode = 'panel-dropped' | 'dial-dropped' | 'pad-column-invalid' | 'pad-column-taken' | 'pad-row-full';
type MoveLayoutReporter = (code: MoveLayoutIssueCode, message: string) => void;
declare function setMoveLayoutReporter(fn: MoveLayoutReporter | null): void;
declare function reportMoveLayoutIssue(code: MoveLayoutIssueCode, message: string): void;
declare function buildMovePages(panels: PanelConfig[]): MovePage[];
/**
 * The pad grid's four rows, top to bottom, exactly as the hardware stacks
 * them — screen row 0 is the row nearest the knobs.
 *
 * The pad grid is its own instrument: it never reports a dial's state. Where
 * a dial lives, and at what value, is said by the dot under its knob alone.
 *
 * Plain: y=3 the switches — the first row of small slots, the one drawn
 * directly under the dials — y=2 the value chips, y=1 the action pads, y=0
 * the ALT pad. An app that claims both bottom rows takes y=1 and y=0, so the
 * actions have nowhere left to sit; a single-row claim is the bottom row
 * alone and the actions keep theirs (see PROTOCOL.md).
 */
declare function movePadRows(page: MovePage, claimedRows: number): ControlMeta[][];
/**
 * Which claimed hardware row a screen row shows, or null when it is a control
 * row. Two claimed rows fill screen rows 2 and 3 (y=1 then y=0); one claimed
 * row is the bottom row alone, and lands on screen row 3 — below the action
 * pads, exactly where the hardware puts it.
 */
declare function moveAppPadRow(row: number, claimedRows: number): 0 | 1 | null;
/**
 * The columns the on-screen panel actually shows: a column is occupied when
 * it has a dial, a toggle chip, or a value chip at that index. The indices
 * stay the hardware knob numbers — callers hide the unoccupied columns,
 * never renumber them, so the latch/substitution logic and the physical
 * knobs keep agreeing on what column i means.
 */
declare function visibleColumns(page: MovePage): number[];
/** A boolean dial's position: exact endpoints, and halfway reads as on — the
 *  same rule the on-screen slot follows, so the knob and the slot agree. */
declare const normalizeToggleDial: (value: unknown) => number;
declare const denormalizeToggleDial: (v01: number) => boolean;
/** Dial position 0..1 back to the control's real value, kit-identical. */
declare function denormalizeDial(meta: ControlMeta, v01: number): number;
/** Dial position 0..1, the same normalization the kit puts on the wire. */
declare function normalizeDial(meta: ControlMeta, value: unknown): number;
/** An xy pad's position, each axis 0..1 — the two numbers on the wire. */
declare function normalizeXYDial(meta: ControlMeta, value: unknown): {
    x: number;
    y: number;
};
/** Enum dial helpers — options may be strings or { value, label, icon }. */
declare const enumOptionValue: (o: string | {
    value: string;
    label?: string;
}) => string;
declare const enumOptionLabel: (o: string | {
    value: string;
    label?: string;
}) => string;
/** The option's glyph name, or null — a bare string option never has one. */
declare const enumOptionIcon: (o: string | {
    icon?: string;
}) => string | null;
/** Enough points to read a bell or a bounce at slot width, and no more. */
declare const ENUM_SHAPE_SAMPLES = 64;
/**
 * The shape an enum option stands for, as an SVG path filling a 100×100 box
 * with y pointing up — or null when the select declares no `preview`, or that
 * option has no shape. Fitted through the curve row's own core, so a bipolar
 * arc and a 0..1 envelope both fill the box edge to edge.
 *
 * Lives here rather than in the panel so the "what does this slot draw"
 * question has one answer both surfaces can be tested against.
 */
declare function enumShapePath(meta: ControlMeta, value: unknown): string | null;
declare function enumIndex(meta: ControlMeta, value: unknown): number;
/** A range dial's two ends, each 0..1 — the two numbers on the wire. */
declare function normalizeRangeDial(meta: ControlMeta, value: unknown): {
    lo: number;
    hi: number;
};
/** End positions 0..1 back to the control's real {min, max}, kit-identical —
 *  clamped into the bounds and ordered, so crossed ends never come back reversed. */
declare function denormalizeRangeDial(meta: ControlMeta, lo01: number, hi01: number): RangeValue;
/** An enum dial's position 0..1 — the option's index over the last index.
 *  An unknown (or missing) value reads as the first option, position 0. */
declare function normalizeEnumDial(meta: ControlMeta, value: unknown): number;
/** Dial position 0..1 back to the option at that step, kit-identical:
 *  round(v01 * (count-1)), clamped into the options list. */
declare function denormalizeEnumDial(meta: ControlMeta, v01: number): string;
/** A filter dial's two hands, each 0..1 — the two numbers on the wire.
 *  The left column's knob is cutoff, the right column's is resonance. */
declare function normalizeFilterDial(meta: ControlMeta, value: unknown): {
    cutoff: number;
    resonance: number;
};
/** Hand positions 0..1 back to the control's real pair, kit-identical. */
declare function denormalizeFilterDial(meta: ControlMeta, cutoff01: number, resonance01: number): FilterValue;
/**
 * The 2-slot picture: the filter's magnitude response as an SVG path filling
 * a 100×100 box, y pointing up — through the app's own `response` when the
 * config brought one, else the kit's lowpass. One answer both surfaces can
 * be tested against, like `enumShapePath`.
 */
declare function filterShapePath(meta: ControlMeta, value: unknown): string | null;
/** Where the fill anchors for a bipolar/origin slider, 0..1 (else 0). */
declare function dialOrigin(meta: ControlMeta): number;
/** Axis positions 0..1 back to the control's real {x, y}, kit-identical. */
declare function denormalizeXYDial(meta: ControlMeta, x01: number, y01: number): XYValue;

export { ENUM_SHAPE_SAMPLES, MOVE_DIALS, MOVE_PADS, MOVE_TRACKS, type MoveLayoutIssueCode, type MovePage, buildModMovePage, buildMovePages, denormalizeDial, denormalizeEnumDial, denormalizeFilterDial, denormalizeRangeDial, denormalizeToggleDial, denormalizeXYDial, dialOrigin, dialSpan, enumIndex, enumOptionIcon, enumOptionLabel, enumOptionValue, enumShapePath, filterShapePath, isEnumDial, isMoveDial, isSpanContinuation, isToggleDial, moveAppPadRow, movePadRows, normalizeDial, normalizeEnumDial, normalizeFilterDial, normalizeRangeDial, normalizeToggleDial, normalizeXYDial, reportMoveLayoutIssue, setMoveLayoutReporter, visibleColumns };
