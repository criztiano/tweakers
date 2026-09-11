# Integrating and updating the kit

## Ownership and state

Use the public `tweakers` exports and `tweakers/styles.css`. Never import through
`src/`, bundle a second copy of the store, or patch generated `dist` files.
Register stable named configs with `useTweakers`; let `MovePanel` and the bridge
consume the same `TweakStore`. Keep engine state in the app, diff user edits into
it, and push external changes (preset, undo, engine restore) back through
`TweakStore.updateValues`. Read current values before applying changes so that
the two directions do not echo. Preserve identity paths when rebuilding config.

A minimal on-screen surface needs no running hardware server:

```tsx
import { MovePanel, useTweakers, type TweakConfig } from 'tweakers';
import 'tweakers/styles.css';

const PANELS = ['Instrument'];
const config = { gain: [0.5, 0, 1, 0.01], mute: false } satisfies TweakConfig;

export function InstrumentControls() {
  const values = useTweakers('Instrument', config, {
    movePads: { mute: 0 },
  });
  // The app's bridge applies values.gain / values.mute to its engine.
  return <MovePanel panels={PANELS} dock="flow" theme="dark" productionEnabled />;
}
```

`productionEnabled` is required for a product
surface: the development default otherwise hides the panel in production.

## Hardware connection

The separate Move server serves `bindMove` at `http://localhost:7787/kit.js`.
Bind once per active surface/profile. Supply exactly the same ordered panel
names to `MovePanel` and `bindMove`, and the registries for features the app uses:
`functions`, `waveform`, `modulation`. The bridge returns an unbind function;
call it on unmount and before rebinding. Cancel pending import/retry work on
unmount so a late import cannot create an orphan connection.

Keep hardware optional: expose connection status, allow the app to work offline,
and use bounded retry delays if the server may start later. Test reconnect and
profile changes. App actions attach through `MoveFunctions`; raw pads, steps or
master controls require explicit claims and `MoveSurfaceStore` mirroring.
Do not rebuild page/dial mapping or value synchronization in the app's raw client.
Do not give modulation and the app sequencer simultaneous ownership of steps.

The Move's own screen shows the list the big wheel walks — always. An app may
put several lists on the laptop and give each its own control (the wheel for
one, a dial for another), but the hardware screen has room for one
`MoveScreenList`, and it belongs to the wheel. Anything else makes the wheel
move a selection the player cannot see, or makes the screen answer to a control
that is not under their thumb. A view whose wheel drives no list sends `null`
and leaves the screen to the frames below it, rather than borrowing it for a
list some other control owns.

Hardware has four tracks and eight dial columns. `buildMovePages`, `dialSpan`,
`visibleColumns` and `movePadRows` define the layout, not app CSS. Validate pages
for overflow, two-column filter boundaries, enums and small-pad placement.

## Dependency policy

Grasso and Tracker currently use `file:./vendor/tweakers`, a committed package
snapshot. This is portable and CI-friendly when the vendor directory and lockfile
are committed. It is not a live link. Their snapshots predate this audit and have
no upstream revision marker; do not infer their source commit from version 1.2.0.

Keep that strategy until deliberately changing distribution. Do not replace it
with an arbitrary registry version: this repository has historically diverged
from the published line. Do not put machine-specific absolute `file:` paths in
committed manifests. During local kit development the example's `file:..` is fine.

### Repeatable snapshot update

1. In the kit task worktree, run `npm run typecheck`, `npm test`,
   `npm run test:timeline` and `npm run build`. Review the source and generated diff.
2. Run `npm run snapshot -- /tmp/tweakers-review-UNIQUE` using a new directory.
   This packs the npm allowlist, skips lifecycle rebuilds, and writes a sibling
   `SOURCE.json` with source commit, dirty flag and archive SHA-256. A clean
   committed source is required before treating it as a release; a dirty snapshot
   is useful for review but is explicitly marked.
3. Extract that archive into a staging directory. Compare it with the consumer's
   existing vendor package before replacement, including exports used by the app.
   Preserve app-specific adapter code outside the vendor directory. Never merge
   generated bundles or refresh only one JS/CSS file.
4. In the consumer's isolated task worktree, replace `vendor/tweakers` with the
   complete extracted `package` directory, and copy `SOURCE.json` into it. Grasso's
   package root is `app/`; Tracker's is its repository root.
5. Run `pnpm install --force --ignore-scripts` in that package root, updating its
   lockfile. Restart Vite with `--force` to refresh prebundles. A `file:` dependency
   may be copied into pnpm's store; a kit rebuild alone is insufficient.
6. Run the consumer's typecheck, lint, tests and `pnpm exec vite build`. Test the
   panel in production, not just the dev server. Check presets/undo, pointer and
   hardware input, curve preview refresh, page changes and offline behavior.
7. Commit the complete vendor package, source marker and lockfile together.
   Verify `pnpm install --frozen-lockfile --ignore-scripts` in CI. Roll back by
   reverting that whole update commit, not by mixing files from two snapshots.

The snapshot tool refuses to overwrite an existing output directory and never
edits a consumer. Its SHA-256 describes the exact archive, including dirty builds;
it does not prove the build is current. The explicit build gate above does that.

## Integration review checklist

- Public imports, one resolved store instance, one stylesheet import.
- App shell token scope and explicit panel theme.
- Production surface enabled; viewport dock does not cover content.
- Panel and hardware names/order match; empty and overflowing layouts inspected.
- Stable ranges/steps, domain formatting, hints and intentional pad columns.
- Both directions of state sync verified after preset/undo.
- Binding, function listeners, timers and subscriptions cleaned up.
- Snapshot provenance, full vendor package and matching lockfile committed.

### Settings view (Set Overview)

Every app has master settings — output level, latency, autosave, a MIDI
channel: controls that concern the whole instrument rather than any one page.
Put them in one dedicated panel and name it in `MovePanel`'s `settings` prop.
This is workflow organization, not a new control kind: inside, the panel works
exactly like any page — any control type, the same layout rules, the same
hardware sync path.

```tsx
useTweakers('Settings', {
  output: [0.8, 0, 1],
  latency: [0.2, 0, 1],
  autosave: true,
});

<MovePanel panels={PANELS} settings="Settings" productionEnabled />
```

The named panel leaves the page row and waits behind the Move's Set Overview
button (Shift + Step 1): the panel attaches `set_overview` itself, so do not
attach it in the app. A press toggles the view — the surface inverts to the
settings palette (dark neutral grey), and the header carries the room's name
with a marker that blinks while the view is open — the pulse the hardware's
Set Overview step icon is meant to carry too, once the surface module learns
to blink the Shift layer. Back, any track button, or a second press
walks out. A host UI can drive the same door with `MoveSettingsView.toggle()`.

The hardware follows on the modulator-page rails: the panel announces the
room on window (`move-tweakers:settings`), the kit keeps that panel off the
track row and appends it after the pages, and an open steers the Move onto
it — knobs, pads, lights and value sync work there exactly as on any page —
while a close (or a hardware track press) steers it back to the page the
panel shows. This needs the current bridge kit; an older kit leaves the
hardware on the page underneath while the screen shows the room.

The settings panel may appear in the app's `panels` lists or not — the kit
removes it from the track row either way once the panel announces it. Do not
put per-page or performance controls here; if a control belongs to one
instrument page, it belongs on that page.

### Move color slot

A `color` control now occupies one Move dial slot. Its face shows the selected
color over a transparency checker. Drag or use arrow keys to change hue; tap to
open a floating 32-color hue display and mirror it on the Move grid.

```tsx
import { MoveColorStore, TweakStore, useTweakers } from 'tweakers';

const values = useTweakers('Color', {
  tint: { type: 'color', default: '#eb644dff', alpha: true },
});

// Alongside any existing functions/modulation/waveform options:
import('http://localhost:7787/kit.js').then(m =>
  m.bindMove(TweakStore, { color: MoveColorStore })
);
```

The column dial controls hue; volume controls HSL lightness while the column dial
is touched, or whenever its editor is open. In the open editor, pads choose hue,
sequencer steps span 0–100% opacity, and the big wheel adjusts opacity continuously.
Hue advances by 1° per dial step; Shift reduces it to 0.1°. Tap the slot again, press Back on Move, or use Escape
or the close button on screen to return to the normal surface. Changing pages also
closes the editor. Use `alpha: true` so opacity remains part of the control's value
when its configuration is reconciled.

The hardware requires the matching color-slot support in the Move bridge kit and
surface. The updated Bridge module uses direct RGB for 32 distinct hues at maximum
saturation and fixed lightness, matching the on-screen grid. Reopen Bridge once
after installing the on-device module update; older modules retain indexed colors
until they advertise RGB support. Grid taps set saturation to maximum while
preserving the selected luminosity and opacity. This is the single-color foundation for later palette and gradient
controls.

### Audio modulator

The `audio` modulator type follows a sample's amplitude envelope at a play
position that runs like a tape. The host decodes the sample and hands it over
once — the library never owns audio:

```tsx
import { setAudioModBuffer, ModulationStore, MoveWaveformStore } from 'tweakers';

const buffer = await audioCtx.decodeAudioData(bytes);
setAudioModBuffer(buffer);

// Bind the waveform store so the hardware drives the editor:
import('http://localhost:7787/kit.js').then(m =>
  m.bindMove(TweakStore, { modulation: ModulationStore, waveform: MoveWaveformStore })
);
```

Opening an audio slot's settings page floats the full waveform above the panel
and turns the surface into a tape deck: the big wheel zooms (on screen, the
mouse wheel does), the volume knob scrubs — a slow tick moves a fine share of
the shown window (so zooming in raises precision) and a fast spin accelerates
superlinearly to travel; Shift stays linear and finer — the step row brackets the loop —
first press in, second press out, a held step lets it go — and the bottom pad
row addresses the shown window in eighths: a tap jumps the playhead there, a
hold selects that stretch as the loop. Play toggles the transport, Loop arms
the brackets, Delete drops them, Back closes the page. Every move lands in the
slot's params (`position`, `loopStart`, `loopEnd`, `playing`, `loopOn`), so a
host that plays real audio can follow the same numbers — read the live
playhead with `ModulationStore.getSlotPhase(slot)`. The editor's header
carries a blue Load button (file picker → `setAudioModBuffer`, the library's
one one-shot decode), the running time, and the zoom readout.

Out-of-panel integrations get the same grammar without the modulator: mount
`MoveWaveform`, and while its editor claim is up (`MoveWaveformStore.setEditor`)
the kit routes the whole step row, the pad row, and the transport buttons the
same way.
