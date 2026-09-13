# grasso — integration plan (RECOVER)

Repo: `/Users/cripto/Code/grasso` (Rust workspace + Tauri 2/React app in `app/`, pnpm). Branch `main`, clean, **3 behind origin/main**.
Read `docs/integration-plans/README.md` (shared rules) first.

## Current state (audited 2026-09-11)
- Vendored **source-tree** copy at `app/vendor/tweakers/` (git-tracked, not a tarball), snapshot 2026-09-05 — **one day PRE-split**, no `SOURCE.json`.
- `origin/kit-list-face` (unmerged, contains `9664f66 chore(kit): update the vendored tweakers snapshot`) already carries a newer snapshot than main. There is also local branch `we-need-to-add-a-new-function-to-let-sel-e975a1` with `e3644e7 Merge main into slices` (2026-09-08).
- 6 import files, all `tweakers`. Post-split breakage is only **2 symbols**: `useTweakers` (`app/src/app-shell/MovePages.tsx:8`) and `AudioLevelMeter` (`AppShell.tsx:12-18`). Everything else (`TweakStore`, `ModulationStore`, `MovePanel`, `MoveFunctions`, `MoveWaveform`, `MoveWaveformStore`, `buildMovePages`, `filterShapeResponse`) survives.
- Kit binding in `AppShell.tsx` (~line 516): dynamic import of `http://localhost:7787/kit.js` → `bindMove(TweakStore, { functions: MoveFunctions, modulation: ModulationStore })` with unbind on cleanup — shape still valid.
- CSS/DOM coupling to tweakers internals: `app/src/styles.css` uses `.tweakers-move-root`, `.tweakers-waveform-viz`, `--tweak-*` tokens; `app/src/stage/tokens.ts:11` queries `.tweakers-root`.

## Steps
1. **Reconcile branches FIRST.** Merge/fast-forward `origin/kit-list-face` into main (it holds a newer vendored snapshot); check whether `we-need-to-add-a-new-function-...` has anything worth carrying. Do the migration on top of the reconciled main — otherwise the re-vendor collides with `kit-list-face`'s snapshot refresh.
2. **Re-vendor as a proper snapshot.** Replace `app/vendor/tweakers/` with an unpacked `npm run snapshot -- <dir>` from tweakers `98082ee`, INCLUDING `SOURCE.json` (the current copy has no provenance — fix that permanently). `pnpm install --force --ignore-scripts` in `app/`.
3. **Replace `useTweakers`** in `MovePages.tsx` with `TweakStore.registerPanel(...)` / `unregisterPanel` (see `tweakers/example/src/panel.ts:175`). Keep the existing `TweakConfig`/`movePads`/`buildMovePages` model in `app/src/engine/move-pages.ts` — it's still the current API.
4. **Replace `AudioLevelMeter`** in `AppShell.tsx` with a small local meter component (do NOT add dialkit — grasso has no sidebar by design, which is exactly the post-split architecture).
5. **Audit the internal-CSS coupling** (`.tweakers-root`, `.tweakers-move-root`, `--tweak-*`, `MoveWaveform` class names) against the refreshed dist — class names are not a public contract and the refactor touched panel geometry.
6. **Audit behaviour rules** (README rules 3–5): no `set_overview` attach; pad palette is library-owned now; layouts validated against enforced MovePanel geometry; the 2026-09-08 "surface onto the Move pages" work must not claim the reserved Shift+Step 2/13.
7. **Verify:** `app` typecheck + `move-pages.test.ts` + vite build; then browser with bridge (mouse-only); then hardware (serialized slot; grasso is the deepest Move consumer so give it the longest hardware pass — 4 pages, waveform stage, modulation).
