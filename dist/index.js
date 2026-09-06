"use client";

// src/components/MovePanel.tsx
import { useEffect as useEffect4, useRef as useRef4, useState as useState2, useSyncExternalStore, useCallback } from "react";
import { createPortal } from "react-dom";

// src/color-core.ts
var COLOR_FORMATS = ["hex", "rgb", "hsl", "oklch"];
var HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
var clamp01 = (n) => clamp(n, 0, 1);
var byte = (n) => clamp(Math.round(n), 0, 255);
function parseHex(input) {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s.startsWith("#")) s = `#${s}`;
  if (!HEX_COLOR_REGEX.test(s)) return null;
  let h = s.slice(1);
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}
function formatHex(rgba, alphaEnabled) {
  const hx = (n) => byte(n).toString(16).padStart(2, "0");
  const base = `#${hx(rgba.r)}${hx(rgba.g)}${hx(rgba.b)}`;
  return alphaEnabled ? `${base}${hx(clamp01(rgba.a) * 255)}` : base;
}
function normalizeHex(input, alphaEnabled) {
  const rgba = parseHex(input);
  return rgba ? formatHex(rgba, alphaEnabled) : null;
}
function displayHex(value) {
  const rgba = parseHex(value);
  if (!rgba) return (value ?? "").toUpperCase();
  return formatHex(rgba, false).toUpperCase();
}
function opacityPercent(rgba) {
  return Math.round(clamp01(rgba.a) * 100);
}
function rgbToHsv(rgba) {
  const r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a: rgba.a };
}
function hsvToRgb(hsva) {
  const h = (hsva.h % 360 + 360) % 360;
  const s = clamp01(hsva.s), v = clamp01(hsva.v);
  const c = v * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: byte((r + m) * 255), g: byte((g + m) * 255), b: byte((b + m) * 255), a: hsva.a };
}
function rgbToHsl(rgba) {
  const { h, s, v, a } = rgbToHsv(rgba);
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l, a };
}
function hslToRgb(hsla) {
  const l = clamp01(hsla.l), s = clamp01(hsla.s);
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return hsvToRgb({ h: hsla.h, s: sv, v, a: hsla.a });
}
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
function rgbToOklch(rgba) {
  const { L, A, B } = rgbToOklab(rgba);
  const c = Math.sqrt(A * A + B * B);
  let h = Math.atan2(B, A) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h: c < 1e-6 ? 0 : h, a: rgba.a };
}
var GAMUT_EPS = 1e-4;
function inSrgbGamut(l, c, h) {
  const rad = h * Math.PI / 180;
  const { r, g, b } = oklabToLinearRgb(l, c * Math.cos(rad), c * Math.sin(rad));
  return r >= -GAMUT_EPS && r <= 1 + GAMUT_EPS && g >= -GAMUT_EPS && g <= 1 + GAMUT_EPS && b >= -GAMUT_EPS && b <= 1 + GAMUT_EPS;
}
function clampOklchToSrgb(oklch) {
  const l = clamp01(oklch.l);
  const h = (oklch.h % 360 + 360) % 360;
  const c = Math.max(0, oklch.c);
  if (inSrgbGamut(l, c, h)) return { l, c, h, a: clamp01(oklch.a) };
  let lo = 0, hi = c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return { l, c: lo, h, a: clamp01(oklch.a) };
}
function oklchToRgb(oklch) {
  const { l, c, h, a } = clampOklchToSrgb(oklch);
  const rad = h * Math.PI / 180;
  const lin = oklabToLinearRgb(l, c * Math.cos(rad), c * Math.sin(rad));
  return {
    r: byte(linearToSrgb(clamp01(lin.r)) * 255),
    g: byte(linearToSrgb(clamp01(lin.g)) * 255),
    b: byte(linearToSrgb(clamp01(lin.b)) * 255),
    a: clamp01(a)
  };
}

// src/gradient-core.ts
var MIN_STOPS = 2;
var DEFAULT_GRADIENT = {
  type: "linear",
  angle: 90,
  stops: [
    { color: "#6366f1ff", position: 0 },
    { color: "#ec4899ff", position: 1 }
  ]
};
var clamp012 = (n) => Math.min(1, Math.max(0, n));
var clampPct = (n) => Math.min(100, Math.max(0, n));
var clampScale = (n) => Math.min(200, Math.max(10, n));
var clampSquash = (n) => Math.min(200, Math.max(1, n));
var wrapAngle = (a) => (a % 360 + 360) % 360;
var round = (n, p) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};
var cloneDefaultStops = () => DEFAULT_GRADIENT.stops.map((s) => ({ ...s }));
var cloneDefault = () => ({
  type: DEFAULT_GRADIENT.type,
  angle: DEFAULT_GRADIENT.angle,
  stops: cloneDefaultStops()
});
var sortedStops = (stops) => [...stops].sort((a, b) => a.position - b.position);
var stopString = (stops) => sortedStops(stops).map((s) => `${s.color} ${round(clamp012(s.position) * 100, 2)}%`).join(", ");
var normColor = (color) => {
  const rgba = parseHex(color);
  return rgba ? formatHex(rgba, true) : "#000000ff";
};
function rampCss(stops) {
  return gradientToCss({ type: "linear", angle: 90, stops });
}
function gradientToCss(value) {
  const stopStr = stopString(value.stops);
  const angle = round(wrapAngle(value.angle), 2);
  const cx = round(clampPct(value.centerX ?? 50), 2);
  const cy = round(clampPct(value.centerY ?? 50), 2);
  switch (value.type) {
    case "radial": {
      const rx = clampScale(value.scale ?? 100);
      const ry = value.squash === void 0 ? rx : clampSquash(value.squash);
      if (rx === 100 && ry === 100) {
        return `radial-gradient(circle at ${cx}% ${cy}%, ${stopStr})`;
      }
      return `radial-gradient(${round(rx, 2)}% ${round(ry, 2)}% at ${cx}% ${cy}%, ${stopStr})`;
    }
    case "conic":
      return `conic-gradient(from ${angle}deg at ${cx}% ${cy}%, ${stopStr})`;
    case "linear":
    default:
      return `linear-gradient(${angle}deg, ${stopStr})`;
  }
}
function gradientToTransform(value) {
  const cx = round(clampPct(value.centerX ?? 50), 2);
  const cy = round(clampPct(value.centerY ?? 50), 2);
  const rotation = wrapAngle(value.rotation ?? 0);
  const rx = clampScale(value.scale ?? 100);
  const ry = value.squash === void 0 ? rx : clampSquash(value.squash);
  if (value.type !== "radial" || rotation === 0 || rx === ry) {
    return { transform: "none", transformOrigin: "50% 50%" };
  }
  return { transform: `rotate(${round(rotation, 2)}deg)`, transformOrigin: `${cx}% ${cy}%` };
}
function gradientFillBox(value, boxW, boxH) {
  if (value.type !== "radial" || boxW <= 0 || boxH <= 0) {
    return {
      background: gradientToCss(value),
      transform: "none",
      transformOrigin: "50% 50%",
      left: 0,
      top: 0,
      width: boxW,
      height: boxH
    };
  }
  const cxPx = clampPct(value.centerX ?? 50) / 100 * boxW;
  const cyPx = clampPct(value.centerY ?? 50) / 100 * boxH;
  const scaleX = clampScale(value.scale ?? 100) / 100;
  const scaleY = (value.squash === void 0 ? clampScale(value.scale ?? 100) : clampSquash(value.squash)) / 100;
  const rx = round(scaleX * boxW, 2);
  const ry = round(scaleY * boxH, 2);
  const side = round(2 * Math.hypot(boxW, boxH), 2);
  const rotation = wrapAngle(value.rotation ?? 0);
  return {
    background: `radial-gradient(${rx}px ${ry}px at 50% 50%, ${stopString(value.stops)})`,
    transform: rotation === 0 ? "none" : `rotate(${round(rotation, 2)}deg)`,
    transformOrigin: "50% 50%",
    left: round(cxPx - side / 2, 2),
    top: round(cyPx - side / 2, 2),
    width: side,
    height: side
  };
}
function lerpPremult(a, b, t) {
  const pa = a.a + (b.a - a.a) * t;
  if (pa === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (ca, aa, cb, ba) => (ca * aa + (cb * ba - ca * aa) * t) / pa;
  return {
    r: mix(a.r, a.a, b.r, b.a),
    g: mix(a.g, a.a, b.g, b.a),
    b: mix(a.b, a.a, b.b, b.a),
    a: pa
  };
}
function colorAtPosition(value, position) {
  const stops = sortedStops(value.stops);
  if (stops.length === 0) return "#000000ff";
  const p = clamp012(position);
  if (p <= stops[0].position) return normColor(stops[0].color);
  const last = stops[stops.length - 1];
  if (p >= last.position) return normColor(last.color);
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].position <= p) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const span = b.position - a.position;
  const t = span === 0 ? 0 : (p - a.position) / span;
  const ca = parseHex(a.color) ?? { r: 0, g: 0, b: 0, a: 1 };
  const cb = parseHex(b.color) ?? { r: 0, g: 0, b: 0, a: 1 };
  return formatHex(lerpPremult(ca, cb, t), true);
}
function normalizeGradient(input) {
  if (!input || typeof input !== "object") return cloneDefault();
  const obj = input;
  if (!Array.isArray(obj.stops)) return cloneDefault();
  const type = obj.type === "radial" || obj.type === "conic" ? obj.type : "linear";
  const rawAngle = Number(obj.angle);
  const angle = Number.isFinite(rawAngle) ? wrapAngle(rawAngle) : DEFAULT_GRADIENT.angle;
  const extras = {};
  const cx = Number(obj.centerX);
  if (Number.isFinite(cx)) extras.centerX = clampPct(cx);
  const cy = Number(obj.centerY);
  if (Number.isFinite(cy)) extras.centerY = clampPct(cy);
  const scale = Number(obj.scale);
  if (Number.isFinite(scale)) extras.scale = clampScale(scale);
  const squash = Number(obj.squash);
  if (Number.isFinite(squash)) extras.squash = clampSquash(squash);
  const rotation = Number(obj.rotation);
  if (Number.isFinite(rotation)) extras.rotation = wrapAngle(rotation);
  const stops = [];
  for (const raw of obj.stops) {
    if (!raw || typeof raw !== "object") continue;
    const s = raw;
    const rgba = typeof s.color === "string" ? parseHex(s.color) : null;
    const pos = Number(s.position);
    if (!rgba || !Number.isFinite(pos)) continue;
    stops.push({ color: formatHex(rgba, true), position: clamp012(pos) });
  }
  if (stops.length < MIN_STOPS) return { type, angle, stops: cloneDefaultStops(), ...extras };
  stops.sort((a, b) => a.position - b.position);
  return { type, angle, stops, ...extras };
}
function addStop(value, position) {
  const stop = { color: colorAtPosition(value, position), position: clamp012(position) };
  const stops = [...value.stops, stop].sort((a, b) => a.position - b.position);
  return { value: { ...value, stops }, index: stops.indexOf(stop) };
}
function moveStop(value, index, position) {
  if (index < 0 || index >= value.stops.length) return { value, index };
  const moved = { ...value.stops[index], position: clamp012(position) };
  const stops = value.stops.map((s, i) => i === index ? moved : s);
  stops.sort((a, b) => a.position - b.position);
  return { value: { ...value, stops }, index: stops.indexOf(moved) };
}
function removeStop(value, index) {
  if (value.stops.length <= MIN_STOPS || index < 0 || index >= value.stops.length) return value;
  return { ...value, stops: value.stops.filter((_, i) => i !== index) };
}
function setStopColor(value, index, hex) {
  if (index < 0 || index >= value.stops.length) return value;
  const rgba = parseHex(hex);
  if (!rgba) return value;
  const color = formatHex(rgba, true);
  return { ...value, stops: value.stops.map((s, i) => i === index ? { ...s, color } : s) };
}
function setGradientType(value, type) {
  return { ...value, type };
}
function setGradientAngle(value, angle) {
  return { ...value, angle: wrapAngle(angle) };
}
function setGradientCenter(value, centerX, centerY) {
  return { ...value, centerX: clampPct(centerX), centerY: clampPct(centerY) };
}
function setGradientScale(value, scale) {
  return { ...value, scale: clampScale(scale) };
}
function setGradientSquash(value, squash) {
  return { ...value, squash: clampSquash(squash) };
}
function setGradientRotation(value, rotation) {
  return { ...value, rotation: wrapAngle(rotation) };
}

// src/xy-pad-core.ts
var XY_DETENT_PX = 6;
var XY_DEFAULT_STEP = 0.01;
function decimalsForStep(step) {
  const s = step.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}
function roundToStep(val, step) {
  return parseFloat(val.toFixed(decimalsForStep(step)));
}
function resolveAxis(axis) {
  const min = axis?.min ?? 0;
  const max = axis?.max ?? 1;
  const step = axis?.step ?? XY_DEFAULT_STEP;
  const bipolar = axis?.bipolar ?? false;
  const origin = axis?.origin ?? (bipolar ? (min + max) / 2 : min);
  return { min, max, step, origin, bipolar };
}
function clamp2(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
function snapToStep(v, step, min) {
  if (step <= 0) return v;
  const snapped = min + Math.round((v - min) / step) * step;
  return roundToStep(snapped, step);
}
function valueToNorm(v, axis) {
  if (axis.max === axis.min) return 0;
  return clamp2((v - axis.min) / (axis.max - axis.min), 0, 1);
}
function normToValue(n, axis) {
  const t = clamp2(n, 0, 1);
  return axis.min + t * (axis.max - axis.min);
}
function invertY(n) {
  return 1 - n;
}
function valueFromPoint(point, xAxis, yAxis, snap2 = false) {
  let x = clamp2(normToValue(point.x, xAxis), xAxis.min, xAxis.max);
  let y = clamp2(normToValue(invertY(point.y), yAxis), yAxis.min, yAxis.max);
  if (snap2) {
    x = snapToStep(x, xAxis.step, xAxis.min);
    y = snapToStep(y, yAxis.step, yAxis.min);
  }
  return { x, y };
}
function pointFromValue(value, xAxis, yAxis) {
  return {
    x: valueToNorm(value.x, xAxis),
    y: invertY(valueToNorm(value.y, yAxis))
  };
}
function applyDetentAxis(value, axis, pxFromOrigin) {
  if (axis.bipolar && pxFromOrigin <= XY_DETENT_PX) return axis.origin;
  return value;
}
function effectiveStep(axis, mode) {
  const range = axis.max - axis.min;
  if (mode === "fine") return range * 0.01;
  if (mode === "coarse") return range * 0.1;
  return axis.step;
}
function nudge(value, axis, direction, xAxis, yAxis, mode = "normal") {
  const spec = axis === "x" ? xAxis : yAxis;
  const step = effectiveStep(spec, mode);
  const next = roundToStep(clamp2(value[axis] + direction * step, spec.min, spec.max), step);
  return axis === "x" ? { x: next, y: value.y } : { x: value.x, y: next };
}
function centerValue(xAxis, yAxis) {
  return { x: xAxis.origin, y: yAxis.origin };
}
function coerceComponent(v, axis) {
  return typeof v === "number" && Number.isFinite(v) ? v : axis.origin;
}
function normalizeValue(value, xAxis, yAxis, snap2 = false) {
  const resolve = (raw, axis) => {
    let v = clamp2(coerceComponent(raw, axis), axis.min, axis.max);
    if (snap2) v = snapToStep(v, axis.step, axis.min);
    return v + 0;
  };
  return {
    x: resolve(value?.x, xAxis),
    y: resolve(value?.y, yAxis)
  };
}

// src/range-slider-core.ts
function clamp3(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
function valueToPercent(v, min, max) {
  if (max === min) return 0;
  return (v - min) / (max - min) * 100;
}
function percentToValue(pct01, min, max) {
  return min + clamp3(pct01, 0, 1) * (max - min);
}
function orderRange(v) {
  return v.min <= v.max ? v : { min: v.max, max: v.min };
}
function clampRange(v, min, max) {
  return orderRange({ min: clamp3(v.min, min, max), max: clamp3(v.max, min, max) });
}
function setLow(nextLow, current, min) {
  return { min: clamp3(nextLow, min, current.max), max: current.max };
}
function setHigh(nextHigh, current, max) {
  return { min: current.min, max: clamp3(nextHigh, current.min, max) };
}
function shiftSpan(deltaValue, current, min, max) {
  const width = current.max - current.min;
  const desiredMin = clamp3(current.min + deltaValue, min, max - width);
  return { min: desiredMin, max: desiredMin + width };
}
function nearestHandle(atValue, current) {
  const dMin = Math.abs(atValue - current.min);
  const dMax = Math.abs(atValue - current.max);
  if (dMin < dMax) return "min";
  if (dMax < dMin) return "max";
  return atValue < current.min ? "min" : "max";
}
function pickDragTarget(atValue, current, hitValue) {
  const nearLow = Math.abs(atValue - current.min) <= hitValue;
  const nearHigh = Math.abs(atValue - current.max) <= hitValue;
  if (nearLow && nearHigh) return nearestHandle(atValue, current);
  if (nearLow) return "min";
  if (nearHigh) return "max";
  if (atValue > current.min && atValue < current.max) return "span";
  return nearestHandle(atValue, current);
}
function isOutsideSpan(atValue, current) {
  return atValue <= current.min || atValue >= current.max;
}
function handleLeftStyles(lowPercent, highPercent) {
  const gap = `(${highPercent}% - ${lowPercent}%)`;
  const ramp = `clamp(0px, calc(6px - ${gap}), 2px)`;
  return {
    low: `max(0px, min(calc(100% - 2px), calc(${lowPercent}% - 1px - ${ramp})))`,
    high: `min(calc(100% - 2px), max(0px, calc(${highPercent}% - 1px + ${ramp})))`
  };
}

// src/transfer-core.ts
var DEFAULT_TRANSFER = { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] };
var TRANSFER_MIN_GAP = 0.02;
var TRANSFER_MAX_POINTS = 12;
var clamp013 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
var finite = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
function normalizeTransfer(value) {
  const raw = value?.points;
  if (!Array.isArray(raw) || raw.length < 2) return { points: DEFAULT_TRANSFER.points.map((p) => ({ ...p })) };
  const points = raw.map((p) => ({ x: clamp013(finite(p?.x, 0)), y: clamp013(finite(p?.y, 0)) })).sort((a, b) => a.x - b.x);
  points[0].x = 0;
  points[points.length - 1].x = 1;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (points[i].x - out[out.length - 1].x < TRANSFER_MIN_GAP) continue;
    if (1 - points[i].x < TRANSFER_MIN_GAP) continue;
    out.push(points[i]);
  }
  out.push(points[points.length - 1]);
  return { points: out.slice(0, TRANSFER_MAX_POINTS) };
}
function tangents(points) {
  const n = points.length;
  const secant = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    secant[i] = dx > 0 ? (points[i + 1].y - points[i].y) / dx : 0;
  }
  const m = new Array(n);
  m[0] = secant[0];
  m[n - 1] = secant[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = secant[i - 1] * secant[i] <= 0 ? 0 : (secant[i - 1] + secant[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (secant[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / secant[i];
    const b = m[i + 1] / secant[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      m[i] = 3 / h * a * secant[i];
      m[i + 1] = 3 / h * b * secant[i];
    }
  }
  return m;
}
function sampleTransfer(points, x) {
  if (!points.length) return clamp013(x);
  if (points.length === 1) return points[0].y;
  const t = clamp013(finite(x, 0));
  if (t <= points[0].x) return points[0].y;
  const last = points[points.length - 1];
  if (t >= last.x) return last.y;
  let i = 0;
  while (i < points.length - 2 && points[i + 1].x < t) i++;
  const p0 = points[i], p1 = points[i + 1];
  const h = p1.x - p0.x;
  if (h <= 0) return p1.y;
  const m = tangents(points);
  const s = (t - p0.x) / h;
  const s2 = s * s, s3 = s2 * s;
  return clamp013(
    (2 * s3 - 3 * s2 + 1) * p0.y + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * p1.y + (s3 - s2) * h * m[i + 1]
  );
}
function transferLut(points, size = 256) {
  const out = new Float32Array(size);
  for (let i = 0; i < size; i++) out[i] = sampleTransfer(points, size === 1 ? 0 : i / (size - 1));
  return out;
}
function insertPoint(points, x, y) {
  const next = normalizeTransfer({ points: [...points, { x: clamp013(x), y: clamp013(y) }] }).points;
  const index = next.findIndex((p) => Math.abs(p.x - clamp013(x)) < 1e-9);
  return { points: next, index: index < 0 ? 0 : index };
}
function removePoint(points, index) {
  if (index <= 0 || index >= points.length - 1) return points;
  return points.filter((_, i) => i !== index);
}
function movePoint(points, index, x, y) {
  if (index < 0 || index >= points.length) return points;
  const out = points.map((p) => ({ ...p }));
  const ny = clamp013(finite(y, 0));
  if (index === 0 || index === points.length - 1) {
    out[index].y = ny;
    return out;
  }
  const lo = out[index - 1].x + TRANSFER_MIN_GAP;
  const hi = out[index + 1].x - TRANSFER_MIN_GAP;
  out[index] = { x: hi < lo ? out[index].x : Math.min(hi, Math.max(lo, clamp013(finite(x, 0)))), y: ny };
  return out;
}
function nearestPoint(points, x, y, tolerance) {
  let best = -1, bestD = tolerance;
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - x, points[i].y - y);
    if (d <= bestD) {
      best = i;
      bestD = d;
    }
  }
  return best;
}
function isIdentityTransfer(points) {
  return points.length === 2 && points[0].x === 0 && points[0].y === 0 && points[1].x === 1 && points[1].y === 1;
}

// src/filter-core.ts
var FILTER_AXIS_DEFAULTS = {
  cutoff: { min: 0, max: 1, step: 0, label: "Freq" },
  resonance: { min: 0, max: 1, step: 0, label: "Res" }
};
function resolveFilterAxis(axis, hand) {
  const base = FILTER_AXIS_DEFAULTS[hand];
  return {
    min: axis?.min ?? base.min,
    max: axis?.max ?? base.max,
    step: axis?.step ?? base.step,
    label: axis?.label ?? base.label,
    formatValue: axis?.formatValue
  };
}
var clamp4 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var snap = (v, axis) => {
  let out = clamp4(Number.isFinite(v) ? v : axis.min, axis.min, axis.max);
  if (axis.step > 0) out = clamp4(axis.min + Math.round((out - axis.min) / axis.step) * axis.step, axis.min, axis.max);
  return Number(out.toFixed(6));
};
function normalizeFilterValue(value, cutoffAxis, resonanceAxis) {
  const v = typeof value === "object" && value !== null ? value : {};
  return {
    cutoff: snap(typeof v.cutoff === "number" ? v.cutoff : cutoffAxis.max, cutoffAxis),
    resonance: snap(typeof v.resonance === "number" ? v.resonance : resonanceAxis.min, resonanceAxis)
  };
}
var filterHand01 = (v, axis) => {
  const n = (v - axis.min) / (axis.max - axis.min || 1);
  return clamp4(Number.isFinite(n) ? n : 0, 0, 1);
};
var filterHandValue = (v01, axis) => snap(axis.min + clamp4(v01, 0, 1) * (axis.max - axis.min), axis);
function filterShapeResponse(type, cutoff01, resonance01) {
  const fc = Math.pow(10, -3 + 3 * clamp4(cutoff01, 0, 1));
  const q = 0.707 * Math.pow(14, clamp4(resonance01, 0, 1));
  const a = Math.pow(10, clamp4(resonance01, 0, 1) * 18 / 40);
  return (t) => {
    const f = Math.pow(10, -3 + 3 * clamp4(t, 0, 1));
    const w = f / fc;
    const w2 = w * w;
    const den = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / q, 2));
    let mag;
    switch (type) {
      case "highpass":
        mag = w2 / den;
        break;
      case "bandpass":
        mag = w / q / den;
        break;
      case "notch":
        mag = Math.abs(1 - w2) / den;
        break;
      case "peak":
        mag = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w * a / q, 2)) / Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / (a * q), 2));
        break;
      default:
        mag = 1 / den;
    }
    return Math.min((20 * Math.log10(Math.max(mag, 1e-6)) + FILTER_DB_FLOOR) / (FILTER_DB_FLOOR + FILTER_DB_CEIL), 1);
  };
}
function defaultFilterResponse(cutoff01, resonance01) {
  return filterShapeResponse("lowpass", cutoff01, resonance01);
}
var FILTER_DB_FLOOR = 36;
var FILTER_DB_CEIL = 24;
var FILTER_SHAPE_SAMPLES = 96;
function filterResponsePath(response, samples = FILTER_SHAPE_SAMPLES) {
  const pts = [];
  for (let i = 0; i < samples; i++) {
    let y;
    try {
      y = response(i / (samples - 1));
    } catch {
      return null;
    }
    if (!Number.isFinite(y)) return null;
    pts.push(Math.min(1, Math.max(-1, y)));
  }
  return pts.map((y, i) => `${i ? "L" : "M"} ${(i / (samples - 1) * 100).toFixed(2)} ${((1 - y) * 100).toFixed(2)}`).join(" ");
}

// src/store/persist.ts
var STORAGE_VERSION = "v1";
function resolvePersistTarget(kind, id, persist) {
  if (!persist) return null;
  const config = persist === true ? {} : persist;
  const base = config.key ?? id;
  if (!base) return null;
  return {
    key: `tweakers:${STORAGE_VERSION}:${kind}:${base}`,
    storage: config.storage ?? "localStorage"
  };
}
function getStorage(name) {
  try {
    if (typeof window === "undefined") return null;
    return name === "sessionStorage" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}
function loadPersisted(target) {
  if (!target) return null;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return null;
    const raw = storage.getItem(target.key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function savePersisted(target, value) {
  if (!target) return;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return;
    storage.setItem(target.key, JSON.stringify(value));
  } catch {
  }
}
function clearPersisted(target) {
  if (!target) return;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return;
    storage.removeItem(target.key);
  } catch {
  }
}

// src/store/TweakStore.ts
var TAB_PATH = "_tab";
var EMPTY_VALUES = Object.freeze({});
function hintDomId(scope, path) {
  return `tweakers-hint-${scope}-${path}`.replace(/\s+/g, "-");
}
function sameMarkers(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((m, i) => Object.is(m, b[i]));
}
var TweakStoreClass = class {
  constructor() {
    this.panels = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.globalListeners = /* @__PURE__ */ new Set();
    this.snapshots = /* @__PURE__ */ new Map();
    this.actionListeners = /* @__PURE__ */ new Map();
    this.eventListeners = /* @__PURE__ */ new Map();
    // Affordance status and disabled state are app-pushed presentation, not
    // control values: they stay out of `values` so they are never persisted, saved
    // into a preset, or diffed against the config. One listener set covers both, so
    // a control's shell needs a single subscription.
    this.affordanceStatus = /* @__PURE__ */ new Map();
    this.disabledPaths = /* @__PURE__ */ new Map();
    this.controlStateListeners = /* @__PURE__ */ new Map();
    this.presets = /* @__PURE__ */ new Map();
    this.activePreset = /* @__PURE__ */ new Map();
    // Host-owned preset providers. The serialized form (functions drop out of
    // JSON, leaving list + activeId) decides whether a swap is visible: adapters
    // replace the object on every host render so callbacks never go stale, and
    // only a data change should notify.
    this.presetProviders = /* @__PURE__ */ new Map();
    /** Panels whose header carries no preset toolbar (see setPresetsHidden). */
    this.presetsHidden = /* @__PURE__ */ new Set();
    this.baseValues = /* @__PURE__ */ new Map();
    // Resolved storage target per panel (null = persistence off). Absent = not
    // yet registered.
    this.persistTargets = /* @__PURE__ */ new Map();
  }
  registerPanel(id, name, config, shortcuts, options = {}) {
    const existingPanel = this.panels.get(id);
    if (existingPanel && existingPanel.kind !== options.kind) {
      console.warn(
        `[tweakers] Panel id "${id}" cannot be shared by a timeline and a standard panel; the most recent registration controls where it renders.`
      );
    }
    const target = resolvePersistTarget("panel", id, options.persist);
    this.persistTargets.set(id, target);
    const controls = this.parseConfig(config, "", shortcuts);
    this.applyControlExtras(controls, options.hints, options.affordances, options.labels);
    const values = this.flattenValues(config, "");
    this.initTabValue(controls, values);
    this.initTransitionModes(config, "", values);
    this.overlayPersistedValues(target, values);
    this.panels.set(id, { id, name, controls, values, shortcuts: shortcuts ?? {}, hints: options.hints, affordances: options.affordances, labels: options.labels, movePads: options.movePads, module: "_enabled" in config ? true : void 0, kind: options.kind });
    this.snapshots.set(id, { ...values });
    this.baseValues.set(id, { ...values });
    this.notifyGlobal();
  }
  updatePanel(id, name, config, shortcuts, options = {}) {
    const existing = this.panels.get(id);
    if (!existing) {
      this.registerPanel(id, name, config, shortcuts, options);
      return;
    }
    const hints = options.hints ?? existing.hints;
    const affordances = options.affordances ?? existing.affordances;
    const labels = options.labels ?? existing.labels;
    const movePads = options.movePads ?? existing.movePads;
    const controls = this.parseConfig(config, "", shortcuts);
    this.applyControlExtras(controls, hints, affordances, labels);
    const controlsByPath = this.mapControlsByPath(controls);
    const defaultValues = this.flattenValues(config, "");
    this.initTabValue(controls, defaultValues);
    const nextValues = {};
    for (const [path, defaultValue] of Object.entries(defaultValues)) {
      nextValues[path] = this.normalizePreservedValue(
        existing.values[path],
        defaultValue,
        controlsByPath.get(path)
      );
    }
    this.initTransitionModes(config, "", nextValues);
    for (const [path, mode] of Object.entries(existing.values)) {
      if (!path.endsWith(".__mode")) {
        continue;
      }
      const transitionPath = path.slice(0, -"__mode".length - 1);
      const transitionControl = controlsByPath.get(transitionPath);
      if (transitionControl?.type === "transition") {
        nextValues[path] = mode;
      }
    }
    const nextPanel = { id, name, controls, values: nextValues, shortcuts: shortcuts ?? existing.shortcuts, hints, affordances, labels, movePads, module: "_enabled" in config ? true : void 0, kind: options.kind ?? existing.kind };
    this.panels.set(id, nextPanel);
    this.snapshots.set(id, { ...nextValues });
    const previousBaseValues = this.baseValues.get(id) ?? {};
    const nextBaseValues = {};
    for (const [path, defaultValue] of Object.entries(defaultValues)) {
      nextBaseValues[path] = this.normalizePreservedValue(
        previousBaseValues[path],
        defaultValue,
        controlsByPath.get(path)
      );
    }
    for (const [path, value] of Object.entries(nextValues)) {
      if (path.endsWith(".__mode")) {
        nextBaseValues[path] = value;
      }
    }
    this.baseValues.set(id, nextBaseValues);
    this.savePanelValues(id);
    this.notify(id);
    this.notifyGlobal();
  }
  unregisterPanel(id) {
    this.panels.delete(id);
    if (this.listeners.get(id)?.size === 0) this.listeners.delete(id);
    if (this.actionListeners.get(id)?.size === 0) this.actionListeners.delete(id);
    if (this.eventListeners.get(id)?.size === 0) this.eventListeners.delete(id);
    if (this.controlStateListeners.get(id)?.size === 0) this.controlStateListeners.delete(id);
    this.affordanceStatus.delete(id);
    this.disabledPaths.delete(id);
    this.snapshots.delete(id);
    this.baseValues.delete(id);
    this.persistTargets.delete(id);
    this.presetProviders.delete(id);
    this.presetsHidden.delete(id);
    this.notifyGlobal();
  }
  // Overlay saved values onto freshly-computed defaults, in place. Only keys
  // that still exist in `values` (i.e. the current config) are restored.
  overlayPersistedValues(target, values) {
    const persisted = loadPersisted(target);
    if (!persisted) return;
    for (const key of Object.keys(values)) {
      if (Object.prototype.hasOwnProperty.call(persisted, key)) {
        values[key] = persisted[key];
      }
    }
  }
  // Save the panel's current flat values (fail-soft, no-op when persistence is
  // off). Called after every edit so timing/values survive a reload.
  savePanelValues(panelId) {
    const target = this.persistTargets.get(panelId);
    if (!target) return;
    const panel = this.panels.get(panelId);
    if (panel) savePersisted(target, panel.values);
  }
  updateValue(panelId, path, value) {
    const panel = this.panels.get(panelId);
    if (!panel) return;
    panel.values[path] = value;
    const activeId = this.activePreset.get(panelId);
    if (activeId) {
      const presets = this.presets.get(panelId) ?? [];
      const preset = presets.find((p) => p.id === activeId);
      if (preset) preset.values[path] = value;
    } else {
      const base = this.baseValues.get(panelId);
      if (base) base[path] = value;
    }
    this.snapshots.set(panelId, { ...panel.values });
    this.savePanelValues(panelId);
    this.notify(panelId);
  }
  // Apply several path/value edits atomically — one snapshot + one notify.
  // The timeline uses this when a single gesture trades time between fields
  // (e.g. resizing a clip's start edge shifts both its position and duration),
  // where an intermediate single-field state would be invalid.
  updateValues(panelId, updates) {
    const panel = this.panels.get(panelId);
    if (!panel) return;
    const activeId = this.activePreset.get(panelId);
    const preset = activeId ? (this.presets.get(panelId) ?? []).find((p) => p.id === activeId) : void 0;
    const base = this.baseValues.get(panelId);
    for (const [path, value] of Object.entries(updates)) {
      panel.values[path] = value;
      if (preset) preset.values[path] = value;
      else if (base) base[path] = value;
    }
    this.snapshots.set(panelId, { ...panel.values });
    this.savePanelValues(panelId);
    this.notify(panelId);
  }
  updateSpringMode(panelId, path, mode) {
    this.updateTransitionMode(panelId, path, mode);
  }
  getSpringMode(panelId, path) {
    const mode = this.getTransitionMode(panelId, path);
    if (mode === "easing") return "simple";
    return mode;
  }
  updateTransitionMode(panelId, path, mode) {
    const panel = this.panels.get(panelId);
    if (!panel) return;
    panel.values[`${path}.__mode`] = mode;
    this.snapshots.set(panelId, { ...panel.values });
    this.notify(panelId);
  }
  getTransitionMode(panelId, path) {
    const panel = this.panels.get(panelId);
    if (!panel) return "simple";
    return panel.values[`${path}.__mode`] || "simple";
  }
  getValue(panelId, path) {
    const panel = this.panels.get(panelId);
    return panel?.values[path];
  }
  getValues(panelId) {
    return this.snapshots.get(panelId) ?? EMPTY_VALUES;
  }
  getPanels(kind) {
    const all = Array.from(this.panels.values());
    if (kind === "panel") return all.filter((panel) => panel.kind === void 0);
    if (kind === "timeline") return all.filter((panel) => panel.kind === "timeline");
    return all;
  }
  /**
   * The settings panels a root should draw, given its optional `panels` filter.
   * `undefined` means every panel — the single-surface default. A list means
   * exactly those names, in the order named, so two roots never fight over the
   * same panel and a panel that has not registered yet leaves a gap that fills
   * when it does.
   */
  selectPanels(only) {
    const registered = this.getPanels("panel");
    if (only === void 0) return registered;
    const names = typeof only === "string" ? [only] : only;
    return names.map((name) => registered.find((panel) => panel.name === name)).filter((panel) => panel !== void 0);
  }
  getPanel(id) {
    return this.panels.get(id);
  }
  subscribe(panelId, listener) {
    if (!this.listeners.has(panelId)) {
      this.listeners.set(panelId, /* @__PURE__ */ new Set());
    }
    this.listeners.get(panelId).add(listener);
    return () => {
      const listeners2 = this.listeners.get(panelId);
      listeners2?.delete(listener);
      if (listeners2?.size === 0 && !this.panels.has(panelId)) {
        this.listeners.delete(panelId);
      }
    };
  }
  subscribeGlobal(listener) {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }
  subscribeActions(panelId, listener) {
    if (!this.actionListeners.has(panelId)) {
      this.actionListeners.set(panelId, /* @__PURE__ */ new Set());
    }
    this.actionListeners.get(panelId).add(listener);
    return () => {
      const listeners2 = this.actionListeners.get(panelId);
      listeners2?.delete(listener);
      if (listeners2?.size === 0 && !this.panels.has(panelId)) {
        this.actionListeners.delete(panelId);
      }
    };
  }
  triggerAction(panelId, path) {
    this.actionListeners.get(panelId)?.forEach((fn) => fn(path));
  }
  // Generic non-value event channel (file picked, chip removed, list mutated).
  subscribeEvents(panelId, listener) {
    if (!this.eventListeners.has(panelId)) {
      this.eventListeners.set(panelId, /* @__PURE__ */ new Set());
    }
    this.eventListeners.get(panelId).add(listener);
    return () => {
      const listeners2 = this.eventListeners.get(panelId);
      listeners2?.delete(listener);
      if (listeners2?.size === 0 && !this.panels.has(panelId)) {
        this.eventListeners.delete(panelId);
      }
    };
  }
  emitEvent(panelId, path, event) {
    this.eventListeners.get(panelId)?.forEach((fn) => fn(path, event));
  }
  /**
   * How lit a control's affordance dot is. Callers may push this as often as
   * they like — an unchanged status is dropped without notifying, so driving it
   * from an audio callback costs nothing.
   */
  setAffordanceStatus(panelId, path, status) {
    let byPath = this.affordanceStatus.get(panelId);
    if (status === "off") {
      if (!byPath?.delete(path)) return;
    } else {
      if (byPath?.get(path) === status) return;
      if (!byPath) {
        byPath = /* @__PURE__ */ new Map();
        this.affordanceStatus.set(panelId, byPath);
      }
      byPath.set(path, status);
    }
    this.notifyControlState(panelId);
  }
  getAffordanceStatus(panelId, path) {
    return this.affordanceStatus.get(panelId)?.get(path) ?? "off";
  }
  /**
   * Greys a control out and stops it responding. Runtime-only by design: a
   * config default plus a runtime override would be two sources of truth, and
   * calling this once covers the static case.
   */
  setDisabled(panelId, path, disabled) {
    let paths = this.disabledPaths.get(panelId);
    if (disabled) {
      if (paths?.has(path)) return;
      if (!paths) {
        paths = /* @__PURE__ */ new Set();
        this.disabledPaths.set(panelId, paths);
      }
      paths.add(path);
    } else if (!paths?.delete(path)) {
      return;
    }
    this.notifyControlState(panelId);
  }
  isDisabled(panelId, path) {
    return this.disabledPaths.get(panelId)?.has(path) ?? false;
  }
  /** One channel for every app-pushed presentation change on a panel. */
  subscribeControlState(panelId, listener) {
    if (!this.controlStateListeners.has(panelId)) {
      this.controlStateListeners.set(panelId, /* @__PURE__ */ new Set());
    }
    this.controlStateListeners.get(panelId).add(listener);
    return () => {
      const listeners2 = this.controlStateListeners.get(panelId);
      listeners2?.delete(listener);
      if (listeners2?.size === 0 && !this.panels.has(panelId)) {
        this.controlStateListeners.delete(panelId);
      }
    };
  }
  notifyControlState(panelId) {
    this.controlStateListeners.get(panelId)?.forEach((fn) => fn());
  }
  /**
   * Refresh curve rows' host-supplied presentation (sample function + markers)
   * in place. Functions drop out of the serialized config diff (the
   * `formatValue` precedent), so a host that rebuilds its config per render
   * would otherwise leave the preview drawing a stale closure; markers ride the
   * same sync so the whole curve row stays one coherent refresh. Adapters call
   * this after every render — the same contract as setPresetProvider — and only
   * an actual change (function identity, marker values) notifies, on the
   * control-state channel: curve rows are presentation, and the value snapshot
   * must not churn (a new snapshot would re-render the host, whose rebuilt
   * closure would notify again, forever). Markers are compared by value, not
   * identity, because a per-render rebuild remakes the array every time.
   */
  syncCurveConfigs(panelId, config) {
    const panel = this.panels.get(panelId);
    if (!panel) return;
    let changed = false;
    const visit = (cfg, prefix) => {
      for (const [key, value] of Object.entries(cfg)) {
        if (key === "_collapsed" || key === "_collapsible" || key === "_tabs") continue;
        const path = prefix ? `${prefix}.${key}` : key;
        if (this.isCurveConfig(value)) {
          const control = this.findControlByPath(panel.controls, path);
          if (control?.type === "curve") {
            if (control.sample !== value.sample) {
              control.sample = value.sample;
              changed = true;
            }
            if (!sameMarkers(control.markers, value.markers)) {
              control.markers = value.markers;
              changed = true;
            }
          }
        } else if (this.isAnalyserConfig(value)) {
          const control = this.findControlByPath(panel.controls, path);
          if (control?.type === "analyser" && control.analyserRow !== void 0) {
            const prev = control.analyserRow;
            const sameRange = prev.rangeHz === value.rangeHz || !!prev.rangeHz && !!value.rangeHz && prev.rangeHz[0] === value.rangeHz[0] && prev.rangeHz[1] === value.rangeHz[1];
            const sameScalars = prev.source === value.source && prev.variant === value.variant && prev.mode === value.mode && prev.pixelSize === value.pixelSize && prev.scale === value.scale && prev.height === value.height && sameRange;
            if (prev.analyser !== value.analyser || prev.marker !== value.marker || !sameScalars) {
              control.analyserRow = value;
              changed = true;
            }
          }
        } else if (this.isFilterConfig(value) && value.response) {
          const control = this.findControlByPath(panel.controls, path);
          if (control?.type === "filter" && control.response !== value.response) {
            control.response = value.response;
            changed = true;
          }
        } else if (this.isSelectConfig(value) && value.preview) {
          const control = this.findControlByPath(panel.controls, path);
          if (control?.type === "select" && control.preview !== value.preview) {
            control.preview = value.preview;
            changed = true;
          }
        } else if (typeof value === "object" && value !== null && !Array.isArray(value) && !this.isSpringConfig(value) && !this.isEasingConfig(value) && !this.isActionConfig(value) && !this.isSelectConfig(value) && !this.isSliderConfig(value) && !this.isNumberConfig(value) && !this.isColorConfig(value) && !this.isGradientConfig(value) && !this.isXYConfig(value) && !this.isTextConfig(value) && !this.isRangeConfig(value) && !this.isFilterConfig(value) && !this.isGalleryConfig(value) && !this.isSwatchConfig(value) && !this.isChipsConfig(value) && !this.isMultiSelectConfig(value) && !this.isListConfig(value) && !this.isFileConfig(value)) {
          visit(value, path);
        }
      }
    };
    visit(config, "");
    if (changed) this.notifyControlState(panelId);
  }
  savePreset(panelId, name) {
    const panel = this.panels.get(panelId);
    if (!panel) throw new Error(`Panel ${panelId} not found`);
    const id = `preset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const preset = {
      id,
      name,
      values: { ...panel.values }
    };
    const existing = this.presets.get(panelId) ?? [];
    this.presets.set(panelId, [...existing, preset]);
    this.activePreset.set(panelId, id);
    this.snapshots.set(panelId, { ...panel.values });
    this.notify(panelId);
    return id;
  }
  loadPreset(panelId, presetId) {
    const panel = this.panels.get(panelId);
    if (!panel) return;
    const presets = this.presets.get(panelId) ?? [];
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    this.replaceValues(panel, preset.values);
    this.snapshots.set(panelId, { ...panel.values });
    this.activePreset.set(panelId, presetId);
    this.savePanelValues(panelId);
    this.notify(panelId);
  }
  deletePreset(panelId, presetId) {
    const presets = this.presets.get(panelId) ?? [];
    this.presets.set(panelId, presets.filter((p) => p.id !== presetId));
    if (this.activePreset.get(panelId) === presetId) {
      this.activePreset.set(panelId, null);
    }
    const panel = this.panels.get(panelId);
    if (panel) {
      this.snapshots.set(panelId, { ...panel.values });
    }
    this.notify(panelId);
  }
  getPresets(panelId) {
    return this.presets.get(panelId) ?? [];
  }
  getActivePresetId(panelId) {
    const provider = this.getPresetProvider(panelId);
    if (provider) return provider.activeId ?? null;
    return this.activePreset.get(panelId) ?? null;
  }
  clearActivePreset(panelId) {
    const panel = this.panels.get(panelId);
    const base = this.baseValues.get(panelId);
    if (panel && base) {
      this.replaceValues(panel, base);
      this.snapshots.set(panelId, { ...panel.values });
    }
    this.activePreset.set(panelId, null);
    this.notify(panelId);
  }
  /**
   * Install (or clear) a host-owned preset provider. Safe to call on every
   * host render: the object is always swapped so `onSelect`/`onCreate`/
   * `onDelete` never close over stale host state, but listeners are only
   * notified when the visible data (list, active id) actually changed.
   */
  setPresetProvider(panelId, provider) {
    const entry = this.presetProviders.get(panelId);
    if (!provider) {
      if (!entry) return;
      this.presetProviders.delete(panelId);
    } else {
      const serialized = JSON.stringify(provider);
      this.presetProviders.set(panelId, { provider, serialized });
      if (entry?.serialized === serialized) return;
    }
    const panel = this.panels.get(panelId);
    if (panel) {
      this.snapshots.set(panelId, { ...panel.values });
    }
    this.notify(panelId);
  }
  getPresetProvider(panelId) {
    return this.presetProviders.get(panelId)?.provider ?? null;
  }
  /**
   * Hide (or restore) a panel's preset toolbar. For the secondary panels of a
   * multi-panel app — a rack of per-voice columns, say — where a snapshot
   * means the whole instrument and so belongs to one panel only. Hiding the
   * toolbar hides its add and copy buttons with it: the header of a panel that
   * does not own presets is bare.
   */
  setPresetsHidden(panelId, hidden) {
    const had = this.presetsHidden.has(panelId);
    if (hidden === had) return;
    if (hidden) this.presetsHidden.add(panelId);
    else this.presetsHidden.delete(panelId);
    this.notify(panelId);
  }
  arePresetsHidden(panelId) {
    return this.presetsHidden.has(panelId);
  }
  /** Provider mode hides the implicit "Version 1" base row — the host owns the whole list. */
  hasPresetProvider(panelId) {
    return this.presetProviders.has(panelId);
  }
  /** The dropdown rows in host order, from the provider when one is set. */
  getPresetItems(panelId) {
    const provider = this.getPresetProvider(panelId);
    if (provider) {
      return provider.presets.map((p) => ({
        id: p.id,
        name: p.label,
        deletable: !!provider.onDelete && !p.readonly,
        renamable: !!provider.onRename && !p.readonly
      }));
    }
    return this.getPresets(panelId).map((p) => ({ id: p.id, name: p.name, deletable: true, renamable: true }));
  }
  /**
   * Row clicked. Stock mode loads the snapshot (null = back to base values);
   * provider mode hands the id to the host, which applies values itself.
   */
  selectPreset(panelId, presetId) {
    const provider = this.getPresetProvider(panelId);
    if (provider) {
      if (presetId) void provider.onSelect(presetId);
      return;
    }
    if (presetId) this.loadPreset(panelId, presetId);
    else this.clearActivePreset(panelId);
  }
  /**
   * "+" pressed. Stock mode snapshots into "Version N" (N counts the implicit
   * base as version 1); provider mode suggests the matching "Preset N" label.
   */
  createPreset(panelId) {
    const provider = this.getPresetProvider(panelId);
    if (provider) {
      void provider.onCreate(`Preset ${provider.presets.length + 1}`);
      return;
    }
    this.savePreset(panelId, `Version ${this.getPresets(panelId).length + 2}`);
  }
  /** Trash icon pressed on a row (only rendered when the item is deletable). */
  removePreset(panelId, presetId) {
    const provider = this.getPresetProvider(panelId);
    if (provider) {
      void provider.onDelete?.(presetId);
      return;
    }
    this.deletePreset(panelId, presetId);
  }
  /** Rename a preset (toolbar inline edit). Provider mode hands the new name
   * to the host; stock mode edits the store's own snapshot list. */
  renamePreset(panelId, presetId, name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const provider = this.getPresetProvider(panelId);
    if (provider) {
      void provider.onRename?.(presetId, trimmed);
      return;
    }
    const preset = (this.presets.get(panelId) ?? []).find((p) => p.id === presetId);
    if (!preset) return;
    preset.name = trimmed;
    const panel = this.panels.get(panelId);
    if (panel) this.snapshots.set(panelId, { ...panel.values });
    this.notify(panelId);
  }
  resolveShortcutTarget(key, modifier) {
    for (const panel of this.panels.values()) {
      for (const [path, shortcut] of Object.entries(panel.shortcuts)) {
        if (!shortcut.key) continue;
        if (shortcut.key.toLowerCase() !== key.toLowerCase()) continue;
        const scMod = shortcut.modifier ?? void 0;
        if (scMod !== modifier) continue;
        const control = this.findControlByPath(panel.controls, path);
        if (control) {
          return { panelId: panel.id, path, control };
        }
      }
    }
    return null;
  }
  resolveScrollOnlyTargets() {
    const results = [];
    for (const panel of this.panels.values()) {
      for (const [path, shortcut] of Object.entries(panel.shortcuts)) {
        if ((shortcut.interaction ?? "scroll") !== "scroll-only") continue;
        const control = this.findControlByPath(panel.controls, path);
        if (control) {
          results.push({ panelId: panel.id, path, control, shortcut });
        }
      }
    }
    return results;
  }
  findControlByPath(controls, path) {
    for (const control of controls) {
      if (control.path === path) return control;
      if (control.type === "folder" && control.children) {
        const found = this.findControlByPath(control.children, path);
        if (found) return found;
      }
    }
    return null;
  }
  notify(panelId) {
    this.listeners.get(panelId)?.forEach((fn) => fn());
  }
  notifyGlobal() {
    this.globalListeners.forEach((fn) => fn());
  }
  initTransitionModes(config, prefix, values) {
    for (const [key, value] of Object.entries(config)) {
      if (key === "_collapsed" || key === "_collapsible" || key === "_tabs") continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if (this.isEasingConfig(value)) {
        values[`${path}.__mode`] = "easing";
      } else if (this.isSpringConfig(value)) {
        const hasPhysics = value.stiffness !== void 0 || value.damping !== void 0 || value.mass !== void 0;
        const hasTime = value.visualDuration !== void 0 || value.bounce !== void 0;
        values[`${path}.__mode`] = hasPhysics && !hasTime ? "advanced" : "simple";
      } else if (typeof value === "object" && value !== null && !Array.isArray(value) && !this.isActionConfig(value) && !this.isSelectConfig(value) && !this.isSliderConfig(value) && !this.isNumberConfig(value) && !this.isColorConfig(value) && !this.isGradientConfig(value) && !this.isXYConfig(value) && !this.isTextConfig(value) && !this.isRangeConfig(value) && !this.isFilterConfig(value) && !this.isGalleryConfig(value) && !this.isFileConfig(value) && !this.isSwatchConfig(value) && !this.isChipsConfig(value) && !this.isMultiSelectConfig(value) && !this.isListConfig(value) && !this.isCurveConfig(value)) {
        this.initTransitionModes(value, path, values);
      }
    }
  }
  parseConfig(config, prefix, shortcuts) {
    const controls = [];
    for (const [key, value] of Object.entries(config)) {
      if (key === "_collapsed" || key === "_collapsible" || key === "_tabs" || key === "_enabled") continue;
      const path = prefix ? `${prefix}.${key}` : key;
      const label = this.formatLabel(key);
      const shortcut = shortcuts?.[path];
      if (Array.isArray(value) && value.length <= 4 && typeof value[0] === "number") {
        const tuple = value;
        controls.push({
          type: "slider",
          path,
          label,
          min: tuple[1],
          max: tuple[2],
          step: tuple[3] ?? this.inferStep(tuple[1], tuple[2]),
          shortcut
        });
      } else if (typeof value === "number") {
        const { min, max, step } = this.inferRange(value);
        controls.push({ type: "slider", path, label, min, max, step, shortcut });
      } else if (this.isSliderConfig(value)) {
        controls.push({
          type: "slider",
          path,
          label,
          min: value.min,
          max: value.max,
          moveVisual: value.moveVisual,
          step: value.step ?? this.inferStep(value.min, value.max),
          unit: value.unit,
          formatValue: value.formatValue,
          origin: value.origin,
          bipolar: value.bipolar,
          orientation: value.orientation,
          display: value.display,
          wrap: value.wrap,
          shortcut
        });
      } else if (this.isNumberConfig(value)) {
        controls.push({
          type: "number",
          path,
          label,
          min: value.min,
          max: value.max,
          step: value.step ?? this.inferRange(value.default).step,
          unit: value.unit,
          formatValue: value.formatValue,
          orientation: value.orientation,
          shortcut
        });
      } else if (typeof value === "boolean") {
        controls.push({ type: "toggle", path, label, shortcut });
      } else if (this.isSpringConfig(value) || this.isEasingConfig(value)) {
        controls.push({ type: "transition", path, label });
      } else if (this.isActionConfig(value)) {
        controls.push({ type: "action", path, label: value.label || label, caption: value.caption });
      } else if (this.isSelectConfig(value)) {
        controls.push({ type: "select", path, label, options: value.options, display: value.display, preview: value.preview, moveVisual: value.moveVisual });
      } else if (this.isColorConfig(value)) {
        controls.push({ type: "color", path, label, alpha: value.alpha, palette: value.palette });
      } else if (this.isGradientConfig(value)) {
        controls.push({ type: "gradient", path, label, gradientForm: value.form });
      } else if (this.isXYConfig(value)) {
        controls.push({ type: "xy", path, label, xAxis: value.x, yAxis: value.y, grid: value.grid, density: value.density, snap: value.snap, returnToCenter: value.returnToCenter, showValues: value.showValues });
      } else if (this.isFilterConfig(value)) {
        controls.push({ type: "filter", path, label, cutoffAxis: value.cutoff, resonanceAxis: value.resonance, response: value.response, filterEnabled: value.enabled });
      } else if (this.isTextConfig(value)) {
        controls.push({ type: "text", path, label, placeholder: value.placeholder });
      } else if (this.isTransferConfig(value)) {
        controls.push({
          type: "transfer",
          path,
          label,
          curveHeight: value.height,
          gridDivisions: value.grid,
          axisLabels: value.axisLabels
        });
      } else if (this.isRangeConfig(value)) {
        controls.push({
          type: "range",
          path,
          label,
          min: value.min,
          max: value.max,
          step: value.step ?? this.inferStep(value.min, value.max),
          rangeDefault: value.default ?? { min: value.min, max: value.max }
        });
      } else if (this.isGalleryConfig(value)) {
        controls.push({ type: "gallery", path, label, items: value.items, columns: value.columns });
      } else if (this.isFileConfig(value)) {
        controls.push({ type: "file", path, label, accept: value.accept, multiple: value.multiple });
      } else if (this.isSwatchConfig(value)) {
        controls.push({ type: "swatch", path, label, swatchOptions: value.options });
      } else if (this.isChipsConfig(value)) {
        controls.push({ type: "chips", path, label, chipOptions: value.options });
      } else if (this.isMultiSelectConfig(value)) {
        controls.push({ type: "multiselect", path, label, multiSelectOptions: value.options });
      } else if (this.isListConfig(value)) {
        controls.push({ type: "list", path, label, itemTypes: value.itemTypes, addLabel: value.addLabel, maxItems: value.max });
      } else if (this.isCurveConfig(value)) {
        controls.push({
          type: "curve",
          path,
          label: typeof value.label === "string" ? value.label : label,
          hideLabel: value.label === false || void 0,
          sample: value.sample,
          domain: value.domain,
          markers: value.markers,
          height: value.height,
          aspect: value.aspect
        });
      } else if (this.isAnalyserConfig(value)) {
        controls.push({
          type: "analyser",
          path,
          label: typeof value.label === "string" ? value.label : label,
          hideLabel: value.label === false || void 0,
          height: value.height,
          analyserRow: value
        });
      } else if (typeof value === "string") {
        if (this.isHexColor(value)) {
          const hasAlpha = value.length === 5 || value.length === 9;
          controls.push({ type: "color", path, label, alpha: hasAlpha || void 0 });
        } else {
          controls.push({ type: "text", path, label });
        }
      } else if (typeof value === "object" && value !== null) {
        const folderConfig = value;
        const module = "_enabled" in folderConfig ? true : void 0;
        const collapsible = !module && folderConfig._collapsible === false ? false : void 0;
        const defaultOpen = collapsible === false ? true : "_collapsed" in folderConfig ? !folderConfig._collapsed : true;
        controls.push({
          type: "folder",
          path,
          label,
          defaultOpen,
          collapsible,
          module,
          children: this.parseConfig(folderConfig, path, shortcuts)
        });
      }
    }
    if (prefix === "" && config._tabs === true) {
      const isFolder = (control) => control.type === "folder";
      const tabs = controls.filter((control) => isFolder(control) && (control.children?.length ?? 0) > 0);
      if (tabs.length > 0) {
        for (const tab of tabs) tab.tab = true;
        return [
          {
            type: "select",
            path: TAB_PATH,
            label: "Tab",
            display: "segmented",
            tabBar: true,
            options: tabs.map((tab) => tab.path)
          },
          ...controls.filter((control) => !isFolder(control)),
          ...tabs
        ];
      }
    }
    return controls;
  }
  /**
   * Swaps a panel's whole value map, keeping the open tab. Which tab you are
   * reading is a place, not a parameter: a preset should change the sound, not
   * move you to another page of the panel.
   */
  replaceValues(panel, values) {
    const openTab = panel.values[TAB_PATH];
    panel.values = { ...values };
    if (openTab !== void 0) panel.values[TAB_PATH] = openTab;
  }
  /**
   * Seeds the active tab. It is a real value, not component state, so a config
   * rebuild preserves the reader's place — and `normalizePreservedValue` resets
   * it through the select's options when the tab it named is gone.
   */
  initTabValue(controls, values) {
    const tabBar = controls.find((control) => control.tabBar);
    if (!tabBar) return;
    values[TAB_PATH] = tabBar.options?.[0] ?? "";
  }
  flattenValues(config, prefix) {
    const values = {};
    for (const [key, value] of Object.entries(config)) {
      if (key === "_collapsed" || key === "_collapsible" || key === "_tabs") continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if (Array.isArray(value) && value.length <= 4 && typeof value[0] === "number") {
        values[path] = value[0];
      } else if (this.isSliderConfig(value) || this.isNumberConfig(value)) {
        values[path] = value.default;
      } else if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
        values[path] = value;
      } else if (this.isSpringConfig(value) || this.isEasingConfig(value)) {
        values[path] = value;
      } else if (this.isActionConfig(value)) {
        values[path] = value;
      } else if (this.isSelectConfig(value)) {
        const firstOption = value.options[0];
        const firstValue = typeof firstOption === "string" ? firstOption : firstOption.value;
        values[path] = value.default ?? firstValue;
      } else if (this.isColorConfig(value)) {
        values[path] = value.default ?? "#000000";
      } else if (this.isGradientConfig(value)) {
        values[path] = normalizeGradient(value.default ?? DEFAULT_GRADIENT);
      } else if (this.isXYConfig(value)) {
        const xAxis = resolveAxis(value.x);
        const yAxis = resolveAxis(value.y);
        values[path] = normalizeValue(value.default, xAxis, yAxis, value.snap ?? false);
      } else if (this.isTextConfig(value)) {
        values[path] = value.default ?? "";
      } else if (this.isTransferConfig(value)) {
        values[path] = normalizeTransfer(value.default ?? DEFAULT_TRANSFER);
      } else if (this.isRangeConfig(value)) {
        values[path] = value.default ?? { min: value.min, max: value.max };
      } else if (this.isFilterConfig(value)) {
        values[path] = normalizeFilterValue(
          value.default,
          resolveFilterAxis(value.cutoff, "cutoff"),
          resolveFilterAxis(value.resonance, "resonance")
        );
      } else if (this.isGalleryConfig(value)) {
        values[path] = value.default ?? value.items[0]?.id ?? "";
      } else if (this.isFileConfig(value)) {
        values[path] = "";
      } else if (this.isSwatchConfig(value)) {
        values[path] = value.default ?? value.options[0]?.value ?? "";
      } else if (this.isChipsConfig(value)) {
        values[path] = value.default ?? value.options[0]?.value ?? "";
      } else if (this.isMultiSelectConfig(value)) {
        values[path] = value.default ?? [];
      } else if (this.isListConfig(value)) {
        values[path] = normalizeListItems(value);
      } else if (this.isCurveConfig(value)) {
      } else if (typeof value === "object" && value !== null) {
        Object.assign(values, this.flattenValues(value, path));
      }
    }
    return values;
  }
  isSpringConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "spring";
  }
  isEasingConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "easing";
  }
  isActionConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "action";
  }
  isSelectConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "select" && "options" in value && Array.isArray(value.options);
  }
  isColorConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "color";
  }
  isGradientConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "gradient";
  }
  // Explicit { type: 'xy' } only — a bare { x, y } object would collide with the
  // "nested object → folder" fallback, so the shorthand is deliberately unsupported.
  isXYConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "xy";
  }
  isFilterConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "filter";
  }
  isTransferConfig(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value) && value.type === "transfer";
  }
  isRangeConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "range";
  }
  // A stored range VALUE ({min,max} numbers), as opposed to a range config.
  // Used to preserve the leaf value by identity across a panel update.
  isRangeValue(value) {
    return typeof value === "object" && value !== null && typeof value.min === "number" && typeof value.max === "number";
  }
  isTextConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "text";
  }
  isGalleryConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "gallery" && "items" in value && Array.isArray(value.items);
  }
  isFileConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "file";
  }
  isSwatchConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "swatch" && "options" in value && Array.isArray(value.options);
  }
  isChipsConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "chips" && "options" in value && Array.isArray(value.options);
  }
  isMultiSelectConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "multiselect" && "options" in value && Array.isArray(value.options);
  }
  isSliderConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "slider" && typeof value.min === "number" && typeof value.max === "number";
  }
  isNumberConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "number" && typeof value.default === "number";
  }
  isAnalyserConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "analyser" && typeof value.analyser === "function";
  }
  isCurveConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "curve" && typeof value.sample === "function";
  }
  isListConfig(value) {
    return typeof value === "object" && value !== null && "type" in value && value.type === "list" && "itemTypes" in value && typeof value.itemTypes === "object";
  }
  isHexColor(value) {
    return HEX_COLOR_REGEX.test(value);
  }
  formatLabel(key) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  }
  inferRange(value) {
    if (value >= 0 && value <= 1) {
      return { min: 0, max: 1, step: 0.01 };
    } else if (value >= 0 && value <= 10) {
      return { min: 0, max: value * 3 || 10, step: 0.1 };
    } else if (value >= 0 && value <= 100) {
      return { min: 0, max: value * 3 || 100, step: 1 };
    } else if (value >= 0) {
      return { min: 0, max: value * 3 || 1e3, step: 10 };
    } else {
      return { min: value * 3, max: -value * 3, step: 1 };
    }
  }
  inferStep(min, max) {
    const range = max - min;
    if (range <= 1) return 0.01;
    if (range <= 10) return 0.1;
    if (range <= 100) return 1;
    return 10;
  }
  normalizePreservedValue(existingValue, defaultValue, control) {
    if (existingValue === void 0 || !control) {
      return defaultValue;
    }
    switch (control.type) {
      case "slider":
      case "number": {
        if (typeof existingValue !== "number" || typeof defaultValue !== "number") {
          return defaultValue;
        }
        const min = control.min ?? Number.NEGATIVE_INFINITY;
        const max = control.max ?? Number.POSITIVE_INFINITY;
        const clamped = Math.min(max, Math.max(min, existingValue));
        if (typeof control.step !== "number" || control.step <= 0) {
          return clamped;
        }
        return this.roundToStep(clamped, min, max, control.step);
      }
      case "toggle":
        return typeof existingValue === "boolean" ? existingValue : defaultValue;
      case "select": {
        if (typeof existingValue !== "string") {
          return defaultValue;
        }
        const options = control.options ?? [];
        const validValues = new Set(options.map((option) => typeof option === "string" ? option : option.value));
        return validValues.has(existingValue) ? existingValue : defaultValue;
      }
      case "swatch": {
        if (typeof existingValue !== "string") {
          return defaultValue;
        }
        const validValues = new Set((control.swatchOptions ?? []).map((option) => option.value));
        return validValues.has(existingValue) ? existingValue : defaultValue;
      }
      case "chips": {
        if (typeof existingValue !== "string") {
          return defaultValue;
        }
        const validValues = new Set((control.chipOptions ?? []).map((option) => option.value));
        return validValues.has(existingValue) ? existingValue : defaultValue;
      }
      case "multiselect": {
        if (!Array.isArray(existingValue) || existingValue.some((v) => typeof v !== "string")) {
          return defaultValue;
        }
        const validValues = new Set((control.multiSelectOptions ?? []).map((option) => option.value));
        return existingValue.filter((v) => validValues.has(v));
      }
      case "color": {
        if (typeof existingValue !== "string" || !this.isHexColor(existingValue)) {
          return defaultValue;
        }
        if (!control.alpha && (existingValue.length === 5 || existingValue.length === 9)) {
          return existingValue.length === 9 ? existingValue.slice(0, 7) : existingValue.slice(0, 4);
        }
        if (control.alpha && (existingValue.length === 4 || existingValue.length === 7)) {
          return existingValue + (existingValue.length === 7 ? "ff" : "f");
        }
        return existingValue;
      }
      case "gradient": {
        if (typeof existingValue !== "object" || existingValue === null || !Array.isArray(existingValue.stops)) {
          return defaultValue;
        }
        return normalizeGradient(existingValue);
      }
      case "xy": {
        if (typeof existingValue !== "object" || existingValue === null || Array.isArray(existingValue)) {
          return defaultValue;
        }
        const candidate = existingValue;
        if (typeof candidate.x !== "number" || typeof candidate.y !== "number") {
          return defaultValue;
        }
        const xAxis = resolveAxis(control.xAxis);
        const yAxis = resolveAxis(control.yAxis);
        return normalizeValue(candidate, xAxis, yAxis, false);
      }
      case "filter": {
        if (typeof existingValue !== "object" || existingValue === null || Array.isArray(existingValue)) {
          return defaultValue;
        }
        const candidate = existingValue;
        if (typeof candidate.cutoff !== "number" || typeof candidate.resonance !== "number") {
          return defaultValue;
        }
        return normalizeFilterValue(
          candidate,
          resolveFilterAxis(control.cutoffAxis, "cutoff"),
          resolveFilterAxis(control.resonanceAxis, "resonance")
        );
      }
      case "text":
      case "file":
        return typeof existingValue === "string" ? existingValue : defaultValue;
      case "list":
        return Array.isArray(existingValue) ? existingValue : defaultValue;
      case "transfer":
        return typeof existingValue === "object" && existingValue !== null && !Array.isArray(existingValue) ? normalizeTransfer(existingValue) : defaultValue;
      case "range": {
        if (!this.isRangeValue(existingValue)) {
          return defaultValue;
        }
        const lo = control.min ?? Number.NEGATIVE_INFINITY;
        const hi = control.max ?? Number.POSITIVE_INFINITY;
        return clampRange(existingValue, lo, hi);
      }
      case "gallery": {
        if (typeof existingValue !== "string") {
          return defaultValue;
        }
        const validIds = new Set((control.items ?? []).map((item) => item.id));
        return validIds.has(existingValue) ? existingValue : defaultValue;
      }
      case "transition":
        if (this.isSpringConfig(defaultValue)) {
          return this.isSpringConfig(existingValue) ? existingValue : defaultValue;
        }
        if (this.isEasingConfig(defaultValue)) {
          return this.isEasingConfig(existingValue) ? existingValue : defaultValue;
        }
        return defaultValue;
      case "action":
        return defaultValue;
      default:
        return defaultValue;
    }
  }
  roundToStep(value, min, max, step) {
    const snapped = min + Math.round((value - min) / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    const precision = this.stepPrecision(step);
    return Number(clamped.toFixed(precision));
  }
  stepPrecision(step) {
    const text = String(step);
    const decimalIndex = text.indexOf(".");
    return decimalIndex === -1 ? 0 : text.length - decimalIndex - 1;
  }
  // Stamp path-keyed extras onto the parsed tree. A post-pass rather than
  // parseConfig parameters: these are cross-cutting metadata like shortcuts, and
  // every control — including folders and bare-shorthand sliders — is reachable
  // by path once the tree exists.
  applyControlExtras(controls, hints, affordances, labels) {
    if (!hints && !affordances && !labels) return;
    for (const control of controls) {
      const hint = hints?.[control.path];
      if (hint) control.hint = hint;
      const affordance = affordances?.[control.path];
      if (affordance) control.affordance = affordance;
      const label = labels?.[control.path];
      if (label) control.label = label;
      if (control.children) this.applyControlExtras(control.children, hints, affordances, labels);
    }
  }
  mapControlsByPath(controls) {
    const map = /* @__PURE__ */ new Map();
    const visit = (nodes) => {
      for (const node of nodes) {
        if (node.type === "folder" && node.children) {
          if (node.module) {
            const enabledPath = `${node.path}._enabled`;
            map.set(enabledPath, { type: "toggle", path: enabledPath, label: "Enabled" });
          }
          visit(node.children);
          continue;
        }
        map.set(node.path, node);
      }
    };
    visit(controls);
    return map;
  }
};
function listHasType(value, type) {
  return typeof value === "object" && value !== null && "type" in value && value.type === type;
}
function listFormatLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
}
function listIsHexColor(value) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value);
}
function listInferStep(min, max) {
  const range = max - min;
  if (range <= 1) return 0.01;
  if (range <= 10) return 0.1;
  if (range <= 100) return 1;
  return 10;
}
function listInferRange(value) {
  if (value >= 0 && value <= 1) return { min: 0, max: 1, step: 0.01 };
  if (value >= 0 && value <= 10) return { min: 0, max: value * 3 || 10, step: 0.1 };
  if (value >= 0 && value <= 100) return { min: 0, max: value * 3 || 100, step: 1 };
  if (value >= 0) return { min: 0, max: value * 3 || 1e3, step: 10 };
  return { min: value * 3, max: -value * 3, step: 1 };
}
function parseListItemSchema(schema, hints, groups) {
  const fields = [];
  for (const [key, def] of Object.entries(schema)) {
    const label = listFormatLabel(key);
    const hint = hints?.[key];
    const group = groups?.[key];
    if (Array.isArray(def) && def.length <= 4 && typeof def[0] === "number") {
      const [d, min, max, step] = def;
      fields.push({ key, label, hint, group, kind: "slider", min, max, step: step ?? listInferStep(min, max), defaultValue: d });
    } else if (typeof def === "number") {
      const { min, max, step } = listInferRange(def);
      fields.push({ key, label, hint, group, kind: "slider", min, max, step, defaultValue: def });
    } else if (typeof def === "boolean") {
      fields.push({ key, label, hint, group, kind: "toggle", defaultValue: def });
    } else if (listHasType(def, "select") && Array.isArray(def.options)) {
      const select = def;
      const first = select.options[0];
      const firstValue = typeof first === "string" ? first : first?.value ?? "";
      fields.push({ key, label, hint, group, kind: "select", options: select.options, defaultValue: select.default ?? firstValue });
    } else if (listHasType(def, "color")) {
      const color = def;
      fields.push({ key, label, hint, group, kind: "color", palette: color.palette, defaultValue: color.default ?? "#000000" });
    } else if (listHasType(def, "swatch") && Array.isArray(def.options)) {
      const swatch = def;
      fields.push({
        key,
        label,
        hint,
        group,
        kind: "swatch",
        swatchOptions: swatch.options,
        defaultValue: swatch.default ?? swatch.options[0]?.value ?? ""
      });
    } else if (listHasType(def, "text")) {
      const text = def;
      fields.push({ key, label, hint, group, kind: "text", placeholder: text.placeholder, defaultValue: text.default ?? "" });
    } else if (typeof def === "string") {
      fields.push({ key, label, hint, group, kind: listIsHexColor(def) ? "color" : "text", defaultValue: def });
    }
  }
  return fields;
}
function groupListFields(fields) {
  const flat2 = [];
  const groups = [];
  const byLabel = /* @__PURE__ */ new Map();
  for (const field of fields) {
    if (!field.group) {
      flat2.push(field);
      continue;
    }
    let group = byLabel.get(field.group);
    if (!group) {
      group = { label: field.group, fields: [] };
      byLabel.set(field.group, group);
      groups.push(group);
    }
    group.fields.push(field);
  }
  return { flat: flat2, groups };
}
function defaultListItemParams(schema) {
  const params = {};
  for (const field of parseListItemSchema(schema)) {
    params[field.key] = field.defaultValue;
  }
  return params;
}
function normalizeListItems(config) {
  const items = config.default ?? [];
  return items.filter((item) => item && typeof item.type === "string" && config.itemTypes[item.type]).map((item) => {
    const row = {
      type: item.type,
      params: { ...defaultListItemParams(config.itemTypes[item.type].schema), ...item.params ?? {} }
    };
    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (title) row.title = title;
    return row;
  });
}
var TweakStore = new TweakStoreClass();

// src/curve-composer-core.ts
var CURVE_CYCLE = ["linear", "easeIn", "easeOut", "easeInOut", "spring"];
var easingPresets = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1]
};
var DRAG_THRESHOLD = 3;
var EDGE_HIT = 6;
var CURVE_MIN_WEIGHT_FRAC = 0.06;
var lerp = (a, b, t) => a + (b - a) * t;
var clamp014 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
var clampBipolar = (v) => v < -1 ? -1 : v > 1 ? 1 : v;
var SKEW_MAX = 0.45;
var BACK_MAX = 0.8;
var easingExtremes = {
  linear: [0, 0, 1, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.87, 0, 0.13, 1]
};
var lerp4 = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
  lerp(a[3], b[3], t)
];
function deriveEase(type, curvature, steepness = 0, overshoot = 0, anticipate = 0) {
  const key = type === "spring" ? "linear" : type;
  const base = easingPresets[key];
  const s = clampBipolar(steepness);
  const pts = s >= 0 ? lerp4(base, easingExtremes[key], s) : lerp4(easingPresets.linear, base, s + 1);
  let [x1, y1, x2, y2] = pts;
  const shift = clampBipolar(curvature) * SKEW_MAX;
  x1 = clamp014(x1 + shift);
  x2 = clamp014(x2 + shift);
  y2 += clamp014(overshoot) * BACK_MAX;
  y1 -= clamp014(anticipate) * BACK_MAX;
  return [x1, y1, x2, y2];
}
function bezierAxis(p1, p2, s) {
  const u = 1 - s;
  return 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s;
}
function bezierAxisDeriv(p1, p2, s) {
  const u = 1 - s;
  return 3 * u * u * p1 + 6 * u * s * (p2 - p1) + 3 * s * s * (1 - p2);
}
function bezierY(ease, x) {
  const tx = clamp014(x);
  let s = tx;
  for (let i = 0; i < 6; i++) {
    const xs = bezierAxis(ease[0], ease[2], s) - tx;
    if (Math.abs(xs) < 1e-5) break;
    const d = bezierAxisDeriv(ease[0], ease[2], s);
    if (Math.abs(d) < 1e-6) break;
    s = clamp014(s - xs / d);
  }
  return bezierAxis(ease[1], ease[3], s);
}
var SPRING_SAMPLES = 72;
function sampleSpringTargets(sample, steps) {
  const targets = [];
  let target = sample(0);
  if (!Number.isFinite(target)) target = 0;
  targets.push(target);
  for (let i = 1; i <= steps; i++) {
    const nextTarget = sample(i / steps);
    if (Number.isFinite(nextTarget)) target = nextTarget;
    targets.push(target);
  }
  return targets;
}
function integrateSpringTrace(targets, stiffness, damping, mass, initial, collect = true) {
  const points = collect ? [initial.position] : [];
  const steps = Math.max(1, targets.length - 1);
  const dt = 1 / steps;
  let { position, velocity } = initial;
  for (let i = 1; i <= steps; i++) {
    const target = targets[i] ?? targets[targets.length - 1] ?? 0;
    const acceleration = (-stiffness * (position - target) - damping * velocity) / mass;
    velocity += acceleration * dt;
    position += velocity * dt;
    if (collect) points.push(position);
  }
  return { points, state: { position, velocity } };
}
function springPoints(curvature, steepness = 0) {
  const visualDuration = 1;
  const bounce = clamp014((clampBipolar(curvature) + 1) / 2) * 0.6;
  const mass = 1;
  let stiffness = 2 * Math.PI / visualDuration;
  stiffness = stiffness * stiffness;
  stiffness *= Math.max(0.2, 1 + clampBipolar(steepness) * 0.9);
  const dampingRatio = 1 - bounce;
  const damping = 2 * dampingRatio * Math.sqrt(stiffness * mass);
  return integrateSpringTrace(new Array(SPRING_SAMPLES + 1).fill(1), stiffness, damping, mass, {
    position: 0,
    velocity: 0
  }).points;
}
function interp(points, t) {
  const x = clamp014(t) * (points.length - 1);
  const i = Math.floor(x);
  if (i >= points.length - 1) return points[points.length - 1];
  return lerp(points[i], points[i + 1], x - i);
}
var SPRINGIFY_DEFAULTS = { stiffness: 100, damping: 10, mass: 1 };
var SPRINGIFY_SAMPLES = 1200;
function finiteInRange(value, fallback, min, max) {
  return value !== void 0 && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function periodicSpringState(targets, stiffness, damping, mass) {
  const advance = (initial) => integrateSpringTrace(targets, stiffness, damping, mass, initial, false).state;
  const offset = advance({ position: 0, velocity: 0 });
  const fromPosition = advance({ position: 1, velocity: 0 });
  const fromVelocity = advance({ position: 0, velocity: 1 });
  const a00 = fromPosition.position - offset.position;
  const a10 = fromPosition.velocity - offset.velocity;
  const a01 = fromVelocity.position - offset.position;
  const a11 = fromVelocity.velocity - offset.velocity;
  const m00 = 1 - a00;
  const m01 = -a01;
  const m10 = -a10;
  const m11 = 1 - a11;
  const determinant = m00 * m11 - m01 * m10;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-9) return null;
  return {
    position: (offset.position * m11 - m01 * offset.velocity) / determinant,
    velocity: (m00 * offset.velocity - offset.position * m10) / determinant
  };
}
function normalizeFollowerTrace(points) {
  let min = points[0] ?? 0;
  let max = min;
  for (const value of points) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (min >= 0 && max <= 1) return points;
  const range = max - min;
  if (range <= Number.EPSILON) return points.map(() => 0);
  return points.map((value) => (value - min) / range);
}
function springify(sample, options = {}) {
  const stiffness = finiteInRange(options.stiffness, SPRINGIFY_DEFAULTS.stiffness, 1, 1e3);
  const damping = finiteInRange(options.damping, SPRINGIFY_DEFAULTS.damping, 0, 100);
  const mass = finiteInRange(options.mass, SPRINGIFY_DEFAULTS.mass, 0.1, 10);
  const targets = sampleSpringTargets(sample, SPRINGIFY_SAMPLES);
  const atRest = { position: targets[0], velocity: 0 };
  const initial = options.loop ? periodicSpringState(targets, stiffness, damping, mass) ?? atRest : atRest;
  const raw = integrateSpringTrace(
    targets,
    stiffness,
    damping,
    mass,
    initial
  ).points;
  const points = options.normalize ? normalizeFollowerTrace(raw) : raw;
  return (t) => interp(points, t);
}
function buildSampler(curve) {
  let base;
  if (curve.type === "spring") {
    const pts = springPoints(curve.curvature, curve.steepness);
    base = (t) => interp(pts, t);
  } else {
    const ease = deriveEase(curve.type, curve.curvature, curve.steepness, curve.overshoot, curve.anticipate);
    base = (t) => bezierY(ease, t);
  }
  const { flipX, flipY } = curve;
  if (!flipX && !flipY) return base;
  return (t) => {
    const v = base(flipX ? 1 - t : t);
    return flipY ? 1 - v : v;
  };
}
function totalWeight(segments) {
  let t = 0;
  for (const s of segments) t += Math.max(0, s.weight);
  return t || 1;
}
function timelineSlots(segments, gap = 0) {
  const n = segments.length;
  const g = n > 1 ? clamp014(gap) : 0;
  const total = totalWeight(segments);
  const content = 1 - g;
  const gapW = n > 1 ? g / (n - 1) : 0;
  const slots = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const sw = Math.max(0, segments[i].weight) / total * content;
    slots.push({ kind: "segment", index: i, a: acc, b: acc + sw });
    acc += sw;
    if (i < n - 1) {
      slots.push({ kind: "gap", index: i, a: acc, b: acc + gapW });
      acc += gapW;
    }
  }
  return slots;
}
function boundaries(segments, gap = 0) {
  if (gap > 0 && segments.length > 1) return [];
  const total = totalWeight(segments);
  const out = [];
  let acc = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    acc += segments[i].weight;
    out.push(acc / total);
  }
  return out;
}
function segmentSpan(segments, index, gap = 0) {
  if (gap > 0) {
    const slot = timelineSlots(segments, gap).find((s) => s.kind === "segment" && s.index === index);
    if (slot) return [slot.a, slot.b];
  }
  const total = totalWeight(segments);
  let acc = 0;
  for (let i = 0; i < index; i++) acc += segments[i].weight;
  return [acc / total, (acc + segments[index].weight) / total];
}
function segmentIndexAt(xNorm, segments, gap = 0) {
  if (gap > 0) {
    const x2 = clamp014(xNorm);
    const slots = timelineSlots(segments, gap);
    for (const s of slots) if (x2 < s.b) return s.index;
    return segments.length - 1;
  }
  const total = totalWeight(segments);
  const x = clamp014(xNorm) * total;
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    acc += segments[i].weight;
    if (x <= acc) return i;
  }
  return segments.length - 1;
}
function boundaryAt(xNorm, segments, edgeHitNorm, gap = 0) {
  if (segments.length < 2) return null;
  const bs = boundaries(segments, gap);
  let best = null;
  let bestDist = edgeHitNorm;
  for (let i = 0; i < bs.length; i++) {
    const d = Math.abs(xNorm - bs[i]);
    if (d <= bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
function smootherstep(t) {
  const x = clamp014(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function cloneSegments(comp, segments) {
  return { ...comp, segments };
}
function splitSegment(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next.splice(index + 1, 0, { ...src });
  return cloneSegments(comp, next.map((s) => ({ ...s, weight: 1 })));
}
function removeSegment(comp, index) {
  if (comp.segments.length <= 1) return comp;
  return cloneSegments(comp, comp.segments.filter((_, i) => i !== index));
}
function cycleSegmentType(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const type = CURVE_CYCLE[(CURVE_CYCLE.indexOf(src.type) + 1) % CURVE_CYCLE.length];
  const next = comp.segments.slice();
  next[index] = { ...src, type, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 };
  return cloneSegments(comp, next);
}
function flipCurve(c) {
  const type = c.type === "easeIn" ? "easeOut" : c.type === "easeOut" ? "easeIn" : c.type;
  return { ...c, type, curvature: -c.curvature, overshoot: c.anticipate ?? 0, anticipate: c.overshoot ?? 0 };
}
function flipSegment(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = flipCurve(src);
  return cloneSegments(comp, next);
}
function flipDriver(comp) {
  if (!comp.driver) return comp;
  return { ...comp, driver: flipCurve(comp.driver) };
}
function flipSegmentX(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, flipX: !src.flipX };
  return cloneSegments(comp, next);
}
function flipSegmentY(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, flipY: !src.flipY };
  return cloneSegments(comp, next);
}
function flipDriverX(comp) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, flipX: !comp.driver.flipX } };
}
function flipDriverY(comp) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, flipY: !comp.driver.flipY } };
}
function setSegmentCurvature(comp, index, curvature) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, curvature: clampBipolar(curvature) };
  return cloneSegments(comp, next);
}
function setSegmentSteepness(comp, index, steepness) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, steepness: clampBipolar(steepness) };
  return cloneSegments(comp, next);
}
function setSegmentOvershoot(comp, index, overshoot) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, overshoot: clamp014(overshoot) };
  return cloneSegments(comp, next);
}
function setSegmentAnticipate(comp, index, anticipate) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, anticipate: clamp014(anticipate) };
  return cloneSegments(comp, next);
}
function redistributeWeight(comp, boundaryIndex, deltaFrac) {
  const segs = comp.segments;
  const i = boundaryIndex;
  if (i < 0 || i >= segs.length - 1) return comp;
  const total = totalWeight(segs);
  const span = segs[i].weight + segs[i + 1].weight;
  const minW = CURVE_MIN_WEIGHT_FRAC * total;
  let wi = segs[i].weight + deltaFrac * total;
  wi = Math.max(minW, Math.min(span - minW, wi));
  const next = segs.slice();
  next[i] = { ...segs[i], weight: wi };
  next[i + 1] = { ...segs[i + 1], weight: span - wi };
  return cloneSegments(comp, next);
}
function addDriver(comp) {
  if (comp.driver) return comp;
  return { ...comp, driver: { type: "easeInOut", curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 } };
}
function removeDriver(comp) {
  return { ...comp, driver: null };
}
function cycleDriverType(comp) {
  if (!comp.driver) return comp;
  const type = CURVE_CYCLE[(CURVE_CYCLE.indexOf(comp.driver.type) + 1) % CURVE_CYCLE.length];
  return { ...comp, driver: { ...comp.driver, type, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 } };
}
function setDriverCurvature(comp, curvature) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, curvature: clampBipolar(curvature) } };
}
function setDriverSteepness(comp, steepness) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, steepness: clampBipolar(steepness) } };
}
function setDriverOvershoot(comp, overshoot) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, overshoot: clamp014(overshoot) } };
}
function setDriverAnticipate(comp, anticipate) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, anticipate: clamp014(anticipate) } };
}
var DRAG_ENERGY_GAIN = 0.6;
var DRAG_STEEP_GAIN = 0.6;
var COMPOSER_HEADER_H = 16;
function headerHit(xN, py, segments, layout) {
  if (py >= 0 && py < COMPOSER_HEADER_H) return segmentIndexAt(xN, segments, layout.gap ?? 0);
  if (layout.driverY != null && py >= layout.driverY && py < layout.driverY + COMPOSER_HEADER_H) return "driver";
  return null;
}
function toLocalCoords(clientX, clientY, rect, totalH) {
  const xN = clamp014((clientX - rect.left) / (rect.width || 1));
  const py = (clientY - rect.top) / (rect.height || 1) * totalH;
  return { xN, py };
}
function pointerTarget(xN, py, segments, layout, edgeHitNorm) {
  const gap = layout.gap ?? 0;
  if (layout.driverY != null && py >= layout.driverY) return { kind: "driver" };
  const b = boundaryAt(xN, segments, edgeHitNorm, gap);
  if (b != null) return { kind: "boundary", index: b };
  return { kind: "segment", index: segmentIndexAt(xN, segments, gap) };
}
function applySegmentBodyDrag(comp, index, baseCurvature, baseSteepness, dxFrac, dyFrac) {
  const next = setSegmentCurvature(comp, index, baseCurvature + dxFrac / DRAG_ENERGY_GAIN);
  return setSegmentSteepness(next, index, baseSteepness - dyFrac / DRAG_STEEP_GAIN);
}
function applyDriverBodyDrag(comp, baseCurvature, baseSteepness, dxFrac, dyFrac) {
  const next = setDriverCurvature(comp, baseCurvature + dxFrac / DRAG_ENERGY_GAIN);
  return setDriverSteepness(next, baseSteepness - dyFrac / DRAG_STEEP_GAIN);
}
function buildSamplers(comp) {
  return {
    segments: comp.segments.map(buildSampler),
    driver: comp.driver ? buildSampler(comp.driver) : null
  };
}
function directionPhase(u, dir) {
  const x = clamp014(u);
  if (dir === "reverse") return 1 - x;
  if (dir === "mirror") return 1 - Math.abs(1 - 2 * x);
  return x;
}
function readComposition(comp, u, s) {
  const inputPhase = directionPhase(u, comp.direction);
  const warpedPhase = s.driver ? clamp014(s.driver(inputPhase)) : inputPhase;
  const gap = comp.gap ?? 0;
  if (gap > 0 && comp.segments.length > 1) {
    const slots = timelineSlots(comp.segments, gap);
    const slot = slots.find((sl) => warpedPhase < sl.b) ?? slots[slots.length - 1];
    const localT2 = slot.b > slot.a ? (warpedPhase - slot.a) / (slot.b - slot.a) : 0;
    if (slot.kind === "segment") {
      const value3 = s.segments[slot.index] ? s.segments[slot.index](localT2) : 0;
      return { inputPhase, warpedPhase, value: value3, segIndex: slot.index, localT: localT2 };
    }
    const n = comp.segments.length;
    const endVal = s.segments[slot.index] ? s.segments[slot.index](1) : 0;
    const startVal = s.segments[(slot.index + 1) % n] ? s.segments[(slot.index + 1) % n](0) : 0;
    const value2 = lerp(endVal, startVal, smootherstep(localT2));
    return { inputPhase, warpedPhase, value: value2, segIndex: slot.index, localT: localT2 };
  }
  const segIndex = segmentIndexAt(warpedPhase, comp.segments);
  const [a, b] = segmentSpan(comp.segments, segIndex);
  const localT = b > a ? (warpedPhase - a) / (b - a) : 0;
  const value = s.segments[segIndex] ? s.segments[segIndex](localT) : 0;
  return { inputPhase, warpedPhase, value, segIndex, localT };
}
var COMPOSER_GAP = 10;
var COMPOSER_PAD_FRAC = 0.18;
var COMPOSER_DRIVER_FRAC = 0.55;
function composerLayout(width, height, hasDriver) {
  const driverH = hasDriver ? Math.round(height * COMPOSER_DRIVER_FRAC) : 0;
  const totalH = height + (hasDriver ? COMPOSER_GAP + driverH : 0);
  return {
    W: width,
    totalH,
    mainRect: { x: 0, y: 0, w: width, h: height },
    driverRect: hasDriver ? { x: 0, y: height + COMPOSER_GAP, w: width, h: driverH } : null
  };
}
function mapY(rect, ny) {
  const pad = rect.h * COMPOSER_PAD_FRAC;
  const top = rect.y + pad;
  const bot = rect.y + rect.h - pad;
  return bot - ny * (bot - top);
}
function spanX(span, nx, W) {
  return (span[0] + nx * (span[1] - span[0])) * W;
}
function curvePath(curve, rect, span, W, samples = 40) {
  const x = (nx) => spanX(span, nx, W);
  const y = (ny) => mapY(rect, ny);
  if (curve.type === "spring") {
    const sampler = buildSampler(curve);
    let d = `M ${x(0)} ${y(sampler(0))}`;
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      d += ` L ${x(t)} ${y(sampler(t))}`;
    }
    return d;
  }
  const e = deriveEase(curve.type, curve.curvature, curve.steepness, curve.overshoot, curve.anticipate);
  let pts = [
    [0, 0],
    [e[0], e[1]],
    [e[2], e[3]],
    [1, 1]
  ];
  if (curve.flipX) pts = pts.map(([px, py]) => [1 - px, py]).reverse();
  if (curve.flipY) pts = pts.map(([px, py]) => [px, 1 - py]);
  return `M ${x(pts[0][0])} ${y(pts[0][1])} C ${x(pts[1][0])} ${y(pts[1][1])}, ${x(pts[2][0])} ${y(pts[2][1])}, ${x(pts[3][0])} ${y(pts[3][1])}`;
}
function connectorPath(slot, samplers, segCount, rect, W, samples = 24) {
  const endVal = samplers.segments[slot.index] ? samplers.segments[slot.index](1) : 0;
  const next = (slot.index + 1) % segCount;
  const startVal = samplers.segments[next] ? samplers.segments[next](0) : 0;
  let d = `M ${slot.a * W} ${mapY(rect, endVal)}`;
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const v = lerp(endVal, startVal, smootherstep(t));
    d += ` L ${(slot.a + (slot.b - slot.a) * t) * W} ${mapY(rect, v)}`;
  }
  return d;
}
function diagonalLine(rect, span, W) {
  return { x1: span[0] * W, y1: mapY(rect, 0), x2: span[1] * W, y2: mapY(rect, 1) };
}
function playheadGeometry(read, layout) {
  const seriesX = read.warpedPhase * layout.W;
  return {
    seriesX,
    dotX: seriesX,
    dotY: mapY(layout.mainRect, read.value),
    driverX: read.inputPhase * layout.W
  };
}
var DEFAULT_TRIGGER_STEPS = 5;
function triggerLevels(steps) {
  const n = Math.max(2, Math.floor(steps));
  const out = [];
  for (let k = 0; k < n; k++) out.push(k / (n - 1));
  return out;
}
var TRIGGER_FLYBACK = 0.5;
function triggersCrossed(prevValue, curValue, steps) {
  const n = Math.max(2, Math.floor(steps));
  const seg = 1 / (n - 1);
  const p = clamp014(prevValue);
  const c = clamp014(curValue);
  const delta = c - p;
  const fired = [];
  if (Math.abs(delta) > TRIGGER_FLYBACK) {
    fired.push(delta < 0 ? n - 1 : 0);
  } else if (delta > 0) {
    for (let k = 1; k <= n - 2; k++) {
      const level = k * seg;
      if (p < level && level <= c) fired.push(k);
    }
  } else if (delta < 0) {
    for (let k = n - 2; k >= 1; k--) {
      const level = k * seg;
      if (c <= level && level < p) fired.push(k);
    }
  }
  return fired;
}
function defaultComposition() {
  return {
    segments: [
      { type: "easeOut", weight: 1, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 },
      { type: "easeInOut", weight: 1, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 }
    ],
    driver: null,
    direction: "forward"
  };
}

// src/modulation-core.ts
var MOD_SLOTS = 16;
var MOD_COLORS = [
  "#ff5f45",
  // 0  coral
  "#ff8a2b",
  // 1  orange
  "#ffb61e",
  // 2  amber
  "#f4d942",
  // 3  yellow
  "#b8e03c",
  // 4  lime
  "#6fd435",
  // 5  green
  "#3bcf6d",
  // 6  emerald
  "#2ed3ab",
  // 7  teal
  "#33c6e8",
  // 8  cyan
  "#3d9bff",
  // 9  azure
  "#5f7bff",
  // 10 blue
  "#8a6bff",
  // 11 violet
  "#b45cff",
  // 12 purple
  "#e04ef0",
  // 13 magenta
  "#ff4fb0",
  // 14 pink
  "#ff4f6e"
  // 15 rose
];
var modColor = (index) => MOD_COLORS[(index % MOD_SLOTS + MOD_SLOTS) % MOD_SLOTS];
var MOD_PAGE_DIALS = 8;
var isModDial = (c) => !c.chip && (c.scope || c.type === "toggle" && c.big || c.type === "select" || c.type === "slider" || c.type === "xy" || c.type === "range" || c.type === "number" && c.min != null && c.max != null);
var slotOf = (c) => ({
  path: c.path,
  ...c.drawsPreview ? { preview: true } : {},
  ...c.envStage ? { stage: c.envStage } : {},
  ...c.scope ? { scope: true } : {},
  ...c.cycle ? { cycle: true } : {}
});
function modPageLayout(controls, params = {}) {
  const dials = [];
  const toggles = [];
  const values = [];
  for (const c of controls) {
    if (c.when && !c.when(params)) continue;
    if (isModDial(c)) {
      if (dials.length < MOD_PAGE_DIALS) dials.push(slotOf(c));
      continue;
    }
    const col = Math.max(0, dials.length - 1);
    const row = c.type === "toggle" && !toggles[col] ? toggles : values;
    if (!row[col]) row[col] = slotOf(c);
  }
  const pad = (row) => Array.from({ length: row.length }, (_, i) => row[i] ?? null);
  return { dials, toggles: pad(toggles), values: pad(values) };
}
var visibleModControls = (def, params) => def.controls.filter((c) => !c.when || c.when(params));
var registry = /* @__PURE__ */ new Map();
function registerModType(def) {
  registry.set(def.type, def);
}
var getModType = (type) => registry.get(type);
var listModTypes = () => [...registry.values()];
var modPageWidth = () => Math.min(
  MOD_PAGE_DIALS,
  1 + listModTypes().reduce(
    (w, def) => Math.max(w, modPageLayout(def.controls, def.defaults).dials.length),
    0
  )
);
var MOD_SETTINGS_PANEL = "mod-settings";
var modKey = (panelId, path) => `${panelId}\0${path}`;
var clamp5 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clamp015 = (v) => clamp5(Number(v) || 0, 0, 1);
var clampSigned = (v) => clamp5(Number(v) || 0, -1, 1);
function applyModulation(base, signal, amount, min, max) {
  const offset = clamp5(signal, -1, 1) * clamp015(amount) * (max - min) / 2;
  return clamp5(base + offset, min, max);
}
var MOD_RING_RADIUS = 6;
var MOD_RING_CIRCUMFERENCE = 2 * Math.PI * MOD_RING_RADIUS;
var RING_SWEEP_START = 135 / 360;
var RING_SWEEP_LEN = 270 / 360;
function modRingArc(from01, to01) {
  const a = RING_SWEEP_START + clamp015(from01) * RING_SWEEP_LEN;
  const b = RING_SWEEP_START + clamp015(to01) * RING_SWEEP_LEN;
  return {
    length: Math.abs(b - a) * MOD_RING_CIRCUMFERENCE,
    offset: -Math.min(a, b) * MOD_RING_CIRCUMFERENCE
  };
}
var LFO_SYNC_DIVISIONS = [
  { label: "4", beats: 16 },
  { label: "2", beats: 8 },
  { label: "1", beats: 4 },
  { label: "1/2", beats: 2 },
  { label: "1/4", beats: 1 },
  { label: "1/8", beats: 0.5 },
  { label: "1/16", beats: 0.25 },
  { label: "1/32", beats: 0.125 }
];
function lfoSyncedHz(division, bpm) {
  const i = clamp5(Math.round(Number(division) || 0), 0, LFO_SYNC_DIVISIONS.length - 1);
  return (Number(bpm) || 120) / 60 / LFO_SYNC_DIVISIONS[i].beats;
}
var previewNoise = (i, salt = 0) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
function previewSlew(values, smooth) {
  const s = clamp015(smooth);
  if (s <= 0 || values.length < 2) return values;
  const k = 1 - Math.exp(-(1 / values.length) / (s * s * 0.4 + 1e-6));
  let out = values[0];
  return values.map((v, i) => i === 0 ? out : out = out + (v - out) * k);
}
var LFO_DEF = {
  type: "lfo",
  label: "LFO",
  defaults: { rate: 1, division: 4, phase: 0, width: 0.5, jitter: 0, smooth: 0, sync: false },
  controls: [
    { type: "slider", path: "rate", label: "Rate", min: 0.02, max: 20, step: 0.01, unit: "Hz", scope: true },
    { type: "toggle", path: "sync", label: "Sync" },
    { type: "slider", path: "phase", label: "Phase", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "width", label: "Width", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "jitter", label: "Jitter", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "smooth", label: "Smooth", min: 0, max: 1, step: 0.01 }
  ],
  createState: () => ({ phase: 0, drift: 0, driftTarget: 0, out: null }),
  tick(state2, params, dt, bpm) {
    const s = state2;
    const hz = params.sync ? lfoSyncedHz(Number(params.division) || 0, bpm) : Math.max(0, Number(params.rate) || 0);
    const before = s.phase;
    s.phase = (s.phase + dt * hz) % 1;
    if (s.phase < before) s.driftTarget = (Math.random() * 2 - 1) * clamp015(params.jitter);
    if (!clamp015(params.jitter)) {
      s.drift = 0;
      s.driftTarget = 0;
    } else s.drift += (s.driftTarget - s.drift) * Math.min(1, dt * hz * 4);
    const w = clamp5(Number(params.width) || 0, 0.01, 0.99);
    const ph = (s.phase + clamp015(params.phase)) % 1;
    const tri = ph < w ? ph / w : 1 - (ph - w) / (1 - w);
    let v = clamp5(tri * 2 - 1 + s.drift, -1, 1);
    const smooth = clamp015(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
  /**
   * Two cycles of the wave the params describe: the width skew, the jitter
   * as a slow deterministic wobble, and the slew rounding it all. The
   * on-screen scope draws the live engine signal instead; this is the
   * scope's caption (the wave's name) and the small screens' drawing.
   */
  preview(params, count) {
    const n = Math.max(2, count);
    const w = clamp5(Number(params.width) || 0, 0.01, 0.99);
    const jitter = clamp015(params.jitter);
    const wobble = Math.max(2, Math.round(n / 8));
    const raw = Array.from({ length: n }, (_, i) => {
      const ph = (i / (n - 1) * 2 + clamp015(params.phase)) % 1;
      const tri = ph < w ? ph / w : 1 - (ph - w) / (1 - w);
      const drift = previewNoise(Math.floor(i / wobble)) * jitter * 0.5;
      return clamp5(tri * 2 - 1 + drift, -1, 1);
    });
    const shape = clamp015(params.smooth) > 0.55 ? "Sine" : w <= 0.25 ? "Saw" : w >= 0.75 ? "Ramp" : "Tri";
    return {
      points: previewSlew(raw, clamp015(params.smooth)).map((v) => (v + 1) / 2),
      label: jitter > 0.4 ? `${shape} \xB7 Jitter` : shape
    };
  }
};
registerModType(LFO_DEF);
var SH_DEF = {
  type: "sh",
  label: "S&H",
  defaults: { rate: 4, depth: 1, offset: 0, jitter: 0, smooth: 0 },
  controls: [
    { type: "slider", path: "rate", label: "Rate", min: 0.1, max: 30, step: 0.01, unit: "Hz", scope: true },
    { type: "slider", path: "depth", label: "Depth", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "offset", label: "Offset", min: -1, max: 1, step: 0.01 },
    { type: "slider", path: "jitter", label: "Jitter", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "smooth", label: "Smooth", min: 0, max: 1, step: 0.01 }
  ],
  createState: () => ({ wait: 0, held: 0, out: null }),
  tick(state2, params, dt) {
    const s = state2;
    s.wait -= dt;
    if (s.out === null || s.wait <= 0) {
      s.held = Math.random() * 2 - 1;
      const hz = Math.max(0.01, Number(params.rate) || 0);
      const len = 1 / hz * (1 + (Math.random() * 2 - 1) * clamp015(params.jitter) * 0.9);
      s.wait = Math.max(5e-3, len);
    }
    const offset = clamp5(Number(params.offset) || 0, -1, 1);
    let v = clamp5(s.held * clamp015(params.depth) + offset, -1, 1);
    const smooth = clamp015(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
  /**
   * A run of held values, deterministic so the picture holds still while
   * you shape it: depth scales the throw, offset lifts the whole run,
   * jitter stretches and shrinks the holds (the drunken clock), and the
   * slew turns the steps into a drift.
   */
  preview(params, count) {
    const n = Math.max(2, count);
    const depth = clamp015(params.depth);
    const offset = clamp5(Number(params.offset) || 0, -1, 1);
    const jitter = clamp015(params.jitter);
    const steps = 8;
    const lens = Array.from({ length: steps }, (_, i) => 1 + previewNoise(i, 1) * jitter * 0.9);
    const total = lens.reduce((a, b) => a + b, 0);
    const edges = [];
    let acc = 0;
    for (const len of lens) edges.push(acc += len / total);
    const raw = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const step = edges.findIndex((e) => t <= e);
      return clamp5(previewNoise(step < 0 ? steps - 1 : step) * depth + offset, -1, 1);
    });
    return {
      points: previewSlew(raw, clamp015(params.smooth)).map((v) => (v + 1) / 2),
      label: clamp015(params.smooth) > 0.55 ? "Drift" : "Steps"
    };
  }
};
registerModType(SH_DEF);
var secs = (ms) => Math.max(0, Number(ms) || 0) / 1e3;
var ADSR_STAGE_MAX = { attack: 2e3, decay: 2e3, release: 4e3 };
var ENV_BEND_STAGES = ["attack", "decay", "release"];
var envCurveParam = (stage) => `${stage}Curve`;
var adsrShape = (p, curve) => {
  const c = clamp5(Number(curve) || 0, -1, 1);
  return 1 - Math.pow(1 - p, Math.pow(4, c));
};
function envelopePoints(params, count) {
  const n = Math.max(2, count);
  const sustain = clamp015(params.sustain);
  const share = (key) => 0.04 + 0.24 * Math.min(1, secs(params[key]) * 1e3 / ADSR_STAGE_MAX[key]);
  const wA = share("attack");
  const wD = share("decay");
  const wR = share("release");
  const at = (t) => {
    if (t < wA) return adsrShape(t / wA, params.attackCurve);
    if (t < wA + wD) return 1 - (1 - sustain) * adsrShape((t - wA) / wD, params.decayCurve);
    if (t < 1 - wR) return sustain;
    return sustain * (1 - adsrShape((t - (1 - wR)) / wR, params.releaseCurve));
  };
  return Array.from({ length: n }, (_, i) => at(i / (n - 1)));
}
function envelopeJoints(params) {
  const sustain = clamp015(params.sustain);
  const share = (key) => 0.04 + 0.24 * Math.min(1, secs(params[key]) * 1e3 / ADSR_STAGE_MAX[key]);
  const wA = share("attack");
  return [
    { stage: "attack", x: wA, y: 1 },
    { stage: "decay", x: wA + share("decay"), y: sustain },
    { stage: "release", x: 1 - share("release"), y: sustain }
  ];
}
function adsrStageLength(stage, params) {
  if (stage === "attack") return secs(params.attack);
  if (stage === "decay") return secs(params.decay);
  if (stage === "release") return secs(params.release);
  return Infinity;
}
var ADSR_DEF = {
  type: "adsr",
  label: "ADSR",
  defaults: {
    attack: 10,
    decay: 300,
    sustain: 0.6,
    release: 600,
    loop: false,
    // The attack keeps its analog leap; decay and release start straight,
    // as the design draws them — every ramp bendable from its pad.
    attackCurve: 0.5,
    decayCurve: 0,
    releaseCurve: 0
  },
  controls: [
    { type: "slider", path: "attack", label: "Attack", min: 0, max: ADSR_STAGE_MAX.attack, step: 1, unit: "ms", envStage: "attack" },
    { type: "slider", path: "decay", label: "Decay", min: 0, max: ADSR_STAGE_MAX.decay, step: 1, unit: "ms", envStage: "decay" },
    { type: "slider", path: "sustain", label: "Sustain", min: 0, max: 1, step: 0.01, envStage: "sustain" },
    { type: "slider", path: "release", label: "Release", min: 0, max: ADSR_STAGE_MAX.release, step: 1, unit: "ms", envStage: "release" },
    /* A big slot of its own, beside the envelope — the pad row under the
       ramps belongs to the hold-to-bend gesture. */
    { type: "toggle", path: "loop", label: "Loop", big: true }
  ],
  createState: () => ({ stage: "idle", t: 0, from: 0, env: 0, gate: false }),
  gate(state2, on) {
    const s = state2;
    s.gate = on;
    if (on) {
      s.stage = "attack";
      s.t = 0;
      s.from = s.env;
    } else if (s.stage !== "idle") {
      s.stage = "release";
      s.t = 0;
      s.from = s.env;
    }
  },
  tick(state2, params, dt) {
    const s = state2;
    const loop = !!params.loop;
    const sustain = clamp015(params.sustain);
    if (s.stage === "idle") {
      if (!loop) return s.env = 0;
      s.stage = "attack";
      s.t = 0;
      s.from = 0;
    }
    s.t += dt;
    for (let guard = 0; guard < 4; guard++) {
      const len2 = adsrStageLength(s.stage, params);
      if (s.t < len2) break;
      s.t -= len2;
      if (s.stage === "attack") {
        s.stage = "decay";
        s.from = 1;
      } else if (s.stage === "decay") {
        s.stage = s.gate ? "sustain" : "release";
        s.from = sustain;
      } else {
        s.stage = loop ? "attack" : "idle";
        s.from = 0;
      }
    }
    const len = adsrStageLength(s.stage, params);
    const p = len > 0 && Number.isFinite(len) ? Math.min(1, s.t / len) : 1;
    if (s.stage === "attack") s.env = s.from + (1 - s.from) * adsrShape(p, params.attackCurve);
    else if (s.stage === "decay") s.env = s.from + (sustain - s.from) * adsrShape(p, params.decayCurve);
    else if (s.stage === "sustain") s.env = sustain;
    else if (s.stage === "release") s.env = s.from * (1 - adsrShape(p, params.releaseCurve));
    else s.env = 0;
    return clamp015(s.env);
  }
};
registerModType(ADSR_DEF);
var CURVE_MAX_CLIPS = 8;
var CURVE_MIN_DURATION = 0.05;
var CURVE_MAX_DURATION = 60;
var CURVE_PULSE_DECAY = 0.04;
var CURVE_PREVIEW_BAND = { lo: -0.25, hi: 1.25 };
var DIRECTIONS = ["forward", "mirror", "reverse"];
var CURVE_LABELS = {
  linear: "Linear",
  easeIn: "Ease In",
  easeOut: "Ease Out",
  easeInOut: "Ease InOut",
  spring: "Spring"
};
var SHAPE_PARAMS = ["curvature", "steepness", "anticipate", "overshoot"];
var newClip = () => ({
  type: "easeInOut",
  weight: 1,
  curvature: 0,
  steepness: 0,
  overshoot: 0,
  anticipate: 0
});
function readClips(params) {
  const raw = Array.isArray(params.clips) ? params.clips : [];
  const list = raw.filter((c) => c && typeof c === "object").map((c) => ({ ...newClip(), ...c }));
  return list.length ? list.slice(0, CURVE_MAX_CLIPS) : [newClip()];
}
var writeClips = (list) => list;
var selectedClip = (params, count) => clamp5(Math.round(Number(params.selected) || 0), 0, Math.max(0, count - 1));
function curveComposition(params) {
  const i = DIRECTIONS.indexOf(params.direction);
  return {
    segments: readClips(params),
    driver: null,
    direction: DIRECTIONS[i < 0 ? 0 : i],
    gap: clamp015(params.gap)
  };
}
function curveDuration(params, bpm) {
  const want = clamp5(Number(params.duration) || 0, CURVE_MIN_DURATION, CURVE_MAX_DURATION);
  if (!params.sync) return want;
  const beat = 60 / (Number(bpm) || 120);
  let best = LFO_SYNC_DIVISIONS[0].beats * beat;
  for (const div of LFO_SYNC_DIVISIONS) {
    const secs2 = div.beats * beat;
    if (Math.abs(secs2 - want) < Math.abs(best - want)) best = secs2;
  }
  return Math.max(CURVE_MIN_DURATION, best);
}
var CURVE_DEF = {
  type: "curve",
  label: "Curve",
  defaults: {
    duration: 2,
    sync: false,
    signal: "continuous",
    triggers: DEFAULT_TRIGGER_STEPS,
    direction: "forward",
    flip: false,
    gap: 0,
    segments: 1,
    selected: 0,
    curvature: 0,
    steepness: 0,
    anticipate: 0,
    overshoot: 0,
    clips: writeClips([newClip()])
  },
  controls: [
    /* The selected clip's shape: the knob leans its energy one way or the
       other, the volume knob makes the ease gentle or explosive — the same
       two-axis drag the composer answers to on screen. A knob tap cycles
       the clip through the curve vocabulary. */
    {
      type: "xy",
      path: "curve",
      label: "Curve",
      xParam: "curvature",
      yParam: "steepness",
      xAxis: { min: -1, max: 1, bipolar: true, label: "Energy" },
      yAxis: { min: -1, max: 1, bipolar: true, label: "Steep" },
      drawsPreview: true,
      cycle: (params) => {
        const comp = curveComposition(params);
        const i = selectedClip(params, comp.segments.length);
        return { clips: writeClips(cycleSegmentType(comp, i).segments) };
      }
    },
    { type: "slider", path: "duration", label: "Duration", min: CURVE_MIN_DURATION, max: CURVE_MAX_DURATION, step: 0.01, unit: "s" },
    { type: "toggle", path: "sync", label: "Sync" },
    {
      type: "select",
      path: "signal",
      label: "Signal",
      chip: true,
      options: [{ value: "continuous", label: "Cont" }, { value: "trigger", label: "Trig" }]
    },
    /* The direction reads as a picture — an arrow says which way the pass
       runs faster than a word does. */
    {
      type: "select",
      path: "direction",
      label: "Direction",
      options: [
        { value: "forward", label: "Forward", icon: "arrow-right" },
        { value: "mirror", label: "Mirror", icon: "arrow-left-right" },
        { value: "reverse", label: "Reverse", icon: "arrow-left" }
      ]
    },
    { type: "toggle", path: "flip", label: "Flip" },
    /* The trigger count only means anything in trigger mode, so the chip
       only appears there — the column stays clear the rest of the time. */
    {
      type: "slider",
      path: "triggers",
      label: "Triggers",
      chip: true,
      min: 2,
      max: 16,
      step: 1,
      when: (params) => params.signal === "trigger"
    },
    { type: "slider", path: "gap", label: "Gap", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "anticipate", label: "Anticipate", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "overshoot", label: "Overshoot", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "segments", label: "Segments", min: 1, max: CURVE_MAX_CLIPS, step: 1 }
  ],
  createState: () => ({ phase: 0, signature: "", samplers: null, prev: null, pulse: 0 }),
  tick(state2, params, dt, bpm) {
    const s = state2;
    const comp = curveComposition(params);
    const signature = JSON.stringify(comp.segments) + `|${comp.gap}`;
    if (signature !== s.signature || !s.samplers) {
      s.signature = signature;
      s.samplers = buildSamplers(comp);
    }
    s.phase = (s.phase + dt / curveDuration(params, bpm)) % 1;
    let v = clamp015(readComposition(comp, s.phase, s.samplers).value);
    if (params.flip) v = 1 - v;
    if (params.signal !== "trigger") {
      s.prev = v;
      return v * 2 - 1;
    }
    const fired = triggersCrossed(s.prev ?? v, v, Number(params.triggers) || DEFAULT_TRIGGER_STEPS);
    s.prev = v;
    if (fired.length) s.pulse = 1;
    else s.pulse *= Math.exp(-dt / CURVE_PULSE_DECAY);
    return s.pulse;
  },
  /**
   * Keep the projection and the series in step. A shape dial writes into the
   * selected clip; anything else — a new selection, a deleted clip, a cycled
   * curve — reads that clip's shape back out, so the dials always show the
   * clip the composer is highlighting.
   */
  normalize(current, patch2) {
    const next = { ...current, ...patch2 };
    const changed = (key) => key in patch2 && patch2[key] !== current[key];
    let list = "clips" in patch2 ? readClips(patch2) : readClips(current);
    if (!("clips" in patch2) && changed("segments")) {
      const want = clamp5(Math.round(Number(patch2.segments) || 1), 1, CURVE_MAX_CLIPS);
      while (list.length > want) list.pop();
      while (list.length < want) list.push(newClip());
      list = list.map((c) => ({ ...c, weight: 1 }));
    }
    const sel = selectedClip(next, list.length);
    if (SHAPE_PARAMS.some(changed)) {
      list[sel] = {
        ...list[sel],
        curvature: clampSigned(next.curvature),
        steepness: clampSigned(next.steepness),
        anticipate: clamp015(next.anticipate),
        overshoot: clamp015(next.overshoot)
      };
    } else {
      const clip = list[sel];
      next.curvature = clip.curvature;
      next.steepness = clip.steepness;
      next.anticipate = clip.anticipate ?? 0;
      next.overshoot = clip.overshoot ?? 0;
    }
    next.selected = sel;
    next.segments = list.length;
    next.clips = writeClips(list);
    return next;
  },
  buttons: {
    /* The arrows walk the clips (wrapping), Delete drops the selected one —
       the last clip stays, since a pass with nothing in it plays nothing. */
    left: (params) => {
      const n = readClips(params).length;
      return { selected: (selectedClip(params, n) + n - 1) % n };
    },
    right: (params) => {
      const n = readClips(params).length;
      return { selected: (selectedClip(params, n) + 1) % n };
    },
    delete: (params) => {
      const list = readClips(params);
      if (list.length <= 1) return;
      const sel = selectedClip(params, list.length);
      list.splice(sel, 1);
      return { clips: writeClips(list), selected: Math.min(sel, list.length - 1) };
    }
  },
  phase: (state2) => state2.phase,
  preview(params, count) {
    const list = readClips(params);
    const sel = selectedClip(params, list.length);
    const sampler = buildSampler(list[sel]);
    const span = CURVE_PREVIEW_BAND.hi - CURVE_PREVIEW_BAND.lo;
    const n = Math.max(2, count);
    return {
      points: Array.from({ length: n }, (_, i) => clamp015((sampler(i / (n - 1)) - CURVE_PREVIEW_BAND.lo) / span)),
      label: `${CURVE_LABELS[list[sel].type]} ${sel + 1}/${list.length}`
    };
  }
};
registerModType(CURVE_DEF);

// src/store/ModulationStore.ts
var MOD_TOUCH_GRACE_MS = 4e3;
var PERSIST_TARGET = resolvePersistTarget("modulation", "global", true);
var clamp6 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var freshParams = (def) => JSON.parse(JSON.stringify(def.defaults));
var ModulationStoreClass = class {
  constructor() {
    this.slots = Array(MOD_SLOTS).fill(null);
    this.assignments = /* @__PURE__ */ new Map();
    this.states = /* @__PURE__ */ new Map();
    this.signals = Array(MOD_SLOTS).fill(0);
    this.sources = /* @__PURE__ */ new Map();
    this.sourceValues = /* @__PURE__ */ new Map();
    this.metas = /* @__PURE__ */ new Map();
    this.bpm = 120;
    this.touched = null;
    this.settingsIndex = null;
    this.settingsUnsub = null;
    /** The control set the open page was built from — see `shapeOf`. */
    this.settingsShape = "";
    this.applyingSettings = false;
    this.structListeners = /* @__PURE__ */ new Set();
    this.frameListeners = /* @__PURE__ */ new Set();
    this.version = 0;
    this.rafId = null;
    this.lastTick = 0;
    this.loop = (now) => {
      this.tick(Math.max(0, (now - this.lastTick) / 1e3));
      this.lastTick = now;
      this.rafId = this.slots.some(Boolean) ? window.requestAnimationFrame(this.loop) : null;
    };
    const saved = loadPersisted(PERSIST_TARGET);
    if (saved) {
      for (const slot of saved.slots ?? []) {
        const i = Math.round(Number(slot?.index));
        if (i >= 0 && i < MOD_SLOTS && slot.type && slot.params) {
          this.slots[i] = { ...slot, index: i, params: { ...slot.params } };
        }
      }
      for (const a of saved.assignments ?? []) {
        if (a?.panelId && a.path && this.slots[a.slot]) {
          this.assignments.set(modKey(a.panelId, a.path), { ...a });
        }
      }
    }
    TweakStore.subscribeGlobal(() => this.metas.clear());
    this.ensureLoop();
  }
  /* ── slots ────────────────────────────────────────────────────────── */
  /** Create a modulation in a step's slot; an occupied slot is returned as-is. */
  createSlot(index, type = "lfo") {
    if (!Number.isInteger(index) || index < 0 || index >= MOD_SLOTS) return null;
    const existing = this.slots[index];
    if (existing) return existing;
    const def = getModType(type);
    if (!def) {
      console.warn(`[tweakers] modulator type "${type}" is not registered`);
      return null;
    }
    const slot = { index, type, params: freshParams(def) };
    this.slots[index] = slot;
    this.states.set(index, def.createState());
    this.changed();
    this.ensureLoop();
    return slot;
  }
  getSlot(index) {
    return this.slots[index] ?? null;
  }
  /** The occupied slots, index order — the track row's circles. */
  getSlots() {
    return this.slots.filter((s) => s !== null);
  }
  /**
   * Change a slot's settings. A modulator with its own structure folds the
   * patch in its own way (`normalize`) — the curve writes a shape dial into
   * the clip it belongs to — and the open settings page follows.
   */
  updateSlotParams(index, patch2) {
    const slot = this.slots[index];
    if (!slot) return;
    const def = getModType(slot.type);
    slot.params = def?.normalize ? def.normalize(slot.params, patch2) : { ...slot.params, ...patch2 };
    if (this.settingsIndex === index) this.refreshSettings();
    this.changed();
  }
  /** Switch a slot's modulator type — fresh defaults, fresh state. */
  setSlotType(index, type) {
    const slot = this.slots[index];
    const def = getModType(type);
    if (!slot || !def) return;
    slot.type = type;
    slot.params = freshParams(def);
    this.states.set(index, def.createState());
    this.changed();
  }
  /** Point a slot at an external source (null returns it to the engine). */
  setSlotSource(index, sourceId) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.source = sourceId;
    this.changed();
  }
  /** Remove a slot's modulation and every assignment wired to it. */
  removeSlot(index) {
    if (!this.slots[index]) return;
    if (this.settingsIndex === index) this.closeSettings();
    this.slots[index] = null;
    this.states.delete(index);
    this.signals[index] = 0;
    for (const [key, a] of this.assignments) {
      if (a.slot === index) this.assignments.delete(key);
    }
    this.changed();
  }
  /* ── assignments ──────────────────────────────────────────────────── */
  /**
   * Wire a control to a slot. Only bounded numeric controls (slider, number
   * with min/max) can be modulated; anything else is refused. A control not
   * yet registered is accepted on trust and resolves when its panel appears.
   */
  assign(panelId, path, slot, amount = 0.5) {
    if (!this.slots[slot]) return false;
    if (panelId === MOD_SETTINGS_PANEL) return false;
    if (TweakStore.getPanel(panelId) && !this.resolveMeta(panelId, path)) {
      console.warn(`[tweakers] "${path}" is not a bounded numeric control; it cannot take a modulation`);
      return false;
    }
    this.assignments.set(modKey(panelId, path), {
      panelId,
      path,
      slot,
      amount: clamp6(Number(amount) || 0, 0, 1)
    });
    this.changed();
    return true;
  }
  unassign(panelId, path) {
    if (this.assignments.delete(modKey(panelId, path))) this.changed();
  }
  getAssignment(panelId, path) {
    return this.assignments.get(modKey(panelId, path));
  }
  getAssignments() {
    return [...this.assignments.values()];
  }
  assignmentsForSlot(index) {
    return this.getAssignments().filter((a) => a.slot === index);
  }
  setAmount(panelId, path, amount) {
    const a = this.assignments.get(modKey(panelId, path));
    if (!a) return;
    a.amount = clamp6(Number(amount) || 0, 0, 1);
    this.changed();
  }
  /* ── the assignment gesture ───────────────────────────────────────── */
  /** A finger on a control — panel pointer, hardware knob. Arms assignment. */
  noteTouch(panelId, path) {
    this.touched = { panelId, path, at: Date.now() };
  }
  /**
   * A step-button press (hardware step or on-screen circle): with a control
   * armed, create the slot's modulation if needed and toggle the control
   * onto it. Returns what happened, for lights and readouts.
   */
  assignFromStep(index) {
    const t = this.touched;
    const armed = t && Date.now() - t.at < MOD_TOUCH_GRACE_MS;
    if (!armed) return { action: "none", slot: this.getSlot(index) };
    const existing = this.assignments.get(modKey(t.panelId, t.path));
    if (this.slots[index] && existing?.slot === index) {
      this.unassign(t.panelId, t.path);
      return { action: "unassigned", slot: this.getSlot(index) };
    }
    const created = !this.slots[index];
    const slot = this.createSlot(index);
    if (!slot) return { action: "none", slot: null };
    if (!this.assign(t.panelId, t.path, index)) {
      if (created) this.removeSlot(index);
      return { action: "none", slot: this.getSlot(index) };
    }
    return { action: created ? "created" : "assigned", slot };
  }
  /* ── gates ────────────────────────────────────────────────────────── */
  /**
   * Note on / note off for a slot — what drives a gated modulator like the
   * ADSR:
   *
   *   ModulationStore.gate(0, true);    // key down
   *   ModulationStore.gate(0, false);   // key up — the release runs
   *
   * Free-running types (LFO, S&H) and slots on an external source ignore
   * it. The gate is live state, not a param: it is never persisted.
   */
  gate(index, on) {
    const slot = this.slots[index];
    const def = slot && getModType(slot.type);
    if (!slot || slot.source || !def?.gate) return;
    let state2 = this.states.get(index);
    if (state2 === void 0) {
      state2 = def.createState();
      this.states.set(index, state2);
    }
    def.gate(state2, on);
    this.ensureLoop();
  }
  /* ── the settings page ────────────────────────────────────────────── */
  /**
   * Open a slot's settings (hold its step button): registers one hidden
   * TweakStore panel (`mod-settings`, kind 'modulation') built from the
   * modulator's own control list, with the type enum ahead of it. Every
   * edit on that panel — screen or hardware, the kit syncs it like any
   * page — flows back into the slot's params. Returns the panel id.
   */
  openSettings(index) {
    const slot = this.slots[index];
    const def = slot && getModType(slot.type);
    if (!slot || !def) return null;
    this.closeSettings();
    this.settingsIndex = index;
    this.registerSettingsPanel(slot, def);
    this.settingsUnsub = TweakStore.subscribe(MOD_SETTINGS_PANEL, () => this.onSettingsChange());
    this.changed();
    return MOD_SETTINGS_PANEL;
  }
  closeSettings() {
    if (this.settingsIndex === null) return;
    this.settingsUnsub?.();
    this.settingsUnsub = null;
    this.settingsIndex = null;
    this.settingsShape = "";
    TweakStore.unregisterPanel(MOD_SETTINGS_PANEL);
    this.changed();
  }
  /** The open settings page, or null — the panel to render as the Move page. */
  getSettings() {
    return this.settingsIndex === null ? null : { index: this.settingsIndex, panelId: MOD_SETTINGS_PANEL };
  }
  /**
   * Where the open page's controls sit — the eight dial slots and the small
   * slots under them. Both surfaces lay the page out from this one list, so
   * they never disagree about which knob a pad belongs to.
   */
  getSettingsLayout() {
    const slot = this.settingsIndex === null ? null : this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    if (!slot || !def) return null;
    const layout = modPageLayout(def.controls, slot.params);
    return {
      dials: [{ path: "type" }, ...layout.dials].slice(0, 8),
      toggles: [null, ...layout.toggles].slice(0, 8),
      values: [null, ...layout.values].slice(0, 8)
    };
  }
  /** The open page's curve, sampled 0..1, and its name — the preview dial. */
  getSettingsPreview(count = 32) {
    const slot = this.settingsIndex === null ? null : this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    return slot && def?.preview ? def.preview(slot.params, count) : null;
  }
  /** Hardware buttons the open page claims (the curve's arrows and Delete). */
  getSettingsButtons() {
    const slot = this.settingsIndex === null ? null : this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    return def?.buttons ? Object.keys(def.buttons) : [];
  }
  /** Run a claimed button. False when the page does not claim that name. */
  pressSettingsButton(name) {
    const slot = this.settingsIndex === null ? null : this.slots[this.settingsIndex];
    const action = slot && getModType(slot.type)?.buttons?.[name];
    if (!slot || !action) return false;
    const patch2 = action(slot.params);
    if (patch2) this.updateSlotParams(slot.index, patch2);
    return true;
  }
  /** A knob tap on a page dial that cycles (the curve's clip vocabulary). */
  tapSettingsControl(path) {
    const slot = this.settingsIndex === null ? null : this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    const cycle = def?.controls.find((c) => c.path === path)?.cycle;
    if (!slot || !cycle) return false;
    this.updateSlotParams(slot.index, cycle(slot.params));
    return true;
  }
  registerSettingsPanel(slot, def) {
    const config = {
      type: {
        type: "select",
        options: listModTypes().map((d) => ({ value: d.type, label: d.label })),
        default: slot.type
      }
    };
    this.settingsShape = this.shapeOf(slot, def);
    for (const c of visibleModControls(def, slot.params)) {
      if (c.type === "select") {
        config[c.path] = {
          type: "select",
          options: c.options ?? [],
          default: String(slot.params[c.path] ?? "")
        };
      } else if (c.type === "slider") {
        config[c.path] = {
          type: "slider",
          min: c.min ?? 0,
          max: c.max ?? 1,
          step: c.step,
          unit: c.unit,
          default: Number(slot.params[c.path]) || 0
        };
      } else if (c.type === "toggle") {
        config[c.path] = !!slot.params[c.path];
      } else if (c.type === "xy" && c.xParam && c.yParam) {
        config[c.path] = {
          type: "xy",
          x: c.xAxis,
          y: c.yAxis,
          default: { x: Number(slot.params[c.xParam]) || 0, y: Number(slot.params[c.yParam]) || 0 }
        };
      }
    }
    this.applyingSettings = true;
    TweakStore.registerPanel(
      MOD_SETTINGS_PANEL,
      `${def.label} ${slot.index + 1}`,
      config,
      void 0,
      { kind: "modulation" }
    );
    this.applyingSettings = false;
  }
  /** A settings-panel edit — screen or hardware — lands in the slot's params. */
  onSettingsChange() {
    if (this.applyingSettings || this.settingsIndex === null) return;
    const slot = this.slots[this.settingsIndex];
    if (!slot) return;
    const values = TweakStore.getValues(MOD_SETTINGS_PANEL);
    const nextType = values.type;
    if (nextType && nextType !== slot.type && getModType(nextType)) {
      this.setSlotType(slot.index, nextType);
      this.registerSettingsPanel(this.slots[slot.index], getModType(nextType));
      return;
    }
    const def = getModType(slot.type);
    if (!def) return;
    const patch2 = {};
    for (const c of visibleModControls(def, slot.params)) {
      const v = values[c.path];
      if (c.type === "xy" && c.xParam && c.yParam) {
        const xy = v;
        if (xy && typeof xy === "object") {
          patch2[c.xParam] = Number(xy.x) || 0;
          patch2[c.yParam] = Number(xy.y) || 0;
        }
      } else if (c.type === "toggle") {
        patch2[c.path] = !!v;
      } else if (c.type === "select") {
        if (typeof v === "string") patch2[c.path] = v;
      } else if (typeof v === "number" && Number.isFinite(v)) {
        patch2[c.path] = v;
      }
    }
    this.updateSlotParams(slot.index, patch2);
  }
  /**
   * The open page, after the params moved under it. A change that alters
   * which controls the page shows (the curve's trigger chip appearing) or
   * what they read (an arrow selecting another clip) has to reach the panel
   * — hardware edits arrive there, and the screen renders from it.
   */
  refreshSettings() {
    if (this.settingsIndex === null) return;
    const slot = this.slots[this.settingsIndex];
    const def = slot && getModType(slot.type);
    if (!slot || !def) return;
    if (this.shapeOf(slot, def) !== this.settingsShape) {
      this.registerSettingsPanel(slot, def);
      return;
    }
    const values = TweakStore.getValues(MOD_SETTINGS_PANEL);
    const guarded = this.applyingSettings;
    this.applyingSettings = true;
    for (const c of visibleModControls(def, slot.params)) {
      if (c.type === "xy" && c.xParam && c.yParam) {
        const xy = values[c.path] ?? {};
        const x = Number(slot.params[c.xParam]) || 0;
        const y = Number(slot.params[c.yParam]) || 0;
        if (xy.x !== x || xy.y !== y) TweakStore.updateValue(MOD_SETTINGS_PANEL, c.path, { x, y });
      } else if (values[c.path] !== slot.params[c.path]) {
        TweakStore.updateValue(MOD_SETTINGS_PANEL, c.path, slot.params[c.path]);
      }
    }
    this.applyingSettings = guarded;
  }
  /** Which controls the page is built from — a rebuild when this changes. */
  shapeOf(slot, def) {
    return `${slot.type}:${visibleModControls(def, slot.params).map((c) => c.path).join(",")}`;
  }
  /* ── external sources ─────────────────────────────────────────────── */
  /** Offer an app-side modulator to the slots; returns an unregister fn. */
  registerSource(id, config = {}) {
    this.sources.set(id, config);
    this.changed();
    return () => {
      if (this.sources.get(id) === config) {
        this.sources.delete(id);
        this.sourceValues.delete(id);
        this.changed();
      }
    };
  }
  /** Push a source's signal (-1..1) at any rate; the engine mirrors the latest. */
  setSourceValue(id, value) {
    this.sourceValues.set(id, clamp6(Number(value) || 0, -1, 1));
  }
  getSources() {
    return [...this.sources.keys()];
  }
  /* ── tempo ────────────────────────────────────────────────────────── */
  setTempo(bpm) {
    const next = clamp6(Number(bpm) || 0, 20, 999);
    if (next === this.bpm) return;
    this.bpm = next;
    this.changed();
  }
  getTempo() {
    return this.bpm;
  }
  /* ── reading the modulated layer ──────────────────────────────────── */
  /** A slot's live signal, -1..1. */
  getSignal(index) {
    return this.signals[index] ?? 0;
  }
  /** Where a slot sits in its cycle, 0..1 — a curve composer's playhead. */
  getSlotPhase(index) {
    const slot = this.slots[index];
    const def = slot && getModType(slot.type);
    const state2 = this.states.get(index);
    return slot && def?.phase && state2 !== void 0 ? def.phase(state2) : 0;
  }
  /** The modulation's contribution to one control, in the control's units. */
  getOffset(panelId, path) {
    const a = this.assignments.get(modKey(panelId, path));
    if (!a) return 0;
    const slot = this.slots[a.slot];
    if (!slot) return 0;
    if (slot.source && !this.sources.get(slot.source)?.applies) return 0;
    const meta = this.resolveMeta(panelId, path);
    if (!meta) return 0;
    const base = Number(TweakStore.getValue(panelId, path));
    if (!Number.isFinite(base)) return 0;
    return applyModulation(base, this.signals[a.slot], a.amount, meta.min, meta.max) - base;
  }
  /**
   * A modulatable control's bounds, or null when it has none (or its panel
   * has not registered yet) — what a display needs to draw the modulation
   * against the control's own span.
   */
  getBounds(panelId, path) {
    const meta = this.resolveMeta(panelId, path);
    return meta ? { min: meta.min, max: meta.max } : null;
  }
  /** One control's value with its modulation applied — the frame-time read. */
  getValue(panelId, path) {
    const base = Number(TweakStore.getValue(panelId, path));
    return base + this.getOffset(panelId, path);
  }
  /**
   * A panel's values with every modulation applied — a fresh snapshot per
   * call, meant to be pulled once per frame in place of `TweakStore.getValues`.
   */
  getValues(panelId) {
    const out = { ...TweakStore.getValues(panelId) };
    for (const a of this.assignments.values()) {
      if (a.panelId !== panelId) continue;
      const offset = this.getOffset(panelId, a.path);
      if (offset !== 0) out[a.path] = Number(out[a.path]) + offset;
    }
    return out;
  }
  /* ── subscriptions ────────────────────────────────────────────────── */
  /** Structural changes: slots, assignments, sources, tempo. */
  subscribe(listener) {
    this.structListeners.add(listener);
    return () => this.structListeners.delete(listener);
  }
  /** Every engine frame — for pulsing circles, dots, and step lights. */
  subscribeFrames(listener) {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }
  /** Bumped on every structural change — a stable snapshot for UI stores. */
  getVersion() {
    return this.version;
  }
  /* ── the engine ───────────────────────────────────────────────────── */
  /**
   * Advance every slot by `dt` seconds and refresh the signals. The RAF
   * loop calls this per frame; headless hosts and tests may drive it
   * directly with their own clock.
   */
  tick(dt) {
    const step = clamp6(Number(dt) || 0, 0, 1);
    for (const slot of this.slots) {
      if (!slot) continue;
      if (slot.source) {
        const src = this.sources.get(slot.source);
        let v = this.sourceValues.get(slot.source) ?? 0;
        if (src?.sample) {
          try {
            v = clamp6(Number(src.sample(slot)) || 0, -1, 1);
          } catch {
            v = 0;
          }
        }
        this.signals[slot.index] = v;
        continue;
      }
      const def = getModType(slot.type);
      if (!def) continue;
      let state2 = this.states.get(slot.index);
      if (state2 === void 0) {
        state2 = def.createState();
        this.states.set(slot.index, state2);
      }
      this.signals[slot.index] = clamp6(def.tick(state2, slot.params, step, this.bpm), -1, 1);
    }
    this.frameListeners.forEach((fn) => fn());
  }
  /** Wipe every slot, assignment, and the persisted shelf. */
  clear() {
    this.closeSettings();
    this.slots.fill(null);
    this.assignments.clear();
    this.states.clear();
    this.signals.fill(0);
    this.touched = null;
    clearPersisted(PERSIST_TARGET);
    this.changed();
  }
  ensureLoop() {
    if (this.rafId !== null || typeof window === "undefined") return;
    if (!this.slots.some(Boolean)) return;
    this.lastTick = performance.now();
    this.rafId = window.requestAnimationFrame(this.loop);
  }
  resolveMeta(panelId, path) {
    const key = modKey(panelId, path);
    const cached = this.metas.get(key);
    if (cached !== void 0) return cached;
    const panel = TweakStore.getPanel(panelId);
    if (!panel) return null;
    const meta = findControl(panel.controls, path);
    const numeric = meta && (meta.type === "slider" || meta.type === "number") && Number.isFinite(meta.min) && Number.isFinite(meta.max) ? { min: meta.min, max: meta.max } : null;
    this.metas.set(key, numeric);
    return numeric;
  }
  changed() {
    this.version++;
    savePersisted(PERSIST_TARGET, {
      slots: this.getSlots(),
      assignments: this.getAssignments()
    });
    this.structListeners.forEach((fn) => fn());
    this.ensureLoop();
  }
};
function findControl(controls, path) {
  for (const c of controls) {
    if (c.children) {
      const hit = findControl(c.children, path);
      if (hit) return hit;
    } else if (c.path === path) {
      return c;
    }
  }
  return null;
}
var ModulationStore = /* @__PURE__ */ new ModulationStoreClass();

// src/components/CurveComposer.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function CurveComposer({
  segments,
  driver = null,
  direction = "forward",
  onSegmentsChange,
  onDriverChange,
  getPhase,
  phase = 0,
  mode = "continuous",
  triggerSteps = DEFAULT_TRIGGER_STEPS,
  onTrigger,
  selectedIndex = null,
  onSelect,
  gap = 0,
  curveColor,
  playheadColor,
  grid = false,
  gridSubdivisions = 8,
  width = 256,
  height = 140
}) {
  const layout = composerLayout(width, height, driver != null);
  const { W, totalH, mainRect, driverRect } = layout;
  const composition = useMemo(
    () => ({ segments, driver, direction, gap }),
    [segments, driver, direction, gap]
  );
  const samplers = useMemo(() => buildSamplers(composition), [composition]);
  const liveRef = useRef({ composition, samplers, getPhase, phase, mode, triggerSteps });
  liveRef.current = { composition, samplers, getPhase, phase, mode, triggerSteps };
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;
  const svgRef = useRef(null);
  const seriesPlayheadRef = useRef(null);
  const seriesDotRef = useRef(null);
  const driverPlayheadRef = useRef(null);
  const prevTrigValue = useRef(Number.NaN);
  const [drag, setDrag] = useState(null);
  const [hover, setHover] = useState(null);
  const dragRef = useRef(null);
  dragRef.current = drag;
  useEffect(() => {
    let raf = 0;
    prevTrigValue.current = Number.NaN;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { composition: c, samplers: s, getPhase: gp, phase: p, mode: md, triggerSteps: ts } = liveRef.current;
      const u = gp ? gp() : p;
      const read = readComposition(c, u, s);
      const geo = playheadGeometry(read, layout);
      if (seriesPlayheadRef.current) {
        seriesPlayheadRef.current.setAttribute("x1", String(geo.seriesX));
        seriesPlayheadRef.current.setAttribute("x2", String(geo.seriesX));
      }
      if (seriesDotRef.current) {
        seriesDotRef.current.setAttribute("cx", String(geo.dotX));
        seriesDotRef.current.setAttribute("cy", String(geo.dotY));
      }
      if (driverPlayheadRef.current) {
        driverPlayheadRef.current.setAttribute("x1", String(geo.driverX));
        driverPlayheadRef.current.setAttribute("x2", String(geo.driverX));
      }
      if (md === "trigger") {
        const prev = prevTrigValue.current;
        if (!Number.isNaN(prev)) {
          for (const idx of triggersCrossed(prev, read.value, ts)) onTriggerRef.current?.(idx);
        }
        prevTrigValue.current = read.value;
      } else {
        prevTrigValue.current = Number.NaN;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [W, totalH]);
  const hitLayout = () => ({ totalH, driverY: driverRect ? driverRect.y : null, gap });
  const localCoords = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { ...toLocalCoords(clientX, clientY, rect, totalH), rectW: rect.width };
  };
  const onPointerDown = (e) => {
    const { xN, py, rectW } = localCoords(e.clientX, e.clientY);
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
    }
    const header = headerHit(xN, py, segments, hitLayout());
    if (typeof header === "number") {
      setDrag({ kind: "select", index: header, startX: e.clientX, startY: e.clientY, moved: false });
      return;
    }
    const target = pointerTarget(xN, py, segments, hitLayout(), EDGE_HIT / rectW);
    if (target.kind === "driver") {
      setDrag({
        kind: "driver",
        startX: e.clientX,
        startY: e.clientY,
        baseCurvature: driver.curvature,
        baseSteepness: driver.steepness,
        moved: false
      });
    } else if (target.kind === "boundary") {
      setDrag({ kind: "boundary", index: target.index, startX: e.clientX, startY: e.clientY, base: composition, moved: false });
    } else {
      const seg = segments[target.index];
      setDrag({
        kind: "segment",
        index: target.index,
        startX: e.clientX,
        startY: e.clientY,
        baseCurvature: seg?.curvature ?? 0,
        baseSteepness: seg?.steepness ?? 0,
        moved: false
      });
    }
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) {
      const { xN, py, rectW: rectW2 } = localCoords(e.clientX, e.clientY);
      if (typeof headerHit(xN, py, segments, hitLayout()) === "number") {
        setHover({ kind: "header", index: 0 });
        return;
      }
      const t = pointerTarget(xN, py, segments, hitLayout(), EDGE_HIT / rectW2);
      setHover(t.kind === "driver" ? { kind: "driver", index: 0 } : { kind: t.kind, index: t.index });
      return;
    }
    const svgRect = svgRef.current.getBoundingClientRect();
    const rectW = svgRect.width;
    const rectH = svgRect.height;
    const moved = Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD;
    if (!moved) return;
    if (d.kind === "boundary") {
      const deltaFrac = (e.clientX - d.startX) / rectW;
      const next = redistributeWeight(d.base, d.index, deltaFrac);
      onSegmentsChange?.(next.segments);
      if (!d.moved) setDrag({ ...d, moved: true });
    } else if (d.kind === "segment") {
      const dxFrac = (e.clientX - d.startX) / rectW;
      const dyFrac = (e.clientY - d.startY) / rectH;
      const next = applySegmentBodyDrag(composition, d.index, d.baseCurvature, d.baseSteepness, dxFrac, dyFrac);
      onSegmentsChange?.(next.segments);
      if (!d.moved) setDrag({ ...d, moved: true });
    } else if (d.kind === "driver") {
      const dxFrac = (e.clientX - d.startX) / rectW;
      const dyFrac = (e.clientY - d.startY) / rectH;
      const next = applyDriverBodyDrag(composition, d.baseCurvature, d.baseSteepness, dxFrac, dyFrac);
      if (next.driver) onDriverChange?.(next.driver);
      if (!d.moved) setDrag({ ...d, moved: true });
    } else {
      if (!d.moved) setDrag({ ...d, moved: true });
    }
  };
  const onPointerUp = (e) => {
    const d = dragRef.current;
    setDrag(null);
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
    }
    if (!d || d.moved) return;
    if (d.kind === "select") {
      onSelect?.(d.index);
    } else if (d.kind === "driver") {
      const next = cycleDriverType(composition);
      if (next.driver) onDriverChange?.(next.driver);
    } else if (d.kind === "segment") {
      onSegmentsChange?.(cycleSegmentType(composition, d.index).segments);
    }
  };
  const onPointerCancel = (e) => {
    setDrag(null);
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
    }
  };
  const onDoubleClick = (e) => {
    const { xN, py } = localCoords(e.clientX, e.clientY);
    if (driverRect && py >= driverRect.y) return;
    onSegmentsChange?.(splitSegment(composition, segmentIndexAt(xN, segments, gap)).segments);
  };
  const activeKind = drag?.kind ?? hover?.kind;
  const cursor = activeKind === "boundary" ? "ew-resize" : activeKind === "segment" || activeKind === "driver" ? "move" : activeKind === "select" || activeKind === "header" ? "pointer" : "default";
  const interior = boundaries(segments, gap);
  const renderLaneGrid = (rect) => {
    if (!grid) return null;
    const n = Math.max(1, Math.round(gridSubdivisions));
    const lines = [];
    for (let i = 1; i < n; i++) {
      const gx = i / n * W;
      lines.push(
        /* @__PURE__ */ jsx("line", { x1: gx, y1: rect.y, x2: gx, y2: rect.y + rect.h, className: "tweakers-cc-grid" }, `g-${rect.y}-${i}`)
      );
    }
    return lines;
  };
  const renderLaneBg = (rect, key) => /* @__PURE__ */ jsx("rect", { className: "tweakers-cc-lane", x: rect.x, y: rect.y, width: rect.w, height: rect.h, rx: 8 }, key);
  const diagonal = (rect, span, key) => {
    const d = diagonalLine(rect, span, W);
    return /* @__PURE__ */ jsx("line", { className: "tweakers-cc-diagonal", x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2 }, key);
  };
  return /* @__PURE__ */ jsx("div", { className: "tweakers-cc-wrap", style: { width: W }, children: /* @__PURE__ */ jsxs(
    "svg",
    {
      ref: svgRef,
      className: "tweakers-cc",
      viewBox: `0 0 ${W} ${totalH}`,
      width: W,
      height: totalH,
      style: { width: W, height: totalH, cursor, color: curveColor },
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave: () => !dragRef.current && setHover(null),
      onDoubleClick,
      children: [
        renderLaneBg(mainRect, "main-bg"),
        renderLaneGrid(mainRect),
        selectedIndex != null && selectedIndex >= 0 && selectedIndex < segments.length && (() => {
          const span = segmentSpan(segments, selectedIndex, gap);
          return /* @__PURE__ */ jsx(
            "rect",
            {
              className: "tweakers-cc-seg-selected",
              x: span[0] * W,
              y: mainRect.y,
              width: (span[1] - span[0]) * W,
              height: mainRect.h,
              rx: 8
            }
          );
        })(),
        hover?.kind === "segment" && !drag && (() => {
          const span = segmentSpan(segments, hover.index, gap);
          return /* @__PURE__ */ jsx(
            "rect",
            {
              className: "tweakers-cc-seg-hover",
              x: span[0] * W,
              y: mainRect.y,
              width: (span[1] - span[0]) * W,
              height: mainRect.h,
              rx: 8
            }
          );
        })(),
        segments.map((seg, i) => {
          const span = segmentSpan(segments, i, gap);
          return /* @__PURE__ */ jsxs("g", { children: [
            diagonal(mainRect, span, `diag-${i}`),
            /* @__PURE__ */ jsx("path", { className: "tweakers-cc-curve", d: curvePath(seg, mainRect, span, W) }),
            /* @__PURE__ */ jsx("text", { className: "tweakers-cc-label", x: (span[0] + span[1]) * 0.5 * W, y: mainRect.y + 13, children: seg.type })
          ] }, `seg-${i}`);
        }),
        gap > 0 && timelineSlots(segments, gap).filter((slot) => slot.kind === "gap" && slot.b > slot.a).map((slot) => /* @__PURE__ */ jsx(
          "path",
          {
            className: "tweakers-cc-connector",
            d: connectorPath(slot, samplers, segments.length, mainRect, W)
          },
          `conn-${slot.index}`
        )),
        interior.map((bx, i) => /* @__PURE__ */ jsx(
          "line",
          {
            className: "tweakers-cc-boundary",
            "data-active": String(
              hover?.kind === "boundary" && hover.index === i || drag?.kind === "boundary" && drag.index === i
            ),
            x1: bx * W,
            y1: mainRect.y,
            x2: bx * W,
            y2: mainRect.y + mainRect.h
          },
          `b-${i}`
        )),
        /* @__PURE__ */ jsx("line", { ref: seriesPlayheadRef, className: "tweakers-cc-playhead", x1: 0, y1: mainRect.y, x2: 0, y2: mainRect.y + mainRect.h, style: { stroke: playheadColor } }),
        /* @__PURE__ */ jsx("circle", { ref: seriesDotRef, className: "tweakers-cc-dot", cx: 0, cy: mapY(mainRect, 0), r: 3, style: { fill: playheadColor } }),
        driverRect && /* @__PURE__ */ jsxs(Fragment, { children: [
          renderLaneBg(driverRect, "driver-bg"),
          renderLaneGrid(driverRect),
          hover?.kind === "driver" && !drag && /* @__PURE__ */ jsx("rect", { className: "tweakers-cc-seg-hover", x: 0, y: driverRect.y, width: W, height: driverRect.h, rx: 8 }),
          diagonal(driverRect, [0, 1], "driver-diag"),
          /* @__PURE__ */ jsx("path", { className: "tweakers-cc-curve tweakers-cc-curve-driver", d: curvePath(driver, driverRect, [0, 1], W) }),
          /* @__PURE__ */ jsxs("text", { className: "tweakers-cc-label", x: W * 0.5, y: driverRect.y + 13, children: [
            "driver \xB7 ",
            driver.type
          ] }),
          /* @__PURE__ */ jsx("line", { ref: driverPlayheadRef, className: "tweakers-cc-playhead", x1: 0, y1: driverRect.y, x2: 0, y2: driverRect.y + driverRect.h, style: { stroke: playheadColor } })
        ] })
      ]
    }
  ) });
}

// src/env.ts
var isDevDefault = typeof process !== "undefined" && process?.env?.NODE_ENV ? process.env.NODE_ENV !== "production" : typeof import.meta !== "undefined" && import.meta.env?.MODE ? import.meta.env.MODE !== "production" : true;

// src/curve-preview-core.ts
var CURVE_SAMPLE_COUNT = 160;
var CURVE_MIN_HEIGHT = 32;
var CURVE_MAX_HEIGHT = 160;
var CURVE_DEFAULT_HEIGHT = 64;
var CURVE_FIT_PADDING = 0.05;
function clampCurveHeight(height) {
  if (typeof height !== "number" || !Number.isFinite(height)) return CURVE_DEFAULT_HEIGHT;
  return Math.min(CURVE_MAX_HEIGHT, Math.max(CURVE_MIN_HEIGHT, height));
}
function plotCurve(sample, options = {}) {
  const count = Math.max(2, Math.floor(options.count ?? CURVE_SAMPLE_COUNT));
  const ys = new Array(count);
  for (let i = 0; i < count; i++) {
    let y;
    try {
      y = sample(i / (count - 1));
    } catch {
      y = NaN;
    }
    ys[i] = typeof y === "number" ? y : NaN;
  }
  let domain;
  const explicit = options.domain;
  if (explicit && Number.isFinite(explicit[0]) && Number.isFinite(explicit[1]) && explicit[0] < explicit[1]) {
    domain = [explicit[0], explicit[1]];
  } else {
    const finite2 = ys.filter((y) => Number.isFinite(y));
    if (finite2.length === 0) {
      domain = [0, 1];
    } else {
      let lo2 = Math.min(...finite2);
      let hi2 = Math.max(...finite2);
      if (lo2 === hi2) {
        lo2 -= 0.5;
        hi2 += 0.5;
      }
      const pad = (hi2 - lo2) * CURVE_FIT_PADDING;
      domain = [lo2 - pad, hi2 + pad];
    }
  }
  const [lo, hi] = domain;
  const span = hi - lo;
  const segments = [];
  let current = null;
  for (let i = 0; i < count; i++) {
    if (!Number.isFinite(ys[i])) {
      current = null;
      continue;
    }
    if (!current) {
      current = [];
      segments.push(current);
    }
    current.push({ t: i / (count - 1), v: (ys[i] - lo) / span });
  }
  const baseline = lo < 0 && hi > 0 ? (0 - lo) / span : null;
  return { segments, domain, baseline };
}
function normalizeCurveMarkers(markers) {
  if (!markers) return [];
  return markers.filter((m) => typeof m === "number" && Number.isFinite(m) && m >= 0 && m <= 1);
}
function curveY(v, height, pad = 0) {
  return pad + (1 - v) * (height - pad * 2);
}
function curvePathData(segments, width, height, pad = 0) {
  return segments.map(
    (segment) => segment.map((p, i) => `${i === 0 ? "M" : "L"} ${round2(p.t * width)} ${round2(curveY(p.v, height, pad))}`).join(" ")
  ).join(" ");
}
function round2(value) {
  return Math.round(value * 100) / 100;
}

// src/move-layout.ts
var MOVE_TRACKS = 4;
var MOVE_DIALS = 8;
var MOVE_PADS = 8;
var flat = (controls, out = []) => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};
var isEnumDial = (c) => c.type === "select" && Array.isArray(c.options) && c.options.length > 1;
var isDial = (c) => c.type === "slider" || c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || isEnumDial(c) || c.type === "number" && c.min != null && c.max != null;
var noChip = (c) => c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || isEnumDial(c);
var dialSpan = (c) => c?.type === "filter" ? 2 : 1;
var isSpanContinuation = (page, i) => i > 0 && page.dials[i] !== void 0 && page.dials[i] === page.dials[i - 1];
function buildModMovePage(panel, layout) {
  const controls = flat(panel.controls);
  if (layout) {
    const at = (slot) => slot ? controls.find((c) => c.path === slot.path) : void 0;
    return {
      panel,
      dials: layout.dials.slice(0, MOVE_DIALS).map(at).filter((c) => !!c),
      toggles: layout.toggles.slice(0, MOVE_PADS).map(at),
      values: layout.values.slice(0, MOVE_PADS).map(at),
      actions: []
    };
  }
  const dials = [];
  const toggles = [];
  for (const c of controls) {
    if (c.type === "toggle" && !c.big) toggles[Math.max(0, dials.length - 1)] = c;
    else if (c.type === "toggle" || c.type === "select" || isDial(c)) dials.push(c);
  }
  return { panel, dials: dials.slice(0, MOVE_DIALS), toggles: toggles.slice(0, MOVE_PADS), values: [], actions: [] };
}
var padColumn = (panel, c) => {
  const col = panel.movePads?.[c.path];
  return typeof col === "number" && Number.isInteger(col) && col >= 0 && col < MOVE_PADS ? col : null;
};
function buildMovePages(panels) {
  return panels.filter((p) => p.kind === void 0).slice(0, MOVE_TRACKS).map((panel) => {
    const controls = flat(panel.controls);
    const chipPlaced = (c) => padColumn(panel, c) !== null && !noChip(c);
    const dials = [];
    let nextCol = 0;
    for (const c of controls) {
      if (!isDial(c) || chipPlaced(c)) continue;
      const span = dialSpan(c);
      if (nextCol + span > MOVE_DIALS) {
        if (nextCol >= MOVE_DIALS) break;
        continue;
      }
      for (let s = 0; s < span; s++) dials[nextCol + s] = c;
      nextCol += span;
    }
    const toggles = [];
    const values = [];
    const actions = [];
    const place = (row, c, col) => {
      if (col !== null && row[col] === void 0) {
        row[col] = c;
        return;
      }
      for (let i = 0; i < MOVE_PADS; i++) {
        if (row[i] === void 0) {
          row[i] = c;
          return;
        }
      }
    };
    for (const c of controls) {
      const col = padColumn(panel, c);
      if (c.type === "toggle") place(toggles, c, col);
      else if (c.type === "action") {
        if (col !== null) place(actions, c, col);
      } else if (isDial(c) && !noChip(c) && !dials.includes(c)) place(values, c, col);
    }
    return {
      panel,
      dials,
      toggles: toggles.slice(0, MOVE_PADS),
      values: values.slice(0, MOVE_PADS),
      actions: actions.slice(0, MOVE_PADS)
    };
  });
}
function movePadRows(page, claimedRows) {
  if (claimedRows >= 2) return [page.values, page.toggles, [], []];
  return [page.toggles, page.values, page.actions, []];
}
function moveAppPadRow(row, claimedRows) {
  if (claimedRows >= 2) return row === 2 ? 1 : row === 3 ? 0 : null;
  return claimedRows === 1 && row === 3 ? 0 : null;
}
function visibleColumns(page) {
  const cols = [];
  for (let i = 0; i < MOVE_DIALS; i++) {
    if (page.dials[i] || page.toggles[i] || page.values[i] || page.actions[i]) cols.push(i);
  }
  return cols;
}
function denormalizeDial(meta, v01) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (meta.step) v = Math.round(v / meta.step) * meta.step;
  return Number(v.toFixed(6));
}
function normalizeDial(meta, value) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (Number(value) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}
var norm01 = (v, min, max) => {
  const n = (Number(v) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
};
var denorm01 = (v01, min, max, step) => {
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (step) v = Math.round(v / step) * step;
  return Number(v.toFixed(6));
};
function normalizeXYDial(meta, value) {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  const v = value ?? {};
  return { x: norm01(v.x, xAxis.min, xAxis.max), y: norm01(v.y, yAxis.min, yAxis.max) };
}
var enumOptionValue = (o) => typeof o === "string" ? o : o.value;
var enumOptionLabel = (o) => typeof o === "string" ? o : o.label ?? o.value;
var enumOptionIcon = (o) => typeof o === "string" ? null : o.icon ?? null;
var ENUM_SHAPE_SAMPLES = 64;
function enumShapePath(meta, value) {
  if (!meta.preview) return null;
  let sample;
  try {
    sample = meta.preview(String(value ?? ""));
  } catch {
    return null;
  }
  if (typeof sample !== "function") return null;
  const segments = plotCurve(sample, { count: ENUM_SHAPE_SAMPLES }).segments;
  let lo = Infinity;
  let hi = -Infinity;
  for (const seg of segments) {
    for (const pt of seg) {
      if (pt.v < lo) lo = pt.v;
      if (pt.v > hi) hi = pt.v;
    }
  }
  if (lo > hi) return null;
  const span = hi - lo;
  const fill = (v) => span > 0 ? (v - lo) / span : 0.5;
  const d = segments.map((seg) => seg.map((pt, i) => `${i ? "L" : "M"} ${(pt.t * 100).toFixed(2)} ${((1 - fill(pt.v)) * 100).toFixed(2)}`).join(" ")).join(" ");
  return d || null;
}
function enumIndex(meta, value) {
  const i = (meta.options ?? []).findIndex((o) => enumOptionValue(o) === value);
  return Math.max(0, i);
}
function normalizeRangeDial(meta, value) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = value ?? {};
  return { lo: norm01(v.min, min, max), hi: norm01(v.max, min, max) };
}
function denormalizeRangeDial(meta, lo01, hi01) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const step = meta.step ?? 0;
  return clampRange(
    { min: denorm01(lo01, min, max, step), max: denorm01(hi01, min, max, step) },
    min,
    max
  );
}
function normalizeEnumDial(meta, value) {
  const opts = (meta.options ?? []).map((o) => enumOptionValue(o));
  if (opts.length < 2) return 0;
  const i = opts.indexOf(String(value));
  return i <= 0 ? 0 : i / (opts.length - 1);
}
function denormalizeEnumDial(meta, v01) {
  const opts = (meta.options ?? []).map((o) => enumOptionValue(o));
  if (opts.length === 0) return "";
  const i = Math.round(Math.min(1, Math.max(0, v01)) * (opts.length - 1));
  return opts[i];
}
function normalizeFilterDial(meta, value) {
  const ca = resolveFilterAxis(meta.cutoffAxis, "cutoff");
  const ra = resolveFilterAxis(meta.resonanceAxis, "resonance");
  const v = normalizeFilterValue(value, ca, ra);
  return { cutoff: filterHand01(v.cutoff, ca), resonance: filterHand01(v.resonance, ra) };
}
function denormalizeFilterDial(meta, cutoff01, resonance01) {
  const ca = resolveFilterAxis(meta.cutoffAxis, "cutoff");
  const ra = resolveFilterAxis(meta.resonanceAxis, "resonance");
  return { cutoff: filterHandValue(cutoff01, ca), resonance: filterHandValue(resonance01, ra) };
}
function filterShapePath(meta, value) {
  const pos = normalizeFilterDial(meta, value);
  let response;
  try {
    response = (meta.response ?? defaultFilterResponse)(pos.cutoff, pos.resonance);
  } catch {
    return null;
  }
  if (typeof response !== "function") return null;
  return filterResponsePath(response);
}
function dialOrigin(meta) {
  const origin = meta.origin ?? (meta.bipolar ? 0 : void 0);
  return origin === void 0 ? 0 : normalizeDial(meta, origin);
}

// src/move-visual-core.ts
var clamp016 = (value) => Math.max(0, Math.min(1, value));
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
      return { kind: "pan", position: clamp016(position) };
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
      return { kind: "pitch", position: (v - lo) / (hi - lo), zero: between(0, lo, hi) ? -lo / (hi - lo) : null };
    default:
      return null;
  }
}
function movePlaybackMode(meta, value) {
  if (meta.type !== "select" || meta.moveVisual?.kind !== "playback" || typeof value !== "string") return null;
  if (!meta.options?.some((option) => (typeof option === "string" ? option : option.value) === value)) return null;
  const modes = meta.moveVisual.modes;
  if (modes !== void 0 && (typeof modes !== "object" || modes === null || Array.isArray(modes))) return null;
  const mode = modes ? Object.prototype.hasOwnProperty.call(modes, value) ? modes[value] : void 0 : value;
  return mode === "forward" || mode === "reverse" || mode === "ping-pong" || mode === "scissors" ? mode : null;
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

// src/icons.ts
var ICON_MOVE_CAPTURE = {
  viewBox: "0 0 14 14",
  path: "M1 0H5V2H2V5H0V0H1ZM2 10V12H5V14H0V9H2V10ZM10 0H14V5H12V2H9V0H10ZM14 10V14H9V12H12V9H14V10Z"
};
var ICON_MOVE_ENTER = {
  viewBox: "0 0 12 12",
  circle: { cx: "6", cy: "6", r: "6" }
};
var LUCIDE_ICONS = {
  /* directions and traversal */
  "arrow-right": ["M5 12h14", "m12 5 7 7-7 7"],
  "arrow-left": ["M19 12H5", "m12 19-7-7 7-7"],
  "arrow-left-right": ["M8 3 4 7l4 4", "M4 7h16", "m16 21 4-4-4-4", "M20 17H4"],
  "fold-horizontal": [
    "M2 12h6",
    "M22 12h-6",
    "M12 2v2",
    "M12 8v2",
    "M12 14v2",
    "M12 20v2",
    "m19 9-3 3 3 3",
    "m5 15 3-3-3-3"
  ],
  scissors: [
    "M20 4 8.12 15.88",
    "M14.47 14.48 20 20",
    "M8.12 8.12 12 12",
    "M6 3a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
    "M6 15a3 3 0 1 0 0 6 3 3 0 1 0 0-6"
  ],
  /* signal character */
  "grid-2x2": ["M12 3v18", "M3 12h18", "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  waves: [
    "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
  ],
  "audio-lines": ["M2 10v3", "M6 6v11", "M10 3v18", "M14 8v7", "M18 5v13", "M22 10v3"]
};

// src/components/move-visuals.tsx
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function MoveSlotNumericBody({ label, value, drawing }) {
  return /* @__PURE__ */ jsxs2(Fragment2, { children: [
    /* @__PURE__ */ jsx2("span", { className: "tweakers-move-dial-tag", children: label }),
    /* @__PURE__ */ jsxs2("svg", { className: "tweakers-move-visual", viewBox: "0 0 100 60", "aria-hidden": "true", children: [
      drawing.kind === "opacity" && /* @__PURE__ */ jsxs2(Fragment2, { children: [
        /* @__PURE__ */ jsx2("circle", { className: "tweakers-move-visual-guide", cx: "40", cy: "30", r: "18" }),
        /* @__PURE__ */ jsx2("circle", { className: "tweakers-move-visual-guide", cx: "60", cy: "30", r: "18" }),
        /* @__PURE__ */ jsx2("circle", { className: "tweakers-move-visual-solid", cx: "60", cy: "30", r: "18", opacity: drawing.alpha })
      ] }),
      drawing.kind === "blur" && /* @__PURE__ */ jsx2(
        "circle",
        {
          className: "tweakers-move-visual-solid",
          cx: "50",
          cy: "30",
          r: "14",
          style: { filter: `blur(${drawing.radius}px)` }
        }
      ),
      drawing.kind === "pan" && /* @__PURE__ */ jsxs2(Fragment2, { children: [
        /* @__PURE__ */ jsx2("path", { className: "tweakers-move-visual-guide", d: "M16 30H84M50 12V48" }),
        /* @__PURE__ */ jsx2("path", { className: "tweakers-move-visual-line", d: `M50 30H${16 + drawing.position * 68}` }),
        /* @__PURE__ */ jsx2(
          "circle",
          {
            className: "tweakers-move-visual-point",
            "data-offset": Math.abs(drawing.position - 0.5) > 1e-9 || void 0,
            cx: 16 + drawing.position * 68,
            cy: "30",
            r: "5"
          }
        ),
        /* @__PURE__ */ jsx2("text", { x: "5", y: "30", dominantBaseline: "central", children: "L" }),
        /* @__PURE__ */ jsx2("text", { x: "95", y: "30", dominantBaseline: "central", children: "R" })
      ] }),
      drawing.kind === "stereo-width" && /* @__PURE__ */ jsxs2(Fragment2, { children: [
        /* @__PURE__ */ jsx2("path", { className: "tweakers-move-visual-guide", d: "M50 13V47" }),
        drawing.unity !== null && /* @__PURE__ */ jsxs2("g", { className: "tweakers-move-visual-reference", children: [
          /* @__PURE__ */ jsx2("ellipse", { cx: 50 - drawing.unity * 28, cy: "30", rx: "12", ry: "17" }),
          /* @__PURE__ */ jsx2("ellipse", { cx: 50 + drawing.unity * 28, cy: "30", rx: "12", ry: "17" })
        ] }),
        /* @__PURE__ */ jsxs2("g", { className: "tweakers-move-visual-lobes", children: [
          /* @__PURE__ */ jsx2("ellipse", { cx: 50 - drawing.separation * 28, cy: "30", rx: "12", ry: "17" }),
          /* @__PURE__ */ jsx2("ellipse", { cx: 50 + drawing.separation * 28, cy: "30", rx: "12", ry: "17" })
        ] })
      ] }),
      drawing.kind === "pitch" && /* @__PURE__ */ jsxs2("g", { children: [
        /* @__PURE__ */ jsx2("path", { className: "tweakers-move-visual-guide", d: "M8 30H92M8 25V35M29 27V33M50 25V35M71 27V33M92 25V35" }),
        drawing.zero !== null && /* @__PURE__ */ jsx2("path", { className: "tweakers-move-visual-reference", d: `M${8 + drawing.zero * 84} 12V48` }),
        /* @__PURE__ */ jsx2("path", { className: "tweakers-move-visual-line", d: `M${8 + (drawing.zero ?? 0) * 84} 30H${8 + drawing.position * 84}` }),
        /* @__PURE__ */ jsx2(
          "path",
          {
            className: "tweakers-move-visual-pitch-marker",
            "data-offset": drawing.zero === null || Math.abs(drawing.position - drawing.zero) > 1e-9 || void 0,
            d: `M${8 + drawing.position * 84} 22l-5 -7h10z`
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx2("span", { className: "tweakers-move-dial-option tweakers-move-visual-value", children: value })
  ] });
}
function MoveSlotPlaybackDrawing({ mode }) {
  const icon = mode === "scissors" ? "scissors" : mode === "ping-pong" ? "arrow-left-right" : "arrow-right";
  return /* @__PURE__ */ jsx2(
    "svg",
    {
      className: "tweakers-move-dial-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx2("g", { transform: mode === "reverse" ? "translate(24 0) scale(-1 1)" : void 0, children: LUCIDE_ICONS[icon].map((d) => /* @__PURE__ */ jsx2("path", { d }, d)) })
    }
  );
}

// src/angle-core.ts
var ANGLE_DEAD_ZONE_PX = 4;
function decimalsForStep2(step) {
  const s = String(step);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}
function snapAngle(value, min, step) {
  if (!(step > 0)) return value;
  return parseFloat((min + Math.round((value - min) / step) * step).toFixed(decimalsForStep2(step)));
}
function normalizeAngle(value, min, max, wrap) {
  const span = max - min;
  if (!wrap || span <= 0) return Math.min(max, Math.max(min, value));
  const t = ((value - min) % span + span) % span;
  return min + t;
}
function valueToBearing(value, min, max) {
  const span = max - min || 1;
  return (value - min) / span * 360;
}
function bearingToValue(bearing, min, max) {
  const span = max - min || 1;
  return min + (bearing % 360 + 360) % 360 / 360 * span;
}
function angleFromPointer(dx, dy, current, min, max, step, wrap) {
  if (Math.hypot(dx, dy) < ANGLE_DEAD_ZONE_PX) return null;
  const bearing = Math.atan2(dx, -dy) * 180 / Math.PI;
  let value = bearingToValue(bearing, min, max);
  if (wrap) {
    const span = max - min;
    while (value - current > span / 2) value -= span;
    while (current - value > span / 2) value += span;
  }
  return normalizeAngle(snapAngle(value, min, step), min, max, wrap);
}
function nudgeAngle(value, delta, min, max, step, wrap) {
  return normalizeAngle(snapAngle(value + delta * (step || 1), min, step), min, max, wrap);
}
function arcPath(from, to, radius, cx = 0, cy = 0) {
  const point = (deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return `${(cx + radius * Math.cos(rad)).toFixed(3)} ${(cy + radius * Math.sin(rad)).toFixed(3)}`;
  };
  const delta = to - from;
  if (Math.abs(delta) < 0.01) return "";
  if (Math.abs(delta) >= 359.99) {
    return `M ${point(from)} A ${radius} ${radius} 0 0 1 ${point(from + 180)} A ${radius} ${radius} 0 0 1 ${point(from + 359.99)}`;
  }
  return `M ${point(from)} A ${radius} ${radius} 0 ${Math.abs(delta) > 180 ? 1 : 0} ${delta > 0 ? 1 : 0} ${point(to)}`;
}

// src/components/ListScreen.tsx
import { useEffect as useEffect2, useRef as useRef2 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function itemValue(item) {
  return typeof item === "string" ? item : item.value;
}
function itemLabel(item) {
  return typeof item === "string" ? item : item.label ?? item.value;
}
function itemTag(item) {
  return typeof item === "string" ? void 0 : item.tag;
}
function itemMuted(item) {
  return typeof item === "string" ? false : Boolean(item.muted);
}
function ListScreen({
  items,
  value,
  onSelect,
  wide,
  follow = "nearest",
  className,
  style
}) {
  const rootRef = useRef2(null);
  useEffect2(() => {
    const root = rootRef.current;
    if (!root) return;
    const sync = () => {
      root.querySelector("[data-selected]")?.scrollIntoView?.({ block: follow });
      const end = root.scrollHeight - root.clientHeight;
      root.toggleAttribute?.("data-over-top", root.scrollTop > 1);
      root.toggleAttribute?.("data-over-bottom", root.scrollTop < end - 1);
    };
    sync();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(sync);
    observer.observe(root);
    return () => observer.disconnect();
  }, [value, follow, items.length]);
  const rootClassName = ["tweakers-list-screen", className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx3(
    "div",
    {
      ref: rootRef,
      className: rootClassName,
      style,
      "data-wide": wide || void 0,
      role: "listbox",
      children: items.map((item) => {
        const rowValue = itemValue(item);
        const selected = rowValue === value;
        const tag = itemTag(item);
        return /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            role: "option",
            "aria-selected": selected,
            className: "tweakers-list-screen-row",
            "data-selected": selected || void 0,
            "data-tagged": tag ? true : void 0,
            "data-muted": itemMuted(item) || void 0,
            onClick: () => onSelect?.(rowValue),
            children: [
              /* @__PURE__ */ jsx3("span", { className: "tweakers-list-screen-label", children: itemLabel(item) }),
              tag && /* @__PURE__ */ jsx3("span", { className: "tweakers-list-screen-tag", children: tag })
            ]
          },
          rowValue
        );
      })
    }
  );
}

// src/components/move-slots.tsx
import { Fragment as Fragment3, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function moveSlotKind(meta, opts = {}) {
  if (meta.type === "filter") return "filter";
  if (opts.stage) return "env";
  if (meta.type === "toggle") return "toggle";
  if (meta.type === "transfer") return "transfer";
  if (meta.type === "gradient") return "ramp";
  if (meta.type === "slider" && meta.display === "dial") return "dial";
  if (meta.type === "xy") return "xy";
  if (meta.type === "range") return "range";
  const drawing = moveNumericDrawing(meta, opts.value ?? meta.min);
  if (drawing) return drawing.kind;
  if (movePlaybackMode(meta, opts.value)) return "playback";
  if (opts.enum) {
    if (opts.shape) return "curve";
    if (opts.glyph) return "icon";
    return "enum";
  }
  return opts.valueFirst ? "value" : "default";
}
function MoveSlotGlyph({ name, className }) {
  const paths = LUCIDE_ICONS[name];
  if (!paths) return null;
  return /* @__PURE__ */ jsx4(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: paths.map((d) => /* @__PURE__ */ jsx4("path", { d }, d))
    }
  );
}
function MoveSlotReadout({ label, value }) {
  return /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-dial-readout", children: [
    /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-label", "data-long": label.length > 9 || void 0, children: label }),
    /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-value", children: value })
  ] });
}
function MoveSlotShape({ d, className = "tweakers-move-dial-shape" }) {
  return /* @__PURE__ */ jsx4("svg", { className, viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true", children: /* @__PURE__ */ jsx4("path", { d }) });
}
function MoveSlotDefaultBody({
  label,
  value,
  pct,
  originPct,
  atOrigin
}) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4(MoveSlotReadout, { label, value }),
    /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-dial-bar", children: [
      /* @__PURE__ */ jsx4(
        "div",
        {
          className: "tweakers-move-dial-fill",
          "data-zero": atOrigin || void 0,
          style: originPct != null ? { marginLeft: `${Math.min(pct, originPct)}%`, width: `${Math.abs(pct - originPct)}%` } : { width: `${pct}%` }
        }
      ),
      atOrigin && /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-zero", style: { left: `${originPct}%` } })
    ] })
  ] });
}
var MOVE_LIST_ROWS = 5;
function MoveSlotEnumBody({
  label,
  optionLabel,
  options,
  activeIdx,
  shape,
  glyph,
  playback
}) {
  const selected = options[activeIdx];
  if (playback || shape || glyph) {
    return /* @__PURE__ */ jsxs4(Fragment3, { children: [
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-tag", children: label }),
      playback && /* @__PURE__ */ jsx4(MoveSlotPlaybackDrawing, { mode: playback }),
      !playback && shape && /* @__PURE__ */ jsx4(MoveSlotShape, { d: shape }),
      !playback && glyph && /* @__PURE__ */ jsx4(MoveSlotGlyph, { name: glyph, className: "tweakers-move-dial-icon" }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-option", children: optionLabel }),
      /* @__PURE__ */ jsx4("div", { className: "tweakers-move-dial-bar", children: /* @__PURE__ */ jsx4("div", { className: "tweakers-move-dial-enum", children: options.map((opt, j) => /* @__PURE__ */ jsx4(
        "span",
        {
          className: "tweakers-move-dial-enum-cell",
          "data-on": j === activeIdx || void 0
        },
        enumOptionValue(opt)
      )) }) })
    ] });
  }
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: "tweakers-move-dial-screen",
      "data-grow": options.length > MOVE_LIST_ROWS || void 0,
      style: { "--move-list-count": options.length },
      children: [
        /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-head", children: label }),
        /* @__PURE__ */ jsx4(
          ListScreen,
          {
            className: "tweakers-move-dial-list",
            items: options.map((opt) => ({
              value: enumOptionValue(opt),
              label: enumOptionLabel(opt)
            })),
            value: selected ? enumOptionValue(selected) : void 0,
            follow: "center"
          }
        )
      ]
    }
  );
}
function MoveSlotXYBody({ label, value, position, gridN, shape = null }) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4("div", { className: "tweakers-move-xy", children: shape !== null ? /* @__PURE__ */ jsx4(MoveSlotShape, { d: shape, className: "tweakers-move-xy-curve" }) : /* @__PURE__ */ jsxs4(Fragment3, { children: [
      gridN > 0 && /* @__PURE__ */ jsx4("span", { className: "tweakers-move-xy-grid", style: {
        "--tweak-xy-grid-step-x": `${100 / gridN}%`,
        "--tweak-xy-grid-step-y": `${100 / gridN}%`
      } }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-xy-line", "data-axis": "x", style: { top: `${position.y * 100}%` } }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-xy-line", "data-axis": "y", style: { left: `${position.x * 100}%` } }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-xy-dot", style: { left: `${position.x * 100}%`, top: `${position.y * 100}%` } })
    ] }) }),
    /* @__PURE__ */ jsx4(MoveSlotReadout, { label, value })
  ] });
}
function MoveSlotDisplay({ children }) {
  return /* @__PURE__ */ jsx4("div", { className: "tweakers-move-slot-display", children });
}
function MoveSlotDisplayFoot({ label, value }) {
  return /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-slot-foot", children: [
    /* @__PURE__ */ jsx4("span", { className: "tweakers-move-slot-foot-label", children: label }),
    /* @__PURE__ */ jsx4("span", { className: "tweakers-move-slot-foot-value", children: value })
  ] });
}
function MoveSlotTransferBody({ label, value, shape, point }) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsxs4(MoveSlotDisplay, { children: [
      /* @__PURE__ */ jsx4(MoveSlotShape, { d: shape, className: "tweakers-move-slot-shape" }),
      point && /* @__PURE__ */ jsx4(
        "span",
        {
          className: "tweakers-move-slot-dot",
          style: { left: `${point.x * 100}%`, top: `${point.y * 100}%` }
        }
      )
    ] }),
    /* @__PURE__ */ jsx4(MoveSlotDisplayFoot, { label, value })
  ] });
}
function MoveSlotRampBody({ label, value, css, stop }) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsxs4(MoveSlotDisplay, { children: [
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-slot-ramp", style: { background: css } }),
      stop !== null && // Inset a hair so a stop at either end still shows its whole tick —
      // the only thing saying which stop the knob is holding.
      /* @__PURE__ */ jsx4(
        "span",
        {
          className: "tweakers-move-slot-tick",
          style: { left: `calc(${stop * 100}% + ${(0.5 - stop) * 4}px)` }
        }
      )
    ] }),
    /* @__PURE__ */ jsx4(MoveSlotDisplayFoot, { label, value })
  ] });
}
function MoveSlotDialBody({ label, value, bearing, origin }) {
  const rad = (bearing - 90) * Math.PI / 180;
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4(MoveSlotDisplay, { children: /* @__PURE__ */ jsxs4("svg", { className: "tweakers-move-slot-needle", viewBox: "-12 -12 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx4("circle", { className: "tweakers-move-needle-face", cx: "0", cy: "0", r: "8.5" }),
      /* @__PURE__ */ jsx4("path", { className: "tweakers-move-needle-sweep", d: arcPath(origin, bearing, 8.5) }),
      /* @__PURE__ */ jsx4(
        "line",
        {
          className: "tweakers-move-needle-hand",
          x1: "0",
          y1: "0",
          x2: (8.5 * Math.cos(rad)).toFixed(3),
          y2: (8.5 * Math.sin(rad)).toFixed(3)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx4(MoveSlotDisplayFoot, { label, value })
  ] });
}
function MoveSlotRangeBody({
  label,
  value,
  lo,
  hi
}) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4(MoveSlotReadout, { label, value }),
    /* @__PURE__ */ jsx4("div", { className: "tweakers-move-dial-bar", children: /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-dial-range", children: [
      /* @__PURE__ */ jsx4(
        "div",
        {
          className: "tweakers-move-dial-span",
          style: { left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }
        }
      ),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-handle", style: { left: `${lo * 100}%` } }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-handle", style: { left: `${hi * 100}%` } })
    ] }) })
  ] });
}
function MoveSlotFilterBody({
  meta,
  value,
  shape
}) {
  const ca = resolveFilterAxis(meta.cutoffAxis, "cutoff");
  const ra = resolveFilterAxis(meta.resonanceAxis, "resonance");
  const fmt = (v, f) => f ? f(v) : Math.abs(v) >= 100 ? Math.round(v).toString() : Number(v.toFixed(2)).toString();
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4("div", { className: "tweakers-move-filter-display", children: shape && /* @__PURE__ */ jsx4(MoveSlotShape, { d: shape, className: "tweakers-move-filter-shape" }) }),
    /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-filter-readout", "data-side": "cutoff", children: [
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-label", children: ca.label }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-value", children: fmt(value.cutoff, ca.formatValue) })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-filter-readout", "data-side": "resonance", children: [
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-label", children: ra.label }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-value", children: fmt(value.resonance, ra.formatValue) })
    ] })
  ] });
}
function MoveSlotEnvBody({
  points,
  stages,
  joints = []
}) {
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${i / (points.length - 1) * 100} ${100 - v * 100}`).join(" ");
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-env-display", children: [
      /* @__PURE__ */ jsx4(MoveSlotShape, { d, className: "tweakers-move-env-shape" }),
      joints.map((j) => /* @__PURE__ */ jsx4(
        "span",
        {
          className: "tweakers-move-env-handle",
          "data-held": j.held || void 0,
          style: {
            left: `${j.x * 100}%`,
            top: `calc(6px + (100% - 12px) * ${(1 - j.y).toFixed(4)})`
          }
        },
        j.stage
      ))
    ] }),
    stages.map((s) => /* @__PURE__ */ jsxs4("div", { className: "tweakers-move-env-readout", "data-stage": s.stage, children: [
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-label", children: s.label }),
      /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-value", children: s.value })
    ] }, s.stage))
  ] });
}
function MoveSlotScopeBody({
  label,
  value,
  pct,
  children
}) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4("div", { className: "tweakers-move-scope-display", children }),
    /* @__PURE__ */ jsx4(MoveSlotReadout, { label, value }),
    /* @__PURE__ */ jsx4("div", { className: "tweakers-move-dial-bar", children: /* @__PURE__ */ jsx4("div", { className: "tweakers-move-dial-fill", style: { width: `${pct}%` } }) })
  ] });
}
function MoveSlotToggleBody({ label, on }) {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-toggle-indicator", "data-on": on || void 0 }),
    /* @__PURE__ */ jsx4("span", { className: "tweakers-move-dial-toggle-label", children: label })
  ] });
}
var MOVE_SLOT_LIBRARY = {
  opacity: { description: "overlapping circles showing transparency", component: MoveSlotNumericBody },
  blur: { description: "pixel blur on a single filled circle", component: MoveSlotNumericBody },
  pan: { description: "position between L, C and R references", component: MoveSlotNumericBody },
  "stereo-width": { description: "stereo separation with a unity reference", component: MoveSlotNumericBody },
  pitch: { description: "signed pitch ruler with a zero reference", component: MoveSlotNumericBody },
  playback: { description: "explicit playback traversal with a named mode", component: MoveSlotEnumBody },
  default: { description: "name centred, value on touch, fill bar", component: MoveSlotDefaultBody },
  value: { description: "value-first: the value is the headline, the name a tag on top", component: MoveSlotDefaultBody },
  icon: { description: "option picker showing the current option as a glyph", component: MoveSlotEnumBody },
  curve: { description: "option picker drawing the current option\u2019s shape \u2014 curve selection", component: MoveSlotEnumBody },
  enum: { description: "stepped option picker showing every option on a list screen", component: MoveSlotEnumBody },
  xy: { description: "two axes in one gesture field, or a live shape preview", component: MoveSlotXYBody },
  range: { description: "two handles on one bar; volume knob is the second hand", component: MoveSlotRangeBody },
  filter: { description: "2 slots: cutoff + resonance as one response picture", component: MoveSlotFilterBody },
  env: { description: "4 slots: the whole ADSR as one shape, a caption per stage", component: MoveSlotEnvBody },
  scope: { description: "a dial with the live signal filling it behind the readout", component: MoveSlotScopeBody },
  toggle: { description: "a switch in a big slot \u2014 the pad\u2019s language at slot size", component: MoveSlotToggleBody },
  transfer: { description: "a response curve, one knob holding one of its points", component: MoveSlotTransferBody },
  ramp: { description: "a colour ramp, one knob holding one of its stops", component: MoveSlotRampBody },
  dial: { description: "a needle, for values whose two ends are the same place", component: MoveSlotDialBody }
};

// src/components/ModRing.tsx
import { useEffect as useEffect3, useRef as useRef3 } from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function ModRing({
  panelId,
  path,
  assignment,
  className
}) {
  const arcRef = useRef3(null);
  const color = modColor(assignment.slot);
  useEffect3(() => {
    const el = arcRef.current;
    if (!el) return;
    const draw = (from, to) => {
      const { length, offset } = modRingArc(from, to);
      el.setAttribute("stroke-dasharray", `${length.toFixed(2)} ${MOD_RING_CIRCUMFERENCE.toFixed(2)}`);
      el.setAttribute("stroke-dashoffset", offset.toFixed(2));
    };
    const bounds = ModulationStore.getBounds(panelId, path);
    const span = bounds ? bounds.max - bounds.min : 0;
    const base01 = () => span ? (Number(TweakStore.getValue(panelId, path)) - bounds.min) / span : 0;
    if (!span) return;
    const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      const reach = assignment.amount / 2;
      const drawReach = () => draw(base01() - reach, base01() + reach);
      drawReach();
      return TweakStore.subscribe(panelId, drawReach);
    }
    return ModulationStore.subscribeFrames(() => {
      const b = base01();
      draw(b, b + ModulationStore.getOffset(panelId, path) / span);
    });
  }, [panelId, path, assignment.slot, assignment.amount]);
  return /* @__PURE__ */ jsxs5(
    "svg",
    {
      className: ["tweakers-mod-ring", className].filter(Boolean).join(" "),
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx5("circle", { className: "tweakers-mod-ring-track", cx: "8", cy: "8", r: MOD_RING_RADIUS }),
        /* @__PURE__ */ jsx5(
          "circle",
          {
            ref: arcRef,
            className: "tweakers-mod-ring-arc",
            cx: "8",
            cy: "8",
            r: MOD_RING_RADIUS,
            stroke: color,
            strokeDasharray: `0 ${MOD_RING_CIRCUMFERENCE}`
          }
        )
      ]
    }
  );
}

// src/move-surface-store.ts
var EMPTY = { rows: 0, pads: [], steps: null, screen: null };
var state = EMPTY;
var listeners = /* @__PURE__ */ new Set();
var pressListeners = /* @__PURE__ */ new Set();
var emit = () => {
  for (const fn of listeners) fn();
};
function patch(key, value) {
  if (JSON.stringify(state[key]) === JSON.stringify(value)) return;
  state = { ...state, [key]: value };
  emit();
}
var MoveSurfaceStore = {
  getState: () => state,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** How many bottom pad rows the app took (matches `claims.pads` on the wire). */
  claimRows(rows) {
    patch("rows", rows);
  },
  setPads(pads) {
    patch("pads", pads.filter((p) => p.x >= 0 && p.x < 8 && (p.y === 0 || p.y === 1)));
  },
  setSteps(steps) {
    patch("steps", steps === null ? null : steps.filter((s) => s.step >= 0 && s.step < 16));
  },
  setScreen(screen) {
    patch("screen", screen);
  },
  /** A tap on an on-screen pad, for the host to treat like a hardware press. */
  onPress(fn) {
    pressListeners.add(fn);
    return () => pressListeners.delete(fn);
  },
  press(x, y) {
    for (const fn of pressListeners) fn({ x, y });
  },
  /** Hand the whole surface back — the panel returns to its plain layout. */
  reset() {
    if (state === EMPTY) return;
    state = EMPTY;
    emit();
  }
};

// src/shortcut-utils.ts
function fineDragValue(opts) {
  const { startValue, startPos, pos, extentPx, min, max, factor = 0.1 } = opts;
  const delta = (pos - startPos) / (extentPx || 1) * (max - min) * factor;
  return Math.max(min, Math.min(max, startValue + delta));
}

// src/move-volume.ts
var MoveVolumeDisplayClass = class {
  constructor() {
    this.state = null;
    this.listeners = /* @__PURE__ */ new Set();
  }
  /** Show the pill with this readout — replaces any previous one. */
  set(state2) {
    this.state = state2;
    this.notify();
  }
  /** Hide the pill. */
  clear() {
    this.state = null;
    this.notify();
  }
  /** The current readout, or null when the pill is hidden. */
  get() {
    return this.state;
  }
  /** Notified when the readout is set or cleared. */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notify() {
    for (const l of this.listeners) l();
  }
};
var MoveVolumeDisplay = new MoveVolumeDisplayClass();

// src/components/MovePanel.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var MOVE_TRACK_COLORS = ["#4274f4", "#d83dff", "#ff4d07", "#52bd06"];
var PAD_ROWS = 4;
var DIAL_TRACK_INSET = 10;
var XY_INSET = { left: 8, top: 8, right: 9, bottom: 8 };
var XY_GRID_DEFAULT = 5;
var TAP_MS = 300;
function boldColons(text) {
  if (!text.includes(":")) return text;
  return text.split(":").flatMap(
    (part, i) => i === 0 ? [part] : [/* @__PURE__ */ jsx6("span", { className: "tweakers-move-volume-sep", children: ":" }, `sep-${i}`), part]
  );
}
function MoveModRing({ panelId, path, pad }) {
  const assignment = ModulationStore.getAssignment(panelId, path);
  if (!assignment || !ModulationStore.getSlot(assignment.slot)) return null;
  return /* @__PURE__ */ jsx6(
    ModRing,
    {
      panelId,
      path,
      assignment,
      className: pad ? "tweakers-move-pad-mod" : "tweakers-move-dial-mod"
    }
  );
}
var MOVE_TOUCH_EVENT = "move-tweakers:touch";
var MOVE_OVERRIDE_EVENT = "move-tweakers:override";
var MOVE_LATCH_EVENT = "move-tweakers:latch";
var MOVE_PAGE_EVENT = "move-tweakers:page";
var MOVE_PAGE_SELECT_EVENT = "move-tweakers:page-select";
function MovePanel({ theme = "system", productionEnabled = isDevDefault, panels: only, dock = "viewport" }) {
  if (!productionEnabled) return null;
  const [panels, setPanels] = useState2([]);
  const [track, setTrack] = useState2(0);
  const [dragPath, setDragPath] = useState2(null);
  const [bendHeld, setBendHeld] = useState2(null);
  const bendRef = useRef4(null);
  const [handTouch, setHandTouch] = useState2({});
  const [curvePoint, setCurvePoint] = useState2({});
  const [rampStop, setRampStop] = useState2({});
  const [hwHeld, setHwHeld] = useState2({});
  const [hwLatched, setHwLatched] = useState2({});
  const [held, setHeld] = useState2(null);
  const [latched, setLatched] = useState2({});
  const holdStart = useRef4(0);
  const [mounted, setMounted] = useState2(false);
  const fineRef = useRef4(null);
  const rangeHandleRef = useRef4("min");
  const filterHandRef = useRef4("cutoff");
  const [volume, setVolume] = useState2(() => MoveVolumeDisplay.get());
  const [liveValue, setLiveValue] = useState2(null);
  useEffect4(() => {
    setVolume(MoveVolumeDisplay.get());
    return MoveVolumeDisplay.subscribe(() => setVolume(MoveVolumeDisplay.get()));
  }, []);
  useEffect4(() => {
    const poll = volume?.getValue;
    if (!poll) {
      setLiveValue(null);
      return;
    }
    let raf = requestAnimationFrame(function tick() {
      setLiveValue(poll());
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [volume]);
  const onlyKey = Array.isArray(only) ? only.join(" ") : only;
  const read = useCallback(
    () => TweakStore.selectPanels(onlyKey === void 0 ? void 0 : onlyKey.split(" ")),
    [onlyKey]
  );
  useEffect4(() => {
    setMounted(true);
    setPanels(read());
    return TweakStore.subscribeGlobal(() => setPanels(read()));
  }, [read]);
  const pages = buildMovePages(panels);
  const modSettings = ModulationStore.getSettings();
  const settingsPanel = modSettings ? TweakStore.getPanel(modSettings.panelId) : void 0;
  const modLayout = settingsPanel ? ModulationStore.getSettingsLayout() : null;
  const page = settingsPanel ? buildModMovePage(settingsPanel, modLayout) : pages[Math.min(track, Math.max(0, pages.length - 1))];
  const pageId = page?.panel.id;
  const modSlot = modSettings ? ModulationStore.getSlot(modSettings.index) : null;
  const composition = modSlot?.type === "curve" ? curveComposition(modSlot.params) : null;
  const clipIndex = composition ? Math.min(composition.segments.length - 1, Math.max(0, Math.round(Number(modSlot.params.selected) || 0))) : 0;
  const previewPath = modLayout?.dials.find((d) => d.preview)?.path ?? null;
  const values = useSyncExternalStore(
    useCallback((cb) => pageId ? TweakStore.subscribe(pageId, cb) : () => {
    }, [pageId]),
    () => pageId ? TweakStore.getValues(pageId) : void 0,
    () => void 0
  );
  const [, bumpControlState] = useState2(0);
  useEffect4(
    () => pageId ? TweakStore.subscribeControlState(pageId, () => bumpControlState((n) => n + 1)) : void 0,
    [pageId]
  );
  useSyncExternalStore(
    useCallback((cb) => ModulationStore.subscribe(cb), []),
    () => ModulationStore.getVersion(),
    () => 0
  );
  const surface = useSyncExternalStore(
    useCallback((cb) => MoveSurfaceStore.subscribe(cb), []),
    () => MoveSurfaceStore.getState(),
    () => MoveSurfaceStore.getState()
  );
  useEffect4(() => {
    const forPage = (detail, map) => detail && detail.pageId === pageId ? map ?? {} : {};
    const onTouch = (e) => {
      const d = e.detail;
      setHandTouch(forPage(d, d?.touched));
    };
    const onOverride = (e) => {
      const d = e.detail;
      setHwHeld(forPage(d, d?.held));
      setHwLatched(forPage(d, d?.latched));
    };
    window.addEventListener(MOVE_TOUCH_EVENT, onTouch);
    window.addEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    return () => {
      window.removeEventListener(MOVE_TOUCH_EVENT, onTouch);
      window.removeEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    };
  }, [pageId]);
  const pagesRef = useRef4(pages);
  pagesRef.current = pages;
  const sawSettings = useRef4(false);
  useEffect4(() => {
    const onPage = (e) => {
      const id = e.detail?.pageId;
      if (id === MOD_SETTINGS_PANEL) {
        sawSettings.current = true;
        return;
      }
      if (sawSettings.current) {
        sawSettings.current = false;
        ModulationStore.closeSettings();
      }
      const i = pagesRef.current.findIndex((pg) => pg.panel.id === id);
      if (i >= 0) setTrack(i);
    };
    window.addEventListener(MOVE_PAGE_EVENT, onPage);
    return () => window.removeEventListener(MOVE_PAGE_EVENT, onPage);
  }, []);
  useEffect4(() => {
    setHeld(null);
    setLatched({});
  }, [pageId]);
  if (!mounted || typeof window === "undefined" || pages.length === 0 || !page || !values) return null;
  const dialPercent = (meta) => Math.round(normalizeDial(meta, values[meta.path]) * 100);
  const chipValue = (meta) => {
    if (isEnumDial(meta)) {
      const options = meta.options ?? [];
      return { num: String(enumOptionLabel(options[enumIndex(meta, values[meta.path])])) };
    }
    const n = Number(values[meta.path]);
    if (!Number.isFinite(n)) return { num: "" };
    if (meta.formatValue) return { num: meta.formatValue(n) };
    const num = Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString();
    return { num, unit: meta.unit };
  };
  const fineAnchor = (e, snapshot) => {
    if (e.shiftKey ? !fineRef.current?.shift : fineRef.current?.shift) {
      fineRef.current = { shift: e.shiftKey, x: e.clientX, y: e.clientY, v: snapshot() };
    }
    return fineRef.current;
  };
  const dialFromKeyboard = (e, meta) => {
    if (e.altKey || e.ctrlKey || e.metaKey || TweakStore.isDisabled(page.panel.id, meta.path)) return;
    const next = moveKeyboardValue(meta, values[meta.path], e.key, e.shiftKey);
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    armMod(meta.path);
    TweakStore.updateValue(page.panel.id, meta.path, next);
  };
  const dialFromPointer = (e, meta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const fine = fineAnchor(e, () => normalizeDial(meta, values[meta.path]));
    const v01 = fine ? fineDragValue({ startValue: fine.v, startPos: fine.x, pos: e.clientX, extentPx: span || 1, min: 0, max: 1, factor: fine.shift ? 0.1 : 1 }) : Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeDial(meta, v01));
  };
  const xyFromPointer = (e, meta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width - XY_INSET.left - XY_INSET.right;
    const h = rect.height - XY_INSET.top - XY_INSET.bottom;
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    const fine = fineAnchor(
      e,
      () => pointFromValue(normalizeValue(values[meta.path], xa, ya), xa, ya)
    );
    let px, py;
    if (fine) {
      const a = fine.v;
      const factor = fine.shift ? 0.1 : 1;
      px = fineDragValue({ startValue: a.x, startPos: fine.x, pos: e.clientX, extentPx: w || 1, min: 0, max: 1, factor });
      py = fineDragValue({ startValue: a.y, startPos: fine.y, pos: e.clientY, extentPx: h || 1, min: 0, max: 1, factor });
    } else {
      px = Math.min(1, Math.max(0, (e.clientX - rect.left - XY_INSET.left) / (w || 1)));
      py = Math.min(1, Math.max(0, (e.clientY - rect.top - XY_INSET.top) / (h || 1)));
    }
    const raw = valueFromPoint({ x: px, y: py }, xa, ya, !!meta.snap);
    const origin = pointFromValue(centerValue(xa, ya), xa, ya);
    TweakStore.updateValue(page.panel.id, meta.path, {
      x: applyDetentAxis(raw.x, xa, Math.abs(px - origin.x) * (w || 1)),
      y: applyDetentAxis(raw.y, ya, Math.abs(py - origin.y) * (h || 1))
    });
  };
  const transferFromPointer = (e, meta, down) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width - XY_INSET.left - XY_INSET.right;
    const h = rect.height - XY_INSET.top - XY_INSET.bottom;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left - XY_INSET.left) / (w || 1)));
    const y = 1 - Math.min(1, Math.max(0, (e.clientY - rect.top - XY_INSET.top) / (h || 1)));
    const points = normalizeTransfer(values[meta.path]).points;
    let index = curvePoint[meta.path] ?? 0;
    if (down) {
      const hit = nearestPoint(points, x, y, 0.18);
      index = hit >= 0 ? hit : index;
      setCurvePoint((prev) => ({ ...prev, [meta.path]: Math.min(index, points.length - 1) }));
    }
    index = Math.min(index, points.length - 1);
    TweakStore.updateValue(page.panel.id, meta.path, { points: movePoint(points, index, x, y) });
  };
  const needleFromPointer = (e, meta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const min = meta.min ?? 0, max = meta.max ?? 1;
    const wraps = meta.wrap ?? Math.abs(max - min) >= 360;
    const next = angleFromPointer(
      e.clientX - (rect.left + rect.width / 2),
      e.clientY - (rect.top + rect.height / 2),
      Number(values[meta.path] ?? min),
      min,
      max,
      meta.step ?? 1,
      wraps
    );
    if (next !== null) TweakStore.updateValue(page.panel.id, meta.path, next);
  };
  const rampFromPointer = (e, meta, down) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width - XY_INSET.left - XY_INSET.right;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left - XY_INSET.left) / (w || 1)));
    const g = normalizeGradient(values[meta.path]);
    let index = Math.min(rampStop[meta.path] ?? 0, g.stops.length - 1);
    if (down) {
      let best = 0;
      g.stops.forEach((st, i) => {
        if (Math.abs(st.position - x) < Math.abs(g.stops[best].position - x)) best = i;
      });
      index = best;
      setRampStop((prev) => ({ ...prev, [meta.path]: index }));
    }
    const lo = index > 0 ? g.stops[index - 1].position : 0;
    const hi = index < g.stops.length - 1 ? g.stops[index + 1].position : 1;
    const stops = g.stops.map((st, i) => i === index ? { ...st, position: Math.min(hi, Math.max(lo, x)) } : st);
    TweakStore.updateValue(page.panel.id, meta.path, { ...g, stops });
  };
  const xyRelease = (meta) => {
    setDragPath(null);
    fineRef.current = null;
    if (!meta.returnToCenter) return;
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    TweakStore.updateValue(page.panel.id, meta.path, normalizeValue(centerValue(xa, ya), xa, ya, !!meta.snap));
  };
  const rangeFromPointer = (e, meta, down) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const cur = normalizeRangeDial(meta, values[meta.path]);
    let p01 = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    if (down) rangeHandleRef.current = nearestHandle(p01, { min: cur.lo, max: cur.hi });
    const fine = fineAnchor(e, () => cur);
    if (fine) {
      const a = fine.v;
      p01 = fineDragValue({
        startValue: rangeHandleRef.current === "min" ? a.lo : a.hi,
        startPos: fine.x,
        pos: e.clientX,
        extentPx: span || 1,
        min: 0,
        max: 1,
        factor: fine.shift ? 0.1 : 1
      });
    }
    const next = rangeHandleRef.current === "min" ? { lo: Math.min(p01, cur.hi), hi: cur.hi } : { lo: cur.lo, hi: Math.max(p01, cur.lo) };
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeRangeDial(meta, next.lo, next.hi));
  };
  const filterFromPointer = (e, meta, down) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = rect.width / 2;
    if (down) filterHandRef.current = e.clientX - rect.left < half ? "cutoff" : "resonance";
    const hand = filterHandRef.current;
    const left = hand === "cutoff" ? rect.left + DIAL_TRACK_INSET : rect.left + half;
    const span = half - DIAL_TRACK_INSET;
    const cur = normalizeFilterDial(meta, values[meta.path]);
    const fine = fineAnchor(e, () => cur);
    let v01;
    if (fine) {
      const a = fine.v;
      v01 = fineDragValue({
        startValue: hand === "cutoff" ? a.cutoff : a.resonance,
        startPos: fine.x,
        pos: e.clientX,
        extentPx: span || 1,
        min: 0,
        max: 1,
        factor: fine.shift ? 0.1 : 1
      });
    } else {
      v01 = Math.min(1, Math.max(0, (e.clientX - left) / (span || 1)));
    }
    const next = hand === "cutoff" ? denormalizeFilterDial(meta, v01, cur.resonance) : denormalizeFilterDial(meta, cur.cutoff, v01);
    TweakStore.updateValue(page.panel.id, meta.path, next);
  };
  const enumFromPointer = (e, meta) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - DIAL_TRACK_INSET * 2;
    const v01 = Math.min(1, Math.max(0, (e.clientX - rect.left - DIAL_TRACK_INSET) / (span || 1)));
    TweakStore.updateValue(page.panel.id, meta.path, denormalizeEnumDial(meta, v01));
  };
  const dialReading = (meta) => {
    if (dialOrigin(meta) <= 0) return `${dialPercent(meta)}%`;
    const n = Number(values[meta.path]);
    if (!Number.isFinite(n)) return "";
    if (meta.formatValue) return meta.formatValue(n);
    const num = Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString();
    return n > 0 ? `+${num}` : num;
  };
  const rangeReading = (meta) => {
    const v = values[meta.path] ?? {};
    const fmt = (n) => {
      if (n == null || !Number.isFinite(n)) return "";
      if (meta.formatValue) return meta.formatValue(n);
      return Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString();
    };
    return `${fmt(v.min)}\u2013${fmt(v.max)}`;
  };
  const chipLatched = (col, meta) => latched[col]?.path === meta.path || !!hwLatched[meta.path];
  const armMod = (path) => ModulationStore.noteTouch(page.panel.id, path);
  const dialAt = (col) => {
    if (held && held.col === col) return held.meta;
    const hw = page.values[col];
    if (hw && hwHeld[hw.path]) return hw;
    if (latched[col]) return latched[col];
    if (hw && hwLatched[hw.path]) return hw;
    return page.dials[col];
  };
  const pressChip = (e, col, meta) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    holdStart.current = Date.now();
    armMod(meta.path);
    setHeld({ col, meta });
  };
  const releaseChip = (col, meta) => {
    setHeld(null);
    if (Date.now() - holdStart.current >= TAP_MS) return;
    const wasLatched = chipLatched(col, meta);
    setLatched((prev) => ({ ...prev, [col]: wasLatched ? void 0 : meta }));
    window.dispatchEvent(new CustomEvent(MOVE_LATCH_EVENT, {
      detail: { pageId: page.panel.id, path: meta.path, latched: !wasLatched }
    }));
  };
  const appRows = surface.rows;
  const padRows = movePadRows(page, appRows);
  const appRowAt = (row) => moveAppPadRow(row, appRows);
  const padAt = (x, y) => surface.pads.find((p) => p.x === x && p.y === y);
  const visibleCols = settingsPanel ? Array.from({ length: modPageWidth() }, (_, i) => i) : appRows > 0 ? Array.from({ length: MOVE_PADS }, (_, i) => i) : visibleColumns(page);
  const volumeReading = liveValue ?? volume?.value;
  const headerCluster = volume && /* @__PURE__ */ jsx6("div", { className: "tweakers-move-actions", children: /* @__PURE__ */ jsxs6("div", { className: "tweakers-move-volume", children: [
    /* @__PURE__ */ jsx6("span", { className: "tweakers-move-volume-tick", style: { background: MOVE_TRACK_COLORS[0] } }),
    volume.label && volumeReading != null && /* @__PURE__ */ jsx6("span", { className: "tweakers-move-volume-label", children: volume.label }),
    /* @__PURE__ */ jsx6("span", { className: "tweakers-move-volume-value", children: boldColons(volumeReading ?? volume.label ?? "") })
  ] }) });
  const content = /* @__PURE__ */ jsx6("div", { className: "tweakers-root tweakers-move-root", "data-theme": theme, "data-dock": dock, children: /* @__PURE__ */ jsxs6("div", { className: "tweakers-move", "data-dock": dock, "data-overlay": composition ? true : void 0, children: [
    composition && modSettings && /* @__PURE__ */ jsx6(
      MoveCurveComposer,
      {
        index: modSettings.index,
        segments: composition.segments,
        direction: composition.direction,
        gap: composition.gap ?? 0,
        selected: clipIndex
      }
    ),
    /* @__PURE__ */ jsxs6("div", { className: "tweakers-move-inner", style: { "--move-cols": visibleCols.length || MOVE_DIALS }, children: [
      /* @__PURE__ */ jsxs6("div", { className: "tweakers-move-tracks", children: [
        /* @__PURE__ */ jsx6("div", { className: "tweakers-move-tracks-group", children: pages.map((pg, i) => /* @__PURE__ */ jsxs6(
          "button",
          {
            className: "tweakers-move-track",
            "data-active": pg === page,
            onClick: () => {
              ModulationStore.closeSettings();
              setTrack(i);
              window.dispatchEvent(new CustomEvent(MOVE_PAGE_SELECT_EVENT, { detail: { pageId: pg.panel.id } }));
            },
            children: [
              /* @__PURE__ */ jsx6("span", { className: "tweakers-move-track-marker", style: { background: MOVE_TRACK_COLORS[i] } }),
              /* @__PURE__ */ jsx6("span", { className: "tweakers-move-track-label", children: pg.panel.name })
            ]
          },
          pg.panel.id
        )) }),
        /* @__PURE__ */ jsx6("div", { className: "tweakers-move-mods", children: surface.steps ? surface.steps.map((s) => /* @__PURE__ */ jsx6("span", { className: "tweakers-move-mod", title: `step ${s.step + 1}`, children: /* @__PURE__ */ jsx6(
          "span",
          {
            className: "tweakers-move-mod-dot",
            style: { background: s.color ?? "var(--move-text)", opacity: s.lit ? 1 : 0.25 }
          }
        ) }, s.step)) : ModulationStore.getSlots().map((slot) => /* @__PURE__ */ jsx6(MoveModCircle, { slot }, slot.index)) }),
        headerCluster
      ] }),
      visibleCols.length > 0 && /* @__PURE__ */ jsxs6("div", { className: "tweakers-move-grid", children: [
        /* @__PURE__ */ jsx6("div", { className: "tweakers-move-dials", children: visibleCols.map((i) => {
          if (isSpanContinuation(page, i)) return null;
          const meta = page.dials[i]?.type === "filter" ? page.dials[i] : dialAt(i);
          if (!meta) return /* @__PURE__ */ jsx6("div", { className: "tweakers-move-dial", "data-empty": "true" }, `empty-${i}`);
          const disabled = TweakStore.isDisabled(page.panel.id, meta.path);
          const active = dragPath === meta.path || !!handTouch[meta.path] || !!hwHeld[meta.path] || held !== null && held.col === i;
          const valueFirst = !!settingsPanel && !(meta.min === 0 && meta.max === 1);
          if (meta.type === "filter") {
            const fv = normalizeFilterValue(
              values[meta.path],
              resolveFilterAxis(meta.cutoffAxis, "cutoff"),
              resolveFilterAxis(meta.resonanceAxis, "resonance")
            );
            const shape = filterShapePath(meta, values[meta.path]);
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "filter",
                "data-active": active || void 0,
                "data-disabled": meta.filterEnabled === false || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  filterFromPointer(e, meta, true);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) filterFromPointer(e, meta, false);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(MoveSlotFilterBody, { meta, value: fv, shape })
                ]
              },
              meta.path
            );
          }
          if (meta.type === "gradient") {
            const g = normalizeGradient(values[meta.path]);
            const index = Math.min(rampStop[meta.path] ?? 0, g.stops.length - 1);
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "ramp",
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  rampFromPointer(e, meta, true);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) rampFromPointer(e, meta, false);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(
                    MoveSlotRampBody,
                    {
                      label: meta.label,
                      value: `${index + 1}/${g.stops.length}`,
                      css: rampCss(g.stops),
                      stop: g.stops[index]?.position ?? null
                    }
                  )
                ]
              },
              meta.path
            );
          }
          if (meta.type === "slider" && meta.display === "dial") {
            const min = meta.min ?? 0, max = meta.max ?? 1;
            const v = Number(values[meta.path] ?? min);
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "dial",
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  needleFromPointer(e, meta);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) needleFromPointer(e, meta);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(
                    MoveSlotDialBody,
                    {
                      label: meta.label,
                      value: `${Number(v.toFixed(2))}${meta.unit ?? (Math.abs(max - min) >= 180 ? "\xB0" : "")}`,
                      bearing: valueToBearing(v, min, max),
                      origin: valueToBearing(meta.origin ?? min, min, max)
                    }
                  )
                ]
              },
              meta.path
            );
          }
          if (meta.type === "transfer") {
            const points = normalizeTransfer(values[meta.path]).points;
            const index = Math.min(curvePoint[meta.path] ?? 0, points.length - 1);
            const held2 = points[index];
            const samples = Array.from({ length: 48 }, (_, k) => sampleTransfer(points, k / 47));
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "transfer",
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  transferFromPointer(e, meta, true);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) transferFromPointer(e, meta, false);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(
                    MoveSlotTransferBody,
                    {
                      label: meta.label,
                      value: `${index + 1}/${points.length}`,
                      shape: previewPathData(samples),
                      point: { x: held2.x, y: 1 - held2.y }
                    }
                  )
                ]
              },
              meta.path
            );
          }
          if (meta.type === "xy") {
            const xa = resolveAxis(meta.xAxis);
            const ya = resolveAxis(meta.yAxis);
            const pos = pointFromValue(
              normalizeValue(values[meta.path], xa, ya),
              xa,
              ya
            );
            const preview = meta.path === previewPath ? ModulationStore.getSettingsPreview() : null;
            const gridBase = meta.grid === false ? 0 : typeof meta.grid === "number" ? meta.grid : XY_GRID_DEFAULT;
            const gridN = gridBase > 0 ? Math.round(gridBase * Math.max(0, meta.density ?? 1)) : 0;
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "xy",
                "data-preview": preview ? true : void 0,
                "data-sub": valueFirst || void 0,
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  xyFromPointer(e, meta);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) xyFromPointer(e, meta);
                },
                onPointerUp: () => xyRelease(meta),
                onPointerCancel: () => xyRelease(meta),
                children: [
                  valueFirst && /* @__PURE__ */ jsx6("span", { className: "tweakers-move-dial-sub", children: meta.label }),
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(
                    MoveSlotXYBody,
                    {
                      label: meta.label,
                      value: preview ? preview.label : `${Math.round(pos.x * 100)}\xB7${Math.round((1 - pos.y) * 100)}`,
                      position: pos,
                      gridN,
                      shape: preview ? previewPathData(preview.points) : null
                    }
                  )
                ]
              },
              meta.path
            );
          }
          if (meta.type === "range") {
            const pos = normalizeRangeDial(meta, values[meta.path]);
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "range",
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  rangeFromPointer(e, meta, true);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) rangeFromPointer(e, meta, false);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(MoveSlotRangeBody, { label: meta.label, value: rangeReading(meta), lo: pos.lo, hi: pos.hi })
                ]
              },
              meta.path
            );
          }
          if (isEnumDial(meta)) {
            const options = meta.options ?? [];
            const activeIdx = enumIndex(meta, values[meta.path]);
            const option = options[activeIdx];
            const optionLabel = enumOptionLabel(option);
            const shape = enumShapePath(meta, values[meta.path]);
            const glyph = enumOptionIcon(option);
            const playback = movePlaybackMode(meta, values[meta.path]);
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "enum",
                "data-visual": playback ? "playback" : void 0,
                role: "slider",
                tabIndex: disabled ? -1 : 0,
                "aria-label": meta.label,
                "aria-valuemin": 0,
                "aria-valuemax": Math.max(0, options.length - 1),
                "aria-valuenow": activeIdx,
                "aria-valuetext": optionLabel,
                "aria-orientation": "horizontal",
                "aria-disabled": disabled || void 0,
                "data-disabled": disabled || void 0,
                onKeyDown: (e) => dialFromKeyboard(e, meta),
                "data-shape": shape ? true : void 0,
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  if (TweakStore.isDisabled(page.panel.id, meta.path)) return;
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  enumFromPointer(e, meta);
                },
                onPointerMove: (e) => {
                  if (!TweakStore.isDisabled(page.panel.id, meta.path) && dragPath === meta.path) enumFromPointer(e, meta);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(
                    MoveSlotEnumBody,
                    {
                      label: meta.label,
                      optionLabel,
                      options,
                      activeIdx,
                      shape,
                      glyph,
                      playback
                    }
                  )
                ]
              },
              meta.path
            );
          }
          if (meta.type === "toggle") {
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "toggle",
                "data-on": !!values[meta.path] || void 0,
                onClick: () => TweakStore.updateValue(page.panel.id, meta.path, !values[meta.path]),
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(MoveSlotToggleBody, { label: meta.label, on: !!values[meta.path] })
                ]
              },
              meta.path
            );
          }
          const scopeSlot = settingsPanel ? modLayout?.dials.find((d) => d.path === meta.path)?.scope : void 0;
          if (scopeSlot && modSettings) {
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "scope",
                "data-active": active || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  fineRef.current = null;
                  setDragPath(meta.path);
                  armMod(meta.path);
                  dialFromPointer(e, meta);
                },
                onPointerMove: (e) => {
                  if (dragPath === meta.path) dialFromPointer(e, meta);
                },
                onPointerUp: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                onPointerCancel: () => {
                  setDragPath(null);
                  fineRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                  /* @__PURE__ */ jsx6(
                    MoveSlotScopeBody,
                    {
                      label: meta.label,
                      value: chipValue(meta).num + (meta.unit ? ` ${meta.unit}` : ""),
                      pct: dialPercent(meta),
                      children: /* @__PURE__ */ jsx6(MoveScope, { index: modSettings.index })
                    }
                  )
                ]
              },
              meta.path
            );
          }
          const envStage = settingsPanel ? modLayout?.dials.find((d) => d.path === meta.path)?.stage : void 0;
          if (envStage) {
            const stageDials = (modLayout?.dials ?? []).filter((d) => d.stage).flatMap((d) => {
              const m = page.dials.find((x) => x?.path === d.path);
              return m ? [{ stage: d.stage, meta: m }] : [];
            });
            if (stageDials[0]?.meta.path !== meta.path) return null;
            const envParams = {
              attack: Number(values.attack) || 0,
              decay: Number(values.decay) || 0,
              sustain: Number(values.sustain) || 0,
              release: Number(values.release) || 0,
              attackCurve: Number(modSlot?.params.attackCurve) || 0,
              decayCurve: Number(modSlot?.params.decayCurve) || 0,
              releaseCurve: Number(modSlot?.params.releaseCurve) || 0
            };
            const envActive = stageDials.some(
              (s) => dragPath === s.meta.path || !!handTouch[s.meta.path] || !!hwHeld[s.meta.path]
            );
            const reading = (m) => {
              const v = chipValue(m);
              return `${v.num}${v.unit ? ` ${v.unit}` : ""}`;
            };
            return /* @__PURE__ */ jsxs6(
              "div",
              {
                className: "tweakers-move-dial",
                "data-kind": "env",
                "data-active": envActive || void 0,
                style: { gridColumn: `span ${stageDials.length}` },
                children: [
                  /* @__PURE__ */ jsx6(
                    MoveSlotEnvBody,
                    {
                      points: envelopePoints(envParams, 129),
                      stages: stageDials.map((s) => ({ stage: s.stage, label: s.meta.label, value: reading(s.meta) })),
                      joints: envelopeJoints(envParams).map((j) => ({ ...j, held: bendHeld === j.stage }))
                    }
                  ),
                  /* @__PURE__ */ jsx6("div", { className: "tweakers-move-env-zones", children: stageDials.map(({ meta: m }) => /* @__PURE__ */ jsx6(
                    "div",
                    {
                      className: "tweakers-move-env-zone",
                      onPointerDown: (e) => {
                        try {
                          e.currentTarget.setPointerCapture(e.pointerId);
                        } catch {
                        }
                        fineRef.current = null;
                        setDragPath(m.path);
                        armMod(m.path);
                        dialFromPointer(e, m);
                      },
                      onPointerMove: (e) => {
                        if (dragPath === m.path) dialFromPointer(e, m);
                      },
                      onPointerUp: () => {
                        setDragPath(null);
                        fineRef.current = null;
                      },
                      onPointerCancel: () => {
                        setDragPath(null);
                        fineRef.current = null;
                      },
                      children: /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: m.path })
                    },
                    m.path
                  )) })
                ]
              },
              meta.path
            );
          }
          const latchedHere = latched[i]?.path === meta.path || page.values[i]?.path === meta.path && !!hwLatched[meta.path];
          const origin01 = dialOrigin(meta);
          const originPct = origin01 > 0 ? origin01 * 100 : null;
          const pct = dialPercent(meta);
          const atOrigin = originPct != null && Math.abs(normalizeDial(meta, values[meta.path]) - origin01) < 1e-6;
          const drawing = moveNumericDrawing(meta, values[meta.path]);
          const subbed = meta !== page.dials[i];
          const subValue = subbed || valueFirst ? chipValue(meta) : null;
          return /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "tweakers-move-dial",
              "data-active": active || void 0,
              "data-latched": latchedHere || void 0,
              "data-sub": !drawing && (subbed || valueFirst) || void 0,
              "data-visual": drawing?.kind,
              role: "slider",
              tabIndex: disabled ? -1 : 0,
              "aria-label": meta.label,
              "aria-valuemin": meta.min ?? 0,
              "aria-valuemax": meta.max ?? 1,
              "aria-valuenow": Number(values[meta.path]),
              "aria-valuetext": moveVisualReading(meta, Number(values[meta.path])),
              "aria-orientation": "horizontal",
              "aria-disabled": disabled || void 0,
              "data-disabled": disabled || void 0,
              onKeyDown: (e) => dialFromKeyboard(e, meta),
              onPointerDown: (e) => {
                if (TweakStore.isDisabled(page.panel.id, meta.path)) return;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                }
                fineRef.current = null;
                setDragPath(meta.path);
                armMod(meta.path);
                dialFromPointer(e, meta);
              },
              onPointerMove: (e) => {
                if (!TweakStore.isDisabled(page.panel.id, meta.path) && dragPath === meta.path) dialFromPointer(e, meta);
              },
              onPointerUp: () => {
                setDragPath(null);
                fineRef.current = null;
              },
              onPointerCancel: () => {
                setDragPath(null);
                fineRef.current = null;
              },
              children: [
                !drawing && (subbed || valueFirst) && /* @__PURE__ */ jsx6("span", { className: "tweakers-move-dial-sub", children: meta.label }),
                /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                drawing ? /* @__PURE__ */ jsx6(MoveSlotNumericBody, { label: meta.label, value: moveVisualReading(meta, Number(values[meta.path])), drawing }) : /* @__PURE__ */ jsx6(
                  MoveSlotDefaultBody,
                  {
                    label: meta.label,
                    value: subValue ? `${subValue.num}${subValue.unit ? ` ${subValue.unit}` : ""}` : dialReading(meta),
                    pct,
                    originPct,
                    atOrigin
                  }
                )
              ]
            },
            meta.path
          );
        }) }),
        Array.from({ length: PAD_ROWS }, (_, row) => row).filter((row) => appRowAt(row) !== null || padRows.slice(row).some((r) => r.length > 0)).map((row) => /* @__PURE__ */ jsx6("div", { className: "tweakers-move-pads", children: visibleCols.map((col) => {
          const appRow = appRowAt(row);
          if (appRow !== null) {
            const cell = padAt(col, appRow);
            if (!cell || cell.empty) {
              return /* @__PURE__ */ jsx6("div", { className: "tweakers-move-pad", "data-empty": "true" }, `app-${col}`);
            }
            return /* @__PURE__ */ jsxs6(
              "button",
              {
                className: "tweakers-move-pad",
                "data-kind": "app",
                "data-on": cell.lit || void 0,
                onClick: () => MoveSurfaceStore.press(col, appRow),
                children: [
                  /* @__PURE__ */ jsx6(
                    "span",
                    {
                      className: "tweakers-move-pad-indicator",
                      style: cell.color ? { background: cell.color } : void 0
                    }
                  ),
                  cell.label && /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-title", children: cell.label })
                ]
              },
              `app-${col}`
            );
          }
          const meta = padRows[row][col];
          const bendStage = !meta && settingsPanel && padRows[row] === page.toggles && modSettings ? modLayout?.dials[col]?.stage : void 0;
          if (bendStage && ENV_BEND_STAGES.includes(bendStage)) {
            return /* @__PURE__ */ jsxs6(
              "button",
              {
                className: "tweakers-move-pad",
                "data-kind": "bend",
                "data-on": bendHeld === bendStage || void 0,
                onPointerDown: (e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                  }
                  setBendHeld(bendStage);
                  bendRef.current = {
                    y: e.clientY,
                    curve: Number(modSlot?.params[envCurveParam(bendStage)]) || 0
                  };
                },
                onPointerMove: (e) => {
                  if (bendHeld !== bendStage || !bendRef.current) return;
                  const v = Math.min(1, Math.max(
                    -1,
                    bendRef.current.curve + (bendRef.current.y - e.clientY) / 60
                  ));
                  ModulationStore.updateSlotParams(modSettings.index, { [envCurveParam(bendStage)]: v });
                },
                onPointerUp: () => {
                  setBendHeld(null);
                  bendRef.current = null;
                },
                onPointerCancel: () => {
                  setBendHeld(null);
                  bendRef.current = null;
                },
                children: [
                  /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-indicator" }),
                  /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-title", children: "Curve" })
                ]
              },
              `bend-${bendStage}`
            );
          }
          if (!meta) return /* @__PURE__ */ jsx6("div", { className: "tweakers-move-pad", "data-empty": "true" }, `empty-${col}`);
          if (padRows[row] === page.toggles) {
            return /* @__PURE__ */ jsxs6(
              "button",
              {
                className: "tweakers-move-pad",
                "data-kind": "toggle",
                "data-on": !!values[meta.path],
                onClick: () => TweakStore.updateValue(page.panel.id, meta.path, !values[meta.path]),
                children: [
                  /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-indicator" }),
                  /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-title", children: meta.label })
                ]
              },
              meta.path
            );
          }
          if (padRows[row] === page.actions) {
            return /* @__PURE__ */ jsx6(
              "button",
              {
                className: "tweakers-move-pad",
                "data-kind": "action",
                onClick: () => TweakStore.triggerAction(page.panel.id, meta.path),
                children: /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-title", children: meta.label })
              },
              meta.path
            );
          }
          const value = chipValue(meta);
          return /* @__PURE__ */ jsxs6(
            "button",
            {
              className: "tweakers-move-pad",
              "data-kind": "value",
              "data-held": held !== null && held.meta.path === meta.path || hwHeld[meta.path] || void 0,
              "data-latched": chipLatched(col, meta) || void 0,
              onPointerDown: (e) => pressChip(e, col, meta),
              onPointerUp: () => releaseChip(col, meta),
              onPointerCancel: () => setHeld(null),
              children: [
                /* @__PURE__ */ jsx6(MoveModRing, { panelId: page.panel.id, path: meta.path, pad: true }),
                /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-title", children: meta.label }),
                /* @__PURE__ */ jsxs6("span", { className: "tweakers-move-pad-reading", children: [
                  /* @__PURE__ */ jsx6("span", { className: "tweakers-move-pad-number", children: value.num }),
                  value.unit && /* @__PURE__ */ jsx6("span", { children: value.unit })
                ] })
              ]
            },
            meta.path
          );
        }) }, row))
      ] })
    ] })
  ] }) });
  return dock === "flow" ? content : createPortal(content, document.body);
}
function previewPathData(points) {
  if (points.length < 2) return "";
  return points.map((v, i) => `${i ? "L" : "M"} ${(i / (points.length - 1) * 100).toFixed(2)} ${((1 - v) * 100).toFixed(2)}`).join(" ");
}
var MOVE_CURVE_WIDTH = 320;
var MOVE_CURVE_HEIGHT = 84;
function MoveCurveComposer({
  index,
  segments,
  direction,
  gap,
  selected
}) {
  return /* @__PURE__ */ jsx6("div", { className: "tweakers-move-curve", children: /* @__PURE__ */ jsx6(
    CurveComposer,
    {
      segments,
      direction,
      gap,
      selectedIndex: selected,
      getPhase: () => ModulationStore.getSlotPhase(index),
      onSelect: (i) => ModulationStore.updateSlotParams(index, { selected: i }),
      onSegmentsChange: (next) => ModulationStore.updateSlotParams(index, { clips: next }),
      width: MOVE_CURVE_WIDTH,
      height: MOVE_CURVE_HEIGHT
    }
  ) });
}
var SCOPE_SAMPLES = 120;
function MoveScope({ index }) {
  const ref = useRef4(null);
  useEffect4(() => {
    const now = (ModulationStore.getSignal(index) + 1) / 2;
    const pts = Array(SCOPE_SAMPLES).fill(now);
    let raf = requestAnimationFrame(function tick() {
      pts.push((ModulationStore.getSignal(index) + 1) / 2);
      pts.shift();
      ref.current?.setAttribute("d", previewPathData(pts));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);
  return /* @__PURE__ */ jsx6(
    "svg",
    {
      className: "tweakers-move-scope-wave",
      "data-scope": "true",
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx6("path", { ref })
    }
  );
}
function MoveModCircle({ slot }) {
  const dotRef = useRef4(null);
  const pressAt = useRef4(0);
  useEffect4(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    return ModulationStore.subscribeFrames(() => {
      const el = dotRef.current;
      if (!el) return;
      const level = (ModulationStore.getSignal(slot.index) + 1) / 2;
      el.style.transform = `scale(${(0.66 + 0.34 * level).toFixed(3)})`;
    });
  }, [slot.index]);
  return /* @__PURE__ */ jsx6(
    "button",
    {
      type: "button",
      className: "tweakers-move-mod",
      title: `${slot.type.toUpperCase()} \xB7 step ${slot.index + 1}`,
      onPointerDown: () => {
        pressAt.current = Date.now();
      },
      onPointerUp: () => {
        const tapped = Date.now() - pressAt.current < TAP_MS;
        if (tapped && ModulationStore.assignFromStep(slot.index).action !== "none") return;
        const open = ModulationStore.getSettings();
        if (tapped && open && open.index === slot.index) ModulationStore.closeSettings();
        else ModulationStore.openSettings(slot.index);
      },
      children: /* @__PURE__ */ jsx6(
        "span",
        {
          ref: dotRef,
          className: "tweakers-move-mod-dot",
          style: { background: modColor(slot.index) }
        }
      )
    }
  );
}

// src/components/MoveActionButton.tsx
import { useEffect as useEffect5, useRef as useRef5, useState as useState3 } from "react";

// src/move-functions.ts
var MOVE_FUNCTION_MANIFEST = [
  { name: "play" },
  { name: "rec" },
  { name: "mute" },
  { name: "undo" },
  { name: "copy" },
  { name: "delete" },
  { name: "up" },
  { name: "down" },
  { name: "left" },
  { name: "right" },
  { name: "sample", special: true },
  { name: "loop", special: true },
  { name: "capture", special: true },
  { name: "menu", special: true },
  { name: "back", special: true },
  { name: "jog_click", special: true }
];
var MOVE_FUNCTION_BUTTONS = MOVE_FUNCTION_MANIFEST.map((b) => b.name);
var MOVE_SPECIAL_BUTTONS = MOVE_FUNCTION_MANIFEST.filter((b) => "special" in b && b.special).map((b) => b.name);
var MoveFunctionsClass = class {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
    this.labels = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    this.runListeners = /* @__PURE__ */ new Set();
  }
  /**
   * Attach an action to a function button; returns a detach function.
   * One action per button — attaching again replaces the previous one.
   */
  attach(name, handler, options) {
    if (!MOVE_FUNCTION_BUTTONS.includes(name)) {
      console.warn(`[tweakers] "${name}" is not a Move function button; expected one of: ${MOVE_FUNCTION_BUTTONS.join(", ")}`);
      return () => {
      };
    }
    this.handlers.set(name, handler);
    if (options?.label != null) this.labels.set(name, options.label);
    else this.labels.delete(name);
    this.notify();
    return () => {
      if (this.handlers.get(name) === handler) {
        this.handlers.delete(name);
        this.labels.delete(name);
        this.notify();
      }
    };
  }
  /** The attached button names — what the kit claims on the hardware. */
  list() {
    return [...this.handlers.keys()];
  }
  /** The screen name an attachment carries, if any. */
  label(name) {
    return this.labels.get(name);
  }
  /** Run the action attached to a button, if any. Called by the kit per press. */
  run(name, press) {
    const full = { name, shift: !!press?.shift };
    this.handlers.get(name)?.(full);
    for (const l of this.runListeners) l(name, full);
  }
  /** Notified when attachments change, so the kit can reconfigure the Move. */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /** Notified on every run — the MovePanel flashes its pills on hardware presses. */
  subscribeRuns(listener) {
    this.runListeners.add(listener);
    return () => this.runListeners.delete(listener);
  }
  notify() {
    for (const l of this.listeners) l();
  }
};
var MoveFunctions = new MoveFunctionsClass();

// src/components/MoveActionButton.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var PRESS_FLASH_MS = 160;
var KIND_FUNCTION = {
  enter: "jog_click",
  capture: "capture"
};
function MoveActionButton({ kind, children, onPress, disabled, className }) {
  const name = kind === "shift" ? null : KIND_FUNCTION[kind];
  const [pressed, setPressed] = useState3(false);
  const flashTimer = useRef5(void 0);
  const flash = () => {
    setPressed(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS);
  };
  useEffect5(() => {
    if (!name) return () => clearTimeout(flashTimer.current);
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran === name) flash();
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [name]);
  return /* @__PURE__ */ jsxs7(
    "button",
    {
      className: className ? `tweakers-move-action ${className}` : "tweakers-move-action",
      "data-kind": kind,
      "data-pressed": pressed || void 0,
      disabled,
      onClick: () => {
        if (disabled) return;
        if (name) MoveFunctions.run(name, { name, shift: false });
        else flash();
        onPress?.();
      },
      children: [
        kind === "capture" ? /* @__PURE__ */ jsx7("svg", { className: "tweakers-move-action-icon", width: "14", height: "14", viewBox: ICON_MOVE_CAPTURE.viewBox, fill: "none", children: /* @__PURE__ */ jsx7("path", { d: ICON_MOVE_CAPTURE.path, fill: "currentColor" }) }) : (
          // Enter and shift share the dot: it is drawn with currentColor, so it
          // comes out light-on-green on the enter pill and black on the light
          // shift pill without a second asset.
          /* @__PURE__ */ jsx7("svg", { className: "tweakers-move-action-icon", width: "12", height: "12", viewBox: ICON_MOVE_ENTER.viewBox, fill: "none", children: /* @__PURE__ */ jsx7("circle", { ...ICON_MOVE_ENTER.circle, fill: "currentColor" }) })
        ),
        children
      ]
    }
  );
}

// src/components/MoveWaveform.tsx
import { useCallback as useCallback2, useEffect as useEffect7, useRef as useRef7, useState as useState5, useSyncExternalStore as useSyncExternalStore2 } from "react";
import { createPortal as createPortal2 } from "react-dom";

// src/components/WaveformVisualization.tsx
import { useRef as useRef6, useEffect as useEffect6, useState as useState4 } from "react";

// src/waveform-dsp.ts
function mixToMono(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const len = buffer.length;
  const out = new Float32Array(len);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) out[i] += data[i] / buffer.numberOfChannels;
  }
  return out;
}
function fillPeaks(data, cols, min, max) {
  const step = data.length / cols;
  for (let x = 0; x < cols; x++) {
    const start = Math.floor(x * step);
    const end = Math.max(start + 1, Math.min(data.length, Math.floor((x + 1) * step)));
    let mn = 1;
    let mx = -1;
    for (let i = start; i < end; i++) {
      const v = data[i];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    min[x] = mn;
    max[x] = mx;
  }
}
function envelope(p, cols, n) {
  const out = new Array(n);
  const seg = cols / n;
  for (let k = 0; k < n; k++) {
    const start = Math.floor(k * seg);
    const end = Math.max(start + 1, Math.min(cols, Math.floor((k + 1) * seg)));
    let a = 0;
    for (let x = start; x < end; x++) {
      const m = Math.max(Math.abs(p.min[x]), Math.abs(p.max[x]));
      if (m > a) a = m;
    }
    out[k] = a;
  }
  return out;
}

// src/waveform-engine.ts
var WAVEFORM_MAX_ZOOM = 8;
var BANDS = [
  { type: "lowpass", freq: 250 },
  { type: "bandpass", freq: 1100, q: 0.6 },
  { type: "highpass", freq: 4200 }
];
var BAND_COLORS = ["#a855f7", "#22d3ee", "#a3e635"];
var SIMPLE_POINTS = 46;
var BORDER_FILL_ALPHA = 0.2;
var DRAG_THRESHOLD2 = 3;
var EDGE_HIT2 = 6;
var MIN_LOOP = 1e-3;
function smoothThrough(ctx, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y
    );
  }
}
async function filterBuffer(buffer, band) {
  const off = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const src = off.createBufferSource();
  src.buffer = buffer;
  const filter = off.createBiquadFilter();
  filter.type = band.type;
  filter.frequency.value = band.freq;
  if (band.q != null) filter.Q.value = band.q;
  src.connect(filter);
  filter.connect(off.destination);
  src.start();
  return off.startRendering();
}
function createWaveformEngine(canvas, get) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {
  } };
  const readDpr = () => Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
  let dpr = readDpr();
  let W = 0;
  let H = 0;
  let cy = 0;
  let amp = 0;
  let pk = { min: new Float32Array(1), max: new Float32Array(1) };
  const syncSize = (width, height) => {
    dpr = readDpr();
    const nw = Math.round(width * dpr);
    const nh = Math.round(height * dpr);
    if (nw === W && nh === H) return;
    W = canvas.width = nw;
    H = canvas.height = nh;
    cy = H / 2;
    amp = H * 0.42;
    pk = { min: new Float32Array(W), max: new Float32Array(W) };
  };
  let monos = [];
  let monoToken = 0;
  let lastBuffer;
  let lastBands = false;
  const syncMonos = (buffer, bands) => {
    if (buffer === lastBuffer && bands === lastBands) return;
    lastBuffer = buffer;
    lastBands = bands;
    const token = ++monoToken;
    if (!buffer) {
      monos = [];
      return;
    }
    if (!bands) {
      monos = [mixToMono(buffer)];
      return;
    }
    (async () => {
      try {
        const bufs = await Promise.all(BANDS.map((b) => filterBuffer(buffer, b)));
        if (token !== monoToken) return;
        monos = bufs.map((b) => mixToMono(b));
      } catch {
      }
    })();
  };
  const columnWidth = (pixelSize) => Math.max(1, Math.round(dpr) * Math.max(1, Math.round(pixelSize)));
  const windowState = { start: 0, win: 1 };
  let drag = null;
  const drawColumns = (p, color, pixelSize) => {
    const colW = columnWidth(pixelSize);
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    for (let x = 0; x < W; x += colW) {
      let mn = 1;
      let mx = -1;
      for (let i = x; i < x + colW && i < W; i++) {
        if (p.min[i] < mn) mn = p.min[i];
        if (p.max[i] > mx) mx = p.max[i];
      }
      const yTop = Math.round(cy - mx * amp);
      const yBot = Math.round(cy - mn * amp);
      ctx.fillRect(x, yTop, colW, Math.max(1, yBot - yTop));
    }
  };
  const drawSimplified = (env, color, outline) => {
    const n = env.length;
    if (n < 2) return;
    const px = (k) => k / (n - 1) * W;
    const top = env.map((a, k) => ({ x: px(k), y: cy - a * amp }));
    const bot = [];
    for (let k = n - 1; k >= 0; k--) bot.push({ x: px(k), y: cy + env[k] * amp });
    ctx.beginPath();
    ctx.moveTo(top[0].x, top[0].y);
    smoothThrough(ctx, top);
    ctx.lineTo(bot[0].x, bot[0].y);
    smoothThrough(ctx, bot);
    ctx.closePath();
    ctx.fillStyle = color;
    if (outline) {
      ctx.globalAlpha = BORDER_FILL_ALPHA;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6 * dpr;
      ctx.lineJoin = "round";
      ctx.stroke();
    } else {
      ctx.globalAlpha = 1;
      ctx.fill();
    }
  };
  const drawGrid = (base, subs) => {
    const n = Math.max(1, Math.round(subs));
    ctx.strokeStyle = base;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = dpr;
    ctx.beginPath();
    for (let i = 1; i < n; i++) {
      const x = Math.round(i / n * W) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  const drawRegion = (a, b, start, win, color) => {
    const x0 = (a - start) / win * W;
    const x1 = (b - start) / win * W;
    const cx0 = Math.max(0, x0);
    const cx1 = Math.min(W, x1);
    if (cx1 <= cx0) return;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(cx0, 0, cx1 - cx0, H);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = dpr;
    ctx.strokeStyle = color;
    ctx.beginPath();
    if (x0 >= 0 && x0 <= W) {
      const xe = Math.round(x0) + 0.5;
      ctx.moveTo(xe, 0);
      ctx.lineTo(xe, H);
    }
    if (x1 >= 0 && x1 <= W) {
      const xe = Math.round(x1) + 0.5;
      ctx.moveTo(xe, 0);
      ctx.lineTo(xe, H);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const rt = get();
    syncSize(rt.width, rt.height);
    syncMonos(rt.buffer, rt.bands);
    const base = getComputedStyle(canvas).color || "rgb(255,255,255)";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = rt.mode === "smooth";
    if (rt.grid) drawGrid(base, rt.gridSubdivisions);
    ctx.strokeStyle = base;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = dpr;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(cy) + 0.5);
    ctx.lineTo(W, Math.round(cy) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const wave = rt.waveColor || base;
    const ph = rt.playheadColor || base;
    const prog = Math.max(0, Math.min(1, (rt.getProgress ? rt.getProgress() : rt.progress) || 0));
    let win;
    let start;
    const activeLoop = rt.autoZoomOnLoop ? rt.loop : null;
    if (activeLoop) {
      const span = Math.max(1e-4, activeLoop.end - activeLoop.start);
      win = Math.min(1, Math.max(1 / WAVEFORM_MAX_ZOOM, span * 1.2));
      start = (activeLoop.start + activeLoop.end) / 2 - win / 2;
    } else {
      win = 1 / Math.max(1, rt.zoom);
      start = prog - win / 2;
    }
    if (start < 0) start = 0;
    else if (start > 1 - win) start = 1 - win;
    const end = start + win;
    windowState.start = start;
    windowState.win = win;
    const count = monos.length;
    if (count) {
      for (let i = 0; i < count; i++) {
        const mono = monos[i];
        const s0 = Math.max(0, Math.floor(start * mono.length));
        const s1 = Math.min(mono.length, Math.ceil(end * mono.length));
        const slice = s1 > s0 ? mono.subarray(s0, s1) : mono;
        fillPeaks(slice, W, pk.min, pk.max);
        const color = count === 3 ? BAND_COLORS[i] : wave;
        if (rt.mode === "pixelated") drawColumns(pk, color, rt.pixelSize);
        else drawSimplified(envelope(pk, W, SIMPLE_POINTS), color, rt.border);
      }
    }
    if (drag && drag.moved) {
      drawRegion(Math.min(drag.anchor, drag.curProg), Math.max(drag.anchor, drag.curProg), start, win, ph);
    } else if (rt.loop) {
      drawRegion(rt.loop.start, rt.loop.end, start, win, ph);
    }
    if (count) {
      const playX = (prog - start) / win * W;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ph;
      ctx.lineWidth = 1.5 * dpr;
      const cxp = Math.round(Math.max(0, Math.min(W, playX))) + 0.5;
      ctx.beginPath();
      ctx.moveTo(cxp, 0);
      ctx.lineTo(cxp, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  const xToProgress = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const { start, win } = windowState;
    return Math.min(1, Math.max(0, start + fx * win));
  };
  const edgeAt = (clientX) => {
    const rt = get();
    const loop = rt.loop;
    if (!loop || !rt.onLoopChange) return null;
    const rect = canvas.getBoundingClientRect();
    const { start, win } = windowState;
    const xOf = (t) => (t - start) / win * rect.width;
    const px = clientX - rect.left;
    const sx = xOf(loop.start);
    const ex = xOf(loop.end);
    const dS = Math.abs(px - sx);
    const dE = Math.abs(px - ex);
    if (dS <= EDGE_HIT2 && dS <= dE && sx >= 0 && sx <= rect.width) return "start";
    if (dE <= EDGE_HIT2 && ex >= 0 && ex <= rect.width) return "end";
    return null;
  };
  const setCursor = (c) => {
    canvas.style.cursor = c;
  };
  const onPointerDown = (e) => {
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
    }
    const p = xToProgress(e.clientX);
    const edge = edgeAt(e.clientX);
    if (edge && rt.loop) {
      const anchor = edge === "start" ? rt.loop.end : rt.loop.start;
      drag = { mode: "resize", anchor, curProg: p, startX: e.clientX, moved: false };
      setCursor("ew-resize");
    } else {
      drag = { mode: "create", anchor: p, curProg: p, startX: e.clientX, moved: false };
    }
  };
  const onPointerMove = (e) => {
    if (drag) {
      drag.curProg = xToProgress(e.clientX);
      if (Math.abs(e.clientX - drag.startX) > DRAG_THRESHOLD2) drag.moved = true;
      return;
    }
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    setCursor(edgeAt(e.clientX) ? "ew-resize" : "crosshair");
  };
  const onPointerUp = (e) => {
    const d = drag;
    drag = null;
    if (!d) return;
    try {
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    } catch {
    }
    setCursor("crosshair");
    const rt = get();
    const a = Math.min(d.anchor, d.curProg);
    const b = Math.max(d.anchor, d.curProg);
    const wide = b - a >= MIN_LOOP;
    if (d.mode === "resize") {
      if (d.moved && wide) rt.onLoopChange?.({ start: a, end: b });
    } else if (d.moved && wide) {
      if (rt.onLoopChange) rt.onLoopChange({ start: a, end: b });
      else rt.onSeek?.(d.curProg);
    } else {
      rt.onSeek?.(d.anchor);
      if (rt.loop && rt.onLoopChange) rt.onLoopChange(null);
    }
  };
  const onPointerCancel = () => {
    drag = null;
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("lostpointercapture", onPointerCancel);
  const rt0 = get();
  if (rt0.onSeek || rt0.onLoopChange) {
    canvas.style.cursor = "crosshair";
    canvas.style.touchAction = "none";
  }
  frame();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      monoToken++;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("lostpointercapture", onPointerCancel);
    }
  };
}

// src/components/WaveformVisualization.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function WaveformVisualization({
  buffer = null,
  progress = 0,
  getProgress,
  mode = "smooth",
  border = false,
  bands = false,
  pixelSize = 1,
  grid = false,
  gridSubdivisions = 8,
  onSeek,
  loop = null,
  onLoopChange,
  waveColor,
  playheadColor,
  autoZoomOnLoop = false,
  zoom: zoomProp,
  width = 256,
  height = 140
}) {
  const canvasRef = useRef6(null);
  const [ownZoom, setOwnZoom] = useState4(1);
  const controlled = zoomProp !== void 0;
  const zoom = controlled ? Math.max(1, zoomProp) : ownZoom;
  const setZoom = setOwnZoom;
  const runtimeRef = useRef6(null);
  runtimeRef.current = {
    buffer,
    progress,
    getProgress,
    mode,
    border,
    bands,
    pixelSize,
    grid,
    gridSubdivisions,
    waveColor,
    playheadColor,
    autoZoomOnLoop,
    loop,
    zoom,
    width,
    height,
    onSeek,
    onLoopChange
  };
  useEffect6(() => {
    if (!canvasRef.current) return;
    const engine = createWaveformEngine(canvasRef.current, () => runtimeRef.current);
    return () => engine.destroy();
  }, []);
  const atMaxZoom = zoom >= WAVEFORM_MAX_ZOOM;
  const framingLoop = autoZoomOnLoop && !!loop || controlled;
  return /* @__PURE__ */ jsxs8("div", { className: "tweakers-waveform-viz-wrap", style: { width }, children: [
    /* @__PURE__ */ jsx8("canvas", { ref: canvasRef, className: "tweakers-waveform-viz", style: { width, height } }),
    !framingLoop && /* @__PURE__ */ jsxs8("div", { className: "tweakers-waveform-zoom", children: [
      zoom > 1 && /* @__PURE__ */ jsx8("button", { type: "button", "aria-label": "Zoom out", onClick: () => setZoom((z) => Math.max(1, z / 2)), children: /* @__PURE__ */ jsx8("svg", { viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx8("path", { d: "M3.5 8h9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) }),
      /* @__PURE__ */ jsx8(
        "button",
        {
          type: "button",
          "aria-label": "Zoom in",
          disabled: atMaxZoom,
          onClick: () => setZoom((z) => Math.min(WAVEFORM_MAX_ZOOM, z * 2)),
          children: /* @__PURE__ */ jsx8("svg", { viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx8("path", { d: "M8 3.5v9M3.5 8h9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) })
        }
      )
    ] })
  ] });
}

// src/move-waveform.ts
var MOVE_WAVEFORM_STEPS = 16;
var SCRUB_PER_DETENT = 0.01;
var SCRUB_FINE = 2e-3;
var ZOOM_PER_DETENT = 0.08;
var clamp017 = (v) => Math.min(1, Math.max(0, v));
function defaultView() {
  return { position: 0, zoom: 1, loop: null, loopAnchor: null };
}
function scrubBy(position, delta, fine = false) {
  const step = fine ? SCRUB_FINE : SCRUB_PER_DETENT;
  const next = clamp017(position + delta * step);
  return Number(next.toFixed(6));
}
function zoomBy(zoom, delta) {
  const next = zoom * Math.pow(1 + ZOOM_PER_DETENT, delta);
  return Number(Math.min(WAVEFORM_MAX_ZOOM, Math.max(1, next)).toFixed(6));
}
var stepPosition = (index, steps = MOVE_WAVEFORM_STEPS) => Math.min(1, Math.max(0, index / Math.max(1, steps)));
function loopFromStep(view, index, steps = MOVE_WAVEFORM_STEPS) {
  if (view.loopAnchor === null || view.loop) {
    return { loop: null, loopAnchor: index };
  }
  if (index === view.loopAnchor) {
    return { loop: null, loopAnchor: null };
  }
  const a = Math.min(view.loopAnchor, index);
  const b = Math.max(view.loopAnchor, index);
  return {
    loop: { start: stepPosition(a, steps), end: stepPosition(b + 1, steps) },
    loopAnchor: null
  };
}
function loopSteps(view, steps = MOVE_WAVEFORM_STEPS) {
  if (view.loop) {
    const from = Math.floor(view.loop.start * steps);
    const to = Math.ceil(view.loop.end * steps) - 1;
    const lit = [];
    for (let i = Math.max(0, from); i <= Math.min(steps - 1, to); i++) lit.push(i);
    return lit;
  }
  return view.loopAnchor === null ? [] : [view.loopAnchor];
}
var MoveWaveformStoreClass = class {
  constructor() {
    this.view = defaultView();
    this.registered = false;
    this.listeners = /* @__PURE__ */ new Set();
    this.version = 0;
  }
  /** Claim the wheel, the volume knob and the step row. Returns the release. */
  register() {
    this.registered = true;
    this.notify();
    return () => {
      this.registered = false;
      this.view = defaultView();
      this.notify();
    };
  }
  isRegistered() {
    return this.registered;
  }
  getView() {
    return this.view;
  }
  getVersion() {
    return this.version;
  }
  /** Patch the view. A patch that changes nothing notifies nobody. */
  setView(patch2) {
    const next = { ...this.view, ...patch2 };
    if (next.position === this.view.position && next.zoom === this.view.zoom && next.loopAnchor === this.view.loopAnchor && next.loop?.start === this.view.loop?.start && next.loop?.end === this.view.loop?.end) {
      return;
    }
    this.view = next;
    this.notify();
  }
  scrub(delta, fine = false) {
    this.setView({ position: scrubBy(this.view.position, delta, fine) });
  }
  zoom(delta) {
    this.setView({ zoom: zoomBy(this.view.zoom, delta) });
  }
  pressStep(index) {
    this.setView(loopFromStep(this.view, index));
  }
  clearLoop() {
    this.setView({ loop: null, loopAnchor: null });
  }
  /** The steps the loop covers — what the hardware lights. */
  loopSteps() {
    return loopSteps(this.view);
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  notify() {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
};
var MoveWaveformStore = new MoveWaveformStoreClass();

// src/components/MoveWaveform.tsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var SLOT_HEIGHT = 140;
var SLOT_ZOOM = 4;
var DOCK_GAP = 10;
function MoveWaveform({
  buffer = null,
  variant = "page",
  getProgress,
  progress,
  onSeek,
  onLoopChange,
  mode = "pixelated",
  pixelSize = 2,
  grid = false,
  bands = false,
  waveColor,
  playheadColor,
  height,
  children,
  theme = "system",
  productionEnabled = isDevDefault,
  className
}) {
  const hostRef = useRef7(null);
  const [width, setWidth] = useState5(0);
  const [dockBottom, setDockBottom] = useState5(0);
  const [mounted, setMounted] = useState5(false);
  const seekRef = useRef7(onSeek);
  seekRef.current = onSeek;
  const loopRef = useRef7(onLoopChange);
  loopRef.current = onLoopChange;
  useEffect7(() => {
    if (!productionEnabled) return;
    setMounted(true);
    return MoveWaveformStore.register();
  }, [productionEnabled]);
  const view = useSyncExternalStore2(
    useCallback2((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  const state2 = MoveWaveformStore.getView();
  const lastSent = useRef7({ position: state2.position, loop: state2.loop });
  useEffect7(() => {
    if (state2.position !== lastSent.current.position) {
      lastSent.current.position = state2.position;
      seekRef.current?.(state2.position);
    }
    if (state2.loop !== lastSent.current.loop) {
      lastSent.current.loop = state2.loop;
      loopRef.current?.(state2.loop);
    }
  }, [view, state2.position, state2.loop]);
  useEffect7(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      setWidth((prev) => prev === w ? prev : w);
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [mounted, variant]);
  useEffect7(() => {
    if (variant !== "dock" || typeof window === "undefined") return;
    const measure = () => {
      const panel2 = document.querySelector(".tweakers-move-root .tweakers-move");
      const h = panel2 ? panel2.getBoundingClientRect().height : 0;
      setDockBottom(h > 0 ? h + DOCK_GAP : DOCK_GAP);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const panel = document.querySelector(".tweakers-move-root .tweakers-move");
    if (panel) ro.observe(panel);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [variant, mounted]);
  if (!productionEnabled) return null;
  const boxHeight = height ?? (variant === "slot" ? SLOT_HEIGHT : 180);
  const wave = /* @__PURE__ */ jsx9(
    WaveformVisualization,
    {
      buffer,
      ...getProgress ? { getProgress } : { progress: progress ?? state2.position },
      mode,
      pixelSize,
      grid,
      bands,
      ...waveColor ? { waveColor } : {},
      ...playheadColor ? { playheadColor } : {},
      loop: state2.loop,
      zoom: variant === "slot" ? Math.max(SLOT_ZOOM, state2.zoom) : state2.zoom,
      onSeek: (p) => MoveWaveformStore.setView({ position: p }),
      onLoopChange: (l) => MoveWaveformStore.setView({ loop: l, loopAnchor: null }),
      width: Math.max(1, width),
      height: boxHeight
    }
  );
  const body = /* @__PURE__ */ jsx9(
    "div",
    {
      ref: hostRef,
      className: `tweakers-move-wave${className ? ` ${className}` : ""}`,
      "data-variant": variant,
      style: variant === "dock" ? { bottom: `${dockBottom}px` } : void 0,
      children: /* @__PURE__ */ jsxs9("div", { className: "tweakers-move-wave-canvas", style: { height: `${boxHeight}px` }, children: [
        width > 0 && wave,
        children
      ] })
    }
  );
  if (variant !== "dock") return body;
  if (!mounted || typeof document === "undefined") return null;
  return createPortal2(
    /* @__PURE__ */ jsx9("div", { className: "tweakers-root tweakers-move-root", "data-theme": theme, "data-wave-dock": "true", children: body }),
    document.body
  );
}

// src/store/TimelineStore.ts
var MIN_LOOP_REGION = 0.02;
function loopSpan(duration, loopStart, loopEnd) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (!Number.isFinite(loopStart)) loopStart = 0;
  const end = Number.isFinite(loopEnd) ? Math.min(Math.max(0, loopEnd), duration) : duration;
  const start = Math.min(Math.max(0, loopStart), duration);
  const span = end - start;
  return span > 0 ? span : duration;
}
function foldLoopTime(time, duration, loopStart = 0, loopEnd) {
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) {
    return { time: 0, wraps: 0 };
  }
  const end = Number.isFinite(loopEnd) ? Math.min(Math.max(0, loopEnd), duration) : duration;
  if (time < end) return { time, wraps: 0 };
  const span = loopSpan(duration, loopStart, end);
  const base = end - span;
  const over = time - base;
  return { time: base + over % span, wraps: Math.floor(over / span) };
}
var EMPTY_TRANSPORT = Object.freeze({ time: 0, playing: false, duration: 0, wraps: 0 });
var TimelineStoreClass = class {
  constructor() {
    this.timelines = /* @__PURE__ */ new Map();
    this.transports = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.globalListeners = /* @__PURE__ */ new Set();
    this.registrationCounts = /* @__PURE__ */ new Map();
    // User-defined loop windows. Absent = loop the whole timeline. The stored
    // object reference is stable until set/clear so useSyncExternalStore readers
    // don't churn.
    this.loopRegions = /* @__PURE__ */ new Map();
    this.persistTargets = /* @__PURE__ */ new Map();
    this.listCache = null;
    this.rafId = null;
    this.lastTick = 0;
    this.tick = (now) => {
      const dt = Math.max(0, (now - this.lastTick) / 1e3);
      this.lastTick = now;
      let anyPlaying = false;
      for (const [id, transport] of this.transports) {
        if (!transport.playing) continue;
        const meta = this.timelines.get(id);
        const duration = meta?.duration ?? transport.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
          this.transports.set(id, { time: 0, playing: false, duration: 0, wraps: 0 });
          this.notify(id);
          continue;
        }
        let time = transport.time + dt;
        let wraps = transport.wraps;
        const region = this.effectiveRegion(id, duration);
        if (time >= region.end) {
          const folded = foldLoopTime(time, duration, region.start, region.end);
          time = folded.time;
          wraps += folded.wraps;
        }
        this.transports.set(id, { time, playing: true, duration, wraps });
        anyPlaying = true;
        this.notify(id);
      }
      this.rafId = anyPlaying ? window.requestAnimationFrame(this.tick) : null;
    };
  }
  register(meta, options) {
    const existing = this.timelines.get(meta.id);
    if (existing && existing.name !== meta.name) {
      console.warn(
        `[tweakers] Timeline id "${meta.id}" is already registered by "${existing.name}"; "${meta.name}" will share and overwrite that transport.`
      );
    }
    const firstRegistration = !this.registrationCounts.has(meta.id);
    this.registrationCounts.set(meta.id, (this.registrationCounts.get(meta.id) ?? 0) + 1);
    if (firstRegistration) {
      this.persistTargets.set(meta.id, resolvePersistTarget("timeline-loop", meta.id, options.persist));
      this.hydrateLoopRegion(meta);
    }
    this.applyMeta(meta, options.autoplay);
  }
  update(meta) {
    if (!this.timelines.has(meta.id)) return;
    this.applyMeta(meta, false);
  }
  unregister(id) {
    const nextCount = (this.registrationCounts.get(id) ?? 1) - 1;
    if (nextCount > 0) {
      this.registrationCounts.set(id, nextCount);
      return;
    }
    this.registrationCounts.delete(id);
    this.timelines.delete(id);
    this.transports.delete(id);
    this.loopRegions.delete(id);
    this.persistTargets.delete(id);
    if (this.listeners.get(id)?.size === 0) this.listeners.delete(id);
    this.listCache = null;
    this.notifyGlobal();
  }
  /** Restore a persisted loop region, or seed one from a code-defined
   * `options.loop`. No region at all = loop the whole timeline (the default). */
  hydrateLoopRegion(meta) {
    const duration = Number.isFinite(meta.duration) ? Math.max(0, meta.duration) : 0;
    const persisted = loadPersisted(this.persistTargets.get(meta.id) ?? null);
    if (persisted && Number.isFinite(persisted.start) && Number.isFinite(persisted.end)) {
      const region = this.normalizeRegion(persisted.start, persisted.end, duration);
      if (region) this.loopRegions.set(meta.id, region);
      return;
    }
    if (meta.loop) {
      const region = this.normalizeRegion(meta.loopStart, duration, duration);
      if (region) this.loopRegions.set(meta.id, region);
    }
  }
  /** Clamp to [0,duration], order min/max, and reject degenerate widths. */
  normalizeRegion(start, end, duration) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || duration <= 0) return null;
    const lo = Math.min(Math.max(0, Math.min(start, end)), duration);
    const hi = Math.min(Math.max(0, Math.max(start, end)), duration);
    if (hi - lo < MIN_LOOP_REGION) return null;
    return { start: lo, end: hi };
  }
  setLoopRegion(id, start, end) {
    const transport = this.transports.get(id);
    const duration = transport?.duration ?? this.timelines.get(id)?.duration ?? 0;
    const region = this.normalizeRegion(start, end, duration);
    if (!region) return;
    this.loopRegions.set(id, region);
    savePersisted(this.persistTargets.get(id) ?? null, region);
    this.notify(id);
  }
  clearLoopRegion(id) {
    if (!this.loopRegions.has(id)) return;
    this.loopRegions.delete(id);
    clearPersisted(this.persistTargets.get(id) ?? null);
    this.notify(id);
  }
  /** The raw user/code region, or undefined when looping the whole timeline.
   * The reference is stable between changes (safe for useSyncExternalStore). */
  getLoopRegion(id) {
    return this.loopRegions.get(id);
  }
  /** The region the clock actually loops within: the user/code region, or the
   * whole timeline `[0, duration]` when none is set. Playback always wraps. */
  effectiveRegion(id, duration) {
    const region = this.loopRegions.get(id);
    if (region) return region;
    return { start: 0, end: Math.max(0, duration) };
  }
  play(id) {
    const transport = this.transports.get(id);
    if (!transport || transport.duration <= 0 || transport.playing) return;
    const region = this.effectiveRegion(id, transport.duration);
    const restart = transport.time >= region.end;
    this.transports.set(id, {
      ...transport,
      time: restart ? region.start : transport.time,
      wraps: restart ? 0 : transport.wraps,
      playing: true
    });
    this.notify(id);
    this.ensureLoop();
  }
  pause(id) {
    const transport = this.transports.get(id);
    if (!transport || !transport.playing) return;
    this.transports.set(id, { ...transport, playing: false });
    this.notify(id);
  }
  replay(id) {
    const transport = this.transports.get(id);
    if (!transport || transport.duration <= 0) return;
    const region = this.effectiveRegion(id, transport.duration);
    this.transports.set(id, { ...transport, time: region.start, wraps: 0, playing: true });
    this.notify(id);
    this.ensureLoop();
  }
  seek(id, time) {
    const transport = this.transports.get(id);
    if (!transport || !Number.isFinite(time)) return;
    const clamped = Math.min(transport.duration, Math.max(0, time));
    this.transports.set(id, { ...transport, time: clamped, wraps: 0 });
    this.notify(id);
  }
  getTransport(id) {
    return this.transports.get(id) ?? EMPTY_TRANSPORT;
  }
  getTimeline(id) {
    return this.timelines.get(id);
  }
  getTimelines() {
    if (!this.listCache) {
      this.listCache = Array.from(this.timelines.values());
    }
    return this.listCache;
  }
  subscribe(id, listener) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, /* @__PURE__ */ new Set());
    }
    this.listeners.get(id).add(listener);
    return () => {
      const listeners2 = this.listeners.get(id);
      listeners2?.delete(listener);
      if (listeners2?.size === 0 && !this.timelines.has(id)) {
        this.listeners.delete(id);
      }
    };
  }
  subscribeGlobal(listener) {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }
  applyMeta(meta, autoplay) {
    const duration = Number.isFinite(meta.duration) ? Math.max(0, meta.duration) : 0;
    const loopStart = Number.isFinite(meta.loopStart) ? Math.min(duration, Math.max(0, meta.loopStart)) : 0;
    const safeMeta = { ...meta, duration, loopStart };
    this.timelines.set(meta.id, safeMeta);
    const region = this.loopRegions.get(meta.id);
    if (region) {
      const reclamped = this.normalizeRegion(region.start, region.end, duration);
      if (reclamped) this.loopRegions.set(meta.id, reclamped);
      else this.loopRegions.delete(meta.id);
    }
    const existing = this.transports.get(meta.id);
    if (existing) {
      this.transports.set(meta.id, {
        time: Math.min(existing.time, duration),
        playing: duration > 0 && existing.playing,
        duration,
        wraps: existing.wraps
      });
    } else {
      const playing = duration > 0 && autoplay;
      this.transports.set(meta.id, { time: 0, playing, duration, wraps: 0 });
      if (playing) this.ensureLoop();
    }
    this.listCache = null;
    this.notify(meta.id);
    this.notifyGlobal();
  }
  ensureLoop() {
    if (this.rafId !== null || typeof window === "undefined") return;
    this.lastTick = performance.now();
    this.rafId = window.requestAnimationFrame(this.tick);
  }
  notify(id) {
    this.listeners.get(id)?.forEach((fn) => fn());
  }
  notifyGlobal() {
    this.globalListeners.forEach((fn) => fn());
  }
};
var TimelineStore = /* @__PURE__ */ new TimelineStoreClass();

// src/timeline-core.ts
function formatClock(time, tenths = false) {
  const safe = Math.max(0, time);
  const minutes = Math.floor(safe / 60);
  const seconds = safe - minutes * 60;
  const secondsText = tenths ? seconds.toFixed(1).padStart(4, "0") : String(Math.floor(seconds)).padStart(2, "0");
  return `${String(minutes).padStart(2, "0")}:${secondsText}`;
}
export {
  ADSR_DEF,
  ADSR_STAGE_MAX,
  ANGLE_DEAD_ZONE_PX,
  COLOR_FORMATS,
  CURVE_CYCLE,
  CURVE_DEF,
  CURVE_DEFAULT_HEIGHT,
  CURVE_FIT_PADDING,
  CURVE_LABELS,
  CURVE_MAX_CLIPS,
  CURVE_MAX_DURATION,
  CURVE_MAX_HEIGHT,
  CURVE_MIN_DURATION,
  CURVE_MIN_HEIGHT,
  CURVE_SAMPLE_COUNT,
  CurveComposer,
  DEFAULT_GRADIENT,
  DEFAULT_TRANSFER,
  DEFAULT_TRIGGER_STEPS,
  ENV_BEND_STAGES,
  FILTER_DB_CEIL,
  FILTER_DB_FLOOR,
  ICON_MOVE_CAPTURE,
  ICON_MOVE_ENTER,
  LFO_DEF,
  LFO_SYNC_DIVISIONS,
  ListScreen,
  MIN_STOPS,
  MOD_COLORS,
  MOD_PAGE_DIALS,
  MOD_RING_CIRCUMFERENCE,
  MOD_RING_RADIUS,
  MOD_SETTINGS_PANEL,
  MOD_SLOTS,
  MOD_TOUCH_GRACE_MS,
  MOVE_DIALS,
  MOVE_FUNCTION_BUTTONS,
  MOVE_FUNCTION_MANIFEST,
  MOVE_PADS,
  MOVE_SLOT_LIBRARY,
  MOVE_SPECIAL_BUTTONS,
  MOVE_TRACKS,
  MOVE_WAVEFORM_STEPS,
  ModRing,
  ModulationStore,
  MoveActionButton,
  MoveFunctions,
  MovePanel,
  MoveSlotDefaultBody,
  MoveSlotEnumBody,
  MoveSlotEnvBody,
  MoveSlotFilterBody,
  MoveSlotGlyph,
  MoveSlotNumericBody,
  MoveSlotPlaybackDrawing,
  MoveSlotRangeBody,
  MoveSlotReadout,
  MoveSlotScopeBody,
  MoveSlotShape,
  MoveSlotToggleBody,
  MoveSlotXYBody,
  MoveSurfaceStore,
  MoveVolumeDisplay,
  MoveWaveform,
  MoveWaveformStore,
  SH_DEF,
  TAB_PATH,
  TRANSFER_MAX_POINTS,
  TRANSFER_MIN_GAP,
  TimelineStore,
  TweakStore,
  WaveformVisualization,
  XY_DEFAULT_STEP,
  XY_DETENT_PX,
  addDriver,
  addStop,
  angleFromPointer,
  applyDetentAxis,
  applyModulation,
  arcPath,
  bearingToValue,
  buildModMovePage,
  buildMovePages,
  buildSamplers,
  centerValue,
  clamp3 as clamp,
  clampCurveHeight,
  clampOklchToSrgb,
  clampRange,
  colorAtPosition,
  curveComposition,
  curveDuration,
  curvePathData,
  curveY,
  cycleDriverType,
  cycleSegmentType,
  defaultComposition,
  defaultFilterResponse,
  defaultListItemParams,
  denormalizeEnumDial,
  denormalizeFilterDial,
  denormalizeRangeDial,
  dialOrigin,
  dialSpan,
  displayHex,
  enumOptionIcon,
  envCurveParam,
  envelopeJoints,
  envelopePoints,
  filterHand01,
  filterHandValue,
  filterResponsePath,
  filterShapePath,
  filterShapeResponse,
  flipDriver,
  flipDriverX,
  flipDriverY,
  flipSegment,
  flipSegmentX,
  flipSegmentY,
  formatClock,
  formatHex,
  getModType,
  gradientFillBox,
  gradientToCss,
  gradientToTransform,
  groupListFields,
  handleLeftStyles,
  hintDomId,
  hslToRgb,
  hsvToRgb,
  insertPoint,
  invertY,
  isIdentityTransfer,
  isOutsideSpan,
  isSpanContinuation,
  lfoSyncedHz,
  listModTypes,
  loopFromStep,
  loopSteps,
  modColor,
  modKey,
  modPageLayout,
  modPageWidth,
  modRingArc,
  moveAppPadRow,
  moveNumericDrawing,
  movePadRows,
  movePlaybackMode,
  movePoint,
  moveSlotKind,
  moveStop,
  moveVisualReading,
  defaultView as moveWaveformDefaultView,
  nearestHandle,
  nearestPoint,
  normToValue,
  normalizeAngle,
  normalizeCurveMarkers,
  normalizeDial,
  normalizeEnumDial,
  normalizeFilterDial,
  normalizeFilterValue,
  normalizeGradient,
  normalizeHex,
  normalizeListItems,
  normalizeRangeDial,
  normalizeTransfer,
  normalizeValue,
  normalizeXYDial,
  nudge,
  nudgeAngle,
  oklchToRgb,
  opacityPercent,
  orderRange,
  parseHex,
  parseListItemSchema,
  percentToValue,
  pickDragTarget,
  plotCurve,
  pointFromValue,
  rampCss,
  readComposition,
  redistributeWeight,
  registerModType,
  removeDriver,
  removePoint,
  removeSegment,
  removeStop,
  resolveAxis,
  resolveFilterAxis,
  rgbToHsl,
  rgbToHsv,
  rgbToOklch,
  sampleTransfer,
  scrubBy,
  setDriverAnticipate,
  setDriverCurvature,
  setDriverOvershoot,
  setDriverSteepness,
  setGradientAngle,
  setGradientCenter,
  setGradientRotation,
  setGradientScale,
  setGradientSquash,
  setGradientType,
  setHigh,
  setLow,
  setSegmentAnticipate,
  setSegmentCurvature,
  setSegmentOvershoot,
  setSegmentSteepness,
  setStopColor,
  shiftSpan,
  snapAngle,
  snapToStep,
  splitSegment,
  springify,
  stepPosition,
  transferLut,
  triggerLevels,
  triggersCrossed,
  valueFromPoint,
  valueToBearing,
  valueToNorm,
  valueToPercent,
  visibleColumns,
  visibleModControls,
  zoomBy
};
//# sourceMappingURL=index.js.map