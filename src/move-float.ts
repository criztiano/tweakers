/**
 * Where a box that floats above the panel sits — the preset's name, the
 * agent's prompt. Its place is over the panel's top edge, a gap clear of it.
 * A panel docked high in the page has no room there, and a prompt above the
 * viewport is a prompt nobody can type in: then the box sits inside the top
 * of the panel instead. Pure, so the rule is pinned without a browser.
 */

/** The clear space between the panel's top edge and the box, in px — the CSS uses the same. */
export const MOVE_FLOAT_GAP = 10;

/** `panelTop` is the panel's top edge in the viewport, `boxHeight` the box's own height. */
export function moveFloatSitsInside(panelTop: number, boxHeight: number, gap = MOVE_FLOAT_GAP): boolean {
  if (!Number.isFinite(panelTop) || !Number.isFinite(boxHeight)) return false;
  return panelTop - gap - boxHeight < 0;
}
