# Integration plans — post-refactor consumer migration (2026-09-11)

One plan per consumer repo, written to be executed **in parallel by independent agents**. Each plan is self-contained, but these rules apply to all of them:

## Ground truth
- `tweakers` (post-split, `/Users/cripto/Code/tweakers`, main @ `98082ee`) = shared `TweakStore`/`ModulationStore` core + the Move surface (`MovePanel`, `MoveFunctions`, `MoveSurfaceStore`, waveform/color/volume stores). **No sidebar controls, no `useTweakers`, no `AudioLevelMeter`.**
- `dialkit` (`/Users/cripto/Code/dialkit`) = the sidebar package (`TweakRoot`, `useTweakers`, `Slider`, `Toggle`, `SegmentedControl`, `AudioLevelMeter`, `SelectControl`, …). Declares `tweakers` as a **peerDependency**.
- Panel registration without React/dialkit: `TweakStore.registerPanel(id, name, config, shortcuts?, { movePads, presets, hints, labels, ... })` + `unregisterPanel(id)` (see `tweakers/example/src/panel.ts:175` for the canonical call).
- Move bridge: `node app/server.mjs` in `/Users/cripto/Code/move` serves `GET http://localhost:7787/kit.js`; pages bind via dynamic `import(kitUrl).then(m => m.bindMove(TweakStore, {...}))` and MUST call the returned unbind on unmount. Full contract: `/Users/cripto/Code/move/INTEGRATION.md` + `PROTOCOL.md`.

## Non-negotiable rules (violating these = the classic silent failures)
1. **One store instance.** Every bundle must resolve `tweakers/store` and `tweakers/modulation-store` to a single copy. `dist/index.js` imports those as bare specifiers, so `tweakers` must be installed as a real package (vendored `file:` dep is the house convention), never aliased to a raw dist path in a way that duplicates the store. Two copies = MovePanel sees zero panels, silently.
2. **Vendor with provenance.** Refresh vendored copies with `npm run snapshot -- <new-dir>` from the tweakers repo (writes tarball + `SOURCE.json` with git revision + sha256). Follow the 7-step procedure in `/Users/cripto/Code/tweakers/docs/integration.md`. Never trust the version string: pre- and post-split are BOTH `1.2.0`.
3. **Settings mode ownership.** `MovePanel` attaches `set_overview` itself — apps must NOT attach it. Panels passed as `settings` leave the track row. Requires current kit AND current on-device module (`sh scripts/deploy.sh` in move repo) — older modules leave hardware on the page underneath.
4. **Pad colours are no longer app-chosen** (named palette + dimmed twins); reserved pad row y=0; Shift+Step 2 and 13 are reserved and silently dropped from claims.
5. `bindMove` panel names/order must match the `MovePanel` `panels` prop exactly.

## Verdicts (recover vs redo)
| Repo | Verdict | Why |
|---|---|---|
| tracker | **Recover** | Already post-split, tree clean, Move transport still matches the live kit; exactly 2 broken symbols. |
| grasso | **Recover** | Architecture (MovePanel-only, no sidebar) is exactly the post-split direction; only `useTweakers` + `AudioLevelMeter` break. Snapshot is 1 day pre-split — refresh it. |
| webgpu-effects | **Recover, but redo the dependency wiring** | One 134-line facade is the only coupling; the esbuild raw-path alias setup is the risk and gets replaced with real `file:` deps. |
| distort | **Redo the dependency wiring from scratch; keep the app code** | Pure dialkit (sidebar) consumer, zero Move wiring, frozen on the pre-split monolith with no provenance. Delete the old tarball, wire dialkit+tweakers fresh, re-point 5 imports; rewrite `bridge.ts` only if it fights back. |

## Parallelization
All four plans are independent — no shared files, no ordering. The ONLY shared resource is the Move hardware: the kit obeys the foreground tab only, so **hardware verification must be serialized** (and close stray agent-browser tabs first: `agent-browser close --all`). Everything up to hardware verification (typecheck, unit tests, headless `node test/kit-e2e.mjs`, mouse-only browser check) parallelizes freely. distort and webgpu-effects' sidebar path need no hardware at all.
