// src/layer-transform-core.ts
function depthScale(z, canvasWidth, canvasHeight) {
  if (z === 0) return 1;
  const focal = Math.max(1, Math.max(canvasWidth, canvasHeight));
  return focal / Math.max(focal + z, focal * 0.05);
}

// src/layer-controls.ts
function glyph(paths) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
var ICON_FLIP_H = glyph(
  '<path d="m3 7 5 5-5 5V7"/><path d="m21 7-5 5 5 5V7"/><path d="M12 20v2M12 14v2M12 8v2M12 2v2"/>'
);
var ICON_FLIP_V = glyph(
  '<path d="m17 3-5 5-5-5h10"/><path d="m17 21-5-5-5 5h10"/><path d="M4 12H2M10 12H8M16 12h-2M22 12h-2"/>'
);
function layerPlacementControls(access) {
  const { width, height } = access.canvas;
  const focal = Math.max(width, height);
  return {
    x: {
      config: {
        type: "slider",
        min: Math.round(-width / 2),
        max: Math.round(width * 1.5),
        step: 1,
        unit: " px",
        moveVisual: { kind: "axis", axis: "x" },
        label: "X"
      },
      read: () => Math.round(access.pivot().x + access.transform().x),
      write: (v) => access.setTransform({ x: Number(v) - access.pivot().x })
    },
    y: {
      config: {
        type: "slider",
        min: Math.round(-height / 2),
        max: Math.round(height * 1.5),
        step: 1,
        unit: " px",
        moveVisual: { kind: "axis", axis: "y", down: true },
        label: "Y"
      },
      read: () => Math.round(access.pivot().y + access.transform().y),
      write: (v) => access.setTransform({ y: Number(v) - access.pivot().y })
    },
    z: {
      config: {
        type: "slider",
        min: Math.round(-focal * 0.75),
        max: Math.round(focal * 2),
        step: 1,
        bipolar: true,
        moveVisual: { kind: "axis", axis: "z" },
        label: "Depth",
        formatValue: (v) => `${depthScale(v, width, height).toFixed(2)}\xD7`
      },
      read: () => Math.round(access.transform().z),
      write: (v) => access.setTransform({ z: Number(v) })
    }
  };
}
function layerShapeControls(access) {
  return {
    scale: {
      config: { type: "slider", min: 0.05, max: 8, step: 0.01, origin: 1, unit: "\xD7" },
      read: () => access.transform().scale,
      write: (v) => access.setTransform({ scale: Number(v) })
    },
    rotation: {
      config: { type: "slider", min: -180, max: 180, step: 1, display: "dial", wrap: true, unit: "\xB0" },
      read: () => Math.round(access.transform().rotation * 180 / Math.PI),
      write: (v) => access.setTransform({ rotation: Number(v) * Math.PI / 180 })
    },
    flipX: {
      config: { type: "toggle", label: "Flip H", icon: ICON_FLIP_H },
      read: () => access.transform().flipX,
      write: (v) => access.setTransform({ flipX: Boolean(v) })
    },
    flipY: {
      config: { type: "toggle", label: "Flip V", icon: ICON_FLIP_V },
      read: () => access.transform().flipY,
      write: (v) => access.setTransform({ flipY: Boolean(v) })
    }
  };
}
function layerOpacityControl(options) {
  return {
    config: {
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      label: "Opacity",
      moveVisual: { kind: "opacity", ...options.picture ? { picture: options.picture } : {} },
      ...options.onTap ? { onTap: options.onTap } : {}
    },
    read: () => options.read(),
    write: (v) => options.write(Number(v))
  };
}
var LAYER_PADS = {
  flipX: 0,
  scale: 0,
  flipY: 1,
  rotation: 1
};
var LAYER_HINTS = {
  x: "Where the layer's centre sits, across the canvas.",
  y: "Where the layer's centre sits, down the canvas.",
  z: "Depth. Far layers shrink toward the centre, near ones grow. It does not change which layer is in front \u2014 the list order does.",
  scale: "Size, about the layer's centre. 1\xD7 is as drawn.",
  rotation: "Turn, about the layer's centre.",
  opacity: "How strongly the layer shows."
};
function layerListScreen(rows, index) {
  return {
    title: "Layers",
    items: rows.map((row) => ({
      label: row.label,
      ...row.tag ? { tag: row.tag } : {},
      checked: row.visible,
      ...row.keywords ? { keywords: row.keywords } : {}
    })),
    index,
    back: true
  };
}
export {
  ICON_FLIP_H,
  ICON_FLIP_V,
  LAYER_HINTS,
  LAYER_PADS,
  layerListScreen,
  layerOpacityControl,
  layerPlacementControls,
  layerShapeControls
};
//# sourceMappingURL=layer-controls.js.map