import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { formatTimelineTick, timelineTicks } from '../src/move-timeline';
import '../src/styles/theme.css';

/*
 * How thin can a timeline row get? The same eight layers at six row heights,
 * from today's 18px down to 4px, each adapting what no longer fits. A static
 * picture drawn with the kit's own timeline styles — nothing is wired.
 */

const DURATION = 24;
const PLAYHEAD = 9.2;
const LOOP = { start: 4, end: 10 };

type Clip = { at: number; duration: number; joins?: number[]; repeat?: boolean; marker?: boolean };
type Layer = { name: string; clips: Clip[] };

const LAYERS: Layer[] = [
  { name: 'Title', clips: [{ at: 0.6, duration: 5, joins: [1.2, 4.2] }] },
  { name: 'Push', clips: [{ at: 6, duration: 8 }] },
  { name: 'Vignette', clips: [{ at: 12, duration: 4 }] },
  { name: 'Pulse', clips: [{ at: 16, duration: 1, joins: [0.5], repeat: true }] },
  { name: 'Grade', clips: [{ at: 2, duration: 7 }] },
  { name: 'Caption', clips: [{ at: 9.5, duration: 3.5 }, { at: 18, duration: 4 }] },
  { name: 'Shake', clips: [{ at: 20, duration: 1.2 }] },
  { name: 'Takes', clips: [{ at: 7.6, duration: 1.3, marker: true }, { at: 19, duration: 2, marker: true }] },
];

type Variant = { row: number; gap: number; title: string; note: string };

const VARIANTS: Variant[] = [
  { row: 18, gap: 3, title: '18px — today', note: 'Names at 12px, each clip carries its length, joins as hairlines.' },
  { row: 14, gap: 3, title: '14px', note: 'Names at 11px, lengths shrink to 9px, clips lose a pixel of inset.' },
  { row: 10, gap: 2, title: '10px', note: 'Lengths go — the ruler already tells time. Names at 10px, tighter corners.' },
  { row: 8, gap: 2, title: '8px', note: 'Names drop to 8px in a narrower column — the edge of legible. Clips fill the whole row.' },
  { row: 6, gap: 2, title: '6px', note: 'No room for names: the column shrinks to a gutter of marks (hover a row for its name). Lanes become a hairline; clips are solid bars, joins are gaps.' },
  { row: 4, gap: 2, title: '4px', note: 'Pure shape: bars on a hairline, joins as cuts. The card is barely taller than the ruler — a map of where things happen more than an editor.' },
];

const pct = (t: number) => `${(t / DURATION) * 100}%`;

const CSS = `
.rows-page { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }
.rows-page h1 { font-family: 'Geist Pixel', system-ui; font-weight: 400; font-size: 28px; margin: 0 0 8px; }
.rows-page > p { margin: 0 0 40px; opacity: 0.6; font-size: 14px; line-height: 1.6; max-width: 640px; }
.rows-variant { margin-bottom: 44px; }
.rows-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px; font-family: 'Geist Pixel', system-ui; }
.rows-head b { font-weight: 400; font-size: 18px; }
.rows-head span { font-size: 12px; opacity: 0.5; }
.rows-note { margin: 0 0 12px; font-size: 13px; opacity: 0.6; line-height: 1.5; }

/* Static placement: percentages instead of the component's live pixels. */
.rows-variant .tweakers-move-timeline-playhead { transform: none; }
.rows-variant .tweakers-move-timeline-lanes { cursor: default; }
.rows-variant .tweakers-move-timeline-clip { cursor: default; }

/* 14px */
.rows-variant[data-row="14"] .tweakers-move-timeline-name { font-size: 11px; }
.rows-variant[data-row="14"] .tweakers-move-timeline-clip { top: 2px; bottom: 2px; }
.rows-variant[data-row="14"] .tweakers-move-timeline-clip-length { font-size: 9px; }

/* 10px */
.rows-variant[data-row="10"] .tweakers-move-timeline-name { font-size: 10px; }
.rows-variant[data-row="10"] .tweakers-move-timeline-lane { border-radius: 3px; }
.rows-variant[data-row="10"] .tweakers-move-timeline-clip,
.rows-variant[data-row="10"] .tweakers-move-timeline-ghost { top: 1px; bottom: 1px; border-radius: 2px; }

/* 8px */
.rows-variant[data-row="8"] .tweakers-move-timeline { --move-timeline-names: 72px; }
.rows-variant[data-row="8"] .tweakers-move-timeline-name { font-size: 8px; }
.rows-variant[data-row="8"] .tweakers-move-timeline-lane { border-radius: 2px; }
.rows-variant[data-row="8"] .tweakers-move-timeline-clip,
.rows-variant[data-row="8"] .tweakers-move-timeline-ghost { top: 0; bottom: 0; border-radius: 2px; }
.rows-variant[data-row="8"] .tweakers-move-timeline-clip[data-marker] { box-shadow: inset 0 0 0 1px var(--move-timeline-ink); }

/* 6px and 4px: shapes only */
.rows-variant[data-row="6"] .tweakers-move-timeline,
.rows-variant[data-row="4"] .tweakers-move-timeline { --move-timeline-names: 28px; --move-timeline-ruler: 20px; }
.rows-variant[data-row="6"] .tweakers-move-timeline-name,
.rows-variant[data-row="4"] .tweakers-move-timeline-name { font-size: 0; padding: 0 0 0 10px; position: relative; }
.rows-variant[data-row="6"] .tweakers-move-timeline-name::before,
.rows-variant[data-row="4"] .tweakers-move-timeline-name::before {
  content: ''; position: absolute; left: 10px; top: 50%; width: 8px; height: 1px; background: var(--move-timeline-ink); opacity: 0.35;
}
.rows-variant[data-row="6"] .tweakers-move-timeline-lane,
.rows-variant[data-row="4"] .tweakers-move-timeline-lane { background: none; border-radius: 0; overflow: visible; }
.rows-variant[data-row="6"] .tweakers-move-timeline-lane::before,
.rows-variant[data-row="4"] .tweakers-move-timeline-lane::before {
  content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--move-timeline-ink); opacity: 0.1;
}
.rows-variant[data-row="6"] .tweakers-move-timeline-clip,
.rows-variant[data-row="6"] .tweakers-move-timeline-ghost,
.rows-variant[data-row="4"] .tweakers-move-timeline-clip,
.rows-variant[data-row="4"] .tweakers-move-timeline-ghost { top: 0; bottom: 0; padding: 0; border-radius: 999px; }
.rows-variant[data-row="6"] .tweakers-move-timeline-clip[data-marker],
.rows-variant[data-row="4"] .tweakers-move-timeline-clip[data-marker] {
  box-shadow: none; background: color-mix(in srgb, var(--move-timeline-ink) 45%, transparent);
}
/* the join as a cut through the bar, not a line on it */
.rows-variant[data-row="6"] .tweakers-move-timeline-join::after,
.rows-variant[data-row="4"] .tweakers-move-timeline-join::after { width: 2px; left: 2.5px; opacity: 1; }
.rows-variant[data-row="6"] .tweakers-move-timeline-tick-label,
.rows-variant[data-row="4"] .tweakers-move-timeline-tick-label { font-size: 10px; bottom: 8px; }
.rows-variant[data-row="4"] .tweakers-move-timeline-playhead::before { width: 6px; height: 6px; left: -2px; border-radius: 3px; }
.rows-variant[data-row="4"] .tweakers-move-timeline-ghost { opacity: 0.28; }
`;

function Card({ variant }: { variant: Variant }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ h: number; w: number }>({ h: 0, w: 960 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ h: Math.round(el.getBoundingClientRect().height), w: el.getBoundingClientRect().width });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rulerWidth = Math.max(1, size.w - 4 * 2 - 10 - (variant.row <= 6 ? 28 : variant.row === 8 ? 72 : 88));
  const ticks = timelineTicks(0, DURATION, rulerWidth);
  const withLength = variant.row >= 14;

  return (
    <section className="rows-variant" data-row={variant.row}>
      <div className="rows-head">
        <b>{variant.title}</b>
        <span>row {variant.row}px · gap {variant.gap}px · card {size.h}px tall</span>
      </div>
      <p className="rows-note">{variant.note}</p>
      <div
        ref={ref}
        className="tweakers-move-surface tweakers-move-timeline"
        data-variant="page"
        style={{ '--move-timeline-row': `${variant.row}px`, '--move-timeline-row-gap': `${variant.gap}px` } as CSSProperties}
      >
        <div className="tweakers-move-timeline-display">
          <div className="tweakers-move-timeline-corner">
            {variant.row > 6 && <span className="tweakers-move-timeline-title">Edit</span>}
          </div>
          <div className="tweakers-move-timeline-ruler" style={{ cursor: 'default' }}>
            <div className="tweakers-move-timeline-loop" data-on style={{ left: pct(LOOP.start), width: pct(LOOP.end - LOOP.start) }} />
            {ticks.minor.map((t) => (
              <span key={`m${t}`} className="tweakers-move-timeline-tick" style={{ left: pct(t) }} />
            ))}
            {ticks.major.map((t) => (
              <span key={`M${t}`} className="tweakers-move-timeline-tick" data-major style={{ left: pct(t) }}>
                {t < DURATION - 1 && <span className="tweakers-move-timeline-tick-label">{formatTimelineTick(t, ticks.step)}</span>}
              </span>
            ))}
          </div>
          <div className="tweakers-move-timeline-names">
            {LAYERS.map((layer) => (
              <div key={layer.name} className="tweakers-move-timeline-name" title={layer.name}>{layer.name}</div>
            ))}
          </div>
          <div className="tweakers-move-timeline-lanes">
            <div className="tweakers-move-timeline-loop-lanes" style={{ left: pct(LOOP.start), width: pct(LOOP.end - LOOP.start) }} />
            {LAYERS.map((layer) => (
              <div key={layer.name} className="tweakers-move-timeline-lane" title={layer.name}>
                {layer.clips.map((clip) => (
                  <ClipBar key={clip.at} clip={clip} withLength={withLength} />
                ))}
              </div>
            ))}
          </div>
          <div className="tweakers-move-timeline-heads" aria-hidden="true">
            <div className="tweakers-move-timeline-playhead" style={{ left: `calc(${pct(PLAYHEAD)} - 1px)` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ClipBar({ clip, withLength }: { clip: Clip; withLength: boolean }) {
  const ghosts: number[] = [];
  if (clip.repeat) for (let t = clip.at + clip.duration; t < DURATION - 1e-6; t += clip.duration) ghosts.push(t);
  return (
    <>
      {ghosts.map((t) => (
        <div
          key={t}
          className="tweakers-move-timeline-ghost"
          style={{ left: pct(t), width: `calc(${pct(Math.min(clip.duration, DURATION - t))} - 2px)` }}
        />
      ))}
      <div
        className="tweakers-move-timeline-clip"
        data-marker={clip.marker || undefined}
        style={{ left: pct(clip.at), width: pct(clip.duration) }}
      >
        {clip.joins?.map((j) => (
          <span key={j} className="tweakers-move-timeline-join" style={{ left: `${(j / clip.duration) * 100}%` }} />
        ))}
        {withLength && clip.duration >= 2 && <span className="tweakers-move-timeline-clip-length">{clip.duration}s</span>}
      </div>
    </>
  );
}

function Page() {
  return (
    <main className="rows-page">
      <style>{CSS}</style>
      <h1>Timeline rows, squashed</h1>
      <p>
        The same eight layers at six row heights. Each step down gives up what
        no longer fits — lengths, then names, then lane backgrounds — so the
        card spends its height on the clips. A still picture: nothing here is
        wired.
      </p>
      {VARIANTS.map((variant) => (
        <Card key={variant.row} variant={variant} />
      ))}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
