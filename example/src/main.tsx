import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TweakStore, ModulationStore, MoveFunctions, MovePresetStore, PresetExplorationStore, MoveSurfaceStore, MoveVolumeDisplay, moveKitOptions } from 'tweakers';
import 'tweakers/styles.css';
import { Library } from './Library';
import FlowerPlayground from './FlowerPlayground';
import FourthRow from './FourthRow';
import NestedLayer from './NestedLayer';
import { registerLibraryPanel, PANEL_NAME } from './panel';
import { bindKeyboardHardware } from './hardware';

const route = window.location.pathname.replace(/\/$/, '');
const isFlowerPlayground = route === '/flowers';
// The fourth pad row and the button faces, on an eight-column page of its own.
const isFourthRow = route === '/rows';
// A dial's nested layer, on an eight-column page of its own.
const isNestedLayer = route === '/nest';
if (isFlowerPlayground) document.title = 'Flower playground · Tweakers';
else if (isFourthRow) document.title = 'Fourth pad row · Tweakers';
else if (isNestedLayer) document.title = 'Nested layer · Tweakers';
else registerLibraryPanel();

// Handles for poking the live stores from the console — a library is a place
// to try things, and the stores are half of what there is to try.
(window as unknown as Record<string, unknown>).__kit = { TweakStore, ModulationStore, MoveFunctions, MovePresetStore, PresetExplorationStore, MoveSurfaceStore, MoveVolumeDisplay };

/**
 * The hardware, when it is there. The bridge kit is served by the `move`
 * repo's app server; with nothing on the port the import fails and the page
 * stays a screen-only library.
 *
 * `?bridge=http://localhost:7799` points the library at another bridge — a
 * private local-engine one on a spare port, which is how this page is
 * checked in a browser nobody is sitting at: the live bridge is the hand's.
 */
const BRIDGE = (new URLSearchParams(location.search).get('bridge') || 'http://localhost:7787').replace(/\/+$/, '');

function MoveBridge() {
  useEffect(() => {
    let cancelled = false;
    let unbind: (() => void) | undefined;
    // @ts-ignore — remote module, no types. The query is a cache-buster: the
    // kit is a file on the bridge's disk, edited while this page is open, and
    // a browser will happily keep the module record it already has.
    import(/* @vite-ignore */ `${BRIDGE}/kit.js?v=${Date.now()}`)
      .then((m) => {
        if (cancelled) return;
        // Every registry the kit reads, in one piece — the kit warns when the
        // page needs one a bind lacks, so none is ever listed by hand. The
        // hardware mirrors the instrument on screen and nothing else: the
        // dictionary's instruments page stays on the screen.
        unbind = m.bindMove(TweakStore, moveKitOptions({ url: BRIDGE, panels: [PANEL_NAME] }));
      })
      .catch((error) => { if (!cancelled) console.warn('Move bridge could not connect', error); });
    return () => { cancelled = true; unbind?.(); };
  }, []);
  // The Move's buttons on a keyboard, so every gesture in the library can be
  // tried with nothing plugged in — the same events the bridge sends.
  useEffect(bindKeyboardHardware, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isFlowerPlayground ? <FlowerPlayground /> : isFourthRow ? <FourthRow /> : isNestedLayer ? <NestedLayer /> : <><MoveBridge /><Library /></>}
  </StrictMode>
);
