import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  MOVE_SLOT_LIBRARY,
  MOVE_PAD_LIBRARY,
  MoveSlotDefaultBody,
  MoveSlotScopeBody,
  MoveSlotEnvBody,
  MovePadToggleBody,
  MovePadIconBody,
  MovePadWaveBody,
  MovePadValueBody,
  MovePadActionBody,
  MovePadIconLabelBody,
  MovePadAppBody,
  MovePadTabsBody,
  MovePadColorBody,
  MovePadBandBody,
  MovePadFadeBody,
  MovePadLoopBody,
  CurveComposer,
  ModRing,
  ModulationStore,
  envelopePoints,
  envelopeJoints,
  curveComposition,
  type MoveSlotKind,
  type MovePadKind,
} from 'tweakers';
import { PANEL_ID, INSTRUMENTS_NAME, MOD_LFO, MOD_ENV, MOD_CURVE } from './panel';

/**
 * Every face, live. Each big card is the control itself — a MoveSlot on the
 * same store the instrument below reads, so dragging a card turns the
 * instrument's dial too, and the other way round. The instruments made of
 * several dials (a take, a gate, a mixer, a cleaner) and the colour blend
 * live on a page of their own, which only the dictionary draws. The faces
 * that only ever appear on a modulator's page — the scope, the envelope —
 * are drawn live and open that page, where their dials turn.
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
  /** The live slot the card is: the control, or an instrument's dials, on
   *  the named page — the instrument's own page when none is named. */
  live?: { panel?: string; path: string | string[]; valueFirst?: boolean };
  /** The modulator whose page the card opens, for a face that lives there. */
  opens?: number;
  /** The drawing, for a card that is not a live slot. */
  render?: () => ReactNode;
};

/* ── helpers ────────────────────────────────────────────────────── */

const path100 = (points: number[]) =>
  points.map((v, i) => `${i ? 'L' : 'M'} ${((i / (points.length - 1)) * 100).toFixed(2)} ${((1 - v) * 100).toFixed(2)}`).join(' ');

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
  { kind: 'default', path: 'amount', description: MOVE_SLOT_LIBRARY.default.description, live: { path: 'amount' } },
  {
    kind: 'value',
    description: MOVE_SLOT_LIBRARY.value.description,
    note: 'The face a chip wears when a dial borrows it, and every named value on a modulator’s page. This one is Glide, the chip under Bias.',
    live: { path: 'glide', valueFirst: true },
  },
  { kind: 'icon', path: 'direction', description: MOVE_SLOT_LIBRARY.icon.description, live: { path: 'direction' } },
  { kind: 'enum', path: 'scale', description: MOVE_SLOT_LIBRARY.enum.description, live: { path: 'scale' } },
  {
    kind: 'enum-wide', span: 2, path: 'result',
    description: 'The same list across two dial columns, with room for longer names. Either knob selects a result.',
    note: 'select with moveSpan: 2',
    live: { path: 'result' },
  },
  { kind: 'curve', path: 'shape', description: MOVE_SLOT_LIBRARY.curve.description, live: { path: 'shape' } },
  { kind: 'toggle', path: 'hold', description: MOVE_SLOT_LIBRARY.toggle.description, live: { path: 'hold' } },
  {
    kind: 'toggle-icon', path: 'loop',
    description: MOVE_SLOT_LIBRARY['toggle-icon'].description,
    note: 'Tap it: the badge is the whole difference between on and off. An app that ships its own pair of badges (a brush, a check, a ban) passes them as `icon`, `onIcon` and `offIcon`.',
    live: { path: 'loop' },
  },
  {
    kind: 'metronome', path: 'tempo',
    description: MOVE_SLOT_LIBRARY.metronome.description,
    note: 'A toggle with `moveVisual: { kind: \'metronome\', swing }`. The app keeps time: `swing()` answers where the arm is now, -1 to +1, or `null` to stand it upright. Off, the picture dims and the arm rests.',
    live: { path: 'tempo' },
  },
  { kind: 'range', path: 'band', description: MOVE_SLOT_LIBRARY.range.description, live: { path: 'band' } },
  { kind: 'xy', path: 'spot', description: MOVE_SLOT_LIBRARY.xy.description, live: { path: 'spot' } },
  { kind: 'dial', path: 'heading', description: MOVE_SLOT_LIBRARY.dial.description, live: { path: 'heading' } },
  { kind: 'color', path: 'tint', description: MOVE_SLOT_LIBRARY.color.description, live: { path: 'tint' } },
  { kind: 'ramp', path: 'ramp', description: MOVE_SLOT_LIBRARY.ramp.description, live: { path: 'ramp' } },
  { kind: 'balance', description: MOVE_SLOT_LIBRARY.balance.description, live: { panel: INSTRUMENTS_NAME, path: 'blend' } },
  { kind: 'transfer', path: 'response', description: MOVE_SLOT_LIBRARY.transfer.description, live: { path: 'response' } },
  { kind: 'filter', span: 2, path: 'tone', description: MOVE_SLOT_LIBRARY.filter.description, live: { path: 'tone' } },
  { kind: 'opacity', path: 'opacity', description: MOVE_SLOT_LIBRARY.opacity.description, live: { path: 'opacity' } },
  { kind: 'blur', path: 'blur', description: MOVE_SLOT_LIBRARY.blur.description, live: { path: 'blur' } },
  { kind: 'pan', path: 'pan', description: MOVE_SLOT_LIBRARY.pan.description, live: { path: 'pan' } },
  { kind: 'stereo-width', path: 'width', description: MOVE_SLOT_LIBRARY['stereo-width'].description, live: { path: 'width' } },
  { kind: 'pitch', path: 'pitch', description: MOVE_SLOT_LIBRARY.pitch.description, live: { path: 'pitch' } },
  {
    kind: 'offset', path: 'offset',
    description: MOVE_SLOT_LIBRARY.offset.description,
    note: 'A hit three quarters through its bar, pushed back a full turn: the pin and the way it took carry the colour, the stretch between fills. Bring it back to zero and both ways out return.',
    live: { path: 'offset' },
  },
  {
    kind: 'trim-span', span: 2,
    description: MOVE_SLOT_LIBRARY['trim-span'].description,
    live: { panel: INSTRUMENTS_NAME, path: ['start', 'end'] },
  },
  {
    kind: 'gate', span: 3,
    description: MOVE_SLOT_LIBRARY.gate.description,
    note: 'The grid runs a made-up drum loop; an app attaches its own with MoveGateMeter.',
    live: { panel: INSTRUMENTS_NAME, path: ['threshold', 'lookahead', 'release'] },
  },
  {
    kind: 'channel', span: 4,
    description: MOVE_SLOT_LIBRARY.channel.description,
    note: 'Each channel is its own dial; channel dials side by side draw as one mixer.',
    live: { panel: INSTRUMENTS_NAME, path: ['restored', 'denoise', 'stereo', 'remaster'] },
  },
  {
    kind: 'multiband', span: 5,
    description: MOVE_SLOT_LIBRARY.multiband.description,
    note: 'The bands move to a made-up signal; an app attaches its own with MoveMultibandMeter. Band chips in the band columns join the curve.',
    live: { panel: INSTRUMENTS_NAME, path: ['clean', 'speed', 'hi', 'mid', 'sub'] },
  },
  { kind: 'playback', path: 'playback', description: MOVE_SLOT_LIBRARY.playback.description, live: { path: 'playback' } },
  {
    kind: 'scope', span: 1,
    description: MOVE_SLOT_LIBRARY.scope.description,
    note: 'The LFO’s Rate slot, on a modulator’s page. This one is running the library’s own LFO — tap it to open that page in the instrument, where the dial turns.',
    opens: MOD_LFO,
    render: () => (
      <MoveSlotScopeBody label="Rate" value="0.6 Hz" pct={40}>
        <LiveScope index={MOD_LFO} />
      </MoveSlotScopeBody>
    ),
  },
  {
    kind: 'env', span: 4,
    description: MOVE_SLOT_LIBRARY.env.description,
    note: 'Four slots on the envelope’s page, one knob per stage. This is the library’s own ADSR — tap it to open its page in the instrument, where each stage turns.',
    opens: MOD_ENV,
    render: () => <LiveEnvelope />,
  },
];

/* ── the small slots — the pad row under the dials ──────────────── */

export const SMALL_SLOTS: Specimen[] = [
  { kind: 'list', description: MOVE_PAD_LIBRARY.list.description,
    note: 'Tap Parts in the live panel. Its dial walks the checked list; Sample selects, tap the green pad again to submit, and Back closes.',
    render: () => <MovePadActionBody label="Parts" /> },
  {
    kind: 'toggle',
    description: MOVE_PAD_LIBRARY.toggle.description,
    render: () => <MovePadToggleBody label="Sync" />,
  },
  {
    kind: 'icon',
    description: MOVE_PAD_LIBRARY.icon.description,
    note: 'A take’s Solo, held: the headphones say it where the word would not fit.',
    render: () => <MovePadIconBody icon="headphones" />,
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
    kind: 'icon-label',
    description: MOVE_PAD_LIBRARY['icon-label'].description,
    note: 'An action that names an icon. The picture is found first; the word says it for sure.',
    render: () => <MovePadIconLabelBody icon="download" label="Export" />,
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
  {
    kind: 'color',
    description: MOVE_PAD_LIBRARY.color.description,
    note: 'For pages where colour is not the big control. The tap opens the same editor the colour dial has.',
    render: () => <MovePadColorBody label="Ink A" color="#632ad5" />,
  },
  {
    kind: 'band',
    description: MOVE_PAD_LIBRARY.band.description,
    note: 'Two chips in one column, one over the other, named in the panel’s moveBands. The low cut is open, a sliver at its edge; the high cut has come in and turned yellow. Primecut’s Polish page wears one per take.',
    render: () => <MovePadBandBody low={{ at: 0, cut: false }} high={{ at: 0.7, cut: true }} />,
  },
  {
    kind: 'fade', span: 2,
    description: MOVE_PAD_LIBRARY.fade.description,
    note: 'Two chips side by side, the fade in first, named in the panel’s moveEdges. The fade in has come in and turned blue; the fade out is still a needle. Primecut’s editor wears one under Start and End.',
    render: () => <MovePadFadeBody fadeIn={{ at: 0.3, moved: true }} fadeOut={{ at: 0, moved: false }} />,
  },
  {
    kind: 'loop', span: 2,
    description: MOVE_PAD_LIBRARY.loop.description,
    note: 'Two chips side by side, the start first, named in the panel’s moveEdges. The start has moved in and turned red, the part before it shaded; the end still sits on its end of the line.',
    render: () => <MovePadLoopBody start={{ at: 0.2, moved: true }} end={{ at: 1, moved: false }} />,
  },
  {
    kind: 'tabs', span: 4,
    description: MOVE_PAD_LIBRARY.tabs.description,
    note: 'The small slots’ first multi-slot control. This one is the instrument’s own Take switch — four pads, the leading one its name.',
    render: () => (
      <MovePadTabsBody name="Take" options={['A', 'B', 'C']} activeIdx={1} />
    ),
  },
];

/** Small slots read as states as much as faces: on, held, latched. */
export const SMALL_SLOT_STATES: { label: string; kind: MovePadKind; props: Record<string, unknown>; render: () => ReactNode }[] = [
  { label: 'on', kind: 'toggle', props: { 'data-kind': 'toggle', 'data-on': true }, render: () => <MovePadToggleBody label="Sync" /> },
  { label: 'on', kind: 'icon', props: { 'data-kind': 'icon', 'data-on': true }, render: () => <MovePadIconBody icon="headphones" /> },
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
