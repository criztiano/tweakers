import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { LUCIDE_ICONS } from '../icons';
import type { MoveNumericDrawing, MovePlaybackMode } from '../move-visual-core';

/** The speed gauge's drawing, in its own viewBox units (1 unit = 1px): a
 *  dome of radius `r` on a baseline `base` below its centre, graded across
 *  `sweep` degrees either side of straight up. */
export const MOVE_GAUGE = { r: 36, base: 18, half: 43, top: 37, height: 56, sweep: 110, ticks: 11 } as const;

const place = (position: number) => Math.max(0, Math.min(1, position));

/** Where a value (0..1) points on the gauge: a compass bearing, 0 = up. */
export const moveGaugeBearing = (position: number) => (place(position) * 2 - 1) * MOVE_GAUGE.sweep;

/**
 * The speed gauge: a needle on a graded dome, the ticks lit up to it. One
 * drawing for the multiband cleaner's speed and the standalone gauge slot;
 * `className` places it, and `track` names it for a gesture that reads it.
 */
export function MoveGauge({ position, className, track }: { position: number; className: string; track?: string }) {
  const { r, base, half, top, height, sweep, ticks } = MOVE_GAUGE;
  const foot = Math.sqrt(r * r - base * base);
  const point = (bearing: number, radius: number) => {
    const rad = (bearing * Math.PI) / 180;
    return [radius * Math.sin(rad), -radius * Math.cos(rad)] as const;
  };
  const needle = point(moveGaugeBearing(position), r * 0.62);
  return (
    <svg className={className} data-track={track} viewBox={`${-half} ${-top} ${half * 2} ${height}`} aria-hidden="true">
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

/** A static value specimen; labels and precise readouts never inherit its effects. */
export function MoveSlotNumericBody({ label, value, drawing }: {
  label: string;
  value: string;
  drawing: MoveNumericDrawing;
}) {
  // The gauge brings its own drawing space; the name and the reading sit
  // where every specimen keeps them.
  if (drawing.kind === 'gauge') {
    return (
      <>
        <span className="tweakers-move-dial-tag">{label}</span>
        <MoveGauge position={drawing.position} className="tweakers-move-visual" />
        <span className="tweakers-move-dial-option tweakers-move-visual-value">{value}</span>
      </>
    );
  }
  if (drawing.kind === 'diaphragm') {
    return <MoveSlotDiaphragmBody label={label} value={value} position={drawing.position} zero={drawing.zero} />;
  }
  if (drawing.kind === 'streak') {
    return <MoveSlotStreakBody label={label} value={value} position={drawing.position} />;
  }
  if (drawing.kind === 'clock') {
    return <MoveSlotClockBody label={label} value={value} rate={drawing.rate} frozen={drawing.frozen}
      tempo={drawing.tempo} hand={drawing.hand} />;
  }
  // The offset is a room, not a specimen: it wants rules, hatching and a
  // standing pin rather than a line in the shared 100 × 60 picture band.
  if (drawing.kind === 'offset') {
    return (
      <MoveSlotOffsetBody
        label={label}
        value={value}
        origin={drawing.origin}
        position={drawing.position}
        back={drawing.back}
        forward={drawing.forward}
      />
    );
  }
  return (
    <>
      <span className="tweakers-move-dial-tag">{label}</span>
      <svg className="tweakers-move-visual" viewBox="0 0 100 60" aria-hidden="true">
        {drawing.kind === 'opacity' && drawing.picture && (
          <>
            <rect className="tweakers-move-visual-guide" x="0.5" y="0.5" width="99" height="59" rx="3" />
            <image href={drawing.picture} x="0" y="0" width="100" height="60" preserveAspectRatio="xMidYMid meet" opacity={drawing.alpha} />
          </>
        )}
        {drawing.kind === 'opacity' && !drawing.picture && (
          <>
            <circle className="tweakers-move-visual-guide" cx="40" cy="30" r="18" />
            <circle className="tweakers-move-visual-guide" cx="60" cy="30" r="18" />
            <circle className="tweakers-move-visual-solid" cx="60" cy="30" r="18" opacity={drawing.alpha} />
          </>
        )}
        {drawing.kind === 'blur' && (
          <circle className="tweakers-move-visual-solid" cx="50" cy="30" r="14"
            style={{ filter: `blur(${drawing.radius}px)` }} />
        )}
        {drawing.kind === 'pan' && (
          <>
            <path className="tweakers-move-visual-guide" d="M16 30H84M50 12V48" />
            <path className="tweakers-move-visual-line" d={`M50 30H${16 + drawing.position * 68}`} />
            <circle className="tweakers-move-visual-point"
              data-offset={Math.abs(drawing.position - 0.5) > 1e-9 || undefined}
              cx={16 + drawing.position * 68} cy="30" r="5" />
            <text x="5" y="30" dominantBaseline="central">L</text><text x="95" y="30" dominantBaseline="central">R</text>
          </>
        )}
        {drawing.kind === 'stereo-width' && (
          <>
            <path className="tweakers-move-visual-guide" d="M50 13V47" />
            {drawing.unity !== null && (
              <g className="tweakers-move-visual-reference">
                <ellipse cx={50 - drawing.unity * 28} cy="30" rx="12" ry="17" />
                <ellipse cx={50 + drawing.unity * 28} cy="30" rx="12" ry="17" />
              </g>
            )}
            <g className="tweakers-move-visual-lobes">
              <ellipse cx={50 - drawing.separation * 28} cy="30" rx="12" ry="17" />
              <ellipse cx={50 + drawing.separation * 28} cy="30" rx="12" ry="17" />
            </g>
          </>
        )}
        {drawing.kind === 'trim' && (
          <>
            <path className="tweakers-move-visual-guide" d="M8 30H92" />
            <path
              className="tweakers-move-visual-line"
              d={drawing.edge === 'start'
                ? `M${8 + drawing.position * 84} 30H92`
                : `M8 30H${8 + drawing.position * 84}`}
            />
            <path
              className="tweakers-move-visual-pitch-marker"
              data-offset={(drawing.edge === 'start' ? drawing.position > 1e-9 : drawing.position < 1 - 1e-9) || undefined}
              d={`M${8 + drawing.position * 84} 22l-5 -7h10z`}
            />
          </>
        )}
        {drawing.kind === 'pitch' && (
          <g>
            <path className="tweakers-move-visual-guide" d="M8 30H92M8 25V35M29 27V33M50 25V35M71 27V33M92 25V35" />
            {drawing.zero !== null && (
              <path className="tweakers-move-visual-reference" d={`M${8 + drawing.zero * 84} 12V48`} />
            )}
            <path className="tweakers-move-visual-line" d={`M${8 + (drawing.zero ?? 0) * 84} 30H${8 + drawing.position * 84}`} />
            <path className="tweakers-move-visual-pitch-marker"
              data-offset={drawing.zero === null || Math.abs(drawing.position - drawing.zero) > 1e-9 || undefined}
              d={`M${8 + drawing.position * 84} 22l-5 -7h10z`} />
          </g>
        )}
      </svg>
      <span className="tweakers-move-dial-option tweakers-move-visual-value">{value}</span>
    </>
  );
}

/**
 * The pin that stands over the offset's track: a drop with a hole punched
 * through it, so the head reads as a marker rather than a blob. Figma
 * 988:1630 — the drop, then its 8-unit eye as a second ring the even-odd
 * fill opens up.
 */
const OFFSET_PIN = 'M7.5 0C11.6406 0 15 3.28125 15 7.38281C15 12.0312 10.3125 17.6172 8.35938 19.7266C7.89062 20.2344 7.10938 20.2344 6.64062 19.7266C4.6875 17.6172 0 12.0312 0 7.38281C0 3.28125 3.35938 0 7.5 0ZM11.5 7.38281A4 4 0 1 0 3.5 7.38281A4 4 0 1 0 11.5 7.38281Z';

/**
 * A way out of where it sits: a double chevron pointing left (Figma
 * 988:1602), drawn as two arms so the pair reads as travel rather than as a
 * bracket. The near arm is the solid one, the far arm the trail — the way
 * fades off in the direction it goes.
 */
const OFFSET_WAY_NEAR = 'M13.4277 11.4969C13.1168 11.8078 12.6126 11.8077 12.3015 11.4969L7.23278 6.42815C6.92176 6.11712 6.92176 5.61296 7.23278 5.30193L12.3015 0.233194C12.6126 -0.0775985 13.1168 -0.0777559 13.4277 0.233194C13.7387 0.544144 13.7385 1.04836 13.4277 1.35941L9.71854 5.0686L9.71854 6.66148L13.4277 10.3707C13.7385 10.6817 13.7387 11.1859 13.4277 11.4969Z';
const OFFSET_WAY_FAR = 'M6.42822 11.4968C6.11727 11.8078 5.61306 11.8076 5.30201 11.4968L0.23327 6.42811C-0.0777563 6.11708 -0.0777563 5.61292 0.233271 5.30189L5.30201 0.233154C5.61306 -0.0776386 6.11728 -0.077796 6.42822 0.233154C6.73917 0.544104 6.73902 1.04832 6.42822 1.35937L2.71903 5.06856L2.71903 6.66144L6.42822 10.3706C6.73902 10.6817 6.73917 11.1859 6.42822 11.4968Z';
/** The way's own box, so its mirror turns about the middle of the pair. */
const OFFSET_WAY_BOX = { w: 13.6609, h: 11.73 };

const at = (position: number) => `${place(position) * 100}%`;

/**
 * The offset face: a thing, and the room it has to move in.
 *
 * The room is the hatched track, closed by a rule top and bottom. The quiet
 * line with the bright head on it is where the thing sits untouched; the pin
 * is where the offset has pushed it to, and the stretch of room between the
 * two fills in — so how far it has been moved is a shape, not a number to be
 * read. The number is underneath for when it has to be exact.
 *
 * Beside the pin are the ways it can still go. Parked, it offers every way
 * that has room — both of them in the middle of its room, one when it is
 * against an end. Moved, it shows the way it took, and pin, line and way all
 * turn orange together: a nudged thing reads as nudged from across a table.
 */
export function MoveSlotOffsetBody({ label, value, origin, position, back, forward }: {
  label: string;
  value: string;
  /** Where it sits at no offset, 0..1 across the track. */
  origin: number;
  /** Where the offset has put it, 0..1 across the same track. */
  position: number;
  /** There is still room, and range, to go that way. */
  back: boolean;
  forward: boolean;
}) {
  const moved = Math.abs(position - origin) > 1e-9;
  const ways: ('back' | 'forward')[] = moved
    ? [position < origin ? 'back' : 'forward']
    : (['back', 'forward'] as const).filter((way) => (way === 'back' ? back : forward));
  const from = Math.min(place(origin), place(position));
  const to = Math.max(place(origin), place(position));
  return (
    <>
      <span className="tweakers-move-dial-tag">{label}</span>
      <div className="tweakers-move-offset" data-moved={moved || undefined} aria-hidden="true">
        {/* The stretch it has been pushed across, cut out of a layer the full
            width of the room — so its ruling stays in step with the ruling
            either side of it instead of restarting at the cut. */}
        <span
          className="tweakers-move-offset-span"
          style={{ clipPath: `inset(0 ${(1 - to) * 100}% 0 ${from * 100}%)` }}
        />
        <span className="tweakers-move-offset-origin" style={{ left: at(origin) }} />
        {ways.map((way) => (
          <svg
            key={way}
            className="tweakers-move-offset-way"
            data-way={way}
            style={{ '--move-offset-at': at(position) } as CSSProperties}
            viewBox={`0 0 ${OFFSET_WAY_BOX.w} ${OFFSET_WAY_BOX.h}`}
          >
            <g transform={way === 'forward' ? `translate(${OFFSET_WAY_BOX.w} 0) scale(-1 1)` : undefined}>
              <path d={OFFSET_WAY_NEAR} />
              <path className="tweakers-move-offset-trail" d={OFFSET_WAY_FAR} />
            </g>
          </svg>
        ))}
        <span className="tweakers-move-offset-pin" style={{ left: at(position) }}>
          <svg className="tweakers-move-offset-head" viewBox="0 0 15 20.1074" fillRule="evenodd">
            <path d={OFFSET_PIN} />
          </svg>
        </span>
      </div>
      <span className="tweakers-move-dial-option tweakers-move-visual-value">{value}</span>
    </>
  );
}

/** Reuse the bundled option icons for playback, mirroring forward for reverse. */
export function MoveSlotPlaybackDrawing({ mode }: { mode: MovePlaybackMode }) {
  const icon = mode === 'scissors' ? 'scissors' : mode === 'ping-pong' ? 'arrow-left-right' : mode === 'bounce' ? 'repeat' : 'arrow-right';
  return (
    <svg className="tweakers-move-dial-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={mode === 'reverse' ? 'translate(24 0) scale(-1 1)' : undefined}>
        {LUCIDE_ICONS[icon].map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}

/** The diaphragm's track, top and bottom, in percent of the slot's height:
 *  between the name on top and the reading underneath. */
const DIAPHRAGM_TRACK = { top: 23, bottom: 70 } as const;
/** How far the sides draw in at the waist, in percent of the slot's width:
 *  a resting throat, and the most it closes at either end of the range. */
const DIAPHRAGM_PULL = { rest: 7, most: 30 } as const;
/** How far up and down the pinch reaches from the waist, in percent of the
 *  slot's height. */
const DIAPHRAGM_REACH = 42;

/**
 * The slot's surface pinched in at `waist` (percent down the slot) by
 * `depth` (percent in from each side): a smooth bump on each side, straight
 * away from it, so the corners keep the slot's own rounding.
 */
function diaphragmClip(waist: number, depth: number): string {
  const steps = 16;
  // Near an end the pinch draws in tighter rather than running off the slot,
  // so the top and bottom edges keep their width and their rounded corners.
  const reach = Math.max(14, Math.min(DIAPHRAGM_REACH, waist - 4, 96 - waist));
  const side = Array.from({ length: steps + 1 }, (_, k) => {
    const y = waist - reach + (2 * reach * k) / steps;
    const u = (y - waist) / reach;
    return { y: Math.max(0, Math.min(100, y)), x: (depth * (1 + Math.cos(Math.PI * u))) / 2 };
  });
  const n = (v: number) => Number(v.toFixed(2));
  const right = side.map((p) => `${n(100 - p.x)}% ${n(p.y)}%`);
  const left = [...side].reverse().map((p) => `${n(p.x)}% ${n(p.y)}%`);
  return `polygon(0% 0%, 100% 0%, ${right.join(', ')}, 100% 100%, 0% 100%, ${left.join(', ')})`;
}

/**
 * A pitch stood upright: the mark rides a vertical line — up is higher —
 * and the slot's own sides draw in toward it like a throat closing, the
 * tighter the further it is from zero. The line is lit from zero to the
 * mark. The name sits on top and the reading underneath, as on every
 * specimen.
 */
export function MoveSlotDiaphragmBody({ label, value, position, zero }: {
  label: string;
  value: string;
  /** Where the pitch is, 0 (lowest) .. 1 (highest). */
  position: number;
  /** Where zero sits on the same run, or null when the range misses it. */
  zero: number | null;
}) {
  const at = place(position);
  const home = zero ?? 0.5;
  const reach = Math.max(home, 1 - home, 1e-9);
  const pull = Math.min(1, Math.abs(at - home) / reach);
  const track = DIAPHRAGM_TRACK.bottom - DIAPHRAGM_TRACK.top;
  const y = (p: number) => DIAPHRAGM_TRACK.top + (1 - place(p)) * track;
  const waist = y(at);
  const depth = DIAPHRAGM_PULL.rest + (DIAPHRAGM_PULL.most - DIAPHRAGM_PULL.rest) * pull;
  const lit = { top: Math.min(waist, y(home)), bottom: 100 - Math.max(waist, y(home)) };
  return (
    <>
      <i className="tweakers-move-diaphragm-surface" style={{ clipPath: diaphragmClip(waist, depth) }} aria-hidden="true" />
      <span className="tweakers-move-dial-tag">{label}</span>
      <span className="tweakers-move-diaphragm-line" style={{ top: `${DIAPHRAGM_TRACK.top}%`, bottom: `${100 - DIAPHRAGM_TRACK.bottom}%` }} aria-hidden="true" />
      <span className="tweakers-move-diaphragm-lit" data-offset={pull > 1e-9 || undefined}
        style={{ top: `${lit.top}%`, bottom: `${lit.bottom}%` }} aria-hidden="true" />
      {zero !== null && <span className="tweakers-move-diaphragm-zero" style={{ top: `${y(zero)}%` }} aria-hidden="true" />}
      <span className="tweakers-move-diaphragm-mark" data-offset={pull > 1e-9 || undefined} style={{ top: `${waist}%` }} aria-hidden="true" />
      <span className="tweakers-move-dial-option tweakers-move-visual-value">{value}</span>
    </>
  );
}

/** A reading split at its last digit: "1.5×" is 1.5 and ×. */
const splitAtNumber = (value: string) => {
  const m = /^(.*\d)(\D*)$/.exec(value.trim());
  return m ? { num: m[1], unit: m[2].trim() } : { num: value, unit: '' };
};

/** The speed lines, top to bottom, each as a share of the longest. */
const STREAK_LINES = [0.5, 0.85, 1, 0.7, 0.4] as const;

/**
 * A speed as its own number, rushing: the reading is the headline and speed
 * lines trail off behind it, longer the faster it runs — at the slow end they
 * shrink to stubs and the number stands still.
 */
export function MoveSlotStreakBody({ label, value, position }: {
  label: string;
  value: string;
  /** Where the speed sits across the dial, 0 (slowest) .. 1 (fastest). */
  position: number;
}) {
  const { num, unit } = splitAtNumber(value);
  const reach = 8 + place(position) * 48;
  return (
    <>
      <span className="tweakers-move-dial-tag">{label}</span>
      <span className="tweakers-move-streak" aria-hidden="true">
        <svg className="tweakers-move-streak-lines" viewBox="0 0 56 40" preserveAspectRatio="xMaxYMid meet">
          {STREAK_LINES.map((share, k) => (
            <line key={k} x1={56 - reach * share} x2={52} y1={6 + k * 7} y2={6 + k * 7}
              style={{ opacity: 0.35 + 0.65 * share }} />
          ))}
        </svg>
        <span className="tweakers-move-streak-number">
          {num}
          {unit && <span className="tweakers-move-streak-unit">{unit}</span>}
        </span>
      </span>
    </>
  );
}

/**
 * A rate something runs at on its own, as a clock. The rate is the headline,
 * top right; the clock keeps the bottom-left corner with its hand where the
 * host says — so the hand going round is the thing running. When the host
 * knows the beat at 1×, the beat this rate makes stands bottom right;
 * otherwise the control's name does. At the dial's minimum it is stopped and
 * the whole face frosts over: the clock goes to ice, the hand stays put.
 *
 * The hand is turned straight on its element, never through a render, like
 * the metronome's arm.
 */
export function MoveSlotClockBody({ label, value, rate, frozen, tempo, hand }: {
  label: string;
  value: string;
  rate: number;
  frozen: boolean;
  tempo: number | null;
  /** Where the hand points now, 0..1 of a turn, or null for twelve. */
  hand?: () => number | null;
}) {
  const needle = useRef<SVGGElement>(null);
  const read = useRef(hand);
  read.current = hand;
  const turns = !!hand && !frozen;

  useEffect(() => {
    const g = needle.current;
    if (!g || !turns || typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') return;
    let frame = 0;
    const tick = () => {
      const at = read.current?.();
      if (typeof at === 'number' && Number.isFinite(at)) g.setAttribute('transform', `rotate(${(((at % 1) + 1) % 1 * 360).toFixed(2)})`);
      else if (at === null) g.setAttribute('transform', 'rotate(0)');
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    return () => window.cancelAnimationFrame(frame);
  }, [turns]);

  const { num, unit } = splitAtNumber(value);
  const beat = tempo !== null && !frozen ? `${Number((tempo * rate).toFixed(1))} BPM` : null;
  return (
    <>
      {frozen && <i className="tweakers-move-clock-frost" aria-hidden="true" />}
      <span className="tweakers-move-clock-readout" data-frozen={frozen || undefined}>
        <span className="tweakers-move-dial-number">{num}</span>
        {unit && <span className="tweakers-move-clock-unit">{unit}</span>}
      </span>
      <span className="tweakers-move-clock-picture" aria-hidden="true">
        <svg className="tweakers-move-clock" data-frozen={frozen || undefined} viewBox="-22 -22 44 44">
          {frozen && (
            <g className="tweakers-move-clock-ice">
              {Array.from({ length: 12 }, (_, k) => (
                <path key={k} transform={`rotate(${k * 30})`} d={k % 3 === 0 ? 'M0 -17.5V-21.5M-1.8 -20.2L0 -21.5L1.8 -20.2' : 'M0 -17.5V-19.8'} />
              ))}
            </g>
          )}
          <circle className="tweakers-move-clock-disc" r="16" />
          <g ref={needle} transform="rotate(0)">
            <line className="tweakers-move-clock-hand" x1="0" y1="2" x2="0" y2="-10.5" />
          </g>
          <circle className="tweakers-move-clock-pivot" r="2.2" />
        </svg>
      </span>
      <span className="tweakers-move-clock-foot">{beat ?? label}</span>
    </>
  );
}
