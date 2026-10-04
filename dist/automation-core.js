// src/color-core.ts
var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
var clamp01 = (n) => clamp(n, 0, 1);
var byte = (n) => clamp(Math.round(n), 0, 255);
var srgbToLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
var linearToSrgb = (c) => c <= 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
function rgbToOklab(rgba) {
  const r = srgbToLinear(rgba.r / 255);
  const g = srgbToLinear(rgba.g / 255);
  const b = srgbToLinear(rgba.b / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    A: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    B: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  };
}
function oklabToLinearRgb(L, A, B) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2307590544 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  };
}
function oklabToRgb(L, A, B, a = 1) {
  const lin = oklabToLinearRgb(L, A, B);
  return {
    r: byte(linearToSrgb(clamp01(lin.r)) * 255),
    g: byte(linearToSrgb(clamp01(lin.g)) * 255),
    b: byte(linearToSrgb(clamp01(lin.b)) * 255),
    a: clamp01(a)
  };
}

// src/automation-core.ts
var AUTOMATION_COLOR_MAX = 16777215;
var AUTOMATION_TOLERANCE = 4e-3;
var AUTOMATION_SMOOTH_SAMPLES = 240;
var EMPTY_TIMELINE = Object.freeze({ lanes: Object.freeze([]) });
var clamp2 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clamp012 = (t) => clamp2(t, 0, 1);
var spanOf = (range) => range.max - range.min > 0 ? range.max - range.min : 1;
function packColor(hex) {
  const raw = typeof hex === "string" ? hex.trim().replace(/^#/, "") : "";
  const full = raw.length === 3 || raw.length === 4 ? raw.slice(0, 3).split("").map((c) => c + c).join("") : raw.slice(0, 6);
  const n = /^[0-9a-f]{6}$/i.test(full) ? parseInt(full, 16) : 0;
  return n;
}
function unpackColor(v) {
  const n = Math.round(clamp2(Number.isFinite(v) ? v : 0, 0, AUTOMATION_COLOR_MAX));
  return `#${n.toString(16).padStart(6, "0")}`;
}
var rgbOf = (v) => {
  const n = Math.round(clamp2(Number.isFinite(v) ? v : 0, 0, AUTOMATION_COLOR_MAX));
  return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255, a: 1 };
};
function mixColor(a, b, t) {
  if (a === b || !(t > 0)) return Math.round(a);
  if (t >= 1) return Math.round(b);
  const p = rgbToOklab(rgbOf(a));
  const q = rgbToOklab(rgbOf(b));
  const c = oklabToRgb(p.L + (q.L - p.L) * t, p.A + (q.A - p.A) * t, p.B + (q.B - p.B) * t);
  return c.r << 16 | c.g << 8 | c.b;
}
function colorDistance(a, b) {
  if (a === b) return 0;
  const p = rgbToOklab(rgbOf(a));
  const q = rgbToOklab(rgbOf(b));
  return Math.hypot(p.L - q.L, p.A - q.A, p.B - q.B);
}
function fitValue(lane, v) {
  const inside = clamp2(v, lane.min, lane.max);
  return lane.interp === "color" ? Math.round(inside) : inside;
}
function pointAtOrBefore(points, t, cursor) {
  const n = points.length;
  let lo = 0;
  let hi = n - 1;
  if (cursor && cursor.index >= 0 && cursor.index < n && points[cursor.index].t <= t) {
    let i = cursor.index;
    for (let step = 0; step < 4 && i + 1 < n && points[i + 1].t <= t; step++) i++;
    if (i + 1 >= n || points[i + 1].t > t) {
      cursor.index = i;
      return i;
    }
    lo = i;
  }
  let found = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (points[mid].t <= t) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (cursor) cursor.index = Math.max(0, found);
  return found;
}
function between(a, b, t, interp) {
  if (interp === "hold" || b.t <= a.t) return a.v;
  if (interp === "color") return mixColor(a.v, b.v, (t - a.t) / (b.t - a.t));
  return a.v + (b.v - a.v) * (t - a.t) / (b.t - a.t);
}
function valueAt(lane, t, cursor) {
  const { points } = lane;
  if (!points.length) return lane.min;
  const i = pointAtOrBefore(points, t, cursor);
  if (i < 0) return points[0].v;
  if (i >= points.length - 1) return points[points.length - 1].v;
  return between(points[i], points[i + 1], t, lane.interp);
}
function valueBefore(lane, t) {
  const { points } = lane;
  if (!points.length) return lane.min;
  let lo = 0;
  let hi = points.length - 1;
  let i = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (points[mid].t < t) {
      i = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (i < 0) return points[0].v;
  if (i >= points.length - 1) return points[points.length - 1].v;
  return between(points[i], points[i + 1], t, lane.interp);
}
function createLane(key, label, min, max, base, interp = "linear") {
  const color = interp === "color";
  const lo = color ? 0 : Math.min(min, max);
  const hi = color ? AUTOMATION_COLOR_MAX : Math.max(min, max);
  const v = fitValue({ min: lo, max: hi, interp }, Number.isFinite(base) ? base : lo);
  return { key, label, min: lo, max: hi, interp, points: [{ t: 0, v }, { t: 1, v }] };
}
function simplify(points, range, tolerance = AUTOMATION_TOLERANCE, interp = "linear") {
  const n = points.length;
  if (n <= 2) return points.map((p) => ({ t: p.t, v: p.v }));
  const span = spanOf(range);
  const limit = Math.max(0, tolerance);
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  for (let i = 1; i < n; i++) {
    if (points[i].t === points[i - 1].t) keep[i] = keep[i - 1] = 1;
  }
  if (interp === "hold") {
    const out2 = [];
    for (let i = 0; i < n; i++) {
      const last = out2[out2.length - 1];
      if (keep[i] || !last || Math.abs(points[i].v - last.v) / span > limit) out2.push({ t: points[i].t, v: points[i].v });
    }
    return out2;
  }
  const stack = [];
  let a = 0;
  for (let i = 1; i < n; i++) {
    if (!keep[i]) continue;
    if (i - a > 1) stack.push([a, i]);
    a = i;
  }
  while (stack.length) {
    const [lo, hi] = stack.pop();
    const p = points[lo];
    const q = points[hi];
    let worst = -1;
    let at = -1;
    for (let i = lo + 1; i < hi; i++) {
      const share = q.t > p.t ? (points[i].t - p.t) / (q.t - p.t) : 0;
      const error = interp === "color" ? colorDistance(points[i].v, mixColor(p.v, q.v, share)) : Math.abs(points[i].v - (p.v + (q.v - p.v) * share)) / span;
      if (error > worst) {
        worst = error;
        at = i;
      }
    }
    if (worst > limit && at > 0) {
      keep[at] = 1;
      if (at - lo > 1) stack.push([lo, at]);
      if (hi - at > 1) stack.push([at, hi]);
    }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push({ t: points[i].t, v: points[i].v });
  return out;
}
function cleanSamples(samples, from, to, range) {
  const sorted = samples.filter((s) => Number.isFinite(s.t) && Number.isFinite(s.v)).map((s, i) => ({ t: clamp2(s.t, from, to), v: fitValue(range, s.v), i })).sort((p, q) => p.t - q.t || p.i - q.i);
  const out = [];
  for (const s of sorted) {
    const n = out.length;
    if (n >= 2 && out[n - 1].t === s.t && out[n - 2].t === s.t) out[n - 1].v = s.v;
    else out.push({ t: s.t, v: s.v });
  }
  return out;
}
function smooth(lane, amount, span, tolerance = AUTOMATION_TOLERANCE) {
  if (lane.interp === "color") return lane.points.map((p) => ({ ...p }));
  const sigma = clamp2(amount, 0, 4) * 0.05;
  if (!(sigma > 0)) return simplify(lane.points, lane, tolerance, lane.interp);
  const from = span ? clamp012(Math.min(span.from, span.to)) : 0;
  const to = span ? clamp012(Math.max(span.from, span.to)) : 1;
  if (!(to > from)) return lane.points.map((p) => ({ ...p }));
  const n = AUTOMATION_SMOOTH_SAMPLES;
  const step = sigma / 8;
  const reach = 24;
  const weights = [];
  let total = 0;
  for (let k = -reach; k <= reach; k++) {
    const w = Math.exp(-((k * step) ** 2) / (2 * sigma * sigma));
    weights.push(w);
    total += w;
  }
  const fade = span ? Math.min(sigma * 2, (to - from) / 3) : 0;
  const cursor = { index: 0 };
  const samples = [];
  for (let i = 0; i <= n; i++) {
    const t = from + (to - from) * i / n;
    let sum = 0;
    for (let k = -reach; k <= reach; k++) {
      sum += weights[k + reach] * valueAt(lane, clamp012(t + k * step));
    }
    let v = sum / total;
    if (fade > 0) {
      const edge = Math.min(t - from, to - t) / fade;
      if (edge < 1) {
        const mix = edge <= 0 ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * edge);
        const original = valueAt(lane, t, cursor);
        v = original + (v - original) * mix;
      }
    }
    samples.push({ t, v: clamp2(v, lane.min, lane.max) });
  }
  const smoothed = simplify(samples, lane, tolerance, lane.interp);
  if (!span) return smoothed;
  const before = lane.points.filter((p) => p.t < from);
  const after = lane.points.filter((p) => p.t > to);
  return [...before.map((p) => ({ ...p })), ...smoothed, ...after.map((p) => ({ ...p }))];
}
function mergeSpan(lane, span, tolerance = AUTOMATION_TOLERANCE) {
  const from = clamp012(Math.min(span.from, span.to));
  const to = clamp012(Math.max(span.from, span.to));
  const samples = cleanSamples(span.samples, from, to, lane);
  if (!samples.length || !(to - from > 1e-9)) return lane;
  if (samples[0].t > from) samples.unshift({ t: from, v: samples[0].v });
  if (samples[samples.length - 1].t < to) samples.push({ t: to, v: samples[samples.length - 1].v });
  const written = simplify(samples, lane, tolerance, lane.interp);
  const left = valueBefore(lane, from);
  const right = valueAt(lane, to);
  const points = [];
  for (const p of lane.points) if (p.t < from) points.push({ ...p });
  if (from > 0) points.push({ t: from, v: left });
  points.push(...written);
  if (to < 1) points.push({ t: to, v: right });
  for (const p of lane.points) if (p.t > to) points.push({ ...p });
  return { ...lane, points: dropRedundantJumps(points) };
}
function dropRedundantJumps(points) {
  return points.filter((p, i) => !(i > 0 && p.t === points[i - 1].t && p.v === points[i - 1].v));
}
function splitAtWrap(from, to) {
  const a = clamp012(from);
  const b = clamp012(to);
  if (a <= b) return [{ from: a, to: b }];
  return [{ from: a, to: 1 }, { from: 0, to: b }];
}
function clearRange(lane, from, to) {
  const a = clamp012(Math.min(from, to));
  const b = clamp012(Math.max(from, to));
  if (!(b > a)) return lane;
  const left = valueBefore(lane, a);
  const right = valueAt(lane, b);
  const points = [];
  for (const p of lane.points) if (p.t < a) points.push({ ...p });
  points.push({ t: a, v: left });
  points.push({ t: b, v: right });
  for (const p of lane.points) if (p.t > b) points.push({ ...p });
  return { ...lane, points: dropRedundantJumps(points) };
}
function movePoint(lane, index, t, v) {
  const { points } = lane;
  if (index < 0 || index >= points.length) return lane;
  const prev = points[index - 1];
  const next = points[index + 1];
  const current = points[index];
  const pinned = index === 0 && current.t === 0 || index === points.length - 1 && current.t === 1;
  const nextT = pinned ? current.t : clamp2(Number.isFinite(t) ? t : current.t, prev ? prev.t : 0, next ? next.t : 1);
  const nextV = fitValue(lane, Number.isFinite(v) ? v : current.v);
  if (nextT === current.t && nextV === current.v) return lane;
  const copy = points.map((p) => ({ ...p }));
  copy[index] = { t: nextT, v: nextV };
  return { ...lane, points: copy };
}
function addPoint(lane, t, v) {
  const at = clamp012(Number.isFinite(t) ? t : 0);
  const value = fitValue(lane, v !== void 0 && Number.isFinite(v) ? v : valueAt(lane, at));
  let index = lane.points.length;
  for (let i = 0; i < lane.points.length; i++) {
    if (lane.points[i].t > at) {
      index = i;
      break;
    }
  }
  const points = lane.points.map((p) => ({ ...p }));
  points.splice(index, 0, { t: at, v: value });
  return { lane: { ...lane, points }, index };
}
function deletePoint(lane, index) {
  if (lane.points.length <= 1 || index < 0 || index >= lane.points.length) return lane;
  return { ...lane, points: lane.points.filter((_, i) => i !== index).map((p) => ({ ...p })) };
}
function laneByKey(timeline, key) {
  return timeline.lanes.find((lane) => lane.key === key);
}
function upsertLane(timeline, lane) {
  const at = timeline.lanes.findIndex((l) => l.key === lane.key);
  if (at < 0) return { lanes: [...timeline.lanes, lane] };
  const lanes = timeline.lanes.slice();
  lanes[at] = lane;
  return { lanes };
}
function removeLane(timeline, key) {
  if (!timeline.lanes.some((l) => l.key === key)) return timeline;
  return { lanes: timeline.lanes.filter((l) => l.key !== key) };
}
function sampleTimeline(timeline, t) {
  const out = /* @__PURE__ */ new Map();
  for (const lane of timeline.lanes) out.set(lane.key, valueAt(lane, t));
  return out;
}
function remapKeys(timeline, map) {
  const seen = /* @__PURE__ */ new Set();
  const lanes = [];
  for (const lane of timeline.lanes) {
    const key = map(lane.key);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    lanes.push(key === lane.key ? lane : { ...lane, key });
  }
  return { lanes };
}
function readPoint(raw) {
  const pair = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw.t, raw.v] : null;
  if (!pair) return null;
  const t = Number(pair[0]);
  const v = Number(pair[1]);
  return Number.isFinite(t) && Number.isFinite(v) ? { t, v } : null;
}
function validateTimeline(raw) {
  const list = raw && typeof raw === "object" ? raw.lanes : null;
  if (!Array.isArray(list)) return { lanes: [] };
  const seen = /* @__PURE__ */ new Set();
  const lanes = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry;
    const key = typeof e.key === "string" ? e.key : "";
    if (!key || seen.has(key)) continue;
    const interp = e.interp === "hold" ? "hold" : e.interp === "color" ? "color" : "linear";
    const color = interp === "color";
    const a = color ? 0 : Number(e.min);
    const b = color ? AUTOMATION_COLOR_MAX : Number(e.max);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) continue;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const rawPoints = Array.isArray(e.points) ? e.points : [];
    const points = rawPoints.map(readPoint).filter((p) => !!p).map((p, i) => ({ t: clamp012(p.t), v: fitValue({ min, max, interp }, p.v), i })).sort((p, q) => p.t - q.t || p.i - q.i).map(({ t, v }) => ({ t, v }));
    if (!points.length) continue;
    seen.add(key);
    lanes.push({
      key,
      label: typeof e.label === "string" && e.label ? e.label : key,
      min,
      max,
      interp,
      points
    });
  }
  return { lanes };
}
export {
  AUTOMATION_COLOR_MAX,
  AUTOMATION_SMOOTH_SAMPLES,
  AUTOMATION_TOLERANCE,
  EMPTY_TIMELINE,
  addPoint,
  clearRange,
  colorDistance,
  createLane,
  deletePoint,
  fitValue,
  laneByKey,
  mergeSpan,
  mixColor,
  movePoint,
  packColor,
  remapKeys,
  removeLane,
  sampleTimeline,
  simplify,
  smooth,
  splitAtWrap,
  unpackColor,
  upsertLane,
  validateTimeline,
  valueAt,
  valueBefore
};
//# sourceMappingURL=automation-core.js.map