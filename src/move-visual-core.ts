import type { ControlMeta } from './store/TweakStore';

/** Opt-in meanings for numeric Move faces. Values keep the host's units. */
export type MoveSliderVisual =
  | { kind: 'opacity'; opaqueValue?: number }
  | { kind: 'blur' }
  | { kind: 'pan'; left?: number; center?: number; right?: number }
  | { kind: 'stereo-width'; mono?: number; unity?: number }
  | { kind: 'pitch'; unit?: 'semitones' | 'cents' }
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

export type MovePlaybackMode = 'forward' | 'reverse' | 'ping-pong' | 'scissors';
export type MoveSelectVisual = {
  kind: 'playback';
  /** Map host option values to drawings. Omit when values are mode names. */
  modes?: Record<string, MovePlaybackMode>;
};

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
  | { kind: 'opacity'; alpha: number }
  | { kind: 'blur'; radius: number }
  | { kind: 'pan'; position: number }
  | { kind: 'stereo-width'; separation: number; unity: number | null }
  | { kind: 'pitch'; position: number; zero: number | null }
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
      return { kind: 'opacity', alpha: v / opaque };
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
      return { kind: 'pitch', position: (v - lo) / (hi - lo), zero: between(0, lo, hi) ? -lo / (hi - lo) : null };
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

export function movePlaybackMode(meta: ControlMeta, value: unknown): MovePlaybackMode | null {
  if (meta.type !== 'select' || meta.moveVisual?.kind !== 'playback' || typeof value !== 'string') return null;
  if (!meta.options?.some((option) => (typeof option === 'string' ? option : option.value) === value)) return null;
  const modes = meta.moveVisual.modes;
  if (modes !== undefined && (typeof modes !== 'object' || modes === null || Array.isArray(modes))) return null;
  const mode = modes ? (Object.prototype.hasOwnProperty.call(modes, value) ? modes[value] : undefined) : value;
  return mode === 'forward' || mode === 'reverse' || mode === 'ping-pong' || mode === 'scissors' ? mode : null;
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
