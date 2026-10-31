/**
 * The steering hand: the computer's way to play the panel without a click.
 *
 * Coming down into the panel, the arrow is sucked into the nearest control
 * and stays gone until the pointer goes back up over the panel's top edge —
 * then it is shot back out of the control it held. Below that edge there is
 * no arrow anywhere, and no way out to the sides or the bottom.
 *
 * Inside, the pointer is a hand on a control, not a place (move-steer-core).
 * Its travel, quicker than the page's, leans and stretches the control the
 * way it pulls; past the control's threshold the hand lets go and lands on
 * the next control that way, which takes the hit and lights up. A rest lets
 * the tension go. The panel never sees the real pointer: every press, wheel
 * and hover reaches the control in the hand, where the hand is.
 *
 * Holding ⌘ (Ctrl off a Mac) takes the control: the hand stays where it is
 * and the mouse's travel turns the control, as a drag on it would — the
 * travel reaches the slot as the pointer gesture its face already answers
 * (move-slot-core), and a face that would jump to where a press lands asks
 * `isMoveSteer` and turns from its value instead. Letting go is never a tap.
 * A slot with two hands (`data-hands="2"`: xy, range, colour — the controls
 * the Move's volume knob reaches while their knob is held) splits the
 * travel, across for the knob and up and down for the volume knob, and there
 * Shift locks the travel to the axis it moves along most; everywhere else
 * Shift keeps its meaning, fine. A chip (`data-peek`) does what its pad does
 * on the Move: held, it lends its control to the knob above it, and the
 * travel turns that knob.
 */
import {
  MOVE_STEER_GAIN, MOVE_STEER_KNOCK, moveSteerArc, moveSteerEase, MOVE_STEER_REST_MS, moveSteerNext, moveSteerPose, moveSteerReach,
  moveSteerSpring, moveSteerTravel, type MoveSteerBox, type MoveSteerSpring, type MoveSteerVec,
} from './move-steer-core';
import { TweakStore } from './store/TweakStore';
import { MOVE_PANEL_SETTINGS } from './move-track-labels';
import { playMoveSteerLock } from './move-steer-sound';
import { MoveSurfaceStore } from './move-surface-store';

/** The big wheel's events (MovePanel's MOVE_JOG_EVENT / MOVE_JOG_CLICK_EVENT; spelled out to keep the panel out of this module). */
const JOG = 'move-tweakers:jog';
const JOG_CLICK = 'move-tweakers:jog-click';

/** What the hand can hold: a slot, a pad, a header button, the wheel's list (as one control). */
export const MOVE_STEER_TARGET = [
  '.tweakers-move-wheel-screen',
  '.tweakers-move-dial:not([data-empty]):not([data-kind="blank"])',
  '.tweakers-move-pad:not([data-empty="true"])',
  'button:not(:disabled)',
  '[role="option"]',
  '[role="tab"]',
].join(', ');
/** A control with rows: the hand holds it whole, and only ⌘, two fingers or the arrow keys walk it. */
const LIST_ROWS = '.tweakers-list-screen-row, .tweakers-move-dial-tile';
const WHEEL_LIST = '.tweakers-move-wheel-screen';
/** The travel that walks the wheel's list one row. */
const ROW_TRAVEL = 16;
/** A pointer flung this far over the panel's top leaves wherever the hand is. */
const FLUNG = 200;
/** Shift's travel, in px, before it decides which axis it locks. */
export const MOVE_STEER_AXIS_SLOP = 4;
/** A press that travels less than this is a click. */
const CLICK_SLOP = 3;
/** The arrow's flight in, and the dot's flight out, in ms. */
const SUCK_MS = 260;
const SHOOT_MS = 180;
/** How quickly the arrow, once out, closes on where the real pointer is (time constant, s). */
const CATCH_UP = 0.12;

/** Every event the hand sends; the ⌘ gestures are also in `steered`. */
const sent = new WeakSet<Event>();
const steered = new WeakSet<Event>();

/** Whether a pointer event came from the steering hand's ⌘ gesture, not a press. */
export const isMoveSteer = (e: Event | { nativeEvent: Event }) =>
  steered.has('nativeEvent' in e ? e.nativeEvent : e);

const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** The key that takes the control: ⌘ on a Mac, Ctrl elsewhere. */
export const moveSteerKey = (mac = MAC) => (mac ? 'Meta' : 'Control');
/** Whether an event says the steering key is down. */
export const moveSteerHeld = (e: { metaKey: boolean; ctrlKey: boolean }, mac = MAC) => (mac ? e.metaKey : e.ctrlKey);

/** Shift's axis lock on a two-handed slot: the axis, once decided, and the travel that decides it. */
export type MoveSteerLock = { axis: 'x' | 'y' | null; x: number; y: number };

/**
 * The travel a two-handed slot takes while Shift is down. Until the travel
 * since Shift went down has gone `MOVE_STEER_AXIS_SLOP` px nothing moves;
 * then the axis it went further along is the one that moves, the gathered
 * travel included, and the other stands still until Shift comes up.
 */
export function moveSteerAxis(lock: MoveSteerLock, dx: number, dy: number) {
  if (!lock.axis) {
    lock.x += dx;
    lock.y += dy;
    if (Math.hypot(lock.x, lock.y) < MOVE_STEER_AXIS_SLOP) return { dx: 0, dy: 0 };
    lock.axis = Math.abs(lock.x) >= Math.abs(lock.y) ? 'x' : 'y';
    return lock.axis === 'x' ? { dx: lock.x, dy: 0 } : { dx: 0, dy: lock.y };
  }
  return lock.axis === 'x' ? { dx, dy: 0 } : { dx: 0, dy };
}

/** A press the hand holds: where it went down, and where the hand has taken it since. */
type Grip = { target: Element; x: number; y: number; pressed: boolean; hands: 1 | 2 };

/** ⌘ held on a control. */
type Hold = {
  /** What the travel turns: the slot's own press, or the knob a held chip lent its control to. */
  grip: Grip;
  /** A chip held down — the Move's hold-a-pad-and-turn-the-knob — while its knob turns. */
  chip: Grip | null;
  shift: boolean;
  lock: MoveSteerLock;
};

const hands = (el: Element) => (el.closest('[data-hands="2"]') ? 2 : 1);
const editable = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable);
const boxOf = (el: Element): MoveSteerBox => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
};
const middle = (b: MoveSteerBox): MoveSteerVec => ({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 });
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The arrow the page shows, drawn for the moment it is sucked in. */
const ARROW = '<svg viewBox="0 0 14 20" aria-hidden="true"><path d="M1 1v15.5l4-3.8 2.7 6.1 2.6-1.1-2.6-6h5.6z"/></svg>';

/**
 * Puts the steering hand on a panel: `root` is the panel, read on every
 * event, so it may mount late. Answers the detach.
 */
export function attachMoveSteer(root: () => HTMLElement | null): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  /** Over the whole window while the hand is in the panel: the arrow's absence, and what catches the real pointer. */
  let veil: HTMLDivElement | null = null;
  let inside = false;
  let selected: Element | null = null;
  /** The hand, in hand pixels from the middle of what it holds. */
  let offset: MoveSteerVec = { x: 0, y: 0 };
  let real: { x: number; y: number; id: number } | null = null;
  let lastMove = 0;
  let hold: Hold | null = null;
  let press: Grip | null = null;
  let pressTravel = 0;
  let heading: MoveSteerVec = { x: 0, y: -1 };
  /** Until when the hand is still catching the arrow: the travel that brought it in moves nothing. */
  let landing = 0;
  /** A hold the trackpad's two fingers opened, and the timer that lets it go when they stop. */
  let wheelHold = false;
  let wheelRest: ReturnType<typeof setTimeout> | undefined;
  /** The wheel's list walk: travel gathered toward the next row. */
  let walked = 0;
  const springs = new Map<Element, MoveSteerSpring>();
  let frame = 0;
  let then = 0;

  /** Where the hand was last — what a control gone from the page is replaced by. */
  let lastHand: MoveSteerVec = { x: 0, y: 0 };
  const panelTop = () => root()?.getBoundingClientRect().top ?? Infinity;
  const hand = (): MoveSteerVec => {
    if (!selected?.isConnected) return lastHand;
    const m = middle(boxOf(selected));
    lastHand = { x: m.x + offset.x, y: m.y + offset.y };
    return lastHand;
  };
  const isWheelList = (el: Element | null) => !!el?.matches(WHEEL_LIST);
  const hasRows = (el: Element | null) => !!el?.querySelector(LIST_ROWS);

  /**
   * The wheel's list walks as the big wheel turns it: the hand sends the
   * wheel's own turn, so whoever reads the wheel (the app, an open
   * navigator) walks it. Unread, the list's selection steps itself.
   */
  const turnWheel = (step: number) => {
    const e = new CustomEvent(JOG, { detail: { delta: step, shift: false }, cancelable: true });
    window.dispatchEvent(e);
    if (e.defaultPrevented) return;
    const screen = MoveSurfaceStore.getState().screen;
    if (screen) MoveSurfaceStore.selectScreen(Math.max(0, Math.min(screen.items.length - 1, screen.index + step)));
  };
  const clickWheel = () => {
    window.dispatchEvent(new CustomEvent(JOG_CLICK, { detail: { shift: false }, cancelable: true }));
  };

  /**
   * The controls the hand can land on now: outermost, shown, below the
   * panel's top. A row scrolled out of its list is not there: the hand never
   * scrolls a list on its own — the wheel does.
   */
  const targets = () => {
    const panel = root();
    if (!panel) return [];
    const top = panelTop() - 1;
    return Array.from(panel.querySelectorAll(MOVE_STEER_TARGET)).filter((el) => {
      if (el.parentElement?.closest(MOVE_STEER_TARGET) || el.closest('[aria-hidden="true"], [inert]')) return false;
      const b = boxOf(el);
      if (b.right - b.left < 4 || b.bottom - b.top < 4) return false;
      const list = el.closest('[role="listbox"]');
      if (list && list !== el) {
        const v = boxOf(list);
        const y = (b.top + b.bottom) / 2;
        if (y < v.top || y > v.bottom) return false;
      }
      return b.top >= top;
    });
  };

  /** What is under the hand, the veil looked through. */
  const under = (p: MoveSteerVec) => {
    const panel = root();
    for (const el of document.elementsFromPoint(p.x, p.y)) {
      if (el === veil || veil?.contains(el)) continue;
      return panel?.contains(el) ? el : null;
    }
    return null;
  };

  const send = (target: Element, type: string, p: MoveSteerVec, init: PointerEventInit = {}, steer = false) => {
    const Kind = type.startsWith('pointer') ? PointerEvent : type === 'wheel' ? WheelEvent : MouseEvent;
    const e = new Kind(type, {
      bubbles: type !== 'pointerenter' && type !== 'pointerleave', cancelable: true, composed: true,
      clientX: p.x, clientY: p.y, pointerId: real?.id ?? 1, pointerType: 'mouse', isPrimary: true,
      ...init,
    } as PointerEventInit);
    sent.add(e);
    if (steer) steered.add(e);
    target.dispatchEvent(e);
    return e;
  };

  /* ── motion: a spring per control, run on the frame clock ── */

  const tension = (el: Element): MoveSteerVec => {
    if (reduced() || el !== selected || hold || press || performance.now() - lastMove > MOVE_STEER_REST_MS) return { x: 0, y: 0 };
    const r = moveSteerReach(boxOf(el), false);
    return { x: offset.x / r.x, y: offset.y / r.y };
  };

  const pose = (el: Element, s: MoveSteerSpring) => {
    const style = (el as HTMLElement).style;
    if (!style) return;
    if (Math.abs(s.x) + Math.abs(s.y) < 0.002) { style.translate = ''; style.scale = ''; return; }
    const r = el.getBoundingClientRect();
    const p = moveSteerPose(s, { x: r.width, y: r.height });
    style.translate = `${p.tx.toFixed(2)}px ${p.ty.toFixed(2)}px`;
    style.scale = `${p.sx.toFixed(4)} ${p.sy.toFixed(4)}`;
  };

  const tick = (now: number) => {
    frame = 0;
    const dt = then ? (now - then) / 1000 : 1 / 60;
    then = now;
    // At rest the hand settles back in the middle of what it holds.
    if (inside && selected && !hold && !press && now - lastMove > MOVE_STEER_REST_MS) {
      const k = 1 - Math.exp(-dt / 0.05);
      offset = { x: offset.x * (1 - k), y: offset.y * (1 - k) };
      if (Math.abs(offset.x) + Math.abs(offset.y) < 0.5) offset = { x: 0, y: 0 };
    }
    if (inside && selected && !springs.has(selected)) springs.set(selected, { x: 0, y: 0, vx: 0, vy: 0 });
    let moving = inside && now - lastMove <= MOVE_STEER_REST_MS + 40;
    for (const [el, s] of springs) {
      if (!el.isConnected) { springs.delete(el); continue; }
      const still = !moveSteerSpring(s, tension(el), dt);
      if (still && el !== selected) { springs.delete(el); s.x = s.y = 0; }
      pose(el, s);
      moving ||= !still;
    }
    if (moving) wake();
    else then = 0;
  };
  const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };

  /** A control takes a knock, `dir` the way it came from. */
  const knock = (el: Element, dir: MoveSteerVec, by = MOVE_STEER_KNOCK) => {
    if (reduced()) return;
    const s = springs.get(el) ?? { x: 0, y: 0, vx: 0, vy: 0 };
    s.vx += dir.x * by;
    s.vy += dir.y * by;
    springs.set(el, s);
    wake();
  };

  const select = (el: Element | null) => {
    if (el === selected) return;
    selected?.removeAttribute('data-steer');
    selected = el;
    selected?.setAttribute('data-steer', '');
  };

  /** The control in the hand, or — when the page took it away — the one nearest where it was. */
  const regain = () => {
    if (selected?.isConnected) return selected;
    const all = targets();
    if (!all.length) { select(null); return null; }
    let best = all[0]!;
    let d = Infinity;
    for (const el of all) {
      const m = middle(boxOf(el));
      const dist = Math.hypot(m.x - lastHand.x, m.y - lastHand.y);
      if (dist < d) { d = dist; best = el; }
    }
    select(best);
    offset = { x: 0, y: 0 };
    return best;
  };

  const unpose = () => {
    for (const el of springs.keys()) pose(el, { x: 0, y: 0, vx: 0, vy: 0 });
    springs.clear();
  };

  /* ── the way in and the way out ── */

  /**
   * A flight on an arc (move-steer-core): the arrow sucked in, or the dot
   * shot out. It leaves the way the pointer was going and bends round onto
   * `to`, read every frame — the arrow it lands on may still be moving —
   * eased by the kit's own token (`--move-ease-in` in, `--move-ease-out`
   * out).
   */
  const ghost = (kind: 'arrow' | 'dot', from: MoveSteerVec, to: () => MoveSteerVec, ms: number, token: string, done: () => void) => {
    if (reduced()) { done(); return null; }
    const g = document.createElement('i');
    g.className = `tweakers-move-steer-ghost tweakers-move-steer-${kind}`;
    if (kind === 'arrow') g.innerHTML = ARROW;
    layer().append(g);
    const panel = root();
    const ease = moveSteerEase(panel ? getComputedStyle(panel).getPropertyValue(token) : '');
    const way = { ...heading };
    const scale = kind === 'arrow' ? [1, 0.15] : [0.35, 1];
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = ease(t);
      const p = moveSteerArc(from, to(), way, e);
      g.style.transform = `translate(${p.x}px, ${p.y}px) scale(${scale[0]! + (scale[1]! - scale[0]!) * e})`;
      if (kind === 'arrow') g.style.opacity = String(1 - 0.8 * e);
      if (t < 1) { raf = requestAnimationFrame(step); return; }
      g.remove();
      done();
    };
    raf = requestAnimationFrame(step);
    return { cancel: () => { cancelAnimationFrame(raf); g.remove(); } };
  };
  let flight: { cancel: () => void } | null = null;

  /** Where the arrow and the dot fly: over everything, catching nothing. */
  let sky: HTMLDivElement | null = null;
  const layer = () => {
    if (sky?.isConnected) return sky;
    sky = document.createElement('div');
    sky.className = 'tweakers-move-steer-sky';
    const panel = root();
    if (panel) sky.style.setProperty('--move-text', getComputedStyle(panel).getPropertyValue('--move-text'));
    document.body.append(sky);
    return sky;
  };

  const makeVeil = () => {
    if (veil) return;
    veil = document.createElement('div');
    veil.className = 'tweakers-move-steer-veil';
    veil.addEventListener('wheel', onWheel, { passive: false });
    document.body.append(veil);
  };
  const dropVeil = () => { veil?.remove(); veil = null; };

  const enter = (e: PointerEvent) => {
    const all = targets();
    if (!all.length) return;
    flight?.cancel();
    flight = null;
    document.documentElement.removeAttribute('data-move-steer');
    makeVeil();
    inside = true;
    const at = { x: e.clientX, y: e.clientY };
    // The hand lands on the big slot nearest across, on the top row of
    // slots — the page's own controls, not the header above them.
    const slots = all.filter((el) => el.matches('.tweakers-move-dial'));
    const pool = slots.length ? slots : all;
    const top = Math.min(...pool.map((el) => boxOf(el).top));
    let best = pool[0]!;
    let d = Infinity;
    for (const el of pool) {
      const b = boxOf(el);
      if (b.top > top + 24) continue;
      const dist = Math.abs(middle(b).x - at.x);
      if (dist < d) { d = dist; best = el; }
    }
    select(best);
    offset = { x: 0, y: 0 };
    lastMove = 0;
    landing = performance.now() + SUCK_MS;
    const m = middle(boxOf(selected!));
    const len = Math.hypot(m.x - at.x, m.y - at.y) || 1;
    // The arrow is sucked in; the control takes it.
    flight = ghost('arrow', at, () => (selected?.isConnected ? middle(boxOf(selected)) : m), SUCK_MS, '--move-ease-in', () => {
      flight = null;
      if (selected) knock(selected, { x: (m.x - at.x) / len, y: (m.y - at.y) / len }, MOVE_STEER_KNOCK * 1.4);
    });
    wake();
  };

  /**
   * The way out. The dot is shot out of the control the way the hand was
   * going, to just over the panel's top; there it is the arrow again, and
   * the arrow closes on where the real pointer is as the hand goes on, so it
   * never jumps sideways. Until it has caught up the page's own arrow stays
   * hidden, but the page has the pointer back: a click lands as usual.
   */
  const leave = (shoot: boolean) => {
    endHold();
    endPress(false);
    const from = selected ? middle(boxOf(selected)) : null;
    const was = selected;
    inside = false;
    select(null);
    flight?.cancel();
    flight = null;
    unpose();
    dropVeil();
    if (!shoot || !from || !real || reduced()) return;
    const len = Math.hypot(heading.x, heading.y);
    const dir = len > 0.5 && heading.y / len < -0.3 ? { x: heading.x / len, y: heading.y / len } : { x: 0, y: -1 };
    if (was) knock(was, { x: -dir.x, y: -dir.y });
    const top = panelTop() - 18;
    const reach = Math.min(240, Math.max(0, from.y - top) / -dir.y);
    const exit = { x: from.x + dir.x * reach, y: from.y + dir.y * reach };
    document.documentElement.setAttribute('data-move-steer', 'out');
    flight = ghost('dot', from, () => exit, SHOOT_MS, '--move-ease-out', () => { flight = catchUp(exit); });
  };

  /** The arrow, from where the dot came out, closing on the real pointer. */
  const catchUp = (at: MoveSteerVec) => {
    const g = document.createElement('i');
    g.className = 'tweakers-move-steer-ghost tweakers-move-steer-arrow';
    g.innerHTML = ARROW;
    layer().append(g);
    let off = real ? { x: at.x - real.x, y: at.y - real.y } : { x: 0, y: 0 };
    let last = performance.now();
    let raf = 0;
    const done = () => {
      cancelAnimationFrame(raf);
      g.remove();
      flight = null;
      document.documentElement.removeAttribute('data-move-steer');
    };
    const step = (now: number) => {
      const k = Math.exp(-Math.min(0.05, (now - last) / 1000) / CATCH_UP);
      last = now;
      off = { x: off.x * k, y: off.y * k };
      const p = real ? { x: real.x + off.x, y: real.y + off.y } : at;
      g.style.transform = `translate(${p.x}px, ${p.y}px)`;
      if (Math.hypot(off.x, off.y) < 1) { done(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return { cancel: done };
  };

  /* ── ⌘: the hand takes the control ── */

  const send1 = (g: Grip, type: 'pointerdown' | 'pointermove' | 'pointercancel', shift: boolean) => {
    if (type === 'pointerdown') g.pressed = true;
    send(g.target, type, g, { button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointercancel' ? 0 : 1, shiftKey: shift }, true);
  };

  const release = (g: Grip | null) => {
    if (!g?.pressed || !g.target.isConnected) return;
    send1(g, 'pointercancel', false);
    for (let el: Element | null = g.target; el; el = el.parentElement) {
      try { if (real && el.hasPointerCapture(real.id)) el.releasePointerCapture(real.id); } catch { /* gone */ }
      if (el === root()) break;
    }
  };

  /** Lets go: the face hears a cancel, never a release — a steer is not a tap. */
  const endHold = () => {
    const h = hold;
    if (!h) return;
    hold = null;
    wheelHold = false;
    clearTimeout(wheelRest);
    release(h.grip);
    if (h.chip !== h.grip) release(h.chip);
    if (real && real.y < panelTop() - FLUNG) leave(true);
  };

  /** The big slot over a pad, in its column — the knob a held chip lends its control to. */
  const knobAbove = (pad: Element) => {
    const r = (pad.closest('.tweakers-move-pad') ?? pad).getBoundingClientRect();
    const cx = r.left + r.width / 2;
    let best: Element | null = null;
    let bottom = -Infinity;
    root()?.querySelectorAll('.tweakers-move-dial').forEach((d) => {
      const k = d.getBoundingClientRect();
      if (cx >= k.left && cx <= k.right && k.bottom <= r.top + 1 && k.bottom > bottom) { best = d; bottom = k.bottom; }
    });
    return best as Element | null;
  };

  const beginHold = () => {
    const held = hold || press || !inside || editable(document.activeElement) ? null : regain();
    if (!held) return;
    const p = hand();
    const at = under(p);
    const target = at && held.contains(at) ? at : held;
    hold = { grip: { target, x: p.x, y: p.y, pressed: false, hands: hands(target) }, chip: null, shift: false, lock: { axis: null, x: 0, y: 0 } };
    playMoveSteerLock();
    for (const el of springs.keys()) springs.get(el)!.vx = springs.get(el)!.vy = 0;
    wake();
  };

  const steer = (h: Hold, dx: number, dy: number, shiftKey: boolean) => {
    let g = h.grip;
    if (!g.target.isConnected) { endHold(); return; }
    if (g.target.closest(WHEEL_LIST)) {
      // The wheel's list walks a row per stretch of travel, down the list.
      walked += dy;
      while (Math.abs(walked) >= ROW_TRAVEL) {
        const step = Math.sign(walked);
        walked -= step * ROW_TRAVEL;
        turnWheel(step);
      }
      return;
    }
    if (!g.pressed) {
      send1(g, 'pointerdown', shiftKey && g.hands === 1);
      // A chip lends its control to the knob above it while it is held, as
      // the Move's pad does: the travel turns the knob from the next move on,
      // once the slot has taken the chip's face.
      if (g.target.closest('[data-peek]')) { h.chip = g; return; }
    } else if (h.chip === g) {
      const knob = knobAbove(g.target);
      if (knob) {
        const k = knob.getBoundingClientRect();
        g = h.grip = { target: knob, x: k.left + k.width / 2, y: k.top + k.height / 2, pressed: false, hands: hands(knob) };
        send1(g, 'pointerdown', shiftKey && g.hands === 1);
      } else h.chip = null;              /* no knob over it: it turns in place */
    }
    let shift = shiftKey;
    if (g.hands === 2) {
      if (shift !== h.shift) h.lock = { axis: null, x: 0, y: 0 };
      h.shift = shift;
      if (shift) ({ dx, dy } = moveSteerAxis(h.lock, dx, dy));
      shift = false;
    }
    if (!dx && !dy) return;
    g.x += dx;
    g.y += dy;
    send1(g, 'pointermove', shift);
  };

  /* ── a press: it lands where the hand is ── */

  const beginPress = (e: PointerEvent) => {
    endHold();
    const held = inside ? regain() : null;
    if (!held) return;
    // A click on the wheel's list takes its row, as the wheel's press does.
    if (isWheelList(held)) { clickWheel(); return; }
    // A list's rows are never picked by where a press lands — only ⌘, two
    // fingers or the arrow keys walk it — so its press lands on its corner,
    // clear of the rows: the knob's tap, not a row.
    const box = boxOf(held);
    const p = hasRows(held) ? { x: box.left + 3, y: box.top + 3 } : hand();
    const at = under(p);
    const target = at && held.contains(at) ? at : held;
    press = { target, x: p.x, y: p.y, pressed: true, hands: 1 };
    pressTravel = 0;
    const init = { button: e.button, buttons: e.buttons, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey };
    send(target, 'pointerdown', p, init);
    send(target, 'mousedown', p, init);
    wake();
  };

  const endPress = (click: boolean, e?: PointerEvent) => {
    const g = press;
    if (!g) return;
    press = null;
    const init = { button: e?.button ?? 0, buttons: 0, shiftKey: !!e?.shiftKey, altKey: !!e?.altKey, metaKey: !!e?.metaKey, ctrlKey: !!e?.ctrlKey };
    if (!g.target.isConnected) return;
    if (!click) { send(g.target, 'pointercancel', g, init); return; }
    send(g.target, 'pointerup', g, init);
    send(g.target, 'mouseup', g, init);
    if (pressTravel < CLICK_SLOP) {
      // The real press never reached the page, so it moved no focus: a field takes it here.
      if (editable(g.target)) (g.target as HTMLElement).focus();
      send(g.target, 'click', g, { ...init, detail: 1 } as PointerEventInit);
    }
    // The hand stays where the press left it.
    if (selected) {
      const m = middle(boxOf(selected));
      offset = { x: g.x - m.x, y: g.y - m.y };
    }
  };

  /* ── the real pointer ── */

  const own = (e: Event) => {
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
  };

  const onMove = (e: PointerEvent) => {
    if (sent.has(e) || e.pointerType !== 'mouse') return;
    const before = real;
    real = { x: e.clientX, y: e.clientY, id: e.pointerId };
    // The way the pointer is going, smoothed: the flights in and out leave that way.
    if (before) heading = { x: heading.x * 0.6 + (e.clientX - before.x) * 0.4, y: heading.y * 0.6 + (e.clientY - before.y) * 0.4 };
    if (!inside) {
      const panel = root();
      const t = e.target instanceof Element ? e.target : null;
      const over = !!panel && !!t && (panel.contains(t) || t === veil || !!veil?.contains(t));
      if (over && e.buttons === 0 && e.clientY >= panelTop()) { own(e); enter(e); }
      return;
    }
    own(e);
    if (!before) return;
    const dx = e.clientX - before.x;
    const dy = e.clientY - before.y;
    if (hold) {
      if (!moveSteerHeld(e)) endHold();
      else { steer(hold, dx, dy, e.shiftKey); return; }
      if (!inside) return;
    }
    if (press) {
      // A drag moves at the page's pace, from where the hand pressed.
      press.x += dx;
      press.y += dy;
      pressTravel += Math.hypot(dx, dy);
      send(press.target, 'pointermove', press, { button: -1, buttons: e.buttons, shiftKey: e.shiftKey });
      return;
    }
    const pace = TweakStore.getValues(MOVE_PANEL_SETTINGS);
    const gain = (v: unknown) => (typeof v === 'number' && v > 0 ? v : MOVE_STEER_GAIN);
    const out = navigate(dx * gain(pace?.handSpeedX), dy * gain(pace?.handSpeedY));
    // The way out is up past the top row, with the real pointer over the
    // panel's top by then — or the pointer flung far above it.
    const top = panelTop();
    if ((out && e.clientY < top) || e.clientY < top - FLUNG) leave(true);
  };

  /** Moves the hand; true when it pushes up past the panel's top row — the way out. */
  const navigate = (dx: number, dy: number) => {
    if (performance.now() < landing || !regain()) return false;
    lastMove = performance.now();
    let out = false;
    let all: Element[] | null = null;
    let boxes: MoveSteerBox[] = [];
    const { offset: next, passes } = moveSteerTravel(
      { x: offset.x + dx, y: offset.y + dy },
      () => moveSteerReach(boxOf(selected!), false),
      (dir, _step, o) => {
        if (!all) { all = targets(); boxes = all.map(boxOf); }
        const from = all.indexOf(selected!);
        const fromBox = from >= 0 ? boxes[from]! : boxOf(selected!);
        const m = middle(fromBox);
        const i = moveSteerNext(fromBox, from >= 0 ? boxes : [...boxes, fromBox], { x: m.x + o.x, y: m.y + o.y }, dir);
        if (i < 0) { out ||= dir.y < 0; return false; }
        const was = selected!;
        select(all[i]!);
        knock(all[i]!, dir);
        if (!springs.has(was)) springs.set(was, { x: 0, y: 0, vx: 0, vy: 0 });
        return true;
      },
    );
    offset = next;
    walked = 0;
    void passes;
    wake();
    return out;
  };

  const onDown = (e: PointerEvent) => {
    if (sent.has(e) || !inside || e.pointerType !== 'mouse') return;
    own(e);
    if (e.button === 0) beginPress(e);
  };
  const onUp = (e: PointerEvent) => {
    if (sent.has(e) || !inside || e.pointerType !== 'mouse') return;
    own(e);
    endPress(true, e);
  };
  // The real pointer's own mouse and click events never reach the page while the hand is in.
  const onMouse = (e: MouseEvent) => { if (!sent.has(e) && inside) own(e); };
  /**
   * Two fingers on the trackpad turn the control in the hand, as ⌘ and the
   * mouse do — the way the fingers go, as a drag would — and let go when
   * they stop. A row of the wheel's list scrolls its list instead.
   */
  const onWheel = (e: WheelEvent) => {
    if (sent.has(e) || !inside) return;
    own(e);
    if (e.ctrlKey && !hold) return;                 /* a pinch, not a turn */
    const held = regain();
    if (!held) return;
    if (!hold) {
      beginHold();
      wheelHold = !!hold;
    }
    if (!hold) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    steer(hold, -e.deltaX * unit, -e.deltaY * unit, e.shiftKey);
    if (wheelHold) {
      clearTimeout(wheelRest);
      wheelRest = setTimeout(() => { if (wheelHold) { wheelHold = false; endHold(); } }, 160);
    }
  };
  // Off the window and back: the jump in between is no travel.
  const onOut = (e: MouseEvent) => { if (!e.relatedTarget) real = null; };

  const onKeyDown = (e: KeyboardEvent) => {
    if (sent.has(e)) return;
    if (inside && /^Arrow(Up|Down|Left|Right)$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey && !editable(document.activeElement)) {
      // The arrow keys walk a list in the hand: the wheel's list as the wheel
      // does, a slot's list through its own keys.
      const held = regain();
      if (held && (isWheelList(held) || hasRows(held))) {
        own(e);
        if (isWheelList(held)) {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') turnWheel(e.key === 'ArrowDown' ? 1 : -1);
        } else {
          const k = new KeyboardEvent('keydown', { key: e.key, code: e.code, shiftKey: e.shiftKey, bubbles: true, cancelable: true });
          sent.add(k);
          held.dispatchEvent(k);
        }
        return;
      }
    }
    if (e.key !== moveSteerKey() || e.repeat) return;
    // ⌘ over a trackpad turn keeps the control: the fingers' rest no longer lets it go.
    if (wheelHold) { wheelHold = false; clearTimeout(wheelRest); return; }
    beginHold();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === moveSteerKey()) endHold();
  };
  const onAway = () => { endHold(); endPress(false); real = null; };
  const onVisibility = () => { if (document.hidden) onAway(); };

  window.addEventListener('pointermove', onMove, true);
  window.addEventListener('pointerdown', onDown, true);
  window.addEventListener('pointerup', onUp, true);
  for (const type of ['mousedown', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu'] as const) window.addEventListener(type, onMouse, true);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('blur', onAway);
  document.addEventListener('mouseout', onOut);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    leave(false);
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerdown', onDown, true);
    window.removeEventListener('pointerup', onUp, true);
    for (const type of ['mousedown', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu'] as const) window.removeEventListener(type, onMouse, true);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('blur', onAway);
    document.removeEventListener('mouseout', onOut);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
