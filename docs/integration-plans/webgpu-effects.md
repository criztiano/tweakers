# webgpu-effects — integration plan (RECOVER; redo the dependency wiring)

Repo: `/Users/cripto/Code/webgpu-effects` (WebGPU shader library; coupling lives ONLY in `demo/` + `scripts/`). Branch `main`, clean.
Read `docs/integration-plans/README.md` (shared rules) first.

## Current state (audited 2026-09-11)
- The library core has zero tweakers coupling. The gallery panel is built by `scripts/build-dialkit.mjs`: an esbuild bundle of `demo/shared/dialkit-src/entry.jsx` with a **raw-path alias** `tweakers → ~/Code/dialkit/dist/index.js`, output to gitignored `demo/vendor/dialkit/panel.{js,css}`, rebuilt on `npm run demo`. No package.json dependency at all.
- `entry.jsx` imports pre-split shape: `{ TweakRoot, TweakStore, MovePanel, MoveFunctions, useTweakers, sampleTransfer, movePoint } from "tweakers"` — but the alias now points at post-split dialkit, which has **no `MovePanel`/`MoveFunctions`**. The build breaks (or yields undefined exports) and `scripts/dev-server.mjs:696-705` swallows the failure as a `console.warn` → silently panel-less gallery.
- Move wiring is real and good: `connectMove()` dynamically imports `localhost:7787/kit.js`, `bindMove(TweakStore, { transfer: { sample: sampleTransfer, move: movePoint }, ... })`, renders `<MovePanel/>`, 11 hardware buttons wired in `gallery.html:4111-4165`, graceful mouse-only fallback.

## Why this is the cheap one: the facade (`entry.jsx`, 134 lines) is the only file that names the package; everything downstream uses the built `panel.js` API. Fix the wiring, keep everything else.

## Steps
1. **Split the imports in `demo/shared/dialkit-src/entry.jsx`:** `MovePanel`, `MoveFunctions`, `sampleTransfer`, `movePoint` from `tweakers`; `TweakRoot`, `TweakStore`, `useTweakers` from `dialkit`; both CSS files if dialkit no longer ships the Move styles (check).
   - `TweakStore` MUST be the single shared instance — if dialkit re-exports it from `tweakers/store`, import it from `tweakers` directly to make the single-store rule visible.
2. **Replace the raw-path alias hack with real deps** (this is the redo part). Preferred: add `tweakers` and `dialkit` as `file:` devDependencies pointing at committed vendored snapshots with `SOURCE.json` (use tweakers' `npm run snapshot`), so the lockfile records the coupling and esbuild resolves `tweakers/store` normally — one store copy guaranteed. If keeping the sibling-checkout build instead, `scripts/build-dialkit.mjs` needs BOTH a `findDialkit()` and a `findTweakers()` probe, two aliases, and you must verify the bundle contains exactly one copy of the store (grep the output). The vendored-deps route is strongly preferred; the alias route is where the silent zero-panels bug lives.
3. **Make the build failure loud:** `scripts/dev-server.mjs:696-705` currently warns and continues — turn a panel build failure into a visible error (the last 5 days of silent breakage is the proof it's needed).
4. **Audit the hardware button map** (`gallery.html:4111-4165`) against README rules 3–5: nothing named `set_overview`; Shift+Step 2/13 not claimed; no app-chosen pad colours.
5. **Verify:** `npm run demo` builds the panel with zero warnings; `npm test` (note `test/panel.mjs` does NOT catch import breakage — it only exercises local plain-data code); browser check of the gallery panel mouse-only; hardware pass (serialized slot) for the 11 buttons + transfer.

## Note for the reviewer
Sibling branches `yo-i-want-to-design-some-spcial-controls-161370` and remote `man-we-need-to-add-feedback-into-the-kit-8740cc` are in the same theme — check they don't hold newer facade work before rewriting `entry.jsx`.
