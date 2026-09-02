import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TweakStore, PanelConfig, ControlMeta } from '../store/TweakStore';
import { isDevDefault } from '../env';
import type { TweakTheme } from './TweakRoot';
import { buildMovePages, normalizeDial, denormalizeDial, MOVE_TRACKS, MOVE_DIALS } from '../move-layout';

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

/**
 * The Move's control surface docked to the bottom edge, laid out to Cri's
 * Figma spec (file USU9CW2vC3SrvKsnHVnYGi, node 802:319; slot components
 * 802:756 and 800:1737): a track row of four coloured markers, 8 dial
 * slots hosting slider ports, and the 4×8 pad grid hosting toggle chips.
 * Slot contents follow the bridge kit's mapping (move-layout), so screen
 * and hardware always agree. Pad rows past the last filled one collapse.
 */
export function MovePanel({ theme = 'system', productionEnabled = isDevDefault, panels: only }: MovePanelProps) {
  if (!productionEnabled) return null;
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [track, setTrack] = useState(0);
  const [dragPath, setDragPath] = useState<string | null>(null);
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
  const page = pages[Math.min(track, Math.max(0, pages.length - 1))];
  const pageId = page?.panel.id;

  // Subscribe to the active page's value changes (per-panel channel only).
  const values = useSyncExternalStore(
    useCallback((cb) => (pageId ? TweakStore.subscribe(pageId, cb) : () => {}), [pageId]),
    () => (pageId ? TweakStore.getValues(pageId) : undefined),
    () => undefined
  );

  if (!mounted || typeof window === 'undefined' || pages.length === 0 || !page || !values) return null;

  const slots = <T,>(items: T[], count: number) =>
    Array.from({ length: count }, (_, i) => items[i]);

  // The readout is the dial's position, 0–100 — the same normalized number
  // the Move itself works in.
  const dialPercent = (meta: ControlMeta) =>
    Math.round(normalizeDial(meta, values[meta.path]) * 100);

  // Whole-slot hotspot, position-on-the-track sets the value — the same feel
  // as the library Slider's card.
  const dialFromPointer = (e: React.PointerEvent<HTMLElement>, meta: ControlMeta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const v01 = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeDial(meta, v01));
  };

  // Pads laid into the grid row by row (the kit fills 8 today — row one).
  const padRows = Array.from({ length: PAD_ROWS }, (_, row) =>
    page.pads.slice(row * PAD_COLS, (row + 1) * PAD_COLS)
  );

  const content = (
    <div className="tweakers-root tweakers-move-root" data-theme={theme}>
      <div className="tweakers-move">
        <div className="tweakers-move-inner">
          <div className="tweakers-move-tracks">
            {slots(pages, MOVE_TRACKS).map((pg, i) => (
              <button
                key={pg ? pg.panel.id : `empty-${i}`}
                className="tweakers-move-track"
                data-active={pg ? pg === page : undefined}
                data-empty={pg ? undefined : true}
                disabled={!pg}
                onClick={() => setTrack(i)}
              >
                <span className="tweakers-move-track-marker" style={{ background: MOVE_TRACK_COLORS[i] }} />
                {pg && <span className="tweakers-move-track-label">{pg.panel.name}</span>}
              </button>
            ))}
          </div>

          <div className="tweakers-move-grid">
            <div className="tweakers-move-dials">
              {slots(page.dials, MOVE_DIALS).map((meta, i) =>
                meta ? (
                  <div
                    key={meta.path}
                    className="tweakers-move-dial"
                    data-active={dragPath === meta.path || undefined}
                    onPointerDown={(e) => {
                      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
                      setDragPath(meta.path);
                      dialFromPointer(e, meta);
                    }}
                    onPointerMove={(e) => {
                      if (dragPath === meta.path) dialFromPointer(e, meta);
                    }}
                    onPointerUp={() => setDragPath(null)}
                    onPointerCancel={() => setDragPath(null)}
                  >
                    <div className="tweakers-move-dial-readout">
                      <span className="tweakers-move-dial-label" data-long={meta.label.length > 9 || undefined}>
                        {meta.label}
                      </span>
                      <span className="tweakers-move-dial-value">{dialPercent(meta)}%</span>
                    </div>
                    <div className="tweakers-move-dial-bar">
                      <div className="tweakers-move-dial-fill" style={{ width: `${dialPercent(meta)}%` }} />
                    </div>
                  </div>
                ) : (
                  <div key={`empty-${i}`} className="tweakers-move-dial" data-empty="true" />
                )
              )}
            </div>

            {/* Trailing empty pad rows collapse: a row shows only if it, or any
                row after it, has something in it — so gaps inside the grid hold
                their place, but the panel never ends on dead rows. */}
            {Array.from({ length: PAD_ROWS }, (_, row) => row)
              .filter((row) => padRows.slice(row).some((r) => r.length > 0))
              .map((row) => (
                <div key={row} className="tweakers-move-pads">
                  {Array.from({ length: PAD_COLS }, (_, col) => {
                    const meta = padRows[row][col];
                    return meta ? (
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
                    ) : (
                      <div key={`empty-${col}`} className="tweakers-move-pad" data-empty="true" />
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
