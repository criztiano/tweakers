/** Column-major 4×4, as WGSL's mat4x4f. */
type Mat4 = Float32Array;
/** The plane part of a layer model, in `CanvasRenderingContext2D.setTransform`
 *  order (a, b, c, d, e, f) — how a 2D canvas, or a server compositing the same
 *  layers, draws exactly what a GPU renderer does. */
declare function canvasMatrix(model: Mat4): [number, number, number, number, number, number];
interface LayerTransform {
    /** Translation in canvas pixels, FROM the layer's own anchor. */
    readonly x: number;
    readonly y: number;
    /**
     * Depth, in canvas pixels along the view axis: a perspective CUE. The layer is
     * scaled about the canvas centre by `focal / (focal + z)`, so a far layer shrinks
     * toward the centre and a near one grows past the frame.
     *
     * The same for a 3D body as for a flat layer, deliberately. The camera is
     * orthographic, so a bare z translation would move a body without changing a
     * single pixel; the cue is what makes a far body look far. It scales the body's
     * depth along with its width and height, so its proportions hold.
     *
     * It CANNOT change which layer is in front. Painter order is the layer array,
     * and every overlay node is drawn with a cleared-and-discarded depth buffer, so
     * depth never provides cross-object ordering. Z is a depth cue, never a sort key.
     */
    readonly z: number;
    /** The layer's size, the same along both of its axes. */
    readonly scale: number;
    /** An uneven stretch along the layer's OWN axes, on top of `scale` (1 = none) —
     *  what the select tool's Shift/Cmd corner drag sets. */
    readonly stretchX: number;
    readonly stretchY: number;
    /** Radians about Z, through the anchor. The panel exposes degrees. */
    readonly rotation: number;
    readonly flipX: boolean;
    readonly flipY: boolean;
}
declare const IDENTITY_TRANSFORM: LayerTransform;
/** The point a layer's content is organised around, in canvas pixels. Rotation,
 *  scale and flip act about it; x/y translate FROM it. */
interface LayerAnchor {
    readonly x: number;
    readonly y: number;
}
declare const ORIGIN_ANCHOR: LayerAnchor;
/** Every field in range: a sane offset, a scale from a twentieth to eight times,
 *  a stretch, and the turn wrapped to (-PI, PI]. */
declare function clampLayerTransform(raw: Partial<LayerTransform>): LayerTransform;
declare function isIdentityTransform(t: LayerTransform): boolean;
declare function sameTransform(a: LayerTransform, b: LayerTransform): boolean;
/**
 * The depth cue's scale factor.
 *
 * Clamped on the near side because `focal + z` is singular at `z = -focal`: a
 * layer dragged to exactly the eye would divide by zero and paint a NaN quad. The
 * floor caps the magnification at 20x, well past anything readable.
 */
declare function depthScale(z: number, canvasWidth: number, canvasHeight: number): number;
/**
 * model = Depth(z) · T(x, y) · T(anchor) · Rz · S(scale, flips) · T(-anchor)
 *
 * Depth is outermost: it scales the already-placed layer about the canvas centre,
 * so pushing a layer back pulls it toward the vanishing point from wherever it sits.
 *
 * Because x/y translate FROM the anchor and rotation/scale act ABOUT it, the fixed
 * point of the rotation after translation is `anchor + (x, y)`: where the layer
 * sits, and what it spins about.
 *
 * Column-major Float32Array(16), matching Mat4.ts and WGSL's mat4x4f.
 */
declare function layerModelMatrix(t: LayerTransform, anchor: LayerAnchor, canvasWidth: number, canvasHeight: number): Mat4;
/** Compose a child's model onto its parent's. Parent applies LAST, so the child's
 *  own placement happens inside the parent's frame — the Photoshop reading of a
 *  group transform. */
declare function composeModel(parent: Mat4, child: Mat4): Mat4;
/** Inverse of a layer model for a 2D point — hit-testing and canvas gestures.
 *
 *  Only the x/y block is inverted: every path that produces one of these matrices
 *  leaves the plane affine (the depth cue is a uniform scale about a fixed point),
 *  and a 2D pick has no use for z. */
declare function unprojectPoint(model: Mat4, x: number, y: number): {
    x: number;
    y: number;
};
/** Forward-transform a 2D point by a layer model — the selection frame's corners. */
declare function projectPoint(model: Mat4, x: number, y: number): {
    x: number;
    y: number;
};
/**
 * The transform that, with `anchor`, draws a layer exactly where `model` does —
 * keeping `z` as the layer's own depth.
 *
 * What ungrouping and re-parenting need: a child leaving a moved group, or joining
 * one, must not jump. Its new own-transform is solved from where it is drawn now.
 * Always solvable, because every placement here is a similarity (uniform scale,
 * rotation, flips, translation) and similarities compose into similarities. A
 * mirror comes back as flipX alone: flipX+flipY is a half-turn, so the pair is
 * never needed to express one.
 *
 * A layer's own `stretch` is not a similarity, so it is taken off the inside first
 * and handed back unchanged: exact whenever the change of frame is itself a
 * similarity. Moving a stretched layer into a turned AND stretched group would need
 * a skew, which a transform cannot hold — that case lands as the nearest fit.
 */
declare function bakeTransform(model: Mat4, anchor: LayerAnchor, z: number, canvasWidth: number, canvasHeight: number, stretch?: {
    readonly x: number;
    readonly y: number;
}): LayerTransform;
/**
 * The same placement about another pivot. Rotation, scale, stretch and flips act
 * about the anchor, so a layer whose anchor moves — new content with another box, or
 * a group standing in for a layer — keeps every field but the offset, which is solved
 * so every point is drawn where it was: t' = t + d - L·d, with d = from - to and L the
 * transform's linear part. Exact for any transform, stretch included; the depth cue
 * sits outside and is unchanged.
 */
declare function reanchorTransform(t: LayerTransform, from: LayerAnchor, to: LayerAnchor): LayerTransform;
/** Inverse of a similarity model — the frame a re-parented layer has to leave. */
declare function invertModel(model: Mat4): Mat4;
/** Translate `by` screen-space canvas pixels, expressed in the layer's own frame.
 *  Dragging a layer inside a rotated group has to move it the way the pointer
 *  moved, not the way its local axes point. */
declare function translateInParent(t: LayerTransform, parent: Mat4 | null, dx: number, dy: number): LayerTransform;
/** Proof that project and unproject are inverses across the whole parameter space,
 *  including flips, depth and a two-deep group composition.
 *
 *  A transform that is subtly wrong shows up as geometry landing in the wrong place
 *  under the cursor — expensive to spot by eye, trivial to catch here. Run by this
 *  repo's tests, and callable from an app's own self-checks. */
declare function assertTransformRoundTrip(): {
    worst: number;
    bakeWorst: number;
    cases: number;
};

export { IDENTITY_TRANSFORM, type LayerAnchor, type LayerTransform, type Mat4, ORIGIN_ANCHOR, assertTransformRoundTrip, bakeTransform, canvasMatrix, clampLayerTransform, composeModel, depthScale, invertModel, isIdentityTransform, layerModelMatrix, projectPoint, reanchorTransform, sameTransform, translateInParent, unprojectPoint };
