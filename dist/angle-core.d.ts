/** Half the pointer travel, in pixels from the centre, below which a drag is ignored. */
declare const ANGLE_DEAD_ZONE_PX = 4;
/**
 * Snap to the step and round to its implied precision. `min` anchors the
 * lattice so a -180..180 range steps through 0, not through 0.5.
 */
declare function snapAngle(value: number, min: number, step: number): number;
/**
 * Bring a value into `min..max`. Wrapping ranges (a heading) come back around;
 * bounded ones (a cone width) clamp.
 */
declare function normalizeAngle(value: number, min: number, max: number, wrap: boolean): number;
/** Value → compass bearing in degrees (0 = up, clockwise). */
declare function valueToBearing(value: number, min: number, max: number): number;
/** Compass bearing in degrees → value, before stepping. */
declare function bearingToValue(bearing: number, min: number, max: number): number;
/**
 * The value a pointer at (dx, dy) from the dial's centre asks for, or null
 * inside the dead zone — where the bearing is noise, not intent. `dy` is in
 * screen space (down is positive), which is why the y term is negated.
 *
 * On a wrapping range the result is chosen in the turn nearest `current`, so
 * dragging past the top carries on instead of snapping a full turn back.
 */
declare function angleFromPointer(dx: number, dy: number, current: number, min: number, max: number, step: number, wrap: boolean): number | null;
/** Keyboard nudge: arrows step, shift takes ten. */
declare function nudgeAngle(value: number, delta: number, min: number, max: number, step: number, wrap: boolean): number;
/**
 * The needle's arc as an SVG path — from the origin bearing round to the
 * value's, the short way is not what we want here: the sweep shows how far
 * the dial has turned from its rest position, so it always follows the
 * direction of travel.
 */
declare function arcPath(from: number, to: number, radius: number, cx?: number, cy?: number): string;

export { ANGLE_DEAD_ZONE_PX, angleFromPointer, arcPath, bearingToValue, normalizeAngle, nudgeAngle, snapAngle, valueToBearing };
