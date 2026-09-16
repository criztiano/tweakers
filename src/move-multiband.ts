import { createMoveMeter } from './move-meter';

/** What each band of a multiband cleaner is doing at the playhead, top of the spectrum first. */
export type MoveMultibandReading = {
  /** Each band's level, 0 silent .. 1 the loudest the track gets. */
  levels: ArrayLike<number>;
  /** How open each band's gate is, 0 shut .. 1 open. */
  open?: ArrayLike<number>;
};

export const MoveMultibandMeter = createMoveMeter<MoveMultibandReading>();

export type MoveMultibandColours = { text: string; amount: string };

/**
 * Paints the bands over the grid: each band's live level as a column, bright
 * where its gate lets it through; then the curve the bands are set to — how
 * hard each is cleaned — through a point per band, the touched ones larger.
 */
export function drawMoveMultiband(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  reading: MoveMultibandReading | null,
  bands: { position: number; active?: boolean }[],
  colours: MoveMultibandColours,
  pad = 0,
): void {
  g.clearRect(0, 0, w, h);
  const n = bands.length;
  if (!n) return;
  const tall = h - pad * 2;
  const y = (v: number) => pad + (1 - Math.max(0, Math.min(1, v))) * tall;
  const slice = w / n;
  const x = (k: number) => (k + 0.5) * slice;

  if (reading) {
    g.fillStyle = colours.text;
    const gap = Math.min(slice / 4, 3 * dpr);
    for (let k = 0; k < n && k < reading.levels.length; k++) {
      const through = reading.open ? Math.max(0, Math.min(1, reading.open[k])) : 1;
      g.globalAlpha = 0.05 + 0.15 * through;
      const top = y(reading.levels[k]);
      g.fillRect(k * slice + gap, top, slice - gap * 2, pad + tall - top);
    }
    g.globalAlpha = 1;
  }

  // A smooth curve through the band points that never swings past them
  // (monotone cubic), held flat out to the edges.
  const pts = bands.map((b, k) => [x(k), y(b.position)] as const);
  const slopes = pts.map((_, k) => {
    if (k === 0 || k === n - 1) return 0;
    const before = (pts[k][1] - pts[k - 1][1]) / slice;
    const after = (pts[k + 1][1] - pts[k][1]) / slice;
    return before * after <= 0 ? 0 : (2 * before * after) / (before + after);
  });
  const curve = () => {
    g.moveTo(0, pts[0][1]);
    g.lineTo(pts[0][0], pts[0][1]);
    for (let k = 0; k < n - 1; k++) {
      const [x1, y1] = pts[k];
      const [x2, y2] = pts[k + 1];
      g.bezierCurveTo(x1 + slice / 3, y1 + (slopes[k] * slice) / 3, x2 - slice / 3, y2 - (slopes[k + 1] * slice) / 3, x2, y2);
    }
    g.lineTo(w, pts[n - 1][1]);
  };
  g.beginPath();
  curve();
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.closePath();
  g.globalAlpha = 0.14;
  g.fillStyle = colours.amount;
  g.fill();
  g.globalAlpha = 1;
  g.beginPath();
  curve();
  g.strokeStyle = colours.amount;
  g.lineWidth = 1.5 * dpr;
  g.lineJoin = 'round';
  g.stroke();

  bands.forEach((b, k) => {
    g.beginPath();
    g.arc(pts[k][0], pts[k][1], (b.active ? 4 : 2.5) * dpr, 0, Math.PI * 2);
    g.fillStyle = b.active ? colours.text : colours.amount;
    g.fill();
  });
}

/** A still reading for the library page: six bands, the lows gated. */
export function moveMultibandDemoReading(t = 0): MoveMultibandReading {
  const levels = [0.35, 0.5, 0.7, 0.6, 0.45, 0.3].map((v, k) => Math.max(0, Math.min(1, v + 0.12 * Math.sin(t * 0.004 + k * 1.3))));
  return { levels, open: levels.map((v) => (v > 0.4 ? 1 : 0.2)) };
}
