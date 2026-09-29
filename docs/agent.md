# The agent (generative presetting)

Hold the Move's wheel down. A prompt opens above the panel. Say what you want
— "warmer and wider", "a harsher look", "reset the delay to something subtle"
— and an agent turns the dials.

| Gesture | Result |
| --- | --- |
| Hold the wheel | Opens the prompt. A second hold closes it. |
| Enter | Sends the words. The field stays open, so the next ask refines the last. |
| Click the wheel on a reply, `Cmd+Z`, or **Undo** | Puts back every value the last ask moved. |
| Esc | Closes. What landed stays. |

## Every integration has it already

The agent reads the store, not the app. `describeAgentControls()` lists each
writable value of every registered panel — label, group, range, step, unit,
options, hint, current value — with pairs split per axis (`point:x`). Sliders,
numbers, toggles, selects, xy pads, ranges, filters, colours and text are
covered; disabled controls are left out, and so is a column held open with
`moveBlank` — a seat, not a value (preset exploration leaves it out the same
way). Labels and hints are what the agent reasons from, so a well-named panel
is a well-driven one.

Writes never land raw. `applyAgentWrites()` fits each one to its control
(clamped, stepped, checked against the options), drops what fits nothing, and
commits through `TweakStore.updateValues` — the host hears it as it hears a
hand on a knob, so its own sync and undo keep working.

The bind carries it; the agent follows the bind's `url` and `panels`:

```ts
m.bindMove(TweakStore, moveKitOptions({
  url: BRIDGE,
  panels,
  agent: { context: 'A video colour grader. Panels are per clip.' },
}));
```

`panels` names the pages the agent may touch by **id or name**, the id first
— the same list the bind and `<MovePanel panels>` take
(`TweakStore.selectPanels`). Prefer ids: a name is display copy, and a page
named after what is on it changes under the bind.

`context` is the least to add: a sentence on what the app is. The brief and
the actions, below, are what make the agent good at *this* app. A host with
its own model or server passes `agent: { ask }`, a function from
`MoveAgentRequest` to `MoveAgentReply`.

## The brief: good here, not just correct

The store says what a control *is*. It cannot say what "warm" means in this
app. A host writes that down once, as a brief, and it travels with every ask:

```ts
agent: {
  context: 'A video editor. One Look panel per clip.',
  brief: `
Vocabulary: "punchy" = Contrast 0.65–0.8, Saturation up a little.
  "Filmic" = Contrast near 0.4, Saturation 0.35–0.45.
Limits: never set Saturation above 0.85.
Recipes: Night = Contrast 0.7, Saturation 0.3, Tint toward blue.`,
}
```

Three parts, in this order of worth: **vocabulary** (the field's words, on
these controls), **limits** (what never to do), **recipes** (named starting
points to adapt). Write what a colleague new to the app would need, and
stop. One page is the ceiling: a long brief full of rules makes the agent
timid and literal. Do not restate what labels, ranges and hints already say.

## Actions: editing, not only setting

The agent sets values by default and can *do* nothing. An app whose work is
doing things — cutting a clip, adding a layer — offers its verbs on purpose:

```ts
agent: {
  scene: () => ({ timeline: clips.map(({ id, name, start, length }) => ({ id, name, start, length })) }),
  actions: [{
    id: 'trim',
    label: 'Trim clip',
    hint: 'Shorten a clip to a new length in seconds, keeping its start.',
    params: { clip: { type: 'string', hint: 'clip id' }, length: { type: 'number', min: 0.1 } },
    run: ({ clip, length }) => {
      const was = editor.lengthOf(clip);
      editor.trim(clip, length);
      return () => editor.trim(clip, was);      // the undo
    },
  }],
}
```

- **`scene`** is what the verbs act on, read fresh at every ask. Plain and
  small: ids, names, positions — what a person would need to give the order.
- **`params`** are described like controls (`type`, `min`/`max`/`step`,
  `options`, `optional`, `hint`). The kit fits every argument before `run`
  sees it, and skips a call that does not fit. Only listed actions exist.
- **Return a function from `run` and it is the undo.** The prompt's one undo
  then takes back the actions, last first, along with the values. An action
  that returns nothing cannot be undone from the prompt — fine for a
  selection, not for a delete.
- Actions run first, in order, each awaited; the writes land after. A `run`
  that throws stops the rest and its message is shown.

### What depends on the open file: a value, or a getter

The bind is made once; the file, and the edit, change all day. So everything
that depends on them takes **the value or a function that gives it**:

| Option | Read |
| --- | --- |
| `actions`, `signals`, `tools` | at every ask, once, before the first pass |
| a param's `options` (an action's or a tool's) | as each request is built, and again when the arguments are fitted |
| a signal's or a tool's `cost` | as each request is built |
| `scene`, `editMap`, a signal's `state` | fresh at every pass, as before |

```ts
agent: {
  actions: () => (editor.open ? verbs : []),
  tools: () => (editor.open?.kind === 'video' ? [look] : []),
  signals: () => index.signals(),                       // the open file's menu
  // inside a verb: params: { sample: { type: 'string', options: () => editor.sampleIds() } }
}
```

A plain array or string works as it always did. Never call
`MoveAgentStore.configure()` again to refresh any of this.

### The edges of a request

```ts
agent: {
  onRequest: {
    begin: (prompt) => history.openGroup(prompt),       // before anything is read or sent; awaited
    end: ({ changed, acted, skipped, cancelled, error }) => history.closeGroup(),
  },
}
```

`end` runs once for every `begin`, however the ask ended: landed, nothing to
do, failed (`error` carries the note the user read) or let go (`cancelled`).
`checkpoint` is not this: it runs only before an answer *with actions* lands
— the host's save point — and a failure there lands nothing.

### Pictures in the prompt, and the Shift tap

```ts
agent: {
  attachments: true,                                    // drop, paste, or the prompt's + button
  onShiftTap: () => showSettingsFor(currentVerb),       // Shift pressed and released alone
}
// a verb gets the files: run: (params, { attachments }) => edit(params.prompt, attachments)
```

The agent reads only the pictures' names and order (`request.attachments`);
the files go to the verbs it calls, as their second argument. They stay in
the prompt for the next ask until removed, and leave when it closes. A
Shift typed as part of a capital never counts as a tap; on the Move, where
Shift never arrives alone, Shift + wheel press is the tap. While the prompt is
open it holds the Back key, so Back — hardware, chip or Escape — closes it.

An undo that cannot run should throw a short sentence ("The sample was
changed by hand since."). The prompt shows the first one — `Could not undo:
…` — and logs the rest with `console.warn`; "Some of it could not be undone."
is what is left when the failure has no words.

The agent plans the whole reply from one look at the scene; it does not see
the result between steps. So give it verbs that **finish a job in one step**
— `trim`, not split-then-delete-the-new-half, whose id it cannot know. Leave
out verbs with no way back (export, delete project) or confirm inside `run`.

## Seeing and hearing: signals, the edit map, and looking

An app that holds media — video, audio — has asks the scene cannot answer:
"cut where the singer comes in", "keep the beach shots". The host gives the
agent senses, in two halves, and the kit does the rest.

```ts
agent: {
  // What is IN a source, in SOURCE seconds. Computed only when the agent asks.
  signals: [{
    id: 'words', label: 'Words', hint: 'The transcript, word by word. For anything said or sung.',
    cost: 'about 20 s for this file',
    state: () => index.stateOf('words'),            // ready · missing · computing · unavailable
    read: (ranges, signal) => index.read('words', ranges, signal),   // → [{ id: 'word:212', type: 'word', source, t0, t1, label }]
  }],
  // Where the pieces of those sources sit on the timeline NOW. Read at every pass.
  editMap: () => clips.map((c) => ({ source: c.file, srcIn: c.in, srcOut: c.out, at: c.start })),
  // The host's own eyes and ears, for what no signal can answer.
  tools: [{
    id: 'look', label: 'Look at the frames', kind: 'perceive',
    progress: 'Looking at the frames…',                                   // the step while it runs
    done: (params, result) => `Looked at ${result.entries?.length ?? 0} frames`,   // the step once it has
    hint: 'A contact sheet of a timeline range. Only to check or refine a boundary.',
    params: { from: { type: 'number' }, to: { type: 'number' } },
    run: async ({ from, to }, signal) => ({ text: 'Six frames…', images: [{ name: 'sheet.jpg', dataUrl }], entries: frames }),
  }],
  // Verbs take a boundary, never a time.
  actions: [{
    id: 'trim_to', label: 'Trim to', params: { at: { type: 'boundary' } },
    run: ({ at }) => editor.trimTo(at.source, at.sourceTime),        // at: { entry, edge, of, source, sourceTime, time? }
  }],
  checkpoint: () => project.save(),                 // once, before an answer with actions lands
}
```

- **Index the source, never the edit.** Entries are in source seconds with
  stable ids (`shot:14`, `word:212`, `bar:17`, `vocal_in:2`), so no cut can
  make them wrong. The kit multiplies them by the edit map at every read: an
  entry the edit removed is absent, one a cut runs through is marked
  `partial`, one the edit plays twice appears twice. Nothing is re-indexed.
- **Index nothing until asked.** The agent always sees the *menu* — each
  signal's hint, state and cost — and picks the cheapest route. `read` is
  called only when it asks, with the source ranges the request is about
  (`undefined` for a `whole` signal, or with no edit map). Cache per source.
- **Boundaries, not times.** No model is frame-accurate; signal tools are. The
  agent names `{ entry, edge }` and `run` gets the entry's exact `sourceTime`,
  plus `time` on the timeline when the edit holds that moment, and `of` — the
  entry itself, with its `type` and `label`, so a verb that snaps a bar but
  not a frame reads `at.of.type` and never parses an id. An entry the
  request never saw is never guessed: the action is skipped and the note says
  so. Entries listed under `scene.entries` are known from the start.
- **A few passes, one change.** With signals or tools, a reply may be calls;
  the kit runs them at once, shows each as a step under the field — a tool's
  `progress` while it runs, its `done` once it has (a string, or a function of
  the arguments and the result: "Looked at 12 frames"); `label` stays the
  name the model reads, and the step's text when neither is given. The kit's
  own read says how many entries it gave: "Read the shots — 14" — and asks
  again — three passes and 120 seconds at most (`maxPasses`). Nothing lands
  until the answer, so it is still one undo, and Esc mid-way leaves nothing.
- Images are JPEG or PNG data URLs, 8 a pass, 600 KB each; the kit leaves out
  the rest and tells the agent. A bridge too old for passes gets none of
  this, and the ask is the single reply it always was.

`projectEntries`, `timelineToSource`, `formatEntries` and `resolveBoundary`
are exported for a host that wants the same maths on its own side.

## How a reply lands

- **Numbers glide.** A value the agent sets arrives over `MOVE_AGENT_GLIDE_MS`
  (420 ms, easing out), through the values between, on screen and on the
  Move; an undo glides back. Switches, options, colours and text land at
  once. A value a hand moves under the glide is left alone.
- **A plain success says "Done".** The bridge asks the model to leave the
  message empty when it simply did what was asked; the prompt then shows one
  word with a mark that draws itself, and the undo. A sentence appears only
  when there is something to know — it could not, it did less or other, it
  had to choose. An error is the sentence in red.
- **Steps show only while it works** ("Reading the words…", "Looking at the
  frames…"); they leave with the reply. A failed step stays, marked.

## Map — where everything lives

Three repos share the agent. For a session picking this up cold:

| Piece | Where |
|---|---|
| The store side: describe controls, fit and land writes (glide), actions and their undo, the multi-pass loop, the capability handshake, `read_signal` | tweakers `src/move-agent.ts` |
| Source-time entries, the edit map, projection, boundary resolution, the line format | tweakers `src/move-agent-perception.ts` |
| The prompt UI (field, steps, Done, undo) and the held-wheel / wheel-click wiring | tweakers `src/components/MovePanel.tsx` (`MoveAgentPrompt`), styles `.tweakers-move-agent*` in `src/styles/theme.css` |
| The bind: `moveKitOptions({ agent })` → `MoveAgentStore.configure` | tweakers `src/move-kit.ts` |
| Tests | tweakers `test/move-agent*.test.ts` (unit, fake transport — no model calls) |
| The demo's pretend media host | tweakers `demo/main.tsx` (Shift+Enter stands in for the held wheel) |
| The bridge: the held wheel → `move-tweakers:jog-hold`; `POST /agent`, `GET /agent/capabilities`; one bare `claude -p` turn per pass; image staging; the system prompt | move `kit/move-tweakers.js`, `app/server.mjs`, `app/agent.mjs`; wire in `PROTOCOL.md`; tests `test/agent.test.mjs` with `test/fixtures/fake-claude.mjs` |
| A host's integration (the reference one) | primecut `web/src/agent/*` (index, scene, editMap, signals, look, actions, brief), `web/src/hooks/useAgentEditor.ts`, bound in `web/src/bridge/kit.ts` |
| A host's media index (lazy signals, proxy, contact sheet) | primecut `server/src/perception/*`, routes in `server/src/routes/mediaIndex.ts`, types in `shared/mediaIndex.ts`, python workers in `server/python/` |
| The design and its research; the contract the three builds share | tweakers `docs/research/agent-perception.md`, `agent-perception-contract.md` |
| The integration checklist (the agent pass) | tweakers `skills/tweakers-integration/SKILL.md` |

## How to extend it

- **A new signal in a host** (say `sections`): one module in `server/src/perception/` that returns entries with stable ids in source time; register it in `signals.ts`; the web adapter (`web/src/agent/signals.ts`) builds the kit signal from the menu, so nothing else changes. Say in `hint` what questions it answers, in `cost` how long it takes.
- **A new verb in a host**: one entry in `actions` — id, label, hint, typed params (`boundary` for a place), a `run` that finishes the job in one step and returns its undo. Prefer verbs a user says aloud; leave out what has no way back.
- **A new perception tool**: a `MoveAgentTool` with `kind: 'perceive'`, a `progress` and a `done` text, returning `text`, `images` (JPEG/PNG data URLs, ≤ 8 a pass, ≤ 600 KB each) and `entries` the model may then name as boundaries.
- **A new kind of value the agent should see**: extend `describeAgentControls` (and `fit`) in `src/move-agent.ts`; it builds on `collectGenes` from preset exploration.
- **Changing what the model is told**: the system prompt lives in move `app/agent.mjs`. Keep it reasoning guidance, not rules in capitals; test with real asks on a private bridge.
- **Changing feel** (glide, Done, steps): state the feel goal in the commit, and never rewrite a test to match a number you changed.

## Testing it

Unit tests never call the model. For a real run: a private bridge
(`PORT=7799 MOVE_HOST=127.0.0.1 MOVE_ENGINE=local node app/server.mjs` in
the move repo), the host app pointed at it (`?bridge=http://localhost:7799`,
or the app's own way), and an automated browser — the kit refuses the live
bridge from one on purpose. Every real ask spends the subscription; keep a
run to a handful. Never restart the live bridge (launchd, port 7787) during
a build; it drops every open app's link until its tab reloads. Test media for
Primecut lives in `~/Downloads/primecut-agent-tests` (a 36 s file with three
shots, two spoken lines and three silences; a song; a real clip).

## Where the model runs

By default the ask goes to the Move bridge, `POST /agent` (move repo,
`app/agent.mjs`). The bridge asks through the Claude Code on the same machine
— one bare turn per pass: no tools, no settings, no saved session (a pass
that carries frames may read those files, and nothing else) — so it runs on the
Claude subscription that is logged in there. No API key exists anywhere, in a
page or in the bridge. The route answers only pages on the local machine.
`MOVE_AGENT_MODEL` and `MOVE_AGENT_EFFORT` tune it; the defaults are `opus`
at `low` effort, a reply in about four seconds.
