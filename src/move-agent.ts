/**
 * Generative presetting: ask for a change in words, an agent turns the dials.
 *
 * Holding the Move's wheel down opens a prompt above the panel. The words go
 * out with a description of every control the app has registered — label,
 * range, options, where it stands now — and what comes back is a list of
 * writes. Each write is fitted to its control (clamped, stepped, checked
 * against the options) and committed through the store like a hand on a knob,
 * so the host hears it the way it hears any edit. The values from before the
 * ask are kept: one undo puts them all back.
 *
 * Nothing here knows the app. The description is read off the store, so every
 * project that registers panels gets the agent with no work of its own; a
 * host adds only what words alone cannot carry — `context`, a line about what
 * the app is — or swaps the transport with `ask`. By default the ask goes to
 * the Move bridge (`/agent`), which asks through the machine's own Claude Code,
 * on the Claude subscription logged in there; no API key lives anywhere.
 */

import { TweakStore } from './store/TweakStore';
import type { ControlMeta, TweakValue } from './store/TweakStore';
import { collectGenes, fitGene } from './preset-genetics';
import type { GeneParameter } from './preset-genetics';

/** The held wheel, from the bridge kit: cancelable, like every overlay gesture. */
export const MOVE_JOG_HOLD_EVENT = 'move-tweakers:jog-hold';

/** One writable value, as the agent reads it. */
export interface MoveAgentControl {
  /** `panelId::path`, or `panelId::path:component` for one axis of a pair. */
  id: string;
  panel: string;
  label: string;
  group?: string;
  kind: 'number' | 'category' | 'color' | 'text';
  min?: number; max?: number; step?: number; unit?: string;
  options?: (string | boolean)[];
  hint?: string;
  value: unknown;
}
export interface MoveAgentWrite { id: string; value: number | string | boolean }
export interface MoveAgentRequest {
  prompt: string;
  context?: string;
  /** The page in front of the user — "this", "here" mean its controls. */
  focus?: string;
  controls: MoveAgentControl[];
}
export interface MoveAgentReply { writes: MoveAgentWrite[]; message?: string }
export type MoveAgentAsk = (request: MoveAgentRequest, signal: AbortSignal) => Promise<MoveAgentReply>;

export interface MoveAgentOptions {
  /** The bridge's agent endpoint. */
  url?: string;
  /** The host's own transport, in place of the bridge. */
  ask?: MoveAgentAsk | null;
  /** What the app is, in a sentence or two — the one thing the store cannot say. */
  context?: string;
  /** The panels the agent may touch — same selection the panel mirror takes. */
  panels?: string | string[];
}

export type MoveAgentPhase = 'prompt' | 'thinking' | 'done' | 'error';
export interface MoveAgentView {
  phase: MoveAgentPhase;
  prompt: string;
  message: string;
  /** How many values the last ask moved. */
  changed: number;
}

interface Entry { panelId: string; path: string; component?: string; gene?: GeneParameter; control: MoveAgentControl }

const SEP = '::';
const flat = (controls: ControlMeta[]): ControlMeta[] =>
  controls.flatMap((c) => (c.type === 'folder' ? flat(c.children ?? []) : [c]));
const component = (value: TweakValue | undefined, key?: string): unknown =>
  key && value && typeof value === 'object' ? (value as unknown as Record<string, unknown>)[key] : value;

/** Every value an agent may write, read off the store's live registration. */
function entries(only?: string | string[]): Entry[] {
  return TweakStore.selectPanels(only).flatMap((panel): Entry[] => {
    const metas = new Map(flat(panel.controls).map((c) => [c.path, c]));
    const open = (path: string) => !TweakStore.isDisabled(panel.id, path);
    const genes = collectGenes(panel.controls).filter((g) => open(g.path)).map((g): Entry => {
      const meta = metas.get(g.path);
      return { panelId: panel.id, path: g.path, component: g.component, gene: g, control: {
        id: `${panel.id}${SEP}${g.id}`, panel: panel.name, label: g.label, group: g.group || undefined, kind: g.kind,
        min: g.min, max: g.max, step: g.step, unit: meta?.unit, options: g.options, hint: meta?.hint,
        value: component(panel.values[g.path], g.component),
      } };
    });
    const plain = [...metas.values()].filter((c) => (c.type === 'color' || c.type === 'text') && open(c.path)
      && typeof panel.values[c.path] === 'string').map((c): Entry => ({ panelId: panel.id, path: c.path, control: {
        id: `${panel.id}${SEP}${c.path}`, panel: panel.name, label: c.label, kind: c.type as 'color' | 'text', hint: c.hint,
        value: panel.values[c.path],
      } }));
    return [...genes, ...plain];
  });
}

/** The app's writable values, as the agent is told them. */
export function describeAgentControls(only?: string | string[]): MoveAgentControl[] {
  return entries(only).map((e) => e.control);
}

const COLOR = /^(#[0-9a-f]{3,8}|(rgb|hsl|oklch|oklab|lab|lch|color)a?\(.+\))$/i;
function fit(entry: Entry, value: unknown): unknown {
  if (entry.gene) return fitGene(value, entry.gene);
  if (typeof value !== 'string') return undefined;
  return entry.control.kind === 'color' ? (COLOR.test(value.trim()) ? value.trim() : undefined) : value;
}

/**
 * Commit an agent's writes. Unknown ids and values that fit no control are
 * dropped, never guessed at. Returns the values from before, per panel —
 * hand it to `restoreAgentWrites` to undo — and how many values moved.
 */
export function applyAgentWrites(writes: MoveAgentWrite[], only?: string | string[]): { before: Record<string, Record<string, TweakValue>>; changed: number } {
  const byId = new Map(entries(only).map((e) => [e.control.id, e]));
  const updates: Record<string, Record<string, TweakValue>> = {};
  const before: Record<string, Record<string, TweakValue>> = {};
  let changed = 0;
  for (const write of writes) {
    const entry = byId.get(write.id);
    const value = entry && fit(entry, write.value);
    if (!entry || value === undefined) continue;
    const live = TweakStore.getValues(entry.panelId);
    const pending = (updates[entry.panelId] ??= {});
    const current = pending[entry.path] ?? live[entry.path];
    if (component(current, entry.component) === value) continue;
    (before[entry.panelId] ??= {})[entry.path] ??= structuredClone(live[entry.path]);
    pending[entry.path] = (entry.component ? { ...(current as object), [entry.component]: value } : value) as TweakValue;
    changed++;
  }
  for (const [panelId, values] of Object.entries(updates)) TweakStore.updateValues(panelId, values);
  return { before, changed };
}

export function restoreAgentWrites(before: Record<string, Record<string, TweakValue>>): void {
  for (const [panelId, values] of Object.entries(before)) if (TweakStore.getPanel(panelId)) TweakStore.updateValues(panelId, values);
}

class MoveAgentStoreClass {
  private options: MoveAgentOptions = {};
  private view: MoveAgentView | null = null;
  private before: Record<string, Record<string, TweakValue>> | null = null;
  private focus: string | undefined;
  private flight: AbortController | null = null;
  private version = 0;
  private listeners = new Set<() => void>();

  getView = (): MoveAgentView | null => this.view;
  isOpen = (): boolean => !!this.view;
  getVersion = (): number => this.version;
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };
  private set(next: MoveAgentView | null) { this.view = next; this.version++; for (const fn of this.listeners) fn(); }

  /** Merge in the host's options — `moveKitOptions` hands over `url` and `panels`. */
  configure(options: MoveAgentOptions) { this.options = { ...this.options, ...options }; }
  canUndo = (): boolean => !!this.before;

  /** Open the prompt; `focus` is the page in front of the user. */
  open(focus?: string) {
    this.focus = focus;
    if (!this.view) this.set({ phase: 'prompt', prompt: '', message: '', changed: 0 });
  }

  /** Close — and let go of an ask still in the air. What landed stays. */
  close() {
    this.flight?.abort();
    this.flight = null;
    if (this.view) this.set(null);
  }

  toggle(focus?: string) { if (this.view) this.close(); else this.open(focus); }

  async ask(prompt: string): Promise<void> {
    const text = prompt.trim();
    if (!this.view || !text || this.view.phase === 'thinking') return;
    const controls = describeAgentControls(this.options.panels);
    if (!controls.length) { this.set({ ...this.view, phase: 'error', prompt: text, message: 'Nothing here to turn.' }); return; }
    const flight = (this.flight = new AbortController());
    this.set({ phase: 'thinking', prompt: text, message: '', changed: 0 });
    try {
      const focus = this.focus && TweakStore.getPanel(this.focus)?.name;
      const reply = await (this.options.ask ?? this.askBridge)({ prompt: text, context: this.options.context, focus, controls }, flight.signal);
      if (flight.signal.aborted) return;
      const { before, changed } = applyAgentWrites(reply.writes ?? [], this.options.panels);
      if (changed) this.before = before;
      this.set({ phase: 'done', prompt: text, changed, message: reply.message || (changed ? '' : 'Nothing changed.') });
    } catch (error) {
      if (flight.signal.aborted) return;
      this.set({ phase: 'error', prompt: text, changed: 0, message: error instanceof Error ? error.message : 'The agent did not answer.' });
    } finally {
      if (this.flight === flight) this.flight = null;
    }
  }

  /** Put back every value the last ask moved. */
  undo() {
    if (!this.before) return;
    restoreAgentWrites(this.before);
    this.before = null;
    if (this.view) this.set({ ...this.view, phase: 'prompt', message: 'Undone.', changed: 0 });
  }

  private askBridge: MoveAgentAsk = async (request, signal) => {
    let res: Response;
    try {
      res = await fetch(this.options.url ?? 'http://localhost:7787/agent', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error('The Move bridge is not answering.');
    }
    const body = await res.json().catch(() => null) as (MoveAgentReply & { error?: string }) | null;
    if (!res.ok || !body) throw new Error(body?.error || `The agent failed (${res.status}).`);
    return body;
  };
}

export const MoveAgentStore = new MoveAgentStoreClass();
