# AGENTS.md — tweakers

Rules for any agent that adds a control, builds a panel, or integrates an app
with the Move. These are binding. Where a rule and your judgement disagree,
the rule wins; if a rule blocks the work, stop and ask Cri rather than route
around it.

Read first, before designing any layout or writing any code:
`skills/tweakers-integration/SKILL.md`, then `docs/design-language.md`,
`docs/controls.md`, `docs/integration.md`. The Move wire contract lives in the
move repo's `PROTOCOL.md` — read it too when your change crosses the wire.

The example app (`example/src/Library.tsx`) is the live dictionary. Open it
before you invent anything: a face that is not in that page is a face nobody
can find.

## 1. Use the parts that exist

- **Never create a custom component when a library entry fits.** Big slots are
  `MOVE_SLOT_LIBRARY`, small slots are `MOVE_PAD_LIBRARY`. Inspect both before
  you write a line of UI.
- **A new face goes in the shared slot library, never inline in `MovePanel`.**
  Extend `MoveSlotKind` and `MOVE_SLOT_LIBRARY` together. Drawing belongs in
  the library; gestures stay in the panel. Nothing gets a bespoke body defined
  next to the panel that renders it.
- **Never move a part from its canonical position, and never resize one, unless
  Cri asks for it in that request.** The header, its page tabs, the volume
  pill, the track row, the pad rows and the preset toolbar each have one place.
  "It looked better there" is not a reason; neither is "the editor needed the
  room".
- **Convert, do not accumulate.** A control that still renders as a loose
  toggle, button, checkbox or ad-hoc widget is legacy. When you touch a panel,
  convert what you touch to a big slot (`moveSlot`) or a small slot
  (`movePads`). Do not add new controls in the old shapes.
- **A function that lives on a hardware button claims no slot.** Play, Record,
  Undo, Delete, the arrows: attach them through `MoveFunctions`. Do not spend
  a dial or a pad on something the hardware already has a labelled key for.
- **Public API needs a home.** A new export ships with a Library entry, a line
  in `docs/controls.md`, and a real caller. A prop that only its own test uses
  is dead on arrival — delete it instead.

## 2. Layout is a contract, not a preference

- **Eight dial columns, four tracks, three pad rows.** `buildMovePages`,
  `dialSpan`, `visibleColumns` and `movePadRows` decide the geometry. App CSS
  does not.
- **No magic geometry.** Never invent a column count, a minimum, or a
  truncation width to make a layout look right. If the grid fights you, the
  layout is wrong.
- **Holes are illegal; placeholders are the fix.** A column is either occupied
  or not rendered. When you need a column held open — for a mode this tab is
  not in — declare it with `moveBlank`. Never leave a gap, a dead column, or a
  region that draws nothing.
- **The three rows are a default, not a cage.** Switches sit on the top row,
  value chips under them, action pads below. That is where a reader expects
  them — but a slot may name its own row when the page reads better for it,
  and it keeps its behaviour wherever it sits. Move one on purpose, not by
  accident.
- **The reserved row belongs to the app, and must be named.** An app that
  claims it says what those pads do in one short phrase
  (`MoveSurfaceStore.setPadRows(rows, pads, 'jump to a part of the sample')`).
  The panel draws the whole claimed area as a single slot carrying that
  sentence, because eight pads only the app understands are one instrument,
  not eight controls. A claimed row with no phrase is a bug.
- **Slot count must not change under a moving hand.** When a panel swaps its
  siblings — a list selection changing which controls show, a tab group, a
  mode switch — every sibling shows the column count of the largest one. The
  layout must not shift while the user is turning a knob or holding a pad.
- **Hidden columns keep their hardware index.** Never repack, renumber, or
  reorder visible columns to close a gap. Column *i* on screen is knob *i* in
  the hand, always.
- **A small pad sits in the column of the dial it belongs to.** That is what
  `movePads` is for.
- **Build the layout, then look at it.** `buildMovePages` now warns on every
  silent decision (a dropped panel, an ignored column, a relocated pad). A
  console with Move layout warnings in it means your layout is wrong, not
  noisy.

## 3. Lights say what is true

- **An attached action is a lit control.** If a button carries an action in the
  current view, that button is lit in that view. If it carries nothing, it is
  dark. A lit key promises "pressing this does something right now" — never
  leave a live action on a dark key, and never light a key that does nothing.
- **When a view goes partly inert, say so with `lights`.** Darken what the view
  cannot act on. Do not leave the whole set lit and hope.
- **The volume dial always names itself.** Whenever your app claims the volume
  knob, register the readout with `MoveVolumeDisplay` — a label and the value
  the knob is editing (a playhead time, a zoom, a gain). The panel shows it in
  the header pill and the kit sends it to the Move's screen. A claimed volume
  knob with no readout is a bug.
- **Colour carries meaning, never decoration.** On the pad grid a control is
  white; colour says exactly one of three things — a switch is on (lime,
  `--move-lime`), a modulation slot drives this control (its hue), or a
  knob's tap opens something. Track colours identify pages. Everything else
  is state, and state is never signalled by colour alone. A new meaning for
  colour is Cri's call, not a patch.
- **Pad lighting belongs to the surface.** The device paints toggle, value and
  action pads itself. Do not try to recolour kit rows from the app; the only
  app-driven colour on the grid is a modulation assignment.

## 4. The modulators row is for modulators

The sixteen step buttons are the modulation row. They belong to
`ModulationStore` and its slot colours.

- Do not claim the step row for app features, transport, presets, or
  navigation.
- The one sanctioned exception already in the kit is the waveform's loop bar,
  and it yields: it takes only the steps no modulation slot has claimed.
- Never give modulation and an app sequencer simultaneous ownership of a step.
- Modulator settings pages come from `modulation.getSettingsLayout()`. Do not
  re-derive that layout anywhere else.

## 5. Feel is a feature

- **Do not retune a feel constant without a stated feel goal in the commit
  message.** Scrub rates, glide durations, knob gain, acceleration curves and
  timing thresholds were set against a felt result on real hardware.
- **Never rewrite a test to match a number you changed.** If a test fails
  because you retuned a constant, the change needs a reason first.
- **Never delete a working feature inside a fix.** One commit, one intent.

## 6. Boundaries

- Import from the package root only. Never reach through `src/`, never patch
  `dist`, never keep a second copy of the store.
- Reusable behaviour goes upstream into this repo. It never lives in an app's
  vendor directory or as pasted panel code.
- A change that crosses the wire (a new action, a new field, a new claim)
  updates the move repo's `PROTOCOL.md` in the same change.
- Tokens live in `src/styles/theme.css`. No raw hex, no hand-rolled custom
  properties in a component.

## 7. Commits

One intent per commit. `type(scope): summary` in the imperative, a body
explaining *why* when the reason is not obvious from the diff, and the
`Co-Authored-By` trailer. Author as `criztiano`. Do not mix a fix, a refactor
and a retune in one commit — that is how a deleted feature ships unnoticed.

## 8. Proof

Run `npx vitest run` and `npx tsc --noEmit` before you report done. State
plainly what you ran and what you did not. Never imply a check passed that you
did not run.
