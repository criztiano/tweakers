# Preset exploration

Hold the Move preset button (`menu` internally) for 450 ms to open exploration for the current panel. A tap still opens the ordinary preset browser; Shift+Menu still saves. Exploration shows a floating 4×8 pad grid, with its properties in the eight dock slots.

On first opening (including previously empty history), the grid contains your original sound on pad 1 and 31 variations with 20% spread. Opening does not change the sound. Existing populated trees are preserved. **Randomize seeds** starts a new tree of 32 fully randomized seeds and keeps previous trees; Shift+Capture does the same on Move.

Tap a child to audition it. Sample marks it as a parent. Mark at least two parents, then press Loop to generate 32 children. Ratings from 1–5 weight how often a parent is chosen. Saving creates a new preset and leaves exploration open; Back restores the values and active preset from entry. Back first dismisses an open naming input.

## Connect the hardware

```ts
import { TweakStore, MoveFunctions, PresetExplorationStore } from 'tweakers';

const { bindMove } = await import('http://localhost:7787/kit.js');
const unbind = bindMove(TweakStore, {
  functions: MoveFunctions,
  exploration: PresetExplorationStore,
  // Keep any existing modulation, waveform, color, and transfer bindings.
});
```

Use the updated Move bridge kit **and** surface engine. The engine advertises `state.capabilities.presetExploration === 1`; older engines receive no four-row exploration configuration. The onscreen controls remain available when hardware support is unavailable.

| Move control | Exploration action |
| --- | --- |
| Pad | Audition/select the corresponding child; row order matches the screen |
| Sample | Mark/unmark parent; in Morph, begin corner assignment |
| Loop | Generate 32 children |
| Capture / Shift+Capture | Add seeds using current settings / new tree with 32 randomized seeds |
| Copy / Shift+Copy | Remix / overwrite the active child’s DNA |
| Shift+Menu | Name and save the current sound; remain in exploration |
| Menu | Switch between grid and generation history |
| Left / Right | Previous / next generation |
| Up / Down | Evolution / Morph / Parameters |
| Jog / jog click | Move audition cursor / mark parent |
| Undo | Undo generation creation, remix, seed addition, or DNA overwrite |
| Back | Exit and restore the original sound |

The eight Evolution slots are generation, rating, mutation probability, mutation mode, breeding window, seed mode, spread, and seed count. Morph exposes A-X/Y, B-X/Y, group blend, and corner selection. Parameters exposes parameter selection, inclusion, range limits, and the enable/bypass filter.

## Genetics and morphing

Seeds come from current values, optionally spread randomly, fully randomized values, or an existing preset. The seed generation holds up to 32 seeds. Children independently inherit each included parameter from one of two distinct marked parents. The breeding window includes all generations by default, or the latest N generations of the tree. Ratings always influence parent selection.

Mutation defaults to a 5% per-gene probability. Random mutation selects a valid replacement. Copy Error copies an adjacent compatible gene, mapping numeric values between their normalized ranges. It leaves a gene unchanged when no compatible neighbor exists. Remix reuses a child’s original parents; overwriting captures current values. Starting a new tree copies marked children as seeds and preserves the previous tree.

Morph assigns up to eight children to two four-corner XY surfaces. Occupied corners are normalized within each surface, then the blend slider mixes the two surfaces. Numeric genes interpolate; categorical genes follow the strongest contributor. An empty surface contributes no weight. Save the blend as a preset or capture it as a seed.

Supported built-in genes are bounded numbers, toggles, selects, XY axes, range endpoints, and filter components. Explicit steps and valid options are preserved. Unsupported structured controls, actions, and navigation state are not mutated. Module-enable and known bypass controls are initially excluded; Parameters allows changing inclusion and numeric bounds. Host descriptors may set `trouble: true` for additional controls that should follow this filter.

## Host-owned presets

Existing `PresetProvider` users remain compatible. To enable exploration, supply its optional `exploration` adapter:

```ts
import type { PresetExplorationAdapter, PresetDNA } from 'tweakers';

const exploration: PresetExplorationAdapter = {
  parameters: [
    { id: 'cutoff', path: 'cutoff', label: 'Cutoff', kind: 'number',
      min: 20, max: 20000, enabled: true },
    { id: 'wave', path: 'wave', label: 'Wave', kind: 'category',
      options: ['sine', 'saw'], enabled: true },
  ],
  capture: () => engine.captureValues(),
  preview: (values: PresetDNA) => engine.previewValues(values),
  restore: (values, activeId) => engine.restoreSnapshot(values, activeId),
  save: (name, values) => presetFiles.create(name, values),
  readPreset: (id) => presetFiles.readValues(id), // optional preset-seed picker
};

TweakStore.setPresetProvider(panelId, {
  presets: hostPresets,
  activeId: hostActiveId,
  onSelect: loadHostPreset,
  onCreate: createHostPreset,
  exploration,
});
```

`capture`, `preview`, `restore`, and `save` are required and may be asynchronous. Values are keyed by flat parameter path. For a compound value, descriptors can specify a `component` and a unique `id`.

Preview must apply values without writing preset files or changing active-preset identity. Save must create a snapshot without activating it. Restore must recover both values and the supplied active ID. The adapter owns access to parameters outside `TweakStore`; the library cannot infer them from preset names. Pending previews are serialized and superseded requests coalesced. Failures are shown in the editor; a failed restore leaves Back available to retry.

## Persistence and preview transactions

With panel persistence enabled, trees, ratings, targeting, morph assignments, and saved discoveries survive reload. Exploration history uses a versioned namespace separate from ordinary values and presets. `persist: false` or `persist: { presets: false }` keeps exploration session-only. Storage failures are surfaced as session-only history. Hosts continue to own storage for their saved presets.

`TweakStore.beginPresetPreview(panelId)` starts a scoped audition transaction. Normal value edits remain audible but do not autosave to the active preset, base values, or persistent working values. `endPresetPreview(panelId)` restores entry state. Only one transaction per panel may be active.

`savePresetSnapshot(panelId, name, values)` saves explicit values without activating the new preset. The existing `savePreset` behavior is unchanged.

The genetics functions are also available from `tweakers/preset-genetics` without React. They accept an injectable random source for deterministic experiments and tests.

Inspired by the selective-breeding workflow in [Natural Selection P](https://isotonikstudios.com/wp-content/uploads/Natural-Selection-P-User-Manual.pdf). The fixed 32-child generations and always-weighted ratings adapt that workflow to Move’s pad grid.

Each occupied pad and assigned morph corner shows Wildflower artwork generated from its DNA using the approved recipe and four kit colors. Identical DNA produces identical artwork across saves and reloads; rating, parent marks, and selection do not change it. Remixing or overwriting DNA updates it automatically. `presetFlowerSvg(values)` is available from the main export or `tweakers/preset-flower` for host-owned preset lists.
