import type { ControlMeta } from './store/TweakStore';

/** Opt-in meanings for numeric Move faces. Values keep the host's units. */
export type MoveSliderVisual =
  /** How much something shows. With `picture` (an image URL) the picture
   *  fills the slot edge to edge, in its own colours, at the value's opacity,
   *  with only the reading over it — the thing being faded, not two circles
   *  standing for it. */
  | { kind: 'opacity'; opaqueValue?: number; picture?: string }
  | { kind: 'blur' }
  | { kind: 'pan'; left?: number; center?: number; right?: number }
  | { kind: 'stereo-width'; mono?: number; unity?: number }
  /** A signed pitch. `look: 'diaphragm'` stands it up: a mark on a vertical
   *  line, the slot's own sides drawn in toward it like a throat closing —
   *  tighter the further it is from zero. */
  | { kind: 'pitch'; unit?: 'semitones' | 'cents'; look?: 'ruler' | 'diaphragm' }
  /** A speed: a needle on a graded dome, the slowest end on the left and the
   *  fastest on the right. It reads as a multiple ("1.5×") unless the host
   *  gives a unit or a formatter. `look: 'streak'` draws the reading itself as
   *  the headline, with speed lines trailing it — longer the faster it goes. */
  | { kind: 'gauge'; look?: 'dome' | 'streak' }
  /**
   * A rate at which something runs on its own — a scan, a playhead — drawn as
   * a clock. The value is a multiple of the thing's own pace (1 = as
   * recorded), and the dial's minimum stops it: the clock freezes over.
   * `tempo` is the beat at 1×, when the host knows one — the face then shows
   * the beat the rate makes. The host owns time: `hand` is polled every frame
   * for where the hand points, 0..1 of a turn, or `null` to leave it at
   * twelve.
   */
  | { kind: 'clock'; tempo?: number | null; hand?: () => number | null }
  /** A grain cloud's length, how thickly it repeats, or how far one copy
   *  trails — see `MoveGrainVisual`. */
  | MoveGrainSliderVisual
  /** One edge of a take: the bar is the whole of it, the kept part is filled
   *  from this edge's far end to the value, the edge itself is the marker. */
  | { kind: 'trim'; edge: 'start' | 'end' }
  /** A signed nudge away from where something already sits — a hit pushed off
   *  its step, a clip off its bar line. The face draws the room it has to
   *  move in: `origin` (0..1) is where it sits at no offset, and the dial's
   *  own range is that whole room, so a full turn either way carries it half
   *  the track. */
  | { kind: 'offset'; origin: number }
  /** One of a gate's three dials. Threshold, look-ahead and release side by
   *  side, in that order, draw as one 3-slot gate; any other arrangement
   *  keeps the ordinary face. */
  | { kind: 'gate'; role: MoveGateRole }
  /** One control of a multiband cleaner: an amount (its bar wears `icon`),
   *  a speed, and bands, each `band` its place from the top of the spectrum
   *  down. An amount, a speed and at least one band dial side by side draw
   *  as one face; band chips in those columns join its curve. */
  | { kind: 'multiband'; role: 'amount'; icon?: string }
  | { kind: 'multiband'; role: 'speed' }
  | { kind: 'multiband'; role: 'band'; band: number }
  /** A mixer channel's level: a fader under its icon and name, in its tone.
   *  Channel dials side by side draw as one mixer. */
  | { kind: 'channel'; icon?: string; tone?: MoveTone }
  /** One axis of a place — across, up, or into the picture. Three sliders
   *  carrying x, y and z, side by side in that order, draw as one 3-slot
   *  stage (the `vector` face); alone, an axis keeps the ordinary face.
   *  `down` (y only) says the host's y grows downward, as canvas
   *  coordinates do, so the stage still raises the mark as y goes up. */
  | { kind: 'axis'; axis: 'x' | 'y' | 'z'; down?: boolean };

/** A Move hue by name, as the theme's `--move-<tone>` token carries it. */
export type MoveTone = 'red' | 'orange' | 'yellow' | 'lime' | 'emerald' | 'blue' | 'indigo' | 'pink';

export type MoveGateRole = 'threshold' | 'lookahead' | 'release';

export type MovePlaybackMode = 'forward' | 'reverse' | 'ping-pong' | 'bounce' | 'scissors';
export type MoveSelectVisual =
  | {
    kind: 'playback';
    /** Map host option values to drawings. Omit when values are mode names. */
    modes?: Record<string, MovePlaybackMode>;
  }
  /**
   * A choice between parallel voices — layers, streams, lanes — drawn as
   * lanes running away from you, the chosen one lit. `silent` names the
   * options that are switched off: their lanes fade and carry a red cross,
   * so which voices sound reads at a glance whichever one is chosen. `solo`
   * names the one voice heard alone: its lane lights emerald.
   */
  | { kind: 'lanes'; silent?: readonly string[]; solo?: string }
  | MoveGrainSelectVisual;

/**
 * One dial of a grain cloud — a sound cut into short windows that repeat.
 * Four dials side by side, in this order, draw as one 4-slot face:
 *
 * - `length` (slider) — how long one window is: the width of the lit grain.
 * - `shape` (select with a `preview`) — the window's curve: the grain's
 *   outline is the option's own sampler.
 * - `density` (slider) — how thickly the windows repeat: copies stack up
 *   behind the lit grain. `overlap` answers how many windows sound at once
 *   (density × length, in the host's units); polled on each draw. Without
 *   it the copies are spaced by the dial alone.
 * - or `offset` (slider) — how far one other voice trails the lit grain:
 *   a single copy in its own hue. `lag` answers the trail as a fraction of
 *   one window's length; without it the dial's place stands in.
 * - `direction` (select) — which way the grains play, drawn as a field of
 *   arrows. `modes` maps option values to drawings, as `playback` does. The
 *   copies trail on the side the grains come from, and a reversed cloud is
 *   drawn mirrored.
 *
 * Any other arrangement keeps each dial's ordinary face.
 */
export type MoveGrainSliderVisual =
  | { kind: 'grain'; role: 'length' }
  | { kind: 'grain'; role: 'density'; overlap?: () => number }
  | { kind: 'grain'; role: 'offset'; lag?: () => number };
export type MoveGrainSelectVisual =
  | { kind: 'grain'; role: 'shape' }
  | { kind: 'grain'; role: 'direction'; modes?: Record<string, MovePlaybackMode> };
export type MoveGrainVisual = MoveGrainSliderVisual | MoveGrainSelectVisual;
export type MoveGrainRole = MoveGrainVisual['role'];

/**
 * A switch that draws what it switches. `metronome`: a metronome whose arm
 * swings while it is on. The host owns time — `swing` is polled every frame
 * for where the arm is now, -1 (full left) to +1 (full right), or `null` to
 * stand it upright (the transport stopped, say). The kit only draws.
 */
export type MoveToggleVisual = {
  kind: 'metronome';
  swing?: () => number | null;
};

export type MoveVisual = MoveSliderVisual | MoveSelectVisual | MoveToggleVisual;

export type MoveNumericDrawing =
  | { kind: 'opacity'; alpha: number; picture?: string }
  | { kind: 'blur'; radius: number }
  | { kind: 'pan'; position: number }
  | { kind: 'stereo-width'; separation: number; unity: number | null }
  | { kind: 'pitch'; position: number; zero: number | null }
  | { kind: 'diaphragm'; position: number; zero: number | null }
  | { kind: 'gauge'; position: number }
  | { kind: 'streak'; position: number }
  | {
    kind: 'clock';
    /** The rate, as the host's multiple: 1 = its own pace. */
    rate: number;
    /** At the dial's minimum: stopped, and frozen over. */
    frozen: boolean;
    /** The beat the rate makes, when the host knows one at 1×. */
    tempo: number | null;
    hand?: () => number | null;
  }
  | { kind: 'trim'; edge: 'start' | 'end'; position: number }
  | {
    kind: 'offset';
    /** Where it sits at no offset, 0..1 across the track. */
    origin: number;
    /** Where the offset has put it, 0..1 across the same track. */
    position: number;
    /** There is still room, and range, to go that way. */
    back: boolean;
    forward: boolean;
  };

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const between = (value: number, min: number, max: number) => value >= min && value <= max;

/** Invalid or incompatible metadata falls back to the ordinary face. No label inference. */
export function moveNumericDrawing(meta: ControlMeta, value: unknown): MoveNumericDrawing | null {
  const visual = meta.moveVisual;
  const { min, max } = meta;
  if (meta.type !== 'slider' || !visual || typeof value !== 'number' || !Number.isFinite(value)
    || !Number.isFinite(min) || !Number.isFinite(max) || max! <= min!) return null;
  const lo = min!;
  const hi = max!;
  const v = Math.max(lo, Math.min(hi, value));
  switch (visual.kind) {
    case 'opacity': {
      const opaque = visual.opaqueValue ?? 1;
      if (!Number.isFinite(opaque) || opaque <= 0 || lo < 0 || hi > opaque) return null;
      const picture = typeof visual.picture === 'string' && visual.picture ? visual.picture : undefined;
      return { kind: 'opacity', alpha: v / opaque, ...(picture ? { picture } : {}) };
    }
    case 'blur':
      return lo >= 0 ? { kind: 'blur', radius: v } : null;
    case 'pan': {
      const left = visual.left ?? -1;
      const center = visual.center ?? 0;
      const right = visual.right ?? 1;
      if (![left, center, right].every(Number.isFinite) || left >= center || center >= right
        || lo < left || hi > right) return null;
      // Centre stays at C even when the host's numeric sides are asymmetric.
      const position = v <= center
        ? (v - left) / (center - left) / 2
        : 0.5 + (v - center) / (right - center) / 2;
      return { kind: 'pan', position: clamp01(position) };
    }
    case 'stereo-width': {
      const mono = visual.mono ?? 0;
      const unity = visual.unity ?? 1;
      if (![mono, unity].every(Number.isFinite) || unity <= mono || lo < mono || hi <= mono) return null;
      return {
        kind: 'stereo-width', separation: (v - mono) / (hi - mono),
        unity: between(unity, lo, hi) ? (unity - mono) / (hi - mono) : null,
      };
    }
    case 'pitch':
      if (visual.unit !== undefined && visual.unit !== 'semitones' && visual.unit !== 'cents') return null;
      return {
        kind: visual.look === 'diaphragm' ? 'diaphragm' : 'pitch',
        position: (v - lo) / (hi - lo),
        zero: between(0, lo, hi) ? -lo / (hi - lo) : null,
      };
    case 'gauge':
      // The needle sweeps the range the dial turns, so the two always agree.
      return { kind: visual.look === 'streak' ? 'streak' : 'gauge', position: clamp01((v - lo) / (hi - lo)) };
    case 'clock': {
      const tempo = typeof visual.tempo === 'number' && Number.isFinite(visual.tempo) && visual.tempo > 0 ? visual.tempo : null;
      return { kind: 'clock', rate: v, frozen: v <= lo, tempo, ...(visual.hand ? { hand: visual.hand } : {}) };
    }
    case 'trim':
      if (visual.edge !== 'start' && visual.edge !== 'end') return null;
      return { kind: 'trim', edge: visual.edge, position: clamp01((v - lo) / (hi - lo)) };
    case 'offset': {
      const origin = visual.origin;
      if (!Number.isFinite(origin) || origin < 0 || origin > 1) return null;
      // A way out is real only where the room and the dial both allow it: a
      // thing parked against an end has nowhere to go that side, and neither
      // has one whose range never crosses zero.
      return {
        kind: 'offset',
        origin,
        position: clamp01(origin + v / (hi - lo)),
        back: lo < 0 && origin > 0,
        forward: hi > 0 && origin < 1,
      };
    }
    default:
      return null;
  }
}

/** Where a take's two edges sit on one shared line, each 0..1 across its own
 *  dial — or null unless `start` is a trim start and `end` a trim end. */
export function moveTrimSpan(start: ControlMeta, startValue: unknown, end: ControlMeta, endValue: unknown): { start: number; end: number } | null {
  const a = moveNumericDrawing(start, startValue);
  const b = moveNumericDrawing(end, endValue);
  if (a?.kind !== 'trim' || a.edge !== 'start' || b?.kind !== 'trim' || b.edge !== 'end') return null;
  return { start: a.position, end: b.position };
}

/** Where a gate's three dials sit, each 0..1 across its own range — or null
 *  unless the three are a threshold, a look-ahead and a release, in order. */
export function moveGateSpan(
  dials: [ControlMeta, unknown][],
): { threshold: number; lookahead: number; release: number } | null {
  const roles: MoveGateRole[] = ['threshold', 'lookahead', 'release'];
  if (dials.length !== 3) return null;
  const at = dials.map(([meta, value], i) => {
    const { min, max } = meta;
    const visual = meta.moveVisual;
    if (meta.type !== 'slider' || visual?.kind !== 'gate' || visual.role !== roles[i] || typeof value !== 'number'
      || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max! <= min!) return null;
    return clamp01((value - min!) / (max! - min!));
  });
  if (at.some((p) => p === null)) return null;
  return { threshold: at[0]!, lookahead: at[1]!, release: at[2]! };
}

/** Where a place's three axes sit, each 0..1 across its own dial — or null
 *  unless the three are an x, a y and a z axis, in that order. The gate's
 *  rule, for a position instead of a gate. `down` is the y axis's own. */
export function moveVectorAxes(
  dials: [ControlMeta, unknown][],
): { x: number; y: number; z: number; down: boolean } | null {
  if (dials.length !== 3) return null;
  const axes = ['x', 'y', 'z'] as const;
  const at = dials.map(([meta, value], i) => {
    const visual = meta.moveVisual;
    if (visual?.kind !== 'axis' || visual.axis !== axes[i]) return null;
    return sliderPosition(meta, value);
  });
  if (at.some((p) => p === null)) return null;
  const y = dials[1][0].moveVisual;
  return { x: at[0]!, y: at[1]!, z: at[2]!, down: y?.kind === 'axis' && y.down === true };
}

/** The stage's drawing units — a 240 × 48 plot, the shape of the three slots it
 *  spans, so the floor stretches to fill them while the mark stays round. */
export const MOVE_STAGE = { width: 240, height: 48 } as const;

/** The stage's floor, near edge to far edge, in drawing units. The far edge is
 *  narrower by the same ratio it is higher: one vanishing point, centred, so the
 *  floor reads as a floor and not as a trapezoid. */
const STAGE_FLOOR = { near: 44, far: 16, half: 114, farScale: 0.44 } as const;
/** The mark's radius near and far — distance drawn as size, as well as place. */
const STAGE_MARK = { near: 5.5, far: 2.5 } as const;

export type MoveStage = {
  /** The floor's outline, closed. */
  floor: string;
  /** Depth rules across it and rails running back to the vanishing point. */
  rules: string;
  /** The mark's shadow on the floor, straight under it. */
  foot: { x: number; y: number; rx: number; ry: number };
  /** From the shadow up to the mark: how high it stands. */
  stalk: { x: number; y1: number; y2: number };
  /** The thing itself. */
  mark: { x: number; y: number; r: number };
  /** The depth rule the mark stands on — lit while z is being turned. */
  depth: string;
};

/**
 * A place as one picture: an object standing on a floor seen from the front.
 *
 * X places it across the floor AT ITS DEPTH, so it stays on the stage however
 * far back it is. Z is drawn twice over — how far back it stands, and how big it
 * is — because on a slot this size a third number only reads as depth when it
 * does both. Y is how high it stands off the floor: a stalk up from its shadow,
 * so at zero it sits on its own shadow. All inputs are 0..1.
 */
export function moveVectorStage(x01: number, y01: number, z01: number, down = false): MoveStage {
  const cx = MOVE_STAGE.width / 2;
  const x = clamp01(x01);
  const t = clamp01(z01);
  const lift = down ? 1 - clamp01(y01) : clamp01(y01);
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const floorY = (k: number) => lerp(STAGE_FLOOR.near, STAGE_FLOOR.far, k);
  const halfAt = (k: number) => STAGE_FLOOR.half * lerp(1, STAGE_FLOOR.farScale, k);
  const across = (u: number, k: number) => cx + (u * 2 - 1) * halfAt(k);
  const r2 = (n: number) => Math.round(n * 100) / 100;

  const floor = `M${r2(across(0, 0))} ${STAGE_FLOOR.near}L${r2(across(1, 0))} ${STAGE_FLOOR.near}L${r2(across(1, 1))} ${STAGE_FLOOR.far}L${r2(across(0, 1))} ${STAGE_FLOOR.far}Z`;
  const rules = [
    ...[0.25, 0.5, 0.75].map((k) => `M${r2(across(0, k))} ${r2(floorY(k))}L${r2(across(1, k))} ${r2(floorY(k))}`),
    ...[0.25, 0.5, 0.75].map((u) => `M${r2(across(u, 0))} ${STAGE_FLOOR.near}L${r2(across(u, 1))} ${STAGE_FLOOR.far}`),
  ].join('');

  const footX = across(x, t);
  const footY = floorY(t);
  const r = lerp(STAGE_MARK.near, STAGE_MARK.far, t);
  // Headroom scales with depth like everything else, and stops short of the top
  // edge by the mark's own radius so a mark at full height is never clipped.
  const headroom = (footY - r - 2) * 0.9;
  const markY = footY - lift * headroom;
  return {
    floor,
    rules,
    foot: { x: r2(footX), y: r2(footY), rx: r2(r * 1.3), ry: r2(r * 0.45) },
    stalk: { x: r2(footX), y1: r2(footY), y2: r2(markY) },
    mark: { x: r2(footX), y: r2(markY), r: r2(r) },
    depth: `M${r2(across(0, t))} ${r2(footY)}L${r2(across(1, t))} ${r2(footY)}`,
  };
}

/** A slider's place across its own range, 0..1 — or null when it has none. */
function sliderPosition(meta: ControlMeta, value: unknown): number | null {
  const { min, max } = meta;
  if (meta.type !== 'slider' || typeof value !== 'number' || !Number.isFinite(value)
    || !Number.isFinite(min) || !Number.isFinite(max) || max! <= min!) return null;
  return clamp01((value - min!) / (max! - min!));
}

/** A mixer channel's fader position (0..1), or null unless it is a channel slider. */
export function moveChannelPosition(meta: ControlMeta | undefined, value: unknown): number | null {
  return meta?.moveVisual?.kind === 'channel' ? sliderPosition(meta, value) : null;
}

export type MoveMultibandRole = 'amount' | 'speed' | 'band';

/** A slider's multiband role, or null when it is not one. */
export function moveMultibandRole(meta: ControlMeta | undefined): MoveMultibandRole | null {
  const visual = meta?.moveVisual;
  return meta?.type === 'slider' && visual?.kind === 'multiband' ? visual.role : null;
}

/**
 * Where a multiband face's controls sit, each 0..1 — or null unless the
 * dials are an amount, a speed and one or more bands, in that order. `bands`
 * are every band control the face draws (dials and chips), returned in
 * spectrum order.
 */
export function moveMultibandSpan(
  dials: [ControlMeta, unknown][],
  bands: [ControlMeta, unknown][],
): { amount: number; speed: number; bands: { meta: ControlMeta; position: number }[] } | null {
  const roles = dials.map(([meta]) => moveMultibandRole(meta));
  if (dials.length < 3 || roles[0] !== 'amount' || roles[1] !== 'speed' || roles.slice(2).some((r) => r !== 'band')) return null;
  const amount = sliderPosition(...dials[0]);
  const speed = sliderPosition(...dials[1]);
  if (amount === null || speed === null) return null;
  const drawn: { meta: ControlMeta; position: number; band: number }[] = [];
  for (const [meta, value] of bands) {
    const visual = meta.moveVisual;
    const position = sliderPosition(meta, value);
    if (visual?.kind !== 'multiband' || visual.role !== 'band' || position === null || !Number.isFinite(visual.band)) return null;
    drawn.push({ meta, position, band: visual.band });
  }
  drawn.sort((a, b) => a.band - b.band);
  return { amount, speed, bands: drawn.map(({ meta, position }) => ({ meta, position })) };
}

const PLAYBACK_MODES: readonly MovePlaybackMode[] = ['forward', 'reverse', 'ping-pong', 'bounce', 'scissors'];

/** The drawing an option value stands for: through the host's map when it
 *  gives one, or the value itself when it is already a mode's name. */
function playbackModeOf(meta: ControlMeta, modes: unknown, value: unknown): MovePlaybackMode | null {
  if (meta.type !== 'select' || typeof value !== 'string') return null;
  if (!meta.options?.some((option) => (typeof option === 'string' ? option : option.value) === value)) return null;
  if (modes !== undefined && (typeof modes !== 'object' || modes === null || Array.isArray(modes))) return null;
  const map = modes as Record<string, unknown> | undefined;
  const mode = map ? (Object.prototype.hasOwnProperty.call(map, value) ? map[value] : undefined) : value;
  return PLAYBACK_MODES.includes(mode as MovePlaybackMode) ? mode as MovePlaybackMode : null;
}

export function movePlaybackMode(meta: ControlMeta, value: unknown): MovePlaybackMode | null {
  return meta.moveVisual?.kind === 'playback' ? playbackModeOf(meta, meta.moveVisual.modes, value) : null;
}

/** A lanes picker's lanes, in option order: which one is chosen, which are
 *  switched off, and which one is soloed (absent when none is) — or null
 *  unless the select asks to be drawn as lanes. */
export function moveLanes(meta: ControlMeta, value: unknown): { chosen: number; silent: boolean[]; solo?: number } | null {
  const visual = meta.moveVisual;
  if (meta.type !== 'select' || visual?.kind !== 'lanes' || !meta.options?.length) return null;
  const values = meta.options.map((option) => (typeof option === 'string' ? option : option.value));
  const silent = Array.isArray(visual.silent) ? visual.silent : [];
  const solo = visual.solo === undefined ? -1 : values.indexOf(visual.solo);
  return {
    chosen: Math.max(0, values.indexOf(value as string)),
    silent: values.map((v) => silent.includes(v)),
    ...(solo >= 0 ? { solo } : {}),
  };
}

/** A dial's grain role, or null when it is not one of a grain cloud's. */
export function moveGrainRole(meta: ControlMeta | undefined): MoveGrainRole | null {
  const visual = meta?.moveVisual;
  if (visual?.kind !== 'grain') return null;
  const slider = visual.role === 'length' || visual.role === 'density' || visual.role === 'offset';
  return (slider ? meta!.type === 'slider' : meta!.type === 'select') ? visual.role : null;
}

/** What the grain face draws, read off its four dials. */
export type MoveGrainSpan = {
  /** One window's length, 0..1 across its dial. */
  length: number;
  /** The window's outline, sampled 0..1 → 0..1; null draws a plain hump. */
  shape: ((t: number) => number) | null;
  /** How the copies trail: stacked `density` copies, `spacing` apart in
   *  window lengths, or one `offset` copy `lag` window lengths behind. */
  trail: { role: 'density'; spacing: number } | { role: 'offset'; lag: number };
  direction: MovePlaybackMode;
  /** Each dial's place 0..1, in column order — an option picker's is its
   *  option's place in the run. */
  positions: [number, number, number, number];
};

/**
 * Read a grain cloud off four dials: a length, a shape, a density or an
 * offset, and a direction, in that order — or null for any other run.
 */
export function moveGrainSpan(dials: [ControlMeta, unknown][]): MoveGrainSpan | null {
  if (dials.length !== 4) return null;
  const roles = dials.map(([meta]) => moveGrainRole(meta));
  if (roles[0] !== 'length' || roles[1] !== 'shape' || (roles[2] !== 'density' && roles[2] !== 'offset') || roles[3] !== 'direction') return null;
  const length = sliderPosition(...dials[0]);
  const amount = sliderPosition(...dials[2]);
  const [shapeMeta, shapeValue] = dials[1];
  const [directionMeta, directionValue] = dials[3];
  const visual = directionMeta.moveVisual as Extract<MoveGrainVisual, { role: 'direction' }>;
  const direction = playbackModeOf(directionMeta, visual.modes, directionValue);
  if (length === null || amount === null || !direction) return null;

  let shape: ((t: number) => number) | null = null;
  try {
    const sampler = shapeMeta.preview?.(String(shapeValue ?? ''));
    if (typeof sampler === 'function') shape = sampler;
  } catch {
    shape = null;                      /* a throwing preview draws the plain hump */
  }

  const polled = (read: (() => number) | undefined) => {
    try {
      const n = read?.();
      return typeof n === 'number' && Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  };
  const trailVisual = dials[2][0].moveVisual as Extract<MoveGrainVisual, { role: 'density' | 'offset' }>;
  let trail: MoveGrainSpan['trail'];
  if (trailVisual.role === 'density') {
    // So many windows at once are this far apart: overlap 4 stacks a copy
    // every quarter window. With no host answer the dial alone spaces them,
    // from a window and a half apart to a thin stack.
    const overlap = polled(trailVisual.overlap) ?? 0.66 * 2 ** (amount * 6);
    trail = { role: 'density', spacing: 1 / Math.max(1e-6, overlap) };
  } else {
    trail = { role: 'offset', lag: Math.max(0, polled(trailVisual.lag) ?? amount) };
  }

  const option = (meta: ControlMeta, value: unknown) => {
    const values = (meta.options ?? []).map((o) => (typeof o === 'string' ? o : o.value));
    return values.length > 1 ? Math.max(0, values.indexOf(value as string)) / (values.length - 1) : 0;
  };
  return {
    length, shape, trail, direction,
    positions: [length, option(shapeMeta, shapeValue), amount, option(directionMeta, directionValue)],
  };
}

/** The grain picture's drawing units: three slots of room, 100 high, the
 *  floor the grains stand on along the bottom edge. */
export const MOVE_GRAIN = { width: 300, height: 100, base: 100, top: 6, copies: 7 } as const;

/**
 * The picture is a guide, not a meter. A density is read by its overlap —
 * how many grains sound at once — on a log scale, in two halves:
 *
 * - Overlapping (1 up to `dense`): the copies pull in from touching (one
 *   grain length apart) to `tight` drawing units apart — a couple of
 *   pixels, so a thick cloud reads as a wall of edges.
 * - Apart (1 down to `sparse`): a gap that opens from touching to `wide`
 *   grain lengths. Past a clear gap the ear hears "apart" and nothing more,
 *   so this half is drawn loosely.
 *
 * The top of the density dial's own run (from `from` up) pulls the picture
 * the rest of the way to tight, so the densest setting reads as a wall at
 * any grain size — short grains included, which barely overlap in truth.
 */
const GRAIN_GAP = { sparse: 0.02, dense: 1000, wide: 2, tight: 1.8, from: 0.6 } as const;
/** The widest trail an offset copy is drawn at, in grain lengths. */
const GRAIN_MAX_LAG = 3.5;

/** The gap the picture draws between copies, in grain lengths, for a
 *  density's true `spacing`, its dial's place `dial` (0..1), and a grain
 *  drawn `width` units wide. */
export function moveGrainGap(spacing: number, width: number, dial = 0): number {
  const { sparse, dense, wide, tight, from } = GRAIN_GAP;
  const overlap = 1 / Math.max(1e-9, spacing);
  // Where the density sits: -1 (sparsest) .. 0 (touching) .. 1 (densest).
  const at = overlap >= 1
    ? clamp01(Math.log(overlap) / Math.log(dense))
    : -clamp01(Math.log(1 / overlap) / Math.log(1 / sparse));
  const k = clamp01((clamp01(dial) - from) / (1 - from));
  const pull = k * k * (3 - 2 * k);
  const x = at + (1 - at) * pull;
  return x >= 0 ? Math.min(1, tight / Math.max(1e-9, width)) ** x : wide ** -x;
}

export type MoveGrainPicture = {
  /** The lit grain's outline, closed along the floor. */
  hero: string;
  /** Where its length runs, floor-level, for the length rule under it. */
  span: { from: number; to: number };
  /** The copies, farthest first: each outline and how near it is (1 = the
   *  nearest, which wears the trail's hue). */
  copies: { d: string; rank: number }[];
};

/**
 * The grain face's picture in `MOVE_GRAIN` units. The lit grain is one
 * window at its length; the copies sit behind it, each offset by the
 * spacing, so where they overlap it only their trailing edges show — a
 * dense cloud reads as a stack of edges, a sparse one as separate grains.
 * Forward trails the copies to the right (the grains that went before); a
 * reversed cloud is the same picture mirrored, window and all; the modes
 * that play both ways trail on both sides.
 */
export function moveGrainPicture(span: MoveGrainSpan): MoveGrainPicture {
  const { width: W, base, top, copies: most } = MOVE_GRAIN;
  const margin = 6;
  const sample = span.shape ?? ((t: number) => Math.sin(Math.PI * t));
  const both = span.direction === 'ping-pong' || span.direction === 'bounce' || span.direction === 'scissors';
  // The drawn gap between copies, in grain lengths: a density's eased over
  // its whole run (moveGrainGap), an offset's as it is up to a ceiling.
  const asked = W * (0.2 + 0.46 * clamp01(span.length));
  const ratio = span.trail.role === 'density'
    ? moveGrainGap(span.trail.spacing, asked, span.positions[2])
    : Math.min(GRAIN_MAX_LAG, span.trail.lag);
  // The lit grain and its nearest copy — both of them, played both ways —
  // always fit whole: when they would not, the whole picture shrinks until
  // they do, so a sparse cloud draws small rather than cut off.
  const fits = (W - 2 * margin) / (1 + ratio * (both ? 2 : 1));
  const g = Math.min(asked, fits);
  const step = ratio * g;
  const room = both ? (W - g) / 2 - margin : W - g - 2 * margin;
  const count = span.trail.role === 'offset'
    ? 1
    : Math.max(1, Math.min(most, Math.ceil(room / Math.max(step, 1e-6))));
  // The group — the grain and as much trail as fits — stands centred.
  const reach = span.trail.role === 'offset' ? step : Math.min(count * step, room);
  const x0 = both ? (W - g) / 2 : Math.max(margin, (W - g - reach) / 2);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const outline = (at: number) => {
    const points: string[] = [];
    const n = 48;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const y = clamp01(Number(sample(t)) || 0);
      points.push(`${r2(at + t * g)} ${r2(base - y * (base - top))}`);
    }
    return `M${r2(at)} ${base}L${points.join('L')}L${r2(at + g)} ${base}Z`;
  };
  const shifts = Array.from({ length: count }, (_, k) => {
    const rank = k + 1;
    if (!both) return { rank, dx: rank * step };
    // Both ways: the copies alternate sides, the nearest pair first.
    const side = k % 2 === 0 ? 1 : -1;
    return { rank: Math.ceil(rank / 2), dx: side * Math.ceil(rank / 2) * step };
  });
  const mirror = (d: string) => (span.direction === 'reverse'
    ? d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${r2(W - Number(x))} ${y}`)
    : d);
  const copies = shifts
    .sort((a, b) => b.rank - a.rank)
    .map(({ rank, dx }) => ({ d: mirror(outline(x0 + dx)), rank }));
  const from = span.direction === 'reverse' ? W - x0 - g : x0;
  return { hero: mirror(outline(x0)), span: { from: r2(from), to: r2(from + g) }, copies };
}

/** Semantic formatting is a fallback; a host formatter or unit always wins. */
export function moveVisualReading(meta: ControlMeta, value: number): string {
  if (meta.formatValue) return meta.formatValue(value);
  const number = Number(value.toFixed(2)).toString();
  if (meta.unit) return `${number}${meta.unit}`;
  if (!moveNumericDrawing(meta, value)) return number;
  const visual = meta.moveVisual!;
  switch (visual.kind) {
    case 'opacity': return `${Number((value / (visual.opaqueValue ?? 1) * 100).toFixed(1))}%`;
    case 'blur': return `${number} px`;
    case 'pan': {
      const center = visual.center ?? 0;
      if (value === center) return 'C';
      const extent = value < center ? center - (visual.left ?? -1) : (visual.right ?? 1) - center;
      return `${value < center ? 'L' : 'R'} ${Number((Math.abs(value - center) / extent * 100).toFixed(1))}%`;
    }
    case 'stereo-width':
      return value === (visual.mono ?? 0) ? 'Mono' : `${Number(((value - (visual.mono ?? 0)) / ((visual.unity ?? 1) - (visual.mono ?? 0))).toFixed(2))}×`;
    case 'pitch': return `${value > 0 ? '+' : ''}${number} ${visual.unit === 'cents' ? 'ct' : 'st'}`;
    case 'gauge': return `${number}×`;
    case 'clock': return `${number}×`;
    case 'trim': return `${number} s`;
    default: return number;
  }
}

/** Returns a new value only for editing keys. Shift uses the configured smallest step. */
export function moveKeyboardValue(meta: ControlMeta, value: unknown, key: string, fine = false): number | string | null {
  const direction = key === 'ArrowRight' || key === 'ArrowUp' || key === 'PageUp' ? 1
    : key === 'ArrowLeft' || key === 'ArrowDown' || key === 'PageDown' ? -1 : 0;
  if (!direction && key !== 'Home' && key !== 'End') return null;
  if (meta.type === 'select') {
    const options = meta.options ?? [];
    if (!options.length) return null;
    const optionValue = (option: typeof options[number]) => typeof option === 'string' ? option : option.value;
    const index = Math.max(0, options.findIndex((option) => optionValue(option) === value));
    const next = key === 'Home' ? 0 : key === 'End' ? options.length - 1
      : Math.max(0, Math.min(options.length - 1, index + direction));
    return optionValue(options[next]);
  }
  const { min, max } = meta;
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max! <= min!) return null;
  if (key === 'Home') return min!;
  if (key === 'End') return max!;
  const range = max! - min!;
  if (meta.step === 0) {
    const delta = range / (fine ? 1000 : key.startsWith('Page') ? 10 : 100);
    return Math.max(min!, Math.min(max!, Number((value + direction * delta).toPrecision(12))));
  }
  const step = meta.step && Number.isFinite(meta.step) && meta.step > 0 ? meta.step : range / 100;
  const coarseSteps = Math.max(1, Math.round(range / 100 / step));
  const multiplier = fine ? 1 : key.startsWith('Page') ? coarseSteps * 10 : coarseSteps;
  const next = Math.round((value + direction * step * multiplier) / step) * step;
  return Math.max(min!, Math.min(max!, Number(next.toPrecision(12))));
}

/**
 * The band's small screen, in its own drawing units: a 79 × 39 plot ruled
 * into eight columns and four rows of 9-unit cells by 1-unit lines.
 */
export const MOVE_BAND_W = 79;
export const MOVE_BAND_H = 39;
/** How far each cut's slope leans in, foot to top. */
const BAND_SLANT = 4;
/** How far the rounded shoulder runs along the top and down the slope. */
const BAND_SHOULDER = 8;

/**
 * The two cut regions of a band, as paths in the screen's units. Each cut's
 * foot sits on the floor at its place (`low`, `high`, each 0..1 left to
 * right); its slope leans in to the top and rounds over into the pass
 * band. The low cut fills the left of its slope, the high cut the right of
 * its own. Past each other the two shoulders meet in the middle instead of
 * crossing.
 */
export function moveBandCuts(low: number, high: number): { low: string; high: string } {
  const W = MOVE_BAND_W;
  const H = MOVE_BAND_H;
  const xl = clamp01(low) * W;
  const xh = Math.max(xl, clamp01(high) * W);
  let topL = xl + BAND_SLANT;
  let topR = xh - BAND_SLANT;
  if (topL > topR) topL = topR = (topL + topR) / 2;
  const k = Math.min(BAND_SHOULDER, (topR - topL) / 2);
  const dx = (BAND_SLANT * k) / H;
  const n = (v: number) => Number(v.toFixed(2));
  return {
    low: `M 0 0 L ${n(topL + k)} 0 Q ${n(topL)} 0 ${n(topL - dx)} ${n(k)} L ${n(xl)} ${H} L 0 ${H} Z`,
    high: `M ${W} 0 L ${n(topR - k)} 0 Q ${n(topR)} 0 ${n(topR + dx)} ${n(k)} L ${n(xh)} ${H} L ${W} ${H} Z`,
  };
}
