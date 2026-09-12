/**
 * The Move's function buttons, offered to the app as a function library.
 *
 * The hardware carries a row of named buttons — Undo, Copy, Delete, Mute,
 * the arrows and friends. The app attaches its own actions to them:
 *
 *   import { MoveFunctions } from 'tweakers';
 *
 *   MoveFunctions.attach('undo', () => history.undo());
 *   MoveFunctions.attach('copy', ({ shift }) => shift ? copyAll() : copySelection());
 *   MoveFunctions.attach('sample', () => confirmSelection());
 *
 * and hands the registry to the bridge kit when binding:
 *
 *   import('http://localhost:7787/kit.js')
 *     .then(m => m.bindMove(TweakStore, { functions: MoveFunctions }))
 *     .catch(() => {});
 *
 * The kit tells the Move which buttons are attached (they light up on the
 * hardware) and relays every press back here; `attach` returns a detach
 * function. Buttons left unattached keep the surface's built-in behavior
 * (Undo resets the page's dials, Delete clears the sequencer, Play runs it).
 * Shift never appears here — it rides along as a flag on every press — and
 * the four track buttons always switch pages.
 */

/**
 * The manifest of attachable buttons — each named exactly as printed on the
 * hardware, so integration talk stays unambiguous ("wire the sample button").
 * `special` marks the Move-specific buttons that carry no fixed meaning —
 * each app decides what they do (sample often acts as the confirm key). The
 * rest should do what their printed label says (Undo undoes, Copy copies),
 * so every app feels the same in the hand.
 */
export const MOVE_FUNCTION_MANIFEST = [
  { name: 'play' },
  { name: 'rec' },
  { name: 'mute' },
  { name: 'undo' },
  { name: 'copy' },
  { name: 'delete' },
  { name: 'up' },
  { name: 'down' },
  { name: 'left' },
  { name: 'right' },
  { name: 'sample', special: true },
  { name: 'loop', special: true },
  { name: 'capture', special: true },
  { name: 'menu', special: true },
  { name: 'back', special: true },
  { name: 'jog_click', special: true },
  /* The Shift layer of the step row: the sixteen labels printed under the
     step buttons, in step order (`step` is the index). Four steps carry no
     print and are named by position. Holding Shift on the hardware lights
     the label icon under each one the app carries; a press arrives with
     `step` set. `host` marks the two schwung keeps for itself (Settings on
     Shift+Step 2, Tools on Shift+Step 13): attachable, never delivered. */
  { name: 'set_overview', step: 0 },
  { name: 'setup', step: 1, host: true },
  { name: 'workflow', step: 2 },
  { name: 'step4', step: 3 },
  { name: 'tempo', step: 4 },
  { name: 'metronome', step: 5 },
  { name: 'groove', step: 6 },
  { name: 'pitches_16', step: 7 },
  { name: 'scale', step: 8 },
  { name: 'full_velocity', step: 9 },
  { name: 'repeat', step: 10 },
  { name: 'step12', step: 11 },
  { name: 'step13', step: 12, host: true },
  { name: 'step14', step: 13 },
  { name: 'double_loop', step: 14 },
  { name: 'quantize', step: 15 },
] as const;

/** The attachable function names, manifest order. */
export const MOVE_FUNCTION_BUTTONS = MOVE_FUNCTION_MANIFEST.map((b) => b.name);

/** The Shift+step second functions, in step order (index = step 0-15). */
export const MOVE_STEP_FUNCTIONS = MOVE_FUNCTION_MANIFEST.filter((b) => 'step' in b).map((b) => b.name);

/** The special buttons — free for app-specific meanings. */
export const MOVE_SPECIAL_BUTTONS = MOVE_FUNCTION_MANIFEST.filter((b) => 'special' in b && b.special).map((b) => b.name);

export type MoveFunctionButton = (typeof MOVE_FUNCTION_MANIFEST)[number]['name'];

export interface MoveFunctionPress {
  name: MoveFunctionButton;
  /** True when Shift was held on the hardware — a second-function layer. */
  shift: boolean;
  /** The step index (0-15) when the press was a Shift+step second function. */
  step?: number;
  /**
   * True when the kit read the press as a long press. Older kits never set
   * it, so a handler treating hold as a second function should accept
   * Shift as the equivalent trigger.
   */
  hold?: boolean;
}

export type MoveFunctionHandler = (press: MoveFunctionPress) => void;

export interface MoveFunctionOptions {
  /**
   * A screen name for the action, readable back via `label(name)`. The
   * panel's chip row (`MoveFunctionChips`) shows it on the chip; without
   * one the chip wears the name as the hardware prints it.
   */
  label?: string;
  /**
   * Whether the attachment shows as an on-screen chip in the MovePanel
   * header (default true — attached means lit, on both surfaces). The
   * panel's own plumbing passes false: the strip arrows, an overlay's
   * borrowed Back, the preset navigator's Menu belong to the instrument,
   * not to the app's function row.
   */
  chip?: boolean;
}

/** One attached function, as the panel's chip row shows it. */
export interface MoveFunctionChip {
  name: MoveFunctionButton;
  /** The attachment's screen label, when one was given. */
  label?: string;
  /** The step index for a Shift-layer second function — its press carries it. */
  step?: number;
}

/**
 * Names that never render as app chips: the host's own shortcuts (Settings
 * on Shift+Step 2, Tools on Shift+Step 13 — the surface drops them from the
 * claim anyway) and the settings-room door the panel wires itself.
 */
const CHIPLESS = new Set<MoveFunctionButton>([
  'set_overview',
  ...MOVE_FUNCTION_MANIFEST.filter((b) => 'host' in b && b.host).map((b) => b.name),
]);

export type MoveFunctionRunListener = (name: MoveFunctionButton, press: MoveFunctionPress) => void;

class MoveFunctionsClass {
  private handlers = new Map<MoveFunctionButton, MoveFunctionHandler>();
  private options = new Map<MoveFunctionButton, MoveFunctionOptions>();
  private listeners = new Set<() => void>();
  private runListeners = new Set<MoveFunctionRunListener>();

  /**
   * Attach an action to a function button; returns a detach function.
   * One action per button — attaching again replaces the previous one.
   */
  attach(name: MoveFunctionButton, handler: MoveFunctionHandler, options?: MoveFunctionOptions): () => void {
    if (!MOVE_FUNCTION_BUTTONS.includes(name)) {
      console.warn(`[tweakers] "${name}" is not a Move function button; expected one of: ${MOVE_FUNCTION_BUTTONS.join(', ')}`);
      return () => {};
    }
    this.handlers.set(name, handler);
    if (options) this.options.set(name, options);
    else this.options.delete(name);
    this.notify();
    return () => {
      if (this.handlers.get(name) === handler) {
        this.handlers.delete(name);
        this.options.delete(name);
        this.notify();
      }
    };
  }

  /** The attached button names — what the kit claims on the hardware. */
  list(): MoveFunctionButton[] {
    return [...this.handlers.keys()];
  }

  /**
   * The attachments the panel's chip row shows, in manifest order: every
   * attached button except the reserved names and the ones attached with
   * `chip: false`. A push overlay replaces the underlying chip while it
   * holds the button — the chip always says what a press runs right now.
   */
  chips(): MoveFunctionChip[] {
    return MOVE_FUNCTION_MANIFEST
      .filter((b) => this.handlers.has(b.name) && !CHIPLESS.has(b.name) && this.options.get(b.name)?.chip !== false)
      .map((b) => ({
        name: b.name,
        ...(this.options.get(b.name)?.label != null ? { label: this.options.get(b.name)!.label } : {}),
        ...('step' in b ? { step: b.step } : {}),
      }));
  }

  /**
   * Attach on top of whatever is there; the returned release puts the
   * previous attachment back. For overlays that borrow a button while they
   * are open — the preset navigator takes Back, and hands it back on close.
   */
  push(name: MoveFunctionButton, handler: MoveFunctionHandler, options?: MoveFunctionOptions): () => void {
    const prevHandler = this.handlers.get(name);
    const prevOptions = this.options.get(name);
    const detach = this.attach(name, handler, options);
    return () => {
      if (this.handlers.get(name) !== handler) return; // someone else took it since
      detach();
      if (prevHandler) this.attach(name, prevHandler, prevOptions);
    };
  }

  /** The screen name an attachment carries, if any. */
  label(name: MoveFunctionButton): string | undefined {
    return this.options.get(name)?.label;
  }

  /** Run the action attached to a button, if any. Called by the kit per press. */
  run(name: MoveFunctionButton, press?: Partial<MoveFunctionPress>): void {
    const full: MoveFunctionPress = { name, shift: !!press?.shift, hold: !!press?.hold, ...(typeof press?.step === 'number' ? { step: press.step } : {}) };
    this.handlers.get(name)?.(full);
    for (const l of this.runListeners) l(name, full);
  }

  /** Notified when attachments change, so the kit can reconfigure the Move. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notified on every run — the MovePanel flashes its pills on hardware presses. */
  subscribeRuns(listener: MoveFunctionRunListener): () => void {
    this.runListeners.add(listener);
    return () => this.runListeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) l();
  }
}

export const MoveFunctions = new MoveFunctionsClass();
