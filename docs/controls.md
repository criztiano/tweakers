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
| `enum` | A stepped choice | `select.options`; `MoveSlotEnumBody` | 1 dial |
| `icon` | A choice recognized by its picture | Select option `icon`; `MoveSlotEnumBody` | 1 dial |
| `curve` | A choice whose value is a shape | Select `preview(option)` sampler; `MoveSlotEnumBody` | 1 dial |
| `toggle` | A switch the page is about | `toggle` config with `moveSlot`; `MoveSlotToggleBody` | 1 dial |
| `toggle-icon` | The same switch as a picture, badged with a check or a ban | `toggle` config with `moveSlot` + `icon` (glyph name or asset URL; optional `onIcon` / `offIcon`); `MoveSlotToggleBody` | 1 dial |
| `blank` | A column held open for a mode this page is not in | Any control with `moveBlank` | 1 dial |
| `xy` | Two axes that form one gesture | `xy`; `MoveSlotXYBody` | Column knob X, touched + volume Y |
| `range` | Low/high bounds of one interval | `range`; `MoveSlotRangeBody` | Column knob low, touched + volume high |
| `filter` | Cutoff and resonance with a response display | `filter`; `MoveSlotFilterBody` | 2 adjacent dials |

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

A `moveTabs` select stops competing for a dial: it is a pad strip and nothing
else. It lands as one piece or not at all — the builder reports `tabs-oversized`
when the strip is wider than the 8-pad row and `tabs-no-room` when no run that
long is left, rather than shortening a mode picker. `movePads` names the column
its run **starts** in.

| Component / API | Purpose |
| --- | --- |
| `movePads` option | Place toggles, numeric value chips, explicitly mapped actions and tabs strips under their related dial columns |
| `MoveActionButton` / `MoveFunctions` | Hardware-named action pills and one shared action registry |
| `MoveWaveform` / `MoveWaveformStore` | Sample display, navigation, loop and scrub state |
| `MoveVolumeDisplay` | Contextual volume-knob readout |
| `MoveNotifications` / `moveNotify` | The app's messages, stacked over the instrument. Mount the component once; call `moveNotify.add({ type, title, description })` from anywhere. `type` is `info`, `success`, `warning` or `error` — the card says the kind in a word and repeats it in the palette's hue, never in hue alone. The stack clears the panel and any display floating over it (curve composer, docked waveform, save input); an app-drawn float opts in with `data-move-float`. |
| `MOVE_PALETTE` | The Move's colours on screen — the same set the hardware lights, matched by eye against the device's LED palette. `MOVE_TRACK_COLORS` is built from it. Colour on this surface always means something; never decoration. |
| `MoveSurfaceStore` | Mirror app-owned raw pads, step buttons and screen state |
| `ListScreen` | Controlled list presentation matching the device display |
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
