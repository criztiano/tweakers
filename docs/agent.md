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
covered; disabled controls are left out. Labels and hints are what the agent
reasons from, so a well-named panel is a well-driven one.

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

The agent plans the whole reply from one look at the scene; it does not see
the result between steps. So give it verbs that **finish a job in one step**
— `trim`, not split-then-delete-the-new-half, whose id it cannot know. Leave
out verbs with no way back (export, delete project) or confirm inside `run`.

## Where the model runs

By default the ask goes to the Move bridge, `POST /agent` (move repo,
`app/agent.mjs`). The bridge asks through the Claude Code on the same machine
— one bare turn: no tools, no settings, no saved session — so it runs on the
Claude subscription that is logged in there. No API key exists anywhere, in a
page or in the bridge. The route answers only pages on the local machine.
`MOVE_AGENT_MODEL` and `MOVE_AGENT_EFFORT` tune it; the defaults are `opus`
at `low` effort, a reply in about four seconds.
