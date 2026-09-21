/**
 * What the agent can know about media: the index, the edit, and the snap.
 *
 * A host that holds media describes it in two halves. **Signals** say what is
 * in a source file — shots, words, bars, where the singer comes in — as
 * entries in *source* seconds, which no edit can make wrong. The **edit map**
 * says where the pieces of those sources sit on the timeline right now. What
 * the agent reads is always the two multiplied, made fresh: an entry the edit
 * removed is absent, one a cut runs through is clipped and marked `partial`,
 * one the edit plays twice appears twice. Nothing is ever re-indexed.
 *
 * And the agent never writes a time for an edit. It names a **boundary** —
 * the start of shot 14, the end of word 212 — and the kit computes the time
 * from the entry, exactly, through the edit as it stands.
 *
 * Everything here is pure: entries and segments in, entries or text out. The
 * loop that uses it lives in `move-agent`.
 */

import type { MoveAgentParam, MoveAgentParamValue } from './move-agent';

/** One indexed fact about a source, in source seconds. `id` is stable. */
export interface MoveAgentEntry {
  /** Stable and source-scoped: `shot:14`, `word:212`, `bar:17`, `vocal_in:2`. */
  id: string;
  /** Open: shot · word · phrase · bar · beat · onset · silence · section · event… */
  type: string;
  source: string;
  t0: number;
  /** Left out for a moment — a beat, an onset — rather than a span. */
  t1?: number;
  label?: string;
  score?: number;
}

/** One piece of the edit: this much of a source, playing from `at` on the timeline. */
export interface MoveAgentSegment {
  source: string;
  srcIn: number;
  srcOut: number;
  /** Timeline seconds. */
  at: number;
  /** Playback speed, default 1: at 2 the piece takes half its source length. */
  rate?: number;
}

/** An entry as the timeline has it. `t0`/`t1` stay the source's own. */
export interface MoveAgentProjectedEntry extends MoveAgentEntry {
  at0: number;
  at1?: number;
  /** A segment edge runs through it: part of it is not in the edit. */
  partial?: boolean;
}

export interface MoveAgentSourceRange { source: string; t0: number; t1: number }

/** What the model names in place of a time. */
export interface MoveAgentBoundaryRef { entry: string; edge: 'start' | 'end' }
/** The same, resolved by the kit — what an action's `run` is handed. */
export interface MoveAgentBoundary extends MoveAgentBoundaryRef {
  /** The entry the boundary is an edge of, whole — its `type`, its `label`, its own `t0`/`t1` — so a host never reads them out of the id. */
  of: MoveAgentEntry;
  source: string;
  /** Source seconds: exact, and true under any edit. */
  sourceTime: number;
  /** Timeline seconds through the edit as it stands; absent when that moment
   *  of the source is not in the edit now (first place, when it plays twice). */
  time?: number;
}

/** An argument as `run` receives it: fitted, and a boundary already resolved. */
export type MoveAgentArg = MoveAgentParamValue | MoveAgentBoundary;

export type MoveAgentSignalState = 'ready' | 'missing' | 'computing' | 'unavailable';
/**
 * What a host knows only with a file open, handed over as the value or as a
 * function that gives it. A function is read fresh — at every ask, or when the
 * request is built — so the host never has to say it again when the file or
 * the edit changes.
 */
export type MoveAgentLive<T> = T | (() => T);
export const readLive = <T>(live: MoveAgentLive<T>): T => (typeof live === 'function' ? (live as () => T)() : live);

/** A named producer of entries for a source, computed only when asked for. */
export interface MoveAgentSignal {
  id: string;
  label: string;
  /** What questions it answers — how the agent picks the cheapest route. */
  hint: string;
  /** A short human hint: "about 20 s for this file". A function is read as each request is built. */
  cost?: MoveAgentLive<string | undefined>;
  /** Cannot be computed for a range: `read` is handed `undefined`. */
  whole?: boolean;
  state: () => MoveAgentSignalState;
  /** Computes if missing. Entries come back in SOURCE seconds. */
  read: (range: MoveAgentSourceRange[] | undefined, signal: AbortSignal) => Promise<MoveAgentEntry[]>;
}

export interface MoveAgentToolResult {
  text?: string;
  /** JPEG/PNG data URLs. */
  images?: { name: string; dataUrl: string }[];
  /** Become known boundaries for this request. */
  entries?: MoveAgentEntry[];
}
/** One way for the agent to perceive, offered by the host: look, listen, search. */
export interface MoveAgentTool {
  id: string;
  /** The name the model reads. Also the step's text, when `progress` and `done` are left out. */
  label: string;
  hint: string;
  kind: 'read' | 'perceive';
  /** A function is read as each request is built. */
  cost?: MoveAgentLive<string | undefined>;
  /** Shown while it runs: "Looking at the frames…". */
  progress?: string;
  /** Shown once it has run, with what it found: "Looked at 12 frames". Handed the fitted arguments and the result. */
  done?: string | ((params: Record<string, MoveAgentArg>, result: MoveAgentToolResult) => string);
  params?: Record<string, MoveAgentParam>;
  run(params: Record<string, MoveAgentArg>, signal: AbortSignal): Promise<MoveAgentToolResult>;
}

/** The signal menu, as it rides in every request. */
export interface MoveAgentSignalInfo { id: string; label: string; hint: string; state: MoveAgentSignalState; cost?: string }
export interface MoveAgentToolCall { tool: string; params?: Record<string, unknown> }
export interface MoveAgentPassResult { tool: string; text?: string; images?: { name: string; dataUrl: string }[]; error?: string }
/** One model turn that asked to perceive, and what came back — in call order. */
export interface MoveAgentPass { calls: MoveAgentToolCall[]; results: MoveAgentPassResult[] }

const EPS = 1e-9;
const rateOf = (s: MoveAgentSegment) => (Number.isFinite(s.rate) && (s.rate as number) > 0 ? (s.rate as number) : 1);
const sound = (s: MoveAgentSegment) => Number.isFinite(s.srcIn) && Number.isFinite(s.srcOut) && Number.isFinite(s.at) && s.srcOut > s.srcIn;
const toTimeline = (s: MoveAgentSegment, t: number) => s.at + (t - s.srcIn) / rateOf(s);

/**
 * Entries × edit map → what the timeline holds. A span a segment edge runs
 * through is clipped and marked `partial`; an entry outside every segment is
 * absent; a source range the edit plays twice gives its entries twice, told
 * apart by `at0`. A moment belongs to the segment it starts in (`srcIn`
 * inclusive, `srcOut` not), so two pieces cut from one spot share nothing.
 * Sorted by timeline time.
 */
export function projectEntries(entries: MoveAgentEntry[], segments: MoveAgentSegment[]): MoveAgentProjectedEntry[] {
  const out: MoveAgentProjectedEntry[] = [];
  for (const segment of segments.filter(sound)) {
    for (const entry of entries) {
      if (entry.source !== segment.source || !Number.isFinite(entry.t0)) continue;
      if (entry.t1 === undefined || !(entry.t1 > entry.t0)) {
        if (entry.t0 < segment.srcIn - EPS || entry.t0 >= segment.srcOut - EPS) continue;
        out.push({ ...entry, at0: toTimeline(segment, entry.t0) });
        continue;
      }
      const c0 = Math.max(entry.t0, segment.srcIn), c1 = Math.min(entry.t1, segment.srcOut);
      if (c1 - c0 <= EPS) continue;
      const partial = c0 > entry.t0 + EPS || c1 < entry.t1 - EPS;
      out.push({ ...entry, at0: toTimeline(segment, c0), at1: toTimeline(segment, c1), ...(partial ? { partial } : {}) });
    }
  }
  return out.map((e, i) => ({ e, i })).sort((a, b) => a.e.at0 - b.e.at0 || a.i - b.i).map(({ e }) => e);
}

/**
 * The way back: a timeline range → the source ranges playing in it. An open
 * end takes the edit to its edge, no range at all takes all of it. Ranges of
 * one source that touch or overlap come back as one.
 */
export function timelineToSource(range: { from?: number; to?: number } | undefined, segments: MoveAgentSegment[]): MoveAgentSourceRange[] {
  const from = range?.from ?? -Infinity, to = range?.to ?? Infinity;
  const found: MoveAgentSourceRange[] = [];
  for (const segment of segments.filter(sound)) {
    const rate = rateOf(segment), end = segment.at + (segment.srcOut - segment.srcIn) / rate;
    const a = Math.max(from, segment.at), b = Math.min(to, end);
    if (b - a <= EPS) continue;
    found.push({ source: segment.source, t0: segment.srcIn + (a - segment.at) * rate, t1: segment.srcIn + (b - segment.at) * rate });
  }
  found.sort((a, b) => (a.source === b.source ? a.t0 - b.t0 : a.source < b.source ? -1 : 1));
  const merged: MoveAgentSourceRange[] = [];
  for (const r of found) {
    const last = merged[merged.length - 1];
    if (last && last.source === r.source && r.t0 <= last.t1 + EPS) last.t1 = Math.max(last.t1, r.t1);
    else merged.push({ ...r });
  }
  return merged;
}

/** `MM:SS.mmm` — the one time format the agent ever reads. Minutes run past 59. */
export function formatAgentTime(seconds: number): string {
  const ms = Math.max(0, Math.round((Number.isFinite(seconds) ? seconds : 0) * 1000));
  const pad = (n: number, w: number) => String(n).padStart(w, '0');
  return `${pad(Math.floor(ms / 60000), 2)}:${pad(Math.floor(ms / 1000) % 60, 2)}.${pad(ms % 1000, 3)}`;
}

/** Words that carry no meaning in a query: "vocals in" is a search for vocals. */
const STOP_WORDS = new Set(['a', 'an', 'and', 'at', 'in', 'is', 'of', 'on', 'or', 'the', 'to']);

/** The entries a query keeps, those that hold every word first — all of them when it finds none (`found` is then empty). */
export function queryEntries(projected: MoveAgentProjectedEntry[], query?: string): { found: MoveAgentProjectedEntry[]; kept: MoveAgentProjectedEntry[] } {
  const said = (query ?? '').toLowerCase().split(/[^\p{L}\p{N}']+/u).filter(Boolean);
  const words = said.some((w) => !STOP_WORDS.has(w)) ? said.filter((w) => !STOP_WORDS.has(w)) : said;
  const hits = (e: MoveAgentProjectedEntry) => { const text = `${e.label ?? ''} ${e.id} ${e.type}`.toLowerCase(); return words.filter((w) => text.includes(w)).length; };
  const found = words.length ? projected.filter((e) => hits(e) > 0) : projected;
  return { found, kept: found.length ? [...found.filter((e) => hits(e) === words.length), ...found.filter((e) => hits(e) < words.length)] : projected };
}

/**
 * Projected entries as the agent reads them, one to a line:
 * `shot:14 | shot | 01:12.480–01:15.200 | beach, two people | partial`.
 * Times are the timeline's. `query` is forgiving on purpose — the agent says
 * "vocals in" of an entry labelled "vocals enter": an entry is kept when any
 * word of the query that means something occurs in its label, id or type,
 * those that hold every word first. A query that finds nothing says so on
 * the first line and gives the whole list, so the agent can look for itself
 * and "not here" is an answer, not a dead end. Past `limit` (default 120)
 * the rest are counted, not listed: a wide read costs a line and asks for a
 * narrower one.
 */
export function formatEntries(projected: MoveAgentProjectedEntry[], options: { limit?: number; query?: string } = {}): string {
  if (!projected.length) return 'Nothing here.';
  const { found, kept } = queryEntries(projected, options.query);
  const limit = Math.max(1, Math.floor(options.limit ?? 120));
  const lines = kept.slice(0, limit).map((e) => [
    e.id, e.type,
    e.at1 === undefined ? formatAgentTime(e.at0) : `${formatAgentTime(e.at0)}–${formatAgentTime(e.at1)}`,
    e.label, e.score === undefined ? '' : `score ${Math.round(e.score * 100) / 100}`, e.partial ? 'partial' : '',
  ].filter(Boolean).join(' | '));
  if (!found.length) lines.unshift(`Nothing matches "${options.query!.trim()}" — this is everything in the range:`);
  if (kept.length > limit) lines.push(`${kept.length - limit} more — narrow the range`);
  return lines.join('\n');
}

/**
 * A named boundary → its time. The entry comes from what this request has
 * seen; an id nobody has seen resolves to nothing, and is never guessed at.
 * `sourceTime` is the entry's own edge. `time` is where that moment plays on
 * the timeline — for a start, the segment it opens in; for an end, the one it
 * closes in — and is left out when the edit does not hold it. `of` is the
 * entry itself, so `run` knows what kind of thing it was handed. With no edit
 * map (`segments` undefined) the timeline is the source, and the two agree.
 * Ids are source-scoped, so when two sources share one, the entry the edit
 * holds wins.
 */
export function resolveBoundary(ref: MoveAgentBoundaryRef, known: MoveAgentEntry[], segments?: MoveAgentSegment[]): MoveAgentBoundary | undefined {
  if (!ref || typeof ref.entry !== 'string' || (ref.edge !== 'start' && ref.edge !== 'end')) return undefined;
  const resolved = known.filter((e) => e.id === ref.entry && Number.isFinite(e.t0)).map((entry): MoveAgentBoundary => {
    const sourceTime = ref.edge === 'start' ? entry.t0 : entry.t1 !== undefined && entry.t1 > entry.t0 ? entry.t1 : entry.t0;
    const base = { entry: ref.entry, edge: ref.edge, of: entry, source: entry.source, sourceTime };
    if (!segments) return { ...base, time: sourceTime };
    const held = segments.filter((s) => sound(s) && s.source === entry.source);
    const inside = (s: MoveAgentSegment) => (ref.edge === 'start'
      ? sourceTime >= s.srcIn - EPS && sourceTime < s.srcOut - EPS
      : sourceTime > s.srcIn + EPS && sourceTime <= s.srcOut + EPS);
    const touching = (s: MoveAgentSegment) => sourceTime >= s.srcIn - EPS && sourceTime <= s.srcOut + EPS;
    const byTime = (a: MoveAgentSegment, b: MoveAgentSegment) => a.at - b.at;
    const segment = held.filter(inside).sort(byTime)[0] ?? held.filter(touching).sort(byTime)[0];
    return segment ? { ...base, time: toTimeline(segment, sourceTime) } : base;
  });
  return resolved.find((b) => b.time !== undefined) ?? resolved[0];
}
