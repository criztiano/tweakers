// src/move-layout.ts
var MOVE_DIALS = 8;
var isEnumDial = (c) => c.type === "select" && Array.isArray(c.options) && c.options.length > 1;
var isMoveTabs = (c) => !!c.moveTabs && isEnumDial(c);
var isNamedTabs = (c) => c.moveTabs === "named";
var padSpan = (c) => c && isMoveTabs(c) ? c.options.length + (isNamedTabs(c) ? 1 : 0) : 1;
var isToggleDial = (c) => c.type === "toggle" && c.moveSlot === true;
var isMoveDial = (c) => isToggleDial(c) || c.type === "slider" || c.type === "color" || c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || isEnumDial(c) && !isMoveTabs(c) || c.type === "number" && c.min != null && c.max != null;
var dialSpan = (c) => c?.type === "filter" ? 2 : 1;

// src/move-strip.ts
var flat = (controls, out = []) => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};
var isStripSlot = (c) => isMoveDial(c) || c.type === "toggle";
function buildMoveStrip(panel) {
  const controls = flat(panel.controls);
  const column = (c) => {
    const n = panel.movePads?.[c.path];
    return typeof n === "number" && Number.isInteger(n) && n >= 0 ? n : null;
  };
  const dials = [];
  for (const c of controls) {
    if (!isStripSlot(c) || column(c) !== null) continue;
    for (let s = 0; s < dialSpan(c); s++) dials.push(c);
  }
  const toggles = [];
  const values = [];
  const actions = [];
  const placeRun = (c, col) => {
    const span = padSpan(c);
    const fits = (start2) => Array.from({ length: span }, (_, k) => toggles[start2 + k]).every((p) => p === void 0);
    let start = col !== null && fits(col) ? col : -1;
    for (let i = 0; start < 0; i++) {
      if (fits(i)) start = i;
    }
    for (let k = 0; k < span; k++) toggles[start + k] = c;
  };
  for (const c of controls) {
    if (isMoveTabs(c)) {
      placeRun(c, column(c));
      continue;
    }
    const col = column(c);
    if (col === null) continue;
    const row = c.type === "toggle" ? toggles : c.type === "action" ? actions : values;
    if (row[col] === void 0) row[col] = c;
  }
  return { panel, dials, toggles, values, actions };
}
function stripStarts(page) {
  const starts = [];
  for (let i = 0; i < page.dials.length; i++) {
    if (i === 0 || page.dials[i] !== page.dials[i - 1]) starts.push(i);
  }
  return starts;
}
function stripOffsets(page, cols = MOVE_DIALS) {
  const len = page.dials.length;
  const offsets = [];
  for (const start of stripStarts(page)) {
    offsets.push(start);
    if (start + cols >= len) break;
  }
  return offsets.length ? offsets : [0];
}
function clampStripOffset(page, offset, cols = MOVE_DIALS) {
  const offsets = stripOffsets(page, cols);
  let best = offsets[0];
  for (const o of offsets) {
    if (Math.abs(o - offset) < Math.abs(best - offset)) best = o;
  }
  return best;
}
function stepStripOffset(page, offset, delta, cols = MOVE_DIALS) {
  const offsets = stripOffsets(page, cols);
  const from = offsets.indexOf(clampStripOffset(page, offset, cols));
  return offsets[Math.min(offsets.length - 1, Math.max(0, from + delta))];
}
function pageStripOffset(page, offset, dir, cols = MOVE_DIALS) {
  if (!dir) return clampStripOffset(page, offset, cols);
  const offsets = stripOffsets(page, cols);
  const target = clampStripOffset(page, offset, cols) + Math.sign(dir) * cols;
  const candidates = dir > 0 ? offsets.filter((o) => o >= target) : offsets.filter((o) => o <= target);
  if (candidates.length) return dir > 0 ? candidates[0] : candidates[candidates.length - 1];
  return dir > 0 ? offsets[offsets.length - 1] : offsets[0];
}
function stripDialColumns(page, offset, cols = MOVE_DIALS) {
  return Array.from({ length: cols }, (_, i) => {
    const col = offset + i;
    return col < page.dials.length ? col : -1;
  });
}
function stripDialSlots(page, offset, cols = MOVE_DIALS) {
  return stripDialColumns(page, offset, cols).map((col) => col < 0 ? void 0 : page.dials[col]);
}
function stripWindowPads(page, offset, cols = MOVE_DIALS) {
  const row = (cells) => Array.from({ length: cols }, (_, i) => cells[offset + i]);
  return { toggles: row(page.toggles), values: row(page.values), actions: row(page.actions) };
}
var stripSlotCount = (page) => stripStarts(page).length;
var stripSlotIndex = (page, offset) => stripStarts(page).filter((start) => start < offset).length;
export {
  buildMoveStrip,
  clampStripOffset,
  isStripSlot,
  pageStripOffset,
  stepStripOffset,
  stripDialColumns,
  stripDialSlots,
  stripOffsets,
  stripSlotCount,
  stripSlotIndex,
  stripStarts,
  stripWindowPads
};
//# sourceMappingURL=move-strip.js.map