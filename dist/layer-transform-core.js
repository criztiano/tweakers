// src/layer-transform-core.ts
function identity() {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}
function multiply(a, b) {
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
function canvasMatrix(model) {
  return [model[0], model[1], model[4], model[5], model[12], model[13]];
}
var IDENTITY_TRANSFORM = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  stretchX: 1,
  stretchY: 1,
  rotation: 0,
  flipX: false,
  flipY: false
};
var ORIGIN_ANCHOR = { x: 0, y: 0 };
function clampLayerTransform(raw) {
  const d = IDENTITY_TRANSFORM;
  return {
    // Deliberately unbounded beyond a sanity range: placing a layer partly
    // off-canvas is a legitimate composition, and the canvas can be resized.
    x: clamp(finite(raw.x, d.x), -2e4, 2e4),
    y: clamp(finite(raw.y, d.y), -2e4, 2e4),
    z: clamp(finite(raw.z, d.z), -2e4, 2e4),
    scale: clamp(finite(raw.scale, d.scale), 0.05, 8),
    stretchX: clamp(finite(raw.stretchX, d.stretchX), 0.02, 50),
    stretchY: clamp(finite(raw.stretchY, d.stretchY), 0.02, 50),
    rotation: wrapAngle(finite(raw.rotation, d.rotation)),
    flipX: raw.flipX === true,
    flipY: raw.flipY === true
  };
}
function isIdentityTransform(t) {
  return t.x === 0 && t.y === 0 && t.z === 0 && t.scale === 1 && t.stretchX === 1 && t.stretchY === 1 && t.rotation === 0 && !t.flipX && !t.flipY;
}
function sameTransform(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z && a.scale === b.scale && a.stretchX === b.stretchX && a.stretchY === b.stretchY && a.rotation === b.rotation && a.flipX === b.flipX && a.flipY === b.flipY;
}
function depthScale(z, canvasWidth, canvasHeight) {
  if (z === 0) return 1;
  const focal = Math.max(1, Math.max(canvasWidth, canvasHeight));
  return focal / Math.max(focal + z, focal * 0.05);
}
function layerModelMatrix(t, anchor, canvasWidth, canvasHeight) {
  const cos = Math.cos(t.rotation);
  const sin = Math.sin(t.rotation);
  const sx = t.scale * t.stretchX * (t.flipX ? -1 : 1);
  const sy = t.scale * t.stretchY * (t.flipY ? -1 : 1);
  const m = identity();
  m[0] = cos * sx;
  m[1] = sin * sx;
  m[4] = -sin * sy;
  m[5] = cos * sy;
  m[12] = anchor.x - (m[0] * anchor.x + m[4] * anchor.y) + t.x;
  m[13] = anchor.y - (m[1] * anchor.x + m[5] * anchor.y) + t.y;
  m[10] = t.scale;
  if (t.z === 0) return m;
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
function composeModel(parent, child) {
  return multiply(parent, child);
}
function unprojectPoint(model, x, y) {
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
function projectPoint(model, x, y) {
  return {
    x: model[0] * x + model[4] * y + model[12],
    y: model[1] * x + model[5] * y + model[13]
  };
}
function bakeTransform(model, anchor, z, canvasWidth, canvasHeight, stretch = { x: 1, y: 1 }) {
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
    flipY: false
  });
}
function reanchorTransform(t, from, to) {
  const m = layerModelMatrix({ ...t, z: 0 }, ORIGIN_ANCHOR, 1, 1);
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return clampLayerTransform({ ...t, x: t.x + dx - (m[0] * dx + m[4] * dy), y: t.y + dy - (m[1] * dx + m[5] * dy) });
}
function invertModel(model) {
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
function translateInParent(t, parent, dx, dy) {
  if (!parent) return { ...t, x: t.x + dx, y: t.y + dy };
  const a = parent[0];
  const b = parent[1];
  const c = parent[4];
  const d = parent[5];
  const det = a * d - b * c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-9) return { ...t, x: t.x + dx, y: t.y + dy };
  return { ...t, x: t.x + (d * dx - c * dy) / det, y: t.y + (a * dy - b * dx) / det };
}
function assertTransformRoundTrip() {
  let worst = 0;
  let bakeWorst = 0;
  let cases = 0;
  const canvasW = 1080;
  const canvasH = 1920;
  const anchors = [ORIGIN_ANCHOR, { x: 540, y: 960 }, { x: -200, y: 1500 }];
  const transforms = [];
  for (const rotation of [0, 0.7, -2.4, Math.PI]) {
    for (const scale of [0.05, 1, 3.5]) {
      for (const z of [0, 600, -600]) {
        for (const flipX of [false, true]) {
          for (const flipY of [false, true]) {
            for (const [stretchX, stretchY] of [
              [1, 1],
              [2.5, 0.4]
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
    [-300, 2400]
  ];
  for (const t of transforms) {
    for (const anchor of anchors) {
      const model = layerModelMatrix(t, anchor, canvasW, canvasH);
      for (const [x, y] of probes) {
        const there = projectPoint(model, x, y);
        const back = unprojectPoint(model, there.x, there.y);
        worst = Math.max(worst, Math.abs(back.x - x), Math.abs(back.y - y));
        cases++;
      }
      const outer = layerModelMatrix({ ...t, rotation: -t.rotation, scale: 1 / t.scale }, anchors[1], canvasW, canvasH);
      const composed = composeModel(outer, model);
      for (const [x, y] of probes) {
        const there = projectPoint(composed, x, y);
        const back = unprojectPoint(composed, there.x, there.y);
        worst = Math.max(worst, Math.abs(back.x - x), Math.abs(back.y - y));
        cases++;
      }
      const reanchored = layerModelMatrix(reanchorTransform(t, anchor, anchors[2]), anchors[2], canvasW, canvasH);
      for (const [x, y] of probes) {
        const want = projectPoint(model, x, y);
        const got = projectPoint(reanchored, x, y);
        bakeWorst = Math.max(bakeWorst, Math.abs(got.x - want.x), Math.abs(got.y - want.y));
        cases++;
      }
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
          flipY: false
        },
        anchors[1],
        canvasW,
        canvasH
      );
      const inGroup = composeModel(group, model);
      const baked = bakeTransform(inGroup, anchor, t.z, canvasW, canvasH, { x: t.stretchX, y: t.stretchY });
      const s = Math.sqrt(Math.abs(inGroup[0] * inGroup[5] - inGroup[1] * inGroup[4])) / depthScale(t.z, canvasW, canvasH);
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
  if (worst > 1e-6) throw new Error(`layer transform round-trip drifted ${worst} over ${cases} cases`);
  if (bakeWorst > 0.01) throw new Error(`baking a composed placement moved a point ${bakeWorst}px`);
  return { worst, bakeWorst, cases };
}
function finite(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function wrapAngle(angle) {
  const twoPi = Math.PI * 2;
  let wrapped = angle % twoPi;
  if (wrapped <= -Math.PI) wrapped += twoPi;
  if (wrapped > Math.PI) wrapped -= twoPi;
  return wrapped;
}
export {
  IDENTITY_TRANSFORM,
  ORIGIN_ANCHOR,
  assertTransformRoundTrip,
  bakeTransform,
  canvasMatrix,
  clampLayerTransform,
  composeModel,
  depthScale,
  invertModel,
  isIdentityTransform,
  layerModelMatrix,
  projectPoint,
  reanchorTransform,
  sameTransform,
  translateInParent,
  unprojectPoint
};
//# sourceMappingURL=layer-transform-core.js.map