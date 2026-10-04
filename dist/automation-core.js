// src/automation-core.ts
var AUTOMATION_TOLERANCE = 4e-3;
var AUTOMATION_SMOOTH_SAMPLES = 240;
var EMPTY_TIMELINE = Object.freeze({ lanes: Object.freeze([]) });
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clamp01 = (t) => clamp(t, 0, 1);
var spanOf = (range) => range.max - range.min > 0 ? range.max - range.min : 1;
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
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const v = clamp(Number.isFinite(base) ? base : lo, lo, hi);
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
      const expected = q.t > p.t ? p.v + (q.v - p.v) * (points[i].t - p.t) / (q.t - p.t) : p.v;
      const error = Math.abs(points[i].v - expected) / span;
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
  const sorted = samples.filter((s) => Number.isFinite(s.t) && Number.isFinite(s.v)).map((s, i) => ({ t: clamp(s.t, from, to), v: clamp(s.v, range.min, range.max), i })).sort((p, q) => p.t - q.t || p.i - q.i);
  const out = [];
  for (const s of sorted) {
    const n = out.length;
    if (n >= 2 && out[n - 1].t === s.t && out[n - 2].t === s.t) out[n - 1].v = s.v;
    else out.push({ t: s.t, v: s.v });
  }
  return out;
}
function smooth(lane, amount, span, tolerance = AUTOMATION_TOLERANCE) {
  const sigma = clamp(amount, 0, 4) * 0.05;
  if (!(sigma > 0)) return simplify(lane.points, lane, tolerance, lane.interp);
  const from = span ? clamp01(Math.min(span.from, span.to)) : 0;
  const to = span ? clamp01(Math.max(span.from, span.to)) : 1;
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
      sum += weights[k + reach] * valueAt(lane, clamp01(t + k * step));
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
    samples.push({ t, v: clamp(v, lane.min, lane.max) });
  }
  const smoothed = simplify(samples, lane, tolerance, lane.interp);
  if (!span) return smoothed;
  const before = lane.points.filter((p) => p.t < from);
  const after = lane.points.filter((p) => p.t > to);
  return [...before.map((p) => ({ ...p })), ...smoothed, ...after.map((p) => ({ ...p }))];
}
function mergeSpan(lane, span, tolerance = AUTOMATION_TOLERANCE) {
  const from = clamp01(Math.min(span.from, span.to));
  const to = clamp01(Math.max(span.from, span.to));
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
  const a = clamp01(from);
  const b = clamp01(to);
  if (a <= b) return [{ from: a, to: b }];
  return [{ from: a, to: 1 }, { from: 0, to: b }];
}
function clearRange(lane, from, to) {
  const a = clamp01(Math.min(from, to));
  const b = clamp01(Math.max(from, to));
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
  const nextT = pinned ? current.t : clamp(Number.isFinite(t) ? t : current.t, prev ? prev.t : 0, next ? next.t : 1);
  const nextV = clamp(Number.isFinite(v) ? v : current.v, lane.min, lane.max);
  if (nextT === current.t && nextV === current.v) return lane;
  const copy = points.map((p) => ({ ...p }));
  copy[index] = { t: nextT, v: nextV };
  return { ...lane, points: copy };
}
function addPoint(lane, t, v) {
  const at = clamp01(Number.isFinite(t) ? t : 0);
  const value = clamp(v !== void 0 && Number.isFinite(v) ? v : valueAt(lane, at), lane.min, lane.max);
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
    const a = Number(e.min);
    const b = Number(e.max);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) continue;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const rawPoints = Array.isArray(e.points) ? e.points : [];
    const points = rawPoints.map(readPoint).filter((p) => !!p).map((p, i) => ({ t: clamp01(p.t), v: clamp(p.v, min, max), i })).sort((p, q) => p.t - q.t || p.i - q.i).map(({ t, v }) => ({ t, v }));
    if (!points.length) continue;
    seen.add(key);
    lanes.push({
      key,
      label: typeof e.label === "string" && e.label ? e.label : key,
      min,
      max,
      interp: e.interp === "hold" ? "hold" : "linear",
      points
    });
  }
  return { lanes };
}
export {
  AUTOMATION_SMOOTH_SAMPLES,
  AUTOMATION_TOLERANCE,
  EMPTY_TIMELINE,
  addPoint,
  clearRange,
  createLane,
  deletePoint,
  laneByKey,
  mergeSpan,
  movePoint,
  remapKeys,
  removeLane,
  sampleTimeline,
  simplify,
  smooth,
  splitAtWrap,
  upsertLane,
  validateTimeline,
  valueAt,
  valueBefore
};
//# sourceMappingURL=automation-core.js.map