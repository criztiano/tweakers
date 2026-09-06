import { TweakStore, type TweakValue } from './store/TweakStore';

/** A row of the preset screen — one shape for built-in and provider presets. */
export interface MovePresetItem { id: string; label: string }

/**
 * The screen's life runs in three beats: `enter` is the mounted-but-still
 * frame the entrance transition starts from, `open` is the working state,
 * `closing` runs the exit transition before the view unmounts.
 */
export type MovePresetPhase = 'enter' | 'open' | 'closing';

export interface MovePresetView {
  panelId: string;
  phase: MovePresetPhase;
  /** The row the wheel is resting on — previewed live while browsing. */
  cursor: string | null;
  /** The confirmed row — it turns green, lingers, then the screen dismisses. */
  chosen: string | null;
  /** True while Menu is held down: the panel plays the pre-navigator sound. */
  comparing: boolean;
}

export interface MovePresetSave { panelId: string; suggested: string }

/** How long a confirmed row shows its green before the screen dismisses. */
const CHOSEN_LINGER_MS = 800;
/** The exit transition plus the rows' trailing stagger, before unmount. */
const CLOSE_ANIM_MS = 450;
/** One frame between mount and `open`, so the entrance transition runs. */
const ENTER_MS = 20;

/**
 * The Move's preset navigator, behind the hardware Menu button. A press
 * opens the big list screen beside the slots; the wheel walks it, and each
 * row it rests on is previewed live — the panel plays the preset while you
 * browse. A click or the jog click confirms and keeps it; Back (or a Menu
 * tap) puts everything back the way it was; holding Menu compares the
 * previewed sound with the one you came in with. A Menu long press — or
 * Shift+Menu — opens the floating save input above the panel.
 *
 * Preview writes through `TweakStore.previewValues`, which records nothing:
 * browsing can never rewrite a saved preset. Heavyweight hosts can turn the
 * live preview off with `setPreviewEnabled(false)` — then browsing only
 * moves the cursor and the confirm click does the loading. With a host
 * `PresetProvider` installed the store cannot see values at all, so preview,
 * compare and revert are off and selection routes through the provider.
 */
class MovePresetStoreClass {
  private view: MovePresetView | null = null;
  private saving: MovePresetSave | null = null;
  /** The panel's values (and active preset) as they were at open — the
   *  state Back restores and the compare hold plays. Null in provider mode. */
  private original: Record<string, TweakValue> | null = null;
  private previewEnabled = true;
  private version = 0;
  private listeners = new Set<() => void>();
  private timers = new Set<ReturnType<typeof setTimeout>>();

  getView = (): MovePresetView | null => this.view;
  getSaving = (): MovePresetSave | null => this.saving;
  getVersion = (): number => this.version;
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };
  private notify() { this.version++; for (const fn of this.listeners) fn(); }
  private later(ms: number, fn: () => void) {
    const t = setTimeout(() => { this.timers.delete(t); fn(); }, ms);
    this.timers.add(t);
  }
  private clearTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
  }

  /** Turn the browse-time live preview off (and back on) for heavy hosts. */
  setPreviewEnabled(on: boolean) { this.previewEnabled = on; }
  isPreviewEnabled(): boolean { return this.previewEnabled; }

  /** The panel's presets as screen rows — provider list when one is set. */
  items(panelId: string): MovePresetItem[] {
    const provider = TweakStore.getPresetProvider(panelId);
    if (provider) return provider.presets.map((p) => ({ id: p.id, label: p.label }));
    return TweakStore.getPresets(panelId).map((p) => ({ id: p.id, label: p.name }));
  }

  /** Play a row's values without recording them — the browsing preview. */
  private applyPreview(id: string | null) {
    const view = this.view;
    if (!view || !id || !this.previewEnabled || !this.original) return;
    const preset = TweakStore.getPresets(view.panelId).find((p) => p.id === id);
    if (preset) TweakStore.previewValues(view.panelId, preset.values);
  }

  open(panelId: string) {
    this.clearTimers();
    const active = TweakStore.getActivePresetId(panelId);
    const items = this.items(panelId);
    const cursor = (active && items.some((i) => i.id === active) ? active : items[0]?.id) ?? null;
    // Provider mode: the host owns the values, so there is nothing to
    // snapshot — and therefore nothing to preview, compare or revert to.
    this.original = TweakStore.getPresetProvider(panelId)
      ? null
      : { ...TweakStore.getValues(panelId) };
    this.view = { panelId, phase: 'enter', cursor, chosen: null, comparing: false };
    this.notify();
    this.later(ENTER_MS, () => {
      if (this.view?.phase === 'enter') { this.view = { ...this.view, phase: 'open' }; this.notify(); }
    });
  }

  close() {
    if (!this.view || this.view.phase === 'closing') return;
    this.clearTimers();
    this.view = { ...this.view, phase: 'closing' };
    this.notify();
    this.later(CLOSE_ANIM_MS, () => {
      if (this.view?.phase === 'closing') { this.view = null; this.original = null; this.notify(); }
    });
  }

  /**
   * Put everything back and dismiss: the pre-navigator values return, the
   * previewed ones evaporate. Back's action, and a Menu tap on an open
   * screen. After a confirm there is nothing to take back — it's a no-op.
   */
  cancel() {
    const view = this.view;
    if (!view || view.phase === 'closing' || view.chosen) return;
    if (this.original) TweakStore.previewValues(view.panelId, this.original);
    this.view = { ...view, comparing: false }; // a clean, undimmed exit
    this.close();
  }

  toggle(panelId: string) {
    if (this.view && this.view.panelId === panelId && this.view.phase !== 'closing') this.cancel();
    else this.open(panelId);
  }

  /** Walk the cursor by wheel detents — each rest is previewed live. */
  scroll(delta: number) {
    const view = this.view;
    if (!view || view.phase === 'closing' || view.chosen) return;
    const items = this.items(view.panelId);
    if (!items.length) return;
    const step = Math.round(delta) || Math.sign(delta);
    const index = items.findIndex((i) => i.id === view.cursor);
    const next = Math.max(0, Math.min(items.length - 1, (index < 0 ? 0 : index) + step));
    if (items[next].id === view.cursor && !view.comparing) return;
    this.view = { ...view, cursor: items[next].id, comparing: false };
    this.applyPreview(items[next].id);
    this.notify();
  }

  /** Menu held down: play the pre-navigator sound for as long as it's held. */
  compareStart() {
    const view = this.view;
    if (!view || view.phase !== 'open' || view.chosen || view.comparing) return;
    if (!this.previewEnabled || !this.original) return;
    this.view = { ...view, comparing: true };
    TweakStore.previewValues(view.panelId, this.original);
    this.notify();
  }

  /** Menu released: back to the previewed row. */
  compareEnd() {
    const view = this.view;
    if (!view || !view.comparing) return;
    this.view = { ...view, comparing: false };
    this.applyPreview(view.cursor);
    this.notify();
  }

  /**
   * Confirm a row and keep it: the preset loads for real (active preset,
   * persistence), the row reads green for a beat, then the screen dismisses.
   */
  choose(id: string) {
    const view = this.view;
    if (!view || view.phase !== 'open' || view.chosen) return;
    if (!this.items(view.panelId).some((i) => i.id === id)) return;
    const provider = TweakStore.getPresetProvider(view.panelId);
    if (provider) void provider.onSelect(id);
    else TweakStore.loadPreset(view.panelId, id);
    this.view = { ...view, cursor: id, chosen: id, comparing: false };
    this.notify();
    this.later(CHOSEN_LINGER_MS, () => this.close());
  }

  /** Confirm the cursor's row — the jog-click path. */
  confirm() {
    if (this.view?.cursor) this.choose(this.view.cursor);
  }

  beginSave(panelId: string) {
    this.saving = { panelId, suggested: `Preset ${this.items(panelId).length + 1}` };
    this.notify();
  }

  cancelSave() {
    if (this.saving) { this.saving = null; this.notify(); }
  }

  commitSave(name: string) {
    const saving = this.saving;
    if (!saving) return;
    const label = name.trim() || saving.suggested;
    const provider = TweakStore.getPresetProvider(saving.panelId);
    if (provider) void provider.onCreate(label);
    else TweakStore.savePreset(saving.panelId, label);
    this.saving = null;
    this.notify();
  }
}

export const MovePresetStore = new MovePresetStoreClass();
