import { useEffect } from 'react';
import { MovePanel, TweakStore, type TweakConfig } from 'tweakers';

/**
 * A dial's nested layer, on a real eight-column page (`/nest`) — the
 * library's instrument is a strip, and a strip has room for every slot.
 *
 * A text animator's Motion page has all eight dials taken, and Dispersion
 * needs four more knobs than its dial holds. Each names it in `moveNest`, so
 * none takes a slot: a double-click (or a double tap, or Enter) on Dispersion
 * lifts them over the grid, child k on column k, and Escape, Back or the
 * "‹ Dispersion" tab puts the sheet away.
 */
export const NEST_PANEL = 'Nested layer';

const dial = (value: number) => ({ type: 'slider', default: value, min: 0, max: 1, step: 0.01 }) as const;
const chip = (value: number) => ({ type: 'slider', default: value, min: 0, max: 100, step: 1, unit: '%', moveChip: true }) as const;

const CONFIG = {
  duration: { type: 'slider', default: 0.6, min: 0.1, max: 2, step: 0.05, unit: ' s' },
  stagger: dial(0.3),
  distance: dial(0.5),
  turn: dial(0.2),
  scale: dial(0.4),
  blur: dial(0.1),
  dispersion: dial(0.5),
  glow: dial(0.6),
  // Dispersion's own small amounts, under its dial as ever.
  jitter: chip(10),
  random: chip(40),
  // …and what its dial cannot hold: a layer of its own.
  spread: { ...dial(0.35), moveNest: 'dispersion' },
  angle: { type: 'slider', default: 0, min: -180, max: 180, step: 1, unit: '°', bipolar: true, moveNest: 'dispersion' },
  falloff: { type: 'select', default: 'soft', options: [{ value: 'linear', label: 'Linear' }, { value: 'soft', label: 'Soft' }, { value: 'hard', label: 'Hard' }], moveNest: 'dispersion' },
  seed: { type: 'slider', default: 12, min: 0, max: 99, step: 1, display: 'value', moveNest: 'dispersion' },
} as TweakConfig;

const OPTIONS = {
  movePads: { jitter: 6, random: 6 },
  moveActionRow: ['random'],
};

// `?dock=viewport` pins the panel to the window's foot instead.
const DOCK = new URLSearchParams(location.search).get('dock') === 'viewport' ? 'viewport' : 'flow';

export default function NestedLayer() {
  useEffect(() => {
    TweakStore.registerPanel(NEST_PANEL, NEST_PANEL, CONFIG, undefined, OPTIONS);
    return () => TweakStore.unregisterPanel(NEST_PANEL);
  }, []);
  return (
    <main style={{ padding: 32, maxWidth: 1240, margin: '0 auto', color: '#dee3c9', fontFamily: 'system-ui, sans-serif' }}>
      <h1>A dial’s nested layer</h1>
      <p>
        All eight dials are taken, and Dispersion needs four more knobs. Each names it in
        <code> moveNest</code>, so none takes a slot: the small + on Dispersion says there is more
        inside. Double-click it (or double tap, or focus it and press Enter) and its layer lifts over
        the grid, each knob on a dial column of its own. Escape, the Move’s Back, or the
        “‹ Dispersion” tab puts it away.
      </p>
      <MovePanel panels={NEST_PANEL} theme="dark" dock={DOCK} productionEnabled />
    </main>
  );
}
