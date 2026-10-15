import { LayerTransform, Mat4 } from './layer-transform-core.js';

/** Canvas pixels -> overlay CSS pixels: the one mapping the overlay draws with, so
 *  the frame can never disagree with the picture under it. */
interface ViewProjection {
    readonly scale: number;
    readonly offsetX: number;
    readonly offsetY: number;
}
declare const IDENTITY_PROJECTION: ViewProjection;
declare function projectX(p: ViewProjection, x: number): number;
declare function projectY(p: ViewProjection, y: number): number;
declare function unprojectX(p: ViewProjection, screenX: number): number;
declare function unprojectY(p: ViewProjection, screenY: number): number;
/** A layer as the tool sees it: who it is and where it is placed. */
interface SelectableLayer {
    readonly id: string;
    readonly transform: LayerTransform;
}
/** A layer placed by its own box rather than a transform — a video clip: its
 *  top-left corner, its width (the height follows its aspect) and its turn. */
interface LayerPlacement {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly rotation: number;
}
/** The app's layers, as the select tool reads and writes them. Points are canvas px. */
interface LayerSelection<L extends SelectableLayer = SelectableLayer> {
    selected(): L | null;
    select(id: string): void;
    /** The frontmost layer drawn under a point, or null. */
    layerAt(x: number, y: number): L | null;
    /** The layer's four drawn corners, clockwise from its own top-left, or null. */
    frameOf(layer: L): readonly {
        x: number;
        y: number;
    }[] | null;
    /** The point it turns and scales about. */
    pivotOf(layer: L): {
        x: number;
        y: number;
    };
    /** The frame its parent group puts it in, or null at the top level. */
    parentModelFor(layer: L): Mat4 | null;
    setLayerTransform(id: string, patch: Partial<LayerTransform>): void;
    /** A layer placed by its own box, or null for one placed by its transform. */
    placementOf?(layer: L): LayerPlacement | null;
    setPlacement?(id: string, patch: Partial<LayerPlacement>): void;
}
interface SelectToolHost<L extends SelectableLayer = SelectableLayer> {
    layers(): LayerSelection<L> | null;
    /** A pointer position in canvas px, unclamped (a layer may sit off the canvas). */
    canvasPoint(event: PointerEvent): {
        x: number;
        y: number;
    };
    /** Canvas px to overlay CSS px. */
    projection(): ViewProjection;
    /** A pointer position in overlay CSS px — the space `projection` maps into. */
    overlayPoint(event: PointerEvent): {
        x: number;
        y: number;
    };
    /** The element that takes pointer capture and wears the cursor. */
    surface(): HTMLElement;
    /** Paint the 2D overlay again. */
    repaint(): void;
    /** A gesture has ended: the panel should read the new placement. */
    onEdited(): void;
}
type Point = {
    x: number;
    y: number;
};
declare const HANDLE_HIT = 9;
declare const ANTS_PERIOD: number;
declare const ANTS_FPS = 16;
declare class SelectTool<L extends SelectableLayer = SelectableLayer> {
    private readonly host;
    private drag;
    private pending;
    private frame;
    private antsPhase;
    private antsTimer;
    /** Whether the last paint drew a frame — the ants run only while one is up. */
    private framed;
    constructor(host: SelectToolHost<L>);
    get dragging(): boolean;
    /** Pointer down with the Select tool. Always consumes the event. */
    begin(event: PointerEvent): boolean;
    /** Pointer move with the Select tool: drives a drag, or sets the hover cursor. */
    move(event: PointerEvent): void;
    end(event: PointerEvent): void;
    cancel(): void;
    /** Paint the selection: the frame as marching ants, and a handle on each corner. */
    paint(ctx: CanvasRenderingContext2D): void;
    /** Another tool took the canvas: no frame, no ants, no cursor of ours. */
    hide(): void;
    dispose(): void;
    private flush;
    /**
     * Stretch each side on its own, the opposite corner still. Worked in the frame's
     * own basis (its edges at grab, U across and V down): the pointer and the grabbed
     * corner, both measured from the still corner in U/V, give one ratio per axis.
     * The stretch acts about the pivot, so the pivot then moves to put the still
     * corner back — the same correction as a plain scale, per axis.
     */
    private stretch;
    /** Which part of the selection frame the pointer is on, in screen px. */
    private hitFrame;
    private hover;
    /** The diagonal a corner resizes along, read from where it sits on screen, so a
     *  turned or flipped frame still shows the right arrow. */
    private scaleCursor;
    private setCursor;
    private startAnts;
    private stopAnts;
}
/** The selection frame's line: white under black dashes, readable on any picture. */
declare function strokeAnts(ctx: CanvasRenderingContext2D, path: Path2D, phase: number): void;
declare function drawHandle(ctx: CanvasRenderingContext2D, p: Point): void;
declare function insideScreenQuad(c: readonly Point[], x: number, y: number): boolean;

export { ANTS_FPS, ANTS_PERIOD, HANDLE_HIT, IDENTITY_PROJECTION, type LayerPlacement, type LayerSelection, SelectTool, type SelectToolHost, type SelectableLayer, type ViewProjection, drawHandle, insideScreenQuad, projectX, projectY, strokeAnts, unprojectX, unprojectY };
