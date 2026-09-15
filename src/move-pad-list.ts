import { MoveFunctions } from './move-functions';
import { TweakStore } from './store/TweakStore';

export interface MovePadListOption { value: string; label: string }
export interface MovePadListConfig {
  label?: string;
  submitLabel?: string;
  options: MovePadListOption[];
  selected?: string[];
  onSubmit: (selected: string[]) => void | Promise<void>;
}
export interface MovePadListView {
  panelId: string;
  path: string;
  label: string;
  submitLabel?: string;
  options: MovePadListOption[];
  selected: string[];
  cursor: number;
  pending: boolean;
  error: string | null;
}
type Attachment = { config: MovePadListConfig; selected: string[]; cursor: number; submission: { pending: boolean } };

/** One pad borrows its column's dial while a checked list is open. No screen is claimed. */
export class MovePadListStoreClass {
  private attachments = new Map<string, Attachment>();
  private view: MovePadListView | null = null;
  private listeners = new Set<() => void>();
  private version = 0;
  private releases: (() => void)[] = [];
  private key(panelId: string, path: string) { return JSON.stringify([panelId, path]); }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getVersion = () => this.version;
  getView = () => this.view;
  private notify() { this.version++; for (const listener of this.listeners) listener(); }
  has(panelId: string, path: string) { return this.attachments.has(this.key(panelId, path)); }
  selected(panelId: string, path: string) { return [...(this.attachments.get(this.key(panelId, path))?.selected ?? [])]; }
  attach(panelId: string, path: string, config: MovePadListConfig) {
    TweakStore.noteMoveKitUse('padList');
    const key = this.key(panelId, path);
    const previous = this.attachments.get(key);
    const valid = new Set(config.options.map(option => option.value));
    const attachment = { config, selected: [...new Set(previous?.selected ?? config.selected ?? [])].filter(value => valid.has(value)), cursor: previous?.cursor ?? 0, submission: previous?.submission ?? { pending: false } };
    this.attachments.set(key, attachment);
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    this.notify();
    return () => {
      if (this.attachments.get(key) !== attachment) return;
      if (this.view?.panelId === panelId && this.view.path === path) this.close();
      this.attachments.delete(key);
      this.notify();
    };
  }
  open(panelId: string, path: string) {
    const attachment = this.attachments.get(this.key(panelId, path));
    if (!attachment || TweakStore.isDisabled(panelId, path)) return;
    this.close();
    const { config } = attachment;
    this.view = { panelId, path, label: config.label ?? path, submitLabel: config.submitLabel, options: config.options, selected: [...attachment.selected], cursor: Math.min(attachment.cursor, Math.max(0, config.options.length - 1)), pending: attachment.submission.pending, error: null };
    this.releases = [
      MoveFunctions.push('back', () => this.close(), { label: 'close list' }),
      MoveFunctions.push('sample', () => this.toggleCursor(), { label: 'select' }),
      MoveFunctions.push('up', () => this.move(-1)),
      MoveFunctions.push('down', () => this.move(1)),
      MoveFunctions.push('jog_click', () => this.toggleCursor(), { label: 'select', chip: false }),
      MoveFunctions.push('capture', () => { void this.submit(); }, { label: config.submitLabel ?? config.label ?? 'run selected', chip: false }),
    ];
    this.notify();
  }
  /** The same pad opens its list, then becomes its submission action. */
  activate(panelId: string, path: string) {
    if (this.view?.panelId === panelId && this.view.path === path) return this.submit();
    this.open(panelId, path);
  }
  toggle(panelId: string, path: string) {
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    else this.open(panelId, path);
  }
  close() {
    if (!this.view) return;
    this.view = null;
    for (const release of this.releases.splice(0).reverse()) release();
    this.notify();
  }
  setCursor(index: number) {
    if (!this.view || this.view.pending || !Number.isFinite(index)) return;
    const cursor = Math.max(0, Math.min(this.view.options.length - 1, Math.round(index)));
    if (cursor === this.view.cursor) return;
    this.view = { ...this.view, cursor };
    this.save(); this.notify();
  }
  move(delta: number) { if (this.view) this.setCursor(this.view.cursor + Math.sign(delta)); }
  toggleCursor() {
    const view = this.view;
    const option = view?.options[view.cursor];
    if (!view || view.pending || !option) return;
    const selected = view.selected.includes(option.value) ? view.selected.filter(value => value !== option.value) : [...view.selected, option.value];
    this.view = { ...view, selected, error: null };
    this.save(); this.notify();
  }
  private save() {
    const view = this.view;
    if (!view) return;
    const attachment = this.attachments.get(this.key(view.panelId, view.path));
    if (attachment) { attachment.selected = [...view.selected]; attachment.cursor = view.cursor; }
  }
  async submit() {
    const view = this.view;
    if (!view || view.pending) return;
    if (!view.selected.length) { this.view = { ...view, error: 'Select at least one item, then tap the pad again.' }; this.notify(); return; }
    const attachment = this.attachments.get(this.key(view.panelId, view.path));
    if (!attachment || attachment.submission.pending) return;
    attachment.submission.pending = true;
    const pending = { ...view, pending: true, error: null };
    this.view = pending; this.notify();
    try {
      await attachment.config.onSubmit([...view.selected]);
      attachment.submission.pending = false;
      if (this.attachments.get(this.key(view.panelId, view.path))?.submission === attachment.submission && this.view?.panelId === view.panelId && this.view.path === view.path) this.close();
    } catch (error) {
      attachment.submission.pending = false;
      if (this.attachments.get(this.key(view.panelId, view.path))?.submission !== attachment.submission || this.view?.panelId !== view.panelId || this.view.path !== view.path) return;
      this.view = { ...this.view, pending: false, error: error instanceof Error ? error.message : 'Could not start. Tap the pad again to retry.' };
      this.notify();
    }
  }
}
export const MovePadListStore = new MovePadListStoreClass();
