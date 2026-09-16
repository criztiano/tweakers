/**
 * The gate face's live picture. The kit cannot hear the app's audio, so the
 * app attaches a reader per panel; the face calls it once a frame while it is
 * on screen and draws what comes back around the playhead.
 */

/** What the gate is doing around the playhead, oldest step first. */
export type MoveGateReading = {
  /** The signal's level at even steps across the window, on the threshold
   *  dial's own 0..1 scale — a level on the threshold line sits on it. The
   *  playhead is the middle step. */
  levels: ArrayLike<number>;
  /** How open the gate is at each of the same steps, 0 shut .. 1 open. Omit
   *  when nothing is gated. */
  open?: ArrayLike<number>;
  /** How far the look-ahead reaches past the playhead, as a share of the window. */
  ahead?: number;
};

export type MoveGateReader = () => MoveGateReading | null;

const readers = new Map<string, MoveGateReader>();

export const MoveGateMeter = {
  /** Feed a panel's gate face. Returns the detach. */
  attach(panelId: string, read: MoveGateReader): () => void {
    readers.set(panelId, read);
    return () => {
      if (readers.get(panelId) === read) readers.delete(panelId);
    };
  },
  read(panelId: string): MoveGateReading | null {
    return readers.get(panelId)?.() ?? null;
  },
};

export type MoveGateColours = { text: string; threshold: string; lookahead: string; release: string };

/**
 * Paints a reading over the grid: the level as a filled trace that dims where
 * the gate shuts, the gate's opening in the release colour, the look-ahead
 * reaching past the playhead, and the threshold as a dashed line across, under the level's line. `pad` keeps the
 * trace off the frame, so the threshold line meets the bar's marker.
 */
export function drawMoveGate(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  reading: MoveGateReading | null,
  threshold: number,
  colours: MoveGateColours,
  pad = 0,
): void {
  g.clearRect(0, 0, w, h);
  const top = pad;
  const tall = h - pad * 2;
  const y = (v: number) => top + (1 - Math.max(0, Math.min(1, v))) * tall;
  const mid = w / 2;
  const thresholdLine = () => {
    const at = Math.round(y(threshold));
    g.globalAlpha = 1;
    g.strokeStyle = colours.threshold;
    g.lineWidth = 2 * dpr;
    g.setLineDash([4 * dpr, 3 * dpr]);
    g.beginPath();
    g.moveTo(0, at);
    g.lineTo(w, at);
    g.stroke();
    g.setLineDash([]);
  };

  const levels = reading?.levels;
  const n = levels?.length ?? 0;
  if (reading && levels && n > 1) {
    const x = (i: number) => (i / (n - 1)) * w;
    const open = reading.open;

    if (reading.ahead && reading.ahead > 0) {
      g.globalAlpha = 0.18;
      g.fillStyle = colours.lookahead;
      g.fillRect(mid, 0, Math.min(w - mid, reading.ahead * w), h);
      g.globalAlpha = 1;
    }

    // The level, one pixel column at a time so no seams show between steps:
    // bright where the gate lets it through, faint where it is shut.
    const sample = (curve: ArrayLike<number>, px: number) => {
      const at = (px / w) * (n - 1);
      const i = Math.min(n - 2, Math.floor(at));
      return curve[i] + (curve[i + 1] - curve[i]) * (at - i);
    };
    g.fillStyle = colours.text;
    for (let px = 0; px < w; px++) {
      const through = open ? Math.max(0, Math.min(1, sample(open, px))) : 1;
      g.globalAlpha = 0.05 + 0.15 * through;
      const at = y(sample(levels, px));
      g.fillRect(px, at, 1, top + tall - at);
    }
    // the threshold under the level's line, so the trace reads over it
    thresholdLine();
    g.strokeStyle = colours.text;
    g.lineWidth = dpr;
    g.lineJoin = 'round';
    g.beginPath();
    for (let i = 0; i < n; i++) i ? g.lineTo(x(i), y(levels[i])) : g.moveTo(0, y(levels[i]));
    g.stroke();

    if (open && open.length === n) {
      g.globalAlpha = 0.9;
      g.strokeStyle = colours.release;
      g.lineWidth = 1.5 * dpr;
      g.beginPath();
      for (let i = 0; i < n; i++) i ? g.lineTo(x(i), y(open[i])) : g.moveTo(0, y(open[i]));
      g.stroke();
    }
    g.globalAlpha = 1;
  } else {
    thresholdLine();
  }

  g.globalAlpha = 0.7;
  g.fillStyle = colours.text;
  g.fillRect(Math.round(mid - dpr / 2), 0, dpr, h);
  g.globalAlpha = 1;
}

/** A still reading for the library page and the demo: a few hits and their tails. */
export function moveGateDemoReading(steps = 96, phase = 0): MoveGateReading {
  const levels = new Float32Array(steps);
  const open = new Float32Array(steps);
  let gate = 0;
  for (let i = 0; i < steps; i++) {
    const t = (i + phase) % 24;
    const hit = Math.exp(-t / 5) * (0.9 - 0.15 * ((((i + phase) / 24) | 0) % 2));
    levels[i] = Math.max(0.12 + 0.05 * Math.sin(i * 1.7), hit);
  }
  for (let i = 0; i < steps; i++) {
    const wanted = levels[Math.min(steps - 1, i + 2)] > 0.45 ? 1 : 0;
    gate += (wanted - gate) * (wanted > gate ? 0.8 : 0.2);
    open[i] = gate;
  }
  return { levels, open, ahead: 2 / steps };
}
