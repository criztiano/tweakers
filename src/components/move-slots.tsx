import type { MovePadListView } from '../move-pad-list';
import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { moveBandCuts, moveNumericDrawing, movePlaybackMode, moveVectorStage, MOVE_BAND_H, MOVE_BAND_W, MOVE_STAGE, type MovePlaybackMode, type MoveTone } from '../move-visual-core';
import { MoveSlotNumericBody, MoveSlotOffsetBody, MoveSlotPlaybackDrawing } from './move-visuals';
export { MoveSlotNumericBody, MoveSlotOffsetBody, MoveSlotPlaybackDrawing } from './move-visuals';
import type { ControlMeta } from '../store/TweakStore';
import { ICON_BADGE_OFF, ICON_BADGE_ON, LUCIDE_ICONS } from '../icons';
import { enumOptionIcon, enumOptionLabel, enumOptionValue } from '../move-layout';
import { arcPath } from '../angle-core';
import { resolveFilterAxis, type FilterValue } from '../filter-core';
import { ListScreen } from './ListScreen';

/**
 * The big-slot library — the dictionary of what a Move dial slot can be.
 *
 * A slot is one column of the Move's dial row (two for the filter). The
 * gestures — pointer capture, fine drag, modulation arming — stay with the
 * surface that holds the slot (the MovePanel, or a MoveSlot on its own), and
 * the drag rules they share live in move-slot-core; what lives here is the
 * slot's face: every body is a pure drawing of computed props, so each case
 * can be read, reused, and tested on its own. `moveSlotKind` names which
 * face a control wears.
 *
 * The cases:
 * - `default` — the basic slot: name centred, value in its place on touch,
 *   fill bar at the bottom (an origin tick when the dial is bipolar).
 * - `value`   — the same slot the other way round: the value is the
 *   headline, the name shrinks to a tag on top. For dials whose value
 *   already says what it is (two seconds, three clips), and for a value
 *   chip substituted into the slot.
 * - `icon`    — an option picker whose current option shows as a glyph:
 *   at arm's length you read a picture, not a word.
 * - `curve`   — an option picker whose current option draws its shape (the
 *   select's `preview` sampler) — the curve-selection slot.
 * - `enum`    — a plain stepped option picker: every option on the Move's
 *   own list screen, which is the whole slot; a touch grows it to the run.
 * - `xy`      — a 2D pad filling the slot; on the hardware the column's
 *   knob turns X and the volume knob turns Y while touched.
 * - `range`   — two handles on one bar; column knob = low end, volume
 *   knob = high end while touched.
 * - `opacity`, `blur`, `pan`, `stereo-width`, `pitch`, `trim` — explicit
 *   numeric meanings, drawn as specimens or positioned against domain
 *   references (`trim`: one edge of a take, the kept part filled).
 * - `offset`  — a thing and the room it has to move in: the room hatched
 *   between two rules, a quiet line where it sits untouched, a pin where the
 *   offset put it, the stretch between them filled, and a chevron beside the
 *   pin for each way it can still go.
 * - `playback` — an explicitly mapped playback icon.
 * - `filter`  — the 2-slot control: cutoff and resonance as one picture,
 *   the magnitude response maximised across both columns, each hand's
 *   small label sitting where its own slot's label would have been.
 * - `trim-span` — the 2-slot take: a trim start dial beside a trim end dial
 *   drawn as one line, the kept part between a flag for each edge, the
 *   names along the top and the values along the bottom at their own sides.
 * - `gate`    — the 3-slot gate: threshold, look-ahead and release side by
 *   side as one instrument. The threshold and release stand as bars at
 *   the outer columns, the look-ahead is a short line under the middle,
 *   and the grid between the bars shows the gate live around the playhead.
 * - `vector`  — the 3-slot place: x, y and a depth z side by side as one
 *   stage. The mark stands on a ruled floor — across it for x, back into it
 *   for z (and smaller for it), up off its own shadow for y — with each
 *   axis's name under its own column.
 * - `multiband` — a multiband cleaner, one slot per dial: the amount as a
 *   bar with its icon, the speed as a graded gauge, and the band columns as
 *   one grid with the bands' curve live over what each band is doing.
 * - `channel` — a mixer, one slot per channel: icon and name on top in the
 *   channel's tone, a fader well under them filled to its level.
 * - `env`     — the 4-slot control: the whole ADSR drawn as one shape on a
 *   single display spanning the four stage columns, one caption and drag
 *   zone per stage, square handles pinned on the joints.
 * - `scope`   — a dial with the oscilloscope in it: the modulator's live
 *   signal fills the slot behind the dial's own readout and bar.
 * - `toggle`  — a switch in a big slot of its own: the pad's language at
 *   slot size, the whole slot inverting when it is on.
 * - `toggle-icon` — the same switch drawn as its own picture: the glyph of
 *   the thing it turns on, with a ban struck across it while it is off. What
 *   the switch does and whether it is doing it become one look.
 * - `metronome` — a switch drawn as a metronome: lit with its arm swinging
 *   to the host's beat while it is on, dim and upright while it is off. The
 *   motion is the state, so it wears no badge.
 *
 * Multi-slot controls (`filter` spans 2 columns, `env` spans 4) follow one
 * pattern: the container takes `grid-column: span N`, the display and its
 * drawing stretch across the whole span, and each hand or stage keeps a
 * small caption where its own single slot's label would have been — so the
 * hardware's one-knob-per-column rule still holds under the shared picture.
 */
export type MoveSlotKind =
  | 'default'
  | 'value'
  | 'icon'
  | 'curve'
  | 'enum'
  | 'xy'
  | 'range'
  | 'filter'
  | 'color'
  | 'transfer'
  | 'ramp'
  | 'balance'
  | 'dial'
  | 'opacity'
  | 'blur'
  | 'pan'
  | 'stereo-width'
  | 'pitch'
  | 'trim'
  | 'offset'
  | 'trim-span'
  | 'gate'
  | 'vector'
  | 'multiband'
  | 'channel'
  | 'playback'
  | 'env'
  | 'scope'
  | 'toggle'
  | 'toggle-icon'
  | 'metronome';

/** Which face a control wears in its slot, from its meta and moment. */
export function moveSlotKind(
  meta: ControlMeta,
  opts: { enum?: boolean; shape?: string | null; glyph?: string | null; valueFirst?: boolean; value?: unknown; stage?: string | null } = {}
): MoveSlotKind {
  if (meta.type === 'color') return 'color';
  if (meta.type === 'filter') return 'filter';
  if (opts.stage) return 'env';
  if (meta.type === 'toggle' && meta.moveVisual?.kind === 'metronome') return 'metronome';
  if (meta.type === 'toggle') return meta.icon ? 'toggle-icon' : 'toggle';
  if (meta.type === 'transfer') return 'transfer';
  if (meta.type === 'gradient') return 'ramp';
  if (meta.type === 'balance') return 'balance';
  if (meta.type === 'slider' && meta.display === 'dial') return 'dial';
  if (meta.type === 'xy') return 'xy';
  if (meta.type === 'range') return 'range';
  const drawing = moveNumericDrawing(meta, opts.value ?? meta.min);
  if (drawing) return drawing.kind;
  if (movePlaybackMode(meta, opts.value)) return 'playback';
  if (opts.enum) {
    if (opts.shape) return 'curve';
    if (opts.glyph) return 'icon';
    return 'enum';
  }
  return opts.valueFirst ? 'value' : 'default';
}

/** One glyph from the bundled lucide subset; an unknown name draws nothing. */
export function MoveSlotGlyph({ name, className }: { name: string; className: string }) {
  const paths = LUCIDE_ICONS[name];
  if (!paths) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

/**
 * A readout string split into the number and the unit that trails it:
 * "250 ms" is 250 over ms, "-6.0 dB" is -6.0 over dB. A one-character
 * unit stays on the line ("64%", "12°"), as do "1/16" and "Sine". The unit
 * is the run after the last digit — letters, a slash, a sign.
 */
export function splitReadoutUnit(value: string): { num: string; unit: string | null } {
  const m = /^(.*\d)\s*([^\d\s][^\d]*)$/.exec(value.trim());
  const unit = m ? m[2].trim() : '';
  return m && unit.length > 1 ? { num: m[1], unit } : { num: value, unit: null };
}

/** The slot's centred name, and the value that takes its place on touch. */
export function MoveSlotReadout({ label, value }: { label: string; value: ReactNode }) {
  const split = typeof value === 'string' ? splitReadoutUnit(value) : null;
  return (
    <div className="tweakers-move-dial-readout">
      <span className="tweakers-move-dial-label" data-long={label.length > 9 || undefined}>
        {label}
      </span>
      <span className="tweakers-move-dial-value">
        {split?.unit ? (
          <>
            <span className="tweakers-move-dial-number">{split.num}</span>
            <span className="tweakers-move-dial-unit">{split.unit}</span>
          </>
        ) : value}
      </span>
    </div>
  );
}

/** A path drawn edge to edge in the slot's picture band. */
export function MoveSlotShape({ d, className = 'tweakers-move-dial-shape' }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** The basic slot and its value-first twin — readout plus fill bar. A
 *  bipolar dial parked exactly on its origin states the zero outright
 *  (the marker) instead of leaving a stub to read against a tick. */
export function MoveSlotDefaultBody({
  label, value, pct, originPct, atOrigin,
}: {
  label: string;
  value: ReactNode;
  /** Fill extent, 0–100. */
  pct: number;
  /** Bipolar/origin anchor position, 0–100 — null for a plain fill. */
  originPct: number | null;
  /** Parked on the origin exactly — the dial's zero. */
  atOrigin?: boolean;
}) {
  return (
    <>
      <MoveSlotReadout label={label} value={value} />
      <div className="tweakers-move-dial-bar">
        <div
          className="tweakers-move-dial-fill"
          data-zero={atOrigin || undefined}
          style={originPct != null
            ? { marginLeft: `${Math.min(pct, originPct)}%`, width: `${Math.abs(pct - originPct)}%` }
            : { width: `${pct}%` }}
        />
        {atOrigin && (
          <span className="tweakers-move-dial-zero" style={{ left: `calc(2px + (100% - 4px) * ${(originPct ?? 0) / 100})` }} />
        )}
      </div>
    </>
  );
}

/** How many option rows a slot-sized list screen holds — the count the CSS
 *  band is cut for, and the point past which the list starts to run. */
export const MOVE_LIST_ROWS = 5;

/** The option picker's faces — a list, or a picture: a glyph, a drawn shape,
 *  or a playback drawing.
 *
 *  A face with a picture reads top down: what the knob is on the tag, the
 *  picture between, what it is set to underneath, and the pagination cells
 *  under that to say where the named option sits in the run.
 *
 *  With no picture to stand for the option, the slot shows the choice itself
 *  and becomes the screen: a small head keeps the control's name, and the
 *  list has everything under it — the current option lit, the rest dim
 *  around it. Naming only the selection spends a whole slot saying one word;
 *  the list spends it saying where that word sits among the others.
 *
 *  Past the five rows the slot holds, the list runs behind a still
 *  selection — and a touch grows the screen up out of the slot to the whole
 *  list, so the run can be seen while the knob is going through it. It is a
 *  readout, not a second control — the slot's own drag, and the column's
 *  knob, still step the options.
 *
 *  A slot the page has put its oscilloscope in already has a picture — the
 *  live wave — so it keeps the named option and drops the list, which the
 *  wave would be running behind. */
export function MoveSlotEnumBody({
  label, optionLabel, options, activeIdx, shape, glyph, playback, scoped,
}: {
  label: string;
  optionLabel: string;
  options: NonNullable<ControlMeta['options']>;
  activeIdx: number;
  shape: string | null;
  glyph: string | null;
  playback?: MovePlaybackMode | null;
  /** The slot draws the modulator's live signal behind this face. */
  scoped?: boolean;
}) {
  const selected = options[activeIdx];

  // A picture names one option at a time, so it keeps the pagination cells
  // to say where that one sits. A list has the whole run on it already.
  if (playback || shape || glyph || scoped) {
    return (
      <>
        <span className="tweakers-move-dial-tag">{label}</span>
        {playback && <MoveSlotPlaybackDrawing mode={playback} />}
        {!playback && shape && <MoveSlotShape d={shape} />}
        {!playback && glyph && <MoveSlotGlyph name={glyph} className="tweakers-move-dial-icon" />}
        <span className="tweakers-move-dial-option">{optionLabel}</span>
        <div className="tweakers-move-dial-bar">
          <div className="tweakers-move-dial-enum">
            {options.map((opt, j) => (
              <span
                key={enumOptionValue(opt as never)}
                className="tweakers-move-dial-enum-cell"
                data-on={j === activeIdx || undefined}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="tweakers-move-dial-screen"
      // More options than the slot holds: the screen grows to the whole list
      // while the dial is touched. The count is what the CSS measures that
      // grown height from, so the row metrics stay in the stylesheet.
      data-grow={options.length > MOVE_LIST_ROWS || undefined}
      style={{ '--move-list-count': options.length } as CSSProperties}
    >
      <span className="tweakers-move-dial-head">{label}</span>
      <ListScreen
        className="tweakers-move-dial-list"
        items={options.map((opt) => ({
          value: enumOptionValue(opt as never),
          label: enumOptionLabel(opt as never),
        }))}
        value={selected ? enumOptionValue(selected as never) : undefined}
        follow="center"
      />
    </div>
  );
}

/** The XY slot face. Coordinates are normalized screen positions (Y down).
 * The panel owns gestures and normalization; a preview replaces the crosshair.
 */
export function MoveSlotXYBody({ label, value, position, gridN, shape = null }: {
  label: string;
  value: ReactNode;
  position: { x: number; y: number };
  gridN: number;
  shape?: string | null;
}) {
  return (
    <>
      <div className="tweakers-move-xy">
        {shape !== null ? (
          <MoveSlotShape d={shape} className="tweakers-move-xy-curve" />
        ) : (
          <>
            {gridN > 0 && (
              <span className="tweakers-move-xy-grid" style={{
                '--tweak-xy-grid-step-x': `${100 / gridN}%`,
                '--tweak-xy-grid-step-y': `${100 / gridN}%`,
              } as CSSProperties} />
            )}
            <span className="tweakers-move-xy-line" data-axis="x" style={{ top: `${position.y * 100}%` }} />
            <span className="tweakers-move-xy-line" data-axis="y" style={{ left: `${position.x * 100}%` }} />
            <span className="tweakers-move-xy-dot" style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }} />
          </>
        )}
      </div>
      <MoveSlotReadout label={label} value={value} />
    </>
  );
}

/**
 * A slot that draws instead of counting: the curve, the ramp and the needle
 * all sit on the same dark display the filter's response uses, with a small
 * label under it. A big centred name over a faint line — the first cut of
 * this — read as neither.
 */
function MoveSlotDisplay({ children }: { children: ReactNode }) {
  return <div className="tweakers-move-slot-display">{children}</div>;
}

function MoveSlotDisplayFoot({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="tweakers-move-slot-foot">
      <span className="tweakers-move-slot-foot-label">{label}</span>
      <span className="tweakers-move-slot-foot-value">{value}</span>
    </div>
  );
}

/**
 * The transfer-curve slot. The curve fills the display, with a dot on the
 * point the knob is holding — one knob shapes a whole curve, so the slot has
 * to say WHICH point it is shaping.
 */
export function MoveSlotTransferBody({ label, value, shape, point }: {
  label: string;
  value: ReactNode;
  /** The whole curve as an SVG path, in the slot's own y-down space. */
  shape: string;
  /** The held point's normalized screen position (y down), or null. */
  point: { x: number; y: number } | null;
}) {
  return (
    <>
      <MoveSlotDisplay>
        <MoveSlotShape d={shape} className="tweakers-move-slot-shape" />
        {point && (
          <span
            className="tweakers-move-slot-dot"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          />
        )}
      </MoveSlotDisplay>
      <MoveSlotDisplayFoot label={label} value={value} />
    </>
  );
}

/**
 * The colour-ramp slot: the ramp itself fills the display, because a list of
 * colours has nothing to say as a number. A tick marks the stop the knob is
 * holding.
 */
export function MoveSlotRampBody({ label, value, css, stop, stops }: {
  label: string;
  value: ReactNode;
  /** The ramp as a CSS `linear-gradient(...)`. */
  css: string;
  /** The held stop's position 0..1, or null. */
  stop: number | null;
  /** Every stop's position, drawn while the editor holds the ramp — the
   *  held one (`stop`) wears the bright tick, the rest sit quiet. */
  stops?: number[];
}) {
  // Inset a hair so a stop at either end still shows its whole tick.
  const tickLeft = (p: number) => `calc(${p * 100}% + ${(0.5 - p) * 4}px)`;
  return (
    <>
      <MoveSlotDisplay>
        <span className="tweakers-move-slot-ramp" style={{ background: css }} />
        {(stops ?? []).map((p, i) => (
          p === stop ? null : <span key={i} className="tweakers-move-slot-tick" data-quiet style={{ left: tickLeft(p) }} />
        ))}
        {stop !== null && (
          // The only thing saying which stop the knob is holding.
          <span
            className="tweakers-move-slot-tick"
            style={{ left: tickLeft(stop) }}
          />
        )}
      </MoveSlotDisplay>
      <MoveSlotDisplayFoot label={label} value={value} />
    </>
  );
}

/**
 * The dial slot — a needle, for the values whose two ends are the same place.
 * A bar would put 359° and 1° as far apart as a slot can show them.
 */
export function MoveSlotDialBody({ label, value, bearing, origin }: {
  label: string;
  value: ReactNode;
  /** Compass bearing in degrees, 0 = up, clockwise. */
  bearing: number;
  /** The bearing the sweep grows out of. */
  origin: number;
}) {
  const rad = ((bearing - 90) * Math.PI) / 180;
  return (
    <>
      <MoveSlotDisplay>
        <svg className="tweakers-move-slot-needle" viewBox="-12 -12 24 24" aria-hidden="true">
          <circle className="tweakers-move-needle-face" cx="0" cy="0" r="8.5" />
          <path className="tweakers-move-needle-sweep" d={arcPath(origin, bearing, 8.5)} />
          <line
            className="tweakers-move-needle-hand"
            x1="0" y1="0"
            x2={(8.5 * Math.cos(rad)).toFixed(3)}
            y2={(8.5 * Math.sin(rad)).toFixed(3)}
          />
        </svg>
      </MoveSlotDisplay>
      <MoveSlotDisplayFoot label={label} value={value} />
    </>
  );
}

/** The range slot — readout plus the two-handled span bar. */
export function MoveSlotRangeBody({
  label, value, lo, hi,
}: {
  label: string;
  value: ReactNode;
  /** Handle positions, each 0..1. */
  lo: number;
  hi: number;
}) {
  return (
    <>
      <MoveSlotReadout label={label} value={value} />
      <div className="tweakers-move-dial-bar">
        <div className="tweakers-move-dial-range">
          <div
            className="tweakers-move-dial-span"
            style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }}
          />
          <span className="tweakers-move-dial-handle" style={{ left: `${lo * 100}%` }} />
          <span className="tweakers-move-dial-handle" style={{ left: `${hi * 100}%` }} />
        </div>
      </div>
    </>
  );
}

/**
 * The 2-slot filter's face: the response maximised across both columns, and
 * a small label per hand — each sitting inline where its own single slot's
 * label would have been, cutoff on the left half, resonance on the right.
 * Each label gives way to its hand's value on touch, like any slot.
 */
export function MoveSlotFilterBody({
  meta, value, shape,
}: {
  meta: ControlMeta;
  value: FilterValue;
  shape: string | null;
}) {
  const ca = resolveFilterAxis(meta.cutoffAxis, 'cutoff');
  const ra = resolveFilterAxis(meta.resonanceAxis, 'resonance');
  const fmt = (v: number, f?: (n: number) => string) =>
    f ? f(v) : Math.abs(v) >= 100 ? Math.round(v).toString() : Number(v.toFixed(2)).toString();
  return (
    <>
      {/* The drawing sits on a display — the same dark hole in the face the
          waveform is cut into — so the response reads as a screen, not a
          squiggle floating on the chip. */}
      <div className="tweakers-move-filter-display">
        {shape && <MoveSlotShape d={shape} className="tweakers-move-filter-shape" />}
      </div>
      <div className="tweakers-move-filter-readout" data-side="cutoff">
        <span className="tweakers-move-dial-label">{ca.label}</span>
        <span className="tweakers-move-dial-value">{fmt(value.cutoff, ca.formatValue)}</span>
      </div>
      <div className="tweakers-move-filter-readout" data-side="resonance">
        <span className="tweakers-move-dial-label">{ra.label}</span>
        <span className="tweakers-move-dial-value">{fmt(value.resonance, ra.formatValue)}</span>
      </div>
    </>
  );
}

/** One edge of a take on the shared line: its place (0..1), its name and its
 *  reading. `moved` is an edge off its own end of the take. */
export type MoveTrimSpanEdge = { label: string; value: ReactNode; position: number; moved?: boolean };

/**
 * The 2-slot take's face: one line across both columns, the kept part
 * filled between the two edges. Each edge is a flag — a post down to the
 * line and a pennant pointing into the kept part — so the start and the end
 * read apart at a glance. The start's name and value hold the left side,
 * the end's the right.
 */
export function MoveSlotTrimSpanBody({ start, end }: { start: MoveTrimSpanEdge; end: MoveTrimSpanEdge }) {
  const at = (position: number) => `${Math.max(0, Math.min(1, position)) * 100}%`;
  return (
    <>
      <span className="tweakers-move-trim-span-tag" data-side="start">{start.label}</span>
      <span className="tweakers-move-trim-span-tag" data-side="end">{end.label}</span>
      <div className="tweakers-move-trim-span-track" aria-hidden="true">
        <span className="tweakers-move-trim-span-guide" />
        <span className="tweakers-move-trim-span-kept" style={{ left: at(start.position), right: `calc(100% - ${at(Math.max(start.position, end.position))})` }} />
        {([['start', start], ['end', end]] as const).map(([edge, e]) => (
          <svg key={edge} className="tweakers-move-trim-span-flag" data-edge={edge} data-offset={e.moved || undefined}
            style={{ left: at(e.position) }} viewBox="0 0 12 22">
            <path d={edge === 'start' ? 'M0 0h2v22H0zM2 0l10 6L2 12z' : 'M10 0h2v22h-2zM10 0L0 6l10 6z'} />
          </svg>
        ))}
      </div>
      <span className="tweakers-move-trim-span-value" data-side="start">{start.value}</span>
      <span className="tweakers-move-trim-span-value" data-side="end">{end.value}</span>
    </>
  );
}

/** One dial on a multi-slot instrument's face: its name, its reading, its
 *  place (0..1) and whether a hand is on it — then the reading shows. */
export type MoveFaceDial = { label: string; value: ReactNode; position: number; active?: boolean };

/** Grid cells behind the gate's live picture. */
export const MOVE_GATE_GRID = { columns: 14, rows: 4 } as const;
/** Grid cells per band column behind the multiband face's curve. */
export const MOVE_MULTIBAND_GRID = { columnsPerSlot: 7, rows: 4 } as const;

const place = (position: number) => Math.max(0, Math.min(1, position));

/** A face's bar: lit from its marker down — how much the dial is doing. */
function MoveFaceBar({ role, dial }: { role: string; dial: MoveFaceDial }) {
  return (
    <span className="tweakers-move-face-bar" data-role={role} data-track={role} data-active={dial.active || undefined}
      style={{ '--move-face-at': place(dial.position) } as CSSProperties} aria-hidden="true">
      <i className="tweakers-move-face-bar-lit" />
      <i className="tweakers-move-face-bar-marker" />
    </span>
  );
}

/** A face's cell grid, with its live picture laid over it. */
function MoveFaceGrid({ columns, rows, children }: { columns: number; rows: number; children?: ReactNode }) {
  const corners: Record<number, string> = { 0: 'tl', [columns - 1]: 'tr', [columns * (rows - 1)]: 'bl', [columns * rows - 1]: 'br' };
  return (
    <div className="tweakers-move-face-grid" data-track="grid" aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns * rows }, (_, i) => <i key={i} data-corner={corners[i]} />)}
      {children && <div className="tweakers-move-face-display">{children}</div>}
    </div>
  );
}

/** A dial's name under column `col` of the face, its reading while touched. */
function MoveFaceName({ col, dial }: { col: number; dial: MoveFaceDial }) {
  return (
    <span className="tweakers-move-face-name" data-active={dial.active || undefined} style={{ '--move-face-col': col } as CSSProperties}>
      {dial.active ? dial.value : dial.label}
    </span>
  );
}

/**
 * The 3-slot gate's face. The threshold stands as a bar over the first
 * column and the release over the third, each lit from its marker down; the
 * grid between them holds the live picture (the children); the look-ahead is
 * a short line under the middle, pointing ahead in time. Each name sits
 * under its own column.
 */
export function MoveSlotGateBody({
  threshold, lookahead, release, children,
}: {
  threshold: MoveFaceDial;
  lookahead: MoveFaceDial;
  release: MoveFaceDial;
  /** The live picture, laid over the grid. */
  children?: ReactNode;
}) {
  return (
    <div className="tweakers-move-face" style={{ '--move-face-span': 3 } as CSSProperties}>
      <MoveFaceBar role="threshold" dial={threshold} />
      <MoveFaceGrid columns={MOVE_GATE_GRID.columns} rows={MOVE_GATE_GRID.rows}>{children}</MoveFaceGrid>
      <MoveFaceBar role="release" dial={release} />
      <MoveFaceName col={0} dial={threshold} />
      <span className="tweakers-move-gate-look" data-active={lookahead.active || undefined}>
        <span className="tweakers-move-gate-look-name">{lookahead.active ? lookahead.value : lookahead.label}</span>
        <span className="tweakers-move-gate-look-line" data-track="lookahead" style={{ '--move-face-at': place(lookahead.position) } as CSSProperties} aria-hidden="true">
          <i className="tweakers-move-gate-look-lit" />
          <i className="tweakers-move-gate-look-dot" />
          <svg className="tweakers-move-gate-look-arrow" viewBox="0 0 8 12"><path d="M1 1l6 5-6 5" /></svg>
        </span>
      </span>
      <MoveFaceName col={2} dial={release} />
    </div>
  );
}

/**
 * The 3-slot place's face: an object on a stage. A ruled floor seen from the
 * front, the mark standing on it — across the floor for x, back into it for z
 * (and smaller the further back), up off its shadow for y. Three bounded
 * numbers read as one position, which three bars cannot do: on bars, depth is a
 * number to believe; here it is a distance to see.
 *
 * Each axis's drag reads the stage itself (`data-track`): x across it, y and z
 * up it. Whichever axis is in the hand draws its own guide — a rail across the
 * floor for x, the stalk for y, the depth rule under the mark for z.
 */
export function MoveSlotVectorBody({ x, y, z, down = false }: {
  x: MoveFaceDial;
  y: MoveFaceDial;
  z: MoveFaceDial;
  /** The host's y grows downward (canvas coordinates). */
  down?: boolean;
}) {
  const stage = moveVectorStage(x.position, y.position, z.position, down);
  const { width: w, height: h } = MOVE_STAGE;
  // The floor and its rules stretch with the slots (their strokes do not); the
  // mark, its shadow and its stalk are placed in percent of the stage and sized
  // from its height, so they stay round at any width.
  const at = (px: number, py: number) => ({ '--move-vector-x': `${(px / w) * 100}%`, '--move-vector-y': `${(py / h) * 100}%` });
  return (
    <div className="tweakers-move-face" style={{ '--move-face-span': 3 } as CSSProperties}>
      <div className="tweakers-move-vector-stage" aria-hidden="true">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <path className="tweakers-move-vector-floor" d={stage.floor} />
          <path className="tweakers-move-vector-rules" d={stage.rules} />
          <path className="tweakers-move-vector-depth" data-active={z.active || undefined} d={stage.depth} />
          <line className="tweakers-move-vector-rail" data-active={x.active || undefined}
            x1={0} x2={w} y1={stage.foot.y} y2={stage.foot.y} />
        </svg>
        <i className="tweakers-move-vector-foot"
          style={{ ...at(stage.foot.x, stage.foot.y), '--move-vector-size': `${((stage.foot.ry * 2) / h) * 100}%` } as CSSProperties} />
        <i className="tweakers-move-vector-stalk" data-active={y.active || undefined}
          style={{ ...at(stage.stalk.x, stage.stalk.y2), '--move-vector-size': `${((stage.stalk.y1 - stage.stalk.y2) / h) * 100}%` } as CSSProperties} />
        <i className="tweakers-move-vector-mark" data-active={x.active || y.active || z.active || undefined}
          style={{ ...at(stage.mark.x, stage.mark.y), '--move-vector-size': `${((stage.mark.r * 2) / h) * 100}%` } as CSSProperties} />
        <span className="tweakers-move-vector-track" data-track="axis-x" />
        <span className="tweakers-move-vector-track" data-track="axis-y" />
        <span className="tweakers-move-vector-track" data-track="axis-z" />
      </div>
      <MoveFaceName col={0} dial={x} />
      <MoveFaceName col={1} dial={y} />
      <MoveFaceName col={2} dial={z} />
    </div>
  );
}

/** One channel of a mixer face: its dial, and the icon and tone it wears. */
export type MoveChannelDial = MoveFaceDial & { icon?: string; tone?: MoveTone };

/**
 * A mixer's face, one slot per channel: each channel's icon and name along
 * the top in its tone, and under them a fader well filled from the bottom
 * to its level — lime for a channel with no tone. A channel at zero keeps a
 * hairline in the text colour, so it still reads.
 */
export function MoveSlotChannelBody({ channels }: { channels: MoveChannelDial[] }) {
  return (
    <div className="tweakers-move-face" style={{ '--move-face-span': channels.length } as CSSProperties}>
      {channels.map((channel, k) => (
        <div key={k} className="tweakers-move-channel" data-active={channel.active || undefined}
          style={{ '--move-face-col': k, '--move-channel-tone': channel.tone ? `var(--move-${channel.tone})` : undefined } as CSSProperties}>
          <span className="tweakers-move-channel-head">
            {channel.icon && <MoveSlotIcon icon={channel.icon} className="tweakers-move-channel-icon" />}
            <span className="tweakers-move-channel-name">{channel.active ? channel.value : channel.label}</span>
          </span>
          <span className="tweakers-move-channel-well" data-track={`channel-${k}`} aria-hidden="true">
            <i className="tweakers-move-channel-fill" data-empty={channel.position <= 0 || undefined}
              style={{ '--move-face-at': place(channel.position) } as CSSProperties} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** The speed gauge's drawing, in its own viewBox units (1 unit = 1px): a
 *  dome of radius `r` on a baseline `base` below its centre, graded across
 *  `sweep` degrees either side of straight up. */
export const MOVE_GAUGE = { r: 36, base: 18, half: 43, top: 37, height: 56, sweep: 110, ticks: 11 } as const;

/** Where a value (0..1) points on the gauge: a compass bearing, 0 = up. */
export const moveGaugeBearing = (position: number) => (place(position) * 2 - 1) * MOVE_GAUGE.sweep;

function MoveGauge({ position }: { position: number }) {
  const { r, base, half, top, height, sweep, ticks } = MOVE_GAUGE;
  const foot = Math.sqrt(r * r - base * base);
  const point = (bearing: number, radius: number) => {
    const rad = (bearing * Math.PI) / 180;
    return [radius * Math.sin(rad), -radius * Math.cos(rad)] as const;
  };
  const needle = point(moveGaugeBearing(position), r * 0.62);
  return (
    <svg className="tweakers-move-multiband-gauge" data-track="speed" viewBox={`${-half} ${-top} ${half * 2} ${height}`} aria-hidden="true">
      <path className="tweakers-move-multiband-gauge-dome" d={`M${-foot} ${base}A${r} ${r} 0 1 1 ${foot} ${base}Z`} />
      <line className="tweakers-move-multiband-gauge-base" x1={-half + 1} y1={base} x2={half - 1} y2={base} />
      {Array.from({ length: ticks }, (_, k) => {
        const at = k / (ticks - 1);
        const major = k % 5 === 0;
        const [x1, y1] = point(-sweep + at * sweep * 2, r - 4);
        const [x2, y2] = point(-sweep + at * sweep * 2, r - (major ? 10 : 7));
        return <line key={k} className="tweakers-move-multiband-gauge-tick" data-major={major || undefined}
          data-lit={at <= place(position) + 1e-9 || undefined} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      <line className="tweakers-move-multiband-gauge-needle" x1="0" y1="0" x2={needle[0]} y2={needle[1]} />
      <circle className="tweakers-move-multiband-gauge-pivot" cx="0" cy="0" r="2.5" />
    </svg>
  );
}

/**
 * The multiband cleaner's face, one slot per dial: the amount as a bar with
 * its icon over the first column, the speed as a graded gauge over the
 * second, and the band columns as one grid holding the live curve (the
 * children). Each column's name sits under it — a band column names
 * whichever band its knob is on.
 */
export function MoveSlotMultibandBody({
  amount, speed, bands, icon, children,
}: {
  amount: MoveFaceDial;
  speed: MoveFaceDial;
  /** One entry per band column: the band its knob is on. */
  bands: MoveFaceDial[];
  /** The amount's glyph: a bundled icon name or an asset URL. */
  icon?: string;
  /** The live picture, laid over the grid. */
  children?: ReactNode;
}) {
  return (
    <div className="tweakers-move-face" style={{ '--move-face-span': 2 + bands.length } as CSSProperties}>
      <MoveFaceBar role="amount" dial={amount} />
      {icon && <MoveSlotIcon icon={icon} className="tweakers-move-multiband-icon" />}
      <MoveGauge position={speed.position} />
      <MoveFaceGrid columns={MOVE_MULTIBAND_GRID.columnsPerSlot * bands.length} rows={MOVE_MULTIBAND_GRID.rows}>{children}</MoveFaceGrid>
      <MoveFaceName col={0} dial={amount} />
      <MoveFaceName col={1} dial={speed} />
      {bands.map((band, k) => <MoveFaceName key={k} col={2 + k} dial={band} />)}
    </div>
  );
}

/** Selected color over a transparency checker, with its current hue. */
export function MoveSlotColorBody({ label, color, hue }: { label: string; color: string; hue: number }) {
  return <>
    <span className="tweakers-move-dial-head">{label}</span>
    <span className="tweakers-move-color-swatch" aria-hidden="true"><span style={{ background: color }} /></span>
    <span className="tweakers-move-color-reading">{Math.round(hue)}°</span>
  </>;
}

/**
 * The 4-slot envelope's face, the filter's big sibling: the whole ADSR
 * drawn as one shape on a single display spanning all four stage columns,
 * with each stage's small label sitting where its own slot's label would
 * have been — attack, decay, sustain, release, left to right, each caption
 * over its own drag zone and hardware knob.
 */
export function MoveSlotEnvBody({
  points, stages, joints = [],
}: {
  /** The whole envelope's samples, each 0..1, left to right. */
  points: number[];
  /** One caption per stage column, in column order. */
  stages: { stage: string; label: string; value: ReactNode }[];
  /** The joint handles — small squares pinned where the ramps meet. */
  joints?: { stage: string; x: number; y: number; held?: boolean }[];
}) {
  const d = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * 100} ${100 - v * 100}`)
    .join(' ');
  return (
    <>
      <div className="tweakers-move-env-display">
        <MoveSlotShape d={d} className="tweakers-move-env-shape" />
        {/* The drawing keeps 6px of vertical air (the shape svg's inset), so
            a joint's y maps through the same band to land on the line. */}
        {joints.map((j) => (
          <span
            key={j.stage}
            className="tweakers-move-env-handle"
            data-held={j.held || undefined}
            style={{
              left: `${j.x * 100}%`,
              top: `calc(6px + (100% - 12px) * ${(1 - j.y).toFixed(4)})`,
            }}
          />
        ))}
      </div>
      {stages.map((s) => (
        <div key={s.stage} className="tweakers-move-env-readout" data-stage={s.stage}>
          <span className="tweakers-move-dial-label">{s.label}</span>
          <span className="tweakers-move-dial-value">{s.value}</span>
        </div>
      ))}
    </>
  );
}

/**
 * A dial with the oscilloscope living in it — the Rate slot's face. The
 * live wave (passed in as the drawing, so the body stays pure) fills the
 * whole slot above the bar, edge to edge with no title in its way; the
 * dial's own readout floats over it and the fill bar keeps the bottom.
 * The control stays a control — you turn the wave you're watching.
 */
export function MoveSlotScopeBody({
  label, value, pct, children,
}: {
  label: string;
  value: ReactNode;
  /** Fill extent, 0–100. */
  pct: number;
  /** The live wave — an svg the host keeps ticking. */
  children: ReactNode;
}) {
  return (
    <>
      <div className="tweakers-move-scope-display">{children}</div>
      <MoveSlotReadout label={label} value={value} />
      <div className="tweakers-move-dial-bar">
        <div className="tweakers-move-dial-fill" style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}

/**
 * A toggle in a big slot of its own — the pad's language at slot size: the
 * indicator bar up top, the name centred, the whole slot inverting when it
 * is on. For the switches that deserve a column (the envelope's Loop, with
 * its pad row spent on the bend gesture).
 *
 * A switch that names a picture wears it instead: the thing it turns on,
 * drawn big, with a badge on its corner — a check while it is on, a ban
 * while it is off — and its name underneath. The picture says what the
 * switch is about and the badge says whether it is doing it, so neither has
 * to be read as a word. `onIcon` / `offIcon` replace the kit's own badges
 * where a host has drawn its pair.
 */
export function MoveSlotToggleBody({ label, checked, icon, onIcon, offIcon }: {
  label: string;
  checked: boolean;
  /** The switch's own picture: a glyph name, or a host asset's URL. */
  icon?: string;
  /** The host's own state badges, in place of the kit's check and ban. */
  onIcon?: string;
  offIcon?: string;
}) {
  const badge = checked ? onIcon : offIcon;
  if (!icon) {
    // A switch named by a number with a unit ("72.1 BPM") wears it the way a
    // dial wears its value: the number big, the unit small beneath it.
    const split = /\d/.test(label[0] ?? '') ? splitReadoutUnit(label) : null;
    return (
      <>
        <span className="tweakers-move-dial-toggle-indicator" data-on={checked || undefined} />
        {split?.unit ? (
          <span className="tweakers-move-dial-toggle-label" data-value>
            <span className="tweakers-move-dial-number">{split.num}</span>
            <span className="tweakers-move-dial-unit">{split.unit}</span>
          </span>
        ) : (
          <span className="tweakers-move-dial-toggle-label">{label}</span>
        )}
      </>
    );
  }
  return (
    <>
      <span className="tweakers-move-toggle-picture" aria-hidden="true">
        <MoveSlotIcon icon={icon} className="tweakers-move-toggle-icon" />
        <span className="tweakers-move-toggle-badge">
          {badge
            ? <MoveSlotIcon icon={badge} className="tweakers-move-toggle-state-icon" />
            : <MoveSlotBadge on={checked} />}
        </span>
      </span>
      <span className="tweakers-move-toggle-label">{label}</span>
    </>
  );
}

/**
 * The metronome's drawing, in its own units with the arm's pivot at the
 * origin: a hollow trapezoid body (the centre line of its 2-unit stroke) and
 * an arm 30 long with its weight 21 up. The box leaves room for the arm swung
 * to either extreme, where its tip leaves the body.
 */
const METRONOME_VIEWBOX = '-23 -31 46 36';
const METRONOME_BODY = 'M -3.07 -30 H 3.07 L 12.11 4 H -12.11 Z';
const METRONOME_ARM = 30;
const METRONOME_WEIGHT_AT = 21;
const METRONOME_WEIGHT_R = 4.5;
const METRONOME_STROKE = 2;
/** The ring the arm cuts out of the body where it crosses it. */
const METRONOME_CUT = 2;
/** How far the arm leans at a full swing, in degrees. */
const METRONOME_SWING_DEG = 45;

/**
 * A switch drawn as a metronome — the click track's own face. On, the
 * picture is lit and its arm swings to the host's beat; off, it dims and the
 * arm stands upright. The motion says the switch is on, so there is no badge.
 *
 * The host owns time: `swing` is read every frame for where the arm is now,
 * -1 (full left) to +1 (full right), or `null` to stand it upright. The arm
 * is turned straight on its element, never through a render, so a beat costs
 * the page no React work. A reader who asked for less motion gets the lit
 * metronome standing still.
 */
export function MoveSlotMetronomeBody({ label, checked, swing }: {
  label: string;
  checked: boolean;
  /** Where the arm is now, -1..+1, or `null` for upright. */
  swing?: () => number | null;
}) {
  const arm = useRef<SVGGElement>(null);
  // The latest reader, so a host that hands in a fresh function every render
  // does not restart the loop.
  const read = useRef(swing);
  read.current = swing;
  const swings = checked && !!swing;

  useEffect(() => {
    const g = arm.current;
    if (!g) return;
    const lean = (deg: number) => g.setAttribute('transform', `rotate(${deg.toFixed(2)})`);
    const still = typeof window === 'undefined'
      || typeof window.requestAnimationFrame !== 'function'
      || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!swings || still) {
      lean(0);
      return;
    }
    let frame = 0;
    const tick = () => {
      const at = read.current?.();
      lean(typeof at === 'number' && Number.isFinite(at)
        ? Math.max(-1, Math.min(1, at)) * METRONOME_SWING_DEG
        : 0);
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.cancelAnimationFrame(frame);
      lean(0);
    };
  }, [swings]);

  // The tempo is the headline, top right, in the value shape with its unit
  // small under it; the metronome keeps the bottom-left corner. A name that
  // is not a number ("No beat") stands in the number's place in the label face.
  const split = /\d/.test(label[0] ?? '') ? splitReadoutUnit(label) : null;
  return (
    <>
      {split?.unit ? (
        <span className="tweakers-move-metronome-readout" data-value>
          <span className="tweakers-move-dial-number">{split.num}</span>
          <span className="tweakers-move-dial-unit">{split.unit}</span>
        </span>
      ) : (
        <span className="tweakers-move-metronome-readout">{label}</span>
      )}
      <span className="tweakers-move-metronome-picture" aria-hidden="true">
        <svg
          className="tweakers-move-metronome"
          data-on={checked || undefined}
          viewBox={METRONOME_VIEWBOX}
          fill="none"
        >
          <path
            className="tweakers-move-metronome-body"
            d={METRONOME_BODY}
            strokeWidth={METRONOME_STROKE}
            strokeLinejoin="round"
          />
          <g ref={arm} transform="rotate(0)">
            {/* The same arm, fatter, in the slot's own colour underneath:
                where it crosses the body, it cuts the outline. */}
            <g className="tweakers-move-metronome-cut">
              <line
                x1={0} y1={0} x2={0} y2={-METRONOME_ARM}
                strokeWidth={METRONOME_STROKE + 2 * METRONOME_CUT}
                strokeLinecap="round"
              />
              <circle cx={0} cy={-METRONOME_WEIGHT_AT} r={METRONOME_WEIGHT_R + METRONOME_CUT} />
            </g>
            <line
              className="tweakers-move-metronome-arm"
              x1={0} y1={0} x2={0} y2={-METRONOME_ARM}
              strokeWidth={METRONOME_STROKE}
              strokeLinecap="round"
            />
            <circle
              className="tweakers-move-metronome-weight"
              cx={0} cy={-METRONOME_WEIGHT_AT} r={METRONOME_WEIGHT_R}
            />
          </g>
        </svg>
      </span>
    </>
  );
}

/** A bundled glyph or a host-owned asset; both take the slot's own colour. */
function MoveSlotIcon({ icon, className }: { icon: string; className: string }) {
  if (LUCIDE_ICONS[icon]) return <MoveSlotGlyph name={icon} className={className} />;
  const mask = `url(${JSON.stringify(icon)})`;
  return (
    <span
      className={className}
      data-asset
      aria-hidden="true"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

/** The kit's own state badge, for a switch that named only its picture. */
function MoveSlotBadge({ on }: { on: boolean }) {
  return (
    <svg
      className="tweakers-move-toggle-state-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={on ? ICON_BADGE_ON : ICON_BADGE_OFF} />
    </svg>
  );
}

/**
 * The small slots — the pad row under the dials. Where a big slot is a
 * column of the dial row, a small slot is one pad: a switch, a value the
 * dial above it can borrow, a button, or a cell an app paints itself.
 *
 * Same discipline as the big slots: each body is a pure drawing of computed
 * props, and the gestures (the hold-to-peek, the tap-to-latch, the bend
 * drag) stay with the MovePanel. The `data-kind`, `data-on`, `data-held`
 * and `data-latched` states live on the pad the body sits in.
 *
 * `tabs` is the first small slot to claim more than one pad, and it follows
 * the big slots' multi-slot pattern exactly: the container takes
 * `grid-column: span N`, the drawing stretches across the whole run, and
 * every pad in it keeps one option — so the hardware's one-thing-per-pad
 * rule still holds under the shared strip.
 *
 * `band` claims two pads the other way — one column, two rows — and keeps
 * the same promise: each pad under the shared screen is still its own chip.
 * `fade` and `loop` claim two pads side by side in one row on the same terms.
 */
export type MovePadKind = 'toggle' | 'icon' | 'value' | 'action' | 'icon-label' | 'app' | 'bend' | 'wave' | 'tabs' | 'color' | 'list' | 'band' | 'fade' | 'loop';

/** A switch: the indicator top-left, the name beside it, the whole pad
 *  inverting when it is on. */
export function MovePadToggleBody({ label }: { label: string }) {
  return (
    <>
      <span className="tweakers-move-pad-indicator" />
      <span className="tweakers-move-pad-title">{label}</span>
    </>
  );
}

/** A switch drawn as its picture alone: a pad is too narrow for a name and
 *  a badge, and the whole pad inverting already says it is on. The name
 *  stays on the pad for the screen reader, not the eye. */
export function MovePadIconBody({ icon }: { icon: string }) {
  return <MoveSlotIcon icon={icon} className="tweakers-move-pad-icon" />;
}

/** A value chip: the name, and the real value in bold with its unit
 *  trailing. Hold it to peek at it in the dial above; tap to latch it in. */
export function MovePadValueBody({ label, value, unit, children }: {
  label: string;
  value: ReactNode;
  unit?: string;
  /** The modulation ring, where the control is wired to a slot. */
  children?: ReactNode;
}) {
  return (
    <>
      {children}
      <span className="tweakers-move-pad-title">{label}</span>
      <span className="tweakers-move-pad-reading">
        <span className="tweakers-move-pad-number">{value}</span>
        {unit && <span>{unit}</span>}
      </span>
    </>
  );
}

/** The envelope's wave pad: which way that stage's sine goes, and how much
 *  of it is in. Hold it to drag the amount, tap it to flip the direction. */
export function MovePadWaveBody({ label, percent }: { label: string; percent: number }) {
  return (
    <>
      <span className="tweakers-move-pad-indicator" />
      <span className="tweakers-move-pad-title">{label}</span>
      <span className="tweakers-move-pad-reading">
        <span className="tweakers-move-pad-number">{percent}</span>
        <span>%</span>
      </span>
    </>
  );
}

/** A button: no value to carry, so the name has the pad to itself. */
export function MovePadActionBody({ label }: { label: string }) {
  return <span className="tweakers-move-pad-title">{label}</span>;
}

/** A button that shows what it does twice: its picture, then its name — the
 *  glyph is found at a glance, the word confirms it. The name gives way
 *  before the picture does when the pad runs narrow. */
export function MovePadIconLabelBody({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="tweakers-move-pad-icon-label">
      <MoveSlotIcon icon={icon} className="tweakers-move-pad-icon" />
      <span className="tweakers-move-pad-title">{label}</span>
    </span>
  );
}

/**
 * The small colour selector: the value chip's shape carrying a swatch where
 * the number would sit — for pages where colour is not the big control. It
 * is a chip in every gesture: tap latches it into the slot above, hold
 * peeks, and that slot — the big colour slot — edits it and opens its editor.
 */
export function MovePadColorBody({ label, color }: { label: string; color: string }) {
  return (
    <>
      <span className="tweakers-move-pad-title">{label}</span>
      <span className="tweakers-move-pad-swatch" aria-hidden="true"><span style={{ background: color }} /></span>
    </>
  );
}

/**
 * The tabs strip — the mode a page is in, spread across the pads it has
 * modes. One bar over its run of pads, one cell per option, and a fill on
 * the one you are in: the page never has to be turned through to be read,
 * and the mode is reachable where the hand already is.
 *
 * An option that names a glyph wears it instead of its word, the same trade
 * the big `icon` slot makes — a pad is narrow, and a picture survives the
 * width a name loses. A strip declared `'named'` spends its leading pad on
 * the select's own name, set against the run it names; that pad is a head,
 * not a choice — nothing selects it, and on the hardware it stays dark.
 */
export function MovePadTabsBody({ name, options, activeIdx }: {
  /** The leading name pad's text, or null when every pad is an option. */
  name?: string | null;
  options: NonNullable<ControlMeta['options']>;
  activeIdx: number;
}) {
  return (
    <>
      {name != null && <span className="tweakers-move-tabs-head">{name}</span>}
      {/* The options are ONE bar, not a row of chips: the ground belongs to
          the run, and the only thing wearing a fill of its own is the mode
          you are in. A pad that is merely available says so by being on the
          bar, which is what the bar is for. */}
      <div className="tweakers-move-tabs-run">
        {options.map((opt, i) => {
          const glyph = enumOptionIcon(opt as never);
          return (
            <span
              key={enumOptionValue(opt as never)}
              className="tweakers-move-tab"
              data-on={i === activeIdx || undefined}
            >
              {glyph
                ? <MoveSlotGlyph name={glyph} className="tweakers-move-tab-icon" />
                : <span className="tweakers-move-tab-title">{enumOptionLabel(opt as never)}</span>}
            </span>
          );
        })}
      </div>
    </>
  );
}

/** One cut of a band: where it sits, and whether it is cutting anything. */
export type MovePadBandHand = {
  /** The cut's place on the band, 0..1 left to right. */
  at: number;
  /** Moved in off its open end — the band is losing something here. */
  cut: boolean;
  held?: boolean;
  latched?: boolean;
};

const BAND_CAPTIONS = { high: 'Hi', low: 'Lo' } as const;

/**
 * The band — a high cut and a low cut stacked in one column, drawn as what
 * they do together: a small ruled screen with the pass band standing on it,
 * each cut region filled beside its slope and a handle on its foot. A cut
 * left open fills in the text colour, a sliver at its edge; one moved in
 * turns yellow, so a band that is losing something says so at a glance.
 *
 * The captions stand beside the screen in the order the two chips sit on
 * the grid, each over its own pad. A held or latched chip lights its
 * caption, the way a chip inverts.
 */
export function MovePadBandBody({ low, high, upper = 'high' }: {
  low: MovePadBandHand;
  high: MovePadBandHand;
  /** The hand whose chip sits on the higher row. */
  upper?: 'high' | 'low';
}) {
  const cuts = moveBandCuts(low.at, high.at);
  const hands = { low, high };
  return (
    <>
      <div className="tweakers-move-band-screen">
        <div className="tweakers-move-band-cells" aria-hidden="true">
          {Array.from({ length: 32 }, (_, i) => <i key={i} />)}
        </div>
        <div className="tweakers-move-band-plot">
          <svg
            className="tweakers-move-band-drawing"
            viewBox={`0 0 ${MOVE_BAND_W} ${MOVE_BAND_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="tweakers-move-band-cut" data-cut={low.cut || undefined} d={cuts.low} />
            <path className="tweakers-move-band-cut" data-cut={high.cut || undefined} d={cuts.high} />
          </svg>
        </div>
        <span className="tweakers-move-band-handle" style={{ left: `${low.at * 100}%` }} />
        <span className="tweakers-move-band-handle" style={{ left: `${high.at * 100}%` }} />
      </div>
      <div className="tweakers-move-band-captions">
        {([upper, upper === 'high' ? 'low' : 'high'] as const).map((hand) => (
          <span
            key={hand}
            className="tweakers-move-band-caption"
            data-held={hands[hand].held || undefined}
            data-latched={hands[hand].latched || undefined}
          >
            {BAND_CAPTIONS[hand]}
          </span>
        ))}
      </div>
    </>
  );
}

/** One edge of a fade or loop line: where it sits, and whether it has left
 *  its open end. */
export type MovePadEdgeHand = {
  /** The edge's place on its own chip's range, 0..1. */
  at: number;
  /** Moved off its open end — the line is doing something here. */
  moved: boolean;
};

const edgeAt = (at: number) => Math.max(0, Math.min(1, at)) * 100;

/**
 * The fade line — a fade in and a fade out side by side in one row, drawn on
 * one dark line with no names or numbers. Each fade is the part of the sound
 * it takes away: a ramp standing on its own end of the line, its handle on
 * top where the sound is whole again. Each has half the line to run on. A
 * fade left at zero is a thin needle at its end; one moved in turns blue.
 */
export function MovePadFadeBody({ fadeIn, fadeOut }: { fadeIn: MovePadEdgeHand; fadeOut: MovePadEdgeHand }) {
  return (
    <div className="tweakers-move-edges-track" aria-hidden="true">
      {([['in', fadeIn], ['out', fadeOut]] as const).map(([edge, hand]) => (
        <span
          key={edge}
          className="tweakers-move-fade"
          data-edge={edge}
          data-moved={hand.moved || undefined}
          style={{ '--move-edge-at': `${edgeAt(hand.at)}%` } as CSSProperties}
        >
          <span className="tweakers-move-fade-ramp" />
          <span className="tweakers-move-fade-handle" />
        </span>
      ))}
    </div>
  );
}

/**
 * The loop line — a loop's start and end side by side in one row, drawn on
 * one dark line with no names or numbers: a marker at each edge pointing
 * into the loop, and the part left outside it shaded lighter. A marker at
 * its own end of the line is orange; one moved in turns red.
 */
export function MovePadLoopBody({ start, end }: { start: MovePadEdgeHand; end: MovePadEdgeHand }) {
  const a = edgeAt(start.at);
  const b = edgeAt(end.at);
  return (
    <div className="tweakers-move-edges-track" aria-hidden="true">
      <span className="tweakers-move-loop-outside" style={{ left: 0, width: `${a}%` }} />
      <span className="tweakers-move-loop-outside" style={{ right: 0, width: `${100 - b}%` }} />
      {([['start', start, a], ['end', end, b]] as const).map(([edge, hand, at]) => (
        <svg
          key={edge}
          className="tweakers-move-loop-marker"
          data-edge={edge}
          data-moved={hand.moved || undefined}
          style={{ left: `${at}%` }}
          viewBox="0 0 8 16"
          preserveAspectRatio="none"
        >
          <path d={edge === 'start' ? 'M0 0L8 8L0 16Z' : 'M8 0L0 8L8 16Z'} />
        </svg>
      ))}
    </div>
  );
}

/** A cell the app owns — a track, a slice, a step. The colour is the app's
 *  own, so it rides inline the way a modulation dot does. */
export function MovePadAppBody({ label, color }: { label?: string; color?: string }) {
  return (
    <>
      <span
        className="tweakers-move-pad-indicator"
        style={color ? { background: color } : undefined}
      />
      {label && <span className="tweakers-move-pad-title">{label}</span>}
    </>
  );
}

/** The checked list uses the same dark rows and marks as every other kit list. */
export function MovePadListBody({ view, onCursor, onToggle }: {
  view: MovePadListView; onCursor: (index: number) => void; onToggle: () => void;
}) {
  return <div className="tweakers-move-pad-list-body" aria-busy={view.pending || undefined}>
    <ListScreen className="tweakers-move-dial-list" follow="center" label={view.label} disabled={view.pending} multiselect items={view.options.map(option => ({ ...option, checked: view.selected.includes(option.value) }))}
      value={view.options[view.cursor]?.value} onFocusItem={value => onCursor(view.options.findIndex(option => option.value === value))}
      onSelect={value => { onCursor(view.options.findIndex(option => option.value === value)); onToggle(); }} />
    {(view.error || view.pending || !view.options.length) && <div className="tweakers-move-pad-list-status" role="status" aria-live="polite">
      {view.error ?? (view.pending ? 'Starting…' : 'No options available.')}
    </div>}
  </div>;
}

/** The small slot dictionary — every pad face the kit knows. */
export const MOVE_PAD_LIBRARY = {
  toggle: { description: 'a switch; the pad inverts when it is on', component: MovePadToggleBody },
  icon: { description: 'a switch drawn as its picture alone — no name, the pad inverts when it is on', component: MovePadIconBody },
  value: { description: 'a value the dial above can borrow — hold to peek, tap to latch', component: MovePadValueBody },
  list: { description: 'a checked list above a small pad; its dial walks, Sample selects, a second pad press runs', component: MovePadListBody },
  action: { description: 'a button: a press runs the app’s action', component: MovePadActionBody },
  'icon-label': { description: 'a button wearing its picture beside its name — a press runs the app’s action', component: MovePadIconLabelBody },
  app: { description: 'a cell the app paints itself — a track, a slice, a step', component: MovePadAppBody },
  bend: { description: 'hold and drag to bend the envelope ramp above it', component: MovePadToggleBody },
  wave: { description: 'hold and drag for the stage’s own sine, tap to flip it', component: MovePadWaveBody },
  tabs: { description: '2 to 8 pads: the page’s modes side by side, the current one lit — a name pad optional', component: MovePadTabsBody },
  color: { description: 'a single colour in a small slot — tap latches it onto the dial above, hold peeks; that dial edits and opens it', component: MovePadColorBody },
  band: { description: '2 pads in one column: a high cut over a low cut, drawn as one band on a small screen — each half its own chip', component: MovePadBandBody },
  fade: { description: '2 pads in one row: a fade in and a fade out, each a ramp from its own end of one line — each half its own chip', component: MovePadFadeBody },
  loop: { description: '2 pads in one row: a loop’s start and end, a marker for each on one line — each half its own chip', component: MovePadLoopBody },
} as const satisfies Record<MovePadKind, { description: string; component: unknown }>;

/**
 * The dictionary itself — every big-slot case the kit knows, named, with
 * the component that draws it. `value`, `icon`, `curve` and `enum` are
 * faces of shared bodies (the same markup, chosen by `moveSlotKind`);
 * every face is reusable; gestures stay with the interactive surface.
 */
export const MOVE_SLOT_LIBRARY = {
  color: { description: 'selected color; hue on the dial, luminosity on volume, tap to edit', component: MoveSlotColorBody },
  opacity: { description: 'overlapping circles showing transparency', component: MoveSlotNumericBody },
  blur: { description: 'pixel blur on a single filled circle', component: MoveSlotNumericBody },
  pan: { description: 'position between L, C and R references', component: MoveSlotNumericBody },
  'stereo-width': { description: 'stereo separation with a unity reference', component: MoveSlotNumericBody },
  pitch: { description: 'signed pitch ruler with a zero reference', component: MoveSlotNumericBody },
  trim: { description: 'one edge of a take — the kept part filled from the far end, the value beneath', component: MoveSlotNumericBody },
  offset: { description: 'a signed nudge — the room it can move in, a pin where it is now, a chevron for each way left', component: MoveSlotOffsetBody },
  'trim-span': { description: '2 slots: a take’s start and end on one line, a flag per edge', component: MoveSlotTrimSpanBody },
  gate: { description: '3 slots: threshold and release as bars, look-ahead as a line, the gate live on a grid between', component: MoveSlotGateBody },
  vector: { description: '3 slots: x, y and a depth z as one stage — the mark on a ruled floor, its height a stalk from its shadow, its distance its size', component: MoveSlotVectorBody },
  channel: { description: 'a slot per channel: icon and name in its tone over a fader filled to its level', component: MoveSlotChannelBody },
  multiband: { description: 'a slot per dial: amount as a bar, speed as a gauge, the bands as a live curve on a grid', component: MoveSlotMultibandBody },
  playback: { description: 'explicit playback traversal with a named mode', component: MoveSlotEnumBody },
  default: { description: 'name centred, value on touch, fill bar', component: MoveSlotDefaultBody },
  value: { description: 'value-first: the value is the headline, the name a tag on top', component: MoveSlotDefaultBody },
  icon: { description: 'option picker showing the current option as a glyph', component: MoveSlotEnumBody },
  curve: { description: 'option picker drawing the current option’s shape — curve selection', component: MoveSlotEnumBody },
  enum: { description: 'stepped option picker showing every option on a list screen', component: MoveSlotEnumBody },
  xy: { description: 'two axes in one gesture field, or a live shape preview', component: MoveSlotXYBody },
  range: { description: 'two handles on one bar; volume knob is the second hand', component: MoveSlotRangeBody },
  filter: { description: '2 slots: cutoff + resonance as one response picture', component: MoveSlotFilterBody },
  env: { description: '4 slots: the whole ADSR as one shape, a caption per stage', component: MoveSlotEnvBody },
  scope: { description: 'a dial with the live signal filling it behind the readout', component: MoveSlotScopeBody },
  toggle: { description: 'a switch in a big slot — the pad’s language at slot size', component: MoveSlotToggleBody },
  'toggle-icon': { description: 'a switch drawn as its own picture — the glyph takes a ban while it is off', component: MoveSlotToggleBody },
  metronome: { description: 'a switch drawn as a metronome — the arm swings to the beat while it is on', component: MoveSlotMetronomeBody },
  transfer: { description: 'a response curve, one knob holding one of its points', component: MoveSlotTransferBody },
  ramp: { description: 'a colour ramp, one knob holding one of its stops — tap to edit its colours', component: MoveSlotRampBody },
  balance: { description: 'the mix between two colour params — the blend fills the slot, the tick is the dial', component: MoveSlotRampBody },
  dial: { description: 'a needle, for values whose two ends are the same place', component: MoveSlotDialBody },
} as const satisfies Record<MoveSlotKind, { description: string; component: unknown }>;
