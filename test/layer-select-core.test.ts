import { describe, expect, it } from 'vitest';
import { IDENTITY_TRANSFORM, type LayerTransform } from '../src/layer-transform-core';
import { SelectTool, type LayerSelection, type SelectableLayer } from '../src/layer-select-core';

// A 100×100 picture at the canvas origin, viewed 1:1: canvas px are overlay px.
function harness() {
  let layer: SelectableLayer & { transform: LayerTransform } = { id: 'a', transform: IDENTITY_TRANSFORM };
  let selectedId: string | null = null;
  let edited = 0;
  const frame = () => {
    const t = layer.transform;
    const s = t.scale;
    const cx = 50 + t.x;
    const cy = 50 + t.y;
    return [
      { x: cx - 50 * s, y: cy - 50 * s },
      { x: cx + 50 * s, y: cy - 50 * s },
      { x: cx + 50 * s, y: cy + 50 * s },
      { x: cx - 50 * s, y: cy + 50 * s },
    ];
  };
  const session: LayerSelection = {
    selected: () => (selectedId ? layer : null),
    select: (id) => (selectedId = id),
    layerAt: (x, y) => {
      const f = frame();
      return x >= f[0].x && x <= f[2].x && y >= f[0].y && y <= f[2].y ? layer : null;
    },
    frameOf: () => frame(),
    pivotOf: () => ({ x: 50 + layer.transform.x, y: 50 + layer.transform.y }),
    parentModelFor: () => null,
    setLayerTransform: (_id, patch) => (layer = { ...layer, transform: { ...layer.transform, ...patch } }),
  };
  const surface = { style: { cursor: '' }, setPointerCapture() {}, releasePointerCapture() {} };
  const point = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });
  const tool = new SelectTool({
    layers: () => session,
    canvasPoint: point,
    overlayPoint: point,
    projection: () => ({ scale: 1, offsetX: 0, offsetY: 0 }),
    surface: () => surface as unknown as HTMLElement,
    repaint: () => {},
    onEdited: () => edited++,
  });
  const at = (x: number, y: number, keys: Partial<PointerEvent> = {}) =>
    ({ clientX: x, clientY: y, pointerId: 1, shiftKey: false, altKey: false, metaKey: false, ...keys }) as PointerEvent;
  return { tool, at, layer: () => layer, selectedId: () => selectedId, edited: () => edited };
}

describe('select tool', () => {
  it('selects the layer under the press and moves it with the same drag', () => {
    const h = harness();
    h.tool.begin(h.at(40, 40));
    h.tool.end(h.at(70, 50));
    expect(h.selectedId()).toBe('a');
    expect(h.layer().transform).toMatchObject({ x: 30, y: 10 });
    expect(h.edited()).toBe(1);
  });

  it('keeps a Shift drag on one axis', () => {
    const h = harness();
    h.tool.begin(h.at(40, 40));
    h.tool.end(h.at(70, 45, { shiftKey: true }));
    expect(h.layer().transform).toMatchObject({ x: 30, y: 0 });
  });

  it('scales from the opposite corner when a corner handle is dragged', () => {
    const h = harness();
    h.tool.begin(h.at(50, 50));
    h.tool.end(h.at(50, 50)); // select
    h.tool.begin(h.at(100, 100)); // bottom-right handle
    h.tool.end(h.at(200, 200));
    const t = h.layer().transform;
    expect(t.scale).toBeCloseTo(2);
    // The top-left corner stays at the origin: the centre moved to (100, 100).
    expect(50 + t.x - 50 * t.scale).toBeCloseTo(0);
    expect(50 + t.y - 50 * t.scale).toBeCloseTo(0);
  });

  it('turns with Alt, in 15° steps with Shift', () => {
    const h = harness();
    h.tool.begin(h.at(50, 50));
    h.tool.end(h.at(50, 50));
    h.tool.begin(h.at(100, 50, { altKey: true }));
    h.tool.end(h.at(50 + 50 * Math.cos(0.5), 50 + 50 * Math.sin(0.5), { altKey: true, shiftKey: true }));
    expect(h.layer().transform.rotation).toBeCloseTo(Math.PI / 6);
  });

  it('keeps the selection on a press over empty canvas', () => {
    const h = harness();
    h.tool.begin(h.at(50, 50));
    h.tool.end(h.at(50, 50));
    h.tool.begin(h.at(400, 400));
    h.tool.end(h.at(400, 400));
    expect(h.selectedId()).toBe('a');
    expect(h.layer().transform).toEqual(IDENTITY_TRANSFORM);
  });
});
