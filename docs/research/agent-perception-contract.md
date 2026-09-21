# Agent perception — the build contract

The design is in [agent-perception.md](agent-perception.md). This is the
contract the three builds share (kit · bridge · Primecut). Where a build finds
the contract wrong, it says so in its report; it does not quietly diverge.

Spike, 2026-09-21: a bare `claude -p` turn with `--tools Read --allowedTools
"Read(//dir/**)"` read a 1440×606 contact sheet (12 tiles, burned-in times)
correctly in ~5 s, 2 turns. **The Homebrew ffmpeg here has no `drawtext`
filter** — time labels must be drawn another way (Pillow via `uv`, or sharp).

## Vocabulary

- **Source** — a media file, identified by a stable string (`source`). Its
  content never changes under an edit.
- **Entry** — one indexed fact about a source, in source seconds:
  `{ id, type, source, t0, t1?, label?, score? }`. `id` is stable and
  source-scoped (`shot:14`, `word:212`, `bar:17`, `vocal_in:2`, `silence:3`).
  `type` is open: `shot · word · phrase · bar · beat · onset · silence ·
  loud · section · event · tag · caption`.
- **Signal** — a named producer of entries for a source (`words`, `shots`,
  `loudness`, `silence`, `bars`, `stems`…), computed lazily, cached by the
  host per source identity. `state`: `ready · missing · computing ·
  unavailable`. `cost`: a short human hint ("about 20 s for this file").
- **Edit map** — the host's current edit as segments:
  `{ source, srcIn, srcOut, at, rate? }` (`at` = timeline seconds; `rate`
  default 1). Read fresh at every pass.
- **Projection** — entries × edit map → timeline entries:
  `{ ...entry, at0, at1?, partial? }`. An entry a segment edge runs through is
  clipped and marked `partial`. An entry outside every segment is absent. An
  entry inside two segments (a duplicate) appears twice, told apart by `at0`.
- **Boundary** — what the model names instead of a time:
  `{ entry: "<entry id>", edge: "start" | "end" }`. The host resolves it.
  **The model never writes a time for an edit.**
- **Pass** — one model turn. A request is at most `maxPasses` (default 3).
- **EDL** — the final reply's ordered `actions`. Applied once, at the end.
  One request = one undo, however many passes it took.

## Kit (tweakers) — host API

`moveKitOptions({ agent: { … } })`, added to what exists (`context`, `brief`,
`actions`, `scene`, `panels`, `ask`):

```ts
signals?: MoveAgentSignal[];
editMap?: () => MoveAgentSegment[];
tools?: MoveAgentTool[];          // host perception: look, listen, search
maxPasses?: number;               // default 3
checkpoint?: () => void | Promise<void>;   // before an EDL with actions lands

interface MoveAgentSignal {
  id: string; label: string; hint: string;   // hint: what questions it answers
  cost?: string;
  whole?: boolean;                // cannot be computed for a range
  state: () => 'ready' | 'missing' | 'computing' | 'unavailable';
  read: (range: { source: string; t0: number; t1: number }[] | undefined,
         signal: AbortSignal) => Promise<MoveAgentEntry[]>;   // computes if missing
}
interface MoveAgentTool {
  id: string; label: string; hint: string;
  kind: 'read' | 'perceive';
  cost?: string;
  progress?: string;              // shown while it runs: "Looking at the frames…"
  params?: Record<string, MoveAgentParam>;
  run: (params, signal: AbortSignal) => Promise<MoveAgentToolResult>;
}
interface MoveAgentToolResult {
  text?: string;
  images?: { name: string; dataUrl: string }[];   // JPEG/PNG data URLs
  entries?: MoveAgentEntry[];     // become known boundaries for this request
}
```

`MoveAgentParam.type` gains **`'boundary'`**. The model sends
`{ entry, edge }`; the kit resolves it against every entry seen in this
request (signals read, tool results, `scene` entries the host lists under
`scene.entries`) and hands `run` a resolved object:
`{ entry, edge, of, source, sourceTime, time }` (`time` = timeline seconds through
the current edit map; `of` = the entry itself, added after the first host had
to read an entry's type out of its id). An unknown entry id skips that action and is counted.

The kit itself offers the model one built-in tool when `signals` exist:

- **`read_signal`** `{ signal, from?, to?, query? }` — `from`/`to` are
  *timeline* seconds (the only place the model gives times, and only to
  look, never to cut). The kit inverts the edit map to source ranges, calls
  `read`, projects, filters by `query` (plain word match on `label`), and
  returns compact lines, capped (default 120) with "N more — narrow the
  range": `shot:14 | shot | 01:12.480–01:15.200 | beach, two people | partial`.
  Times are `MM:SS.mmm`, one format everywhere.

The signal **menu** (id, label, hint, state, cost) rides in every request, so
the model can choose the cheapest route that can answer. Nothing is computed
unless the model calls for it.

Loop, in the kit: ask → if the reply has `calls` and passes remain, run them
(in parallel, each abortable), append a `Pass` to `history`, ask again → the
first reply with no `calls` is final: `checkpoint()` if it has actions, run
the EDL, apply writes, one undo. Cancel (Esc, close, second wheel hold)
aborts the turn and every running tool; nothing has landed, so nothing to
undo. Hard stop at `maxPasses` and at 120 s.

View: `MoveAgentView` gains `steps: { label: string; state: 'running' |
'done' | 'failed' }[]` — the prompt shows them as they happen ("Read the
words", "Looked at 12 frames"). Skipped actions are said in the note.

**Capability handshake.** Before the first ask the kit does
`GET <bridge>/agent/capabilities`. No answer, a 404, or `passes !== true` →
the kit offers no tools and no signals and behaves exactly as today
(single pass). A host `ask` override is assumed capable.

## Bridge (move) — wire

`GET /agent/capabilities` →
`{ "agent": 2, "passes": true, "images": true, "maxPasses": 3 }`

`POST /agent` body, additions in bold:

```
{ prompt, context?, brief?, focus?, scene?, controls[], actions?[],
  **tools?[]**      // described tools: id, label, hint, kind, cost, params
  **signals?[]**    // the menu: id, label, hint, state, cost
  **history?[]**    // Pass[]: { calls: [{tool, params}], results: [{ tool, text?, images?, error? }] }
  **passesLeft?**   // 0 or absent → the reply cannot contain calls
}
```

Reply: `{ calls?: [{ tool, params }], writes, actions, message }`. The schema
is built per ask (as today for actions): `calls` exists only when
`passesLeft > 0` and tools are offered, each tool one exact alternative. A
reply with `calls` must carry empty `writes` and `actions` — the bridge
enforces it. Boundary params are `{ entry: string, edge: "start"|"end" }`.

Images: the bridge writes each pass's images into a fresh private temp dir
(`mkdtemp`), names their paths in the prompt, and runs the turn with `--tools
Read` and `--allowedTools "Read(//<that dir>/**)"` only — and with no tools at
all when there are no images, as today. The dir is removed when the request
ends. Images are capped: ≤ 8 per pass, each ≤ 600 KB, else 413.
The turn stays otherwise bare (no settings, no MCP, no session, scratch cwd).

The system prompt teaches the route choice: answer from what is in front of
you when you can; read a signal when the request is about content; look only
to refine or check a boundary or when no signal can answer; never give a time
for an edit, only a boundary; say "not here" when the signals say so.

## Primecut — what it supplies

Server (`server/`), cached on disk by path + `revision`:

- `GET  /api/index/:projectId/signals` → the menu with state and cost.
- `POST /api/index/:projectId/signal/:id` `{ ranges? }` → entries (computes if
  missing; range-limited where the tool allows).
- `POST /api/index/:projectId/look` `{ t0, t1, n }` (source seconds) → one
  contact sheet JPEG, ≤ 1456 px wide, ≤ 500 KB, tiles ≥ 240 px, the time
  drawn into every tile, plus the tile times as JSON.
- A lazy proxy (960 px wide) per video source; every visual signal reads it.

Signals, first build: `loudness`, `silence` (ffmpeg), `bars` (the existing
beat grid), `stems` (vocal/drums/bass in·out events from stems that exist;
`unavailable` with a cost hint when they do not), `words` (parakeet-mlx via
`uv`; mlx-whisper fallback), `shots` (TransNetV2 via `uv` if it installs
cleanly, else PySceneDetect or the ffmpeg scene filter — say which).
Deferred, reported not built: `tags`, `sections`, `captions`, frame search.

Web (`web/`), after the kit is re-vendored: `agent: { context, brief,
scene, editMap, signals, tools: [look], actions, checkpoint }`. Actions take
boundaries, finish a job in one step, and return their undo through
Primecut's own history. The `brief` ships as a **draft marked for Cri** —
the vocabulary is his to give.

## Rules for every build

- Work only in your own worktree/branch. Do not commit, push, or merge.
- **Never touch the live bridge** (port 7787, launchd) or a real Move. Test
  against a private bridge: `PORT=7799 MOVE_HOST=127.0.0.1 MOVE_ENGINE=local
  node app/server.mjs`. Close every headless browser you open.
- Real model calls go through the machine's `claude` on the subscription;
  keep them few (they spend allowance). Unit tests use a fake transport.
- Match the surrounding code's idiom and comment density. No new dependency
  without saying why in the report.
- Report: what was built, what was verified and how, what was not, and every
  place the contract had to bend.
