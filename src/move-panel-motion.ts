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

/** The displays that float over the panel — the notification stack's own
 *  list, less the panel itself. They come and go with a room or a page, and
 *  move with it: one leaving fades out as a copy, one arriving zooms in. */
const FLOATS = '.tweakers-move-wave[data-variant="dock"], .tweakers-move-curve, .tweakers-move-preset-save, [data-move-float]';

/** How long after a change a float may still turn up and join it — a float
 *  that mounts on its own effect lands a render or two late. */
const FLOAT_LATE_MS = 200;

/** Marks the frozen copies, so a later change can find and retire them. */
const GHOST_ATTR = 'data-move-panel-ghost';
/** On the panel while a change plays: its ground eases to the new palette. */
export const MOVE_PANEL_MOTION_ATTR = 'data-move-panel-motion';
/** The id every live-layer animation wears, so the next change can stop it. */
const ANIMATION_ID = 'tweakers-move-panel-motion';
/** The panel's height easing from one page's to the next's, apart from the
 *  controls' own zoom so each can be stopped on its own. */
const HEIGHT_ID = 'tweakers-move-panel-height';
/** The panel's width easing the same way: the page's column count, which
 *  every width in the panel is measured from (a registered number, so it
 *  moves through the fractions between two pages' counts). */
const WIDTH_ID = 'tweakers-move-panel-width';
const SURFACE_COLS = '--move-surface-cols';
/** On a panel this module made positioned for the length of a change. */
const POSITIONED_ATTR = 'data-move-panel-positioned';
const INNER = '.tweakers-move-inner';

/** What leaves: a frozen copy of the controls, and where it stood. */
export interface MovePanelPicture {
  scope: MovePanelChangeScope;
  panel: HTMLElement;
  ghost: HTMLElement;
  left: number;
  top: number;
  width: number;
  height: number;
  /** How tall the panel's inside stood — mid-change, wherever its height
   *  had eased to — for the new height to ease from. */
  innerHeight: number;
  /** How many columns wide it stood, the same way — for the new width. */
  surfaceCols: number;
  /** The look the leaving layer had reached — mid-change, it is not 1. */
  opacity: number;
  transform: string;
  /** Scrolled boxes inside the copy, and where to scroll each once laid. */
  scrolls: { el: Element; top: number; left: number }[];
  /** The floats standing when the picture was taken, each with a copy of
   *  the box it hangs in, to fade out should it leave with the change. */
  floats: FloatPicture[];
}

interface FloatPicture {
  el: Element;
  /** Where its box hung — the body, or the panel. */
  parent: Element;
  /** A frozen copy of that box, and the float inside the copy. */
  copy: HTMLElement;
  float: HTMLElement;
  transform: string;
}

/** A transform on top of the one an element already wears (a float centred
 *  with translateX(-50%) keeps its place while it zooms). */
const compose = (base: string, scale: string) => (base === 'none' ? scale : `${base} ${scale}`);

/** Frozen copies draw nothing on their canvases; paint in what each shows. */
function copyCanvases(source: Element, copy: Element) {
  const canvases = source.querySelectorAll('canvas');
  copy.querySelectorAll('canvas').forEach((target, i) => {
    const from = canvases[i];
    if (!from?.width || !from.height) return;
    try {
      target.getContext('2d')?.drawImage(from, 0, 0);
    } catch {
      // a tainted or lost context draws nothing — the copy fades regardless
    }
  });
}

const liveFloats = () => Array.from(document.querySelectorAll(FLOATS)).filter((el) => !el.closest(`[${GHOST_ATTR}]`));

function pictureFloats(panel: HTMLElement): FloatPicture[] {
  return liveFloats().flatMap((el) => {
    // the box it hangs in: a direct child of the body (a portal) or of the panel
    let box: Element = el;
    while (box.parentElement && box.parentElement !== document.body && box.parentElement !== panel) box = box.parentElement;
    const parent = box.parentElement;
    if (!parent) return [];
    const path: number[] = [];
    for (let node: Element = el; node !== box; node = node.parentElement!) path.unshift(Array.prototype.indexOf.call(node.parentElement!.children, node));
    const copy = box.cloneNode(true) as HTMLElement;
    copyCanvases(box, copy);
    let float: Element = copy;
    for (const index of path) float = float.children[index];
    return [{ el, parent, copy, float: float as HTMLElement, transform: getComputedStyle(el).transform }];
  });
}

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Take the picture of what is about to leave. Call it before the change
 * reaches the DOM (a class component's `getSnapshotBeforeUpdate`).
 */
export function takePanelPicture(panel: HTMLElement | null, scope: MovePanelChangeScope): MovePanelPicture | null {
  if (!panel || typeof panel.animate !== 'function') return null;
  const inner = panel.querySelector<HTMLElement>(`${INNER}:not([${GHOST_ATTR}])`);
  // layout height: the inside may be mid-zoom, and a scale is not its size
  const innerHeight = inner?.offsetHeight ?? 0;
  const surfaceCols = inner ? parseFloat(getComputedStyle(inner).getPropertyValue(SURFACE_COLS)) || 0 : 0;
  // The copy of the whole inside hangs in the panel, and must move with it
  // while the panel's height eases — so the panel holds it, for the change.
  if (scope === 'inside' && getComputedStyle(panel).position === 'static') {
    panel.style.position = 'relative';
    panel.setAttribute(POSITIONED_ATTR, '');
  }
  const target = panel.querySelector<HTMLElement>(`${TARGET[scope]}:not([${GHOST_ATTR}])`);
  const box = target?.offsetParent as HTMLElement | null;
  if (!target || !box) {
    settle(panel);
    return null;
  }
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    settle(panel);
    return null;
  }
  const boxRect = box.getBoundingClientRect();
  const look = getComputedStyle(target);

  const ghost = target.cloneNode(true) as HTMLElement;
  ghost.setAttribute(GHOST_ATTR, '');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  copyCanvases(target, ghost);
  // the palette the leaving controls wore, should the change flip it
  if (scope === 'inside') {
    const vars = getComputedStyle(panel);
    for (let i = 0; i < vars.length; i++) {
      const name = vars[i];
      if (name.startsWith('--move-')) ghost.style.setProperty(name, vars.getPropertyValue(name));
    }
  } else {
    // The copy hangs inside the live panel, so it would read the NEW page's
    // columns — eight old dials folding into two rows of four. It keeps the
    // columns it was drawn with.
    const vars = getComputedStyle(target);
    for (const name of ['--move-cols', '--move-surface-cols', '--move-screen-w']) {
      ghost.style.setProperty(name, vars.getPropertyValue(name));
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
    innerHeight,
    surfaceCols,
    opacity: Number(look.opacity) || 0,
    transform: look.transform === 'none' ? 'scale(1)' : look.transform,
    scrolls,
    floats: pictureFloats(panel),
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
    settle(panel);
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
  playFloats(picture, plan);
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

  easeHeight(picture, plan);
  easeWidth(picture, plan);

  clearTimeout(settleTimers.get(panel));
  settleTimers.set(panel, setTimeout(() => settle(panel), plan.duration));
}

/**
 * The panel keeps the height it had and eases to the new page's on the
 * controls' own curve — the page around it moving with it — instead of
 * jumping the moment the change commits. The controls stay under the
 * header; what does not fit yet is clipped at the bottom edge (a little past
 * it, so a zooming copy keeps its corners) until the panel has grown to it.
 */
function easeHeight(picture: MovePanelPicture, plan: ReturnType<typeof movePanelChoreography>) {
  const inner = picture.panel.querySelector<HTMLElement>(`${INNER}:not([${GHOST_ATTR}])`);
  if (!inner || !picture.innerHeight) return;
  for (const running of inner.getAnimations()) if (running.id === HEIGHT_ID) running.cancel();
  let to = naturalHeight(inner);
  if (Math.abs(to - picture.innerHeight) < 1) {
    inner.style.removeProperty('overflow-y');
    inner.style.removeProperty('overflow-clip-margin');
    return;
  }
  inner.style.overflowY = 'clip';
  inner.style.setProperty('overflow-clip-margin', '12px');
  const frames = (end: number) => [{ height: `${picture.innerHeight}px` }, { height: `${end}px` }];
  const easing = plan.arriving.move?.easing ?? 'linear';
  const timing: KeyframeAnimationOptions = { duration: plan.duration, fill: 'none', id: HEIGHT_ID };
  let grow: Animation;
  try {
    grow = inner.animate(frames(to), { ...timing, easing });
  } catch {
    grow = inner.animate(frames(to), { ...timing, easing: MOVE_VIEW_EXPO_BEZIER });
  }
  // The new page may still settle a render or two after the commit (a header
  // chip waking, a row filling in): the easing follows it to where it lands,
  // so the panel never jumps the last few pixels when the change ends.
  const follow = () => {
    if (grow.playState !== 'running') return;
    const now = naturalHeight(inner);
    if (Math.abs(now - to) >= 1) {
      to = now;
      (grow.effect as KeyframeEffect | null)?.setKeyframes(frames(to));
    }
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}

/**
 * The panel's width follows on the same curve. Every width in it — the dial
 * cluster, the header row, where the wheel screen stands — is measured from
 * the page's column count, so the count itself eases from the old page's to
 * the new one's instead of snapping when the change commits.
 */
function easeWidth(picture: MovePanelPicture, plan: ReturnType<typeof movePanelChoreography>) {
  const inner = picture.panel.querySelector<HTMLElement>(`${INNER}:not([${GHOST_ATTR}])`);
  if (!inner || !picture.surfaceCols) return;
  for (const running of inner.getAnimations()) if (running.id === WIDTH_ID) running.cancel();
  const to = parseFloat(inner.style.getPropertyValue(SURFACE_COLS));
  if (!to || Math.abs(to - picture.surfaceCols) < 0.01) return;
  const frames = [{ [SURFACE_COLS]: String(picture.surfaceCols) }, { [SURFACE_COLS]: String(to) }];
  const timing: KeyframeAnimationOptions = { duration: plan.duration, fill: 'none', id: WIDTH_ID };
  try {
    inner.animate(frames, { ...timing, easing: plan.arriving.move?.easing ?? 'linear' });
  } catch {
    inner.animate(frames, { ...timing, easing: MOVE_VIEW_EXPO_BEZIER });
  }
}

/** Where the inside would stand at rest, read while its height is held: the
 *  bottom of its lowest box in flow, plus its own padding and border. */
function naturalHeight(inner: HTMLElement): number {
  let bottom = 0;
  for (const child of Array.from(inner.children) as HTMLElement[]) {
    if (child.hasAttribute(GHOST_ATTR)) continue;
    const { position, marginBottom } = getComputedStyle(child);
    if (position === 'absolute' || position === 'fixed') continue;
    bottom = Math.max(bottom, child.offsetTop + child.offsetHeight + (parseFloat(marginBottom) || 0));
  }
  const { paddingBottom, borderBottomWidth } = getComputedStyle(inner);
  return bottom + (parseFloat(paddingBottom) || 0) + (parseFloat(borderBottomWidth) || 0);
}

/** The change has landed: the panel goes back to how it stands at rest. */
function settle(panel: HTMLElement) {
  panel.removeAttribute(MOVE_PANEL_MOTION_ATTR);
  if (panel.hasAttribute(POSITIONED_ATTR)) {
    panel.style.removeProperty('position');
    panel.removeAttribute(POSITIONED_ATTR);
  }
  const inner = panel.querySelector<HTMLElement>(`${INNER}:not([${GHOST_ATTR}])`);
  inner?.style.removeProperty('overflow-y');
  inner?.style.removeProperty('overflow-clip-margin');
}

/** Floats that left with the change fade out as copies; floats that came
 *  with it — now, or a render or two late — zoom in on the panel's beat. */
function playFloats(picture: MovePanelPicture, plan: ReturnType<typeof movePanelChoreography>) {
  const { leaving, arriving } = plan;
  for (const gone of picture.floats) {
    if (gone.el.isConnected || !gone.parent.isConnected) continue;
    gone.copy.setAttribute(GHOST_ATTR, '');
    gone.copy.setAttribute('aria-hidden', 'true');
    gone.copy.inert = true;
    gone.copy.style.pointerEvents = 'none';
    gone.parent.appendChild(gone.copy);
    const frames = leaving.move
      ? [{ opacity: 1, transform: compose(gone.transform, 'scale(1)') }, { opacity: 0, transform: compose(gone.transform, leaving.move.to) }]
      : [{ opacity: 1 }, { opacity: 0 }];
    const out = animate(gone.float, frames, leaving.fade.duration, leaving.fade.easing, MOVE_VIEW_EXPO_BEZIER, 'forwards');
    out.finished.then(() => gone.copy.remove(), () => gone.copy.remove());
  }

  const known = new Set(picture.floats.map((f) => f.el));
  const started = performance.now();
  const arrive = () => {
    const elapsed = performance.now() - started;
    for (const el of liveFloats()) {
      if (known.has(el) || !(el instanceof HTMLElement)) continue;
      known.add(el);
      const base = getComputedStyle(el).transform;
      const zoom = arriving.move
        ? animate(el, [{ transform: compose(base, arriving.move.from) }, { transform: base }], arriving.move.duration, arriving.move.easing, MOVE_VIEW_EXPO_BEZIER, 'none')
        : null;
      const fade = animate(el, [{ opacity: 0 }, { opacity: 1 }], arriving.fade.duration, arriving.move ? MOVE_PANEL_ARRIVE_EASING : 'linear', MOVE_VIEW_EXPO_BEZIER, 'none');
      // a late float joins the change where it stands, not from its start
      if (zoom) zoom.currentTime = elapsed;
      fade.currentTime = elapsed;
    }
    if (elapsed < FLOAT_LATE_MS) requestAnimationFrame(arrive);
  };
  arrive();
}
