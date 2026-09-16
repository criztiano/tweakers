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

  // A smooth curve through the band points (Catmull-Rom), held flat out to the edges.
  const pts = bands.map((b, k) => [x(k), y(b.position)] as const);
  const curve = () => {
    g.moveTo(0, pts[0][1]);
    g.lineTo(pts[0][0], pts[0][1]);
    for (let k = 0; k < n - 1; k++) {
      const p0 = pts[Math.max(0, k - 1)];
      const p1 = pts[k];
      const p2 = pts[k + 1];
      const p3 = pts[Math.min(n - 1, k + 2)];
      g.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
        p2[0], p2[1],
      );
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
