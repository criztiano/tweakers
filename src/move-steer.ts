/**
 * The steering hand: the computer's way to play the panel without a click.
 *
 * Over the panel's slots the arrow goes away. The pointer only says which
 * control is in the hand — the slot under it comes up the way a touched
 * knob's slot does, and stays up across the gaps between slots — and a soft
 * dot shows where it is while it moves. Holding ⌘ (Ctrl off a Mac) takes
 * that control: from then on the mouse's travel turns it, wherever the
 * pointer wanders, until ⌘ comes up. Nothing is pressed, so nothing taps — a
 * steer never latches a chip or steps an option on its own.
 *
 * The hand is a pointer of its own. Its travel reaches the slot as the
 * pointer gesture the face already answers (move-slot-core), so every face
 * steers exactly as it drags; a face that would jump to where a press lands
 * asks `isMoveSteer` and turns from its value instead. A slot with two hands
 * (`data-hands="2"`: xy, range, colour — the controls the Move's volume knob
 * reaches while their knob is held) splits the travel, across for the knob
 * and up and down for the volume knob, and there Shift locks the travel to
 * the axis it moves along most. Everywhere else Shift keeps its meaning:
 * fine. A chip (`data-peek`) does what its pad does on the Move: held, it
 * lends its control to the knob above it, and the travel turns that knob.
 */

/** What can be in the hand: a big slot, or a pad. */
export const MOVE_STEER_SLOT =
  '.tweakers-move-dial:not([data-empty]):not([data-kind="blank"]), .tweakers-move-pad:not([data-empty="true"]):not(:disabled)';
/** Where the arrow gives way to the hand: the slots and pads — never while a list fills the grid. */
export const MOVE_STEER_AREA = '.tweakers-move-grid:not([data-presets])';
/** Shift's travel, in px, before it decides which axis it locks. */
export const MOVE_STEER_AXIS_SLOP = 4;
/** How long the dot stays after the pointer stops. */
export const MOVE_STEER_DOT_MS = 450;

/** The pointer events the hand sent — a face asks with `isMoveSteer`. */
const steered = new WeakSet<Event>();

/** Whether a pointer event came from the steering hand, not a press. */
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

type Hold = {
  /** What the travel turns: the slot's own press, or the knob a held chip lent its control to. */
  grip: Grip;
  /** A chip held down — the Move's hold-a-pad-and-turn-the-knob — while its knob turns. */
  chip: Grip | null;
  /** The real pointer's last place, to read its travel from. */
  px: number;
  py: number;
  pointerId: number;
  shift: boolean;
  lock: MoveSteerLock;
};

const hands = (el: Element) => (el.closest('[data-hands="2"]') ? 2 : 1);

const editable = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable);

/**
 * Puts the steering hand on a panel: `root` is the panel (read on every
 * event, so it may mount late), `dot` the element that marks the pointer.
 * Answers the detach.
 */
export function attachMoveSteer(root: () => HTMLElement | null, dot: () => HTMLElement | null): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  let area: Element | null = null;
  let selected: Element | null = null;
  let hold: Hold | null = null;
  let last: { x: number; y: number; id: number } | null = null;
  let dotTimer: ReturnType<typeof setTimeout> | undefined;

  const select = (slot: Element | null) => {
    if (slot === selected) return;
    selected?.removeAttribute('data-steer');
    selected = slot;
    selected?.setAttribute('data-steer', '');
  };

  const hideDot = () => {
    clearTimeout(dotTimer);
    dot()?.removeAttribute('data-on');
  };
  const showDot = (x: number, y: number) => {
    const el = dot();
    if (!el) return;
    const base = (el.offsetParent ?? el.parentElement)?.getBoundingClientRect();
    el.style.transform = `translate(${x - (base?.left ?? 0)}px, ${y - (base?.top ?? 0)}px)`;
    el.setAttribute('data-on', '');
    clearTimeout(dotTimer);
    dotTimer = setTimeout(hideDot, MOVE_STEER_DOT_MS);
  };

  const leave = () => {
    area?.removeAttribute('data-steering');
    area = null;
    select(null);
    hideDot();
  };

  const send = (h: Hold, g: Grip, type: 'pointerdown' | 'pointermove' | 'pointercancel', shift: boolean) => {
    const e = new PointerEvent(type, {
      bubbles: true, cancelable: true, composed: true,
      clientX: g.x, clientY: g.y, pointerId: h.pointerId, pointerType: 'mouse', isPrimary: true,
      button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointercancel' ? 0 : 1, shiftKey: shift,
    });
    steered.add(e);
    if (type === 'pointerdown') g.pressed = true;
    g.target.dispatchEvent(e);
  };

  const release = (h: Hold, g: Grip | null) => {
    if (!g?.pressed || !g.target.isConnected) return;
    send(h, g, 'pointercancel', false);
    for (let el: Element | null = g.target; el; el = el.parentElement) {
      try { if (el.hasPointerCapture(h.pointerId)) el.releasePointerCapture(h.pointerId); } catch { /* gone */ }
      if (el === root()) break;
    }
  };

  /** Lets go: the face hears a cancel, never a release — a steer is not a tap. */
  const end = () => {
    const h = hold;
    if (!h) return;
    hold = null;
    document.documentElement.removeAttribute('data-move-steer');
    release(h, h.grip);
    if (h.chip !== h.grip) release(h, h.chip);
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

  const begin = () => {
    if (hold || !last || editable(document.activeElement)) return;
    // The slot under the pointer now — the page may have changed under a
    // still pointer — else the one kept across a gap.
    const under = document.elementFromPoint(last.x, last.y);
    const slot = (under && area?.contains(under) ? under.closest(MOVE_STEER_SLOT) : null) ?? (selected?.isConnected ? selected : null);
    if (!slot) return;
    select(slot);
    const r = slot.getBoundingClientRect();
    const inside = last.x >= r.left && last.x <= r.right && last.y >= r.top && last.y <= r.bottom;
    const x = inside ? last.x : r.left + r.width / 2;
    const y = inside ? last.y : r.top + r.height / 2;
    const at = inside ? under : document.elementFromPoint(x, y);
    const target = at && slot.contains(at) ? at : slot;
    hold = {
      grip: { target, x, y, pressed: false, hands: hands(target) }, chip: null,
      px: last.x, py: last.y, pointerId: last.id, shift: false, lock: { axis: null, x: 0, y: 0 },
    };
    document.documentElement.setAttribute('data-move-steer', 'held');
  };

  const steer = (h: Hold, e: PointerEvent) => {
    let dx = e.clientX - h.px;
    let dy = e.clientY - h.py;
    h.px = e.clientX;
    h.py = e.clientY;
    let g = h.grip;
    if (!g.target.isConnected) { end(); return; }
    if (!g.pressed) {
      send(h, g, 'pointerdown', e.shiftKey && g.hands === 1);
      // A chip lends its control to the knob above it while it is held,
      // as the Move's pad does: the travel turns the knob from the next
      // move on, once the slot has taken the chip's face.
      if (g.target.closest('[data-peek]')) { h.chip = g; return; }
    } else if (h.chip === g) {
      const knob = knobAbove(g.target);
      if (knob) {
        const k = knob.getBoundingClientRect();
        g = h.grip = { target: knob, x: k.left + k.width / 2, y: k.top + k.height / 2, pressed: false, hands: hands(knob) };
        send(h, g, 'pointerdown', e.shiftKey && g.hands === 1);
      } else h.chip = null;              /* no knob over it: it turns in place */
    }
    let shift = e.shiftKey;
    if (g.hands === 2) {
      if (shift !== h.shift) h.lock = { axis: null, x: 0, y: 0 };
      h.shift = shift;
      if (shift) ({ dx, dy } = moveSteerAxis(h.lock, dx, dy));
      shift = false;
    }
    if (!dx && !dy) return;
    g.x += dx;
    g.y += dy;
    send(h, g, 'pointermove', shift);
  };

  const onMove = (e: PointerEvent) => {
    if (steered.has(e) || e.pointerType !== 'mouse') return;
    last = { x: e.clientX, y: e.clientY, id: e.pointerId };
    if (hold) {
      if (!moveSteerHeld(e)) end();
      else {
        // The real pointer is the hand's now: the faces under it hear nothing.
        e.stopPropagation();
        showDot(e.clientX, e.clientY);
        steer(hold, e);
        return;
      }
    }
    const panel = root();
    const t = e.target instanceof Element ? e.target : null;
    const now = t && panel?.contains(t) ? t.closest(MOVE_STEER_AREA) : null;
    if (!now || !panel?.contains(now)) { if (area) leave(); return; }
    if (now !== area) {
      area?.removeAttribute('data-steering');
      area = now;
      area.setAttribute('data-steering', '');
    }
    const slot = t!.closest(MOVE_STEER_SLOT);
    if (slot && now.contains(slot)) select(slot);
    showDot(e.clientX, e.clientY);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === moveSteerKey() && !e.repeat && area) begin();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === moveSteerKey()) end();
  };
  // A real press while steering ends the steer and goes through as itself.
  const onDown = (e: PointerEvent) => { if (!steered.has(e)) end(); };
  const onAway = () => { end(); leave(); };
  const onOut = (e: MouseEvent) => { if (!e.relatedTarget && !hold) leave(); };
  const onVisibility = () => { if (document.hidden) onAway(); };

  window.addEventListener('pointermove', onMove, true);
  window.addEventListener('pointerdown', onDown, true);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('blur', onAway);
  document.addEventListener('mouseout', onOut);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    end();
    leave();
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerdown', onDown, true);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('blur', onAway);
    document.removeEventListener('mouseout', onOut);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
