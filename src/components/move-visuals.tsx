import type { CSSProperties } from 'react';
import { LUCIDE_ICONS } from '../icons';
import type { MoveNumericDrawing, MovePlaybackMode } from '../move-visual-core';

/** A static value specimen; labels and precise readouts never inherit its effects. */
export function MoveSlotNumericBody({ label, value, drawing }: {
  label: string;
  value: string;
  drawing: MoveNumericDrawing;
}) {
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
        {drawing.kind === 'opacity' && (
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

const place = (position: number) => Math.max(0, Math.min(1, position));
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
  const icon = mode === 'scissors' ? 'scissors' : mode === 'ping-pong' ? 'arrow-left-right' : 'arrow-right';
  return (
    <svg className="tweakers-move-dial-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={mode === 'reverse' ? 'translate(24 0) scale(-1 1)' : undefined}>
        {LUCIDE_ICONS[icon].map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}
