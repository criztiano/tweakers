// src/layer-transform-core.ts
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

// src/layer-select-core.ts
var IDENTITY_PROJECTION = { scale: 1, offsetX: 0, offsetY: 0 };
function projectX(p, x) {
  return p.offsetX + x * p.scale;
}
function projectY(p, y) {
  return p.offsetY + y * p.scale;
}
function unprojectX(p, screenX) {
  return p.scale > 0 ? (screenX - p.offsetX) / p.scale : 0;
}
function unprojectY(p, screenY) {
  return p.scale > 0 ? (screenY - p.offsetY) / p.scale : 0;
}
var HANDLE = 8;
var HANDLE_HIT = 9;
var ROTATE_HIT = 26;
var ANTS_DASH = [5, 4];
var ANTS_PERIOD = ANTS_DASH[0] + ANTS_DASH[1];
var ANTS_FPS = 16;
var SNAP = Math.PI / 12;
var ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7" stroke="#000" stroke-width="4"/><path d="M20 4v4h-4" stroke="#000" stroke-width="4"/><path d="M20 12a8 8 0 1 1-2.3-5.7" stroke="#fff" stroke-width="2"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="2"/></svg>'
)}") 12 12, crosshair`;
var SelectTool = class {
  constructor(host) {
    this.drag = null;
    this.pending = null;
    this.frame = 0;
    this.antsPhase = 0;
    this.antsTimer = 0;
    /** Whether the last paint drew a frame — the ants run only while one is up. */
    this.framed = false;
    this.host = host;
  }
  get dragging() {
    return this.drag !== null;
  }
  /** Pointer down with the Select tool. Always consumes the event. */
  begin(event) {
    const session = this.host.layers();
    if (!session) return true;
    const pt = this.host.canvasPoint(event);
    const selected = session.selected();
    const frame = selected ? session.frameOf(selected) : null;
    let target = null;
    let gesture = "move";
    let corner = -1;
    if (selected && frame) {
      const hit = this.hitFrame(frame, event);
      if (hit) {
        target = selected;
        gesture = event.altKey ? "rotate" : hit.gesture;
        corner = hit.corner;
      }
    }
    if (!target) {
      target = session.layerAt(pt.x, pt.y);
      if (!target) return true;
      if (target.id !== selected?.id) session.select(target.id);
    }
    const targetFrame = session.frameOf(target);
    const pivot = session.pivotOf(target);
    const placement = session.placementOf?.(target) ?? null;
    const parent = placement ? null : session.parentModelFor(target);
    this.drag = {
      layerId: target.id,
      gesture,
      from: pt,
      origin: target.transform,
      clip: placement ? { ...placement } : null,
      parent,
      pivot,
      fixed: corner >= 0 && targetFrame ? targetFrame[(corner + 2) % 4] : pivot,
      handed: parent && parent[0] * parent[5] - parent[1] * parent[4] < 0 ? -1 : 1,
      frame: targetFrame
    };
    try {
      this.host.surface().setPointerCapture(event.pointerId);
    } catch {
    }
    this.setCursor(gesture === "move" ? "move" : gesture === "rotate" ? ROTATE_CURSOR : this.scaleCursor(corner));
    this.host.repaint();
    return true;
  }
  /** Pointer move with the Select tool: drives a drag, or sets the hover cursor. */
  move(event) {
    if (!this.drag) {
      this.hover(event);
      return;
    }
    this.pending = {
      point: this.host.canvasPoint(event),
      shift: event.shiftKey,
      free: event.shiftKey || event.metaKey
    };
    if (this.frame === 0) {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.flush();
      });
    }
  }
  end(event) {
    if (!this.drag) return;
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pending = {
      point: this.host.canvasPoint(event),
      shift: event.shiftKey,
      free: event.shiftKey || event.metaKey
    };
    this.flush();
    this.drag = null;
    try {
      this.host.surface().releasePointerCapture(event.pointerId);
    } catch {
    }
    this.hover(event);
    this.host.onEdited();
    this.host.repaint();
  }
  cancel() {
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.drag = null;
    this.pending = null;
    this.setCursor("");
  }
  /** Paint the selection: the frame as marching ants, and a handle on each corner. */
  paint(ctx) {
    const session = this.host.layers();
    const layer = session?.selected();
    const frame = layer && session ? session.frameOf(layer) : null;
    this.framed = frame !== null;
    if (!frame) {
      this.stopAnts();
      return;
    }
    const proj = this.host.projection();
    const c = frame.map((p) => ({ x: projectX(proj, p.x), y: projectY(proj, p.y) }));
    ctx.save();
    const path = new Path2D();
    c.forEach((p, i) => i === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y));
    path.closePath();
    strokeAnts(ctx, path, this.antsPhase);
    for (const p of c) drawHandle(ctx, p);
    ctx.restore();
    this.startAnts();
  }
  /** Another tool took the canvas: no frame, no ants, no cursor of ours. */
  hide() {
    this.cancel();
    this.framed = false;
    this.stopAnts();
  }
  dispose() {
    this.hide();
  }
  // --- the gesture ---------------------------------------------------------------
  flush() {
    const drag = this.drag;
    const next = this.pending;
    const session = this.host.layers();
    this.pending = null;
    if (!drag || !next || !session) return;
    const { point, shift, free } = next;
    if (drag.gesture === "move") {
      let dx = point.x - drag.from.x;
      let dy = point.y - drag.from.y;
      if (shift) {
        if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      if (drag.clip) session.setPlacement?.(drag.layerId, { x: drag.clip.x + dx, y: drag.clip.y + dy });
      else {
        const moved2 = translateInParent(drag.origin, drag.parent, dx, dy);
        session.setLayerTransform(drag.layerId, { x: moved2.x, y: moved2.y });
      }
      return;
    }
    if (drag.gesture === "rotate") {
      const grab = Math.atan2(drag.from.y - drag.pivot.y, drag.from.x - drag.pivot.x);
      const now = Math.atan2(point.y - drag.pivot.y, point.x - drag.pivot.x);
      const base = drag.clip ? drag.clip.rotation : drag.origin.rotation;
      let rotation = base + drag.handed * (now - grab);
      if (shift) rotation = Math.round(rotation / SNAP) * SNAP;
      if (drag.clip) session.setPlacement?.(drag.layerId, { rotation });
      else session.setLayerTransform(drag.layerId, { rotation });
      return;
    }
    if (free && !drag.clip && drag.frame) {
      this.stretch(drag, point);
      return;
    }
    const still = drag.fixed;
    const grabbed = Math.hypot(drag.from.x - still.x, drag.from.y - still.y);
    if (grabbed < 1e-3) return;
    const k = Math.max(0.02, Math.hypot(point.x - still.x, point.y - still.y) / grabbed);
    const shiftX = (still.x - drag.pivot.x) * (1 - k);
    const shiftY = (still.y - drag.pivot.y) * (1 - k);
    const restStretch = { stretchX: drag.origin.stretchX, stretchY: drag.origin.stretchY };
    if (drag.clip) {
      session.setPlacement?.(drag.layerId, {
        width: drag.clip.width * k,
        x: drag.clip.x + shiftX,
        y: drag.clip.y + shiftY
      });
      return;
    }
    const moved = translateInParent(drag.origin, drag.parent, shiftX, shiftY);
    session.setLayerTransform(drag.layerId, { scale: drag.origin.scale * k, ...restStretch, x: moved.x, y: moved.y });
  }
  /**
   * Stretch each side on its own, the opposite corner still. Worked in the frame's
   * own basis (its edges at grab, U across and V down): the pointer and the grabbed
   * corner, both measured from the still corner in U/V, give one ratio per axis.
   * The stretch acts about the pivot, so the pivot then moves to put the still
   * corner back — the same correction as a plain scale, per axis.
   */
  stretch(drag, point) {
    const session = this.host.layers();
    const f = drag.frame;
    if (!session || !f) return;
    const U = { x: f[1].x - f[0].x, y: f[1].y - f[0].y };
    const V = { x: f[3].x - f[0].x, y: f[3].y - f[0].y };
    const det = U.x * V.y - U.y * V.x;
    if (Math.abs(det) < 1e-6) return;
    const inBasis = (dx, dy) => ({ u: (dx * V.y - dy * V.x) / det, v: (U.x * dy - U.y * dx) / det });
    const O = drag.fixed;
    const grab = inBasis(drag.from.x - O.x, drag.from.y - O.y);
    const now = inBasis(point.x - O.x, point.y - O.y);
    if (Math.abs(grab.u) < 1e-6 || Math.abs(grab.v) < 1e-6) return;
    const kx = Math.max(0.02, now.u / grab.u);
    const ky = Math.max(0.02, now.v / grab.v);
    const w = inBasis(O.x - drag.pivot.x, O.y - drag.pivot.y);
    const shiftX = O.x - drag.pivot.x - (w.u * kx * U.x + w.v * ky * V.x);
    const shiftY = O.y - drag.pivot.y - (w.u * kx * U.y + w.v * ky * V.y);
    const moved = translateInParent(drag.origin, drag.parent, shiftX, shiftY);
    session.setLayerTransform(drag.layerId, {
      scale: drag.origin.scale,
      stretchX: drag.origin.stretchX * kx,
      stretchY: drag.origin.stretchY * ky,
      x: moved.x,
      y: moved.y
    });
  }
  /** Which part of the selection frame the pointer is on, in screen px. */
  hitFrame(frame, event) {
    const proj = this.host.projection();
    const c = frame.map((p) => ({ x: projectX(proj, p.x), y: projectY(proj, p.y) }));
    const { x: sx, y: sy } = this.host.overlayPoint(event);
    for (let i = 0; i < 4; i++) {
      if (Math.hypot(sx - c[i].x, sy - c[i].y) <= HANDLE_HIT) return { gesture: "scale", corner: i };
    }
    if (insideScreenQuad(c, sx, sy)) return { gesture: "move", corner: -1 };
    for (let i = 0; i < 4; i++) {
      if (Math.hypot(sx - c[i].x, sy - c[i].y) <= ROTATE_HIT) return { gesture: "rotate", corner: i };
    }
    return null;
  }
  hover(event) {
    const session = this.host.layers();
    const layer = session?.selected();
    const frame = layer && session ? session.frameOf(layer) : null;
    const hit = frame ? this.hitFrame(frame, event) : null;
    if (!hit) {
      const pt = this.host.canvasPoint(event);
      this.setCursor(session?.layerAt(pt.x, pt.y) ? "pointer" : "");
      return;
    }
    const gesture = event.altKey ? "rotate" : hit.gesture;
    this.setCursor(gesture === "move" ? "move" : gesture === "rotate" ? ROTATE_CURSOR : this.scaleCursor(hit.corner));
  }
  /** The diagonal a corner resizes along, read from where it sits on screen, so a
   *  turned or flipped frame still shows the right arrow. */
  scaleCursor(corner) {
    const session = this.host.layers();
    const layer = session?.selected();
    const frame = layer && session ? session.frameOf(layer) : null;
    if (!frame || corner < 0) return "nwse-resize";
    const a = frame[corner];
    const b = frame[(corner + 2) % 4];
    return (a.x - b.x) * (a.y - b.y) >= 0 ? "nwse-resize" : "nesw-resize";
  }
  setCursor(cursor) {
    const surface = this.host.surface();
    if (surface.style.cursor !== cursor) surface.style.cursor = cursor;
  }
  // --- the marching ants -----------------------------------------------------------
  startAnts() {
    if (this.antsTimer !== 0) return;
    this.antsTimer = window.setInterval(() => {
      if (!this.framed) {
        this.stopAnts();
        return;
      }
      if (document.hidden) return;
      this.antsPhase = (this.antsPhase + 1) % ANTS_PERIOD;
      this.host.repaint();
    }, 1e3 / ANTS_FPS);
  }
  stopAnts() {
    if (this.antsTimer === 0) return;
    window.clearInterval(this.antsTimer);
    this.antsTimer = 0;
  }
};
function strokeAnts(ctx, path, phase) {
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.stroke(path);
  ctx.setLineDash(ANTS_DASH);
  ctx.lineDashOffset = -phase;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
  ctx.stroke(path);
  ctx.setLineDash([]);
}
function drawHandle(ctx, p) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(p.x - HANDLE / 2, p.y - HANDLE / 2, HANDLE, HANDLE);
  ctx.strokeRect(p.x - HANDLE / 2 + 0.5, p.y - HANDLE / 2 + 0.5, HANDLE - 1, HANDLE - 1);
}
function insideScreenQuad(c, x, y) {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = c[i];
    const b = c[(i + 1) % 4];
    const cross = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
    if (cross === 0) continue;
    const s = Math.sign(cross);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}
export {
  ANTS_FPS,
  ANTS_PERIOD,
  HANDLE_HIT,
  IDENTITY_PROJECTION,
  SelectTool,
  drawHandle,
  insideScreenQuad,
  projectX,
  projectY,
  strokeAnts,
  unprojectX,
  unprojectY
};
//# sourceMappingURL=layer-select-core.js.map