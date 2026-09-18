# Control dictionary

## Move dial slots (React)

`MOVE_SLOT_LIBRARY` is the executable dictionary, checked against `MoveSlotKind`.
Slot bodies are presentational fragments, not standalone interactive controls.
Use declarative configs and `MovePanel` in apps: it owns pointer capture, fine
adjustment, modulation, readouts and hardware column alignment — and its own
motion: a page switch zooms the controls through (the leaving page grows to 105%
and fades, the arriving one grows up from 95%, expo in-out over 350 ms, header
still), and the settings room or a modulator's page moves the whole inside the
same way, the ground easing to the room's palette. The panel's height eases from
the old page's to the new one's on the same curve, the page around it moving
along, never jumping when the change commits. The live controls answer the
pointer and the knobs throughout; nothing to wire. To place one live slot
outside the instrument — a card, an inspector, a dictionary — use `MoveSlot`
(below).

| Kind | Choose for | Configuration / body | Hardware space |
| --- | --- | --- | --- |
| `default` | Bounded continuous quantity; signed values use `bipolar` / `origin` | Slider tuple, `slider`, bounded `number`; `MoveSlotDefaultBody` | 1 dial |
| `value` | A value that is the headline, including a substituted value chip | Panel-selected presentation of `MoveSlotDefaultBody` | 1 dial |
| `enum` | A stepped choice | `select.options`, optional `moveSpan: 2` for a wider list; `MoveSlotEnumBody` | 1 dial by default; 2 adjacent dials with `moveSpan: 2`, either knob selects |
| `icon` | A choice recognized by its picture | Select option `icon`; `MoveSlotEnumBody` | 1 dial |
| `curve` | A choice whose value is a shape | Select `preview(option)` sampler; `MoveSlotEnumBody` | 1 dial |
| `toggle` | A switch the page is about | `toggle` config with `moveSlot`; `MoveSlotToggleBody` | 1 dial |
| `toggle-icon` | The same switch as a picture, badged with a check or a ban | `toggle` config with `moveSlot` + `icon` (glyph name or asset URL; optional `onIcon` / `offIcon`); `MoveSlotToggleBody` | 1 dial |
| `metronome` | A click track's switch, drawn as a metronome that swings to the beat while it is on | `toggle` config with `moveSlot` + `moveVisual: { kind: 'metronome', swing }` — `swing()` returns the arm's place now, -1..+1, or `null` for upright; the app keeps time. The label is the caption ("120.0 BPM"); `MoveSlotMetronomeBody` | 1 dial; tap toggles, as any switch |
| `blank` | A column held open for a mode this page is not in | Any control with `moveBlank` | 1 dial |
| `xy` | Two axes that form one gesture | `xy`; `MoveSlotXYBody` | Column knob X, touched + volume Y |
| `range` | Low/high bounds of one interval | `range`; `MoveSlotRangeBody` | Column knob low, touched + volume high |
| `filter` | Cutoff and resonance with a response display | `filter`; `MoveSlotFilterBody` | 2 adjacent dials |
| `offset` | A signed nudge away from where something already sits — a hit off its step, a clip off its bar line | A slider with `moveVisual: { kind: 'offset', origin }` — `origin` (0..1) is where it sits at no offset, and the dial's own range is the whole room, so a full turn either way carries it half the track; `MoveSlotOffsetBody` | 1 dial |
| `trim-span` | A take's start and end — one line, a flag per edge | A slider with `moveVisual: { kind: 'trim', edge: 'start' }` in the column before one with `edge: 'end'`; `MoveSlotTrimSpanBody` | 2 adjacent dials, each knob one edge; a drag reads the whole line. Both the page's own dials, or both latched chips — one chip alone keeps its single face |
| `gate` | A gate's threshold, look-ahead and release — the gate live around the playhead | Three sliders side by side with `moveVisual: { kind: 'gate', role }` — `threshold`, `lookahead`, `release`, in that order; `MoveSlotGateBody`. Feed the grid with `MoveGateMeter.attach(panelId, read)`: `read()` returns `{ levels, open?, ahead? }` — levels on the threshold dial's own 0..1 scale, the playhead at the middle step | 3 adjacent dials, each turning from where it is, like any dial. All three the page's own dials, or all three latched chips |
| `vector` | A place in three axes — across, up, and a real depth into the picture | Three sliders side by side with `moveVisual: { kind: 'axis', axis }` — `x`, `y`, `z`, in that order (add `down: true` on the y axis for canvas coordinates, where y grows downward); `MoveSlotVectorBody`. Extent comes from each slider's own range, so an axis alone keeps the ordinary face | 3 adjacent dials, each knob one axis, each turning from where it is, like any dial. The mark stands on a ruled floor — across it for x, back into it and smaller for z, up off its shadow for y. All three the page's own dials, or all three latched chips; no volume-knob second hand, since every axis already has a knob |
| `multiband` | A multiband cleaner — its amount, speed and per-band strengths, live per band | Sliders with `moveVisual: { kind: 'multiband', role }`: an `amount` (with an optional `icon`), a `speed` beside it, then one or more `band` dials — the curve draws each band at its own value — each band naming its place from the top of the spectrum down (`band: 0` is the highest). Band chips in the band columns join the curve. `MoveSlotMultibandBody`; feed it with `MoveMultibandMeter.attach(panelId, read)`: `read()` returns `{ levels, open? }`, one entry per band in spectrum order | A dial per column; each part turns from where it is, like any dial — the band grid takes the band under the cursor, knob or pad. A band chip latched into a band column takes that column's knob and name |
| `channel` | A mixer channel's level, with the channel's icon and tone | A slider with `moveVisual: { kind: 'channel', icon?, tone? }` — `tone` a Move hue (`orange`, `yellow`, `pink`, …); channel dials side by side draw as one mixer. `MoveSlotChannelBody` | A dial per channel; its fader turns from where it is, like any dial. A chip standing in a column ends the mixer there |
| `color` | One colour the page is about | `color` config; `MoveSlotColorBody` | 1 dial; hue on the knob, luminosity on volume, tap opens the editor. On screen: drag across for hue, up and down for luminosity |
| `ramp` | A colour gradient of 2–4 stops, editable in place | `gradient` config; `MoveSlotRampBody` | 1 dial; tap opens the editor — the track buttons become the stops |
| `balance` | A 0..1 mix between two sibling colour params | `balance` config (`{ type: 'balance', a, b }`); `MoveSlotRampBody` | 1 dial, a plain normalized value on the wire |

### The cursor

Everything the Move's hand can do, the cursor can do too. The panel owns
these gestures; an app wires nothing.

- **A value slot turns, never jumps.** A plain dial, a face's bar or gauge
  (gate, multiband, mixer), a trim edge, an envelope stage, a balance: the
  drag turns it from where it is — right or up raises it, left or down
  lowers it, one slot's width of travel for the whole range. A press alone
  changes nothing. Shift mid-drag is fine (0.1×).
- **An option slot steps.** A click moves it on to the next option, round to
  the first after the last; a drag steps through them, right or down being
  the next. No part of the slot means a particular option.
- **A list walks up and down.** The pad list's dial follows the list's own
  axis: down is the next row.
- **A colour takes both hands.** Across turns the hue (the knob), up and down
  the luminosity (the volume knob) — up is lighter. A still click opens the
  editor.
- **Shift+click is Shift+tap.** On a dial it puts the declared default back
  (`TweakStore.getDefault`); on a colour it restores the first colour.
- **A cycling dial takes a click as its tap** — the curve modulator's clip
  moves to its next shape; its point follows the cursor once it travels.
- **Menu** sits in the window's top-right corner: a click is a press (the
  preset navigator, or the palettes while the colour editor is up), a held
  press the hold (exploration), Shift+click the Shift layer (save).
- **Undo, Delete and Copy** are the computer's keys: ⌘Z / Ctrl+Z (⇧ for the
  Shift layer), Backspace or Delete, ⌘C / Ctrl+C. A key runs only what its
  button holds, never while a text field has the keys, and ⌘C yields to a
  text selection.

XY, range, filter, transfer, needle and ramp slots keep their picture's own
gesture — the point, handle or stop goes where the cursor puts it.

A select with `moveSpan: 2` uses the same list face and gestures across two
adjacent columns. Both knobs select the same value; later controls and their
pads retain their physical column indices. `moveTabs` takes precedence and
keeps the select on the pad row.

The panel's standard surface is the fixed eight-column cluster: parameters past
the eight dials become value chips on the pad row per the layout rules, and a
two-column dial that would start past column 8 is dropped with a layout
warning. `MovePanel`'s `scroll` strip is strictly opt-in — never enable it by
default in an integration; it is used only on Cri's direct request for that app.

`MoveSlotGlyph`, `MoveSlotReadout`, and `MoveSlotShape` provide the shared visual
parts. The XY face also accepts a shape path for the modulation curve preview.
The parent supplies normalized screen coordinates (Y down), grid division count,
and the formatted readout. It retains every gesture and store subscription.

### A slot on its own: `MoveSlot`

`MoveSlot` is one big slot, live, anywhere on the page: the face a control
wears in the instrument, answering the pointer and the keyboard the way it
does there. The drag rules are the instrument's own — `MovePanel` and
`MoveSlot` both call `move-slot-core` — so a face feels the same wherever it
is placed.

```tsx
<MoveSlot panel="Move kit" path="offset" />
<MoveSlot panel="Move kit" path="glide" valueFirst />
<MoveSlot panel="Instruments" path={['threshold', 'lookahead', 'release']} />
```

- `panel` names the registered panel, by id or name; the slot waits for a
  panel that registers after it.
- `path` is the control. Several paths draw an instrument made of several
  dials when they read as one — a take (`trim` start, end), a gate, a
  multiband cleaner (amount, speed, bands), a mixer's channels — each keeping
  its own drag zone. Paths that are not one instrument draw nothing and warn.
- `valueFirst` puts the value in the headline, the face a chip wears when a
  dial borrows it.

It reads and writes the shared store, so a slot and an instrument holding the
same control stay one control: turn either and both move. A colour or ramp
slot's tap opens the colour editor wherever the page mounts one. It claims no
hardware — the Move keeps following the `MovePanel` on screen; a page that
registers panels only for its slots names the one the Move mirrors with
`moveKitOptions({ panels })`. The faces that live only on a modulator's page
(`scope`, `env`) belong to that page: open it with
`ModulationStore.openSettings(index)`.

### Small slots and companion components

`MOVE_PAD_LIBRARY` is the small-slot dictionary, checked against `MovePadKind`.
A small slot is one pad — except `tabs`, the pad grid's first multi-slot
control, `band`, which runs two pads down one column, and `fade` and `loop`,
which run two pads along one row.

| Kind | Choose for | Configuration / body | Hardware space |
| --- | --- | --- | --- |
| `toggle` | A switch under its dial | `toggle` with a `movePads` column; `MovePadToggleBody` | 1 pad |
| `hold` | A switch that is on only while held — a solo, a preview | `toggle` with `moveHold` and a `movePads` column; `MovePadToggleBody` | 1 pad |
| `icon` | A switch a picture says better than a name — a solo's headphones | `toggle` with `icon` (a `LUCIDE_ICONS` name or an asset URL) and a `movePads` column, `moveHold` optional; `MovePadIconBody` | 1 pad; the name stays as its accessible label |
| `value` | A bounded number the dial above can borrow | Bounded `slider` / `number`; `MovePadValueBody` | 1 pad |
| `action` | A button the page wants on the surface | `action` with a `movePads` column; `MovePadActionBody` | 1 pad |
| `icon-label` | A button a picture helps find — Export's download, Clear's cross | `action` with `icon` (a `LUCIDE_ICONS` name or an asset URL) and a `movePads` column; `MovePadIconLabelBody` | 1 pad; the name gives way before the picture |
| `app` | A cell the app paints — a track, a slice, a step | `MoveSurfaceStore`; `MovePadAppBody` | 1 pad |
| `tabs` | The mode a page is in, reachable without turning anything | `select` with `moveTabs` (`true`, or `'named'` for the name pad); `MovePadTabsBody` | 2–8 adjacent pads, switch row |
| `band` | A high cut and a low cut that shape one band — a filter's two ends | Two bounded chips stacked in one `movePads` column (e.g. one sunk with `moveActionRow`), named in `moveBands: [{ high, low }]`; `MovePadBandBody` | 2 pads, one column; each half is its own chip — tap latches, hold peeks. A cut off its open end (high below max, low above min) fills yellow |
| `fade` | A fade in and a fade out — how the sound comes in and dies away | Two bounded chips side by side in one row, the fade in first, named in `moveEdges: [{ kind: 'fade', start, end }]`; `MovePadFadeBody` | 2 pads, one row; on the Move each half is its own chip — tap latches, hold peeks; on screen the cursor drags the nearest handle. No names or numbers: each fade is a ramp from its own end over half the line, a needle at zero, blue once moved |
| `loop` | A loop's start and end | Two bounded chips side by side in one row, the start first, named in `moveEdges: [{ kind: 'loop', start, end }]`; `MovePadLoopBody` | 2 pads, one row; on the Move each half is its own chip — tap latches, hold peeks; on screen the cursor drags the nearest handle. No names or numbers: a marker per edge, the outside shaded; a marker is orange at its own end and red once moved |
| `color` | A single colour where colour is not the page's big control | `color` config with a `movePads` column — or nothing at all when a `balance` references it (the kit seats those itself); `MovePadColorBody` | 1 pad, top or value row; lit white like any chip (its colour is the screen's swatch); a chip like `value` — tap latches, hold peeks |

A `moveTabs` select stops competing for a dial: it is a pad strip and nothing
else. It lands as one piece or not at all — the builder reports `tabs-oversized`
when the strip is wider than the 8-pad row and `tabs-no-room` when no run that
long is left, rather than shortening a mode picker. `movePads` names the column
its run **starts** in.

### Color: the integrated gradient editor and the balance pattern

A `gradient` of 2–4 stops carries the full colour editor in its slot: tap the
ramp (screen) or its knob (hardware) and the four track buttons become the
stops, lit in each stop's colour — select one and the colour dial + volume
dial edit that stop's hue and luminosity exactly as they edit a single
colour; hold a track button and the colour dial slides that stop along the
ramp instead; pads and steps set the selected stop's opacity. The track
buttons return to page duty the moment the editor closes (the settings
room's suppress/restore precedent). Palette locks apply per stop. A gradient
with more than four stops keeps the plain ramp slot and its on-screen drag.

A `color` control given a `movePads` column becomes the **small colour
selector**: a swatch chip on the value row for pages where colour is not the
big control. It follows the small-slot grammar every value chip follows —
the same code path, on screen and on the hardware, so the two can never
drift:

- **Tap** latches the chip into the dial above: that column's knob (and the
  on-screen slot) now edits the colour, until the chip is tapped again.
- **Hold** does the same for as long as the pad is down — a peek; release
  hands the knob back to its dial.

While a colour chip holds the knob, it is edited exactly as a big-slot
colour is: hue on the knob, luminosity on the volume knob while that knob is
touched, and the full editor behind the big slot's own gesture — a still tap
on the knob (hardware) or on the slot (screen); Shift+tap restores its first
colour. A tap on the pad itself never opens the editor. The latch outlives
the editor.

A colour chip is a chip on whichever row it sits: the slot's kind decides
the gesture, never its row. A balance's first colour rides the top row —
the same cell a `moveTopRow` chip takes — and still latches and peeks; it
does not toggle. A column holding both of a
balance's colours has one knob and one owner: latching one releases the
other, and holding one peeks over the one latched.

The **balance pattern** expresses "this effect's colour is a mix of two":
two small colour selectors plus one big slot blending between them. Declaring
the three params is the whole job — the lego principle:

```tsx
useTweakers('Noise', {
  colorA: { type: 'color', default: '#632ad5' },
  colorB: { type: 'color', default: '#fccff7' },
  balance: { type: 'balance', a: 'colorA', b: 'colorB', default: 0.5 },
});
```

The kit seats the two referenced colours ITSELF: stacked in the balance's
own column — `a` the chip up top, `b` the chip under it, the stacked column
`moveTopRow` builds by hand — so the blend and its two ends read as one column
group, on screen and on the hardware alike. They seat first: a switch or a
lifted chip named into that column moves along its row, said out loud.
No `movePads` for them (a hand-named column on one is ignored with a
`balance-color-placed` warning, the pads-never-mirror-dials rule's sibling).
Every colour chip wears its live store value as the swatch on screen. On
the device its pad lights WHITE, like every occupied small slot — the
small-slot grammar has no per-type exceptions, so the colour is shown on the
screen, never on the pad.

`balance` resolves to a plain 0..1 number (0 all `a`, 1 all `b`) — on the
wire it is an ordinary dial, so modulation, presets and hardware sync need
nothing new — while its slot draws the two referenced colours' ramp with the
mix position as the tick.

What stays a hand decision, and why: a STANDALONE colour is a dial by
default and becomes a chip only when its `movePads` column says so — whether
colour is the page's big control is page design, not something the config
can know; a toggle's column (which dial it qualifies) and a hand-placed
action's seat are the app's vocabulary for the same reason. Everything the
config can answer, the kit answers.

| Component / API | Purpose |
| --- | --- |
| `moveSlotGroups` option | Draw big slots that read as one thing (a gate's threshold, look-ahead, release) as one container, with a short divider between them and, given `{ label, slots }`, a small header with the group's name; the columns keep their places |
| `moveValueRow` option | Seat actions on the value row in their `movePads` column, so one column stacks two buttons |
| `moveBands` option | Draw a high cut chip and a low cut chip stacked in one column as one band on a small screen; a pair not stacked reports `band-apart` and stays two chips |
| `moveEdges` option | Draw a start chip and the end chip right after it in one row as one line — `kind: 'fade'` or `'loop'`; a pair not side by side reports `edges-apart` and stays two chips |
| `moveActionRow` option | Seat value chips on the action row in their `movePads` column, so one column carries a switch and two chips |
| `movePads` option | Place toggles, numeric value chips, explicitly mapped actions and tabs strips under their related dial columns |
| `MoveActionButton` / `MoveFunctions` | Hardware-named action pills and one shared action registry |
| `MoveActionDeck` | A view's whole surface when it has nothing to set yet — a start screen, a "what now" page: up to four buttons in the page's middle, one per chip key (`sample`, `capture`, `loop`, `mute`), in the chip voice (`variant: 'highlight'` for the pale key look, an `icon` of its own or the key's glyph) and attached to the key through `MoveFunctions`, so a click and a press run one handler and both flash the button. A disabled action leaves its key dark; the deck is the chip, so its attachments show no header chip. One of three: a view shows the deck, the list screen, or a panel — never two. `normalizeDeck` is the rule (order kept, first action per key wins, a fifth is dropped, every drop warned). |
| `MoveViewStage` / `MoveViews` | Views and the changes between them. Wrap what the app renders for where it is now in one `MoveViewStage`; change view with `MoveViews.go(update, motion)` — `update` is the app's own setState or dispatch, `motion` names the change: `forward` / `back` (along the way, and out again), `open` / `close` (into a workspace, and out), `swap` (a sibling). Every change plays one zoom-through: the leaving view grows to 105% as it fades out, the arriving view grows from 95% as it fades in, both on exact expo in-out over a second, crossing additively so the light never dips (`MOVE_VIEW_PRESENTATION`); the control panel moves as its own layer on its 350 ms zoom-through — in, out, or one panel into another — and holds still when the same panel stands on both sides. The change is the browser's view transition: the new view is live at once (its keys light, its list reaches the Move) while only the pictures move. A change never cuts one that is playing — in the curve's quiet first 384 ms it takes the arriving view's place unseen, later it plays once the first has landed, every change asked for meanwhile joining it. Work that changes view goes through `MoveViews.load(work, { title, detail, arrive, motion, cancelable })`: the view goes inert and every key dark at once (and dark it stays, whatever the view behind attaches meanwhile; the computer's keys reach only Escape, which is Back), a wait (title, an eight-light sweep, the detail) comes up only if the work outlasts `MOVE_VIEW_WAIT.delay` — work that lands while it is still out of sight takes its place unseen, and once in sight it holds until it has arrived plus `MOVE_VIEW_WAIT.hold` — and stands on the Move's screen too; `arrive(value)` makes the change, a failure hands the view back and rejects, `cancelable` lights Back to abandon it, `say(title, detail)` re-words it as the work moves on, and the newest `load` or `go` supersedes a running wait (its promise resolves `undefined`). Choreography is `moveViewChoreography`; reduced motion keeps a 180 ms crossfade and no zoom. |
| `MoveFunctionChips` | The attached functions as header chips, for free — but only for `MOVE_CHIP_BUTTONS` (`sample`, `capture`, `mute`, `loop`: the keys whose meaning is the app's to give), and only with a `label` saying what the button does in this app. A chip never wears a hardware name; unlabelled or non-chip-button attachments light the key and nothing else (Play is the time indicator's story). Naming: `sample` is the printed Sampling key — the surface's second confirm, often called "the enter button"; `jog_click` is the wheel pressed, never a chip. Clicking a chip runs the hardware key's handler. Default dress is the slot idiom; `chip: { variant: 'highlight' }` is the pale key look, `chip: { color }` takes a `MOVE_PALETTE` name only. `MovePanel` places the row by its `functionChips` option — `clock` (default, left of the volume readout), `tracks` (after the track labels), `none`. `chip: false` hides one. |
| `MoveWaveform` / `MoveWaveformStore` | Sample display, navigation, loop and scrub state. The look — style (`smooth` / `pixelated` / `striped`), bar width, grid, EQ bands, centre line — is the kit's own **Waveform** page (`MOVE_WAVEFORM_PANEL`, kind `'kit'`), put in the settings room by the first waveform to claim the surface and persisted per machine; the component's look props only seed it. `striped` draws the pixel bars untouched with a gap after each, so the wave is twice as long and nothing is lost. The card itself is the kit's — light display, dark frame, at most 1200×176 — with wheel zoom (a press resets it), a knob scrub from the playhead, the step loop, the clock with the host's play/loop state, and `cuts` that split it into pieces. `asset` (prepared peaks from `buildWaveformLevels` / `waveformAsset`) and `ranges` (the stretches that play) draw a long or trimmed sample without scanning or copying its audio. |
| `useMoveTimeline` / `MoveTimeline` / `MoveTimelineStore` | A timeline of clips that animate values over time, on the Move. `useMoveTimeline(name, config, { id })` defines the clips (dialkit's timeline config: `at`, `duration`, `from`/`to`, `steps`, `props`, `loop`, groups) and returns each clip's `current` values per frame plus the transport and the timeline's `id`. `<MoveTimeline id onRecord? />` floats the waveform's card above the panel (`variant="dock"`, as wide as the slots on show) or sits in the page (`variant="page"`), and puts the timeline on the instrument while mounted: the volume knob scrubs (the waveform's feel), the wheel zooms around the playhead on any turn nothing else takes, its press shows everything; Play and Loop (Shift + Loop lets a loop region go) are its keys, Rec too when `onRecord` says what recording means. The panel's volume corner becomes `MoveTimelineClock` — Play, the time, Loop, Rec, each clickable. On the card: click the ruler to jump, drag it to draw a loop, drag the lanes to scrub, drag a clip / its edges / a sequence's joins to retime it, pinch to zoom. A group of clips is one row, split only where its clips overlap. `moveKitOptions()` claims the knob for it — no bind change. |
| `MoveVolumeDisplay` | Contextual volume-knob readout |
| `MoveNotifications` / `moveNotify` | The app's messages, stacked over the instrument. Mount the component once; call `moveNotify.add({ type, title, description })` from anywhere. `type` is `info`, `success`, `warning` or `error` — the card says the kind in a word and repeats it in the palette's hue, never in hue alone. The stack clears the panel and any display floating over it (curve composer, docked waveform, save input); an app-drawn float opts in with `data-move-float`. |
| `MoveConnectionDot` / `MoveConnection` | Whether the Move is with this app: mount `MoveConnectionDot` once and a 6px dot pins itself 20px off the window's bottom-left corner — emerald while the Move is connected and following this app, red while it is not (no bridge, no Move, or another app holding it); it says the same to a screen reader and on hover. `MoveConnection` is the registry behind it (`getState()` → `{ bridge, device, active }`, `isLive()`, `subscribe`), fed by the kit's `move-tweakers:connection` window event (see the move repo's PROTOCOL.md). No bridge running, nothing said: the Move reads as away. |
| `MOVE_PALETTE` | The Move's colours on screen — the same set the hardware lights, matched by eye against the device's LED palette. `MOVE_TRACK_COLORS` is built from it. Colour on this surface always means something; never decoration. |
| `MoveSurfaceStore` | Mirror app-owned raw pads, step buttons and screen state; `onStep` takes the sixteen steps for the app (presses arrive there, `setSteps` lights them) until the listener detaches |
| `MoveSearchStore` | Search on whichever list has the wheel — a system gesture, the same in every app, nothing to wire. Holding **Capture** opens it on the list in focus (the palette navigator, else the preset navigator, else the app's wheel list); typing on the computer keyboard narrows the rows as the letters land, the wheel (and ↑ ↓) walks what is left, taking a row (jog click, Enter, a click) or Back ends it, and holding Capture again closes it. The device's screen narrows with the wheel list and shows the query as its title. A host reading the wheel itself checks `MoveSearchStore.isOpen()` before taking a turn (the panel consumes the events first, but a listener registered ahead of it must still yield). `moveSearchMatch` / `moveSearchFilter` are the rule: every word of the query, any case, any order. |
| `ListScreen` | Controlled list presentation matching the device display. A row may carry `icon` (an image URL) at its left end — an app's icon, a file kind — pinned like the mark so a centred name stays put; the hardware screen has no room for it and takes the label alone |
| `ModulationStore` | LFO, sample-and-hold, ADSR and curve modulation; settings layouts and assignments |

## General controls and artifacts

These are React exports from `tweakers`. Config syntax is in the README and
`src/store/TweakStore.ts`; an exported component does not imply a Move dial mapping.

| Need | Available controls |
| --- | --- |
| Numeric | `Slider`, `NumberControl`, `RangeSlider` |
| Boolean | `Checkbox`, `Toggle` |
| Choice | `SelectControl`, `SegmentedControl`, `SwatchControl`, `ChipsControl`, `MultiSelectControl` |
| Text and assets | `TextControl`, `FileControl`, `GalleryControl` |
| Color | `ColorControl`, `ColorPickerPanel`, `GradientControl`, `GradientPanel` |
| Coupled axes / filter | `XYPad`, `XYControl`, `FilterControl` |
| Animation and curves | `SpringControl`, `TransitionControl`, `SpringVisualization`, `EasingVisualization`, `CurveComposer`, `CurvePreview` |
| Audio and signal | `WaveformVisualization`, `AnalyserVisualization`, `AnalyserRow`, `AudioLevelMeter` |
| Collections / timeline | `ListControl`, `TweakTimeline` (prototype) |
| Structure | `TweakRoot`, `Folder`, `Module`, `ControlShell`, `ControlRenderer` |
| Commands / panel tools | `ButtonGroup`, `PresetManager`, `ShortcutsMenu` |

A read-only `curve` preview is not the editable `CurveComposer`, and a Move
`curve` slot is a select presentation, not a new config type. Keep these distinct.
Unmapped controls need a general panel or an artifact editor; do not assume they
will appear on hardware. Inspect `buildMovePages` output when designing a page.

## Framework boundaries

MovePanel and its slot library are currently React-only. The general control
set also has `tweakers/solid`, `tweakers/svelte`, and `tweakers/vue` adapters.
Check that adapter's export barrel and renderer before selecting a specialized
control; React exports do not establish parity. Framework-neutral entry points
include `tweakers/store`, `tweakers/timeline`, `tweakers/curve-composer-core`,
`tweakers/modulation-core`, and `tweakers/modulation-store`.

### Checked list action pad

Attach `MovePadListStore` to a normal action in `movePads`. Its small slot
opens a checked `ListScreen` directly above itself. The column dial walks the
rows; Enter (Sampling), jog click or a row click toggles; a second press of the green pulsing pad submits (Capture also works).
Back, Escape, clicking elsewhere, page changes and unmount release the dial.
The underlying dial value is untouched. The wheel and volume keep their app
meaning; this overlay never publishes a hardware screen list.

```tsx
useEffect(() => MovePadListStore.attach(panelId, 'extract', {
  label: 'Parts', submitLabel: 'Extract',
  options: [{ value: 'drums', label: 'Drums' }, { value: 'bass', label: 'Bass' }],
  selected: ['drums'],
  onSubmit: selected => extract(selected),
}), [panelId, extract]);
```

Selections and cursor survive close/reopen for the attachment's lifetime.
`open(panelId, path)` also opens it from an app's browser action. `getView()`
is null when closed; `subscribe()` returns a release callback. Async submission
locks selection and ignores duplicate Capture even if closed and reopened.
A failure stays beside the list for an explicit retry. The expanded display
shares the dial list styling, with no extra submission button: the owning pad becomes the green action.
Reduced-motion mode keeps it steadily green. `activate(panelId, path)` opens
a closed list or submits its current selection; `toggle` retains open/close behavior.
The Library's **Parts** pad demonstrates the same API used by Primecut Extract.

**Single — a picker.** Pass `single: true` for one choice rather than a set (a
shader, a background source). The list opens on the current choice; Sampling,
the jog click, Capture or a second pad press takes the row under the cursor —
it replaces the choice and commits at once, so nothing has to be unticked
first. The closed pad names the choice (`MovePadListStore.choice(panelId, path)`)
instead of its action. The host owns the value: a re-attach with a new
`selected` moves the choice, where a checked list keeps what the user ticked.
`moveKitOptions()` includes this registry as `padList`.

`MovePadListBody` is the shared drawing in `MOVE_PAD_LIBRARY.list`; it uses
`MovePadListView` plus cursor/toggle callbacks. `MoveFunctions.push` keeps
an overlay above app reattachments and restores the latest app handler.

### Stacked actions

An action named in both `movePads` and `moveTopRow` occupies that column’s
top pad row. Another action can use its ordinary bottom action row in the same
column. Both remain momentary actions; neither borrows the dial or toggles a
value. Primecut’s Fix tempo uses this for Double and Half beneath the BPM dial.

### Focused correction panels

`<MovePanel focused panels="Fix tempo" />` keeps the standard slot sizes and hardware indices,
but fits pad rows to occupied columns and shows numeric dial values at rest.
Use it for a focused adjustment with related actions (for example Tempo, Double and Half);
the default panel retains its existing minimum pad width.
