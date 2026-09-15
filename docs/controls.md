# Control dictionary

## Move dial slots (React)

`MOVE_SLOT_LIBRARY` is the executable dictionary, checked against `MoveSlotKind`.
Slot bodies are presentational fragments, not standalone interactive controls.
Use declarative configs and `MovePanel` in apps: it owns pointer capture, fine
adjustment, modulation, readouts and hardware column alignment.

| Kind | Choose for | Configuration / body | Hardware space |
| --- | --- | --- | --- |
| `default` | Bounded continuous quantity; signed values use `bipolar` / `origin` | Slider tuple, `slider`, bounded `number`; `MoveSlotDefaultBody` | 1 dial |
| `value` | A value that is the headline, including a substituted value chip | Panel-selected presentation of `MoveSlotDefaultBody` | 1 dial |
| `enum` | A stepped choice | `select.options`, optional `moveSpan: 2` for a wider list; `MoveSlotEnumBody` | 1 dial by default; 2 adjacent dials with `moveSpan: 2`, either knob selects |
| `icon` | A choice recognized by its picture | Select option `icon`; `MoveSlotEnumBody` | 1 dial |
| `curve` | A choice whose value is a shape | Select `preview(option)` sampler; `MoveSlotEnumBody` | 1 dial |
| `toggle` | A switch the page is about | `toggle` config with `moveSlot`; `MoveSlotToggleBody` | 1 dial |
| `toggle-icon` | The same switch as a picture, badged with a check or a ban | `toggle` config with `moveSlot` + `icon` (glyph name or asset URL; optional `onIcon` / `offIcon`); `MoveSlotToggleBody` | 1 dial |
| `blank` | A column held open for a mode this page is not in | Any control with `moveBlank` | 1 dial |
| `xy` | Two axes that form one gesture | `xy`; `MoveSlotXYBody` | Column knob X, touched + volume Y |
| `range` | Low/high bounds of one interval | `range`; `MoveSlotRangeBody` | Column knob low, touched + volume high |
| `filter` | Cutoff and resonance with a response display | `filter`; `MoveSlotFilterBody` | 2 adjacent dials |
| `color` | One colour the page is about | `color` config; `MoveSlotColorBody` | 1 dial; hue on the knob, luminosity on volume, tap opens the editor |
| `ramp` | A colour gradient of 2–4 stops, editable in place | `gradient` config; `MoveSlotRampBody` | 1 dial; tap opens the editor — the track buttons become the stops |
| `balance` | A 0..1 mix between two sibling colour params | `balance` config (`{ type: 'balance', a, b }`); `MoveSlotRampBody` | 1 dial, a plain normalized value on the wire |

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

### Small slots and companion components

`MOVE_PAD_LIBRARY` is the small-slot dictionary, checked against `MovePadKind`.
A small slot is one pad — except `tabs`, the pad grid's first multi-slot
control.

| Kind | Choose for | Configuration / body | Hardware space |
| --- | --- | --- | --- |
| `toggle` | A switch under its dial | `toggle` with a `movePads` column; `MovePadToggleBody` | 1 pad |
| `value` | A bounded number the dial above can borrow | Bounded `slider` / `number`; `MovePadValueBody` | 1 pad |
| `action` | A button the page wants on the surface | `action` with a `movePads` column; `MovePadActionBody` | 1 pad |
| `app` | A cell the app paints — a track, a slice, a step | `MoveSurfaceStore`; `MovePadAppBody` | 1 pad |
| `tabs` | The mode a page is in, reachable without turning anything | `select` with `moveTabs` (`true`, or `'named'` for the name pad); `MovePadTabsBody` | 2–8 adjacent pads, switch row |
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
| `movePads` option | Place toggles, numeric value chips, explicitly mapped actions and tabs strips under their related dial columns |
| `MoveActionButton` / `MoveFunctions` | Hardware-named action pills and one shared action registry |
| `MoveActionDeck` | A view's whole surface when it has nothing to set yet — a start screen, a "what now" page: up to four buttons in the page's middle, one per chip key (`sample`, `capture`, `loop`, `mute`), in the chip voice (`variant: 'highlight'` for the pale key look, an `icon` of its own or the key's glyph) and attached to the key through `MoveFunctions`, so a click and a press run one handler and both flash the button. A disabled action leaves its key dark; the deck is the chip, so its attachments show no header chip. One of three: a view shows the deck, the list screen, or a panel — never two. `normalizeDeck` is the rule (order kept, first action per key wins, a fifth is dropped, every drop warned). |
| `MoveFunctionChips` | The attached functions as header chips, for free — but only for `MOVE_CHIP_BUTTONS` (`sample`, `capture`, `mute`, `loop`: the keys whose meaning is the app's to give), and only with a `label` saying what the button does in this app. A chip never wears a hardware name; unlabelled or non-chip-button attachments light the key and nothing else (Play is the time indicator's story). Naming: `sample` is the printed Sampling key — the surface's second confirm, often called "the enter button"; `jog_click` is the wheel pressed, never a chip. Clicking a chip runs the hardware key's handler. Default dress is the slot idiom; `chip: { variant: 'highlight' }` is the pale key look, `chip: { color }` takes a `MOVE_PALETTE` name only. `MovePanel` places the row by its `functionChips` option — `clock` (default, left of the volume readout), `tracks` (after the track labels), `none`. `chip: false` hides one. |
| `MoveWaveform` / `MoveWaveformStore` | Sample display, navigation, loop and scrub state. The look — style (`smooth` / `pixelated` / `striped`), bar width, grid, EQ bands, centre line — is the kit's own **Waveform** page (`MOVE_WAVEFORM_PANEL`, kind `'kit'`), put in the settings room by the first waveform to claim the surface and persisted per machine; the component's look props only seed it. `striped` draws the pixel bars untouched with a gap after each, so the wave is twice as long and nothing is lost. The card itself is the kit's — light display, dark frame, at most 1200×176 — with wheel zoom (a press resets it), a knob scrub from the playhead, the step loop, the clock with the host's play/loop state, and `cuts` that split it into pieces. |
| `MoveVolumeDisplay` | Contextual volume-knob readout |
| `MoveNotifications` / `moveNotify` | The app's messages, stacked over the instrument. Mount the component once; call `moveNotify.add({ type, title, description })` from anywhere. `type` is `info`, `success`, `warning` or `error` — the card says the kind in a word and repeats it in the palette's hue, never in hue alone. The stack clears the panel and any display floating over it (curve composer, docked waveform, save input); an app-drawn float opts in with `data-move-float`. |
| `MOVE_PALETTE` | The Move's colours on screen — the same set the hardware lights, matched by eye against the device's LED palette. `MOVE_TRACK_COLORS` is built from it. Colour on this surface always means something; never decoration. |
| `MoveSurfaceStore` | Mirror app-owned raw pads, step buttons and screen state |
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
`moveKitOptions()` includes this registry as `padList`.

`MovePadListBody` is the shared drawing in `MOVE_PAD_LIBRARY.list`; it uses
`MovePadListView` plus cursor/toggle callbacks. `MoveFunctions.push` keeps
an overlay above app reattachments and restores the latest app handler.

### Stacked actions

An action named in both `movePads` and `moveTopRow` occupies that column’s
top pad row. Another action can use its ordinary bottom action row in the same
column. Both remain momentary actions; neither borrows the dial or toggles a
value. Primecut’s Fix tempo uses this for Double and Half beneath the BPM dial.
