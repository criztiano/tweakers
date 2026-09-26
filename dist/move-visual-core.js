// src/move-visual-core.ts
var clamp01 = (value) => Math.max(0, Math.min(1, value));
var between = (value, min, max) => value >= min && value <= max;
function moveNumericDrawing(meta, value) {
  const visual = meta.moveVisual;
  const { min, max } = meta;
  if (meta.type !== "slider" || !visual || typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  const lo = min;
  const hi = max;
  const v = Math.max(lo, Math.min(hi, value));
  switch (visual.kind) {
    case "opacity": {
      const opaque = visual.opaqueValue ?? 1;
      if (!Number.isFinite(opaque) || opaque <= 0 || lo < 0 || hi > opaque) return null;
      return { kind: "opacity", alpha: v / opaque };
    }
    case "blur":
      return lo >= 0 ? { kind: "blur", radius: v } : null;
    case "pan": {
      const left = visual.left ?? -1;
      const center = visual.center ?? 0;
      const right = visual.right ?? 1;
      if (![left, center, right].every(Number.isFinite) || left >= center || center >= right || lo < left || hi > right) return null;
      const position = v <= center ? (v - left) / (center - left) / 2 : 0.5 + (v - center) / (right - center) / 2;
      return { kind: "pan", position: clamp01(position) };
    }
    case "stereo-width": {
      const mono = visual.mono ?? 0;
      const unity = visual.unity ?? 1;
      if (![mono, unity].every(Number.isFinite) || unity <= mono || lo < mono || hi <= mono) return null;
      return {
        kind: "stereo-width",
        separation: (v - mono) / (hi - mono),
        unity: between(unity, lo, hi) ? (unity - mono) / (hi - mono) : null
      };
    }
    case "pitch":
      if (visual.unit !== void 0 && visual.unit !== "semitones" && visual.unit !== "cents") return null;
      return {
        kind: visual.look === "diaphragm" ? "diaphragm" : "pitch",
        position: (v - lo) / (hi - lo),
        zero: between(0, lo, hi) ? -lo / (hi - lo) : null
      };
    case "gauge":
      return { kind: visual.look === "streak" ? "streak" : "gauge", position: clamp01((v - lo) / (hi - lo)) };
    case "clock": {
      const tempo = typeof visual.tempo === "number" && Number.isFinite(visual.tempo) && visual.tempo > 0 ? visual.tempo : null;
      return { kind: "clock", rate: v, frozen: v <= lo, tempo, ...visual.hand ? { hand: visual.hand } : {} };
    }
    case "trim":
      if (visual.edge !== "start" && visual.edge !== "end") return null;
      return { kind: "trim", edge: visual.edge, position: clamp01((v - lo) / (hi - lo)) };
    case "offset": {
      const origin = visual.origin;
      if (!Number.isFinite(origin) || origin < 0 || origin > 1) return null;
      return {
        kind: "offset",
        origin,
        position: clamp01(origin + v / (hi - lo)),
        back: lo < 0 && origin > 0,
        forward: hi > 0 && origin < 1
      };
    }
    default:
      return null;
  }
}
function moveTrimSpan(start, startValue, end, endValue) {
  const a = moveNumericDrawing(start, startValue);
  const b = moveNumericDrawing(end, endValue);
  if (a?.kind !== "trim" || a.edge !== "start" || b?.kind !== "trim" || b.edge !== "end") return null;
  return { start: a.position, end: b.position };
}
function moveGateSpan(dials) {
  const roles = ["threshold", "lookahead", "release"];
  if (dials.length !== 3) return null;
  const at = dials.map(([meta, value], i) => {
    const { min, max } = meta;
    const visual = meta.moveVisual;
    if (meta.type !== "slider" || visual?.kind !== "gate" || visual.role !== roles[i] || typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
    return clamp01((value - min) / (max - min));
  });
  if (at.some((p) => p === null)) return null;
  return { threshold: at[0], lookahead: at[1], release: at[2] };
}
function moveVectorAxes(dials) {
  if (dials.length !== 3) return null;
  const axes = ["x", "y", "z"];
  const at = dials.map(([meta, value], i) => {
    const visual = meta.moveVisual;
    if (visual?.kind !== "axis" || visual.axis !== axes[i]) return null;
    return sliderPosition(meta, value);
  });
  if (at.some((p) => p === null)) return null;
  const y = dials[1][0].moveVisual;
  return { x: at[0], y: at[1], z: at[2], down: y?.kind === "axis" && y.down === true };
}
var MOVE_STAGE = { width: 240, height: 48 };
var STAGE_FLOOR = { near: 44, far: 16, half: 114, farScale: 0.44 };
var STAGE_MARK = { near: 5.5, far: 2.5 };
function moveVectorStage(x01, y01, z01, down = false) {
  const cx = MOVE_STAGE.width / 2;
  const x = clamp01(x01);
  const t = clamp01(z01);
  const lift = down ? 1 - clamp01(y01) : clamp01(y01);
  const lerp = (a, b, k) => a + (b - a) * k;
  const floorY = (k) => lerp(STAGE_FLOOR.near, STAGE_FLOOR.far, k);
  const halfAt = (k) => STAGE_FLOOR.half * lerp(1, STAGE_FLOOR.farScale, k);
  const across = (u, k) => cx + (u * 2 - 1) * halfAt(k);
  const r2 = (n) => Math.round(n * 100) / 100;
  const floor = `M${r2(across(0, 0))} ${STAGE_FLOOR.near}L${r2(across(1, 0))} ${STAGE_FLOOR.near}L${r2(across(1, 1))} ${STAGE_FLOOR.far}L${r2(across(0, 1))} ${STAGE_FLOOR.far}Z`;
  const rules = [
    ...[0.25, 0.5, 0.75].map((k) => `M${r2(across(0, k))} ${r2(floorY(k))}L${r2(across(1, k))} ${r2(floorY(k))}`),
    ...[0.25, 0.5, 0.75].map((u) => `M${r2(across(u, 0))} ${STAGE_FLOOR.near}L${r2(across(u, 1))} ${STAGE_FLOOR.far}`)
  ].join("");
  const footX = across(x, t);
  const footY = floorY(t);
  const r = lerp(STAGE_MARK.near, STAGE_MARK.far, t);
  const headroom = (footY - r - 2) * 0.9;
  const markY = footY - lift * headroom;
  return {
    floor,
    rules,
    foot: { x: r2(footX), y: r2(footY), rx: r2(r * 1.3), ry: r2(r * 0.45) },
    stalk: { x: r2(footX), y1: r2(footY), y2: r2(markY) },
    mark: { x: r2(footX), y: r2(markY), r: r2(r) },
    depth: `M${r2(across(0, t))} ${r2(footY)}L${r2(across(1, t))} ${r2(footY)}`
  };
}
function sliderPosition(meta, value) {
  const { min, max } = meta;
  if (meta.type !== "slider" || typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  return clamp01((value - min) / (max - min));
}
function moveChannelPosition(meta, value) {
  return meta?.moveVisual?.kind === "channel" ? sliderPosition(meta, value) : null;
}
function moveMultibandRole(meta) {
  const visual = meta?.moveVisual;
  return meta?.type === "slider" && visual?.kind === "multiband" ? visual.role : null;
}
function moveMultibandSpan(dials, bands) {
  const roles = dials.map(([meta]) => moveMultibandRole(meta));
  if (dials.length < 3 || roles[0] !== "amount" || roles[1] !== "speed" || roles.slice(2).some((r) => r !== "band")) return null;
  const amount = sliderPosition(...dials[0]);
  const speed = sliderPosition(...dials[1]);
  if (amount === null || speed === null) return null;
  const drawn = [];
  for (const [meta, value] of bands) {
    const visual = meta.moveVisual;
    const position = sliderPosition(meta, value);
    if (visual?.kind !== "multiband" || visual.role !== "band" || position === null || !Number.isFinite(visual.band)) return null;
    drawn.push({ meta, position, band: visual.band });
  }
  drawn.sort((a, b) => a.band - b.band);
  return { amount, speed, bands: drawn.map(({ meta, position }) => ({ meta, position })) };
}
var PLAYBACK_MODES = ["forward", "reverse", "ping-pong", "bounce", "scissors"];
function playbackModeOf(meta, modes, value) {
  if (meta.type !== "select" || typeof value !== "string") return null;
  if (!meta.options?.some((option) => (typeof option === "string" ? option : option.value) === value)) return null;
  if (modes !== void 0 && (typeof modes !== "object" || modes === null || Array.isArray(modes))) return null;
  const map = modes;
  const mode = map ? Object.prototype.hasOwnProperty.call(map, value) ? map[value] : void 0 : value;
  return PLAYBACK_MODES.includes(mode) ? mode : null;
}
function movePlaybackMode(meta, value) {
  return meta.moveVisual?.kind === "playback" ? playbackModeOf(meta, meta.moveVisual.modes, value) : null;
}
function moveLanes(meta, value) {
  const visual = meta.moveVisual;
  if (meta.type !== "select" || visual?.kind !== "lanes" || !meta.options?.length) return null;
  const values = meta.options.map((option) => typeof option === "string" ? option : option.value);
  const silent = Array.isArray(visual.silent) ? visual.silent : [];
  return { chosen: Math.max(0, values.indexOf(value)), silent: values.map((v) => silent.includes(v)) };
}
function moveGrainRole(meta) {
  const visual = meta?.moveVisual;
  if (visual?.kind !== "grain") return null;
  const slider = visual.role === "length" || visual.role === "density" || visual.role === "offset";
  return (slider ? meta.type === "slider" : meta.type === "select") ? visual.role : null;
}
var GRAIN_MIN_SPACING = 0.035;
function moveGrainSpan(dials) {
  if (dials.length !== 4) return null;
  const roles = dials.map(([meta]) => moveGrainRole(meta));
  if (roles[0] !== "length" || roles[1] !== "shape" || roles[2] !== "density" && roles[2] !== "offset" || roles[3] !== "direction") return null;
  const length = sliderPosition(...dials[0]);
  const amount = sliderPosition(...dials[2]);
  const [shapeMeta, shapeValue] = dials[1];
  const [directionMeta, directionValue] = dials[3];
  const visual = directionMeta.moveVisual;
  const direction = playbackModeOf(directionMeta, visual.modes, directionValue);
  if (length === null || amount === null || !direction) return null;
  let shape = null;
  try {
    const sampler = shapeMeta.preview?.(String(shapeValue ?? ""));
    if (typeof sampler === "function") shape = sampler;
  } catch {
    shape = null;
  }
  const polled = (read) => {
    try {
      const n = read?.();
      return typeof n === "number" && Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  };
  const trailVisual = dials[2][0].moveVisual;
  let trail;
  if (trailVisual.role === "density") {
    const overlap = polled(trailVisual.overlap) ?? 0.66 * 2 ** (amount * 6);
    trail = { role: "density", spacing: Math.max(GRAIN_MIN_SPACING, 1 / Math.max(1e-6, overlap)) };
  } else {
    trail = { role: "offset", lag: Math.max(0, polled(trailVisual.lag) ?? amount) };
  }
  const option = (meta, value) => {
    const values = (meta.options ?? []).map((o) => typeof o === "string" ? o : o.value);
    return values.length > 1 ? Math.max(0, values.indexOf(value)) / (values.length - 1) : 0;
  };
  return {
    length,
    shape,
    trail,
    direction,
    positions: [length, option(shapeMeta, shapeValue), amount, option(directionMeta, directionValue)]
  };
}
var MOVE_GRAIN = { width: 300, height: 100, base: 100, top: 6, copies: 7 };
function moveGrainPicture(span) {
  const { width: W, base, top, copies: most } = MOVE_GRAIN;
  const margin = 6;
  const sample = span.shape ?? ((t) => Math.sin(Math.PI * t));
  const both = span.direction === "ping-pong" || span.direction === "bounce" || span.direction === "scissors";
  const ratio = span.trail.role === "density" ? span.trail.spacing : span.trail.lag;
  const fits = (W - 2 * margin) / (1 + ratio * (both ? 2 : 1));
  const g = Math.min(W * (0.2 + 0.46 * clamp01(span.length)), fits);
  const step = ratio * g;
  const room = both ? (W - g) / 2 - margin : W - g - 2 * margin;
  const count = span.trail.role === "offset" ? 1 : Math.max(1, Math.min(most, Math.ceil(room / Math.max(step, 1e-6))));
  const reach = span.trail.role === "offset" ? step : Math.min(count * step, room);
  const x0 = both ? (W - g) / 2 : Math.max(margin, (W - g - reach) / 2);
  const r2 = (n) => Math.round(n * 100) / 100;
  const outline = (at) => {
    const points = [];
    const n = 48;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const y = clamp01(Number(sample(t)) || 0);
      points.push(`${r2(at + t * g)} ${r2(base - y * (base - top))}`);
    }
    return `M${r2(at)} ${base}L${points.join("L")}L${r2(at + g)} ${base}Z`;
  };
  const shifts = Array.from({ length: count }, (_, k) => {
    const rank = k + 1;
    if (!both) return { rank, dx: rank * step };
    const side = k % 2 === 0 ? 1 : -1;
    return { rank: Math.ceil(rank / 2), dx: side * Math.ceil(rank / 2) * step };
  });
  const mirror = (d) => span.direction === "reverse" ? d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${r2(W - Number(x))} ${y}`) : d;
  const copies = shifts.sort((a, b) => b.rank - a.rank).map(({ rank, dx }) => ({ d: mirror(outline(x0 + dx)), rank }));
  const from = span.direction === "reverse" ? W - x0 - g : x0;
  return { hero: mirror(outline(x0)), span: { from: r2(from), to: r2(from + g) }, copies };
}
function moveVisualReading(meta, value) {
  if (meta.formatValue) return meta.formatValue(value);
  const number = Number(value.toFixed(2)).toString();
  if (meta.unit) return `${number}${meta.unit}`;
  if (!moveNumericDrawing(meta, value)) return number;
  const visual = meta.moveVisual;
  switch (visual.kind) {
    case "opacity":
      return `${Number((value / (visual.opaqueValue ?? 1) * 100).toFixed(1))}%`;
    case "blur":
      return `${number} px`;
    case "pan": {
      const center = visual.center ?? 0;
      if (value === center) return "C";
      const extent = value < center ? center - (visual.left ?? -1) : (visual.right ?? 1) - center;
      return `${value < center ? "L" : "R"} ${Number((Math.abs(value - center) / extent * 100).toFixed(1))}%`;
    }
    case "stereo-width":
      return value === (visual.mono ?? 0) ? "Mono" : `${Number(((value - (visual.mono ?? 0)) / ((visual.unity ?? 1) - (visual.mono ?? 0))).toFixed(2))}\xD7`;
    case "pitch":
      return `${value > 0 ? "+" : ""}${number} ${visual.unit === "cents" ? "ct" : "st"}`;
    case "gauge":
      return `${number}\xD7`;
    case "clock":
      return `${number}\xD7`;
    case "trim":
      return `${number} s`;
    default:
      return number;
  }
}
function moveKeyboardValue(meta, value, key, fine = false) {
  const direction = key === "ArrowRight" || key === "ArrowUp" || key === "PageUp" ? 1 : key === "ArrowLeft" || key === "ArrowDown" || key === "PageDown" ? -1 : 0;
  if (!direction && key !== "Home" && key !== "End") return null;
  if (meta.type === "select") {
    const options = meta.options ?? [];
    if (!options.length) return null;
    const optionValue = (option) => typeof option === "string" ? option : option.value;
    const index = Math.max(0, options.findIndex((option) => optionValue(option) === value));
    const next2 = key === "Home" ? 0 : key === "End" ? options.length - 1 : Math.max(0, Math.min(options.length - 1, index + direction));
    return optionValue(options[next2]);
  }
  const { min, max } = meta;
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  if (key === "Home") return min;
  if (key === "End") return max;
  const range = max - min;
  if (meta.step === 0) {
    const delta = range / (fine ? 1e3 : key.startsWith("Page") ? 10 : 100);
    return Math.max(min, Math.min(max, Number((value + direction * delta).toPrecision(12))));
  }
  const step = meta.step && Number.isFinite(meta.step) && meta.step > 0 ? meta.step : range / 100;
  const coarseSteps = Math.max(1, Math.round(range / 100 / step));
  const multiplier = fine ? 1 : key.startsWith("Page") ? coarseSteps * 10 : coarseSteps;
  const next = Math.round((value + direction * step * multiplier) / step) * step;
  return Math.max(min, Math.min(max, Number(next.toPrecision(12))));
}
var MOVE_BAND_W = 79;
var MOVE_BAND_H = 39;
var BAND_SLANT = 4;
var BAND_SHOULDER = 8;
function moveBandCuts(low, high) {
  const W = MOVE_BAND_W;
  const H = MOVE_BAND_H;
  const xl = clamp01(low) * W;
  const xh = Math.max(xl, clamp01(high) * W);
  let topL = xl + BAND_SLANT;
  let topR = xh - BAND_SLANT;
  if (topL > topR) topL = topR = (topL + topR) / 2;
  const k = Math.min(BAND_SHOULDER, (topR - topL) / 2);
  const dx = BAND_SLANT * k / H;
  const n = (v) => Number(v.toFixed(2));
  return {
    low: `M 0 0 L ${n(topL + k)} 0 Q ${n(topL)} 0 ${n(topL - dx)} ${n(k)} L ${n(xl)} ${H} L 0 ${H} Z`,
    high: `M ${W} 0 L ${n(topR - k)} 0 Q ${n(topR)} 0 ${n(topR + dx)} ${n(k)} L ${n(xh)} ${H} L ${W} ${H} Z`
  };
}
export {
  MOVE_BAND_H,
  MOVE_BAND_W,
  MOVE_GRAIN,
  MOVE_STAGE,
  moveBandCuts,
  moveChannelPosition,
  moveGateSpan,
  moveGrainPicture,
  moveGrainRole,
  moveGrainSpan,
  moveKeyboardValue,
  moveLanes,
  moveMultibandRole,
  moveMultibandSpan,
  moveNumericDrawing,
  movePlaybackMode,
  moveTrimSpan,
  moveVectorAxes,
  moveVectorStage,
  moveVisualReading
};
//# sourceMappingURL=move-visual-core.js.map