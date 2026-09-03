import type { PanelConfig, ControlMeta } from './store/TweakStore';
import { resolveAxis, type XYValue } from './xy-pad-core';

/**
 * The Move's control surface, as the bridge kit maps it (move-tweakers v0):
 * the first 4 panels become pages behind the track buttons, sliders and
 * bounded numbers become the 8 dials, toggles become pads. An xy control
 * takes a dial slot too — the pad draws behind the label, its knob turns
 * the X axis, and the volume knob turns Y while that knob is touched. A
 * range control claims a slot the same way: its knob moves the low end,
 * the volume knob the high end while touched. Bounded params
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

/** A select with real choices becomes an enum dial — the kit's exact rule. */
export const isEnumDial = (c: ControlMeta) =>
  c.type === 'select' && Array.isArray(c.options) && c.options.length > 1;

const isDial = (c: ControlMeta) =>
  c.type === 'slider' || c.type === 'xy' || c.type === 'range' || isEnumDial(c) ||
  (c.type === 'number' && c.min != null && c.max != null);

/** Two-handed dials and enums need a slot of their own, never a value chip. */
const noChip = (c: ControlMeta) => c.type === 'xy' || c.type === 'range' || isEnumDial(c);

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
        /* xy pads and ranges need a dial slot — past the 8 dials they don't fit a chip */
        values: bounded.slice(MOVE_DIALS).filter((c) => !noChip(c)).slice(0, MOVE_PADS),
      };
    });
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

/** Enum dial helpers — options may be strings or { value, label }. */
export const enumOptionValue = (o: string | { value: string; label?: string }) =>
  typeof o === 'string' ? o : o.value;
export const enumOptionLabel = (o: string | { value: string; label?: string }) =>
  typeof o === 'string' ? o : (o.label ?? o.value);
export function enumIndex(meta: ControlMeta, value: unknown): number {
  const i = (meta.options ?? []).findIndex((o) => enumOptionValue(o as never) === value);
  return Math.max(0, i);
}

/** A range dial's two ends, each 0..1 — the two numbers on the wire. */
export function normalizeRangeDial(meta: ControlMeta, value: unknown): { lo: number; hi: number } {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (value ?? {}) as Partial<{ min: number; max: number }>;
  return { lo: norm01(v.min, min, max), hi: norm01(v.max, min, max) };
}

/** End positions 0..1 back to the control's real {min, max}, kit-identical. */
export function denormalizeRangeDial(meta: ControlMeta, lo01: number, hi01: number): { min: number; max: number } {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const lo = denorm01(Math.min(lo01, hi01), min, max, meta.step ?? 0);
  const hi = denorm01(Math.max(lo01, hi01), min, max, meta.step ?? 0);
  return { min: lo, max: hi };
}

/** Where the fill anchors for a bipolar/origin slider, 0..1 (else 0). */
export function dialOrigin(meta: ControlMeta): number {
  const origin = meta.origin ?? (meta.bipolar ? 0 : undefined);
  return origin === undefined ? 0 : normalizeDial(meta, origin);
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
