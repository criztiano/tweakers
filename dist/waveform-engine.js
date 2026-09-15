// src/waveform-dsp.ts
function barPeaks(p, cols, pitch) {
  const step = Math.max(1, Math.round(pitch));
  const out = [];
  for (let x = 0; x < cols; x += step) {
    let mn = 1;
    let mx = -1;
    for (let i = x; i < x + step && i < cols; i++) {
      if (p.min[i] < mn) mn = p.min[i];
      if (p.max[i] > mx) mx = p.max[i];
    }
    out.push({ x, min: mn, max: mx });
  }
  return out;
}

// src/waveform-asset.ts
var WAVEFORM_BASE_BUCKET = 64;
function buildWaveformLevels(channels, base = WAVEFORM_BASE_BUCKET) {
  const length = channels[0]?.length ?? 0;
  const n = Math.max(1, Math.ceil(length / base));
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  const count = channels.length;
  for (let b = 0; b < n; b++) {
    const s0 = b * base;
    const s1 = Math.min(length, s0 + base);
    let mn = 1;
    let mx = -1;
    for (let i = s0; i < s1; i++) {
      let v = 0;
      for (let c = 0; c < count; c++) v += channels[c][i];
      v /= count;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (s1 <= s0) mn = mx = 0;
    min[b] = mn;
    max[b] = mx;
  }
  const levels = [{ bucket: base, min, max }];
  for (let prev = levels[0]; prev.min.length > 1; ) {
    const m = Math.ceil(prev.min.length / 2);
    const next = { bucket: prev.bucket * 2, min: new Float32Array(m), max: new Float32Array(m) };
    for (let i = 0; i < m; i++) {
      const j = 2 * i + 1 < prev.min.length ? 2 * i + 1 : 2 * i;
      next.min[i] = Math.min(prev.min[2 * i], prev.min[j]);
      next.max[i] = Math.max(prev.max[2 * i], prev.max[j]);
    }
    levels.push(next);
    prev = next;
  }
  return levels;
}
function mixRange(channels, start, end) {
  const out = new Float32Array(Math.max(0, end - start));
  for (const channel of channels) {
    for (let i = 0; i < out.length; i++) out[i] += channel[start + i] / channels.length;
  }
  return out;
}
function waveformAssetFromBuffer(buffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  return waveformAsset(buildWaveformLevels(channels), buffer.sampleRate, buffer.length, channels);
}
function waveformAsset(levels, sampleRate, length, channels) {
  return {
    sampleRate,
    length,
    duration: length / sampleRate,
    levels,
    samples: channels?.length ? (start, end) => {
      const s0 = Math.max(0, Math.min(length, Math.floor(start)));
      const s1 = Math.max(s0, Math.min(length, Math.ceil(end)));
      return channels.length === 1 ? channels[0].subarray(s0, s1) : mixRange(channels, s0, s1);
    } : void 0
  };
}
function rangesDuration(ranges) {
  let total = 0;
  for (const r of ranges) total += Math.max(0, r.end - r.start);
  return total;
}
function playedRanges(asset, ranges) {
  return ranges ?? [{ start: 0, end: asset.duration }];
}
function spanPeak(asset, s0, s1, out) {
  const span = s1 - s0;
  if (span <= 0) return;
  const levels = asset.levels;
  if (span < levels[0].bucket && asset.samples) {
    const data = asset.samples(s0, s1);
    if (data) {
      let mn2 = out[0];
      let mx2 = out[1];
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v < mn2) mn2 = v;
        if (v > mx2) mx2 = v;
      }
      out[0] = mn2;
      out[1] = mx2;
      return;
    }
  }
  let k = 0;
  while (k + 1 < levels.length && levels[k + 1].bucket * 4 <= span) k++;
  const level = levels[k];
  const b0 = Math.floor(s0 / level.bucket);
  const b1 = Math.min(level.min.length, Math.max(b0 + 1, Math.ceil(s1 / level.bucket)));
  let mn = out[0];
  let mx = out[1];
  for (let b = b0; b < b1; b++) {
    if (level.min[b] < mn) mn = level.min[b];
    if (level.max[b] > mx) mx = level.max[b];
  }
  out[0] = mn;
  out[1] = mx;
}
var FRAME_EPSILON = 1e-6;
function fillRangePeaks(asset, ranges, t0, t1, cols, min, max) {
  const sr = asset.sampleRate;
  const step = (t1 - t0) / Math.max(1, cols);
  const out = [1, -1];
  let r = 0;
  let base = 0;
  for (let x = 0; x < cols; x++) {
    const c0 = t0 + x * step;
    const c1 = c0 + step;
    while (r < ranges.length && base + (ranges[r].end - ranges[r].start) <= c0) {
      base += ranges[r].end - ranges[r].start;
      r++;
    }
    out[0] = 1;
    out[1] = -1;
    let at = base;
    for (let i = r; i < ranges.length && at < c1; i++) {
      const len = ranges[i].end - ranges[i].start;
      const a = Math.max(c0, at);
      const b = Math.min(c1, at + len);
      if (b > a) {
        const s0 = Math.floor((ranges[i].start + (a - at)) * sr + FRAME_EPSILON);
        const s1 = Math.min(asset.length, Math.max(s0 + 1, Math.ceil((ranges[i].start + (b - at)) * sr - FRAME_EPSILON)));
        if (s0 < asset.length) spanPeak(asset, s0, s1, out);
      }
      at += len;
    }
    if (out[0] > out[1]) out[0] = out[1] = 0;
    min[x] = out[0];
    max[x] = out[1];
  }
}
function rangeEnvelope(asset, ranges, t0, t1, seg) {
  const played = rangesDuration(ranges);
  if (!(seg > 0) || played <= 0) return [];
  const k0 = Math.max(0, Math.floor(t0 / seg));
  const k1 = Math.min(Math.ceil(played / seg), Math.ceil(t1 / seg));
  const n = k1 - k0 + 1;
  if (n < 1) return [];
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  fillRangePeaks(asset, ranges, (k0 - 0.5) * seg, (k1 + 0.5) * seg, n, min, max);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ t: Math.min(played, (k0 + i) * seg), amp: Math.max(Math.abs(min[i]), Math.abs(max[i])) });
  }
  return out;
}

// src/waveform-engine.ts
var WAVEFORM_MODES = ["smooth", "pixelated", "striped"];
var WAVEFORM_STRIPE_STRETCH = 2;
var WAVEFORM_MAX_ZOOM = 1024;
var BANDS = [
  { type: "lowpass", freq: 250 },
  { type: "bandpass", freq: 1100, q: 0.6 },
  { type: "highpass", freq: 4200 }
];
var BAND_COLORS = ["#a855f7", "#22d3ee", "#a3e635"];
var WAVEFORM_SMOOTH_POINTS = 46;
var BORDER_FILL_ALPHA = 0.2;
var DRAG_THRESHOLD = 3;
var EDGE_HIT = 6;
var MIN_LOOP = 1e-3;
var WAVEFORM_GAP = 8;
var WAVEFORM_GAP_RADIUS = 6;
function smoothThrough(ctx, pts) {
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
async function filterBuffer(buffer, band) {
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
var bufferAssets = /* @__PURE__ */ new WeakMap();
var assetFor = (buffer) => {
  let asset = bufferAssets.get(buffer);
  if (!asset) bufferAssets.set(buffer, asset = waveformAssetFromBuffer(buffer));
  return asset;
};
var bandAssets = /* @__PURE__ */ new WeakMap();
var bandQueue = Promise.resolve();
var bandsFor = (asset, source) => {
  let bands = bandAssets.get(asset);
  if (!bands) {
    bands = (async () => {
      const out = [];
      for (const band of BANDS) {
        const render = bandQueue.then(() => filterBuffer(source, band));
        bandQueue = render.catch(() => {
        });
        const filtered = await render;
        out.push(waveformAsset(buildWaveformLevels([filtered.getChannelData(0)]), filtered.sampleRate, filtered.length));
      }
      return out;
    })();
    bands.catch(() => bandAssets.delete(asset));
    bandAssets.set(asset, bands);
  }
  return bands;
};
var ids = /* @__PURE__ */ new WeakMap();
var nextId = 1;
var idOf = (o) => {
  if (!o) return 0;
  let id = ids.get(o);
  if (!id) ids.set(o, id = nextId++);
  return id;
};
var listKey = (list) => list ? list.map((v) => typeof v === "number" ? v : `${v.start}:${v.end}`).join(",") : "";
function createWaveformEngine(canvas, get) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {
  } };
  const readDpr = () => Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
  let dpr = readDpr();
  let W = 0;
  let H = 0;
  let cy = 0;
  let amp = 0;
  let pk = { min: new Float32Array(1), max: new Float32Array(1) };
  let lastInset = 0;
  const syncSize = (width, height, inset = 0) => {
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
  let drawn = [];
  let drawnToken = 0;
  let lastAsset;
  let lastBands = false;
  const syncAssets = (asset, bands, source) => {
    if (asset === lastAsset && bands === lastBands) return;
    lastAsset = asset;
    lastBands = bands;
    const token = ++drawnToken;
    drawn = asset ? [asset] : [];
    if (!asset || !bands || !source || typeof OfflineAudioContext === "undefined") return;
    bandsFor(asset, source).then(
      (split) => {
        if (token === drawnToken) drawn = split;
      },
      // Offline render failed (e.g. memory pressure) — keep the plain wave.
      () => {
      }
    );
  };
  const columnWidth = (pixelSize) => Math.max(1, Math.round(dpr) * Math.max(1, Math.round(pixelSize)));
  const windowState = { start: 0, win: 1 };
  let pieces = [{ a: 0, b: 1, x0: 0, x1: 0 }];
  let gapPx = 0;
  const layoutPieces = (start, win, cuts, gap) => {
    const end = start + win;
    const inside = (cuts ?? []).filter((c) => c > start && c < end).sort((x, y) => x - y);
    gapPx = inside.length ? Math.round(gap * dpr) : 0;
    let waveW = W - inside.length * gapPx;
    if (waveW < inside.length + 1) {
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
        x0: (a - start) / win * waveW + i * gapPx,
        x1: (b - start) / win * waveW + i * gapPx
      });
    }
  };
  const xOfPos = (p) => {
    let piece = pieces[0];
    for (const it of pieces) if (p >= it.a) piece = it;
    const span = piece.b - piece.a;
    return piece.x0 + (span > 0 ? (p - piece.a) / span * (piece.x1 - piece.x0) : 0);
  };
  let dc = ctx;
  let drag = null;
  const drawColumns = (p, cols, x0, color, pixelSize, striped) => {
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
  const drawSimplified = (env, x0, x1, color, outline) => {
    const n = env.length;
    if (n < 2) return;
    const top = env.map((p) => ({ x: p.x, y: cy - p.amp * amp }));
    const bot = [];
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
      dc.lineJoin = "round";
      dc.stroke();
    } else {
      dc.globalAlpha = 1;
      dc.fill();
    }
    dc.restore();
  };
  const drawGaps = (color, radius) => {
    if (!gapPx || pieces.length < 2) return;
    const r = Math.min(radius * dpr, gapPx * 2, H / 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    const corner = (x, y, dx, dy) => {
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
  const drawGrid = (base, subs) => {
    const n = Math.max(1, Math.round(subs));
    dc.strokeStyle = base;
    dc.globalAlpha = 0.1;
    dc.lineWidth = dpr;
    dc.beginPath();
    for (let i = 1; i < n; i++) {
      const x = Math.round(i / n * W) + 0.5;
      dc.moveTo(x, 0);
      dc.lineTo(x, H);
    }
    dc.stroke();
    dc.globalAlpha = 1;
  };
  const drawRegion = (a, b, color) => {
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
  const drawWave = (g, rt, base, wave, ranges, played) => {
    dc = g;
    g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    g.imageSmoothingEnabled = rt.mode === "smooth";
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
    const striped = rt.mode === "striped";
    for (let i = 0; i < count; i++) {
      const color = count === 3 ? BAND_COLORS[i] : wave;
      for (const piece of pieces) {
        const cols = Math.max(1, Math.round(piece.x1) - Math.round(piece.x0));
        const x0 = Math.round(piece.x0);
        if (rt.mode === "smooth") {
          const seg = windowState.win * played / (rt.smoothPoints || WAVEFORM_SMOOTH_POINTS);
          const t0 = piece.a * played;
          const span = Math.max(1e-9, piece.b * played - t0);
          const env = rangeEnvelope(drawn[i], ranges, t0, piece.b * played, seg).map((p) => ({
            x: x0 + (p.t - t0) / span * cols,
            amp: p.amp
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
  const layer = document.createElement("canvas");
  const lctx = layer.getContext("2d");
  let waveKey = "";
  let frameKey = "";
  let rangesRef;
  let rangesSig = "";
  let cutsRef;
  let cutsSig = "";
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
    const base = getComputedStyle(canvas).color || "rgb(255,255,255)";
    const wave = rt.waveColor || base;
    const ph = rt.playheadColor || base;
    const prog = Math.max(0, Math.min(1, (rt.getProgress ? rt.getProgress() : rt.progress) || 0));
    let win;
    let start;
    const activeLoop = rt.autoZoomOnLoop ? rt.loop : null;
    if (activeLoop) {
      const span = Math.max(1e-4, activeLoop.end - activeLoop.start);
      win = Math.min(1, Math.max(1 / WAVEFORM_MAX_ZOOM, span * 1.2));
      start = (activeLoop.start + activeLoop.end) / 2 - win / 2;
    } else {
      win = 1 / Math.max(1, rt.zoom) / (rt.mode === "striped" ? WAVEFORM_STRIPE_STRETCH : 1);
      start = prog - win / 2;
    }
    if (start < 0) start = 0;
    else if (start > 1 - win) start = 1 - win;
    windowState.start = start;
    windowState.win = win;
    const nextWaveKey = [
      W,
      H,
      dpr,
      lastInset,
      drawn.map(idOf).join("."),
      rangesSig,
      cutsSig,
      rt.gap ?? WAVEFORM_GAP,
      rt.mode,
      rt.pixelSize,
      rt.border,
      rt.grid,
      rt.gridSubdivisions,
      rt.baseline,
      rt.smoothPoints,
      base,
      wave,
      start,
      win
    ].join("|");
    const region = drag && drag.moved ? [Math.min(drag.anchor, drag.curProg), Math.max(drag.anchor, drag.curProg)] : rt.loop ? [rt.loop.start, rt.loop.end] : null;
    if (nextWaveKey !== waveKey) layoutPieces(start, win, rt.cuts, rt.gap ?? WAVEFORM_GAP);
    const playX = drawn.length ? Math.round(Math.max(0, Math.min(W, xOfPos(prog)))) : -1;
    const nextFrameKey = [nextWaveKey, region?.join(":"), ph, rt.gapColor, rt.gapRadius, playX].join("|");
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
    if (region) drawRegion(region[0], region[1], ph);
    drawGaps(rt.gapColor || "#1e1e1e", rt.gapRadius ?? WAVEFORM_GAP_RADIUS);
    if (playX >= 0) {
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
  const xToProgress = (clientX) => {
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
  const edgeAt = (clientX) => {
    const rt = get();
    const loop = rt.loop;
    if (!loop || !rt.onLoopChange) return null;
    const rect = canvas.getBoundingClientRect();
    const xOf = (t) => xOfPos(t) / Math.max(1, W) * rect.width;
    const px = clientX - rect.left;
    const sx = xOf(loop.start);
    const ex = xOf(loop.end);
    const dS = Math.abs(px - sx);
    const dE = Math.abs(px - ex);
    if (dS <= EDGE_HIT && dS <= dE && sx >= 0 && sx <= rect.width) return "start";
    if (dE <= EDGE_HIT && ex >= 0 && ex <= rect.width) return "end";
    return null;
  };
  const setCursor = (c) => {
    canvas.style.cursor = c;
  };
  const onPointerDown = (e) => {
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
    }
    const p = xToProgress(e.clientX);
    const edge = edgeAt(e.clientX);
    if (edge && rt.loop) {
      const anchor = edge === "start" ? rt.loop.end : rt.loop.start;
      drag = { mode: "resize", anchor, curProg: p, startX: e.clientX, moved: false };
      setCursor("ew-resize");
    } else {
      drag = { mode: "create", anchor: p, curProg: p, startX: e.clientX, moved: false };
    }
  };
  const onPointerMove = (e) => {
    if (drag) {
      drag.curProg = xToProgress(e.clientX);
      if (Math.abs(e.clientX - drag.startX) > DRAG_THRESHOLD) drag.moved = true;
      return;
    }
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    setCursor(edgeAt(e.clientX) ? "ew-resize" : "crosshair");
  };
  const onPointerUp = (e) => {
    const d = drag;
    drag = null;
    if (!d) return;
    try {
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    } catch {
    }
    setCursor("crosshair");
    const rt = get();
    const a = Math.min(d.anchor, d.curProg);
    const b = Math.max(d.anchor, d.curProg);
    const wide = b - a >= MIN_LOOP;
    if (d.mode === "resize") {
      if (d.moved && wide) rt.onLoopChange?.({ start: a, end: b });
    } else if (d.moved && wide) {
      if (rt.onLoopChange) rt.onLoopChange({ start: a, end: b });
      else rt.onSeek?.(d.curProg);
    } else {
      rt.onSeek?.(d.anchor);
      if (rt.loop && rt.onLoopChange) rt.onLoopChange(null);
    }
  };
  const onPointerCancel = () => {
    drag = null;
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("lostpointercapture", onPointerCancel);
  const rt0 = get();
  if (rt0.onSeek || rt0.onLoopChange) {
    canvas.style.cursor = "crosshair";
    canvas.style.touchAction = "none";
  }
  frame();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      drawnToken++;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("lostpointercapture", onPointerCancel);
    }
  };
}
export {
  WAVEFORM_GAP,
  WAVEFORM_GAP_RADIUS,
  WAVEFORM_MAX_ZOOM,
  WAVEFORM_MODES,
  WAVEFORM_SMOOTH_POINTS,
  WAVEFORM_STRIPE_STRETCH,
  createWaveformEngine
};
//# sourceMappingURL=waveform-engine.js.map