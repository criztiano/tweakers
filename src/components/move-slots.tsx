import type { CSSProperties, ReactNode } from 'react';
import { moveNumericDrawing, movePlaybackMode, type MovePlaybackMode } from '../move-visual-core';
import { MoveSlotNumericBody, MoveSlotPlaybackDrawing } from './move-visuals';
export { MoveSlotNumericBody, MoveSlotPlaybackDrawing } from './move-visuals';
import type { ControlMeta } from '../store/TweakStore';
import { ICON_BADGE_OFF, ICON_BADGE_ON, LUCIDE_ICONS } from '../icons';
import { enumOptionLabel, enumOptionValue } from '../move-layout';
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
 * - `opacity`, `blur`, `pan`, `stereo-width`, `pitch` — explicit numeric
 *   meanings, drawn as specimens or positioned against domain references.
 * - `playback` — an explicitly mapped playback icon.
 * - `filter`  — the 2-slot control: cutoff and resonance as one picture,
 *   the magnitude response maximised across both columns, each hand's
 *   small label sitting where its own slot's label would have been.
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
  | 'dial'
  | 'opacity'
  | 'blur'
  | 'pan'
  | 'stereo-width'
  | 'pitch'
  | 'playback'
  | 'env'
  | 'scope'
  | 'toggle'
  | 'toggle-icon';

/** Which face a control wears in its slot, from its meta and moment. */
export function moveSlotKind(
  meta: ControlMeta,
  opts: { enum?: boolean; shape?: string | null; glyph?: string | null; valueFirst?: boolean; value?: unknown; stage?: string | null } = {}
): MoveSlotKind {
  if (meta.type === 'color') return 'color';
  if (meta.type === 'filter') return 'filter';
  if (opts.stage) return 'env';
  if (meta.type === 'toggle') return meta.icon ? 'toggle-icon' : 'toggle';
  if (meta.type === 'transfer') return 'transfer';
  if (meta.type === 'gradient') return 'ramp';
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

/** The slot's centred name, and the value that takes its place on touch. */
export function MoveSlotReadout({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="tweakers-move-dial-readout">
      <span className="tweakers-move-dial-label" data-long={label.length > 9 || undefined}>
        {label}
      </span>
      <span className="tweakers-move-dial-value">{value}</span>
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
export function MoveSlotRampBody({ label, value, css, stop }: {
  label: string;
  value: ReactNode;
  /** The ramp as a CSS `linear-gradient(...)`. */
  css: string;
  /** The held stop's position 0..1, or null. */
  stop: number | null;
}) {
  return (
    <>
      <MoveSlotDisplay>
        <span className="tweakers-move-slot-ramp" style={{ background: css }} />
        {stop !== null && (
          // Inset a hair so a stop at either end still shows its whole tick —
          // the only thing saying which stop the knob is holding.
          <span
            className="tweakers-move-slot-tick"
            style={{ left: `calc(${stop * 100}% + ${(0.5 - stop) * 4}px)` }}
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
    return (
      <>
        <span className="tweakers-move-dial-toggle-indicator" data-on={checked || undefined} />
        <span className="tweakers-move-dial-toggle-label">{label}</span>
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
 */
export type MovePadKind = 'toggle' | 'value' | 'action' | 'app' | 'bend' | 'wave';

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

/** The small slot dictionary — every pad face the kit knows. */
export const MOVE_PAD_LIBRARY = {
  toggle: { description: 'a switch; the pad inverts when it is on', component: MovePadToggleBody },
  value: { description: 'a value the dial above can borrow — hold to peek, tap to latch', component: MovePadValueBody },
  action: { description: 'a button: a press runs the app’s action', component: MovePadActionBody },
  app: { description: 'a cell the app paints itself — a track, a slice, a step', component: MovePadAppBody },
  bend: { description: 'hold and drag to bend the envelope ramp above it', component: MovePadToggleBody },
  wave: { description: 'hold and drag for the stage’s own sine, tap to flip it', component: MovePadWaveBody },
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
  transfer: { description: 'a response curve, one knob holding one of its points', component: MoveSlotTransferBody },
  ramp: { description: 'a colour ramp, one knob holding one of its stops', component: MoveSlotRampBody },
  dial: { description: 'a needle, for values whose two ends are the same place', component: MoveSlotDialBody },
} as const satisfies Record<MoveSlotKind, { description: string; component: unknown }>;
