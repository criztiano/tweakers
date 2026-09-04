import { useEffect, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TweakStore, PanelConfig, ControlMeta } from '../store/TweakStore';
import { ModulationStore } from '../store/ModulationStore';
import { modColor, curveComposition, type ModulationSlot } from '../modulation-core';
import { CurveComposer } from './CurveComposer';
import type { CurveSegment } from '../curve-composer-core';
import { isDevDefault } from '../env';
import type { TweakTheme } from './TweakRoot';
import { buildMovePages, buildModMovePage, normalizeDial, denormalizeDial, normalizeRangeDial, denormalizeRangeDial, dialOrigin, isEnumDial, enumOptionValue, enumOptionLabel, enumIndex, MOVE_TRACKS, MOVE_DIALS } from '../move-layout';
import { MOD_SETTINGS_PANEL } from '../modulation-core';
import { resolveAxis, valueFromPoint, pointFromValue, normalizeValue, centerValue, applyDetentAxis, type XYValue } from '../xy-pad-core';

interface MovePanelProps {
  theme?: TweakTheme;
  productionEnabled?: boolean;
  /** Mirror only the named panels, in the order given — same option the bridge kit takes. */
  panels?: string | string[];
}

/** The Move's four track colours, in track order (Figma node 802:321). */
export const MOVE_TRACK_COLORS = ['#4274f4', '#d83dff', '#ff4d07', '#52bd06'];

/** The on-screen pad grid is the full Move grid: 4 rows of 8 (Figma 802:319). */
const PAD_ROWS = 4;
const PAD_COLS = 8;

/** The slider track's inset from the dial slot's edges (Figma 802:767). */
const DIAL_TRACK_INSET = 10;

/** The xy field's inset within its slot — must match .tweakers-move-xy. */
const XY_INSET = { left: 8, top: 8, right: 9, bottom: 8 };

/** Default grid when an xy control leaves `grid` on — the XYPad's 5×5. */
const XY_GRID_DEFAULT = 5;

/** Press shorter than this is a tap (latch); longer is a hold (peek). */
const TAP_MS = 300;

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

/**
 * The Move's control surface docked to the bottom edge, laid out to Cri's
 * Figma spec (file USU9CW2vC3SrvKsnHVnYGi, node 802:319; slot components
 * 802:756 and 800:1737): a track row of four coloured markers, 8 dial
 * slots hosting slider ports, and the pad grid — toggle chips on the
 * first row, value chips on the second, at the same columns as their
 * hardware pads (move-layout keeps both surfaces in agreement).
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
 * A range control keeps the slider look but its fill is the span between
 * the two ends — dragging moves the nearer end, and on the hardware the
 * column's knob moves the low end while the volume knob moves the high
 * end while that knob is touched. Bipolar/origin sliders anchor their
 * fill at the origin and read as a signed offset.
 */
export function MovePanel({ theme = 'system', productionEnabled = isDevDefault, panels: only }: MovePanelProps) {
  if (!productionEnabled) return null;
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [track, setTrack] = useState(0);
  const [dragPath, setDragPath] = useState<string | null>(null);
  // Hardware presence, by control path — from the bridge kit's window events.
  const [handTouch, setHandTouch] = useState<Record<string, boolean>>({});
  const [hwHeld, setHwHeld] = useState<Record<string, boolean>>({});
  const [hwLatched, setHwLatched] = useState<Record<string, boolean>>({});
  // Screen-side value-chip substitution: a held chip peeks, a tapped chip latches.
  const [held, setHeld] = useState<{ col: number; meta: ControlMeta } | null>(null);
  const [latched, setLatched] = useState<Record<number, ControlMeta | undefined>>({});
  const holdStart = useRef(0);
  const [mounted, setMounted] = useState(false);

  const onlyKey = Array.isArray(only) ? only.join(' ') : only;
  const read = useCallback(
    () => TweakStore.selectPanels(onlyKey === undefined ? undefined : onlyKey.split(' ')),
    [onlyKey]
  );

  useEffect(() => {
    setMounted(true);
    setPanels(read());
    return TweakStore.subscribeGlobal(() => setPanels(read()));
  }, [read]);

  const pages = buildMovePages(panels);
  // An open modulator-settings page takes the surface over; the track
  // buttons put a regular page back (and close the settings with it).
  const modSettings = ModulationStore.getSettings();
  const settingsPanel = modSettings ? TweakStore.getPanel(modSettings.panelId) : undefined;
  const modLayout = settingsPanel ? ModulationStore.getSettingsLayout() : null;
  const page = settingsPanel
    ? buildModMovePage(settingsPanel, modLayout)
    : pages[Math.min(track, Math.max(0, pages.length - 1))];
  const pageId = page?.panel.id;

  // A curve modulator's page brings its composition with it: the composer
  // floats above the panel, and its selected clip is what the shape dials
  // are editing — the dial that draws the preview shows that same clip.
  const modSlot = modSettings ? ModulationStore.getSlot(modSettings.index) : null;
  const composition = modSlot?.type === 'curve' ? curveComposition(modSlot.params) : null;
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

  // Modulation structure (slots, assignments) — the circles and the dots.
  useSyncExternalStore(
    useCallback((cb) => ModulationStore.subscribe(cb), []),
    () => ModulationStore.getVersion(),
    () => 0
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
  const sawSettings = useRef(false);
  useEffect(() => {
    const onPage = (e: Event) => {
      const id = (e as CustomEvent).detail?.pageId;
      if (id === MOD_SETTINGS_PANEL) {
        sawSettings.current = true;
        return;
      }
      if (sawSettings.current) {
        sawSettings.current = false;
        ModulationStore.closeSettings();
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

  if (!mounted || typeof window === 'undefined' || pages.length === 0 || !page || !values) return null;

  const slots = <T,>(items: T[], count: number) =>
    Array.from({ length: count }, (_, i) => items[i]);

  // The readout is the dial's position, 0–100 — the same normalized number
  // the Move itself works in.
  const dialPercent = (meta: ControlMeta) =>
    Math.round(normalizeDial(meta, values[meta.path]) * 100);

  // The value chip shows the real value: number in bold, unit trailing —
  // or, for a chip that picks between options, the option it is on.
  const chipValue = (meta: ControlMeta): { num: string; unit?: string } => {
    if (isEnumDial(meta)) {
      const options = meta.options ?? [];
      return { num: String(enumOptionLabel(options[enumIndex(meta, values[meta.path])] as never)) };
    }
    const n = Number(values[meta.path]);
    if (!Number.isFinite(n)) return { num: '' };
    if (meta.formatValue) return { num: meta.formatValue(n) };
    const num = Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString();
    return { num, unit: meta.unit };
  };

  // Whole-slot hotspot, position-on-the-track sets the value — the same feel
  // as the library Slider's card.
  const dialFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const v01 = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeDial(meta, v01));
  };

  // A range slot moves whichever end sits nearer to the pointer; the
  // denormalizer keeps the pair ordered when a drag crosses over.
  const rangeFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const t = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    const r = normalizeRangeDial(meta, values[meta.path]);
    const nearLo = Math.abs(t - r.lo) <= Math.abs(t - r.hi);
    TweakStore.updateValue(
      page.panel.id,
      meta.path,
      denormalizeRangeDial(meta, nearLo ? t : r.lo, nearLo ? r.hi : t)
    );
  };

  // An xy slot maps the pointer through the same core as the library XYPad:
  // value mapping, snap-to-grid, and the escapable centre detent all included.
  const xyFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width - XY_INSET.left - XY_INSET.right;
    const h = rect.height - XY_INSET.top - XY_INSET.bottom;
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left - XY_INSET.left) / (w || 1)));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top - XY_INSET.top) / (h || 1)));
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    const raw = valueFromPoint({ x: px, y: py }, xa, ya, !!meta.snap);
    const origin = pointFromValue(centerValue(xa, ya), xa, ya);
    TweakStore.updateValue(page.panel.id, meta.path, {
      x: applyDetentAxis(raw.x, xa, Math.abs(px - origin.x) * (w || 1)),
      y: applyDetentAxis(raw.y, ya, Math.abs(py - origin.y) * (h || 1)),
    });
  };

  // Joystick-style pads rest at their centre when the pointer lets go.
  const xyRelease = (meta: ControlMeta) => {
    setDragPath(null);
    if (!meta.returnToCenter) return;
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    TweakStore.updateValue(page.panel.id, meta.path, normalizeValue(centerValue(xa, ya), xa, ya, !!meta.snap));
  };

  const chipLatched = (col: number, meta: ControlMeta) =>
    latched[col]?.path === meta.path || !!hwLatched[meta.path];

  // A wired control wears its slot's palette colour as a dot.
  const modColorFor = (path: string): string | null => {
    const a = ModulationStore.getAssignment(page.panel.id, path);
    return a && ModulationStore.getSlot(a.slot) ? modColor(a.slot) : null;
  };

  // Touching a control arms it for the assignment gesture (step press).
  const armMod = (path: string) => ModulationStore.noteTouch(page.panel.id, path);

  // The dot itself: absolute in a dial slot, inline on a pad chip.
  const ModDot = ({ path, pad }: { path: string; pad?: boolean }) => {
    const c = modColorFor(path);
    if (!c) return null;
    return <span className={pad ? 'tweakers-move-pad-mod' : 'tweakers-move-dial-mod'} style={{ background: c }} />;
  };

  // What a dial column actually edits: a held chip wins (screen or pad),
  // then a latched one, then the column's own dial.
  const dialAt = (col: number): ControlMeta | undefined => {
    if (held && held.col === col) return held.meta;
    const hw = page.values[col];
    if (hw && hwHeld[hw.path]) return hw;
    if (latched[col]) return latched[col];
    if (hw && hwLatched[hw.path]) return hw;
    return page.dials[col];
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

  const padRows: (ControlMeta[])[] = [page.toggles, page.values, [], []];

  const content = (
    <div className="tweakers-root tweakers-move-root" data-theme={theme}>
      {/* While a composer floats above it the whole instrument comes forward,
          over the app's own panels — you are working in it. */}
      <div className="tweakers-move" data-overlay={composition ? true : undefined}>
        {composition && modSettings && (
          <MoveCurveComposer
            index={modSettings.index}
            segments={composition.segments}
            direction={composition.direction}
            gap={composition.gap ?? 0}
            selected={clipIndex}
          />
        )}
        <div className="tweakers-move-inner">
          <div className="tweakers-move-tracks">
            <div className="tweakers-move-tracks-group">
              {slots(pages, MOVE_TRACKS).map((pg, i) => (
                <button
                  key={pg ? pg.panel.id : `empty-${i}`}
                  className="tweakers-move-track"
                  data-active={pg ? pg === page : undefined}
                  data-empty={pg ? undefined : true}
                  disabled={!pg}
                  onClick={() => {
                    ModulationStore.closeSettings();
                    setTrack(i);
                    // Tell the hardware side; the kit relays it when the bridge is up.
                    if (pg) window.dispatchEvent(new CustomEvent(MOVE_PAGE_SELECT_EVENT, { detail: { pageId: pg.panel.id } }));
                  }}
                >
                  <span className="tweakers-move-track-marker" style={{ background: MOVE_TRACK_COLORS[i] }} />
                  {pg && <span className="tweakers-move-track-label">{pg.panel.name}</span>}
                </button>
              ))}
            </div>
            {/* The modulations, centred between the track labels and the
                (future) volume readout — one circle per occupied slot. */}
            <div className="tweakers-move-mods">
              {ModulationStore.getSlots().map((slot) => (
                <MoveModCircle key={slot.index} slot={slot} />
              ))}
            </div>
            <span className="tweakers-move-tracks-spacer" />
          </div>

          <div className="tweakers-move-grid">
            <div className="tweakers-move-dials">
              {Array.from({ length: MOVE_DIALS }, (_, i) => {
                const meta = dialAt(i);
                if (!meta) return <div key={`empty-${i}`} className="tweakers-move-dial" data-empty="true" />;
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
                const valueFirst = !!settingsPanel && !(meta.min === 0 && meta.max === 1);
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
                  const gridBase = meta.grid === false ? 0 : typeof meta.grid === 'number' ? meta.grid : XY_GRID_DEFAULT;
                  const gridN = gridBase > 0 ? Math.round(gridBase * Math.max(0, meta.density ?? 1)) : 0;
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="xy"
                      data-preview={preview ? true : undefined}
                      data-sub={valueFirst || undefined}
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        setDragPath(meta.path);
                        armMod(meta.path);
                        xyFromPointer(e, meta);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) xyFromPointer(e, meta);
                      }}
                      onPointerUp={() => xyRelease(meta)}
                      onPointerCancel={() => xyRelease(meta)}
                    >
                      {valueFirst && <span className="tweakers-move-dial-sub">{meta.label}</span>}
                      <ModDot path={meta.path} />
                      <div className="tweakers-move-xy">
                        {preview ? (
                          <svg
                            className="tweakers-move-xy-curve"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <path d={previewPathData(preview.points)} />
                          </svg>
                        ) : (
                          <>
                            {gridN > 0 && (
                              <span
                                className="tweakers-move-xy-grid"
                                style={{
                                  '--tweak-xy-grid-step-x': `${100 / gridN}%`,
                                  '--tweak-xy-grid-step-y': `${100 / gridN}%`,
                                } as React.CSSProperties}
                              />
                            )}
                            <span className="tweakers-move-xy-line" data-axis="x" style={{ top: `${pos.y * 100}%` }} />
                            <span className="tweakers-move-xy-line" data-axis="y" style={{ left: `${pos.x * 100}%` }} />
                            <span className="tweakers-move-xy-dot" style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }} />
                          </>
                        )}
                      </div>
                      <div className="tweakers-move-dial-readout">
                        <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                          {meta.label}
                        </span>
                        <span className="tweakers-move-dial-value">
                          {preview
                            ? preview.label
                            : `${Math.round(pos.x * 100)}·${Math.round((1 - pos.y) * 100)}`}
                        </span>
                      </div>
                    </div>
                  );
                }
                // An enum (select) keeps the slider look: the value line shows
                // the current option, the fill steps at index/(count-1), and
                // pointer position picks the nearest option — matching the
                // hardware, where the knob steps through the options.
                if (isEnumDial(meta)) {
                  const options = meta.options ?? [];
                  const idx = enumIndex(meta, values[meta.path]);
                  const fill = options.length > 1 ? idx / (options.length - 1) : 0;
                  const pick = (e: React.PointerEvent<HTMLElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const span = rect.width - DIAL_TRACK_INSET * 2;
                    const t = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
                    const next = Math.round(t * (options.length - 1));
                    if (next !== idx) TweakStore.updateValue(page.panel.id, meta.path, enumOptionValue(options[next] as never));
                  };
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="enum"
                      data-sub={valueFirst || undefined}
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        setDragPath(meta.path);
                        armMod(meta.path);
                        pick(e);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) pick(e);
                      }}
                      onPointerUp={() => setDragPath(null)}
                      onPointerCancel={() => setDragPath(null)}
                    >
                      {valueFirst && <span className="tweakers-move-dial-sub">{meta.label}</span>}
                      <ModDot path={meta.path} />
                      <div className="tweakers-move-dial-readout">
                        <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                          {meta.label}
                        </span>
                        <span className="tweakers-move-dial-value">
                          {enumOptionLabel(options[idx] as never)}
                        </span>
                      </div>
                      <div className="tweakers-move-dial-bar">
                        <div className="tweakers-move-dial-fill" style={{ width: `${fill * 100}%` }} />
                      </div>
                    </div>
                  );
                }
                // A range control keeps the slider look but the fill is the
                // span between its two ends; drag moves the nearer end.
                if (meta.type === 'range') {
                  const r = normalizeRangeDial(meta, values[meta.path]);
                  return (
                    <div
                      key={meta.path}
                      className="tweakers-move-dial"
                      data-kind="range"
                      data-active={active || undefined}
                      onPointerDown={(e) => {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                        setDragPath(meta.path);
                        armMod(meta.path);
                        rangeFromPointer(e, meta);
                      }}
                      onPointerMove={(e) => {
                        if (dragPath === meta.path) rangeFromPointer(e, meta);
                      }}
                      onPointerUp={() => setDragPath(null)}
                      onPointerCancel={() => setDragPath(null)}
                    >
                      <ModDot path={meta.path} />
                      <div className="tweakers-move-dial-readout">
                        <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                          {meta.label}
                        </span>
                        <span className="tweakers-move-dial-value">
                          {Math.round(r.lo * 100)}–{Math.round(r.hi * 100)}%
                        </span>
                      </div>
                      <div className="tweakers-move-dial-bar">
                        <div
                          className="tweakers-move-dial-fill"
                          style={{ marginLeft: `${r.lo * 100}%`, width: `${(r.hi - r.lo) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                }
                // The slot pulses with its chip while a latched value sits in it.
                const latchedHere =
                  latched[i]?.path === meta.path || (page.values[i]?.path === meta.path && !!hwLatched[meta.path]);
                // A bipolar/origin slider anchors its fill at the origin and
                // reads as a signed offset instead of 0–100.
                const o01 = dialOrigin(meta);
                const v01 = normalizeDial(meta, values[meta.path]);
                const signed = Math.round((v01 - o01) * 100);
                // A substituted chip (held or latched into the slot) reads as
                // its real value — the same number its chip shows below — and
                // a small tag names what the slot is controlling.
                const subbed = meta !== page.dials[i];
                const subValue = subbed || valueFirst ? chipValue(meta) : null;
                return (
                  <div
                    key={meta.path}
                    className="tweakers-move-dial"
                    data-active={active || undefined}
                    data-latched={latchedHere || undefined}
                    data-sub={subbed || valueFirst || undefined}
                    onPointerDown={(e) => {
                      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                      setDragPath(meta.path);
                      armMod(meta.path);
                      dialFromPointer(e, meta);
                    }}
                    onPointerMove={(e) => {
                      if (dragPath === meta.path) dialFromPointer(e, meta);
                    }}
                    onPointerUp={() => setDragPath(null)}
                    onPointerCancel={() => setDragPath(null)}
                  >
                    {(subbed || valueFirst) && <span className="tweakers-move-dial-sub">{meta.label}</span>}
                    <ModDot path={meta.path} />
                    <div className="tweakers-move-dial-readout">
                      <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                        {meta.label}
                      </span>
                      <span className="tweakers-move-dial-value">
                        {subValue
                          ? `${subValue.num}${subValue.unit ? ` ${subValue.unit}` : ''}`
                          : o01 > 0 ? `${signed > 0 ? '+' : ''}${signed}%` : `${dialPercent(meta)}%`}
                      </span>
                    </div>
                    <div className="tweakers-move-dial-bar">
                      <div
                        className="tweakers-move-dial-fill"
                        style={o01 > 0
                          ? { marginLeft: `${Math.min(v01, o01) * 100}%`, width: `${Math.abs(v01 - o01) * 100}%` }
                          : { width: `${dialPercent(meta)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trailing empty pad rows collapse: a row shows only if it, or any
                row after it, has something in it — so gaps inside the grid hold
                their place, but the panel never ends on dead rows. A claimed
                row always counts, even before the app has painted it. */}
            {Array.from({ length: PAD_ROWS }, (_, row) => row)
              .filter((row) => padRows.slice(row).some((r) => r.length > 0))
              .map((row) => (
                <div key={row} className="tweakers-move-pads">
                  {Array.from({ length: PAD_COLS }, (_, col) => {
                    const meta = padRows[row][col];
                    if (!meta) return <div key={`empty-${col}`} className="tweakers-move-pad" data-empty="true" />;
                    if (padRows[row] === page.toggles) {
                      return (
                        <button
                          key={meta.path}
                          className="tweakers-move-pad"
                          data-kind="toggle"
                          data-on={!!values[meta.path]}
                          onClick={() => TweakStore.updateValue(page.panel.id, meta.path, !values[meta.path])}
                        >
                          <span className="tweakers-move-pad-indicator" />
                          <span className="tweakers-move-pad-title">{meta.label}</span>
                        </button>
                      );
                    }
                    const value = chipValue(meta);
                    return (
                      <button
                        key={meta.path}
                        className="tweakers-move-pad"
                        data-kind="value"
                        data-held={(held !== null && held.meta.path === meta.path) || hwHeld[meta.path] || undefined}
                        data-latched={chipLatched(col, meta) || undefined}
                        onPointerDown={(e) => pressChip(e, col, meta)}
                        onPointerUp={() => releaseChip(col, meta)}
                        onPointerCancel={() => setHeld(null)}
                      >
                        <ModDot path={meta.path} pad />
                        <span className="tweakers-move-pad-title">{meta.label}</span>
                        <span className="tweakers-move-pad-reading">
                          <span className="tweakers-move-pad-number">{value.num}</span>
                          {value.unit && <span>{value.unit}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

/** A preview's samples as an SVG path across a 100×100 box, y pointing up. */
function previewPathData(points: number[]): string {
  if (points.length < 2) return '';
  return points
    .map((v, i) =>
      `${i ? 'L' : 'M'} ${((i / (points.length - 1)) * 100).toFixed(2)} ${((1 - v) * 100).toFixed(2)}`)
    .join(' ');
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

/**
 * One modulation circle (spec: a 24px ring holding a 12px dot in the slot's
 * palette colour). The dot breathes with the slot's live signal — the same
 * motion the hardware step light shows — written straight to style per
 * frame so the panel never re-renders for it. The circle is the on-screen
 * step button, with the hardware step's gestures: a tap with a control
 * armed (just touched) wires it on or off; a tap with nothing armed opens
 * the modulator's settings page (tap again to close); a hold opens it too.
 */
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
        const tapped = Date.now() - pressAt.current < TAP_MS;
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
