// The select tool: click a layer to select it, then move, scale and turn it on the
// canvas through a marching-ants frame with corner handles. Framework-free: it
// draws on a 2D overlay canvas and reads pointer events, and the app answers for
// its layers through `LayerSelectHost` — so a WebGPU scene and a stack of
// pictures on a 2D canvas get the same hand.
//
//   drag inside the frame        move       Shift: straight across or straight up/down
//   drag a corner handle         scale      in proportion, from the opposite corner;
//                                           Shift or Cmd: stretch each side on its own
//   Alt + drag on the frame      turn       Shift: in 15° steps
//   drag just outside a corner   turn       (the same, without the key)
//   click another layer          select it (and a drag moves it at once)
//   click empty canvas           keep the selection
//
// A stretch is along the layer's OWN axes (LayerTransform.stretchX/Y), so a turned
// layer stretches along its edges, not the screen's. A layer placed by its own box
// (`placementOf`, a video clip) keeps its aspect: its corners always scale in
// proportion.
//
// Everything is measured from the grab, never accumulated per move, so a long drag
// cannot drift; and the frame and the pointer use the same corners (`frameOf`), so
// a handle is always where it is drawn. Handle sizes are SCREEN px — the frame is
// chrome, not part of the picture, and keeps its weight at any zoom.

import { translateInParent, type LayerTransform, type Mat4 } from './layer-transform-core';

/** Canvas pixels -> overlay CSS pixels: the one mapping the overlay draws with, so
 *  the frame can never disagree with the picture under it. */
export interface ViewProjection {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export const IDENTITY_PROJECTION: ViewProjection = { scale: 1, offsetX: 0, offsetY: 0 };

export function projectX(p: ViewProjection, x: number): number {
  return p.offsetX + x * p.scale;
}

export function projectY(p: ViewProjection, y: number): number {
  return p.offsetY + y * p.scale;
}

export function unprojectX(p: ViewProjection, screenX: number): number {
  return p.scale > 0 ? (screenX - p.offsetX) / p.scale : 0;
}

export function unprojectY(p: ViewProjection, screenY: number): number {
  return p.scale > 0 ? (screenY - p.offsetY) / p.scale : 0;
}

/** A layer as the tool sees it: who it is and where it is placed. */
export interface SelectableLayer {
  readonly id: string;
  readonly transform: LayerTransform;
}

/** A layer placed by its own box rather than a transform — a video clip: its
 *  top-left corner, its width (the height follows its aspect) and its turn. */
export interface LayerPlacement {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly rotation: number;
}

/** The app's layers, as the select tool reads and writes them. Points are canvas px. */
export interface LayerSelection<L extends SelectableLayer = SelectableLayer> {
  selected(): L | null;
  select(id: string): void;
  /** The frontmost layer drawn under a point, or null. */
  layerAt(x: number, y: number): L | null;
  /** The layer's four drawn corners, clockwise from its own top-left, or null. */
  frameOf(layer: L): readonly { x: number; y: number }[] | null;
  /** The point it turns and scales about. */
  pivotOf(layer: L): { x: number; y: number };
  /** The frame its parent group puts it in, or null at the top level. */
  parentModelFor(layer: L): Mat4 | null;
  setLayerTransform(id: string, patch: Partial<LayerTransform>): void;
  /** A layer placed by its own box, or null for one placed by its transform. */
  placementOf?(layer: L): LayerPlacement | null;
  setPlacement?(id: string, patch: Partial<LayerPlacement>): void;
}

export interface SelectToolHost<L extends SelectableLayer = SelectableLayer> {
  layers(): LayerSelection<L> | null;
  /** A pointer position in canvas px, unclamped (a layer may sit off the canvas). */
  canvasPoint(event: PointerEvent): { x: number; y: number };
  /** Canvas px to overlay CSS px. */
  projection(): ViewProjection;
  /** A pointer position in overlay CSS px — the space `projection` maps into. */
  overlayPoint(event: PointerEvent): { x: number; y: number };
  /** The element that takes pointer capture and wears the cursor. */
  surface(): HTMLElement;
  /** Paint the 2D overlay again. */
  repaint(): void;
  /** A gesture has ended: the panel should read the new placement. */
  onEdited(): void;
}

type Point = { x: number; y: number };
type Gesture = 'move' | 'scale' | 'rotate';

interface Drag {
  readonly layerId: string;
  readonly gesture: Gesture;
  readonly from: Point;
  readonly origin: LayerTransform;
  /** A layer placed by its own box keeps that placement, so its drag writes it instead. */
  readonly clip: LayerPlacement | null;
  readonly parent: Mat4 | null;
  /** The pivot a scale or turn happens about, canvas px. */
  readonly pivot: Point;
  /** The corner a scale keeps still (the one opposite the handle), canvas px. */
  readonly fixed: Point;
  /** A mirrored parent turns "clockwise" the other way. */
  readonly handed: 1 | -1;
  /** The frame at grab — its edges are the layer's own axes, for a stretch. */
  readonly frame: readonly Point[] | null;
}

const HANDLE = 8; // handle side, CSS px
export const HANDLE_HIT = 9; // grab radius around a corner, CSS px
const ROTATE_HIT = 26; // how far outside a corner still turns, CSS px
const ANTS_DASH = [5, 4];
export const ANTS_PERIOD = ANTS_DASH[0] + ANTS_DASH[1];
export const ANTS_FPS = 16;
const SNAP = Math.PI / 12; // 15°

// A curved-arrow cursor for the turn zone: there is no system "rotate" cursor.
const ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 12a8 8 0 1 1-2.3-5.7" stroke="#000" stroke-width="4"/><path d="M20 4v4h-4" stroke="#000" stroke-width="4"/>' +
    '<path d="M20 12a8 8 0 1 1-2.3-5.7" stroke="#fff" stroke-width="2"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="2"/></svg>',
)}") 12 12, crosshair`;

export class SelectTool<L extends SelectableLayer = SelectableLayer> {
  private readonly host: SelectToolHost<L>;
  private drag: Drag | null = null;
  private pending: { point: Point; shift: boolean; free: boolean } | null = null;
  private frame = 0;
  private antsPhase = 0;
  private antsTimer = 0;
  /** Whether the last paint drew a frame — the ants run only while one is up. */
  private framed = false;

  constructor(host: SelectToolHost<L>) {
    this.host = host;
  }

  get dragging(): boolean {
    return this.drag !== null;
  }

  /** Pointer down with the Select tool. Always consumes the event. */
  begin(event: PointerEvent): boolean {
    const session = this.host.layers();
    if (!session) return true;
    const pt = this.host.canvasPoint(event);
    const selected = session.selected();
    const frame = selected ? session.frameOf(selected) : null;
    let target: L | null = null;
    let gesture: Gesture = 'move';
    let corner = -1;
    if (selected && frame) {
      const hit = this.hitFrame(frame, event);
      if (hit) {
        target = selected;
        // Alt turns from anywhere on the frame, handles included.
        gesture = event.altKey ? 'rotate' : hit.gesture;
        corner = hit.corner;
      }
    }
    if (!target) {
      // Not on the selection: whatever is drawn under the pointer is selected, and
      // the same press already drags it. A press on empty canvas keeps the
      // selection: clearing it would empty the panel and shift the whole layout.
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
      frame: targetFrame,
    };
    try {
      this.host.surface().setPointerCapture(event.pointerId);
    } catch {
      // Best effort; the deltas still work without capture.
    }
    this.setCursor(gesture === 'move' ? 'move' : gesture === 'rotate' ? ROTATE_CURSOR : this.scaleCursor(corner));
    this.host.repaint();
    return true;
  }

  /** Pointer move with the Select tool: drives a drag, or sets the hover cursor. */
  move(event: PointerEvent): void {
    if (!this.drag) {
      this.hover(event);
      return;
    }
    this.pending = {
      point: this.host.canvasPoint(event),
      shift: event.shiftKey,
      free: event.shiftKey || event.metaKey,
    };
    if (this.frame === 0) {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.flush();
      });
    }
  }

  end(event: PointerEvent): void {
    if (!this.drag) return;
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pending = {
      point: this.host.canvasPoint(event),
      shift: event.shiftKey,
      free: event.shiftKey || event.metaKey,
    };
    this.flush(); // land on the release point, not the last frame's
    this.drag = null;
    try {
      this.host.surface().releasePointerCapture(event.pointerId);
    } catch {
      // May already be released.
    }
    this.hover(event);
    this.host.onEdited();
    this.host.repaint();
  }

  cancel(): void {
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.drag = null;
    this.pending = null;
    this.setCursor('');
  }

  /** Paint the selection: the frame as marching ants, and a handle on each corner. */
  paint(ctx: CanvasRenderingContext2D): void {
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
    c.forEach((p, i) => (i === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y)));
    path.closePath();
    strokeAnts(ctx, path, this.antsPhase);
    for (const p of c) drawHandle(ctx, p);
    ctx.restore();
    this.startAnts();
  }

  /** Another tool took the canvas: no frame, no ants, no cursor of ours. */
  hide(): void {
    this.cancel();
    this.framed = false;
    this.stopAnts();
  }

  dispose(): void {
    this.hide();
  }

  // --- the gesture ---------------------------------------------------------------

  private flush(): void {
    const drag = this.drag;
    const next = this.pending;
    const session = this.host.layers();
    this.pending = null;
    if (!drag || !next || !session) return;
    const { point, shift, free } = next;
    if (drag.gesture === 'move') {
      let dx = point.x - drag.from.x;
      let dy = point.y - drag.from.y;
      if (shift) {
        if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      if (drag.clip) session.setPlacement?.(drag.layerId, { x: drag.clip.x + dx, y: drag.clip.y + dy });
      else {
        const moved = translateInParent(drag.origin, drag.parent, dx, dy);
        session.setLayerTransform(drag.layerId, { x: moved.x, y: moved.y });
      }
      return;
    }
    if (drag.gesture === 'rotate') {
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
    // Scale: the ratio of the pointer's distance from the opposite corner to the grab's.
    const still = drag.fixed;
    const grabbed = Math.hypot(drag.from.x - still.x, drag.from.y - still.y);
    if (grabbed < 1e-3) return;
    const k = Math.max(0.02, Math.hypot(point.x - still.x, point.y - still.y) / grabbed);
    // Scaling happens about the pivot, which carries the still corner along with it:
    // the pivot moves by (still - pivot)(1 - k) to put that corner back.
    const shiftX = (still.x - drag.pivot.x) * (1 - k);
    const shiftY = (still.y - drag.pivot.y) * (1 - k);
    // Back from a stretch to plain scaling mid-drag: the stretch returns to its grab.
    const restStretch = { stretchX: drag.origin.stretchX, stretchY: drag.origin.stretchY };
    if (drag.clip) {
      session.setPlacement?.(drag.layerId, {
        width: drag.clip.width * k,
        x: drag.clip.x + shiftX,
        y: drag.clip.y + shiftY,
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
  private stretch(drag: Drag, point: Point): void {
    const session = this.host.layers();
    const f = drag.frame;
    if (!session || !f) return;
    const U = { x: f[1].x - f[0].x, y: f[1].y - f[0].y };
    const V = { x: f[3].x - f[0].x, y: f[3].y - f[0].y };
    const det = U.x * V.y - U.y * V.x;
    if (Math.abs(det) < 1e-6) return;
    // A canvas vector in U/V coordinates.
    const inBasis = (dx: number, dy: number) => ({ u: (dx * V.y - dy * V.x) / det, v: (U.x * dy - U.y * dx) / det });
    const O = drag.fixed;
    const grab = inBasis(drag.from.x - O.x, drag.from.y - O.y);
    const now = inBasis(point.x - O.x, point.y - O.y);
    if (Math.abs(grab.u) < 1e-6 || Math.abs(grab.v) < 1e-6) return;
    const kx = Math.max(0.02, now.u / grab.u);
    const ky = Math.max(0.02, now.v / grab.v);
    // Where the still corner would go when stretched about the pivot, and back.
    const w = inBasis(O.x - drag.pivot.x, O.y - drag.pivot.y);
    const shiftX = O.x - drag.pivot.x - (w.u * kx * U.x + w.v * ky * V.x);
    const shiftY = O.y - drag.pivot.y - (w.u * kx * U.y + w.v * ky * V.y);
    const moved = translateInParent(drag.origin, drag.parent, shiftX, shiftY);
    session.setLayerTransform(drag.layerId, {
      scale: drag.origin.scale,
      stretchX: drag.origin.stretchX * kx,
      stretchY: drag.origin.stretchY * ky,
      x: moved.x,
      y: moved.y,
    });
  }

  /** Which part of the selection frame the pointer is on, in screen px. */
  private hitFrame(frame: readonly Point[], event: PointerEvent): { gesture: Gesture; corner: number } | null {
    const proj = this.host.projection();
    const c = frame.map((p) => ({ x: projectX(proj, p.x), y: projectY(proj, p.y) }));
    const { x: sx, y: sy } = this.host.overlayPoint(event);
    for (let i = 0; i < 4; i++) {
      if (Math.hypot(sx - c[i].x, sy - c[i].y) <= HANDLE_HIT) return { gesture: 'scale', corner: i };
    }
    if (insideScreenQuad(c, sx, sy)) return { gesture: 'move', corner: -1 };
    for (let i = 0; i < 4; i++) {
      if (Math.hypot(sx - c[i].x, sy - c[i].y) <= ROTATE_HIT) return { gesture: 'rotate', corner: i };
    }
    return null;
  }

  private hover(event: PointerEvent): void {
    const session = this.host.layers();
    const layer = session?.selected();
    const frame = layer && session ? session.frameOf(layer) : null;
    const hit = frame ? this.hitFrame(frame, event) : null;
    if (!hit) {
      const pt = this.host.canvasPoint(event);
      this.setCursor(session?.layerAt(pt.x, pt.y) ? 'pointer' : '');
      return;
    }
    const gesture = event.altKey ? 'rotate' : hit.gesture;
    this.setCursor(gesture === 'move' ? 'move' : gesture === 'rotate' ? ROTATE_CURSOR : this.scaleCursor(hit.corner));
  }

  /** The diagonal a corner resizes along, read from where it sits on screen, so a
   *  turned or flipped frame still shows the right arrow. */
  private scaleCursor(corner: number): string {
    const session = this.host.layers();
    const layer = session?.selected();
    const frame = layer && session ? session.frameOf(layer) : null;
    if (!frame || corner < 0) return 'nwse-resize';
    const a = frame[corner];
    const b = frame[(corner + 2) % 4];
    return (a.x - b.x) * (a.y - b.y) >= 0 ? 'nwse-resize' : 'nesw-resize';
  }

  private setCursor(cursor: string): void {
    const surface = this.host.surface();
    if (surface.style.cursor !== cursor) surface.style.cursor = cursor;
  }

  // --- the marching ants -----------------------------------------------------------

  private startAnts(): void {
    if (this.antsTimer !== 0) return;
    this.antsTimer = window.setInterval(() => {
      if (!this.framed) {
        this.stopAnts();
        return;
      }
      if (document.hidden) return;
      this.antsPhase = (this.antsPhase + 1) % ANTS_PERIOD;
      this.host.repaint();
    }, 1000 / ANTS_FPS);
  }

  private stopAnts(): void {
    if (this.antsTimer === 0) return;
    window.clearInterval(this.antsTimer);
    this.antsTimer = 0;
  }
}

/** The selection frame's line: white under black dashes, readable on any picture. */
export function strokeAnts(ctx: CanvasRenderingContext2D, path: Path2D, phase: number): void {
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.stroke(path);
  ctx.setLineDash(ANTS_DASH);
  ctx.lineDashOffset = -phase;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
  ctx.stroke(path);
  ctx.setLineDash([]);
}

export function drawHandle(ctx: CanvasRenderingContext2D, p: Point): void {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(p.x - HANDLE / 2, p.y - HANDLE / 2, HANDLE, HANDLE);
  ctx.strokeRect(p.x - HANDLE / 2 + 0.5, p.y - HANDLE / 2 + 0.5, HANDLE - 1, HANDLE - 1);
}

export function insideScreenQuad(c: readonly Point[], x: number, y: number): boolean {
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
