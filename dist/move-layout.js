// src/xy-pad-core.ts
var XY_DEFAULT_STEP = 0.01;
function resolveAxis(axis) {
  const min = axis?.min ?? 0;
  const max = axis?.max ?? 1;
  const step = axis?.step ?? XY_DEFAULT_STEP;
  const bipolar = axis?.bipolar ?? false;
  const origin = axis?.origin ?? (bipolar ? (min + max) / 2 : min);
  return { min, max, step, origin, bipolar };
}

// src/curve-preview-core.ts
var CURVE_SAMPLE_COUNT = 160;
var CURVE_FIT_PADDING = 0.05;
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
    const finite = ys.filter((y) => Number.isFinite(y));
    if (finite.length === 0) {
      domain = [0, 1];
    } else {
      let lo2 = Math.min(...finite);
      let hi2 = Math.max(...finite);
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

// src/range-slider-core.ts
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
function orderRange(v) {
  return v.min <= v.max ? v : { min: v.max, max: v.min };
}
function clampRange(v, min, max) {
  return orderRange({ min: clamp(v.min, min, max), max: clamp(v.max, min, max) });
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
var clamp2 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var snap = (v, axis) => {
  let out = clamp2(Number.isFinite(v) ? v : axis.min, axis.min, axis.max);
  if (axis.step > 0) out = clamp2(axis.min + Math.round((out - axis.min) / axis.step) * axis.step, axis.min, axis.max);
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
  return clamp2(Number.isFinite(n) ? n : 0, 0, 1);
};
var filterHandValue = (v01, axis) => snap(axis.min + clamp2(v01, 0, 1) * (axis.max - axis.min), axis);
function filterShapeResponse(type, cutoff01, resonance01) {
  const fc = Math.pow(10, -3 + 3 * clamp2(cutoff01, 0, 1));
  const q = 0.707 * Math.pow(14, clamp2(resonance01, 0, 1));
  const a = Math.pow(10, clamp2(resonance01, 0, 1) * 18 / 40);
  return (t) => {
    const f = Math.pow(10, -3 + 3 * clamp2(t, 0, 1));
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
var isToggleDial = (c) => c.type === "toggle" && c.moveSlot === true;
var isMoveDial = (c) => isToggleDial(c) || c.type === "slider" || c.type === "color" || c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || isEnumDial(c) || c.type === "number" && c.min != null && c.max != null;
var isDial = isMoveDial;
var noChip = (c) => isToggleDial(c) || c.type === "color" || c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || isEnumDial(c);
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
    if (c.type === "toggle" && !isToggleDial(c)) toggles[Math.max(0, dials.length - 1)] = c;
    else if (c.type === "toggle" || c.type === "select" || isDial(c)) dials.push(c);
  }
  return { panel, dials: dials.slice(0, MOVE_DIALS), toggles: toggles.slice(0, MOVE_PADS), values: [], actions: [] };
}
var warnedIssues = /* @__PURE__ */ new Set();
var issueReporter = null;
function setMoveLayoutReporter(fn) {
  issueReporter = fn;
}
function reportMoveLayoutIssue(code, message) {
  if (issueReporter) {
    issueReporter(code, message);
    return;
  }
  if (warnedIssues.has(message)) return;
  warnedIssues.add(message);
  console.warn(`Move layout: ${message}`);
}
var padColumn = (panel, c) => {
  const col = panel.movePads?.[c.path];
  if (col === void 0) return null;
  if (typeof col === "number" && Number.isInteger(col) && col >= 0 && col < MOVE_PADS) return col;
  reportMoveLayoutIssue(
    "pad-column-invalid",
    `panel '${panel.id}': control '${c.path}': movePads column ${JSON.stringify(col)} is off the ${MOVE_PADS}-wide grid \u2014 ignored`
  );
  return null;
};
function buildMovePages(panels) {
  const plain = panels.filter((p) => p.kind === void 0);
  for (const p of plain.slice(MOVE_TRACKS)) {
    reportMoveLayoutIssue(
      "panel-dropped",
      `panel '${p.id}' dropped \u2014 hardware has ${MOVE_TRACKS} tracks`
    );
  }
  return plain.slice(0, MOVE_TRACKS).map((panel) => {
    const controls = flat(panel.controls);
    const dials = [];
    let nextCol = 0;
    for (const c of controls) {
      if (!isDial(c)) continue;
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
    const place = (row, rowName, c, col) => {
      if (col !== null && row[col] === void 0) {
        row[col] = c;
        return;
      }
      for (let i = 0; i < MOVE_PADS; i++) {
        if (row[i] === void 0) {
          if (col !== null) {
            reportMoveLayoutIssue(
              "pad-column-taken",
              `panel '${panel.id}': control '${c.path}': ${rowName} column ${col} already occupied by '${row[col].path}' \u2014 moved to column ${i}`
            );
          }
          row[i] = c;
          return;
        }
      }
      reportMoveLayoutIssue(
        "pad-row-full",
        `panel '${panel.id}': control '${c.path}': the ${rowName} row's ${MOVE_PADS} pads are all taken \u2014 dropped`
      );
    };
    for (const c of controls) {
      const col = padColumn(panel, c);
      if (c.type === "toggle" && !isToggleDial(c)) place(toggles, "toggle", c, col);
      else if (c.type === "action") {
        if (col !== null) place(actions, "action", c, col);
      } else if (dials.includes(c)) {
        if (col !== null) {
          reportMoveLayoutIssue(
            "pad-column-on-dial",
            `panel '${panel.id}': control '${c.path}' holds a dial slot \u2014 movePads column ${col} ignored; pads never mirror dials`
          );
        }
      } else if (isDial(c) && !noChip(c)) place(values, "value", c, col);
      else if (isDial(c) && noChip(c)) {
        reportMoveLayoutIssue(
          "dial-dropped",
          `panel '${panel.id}': control '${c.path}' (${c.type}) needs a dial column and none is left \u2014 dropped`
        );
      }
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
  if (claimedRows >= 2) return [page.toggles, page.values, [], []];
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
var normalizeToggleDial = (value) => value === true ? 1 : 0;
var denormalizeToggleDial = (v01) => Number.isFinite(v01) && v01 >= 0.5;
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
function denormalizeXYDial(meta, x01, y01) {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  return {
    x: denorm01(x01, xAxis.min, xAxis.max, xAxis.step),
    y: denorm01(y01, yAxis.min, yAxis.max, yAxis.step)
  };
}
export {
  ENUM_SHAPE_SAMPLES,
  MOVE_DIALS,
  MOVE_PADS,
  MOVE_TRACKS,
  buildModMovePage,
  buildMovePages,
  denormalizeDial,
  denormalizeEnumDial,
  denormalizeFilterDial,
  denormalizeRangeDial,
  denormalizeToggleDial,
  denormalizeXYDial,
  dialOrigin,
  dialSpan,
  enumIndex,
  enumOptionIcon,
  enumOptionLabel,
  enumOptionValue,
  enumShapePath,
  filterShapePath,
  isEnumDial,
  isMoveDial,
  isSpanContinuation,
  isToggleDial,
  moveAppPadRow,
  movePadRows,
  normalizeDial,
  normalizeEnumDial,
  normalizeFilterDial,
  normalizeRangeDial,
  normalizeToggleDial,
  normalizeXYDial,
  reportMoveLayoutIssue,
  setMoveLayoutReporter,
  visibleColumns
};
//# sourceMappingURL=move-layout.js.map