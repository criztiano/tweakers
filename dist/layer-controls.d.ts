import { LayerTransform } from './layer-transform-core.js';

/** Where a row goes when it is taken, drawn at its end. `page` is a chevron —
 * the list is replaced by the one this row leads to, so the same mark reads
 * as one level of nesting; `back` is that chevron turned around, and sits at
 * the left end where the eye looks to leave. `dialog` is an ellipsis:
 * something opens over the list and the list is still there behind it. A row
 * without a detail settles a value where it stands. */
type ListScreenDetail = 'page' | 'dialog' | 'back';

/**
 * What an app puts on the Move that its parameters cannot describe.
 *
 * The bridge kit builds pages out of the TweakStore, which covers every
 * control an app declares — dials, switches, value chips. An app that also
 * claims raw hardware (the two bottom pad rows, the sixteen step buttons)
 * owns that part itself and posts it to the surface directly, so the store
 * knows nothing about it. This is the same picture kept for the screen, so
 * the on-screen Move goes on mirroring what is in your hands.
 *
 * Set it from the same code that paints the hardware:
 *
 *   MoveSurfaceStore.setPadRows(2, steps.map((s, i) => ({
 *     x: i % 8, y: i < 8 ? 1 : 0, label: `${i + 17}`, lit: s.on,
 *   })));
 *
 * Leave it alone and the panel behaves exactly as it always has.
 */

/** One row of the app's list. A plain string is a row that settles a value
 * where it stands; the object form adds where the row leads and whether it is
 * switched on, which the panel draws as a mark at the row's end. */
type MoveScreenRow = string | {
    label: string;
    detail?: ListScreenDetail;
    checked?: boolean;
    /** A short note pinned to the row's right end, smaller and dimmer than
     *  the name — a file's format, a status. The hardware screen has no room
     *  for it and takes the label alone. */
    tag?: string;
    /** Words a search on the list also finds the row by, never drawn — an
     *  effect's tags, a file's folder. */
    keywords?: string;
    /** A glyph at the row's left end, by its `LUCIDE_ICONS` name, or an
     *  image URL. The hardware screen has no room for it. */
    icon?: string;
};
/** The app's list on the Move's own 128×64 screen. */
interface MoveScreenList {
    /** What the list is. Read aloud always; drawn as the screen's heading only
     *  with `showTitle`. */
    title?: string;
    showTitle?: boolean;
    items: MoveScreenRow[];
    index: number;
    /** The level the list sits inside, by name — worn as a back pill at the
     *  screen's corner rather than as a row. A click on it is the Back key.
     *  `true` wears the chevron alone. */
    back?: string | true;
    /** `start` reads the rows from the left edge — for rows with icons. */
    align?: 'center' | 'start';
}

/** One control: a tweakers config entry and the two directions it talks in. */
interface LayerControl {
    readonly config: Record<string, unknown>;
    read(): number | boolean;
    write(value: unknown): void;
}
/** What the controls need from the app about the selected layer. */
interface LayerControlAccess {
    /** The canvas the layer is placed on, in px. */
    readonly canvas: {
        readonly width: number;
        readonly height: number;
    };
    transform(): LayerTransform;
    /** The point the layer is organised around, canvas px. X and Y read as where it
     *  SITS — this plus its offset — while the stored transform stays an offset. */
    pivot(): {
        readonly x: number;
        readonly y: number;
    };
    setTransform(patch: Partial<LayerTransform>): void;
}
/** Mirror left-right: two arrowheads facing a dashed axis. */
declare const ICON_FLIP_H: string;
/** Mirror top-bottom. */
declare const ICON_FLIP_V: string;
/**
 * X, Y and Depth as one stage (the `vector` face): three dials side by side.
 * X and Y run half a canvas past each edge — a layer partly off the canvas is a
 * real composition. Depth runs from 4× near to a third far, either side of the
 * picture plane, and reads as the size it makes.
 */
declare function layerPlacementControls(access: LayerControlAccess): Record<'x' | 'y' | 'z', LayerControl>;
/**
 * Scale and Rotation as value chips, Flip H and Flip V as switches. Degrees round
 * a circle — -179 and 179 are neighbours — so Rotation is a needle, not a bar.
 * Two flip switches rather than one with Shift: a pad carries no Shift on the
 * hardware, and a lit switch says the layer IS flipped.
 */
declare function layerShapeControls(access: Pick<LayerControlAccess, 'transform' | 'setTransform'>): Record<'scale' | 'rotation' | 'flipX' | 'flipY', LayerControl>;
/**
 * How strongly a picture layer shows, on the `opacity` + `picture` face: the
 * picture fills the slot at the layer's opacity. With `onTap`, a still press on
 * the slot is the picture's door (load another).
 */
declare function layerOpacityControl(options: {
    read(): number;
    write(value: number): void;
    /** The layer's picture, as an image URL. */
    picture?: string;
    onTap?: () => void;
}): LayerControl;
/** Where the shared small controls sit: each under the dial it belongs to. */
declare const LAYER_PADS: Readonly<Record<'flipX' | 'scale' | 'flipY' | 'rotation', number>>;
declare const LAYER_HINTS: Readonly<Record<'x' | 'y' | 'z' | 'scale' | 'rotation' | 'opacity', string>>;
/** One row of the layer list. */
interface LayerListRow {
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
declare function layerListScreen(rows: readonly LayerListRow[], index: number): MoveScreenList;

export { ICON_FLIP_H, ICON_FLIP_V, LAYER_HINTS, LAYER_PADS, type LayerControl, type LayerControlAccess, type LayerListRow, layerListScreen, layerOpacityControl, layerPlacementControls, layerShapeControls };
