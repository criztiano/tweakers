// Framework-agnostic rendering + interaction engine for the waveform visualizer.
// React / Svelte / Solid / Vue each wrap this with a thin component that owns the
// markup and reactive state; the engine owns the canvas, the rAF loop, and the
// pointer interaction, reading the current props through a `get()` callback so it
// never needs to be torn down when a prop changes.

import { barPeaks, type Peaks } from './waveform-dsp';
import {
  buildWaveformLevels,
  fillRangePeaks,
  rangeEnvelope,
  playedRanges,
  rangesDuration,
  waveformAsset,
  waveformAssetFromBuffer,
  type WaveformAsset,
  type WaveformRange,
} from './waveform-asset';

/**
 * How the sample is drawn. `smooth` is the simplified envelope; `pixelated`
 * is one chunky min/max bar per column; `striped` is the pixelated bar,
 * untouched, with a gap its own width after it — no sample is lost and no
 * bar coarsens, the wave is simply twice as long, so the same zoom shows
 * half as much of it.
 */
export type WaveformMode = 'smooth' | 'pixelated' | 'striped';
export const WAVEFORM_MODES: WaveformMode[] = ['smooth', 'pixelated', 'striped'];
/** Striped bars make the wave this many times longer at a given zoom. */
export const WAVEFORM_STRIPE_STRETCH = 2;
/** A loop region over the sample, as normalized 0..1 positions. */
export type WaveformLoop = { start: number; end: number };

/** Everything the engine reads each frame. Wrappers supply a getter for the live values. */
export interface WaveformRuntime {
  buffer: AudioBuffer | null;
  /**
   * The sample as prepared peaks. Takes precedence over `buffer`, which is
   * turned into one (once per buffer) when it is all a host gives.
   */
  asset?: WaveformAsset | null;
  /**
   * The stretches of the sample that play, back to back, in its seconds —
   * a trim without copying audio. Positions, loops and cuts are then shares
   * of the ranges' total. Left out, the whole sample plays.
   */
  ranges?: WaveformRange[] | null;
  /** For the EQ bands: the decoded sample they are filtered from, when the asset alone was given. */
  bandSource?: AudioBuffer | null;
  progress: number;
  getProgress?: () => number;
  mode: WaveformMode;
  border: boolean;
  bands: boolean;
  pixelSize: number;
  grid: boolean;
  gridSubdivisions: number;
  waveColor?: string;
  playheadColor?: string;
  /** The faint horizontal centre line behind the waveform. */
  baseline: boolean;
  /** Smooth mode: points the envelope simplifies to — more points, less smoothing. */
  smoothPoints: number;
  /**
   * Vertical inset (CSS px) the wave keeps from the canvas edges. The
   * playhead, loop band and grid still run the full height — a frame for
   * the drawing, not for the instrument.
   */
  waveInset: number;
  autoZoomOnLoop: boolean;
  loop: WaveformLoop | null;
  /**
   * Where the sample is cut, as 0..1 positions. At each one the display
   * splits: a fixed gap of frame shows through, the pieces either side end
   * in rounded corners, and time steps straight across — the playhead, a
   * loop edge, a click all skip the gap, so the pieces read as the
   * containers the sample now is.
   */
  cuts?: number[];
  /** The frame the gaps show, and the gap's width and corner radius in CSS px. */
  gapColor?: string;
  gap?: number;
  gapRadius?: number;
  /** Manual zoom level (the wrapper owns the +/− buttons). */
  zoom: number;
  width: number;
  height: number;
  onSeek?: (progress: number) => void;
  onLoopChange?: (loop: WaveformLoop | null) => void;
}

export interface WaveformEngine {
  destroy(): void;
}

// Each "+" doubles magnification; window = 1 / zoom of the sample's duration.
// The ceiling is set by the longest sample, not the shortest: a two-second
// loop needs eight, but a five-minute track needs a thousand before a single
// transient is wide enough to place a beat on.
export const WAVEFORM_MAX_ZOOM = 1024;

// Crossover filters for the optional 3-band EQ split (applied offline to the sample).
const BANDS: { type: BiquadFilterType; freq: number; q?: number }[] = [
  { type: 'lowpass', freq: 250 },
  { type: 'bandpass', freq: 1100, q: 0.6 },
  { type: 'highpass', freq: 4200 },
];
// Low / mid / high — purple, cyan, lime.
const BAND_COLORS = ['#a855f7', '#22d3ee', '#a3e635'];

// Smooth mode: how many points the envelope is simplified to by default.
export const WAVEFORM_SMOOTH_POINTS = 46;
// Fill opacity used only for the bordered (outlined) variant.
const BORDER_FILL_ALPHA = 0.2;
// Pointer travel (CSS px) past which a press becomes a loop-drag rather than a click.
const DRAG_THRESHOLD = 3;
// How close (CSS px) a press must be to a loop edge to grab it for resizing.
const EDGE_HIT = 6;
// Minimum loop span (0..1) below which a selection is treated as a click, not a loop.
const MIN_LOOP = 0.001;
// A cut's gap and the corners either side of it, in CSS px, when the wrapper names none.
export const WAVEFORM_GAP = 8;
export const WAVEFORM_GAP_RADIUS = 6;

type Pt = { x: number; y: number };
// A drag in progress: 'create' draws a fresh selection from `anchor`; 'resize'
// drags one loop edge while `anchor` holds the opposite (fixed) edge. In both,
// the region is [min(anchor,cur), max(anchor,cur)].
type Drag = { mode: 'create' | 'resize'; anchor: number; curProg: number; startX: number; moved: boolean };

// Catmull-Rom → cubic bezier: a smooth curve through `pts` (path already at pts[0]).
function smoothThrough(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y
    );
  }
}

async function filterBuffer(buffer: AudioBuffer, band: (typeof BANDS)[number]): Promise<AudioBuffer> {
  // One channel: the bands are drawn from the mono mix, so the render keeps half the memory.
  const off = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
  const src = off.createBufferSource();
  src.buffer = buffer;
  const filter = off.createBiquadFilter();
  filter.type = band.type;
  filter.frequency.value = band.freq;
  if (band.q != null) filter.Q.value = band.q;
  src.connect(filter);
  filter.connect(off.destination);
  src.start();
  return off.startRendering();
}

// Assets made from bare buffers, and the EQ bands of each asset — kept for as
// long as the sample is, so a remount or a second display reuses them.
const bufferAssets = new WeakMap<AudioBuffer, WaveformAsset>();
const assetFor = (buffer: AudioBuffer) => {
  let asset = bufferAssets.get(buffer);
  if (!asset) bufferAssets.set(buffer, (asset = waveformAssetFromBuffer(buffer)));
  return asset;
};
const bandAssets = new WeakMap<WaveformAsset, Promise<WaveformAsset[]>>();
// One band render at a time across every waveform: three full-length offline
// renders at once is what used to spike memory.
let bandQueue: Promise<unknown> = Promise.resolve();
const bandsFor = (asset: WaveformAsset, source: AudioBuffer) => {
  let bands = bandAssets.get(asset);
  if (!bands) {
    bands = (async () => {
      const out: WaveformAsset[] = [];
      for (const band of BANDS) {
        const render = bandQueue.then(() => filterBuffer(source, band));
        bandQueue = render.catch(() => {});
        const filtered = await render;
        // Peaks only: the filtered samples are dropped once measured.
        out.push(waveformAsset(buildWaveformLevels([filtered.getChannelData(0)]), filtered.sampleRate, filtered.length));
      }
      return out;
    })();
    bands.catch(() => bandAssets.delete(asset));
    bandAssets.set(asset, bands);
  }
  return bands;
};

// Identity numbers, so a cached drawing can be keyed by the objects it drew.
const ids = new WeakMap<object, number>();
let nextId = 1;
const idOf = (o: object | null | undefined) => {
  if (!o) return 0;
  let id = ids.get(o);
  if (!id) ids.set(o, (id = nextId++));
  return id;
};
const listKey = (list: { start: number; end: number }[] | number[] | null | undefined) =>
  list ? list.map((v) => (typeof v === 'number' ? v : `${v.start}:${v.end}`)).join(',') : '';

/**
 * Mount the renderer on `canvas`, reading the current props from `get()` every
 * frame. Returns a handle whose `destroy()` stops the loop and detaches listeners.
 */
export function createWaveformEngine(canvas: HTMLCanvasElement, get: () => WaveformRuntime): WaveformEngine {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { destroy() {} };

  const readDpr = () => Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
  // Re-read per frame so moving the window to a different-density display keeps the
  // backing-store resolution and the pointer→progress mapping in sync.
  let dpr = readDpr();

  // Size-dependent state, (re)allocated by syncSize when width/height/dpr change.
  let W = 0;
  let H = 0;
  let cy = 0;
  let amp = 0;
  let pk: Peaks = { min: new Float32Array(1), max: new Float32Array(1) };

  let lastInset = 0;
  const syncSize = (width: number, height: number, inset = 0) => {
    dpr = readDpr();
    const nw = Math.round(width * dpr);
    const nh = Math.round(height * dpr);
    if (nw === W && nh === H && inset === lastInset) return;
    W = canvas.width = nw;
    H = canvas.height = nh;
    lastInset = inset;
    cy = H / 2;
    amp = Math.max(0, H / 2 - inset * dpr) * 0.84;
    pk = { min: new Float32Array(W), max: new Float32Array(W) };
  };

  // The assets drawn (one, or the three EQ bands once they are measured).
  // The bands resolve off the frame; the plain wave stays until they do.
  let drawn: WaveformAsset[] = [];
  let drawnToken = 0;
  let lastAsset: WaveformAsset | null | undefined; // undefined: not yet synced
  let lastBands = false;

  const syncAssets = (asset: WaveformAsset | null, bands: boolean, source: AudioBuffer | null) => {
    if (asset === lastAsset && bands === lastBands) return;
    lastAsset = asset;
    lastBands = bands;
    const token = ++drawnToken;
    drawn = asset ? [asset] : [];
    if (!asset || !bands || !source || typeof OfflineAudioContext === 'undefined') return;
    bandsFor(asset, source).then(
      (split) => {
        if (token === drawnToken) drawn = split;
      },
      // Offline render failed (e.g. memory pressure) — keep the plain wave.
      () => {}
    );
  };

  // One CSS pixel per column (two device pixels on retina), times the pixelSize
  // multiplier — chunkier blocks at 2/4/6.
  const columnWidth = (pixelSize: number) => Math.max(1, Math.round(dpr) * Math.max(1, Math.round(pixelSize)));

  // The window currently shown (updated each frame) — used to map pointer x → progress.
  const windowState = { start: 0, win: 1 };
  // The pieces the window shows, once the cuts inside it have taken their
  // gaps: each is a stretch of the sample and the device-pixel span it owns.
  type Piece = { a: number; b: number; x0: number; x1: number };
  let pieces: Piece[] = [{ a: 0, b: 1, x0: 0, x1: 0 }];
  let gapPx = 0;

  const layoutPieces = (start: number, win: number, cuts: number[] | undefined, gap: number) => {
    const end = start + win;
    const inside = (cuts ?? []).filter((c) => c > start && c < end).sort((x, y) => x - y);
    gapPx = inside.length ? Math.round(gap * dpr) : 0;
    let waveW = W - inside.length * gapPx;
    if (waveW < inside.length + 1) {
      // No room for the gaps at this zoom: draw the sample whole.
      inside.length = 0;
      gapPx = 0;
      waveW = W;
    }
    const bounds = [start, ...inside, end];
    pieces = [];
    for (let i = 0; i + 1 < bounds.length; i++) {
      const a = bounds[i];
      const b = bounds[i + 1];
      pieces.push({
        a,
        b,
        x0: ((a - start) / win) * waveW + i * gapPx,
        x1: ((b - start) / win) * waveW + i * gapPx,
      });
    }
  };

  // A 0..1 position's device x — in its own piece, so a position exactly on
  // a cut lands at the start of the piece after it.
  const xOfPos = (p: number) => {
    let piece = pieces[0];
    for (const it of pieces) if (p >= it.a) piece = it;
    const span = piece.b - piece.a;
    return piece.x0 + (span > 0 ? ((p - piece.a) / span) * (piece.x1 - piece.x0) : 0);
  };
  // The context the wave helpers draw into: the wave's own layer.
  let dc: CanvasRenderingContext2D = ctx;
  // The in-progress loop drag, if any.
  let drag: Drag | null = null;

  // Chunky, full-opacity min/max columns, `cols` of them from device x `x0`.
  // Striped, the peaks were read over half the piece into half the columns,
  // so every bar is exactly the pixelated bar; it is drawn at twice its
  // column, leaving the gap.
  const drawColumns = (p: Peaks, cols: number, x0: number, color: string, pixelSize: number, striped: boolean) => {
    const colW = columnWidth(pixelSize);
    dc.fillStyle = color;
    dc.globalAlpha = 1;
    const stretch = striped ? WAVEFORM_STRIPE_STRETCH : 1;
    for (const bar of barPeaks(p, Math.floor(cols / stretch), colW)) {
      const yTop = Math.round(cy - bar.max * amp);
      const yBot = Math.round(cy - bar.min * amp);
      dc.fillRect(x0 + bar.x * stretch, yTop, colW, Math.max(1, yBot - yTop));
    }
  };

  // Simplified, smoothly-interpolated envelope through points at device x, kept
  // inside `x0`..`x1`: solid fill, or translucent + outline.
  const drawSimplified = (env: { x: number; amp: number }[], x0: number, x1: number, color: string, outline: boolean) => {
    const n = env.length;
    if (n < 2) return;
    const top: Pt[] = env.map((p) => ({ x: p.x, y: cy - p.amp * amp }));
    const bot: Pt[] = [];
    for (let k = n - 1; k >= 0; k--) bot.push({ x: env[k].x, y: cy + env[k].amp * amp });

    dc.save();
    dc.beginPath();
    dc.rect(x0, 0, x1 - x0, H);
    dc.clip();
    dc.beginPath();
    dc.moveTo(top[0].x, top[0].y);
    smoothThrough(dc, top);
    dc.lineTo(bot[0].x, bot[0].y);
    smoothThrough(dc, bot);
    dc.closePath();

    dc.fillStyle = color;
    if (outline) {
      dc.globalAlpha = BORDER_FILL_ALPHA;
      dc.fill();
      dc.globalAlpha = 1;
      dc.strokeStyle = color;
      dc.lineWidth = 1.6 * dpr;
      dc.lineJoin = 'round';
      dc.stroke();
    } else {
      dc.globalAlpha = 1;
      dc.fill();
    }
    dc.restore();
  };

  // The frame showing through a cut, and the rounded corners of the pieces
  // either side: a corner is the square outside a quarter circle, drawn in
  // the frame's colour over the wave.
  const drawGaps = (color: string, radius: number) => {
    if (!gapPx || pieces.length < 2) return;
    const r = Math.min(radius * dpr, gapPx * 2, H / 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    const corner = (x: number, y: number, dx: number, dy: number) => {
      // The square's outer corner is (x, y); the circle's centre sits
      // `dx`,`dy` (±r) from it, inside the piece.
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y);
      ctx.arc(x + dx, y + dy, r, dy > 0 ? -Math.PI / 2 : Math.PI / 2, dx > 0 ? Math.PI : 0, dx > 0 === dy > 0);
      ctx.lineTo(x, y + dy);
      ctx.closePath();
      ctx.fill();
    };
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (i > 0) {
        // this piece's left end, after a gap
        corner(piece.x0, 0, r, r);
        corner(piece.x0, H, r, -r);
      }
      if (i + 1 < pieces.length) {
        ctx.fillRect(piece.x1, 0, gapPx, H);
        corner(piece.x1, 0, -r, r);
        corner(piece.x1, H, -r, -r);
      }
    }
  };

  // Faint reference grid: `subs` vertical (time) lines.
  const drawGrid = (base: string, subs: number) => {
    const n = Math.max(1, Math.round(subs));
    dc.strokeStyle = base;
    dc.globalAlpha = 0.1;
    dc.lineWidth = dpr;
    dc.beginPath();
    for (let i = 1; i < n; i++) {
      const x = Math.round((i / n) * W) + 0.5;
      dc.moveTo(x, 0);
      dc.lineTo(x, H);
    }
    dc.stroke();
    dc.globalAlpha = 1;
  };

  // Translucent loop / selection band between two 0..1 positions, mapped into the
  // current window and its pieces. Tinted with the playhead color at low opacity.
  const drawRegion = (a: number, b: number, color: string) => {
    const { start, win } = windowState;
    const x0 = a <= start ? -1 : a >= start + win ? W + 1 : xOfPos(a);
    const x1 = b <= start ? -1 : b >= start + win ? W + 1 : xOfPos(b);
    const cx0 = Math.max(0, x0);
    const cx1 = Math.min(W, x1);
    if (cx1 <= cx0) return;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(cx0, 0, cx1 - cx0, H);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = dpr;
    ctx.strokeStyle = color;
    ctx.beginPath();
    if (x0 >= 0 && x0 <= W) {
      const xe = Math.round(x0) + 0.5;
      ctx.moveTo(xe, 0);
      ctx.lineTo(xe, H);
    }
    if (x1 >= 0 && x1 <= W) {
      const xe = Math.round(x1) + 0.5;
      ctx.moveTo(xe, 0);
      ctx.lineTo(xe, H);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  // The wave layer: grid, centre line and every piece of the window, each
  // band low → high so the spikier high band reads on top.
  const drawWave = (g: CanvasRenderingContext2D, rt: WaveformRuntime, base: string, wave: string, ranges: WaveformRange[], played: number) => {
    dc = g;
    g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    g.imageSmoothingEnabled = rt.mode === 'smooth';
    if (rt.grid) drawGrid(base, rt.gridSubdivisions);
    if (rt.baseline) {
      g.strokeStyle = base;
      g.globalAlpha = 0.15;
      g.lineWidth = dpr;
      g.beginPath();
      g.moveTo(0, Math.round(cy) + 0.5);
      g.lineTo(W, Math.round(cy) + 0.5);
      g.stroke();
      g.globalAlpha = 1;
    }
    const count = drawn.length;
    const striped = rt.mode === 'striped';
    for (let i = 0; i < count; i++) {
      const color = count === 3 ? BAND_COLORS[i] : wave;
      for (const piece of pieces) {
        const cols = Math.max(1, Math.round(piece.x1) - Math.round(piece.x0));
        const x0 = Math.round(piece.x0);
        if (rt.mode === 'smooth') {
          // The points are pinned to played time, one density across every
          // piece: a window following the playhead slides the shape along
          // instead of re-measuring it each frame.
          const seg = (windowState.win * played) / (rt.smoothPoints || WAVEFORM_SMOOTH_POINTS);
          const t0 = piece.a * played;
          const span = Math.max(1e-9, piece.b * played - t0);
          const env = rangeEnvelope(drawn[i], ranges, t0, piece.b * played, seg).map((p) => ({
            x: x0 + ((p.t - t0) / span) * cols,
            amp: p.amp,
          }));
          drawSimplified(env, x0, x0 + cols, color, rt.border);
          continue;
        }
        const pmin = pk.min.subarray(0, cols);
        const pmax = pk.max.subarray(0, cols);
        const read = striped ? Math.max(1, Math.floor(cols / WAVEFORM_STRIPE_STRETCH)) : cols;
        fillRangePeaks(drawn[i], ranges, piece.a * played, piece.b * played, read, pmin, pmax);
        drawColumns({ min: pmin, max: pmax }, cols, x0, color, rt.pixelSize, striped);
      }
    }
    g.globalAlpha = 1;
    dc = ctx;
  };

  // The wave is drawn to its own layer and kept until what it shows changes:
  // the playhead, the loop band and the gaps are laid over it each time
  // anything moves, and an unchanged frame draws nothing at all.
  const layer = document.createElement('canvas');
  const lctx = layer.getContext('2d');
  let waveKey = '';
  let frameKey = '';
  let rangesRef: WaveformRange[] | null | undefined;
  let rangesSig = '';
  let cutsRef: number[] | undefined;
  let cutsSig = '';

  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const rt = get();
    syncSize(rt.width, rt.height, Math.max(0, rt.waveInset || 0));
    const asset = rt.asset ?? (rt.buffer ? assetFor(rt.buffer) : null);
    syncAssets(asset, rt.bands, rt.bandSource ?? rt.buffer);
    const ranges = asset ? playedRanges(asset, rt.ranges) : [];
    const played = rangesDuration(ranges);
    if (rt.ranges !== rangesRef) {
      rangesRef = rt.ranges;
      rangesSig = listKey(rt.ranges);
    }
    if (rt.cuts !== cutsRef) {
      cutsRef = rt.cuts;
      cutsSig = listKey(rt.cuts);
    }

    const base = getComputedStyle(canvas).color || 'rgb(255,255,255)';
    const wave = rt.waveColor || base;
    const ph = rt.playheadColor || base;

    const prog = Math.max(0, Math.min(1, (rt.getProgress ? rt.getProgress() : rt.progress) || 0));
    // The visible window. With auto-zoom on and a loop set, frame the loop
    // (centered, capped at MAX_ZOOM); otherwise zoom by `zoom`, centered on the
    // playhead and clamped to the sample edges so it's always on screen.
    let win: number;
    let start: number;
    const activeLoop = rt.autoZoomOnLoop ? rt.loop : null;
    if (activeLoop) {
      const span = Math.max(0.0001, activeLoop.end - activeLoop.start);
      win = Math.min(1, Math.max(1 / WAVEFORM_MAX_ZOOM, span * 1.2));
      start = (activeLoop.start + activeLoop.end) / 2 - win / 2;
    } else {
      // Striped bars make the wave twice as long: the same zoom shows half.
      win = 1 / Math.max(1, rt.zoom) / (rt.mode === 'striped' ? WAVEFORM_STRIPE_STRETCH : 1);
      start = prog - win / 2;
    }
    if (start < 0) start = 0;
    else if (start > 1 - win) start = 1 - win;
    windowState.start = start;
    windowState.win = win;

    const nextWaveKey = [
      W, H, dpr, lastInset, drawn.map(idOf).join('.'), rangesSig, cutsSig, rt.gap ?? WAVEFORM_GAP,
      rt.mode, rt.pixelSize, rt.border, rt.grid, rt.gridSubdivisions, rt.baseline, rt.smoothPoints,
      base, wave, start, win,
    ].join('|');
    const region = drag && drag.moved ? [Math.min(drag.anchor, drag.curProg), Math.max(drag.anchor, drag.curProg)] : rt.loop ? [rt.loop.start, rt.loop.end] : null;
    if (nextWaveKey !== waveKey) layoutPieces(start, win, rt.cuts, rt.gap ?? WAVEFORM_GAP);
    const playX = drawn.length ? Math.round(Math.max(0, Math.min(W, xOfPos(prog)))) : -1;
    const nextFrameKey = [nextWaveKey, region?.join(':'), ph, rt.gapColor, rt.gapRadius, playX].join('|');
    if (nextFrameKey === frameKey) return;
    frameKey = nextFrameKey;

    if (nextWaveKey !== waveKey && lctx) {
      waveKey = nextWaveKey;
      if (layer.width !== W || layer.height !== H) {
        layer.width = W;
        layer.height = H;
      }
      drawWave(lctx, rt, base, wave, ranges, played);
    }

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    if (W > 0 && H > 0) ctx.drawImage(layer, 0, 0);

    // Loop / live drag selection on top of the waveform, derived from the playhead color.
    if (region) drawRegion(region[0], region[1], ph);

    // The cuts, over the wave and the band: the frame shows through them.
    drawGaps(rt.gapColor || '#1e1e1e', rt.gapRadius ?? WAVEFORM_GAP_RADIUS);

    if (playX >= 0) {
      // playhead — in its piece of the (possibly zoomed) window, so it stays
      // visible and steps straight across a cut
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ph;
      ctx.lineWidth = 1.5 * dpr;
      const cxp = playX + 0.5;
      ctx.beginPath();
      ctx.moveTo(cxp, 0);
      ctx.lineTo(cxp, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  // --- pointer interaction ---

  // Map a clientX to a 0..1 sample position using the window currently
  // displayed and its pieces — a press in a gap lands on the piece after it.
  const xToProgress = (clientX: number) => {
    const rect = canvas.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const x = fx * W;
    const { start, win } = windowState;
    let piece = pieces[pieces.length - 1];
    for (const it of pieces) {
      if (x <= it.x1) {
        piece = it;
        break;
      }
    }
    const span = piece.x1 - piece.x0;
    const t = span > 0 ? Math.min(1, Math.max(0, (x - piece.x0) / span)) : 0;
    return Math.min(1, Math.max(0, Math.min(start + win, piece.a + t * (piece.b - piece.a))));
  };

  // Which loop edge (if any) a clientX is grabbing — only when a resizable loop is on screen.
  const edgeAt = (clientX: number): 'start' | 'end' | null => {
    const rt = get();
    const loop = rt.loop;
    if (!loop || !rt.onLoopChange) return null;
    const rect = canvas.getBoundingClientRect();
    const xOf = (t: number) => (xOfPos(t) / Math.max(1, W)) * rect.width;
    const px = clientX - rect.left;
    const sx = xOf(loop.start);
    const ex = xOf(loop.end);
    const dS = Math.abs(px - sx);
    const dE = Math.abs(px - ex);
    if (dS <= EDGE_HIT && dS <= dE && sx >= 0 && sx <= rect.width) return 'start';
    if (dE <= EDGE_HIT && ex >= 0 && ex <= rect.width) return 'end';
    return null;
  };

  const setCursor = (c: string) => {
    canvas.style.cursor = c;
  };

  const onPointerDown = (e: PointerEvent) => {
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // No active pointer (e.g. synthetic event) — capture is a nicety, not required.
    }
    const p = xToProgress(e.clientX);
    const edge = edgeAt(e.clientX);
    if (edge && rt.loop) {
      // Grab the opposite edge as the fixed anchor; this edge follows the pointer.
      const anchor = edge === 'start' ? rt.loop.end : rt.loop.start;
      drag = { mode: 'resize', anchor, curProg: p, startX: e.clientX, moved: false };
      setCursor('ew-resize');
    } else {
      drag = { mode: 'create', anchor: p, curProg: p, startX: e.clientX, moved: false };
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (drag) {
      drag.curProg = xToProgress(e.clientX);
      if (Math.abs(e.clientX - drag.startX) > DRAG_THRESHOLD) drag.moved = true;
      return;
    }
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    // Hover affordance: a resize cursor when over a loop edge.
    setCursor(edgeAt(e.clientX) ? 'ew-resize' : 'crosshair');
  };

  const onPointerUp = (e: PointerEvent) => {
    const d = drag;
    drag = null;
    if (!d) return;
    try {
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Capture may not be held (e.g. synthetic event) — ignore.
    }
    setCursor('crosshair');

    const rt = get();
    const a = Math.min(d.anchor, d.curProg);
    const b = Math.max(d.anchor, d.curProg);
    // A real selection must span at least MIN_LOOP; a collapsed drag is treated as a click.
    const wide = b - a >= MIN_LOOP;
    if (d.mode === 'resize') {
      // Commit the resized loop; a press without a real drag leaves it untouched.
      if (d.moved && wide) rt.onLoopChange?.({ start: a, end: b });
    } else if (d.moved && wide) {
      // Drag → define a loop (or scrub-seek to the release point if loops aren't wired).
      if (rt.onLoopChange) rt.onLoopChange({ start: a, end: b });
      else rt.onSeek?.(d.curProg);
    } else {
      // Click (or a degenerate drag) → seek, and clear any active loop.
      rt.onSeek?.(d.anchor);
      if (rt.loop && rt.onLoopChange) rt.onLoopChange(null);
    }
  };

  // Pointer capture can be lost without a pointerup (browser steals it, element
  // reflows) — drop the in-progress drag so it can't get stuck rubber-banding.
  const onPointerCancel = () => {
    drag = null;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('lostpointercapture', onPointerCancel);

  // Interactive affordances (base cursor + no touch-scroll) when seek/loop are wired.
  const rt0 = get();
  if (rt0.onSeek || rt0.onLoopChange) {
    canvas.style.cursor = 'crosshair';
    canvas.style.touchAction = 'none';
  }

  frame();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      drawnToken++; // invalidate any in-flight band split
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('lostpointercapture', onPointerCancel);
    },
  };
}
