// src/move-palette.ts
var MOVE_PALETTE = {
  /* the hues, in the order a colour wheel runs */
  red: "#fd3c57",
  // hardware 2
  orange: "#fd6b59",
  // hardware 4
  yellow: "#f2cf43",
  // hardware 29
  lime: "#a3f243",
  // hardware 31
  emerald: "#00ed95",
  // hardware 32
  blue: "#698eff",
  // hardware 125
  indigo: "#8660c3",
  // hardware 19
  pink: "#fe92d5",
  // hardware 25
  /* the neutrals, which the hardware has no use for — its unlit state is
     darkness, and its dimmed colours are the hues' own twins */
  white: "#ffffff",
  grayLight: "#cac5cc",
  gray: "#555162",
  black: "#0e0e16",
  brown: "#856643"
};
var MOVE_TRACK_COLORS = [
  MOVE_PALETTE.blue,
  MOVE_PALETTE.pink,
  MOVE_PALETTE.orange,
  MOVE_PALETTE.lime
];

// src/preset-flower.ts
var FLOWER_PALETTES = [{
  id: "kit",
  name: "Kit",
  background: MOVE_PALETTE.white,
  colors: [
    MOVE_PALETTE.red,
    MOVE_PALETTE.orange,
    MOVE_PALETTE.yellow,
    MOVE_PALETTE.lime,
    MOVE_PALETTE.emerald,
    MOVE_PALETTE.blue,
    MOVE_PALETTE.indigo,
    MOVE_PALETTE.pink
  ]
}];
var FLOWER_PATTERNS = [
  { id: "wild", name: "Wildflower", description: "Uneven petals, lobed clusters and scattered buds." },
  { id: "spiral", name: "Spiral", description: "Overlapping petals following a golden-angle spiral." },
  { id: "pompon", name: "Pompon", description: "Dense rings of rounded, bubble-like petals." },
  { id: "ribbon", name: "Ribbons", description: "Long, curling petals swept around the center." },
  { id: "coral", name: "Coral", description: "Branching stems with swollen buds and forked growth." }
];
var DEFAULT_FLOWER_SETTINGS = {
  petals: 16,
  layers: 2,
  petalLength: 60,
  petalWidth: 20,
  roundness: 0.5,
  irregularity: 1,
  twist: -90,
  spread: 0,
  chaos: 1,
  centerSize: 2.75,
  palette: "kit",
  pattern: "wild"
};
var bounded = (n, min, max, fallback) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
function randomFor(seed) {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) state = Math.imul(state ^ seed.charCodeAt(i), 16777619);
  return () => {
    state += 1831565813;
    let n = Math.imul(state ^ state >>> 15, 1 | state);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
var fixed = (n) => n.toFixed(2);
function outline(points, smooth) {
  let path = `M${points[0].map(fixed).join(",")}`;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length], b = points[i];
    const c = points[(i + 1) % points.length], d = points[(i + 2) % points.length];
    path += `C${fixed(b[0] + (c[0] - a[0]) * smooth)},${fixed(b[1] + (c[1] - a[1]) * smooth)} ${fixed(c[0] - (d[0] - b[0]) * smooth)},${fixed(c[1] - (d[1] - b[1]) * smooth)} ${c.map(fixed).join(",")}`;
  }
  return path + "Z";
}
function flowerSvg(seed, input, options = {}) {
  const defaults = DEFAULT_FLOWER_SETTINGS;
  const petals = Math.round(bounded(input.petals, 3, 16, defaults.petals));
  const layers = Math.round(bounded(input.layers, 1, 5, defaults.layers));
  const length = bounded(input.petalLength, 60, 180, defaults.petalLength);
  const width = bounded(input.petalWidth, 20, 100, defaults.petalWidth);
  const roundness = bounded(input.roundness, 0, 1, defaults.roundness);
  const irregularity = bounded(input.irregularity, 0, 1, defaults.irregularity);
  const twist = bounded(input.twist, -90, 90, defaults.twist);
  const spread = bounded(input.spread, 0, 1, defaults.spread);
  const sourcePalette = FLOWER_PALETTES.find((p) => p.id === input.palette) ?? FLOWER_PALETTES[0];
  const colorRandom = randomFor(`${seed}:colors`);
  const colors = [...sourcePalette.colors];
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(colorRandom() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  const palette = { ...sourcePalette, colors: colors.slice(0, 4) };
  const pattern = FLOWER_PATTERNS.some((p) => p.id === input.pattern) ? input.pattern : defaults.pattern;
  const centerSize = bounded(input.centerSize, 0.5, 3.5, defaults.centerSize);
  const chaos = bounded(input.chaos, 0, 1, defaults.chaos);
  const random = randomFor(seed);
  const signed = () => random() * 2 - 1;
  const phase = random() * Math.PI * 2;
  const colorOffset = Math.floor(random() * palette.colors.length);
  const habit = { lean: signed(), stretch: signed(), curl: signed(), lobes: 2 + Math.floor(random() * 4), clustering: random() };
  const anchors = Array.from({ length: 3 }, () => [signed() * 85 * chaos, signed() * 85 * chaos]);
  const shapes = [];
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  function include(p) {
    bounds.minX = Math.min(bounds.minX, p[0]);
    bounds.maxX = Math.max(bounds.maxX, p[0]);
    bounds.minY = Math.min(bounds.minY, p[1]);
    bounds.maxY = Math.max(bounds.maxY, p[1]);
  }
  function addBlob(points, color) {
    const smooth = 0.11 + roundness * 0.08;
    for (let i = 0; i < points.length; i++) {
      const a = points[(i + points.length - 1) % points.length], b = points[i];
      const c = points[(i + 1) % points.length], d = points[(i + 2) % points.length];
      include(b);
      include([b[0] + (c[0] - a[0]) * smooth, b[1] + (c[1] - a[1]) * smooth]);
      include([c[0] - (d[0] - b[0]) * smooth, c[1] - (d[1] - b[1]) * smooth]);
    }
    shapes.push(`<path d="${outline(points, smooth)}" fill="${color}"/>`);
  }
  if (pattern === "coral") {
    const branch = (origin, angle, reach, girth, depth, key) => {
      const r = randomFor(`${seed}:branch:${key}`);
      const bend = (r() - 0.5) * reach * (0.3 + chaos);
      const tip = [
        origin[0] + Math.cos(angle) * reach - Math.sin(angle) * bend,
        origin[1] + Math.sin(angle) * reach + Math.cos(angle) * bend
      ];
      const points = Array.from({ length: 20 }, (_, i) => {
        const t = i * Math.PI / 10;
        const x = reach * (0.5 + 0.55 * Math.cos(t));
        const y = Math.sin(t) * girth * (1 + 0.2 * Math.cos(t * 3)) + bend * (x / reach);
        return [
          origin[0] + Math.cos(angle) * x - Math.sin(angle) * y,
          origin[1] + Math.sin(angle) * x + Math.cos(angle) * y
        ];
      });
      addBlob(points, palette.colors[(colorOffset + depth) % 4]);
      if (depth > 0) {
        for (let fork = 0; fork < 2; fork++) branch(
          tip,
          angle + (fork ? 1 : -1) * (0.35 + r() * 0.6) + twist * 6e-3,
          reach * (0.52 + r() * 0.17),
          girth * 0.66,
          depth - 1,
          `${key}.${fork}`
        );
      } else {
        const size = girth * (1.6 + roundness);
        addBlob(Array.from({ length: 16 }, (_, i) => {
          const t = i * Math.PI / 8, radius = size * (1 + Math.sin(t * 3) * irregularity * 0.25);
          return [tip[0] + Math.cos(t) * radius, tip[1] + Math.sin(t) * radius];
        }), palette.colors[(colorOffset + 2) % 4]);
      }
    };
    for (let arm = 0; arm < petals; arm++) branch(
      [0, 0],
      phase + arm * Math.PI * 2 / petals,
      length * (0.4 + spread * 0.3),
      width * 0.14,
      Math.min(3, layers - 1),
      String(arm)
    );
  }
  for (let layer = 0; pattern !== "coral" && layer < layers; layer++) {
    const rng = randomFor(`${seed}:layer:${layer}`);
    const count = Math.max(3, Math.round(petals * (1 + (rng() - 0.5) * chaos)));
    const scale = Math.pow(0.72 + habit.stretch * chaos * 0.1, layer);
    const anchor = anchors[Math.floor(rng() * anchors.length)];
    for (let petal = 0; petal < count; petal++) {
      const r = randomFor(`${seed}:layer:${layer}:petal:${petal}`);
      const jitter = () => r() * 2 - 1;
      let angle = phase + layer * twist * Math.PI / 180 + petal * Math.PI * 2 / count + jitter() * (0.12 * irregularity + chaos * 0.85);
      let reach = length * scale * Math.exp(jitter() * (0.16 * irregularity + chaos * 0.75));
      let breadth = width * scale * Math.exp(jitter() * (0.22 * irregularity + chaos * 0.8));
      let offset = (12 + spread * 42) * scale + chaos * jitter() * 40;
      let bend = jitter() * reach * chaos * 0.6;
      const lobePhase = r() * Math.PI * 2;
      const lobeCount = habit.lobes + Math.floor(r() * 3);
      const lobeAmount = chaos * (0.12 + r() * 0.22) + irregularity * 0.08;
      const skew = jitter() * chaos * 0.6;
      let origin = anchor;
      if (pattern === "spiral") {
        const index = layer * petals + petal;
        const theta = phase + index * Math.PI * (3 - Math.sqrt(5)) + twist * 6e-3;
        const radius = (18 + Math.sqrt(index + 1) * (17 + spread * 15)) * (1 + chaos * jitter() * 0.12);
        origin = [Math.cos(theta) * radius, Math.sin(theta) * radius];
        angle = theta + Math.PI / 2;
        reach *= 0.48;
        breadth *= 0.75;
        offset = 0;
        bend *= 0.3;
      } else if (pattern === "pompon") {
        const radius = (length * 0.75 + spread * 35) * scale;
        origin = [Math.cos(angle) * radius, Math.sin(angle) * radius];
        reach = width * scale * (0.6 + roundness * 0.3);
        breadth = reach * 1.1;
        offset = -reach * 0.4;
        bend *= 0.1;
      } else if (pattern === "ribbon") {
        origin = [anchor[0] * 0.25, anchor[1] * 0.25];
        reach *= 1.35;
        breadth *= 0.35;
        bend = reach * (0.4 + twist / 180 + habit.curl * chaos * 0.3);
        offset *= 0.4;
      }
      const points = Array.from({ length: 24 }, (_, i) => {
        const t = i * Math.PI * 2 / 24;
        const wave = 1 + Math.sin(t * lobeCount + lobePhase) * lobeAmount + Math.cos(t * 3 - lobePhase) * irregularity * 0.07;
        const x = offset + reach * 0.4 + Math.cos(t) * reach * 0.62 * wave;
        const y = Math.sin(t) * breadth * (0.5 + roundness * 0.2) * wave * (1 + skew * Math.cos(t)) + bend * Math.pow((Math.cos(t) + 1) / 2, 2);
        return [
          origin[0] + x * Math.cos(angle) - y * Math.sin(angle) + habit.lean * chaos * y * 0.45,
          origin[1] + x * Math.sin(angle) + y * Math.cos(angle)
        ];
      });
      const color = palette.colors[(colorOffset + layer + Math.floor(r() * (1 + chaos * 3))) % palette.colors.length];
      addBlob(points, color);
      if (r() < chaos * 0.48 && pattern === "wild") {
        const theta = angle + habit.curl * 0.7;
        const distance = offset + reach * (0.7 + r() * 0.6);
        const cx2 = anchor[0] + Math.cos(theta) * distance, cy2 = anchor[1] + Math.sin(theta) * distance;
        const size = (5 + r() * 19) * scale;
        addBlob(Array.from({ length: 12 }, (_, i) => {
          const t = i * Math.PI / 6, radius = size * (1 + 0.24 * Math.sin(t * 3 + lobePhase));
          return [cx2 + Math.cos(t) * radius, cy2 + Math.sin(t) * radius * (1 + habit.stretch * 0.4)];
        }), palette.colors[(colorOffset + layer + 2) % palette.colors.length]);
      }
    }
  }
  const centers = 1 + Math.floor(chaos * habit.clustering * 4);
  for (let k = 0; k < centers; k++) {
    const top = k === centers - 1;
    const radius = (14 + width * 0.16) * (1 + signed() * chaos * 0.3) * (top ? centerSize : 1);
    const drift = top ? 18 : 55;
    const cx2 = signed() * chaos * drift, cy2 = signed() * chaos * drift;
    const points = Array.from({ length: 18 }, (_, i) => {
      const t = i * Math.PI / 9;
      const r = radius * (1 + Math.sin(t * habit.lobes + phase) * chaos * 0.28);
      return [cx2 + Math.cos(t) * r, cy2 + Math.sin(t) * r];
    });
    addBlob(points, palette.colors[(colorOffset + layers + k + 1) % palette.colors.length]);
  }
  const fit = 492 / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1);
  const cx = (bounds.minX + bounds.maxX) / 2, cy = (bounds.minY + bounds.maxY) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${options.background === false ? "" : `<rect width="600" height="600" fill="${palette.background}"/>`}<g transform="translate(300 300) scale(${fixed(fit)}) translate(${fixed(-cx)} ${fixed(-cy)})">${shapes.join("")}</g></svg>`;
}
function presetFlowerSeed(values) {
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value !== null && typeof value === "object") return Object.fromEntries(
      Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)])
    );
    return value;
  };
  return JSON.stringify(canonical(values));
}
function presetFlowerSvg(values) {
  return flowerSvg(presetFlowerSeed(values), DEFAULT_FLOWER_SETTINGS);
}
export {
  DEFAULT_FLOWER_SETTINGS,
  FLOWER_PALETTES,
  FLOWER_PATTERNS,
  flowerSvg,
  presetFlowerSeed,
  presetFlowerSvg
};
//# sourceMappingURL=preset-flower.js.map