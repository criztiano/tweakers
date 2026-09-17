/**
 * The control panel's own changes, played on the live panel.
 *
 * A page switch, the settings room or a modulator's page coming and going
 * all happen inside one mounted MovePanel, many times a minute, often from
 * the hardware. They are not played as the browser's view transition: that
 * holds every picture out of the pointer's reach while it runs, and one
 * change at a time for the whole document. Instead the panel takes a
 * picture of what is leaving — a copy of its controls, frozen, laid exactly
 * over where they stood — just before React commits the change, and plays
 * the zoom-through on two real layers: the copy grows to 105% and fades,
 * the live controls grow up from 95% and fade in. The live controls answer
 * the pointer and the knobs the whole time.
 *
 * A change landing on one still playing starts from wherever the moving
 * layer is: its copy is taken at the opacity and scale it has reached, so
 * nothing jumps; the older copy fades on underneath and goes.
 *
 * Only opacity and transform animate; the copy is taken once, off the DOM
 * the panel already built, and thrown away when its fade ends.
 */

import {
  MOVE_PANEL_ARRIVE_EASING,
  MOVE_VIEW_EXPO_BEZIER,
  movePanelChoreography,
} from './move-view-core';

/** How much of the panel a change moves: the controls under the header (a
 *  page switch), or the whole inside, header and all (a room or a
 *  modulator's page, which changes the header too). */
export type MovePanelChangeScope = 'controls' | 'inside';

const TARGET: Record<MovePanelChangeScope, string> = {
  controls: '.tweakers-move-controls',
  inside: '.tweakers-move-inner',
};

/** Marks the frozen copies, so a later change can find and retire them. */
const GHOST_ATTR = 'data-move-panel-ghost';
/** On the panel while a change plays: its ground eases to the new palette. */
export const MOVE_PANEL_MOTION_ATTR = 'data-move-panel-motion';
/** The id every live-layer animation wears, so the next change can stop it. */
const ANIMATION_ID = 'tweakers-move-panel-motion';

/** What leaves: a frozen copy of the controls, and where it stood. */
export interface MovePanelPicture {
  scope: MovePanelChangeScope;
  panel: HTMLElement;
  ghost: HTMLElement;
  left: number;
  top: number;
  width: number;
  height: number;
  /** The look the leaving layer had reached — mid-change, it is not 1. */
  opacity: number;
  transform: string;
  /** Scrolled boxes inside the copy, and where to scroll each once laid. */
  scrolls: { el: Element; top: number; left: number }[];
}

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Take the picture of what is about to leave. Call it before the change
 * reaches the DOM (a class component's `getSnapshotBeforeUpdate`).
 */
export function takePanelPicture(panel: HTMLElement | null, scope: MovePanelChangeScope): MovePanelPicture | null {
  if (!panel || typeof panel.animate !== 'function') return null;
  const target = panel.querySelector<HTMLElement>(TARGET[scope]);
  const box = target?.offsetParent as HTMLElement | null;
  if (!target || !box) return null;
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const boxRect = box.getBoundingClientRect();
  const look = getComputedStyle(target);

  const ghost = target.cloneNode(true) as HTMLElement;
  ghost.setAttribute(GHOST_ATTR, '');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  // canvases copy blank; draw what each one shows
  const canvases = target.querySelectorAll('canvas');
  ghost.querySelectorAll('canvas').forEach((copy, i) => {
    const source = canvases[i];
    if (!source?.width || !source.height) return;
    try {
      copy.getContext('2d')?.drawImage(source, 0, 0);
    } catch {
      // a tainted or lost context draws nothing — the copy fades regardless
    }
  });
  // the palette the leaving controls wore, should the change flip it
  if (scope === 'inside') {
    const vars = getComputedStyle(panel);
    for (let i = 0; i < vars.length; i++) {
      const name = vars[i];
      if (name.startsWith('--move-')) ghost.style.setProperty(name, vars.getPropertyValue(name));
    }
  }
  const scrolls: MovePanelPicture['scrolls'] = [];
  const copies = ghost.querySelectorAll('*');
  target.querySelectorAll('*').forEach((el, index) => {
    if (el.scrollTop || el.scrollLeft) scrolls.push({ el: copies[index], top: el.scrollTop, left: el.scrollLeft });
  });
  // a copy still fading from an earlier change is not part of this picture
  ghost.querySelectorAll(`[${GHOST_ATTR}]`).forEach((stale) => stale.remove());
  // the ground eases across with the controls
  panel.setAttribute(MOVE_PANEL_MOTION_ATTR, '');

  return {
    scope,
    panel,
    ghost,
    left: rect.left - boxRect.left - box.clientLeft + box.scrollLeft,
    top: rect.top - boxRect.top - box.clientTop + box.scrollTop,
    width: rect.width,
    height: rect.height,
    opacity: Number(look.opacity) || 0,
    transform: look.transform === 'none' ? 'scale(1)' : look.transform,
    scrolls,
  };
}

/* The live layer holds nothing after it lands (fill none): a transform left
   on it, even scale(1), would make it the containing block of every popup
   inside. The copy holds its last frame until it is removed. */
function animate(el: HTMLElement, frames: Keyframe[], duration: number, easing: string, fallback: string, fill: FillMode): Animation {
  const timing: KeyframeAnimationOptions = { duration, fill, id: ANIMATION_ID };
  try {
    return el.animate(frames, { ...timing, easing });
  } catch {
    return el.animate(frames, { ...timing, easing: fallback });
  }
}

const settleTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

/** Play the change: the copy out over the live controls, the live controls in. */
export function playPanelChange(picture: MovePanelPicture): void {
  const { panel, ghost, scope } = picture;
  const live = panel.querySelector<HTMLElement>(`${TARGET[scope]}:not([${GHOST_ATTR}])`);
  const parent = live?.parentElement;
  if (!live || !parent || !panel.isConnected) {
    panel.removeAttribute(MOVE_PANEL_MOTION_ATTR);
    return;
  }
  const plan = movePanelChoreography(reducedMotion());

  // An older copy still fading keeps fading underneath; anything older than
  // that goes now, so a run of presses never stacks pictures.
  const older = Array.from(parent.querySelectorAll<HTMLElement>(`:scope > [${GHOST_ATTR}]`));
  for (const stale of older.slice(0, -1)) stale.remove();

  Object.assign(ghost.style, {
    position: 'absolute',
    left: `${picture.left}px`,
    top: `${picture.top}px`,
    width: `${picture.width}px`,
    height: `${picture.height}px`,
    margin: '0',
    pointerEvents: 'none',
    transformOrigin: '50% 50%',
    zIndex: '1',
  });
  parent.appendChild(ghost);
  for (const { el, top, left } of picture.scrolls) {
    el.scrollTop = top;
    el.scrollLeft = left;
  }

  const { leaving, arriving } = plan;
  const out = animate(
    ghost,
    leaving.move
      ? [{ opacity: picture.opacity, transform: picture.transform }, { opacity: 0, transform: leaving.move.to }]
      : [{ opacity: picture.opacity }, { opacity: 0 }],
    leaving.fade.duration,
    leaving.fade.easing,
    MOVE_VIEW_EXPO_BEZIER,
    'forwards'
  );
  out.finished.then(() => ghost.remove(), () => ghost.remove());

  // the live controls start over from the arriving end, whatever they were doing
  for (const running of live.getAnimations()) if (running.id === ANIMATION_ID) running.cancel();
  if (arriving.move) {
    animate(live, [{ transform: arriving.move.from }, { transform: arriving.move.to }], arriving.move.duration, arriving.move.easing, MOVE_VIEW_EXPO_BEZIER, 'none');
    animate(live, [{ opacity: 0 }, { opacity: 1 }], arriving.fade.duration, MOVE_PANEL_ARRIVE_EASING, MOVE_VIEW_EXPO_BEZIER, 'none');
  } else {
    animate(live, [{ opacity: 0 }, { opacity: 1 }], arriving.fade.duration, 'linear', 'linear', 'none');
  }

  clearTimeout(settleTimers.get(panel));
  settleTimers.set(panel, setTimeout(() => panel.removeAttribute(MOVE_PANEL_MOTION_ATTR), plan.duration));
}

/** Throw away a picture that will not be played (the change never came). */
export function dropPanelPicture(picture: MovePanelPicture | null): void {
  picture?.panel.removeAttribute(MOVE_PANEL_MOTION_ATTR);
}
