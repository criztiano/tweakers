# tracker — integration plan (RECOVER)

Repo: `/Users/cripto/Code/tracker` (Tauri app, pnpm). Branch `main`, clean, in sync with origin.
Read `docs/integration-plans/README.md` (shared rules) first.

## Current state (audited 2026-09-11)
- Vendored `tweakers@1.2.0` at `vendor/tweakers/` is **post-split** but ~67 commits behind tweakers `98082ee`, no `SOURCE.json`.
- 10 import sites, all specifier `tweakers`; no dialkit anywhere (the `src/dialkit-panel/` directory name is historical).
- `src/move-bridge/` (client.ts, types.ts, useMoveBridge.ts) still matches the live kit's `bindMove` signature — keep it as-is.
- `npx tsc --noEmit` fails with exactly 2 errors:
  - `src/app-shell/TopBar.tsx:16` — `AudioLevelMeter` no longer exported.
  - `src/dialkit-panel/usePanelBridge.ts:19` — `useTweakers` no longer exported.

## Steps
1. **Re-vendor.** From `/Users/cripto/Code/tweakers` (main, `98082ee`): `npm run typecheck && npm test && npm run build`, then `npm run snapshot -- <tmp-dir>`; replace `vendor/tweakers/` wholesale with the unpacked tarball + `SOURCE.json`. Then `pnpm install --force --ignore-scripts` in tracker.
2. **Replace `useTweakers`** in `src/dialkit-panel/usePanelBridge.ts` (4 call sites: Sound, FX, Mix, Pattern). Use `TweakStore.registerPanel(id, name, config, undefined, { movePads, presets, hints, labels, onAction? })` in a `useEffect`, `unregisterPanel` on cleanup. Canonical example: `tweakers/example/src/panel.ts:175`. Verify each option key still exists in the refreshed `dist/index.d.ts` before assuming.
3. **Replace `AudioLevelMeter`** at `TopBar.tsx:191`: it's a presentational 12-cell mono meter fed by the local `meterStore`. Reimplement locally (small component) — do NOT add dialkit just for this.
4. **Typecheck + tests** (`npx tsc --noEmit`, existing `client.test.ts`), then `vite build`.
5. **Audit against new behavioural rules** (README rules 3–5): confirm tracker attaches nothing named `set_overview`; panel names passed to `bindMove` match `MovePanel` `panels`; remove any app-side pad-colour choices; check layouts against the now-enforced MovePanel geometry validation (previously-overflowing layouts get rejected).
6. **Verify** headless first (`node test/kit-e2e.mjs` in the move repo, tracker in a browser with the bridge running, mouse-only), then hardware (serialized slot).

## Explicitly out of scope (follow-up, not this pass)
Wiring the new bind options (`waveform`, `color`, `volume`, `surface`, `transfer`) and the `move-tweakers:*` overlay events — currently dark in tracker, not broken. Note it in the PR description.
