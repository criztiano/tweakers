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
