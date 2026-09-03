import type { PanelConfig, ControlMeta } from './store/TweakStore';
import { resolveAxis, type XYValue } from './xy-pad-core';
import { clampRange, type RangeValue } from './range-slider-core';

/**
 * The Move's control surface, as the bridge kit maps it (move-tweakers v0):
 * the first 4 panels become pages behind the track buttons, sliders and
 * bounded numbers become the 8 dials, toggles become pads. An xy control
 * takes a dial slot too — the pad draws behind the label, its knob turns
 * the X axis, and the volume knob turns Y while that knob is touched.
 * A range control takes a dial slot the same two-handed way: the column's
 * knob edits the low handle, and the volume knob edits the high handle
 * while that knob is touched.
 * A select with options takes a dial slot as a stepped enum dial — the
 * knob's 0..1 position maps to an option index, step 1/(count-1).
 * Bounded params
 * beyond the 8 dials overflow into the pad grid as value chips — each one
 * related, by column, to the dial above it, which it can substitute (hold
 * to peek, tap to latch). The on-screen MovePanel mirrors this mapping so
 * screen and hardware always show the same layout.
 */
export const MOVE_TRACKS = 4;
export const MOVE_DIALS = 8;
export const MOVE_PADS = 8;

export interface MovePage {
  panel: PanelConfig;
  dials: ControlMeta[];
  /** Switch chips — the hardware's toggle pad row (y=3 on the device). */
  toggles: ControlMeta[];
  /** Overflow value chips — the hardware's value pad row (y=1). Value i sits
   *  at column i on both surfaces, pairing it with the dial in that column. */
  values: ControlMeta[];
}

const flat = (controls: ControlMeta[], out: ControlMeta[] = []): ControlMeta[] => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};

const isDial = (c: ControlMeta) =>
  c.type === 'slider' || c.type === 'xy' || c.type === 'range' ||
  (c.type === 'number' && c.min != null && c.max != null) ||
  (c.type === 'select' && c.options != null && c.options.length > 0);

export function buildMovePages(panels: PanelConfig[]): MovePage[] {
  return panels
    .filter((p) => p.kind !== 'timeline')
    .slice(0, MOVE_TRACKS)
    .map((panel) => {
      const controls = flat(panel.controls);
      const bounded = controls.filter(isDial);
      return {
        panel,
        dials: bounded.slice(0, MOVE_DIALS),
        toggles: controls.filter((c) => c.type === 'toggle').slice(0, MOVE_PADS),
        /* xy pads, ranges and enums need a dial slot — past the 8 dials they don't fit a chip */
        values: bounded.slice(MOVE_DIALS).filter((c) => c.type !== 'xy' && c.type !== 'range' && c.type !== 'select').slice(0, MOVE_PADS),
      };
    });
}

/**
 * The columns the on-screen panel actually shows: a column is occupied when
 * it has a dial, a toggle chip, or a value chip at that index. The indices
 * stay the hardware knob numbers — callers hide the unoccupied columns,
 * never renumber them, so the latch/substitution logic and the physical
 * knobs keep agreeing on what column i means.
 */
export function visibleColumns(page: MovePage): number[] {
  const cols: number[] = [];
  for (let i = 0; i < MOVE_DIALS; i++) {
    if (page.dials[i] || page.toggles[i] || page.values[i]) cols.push(i);
  }
  return cols;
}

/** Dial position 0..1 back to the control's real value, kit-identical. */
export function denormalizeDial(meta: ControlMeta, v01: number): number {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (meta.step) v = Math.round(v / meta.step) * meta.step;
  return Number(v.toFixed(6));
}

/** Dial position 0..1, the same normalization the kit puts on the wire. */
export function normalizeDial(meta: ControlMeta, value: unknown): number {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (Number(value) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}

const norm01 = (v: unknown, min: number, max: number) => {
  const n = (Number(v) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
};

const denorm01 = (v01: number, min: number, max: number, step: number) => {
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (step) v = Math.round(v / step) * step;
  return Number(v.toFixed(6));
};

/** An xy pad's position, each axis 0..1 — the two numbers on the wire. */
export function normalizeXYDial(meta: ControlMeta, value: unknown): { x: number; y: number } {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  const v = (value ?? {}) as Partial<XYValue>;
  return { x: norm01(v.x, xAxis.min, xAxis.max), y: norm01(v.y, yAxis.min, yAxis.max) };
}

/** Axis positions 0..1 back to the control's real {x, y}, kit-identical. */
export function denormalizeXYDial(meta: ControlMeta, x01: number, y01: number): XYValue {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  return {
    x: denorm01(x01, xAxis.min, xAxis.max, xAxis.step),
    y: denorm01(y01, yAxis.min, yAxis.max, yAxis.step),
  };
}

/** A range control's two handles, each 0..1 — the pair on the wire. */
export function normalizeRangeDial(meta: ControlMeta, value: unknown): { lo: number; hi: number } {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (value ?? {}) as Partial<RangeValue>;
  return { lo: norm01(v.min, min, max), hi: norm01(v.max, min, max) };
}

/** Handle positions 0..1 back to the control's real {min, max}, kit-identical. */
export function denormalizeRangeDial(meta: ControlMeta, lo01: number, hi01: number): RangeValue {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const step = meta.step ?? 0;
  return clampRange(
    { min: denorm01(lo01, min, max, step), max: denorm01(hi01, min, max, step) },
    min,
    max
  );
}

const enumOptionValues = (meta: ControlMeta): string[] =>
  (meta.options ?? []).map((o) => (typeof o === 'string' ? o : o.value));

/** An enum dial's position 0..1 — the option's index over the last index.
 *  An unknown (or missing) value reads as the first option, position 0. */
export function normalizeEnumDial(meta: ControlMeta, value: unknown): number {
  const opts = enumOptionValues(meta);
  if (opts.length < 2) return 0;
  const i = opts.indexOf(String(value));
  return i <= 0 ? 0 : i / (opts.length - 1);
}

/** Dial position 0..1 back to the option at that step, kit-identical:
 *  round(v01 * (count-1)), clamped into the options list. */
export function denormalizeEnumDial(meta: ControlMeta, v01: number): string {
  const opts = enumOptionValues(meta);
  if (opts.length === 0) return '';
  const i = Math.round(Math.min(1, Math.max(0, v01)) * (opts.length - 1));
  return opts[i];
}

/**
 * Where a dial's fill anchors, as a 0..100 percent — resolved exactly like the
 * Slider's origin/bipolar props. `null` means no anchor (classic left fill).
 */
export function dialOriginPercent(meta: ControlMeta): number | null {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const origin = Math.min(max, Math.max(min, meta.origin ?? (meta.bipolar ? 0 : min)));
  if (origin <= min) return null;
  return ((origin - min) / (max - min || 1)) * 100;
}
