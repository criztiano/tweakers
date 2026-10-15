// A layer's placement, as plain data — shared by every app that lets a picture,
// a shape or a block of text be moved, scaled and turned on a canvas. Pure: no
// DOM, no GPU, no React.
//
// The transform is NON-DESTRUCTIVE by contract: an app keeps its layer's own
// geometry as authored and applies this at draw time only, so a move, a scale or
// a turn is a cheap redraw and never a rebuild — the same class of change as a
// reorder, a hide or an opacity.
//
// Matrices are column-major Float32Array(16) (m[col*4 + row]), matching WGSL's
// mat4x4f, so a GPU renderer uploads them as they are; a 2D canvas reads its
// affine part (m[0], m[1], m[4], m[5], m[12], m[13]) — see `canvasMatrix`.

/** Column-major 4×4, as WGSL's mat4x4f. */
export type Mat4 = Float32Array;

function identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

// result = a * b (apply b first, then a, to a column vector).
function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

/** The plane part of a layer model, in `CanvasRenderingContext2D.setTransform`
 *  order (a, b, c, d, e, f) — how a 2D canvas, or a server compositing the same
 *  layers, draws exactly what a GPU renderer does. */
export function canvasMatrix(model: Mat4): [number, number, number, number, number, number] {
  return [model[0], model[1], model[4], model[5], model[12], model[13]];
}

export interface LayerTransform {
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

export const IDENTITY_TRANSFORM: LayerTransform = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  stretchX: 1,
  stretchY: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
};

/** The point a layer's content is organised around, in canvas pixels. Rotation,
 *  scale and flip act about it; x/y translate FROM it. */
export interface LayerAnchor {
  readonly x: number;
  readonly y: number;
}

export const ORIGIN_ANCHOR: LayerAnchor = { x: 0, y: 0 };

/** Every field in range: a sane offset, a scale from a twentieth to eight times,
 *  a stretch, and the turn wrapped to (-PI, PI]. */
export function clampLayerTransform(raw: Partial<LayerTransform>): LayerTransform {
  const d = IDENTITY_TRANSFORM;
  return {
    // Deliberately unbounded beyond a sanity range: placing a layer partly
    // off-canvas is a legitimate composition, and the canvas can be resized.
    x: clamp(finite(raw.x, d.x), -20000, 20000),
    y: clamp(finite(raw.y, d.y), -20000, 20000),
    z: clamp(finite(raw.z, d.z), -20000, 20000),
    scale: clamp(finite(raw.scale, d.scale), 0.05, 8),
    stretchX: clamp(finite(raw.stretchX, d.stretchX), 0.02, 50),
    stretchY: clamp(finite(raw.stretchY, d.stretchY), 0.02, 50),
    rotation: wrapAngle(finite(raw.rotation, d.rotation)),
    flipX: raw.flipX === true,
    flipY: raw.flipY === true,
  };
}

export function isIdentityTransform(t: LayerTransform): boolean {
  return (
    t.x === 0 &&
    t.y === 0 &&
    t.z === 0 &&
    t.scale === 1 &&
    t.stretchX === 1 &&
    t.stretchY === 1 &&
    t.rotation === 0 &&
    !t.flipX &&
    !t.flipY
  );
}

export function sameTransform(a: LayerTransform, b: LayerTransform): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.z === b.z &&
    a.scale === b.scale &&
    a.stretchX === b.stretchX &&
    a.stretchY === b.stretchY &&
    a.rotation === b.rotation &&
    a.flipX === b.flipX &&
    a.flipY === b.flipY
  );
}

/**
 * The depth cue's scale factor.
 *
 * Clamped on the near side because `focal + z` is singular at `z = -focal`: a
 * layer dragged to exactly the eye would divide by zero and paint a NaN quad. The
 * floor caps the magnification at 20x, well past anything readable.
 */
export function depthScale(z: number, canvasWidth: number, canvasHeight: number): number {
  if (z === 0) return 1;
  const focal = Math.max(1, Math.max(canvasWidth, canvasHeight));
  return focal / Math.max(focal + z, focal * 0.05);
}

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
export function layerModelMatrix(
  t: LayerTransform,
  anchor: LayerAnchor,
  canvasWidth: number,
  canvasHeight: number,
): Mat4 {
  const cos = Math.cos(t.rotation);
  const sin = Math.sin(t.rotation);
  const sx = t.scale * t.stretchX * (t.flipX ? -1 : 1);
  const sy = t.scale * t.stretchY * (t.flipY ? -1 : 1);

  // R·S, then re-anchored: a single matrix rather than three multiplies, because
  // this runs once per transformed layer per plan build.
  const m = identity();
  m[0] = cos * sx;
  m[1] = sin * sx;
  m[4] = -sin * sy;
  m[5] = cos * sy;
  m[12] = anchor.x - (m[0] * anchor.x + m[4] * anchor.y) + t.x;
  m[13] = anchor.y - (m[1] * anchor.x + m[5] * anchor.y) + t.y;
  // Uniform scale reaches z too. A flat layer never reads it (the 2D camera drops z),
  // but a body does: without it, scaling a body would squash it front to back.
  m[10] = t.scale;

  if (t.z === 0) return m;
  // Shrink toward (or grow out of) the canvas centre — in depth as well, for bodies.
  const k = depthScale(t.z, canvasWidth, canvasHeight);
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const cue = identity();
  cue[0] = k;
  cue[5] = k;
  cue[10] = k;
  cue[12] = cx - cx * k;
  cue[13] = cy - cy * k;
  return multiply(cue, m);
}

/** Compose a child's model onto its parent's. Parent applies LAST, so the child's
 *  own placement happens inside the parent's frame — the Photoshop reading of a
 *  group transform. */
export function composeModel(parent: Mat4, child: Mat4): Mat4 {
  return multiply(parent, child);
}

/** Inverse of a layer model for a 2D point — hit-testing and canvas gestures.
 *
 *  Only the x/y block is inverted: every path that produces one of these matrices
 *  leaves the plane affine (the depth cue is a uniform scale about a fixed point),
 *  and a 2D pick has no use for z. */
export function unprojectPoint(model: Mat4, x: number, y: number): { x: number; y: number } {
  const a = model[0];
  const b = model[1];
  const c = model[4];
  const d = model[5];
  const det = a * d - b * c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-9) return { x, y };
  const dx = x - model[12];
  const dy = y - model[13];
  return { x: (d * dx - c * dy) / det, y: (a * dy - b * dx) / det };
}

/** Forward-transform a 2D point by a layer model — the selection frame's corners. */
export function projectPoint(model: Mat4, x: number, y: number): { x: number; y: number } {
  return {
    x: model[0] * x + model[4] * y + model[12],
    y: model[1] * x + model[5] * y + model[13],
  };
}

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
export function bakeTransform(
  model: Mat4,
  anchor: LayerAnchor,
  z: number,
  canvasWidth: number,
  canvasHeight: number,
  stretch: { readonly x: number; readonly y: number } = { x: 1, y: 1 },
): LayerTransform {
  // Peel the layer's own depth cue off the outside first, so the rest is the
  // T·R·S·F part the transform's other fields describe.
  let rest = model;
  if (z !== 0) {
    const k = depthScale(z, canvasWidth, canvasHeight);
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const uncue = identity();
    uncue[0] = 1 / k;
    uncue[5] = 1 / k;
    uncue[10] = 1 / k;
    uncue[12] = cx - cx / k;
    uncue[13] = cy - cy / k;
    rest = multiply(uncue, model);
  }
  if (stretch.x !== 1 || stretch.y !== 1) {
    // Undo the stretch about the anchor, innermost: rest · T(a) · S⁻¹ · T(-a).
    const unstretch = identity();
    unstretch[0] = 1 / stretch.x;
    unstretch[5] = 1 / stretch.y;
    unstretch[12] = anchor.x - anchor.x / stretch.x;
    unstretch[13] = anchor.y - anchor.y / stretch.y;
    rest = multiply(rest, unstretch);
  }
  const a = rest[0];
  const b = rest[1];
  const c = rest[4];
  const d = rest[5];
  const det = a * d - b * c;
  const flipX = det < 0;
  const scale = Math.sqrt(Math.abs(det));
  // With flipX the first column is R·(-s, 0), so it points the opposite way.
  const rotation = flipX ? Math.atan2(-b, -a) : Math.atan2(b, a);
  return clampLayerTransform({
    x: rest[12] - anchor.x + (a * anchor.x + c * anchor.y),
    y: rest[13] - anchor.y + (b * anchor.x + d * anchor.y),
    z,
    scale,
    stretchX: stretch.x,
    stretchY: stretch.y,
    rotation,
    flipX,
    flipY: false,
  });
}

/**
 * The same placement about another pivot. Rotation, scale, stretch and flips act
 * about the anchor, so a layer whose anchor moves — new content with another box, or
 * a group standing in for a layer — keeps every field but the offset, which is solved
 * so every point is drawn where it was: t' = t + d - L·d, with d = from - to and L the
 * transform's linear part. Exact for any transform, stretch included; the depth cue
 * sits outside and is unchanged.
 */
export function reanchorTransform(t: LayerTransform, from: LayerAnchor, to: LayerAnchor): LayerTransform {
  const m = layerModelMatrix({ ...t, z: 0 }, ORIGIN_ANCHOR, 1, 1);
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return clampLayerTransform({ ...t, x: t.x + dx - (m[0] * dx + m[4] * dy), y: t.y + dy - (m[1] * dx + m[5] * dy) });
}

/** Inverse of a similarity model — the frame a re-parented layer has to leave. */
export function invertModel(model: Mat4): Mat4 {
  const a = model[0];
  const b = model[1];
  const c = model[4];
  const d = model[5];
  const det = a * d - b * c;
  const out = identity();
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return out;
  out[0] = d / det;
  out[1] = -b / det;
  out[4] = -c / det;
  out[5] = a / det;
  out[10] = model[10] !== 0 ? 1 / model[10] : 1;
  out[12] = -(out[0] * model[12] + out[4] * model[13]);
  out[13] = -(out[1] * model[12] + out[5] * model[13]);
  return out;
}

/** Translate `by` screen-space canvas pixels, expressed in the layer's own frame.
 *  Dragging a layer inside a rotated group has to move it the way the pointer
 *  moved, not the way its local axes point. */
export function translateInParent(t: LayerTransform, parent: Mat4 | null, dx: number, dy: number): LayerTransform {
  if (!parent) return { ...t, x: t.x + dx, y: t.y + dy };
  const a = parent[0];
  const b = parent[1];
  const c = parent[4];
  const d = parent[5];
  const det = a * d - b * c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-9) return { ...t, x: t.x + dx, y: t.y + dy };
  return { ...t, x: t.x + (d * dx - c * dy) / det, y: t.y + (a * dy - b * dx) / det };
}

/** Proof that project and unproject are inverses across the whole parameter space,
 *  including flips, depth and a two-deep group composition.
 *
 *  A transform that is subtly wrong shows up as geometry landing in the wrong place
 *  under the cursor — expensive to spot by eye, trivial to catch here. Run by this
 *  repo's tests, and callable from an app's own self-checks. */
export function assertTransformRoundTrip(): { worst: number; bakeWorst: number; cases: number } {
  let worst = 0;
  // In canvas px, not a ratio. The bake goes through trig and a square root, and the
  // matrices are Float32Array (they upload as-is), whose epsilon at a coordinate in the
  // thousands is about a thousandth of a pixel — so it is held to a hundredth of a
  // pixel: invisible, and still far below any real mistake, which lands tens of px off.
  let bakeWorst = 0;
  let cases = 0;
  const canvasW = 1080;
  const canvasH = 1920;
  const anchors: LayerAnchor[] = [ORIGIN_ANCHOR, { x: 540, y: 960 }, { x: -200, y: 1500 }];
  const transforms: LayerTransform[] = [];
  for (const rotation of [0, 0.7, -2.4, Math.PI]) {
    for (const scale of [0.05, 1, 3.5]) {
      for (const z of [0, 600, -600]) {
        for (const flipX of [false, true]) {
          for (const flipY of [false, true]) {
            for (const [stretchX, stretchY] of [
              [1, 1],
              [2.5, 0.4],
            ]) {
              transforms.push({ x: 120, y: -75, z, scale, stretchX, stretchY, rotation, flipX, flipY });
            }
          }
        }
      }
    }
  }
  const probes = [
    [0, 0],
    [540, 960],
    [1079, 1919],
    [-300, 2400],
  ] as const;

  for (const t of transforms) {
    for (const anchor of anchors) {
      const model = layerModelMatrix(t, anchor, canvasW, canvasH);
      for (const [x, y] of probes) {
        const there = projectPoint(model, x, y);
        const back = unprojectPoint(model, there.x, there.y);
        worst = Math.max(worst, Math.abs(back.x - x), Math.abs(back.y - y));
        cases++;
      }
      // Two-deep composition: a layer inside a group inside a group must invert
      // through the composed matrix just as cleanly as a lone one.
      const outer = layerModelMatrix({ ...t, rotation: -t.rotation, scale: 1 / t.scale }, anchors[1], canvasW, canvasH);
      const composed = composeModel(outer, model);
      for (const [x, y] of probes) {
        const there = projectPoint(composed, x, y);
        const back = unprojectPoint(composed, there.x, there.y);
        worst = Math.max(worst, Math.abs(back.x - x), Math.abs(back.y - y));
        cases++;
      }
      // Moving the pivot must not move a single point (a picture split into a group).
      const reanchored = layerModelMatrix(reanchorTransform(t, anchor, anchors[2]), anchors[2], canvasW, canvasH);
      for (const [x, y] of probes) {
        const want = projectPoint(model, x, y);
        const got = projectPoint(reanchored, x, y);
        bakeWorst = Math.max(bakeWorst, Math.abs(got.x - want.x), Math.abs(got.y - want.y));
        cases++;
      }
      // Baking a composed placement back into one transform must draw every point
      // exactly where the composition did — what keeps an ungrouped child still. The
      // group is a LEGAL one (in-range scale and offset, its own turn, flip and depth),
      // so nothing the bake returns is clamped; an out-of-range group would be clamped
      // by the model itself long before a bake saw it.
      const group = layerModelMatrix(
        {
          x: -80,
          y: 40,
          z: 300,
          scale: 1.5,
          stretchX: 1,
          stretchY: 1,
          rotation: -t.rotation * 0.5,
          flipX: !t.flipX,
          flipY: false,
        },
        anchors[1],
        canvasW,
        canvasH,
      );
      const inGroup = composeModel(group, model);
      // The group is a similarity, so the child's own stretch must come back exact.
      const baked = bakeTransform(inGroup, anchor, t.z, canvasW, canvasH, { x: t.stretchX, y: t.stretchY });
      const s =
        Math.sqrt(Math.abs(inGroup[0] * inGroup[5] - inGroup[1] * inGroup[4])) / depthScale(t.z, canvasW, canvasH);
      if (s >= 0.05 && s <= 8) {
        const rebuilt = layerModelMatrix(baked, anchor, canvasW, canvasH);
        for (const [x, y] of probes) {
          const want = projectPoint(inGroup, x, y);
          const got = projectPoint(rebuilt, x, y);
          bakeWorst = Math.max(bakeWorst, Math.abs(got.x - want.x), Math.abs(got.y - want.y));
          cases++;
        }
      }
    }
  }
  // Generous next to the 1e-9 the inverse guards on, but tight enough that a sign
  // error or a transposed matrix cannot slip through.
  if (worst > 1e-6) throw new Error(`layer transform round-trip drifted ${worst} over ${cases} cases`);
  if (bakeWorst > 0.01) throw new Error(`baking a composed placement moved a point ${bakeWorst}px`);
  return { worst, bakeWorst, cases };
}

function finite(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Wrapped to (-PI, PI] so a spin gesture can add freely without the stored value
 *  drifting to thousands of radians. */
function wrapAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  let wrapped = angle % twoPi;
  if (wrapped <= -Math.PI) wrapped += twoPi;
  if (wrapped > Math.PI) wrapped -= twoPi;
  return wrapped;
}
