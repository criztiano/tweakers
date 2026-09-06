import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  MOVE_SLOT_LIBRARY,
  MOVE_PAD_LIBRARY,
  MoveSlotDefaultBody,
  MoveSlotEnumBody,
  MoveSlotRangeBody,
  MoveSlotXYBody,
  MoveSlotDialBody,
  MoveSlotColorBody,
  MoveSlotRampBody,
  MoveSlotTransferBody,
  MoveSlotFilterBody,
  MoveSlotNumericBody,
  MoveSlotToggleBody,
  MoveSlotScopeBody,
  MoveSlotEnvBody,
  MovePadToggleBody,
  MovePadWaveBody,
  MovePadValueBody,
  MovePadActionBody,
  MovePadAppBody,
  CurveComposer,
  ModRing,
  ModulationStore,
  filterShapePath,
  moveNumericDrawing,
  movePlaybackMode,
  envelopePoints,
  envelopeJoints,
  curveComposition,
  rampCss,
  sampleTransfer,
  type ControlMeta,
  type MoveSlotKind,
  type MovePadKind,
} from 'tweakers';
import { PANEL_ID, MOD_LFO, MOD_ENV, MOD_CURVE } from './panel';

/**
 * Every face, drawn. The live panel above the dictionary shows the ones that
 * are real controls on a page; these specimens are the same bodies with
 * representative props, so the faces that only ever appear somewhere else —
 * the value-first slot a chip borrows, the envelope and the scope on a
 * modulator's page, the composer floating over the panel — sit here at the
 * same level as the rest instead of being described in a sentence.
 */

export type Specimen = {
  /** The dictionary name — the key in MOVE_SLOT_LIBRARY / MOVE_PAD_LIBRARY. */
  kind: string;
  /** How many dial columns the face claims. */
  span?: number;
  /** What it says. */
  description: string;
  /** The control on the live strip that wears it, where there is one. */
  path?: string;
  /** Where it lives, when it is not a control on an ordinary page. */
  note?: string;
  render: () => ReactNode;
};

/* ── helpers ────────────────────────────────────────────────────── */

const meta = (extra: Partial<ControlMeta> & { path: string; label: string }): ControlMeta =>
  ({ type: 'slider', min: 0, max: 1, ...extra } as ControlMeta);

const OPTIONS = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'];

const BELL = Array.from({ length: 48 }, (_, i) => Math.sin((i / 47) * Math.PI));
const path100 = (points: number[]) =>
  points.map((v, i) => `${i ? 'L' : 'M'} ${((i / (points.length - 1)) * 100).toFixed(2)} ${((1 - v) * 100).toFixed(2)}`).join(' ');

const TRANSFER = [{ x: 0, y: 0 }, { x: 0.45, y: 0.7 }, { x: 1, y: 1 }];

const FILTER_META = meta({
  type: 'filter', path: 'tone', label: 'Tone',
  cutoffAxis: { min: 20, max: 20000, step: 1, label: 'Freq' },
  resonanceAxis: { min: 0, max: 1, step: 0.01, label: 'Res' },
});
const FILTER_VALUE = { cutoff: 2400, resonance: 0.4 };

/** A numeric specimen: the drawing the kit derives from `moveVisual`. */
const numeric = (kind: 'opacity' | 'blur' | 'pan' | 'stereo-width' | 'pitch',
                 label: string, value: number, reading: string, extra: Partial<ControlMeta> = {}) => {
  const m = meta({ path: kind, label, moveVisual: { kind } as ControlMeta['moveVisual'], ...extra });
  const drawing = moveNumericDrawing(m, value);
  return drawing ? <MoveSlotNumericBody label={label} value={reading} drawing={drawing} /> : null;
};

/** The LFO's own signal, running — the scope face is a live thing or it is
 *  nothing. Written straight to the path, like the panel's own scope. */
function LiveScope({ index }: { index: number }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const pts: number[] = Array(120).fill(0.5);
    let raf = requestAnimationFrame(function tick() {
      pts.push((ModulationStore.getSignal(index) + 1) / 2);
      pts.shift();
      ref.current?.setAttribute('d', path100(pts));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);
  return (
    <svg className="tweakers-move-scope-wave" data-scope="true" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path ref={ref} />
    </svg>
  );
}

/** The envelope on the library's own ADSR slot, drawn as its four slots. */
function LiveEnvelope() {
  const slot = ModulationStore.getSlot(MOD_ENV);
  const params = {
    attack: 40, decay: 250, sustain: 0.4, release: 700,
    ...(slot?.params ?? {}),
  } as Parameters<typeof envelopePoints>[0];
  const stages = [
    { stage: 'attack', label: 'Attack', value: `${Math.round(Number(params.attack) || 0)} ms` },
    { stage: 'decay', label: 'Decay', value: `${Math.round(Number(params.decay) || 0)} ms` },
    { stage: 'sustain', label: 'Sustain', value: `${Number(Number(params.sustain).toFixed(2))}` },
    { stage: 'release', label: 'Release', value: `${Math.round(Number(params.release) || 0)} ms` },
  ];
  return (
    <MoveSlotEnvBody
      points={envelopePoints(params, 129)}
      stages={stages}
      joints={envelopeJoints(params)}
    />
  );
}

/** The composer that floats over the panel on a curve modulator's page. */
export function LiveComposer() {
  const slot = ModulationStore.getSlot(MOD_CURVE);
  const composition = slot ? curveComposition(slot.params) : null;
  if (!composition) return null;
  return (
    <CurveComposer
      segments={composition.segments}
      direction={composition.direction}
      gap={composition.gap ?? 0}
      selectedIndex={0}
      getPhase={() => ModulationStore.getSlotPhase(MOD_CURVE)}
      onSelect={(i) => ModulationStore.updateSlotParams(MOD_CURVE, { selected: i })}
      onSegmentsChange={(next) => ModulationStore.updateSlotParams(MOD_CURVE, { clips: next as never })}
      width={320}
      height={84}
    />
  );
}

/* ── the big slots, generalist first ────────────────────────────── */

export const BIG_SLOTS: Specimen[] = [
  {
    kind: 'default', path: 'amount',
    description: MOVE_SLOT_LIBRARY.default.description,
    render: () => <MoveSlotDefaultBody label="Amount" value="65%" pct={65} originPct={null} />,
  },
  {
    kind: 'value',
    description: MOVE_SLOT_LIBRARY.value.description,
    note: 'The face a chip wears when a dial borrows it, and every named value on a modulator’s page.',
    render: () => (
      <>
        <span className="tweakers-move-dial-sub">Decay</span>
        <MoveSlotDefaultBody label="Decay" value="250 ms" pct={40} originPct={null} />
      </>
    ),
  },
  {
    kind: 'icon', path: 'direction',
    description: MOVE_SLOT_LIBRARY.icon.description,
    render: () => (
      <MoveSlotEnumBody
        label="Direction" optionLabel="Forward" activeIdx={0}
        options={[{ value: 'forward', label: 'Forward' }, { value: 'back', label: 'Back' }, { value: 'swing', label: 'Swing' }]}
        shape={null} glyph="arrow-right"
      />
    ),
  },
  {
    kind: 'enum', path: 'scale',
    description: MOVE_SLOT_LIBRARY.enum.description,
    render: () => (
      <MoveSlotEnumBody
        label="Scale" optionLabel="Dorian" activeIdx={2}
        options={OPTIONS} shape={null} glyph={null}
      />
    ),
  },
  {
    kind: 'curve', path: 'shape',
    description: MOVE_SLOT_LIBRARY.curve.description,
    render: () => (
      <MoveSlotEnumBody
        label="Shape" optionLabel="Bell" activeIdx={2}
        options={['Rise', 'Fall', 'Bell', 'Ease', 'Bounce']}
        shape={path100(BELL)} glyph={null}
      />
    ),
  },
  {
    kind: 'toggle', path: 'hold',
    description: MOVE_SLOT_LIBRARY.toggle.description,
    render: () => <MoveSlotToggleBody label="Hold" on />,
  },
  {
    kind: 'range', path: 'band',
    description: MOVE_SLOT_LIBRARY.range.description,
    render: () => <MoveSlotRangeBody label="Band" value="20–80" lo={0.2} hi={0.8} />,
  },
  {
    kind: 'xy', path: 'spot',
    description: MOVE_SLOT_LIBRARY.xy.description,
    render: () => <MoveSlotXYBody label="Spot" value="50·50" position={{ x: 0.5, y: 0.5 }} gridN={5} />,
  },
  {
    kind: 'dial', path: 'heading',
    description: MOVE_SLOT_LIBRARY.dial.description,
    render: () => <MoveSlotDialBody label="Heading" value="270°" bearing={270} origin={0} />,
  },
  {
    kind: 'color', path: 'tint',
    description: MOVE_SLOT_LIBRARY.color.description,
    render: () => <MoveSlotColorBody label="Tint" color="#eb644d" hue={9} />,
  },
  {
    kind: 'ramp', path: 'ramp',
    description: MOVE_SLOT_LIBRARY.ramp.description,
    render: () => (
      <MoveSlotRampBody
        label="Ramp" value="2/3"
        css={rampCss([
          { color: '#1b2a4aff', position: 0 },
          { color: '#eb644dff', position: 0.55 },
          { color: '#f7e6b0ff', position: 1 },
        ])}
        stop={0.55}
      />
    ),
  },
  {
    kind: 'transfer', path: 'response',
    description: MOVE_SLOT_LIBRARY.transfer.description,
    render: () => (
      <MoveSlotTransferBody
        label="Response" value="2/3"
        shape={path100(Array.from({ length: 48 }, (_, i) => sampleTransfer(TRANSFER, i / 47)))}
        point={{ x: 0.45, y: 1 - 0.7 }}
      />
    ),
  },
  {
    kind: 'filter', span: 2, path: 'tone',
    description: MOVE_SLOT_LIBRARY.filter.description,
    render: () => (
      <MoveSlotFilterBody
        meta={FILTER_META}
        value={FILTER_VALUE}
        shape={filterShapePath(FILTER_META, FILTER_VALUE)}
      />
    ),
  },
  {
    kind: 'opacity', path: 'opacity',
    description: MOVE_SLOT_LIBRARY.opacity.description,
    render: () => numeric('opacity', 'Opacity', 0.65, '65%'),
  },
  {
    kind: 'blur', path: 'blur',
    description: MOVE_SLOT_LIBRARY.blur.description,
    render: () => numeric('blur', 'Blur', 3, '3 px', { max: 12, unit: ' px' }),
  },
  {
    kind: 'pan', path: 'pan',
    description: MOVE_SLOT_LIBRARY.pan.description,
    render: () => numeric('pan', 'Pan', -0.4, '−0.4', { min: -1, max: 1, bipolar: true }),
  },
  {
    kind: 'stereo-width', path: 'width',
    description: MOVE_SLOT_LIBRARY['stereo-width'].description,
    render: () => numeric('stereo-width', 'Width', 1.4, '1.4×', { max: 2, origin: 1, unit: '×' }),
  },
  {
    kind: 'pitch', path: 'pitch',
    description: MOVE_SLOT_LIBRARY.pitch.description,
    render: () => numeric('pitch', 'Pitch', 7, '+7 st', { min: -24, max: 24, bipolar: true, unit: ' st' }),
  },
  {
    kind: 'playback', path: 'playback',
    description: MOVE_SLOT_LIBRARY.playback.description,
    render: () => {
      const m = meta({ type: 'select', path: 'playback', label: 'Playback', moveVisual: { kind: 'playback' } as ControlMeta['moveVisual'], options: ['forward', 'reverse', 'ping-pong', 'scissors'] });
      return (
        <MoveSlotEnumBody
          label="Playback" optionLabel="Ping-pong" activeIdx={2}
          options={['Forward', 'Reverse', 'Ping-pong', 'Scissors']}
          shape={null} glyph={null}
          playback={movePlaybackMode(m, 'ping-pong')}
        />
      );
    },
  },
  {
    kind: 'scope', span: 1,
    description: MOVE_SLOT_LIBRARY.scope.description,
    note: 'The LFO’s Rate slot, on a modulator’s page. This one is running the library’s own LFO.',
    render: () => (
      <MoveSlotScopeBody label="Rate" value="0.6 Hz" pct={40}>
        <LiveScope index={MOD_LFO} />
      </MoveSlotScopeBody>
    ),
  },
  {
    kind: 'env', span: 4,
    description: MOVE_SLOT_LIBRARY.env.description,
    note: 'Four slots on the envelope’s page, one knob per stage. This is the library’s own ADSR.',
    render: () => <LiveEnvelope />,
  },
];

/* ── the small slots — the pad row under the dials ──────────────── */

export const SMALL_SLOTS: Specimen[] = [
  {
    kind: 'toggle',
    description: MOVE_PAD_LIBRARY.toggle.description,
    render: () => <MovePadToggleBody label="Sync" />,
  },
  {
    kind: 'value',
    description: MOVE_PAD_LIBRARY.value.description,
    render: () => <MovePadValueBody label="Drive" value="42" unit="%" />,
  },
  {
    kind: 'action',
    description: MOVE_PAD_LIBRARY.action.description,
    render: () => <MovePadActionBody label="Clear" />,
  },
  {
    kind: 'app',
    description: MOVE_PAD_LIBRARY.app.description,
    render: () => <MovePadAppBody label="Take 3" color="#52bd06" />,
  },
  {
    kind: 'bend',
    description: MOVE_PAD_LIBRARY.bend.description,
    note: 'Under each ramp of the envelope, on its page.',
    render: () => <MovePadToggleBody label="Curve" />,
  },
  {
    kind: 'wave',
    description: MOVE_PAD_LIBRARY.wave.description,
    note: 'One row below the bends, under every stage. The name says which way the sine goes.',
    render: () => <MovePadWaveBody label="Dip" percent={40} />,
  },
];

/** Small slots read as states as much as faces: on, held, latched. */
export const SMALL_SLOT_STATES: { label: string; kind: MovePadKind; props: Record<string, unknown>; render: () => ReactNode }[] = [
  { label: 'on', kind: 'toggle', props: { 'data-kind': 'toggle', 'data-on': true }, render: () => <MovePadToggleBody label="Sync" /> },
  { label: 'held', kind: 'value', props: { 'data-kind': 'value', 'data-held': true }, render: () => <MovePadValueBody label="Drive" value="42" unit="%" /> },
  { label: 'latched', kind: 'value', props: { 'data-kind': 'value', 'data-latched': true }, render: () => <MovePadValueBody label="Drive" value="42" unit="%" /> },
  { label: 'empty', kind: 'app', props: { 'data-empty': true }, render: () => null },
];

/* ── the modulation faces that are not slots ────────────────────── */

export const MOD_FACES: { kind: string; description: string; note?: string; render: () => ReactNode }[] = [
  {
    kind: 'ring',
    description: 'the ring a wired control wears: the slot’s colour, and an arc from the value to where the modulation is holding it',
    note: 'In the slot’s corner, where it lives. This one is the library’s own LFO on Amount — the arc moves.',
    render: () => (
      <div className="tweakers-move-dial">
        <ModRingSpecimen />
        <MoveSlotDefaultBody label="Amount" value="65%" pct={65} originPct={null} />
      </div>
    ),
  },
  {
    kind: 'composer',
    description: 'the curve modulator’s composition, floating over the panel while its page is open',
    note: 'Drag a clip, walk them with the arrows; the playhead runs on the modulator’s own phase.',
    render: () => <LiveComposer />,
  },
];

/** The ring on the library's own wired control — a real assignment, so the
 *  arc moves with the LFO rather than sitting still. */
function ModRingSpecimen() {
  const assignment = ModulationStore.getAssignment(PANEL_ID, 'amount');
  if (!assignment) return null;
  return <ModRing panelId={PANEL_ID} path="amount" assignment={assignment} className="tweakers-move-dial-mod" />;
}

export const SLOT_KINDS = BIG_SLOTS.map((s) => s.kind as MoveSlotKind);
