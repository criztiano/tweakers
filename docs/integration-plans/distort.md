# distort — integration plan (REDO the wiring, keep the app code)

Repo: `/Users/cripto/Code/distort` (Rust DSP workspace; the consumer is the React lab in `web/`). Branch `main`, **10 behind origin/main**, tree clean except a stray `yourtrack.wav`.
Read `docs/integration-plans/README.md` (shared rules) first.

## Current state (audited 2026-09-11)
- **Pure sidebar (dialkit) consumer. Zero Move wiring** — no kit.js, no `move-tweakers:*`, no MovePanel. Everything it imports now lives in `dialkit`.
- Depends on `"tweakers": "file:vendor/tweakers-1.2.0.tgz"` — a pre-split monolith tarball packed 2026-08-26, no `SOURCE.json`, no provenance. The only thing keeping it buildable.
- 5 import sites: `ControlSurface.tsx` (`TweakRoot, TweakStore, useTweakers`), `bridge.ts` (`TweakStore, TweakValue`), `presets.ts` (`PresetProvider`), `TopBar.tsx` (`AudioLevelMeter, SelectControl`), `main.tsx` (`tweakers/styles.css`). Plus ~30 hardcoded `tweakers-*` CSS class references.
- The panel layer (`web/src/ui/panel/`, ~1,270 lines: 549-line declarative config, 580-line bidirectional `bridge.ts`, custom `PresetProvider`, log-scale workaround) is real app code worth keeping. `bridge.ts` is the risk concentration: it hard-depends on the `TweakStore` static API (`subscribe`/`updateValues`/`getValues`/`getPanels`).

## Why "redo the wiring": the old tarball has no provenance, predates the split by 11 days, and shares the `1.2.0` version string with the new world — recovering it in place invites exactly the silent-conflict mess we're avoiding. Start the dependency layer clean.

## Steps
1. **Sync first:** pull main up to origin (10 behind); delete or .gitignore `yourtrack.wav`.
2. **Rip out the old wiring:** delete `web/vendor/tweakers-1.2.0.tgz` and the `tweakers` entry from `web/package.json` + lockfile.
3. **Wire fresh:** vendor BOTH packages with provenance — `dialkit` (snapshot from `/Users/cripto/Code/dialkit`) as the direct dep, and `tweakers` (snapshot from `98082ee`) to satisfy dialkit's peerDependency. Use each repo's snapshot script (tweakers has `npm run snapshot`; if dialkit lacks one, `npm pack --ignore-scripts` + a hand-written `SOURCE.json` with the git revision). `file:` deps, committed tarballs/dirs + SOURCE.json, per house convention. Confirm the install resolves ONE copy of `tweakers/store` (README rule 1).
4. **Re-point imports:** the 5 sites move `tweakers` → `dialkit` (including `dialkit/styles.css` — check the actual subpath name in dialkit's exports map). `TweakStore` should come from the shared core: import it from `tweakers` (or dialkit's re-export IF dialkit re-exports the same instance — verify, don't assume).
5. **Compile and let `bridge.ts` tell you the damage.** Type-check against the new dists. If the `TweakStore` API drifted only cosmetically, patch call sites. **If `bridge.ts` needs more than superficial fixes, rewrite it from scratch against the current API** rather than patching 580 lines of diffing logic — that's the redo fallback, budget for it.
6. **CSS audit:** check whether dialkit kept the `tweakers-*` class prefix or renamed to `dialkit-*`; fix the ~30 references in `App.tsx`/`TopBar.tsx`/`MessageBar.tsx` accordingly.
7. **Check `docs/tweakers-gaps.md`** — distort was the kit's driving testbed; several gaps (e.g. log-scale sliders) may now be fixed upstream, letting you delete workarounds like `logScale.ts`. Nice-to-have, don't block on it.
8. **Verify:** `npm install` + typecheck + vite build in `web/`, then a manual browser pass over the 4-panel stage rack (select/xy/chips/curve/analyser controls, presets, compare key). No hardware needed.
