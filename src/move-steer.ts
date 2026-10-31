/**
 * The steering hand: the computer's way to play the panel without a click.
 *
 * Coming down into the panel's controls the arrow is gone, and the nearest
 * slot on the top row lights up; the moment the mouse goes back up over
 * them — meaning to, not straying up on a sideways move — the arrow is
 * back where the mouse is and the control fades out. The header above keeps the arrow: its buttons are
 * small, and a pointer reaches them better.
 *
 * Inside, the pointer is a hand on a control, not a place (move-steer-core).
 * The hand is where the mouse is, magnified around where it came in — 2×
 * across, 1.5× up and down by default (the Panel settings) — never travel
 * added up, so the hand and the real pointer can never drift apart. It holds
 * a control until it is past its edge by a margin that grows when the mouse
 * moves slowly, then lands on the next one, which takes the hit and lights
 * up; pulling at a control leans and stretches it, and a rest lets the
 * tension go. The panel never sees the real pointer: every press and wheel
 * reaches the control in the hand, where the hand is.
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
  MOVE_STEER_GAIN_X, MOVE_STEER_GAIN_Y, MOVE_STEER_KNOCK, moveSteerLeaves, moveSteerMap, moveSteerMargin, moveSteerSettle,
  MOVE_STEER_REST_MS, moveSteerPose, moveSteerReach, moveSteerSpring, type MoveSteerBox, type MoveSteerSpring, type MoveSteerVec,
} from './move-steer-core';
import { TweakStore } from './store/TweakStore';
import { MOVE_PANEL_SETTINGS } from './move-track-labels';
import { playMoveSteerLock } from './move-steer-sound';
import { MoveSurfaceStore } from './move-surface-store';
import { MOVE_OPTION_DETENT } from './move-slot-core';

/** The big wheel's events (MovePanel's MOVE_JOG_EVENT / MOVE_JOG_CLICK_EVENT; spelled out to keep the panel out of this module). */
const JOG = 'move-tweakers:jog';
const JOG_CLICK = 'move-tweakers:jog-click';

/** What the hand can hold: a slot, a pad, a button among the controls, the wheel's list and a row of tabs (each as one control). */
export const MOVE_STEER_TARGET = [
  '.tweakers-move-wheel-screen',
  '.tweakers-move-tabs',
  '.tweakers-move-dial:not([data-empty]):not([data-kind="blank"])',
  '.tweakers-move-pad:not([data-empty="true"])',
  'button:not(:disabled)',
  '[role="option"]',
  '[role="tab"]',
].join(', ');
/** A control with rows: the hand holds it whole, and only ⌘, two fingers or the arrow keys walk it. */
const LIST_ROWS = '.tweakers-list-screen-row, .tweakers-move-dial-tile';
const WHEEL_LIST = '.tweakers-move-wheel-screen';
/** A row of tabs: one select in the hand, its options stepped, never pointed at. */
const TABS = '.tweakers-move-tabs';
/** The travel that walks the wheel's list one row. */
const ROW_TRAVEL = 16;
/** Shift's travel, in px, before it decides which axis it locks. */
export const MOVE_STEER_AXIS_SLOP = 4;
/** A press that travels less than this is a click. */
const CLICK_SLOP = 3;


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
  let real: { x: number; y: number; id: number } | null = null;
  let lastMove = 0;
  let hold: Hold | null = null;
  let press: Grip | null = null;
  let pressTravel = 0;
  /**
   * The map from the real pointer to the hand: the hand point `hand` where
   * the pointer was `from`, at the pace `gain`. Set where the pointer comes
   * in, and again wherever the hand stood still while the pointer went on (a
   * ⌘ turn, a drag).
   */
  let map: { hand: MoveSteerVec; from: MoveSteerVec; gain: MoveSteerVec } | null = null;
  /** The pointer's smoothed speed (px/ms) and way (px/ms per axis), and when it last moved. */
  let speed = 0;
  let way: MoveSteerVec = { x: 0, y: 0 };
  let lastStamp = 0;
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
  /**
   * Where the hand's ground begins: the panel's controls. The header above
   * them — the page names and the header's buttons, small targets a pointer
   * reaches better — keeps the page's own arrow.
   */
  const panelTop = () => {
    const panel = root();
    return (panel?.querySelector('.tweakers-move-controls') ?? panel)?.getBoundingClientRect().top ?? Infinity;
  };
  const pace = (): MoveSteerVec => {
    const v = TweakStore.getValues(MOVE_PANEL_SETTINGS);
    const gain = (x: unknown, fallback: number) => (typeof x === 'number' && x > 0 ? x : fallback);
    return { x: gain(v?.handSpeedX, MOVE_STEER_GAIN_X), y: gain(v?.handSpeedY, MOVE_STEER_GAIN_Y) };
  };
  /** Where the hand is: the real pointer, through the map. */
  const hand = (): MoveSteerVec => {
    if (map && real) lastHand = moveSteerMap(map.hand, map.from, map.gain, real);
    return lastHand;
  };
  /** Sets the map so the hand stays where it is from here on, whatever the pointer did meanwhile. */
  const pin = (at: MoveSteerVec = lastHand) => {
    if (real) map = { hand: { ...at }, from: { x: real.x, y: real.y }, gain: pace() };
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
   * A row of tabs in the hand is one select: it steps to the option `step`
   * along — round to the first after the last when `wrap` — by pressing
   * that option's own tab, so the tabs answer exactly as a click on them.
   */
  const stepTabs = (tabs: Element, step: number, wrap: boolean) => {
    const zones = Array.from(tabs.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const n = zones.length;
    if (!n) return;
    const at = Math.max(0, zones.findIndex((z) => z.getAttribute('aria-selected') === 'true'));
    const next = wrap ? (((at + step) % n) + n) % n : Math.max(0, Math.min(n - 1, at + step));
    const zone = zones[next];
    if (next === at || !zone || zone.disabled) return;
    send(zone, 'click', middle(boxOf(zone)), { button: 0, detail: 1 } as PointerEventInit);
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
    const b = boxOf(el);
    const r = moveSteerReach(b);
    const p = hand();
    const m = middle(b);
    return { x: (p.x - m.x) / r.x, y: (p.y - m.y) / r.y };
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
    return best;
  };

  const unpose = () => {
    for (const el of springs.keys()) pose(el, { x: 0, y: 0, vx: 0, vy: 0 });
    springs.clear();
  };

  /* ── the way in and the way out ── */

  const makeVeil = () => {
    if (veil) return;
    veil = document.createElement('div');
    veil.className = 'tweakers-move-steer-veil';
    veil.addEventListener('wheel', onWheel, { passive: false });
    document.body.append(veil);
  };
  const dropVeil = () => { veil?.remove(); veil = null; };

  /**
   * The way in: the arrow is gone, and the hand takes the big slot nearest
   * across on the top row of slots. The map puts the hand in that slot's
   * middle, straight below the pointer: the move that brought the pointer
   * in has the slot's whole lower half to spend before it carries the hand
   * on down.
   */
  const enter = (at: MoveSteerVec) => {
    const all = targets();
    if (!all.length) return;
    makeVeil();
    inside = true;
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
    lastMove = 0;
    const gain = pace();
    map = { hand: { x: at.x, y: middle(boxOf(best)).y }, from: { ...at }, gain };
    knock(best, { x: 0, y: 1 }, MOVE_STEER_KNOCK * 1.4);
    wake();
  };

  /**
   * The way out: the hand lets go and the arrow is simply back where the
   * mouse is, at the controls' top. The control it held eases back — its
   * light and glow fade, its lean springs home — rather than drop at once.
   */
  const leave = () => {
    endHold();
    endPress(false);
    inside = false;
    map = null;
    select(null);
    dropVeil();
    wake();
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
    root()?.querySelectorAll('[data-steer-held]').forEach((el) => el.removeAttribute('data-steer-held'));
    release(h.grip);
    if (h.chip !== h.grip) release(h.chip);
    // The hand stood still while the mouse turned the control: it stays put.
    pin();
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
    // Held, the control opens what it opens under a finger on its knob.
    held.setAttribute('data-steer-held', '');
    playMoveSteerLock();
    for (const el of springs.keys()) springs.get(el)!.vx = springs.get(el)!.vy = 0;
    wake();
  };

  const steer = (h: Hold, dx: number, dy: number, shiftKey: boolean) => {
    let g = h.grip;
    if (!g.target.isConnected) { endHold(); return; }
    const tabs = g.target.closest(TABS);
    if (tabs) {
      // Right or down is the next option, one per detent, as an option slot steps.
      walked += dx + dy;
      while (Math.abs(walked) >= MOVE_OPTION_DETENT) {
        const step = Math.sign(walked);
        walked -= step * MOVE_OPTION_DETENT;
        stepTabs(tabs, step, false);
      }
      return;
    }
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
    // A tap on a row of tabs moves it on to the next option, round to the first.
    if (held.matches(TABS)) { stepTabs(held, 1, true); return; }
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
    // The hand stays where the drag left it.
    pin({ x: g.x, y: g.y });
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
    if (!inside) {
      const panel = root();
      const t = e.target instanceof Element ? e.target : null;
      const over = !!panel && !!t && panel.contains(t);
      if (over && e.buttons === 0 && e.clientY >= panelTop()) { own(e); enter({ x: e.clientX, y: e.clientY }); }
      return;
    }
    own(e);
    // Off the window and back: the hand stays where it was.
    if (!before) { pin(); return; }
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
    const dt = Math.max(1, e.timeStamp - lastStamp);
    lastStamp = e.timeStamp;
    speed = speed * 0.7 + (Math.hypot(dx, dy) / dt) * 0.3;
    way = { x: way.x * 0.7 + (dx / dt) * 0.3, y: way.y * 0.7 + (dy / dt) * 0.3 };
    // Back up over the controls' top, meaning to: the hand lets go, as it
    // came in. A sideways move that strays up does not.
    if (moveSteerLeaves(panelTop() - e.clientY, way)) { leave(); return; }
    navigate();
  };

  /** Puts the hand where the pointer is, and on the control it is over. */
  const navigate = () => {
    const held = regain();
    if (!held || !map) return;
    // The pace may have been changed in the settings: it changes from here.
    const gain = pace();
    if (gain.x !== map.gain.x || gain.y !== map.gain.y) pin(hand());
    lastMove = performance.now();
    const p = hand();
    const all = targets();
    const boxes = all.map(boxOf);
    const at = all.indexOf(held);
    const from = at >= 0 ? boxes[at]! : boxOf(held);
    const landed = moveSteerSettle(from, at >= 0 ? boxes : [...boxes, from], p, moveSteerMargin(speed));
    if (landed && all[landed.index] && all[landed.index] !== held) {
      const was = held;
      select(all[landed.index]!);
      knock(all[landed.index]!, landed.dir);
      if (!springs.has(was)) springs.set(was, { x: 0, y: 0, vx: 0, vy: 0 });
    }
    walked = 0;
    wake();
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
      if (held?.matches(TABS)) {
        own(e);
        stepTabs(held, e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1, false);
        return;
      }
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
    leave();
    if (frame) cancelAnimationFrame(frame);
    unpose();
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
