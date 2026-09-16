import { useEffect, useRef } from 'react';
import { drawMoveGate, MoveGateMeter, type MoveGateReading } from '../move-gate';

/** The trace's inset from the display's edges, so the threshold line meets the bar's marker. */
const GATE_TRACE_PAD = 1;

function paintGate(canvas: HTMLCanvasElement, reading: MoveGateReading | null, threshold: number) {
  const g = canvas.getContext('2d');
  const box = canvas.getBoundingClientRect();
  if (!g || !box.width || !box.height) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(box.width * dpr);
  const h = Math.round(box.height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const css = getComputedStyle(canvas);
  const token = (name: string) => css.getPropertyValue(name).trim();
  drawMoveGate(g, w, h, dpr, reading, threshold, {
    text: token('--move-text'),
    threshold: token('--move-gate-threshold'),
    lookahead: token('--move-gate-lookahead'),
    release: token('--move-gate-release'),
  }, GATE_TRACE_PAD * dpr);
}

/**
 * The gate face's live picture: a canvas that reads the panel's attached
 * gate once a frame while it is mounted. A still `reading` draws once
 * instead — the library page's specimen.
 */
export function MoveGateDisplay({ panelId, threshold, reading }: { panelId?: string; threshold: number; reading?: MoveGateReading }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;
  const still = reading !== undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || still) return;
    let frame = requestAnimationFrame(function tick() {
      paintGate(canvas, panelId ? MoveGateMeter.read(panelId) : null, thresholdRef.current);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [panelId, still]);

  useEffect(() => {
    if (canvasRef.current && reading) paintGate(canvasRef.current, reading, threshold);
  }, [reading, threshold]);

  return <canvas ref={canvasRef} className="tweakers-move-gate-canvas" />;
}
