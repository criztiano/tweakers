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

`context` is the one thing worth adding: a sentence on what the app is. A host
with its own model or server passes `agent: { ask }` instead, a function from
`MoveAgentRequest` to `MoveAgentReply`.

## Where the model runs

By default the ask goes to the Move bridge, `POST /agent` (move repo,
`app/agent.mjs`). The bridge holds the key — start it with
`ANTHROPIC_API_KEY` set — so no key is ever in a page. The route answers only
pages on the local machine. `MOVE_AGENT_MODEL` and `MOVE_AGENT_EFFORT` tune
it; the defaults are `claude-opus-5` at `low` effort, for a reply in seconds.
