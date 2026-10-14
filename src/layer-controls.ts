// The Layer page's shared controls: where the selected layer sits, how big it is,
// how it is turned and flipped, and how strongly it shows. Every app that places
// layers on a canvas seats these the same way, so a layer moves under the same
// hand in each of them.
//
// Each control comes back as a config (WITHOUT `default` — the app's bridge seeds
// that from `read`) and the two directions it talks in. The app wraps them in its
// own bindings and seats them:
//
//   dials 0–2   X · Y · Depth          (`layerPlacementControls`, the vector face)
//   dial  3     Opacity                (`layerOpacityControl`, the picture face)
//   chips       Scale under column 0, Rotation under column 1
//   switches    Flip H on column 0, Flip V on column 1      (`LAYER_PADS`)
//
// The wheel's list of layers is `layerListScreen`, so the Move's screen names the
// layers alike too.

import { depthScale, type LayerTransform } from './layer-transform-core';
import type { MoveScreenList } from './move-surface-store';

/** One control: a tweakers config entry and the two directions it talks in. */
export interface LayerControl {
  readonly config: Record<string, unknown>;
  read(): number | boolean;
  write(value: unknown): void;
}

/** What the controls need from the app about the selected layer. */
export interface LayerControlAccess {
  /** The canvas the layer is placed on, in px. */
  readonly canvas: { readonly width: number; readonly height: number };
  transform(): LayerTransform;
  /** The point the layer is organised around, canvas px. X and Y read as where it
   *  SITS — this plus its offset — while the stored transform stays an offset. */
  pivot(): { readonly x: number; readonly y: number };
  setTransform(patch: Partial<LayerTransform>): void;
}

/** Glyphs as SVG data URLs — a control's `icon` draws an asset URL as a mask, so
 *  these take the pad's own colour like the bundled set. Same 24px, 2px-stroke grid. */
function glyph(paths: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Mirror left-right: two arrowheads facing a dashed axis. */
export const ICON_FLIP_H = glyph(
  '<path d="m3 7 5 5-5 5V7"/><path d="m21 7-5 5 5 5V7"/><path d="M12 20v2M12 14v2M12 8v2M12 2v2"/>',
);
/** Mirror top-bottom. */
export const ICON_FLIP_V = glyph(
  '<path d="m17 3-5 5-5-5h10"/><path d="m17 21-5-5-5 5h10"/><path d="M4 12H2M10 12H8M16 12h-2M22 12h-2"/>',
);

/**
 * X, Y and Depth as one stage (the `vector` face): three dials side by side.
 * X and Y run half a canvas past each edge — a layer partly off the canvas is a
 * real composition. Depth runs from 4× near to a third far, either side of the
 * picture plane, and reads as the size it makes.
 */
export function layerPlacementControls(access: LayerControlAccess): Record<'x' | 'y' | 'z', LayerControl> {
  const { width, height } = access.canvas;
  const focal = Math.max(width, height);
  return {
    x: {
      config: {
        type: 'slider',
        min: Math.round(-width / 2),
        max: Math.round(width * 1.5),
        step: 1,
        unit: ' px',
        moveVisual: { kind: 'axis', axis: 'x' },
        label: 'X',
      },
      read: () => Math.round(access.pivot().x + access.transform().x),
      write: (v) => access.setTransform({ x: Number(v) - access.pivot().x }),
    },
    y: {
      config: {
        type: 'slider',
        min: Math.round(-height / 2),
        max: Math.round(height * 1.5),
        step: 1,
        unit: ' px',
        moveVisual: { kind: 'axis', axis: 'y', down: true },
        label: 'Y',
      },
      read: () => Math.round(access.pivot().y + access.transform().y),
      write: (v) => access.setTransform({ y: Number(v) - access.pivot().y }),
    },
    z: {
      config: {
        type: 'slider',
        min: Math.round(-focal * 0.75),
        max: Math.round(focal * 2),
        step: 1,
        bipolar: true,
        moveVisual: { kind: 'axis', axis: 'z' },
        label: 'Depth',
        formatValue: (v: number) => `${depthScale(v, width, height).toFixed(2)}×`,
      },
      read: () => Math.round(access.transform().z),
      write: (v) => access.setTransform({ z: Number(v) }),
    },
  };
}

/**
 * Scale and Rotation as value chips, Flip H and Flip V as switches. Degrees round
 * a circle — -179 and 179 are neighbours — so Rotation is a needle, not a bar.
 * Two flip switches rather than one with Shift: a pad carries no Shift on the
 * hardware, and a lit switch says the layer IS flipped.
 */
export function layerShapeControls(
  access: Pick<LayerControlAccess, 'transform' | 'setTransform'>,
): Record<'scale' | 'rotation' | 'flipX' | 'flipY', LayerControl> {
  return {
    scale: {
      config: { type: 'slider', min: 0.05, max: 8, step: 0.01, origin: 1, unit: '×' },
      read: () => access.transform().scale,
      write: (v) => access.setTransform({ scale: Number(v) }),
    },
    rotation: {
      config: { type: 'slider', min: -180, max: 180, step: 1, display: 'dial', wrap: true, unit: '°' },
      read: () => Math.round((access.transform().rotation * 180) / Math.PI),
      write: (v) => access.setTransform({ rotation: (Number(v) * Math.PI) / 180 }),
    },
    flipX: {
      config: { type: 'toggle', label: 'Flip H', icon: ICON_FLIP_H },
      read: () => access.transform().flipX,
      write: (v) => access.setTransform({ flipX: Boolean(v) }),
    },
    flipY: {
      config: { type: 'toggle', label: 'Flip V', icon: ICON_FLIP_V },
      read: () => access.transform().flipY,
      write: (v) => access.setTransform({ flipY: Boolean(v) }),
    },
  };
}

/**
 * How strongly a picture layer shows, on the `opacity` + `picture` face: the
 * picture fills the slot at the layer's opacity. With `onTap`, a still press on
 * the slot is the picture's door (load another).
 */
export function layerOpacityControl(options: {
  read(): number;
  write(value: number): void;
  /** The layer's picture, as an image URL. */
  picture?: string;
  onTap?: () => void;
}): LayerControl {
  return {
    config: {
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Opacity',
      moveVisual: { kind: 'opacity', ...(options.picture ? { picture: options.picture } : {}) },
      ...(options.onTap ? { onTap: options.onTap } : {}),
    },
    read: () => options.read(),
    write: (v) => options.write(Number(v)),
  };
}

/** Where the shared small controls sit: each under the dial it belongs to. */
export const LAYER_PADS: Readonly<Record<'flipX' | 'scale' | 'flipY' | 'rotation', number>> = {
  flipX: 0,
  scale: 0,
  flipY: 1,
  rotation: 1,
};

export const LAYER_HINTS: Readonly<Record<'x' | 'y' | 'z' | 'scale' | 'rotation' | 'opacity', string>> = {
  x: "Where the layer's centre sits, across the canvas.",
  y: "Where the layer's centre sits, down the canvas.",
  z: 'Depth. Far layers shrink toward the centre, near ones grow. It does not change which layer is in front — the list order does.',
  scale: "Size, about the layer's centre. 1× is as drawn.",
  rotation: "Turn, about the layer's centre.",
  opacity: 'How strongly the layer shows.',
};

/** One row of the layer list. */
export interface LayerListRow {
  readonly label: string;
  /** What kind of layer it is, in a word ("Picture", "Text"). */
  readonly tag?: string;
  readonly visible: boolean;
  /** More words a search on the list finds the row by. */
  readonly keywords?: string;
}

/**
 * The list of layers the big wheel walks, frontmost first. Checked = showing, so
 * the list says which layers Mute has put away. Back closes it.
 */
export function layerListScreen(rows: readonly LayerListRow[], index: number): MoveScreenList {
  return {
    title: 'Layers',
    items: rows.map((row) => ({
      label: row.label,
      ...(row.tag ? { tag: row.tag } : {}),
      checked: row.visible,
      ...(row.keywords ? { keywords: row.keywords } : {}),
    })),
    index,
    back: true,
  };
}
