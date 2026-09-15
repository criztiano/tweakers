import type { PanelConfig, ControlMeta } from './store/TweakStore';
import type { ModPageLayout } from './modulation-core';
import { resolveAxis, type XYValue } from './xy-pad-core';
import { plotCurve } from './curve-preview-core';
import { clampRange, type RangeValue } from './range-slider-core';
import { resolveFilterAxis, normalizeFilterValue, filterHand01, filterHandValue, defaultFilterResponse, filterResponsePath, type FilterValue } from './filter-core';

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
export const MOVE_TRACKS = 4;
export const MOVE_DIALS = 8;
export const MOVE_PADS = 8;

export interface MovePage {
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
  /** Chips riding the top pad row (y=3), sharing it with the switches: a
   *  balance's first colour, and each `moveTopRow` chip in its named column
   *  where no switch holds it. A column may carry one here and another in
   *  `values` under it; both take that column's knob. Absent: none. */
  topValues?: ControlMeta[];
  /** Chips riding the action row (y=1), each `moveActionRow` chip in its named
   *  column where no action holds it — a column's third small slot. Absent: none. */
  actionValues?: ControlMeta[];
}

const flat = (controls: ControlMeta[], out: ControlMeta[] = []): ControlMeta[] => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};

/** A select with real choices becomes an enum dial — the kit's exact rule. */
export const isEnumDial = (c: ControlMeta) =>
  c.type === 'select' && Array.isArray(c.options) && c.options.length > 1;

/**
 * The tabs strip: a select laid across the small slots instead of taking a
 * dial. One pad per option, side by side in the switch row, the current one
 * lit — the mode a page is in, said where the hand already is. It is the pad
 * grid's first multi-slot control, the filter's small sibling.
 */
export const isMoveTabs = (c: ControlMeta) => !!c.moveTabs && isEnumDial(c);

/** The strip spends its leading pad on the select's own name. */
export const isNamedTabs = (c: ControlMeta) => c.moveTabs === 'named';

/**
 * How many pads a control claims on the small grid. Everything but a tabs
 * strip is one pad; a strip is one per option, plus its name pad — 2 pads at
 * the least, and never more than the row is wide.
 */
export const padSpan = (c: ControlMeta | undefined): number =>
  c && isMoveTabs(c) ? c.options!.length + (isNamedTabs(c) ? 1 : 0) : 1;

/** True when pad column i only continues the strip sitting at i-1. */
export const isPadSpanContinuation = (row: ControlMeta[], i: number): boolean =>
  i > 0 && row[i] !== undefined && row[i] === row[i - 1];

/** One pad of a tabs strip: its name pad, or the option that pad selects. */
export type MoveTabCell = {
  meta: ControlMeta;
  /** The strip's name pad — it selects nothing, and stays dark on the grid. */
  head: boolean;
  /** The option's value, null on the name pad. */
  option: string | null;
  /** What that pad says. */
  label: string;
};

/**
 * What the pad at column `i` of a small-slot row is, read from the row alone
 * — the one answer the screen, the bridge and the hardware all lay the strip
 * out from, so a tab lights and answers on the pad it is drawn on.
 */
export function moveTabCell(row: (ControlMeta | undefined)[], i: number): MoveTabCell | null {
  const meta = row[i];
  if (!meta || !isMoveTabs(meta)) return null;
  let start = i;
  while (start > 0 && row[start - 1] === meta) start--;
  const offset = i - start;
  if (isNamedTabs(meta) && offset === 0) {
    return { meta, head: true, option: null, label: meta.label };
  }
  const opt = meta.options![offset - (isNamedTabs(meta) ? 1 : 0)];
  if (opt === undefined) return null;
  return {
    meta,
    head: false,
    option: enumOptionValue(opt as never),
    label: enumOptionLabel(opt as never),
  };
}

/** A switch the page is about: it claims a dial slot rather than a pad. */
export const isToggleDial = (c: ControlMeta) => c.type === 'toggle' && c.moveSlot === true;

/** Everything the hardware turns: the controls that claim a dial slot. */
export const isMoveDial = (c: ControlMeta) =>
  isToggleDial(c) ||
  c.type === 'slider' || c.type === 'color' || c.type === 'xy' || c.type === 'range' ||
  c.type === 'filter' || c.type === 'transfer' || c.type === 'gradient' || c.type === 'balance' ||
  (isEnumDial(c) && !isMoveTabs(c)) ||
  (c.type === 'number' && c.min != null && c.max != null);

const isDial = isMoveDial;

/** Two-handed dials and enums need a slot of their own, never a value chip.
 *  A balance keeps its slot too: the blend it stands between IS the control. */
const noChip = (c: ControlMeta) =>
  isToggleDial(c) || c.type === 'color' || c.type === 'xy' || c.type === 'range' || c.type === 'filter' ||
  c.type === 'transfer' || c.type === 'gradient' || c.type === 'balance' || isEnumDial(c);

/**
 * How many dial columns a control claims. Filters give each knob its own
 * axis; a two-column select gives both knobs the same list.
 */
export const dialSpan = (c: ControlMeta | undefined): number =>
  c?.type === 'filter' || (c?.type === 'select' && c.moveSpan === 2 && !isMoveTabs(c)) ? 2 : 1;

/** True when column i only continues the span-2 dial sitting at i-1. */
export const isSpanContinuation = (page: MovePage, i: number): boolean =>
  i > 0 && page.dials[i] !== undefined && page.dials[i] === page.dials[i - 1];

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
export function buildModMovePage(panel: PanelConfig, layout?: ModPageLayout | null): MovePage {
  const controls = flat(panel.controls);
  if (layout) {
    const at = (slot: { path: string } | null) =>
      slot ? controls.find((c) => c.path === slot.path) : undefined;
    return {
      panel,
      dials: layout.dials.slice(0, MOVE_DIALS).map(at).filter((c): c is ControlMeta => !!c),
      toggles: layout.toggles.slice(0, MOVE_PADS).map(at) as ControlMeta[],
      values: layout.values.slice(0, MOVE_PADS).map(at) as ControlMeta[],
      actions: [],
    };
  }
  const dials: ControlMeta[] = [];
  const toggles: ControlMeta[] = [];
  for (const c of controls) {
    // The kind picker keeps its slot even while only one modulator type is
    // registered (a 1-option select is not an enum dial by the kit's rule).
    // A `moveSlot` toggle takes a dial slot of its own instead of a pad.
    if (c.type === 'toggle' && !isToggleDial(c)) toggles[Math.max(0, dials.length - 1)] = c;
    else if (c.type === 'toggle' || c.type === 'select' || isDial(c)) dials.push(c);
  }
  return { panel, dials: dials.slice(0, MOVE_DIALS), toggles: toggles.slice(0, MOVE_PADS), values: [], actions: [] };
}

/**
 * The builder's warning channel. The layout itself never changes — panels
 * past the 4 tracks still drop, oversized dials still pass over, colliding
 * pad columns still relocate — but each of those quiet decisions is said
 * out loud here, once per unique message, so a layout that "works until
 * you look at the hardware" announces itself in the console instead.
 * Tests (and apps that want the feed) can swap the sink with
 * `setMoveLayoutReporter`; `null` restores the deduped console.warn.
 */
export type MoveLayoutIssueCode =
  | 'panel-dropped'
  | 'dial-dropped'
  | 'pad-column-invalid'
  | 'pad-column-on-dial'
  | 'balance-color-placed'
  | 'pad-column-taken'
  | 'top-row-taken'
  | 'slot-group-apart'
  | 'action-row-no-column'
  | 'action-row-taken'
  | 'top-row-no-column'
  | 'pad-row-full'
  | 'tabs-oversized'
  | 'tabs-no-room';

type MoveLayoutReporter = (code: MoveLayoutIssueCode, message: string) => void;

const warnedIssues = new Set<string>();
let issueReporter: MoveLayoutReporter | null = null;

export function setMoveLayoutReporter(fn: MoveLayoutReporter | null): void {
  issueReporter = fn;
}

export function reportMoveLayoutIssue(code: MoveLayoutIssueCode, message: string): void {
  if (issueReporter) {
    issueReporter(code, message);
    return;
  }
  if (warnedIssues.has(message)) return;
  warnedIssues.add(message);
  console.warn(`Move layout: ${message}`);
}

/**
 * A hand-placed pad's column, or null when the panel leaves the control to
 * the automatic packing. Out-of-range columns are ignored rather than
 * clamped: silently stacking two pads on column 7 would read as a layout
 * that works until you look at the hardware.
 */
const padColumn = (panel: PanelConfig, c: ControlMeta): number | null => {
  const col = panel.movePads?.[c.path];
  if (col === undefined) return null;
  if (typeof col === 'number' && Number.isInteger(col) && col >= 0 && col < MOVE_PADS) return col;
  reportMoveLayoutIssue(
    'pad-column-invalid',
    `panel '${panel.id}': control '${c.path}': movePads column ${JSON.stringify(col)} is off the ${MOVE_PADS}-wide grid — ignored`
  );
  return null;
};

export function buildMovePages(panels: PanelConfig[]): MovePage[] {
  // The kit's own settings pages lay out like the app's; the panel decides
  // where they show (the settings room), never the builder.
  const plain = panels.filter((p) => p.kind === undefined || p.kind === 'kit');
  for (const p of plain.slice(MOVE_TRACKS)) {
    reportMoveLayoutIssue(
      'panel-dropped',
      `panel '${p.id}' dropped — hardware has ${MOVE_TRACKS} tracks`
    );
  }
  return plain
    .slice(0, MOVE_TRACKS)
    .map((panel) => {
      const controls = flat(panel.controls);
      // Dials pack left to right, each claiming its span of columns — a
      // span-2 control sits in both of its columns, so occupancy checks and
      // the knob-number rule need no second bookkeeping. A wide control that
      // no longer fits is passed over; a narrow one behind it may still land.
      // A `movePads` column never enters this race: the pad grid is its own
      // instrument, and a control that fits the dials keeps its dial slot no
      // matter what the panel's map says. Only a bounded param that genuinely
      // doesn't fit the 8 columns falls through to the value row.
      // Each control's hand-named pad column, read once — the reporter must
      // hear about an invalid column exactly once per control.
      const padCols = new Map(controls.map((c) => [c, padColumn(panel, c)] as const));
      // The two colours a balance references never enter the dial race: the
      // balance places them ITSELF — stacked in its own column, one chip up
      // top and one under it — so the pattern needs zero layout from the panel.
      const balanceRefs = new Map<ControlMeta, ControlMeta>();
      for (const c of controls) {
        if (c.type !== 'balance') continue;
        for (const path of [c.balanceA, c.balanceB]) {
          const ref = controls.find((x) => x.path === path && x.type === 'color');
          if (ref && !balanceRefs.has(ref)) balanceRefs.set(ref, c);
        }
      }
      // A colour with a NAMED pad column steps out of the dial race: it is
      // the small colour selector — a swatch chip on the value row that opens
      // the same editor — for pages where colour is not the big control. The
      // named column is the whole declaration, exactly as it is for actions.
      const isPadColor = (c: ControlMeta) => c.type === 'color' && padCols.get(c) != null;
      const dials: ControlMeta[] = [];
      let nextCol = 0;
      for (const c of controls) {
        if (!isDial(c) || isPadColor(c) || balanceRefs.has(c)) continue;
        const span = dialSpan(c);
        if (nextCol + span > MOVE_DIALS) {
          if (nextCol >= MOVE_DIALS) break;
          continue;
        }
        for (let s = 0; s < span; s++) dials[nextCol + s] = c;
        nextCol += span;
      }
      const toggles: ControlMeta[] = [];
      const values: ControlMeta[] = [];
      const actions: ControlMeta[] = [];
      // The top pad row holds switches and the chips riding up there — a
      // balance's first colour, a `moveTopRow` chip. Both kinds share one
      // row, so a cell is free only when neither holds it.
      const topValues: ControlMeta[] = [];
      const topAt = (i: number) => toggles[i] ?? topValues[i];
      const cellAt = (row: ControlMeta[], i: number) => (row === toggles ? topAt(i) : row[i]);
      // A named column is taken as read; everything else — and anything whose
      // column is already spoken for — packs into the leftmost free one, which
      // is the whole rule for a panel that names no columns at all.
      const place = (row: ControlMeta[], rowName: string, c: ControlMeta, col: number | null) => {
        if (col !== null && cellAt(row, col) === undefined) {
          row[col] = c;
          return;
        }
        for (let i = 0; i < MOVE_PADS; i++) {
          if (cellAt(row, i) === undefined) {
            if (col !== null) {
              reportMoveLayoutIssue(
                'pad-column-taken',
                `panel '${panel.id}': control '${c.path}': ${rowName} column ${col} already occupied by '${cellAt(row, col)!.path}' — moved to column ${i}`
              );
            }
            row[i] = c;
            return;
          }
        }
        reportMoveLayoutIssue(
          'pad-row-full',
          `panel '${panel.id}': control '${c.path}': the ${rowName} row's ${MOVE_PADS} pads are all taken — dropped`
        );
      };
      // A tabs strip is the pad grid's multi-slot control, so it lands as one
      // piece or not at all: it needs a RUN of free pads, not a free pad. The
      // strip sits in the switch row — it is a switch, however many ways it
      // goes — and a named column is where the run starts. A run that does not
      // fit there falls back to the leftmost one that does, the same courtesy
      // a single pad gets; a strip with nowhere to sit is said out loud rather
      // than quietly shortened, because a mode picker missing two of its modes
      // is a worse lie than a mode picker that is missing.
      const placeTabs = (c: ControlMeta, col: number | null) => {
        const span = padSpan(c);
        if (span > MOVE_PADS) {
          reportMoveLayoutIssue(
            'tabs-oversized',
            `panel '${panel.id}': control '${c.path}': a ${span}-pad tabs strip is wider than the ${MOVE_PADS}-wide grid — dropped`
          );
          return;
        }
        const fits = (start: number) =>
          start >= 0 && start + span <= MOVE_PADS &&
          Array.from({ length: span }, (_, k) => topAt(start + k)).every((p) => p === undefined);
        let start = col !== null && fits(col) ? col : -1;
        if (start < 0) {
          for (let i = 0; i + span <= MOVE_PADS; i++) {
            if (fits(i)) { start = i; break; }
          }
          if (start >= 0 && col !== null) {
            reportMoveLayoutIssue(
              'pad-column-taken',
              `panel '${panel.id}': control '${c.path}': tabs column ${col} has no run of ${span} free pads — moved to column ${start}`
            );
          }
        }
        if (start < 0) {
          reportMoveLayoutIssue(
            'tabs-no-room',
            `panel '${panel.id}': control '${c.path}': the toggle row has no run of ${span} free pads — dropped`
          );
          return;
        }
        for (let k = 0; k < span; k++) toggles[start + k] = c;
      };

      // The column group, in the order the kit seats it (move's
      // kit/move-tweakers.js), so screen and hardware land every pad alike:
      //
      // 1. Each balance seats its colours first — they own their column. A
      //    balance IS a stacked column: its dial is the blend, `a` the chip up
      //    top, `b` the chip under it. The same two cells a `moveTopRow` chip
      //    and its partner use, and the same gestures (hold peeks, tap latches).
      for (const [ref, bal] of balanceRefs) {
        const at = dials.indexOf(bal);
        if (at < 0) continue;
        const first = ref.path === bal.balanceA;
        const col = padCols.get(ref) ?? null;
        if (col !== null) {
          reportMoveLayoutIssue(
            'balance-color-placed',
            `panel '${panel.id}': control '${ref.path}' is placed by its balance — movePads column ${col} ignored; a balance seats its own colours`
          );
        }
        if (first) topValues[at] = ref;
        else values[at] = ref;
      }
      const seated = (c: ControlMeta) => topValues.includes(c) || values.includes(c);

      // 2. The switches take the top row — around the chips already there.
      for (const c of controls) {
        const col = padCols.get(c) ?? null;
        if (isMoveTabs(c)) placeTabs(c, col);
        else if (c.type === 'toggle' && !isToggleDial(c)) place(toggles, 'toggle', c, col);
      }

      // 3. A value chip the panel names in `moveTopRow` rides the top row in
      //    its movePads column, when that cell is free — right under its dial,
      //    still a value chip. It lands before the value row fills, so the
      //    column's value cell stays free for a second chip under it. A chip
      //    whose cell is taken, or that names no column, keeps the value row.
      const lift = panel.moveTopRow ?? [];
      const chipFits = (c: ControlMeta) =>
        isDial(c) && !noChip(c) && !dials.includes(c) && !balanceRefs.has(c) && !isPadColor(c);
      for (const c of controls) {
        if (!lift.includes(c.path) || (c.type !== 'action' && !chipFits(c))) continue;
        const col = padCols.get(c) ?? null;
        if (col === null) {
          reportMoveLayoutIssue(
            'top-row-no-column',
            `panel '${panel.id}': control '${c.path}' is named in moveTopRow but has no movePads column — the chip keeps the value row`
          );
        } else if (topAt(col) !== undefined) {
          reportMoveLayoutIssue(
            'top-row-taken',
            `panel '${panel.id}': control '${c.path}': top-row column ${col} holds '${topAt(col)!.path}' — the chip keeps the value row`
          );
        } else {
          topValues[col] = c;
        }
      }

      // 3b. A value chip the panel names in `moveActionRow` rides the action
      //     row in its movePads column, under the value row — the column's
      //     third small slot. Same fallbacks as the top row: no column, or a
      //     taken cell, and the chip keeps the value row.
      const sink = panel.moveActionRow ?? [];
      const actionValues: ControlMeta[] = [];
      for (const c of controls) {
        if (!sink.includes(c.path) || !chipFits(c) || topValues.includes(c)) continue;
        const col = padCols.get(c) ?? null;
        if (col === null) {
          reportMoveLayoutIssue(
            'action-row-no-column',
            `panel '${panel.id}': control '${c.path}' is named in moveActionRow but has no movePads column — the chip keeps the value row`
          );
        } else if (actionValues[col] !== undefined) {
          reportMoveLayoutIssue(
            'action-row-taken',
            `panel '${panel.id}': control '${c.path}': action-row column ${col} holds '${actionValues[col].path}' — the chip keeps the value row`
          );
        } else {
          actionValues[col] = c;
        }
      }

      // 4. Everything else, in the order the panel declares it.
      for (const c of controls) {
        const col = padCols.get(c) ?? null;
        if (isMoveTabs(c) || (c.type === 'toggle' && !isToggleDial(c))) continue;   /* seated in 2 */
        if (seated(c) || actionValues.includes(c)) continue;                          /* seated in 1 or 3 */
        // Actions reach the pads only when the page asks for them by column —
        // every app has buttons, and none of them expect a hardware pad.
        if (c.type === 'action') {
          if (col !== null && actionValues[col] !== undefined) {
            reportMoveLayoutIssue('action-row-taken', `panel '${panel.id}': action '${c.path}': column ${col} holds the chip '${actionValues[col].path}' — the action moves along`);
            place(actions, 'action', c, null);
          } else if (col !== null) place(actions, 'action', c, col);
        }
        // A balance's colour whose balance never landed a column falls back
        // to the ordinary chip: the value row, leftmost free (or as named).
        else if (balanceRefs.has(c)) place(values, 'value', c, col);
        // The small colour selector: a swatch on the value row, in its named
        // column — a chip like any other (tap latches, hold peeks).
        else if (isPadColor(c)) place(values, 'value', c, col);
        // A control holding a dial slot never reaches the pads — the pad grid
        // must not mirror a dial. A movePads column on one is ignored, out
        // loud, so a page that still maps its dials to pads announces itself.
        else if (dials.includes(c)) {
          if (col !== null) {
            reportMoveLayoutIssue(
              'pad-column-on-dial',
              `panel '${panel.id}': control '${c.path}' holds a dial slot — movePads column ${col} ignored; pads never mirror dials`
            );
          }
        }
        /* xy pads and ranges need a dial slot — past the 8 dials they don't fit a chip */
        else if (isDial(c) && !noChip(c)) place(values, 'value', c, col);
        // A two-handed dial or enum past the last column has no chip to fall
        // back on — it simply vanishes from the surface, which deserves a say.
        else if (isDial(c) && noChip(c)) {
          reportMoveLayoutIssue(
            'dial-dropped',
            `panel '${panel.id}': control '${c.path}' (${c.type}) needs a dial column and none is left — dropped`
          );
        }
      }
      return {
        panel,
        dials,
        toggles: toggles.slice(0, MOVE_PADS),
        values: values.slice(0, MOVE_PADS),
        actions: actions.slice(0, MOVE_PADS),
        ...(topValues.length ? { topValues: topValues.slice(0, MOVE_PADS) } : {}),
        ...(actionValues.length ? { actionValues: actionValues.slice(0, MOVE_PADS) } : {}),
      };
    });
}

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
export function movePadRows(page: MovePage, claimedRows: number): ControlMeta[][] {
  let top = page.toggles;
  const values = page.values;
  if (page.topValues?.some(Boolean)) {
    // the chips asked up top share the switch row, each in its own column
    // (an endless strip's rows run past eight columns)
    top = [];
    for (let i = 0; i < Math.max(page.toggles.length, page.topValues.length); i++) {
      const cell = page.toggles[i] ?? page.topValues[i];
      if (cell) top[i] = cell;
    }
  }
  let actions = page.actions;
  if (page.actionValues?.some(Boolean)) {
    // the chips sunk to the action row share it with the buttons, each in its own column
    actions = [];
    for (let i = 0; i < Math.max(page.actions.length, page.actionValues.length); i++) {
      const cell = page.actions[i] ?? page.actionValues[i];
      if (cell) actions[i] = cell;
    }
  }
  if (claimedRows >= 2) return [top, values, [], []];
  return [top, values, actions, []];
}

/**
 * Which claimed hardware row a screen row shows, or null when it is a control
 * row. Two claimed rows fill screen rows 2 and 3 (y=1 then y=0); one claimed
 * row is the bottom row alone, and lands on screen row 3 — below the action
 * pads, exactly where the hardware puts it.
 */
export function moveAppPadRow(row: number, claimedRows: number): 0 | 1 | null {
  if (claimedRows >= 2) return row === 2 ? 1 : row === 3 ? 0 : null;
  return claimedRows === 1 && row === 3 ? 0 : null;
}

/**
 * The columns the on-screen panel actually shows: a column is occupied when
 * it has a dial, a toggle chip, or a value chip at that index. The indices
 * stay the hardware knob numbers — callers hide the unoccupied columns,
 * never renumber them, so the latch/substitution logic and the physical
 * knobs keep agreeing on what column i means.
 */
/**
 * The runs of big slots a page draws as one container, from the panel's
 * `moveSlotGroups`: `start` is the position among the columns shown (hidden
 * columns take no room on screen) and `span` how many slots it covers. A group
 * needs two slots side by side; one whose slots are not adjacent on screen is
 * reported and left out, rather than drawn around a stranger.
 */
export function slotGroups(page: MovePage, cols: number[] = visibleColumns(page)): { start: number; span: number; label?: string }[] {
  const out: { start: number; span: number; label?: string }[] = [];
  for (const group of page.panel.moveSlotGroups ?? []) {
    const paths = Array.isArray(group) ? group : group.slots;
    const label = Array.isArray(group) ? undefined : group.label;
    const at = cols.flatMap((col, position) => {
      const dial = page.dials[col];
      return dial && paths.includes(dial.path) ? [position] : [];
    });
    if (at.length < 2) continue;
    const start = at[0];
    const span = at[at.length - 1] - start + 1;
    if (span !== at.length) {
      reportMoveLayoutIssue('slot-group-apart', `panel '${page.panel.id}': slot group [${paths.join(', ')}] is not side by side on the page — not drawn`);
      continue;
    }
    out.push({ start, span, ...(label ? { label } : {}) });
  }
  return out;
}

export function visibleColumns(page: MovePage): number[] {
  const cols: number[] = [];
  for (let i = 0; i < MOVE_DIALS; i++) {
    if (page.dials[i] || page.toggles[i] || page.topValues?.[i] || page.values[i] || page.actions[i] || page.actionValues?.[i]) cols.push(i);
  }
  return cols;
}

/** A boolean dial's position: exact endpoints, and halfway reads as on — the
 *  same rule the on-screen slot follows, so the knob and the slot agree. */
export const normalizeToggleDial = (value: unknown): number => (value === true ? 1 : 0);
export const denormalizeToggleDial = (v01: number): boolean => Number.isFinite(v01) && v01 >= 0.5;

/** Dial position 0..1 back to the control's real value, kit-identical. */
export function denormalizeDial(meta: ControlMeta, v01: number): number {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (meta.step) v = Math.round(v / meta.step) * meta.step;
  return Number(v.toFixed(6));
}

/** Dial position 0..1, the same normalization the kit puts on the wire. */
export function normalizeDial(meta: ControlMeta, value: unknown): number {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (Number(value) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}

const norm01 = (v: unknown, min: number, max: number) => {
  const n = (Number(v) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
};

const denorm01 = (v01: number, min: number, max: number, step: number) => {
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (step) v = Math.round(v / step) * step;
  return Number(v.toFixed(6));
};

/** An xy pad's position, each axis 0..1 — the two numbers on the wire. */
export function normalizeXYDial(meta: ControlMeta, value: unknown): { x: number; y: number } {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  const v = (value ?? {}) as Partial<XYValue>;
  return { x: norm01(v.x, xAxis.min, xAxis.max), y: norm01(v.y, yAxis.min, yAxis.max) };
}

/** Enum dial helpers — options may be strings or { value, label, icon }. */
export const enumOptionValue = (o: string | { value: string; label?: string }) =>
  typeof o === 'string' ? o : o.value;
export const enumOptionLabel = (o: string | { value: string; label?: string }) =>
  typeof o === 'string' ? o : (o.label ?? o.value);
/** The option's glyph name, or null — a bare string option never has one. */
export const enumOptionIcon = (o: string | { icon?: string }): string | null =>
  typeof o === 'string' ? null : (o.icon ?? null);

/** Enough points to read a bell or a bounce at slot width, and no more. */
export const ENUM_SHAPE_SAMPLES = 64;

/**
 * The shape an enum option stands for, as an SVG path filling a 100×100 box
 * with y pointing up — or null when the select declares no `preview`, or that
 * option has no shape. Fitted through the curve row's own core, so a bipolar
 * arc and a 0..1 envelope both fill the box edge to edge.
 *
 * Lives here rather than in the panel so the "what does this slot draw"
 * question has one answer both surfaces can be tested against.
 */
export function enumShapePath(meta: ControlMeta, value: unknown): string | null {
  if (!meta.preview) return null;
  let sample: ((t: number) => number) | null | undefined;
  try {
    sample = meta.preview(String(value ?? ''));
  } catch {
    return null;                      /* a throwing preview draws nothing */
  }
  if (typeof sample !== 'function') return null;
  const segments = plotCurve(sample, { count: ENUM_SHAPE_SAMPLES }).segments;

  // The curve row fits with headroom so a thick stroke never clips at the
  // edge of a tall surface. A slot is not tall, and that headroom reads as a
  // gap the layout did not ask for — so the ink is re-fitted to fill the box
  // and the CSS band alone decides how much air the drawing gets.
  let lo = Infinity;
  let hi = -Infinity;
  for (const seg of segments) {
    for (const pt of seg) {
      if (pt.v < lo) lo = pt.v;
      if (pt.v > hi) hi = pt.v;
    }
  }
  if (lo > hi) return null;                        /* nothing was plotted */
  const span = hi - lo;
  const fill = (v: number) => (span > 0 ? (v - lo) / span : 0.5);

  const d = segments
    .map((seg) =>
      seg
        .map((pt, i) =>
          `${i ? 'L' : 'M'} ${(pt.t * 100).toFixed(2)} ${((1 - fill(pt.v)) * 100).toFixed(2)}`)
        .join(' '))
    .join(' ');
  return d || null;
}
export function enumIndex(meta: ControlMeta, value: unknown): number {
  const i = (meta.options ?? []).findIndex((o) => enumOptionValue(o as never) === value);
  return Math.max(0, i);
}

/** A range dial's two ends, each 0..1 — the two numbers on the wire. */
export function normalizeRangeDial(meta: ControlMeta, value: unknown): { lo: number; hi: number } {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (value ?? {}) as Partial<RangeValue>;
  return { lo: norm01(v.min, min, max), hi: norm01(v.max, min, max) };
}

/** End positions 0..1 back to the control's real {min, max}, kit-identical —
 *  clamped into the bounds and ordered, so crossed ends never come back reversed. */
export function denormalizeRangeDial(meta: ControlMeta, lo01: number, hi01: number): RangeValue {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const step = meta.step ?? 0;
  return clampRange(
    { min: denorm01(lo01, min, max, step), max: denorm01(hi01, min, max, step) },
    min,
    max
  );
}

/** An enum dial's position 0..1 — the option's index over the last index.
 *  An unknown (or missing) value reads as the first option, position 0. */
export function normalizeEnumDial(meta: ControlMeta, value: unknown): number {
  const opts = (meta.options ?? []).map((o) => enumOptionValue(o as never));
  if (opts.length < 2) return 0;
  const i = opts.indexOf(String(value));
  return i <= 0 ? 0 : i / (opts.length - 1);
}

/** Dial position 0..1 back to the option at that step, kit-identical:
 *  round(v01 * (count-1)), clamped into the options list. */
export function denormalizeEnumDial(meta: ControlMeta, v01: number): string {
  const opts = (meta.options ?? []).map((o) => enumOptionValue(o as never));
  if (opts.length === 0) return '';
  const i = Math.round(Math.min(1, Math.max(0, v01)) * (opts.length - 1));
  return opts[i];
}

/** A filter dial's two hands, each 0..1 — the two numbers on the wire.
 *  The left column's knob is cutoff, the right column's is resonance. */
export function normalizeFilterDial(meta: ControlMeta, value: unknown): { cutoff: number; resonance: number } {
  const ca = resolveFilterAxis(meta.cutoffAxis, 'cutoff');
  const ra = resolveFilterAxis(meta.resonanceAxis, 'resonance');
  const v = normalizeFilterValue(value, ca, ra);
  return { cutoff: filterHand01(v.cutoff, ca), resonance: filterHand01(v.resonance, ra) };
}

/** Hand positions 0..1 back to the control's real pair, kit-identical. */
export function denormalizeFilterDial(meta: ControlMeta, cutoff01: number, resonance01: number): FilterValue {
  const ca = resolveFilterAxis(meta.cutoffAxis, 'cutoff');
  const ra = resolveFilterAxis(meta.resonanceAxis, 'resonance');
  return { cutoff: filterHandValue(cutoff01, ca), resonance: filterHandValue(resonance01, ra) };
}

/**
 * The 2-slot picture: the filter's magnitude response as an SVG path filling
 * a 100×100 box, y pointing up — through the app's own `response` when the
 * config brought one, else the kit's lowpass. One answer both surfaces can
 * be tested against, like `enumShapePath`.
 */
export function filterShapePath(meta: ControlMeta, value: unknown): string | null {
  const pos = normalizeFilterDial(meta, value);
  let response: ((t: number) => number) | null | undefined;
  try {
    response = (meta.response ?? defaultFilterResponse)(pos.cutoff, pos.resonance);
  } catch {
    return null;                      /* a throwing response draws nothing */
  }
  if (typeof response !== 'function') return null;
  return filterResponsePath(response);
}

/** Where the fill anchors for a bipolar/origin slider, 0..1 (else 0). */
export function dialOrigin(meta: ControlMeta): number {
  const origin = meta.origin ?? (meta.bipolar ? 0 : undefined);
  return origin === undefined ? 0 : normalizeDial(meta, origin);
}

/** Axis positions 0..1 back to the control's real {x, y}, kit-identical. */
export function denormalizeXYDial(meta: ControlMeta, x01: number, y01: number): XYValue {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  return {
    x: denorm01(x01, xAxis.min, xAxis.max, xAxis.step),
    y: denorm01(y01, yAxis.min, yAxis.max, yAxis.step),
  };
}
