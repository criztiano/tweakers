/**
 * The settings view — open or closed, and nothing else.
 *
 * Every app ends up needing a room for its master controls: output level,
 * latency, a MIDI channel — the knobs that concern the whole instrument
 * rather than any one page. The panel gives that room a fixed door: the
 * Move's Set Overview button (Shift + Step 1). Name a registered panel in
 * `MovePanel`'s `settings` prop and the panel wires the door itself —
 * `set_overview` toggles the view, the surface inverts to the settings
 * palette, and Back walks out.
 *
 * This store only remembers whether the door is open, so a host can drive
 * it from its own UI too:
 *
 *   MoveSettingsView.toggle();   // what the hardware button does
 *
 * Which panel shows inside is `MovePanel`'s business — the `settings` prop
 * names it, exactly as `panels` names the pages.
 */

type Listener = () => void;

let open = false;
const listeners = new Set<Listener>();

const set = (next: boolean) => {
  if (open === next) return;
  open = next;
  for (const fn of listeners) fn();
};

export const MoveSettingsView = {
  isOpen: (): boolean => open,
  open: () => set(true),
  close: () => set(false),
  toggle: () => set(!open),

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
