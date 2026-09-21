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
 * Values are what the store can say for itself. Two things it cannot, a host
 * hands over on purpose. A `brief` — a page on the field: what its words mean
 * on these controls, what never to do, a few recipes — makes the agent good
 * in this app rather than merely correct. And `actions`, the app's verbs
 * (split a clip, add a layer), with a `scene` that describes what they act on,
 * let it edit and not only set. An action that returns a function has handed
 * over its undo, and the one undo covers it too.
 *
 * Nothing here knows the app. The description is read off the store, so every
 * project that registers panels gets the agent with no work of its own; a
 * host adds only what words alone cannot carry — `context`, a line about what
 * the app is — or swaps the transport with `ask`. By default the ask goes to
 * the Move bridge (`/agent`), which asks through the machine's own Claude Code,
 * on the Claude subscription logged in there; no API key lives anywhere.
 *
 * An app that holds media gives the agent senses as well. `signals` say what
 * is in a source — words, shots, bars — and `tools` look or listen; with
 * either, an ask may take a few passes: the reply is calls, the kit runs them
 * and asks again with what came back, and the first reply without calls is
 * the answer. Nothing lands until that answer, so however many passes it took
 * it is still one change and one undo, and a cancel leaves nothing behind.
 * The maths of it — the edit map, the projection, the boundaries an edit is
 * named by — is in `move-agent-perception`.
 */

import { TweakStore } from './store/TweakStore';
import type { ControlMeta, TweakValue } from './store/TweakStore';
import { collectGenes, fitGene } from './preset-genetics';
import type { GeneParameter } from './preset-genetics';
import { formatEntries, projectEntries, queryEntries, readLive, resolveBoundary, timelineToSource } from './move-agent-perception';
import type {
  MoveAgentArg, MoveAgentBoundary, MoveAgentBoundaryRef, MoveAgentEntry, MoveAgentLive, MoveAgentPass, MoveAgentPassResult, MoveAgentProjectedEntry,
  MoveAgentSegment, MoveAgentSignal, MoveAgentSignalInfo, MoveAgentTool, MoveAgentToolCall, MoveAgentToolResult,
} from './move-agent-perception';

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

export type MoveAgentParamValue = number | string | boolean;
/** One argument of an action, described as plainly as a control is. */
export interface MoveAgentParam {
  /** A `boundary` is an edge of an entry — the agent names it, `run` gets its time. */
  type: 'number' | 'string' | 'boolean' | 'boundary';
  hint?: string;
  min?: number; max?: number; step?: number;
  /** A string that must be one of these. A function is read as each request is built — the samples there are now. */
  options?: MoveAgentLive<string[] | undefined>;
  /** May be left out. */
  optional?: boolean;
}
/** Whatever an action returns that is a function is its undo. */
export type MoveAgentActionResult = void | (() => void | Promise<void>);
/** One verb of the app, offered to the agent on purpose. */
export interface MoveAgentAction {
  id: string;
  label: string;
  /** What it does and when to reach for it — the agent reads this, not the code. */
  hint?: string;
  params?: Record<string, MoveAgentParam>;
  run(params: Record<string, MoveAgentArg>): MoveAgentActionResult | Promise<MoveAgentActionResult>;
}
export interface MoveAgentCall { id: string; params?: Record<string, MoveAgentParamValue | MoveAgentBoundaryRef> }
/** A param as it travels: its options and nothing to call. */
export type MoveAgentParamInfo = Omit<MoveAgentParam, 'options'> & { options?: string[] };
export type MoveAgentActionInfo = Omit<MoveAgentAction, 'run' | 'params'> & { params?: Record<string, MoveAgentParamInfo> };
export type MoveAgentToolInfo = Omit<MoveAgentTool, 'run' | 'progress' | 'done' | 'cost' | 'params'> & { cost?: string; params?: Record<string, MoveAgentParamInfo> };
/** How one ask ended, for the host that opened something at `begin`. */
export interface MoveAgentOutcome { changed: number; acted: number; skipped: number; cancelled: boolean; error?: string }
export interface MoveAgentRequest {
  prompt: string;
  context?: string;
  /** The page in front of the user — "this", "here" mean its controls. */
  focus?: string;
  /** The host's page on the field: vocabulary, limits, recipes. */
  brief?: string;
  /** What the actions act on — the clips, the layers — as the host tells it. */
  scene?: unknown;
  controls: MoveAgentControl[];
  actions?: MoveAgentActionInfo[];
  /** The ways to perceive on offer — only to a transport that can take passes. */
  tools?: MoveAgentToolInfo[];
  /** The signal menu: what could be read, its state and its cost. */
  signals?: MoveAgentSignalInfo[];
  /** The passes so far: what was called, and what came back. */
  history?: MoveAgentPass[];
  /** How many more times the reply may be calls. At 0 it must be the answer. */
  passesLeft?: number;
}
/**
 * Actions run first, in order; the writes land after them. A reply with
 * `calls` is not the answer yet: it asks to perceive, and carries no edits.
 */
export interface MoveAgentReply { writes: MoveAgentWrite[]; actions?: MoveAgentCall[]; message?: string; calls?: MoveAgentToolCall[] }
export type MoveAgentAsk = (request: MoveAgentRequest, signal: AbortSignal) => Promise<MoveAgentReply>;

export interface MoveAgentOptions {
  /** The bridge's agent endpoint. */
  url?: string;
  /** The host's own transport, in place of the bridge. */
  ask?: MoveAgentAsk | null;
  /** What the app is, in a sentence or two — the one thing the store cannot say. */
  context?: string;
  /** A page on the field — what its words mean here, what never to do, a few recipes. */
  brief?: string;
  /** The app's verbs. Nothing is offered that is not listed here. A function is read at every ask. */
  actions?: MoveAgentLive<MoveAgentAction[] | undefined>;
  /** What the actions act on, read fresh at every ask. Keep it small and plain. */
  scene?: () => unknown;
  /** The panels the agent may touch — same selection the panel mirror takes. */
  panels?: string | string[];
  /** What is in the media, in SOURCE time. Nothing is computed until the agent asks. A function is read at every ask — the open file's menu. */
  signals?: MoveAgentLive<MoveAgentSignal[] | undefined>;
  /** The edit as it stands — which piece of which source plays where. Read fresh at every pass. */
  editMap?: () => MoveAgentSegment[];
  /** The host's own perception: look, listen, search. A function is read at every ask — eyes only while a picture is open. */
  tools?: MoveAgentLive<MoveAgentTool[] | undefined>;
  /** How many turns one ask may take, the answer included. Default 3. */
  maxPasses?: number;
  /** Called once before an answer with actions lands — the host's save point. */
  checkpoint?: () => void | Promise<void>;
  /**
   * The edges of one ask. `begin` runs before anything is read or sent, and is
   * awaited; `end` runs once for every `begin`, however the ask ended — landed,
   * nothing to do, failed (`error`), or let go (`cancelled`).
   */
  onRequest?: { begin?: (prompt: string) => void | Promise<void>; end?: (outcome: MoveAgentOutcome) => void };
}

export type MoveAgentPhase = 'prompt' | 'thinking' | 'done' | 'error';
/** One thing the agent did to perceive, as the prompt shows it. */
export interface MoveAgentStep { label: string; state: 'running' | 'done' | 'failed' }
export interface MoveAgentView {
  phase: MoveAgentPhase;
  prompt: string;
  message: string;
  /** How many values the last ask moved. */
  changed: number;
  /** How many actions it ran. */
  acted: number;
  /** How many it asked for that could not run — no such verb, arguments that do not fit, a boundary nobody has seen. */
  skipped: number;
  /** What it read and looked at on the way, as it happens. */
  steps: MoveAgentStep[];
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

type ResolveBoundary = (ref: MoveAgentBoundaryRef) => MoveAgentBoundary | undefined;

/** A boundary as the model sends it — or, from a bridge too old to know the type, spelled in a string. */
function boundaryRef(value: unknown): MoveAgentBoundaryRef | undefined {
  let v = value;
  if (typeof v === 'string') {
    const spelled = /^(.+?)[\s@|,]+(start|end)$/.exec(v.trim());
    try { v = spelled ? { entry: spelled[1], edge: spelled[2] } : JSON.parse(v); } catch { return undefined; }
  }
  const ref = v as Partial<MoveAgentBoundaryRef> | null;
  return ref && typeof ref === 'object' && typeof ref.entry === 'string' && (ref.edge === 'start' || ref.edge === 'end')
    ? { entry: ref.entry, edge: ref.edge } : undefined;
}

/** Arguments fitted to what was declared, or undefined when one cannot be — a boundary nobody has seen included. */
function fitParams(declared: Record<string, MoveAgentParam> | undefined, given: Record<string, unknown> = {}, resolve?: ResolveBoundary): Record<string, MoveAgentArg> | undefined {
  const out: Record<string, MoveAgentArg> = {};
  for (const [name, p] of Object.entries(declared ?? {})) {
    let v = given[name];
    if (v === undefined || v === null) { if (p.optional) continue; return undefined; }
    if (p.type === 'boundary') {
      const ref = boundaryRef(v), boundary = ref && resolve?.(ref);
      if (!boundary) return undefined;
      out[name] = boundary;
      continue;
    }
    if (p.type === 'boolean' && (v === 'true' || v === 'false')) v = v === 'true';
    if (typeof v !== p.type) return undefined;
    if (p.type === 'number') {
      if (!Number.isFinite(v)) return undefined;
      let n = Math.max(p.min ?? -Infinity, Math.min(p.max ?? Infinity, v as number));
      if (p.step && p.step > 0) n = (p.min ?? 0) + Math.round((n - (p.min ?? 0)) / p.step) * p.step;
      v = n;
    } else { const options = readLive(p.options); if (options && !options.includes(v as string)) return undefined; }
    out[name] = v as MoveAgentParamValue;
  }
  return out;
}

/**
 * Run an agent's calls, in order, each awaited. A call that names no offered
 * action or whose arguments do not fit is skipped, and counted; one that
 * throws stops the rest, since a later step may lean on it. A boundary is
 * resolved as its call comes up, not before — the step ahead of it may have
 * moved the edit. Returns the undos handed back.
 */
export async function runAgentActions(calls: MoveAgentCall[], actions: MoveAgentAction[], resolve?: ResolveBoundary): Promise<{ ran: number; skipped: number; undos: (() => void | Promise<void>)[]; undoable: boolean; error?: string }> {
  const undos: (() => void | Promise<void>)[] = [];
  let ran = 0, skipped = 0, undoable = true;
  for (const call of calls) {
    const action = actions.find((a) => a.id === call.id);
    const params = action && fitParams(action.params, call.params, resolve);
    if (!action || !params) { skipped++; continue; }
    try {
      const undo = await action.run(params);
      ran++;
      if (typeof undo === 'function') undos.push(undo); else undoable = false;
    } catch (error) {
      return { ran, skipped, undos, undoable, error: `${action.label}: ${error instanceof Error ? error.message : 'failed'}` };
    }
  }
  return { ran, skipped, undos, undoable };
}

export function restoreAgentWrites(before: Record<string, Record<string, TweakValue>>): void {
  for (const [panelId, values] of Object.entries(before)) if (TweakStore.getPanel(panelId)) TweakStore.updateValues(panelId, values);
}

/** The kit's own tool, offered whenever the host gave signals. */
const READ_SIGNAL = 'read_signal';
const DEFAULT_URL = 'http://localhost:7787/agent';
/** One ask, every pass and tool in it: past this it is stopped, with nothing landed. */
const BUDGET_MS = 120_000;
/** What the bridge takes in one pass; past it the request is refused whole, so the kit trims first. */
const MAX_IMAGES = 8, MAX_IMAGE_BYTES = 600_000, IMAGE = /^data:image\/(jpeg|png);base64,/;

/** Settle with the work, or reject the moment the ask is let go — whether or not the work listens. */
const abortable = <T>(work: Promise<T> | T, signal: AbortSignal): Promise<T> => new Promise<T>((resolve, reject) => {
  const onAbort = () => reject(new Error('aborted'));
  if (signal.aborted) { onAbort(); return; }
  signal.addEventListener('abort', onAbort, { once: true });
  Promise.resolve(work).then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
});

/** Params as they travel: every live list read now. */
const describeParams = (params?: Record<string, MoveAgentParam>): Record<string, MoveAgentParamInfo> | undefined => params
  && Object.fromEntries(Object.entries(params).map(([name, { options, ...p }]): [string, MoveAgentParamInfo] => { const now = readLive(options); return [name, now ? { ...p, options: now } : p]; }));
const describeAction = ({ run: _run, params, ...a }: MoveAgentAction): MoveAgentActionInfo => (params ? { ...a, params: describeParams(params) } : a);
const describeTool = ({ run: _run, progress: _progress, done: _done, cost, params, ...t }: MoveAgentTool): MoveAgentToolInfo => {
  const now = readLive(cost);
  return { ...t, ...(now ? { cost: now } : {}), ...(params ? { params: describeParams(params) } : {}) };
};

/** What `read_signal` hands back, with how many entries the agent was given — the step says it. */
interface ReadSignalResult extends MoveAgentToolResult { count: number }

const isEntry = (e: unknown): e is MoveAgentEntry => !!e && typeof e === 'object'
  && typeof (e as MoveAgentEntry).id === 'string' && typeof (e as MoveAgentEntry).source === 'string' && Number.isFinite((e as MoveAgentEntry).t0);

/**
 * `read_signal`: timeline range in, compact lines out. The range goes back
 * through the edit map to source ranges, the host reads (and computes, if it
 * must) only those, and the entries come forward through the map again — so
 * the agent asks and reads in the timeline's time while the index never
 * leaves the source's.
 */
function readSignalTool(signals: MoveAgentSignal[], editMap?: () => MoveAgentSegment[]): MoveAgentTool {
  return {
    id: READ_SIGNAL, label: 'Read a signal', kind: 'read',
    hint: 'Read what one signal of the menu knows, as entries with ids and timeline times. `from`/`to` are timeline seconds and only say where to read — leave them out for the whole edit. `query` is optional: one or two plain words, to keep the entries that hold them. A signal that is not ready is computed first, at the cost its menu line names.',
    params: {
      signal: { type: 'string', options: signals.map((s) => s.id) },
      from: { type: 'number', min: 0, optional: true, hint: 'timeline seconds' },
      to: { type: 'number', min: 0, optional: true, hint: 'timeline seconds' },
      query: { type: 'string', optional: true, hint: 'optional — one or two plain words' },
    },
    done: (params, result) => {
      const label = signals.find((s) => s.id === params.signal)?.label.toLowerCase() ?? 'signal';
      const count = (result as Partial<ReadSignalResult>).count;
      return count === undefined ? `Read the ${label}` : `Read the ${label} — ${count}`;
    },
    run: async (params, abort): Promise<ReadSignalResult> => {
      const chosen = signals.find((s) => s.id === params.signal)!;
      const cost = readLive(chosen.cost);
      if (chosen.state() === 'unavailable') throw new Error(`${chosen.label} cannot be read here${cost ? ` (${cost})` : ''}.`);
      const from = params.from as number | undefined, to = params.to as number | undefined;
      const segments = editMap?.();
      const held = segments && timelineToSource({ from, to }, segments);
      if (held && !held.length) return { text: 'Nothing of the edit is in that range.', count: 0 };
      const entries = (await chosen.read(chosen.whole ? undefined : held, abort)).filter(isEntry);
      const projected: MoveAgentProjectedEntry[] = segments ? projectEntries(entries, segments)
        : entries.map((e) => ({ ...e, at0: e.t0, ...(e.t1 !== undefined && e.t1 > e.t0 ? { at1: e.t1 } : {}) })).sort((a, b) => a.at0 - b.at0);
      const inRange = projected.filter((e) => (e.at1 ?? e.at0) >= (from ?? -Infinity) && e.at0 <= (to ?? Infinity));
      const query = params.query as string | undefined;
      return { text: formatEntries(inRange, { query }), entries, count: queryEntries(inRange, query).kept.length };
    },
  };
}

/**
 * Hold a pass's images to what the bridge takes — JPEG or PNG, so many, so
 * large; anything else and it refuses the whole request. What was left out is
 * said to the agent in the result, and counted per call for the step.
 */
function trimImages(results: MoveAgentPassResult[], allowed: boolean): { results: MoveAgentPassResult[]; left: number[] } {
  let room = allowed ? MAX_IMAGES : 0;
  const left: number[] = [];
  const trimmed = results.map((result, index) => {
    if (!result.images?.length) return result;
    const images = result.images.filter((image) => typeof image?.dataUrl === 'string' && IMAGE.test(image.dataUrl)
      && image.dataUrl.length * 0.75 <= MAX_IMAGE_BYTES && room-- > 0);
    left[index] = result.images.length - images.length;
    if (!left[index]) return result;
    return { ...result, text: [result.text, `(${leftOut(left[index], allowed)})`].filter(Boolean).join(' '), images: images.length ? images : undefined };
  });
  return { results: trimmed, left };
}
const leftOut = (n: number, allowed: boolean) => `${n} ${n === 1 ? 'image' : 'images'} left out: ${allowed ? `at most ${MAX_IMAGES} a pass, JPEG or PNG, under ${MAX_IMAGE_BYTES / 1000} KB each` : 'images cannot be sent here'}`;

class MoveAgentStoreClass {
  private options: MoveAgentOptions = {};
  private view: MoveAgentView | null = null;
  private before: Record<string, Record<string, TweakValue>> | null = null;
  private undos: (() => void | Promise<void>)[] = [];
  private focus: string | undefined;
  private flight: AbortController | null = null;
  /** What the bridge said it can do, kept per url — and forgotten when it fails. */
  private caps: { url: string; maxPasses?: number; images: boolean } | null = null;
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
  canUndo = (): boolean => !!this.before || this.undos.length > 0;

  /** Open the prompt; `focus` is the page in front of the user. */
  open(focus?: string) {
    this.focus = focus;
    if (!this.view) this.set({ phase: 'prompt', prompt: '', message: '', changed: 0, acted: 0, skipped: 0, steps: [] });
  }

  /** Close — and let go of an ask still in the air, its tools with it. What landed stays. */
  close() {
    this.flight?.abort();
    this.flight = null;
    if (this.view) this.set(null);
  }

  toggle(focus?: string) { if (this.view) this.close(); else this.open(focus); }

  async ask(prompt: string): Promise<void> {
    const text = prompt.trim();
    if (!this.view || !text || this.view.phase === 'thinking') return;
    const idle = { prompt: text, message: '', changed: 0, acted: 0, skipped: 0, steps: [] as MoveAgentStep[] };
    const flight = (this.flight = new AbortController());
    this.set({ ...idle, phase: 'thinking' });
    let late = false;
    const budget = setTimeout(() => { late = true; flight.abort(); }, BUDGET_MS);
    const { onRequest } = this.options;
    const outcome: MoveAgentOutcome = { changed: 0, acted: 0, skipped: 0, cancelled: false };
    try {
      await abortable(onRequest?.begin?.(text), flight.signal);
      // What depends on the open file is read now, once, for the whole ask.
      const controls = describeAgentControls(this.options.panels);
      const actions = readLive(this.options.actions) ?? [];
      if (!controls.length && !actions.length) throw new Error('Nothing here to turn.');
      const focus = this.focus && TweakStore.getPanel(this.focus)?.name;
      const signals = readLive(this.options.signals) ?? [], hostTools = readLive(this.options.tools) ?? [], editMap = this.options.editMap;
      // Senses are offered only to a transport that can take passes; to any
      // other the ask is what it always was — one request, one reply.
      const caps = signals.length || hostTools.length ? await this.capable(flight.signal) : null;
      const tools = caps ? [...(signals.length ? [readSignalTool(signals, editMap)] : []), ...hostTools.filter((t) => t.id !== READ_SIGNAL)] : [];
      const maxPasses = tools.length ? Math.max(1, Math.floor(Math.min(this.options.maxPasses ?? 3, caps?.maxPasses ?? Infinity))) : 1;
      // Every entry this request has seen: what a boundary may name.
      const known: MoveAgentEntry[] = [], seen = new Set<string>();
      const learn = (found: unknown) => {
        for (const e of Array.isArray(found) ? found : []) {
          if (!isEntry(e) || seen.has(`${e.source}\n${e.id}`)) continue;
          seen.add(`${e.source}\n${e.id}`);
          known.push(e);
        }
      };
      const resolve = (ref: MoveAgentBoundaryRef) => resolveBoundary(ref, known, editMap?.());
      const history: MoveAgentPass[] = [];
      let reply: MoveAgentReply;
      for (let pass = 1; ; pass++) {
        const scene = this.options.scene?.();
        learn((scene as { entries?: unknown } | null | undefined)?.entries);
        const passesLeft = maxPasses - pass;
        reply = await abortable((this.options.ask ?? this.askBridge)({
          prompt: text, context: this.options.context, brief: this.options.brief, focus, scene, controls,
          actions: actions.length ? actions.map(describeAction) : undefined,
          ...(tools.length ? {
            tools: tools.map(describeTool),
            signals: signals.length ? signals.map(({ id, label, hint, cost, state }): MoveAgentSignalInfo => ({ id, label, hint, state: state(), cost: readLive(cost) })) : undefined,
            history: history.length ? history : undefined,
            passesLeft,
          } : {}),
        }, flight.signal), flight.signal);
        if (!tools.length || !reply.calls?.length || passesLeft <= 0) break;
        history.push(await this.perceive(reply.calls, tools, signals, resolve, learn, caps?.images !== false, flight.signal));
      }
      // The answer. From here it lands whole: the budget and a cancel are behind it.
      const calls = reply.actions ?? [];
      if (calls.length && this.options.checkpoint) await abortable(this.options.checkpoint(), flight.signal);
      clearTimeout(budget);
      if (flight.signal.aborted) { outcome.cancelled = true; return; }
      // Actions first: a verb may reshape what the values then land on.
      const acted = await runAgentActions(calls, actions, resolve);
      const { before, changed } = applyAgentWrites(reply.writes ?? [], this.options.panels);
      if (changed || acted.ran) { this.before = changed ? before : null; this.undos = acted.undos; }
      Object.assign(outcome, { changed, acted: acted.ran, skipped: acted.skipped }, acted.error ? { error: acted.error } : {});
      const moved = changed > 0 || acted.ran > 0;
      const unanswered = !moved && !!reply.calls?.length && tools.length > 0;
      if (this.view) this.set({
        phase: acted.error ? 'error' : 'done', prompt: text, changed, acted: acted.ran, skipped: acted.skipped, steps: this.view.steps,
        message: acted.error ?? (reply.message || (unanswered ? 'It kept looking and ran out of passes. Nothing changed.' : moved ? '' : 'Nothing changed.')),
      });
    } catch (error) {
      if (flight.signal.aborted && !late) { outcome.cancelled = true; return; }
      outcome.error = late ? 'That took too long, so it was stopped. Nothing changed.' : error instanceof Error ? error.message : 'The agent did not answer.';
      if (this.view) this.set({ ...idle, steps: this.view.steps, phase: 'error', message: outcome.error });
    } finally {
      clearTimeout(budget);
      if (this.flight === flight) this.flight = null;
      // The host's own end must not break the ask it closes.
      try { onRequest?.end?.(outcome); } catch (error) { console.warn('tweakers agent: onRequest.end failed', error); }
    }
  }

  /**
   * One pass of perceiving: every call at once, each abortable, each a step
   * in the view. A call that fails does not fail the ask — the agent is told,
   * and may try another way.
   */
  private async perceive(calls: MoveAgentToolCall[], tools: MoveAgentTool[], signals: MoveAgentSignal[], resolve: ResolveBoundary, learn: (found: unknown) => void, images: boolean, signal: AbortSignal): Promise<MoveAgentPass> {
    const first = this.view?.steps.length ?? 0;
    const running = (call: MoveAgentToolCall) => {
      const tool = tools.find((t) => t.id === call.tool);
      const read = call.tool === READ_SIGNAL && signals.find((s) => s.id === call.params?.signal)?.label.toLowerCase();
      if (read) return `Reading the ${read}…`;
      return tool ? tool.progress ?? `${tool.label}…` : call.tool;
    };
    // The finished text, per call: the tool's `done` with what it found, its label without one.
    const finished: string[] = calls.map((call) => {
      const tool = tools.find((t) => t.id === call.tool);
      const read = call.tool === READ_SIGNAL && signals.find((s) => s.id === call.params?.signal)?.label.toLowerCase();
      return read ? `Read the ${read}` : tool?.label ?? call.tool;
    });
    const said = (tool: MoveAgentTool, params: Record<string, MoveAgentArg>, result: MoveAgentToolResult): string | undefined => {
      if (typeof tool.done !== 'function') return tool.done;
      try { return tool.done(params, result) || undefined; } catch { return undefined; }
    };
    const mark = (index: number, step: MoveAgentStep) => {
      if (!this.view || signal.aborted) return;
      const steps = [...this.view.steps];
      steps[first + index] = step;
      this.set({ ...this.view, steps });
    };
    if (this.view) this.set({ ...this.view, steps: [...this.view.steps, ...calls.map((call): MoveAgentStep => ({ label: running(call), state: 'running' }))] });
    const results = await Promise.all(calls.map(async (call, index): Promise<MoveAgentPassResult> => {
      try {
        const tool = tools.find((t) => t.id === call.tool);
        if (!tool) throw new Error('No such tool.');
        const params = fitParams(tool.params, call.params, resolve);
        if (!params) throw new Error('The arguments do not fit what the tool takes.');
        const result = await abortable(tool.run(params, signal), signal) ?? {};
        learn(result.entries);
        finished[index] = said(tool, params, result) ?? finished[index];
        mark(index, { label: finished[index], state: 'done' });
        return { tool: call.tool, text: result.text, images: result.images };
      } catch (error) {
        if (signal.aborted) throw error;
        mark(index, { label: finished[index], state: 'failed' });
        return { tool: call.tool, error: error instanceof Error ? error.message : 'failed' };
      }
    }));
    // A look whose pictures cannot travel has not shown the agent anything: the step says so.
    const trimmed = trimImages(results, images);
    trimmed.left.forEach((n, index) => { if (n) mark(index, { label: `${finished[index]} — ${leftOut(n, images)}`, state: trimmed.results[index].images ? 'done' : 'failed' }); });
    return { calls: calls.map(({ tool, params }) => ({ tool, params })), results: trimmed.results };
  }

  /**
   * What the transport can take. A host's own `ask` is taken at its word; the
   * bridge is asked once, and asked again only after it has failed — a bridge
   * left running is often older than the page that loads the kit. No answer,
   * or one without `passes`, means a single pass.
   */
  private async capable(signal: AbortSignal): Promise<{ maxPasses?: number; images: boolean } | null> {
    if (this.options.ask) return { images: true };
    const url = `${(this.options.url ?? DEFAULT_URL).replace(/\/$/, '')}/capabilities`;
    if (this.caps?.url === url) return this.caps;
    const patience = new AbortController();
    const timer = setTimeout(() => patience.abort(), 2000);
    try {
      const res = await abortable(fetch(url, { signal: patience.signal }), signal);
      const body = res.ok ? await res.json().catch(() => null) as { passes?: unknown; images?: unknown; maxPasses?: unknown } | null : null;
      if (body?.passes !== true) return null;
      this.caps = { url, images: body.images === true, maxPasses: typeof body.maxPasses === 'number' && body.maxPasses >= 1 ? body.maxPasses : undefined };
      return this.caps;
    } catch (error) {
      if (signal.aborted) throw error;
      return null;
    } finally {
      clearTimeout(timer);
      if (signal.aborted) patience.abort();
    }
  }

  /** Put back what the last ask did: the values, then its actions, last one first. */
  async undo(): Promise<void> {
    if (!this.canUndo()) return;
    const before = this.before, undos = this.undos;
    this.before = null;
    this.undos = [];
    if (before) restoreAgentWrites(before);
    // The first reason is the one the user reads; the rest are kept where they can be found.
    const failures: unknown[] = [];
    for (const undo of undos.reverse()) { try { await undo(); } catch (error) { failures.push(error); } }
    for (const error of failures.slice(1)) console.warn('tweakers agent: an undo failed', error);
    const reason = failures[0] instanceof Error ? failures[0].message.trim() : typeof failures[0] === 'string' ? failures[0].trim() : '';
    const message = !failures.length ? 'Undone.' : reason ? `Could not undo: ${reason}` : 'Some of it could not be undone.';
    if (this.view) this.set({ ...this.view, phase: 'prompt', message, changed: 0, acted: 0, skipped: 0, steps: [] });
  }

  private askBridge: MoveAgentAsk = async (request, signal) => {
    let res: Response;
    try {
      res = await fetch(this.options.url ?? DEFAULT_URL, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      this.caps = null;
      throw new Error('The Move bridge is not answering.');
    }
    const body = await res.json().catch(() => null) as (MoveAgentReply & { error?: string }) | null;
    if (!res.ok || !body) { this.caps = null; throw new Error(body?.error || `The agent failed (${res.status}).`); }
    return body;
  };
}

export const MoveAgentStore = new MoveAgentStoreClass();
