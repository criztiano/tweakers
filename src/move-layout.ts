import type { PanelConfig, ControlMeta } from './store/TweakStore';

/**
 * The Move's control surface, as the bridge kit maps it (move-tweakers v0):
 * the first 4 panels become pages behind the track buttons, sliders and
 * bounded numbers become the 8 dials, toggles become the 8 pads. The
 * on-screen MovePanel mirrors this mapping so screen and hardware always
 * show the same layout.
 */
export const MOVE_TRACKS = 4;
export const MOVE_DIALS = 8;
export const MOVE_PADS = 8;

export interface MovePage {
  panel: PanelConfig;
  dials: ControlMeta[];
  pads: ControlMeta[];
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
      return {
        panel,
        dials: controls.filter(isDial).slice(0, MOVE_DIALS),
        pads: controls.filter((c) => c.type === 'toggle').slice(0, MOVE_PADS),
      };
    });
}

/** Dial position 0..1, the same normalization the kit puts on the wire. */
export function normalizeDial(meta: ControlMeta, value: unknown): number {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (Number(value) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}
