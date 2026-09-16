import { useEffect, useRef } from 'react';

/**
 * A canvas a live face paints once a frame while it is mounted — or once,
 * when `still` is set and whenever `deps` change. `paint` gets the canvas
 * sized to its box in device pixels and a reader for the kit's tokens.
 */
export function MoveLiveCanvas({ className, paint, still = false, deps = [] }: {
  className: string;
  paint: (g: CanvasRenderingContext2D, w: number, h: number, dpr: number, token: (name: string) => string) => void;
  still?: boolean;
  deps?: unknown[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef(paint);
  paintRef.current = paint;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
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
      paintRef.current(g, w, h, dpr, (name) => css.getPropertyValue(name).trim());
    };
    if (still) {
      draw();
      return;
    }
    let frame = requestAnimationFrame(function tick() {
      draw();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still, ...deps]);

  return <canvas ref={canvasRef} className={className} />;
}
