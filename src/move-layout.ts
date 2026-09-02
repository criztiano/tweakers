import type { PanelConfig, ControlMeta } from './store/TweakStore';

/**
 * The Move's control surface, as the bridge kit maps it (move-tweakers v0):
 * the first 4 panels become pages behind the track buttons, sliders and
 * bounded numbers become the 8 dials, toggles become pads. Bounded params
 * beyond the 8 dials overflow into the pad grid as value chips — each one
 * related, by column, to the dial above it, which it can substitute (hold
 * to peek, tap to latch). The on-screen MovePanel mirrors this mapping so
 * screen and hardware always show the same layout.
 */
export const MOVE_TRACKS = 4;
export const MOVE_DIALS = 8;
export const MOVE_PADS = 8;
/** The full on-screen pad grid: 4 rows of 8 (Figma 802:319). */
export const MOVE_PAD_SLOTS = 32;

export interface MovePadSlot {
  /** `toggle` — a switch chip (kit-mapped to the hardware pads today);
   *  `value` — an overflow bounded param chip that can substitute a dial. */
  kind: 'toggle' | 'value';
  meta: ControlMeta;
}

export interface MovePage {
  panel: PanelConfig;
  dials: ControlMeta[];
  pads: MovePadSlot[];
}

const flat = (controls: ControlMeta[], out: ControlMeta[] = []): ControlMeta[] => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};

const isDial = (c: ControlMeta) =>
  c.type === 'slider' || (c.type === 'number' && c.min != null && c.max != null);

export function buildMovePages(panels: PanelConfig[]): MovePage[] {
  return panels
    .filter((p) => p.kind !== 'timeline')
    .slice(0, MOVE_TRACKS)
    .map((panel) => {
      const controls = flat(panel.controls);
      const bounded = controls.filter(isDial);
      // Toggles first — they are what the kit puts on the hardware pads —
      // then the overflow params, until the grid is full.
      const pads: MovePadSlot[] = [
        ...controls
          .filter((c) => c.type === 'toggle')
          .slice(0, MOVE_PADS)
          .map((meta): MovePadSlot => ({ kind: 'toggle', meta })),
        ...bounded.slice(MOVE_DIALS).map((meta): MovePadSlot => ({ kind: 'value', meta })),
      ].slice(0, MOVE_PAD_SLOTS);
      return { panel, dials: bounded.slice(0, MOVE_DIALS), pads };
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
