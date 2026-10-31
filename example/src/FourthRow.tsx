import { useEffect } from 'react';
import { MovePanel, TweakStore, type MoveActionFace, type TweakConfig } from 'tweakers';

/**
 * The fourth pad row, and the faces a small button can wear — on a real
 * eight-column page (`/rows`), since the library's instrument is a strip.
 *
 * A text animator's Motion page: the side it edits (In / Out / Set), the
 * Auto-play switch and the two play buttons sit on the fourth row, named in
 * `moveBottomRow` — so the two rows under every dial are free for its small
 * value chips, Jitter over Random. Up top, two menu pads wear what they have
 * chosen: the motion's curve, and the hit's offset. A press on either steps
 * to the next choice, as a host's pick list would.
 */
export const ROWS_PANEL = 'Fourth row';

/** Easing curves as y at even steps of x, 0..1 — overshoot and anticipation included. */
const sampled = (f: (t: number) => number, n = 33) => Array.from({ length: n }, (_, i) => f(i / (n - 1)));
const CURVES: { label: string; points: number[] }[] = [
  { label: 'Snappy', points: sampled((t) => 1 - (1 - t) ** 4) },
  { label: 'Overshoot', points: sampled((t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2) },
  { label: 'Anticipate', points: sampled((t) => 2.70158 * t ** 3 - 1.70158 * t * t) },
  { label: 'Linear', points: sampled((t) => t) },
];
/** The hit's offset choices, in tenths of a second across ±0.5 s. */
const OFFSETS = [-0.5, -0.2, 0, 0.2, 0.5];

const dial = (value: number) => ({ type: 'slider', default: value, min: 0, max: 1, step: 0.01 }) as const;
const chip = (value: number) => ({ type: 'slider', default: value, min: 0, max: 100, step: 1, unit: '%' }) as const;

function config(curve: number, offset: number): TweakConfig {
  const at = OFFSETS[offset];
  const face = (f: MoveActionFace) => f;
  return {
    duration: { type: 'slider', default: 0.6, min: 0.1, max: 2, step: 0.05, unit: ' s' },
    stagger: dial(0.3),
    distance: dial(0.5),
    turn: dial(0.2),
    // the page's other four dials, so the chips stay chips
    scale: dial(0.4),
    blur: dial(0.1),
    bleed: dial(0),
    glow: dial(0.6),
    jitterDuration: chip(10), randomDuration: chip(0),
    jitterStagger: chip(25), randomStagger: chip(40),
    jitterDistance: chip(0), randomDistance: chip(15),
    jitterTurn: chip(5), randomTurn: chip(60),
    curve: { type: 'action', label: `Curve: ${CURVES[curve].label}`, face: face({ kind: 'curve', points: CURVES[curve].points }) },
    hitOffset: { type: 'action', label: `Offset: ${at > 0 ? '+' : ''}${at.toFixed(1)} s`, face: face({ kind: 'offset', value: at / 0.5 }) },
    side: {
      type: 'select', default: 'in', moveTabs: true,
      options: [{ value: 'in', label: 'In' }, { value: 'out', label: 'Out' }, { value: 'set', label: 'Set' }],
    },
    autoPlay: true,
    playIn: { type: 'action', label: 'Play In' },
    playOut: { type: 'action', label: 'Play Out' },
  } as TweakConfig;
}

const OPTIONS = {
  movePads: {
    jitterDuration: 0, randomDuration: 0, curve: 0,
    jitterStagger: 1, randomStagger: 1,
    jitterDistance: 2, randomDistance: 2, hitOffset: 2,
    jitterTurn: 3, randomTurn: 3,
    side: 0, autoPlay: 5, playIn: 6, playOut: 7,
  },
  moveTopRow: ['curve', 'hitOffset'],
  moveActionRow: ['randomDuration', 'randomStagger', 'randomDistance', 'randomTurn'],
  moveBottomRow: ['side', 'autoPlay', 'playIn', 'playOut'],
  labels: Object.fromEntries(['Duration', 'Stagger', 'Distance', 'Turn'].flatMap((name) => [
    [`jitter${name}`, 'Jitter'], [`random${name}`, 'Random'],
  ])),
};

export default function FourthRow() {
  useEffect(() => {
    let curve = 0;
    let offset = 3;
    TweakStore.registerPanel(ROWS_PANEL, ROWS_PANEL, config(curve, offset), undefined, OPTIONS);
    const off = TweakStore.subscribeActions(ROWS_PANEL, (path) => {
      if (path === 'curve') curve = (curve + 1) % CURVES.length;
      else if (path === 'hitOffset') offset = (offset + 1) % OFFSETS.length;
      else return;
      TweakStore.updatePanel(ROWS_PANEL, ROWS_PANEL, config(curve, offset), undefined, OPTIONS);
    });
    return () => { off(); TweakStore.unregisterPanel(ROWS_PANEL); };
  }, []);
  return (
    <main style={{ padding: 32, maxWidth: 760, margin: '0 auto', color: '#dee3c9', fontFamily: 'system-ui, sans-serif' }}>
      <h1>The fourth pad row</h1>
      <p>
        In / Out / Set, Auto-play and the two play buttons sit on the Move’s fourth pad row, named in
        <code> moveBottomRow</code>. The two rows under each dial hold its Jitter and Random chips. The
        Curve and Offset pads up top wear what they have chosen; press one for the next choice.
      </p>
      <MovePanel panels={ROWS_PANEL} theme="dark" dock="flow" productionEnabled />
    </main>
  );
}
