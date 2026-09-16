import type { MovePadListView } from '../move-pad-list';
import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { moveBandCuts, moveNumericDrawing, movePlaybackMode, MOVE_BAND_H, MOVE_BAND_W, type MovePlaybackMode } from '../move-visual-core';
import { MoveSlotNumericBody, MoveSlotPlaybackDrawing } from './move-visuals';
export { MoveSlotNumericBody, MoveSlotPlaybackDrawing } from './move-visuals';
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
 * MovePanel; what lives here is the slot's face: every body is a pure
 * drawing of computed props, so each case can be read, reused, and tested
 * on its own. `moveSlotKind` names which face a control wears.
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
 * - `playback` — an explicitly mapped playback icon.
 * - `filter`  — the 2-slot control: cutoff and resonance as one picture,
 *   the magnitude response maximised across both columns, each hand's
 *   small label sitting where its own slot's label would have been.
 * - `trim-span` — the 2-slot take: a trim start dial beside a trim end dial
 *   drawn as one line, the kept part between a flag for each edge, the
 *   names along the top and the values along the bottom at their own sides.
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
  | 'trim-span'
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
          <span className="tweakers-move-dial-zero" style={{ left: `${originPct}%` }} />
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
        <div className="tweakers-move-band-plot">
          <svg
            className="tweakers-move-band-drawing"
            viewBox={`0 0 ${MOVE_BAND_W} ${MOVE_BAND_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g className="tweakers-move-band-grid" shapeRendering="crispEdges">
              {Array.from({ length: 7 }, (_, i) => (
                <rect key={`x${i}`} x={9 + i * 10} y="0" width="1" height={MOVE_BAND_H} />
              ))}
              {Array.from({ length: 3 }, (_, i) => (
                <rect key={`y${i}`} x="0" y={9 + i * 10} width={MOVE_BAND_W} height="1" />
              ))}
            </g>
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
  'trim-span': { description: '2 slots: a take’s start and end on one line, a flag per edge', component: MoveSlotTrimSpanBody },
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
