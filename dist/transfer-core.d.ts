type TransferPoint = {
    x: number;
    y: number;
};
type TransferValue = {
    points: TransferPoint[];
};
/** Straight through: the curve that changes nothing. */
declare const DEFAULT_TRANSFER: TransferValue;
/** Closest two interior points may sit, so a curve stays editable by hand. */
declare const TRANSFER_MIN_GAP = 0.02;
/** Most points a curve carries — past this the shape is a texture, not a curve. */
declare const TRANSFER_MAX_POINTS = 12;
/**
 * Repair anything into a usable curve: clamp to the unit square, sort by x,
 * pin the ends to x=0 and x=1 (their y stays yours), drop points too close to
 * their neighbour to grab, and cap the count. Never mutates the input.
 */
declare function normalizeTransfer(value: unknown): TransferValue;
/** The curve's output at `x` in [0,1]. Outside the domain it holds the ends. */
declare function sampleTransfer(points: TransferPoint[], x: number): number;
/**
 * The curve as a lookup table of `size` samples across the domain — what a
 * shader wants (upload it as a 1-D texture and read it with one tap) and what
 * a preview strokes.
 */
declare function transferLut(points: TransferPoint[], size?: number): Float32Array;
/** Add a point, keeping the curve sorted and legal. Returns the new value and where it landed. */
declare function insertPoint(points: TransferPoint[], x: number, y: number): {
    points: TransferPoint[];
    index: number;
};
/** Drop an interior point. The two ends anchor the domain and never go. */
declare function removePoint(points: TransferPoint[], index: number): TransferPoint[];
/**
 * Move a point. The ends slide only in y; an interior point is held between
 * its neighbours so the curve can never fold back on itself.
 */
declare function movePoint(points: TransferPoint[], index: number, x: number, y: number): TransferPoint[];
/**
 * The point under the pointer, or -1. Distances are in the curve's own unit
 * square, so callers convert pixels with `tolerance = grabPx / boxPx`.
 */
declare function nearestPoint(points: TransferPoint[], x: number, y: number, tolerance: number): number;
/** True when the curve does nothing — used to draw the rest state quietly. */
declare function isIdentityTransfer(points: TransferPoint[]): boolean;

export { DEFAULT_TRANSFER, TRANSFER_MAX_POINTS, TRANSFER_MIN_GAP, type TransferPoint, type TransferValue, insertPoint, isIdentityTransfer, movePoint, nearestPoint, normalizeTransfer, removePoint, sampleTransfer, transferLut };
