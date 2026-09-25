import { MovePadListStore } from '../move-pad-list';
import { MovePadList } from './MovePadList';
import { PresetExploration, PresetExplorationSlots } from './PresetExploration';
import { PresetExplorationStore } from '../preset-exploration';
import { useEffect, useLayoutEffect, useId, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TweakStore, PanelConfig, ControlMeta } from '../store/TweakStore';
import { ModulationStore } from '../store/ModulationStore';
import { modColor, curveComposition, envelopePoints, envelopeJoints, envCurveParam, ENV_BEND_STAGES, envWaveParam, envWaveFlipParam, ENV_WAVE_STAGES, modPageWidth, MOD_SETTINGS_PANEL, getAudioModBuffer, setAudioModBuffer, subscribeAudioMod, getAudioModVersion, setAudioModWindowSource, getAudioModWindow, type EnvStage, type ModulationSlot, type ModulationParams } from '../modulation-core';
import { MoveWaveform } from './MoveWaveform';
import { MoveWaveformStore, MOVE_WAVEFORM_PADS, MOVE_WAVEFORM_PANEL, visibleWindow, moveWaveformDemoSample } from '../move-waveform';
import { ICON_PLAY, ICON_LOOP, ICON_SEARCH } from '../icons';
import { CurveComposer } from './CurveComposer';
import type { CurveSegment } from '../curve-composer-core';
import { isDevDefault } from '../env';
import type { TweakTheme } from '../theme';
import { buildMovePages, buildModMovePage, slotGroups, visibleColumns, movePadRows, moveAppPadRow, normalizeDial, denormalizeDial, normalizeRangeDial, filterShapePath, dialOrigin, dialSpan, isEnumDial, isSpanContinuation, isPadSpanContinuation, isMoveTabs, isNamedTabs, padSpan, moveTabCell, moveBandCell, moveEdgesCell, enumOptionValue, enumOptionLabel, enumOptionIcon, enumOptionPicture, enumShapePath, enumIndex, MOVE_TRACKS, MOVE_DIALS, MOVE_PADS, type MovePage } from '../move-layout';
import { buildMoveStrip, clampStripOffset, stepStripOffset, pageStripOffset, stripDialColumns, stripDialSlots, stripWindowPads, stripOffsets, stripSlotCount, stripSlotIndex } from '../move-strip';
import { resolveFilterAxis, normalizeFilterValue } from '../filter-core';
import { moveSlotKind, MoveSlotXYBody, MoveSlotDefaultBody, MoveSlotEnumBody, MoveSlotRangeBody, MoveSlotFilterBody, MoveSlotNumericBody, MoveSlotTrimSpanBody, MoveSlotGateBody, MoveSlotVectorBody, MoveSlotMultibandBody, MoveSlotChannelBody, MoveSlotEnvBody, MoveSlotScopeBody, MoveSlotToggleBody, MoveSlotMetronomeBody, MoveSlotTransferBody, MoveSlotRampBody, MoveSlotDialBody, MovePadToggleBody, MovePadIconBody, MovePadValueBody, MovePadActionBody, MovePadIconLabelBody, MovePadAppBody, MovePadWaveBody, MovePadTabsBody, MovePadColorBody, MovePadBandBody, MovePadFadeBody, MovePadLoopBody } from './move-slots';
import { normalizeGradient, rampCss } from '../gradient-core';
import { LONG_PRESS_MS } from '../color-core';
import { valueToBearing } from '../angle-core';
import { normalizeTransfer, sampleTransfer, type TransferValue } from '../transfer-core';
import { moveNumericDrawing, movePlaybackMode, moveVisualReading, moveTrimSpan, moveGateSpan, moveVectorAxes, moveMultibandSpan, moveMultibandRole, moveChannelPosition } from '../move-visual-core';
import {
  MOVE_TAP_SLOP,
  moveDialKey, moveRangeValue, moveFilterValue, moveXYValue, moveXYRest, moveNeedleValue,
  moveTransferValue, moveRampStop, moveRampValue, moveDialPercent, moveDialReading,
  moveRangeReading, moveChipValue, moveXYGrid, moveShapePath,
} from '../move-slot-core';
import {
  MOVE_LIST_ROW_TRAVEL, movePressStart, movePressTravel, movePressEnd, moveTurnValue, moveTurnExtent,
  moveOptionStep, moveNextOption, type MovePress,
} from '../move-slot-core';
import { attachMoveKeys } from '../move-keys';
import { MoveMenuButton } from './MoveMenuButton';
import { MoveGateDisplay } from './MoveGateDisplay';
import { MoveMultibandDisplay } from './MoveMultibandDisplay';
import { MoveModRing } from './ModRing';
import { MOVE_TRACK_COLORS } from '../move-palette';
import { MoveSurfaceStore, moveScreenRowLabel, moveScreenRowSearchText, type MovePadCell, type MoveStepCell } from '../move-surface-store';
import { resolveAxis, pointFromValue, normalizeValue, type XYValue } from '../xy-pad-core';
import { MoveVolumeDisplay, type MoveVolumeDisplayState } from '../move-volume';
import { MoveColorStore, MOVE_GRADIENT_STOPS } from '../move-color';
import { MoveSearchStore, moveSearchFilter, type MoveSearchTarget, type MoveSearchView } from '../move-search';
import { MoveColorSlot, MoveColorDisplay, MoveOpacityPads, MoveColorSteps, MovePaletteScreen, copyHslOfHex, copyOklch } from './MoveColor';
import { MoveFunctions } from '../move-functions';
import { MoveFunctionChips } from './MoveFunctionChips';
import { MoveTimelineClock, MoveTimelineZoom } from './MoveTimeline';
import { MoveTimelineStore } from '../move-timeline';
import { MoveSettingsView } from '../move-settings';
import { MovePresetStore, type MovePresetView } from '../move-presets';
import { ListScreen } from './ListScreen';
import { MovePanelMotion } from './MovePanelMotion';

export interface MovePanelProps {
  theme?: TweakTheme;
  productionEnabled?: boolean;
  /** Mirror only the named panels, in the order given — same option the bridge kit takes. */
  panels?: string | string[];
  /**
   * The app's settings room: one or more registered panels (by id or name)
   * held out of the page row and shown only in the settings view. The
   * Move's Set Overview button (Shift + Step 1) toggles the view — the
   * panel attaches `set_overview` itself — the surface inverts to the
   * settings palette, and Back walks out. Inside, each named panel is a
   * room page of its own: the track buttons (and the room's tab row)
   * switch between them, completely separate from the app's pages.
   */
  settings?: string | string[];
  /**
   * Where the panel sits. `viewport` (the default) portals it to `<body>` and
   * pins it to the window's bottom edge — for apps whose content fills the
   * screen. `flow` renders it inline, in normal document flow, wherever the
   * host puts it — for sparse apps that want the content and the panel to
   * read as one group instead of leaving a dead gap between them.
   */
  dock?: 'viewport' | 'flow';
  /**
   * The endless strip: a page may carry any number of slots, and the big
   * wheel scrolls the row through them. Nothing is demoted to a value chip,
   * and the small slots ride under the slots they belong to — so a
   * panel of forty parameters is one instrument, not five pages of it.
   *
   * Strictly opt-in, and not a default for integrations: the standard
   * panel is the fixed eight-column surface (overflow becomes value chips
   * per the layout rules). Enable the strip only on Cri's direct request
   * for that app.
   */
  scroll?: boolean;
  /** A focused correction view: occupied pad columns only, with numeric values visible at rest. */
  focused?: boolean;
  /**
   * View-owned status placed in the panel's top-left header slot. This is for
   * a compact, live readout that belongs beside the panel (for example a
   * waveform zoom), not for another row of page controls.
   */
  headerStart?: React.ReactNode;
  /**
   * View-owned status placed at the far end of the header, after the function
   * chips — where the instrument's own time indicator sits. A view whose app
   * keeps the clock itself (an app transport rather than a timeline or a
   * waveform) puts it here, so the reading is always the last thing on the row
   * and every button stands to its left.
   */
  headerEnd?: React.ReactNode;
  /**
   * Where the attached-function chips sit (see `MoveFunctionChips`): every
   * function the app attaches renders as a chip that runs the same handler
   * as the hardware key. `clock` (the default) puts the row immediately
   * left of the volume readout, at the header's right end; `tracks` puts it
   * after the track labels at the other end; `none` leaves the chips to the
   * host (mount `MoveFunctionChips` yourself, or go without).
   */
  functionChips?: 'clock' | 'tracks' | 'none';
}

/** The Move's four track colours, in track order (Figma node 802:321). */
/* The track hues now live with the rest of the Move's screen palette, matched
   to the colours the hardware lights. Re-exported here because this is where
   callers have always imported them from. */
export { MOVE_TRACK_COLORS };

/** The on-screen pad grid mirrors the Move grid's 4 rows (Figma 802:319). */
const PAD_ROWS = 4;
/** Even a sparse screen pad layout keeps enough columns to read as the Move,
 * rather than turning two occupied columns into a tall button list. */
const MIN_PAD_COLUMNS = 4;

/** A fade or loop line's inset from its pill's sides — must match
 *  .tweakers-move-edges-track. */
const EDGES_TRACK_INSET = 12;

/** Press shorter than this is a tap (latch); longer is a hold (peek). */
const TAP_MS = 300;

/** Wheel travel that moves the strip on by one slot — a mouse notch is ~100. */
const WHEEL_SLOT_PX = 60;

/** How often the strip's window is restated for a bridge that bound late. */
const STRIP_REANNOUNCE_MS = 1000;

/** True while the preset navigator is up: the wheel is browsing its list,
 *  and a scrolling page must keep its hands off. Read from the store rather
 *  than from the event, so it holds however the listeners end up ordered. */
const presetNavigatorOpen = () => {
  const view = MovePresetStore.getView();
  return !!view && view.phase !== 'closing';
};

/** True while the colour editor's palette navigator is up — the wheel is
 *  browsing palettes, on the same terms as the preset navigator. */
const palettePickerOpen = () => MoveColorStore.isPickerOpen();

/**
 * The list a search is running on, read as one shape whichever store owns
 * it: its labels in row order (with any words the rows are also found by), the row the wheel rests on, and the two
 * things the search does to it — rest the wheel on a row (the next match,
 * previewed exactly as a wheel turn is) and take a row (which ends the
 * search). Null when the list has gone from under the search.
 */
interface SearchRows {
  labels: string[];
  cursor: number;
  rest: (index: number) => void;
  take: (index: number) => void;
}
function searchRows(view: MoveSearchView): SearchRows | null {
  if (view.target === 'screen') {
    const screen = MoveSurfaceStore.getState().screen;
    if (!screen) return null;
    return {
      labels: screen.items.map(moveScreenRowSearchText),
      cursor: view.cursor,
      rest: (index) => MoveSearchStore.setCursor(index),
      take: (index) => { MoveSearchStore.close(); MoveSurfaceStore.selectScreen(index); },
    };
  }
  if (view.target === 'presets') {
    const preset = MovePresetStore.getView();
    if (!preset || preset.phase === 'closing') return null;
    const items = MovePresetStore.items(preset.panelId);
    return {
      labels: items.map((i) => i.label),
      cursor: items.findIndex((i) => i.id === preset.cursor),
      rest: (index) => MovePresetStore.rest(items[index].id),
      take: (index) => { MoveSearchStore.close(); MovePresetStore.choose(items[index].id); },
    };
  }
  if (!palettePickerOpen()) return null;
  return {
    labels: ['All colors', ...MoveColorStore.palettes().map((p) => p.name)],
    cursor: MoveColorStore.getPickerCursor(),
    rest: (index) => MoveColorStore.setPickerCursor(index),
    take: (index) => { MoveSearchStore.close(); MoveColorStore.choosePicker(index); },
  };
}

/** The rows the search's query keeps, by index into the list. */
const searchKept = (rows: SearchRows, view: MoveSearchView) => moveSearchFilter(rows.labels, view.query);

/** Walk the wheel by detents through the rows the query keeps. */
function searchStep(view: MoveSearchView, delta: number) {
  const rows = searchRows(view);
  if (!rows || !delta) return;
  const kept = searchKept(rows, view);
  if (!kept.length) return;
  const at = kept.indexOf(rows.cursor);
  const next = kept[Math.max(0, Math.min(kept.length - 1, (at < 0 ? 0 : at) + delta))];
  if (next !== rows.cursor) rows.rest(next);
}

/** Take the row the wheel rests on — only a row the query keeps. */
function searchTake(view: MoveSearchView) {
  const rows = searchRows(view);
  if (rows && searchKept(rows, view).includes(rows.cursor)) rows.take(rows.cursor);
}

/** Type into the search: the rows narrow, and a wheel left on a row the
 *  query dropped moves to the first one it keeps. */
function searchType(query: string) {
  MoveSearchStore.setQuery(query);
  const view = MoveSearchStore.getView();
  const rows = view && searchRows(view);
  if (!view || !rows) return;
  const kept = searchKept(rows, view);
  if (kept.length && !kept.includes(rows.cursor)) rows.rest(kept[0]);
}

/**
 * A readout string with any `:` separators pulled out and rendered bold at
 * 14px — a `0:00:00` time reads as digit groups, not a colon soup. Strings
 * without colons pass through untouched.
 */
/** A `moveHold` switch pad's gestures: on while the pointer or a key holds it,
 *  off on release — including a pointer that slides away or is cancelled. */
function holdPad(panelId: string, path: string) {
  const set = (on: boolean) => { if (TweakStore.getValue(panelId, path) !== on) TweakStore.updateValue(panelId, path, on) }
  return {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not capturable */ }
      set(true)
    },
    onPointerUp: () => set(false),
    onPointerCancel: () => set(false),
    onLostPointerCapture: () => set(false),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) set(true) } },
    onKeyUp: (e: React.KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') set(false) },
    onBlur: () => set(false),
  }
}

function boldColons(text: string) {
  if (!text.includes(':')) return text;
  return text.split(':').flatMap((part, i) =>
    i === 0 ? [part] : [<span key={`sep-${i}`} className="tweakers-move-volume-sep">:</span>, part]
  );
}

/**
 * The bridge kit's window events, keyed by control path:
 * - touch (in): `{ pageId, touched }` — a finger on a physical knob.
 * - override (in): `{ pageId, held, latched }` — hardware value-pad holds
 *   and latches, so the screen mirrors them.
 * - latch (out): `{ pageId, path, latched }` — a screen tap latching or
 *   releasing a value chip, for the kit to relay to the hardware.
 */
export const MOVE_TOUCH_EVENT = 'move-tweakers:touch';
export const MOVE_OVERRIDE_EVENT = 'move-tweakers:override';
export const MOVE_LATCH_EVENT = 'move-tweakers:latch';
/** In: `{ pageId }` — the page the hardware is showing; the panel follows. */
export const MOVE_PAGE_EVENT = 'move-tweakers:page';
/** Out: `{ pageId }` — a screen track tap, for the kit to switch the hardware. */
export const MOVE_PAGE_SELECT_EVENT = 'move-tweakers:page-select';
/** In, cancelable: `{ delta, shift }` — the big wheel turned, a signed
 *  multi-step count. A scrolling page takes it (one detent, one slot) and an
 *  open preset navigator takes it first; whoever consumes it calls
 *  preventDefault, else the kit's waveform zooms. */
export const MOVE_JOG_EVENT = 'move-tweakers:jog';
/** In, cancelable: `{ shift }` — the wheel pressed. Same consumption rule. */
export const MOVE_JOG_CLICK_EVENT = 'move-tweakers:jog-click';
/** In, cancelable: `{ delta, shift }` — the volume knob turned, when no slot
 *  has claimed it as a second hand. A mounted waveform scrubs with it; an app
 *  that gives the knob its own meaning (a layer's opacity, a gain) listens,
 *  consumes it with preventDefault, and names what it edits through
 *  MoveVolumeDisplay — a claimed volume knob with no readout is a bug. */
export const MOVE_VOLUME_EVENT = 'move-tweakers:volume';
/** In, cancelable: `{ shift }` — a still tap on the volume knob. It has no
 *  built-in meaning; the app gives it one (a reset, a toggle to full). */
export const MOVE_VOLUME_TAP_EVENT = 'move-tweakers:volume-tap';
/** In, cancelable: `{ pressed, shift }` — the Mute button's raw press and
 *  release. An open preset navigator consumes them: holding Mute plays the
 *  pre-navigator sound to compare. Unconsumed, Mute stays the app's. */
export const MOVE_MUTE_EVENT = 'move-tweakers:mute';
/** In, cancelable: `{ shift }` — the Capture key held. The panel takes it
 *  when a list has the wheel (the app's wheel list, an open navigator) and
 *  opens a search on that list; unconsumed, the hold is the app's own
 *  Capture action. Held again while searching, it closes the search. */
export const MOVE_SEARCH_EVENT = 'move-tweakers:search';
/** Out: `{ pageId, offset, columns, paths }` — where a scrolling page's
 *  window now sits, so the kit can point the hardware's dials at the same 8
 *  controls the screen is showing. */
export const MOVE_STRIP_EVENT = 'move-tweakers:strip';
/** Out: `{ panelId, open, pageId }` — the settings room: which panel it is,
 *  whether it stands open, and the regular page to come back to. Re-announced
 *  every second so a kit that binds late still learns to keep the room off
 *  the track row; the kit steers the hardware in and out on `open` edges. */
export const MOVE_SETTINGS_EVENT = 'move-tweakers:settings';

/**
 * The Move's control surface, laid out to Cri's Figma spec (file
 * USU9CW2vC3SrvKsnHVnYGi, node 802:319; slot components 802:756 and
 * 800:1737): a track row of coloured markers — one per page, so an app
 * with a single panel gets a single tick and name — 8 dial slots hosting
 * slider ports, and the pad grid — toggle chips on the first row, value
 * chips on the second, at the same columns as their hardware pads
 * (move-layout keeps both surfaces in agreement).
 *
 * `dock` decides where it lives: `viewport` portals it to `<body>` and pins
 * it to the window's bottom edge; `flow` leaves it inline where the host
 * placed it. Both wear the same surface, padding and slot geometry.
 *
 * Only occupied slots/columns are shown: a column renders when it holds a
 * dial, a toggle chip, or a value chip, at its full 8-wide slot size; the
 * visible cluster centres in the panel and the header row shares its width,
 * so the page name lines up with the first visible slot. Hidden columns
 * are skipped, never renumbered — column i is still hardware knob i.
 *
 * Value chips substitute the dial in their column: hold one to peek at
 * its value in the dial slot, tap to latch it in — the chip inverts and
 * pulses until tapped again. The same gestures on the physical pads
 * arrive through the kit's override event and read identically here.
 *
 * An xy control takes a dial slot as a 2D pad: the field draws behind the
 * label (no slider at the bottom) with crosshair lines meeting at the dot.
 * Dragging the slot sets both axes; on the hardware the column's knob
 * turns X, and the volume knob turns Y while that knob is touched.
 *
 * A range control takes a dial slot too: the bar fills between two handle
 * ticks, and a drag grabs the nearest handle. On the hardware the column's
 * knob edits the low handle and the volume knob edits the high one while
 * that knob is touched — the xy pad's two-handed concept on one axis.
 * Bipolar/origin sliders anchor their fill at the origin mark.
 *
 * A select with options takes a dial slot as a stepped enum dial: the bar
 * splits into one cell per option, the active cell filled, and the readout
 * shows the option's label. A click moves it on to the next option; a drag
 * steps through them, right or down being the next.
 *
 * Every other one-value slot — a plain dial, a face's bar, a trim edge —
 * takes the cursor the way its knob takes the hand: a drag turns it from
 * where it is (right or up raises it), and a press alone never moves it. A
 * still Shift+click puts any slot back to its default, the knob's Shift+tap.
 * Holding Shift mid-drag switches to fine mode: pointer travel applies at
 * 0.1× relative to where shift went down, and releasing shift rebases at 1×
 * so the value never jumps.
 *
 * The panel also carries the Move's Menu button, pinned to the window's
 * top-right corner, and the computer's keys for Undo (⌘Z), Delete
 * (Backspace) and Copy (⌘C) — each running what its button holds.
 *
 * Controls wired to a modulation slot wear the dock panel's own modulation
 * ring — the slot's colour, and an arc running from the control's value to
 * where the modulation is holding it — in the slot's corner, and
 * the track row carries one circle per slot — the on-screen step button.
 *
 * With `scroll` the page stops being 8 slots wide. Every control keeps a
 * full slot, the row scrolls through them — the big wheel on the hardware,
 * the mouse wheel or a drag on the rail here — and the eight slots on screen
 * are the eight the dials are holding, their pads with them, so all of them
 * can be reached without a single one shrinking to a chip.
 */
export function MovePanel({ theme = 'system', productionEnabled = isDevDefault, panels: only, dock = 'viewport', scroll = false, focused = false, headerStart, headerEnd, settings, functionChips = 'clock' }: MovePanelProps) {
  if (!productionEnabled) return null;
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [track, setTrack] = useState(0);
  const [dragPath, setDragPath] = useState<string | null>(null);
  // A held bend pad: while down, its vertical drag bends the ramp above it
  // — the envelope's hold-to-curve gesture. The ref anchors the drag.
  const [bendHeld, setBendHeld] = useState<EnvStage | null>(null);
  const bendRef = useRef<{ y: number; curve: number } | null>(null);
  // A held wave pad: the same vertical drag, one row down, lifting the
  // stage's own sine into it. `moved` is what tells a drag from a tap —
  // a tap flips the sine over instead of setting an amount.
  const [waveHeld, setWaveHeld] = useState<EnvStage | null>(null);
  const waveRef = useRef<{ y: number; amount: number; moved: boolean } | null>(null);
  // Hardware presence, by control path — from the bridge kit's window events.
  const [handTouch, setHandTouch] = useState<Record<string, boolean>>({});
  // Which point of a transfer curve each knob is holding. One knob shapes a
  // whole curve, so the slot has to carry the choice; a knob tap (or a click
  // near another point) moves it on.
  const [curvePoint, setCurvePoint] = useState<Record<string, number>>({});
  // …and which stop of a ramp. Same idea: one knob, a list of things. */
  const [rampStop, setRampStop] = useState<Record<string, number>>({});
  // The ramp slot's press, until it moves: a still press is the TAP that
  // opens the colour editor, a travelled one is the stop drag.
  const rampGesture = useRef<{ path: string; x: number; y: number; moved: boolean } | null>(null);
  const [hwHeld, setHwHeld] = useState<Record<string, boolean>>({});
  const [hwLatched, setHwLatched] = useState<Record<string, boolean>>({});
  // A pointer on an app-owned pad lights immediately, before the host has
  // handled the released gesture. This mirrors the physical pad's momentary
  // feedback without inventing a latched state for an app action.
  const [appHeld, setAppHeld] = useState<string | null>(null);
  // Screen-side chip substitution: a held chip peeks, a tapped chip latches —
  // every chip, a value or a colour, on whichever row it sits.
  const [held, setHeld] = useState<{ col: number; meta: ControlMeta } | null>(null);
  const [latched, setLatched] = useState<Record<number, ControlMeta | undefined>>({});
  const holdStart = useRef(0);
  const [mounted, setMounted] = useState(false);
  const pageTabsId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // The rail's drag anchor: pointer x, and the stop it started on.
  const [dotDrag, setDotDrag] = useState<{ x: number; stop: number } | null>(null);
  // Shift mid-drag = fine mode: pointer travel applies at 0.1× relative to the
  // value snapshot where shift went down; releasing shift rebases at 1× so the
  // value never jumps back to the cursor's absolute position.
  const fineRef = useRef<{ shift: boolean; x: number; y: number; v: unknown } | null>(null);
  // The control a face's drag holds — on a band grid, the band nearest the press.
  const faceDrag = useRef<ControlMeta | null>(null);
  // A value slot's press, until it lets go (see MovePress).
  const pressRef = useRef<MovePress | null>(null);
  // Which range handle a gesture grabbed — locked at pointer-down.
  const rangeHandleRef = useRef<'min' | 'max'>('min');
  // Which filter hand a gesture grabbed (left half = cutoff, right half =
  // resonance) — locked at pointer-down, like the range handle.
  const filterHandRef = useRef<'cutoff' | 'resonance'>('cutoff');

  // Volume-dial readout: a static value renders as set; a getValue is polled
  // per animation frame while mounted, for readouts that move (a playhead).
  const [volume, setVolume] = useState<MoveVolumeDisplayState | null>(() => MoveVolumeDisplay.get());
  // A mounted waveform holds the knob, so its clock takes the corner: the
  // playhead's time with the transport's state around it. That is the one
  // readout a waveform gets, whichever host mounts it.
  const waveClaimed = useSyncExternalStore(
    useCallback((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.isRegistered(),
    () => false
  );
  // A timeline on the surface holds the knob in front of any waveform: its
  // clock, with its transport, takes the corner.
  const timelineClaimed = useSyncExternalStore(
    useCallback((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.isRegistered(),
    () => false
  );
  const [liveValue, setLiveValue] = useState<string | null>(null);
  useEffect(() => {
    setVolume(MoveVolumeDisplay.get());
    return MoveVolumeDisplay.subscribe(() => setVolume(MoveVolumeDisplay.get()));
  }, []);
  useEffect(() => {
    const poll = volume?.getValue;
    if (!poll) {
      setLiveValue(null);
      return;
    }
    let raf = requestAnimationFrame(function tick() {
      setLiveValue(poll());
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [volume]);

  // The selection travels as a string so the effect below re-reads only when
  // the NAMES change, not when the host hands over a fresh array. It is
  // serialized rather than joined: panel names have spaces in them.
  const onlyKey = only === undefined ? undefined : JSON.stringify(Array.isArray(only) ? only : [only]);
  const read = useCallback(() => {
    if (onlyKey === undefined) return TweakStore.selectPanels();
    const requested = JSON.parse(onlyKey) as string[];
    const registered = TweakStore.getPanels('panel');
    // App pages are addressed by stable panel id. Names remain display copy:
    // changing "snare" to "snare top" must not create a new hardware page.
    // Name lookup stays as a compatibility path for existing integrations.
    return requested
      .map((key) => registered.find((panel) => panel.id === key || panel.name === key))
      .filter((panel): panel is PanelConfig => panel !== undefined);
  }, [onlyKey]);

  useEffect(() => {
    setMounted(true);
    // The kit's own room page — the waveform's look — is there from the
    // start, not from the first time a sample happens to show: a room that
    // gains a page while you stand in it is a room you cannot trust.
    MoveWaveformStore.ensureSettings();
    setPanels(read());
    return TweakStore.subscribeGlobal(() => setPanels(read()));
  }, [read]);

  // The settings room: the named panels leave the page row and wait behind
  // the Set Overview button, each one a room page of its own. The store only
  // says whether the door is open; what is inside is decided here, by the
  // prop. The key keeps identity stable when the host hands over fresh
  // arrays, exactly like the panels selection above.
  const settingsKey = settings === undefined ? undefined : JSON.stringify(Array.isArray(settings) ? settings : [settings]);
  const namedRooms = settingsKey === undefined
    ? []
    : (JSON.parse(settingsKey) as string[])
        .map((key) => TweakStore.getPanels('panel').find((p) => p.id === key || p.name === key))
        .filter((p): p is PanelConfig => p !== undefined);
  // The kit's own pages ride after the app's: the waveform's look, once a
  // waveform has claimed the surface. An app with no room of its own still
  // gets the door, because the page behind it is the kit's.
  const waveRoom = TweakStore.getPanel(MOVE_WAVEFORM_PANEL);
  const settingsRooms = waveRoom ? [...namedRooms, waveRoom] : namedRooms;
  const roomIds = settingsRooms.map((p) => p.id);
  const settingsOpen = useSyncExternalStore(
    useCallback((cb) => MoveSettingsView.subscribe(cb), []),
    () => MoveSettingsView.isOpen(),
    () => false
  ) && settingsRooms.length > 0;

  // A scrolling page keeps every control at slot size in one long row; the
  // ordinary page is 8 slots wide and sends the overflow to value chips.
  const pagePanels = roomIds.length ? panels.filter((p) => !roomIds.includes(p.id)) : panels;
  const pages = scroll
    ? pagePanels.filter((p) => p.kind === undefined).slice(0, MOVE_TRACKS).map(buildMoveStrip)
    : buildMovePages(pagePanels);
  // An open modulator-settings page takes the surface over; the track
  // buttons put a regular page back (and close the settings with it).
  // The settings room stands in front of even that: while it is open the
  // modulator view (and its floating composer) waits underneath, untouched,
  // and walking out of the room finds it exactly as it was left.
  const underModSettings = ModulationStore.getSettings();
  const modSettings = settingsOpen ? null : underModSettings;
  const settingsPanel = modSettings ? TweakStore.getPanel(modSettings.panelId) : undefined;
  const modLayout = settingsPanel ? ModulationStore.getSettingsLayout() : null;
  // The room's pages show the way any page does — full slots on a scrolling
  // panel, chips past eight otherwise — and the room keeps its own track
  // cursor, completely separate from the app's. A modulator's settings page
  // still wins while it is up: the thing in front of you owns the surface,
  // and closing it lands back in the room.
  const [roomTrack, setRoomTrack] = useState(0);
  const roomPages = settingsOpen
    ? (scroll ? settingsRooms.slice(0, MOVE_TRACKS).map(buildMoveStrip) : buildMovePages(settingsRooms))
    : [];
  const roomPage = roomPages[Math.min(roomTrack, Math.max(0, roomPages.length - 1))];
  const page = settingsPanel
    ? buildModMovePage(settingsPanel, modLayout)
    : roomPage ?? pages[Math.min(track, Math.max(0, pages.length - 1))];
  const pageId = page?.panel.id;
  // Where the panel is, for its own changes to move (MovePanelMotion): a new
  // page on the track buttons switches the controls, a new surface — the
  // settings room, a modulator's page — moves the whole inside. Controls
  // swapped under an unchanged page (another panel list, a mode) stay put.
  const motionSurface = settingsPanel ? 'mod' : settingsOpen ? 'room' : 'app';
  const motionPage = settingsPanel ? settingsPanel.id : settingsOpen ? String(roomTrack) : String(track);
  useSyncExternalStore(MovePadListStore.subscribe, MovePadListStore.getVersion, () => 0);
  const padListView = MovePadListStore.getView();
  useEffect(() => {
    if (padListView && padListView.panelId !== pageId) MovePadListStore.close();
  }, [pageId, padListView]);

  // The Set Overview button (Shift + Step 1) is the settings room's door,
  // attached for as long as a room is named — attaching is also what lights
  // the label icon on the hardware's Shift layer. Back walks out while the
  // door stands open; unmounting (or unnaming the room) closes it.
  const roomKey = roomIds.join(' ');
  useEffect(() => {
    if (!roomKey) return;
    const detach = MoveFunctions.attach('set_overview', () => MoveSettingsView.toggle(), { label: 'Settings' });
    return () => {
      detach();
      MoveSettingsView.close();
    };
  }, [roomKey]);
  // The room is another mode: the app's buttons sleep while it is open
  // (dark on the hardware, gone from the header), the door and Back stay.
  // A layout effect, so it lands before the room's own displays push
  // their buttons (Play and Loop for the wave) — a push made after the
  // suspension is the room's own and stays live.
  useLayoutEffect(() => {
    if (!settingsOpen) return;
    const wake = MoveFunctions.suspend(['set_overview']);
    const releaseBack = MoveFunctions.push('back', () => MoveSettingsView.close(), { label: 'Close', chip: false });
    return () => {
      releaseBack();
      wake();
    };
  }, [settingsOpen]);

  // Tell the kit about the room: its panels, whether the door stands open,
  // which room page the panel is showing, and the page to come back to —
  // the modulator view when one waits underneath, the regular page
  // otherwise. Announced on every change and re-announced on the strip's
  // beat, so a kit that binds late still keeps the room off the track row.
  const regularPageId = underModSettings?.panelId
    ?? pages[Math.min(track, Math.max(0, pages.length - 1))]?.panel.id;
  const roomPageId = roomPage?.panel.id;
  useEffect(() => {
    if (!roomKey || typeof window === 'undefined') return;
    const ids = roomKey.split(' ');
    const announce = () => window.dispatchEvent(new CustomEvent(MOVE_SETTINGS_EVENT, {
      detail: { panelIds: ids, open: settingsOpen, pageId: regularPageId, roomPageId },
    }));
    announce();
    const timer = setInterval(announce, STRIP_REANNOUNCE_MS);
    return () => clearInterval(timer);
  }, [roomKey, settingsOpen, regularPageId, roomPageId]);

  // The strip's window. A modulator's settings page is the hardware's own
  // shape and never scrolls, so the wheel and the rail belong to the app's
  // pages (and the settings room) alone. The offset is a column, always the
  // start of a control.
  const stripMode = scroll && !settingsPanel && !!page;
  const [offset, setOffset] = useState(0);
  const stripOffset = stripMode ? clampStripOffset(page, offset) : 0;
  // The wheel and the hardware both arrive outside React's render, so the
  // handler reads the live page through a ref instead of closing over it.
  const stripRef = useRef<{ page: MovePage | undefined; offset: number; on: boolean }>({
    page: undefined, offset: 0, on: false,
  });
  stripRef.current = { page, offset: stripOffset, on: stripMode };
  const scrollSlots = useCallback((delta: number) => {
    const { page: pg, offset: cur, on } = stripRef.current;
    if (!on || !pg || !delta) return;
    const next = stepStripOffset(pg, cur, delta);
    if (next !== cur) setOffset(next);
  }, []);
  // The arrows turn the page: a whole window of slots, not one control.
  const scrollPage = useCallback((dir: number) => {
    const { page: pg, offset: cur, on } = stripRef.current;
    if (!on || !pg || !dir) return;
    const next = pageStripOffset(pg, cur, dir);
    if (next !== cur) setOffset(next);
  }, []);

  // The window belongs to its page — switching tracks starts at the top.
  useEffect(() => setOffset(0), [pageId]);

  // The big wheel, from the bridge kit: one detent, one control. The event
  // goes out cancelable — the kit hands the wheel to whoever takes it — so a
  // scrolling page answers it and says so, and the waveform's zoom (the
  // wheel's other job) never fires underneath.
  // An open preset navigator has first claim on the wheel — browsing the
  // list is what the wheel means while that screen is up — so a consumed
  // turn is left alone.
  useEffect(() => {
    const onJog = (e: Event) => {
      if (PresetExplorationStore.getState()) { e.preventDefault(); PresetExplorationStore.jog(Number((e as CustomEvent).detail?.delta) || 0); return; }
      // An open colour editor keeps the strip still too: the wheel belongs
      // to its overlays (the palette list) while the editor is up.
      if (e.defaultPrevented || MoveSearchStore.isOpen() || presetNavigatorOpen() || MoveColorStore.getView() || !stripRef.current.on) return;
      // While the waveform editor floats, the wheel is its zoom — the strip
      // waits. The event rides on unconsumed, so the kit hands it there.
      if (MoveWaveformStore.wantsSteps()) return;
      e.preventDefault();
      scrollSlots(Math.round(Number((e as CustomEvent).detail?.delta) || 0));
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog);
    return () => window.removeEventListener(MOVE_JOG_EVENT, onJog);
  }, [scrollSlots]);

  // The Move's arrows turn the page — eight slots, the whole window at once,
  // for getting across a long strip without spinning the wheel. They are
  // taken only where the app has left them free: a host that wired its own
  // meaning to left/right keeps it, and the wheel still walks the strip.
  useEffect(() => {
    if (!stripMode) return;
    const free = (['left', 'right'] as const).filter((name) => !MoveFunctions.list().includes(name));
    const off = free.map((name) =>
      MoveFunctions.attach(name, () => scrollPage(name === 'right' ? 1 : -1), { label: name === 'right' ? 'Next 8' : 'Prev 8', chip: false })
    );
    return () => { for (const detach of off) detach(); };
  }, [stripMode, scrollPage]);

  // The mouse wheel is the big wheel on this side of the glass, and the whole
  // panel answers it — the slots, the pads, the header, the surface around
  // them: anywhere over the instrument is over the wheel. It rides a native
  // listener because React's is passive: the page must not scroll away under
  // a gesture the panel has answered. A trackpad's small deltas accumulate,
  // so a flick moves as far as it looks like it should.
  const wheelRest = useRef(0);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.target instanceof Element && e.target.closest('.tweakers-exploration')) return;
      const exploring = !!PresetExplorationStore.getState();
      const searching = MoveSearchStore.getView();
      const browsing = presetNavigatorOpen();
      const picking = palettePickerOpen();
      const editing = MoveWaveformStore.wantsSteps();
      if (!exploring && !searching && !browsing && !picking && !editing && !stripRef.current.on) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      wheelRest.current += d;
      const steps = Math.trunc(wheelRest.current / WHEEL_SLOT_PX);
      if (!steps) return;
      wheelRest.current -= steps * WHEEL_SLOT_PX;
      // The same wheel, the same rule as the hardware: a running search
      // walks what the query kept, while the navigator is up it walks the
      // preset list, while the waveform editor floats it zooms (scroll up
      // goes in), otherwise it moves the strip.
      if (exploring) PresetExplorationStore.jog(steps);
      else if (searching) searchStep(searching, steps);
      else if (browsing) MovePresetStore.scroll(steps);
      else if (picking) MoveColorStore.movePickerCursor(steps);
      else if (editing) MoveWaveformStore.zoom(-steps);
      else scrollSlots(steps);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scrollSlots, mounted, stripMode]);

  // Where the window sits, for the kit to point the hardware's dials at the
  // same 8 controls the screen is showing. The paths ride with it so the
  // bridge never has to rebuild the strip rule for itself — the screen has
  // already decided which control each knob is holding.
  const announceStrip = useCallback(() => {
    const { page: pg, offset: at, on } = stripRef.current;
    if (!on || !pg) return;
    const pads = stripWindowPads(pg, at);
    const row = (cells: (ControlMeta | undefined)[]) => cells.map((meta) => meta?.path ?? null);
    // The switch row can carry a tabs strip, and a strip's pads are not all
    // the same thing: each says whether it is the name or which option it
    // picks, so the bridge never has to re-derive the run for itself.
    const switchRow = pads.toggles.map((meta, i) => {
      if (!meta) return null;
      const tab = moveTabCell(pg.toggles, at + i);
      if (!tab) return meta.path;
      return tab.head
        ? { path: tab.meta.path, tab: true, head: true, label: tab.label }
        : { path: tab.meta.path, tab: true, option: tab.option, label: tab.label };
    });
    window.dispatchEvent(new CustomEvent(MOVE_STRIP_EVENT, {
      detail: {
        pageId: pg.panel.id,
        offset: at,
        columns: stripDialColumns(pg, at),
        paths: stripDialSlots(pg, at).map((meta) => meta?.path ?? null),
        // The small slots under that window, in hardware columns — without
        // them the pads under a scrolling page stay dark and dead.
        pads: { toggles: switchRow, values: row(pads.values), actions: row(pads.actions) },
      },
    }));
  }, []);
  useEffect(() => {
    announceStrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps — the page object is
    // rebuilt every render; its identity is not what changed the window.
  }, [announceStrip, stripMode, pageId, stripOffset]);

  // A bridge that binds after the panel has settled would never hear the
  // window at all. The kit streams the page it is showing, so that stream is
  // the heartbeat: it re-announces on it, once a second at most, and the kit
  // ignores a window it already has.
  useEffect(() => {
    let last = 0;
    const onPage = () => {
      const now = Date.now();
      if (now - last < STRIP_REANNOUNCE_MS) return;
      last = now;
      announceStrip();
    };
    window.addEventListener(MOVE_PAGE_EVENT, onPage);
    return () => window.removeEventListener(MOVE_PAGE_EVENT, onPage);
  }, [announceStrip]);
  useSyncExternalStore(MoveColorStore.subscribe, MoveColorStore.getVersion, () => 0);
  const colorView = MoveColorStore.getView();
  // A gradient the editor can hold in one hand: 2–4 stops, one per track
  // button. Wider ramps keep the plain slot and its on-screen stop drag.
  const gradientEditable = (meta: ControlMeta) =>
    meta.type === 'gradient' && pageId !== undefined &&
    (MoveColorStore.gradient(pageId, meta.path)?.stops.length ?? 0) <= MOVE_GRADIENT_STOPS;
  // The editor's target may hold a dial slot (a colour, an editable
  // gradient) or sit on the pad rows (the small colour selector — a
  // balance's colours stack as the two chips of its column).
  const colorMeta = colorView?.panelId === pageId && page
    ? [...page.dials, ...(page.topValues ?? []), ...page.values, ...(page.actionValues ?? [])].find((meta) =>
        meta && meta.path === colorView.path &&
        (meta.type === 'color' || gradientEditable(meta)))
    : undefined;
  const color = colorMeta && pageId ? MoveColorStore.read(pageId, colorMeta.path) : null;
  // While the editor holds a gradient, the track row belongs to its stops.
  const gradientMeta = colorMeta?.type === 'gradient' ? colorMeta : null;
  const gradientValue = gradientMeta && pageId ? MoveColorStore.gradient(pageId, gradientMeta.path) : null;
  useEffect(() => () => {
    if (MoveColorStore.getView()?.panelId === pageId) MoveColorStore.close();
  }, [pageId]);
  // While the colour editor is open, Menu is its palette navigator: the
  // button is borrowed (push, not attach), so the preset navigator's base
  // meaning steps aside and comes back the moment the editor closes.
  const colorOpenPanel = colorMeta && colorView ? colorView.panelId : null;
  useEffect(() => {
    if (!colorOpenPanel) return;
    return MoveFunctions.push('menu', () => MoveColorStore.togglePicker(), { label: 'palettes', chip: false });
  }, [colorOpenPanel]);
  // Copy is the editor's too while it is open: it puts the colour itself on
  // the clipboard — HEX on a tap, HSL with Shift, OKLCH on a hold — instead
  // of whatever the app wired the button to.
  useEffect(() => {
    if (!colorOpenPanel) return;
    return MoveFunctions.push('copy', ({ shift, hold }) => {
      const view = MoveColorStore.getView();
      if (!view) return;
      // The colour under the hand — a gradient's selected stop included.
      const hex = MoveColorStore.hex(view.panelId, view.path);
      const text = hold ? copyOklch(hex) : shift ? copyHslOfHex(hex) : hex;
      navigator.clipboard?.writeText(text).catch(() => {});
    }, { label: 'copy color', chip: false });
  }, [colorOpenPanel]);
  // The navigator stands on its own when the app owns the palettes: a palette is
  // then an app-wide setting, opened from wherever the app puts it, with no colour
  // editor up. The store decides; the panel just shows it.
  const paletteScreen = MoveColorStore.isPickerOpen();
  useEffect(() => {
    if (!paletteScreen) return;
    return MoveFunctions.push('back', () => MoveColorStore.closePicker(), { label: 'back', chip: false });
  }, [paletteScreen]);
  // The hardware wheel, while the palette navigator is open: turns walk the
  // list, the jog click locks the palette in — the preset navigator's terms.
  useEffect(() => {
    const onJog = (e: Event) => {
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !palettePickerOpen()) return;
      e.preventDefault();
      MoveColorStore.movePickerCursor(Number((e as CustomEvent).detail?.delta) || 0);
    };
    const onJogClick = (e: Event) => {
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !palettePickerOpen()) return;
      e.preventDefault();
      MoveColorStore.confirmPicker();
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog);
    window.addEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
    return () => {
      window.removeEventListener(MOVE_JOG_EVENT, onJog);
      window.removeEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
    };
  }, []);

  // The preset navigator, behind the hardware Menu button: a press toggles
  // the list screen beside the slots; a hold opens exploration, Shift+Menu
  // opens the floating save input. The store holds the open view — same contract as
  // the colour wheel — and leaving the page takes both down with it.
  useSyncExternalStore(MovePresetStore.subscribe, MovePresetStore.getVersion, () => 0);
  useSyncExternalStore(PresetExplorationStore.subscribe, PresetExplorationStore.getVersion, () => 0);
  const explorationOpen = PresetExplorationStore.getState()?.panelId === pageId;
  const presetView = MovePresetStore.getView();
  const presetSaving = MovePresetStore.getSaving();
  const presetScreen = presetView?.panelId === pageId ? presetView : null;
  const presetSave = presetSaving?.panelId === pageId ? presetSaving : null;
  useEffect(() => {
    if (!pageId) return;
    return MoveFunctions.attach('menu', ({ shift, hold }) => {
      if (shift) MovePresetStore.beginSave(pageId);
      else if (hold) { MovePresetStore.cancel(); void PresetExplorationStore.open(pageId); }
      else MovePresetStore.toggle(pageId);
    }, { label: 'presets', chip: false });
  }, [pageId]);
  // Undo, Delete and Copy on the computer's keys, for whatever the buttons
  // hold — the Move's editing keys without a picture of them on screen.
  useEffect(() => attachMoveKeys(), []);
  useEffect(() => () => {
    if (MovePresetStore.getView()?.panelId === pageId) MovePresetStore.cancel();
    if (MovePresetStore.getSaving()?.panelId === pageId) MovePresetStore.cancelSave();
    if (PresetExplorationStore.getState()?.panelId === pageId) { PresetExplorationStore.cancelSave(); void PresetExplorationStore.close(); }
  }, [pageId]);
  // While the navigator is open it borrows the Back button: Back puts the
  // pre-navigator settings back and dismisses. Borrowing (push, not attach)
  // lights the button on the hardware and returns it to the app on close.
  const presetOpenPanel = presetScreen && presetScreen.phase !== 'closing' ? presetScreen.panelId : null;
  useEffect(() => {
    if (!presetOpenPanel) return;
    return MoveFunctions.push('back', () => MovePresetStore.cancel(), { label: 'revert', chip: false });
  }, [presetOpenPanel]);
  // The hardware wheel, while the navigator is open: turns walk the list,
  // the jog click confirms. Mute's raw presses arrive here too: holding it
  // plays the pre-navigator sound to compare, released it lets the preview
  // back. Consuming the cancelable events keeps them from the waveform
  // zoom, the app's jog_click action, and the app's own mute action.
  useEffect(() => {
    const openView = () => {
      const view = MovePresetStore.getView();
      return view && view.phase !== 'closing' ? view : null;
    };
    const onJog = (e: Event) => {
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !openView()) return;
      e.preventDefault();
      MovePresetStore.scroll(Number((e as CustomEvent).detail?.delta) || 0);
    };
    const onJogClick = (e: Event) => {
      if (PresetExplorationStore.getState()) { e.preventDefault(); PresetExplorationStore.toggleParent(); return; }
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !openView()) return;
      e.preventDefault();
      MovePresetStore.confirm();
    };
    let muteTaken = false;
    const onMute = (e: Event) => {
      if ((e as CustomEvent).detail?.pressed) {
        if (!openView() || MovePresetStore.getSaving()) return;
        e.preventDefault();
        muteTaken = true;
        MovePresetStore.compareStart();
      } else {
        if (!muteTaken) return; // we never took the press
        e.preventDefault();
        muteTaken = false;
        MovePresetStore.compareEnd();
      }
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog);
    window.addEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
    window.addEventListener(MOVE_MUTE_EVENT, onMute);
    return () => {
      window.removeEventListener(MOVE_JOG_EVENT, onJog);
      window.removeEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
      window.removeEventListener(MOVE_MUTE_EVENT, onMute);
    };
  }, []);

  // Search, behind a held Capture key: it opens on whichever list has the
  // wheel right now — the palette navigator, then the preset navigator, then
  // the app's own wheel list — and while it runs the wheel walks only the
  // rows the typed query keeps. The kit's event is cancelable: taken here,
  // the hold never reaches the app's Capture action; with no list to search
  // it rides on untouched. A second hold closes the search.
  useSyncExternalStore(MoveSearchStore.subscribe, MoveSearchStore.getVersion, () => 0);
  const search = MoveSearchStore.getView();
  // Whether the wheel list is on screen is the render's decision (the
  // settings room and a modulator's page both hide it); the listener reads
  // it from here.
  const screenShown = useRef(false);
  useEffect(() => {
    const onSearch = (e: Event) => {
      if (e.defaultPrevented) return;
      if (MoveSearchStore.isOpen()) { e.preventDefault(); MoveSearchStore.close(); return; }
      const target: MoveSearchTarget | null = palettePickerOpen() ? 'palette'
        : presetNavigatorOpen() ? 'presets'
        : screenShown.current ? 'screen'
        : null;
      if (!target) return;
      e.preventDefault();
      MoveSearchStore.open(target, target === 'screen' ? MoveSurfaceStore.getState().screen?.index ?? 0 : 0);
    };
    window.addEventListener(MOVE_SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(MOVE_SEARCH_EVENT, onSearch);
  }, []);
  // The computer keyboard's way in: `/` or ⌘F (Ctrl+F) asks for the same
  // search a held Capture does. Only a list that takes it keeps the key from
  // the page — with nothing to search, ⌘F is still the browser's find. A
  // key typed into a field is the field's; a search already open keeps its
  // field and just takes the focus back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const find = (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'f';
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!find && !slash) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        if (find && t.classList.contains('tweakers-move-search-input')) e.preventDefault();
        return;
      }
      if (MoveSearchStore.isOpen()) {
        const field = document.querySelector<HTMLInputElement>('.tweakers-move-search-input');
        if (!field) return;
        e.preventDefault();
        field.focus();
        return;
      }
      const ask = new CustomEvent(MOVE_SEARCH_EVENT, { detail: { shift: false }, cancelable: true });
      window.dispatchEvent(ask);
      if (ask.defaultPrevented) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // The wheel and its click, while a search runs. Registration order does
  // not decide who wins: the search takes every turn while it is open, and
  // every other reader of the wheel — the navigators, the strip, a host's
  // own list — yields on MoveSearchStore.isOpen() rather than on the
  // event's consumed flag, so a turn is never walked twice whoever hears it
  // first. (Capture phase only for good measure; it does not order same-
  // target listeners reliably.)
  useEffect(() => {
    const onJog = (e: Event) => {
      const view = MoveSearchStore.getView();
      if (!view) return;
      e.preventDefault();
      searchStep(view, Math.round(Number((e as CustomEvent).detail?.delta) || 0));
    };
    const onJogClick = (e: Event) => {
      const view = MoveSearchStore.getView();
      if (!view) return;
      e.preventDefault();
      searchTake(view);
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog, { capture: true });
    window.addEventListener(MOVE_JOG_CLICK_EVENT, onJogClick, { capture: true });
    return () => {
      window.removeEventListener(MOVE_JOG_EVENT, onJog, { capture: true });
      window.removeEventListener(MOVE_JOG_CLICK_EVENT, onJogClick, { capture: true });
    };
  }, []);
  // Back closes the search and nothing else — the list underneath stays,
  // and the button goes back to whoever held it (a navigator's own Back).
  const searchOpen = !!search;
  useEffect(() => {
    if (!searchOpen) return;
    return MoveFunctions.push('back', () => MoveSearchStore.close(), { label: 'end search', chip: false });
  }, [searchOpen]);

  // A curve modulator's page brings its composition with it: the composer
  // floats above the panel, and its selected clip is what the shape dials
  // are editing — the dial that draws the preview shows that same clip.
  const modSlot = modSettings ? ModulationStore.getSlot(modSettings.index) : null;
  const composition = modSlot?.type === 'curve' ? curveComposition(modSlot.params) : null;
  // An audio modulator's page floats its waveform the same way — the dial
  // draws the small sample, the page brings the full editor above the panel.
  const audioWave = modSlot?.type === 'audio' && modSettings ? modSettings.index : null;
  // The Waveform room page floats the display it dresses: you set the look
  // on the wave itself, not on five blind switches.
  const roomWave = settingsOpen && page?.panel.id === MOVE_WAVEFORM_PANEL;
  const clipIndex = composition
    ? Math.min(composition.segments.length - 1, Math.max(0, Math.round(Number(modSlot!.params.selected) || 0)))
    : 0;
  const previewPath = modLayout?.dials.find((d) => d.preview)?.path ?? null;

  // Subscribe to the active page's value changes (per-panel channel only).
  const values = useSyncExternalStore(
    useCallback((cb) => (pageId ? TweakStore.subscribe(pageId, cb) : () => {}), [pageId]),
    () => (pageId ? TweakStore.getValues(pageId) : undefined),
    () => undefined
  );

  // Presentation repoints — a curve sampler, a select's preview, the
  // filter's response — land on the control-state channel after the host's
  // own render, one beat behind the value change that caused them. The
  // inline rows subscribe there; the Move surface must too, or a type
  // switch keeps drawing the shape it had before the switch, forever.
  const [, bumpControlState] = useState(0);
  useEffect(
    () => (pageId ? TweakStore.subscribeControlState(pageId, () => bumpControlState((n) => n + 1)) : undefined),
    [pageId]
  );

  // Modulation structure (slots, assignments) — the circles and the dots.
  useSyncExternalStore(
    useCallback((cb) => ModulationStore.subscribe(cb), []),
    () => ModulationStore.getVersion(),
    () => 0
  );

  // The raw hardware an app claimed for itself: the bottom pad rows, the step
  // buttons, the device screen. Empty unless a host fills it in.
  const surface = useSyncExternalStore(
    useCallback((cb) => MoveSurfaceStore.subscribe(cb), []),
    () => MoveSurfaceStore.getState(),
    () => MoveSurfaceStore.getState()
  );

  // Hardware presence: a finger on a knob, a held or latched value pad.
  useEffect(() => {
    const forPage = (detail: { pageId?: string } | undefined, map: unknown) =>
      detail && detail.pageId === pageId ? (map as Record<string, boolean>) ?? {} : {};
    const onTouch = (e: Event) => {
      const d = (e as CustomEvent).detail;
      setHandTouch(forPage(d, d?.touched));
    };
    const onOverride = (e: Event) => {
      const d = (e as CustomEvent).detail;
      setHwHeld(forPage(d, d?.held));
      setHwLatched(forPage(d, d?.latched));
    };
    window.addEventListener(MOVE_TOUCH_EVENT, onTouch);
    window.addEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    return () => {
      window.removeEventListener(MOVE_TOUCH_EVENT, onTouch);
      window.removeEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    };
  }, [pageId]);

  // Hardware page switches steer the panel: the surfaces show one page.
  // A settings page counts only after it has actually shown — page events
  // stream continuously, so the old page's frames must not close a
  // just-opened settings view before the hardware gets there.
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const roomIdsRef = useRef(roomIds);
  roomIdsRef.current = roomIds;
  const sawSettings = useRef(false);
  const sawRoom = useRef(false);
  useEffect(() => {
    const onPage = (e: Event) => {
      const id = (e as CustomEvent).detail?.pageId;
      if (id === MOD_SETTINGS_PANEL) {
        sawSettings.current = true;
        return;
      }
      // The settings room, before the modulator-exit check below: the room
      // is a detour, and its frames must not read as "left the modulator" —
      // that closed the view waiting underneath, reshuffled the page list
      // mid-steer, and every later cycle landed on shifted indexes. Frames
      // showing a room page mark the room seen and steer the room's own
      // track cursor — a hardware track press inside the room switches room
      // pages, never the app's. Frames from before the room has shown must
      // not close a door that just opened.
      const roomIndex = id === undefined ? -1 : roomIdsRef.current.indexOf(id);
      if (roomIndex >= 0) {
        if (MoveSettingsView.isOpen()) {
          sawRoom.current = true;
          setRoomTrack(roomIndex);
        }
        return;
      }
      if (sawSettings.current) {
        sawSettings.current = false;
        ModulationStore.closeSettings();
      }
      if (sawRoom.current) {
        sawRoom.current = false;
        MoveSettingsView.close();
      }
      const i = pagesRef.current.findIndex((pg) => pg.panel.id === id);
      if (i >= 0) setTrack(i);
    };
    window.addEventListener(MOVE_PAGE_EVENT, onPage);
    return () => window.removeEventListener(MOVE_PAGE_EVENT, onPage);
  }, []);

  // Substitutions belong to their page — switching tracks releases them.
  useEffect(() => {
    setHeld(null);
    setLatched({});
  }, [pageId]);

  // An app that claimed the bottom pad rows takes them over — movePadRows
  // shuffles the control rows around the claim, exactly as the hardware does.
  // A modulator's settings page takes the surface over, list included: the
  // page IS what the wheel is walking while it is open. The settings room
  // takes it all the same way — the wheel screen, the claimed rows and the
  // step circles belong to the view underneath, and drawing them beside the
  // room's own eight slots also overflows the panel.
  const screen = settingsPanel || settingsOpen || explorationOpen ? null : surface.screen;
  // A search outlives nothing: the list it ran on going away takes it too.
  const searchTarget = search?.target ?? null;
  const screenSearch = searchTarget === 'screen' && screen ? search : null;
  const presetSearch = searchTarget === 'presets' && presetOpenPanel ? search : null;
  const paletteSearch = searchTarget === 'palette' && paletteScreen ? search : null;
  useEffect(() => {
    screenShown.current = !!screen;
    if (searchTarget && !screenSearch && !presetSearch && !paletteSearch) MoveSearchStore.close();
  });

  if (!mounted || typeof window === 'undefined' || pages.length === 0 || !page || !values) return null;

  // What a slot reads out, and how a pointer turns it, live in
  // move-slot-core — shared with a MoveSlot placed on its own, so a face
  // drags the same wherever it is drawn. These bind them to this page.
  const dialPercent = (meta: ControlMeta) => moveDialPercent(meta, values[meta.path]);
  const chipValue = (meta: ControlMeta) => moveChipValue(meta, values[meta.path]);
  const dialReading = (meta: ControlMeta) => moveDialReading(meta, values[meta.path]);
  const rangeReading = (meta: ControlMeta) => moveRangeReading(meta, values[meta.path]);
  const write = (meta: ControlMeta, next: unknown) => TweakStore.updateValue(page.panel.id, meta.path, next as never);

  const dialFromKeyboard = (e: React.KeyboardEvent<HTMLElement>, meta: ControlMeta) => {
    if (TweakStore.isDisabled(page.panel.id, meta.path)) return;
    const next = moveDialKey(meta, values[meta.path], e);
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    armMod(meta.path);
    write(meta, next);
  };

  // A value slot answers the pointer the way its knob answers the hand: a
  // drag turns it from where it is (moveTurnValue), and a press alone never
  // moves it. A still Shift+click puts it back to its default, the
  // hardware's Shift+tap.
  const beginPress = (e: React.PointerEvent<HTMLElement>, path: string, v: number) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    fineRef.current = null;
    pressRef.current = movePressStart(path, e, v);
    setDragPath(path);
    armMod(path);
  };
  const endPress = (path: string) => {
    const tapped = movePressEnd(pressRef, path);
    setDragPath(null);
    fineRef.current = null;
    return tapped;
  };
  const resetValue = (meta: ControlMeta) => {
    const value = TweakStore.getDefault(page.panel.id, meta.path);
    if (value !== undefined && !TweakStore.isDisabled(page.panel.id, meta.path)) write(meta, value);
  };
  const dialDrag = (meta: ControlMeta) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button > 0 || TweakStore.isDisabled(page.panel.id, meta.path)) return;
      beginPress(e, meta.path, normalizeDial(meta, values[meta.path]));
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const p = movePressTravel(pressRef, meta.path, e, () => normalizeDial(meta, values[meta.path]));
      if (p && !TweakStore.isDisabled(page.panel.id, meta.path)) write(meta, moveTurnValue(meta, p, e, moveTurnExtent(e.currentTarget.getBoundingClientRect())));
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      if (endPress(meta.path) && e.shiftKey) resetValue(meta);
    },
    onPointerCancel: () => { endPress(meta.path); },
  });
  // An option slot has no hot spots: a click moves it on, a drag steps it
  // (moveOptionStep), a still Shift+click puts it back to its default.
  const optionDrag = (meta: ControlMeta) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button > 0 || TweakStore.isDisabled(page.panel.id, meta.path)) return;
      beginPress(e, meta.path, enumIndex(meta, values[meta.path]));
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const p = movePressTravel(pressRef, meta.path, e, () => enumIndex(meta, values[meta.path]));
      const next = p && !TweakStore.isDisabled(page.panel.id, meta.path) ? moveOptionStep(meta, values[meta.path], p, e) : undefined;
      if (next !== undefined) write(meta, next);
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      if (!endPress(meta.path) || TweakStore.isDisabled(page.panel.id, meta.path)) return;
      if (e.shiftKey) resetValue(meta);
      else {
        const next = moveNextOption(meta, values[meta.path]);
        if (next !== undefined) write(meta, next);
      }
    },
    onPointerCancel: () => { endPress(meta.path); },
  });

  const xyFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) =>
    write(meta, moveXYValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), fineRef));

  // The point a transfer slot holds is the page's, so the knob holds it too.
  const transferFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta, down: boolean) => {
    const next = moveTransferValue(values[meta.path], e, e.currentTarget.getBoundingClientRect(), curvePoint[meta.path] ?? 0, down);
    if (down) setCurvePoint((prev) => ({ ...prev, [meta.path]: next.held }));
    write(meta, next.value);
  };

  const needleFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const next = moveNeedleValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect());
    if (next !== null) write(meta, next);
  };

  // A ramp slot's pointer picks the nearest stop on press and slides it once
  // it has really moved — a still press stays a TAP, which is how the slot
  // opens its colour editor. While the editor is open the selection is the
  // shared store's, so the slot, the stop row and the hardware's track
  // buttons all hold the same stop.
  const rampFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta, down: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const open = colorMeta?.path === meta.path;
    if (down) {
      const index = moveRampStop(values[meta.path], e, rect);
      setRampStop((prev) => ({ ...prev, [meta.path]: index }));
      if (open) MoveColorStore.selectStop(index);
      return;                            /* the press only picks — moving writes */
    }
    const stops = normalizeGradient(values[meta.path] as never).stops.length;
    const index = Math.min(open ? MoveColorStore.getStop() : rampStop[meta.path] ?? 0, stops - 1);
    write(meta, moveRampValue(values[meta.path], e, rect, index));
  };

  // Joystick-style pads rest at their centre when the pointer lets go.
  const xyRelease = (meta: ControlMeta) => {
    setDragPath(null);
    fineRef.current = null;
    const rest = moveXYRest(meta);
    if (rest) write(meta, rest);
  };

  const rangeFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta, down: boolean) =>
    write(meta, moveRangeValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), rangeHandleRef, fineRef, down));

  // On the hardware the filter's left column's knob is cutoff and the right
  // column's is resonance — two ordinary one-column dials to the bridge.
  const filterFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta, down: boolean) =>
    write(meta, moveFilterValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), filterHandRef, fineRef, down));

  const chipLatched = (col: number, meta: ControlMeta) =>
    latched[col]?.path === meta.path || !!hwLatched[meta.path];

  // Touching a control arms it for the assignment gesture (step press).
  const armMod = (path: string) => ModulationStore.noteTouch(page.panel.id, path);

  // The chips that can take a column's knob: the one up top (a balance's
  // first colour, a moveTopRow chip) and the one under it. A switch is never
  // a chip; a chip is one whichever row it rides — the gesture is the same.
  const chipsAt = (col: number): ControlMeta[] =>
    [page.topValues?.[col], page.values[col], page.actionValues?.[col]].filter((m): m is ControlMeta => !!m);

  // What a dial column actually edits: a held chip wins (screen or pad),
  // then a latched one, then the column's own dial. A colour chip lands in
  // the slot as the big colour slot itself, so it is edited — and its editor
  // opened — exactly the way a colour dial is.
  const dialAt = (col: number): ControlMeta | undefined => {
    if (held && held.col === col) return held.meta;
    const chips = chipsAt(col);
    const hwHeldChip = chips.find((m) => hwHeld[m.path]);
    if (hwHeldChip) return hwHeldChip;
    if (latched[col]) return latched[col];
    return chips.find((m) => hwLatched[m.path]) ?? page.dials[col];
  };

  // A fade or loop line takes the cursor like Start and End: press on a
  // handle and drag it. `edgesFromPointer` reads the cursor's place on the
  // line, 0..1; a loop marker runs the whole line, a fade its own half, from
  // its own end inward.
  const edgesFromPointer = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - EDGES_TRACK_INSET * 2;
    return Math.min(1, Math.max(0, (e.clientX - rect.left - EDGES_TRACK_INSET) / (span || 1)));
  };
  const dragEdge = (kind: 'fade' | 'loop', isStart: boolean, meta: ControlMeta, x: number) => {
    const v01 = kind === 'loop' ? x : Math.min(1, (isStart ? x : 1 - x) * 2);
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeDial(meta, v01));
  };

  // A take's two edges side by side — a trim start in this column, a trim
  // end in the next — draw as one 2-slot control. Both are the page's own
  // dials, or both are chips in their place, so a single latched chip never
  // shares a line with an edge it does not belong to.
  const trimSpanAt = (col: number): { start: ControlMeta; end: ControlMeta; at: { start: number; end: number } } | null => {
    const start = dialAt(col);
    const end = dialAt(col + 1);
    if (!start || !end || (start === page.dials[col]) !== (end === page.dials[col + 1])) return null;
    const at = moveTrimSpan(start, values[start.path], end, values[end.path]);
    return at && { start, end, at };
  };

  // Multi-slot instruments: one face across a dial per column, each column
  // keeping its knob and drag zone. `role` names the part a dial is drawn as.
  type FaceDial = { role: string; col: number; meta: ControlMeta; position: number; track?: string };
  type Face = { kind: 'gate' | 'vector' | 'multiband' | 'channel'; col: number; span: number; dials: FaceDial[]; curve?: { meta: ControlMeta; position: number }[]; icon?: string; down?: boolean };

  // A gate's three dials side by side — threshold, look-ahead, release — draw
  // as one 3-slot control, all the page's own dials or all latched chips.
  const gateAt = (col: number): Face | null => {
    const metas = [dialAt(col), dialAt(col + 1), dialAt(col + 2)];
    if (metas.some((m) => !m) || !visibleCols.includes(col + 1) || !visibleCols.includes(col + 2)) return null;
    const own = metas.map((m, k) => m === page.dials[col + k]);
    if (own.some((o) => o !== own[0])) return null;
    const at = moveGateSpan(metas.map((m) => [m!, values[m!.path]]));
    if (!at) return null;
    return { kind: 'gate', col, span: 3, dials: (['threshold', 'lookahead', 'release'] as const).map((role, k) => ({ role, col: col + k, meta: metas[k]!, position: at[role] })) };
  };

  // A place's three axes side by side — x, y, z — draw as one 3-slot stage, on
  // the gate's terms: all the page's own dials or all latched chips, so a chip
  // latched into one column dissolves the stage into three plain dials and you
  // always see what you borrowed.
  const vectorAt = (col: number): Face | null => {
    const metas = [dialAt(col), dialAt(col + 1), dialAt(col + 2)];
    if (metas.some((m) => !m) || !visibleCols.includes(col + 1) || !visibleCols.includes(col + 2)) return null;
    const own = metas.map((m, k) => m === page.dials[col + k]);
    if (own.some((o) => o !== own[0])) return null;
    const at = moveVectorAxes(metas.map((m) => [m!, values[m!.path]]));
    if (!at) return null;
    return {
      kind: 'vector', col, span: 3, down: at.down,
      dials: (['x', 'y', 'z'] as const).map((axis, k) => ({ role: `axis-${axis}`, col: col + k, meta: metas[k]!, position: at[axis] })),
    };
  };

  // A multiband cleaner: its amount, its speed, then every band dial beside
  // them, as one face. A band chip latched into a band column takes that
  // column's knob and its name, and every band chip in those columns joins
  // the curve.
  const multibandAt = (col: number): Face | null => {
    if (moveMultibandRole(page.dials[col]) !== 'amount' || !visibleCols.includes(col + 1)) return null;
    const cols = [col, col + 1];
    for (let k = col + 2; k < page.dials.length && visibleCols.includes(k) && moveMultibandRole(page.dials[k]) === 'band'; k++) cols.push(k);
    if (cols.length < 3 || dialAt(col) !== page.dials[col] || dialAt(col + 1) !== page.dials[col + 1]) return null;
    const metas = cols.map((c) => dialAt(c)!);
    if (metas.slice(2).some((m) => moveMultibandRole(m) !== 'band')) return null;
    const bands = cols.slice(2).flatMap((c) => [page.dials[c], ...chipsAt(c)]).filter((m) => moveMultibandRole(m) === 'band');
    const at = moveMultibandSpan(cols.map((c) => [page.dials[c], values[page.dials[c].path]]), bands.map((m) => [m, values[m.path]]));
    if (!at) return null;
    const visual = page.dials[col].moveVisual;
    return {
      kind: 'multiband', col, span: cols.length, curve: at.bands,
      icon: visual?.kind === 'multiband' && visual.role === 'amount' ? visual.icon : undefined,
      dials: cols.map((c, k) => ({
        role: k === 0 ? 'amount' : k === 1 ? 'speed' : 'band',
        col: c,
        meta: metas[k],
        position: k === 0 ? at.amount : k === 1 ? at.speed : at.bands.find((b) => b.meta === metas[k])!.position,
      })),
    };
  };

  // Mixer channels side by side: one face per run of the page's own channel
  // dials — a chip standing in a column ends the run there.
  const channelCol = (col: number) =>
    visibleCols.includes(col) && dialAt(col) === page.dials[col] && moveChannelPosition(page.dials[col], values[page.dials[col]?.path]) !== null;
  const channelAt = (col: number): Face | null => {
    if (!channelCol(col) || channelCol(col - 1)) return null;
    const dials: FaceDial[] = [];
    for (let k = col; channelCol(k); k++) {
      const meta = page.dials[k];
      dials.push({ role: 'channel', col: k, meta, position: moveChannelPosition(meta, values[meta.path])!, track: `channel-${k - col}` });
    }
    return { kind: 'channel', col, span: dials.length, dials };
  };

  const faceAt = (col: number): Face | null => (stripMode ? null : gateAt(col) ?? vectorAt(col) ?? multibandAt(col) ?? channelAt(col));
  /** A column another face already draws across. */
  const underFace = (col: number) => {
    for (let j = col - 1; j >= 0 && j >= col - MOVE_DIALS; j--) {
      if (!visibleCols.includes(j)) continue;
      const face = faceAt(j);
      if (face && j + face.span > col) return true;
    }
    return false;
  };

  const pressChip = (e: React.PointerEvent<HTMLElement>, col: number, meta: ControlMeta) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    holdStart.current = Date.now();
    armMod(meta.path);
    setHeld({ col, meta });
  };

  const releaseChip = (col: number, meta: ControlMeta) => {
    setHeld(null);
    if (Date.now() - holdStart.current >= TAP_MS) return;
    const wasLatched = chipLatched(col, meta);
    setLatched((prev) => ({ ...prev, [col]: wasLatched ? undefined : meta }));
    // Tell the hardware side; the kit relays it when the bridge is up.
    window.dispatchEvent(new CustomEvent(MOVE_LATCH_EVENT, {
      detail: { pageId: page.panel.id, path: meta.path, latched: !wasLatched },
    }));
  };

  // The claimed pad rows, on the same terms as the wheel screen above: the
  // settings room hides them with it.
  const appRows = (settingsOpen || explorationOpen) ? 0 : surface.rows;
  const padRows = movePadRows(page, appRows);
  const appRowAt = (row: number) => moveAppPadRow(row, appRows);
  const padAt = (x: number, y: 0 | 1): MovePadCell | undefined =>
    surface.pads.find((p) => p.x === x && p.y === y);
  const shownPadRows = Array.from({ length: PAD_ROWS }, (_, row) => row)
    // A pad row shows when it holds something: an empty row between two that
    // do says nothing on screen, the same way an empty column is skipped (the
    // row keeps its index, so what remains still sits on its hardware row). A
    // modulator's settings page keeps its gaps: its bend and wave pads live in
    // the empty cells under its stage columns.
    .filter((row) => appRowAt(row) !== null || (settingsPanel
      ? padRows.slice(row).some((r) => r.length > 0)
      : padRows[row].some(Boolean)));
  // The claimed rows draw as one block, anchored on the topmost of them.
  const firstAppScreenRow = shownPadRows.find((row) => appRowAt(row) !== null) ?? -1;

  // Only occupied columns render — a column with a dial, a toggle chip, or a
  // value chip at its index. Indices stay the hardware knob numbers (hidden
  // columns are skipped, never renumbered), the visible cluster centres in
  // the panel, and each slot keeps the exact 8-wide grid's slot size. An
  // empty page shows the header alone.
  // With app rows claimed the app owns whole hardware rows, so all 8 columns
  // stay on screen — its pads sit at real hardware coordinates.
  // Every settings page renders at the widest type's width: switching the
  // type must never reflow the page — the Type dial under your finger, and
  // everything else, stays exactly where it was. An open colour wheel takes
  // the pads too, so it also holds the panel at full width.
  // A scrolling page renders every column it has and lets the viewport clip:
  // the row is longer than the panel by design, and the window decides which
  // part of it shows.
  // A claimed pad row does NOT widen the dial row: the app's pads render at
  // their own full width below (see the pads map), and the dial faces above
  // stay at the columns the page actually occupies — an app that claims the
  // pads but registers one control shows one slot, not eight empties.
  const visibleCols = stripMode
    ? page.dials.map((_, i) => i)
    : settingsPanel
      ? Array.from({ length: modPageWidth() }, (_, i) => i)
      : color
        ? Array.from({ length: MOVE_PADS }, (_, i) => i)
        : visibleColumns(page);
  // The cluster the header and the grid share is never wider than the dials:
  // a strip of forty slots still shows eight.
  const clusterCols = explorationOpen ? MOVE_DIALS : stripMode
    ? Math.min(MOVE_DIALS, visibleCols.length) || MOVE_DIALS
    : visibleCols.length;
  // Pads keep their hardware columns: a pad is drawn in the column it sits
  // in on the Move, never repacked. But the panel is only as wide as what it
  // shows — the dial columns in use and the furthest pad that holds
  // something — so a page of four slots is a four-column instrument, its
  // pad rows included, not four slots beside an empty half. Sparse kit rows
  // keep at least four columns.
  const kitPadCols = Math.max(0, ...padRows.map((row) => row.length));
  const appPadCols = Math.max(0, ...surface.pads.filter((cell) => !cell.empty).map((cell) => cell.x + 1));
  const padGridCols = shownPadRows.length === 0
    ? 0
    : appRows > 0
      ? Math.min(MOVE_PADS, Math.max(1, clusterCols, appPadCols))
      : Math.min(MOVE_PADS, Math.max(focused ? 1 : MIN_PAD_COLUMNS, clusterCols, kitPadCols));
  const surfaceCols = Math.max(clusterCols, padGridCols);
  const panelIdForTabs = `${pageTabsId}-panel`;
  const pageTabIndex = pages.indexOf(page);
  const selectPage = (index: number) => {
    const next = pages[index];
    if (!next) return;
    ModulationStore.closeSettings();
    MoveSettingsView.close();
    setTrack(index);
    // Tell the hardware side; the kit relays it when the bridge is up.
    window.dispatchEvent(new CustomEvent(MOVE_PAGE_SELECT_EVENT, { detail: { pageId: next.panel.id } }));
  };
  // Where the window sits in the whole set — counted in controls, since that
  // is what the wheel moves by and what a person is looking for.
  const stripStops = stripMode ? stripOffsets(page) : [];
  const stripTotal = stripMode ? Math.max(1, stripSlotCount(page)) : 1;
  const stripFrom = stripMode ? stripSlotIndex(page, stripOffset) : 0;
  const stripTo = stripMode ? stripSlotIndex(page, stripOffset + MOVE_DIALS) : 0;

  // The header cluster: the attached-function chips (in their default seat,
  // immediately left of the readout), then the volume-dial readout,
  // right-aligned. (View-placed action pills remain MoveActionButton's
  // business.) Nothing registered and nothing attached = no cluster, header
  // unchanged.
  const volumeReading = liveValue ?? volume?.value;
  const headerCluster = (timelineClaimed || waveClaimed || volume || headerEnd || functionChips === 'clock') && (
    <div className="tweakers-move-actions">
      {functionChips === 'clock' && <MoveFunctionChips />}
      {timelineClaimed ? (
        <MoveTimelineClock />
      ) : waveClaimed ? (
        <MoveWaveClock />
      ) : volume && (
        <div className="tweakers-move-volume">
          <span className="tweakers-move-volume-tick" style={{ background: MOVE_TRACK_COLORS[0] }} />
          {volume.label && volumeReading != null && (
            <span className="tweakers-move-volume-label">{volume.label}</span>
          )}
          <span className="tweakers-move-volume-value">{boldColons(volumeReading ?? volume.label ?? '')}</span>
        </div>
      )}
      {headerEnd}
    </div>
  );

  const content = (
    <div className="tweakers-root tweakers-move-root" data-theme={theme} data-dock={dock}>
      <MoveMenuButton
        theme={theme}
        open={!!presetScreen || paletteScreen}
        label={paletteScreen || colorOpenPanel ? 'Palettes' : 'Presets'}
      />
      {/* While a composer floats above it the whole instrument comes forward,
          over the app's own panels — you are working in it. */}
      <div ref={panelRef} className="tweakers-move" data-dock={dock} data-settings={settingsOpen || undefined} data-move-motion-key={`${motionSurface}:${motionPage}|${pages.map((pg) => pg.panel.id).join(' ')}`} data-overlay={padListView || explorationOpen || composition || audioWave != null || roomWave || color || presetSave ? true : undefined}>
        {!explorationOpen && colorMeta && <MoveColorDisplay panelId={page.panel.id} meta={colorMeta} anchor={panelRef} theme={theme} />}
        <PresetExploration />
        {presetSave && <MovePresetSaveInput suggested={presetSave.suggested} />}
        {!explorationOpen && composition && modSettings && (
          <MoveCurveComposer
            index={modSettings.index}
            segments={composition.segments}
            direction={composition.direction}
            gap={composition.gap ?? 0}
            selected={clipIndex}
          />
        )}
        {!explorationOpen && audioWave != null && <MoveAudioWave index={audioWave} theme={theme} />}
        {!explorationOpen && roomWave && <MoveRoomWave theme={theme} />}
        <div
          className="tweakers-move-inner"
          style={{
            '--move-cols': clusterCols,
            '--move-surface-cols': surfaceCols,
            // The header row spans exactly what the controls row shows: the
            // dial cluster plus, when a wheel screen stands beside it, the
            // screen and its gap — so the page name sits on the top-left
            // corner of the first real object and follows every resize.
            '--move-screen-w': screen ? 'calc(var(--move-wheel-width) + 2 * var(--move-gap))' : '0px',
          } as React.CSSProperties}
        >
          {/* Only tracks that carry a page render — a bare coloured marker with
              no name says nothing. The index is still the real track index, so
              the colour never shifts with the visible position. One page is no
              choice at all: the label row appears only when the track buttons
              actually switch between pages. */}
          <div className="tweakers-move-tracks">
            {/* While the audio editor floats, the panel's top row works for
                it: the zoom readout takes the track corner, Load and the
                clock take the volume corner — the mockup's arrangement. */}
            {audioWave != null ? (
              <MoveAudioZoom />
            ) : (
            <div className="tweakers-move-tracks-lead">
            {/* A host's card gets the editor's zoom readout too, leading the
                page names — the far end of the row from its clock. A
                timeline on the surface holds the wheel first, so its zoom
                reads here instead. */}
            {timelineClaimed ? <MoveTimelineZoom /> : waveClaimed && <MoveAudioZoom />}
            {headerStart && <div className="tweakers-move-header-start">{headerStart}</div>}
            <div className="tweakers-move-tracks-group">
              {/* The settings room's name plate: the marker blinks for as
                  long as the room is open — the same pulse the hardware's
                  step icon carries — so the inverted surface names itself.
                  A room of several pages carries its own tab row, in place
                  of the app's: the two rows are completely separate, on
                  screen as on the track buttons. */}
              {settingsOpen && (
                <div className="tweakers-move-settings-title">
                  <span className="tweakers-move-settings-blink" />
                  {roomPages.length > 1 ? (
                    <div className="tweakers-move-pages" role="tablist" aria-label="Settings pages">
                      {roomPages.map((pg, i) => (
                        <button
                          key={pg.panel.id}
                          type="button"
                          role="tab"
                          className="tweakers-move-track"
                          data-active={pg === page}
                          aria-selected={pg === page}
                          tabIndex={pg === page ? 0 : -1}
                          onClick={() => {
                            setRoomTrack(i);
                            window.dispatchEvent(new CustomEvent(MOVE_PAGE_SELECT_EVENT, { detail: { pageId: pg.panel.id } }));
                          }}
                        >
                          <span className="tweakers-move-track-marker" style={{ background: MOVE_TRACK_COLORS[i] }} />
                          <span className="tweakers-move-track-label">{pg.panel.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="tweakers-move-track-label">{page.panel.name}</span>
                  )}
                </div>
              )}
              {/* While the colour editor holds a gradient, the track row is
                  its stops — the same claim the hardware's track buttons
                  take, handed back the moment the editor closes. Each tab's
                  marker wears its stop's colour (colour meaning selection
                  target, exactly as a track marker means its page). */}
              {!settingsOpen && gradientMeta && gradientValue && (
                <div className="tweakers-move-pages" role="tablist" aria-label={`${gradientMeta.label} stops`} data-stops>
                  {gradientValue.stops.slice(0, MOVE_GRADIENT_STOPS).map((stop, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      className="tweakers-move-track"
                      data-active={i === Math.min(MoveColorStore.getStop(), gradientValue.stops.length - 1)}
                      aria-selected={i === Math.min(MoveColorStore.getStop(), gradientValue.stops.length - 1)}
                      tabIndex={i === MoveColorStore.getStop() ? 0 : -1}
                      onClick={() => MoveColorStore.selectStop(i)}
                    >
                      <span className="tweakers-move-track-marker" style={{ background: stop.color }} />
                      <span className="tweakers-move-track-label">Stop {i + 1}</span>
                    </button>
                  ))}
                </div>
              )}
              {!settingsOpen && !gradientMeta && pages.length > 1 && (
                <div className="tweakers-move-pages" role="tablist" aria-label="Move pages">
                  {pages.map((pg, i) => (
                    <button
                      key={pg.panel.id}
                      id={`${pageTabsId}-tab-${i}`}
                      type="button"
                      role="tab"
                      className="tweakers-move-track"
                      data-active={pg === page}
                      aria-selected={pg === page}
                      aria-controls={panelIdForTabs}
                      tabIndex={pg === page ? 0 : -1}
                      onClick={() => selectPage(i)}
                      onKeyDown={(event) => {
                        const last = pages.length - 1;
                        const next = event.key === 'ArrowRight' ? (i + 1) % pages.length
                          : event.key === 'ArrowLeft' ? (i - 1 + pages.length) % pages.length
                          : event.key === 'Home' ? 0
                          : event.key === 'End' ? last
                          : -1;
                        if (next < 0) return;
                        event.preventDefault();
                        selectPage(next);
                        event.currentTarget.parentElement
                          ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]
                          ?.focus();
                      }}
                    >
                      <span className="tweakers-move-track-marker" style={{ background: MOVE_TRACK_COLORS[i] }} />
                      <span className="tweakers-move-track-label">{pg.panel.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {functionChips === 'tracks' && <MoveFunctionChips />}
            </div>
            </div>
            )}
            {/* The step buttons, centred between the track labels and the
                volume readout — one circle each. Normally the modulation
                slots; an app that claimed the row paints them itself, and
                its picture wins. The settings room shows neither — master
                settings are no place to reach for a modulator. */}
            <div className="tweakers-move-mods">
              {settingsOpen
                /* The room keeps its tab row; the wave's zoom readout takes
                   the centre, where the step circles would be. */
                ? roomWave ? <MoveAudioZoom /> : null
                : color && colorMeta
                ? <MoveColorSteps color={color} disabled={TweakStore.isDisabled(page.panel.id, colorMeta.path)} />
                : surface.steps === null
                ? ModulationStore.getSlots().map((slot) => (
                    <MoveModCircle key={slot.index} slot={slot} />
                  ))
                : null}
            </div>
            {audioWave != null ? <MoveAudioTransport index={audioWave} /> : roomWave ? <MoveRoomTransport /> : headerCluster}
          </div>

          <div
            id={pages.length > 1 && pageTabIndex >= 0 ? panelIdForTabs : undefined}
            className="tweakers-move-controls"
            role={pages.length > 1 && pageTabIndex >= 0 ? 'tabpanel' : undefined}
            aria-labelledby={pages.length > 1 && pageTabIndex >= 0 ? `${pageTabsId}-tab-${pageTabIndex}` : undefined}
          >
          {/* The app's own list, beside the slots: what the wheel is walking,
              so the page shows the rows and the selection without a glance at
              the hardware. A click is selection intent — the host owns what
              the value means, exactly as it does for a wheel turn. */}
          {screen && (
            <div className="tweakers-move-wheel-screen" role="group" aria-label={screen.title ?? 'Wheel selection'} data-search={screenSearch ? true : undefined}>
              {screenSearch
                ? <MoveSearchBar view={screenSearch} />
                : <MoveSearchDoor onOpen={() => MoveSearchStore.open('screen', screen.index)} />}
              <ListScreen
                items={searchedRows(
                  screen.items.map((row, index) => ({
                    value: String(index),
                    label: moveScreenRowLabel(row),
                    ...(typeof row === 'string' ? {} : {
                      ...(row.detail ? { detail: row.detail } : {}),
                      ...(row.checked === undefined ? {} : { checked: row.checked }),
                      ...(row.tag ? { tag: row.tag } : {}),
                    }),
                  })),
                  screenSearch,
                  screen.items.map(moveScreenRowSearchText)
                )}
                value={String(screenSearch ? screenSearch.cursor : screen.index)}
                follow="center"
                back={screenSearch ? undefined : screen.back}
                onBack={() => MoveFunctions.run('back')}
                onSelect={(value) => {
                  if (!value) return;
                  if (screenSearch) MoveSearchStore.close();
                  MoveSurfaceStore.selectScreen(Number(value));
                }}
              />
            </div>
          )}
          {explorationOpen && <PresetExplorationSlots />}
          {(visibleCols.length > 0 || shownPadRows.length > 0) && <div
            style={explorationOpen ? { display: 'none' } : undefined} className="tweakers-move-grid"
            data-presets={presetScreen?.phase === 'open' || paletteScreen || undefined}
            data-pad-columns={padGridCols || undefined}
          >
            {presetScreen && <MovePresetScreen view={presetScreen} search={presetSearch} />}
            {paletteScreen && (
              <MovePaletteScreen kept={paletteSearch ? moveSearchFilter(['All colors', ...MoveColorStore.palettes().map((p) => p.name)], paletteSearch.query) : null}>
                {paletteSearch && <MoveSearchBar view={paletteSearch} />}
              </MovePaletteScreen>
            )}
            {/* The window on the strip: the row is as long as the page has
                slots, and this clips it to the eight the dials hold. It clips
                sideways only — a touched option list still grows up out of
                its slot, over the panel. */}
            <div className="tweakers-move-viewport" data-scroll={stripMode || undefined}>
            {/* The slots and their pads move as one: a chip belongs to the
                dial above it, so the wheel has to carry them together. */}
            <div
              className="tweakers-move-strip"
              data-scroll={stripMode || undefined}
              style={stripMode
                ? ({ '--move-strip-len': page.dials.length, '--move-offset': stripOffset } as React.CSSProperties)
                : undefined}
            >
            <div className="tweakers-move-dials" data-scroll={stripMode || undefined}>
              {/* Grouped slots: one container behind the slots that read as one
                  thing, a short divider between each — drawn under the slots,
                  so the columns and their gestures stay exactly where they are. */}
              {!stripMode && !settingsPanel && !color && slotGroups(page, visibleCols).map(({ start, span, label }) => (
                <div key={`group-${start}`} className="tweakers-move-slot-group" aria-hidden="true" data-labelled={label ? 'true' : undefined}
                  style={{ '--move-group-start': start, '--move-group-span': span } as React.CSSProperties}>
                  {label && <span className="tweakers-move-slot-group-head">{label}</span>}
                  {Array.from({ length: span - 1 }, (_, k) => (
                    <i key={k} className="tweakers-move-slot-group-divider" style={{ '--move-group-divider-at': k + 1 } as React.CSSProperties} />
                  ))}
                </div>
              ))}
              {visibleCols.map((i) => {
                // A 2-slot dial's second column renders nothing of its own —
                // the base column's slot spans across it. And a 2-slot dial
                // keeps its slot against chip substitution: a chip landing in
                // half a picture would break the span.
                if (isSpanContinuation(page, i)) return null;
                if (!stripMode && visibleCols.includes(i - 1) && trimSpanAt(i - 1)) return null;
                if (underFace(i)) return null;
                const meta = dialSpan(page.dials[i]) > 1 ? page.dials[i] : dialAt(i);
                if (!meta) return <div key={`empty-${i}`} className="tweakers-move-dial" data-empty="true" />;
                const disabled = TweakStore.isDisabled(page.panel.id, meta.path);
                const active =
                  dragPath === meta.path ||
                  !!handTouch[meta.path] ||
                  !!hwHeld[meta.path] ||
                  (held !== null && held.col === i);
                // A modulator dial whose value already says what it is — two
                // seconds, three clips, Forward, the clip the curve is on —
                // reads the other way round: the name shrinks to the tag on
                // top and the value takes the slot. Plain 0..1 amounts keep
                // the big name, since "40%" on its own says nothing.
                // The kit's own room pages read the same way: the bar width
                // says "2×" big, with its name as the tag.
                const valueFirst = (focused || !!settingsPanel || page.panel.kind === 'kit') && !(meta.min === 0 && meta.max === 1);
                // The modulator's oscilloscope belongs to a place on the page,
                // not to one control: the LFO's first slot shows the live wave
                // whether it is holding a rate in Hz or a tempo division.
                const scopeSlot = settingsPanel
                  ? modLayout?.dials.find((d) => d.path === meta.path)?.scope
                  : undefined;
                // A preview slot on a plain dial wears the modulator's own
                // drawing the way the scope slot wears the live signal — the
                // audio dial's small waveform, with the playhead running
                // through it. (An xy preview dial — the curve's — draws its
                // shape in the pad and never reaches here.)
                const waveSlot = settingsPanel && meta.type !== 'xy'
                  ? modLayout?.dials.find((d) => d.path === meta.path)?.preview
                  : undefined;
                const scope = scopeSlot && modSettings
                  ? <MoveScope index={modSettings.index} />
                  : waveSlot && modSettings
                  ? <MoveWavePreview index={modSettings.index} />
                  : null;
                if (padListView?.panelId === page.panel.id && (page.actions[i] ?? page.valueActions?.[i])?.path === padListView.path) {
                  // The list reads downward, so the drag walks it that way:
                  // down is the next row, up the one before, a row's height
                  // of travel per step. A press alone keeps the cursor.
                  const listPath = `${padListView.panelId}:${padListView.path}`;
                  return <div key={meta.path} className="tweakers-move-dial" data-active="true" data-latched="true" data-pad-list-dial="true"
                    role="slider" tabIndex={0} aria-label={`${padListView.label} list dial`} aria-valuemin={0}
                    aria-valuemax={Math.max(0, padListView.options.length - 1)} aria-valuenow={padListView.cursor}
                    aria-valuetext={padListView.options[padListView.cursor]?.label ?? 'No items'} aria-disabled={padListView.pending || undefined}
                    aria-orientation="vertical"
                    onKeyDown={event => {
                      const step = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : 0;
                      if (!step) return;
                      event.preventDefault();
                      MovePadListStore.move(step);
                    }}
                    onPointerDown={event => { if (event.button <= 0) beginPress(event, listPath, padListView.cursor); }}
                    onPointerMove={event => {
                      const p = movePressTravel(pressRef, listPath, event, () => MovePadListStore.getView()?.cursor ?? 0);
                      if (!p) return;
                      const want = Math.max(0, Math.min(padListView.options.length - 1, p.v + Math.trunc((event.clientY - p.ay) / MOVE_LIST_ROW_TRAVEL)));
                      if (want !== padListView.cursor) MovePadListStore.setCursor(want);
                    }}
                    onPointerUp={() => { endPress(listPath); }}
                    onPointerCancel={() => { endPress(listPath); }}
                    onWheel={event => { event.stopPropagation(); MovePadListStore.move(event.deltaY); }}>
                    <MoveSlotDefaultBody label={padListView.label} value={padListView.options[padListView.cursor]?.label ?? 'No items'} pct={100 * padListView.cursor / Math.max(1, padListView.options.length - 1)} originPct={null} />
                  </div>;
                }
                if (meta.type === 'color') return <MoveColorSlot key={meta.path} panelId={page.panel.id} meta={meta} active={active} open={colorMeta?.path === meta.path} latched={meta !== page.dials[i] && chipLatched(i, meta)} />;
                // The filter takes two slots as one picture: the magnitude
                // response maximised across both, each hand's small label
                // sitting where its own slot's label would have been.
                if (meta.type === 'filter') {
                  const fv = normalizeFilterValue(
                    values[meta.path],
                    resolveFilterAxis(meta.cutoffAxis, 'cutoff'),
                    resolveFilterAxis(meta.resonanceAxis, 'resonance')
                  );
                  const shape = filterShapePath(meta, values[meta.path]);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="filter"
                      data-active={active || undefined}
                      data-disabled={meta.filterEnabled === false || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        fineRef.current = null;
                        setDragPath(meta.path);
                        armMod(meta.path);
                        filterFromPointer(e, meta, true);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) filterFromPointer(e, meta, false);
                      }}
                      onPointerUp={() => { setDragPath(null); fineRef.current = null; }}
                      onPointerCancel={() => { setDragPath(null); fineRef.current = null; }}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotFilterBody meta={meta} value={fv} shape={shape} />
                    </div>
                  );
                }
                // A ramp fills its slot with the ramp — a list of colours has
                // nothing to say as a number. A drag slides the nearest stop;
                // a still TAP opens the integrated colour editor (for the 2–4
                // stop ramps the track buttons can hold), where the dials edit
                // the selected stop's colour.
                if (meta.type === 'gradient') {
                  const g = normalizeGradient(values[meta.path] as never);
                  const open = colorMeta?.path === meta.path;
                  const editable = g.stops.length <= MOVE_GRADIENT_STOPS;
                  const index = open
                    ? Math.min(MoveColorStore.getStop(), g.stops.length - 1)
                    : Math.min(rampStop[meta.path] ?? 0, g.stops.length - 1);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="ramp"
                      data-active={active || open || undefined}
                      role={editable ? 'button' : undefined}
                      aria-expanded={editable ? open : undefined}
                      aria-haspopup={editable ? 'dialog' : undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        fineRef.current = null;
                        rampGesture.current = { path: meta.path, x: e.clientX, y: e.clientY, moved: false };
                        setDragPath(meta.path);
                        armMod(meta.path);
                        rampFromPointer(e, meta, true);
                      }}
                      onPointerMove={(e) => {
                        const gesture = rampGesture.current;
                        if (dragPath !== meta.path || gesture?.path !== meta.path) return;
                        // A finger never holds perfectly still: a few pixels
                        // of slip stays a tap.
                        if (!gesture.moved && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) < MOVE_TAP_SLOP) return;
                        gesture.moved = true;
                        rampFromPointer(e, meta, false);
                      }}
                      onPointerUp={() => {
                        const tapped = rampGesture.current?.path === meta.path && !rampGesture.current.moved;
                        rampGesture.current = null;
                        setDragPath(null);
                        fineRef.current = null;
                        if (tapped && editable && !TweakStore.isDisabled(page.panel.id, meta.path)) {
                          MoveColorStore.toggle(page.panel.id, meta.path);
                        }
                      }}
                      onPointerCancel={() => { rampGesture.current = null; setDragPath(null); fineRef.current = null; }}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotRampBody
                        label={meta.label}
                        value={`${index + 1}/${g.stops.length}`}
                        css={rampCss(g.stops)}
                        stop={g.stops[index]?.position ?? null}
                        stops={open ? g.stops.map((s) => s.position) : undefined}
                      />
                    </div>
                  );
                }
                // The balance slot: the blend between its two colour params
                // fills the display, and the tick is the dial — a plain 0..1
                // number underneath, so the hardware turns it like any dial.
                if (meta.type === 'balance') {
                  const a = String(values[meta.balanceA ?? ''] ?? '#000000');
                  const b = String(values[meta.balanceB ?? ''] ?? '#ffffff');
                  const v = Math.min(1, Math.max(0, Number(values[meta.path] ?? 0.5)));
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="balance"
                      data-active={active || undefined}
                      {...dialDrag(meta)}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotRampBody
                        label={meta.label}
                        value={`${Math.round(v * 100)}%`}
                        css={rampCss([
                          { color: a, position: 0 },
                          { color: b, position: 1 },
                        ])}
                        stop={v}
                      />
                    </div>
                  );
                }
                // A bounded value whose two ends are the same place draws a
                // needle: on a bar, 359° and 1° sit as far apart as they can.
                if (meta.type === 'slider' && meta.display === 'dial') {
                  const min = meta.min ?? 0, max = meta.max ?? 1;
                  const v = Number(values[meta.path] ?? min);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="dial"
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        fineRef.current = null;
                        setDragPath(meta.path);
                        armMod(meta.path);
                        needleFromPointer(e, meta);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) needleFromPointer(e, meta);
                      }}
                      onPointerUp={() => { setDragPath(null); fineRef.current = null; }}
                      onPointerCancel={() => { setDragPath(null); fineRef.current = null; }}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotDialBody
                        label={meta.label}
                        value={`${Number(v.toFixed(2))}${meta.unit ?? (Math.abs(max - min) >= 180 ? '°' : '')}`}
                        bearing={valueToBearing(v, min, max)}
                        origin={valueToBearing(meta.origin ?? min, min, max)}
                      />
                    </div>
                  );
                }
                // A transfer curve fills its slot with the shape itself: the
                // whole curve drawn, and a dot on the point this knob holds.
                if (meta.type === 'transfer') {
                  const points = normalizeTransfer(values[meta.path] as TransferValue).points;
                  const index = Math.min(curvePoint[meta.path] ?? 0, points.length - 1);
                  const held = points[index]!;
                  const samples = Array.from({ length: 48 }, (_, k) => sampleTransfer(points, k / 47));
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="transfer"
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        fineRef.current = null;
                        setDragPath(meta.path);
                        armMod(meta.path);
                        transferFromPointer(e, meta, true);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) transferFromPointer(e, meta, false);
                      }}
                      onPointerUp={() => { setDragPath(null); fineRef.current = null; }}
                      onPointerCancel={() => { setDragPath(null); fineRef.current = null; }}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotTransferBody
                        label={meta.label}
                        value={`${index + 1}/${points.length}`}
                        shape={moveShapePath(samples)}
                        point={{ x: held.x, y: 1 - held.y }}
                      />
                    </div>
                  );
                }
                // An xy control fills its slot with the pad — the field draws
                // behind the label and there is no slider at the bottom.
                if (meta.type === 'xy') {
                  const xa = resolveAxis(meta.xAxis);
                  const ya = resolveAxis(meta.yAxis);
                  const pos = pointFromValue(
                    normalizeValue(values[meta.path] as Partial<XYValue>, xa, ya),
                    xa, ya
                  );
                  // A preview dial draws what the two axes are shaping —
                  // the curve modulator's selected clip — in place of the
                  // crosshair, and names it where the numbers would sit.
                  const preview = meta.path === previewPath ? ModulationStore.getSettingsPreview() : null;
                  // Grid semantics match the XYPad: on by default (5×5), a
                  // number for N×N, density multiplies, false hides.
                  const gridN = moveXYGrid(meta);
                  // A dial that cycles — the curve's clip through its shapes —
                  // takes a still click as the knob's tap, so the point only
                  // follows the pointer once it travels.
                  const cycles = !!settingsPanel && !!modLayout?.dials.find((d) => d.path === meta.path)?.cycle;
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="xy"
                      data-preview={preview ? true : undefined}
                      data-sub={valueFirst || undefined}
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        if (e.button > 0) return;
                        beginPress(e, meta.path, 0);
                        if (!cycles) xyFromPointer(e, meta);
                      }}
                      onPointerMove={(e) => {
                        const p = movePressTravel(pressRef, meta.path, e, () => 0);
                        if (p || (!cycles && dragPath === meta.path)) xyFromPointer(e, meta);
                      }}
                      onPointerUp={(e) => {
                        const tapped = endPress(meta.path);
                        xyRelease(meta);
                        if (!tapped) return;
                        if (e.shiftKey) resetValue(meta);
                        else if (cycles) ModulationStore.tapSettingsControl(meta.path);
                      }}
                      onPointerCancel={() => { endPress(meta.path); xyRelease(meta); }}
                    >
                      {valueFirst && <span className="tweakers-move-dial-sub">{meta.label}</span>}
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotXYBody
                        label={meta.label}
                        value={preview ? preview.label : `${Math.round(pos.x * 100)}·${Math.round((1 - pos.y) * 100)}`}
                        position={pos}
                        gridN={gridN}
                        shape={preview ? moveShapePath(preview.points) : null}
                      />
                    </div>
                  );
                }
                // A range control keeps the dial bar but fills BETWEEN two
                // handles; on the hardware the column's knob edits the low
                // handle and the volume knob edits the high one while that
                // knob is touched — the xy pad's two-handed concept, one axis.
                if (meta.type === 'range') {
                  const pos = normalizeRangeDial(meta, values[meta.path]);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="range"
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        fineRef.current = null;
                        setDragPath(meta.path);
                        armMod(meta.path);
                        rangeFromPointer(e, meta, true);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) rangeFromPointer(e, meta, false);
                      }}
                      onPointerUp={() => { setDragPath(null); fineRef.current = null; }}
                      onPointerCancel={() => { setDragPath(null); fineRef.current = null; }}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotRangeBody label={meta.label} value={rangeReading(meta)} lo={pos.lo} hi={pos.hi} />
                    </div>
                  );
                }
                // A select with options is a stepped enum dial: the bar splits
                // into one cell per option, the active cell filled, and the
                // slot shows the option — as a picture where there is one, and
                // otherwise as the whole list, lit on the current row. A click
                // moves it on and a drag steps it; on the hardware the
                // column's knob steps the same way.
                if (isEnumDial(meta)) {
                  const options = meta.options ?? [];
                  const activeIdx = enumIndex(meta, values[meta.path]);
                  const option = options[activeIdx];
                  const optionLabel = enumOptionLabel(option as never);
                  // The option's own shape, drawn in the slot: the picture is
                  // the value, so its name steps back to a tag at the top.
                  const shape = enumShapePath(meta, values[meta.path]);
                  const glyph = enumOptionIcon(option as never);
                  const picture = enumOptionPicture(option as never);
                  const playback = movePlaybackMode(meta, values[meta.path]);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="enum"
                      style={dialSpan(meta) > 1 ? { gridColumn: `span ${dialSpan(meta)}` } : undefined}
                      data-scope={scope ? true : undefined}
                      data-visual={playback ? 'playback' : undefined}
                      role="slider"
                      tabIndex={disabled ? -1 : 0}
                      aria-label={meta.label}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(0, options.length - 1)}
                      aria-valuenow={activeIdx}
                      aria-valuetext={optionLabel}
                      aria-orientation="horizontal"
                      aria-disabled={disabled || undefined}
                      data-disabled={disabled || undefined}
                      onKeyDown={(e) => dialFromKeyboard(e, meta)}
                      data-shape={shape ? true : undefined}
                      data-active={active || undefined}
                      {...optionDrag(meta)}
                    >
                      {/* An option slot reads top down: what the knob is on
                          the chip, the picture — curve, glyph or list —
                          between, what it is set to underneath. No crossfade:
                          with the name out of the way there is nothing left
                          for the value to replace. */}
                      {scope}
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotEnumBody
                        label={meta.label}
                        optionLabel={optionLabel}
                        options={options}
                        activeIdx={activeIdx}
                        shape={shape}
                        glyph={glyph}
                        picture={picture}
                        playback={playback}
                        scoped={!!scope}
                      />
                    </div>
                  );
                }
                // A column the page is holding open: the control is here,
                // but this mode has nothing for it to do, so it draws
                // nothing rather than letting the row change shape under a
                // finger that is only scrolling a list.
                if (meta.moveBlank) {
                  return <div key={meta.path} className="tweakers-move-dial" data-kind="blank" aria-hidden="true" />;
                }
                // A big toggle — a switch that earned a whole slot (the
                // envelope's Loop, an app's bypass): the pad's language at
                // slot size, or its own picture where it named one. A real
                // button, so the keyboard and a screen reader get the switch
                // the pointer gets. A switch that draws what it switches (the
                // metronome) is the same button wearing that drawing.
                if (meta.type === 'toggle') {
                  const checked = values[meta.path] === true;
                  const kind = moveSlotKind(meta);
                  return (
                    <button
                      key={meta.path}
                      type="button"
                      className="tweakers-move-dial"
                      data-kind={kind}
                      data-on={checked || undefined}
                      data-active={active || undefined}
                      role="switch"
                      aria-label={meta.label}
                      aria-checked={checked}
                      disabled={disabled}
                      onClick={() => {
                        if (!TweakStore.isDisabled(page.panel.id, meta.path)) {
                          TweakStore.updateValue(page.panel.id, meta.path, !checked);
                        }
                      }}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      {kind === 'metronome' ? (
                        <MoveSlotMetronomeBody
                          label={meta.label}
                          checked={checked}
                          swing={meta.moveVisual?.kind === 'metronome' ? meta.moveVisual.swing : undefined}
                        />
                      ) : (
                        <MoveSlotToggleBody
                          label={meta.label}
                          checked={checked}
                          icon={meta.icon}
                          onIcon={meta.onIcon}
                          offIcon={meta.offIcon}
                        />
                      )}
                    </button>
                  );
                }
                // A dial with the oscilloscope in it — the Rate slot: the
                // modulator's live signal fills the slot behind the dial's
                // own readout and bar, and the drag still turns the rate.
                // You turn the wave you're watching.
                if (scope) {
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="scope"
                      data-active={active || undefined}
                      {...dialDrag(meta)}
                    >
                      <MoveModRing panelId={page.panel.id} path={meta.path} />
                      <MoveSlotScopeBody
                        label={meta.label}
                        value={chipValue(meta).num + (meta.unit ? ` ${meta.unit}` : '')}
                        pct={dialPercent(meta)}
                      >
                        {scope}
                      </MoveSlotScopeBody>
                    </div>
                  );
                }
                // The ADSR's four stage dials render as ONE 4-slot control,
                // the filter's big sibling: a single display drawing the
                // whole envelope, with each stage's caption and drag zone in
                // its own column — so every hardware knob still owns its
                // stage while the picture reads as one shape. The first
                // stage column carries the whole control; the rest yield to
                // its span, like the filter's second column does.
                const envStage = settingsPanel ? modLayout?.dials.find((d) => d.path === meta.path)?.stage : undefined;
                if (envStage) {
                  const stageDials = (modLayout?.dials ?? [])
                    .filter((d) => d.stage)
                    .flatMap((d) => {
                      const m = page.dials.find((x) => x?.path === d.path);
                      return m ? [{ stage: d.stage as string, meta: m }] : [];
                    });
                  if (stageDials[0]?.meta.path !== meta.path) return null;
                  // Times come off the panel's dials; the ramps' bends and
                  // the stages' waves live only in the slot's params, written
                  // by the two pad rows underneath.
                  const envParams: ModulationParams = {
                    attack: Number(values.attack) || 0,
                    decay: Number(values.decay) || 0,
                    sustain: Number(values.sustain) || 0,
                    release: Number(values.release) || 0,
                    attackCurve: Number(modSlot?.params.attackCurve) || 0,
                    decayCurve: Number(modSlot?.params.decayCurve) || 0,
                    releaseCurve: Number(modSlot?.params.releaseCurve) || 0,
                    ...Object.fromEntries(ENV_WAVE_STAGES.flatMap((s) => [
                      [envWaveParam(s), Number(modSlot?.params[envWaveParam(s)]) || 0],
                      [envWaveFlipParam(s), !!modSlot?.params[envWaveFlipParam(s)]],
                    ])),
                  };
                  // A wave being dialled in has no handle of its own, so the
                  // whole picture comes up instead — you watch the shape you
                  // are shaking.
                  const envActive = waveHeld !== null || stageDials.some(
                    (s) => dragPath === s.meta.path || !!handTouch[s.meta.path] || !!hwHeld[s.meta.path]
                  );
                  // Stage times read as their real numbers — 300 ms, not a
                  // percent of the dial.
                  const reading = (m: ControlMeta) => {
                    const v = chipValue(m);
                    return `${v.num}${v.unit ? ` ${v.unit}` : ''}`;
                  };
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="env"
                      data-active={envActive || undefined}
                      style={{ gridColumn: `span ${stageDials.length}` }}
                    >
                      <MoveSlotEnvBody
                        points={envelopePoints(envParams, 129)}
                        stages={stageDials.map((s) => ({ stage: s.stage, label: s.meta.label, value: reading(s.meta) }))}
                        joints={envelopeJoints(envParams).map((j) => ({ ...j, held: bendHeld === j.stage }))}
                      />
                      {/* One drag zone per stage column, over the display:
                          the pointer edits the stage whose column it is in,
                          the same one-knob-per-column rule the hardware
                          keeps. */}
                      <div className="tweakers-move-env-zones">
                        {stageDials.map(({ meta: m }) => (
                          <div
                            key={m.path}
                            className="tweakers-move-env-zone"
                            {...dialDrag(m)}
                          >
                            <MoveModRing panelId={page.panel.id} path={m.path} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                // A multi-slot instrument — a gate, a multiband cleaner —
                // drawn as one face across its columns. Each column keeps its
                // own drag zone and knob; a drag reads that dial's drawn part.
                const face = faceAt(i);
                if (face) {
                  const dials = face.dials.map((d) => ({
                    ...d,
                    active: dragPath === d.meta.path || !!handTouch[d.meta.path] || !!hwHeld[d.meta.path] || (held !== null && held.col === d.col),
                  }));
                  const shown = (d: typeof dials[number]) => ({
                    label: d.meta.label,
                    value: moveVisualReading(d.meta, Number(values[d.meta.path])),
                    position: d.position,
                    active: d.active,
                  });
                  const body = face.kind === 'channel' ? (
                    <MoveSlotChannelBody channels={dials.map((d) => {
                      const visual = d.meta.moveVisual;
                      return { ...shown(d), ...(visual?.kind === 'channel' ? { icon: visual.icon, tone: visual.tone } : {}) };
                    })} />
                  ) : face.kind === 'vector' ? (
                    <MoveSlotVectorBody x={shown(dials[0])} y={shown(dials[1])} z={shown(dials[2])} down={face.down} />
                  ) : face.kind === 'gate' ? (
                    <MoveSlotGateBody threshold={shown(dials[0])} lookahead={shown(dials[1])} release={shown(dials[2])}>
                      <MoveGateDisplay panelId={page.panel.id} threshold={dials[0].position} />
                    </MoveSlotGateBody>
                  ) : (
                    <MoveSlotMultibandBody amount={shown(dials[0])} speed={shown(dials[1])} bands={dials.slice(2).map(shown)} icon={face.icon}>
                      <MoveMultibandDisplay
                        panelId={page.panel.id}
                        bands={face.curve!.map((b) => ({ position: b.position, active: dragPath === b.meta.path || dials.some((d) => d.active && d.meta === b.meta) }))}
                      />
                    </MoveSlotMultibandBody>
                  );
                  return (
                    <div
                      key={dials[0].meta.path}
                      className="tweakers-move-dial"
                      data-kind={face.kind}
                      data-active={dials.some((d) => d.active) || undefined}
                      data-latched={dials.every((d) => d.meta !== page.dials[d.col] && chipLatched(d.col, d.meta)) || undefined}
                      style={{ gridColumn: `span ${face.span}` }}
                    >
                      {body}
                      <div className="tweakers-move-face-zones">
                        {dials.map((d) => {
                          const off = TweakStore.isDisabled(page.panel.id, d.meta.path);
                          return (
                            <div
                              key={d.col}
                              className="tweakers-move-face-zone"
                              data-role={d.role}
                              role="slider"
                              tabIndex={off ? -1 : 0}
                              aria-label={d.meta.label}
                              aria-valuemin={d.meta.min ?? 0}
                              aria-valuemax={d.meta.max ?? 1}
                              aria-valuenow={Number(values[d.meta.path])}
                              aria-valuetext={moveVisualReading(d.meta, Number(values[d.meta.path]))}
                              aria-orientation={d.role === 'lookahead' || d.role === 'axis-x' ? 'horizontal' : 'vertical'}
                              aria-disabled={off || undefined}
                              data-disabled={off || undefined}
                              onKeyDown={(k) => dialFromKeyboard(k, d.meta)}
                              onPointerDown={(p) => {
                                // on the band grid the press takes the band under it, knob or pad
                                let meta = d.meta;
                                if (d.role === 'band' && face.curve) {
                                  const grid = p.currentTarget.closest?.('.tweakers-move-dial')?.querySelector('[data-track="grid"]')?.getBoundingClientRect();
                                  if (grid?.width) {
                                    const k = Math.floor(((p.clientX - grid.left) / grid.width) * face.curve.length);
                                    meta = face.curve[Math.max(0, Math.min(face.curve.length - 1, k))].meta;
                                  }
                                }
                                faceDrag.current = meta;
                                dialDrag(meta).onPointerDown(p);
                              }}
                              onPointerMove={(p) => { if (faceDrag.current) dialDrag(faceDrag.current).onPointerMove(p); }}
                              onPointerUp={(p) => { if (faceDrag.current) dialDrag(faceDrag.current).onPointerUp(p); faceDrag.current = null; }}
                              onPointerCancel={() => { if (faceDrag.current) dialDrag(faceDrag.current).onPointerCancel(); faceDrag.current = null; }}
                            >
                              <MoveModRing panelId={page.panel.id} path={d.meta.path} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                // A take's start and end: one line across both columns, a
                // flag per edge. Each column keeps its own drag zone and
                // knob, but a drag reads the whole line, so the flag follows
                // the finger.
                const trimSpan = !stripMode && visibleCols.includes(i + 1) ? trimSpanAt(i) : null;
                if (trimSpan) {
                  const edges = [
                    { edge: 'start' as const, col: i, meta: trimSpan.start, position: trimSpan.at.start },
                    { edge: 'end' as const, col: i + 1, meta: trimSpan.end, position: trimSpan.at.end },
                  ];
                  const edgeActive = (e: typeof edges[number]) =>
                    dragPath === e.meta.path || !!handTouch[e.meta.path] || !!hwHeld[e.meta.path] || (held !== null && held.col === e.col);
                  const side = (e: typeof edges[number]) => ({
                    label: e.meta.label,
                    value: moveVisualReading(e.meta, Number(values[e.meta.path])),
                    position: e.position,
                    moved: e.edge === 'start' ? e.position > 1e-9 : e.position < 1 - 1e-9,
                  });
                  return (
                    <div
                      key={trimSpan.start.path}
                      className="tweakers-move-dial"
                      data-kind="trim-span"
                      data-active={edges.some(edgeActive) || undefined}
                      data-latched={edges.every((e) => e.meta !== page.dials[e.col] && chipLatched(e.col, e.meta)) || undefined}
                      style={{ gridColumn: 'span 2' }}
                    >
                      <MoveSlotTrimSpanBody start={side(edges[0])} end={side(edges[1])} />
                      <div className="tweakers-move-trim-span-zones">
                        {edges.map((e) => {
                          const off = TweakStore.isDisabled(page.panel.id, e.meta.path);
                          return (
                            <div
                              key={e.meta.path}
                              className="tweakers-move-trim-span-zone"
                              role="slider"
                              tabIndex={off ? -1 : 0}
                              aria-label={e.meta.label}
                              aria-valuemin={e.meta.min ?? 0}
                              aria-valuemax={e.meta.max ?? 1}
                              aria-valuenow={Number(values[e.meta.path])}
                              aria-valuetext={moveVisualReading(e.meta, Number(values[e.meta.path]))}
                              aria-orientation="horizontal"
                              aria-disabled={off || undefined}
                              data-disabled={off || undefined}
                              onKeyDown={(k) => dialFromKeyboard(k, e.meta)}
                              {...dialDrag(e.meta)}
                            >
                              <MoveModRing panelId={page.panel.id} path={e.meta.path} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                // The slot pulses with its chip while a latched value sits in it.
                const latchedHere = meta !== page.dials[i] && chipLatched(i, meta);
                // A bipolar/origin dial anchors the fill at the origin mark and
                // grows toward the handle on either side, like the Slider.
                const origin01 = dialOrigin(meta);
                const originPct = origin01 > 0 ? origin01 * 100 : null;
                const pct = dialPercent(meta);
                // Parked on the origin exactly — the dial's zero, which the
                // ring states outright instead of leaving you to read a stub
                // against a tick.
                const atOrigin =
                  originPct != null &&
                  Math.abs(normalizeDial(meta, values[meta.path]) - origin01) < 1e-6;
                // A substituted chip (held or latched into the slot) reads as
                // its real value — the same number its chip shows below — and
                // a small tag names what the slot is controlling.
                const drawing = moveNumericDrawing(meta, values[meta.path]);
                const subbed = meta !== page.dials[i];
                const subValue = subbed || valueFirst ? chipValue(meta) : null;
                return (
                  <div
                    key={meta.path}
                    className="tweakers-move-dial"
                    data-active={active || undefined}
                    data-latched={latchedHere || undefined}
                    data-sub={(!drawing && (subbed || valueFirst)) || undefined}
                    data-visual={drawing?.kind}
                    role="slider"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={meta.label}
                    aria-valuemin={meta.min ?? 0}
                    aria-valuemax={meta.max ?? 1}
                    aria-valuenow={Number(values[meta.path])}
                    aria-valuetext={moveVisualReading(meta, Number(values[meta.path]))}
                    aria-orientation="horizontal"
                    aria-disabled={disabled || undefined}
                    data-disabled={disabled || undefined}
                    onKeyDown={(e) => dialFromKeyboard(e, meta)}
                    {...dialDrag(meta)}
                  >
                    {!drawing && (subbed || valueFirst) && <span className="tweakers-move-dial-sub">{meta.label}</span>}
                    <MoveModRing panelId={page.panel.id} path={meta.path} />
                    {drawing ? (
                      <MoveSlotNumericBody label={meta.label} value={moveVisualReading(meta, Number(values[meta.path]))} drawing={drawing} />
                    ) : <MoveSlotDefaultBody
                      label={meta.label}
                      value={subValue
                        ? `${subValue.num}${subValue.unit ? ` ${subValue.unit}` : ''}`
                        : dialReading(meta)}
                      pct={pct}
                      originPct={originPct}
                      atOrigin={atOrigin}
                    />}

                  </div>
                );
              })}
            </div>

            {/* Trailing empty pad rows collapse: a row shows only if it, or any
                row after it, has something in it — so gaps inside the grid hold
                their place, but the panel never ends on dead rows. Columns
                collapse the same way: cells render only for visible columns,
                blank pads filling the gaps to keep the grid rectangular. */}
            {color && colorMeta ? <MoveOpacityPads color={color} disabled={TweakStore.isDisabled(page.panel.id, colorMeta.path)} /> : shownPadRows
              .map((row) => {
                // The app's reserved rows are one instrument, not sixteen
                // controls: what those pads mean is the app's business and
                // only the app can say it. A claimed area the app has not
                // painted draws as a single slot carrying that sentence,
                // once — the rows after the first fold into it. Painted cells
                // draw as the pads they are, tappable, the sentence on their
                // tooltip.
                if (appRowAt(row) !== null && !surface.pads.length) {
                  if (row > firstAppScreenRow) return null;
                  return (
                    <div
                      key="app-rows"
                      className="tweakers-move-app-row"
                      data-rows={appRows}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                      }}
                    >
                      <span className="tweakers-move-app-row-label">
                        {surface.padsLabel ?? 'the app’s pads'}
                      </span>
                    </div>
                  );
                }
                return (
                <div
                  key={row}
                  className="tweakers-move-pads"
                  data-pad-row={row}
                  data-pad-columns={stripMode ? page.dials.length : padGridCols}
                  style={{ '--move-pad-cols': stripMode ? page.dials.length : padGridCols } as React.CSSProperties}
                >
                  {/* An app-claimed row runs from the first hardware column to
                      the panel's edge — its pads are the app's own, not echoes
                      of the dial columns above. Kit rows keep the dial columns. */}
                  {(stripMode
                    ? visibleCols
                    : Array.from({ length: padGridCols }, (_, i) => i)
                  ).map((col) => {
                    // A claimed row is the app's: it paints these, we only show them.
                    const appRow = appRowAt(row);
                    if (appRow !== null) {
                      const cell = padAt(col, appRow);
                      if (!cell || cell.empty) {
                        return <div key={`app-${col}`} className="tweakers-move-pad" data-empty="true" />;
                      }
                      return (
                        <button
                          key={`app-${col}`}
                          type="button"
                          className="tweakers-move-pad"
                          data-kind="app"
                          title={surface.padsLabel ?? undefined}
                          data-on={cell.lit || appHeld === `${appRow}:${col}` || undefined}
                          data-held={appHeld === `${appRow}:${col}` || undefined}
                          onPointerDown={(e) => {
                            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                            setAppHeld(`${appRow}:${col}`);
                          }}
                          onPointerUp={() => setAppHeld(null)}
                          onPointerCancel={() => setAppHeld(null)}
                          onClick={(e) => MoveSurfaceStore.press(col, appRow, e.shiftKey)}
                        >
                          <MovePadAppBody label={cell.label} color={cell.color} />
                        </button>
                      );
                    }
                    const meta = padRows[row][col];
                    // A tabs strip renders ONCE, out of the first pad of its
                    // run; the rest of the run yields to its span, the way
                    // the filter's second column yields to its picture. The
                    // options are real buttons over the drawing — the strip's
                    // only gesture is a tap, and it belongs to the panel.
                    if (meta && isMoveTabs(meta)) {
                      if (isPadSpanContinuation(padRows[row], col)) return null;
                      const span = padSpan(meta);
                      const named = isNamedTabs(meta);
                      const options = meta.options ?? [];
                      const active = enumIndex(meta, values[meta.path]);
                      return (
                        <div
                          key={meta.path}
                          className="tweakers-move-tabs"
                          data-kind="tabs"
                          style={{ gridColumn: `span ${span}`, '--move-tabs-cols': span } as React.CSSProperties}
                        >
                          <MovePadTabsBody
                            name={named ? meta.label : null}
                            options={options}
                            activeIdx={active}
                          />
                          <div className="tweakers-move-tab-zones" role="tablist" aria-label={meta.label}>
                            {options.map((opt, i) => (
                              <button
                                key={enumOptionValue(opt as never)}
                                type="button"
                                role="tab"
                                className="tweakers-move-tab-zone"
                                style={{ gridColumnStart: (named ? 2 : 1) + i }}
                                aria-selected={i === active}
                                disabled={TweakStore.isDisabled(page.panel.id, meta.path)}
                                onClick={() => TweakStore.updateValue(
                                  page.panel.id, meta.path, enumOptionValue(opt as never)
                                )}
                              >
                                {enumOptionLabel(opt as never)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    // The envelope's bend pads: the free toggle-row cell
                    // under each ramp column. Hold the pad and drag up or
                    // down to bend the ramp above it — the joint handle
                    // brightens, the shape and the signal follow together.
                    const bendStage =
                      !meta && settingsPanel && padRows[row] === page.toggles && modSettings
                        ? modLayout?.dials[col]?.stage
                        : undefined;
                    if (bendStage && ENV_BEND_STAGES.includes(bendStage)) {
                      return (
                        <button
                          key={`bend-${bendStage}`}
                          className="tweakers-move-pad"
                          data-kind="bend"
                          data-on={bendHeld === bendStage || undefined}
                          onPointerDown={(e) => {
                            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                            setBendHeld(bendStage);
                            bendRef.current = {
                              y: e.clientY,
                              curve: Number(modSlot?.params[envCurveParam(bendStage)]) || 0,
                            };
                          }}
                          onPointerMove={(e) => {
                            if (bendHeld !== bendStage || !bendRef.current) return;
                            const v = Math.min(1, Math.max(-1,
                              bendRef.current.curve + (bendRef.current.y - e.clientY) / 60));
                            ModulationStore.updateSlotParams(modSettings!.index, { [envCurveParam(bendStage)]: v });
                          }}
                          onPointerUp={() => { setBendHeld(null); bendRef.current = null; }}
                          onPointerCancel={() => { setBendHeld(null); bendRef.current = null; }}
                        >
                          <MovePadToggleBody label="Curve" />
                        </button>
                      );
                    }
                    // The envelope's wave pads, one row below the bends: the
                    // chip-row cell under each stage column. Hold and drag up
                    // to bring that stage's own sine in, 0 to 100%; tap to
                    // flip it over, so the stage swells out of nothing
                    // instead of dipping through its middle.
                    const waveStage =
                      !meta && settingsPanel && padRows[row] === page.values && modSettings
                        ? modLayout?.dials[col]?.stage
                        : undefined;
                    if (waveStage && ENV_WAVE_STAGES.includes(waveStage)) {
                      const amount = Number(modSlot?.params[envWaveParam(waveStage)]) || 0;
                      const flipped = !!modSlot?.params[envWaveFlipParam(waveStage)];
                      return (
                        <button
                          key={`wave-${waveStage}`}
                          className="tweakers-move-pad"
                          data-kind="wave"
                          data-on={amount > 0 || undefined}
                          data-held={waveHeld === waveStage || undefined}
                          onPointerDown={(e) => {
                            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                            setWaveHeld(waveStage);
                            waveRef.current = { y: e.clientY, amount, moved: false };
                          }}
                          onPointerMove={(e) => {
                            if (waveHeld !== waveStage || !waveRef.current) return;
                            const dy = waveRef.current.y - e.clientY;
                            // A finger never holds perfectly still: a few
                            // pixels of slip stays a tap.
                            if (!waveRef.current.moved && Math.abs(dy) < 3) return;
                            waveRef.current.moved = true;
                            const v = Math.min(1, Math.max(0, waveRef.current.amount + dy / 100));
                            ModulationStore.updateSlotParams(modSettings!.index, { [envWaveParam(waveStage)]: v });
                          }}
                          onPointerUp={() => {
                            if (waveHeld === waveStage && waveRef.current && !waveRef.current.moved) {
                              ModulationStore.updateSlotParams(modSettings!.index, {
                                [envWaveFlipParam(waveStage)]: !flipped,
                              });
                            }
                            setWaveHeld(null);
                            waveRef.current = null;
                          }}
                          onPointerCancel={() => { setWaveHeld(null); waveRef.current = null; }}
                        >
                          <MovePadWaveBody label={flipped ? 'Swell' : 'Dip'} percent={Math.round(amount * 100)} />
                        </button>
                      );
                    }
                    if (!meta) return <div key={`empty-${col}`} className="tweakers-move-pad" data-empty="true" />;
                    // A fade or a loop — a start chip and the end chip beside
                    // it — draws once, out of its start pad, two pads wide;
                    // the end pad yields its cell to the span. Each half is
                    // still its own chip over its own pad: hold peeks, tap
                    // latches. A strip's window may cut a pair, so a strip
                    // keeps the two chips.
                    const edges = stripMode ? null : moveEdgesCell(page, padRows, row, col);
                    if (edges?.tail) return null;
                    if (edges) {
                      const chipHeld = (m: ControlMeta) => (held !== null && held.meta.path === m.path) || !!hwHeld[m.path];
                      // An edge has moved once it sits half a step or more off
                      // its open end: a fade and a loop start open at their
                      // minimum, a loop end at its maximum.
                      const hand = (m: ControlMeta, open: number) => ({
                        at: normalizeDial(m, values[m.path]),
                        moved: Math.abs(Number(values[m.path]) - open) >= Math.max((m.step ?? 0) / 2, 1e-9),
                      });
                      const start = hand(edges.start, edges.start.min ?? 0);
                      const end = hand(edges.end, edges.kind === 'loop' ? edges.end.max ?? 1 : edges.end.min ?? 0);
                      return (
                        <div
                          key={`edges-${col}`}
                          className="tweakers-move-edges"
                          data-kind={edges.kind}
                          style={{ gridColumn: 'span 2' }}
                          onPointerDown={(e) => {
                            const x = edgesFromPointer(e);
                            // The hand nearest the cursor is the one taken: a
                            // fade by its half of the line, a loop by whichever
                            // marker is closer (the start, when they sit together
                            // and the cursor is left of them).
                            const takeStart = edges.kind === 'fade'
                              ? x < 0.5
                              : Math.abs(x - start.at) < Math.abs(x - end.at) || (start.at >= end.at && x <= start.at);
                            const m = takeStart ? edges.start : edges.end;
                            if (TweakStore.isDisabled(page.panel.id, m.path)) return;
                            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                            setDragPath(m.path);
                            armMod(m.path);
                            dragEdge(edges.kind, takeStart, m, x);
                          }}
                          onPointerMove={(e) => {
                            const m = dragPath === edges.start.path ? edges.start : dragPath === edges.end.path ? edges.end : null;
                            if (m && !TweakStore.isDisabled(page.panel.id, m.path)) dragEdge(edges.kind, m === edges.start, m, edgesFromPointer(e));
                          }}
                          onPointerUp={() => setDragPath(null)}
                          onPointerCancel={() => setDragPath(null)}
                        >
                          {edges.kind === 'fade'
                            ? <MovePadFadeBody fadeIn={start} fadeOut={end} />
                            : <MovePadLoopBody start={start} end={end} />}
                          {([[edges.start, col], [edges.end, col + 1]] as const).map(([m, at]) => (
                            <div
                              key={m.path}
                              className="tweakers-move-edges-zone"
                              role="slider"
                              tabIndex={TweakStore.isDisabled(page.panel.id, m.path) ? -1 : 0}
                              aria-label={m.label}
                              aria-valuemin={m.min ?? 0}
                              aria-valuemax={m.max ?? 1}
                              aria-valuenow={Number(values[m.path])}
                              aria-valuetext={moveVisualReading(m, Number(values[m.path]))}
                              aria-orientation="horizontal"
                              data-held={chipHeld(m) || undefined}
                              data-latched={chipLatched(at, m) || undefined}
                              onKeyDown={(k) => dialFromKeyboard(k, m)}
                            >
                              <MoveModRing panelId={page.panel.id} path={m.path} pad />
                            </div>
                          ))}
                        </div>
                      );
                    }
                    // A band — a high cut over a low cut in one column — draws
                    // once, out of its upper pad, two pads tall; the pad under
                    // it holds the column and yields the room. Each half is
                    // still its own chip: hold peeks, tap latches.
                    const band = moveBandCell(page, padRows, row, col);
                    if (band?.tail) return <div key={`band-${col}`} className="tweakers-move-band" data-tail aria-hidden="true" />;
                    if (band) {
                      const lower = band.upper === 'high' ? band.low : band.high;
                      const chipHeld = (m: ControlMeta) => (held !== null && held.meta.path === m.path) || !!hwHeld[m.path];
                      const hand = (m: ControlMeta, open: number) => ({
                        at: normalizeDial(m, values[m.path]),
                        cut: Number(values[m.path]) !== open,
                        held: chipHeld(m),
                        latched: chipLatched(col, m),
                      });
                      return (
                        <div key={`band-${col}`} className="tweakers-move-band" data-kind="band">
                          <div className="tweakers-move-band-face">
                            <MovePadBandBody
                              low={hand(band.low, band.low.min ?? 0)}
                              high={hand(band.high, band.high.max ?? 1)}
                              upper={band.upper}
                            />
                            {[meta, lower].map((m) => (
                              <button
                                key={m.path}
                                type="button"
                                className="tweakers-move-band-zone"
                                aria-label={m.label}
                                data-held={chipHeld(m) || undefined}
                                data-latched={chipLatched(col, m) || undefined}
                                onPointerDown={(e) => pressChip(e, col, m)}
                                onPointerUp={() => releaseChip(col, m)}
                                onPointerCancel={() => setHeld(null)}
                              >
                                <MoveModRing panelId={page.panel.id} path={m.path} pad />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    // What a pad is comes from the control, not the row it
                    // sits in: a value chip lifted onto the top row is still
                    // a value chip.
                    if (page.toggles[col] === meta) {
                      return (
                        <button
                          key={meta.path}
                          className="tweakers-move-pad"
                          data-kind={meta.icon ? 'icon' : 'toggle'}
                          data-on={!!values[meta.path]}
                          aria-label={meta.icon ? meta.label : undefined}
                          title={meta.icon ? meta.label : undefined}
                          {...(meta.moveHold ? holdPad(page.panel.id, meta.path) : {
                            onClick: () => TweakStore.updateValue(page.panel.id, meta.path, !values[meta.path]),
                          })}
                        >
                          {meta.icon
                            ? <MovePadIconBody icon={meta.icon} />
                            : <MovePadToggleBody label={meta.label} />}
                        </button>
                      );
                    }
                    // Action pads carry no value — a press just runs the
                    // app's action, the same as the row's button on screen.
                    if (meta.type === 'action') {
                      if (MovePadListStore.has(page.panel.id, meta.path)) return <MovePadList key={meta.path} panelId={page.panel.id} path={meta.path} label={meta.label} icon={meta.icon} view={padListView} disabled={TweakStore.isDisabled(page.panel.id, meta.path)} />;
                      return (
                        <button
                          key={meta.path}
                          className="tweakers-move-pad"
                          data-kind="action"
                          onClick={() => TweakStore.triggerAction(page.panel.id, meta.path)}
                        >
                          {meta.icon
                            ? <MovePadIconLabelBody icon={meta.icon} label={meta.label} />
                            : <MovePadActionBody label={meta.label} />}
                        </button>
                      );
                    }
                    // A chip — a value, or the small colour selector on
                    // whichever row it sits (a balance stacks its two in its
                    // own column, one up top and one under it). One gesture
                    // path for both: hold peeks, tap latches, and the knob
                    // above then edits the chip as its own kind — a colour
                    // lands in the slot as the big colour slot, whose tap is
                    // the door to the editor. Only the face differs.
                    const isColor = meta.type === 'color';
                    const value = isColor ? null : chipValue(meta);
                    return (
                      <button
                        key={meta.path}
                        className="tweakers-move-pad"
                        data-kind={isColor ? 'color' : 'value'}
                        data-held={(held !== null && held.meta.path === meta.path) || hwHeld[meta.path] || undefined}
                        data-latched={chipLatched(col, meta) || undefined}
                        aria-label={isColor ? meta.label : undefined}
                        onPointerDown={(e) => pressChip(e, col, meta)}
                        onPointerUp={() => releaseChip(col, meta)}
                        onPointerCancel={() => setHeld(null)}
                      >
                        {isColor
                          ? <MovePadColorBody label={meta.label} color={String(values[meta.path])} />
                          : <MovePadValueBody label={meta.label} value={value!.num} unit={value!.unit}>
                              <MoveModRing panelId={page.panel.id} path={meta.path} pad />
                            </MovePadValueBody>}
                      </button>
                    );
                  })}
                </div>
                );
              })}
            </div>
            </div>

            {/* An app that holds the step row: its circles under the pad grid,
                where a long row has the panel's width to wrap in — a circle
                per step it names, the lit one filled, a group's steps in one
                pill. */}
            {!settingsOpen && surface.steps && MoveSurfaceStore.ownsSteps() && (
              <div className="tweakers-move-app-steps">
                {stepRuns(surface.steps).map((run) => (
                <span key={run[0].step} className="tweakers-move-step-group">
                  {run.map((cell) => (
                    <button key={cell.step} type="button" className="tweakers-move-mod" data-lit={cell.lit || undefined}
                      title={`Step ${cell.step + 1}`} aria-pressed={!!cell.lit}
                      onClick={(event) => MoveSurfaceStore.pressStep(cell.step, event.shiftKey)}>
                      <span className="tweakers-move-mod-dot" style={{ background: cell.lit ? cell.color ?? 'var(--move-text)' : 'transparent', boxShadow: cell.lit ? undefined : 'inset 0 0 0 1.5px var(--move-text)' }} />
                    </button>
                  ))}
                </span>
              ))}
              </div>
            )}

            {/* Where the window sits in the whole set — the wheel's own answer
                to "where am I", and the thing you can drag when there is no
                wheel under your hand. Focus it and the arrow keys walk the
                slots; with shift, or the page keys, they turn the page. */}
            {stripMode && (
              <div
                className="tweakers-move-rail"
                role="slider"
                tabIndex={0}
                aria-label={`Slots ${stripFrom + 1}–${stripTo} of ${stripTotal}`}
                aria-valuemin={0}
                aria-valuemax={Math.max(0, stripStops.length - 1)}
                aria-valuenow={Math.max(0, stripStops.indexOf(stripOffset))}
                aria-orientation="horizontal"
                data-scrolling={dotDrag !== null || undefined}
                onKeyDown={(e) => {
                  // Shift, or the page keys, jump a whole window — the same
                  // move the Move's arrows make.
                  const dir = e.key === 'ArrowRight' || e.key === 'PageDown' ? 1
                    : e.key === 'ArrowLeft' || e.key === 'PageUp' ? -1 : 0;
                  const paged = e.shiftKey || e.key === 'PageUp' || e.key === 'PageDown';
                  if (dir && paged) {
                    e.preventDefault();
                    scrollPage(dir);
                    return;
                  }
                  const step = dir || (e.key === 'Home' ? -stripStops.length : e.key === 'End' ? stripStops.length : 0);
                  if (!step) return;
                  e.preventDefault();
                  scrollSlots(step);
                }}
                onPointerDown={(e) => {
                  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                  setDotDrag({ x: e.clientX, stop: Math.max(0, stripStops.indexOf(stripOffset)) });
                }}
                onPointerMove={(e) => {
                  if (!dotDrag) return;
                  // One slot per slot-width of travel: the set moves under the
                  // hand at the rate the slots themselves do.
                  const slotWidth = e.currentTarget.getBoundingClientRect().width / MOVE_DIALS || 1;
                  const want = dotDrag.stop + Math.round((e.clientX - dotDrag.x) / slotWidth);
                  setOffset(stripStops[Math.min(stripStops.length - 1, Math.max(0, want))]);
                }}
                onPointerUp={() => setDotDrag(null)}
                onPointerCancel={() => setDotDrag(null)}
              >
                {/* Counted in controls, not columns: the window is as wide as
                    the number of slots actually under the dials, which a
                    2-column control makes one fewer than eight. */}
                <span
                  className="tweakers-move-rail-window"
                  style={{
                    left: `${(stripFrom / stripTotal) * 100}%`,
                    width: `${((stripTo - stripFrom) / stripTotal) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>}
          </div>
        </div>
      </div>
    </div>
  );

  // Flow docking stays in the host's tree, so the app can centre content and
  // panel as one group; viewport docking portals out and pins to the edge.
  const moving = (
    <MovePanelMotion surface={motionSurface} page={motionPage} panel={panelRef}>
      {content}
    </MovePanelMotion>
  );
  return dock === 'flow' ? moving : createPortal(moving, document.body);
}

/** The floating composer's size — a Move-sized read of the whole pass. */
const MOVE_CURVE_WIDTH = 320;
const MOVE_CURVE_HEIGHT = 84;

/**
 * A curve modulator's composition, floating just above the panel while its
 * settings page is open — the same composer the app writes curves with, at
 * Move size and in the slot's own colour. Screen and hardware edit one
 * thing: the highlighted clip is the one the page's shape dials are on, and
 * the playhead runs on the modulator's own phase.
 */
function MoveCurveComposer({
  index, segments, direction, gap, selected,
}: {
  index: number;
  segments: CurveSegment[];
  direction: 'forward' | 'mirror' | 'reverse';
  gap: number;
  selected: number;
}) {
  // No colours passed: the composer strokes in currentColor, which the panel
  // sets to its own text colour — the shape reads as part of the instrument.
  return (
    <div className="tweakers-move-curve">
      <CurveComposer
        segments={segments}
        direction={direction}
        gap={gap}
        selectedIndex={selected}
        getPhase={() => ModulationStore.getSlotPhase(index)}
        onSelect={(i) => ModulationStore.updateSlotParams(index, { selected: i })}
        onSegmentsChange={(next) =>
          ModulationStore.updateSlotParams(index, { clips: next as never })}
        width={MOVE_CURVE_WIDTH}
        height={MOVE_CURVE_HEIGHT}
      />
    </div>
  );
}

const clampWave01 = (v: unknown) => Math.min(1, Math.max(0, Number(v) || 0));

/**
 * An audio modulator's waveform, floating above the panel while its settings
 * page is open — the sample the slot is following, in the full Move-driven
 * editor. The hardware becomes a tape deck for as long as it is up: the
 * wheel zooms, the volume knob scrubs, the step row brackets the loop (a
 * held step lets it go), the bottom pads jump the playhead around the shown
 * window (a held pad selects that stretch as the loop), Play runs the
 * transport and Loop arms the brackets. Every move lands in the slot's
 * params, where the engine reads them — screen and hardware edit one thing.
 */
function MoveAudioWave({ index, theme }: { index: number; theme: TweakTheme }) {
  // The sample can arrive after the page opens — re-read it when it does.
  useSyncExternalStore(
    useCallback((cb) => subscribeAudioMod(cb), []),
    () => getAudioModVersion(),
    () => 0
  );

  // Seed the shared view from the slot, then let the hardware drive it. The
  // editor claim widens the waveform's step share to the whole row and takes
  // the pad row; both hand back on close.
  useEffect(() => {
    const params = ModulationStore.getSlot(index)?.params ?? {};
    const start = clampWave01(params.loopStart);
    const end = clampWave01(params.loopEnd ?? 1);
    MoveWaveformStore.setView({
      position: clampWave01(params.position),
      loop: end - start > 0.001 && !(start === 0 && end === 1) ? { start, end } : null,
      loopAnchor: null,
    });
    MoveWaveformStore.setProgressSource(() => ModulationStore.getSlotPhase(index));
    MoveWaveformStore.setEditor(true);
    // The small screens follow the big one: zoomed in, the dial face and
    // the Move's screen draw the shown window, framed as the editor frames it.
    setAudioModWindowSource(() =>
      visibleWindow(ModulationStore.getSlotPhase(index), MoveWaveformStore.shownZoom()));
    return () => {
      setAudioModWindowSource(null);
      MoveWaveformStore.setEditor(false);
      MoveWaveformStore.setProgressSource(null);
    };
  }, [index]);

  // The transport buttons, borrowed while the editor is up: Play runs the
  // tape, Loop arms the brackets, Back closes the page (the step that would
  // close it is busy being a loop bar).
  useEffect(() => {
    const toggle = (path: 'playing' | 'loopOn') => () => {
      const slot = ModulationStore.getSlot(index);
      if (slot) ModulationStore.updateSlotParams(index, { [path]: !slot.params[path] });
    };
    const releases = [
      MoveFunctions.push('play', toggle('playing'), { label: 'Play', chip: false }),
      MoveFunctions.push('loop', toggle('loopOn'), { label: 'Loop', chip: false }),
      MoveFunctions.push('back', () => ModulationStore.closeSettings(), { label: 'Close', chip: false }),
    ];
    return () => releases.forEach((release) => release());
  }, [index]);

  // The surface while the editor is up: the pad row is eight subdivisions of
  // the shown window. (The step circles are the card's own business — it
  // lights the loop bar in its accent, the slot's colour here.) Whatever the
  // app had on the pads comes back on close.
  useEffect(() => {
    const prev = MoveSurfaceStore.getState();
    MoveSurfaceStore.setPadRows(1,
      Array.from({ length: MOVE_WAVEFORM_PADS }, (_, x) => ({
        x, y: 0 as const, label: `${x + 1}`, color: modColor(index),
      })),
      'tap to jump the playhead · hold to loop that part'
    );
    const offPress = MoveSurfaceStore.onPress(({ x, y }) => {
      if (y === 0) MoveWaveformStore.pressPad(x);
    });
    return () => {
      offPress();
      MoveSurfaceStore.setPadRows(prev.rows, prev.pads, prev.padsLabel);
    };
  }, [index]);

  return (
    <MoveWaveform
      variant="dock"
      theme={theme}
      buffer={getAudioModBuffer()}
      getProgress={() => ModulationStore.getSlotPhase(index)}
      onSeek={(p) => ModulationStore.updateSlotParams(index, { position: p })}
      onLoopChange={(loop) =>
        ModulationStore.updateSlotParams(index, loop
          ? { loopStart: loop.start, loopEnd: loop.end, loopOn: true }
          : { loopStart: 0, loopEnd: 1 })}
      // The editor's card, sized to the mockup: the sample dark on the
      // light display, filling it edge to edge (the frame is all border,
      // outside the display), lightly smoothed, no centre line — the
      // slot's colour stays on the playhead and the loop band, so the slot
      // still signs its editor.
      mode="smooth"
      smoothPoints={200}
      baseline={false}
      height={MOVE_WAVE_DISPLAY_HEIGHT}
      waveColor="#1e1e1e"
      playheadColor={modColor(index)}
      accent={modColor(index)}
    />
  );
}

/** The editor card's display: 728×128, with the 12px border outside it. */
const MOVE_WAVE_DISPLAY_HEIGHT = 128;

/**
 * The Waveform room page's display: the sample on the surface — the app's
 * own, the audio modulator's, or a stand-in drum loop when there is none —
 * floating above the panel in the editor's card, so the look is set on the
 * thing it dresses. It runs on a clock of its own, so the playhead sweeps
 * and the wave reads at tempo; the wheel still zooms it.
 */
function MoveRoomWave({ theme }: { theme: TweakTheme }) {
  useSyncExternalStore(
    useCallback((cb) => subscribeAudioMod(cb), []),
    () => getAudioModVersion(),
    () => 0
  );
  const buffer = MoveWaveformStore.getBuffer() ?? getAudioModBuffer() ?? moveWaveformDemoSample();
  roomClock.duration = buffer.duration || 1;

  // The preview's tape: one integrator, run per frame, so reading the
  // position from two places can never advance it twice. Loop On wraps
  // inside the loop brackets (or the whole sample); off, the tape runs to
  // the end and rests there, the way the audio modulator does.
  useEffect(() => {
    let last: number | null = null;
    let raf = requestAnimationFrame(function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!roomClock.playing) { last = null; return; }
      if (last != null) roomClock.advance((now - last) / 1000, MoveWaveformStore.getView().loop);
      last = now;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // The header clock reads this playhead while the page is up; the
  // hardware's Play and Loop run it — pushed after the room's suspension,
  // so they are the room's own and stay lit.
  useEffect(() => {
    MoveWaveformStore.setProgressSource(() => roomClock.pos);
    const releases = [
      MoveFunctions.push('play', () => roomClock.toggle('playing'), { label: 'Play', chip: false }),
      MoveFunctions.push('loop', () => roomClock.toggle('loopOn'), { label: 'Loop', chip: false }),
    ];
    return () => {
      releases.forEach((release) => release());
      MoveWaveformStore.setProgressSource(null);
    };
  }, []);

  return (
    <MoveWaveform
      variant="dock"
      theme={theme}
      buffer={buffer}
      getProgress={() => roomClock.pos}
      onSeek={(p) => roomClock.seek(p)}
      onLoopChange={() => { /* the brackets live in the store's view; the tape reads them per frame */ }}
      height={MOVE_WAVE_DISPLAY_HEIGHT}
      waveColor="#1e1e1e"
    />
  );
}

/**
 * The room preview's transport — a tape with Play and Loop, shared by the
 * floating card and the header pill. Module state: there is one room.
 */
const roomClock = {
  playing: true,
  loopOn: true,
  pos: 0,
  duration: 1,
  version: 0,
  listeners: new Set<() => void>(),
  subscribe(fn: () => void) {
    roomClock.listeners.add(fn);
    return () => { roomClock.listeners.delete(fn); };
  },
  notify() {
    roomClock.version += 1;
    for (const fn of roomClock.listeners) fn();
  },
  toggle(key: 'playing' | 'loopOn') {
    roomClock[key] = !roomClock[key];
    // Play pressed at the end of an unlooped tape starts it over.
    if (key === 'playing' && roomClock.playing && roomClock.pos >= 1) roomClock.pos = 0;
    roomClock.notify();
  },
  seek(p: number) {
    roomClock.pos = Math.min(1, Math.max(0, p));
  },
  advance(dt: number, loop: { start: number; end: number } | null) {
    let pos = roomClock.pos + dt / roomClock.duration;
    if (roomClock.loopOn) {
      const start = loop ? loop.start : 0;
      const end = loop ? loop.end : 1;
      const span = Math.max(0.0001, end - start);
      if (pos >= end) pos = start + ((pos - start) % span);
      else if (pos < start) pos = start;
    } else if (pos >= 1) {
      pos = 1;
    }
    roomClock.pos = pos;
  },
};

/**
 * The editor's zoom readout, in the panel's track corner while the editor
 * floats — a dial dot and the level, reading like a track label.
 */
function MoveAudioZoom() {
  useSyncExternalStore(
    useCallback((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  return (
    <div className="tweakers-move-wave-zoom">
      <span className="tweakers-move-wave-zoom-dot" />
      {/* The factor alone: the dot beside it already says what it reads, and the
          header has better uses for the width than the word "Zoom". */}
      <span className="tweakers-move-wave-zoom-label">
        {parseFloat(MoveWaveformStore.getView().zoom.toFixed(1))}x
      </span>
    </div>
  );
}

/**
 * The clock every host's waveform gets, in the panel's volume corner: the
 * playhead's time, flanked by the host's transport state — play on the left,
 * loop on the right, lit when running — when it runs one. The time is
 * written straight to its span every frame at a fixed width, so the pill
 * never breathes.
 */
function MoveWaveClock() {
  useSyncExternalStore(
    useCallback((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  const transport = MoveWaveformStore.getTransport();
  const clockRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = requestAnimationFrame(function tick() {
      const text = MoveWaveformStore.clock();
      if (clockRef.current && clockRef.current.textContent !== text) clockRef.current.textContent = text;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="tweakers-move-volume tweakers-move-wave-time" data-transport={transport ? true : undefined}>
      {transport && (
        <svg className="tweakers-move-wave-state" data-on={transport.playing || undefined} viewBox="0 0 24 24" aria-hidden="true">
          <path d={ICON_PLAY} fill="currentColor" />
        </svg>
      )}
      <span ref={clockRef} className="tweakers-move-volume-value">{MoveWaveformStore.clock()}</span>
      {transport && (
        <svg className="tweakers-move-wave-state" data-on={transport.loopOn || undefined} viewBox="0 0 24 24" aria-hidden="true">
          {ICON_LOOP.map((d) => (
            <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
      )}
    </div>
  );
}

/**
 * The editor's transport corner, where the volume readout usually sits:
 * the slot's Play and Loop, and its clock.
 */
function MoveAudioTransport({ index }: { index: number }) {
  // The state icons follow the slot's params (Play/Loop button presses).
  useSyncExternalStore(
    useCallback((cb) => ModulationStore.subscribe(cb), []),
    () => ModulationStore.getVersion(),
    () => 0
  );
  const params = ModulationStore.getSlot(index)?.params ?? {};
  return (
    <MoveWaveTransport
      playing={!!params.playing}
      loopOn={!!params.loopOn}
      getSeconds={() => ModulationStore.getSlotPhase(index) * (getAudioModBuffer()?.duration ?? 0)}
      onLoaded={() => ModulationStore.updateSlotParams(index, { position: 0 })}
    />
  );
}

/**
 * The room page's transport corner: the same pill, reading the preview's
 * own clock and the Play / Loop the room wave holds.
 */
function MoveRoomTransport() {
  useSyncExternalStore(
    useCallback((cb) => roomClock.subscribe(cb), []),
    () => roomClock.version,
    () => 0
  );
  return (
    <MoveWaveTransport
      playing={roomClock.playing}
      loopOn={roomClock.loopOn}
      getSeconds={() => roomClock.pos * roomClock.duration}
      onLoaded={() => roomClock.seek(0)}
    />
  );
}

/**
 * The transport pill itself: Load, the running clock, and the transport's
 * state — play on the left, loop on the right, lit when running. The clock
 * is written straight to its span every frame at a fixed width, so the
 * pill never breathes. Whose clock it is — a modulator's, the room's — is
 * the caller's.
 */
function MoveWaveTransport({ playing, loopOn, getSeconds, onLoaded }: {
  playing: boolean;
  loopOn: boolean;
  getSeconds: () => number;
  onLoaded?: () => void;
}) {
  const params = { playing, loopOn };
  const clockRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef(getSeconds);
  secondsRef.current = getSeconds;
  useEffect(() => {
    let raf = requestAnimationFrame(function tick() {
      const t = secondsRef.current();
      const text = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(Math.floor((t % 1) * 100)).padStart(2, '0')}`;
      if (clockRef.current && clockRef.current.textContent !== text) clockRef.current.textContent = text;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Load: pick an audio file, decode it, put it on the shelf. The one place
  // the library touches an AudioContext — a one-shot decode, closed right
  // after; playback stays the host's.
  const fileRef = useRef<HTMLInputElement>(null);
  const loadFile = async (file: File) => {
    const bytes = await file.arrayBuffer();
    const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    try {
      setAudioModBuffer(await ctx.decodeAudioData(bytes));
      onLoaded?.();
    } catch {
      /* not an audio file the browser can read — the shelf keeps what it had */
    } finally {
      void ctx.close();
    }
  };

  return (
    <div className="tweakers-move-actions">
      <button
        type="button"
        className="tweakers-move-wave-load"
        title="Load an audio file"
        onClick={() => fileRef.current?.click()}
      >
        <span className="tweakers-move-wave-load-dot" />
        <span>Load</span>
      </button>
      <div className="tweakers-move-volume tweakers-move-wave-time">
        <svg
          className="tweakers-move-wave-state"
          data-on={params.playing ? true : undefined}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={ICON_PLAY} fill="currentColor" />
        </svg>
        <span ref={clockRef} className="tweakers-move-volume-value">0:00:00</span>
        <svg
          className="tweakers-move-wave-state"
          data-on={params.loopOn ? true : undefined}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {ICON_LOOP.map((d) => (
            <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = '';
          if (file) void loadFile(file);
        }}
      />
    </div>
  );
}

/**
 * The preset navigator's screen, at the slot cluster's left edge and its
 * full height. The rows lead the way in: the cluster slides over first and
 * the screen follows a 120ms stagger behind it (theme.css owns the beats);
 * dismissal runs the same dance backwards. The wheel walks the cursor and
 * every rest is previewed live; a click — or the hardware jog click —
 * confirms and keeps it, Back (or a Menu tap) reverts, and a held Menu
 * plays the pre-navigator sound to compare (the screen dims to say the
 * list is not what's sounding). The confirmed row reads in the enter-pill
 * green while the screen lingers, then it dismisses itself.
 */
function MovePresetScreen({ view, search }: { view: MovePresetView; search: MoveSearchView | null }) {
  const items = MovePresetStore.items(view.panelId);
  const rows = items.length
    ? searchedRows(items.map((i) => ({ value: i.id, label: i.label })), search)
    : [{ value: '', label: 'No presets', muted: true }];
  return (
    <div
      className="tweakers-move-preset-screen"
      data-open={view.phase === 'open' || undefined}
      data-chosen={view.chosen ? true : undefined}
      data-comparing={view.comparing || undefined}
      data-search={search ? true : undefined}
      onWheel={(e) => {
        e.preventDefault();
        // A running search walks its own rows — the panel's wheel handler
        // has it, so this must not step the full list underneath.
        if (!search) MovePresetStore.scroll(e.deltaY > 0 ? 1 : -1);
      }}
    >
      {search
        ? <MoveSearchBar view={search} />
        : items.length > 0 && <MoveSearchDoor onOpen={() => MoveSearchStore.open('presets')} />}
      <ListScreen
        items={rows}
        value={view.chosen ?? view.cursor ?? undefined}
        onSelect={(id) => {
          if (!id) return;
          if (search) MoveSearchStore.close();
          MovePresetStore.choose(id);
        }}
      />
    </div>
  );
}

/** A list's rows narrowed to what the search keeps — or the one muted row
 *  that says nothing matched, so the screen never reads as empty. No search,
 *  the rows as they were. `hay` is what each row is searched by, when that
 *  is more than its label. */
function searchedRows<T extends { value: string; label: string }>(rows: T[], search: MoveSearchView | null, hay?: string[]): (T | { value: string; label: string; muted: true })[] {
  if (!search) return rows;
  const kept = moveSearchFilter(hay ?? rows.map((r) => r.label), search.query);
  return kept.length ? kept.map((i) => rows[i]) : [{ value: '', label: 'No matches', muted: true }];
}

/**
 * The way into a list's search from the computer: a small magnifier in the
 * screen's top-right corner, across from where a back pill sits. The Move's
 * way in is a held Capture; this is the same search, opened by a click.
 */
function MoveSearchDoor({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="tweakers-move-search-door" aria-label="Search the list" title="Search ( / )" onClick={onOpen}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={ICON_SEARCH} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * The search's own line, at the top of the list it narrows: the magnifier
 * and the query as it is typed. The computer keyboard is the only keyboard
 * here — the field takes focus as it opens, Enter takes the row the wheel
 * rests on, the arrows walk it, Escape ends the search. Losing focus does
 * not close it: a click on a row is a take, and it must land on the rows the
 * query kept.
 */
function MoveSearchBar({ view }: { view: MoveSearchView }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="tweakers-move-search" role="search">
      <svg className="tweakers-move-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={ICON_SEARCH} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <input
        ref={inputRef}
        className="tweakers-move-search-input"
        type="text"
        value={view.query}
        placeholder="Search"
        aria-label="Search the list"
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => searchType(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') searchTake(view);
          else if (e.key === 'Escape') MoveSearchStore.close();
          else if (e.key === 'ArrowDown') searchStep(view, 1);
          else if (e.key === 'ArrowUp') searchStep(view, -1);
          else return;
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
}

/**
 * The save-a-preset input, floating centred above the panel like the curve
 * composer does. Enter keeps the name, Escape — or clicking away — lets it
 * go. The suggested "Preset N" arrives selected, so typing replaces it.
 */
function MovePresetSaveInput({ suggested }: { suggested: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.select(); }, []);
  return (
    <div className="tweakers-move-preset-save">
      <input
        ref={inputRef}
        className="tweakers-move-preset-save-input"
        defaultValue={suggested}
        autoFocus
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === 'Enter') MovePresetStore.commitSave(e.currentTarget.value);
          else if (e.key === 'Escape') MovePresetStore.cancelSave();
        }}
        onBlur={() => MovePresetStore.cancelSave()}
      />
    </div>
  );
}

/** The scope's rolling window, in samples — a couple of seconds at 60fps. */
const SCOPE_SAMPLES = 120;

/**
 * The preview pad's oscilloscope: the slot's real signal, sampled off the
 * engine every frame into a rolling window and written straight to the
 * path attribute — the panel never re-renders for it, the same discipline
 * as the modulation circles' breathing dots.
 */
function MoveScope({ index }: { index: number }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const now = (ModulationStore.getSignal(index) + 1) / 2;
    const pts: number[] = Array(SCOPE_SAMPLES).fill(now);
    let raf = requestAnimationFrame(function tick() {
      pts.push((ModulationStore.getSignal(index) + 1) / 2);
      pts.shift();
      ref.current?.setAttribute('d', moveShapePath(pts));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);
  return (
    <svg
      className="tweakers-move-scope-wave"
      data-scope="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={ref} />
    </svg>
  );
}

/**
 * The audio dial's face: the settings preview — the sample's envelope — as
 * a standing wave, with the slot's playhead running through it. Over the
 * whole sample the shape draws once per render and only the playhead line
 * ticks. While the floating editor is zoomed in, the face shows the part
 * the editor shows — a window that rides with the playhead — so the shape
 * is rewritten on the same tick, with the scope's no-re-render discipline.
 */
function MoveWavePreview({ index }: { index: number }) {
  const path = useRef<SVGPathElement>(null);
  const line = useRef<SVGLineElement>(null);
  const preview = ModulationStore.getSettingsPreview(64);
  useEffect(() => {
    let shown = '';
    let raf = requestAnimationFrame(function tick() {
      const { start, span } = getAudioModWindow();
      const key = `${start.toFixed(5)}|${span.toFixed(5)}`;
      if (key !== shown) {
        shown = key;
        const p = ModulationStore.getSettingsPreview(64);
        if (p) path.current?.setAttribute('d', moveShapePath(p.points));
      }
      const at = (ModulationStore.getSlotPhase(index) - start) / span;
      const x = (Math.min(1, Math.max(0, at)) * 100).toFixed(2);
      line.current?.setAttribute('x1', x);
      line.current?.setAttribute('x2', x);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);
  if (!preview) return null;
  return (
    <svg
      className="tweakers-move-scope-wave"
      data-scope="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={path} d={moveShapePath(preview.points)} />
      <line ref={line} x1="0" y1="0" x2="0" y2="100" />
    </svg>
  );
}

/**
 * One modulation circle (spec: a 24px ring holding a 12px dot in the slot's
 * palette colour). The dot breathes with the slot's live signal — the same
 * motion the hardware step light shows — written straight to style per
 * frame so the panel never re-renders for it. The circle is the on-screen
 * step button, with the hardware step's gestures: a tap with a control
 * armed (just touched) wires it on or off; a tap with nothing armed opens
 * the modulator's settings page (tap again to close); a hold opens it too.
 * A LONG press deletes the modulator — slot, wires, and its settings page
 * when it was the open one — and never also fires the tap.
 */
/** An app's steps as runs: neighbours sharing a `group` go together, a step without one stands alone. */
function stepRuns(cells: MoveStepCell[]): MoveStepCell[][] {
  const runs: MoveStepCell[][] = [];
  for (const cell of cells) {
    const last = runs[runs.length - 1];
    if (last && cell.group !== undefined && last[0].group === cell.group && last[last.length - 1].step === cell.step - 1) last.push(cell);
    else runs.push([cell]);
  }
  return runs;
}

function MoveModCircle({ slot }: { slot: ModulationSlot }) {
  const dotRef = useRef<HTMLSpanElement>(null);
  const pressAt = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    return ModulationStore.subscribeFrames(() => {
      const el = dotRef.current;
      if (!el) return;
      const level = (ModulationStore.getSignal(slot.index) + 1) / 2;
      el.style.transform = `scale(${(0.66 + 0.34 * level).toFixed(3)})`;
    });
  }, [slot.index]);

  return (
    <button
      type="button"
      className="tweakers-move-mod"
      title={`${slot.type.toUpperCase()} · step ${slot.index + 1}`}
      onPointerDown={() => {
        pressAt.current = Date.now();
      }}
      onPointerUp={() => {
        const held = Date.now() - pressAt.current;
        if (held >= LONG_PRESS_MS) {
          ModulationStore.removeSlot(slot.index);
          return;
        }
        const tapped = held < TAP_MS;
        if (tapped && ModulationStore.assignFromStep(slot.index).action !== 'none') return;
        const open = ModulationStore.getSettings();
        if (tapped && open && open.index === slot.index) ModulationStore.closeSettings();
        else ModulationStore.openSettings(slot.index);
      }}
    >
      <span
        ref={dotRef}
        className="tweakers-move-mod-dot"
        style={{ background: modColor(slot.index) }}
      />
    </button>
  );
}
