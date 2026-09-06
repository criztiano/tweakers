import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TweakStore, ModulationStore, MoveFunctions, MoveColorStore, sampleTransfer, movePoint } from 'tweakers';
import 'tweakers/styles.css';
import { Library } from './Library';
import { registerLibraryPanel } from './panel';

registerLibraryPanel();

/**
 * The hardware, when it is there. The bridge kit is served by the `move`
 * repo's app server; with nothing on the port the import fails and the page
 * stays a screen-only library.
 */
function MoveBridge() {
  useEffect(() => {
    let cancelled = false;
    let unbind: (() => void) | undefined;
    // @ts-ignore — remote module, no types. The query is a cache-buster: the
    // kit is a file on the bridge's disk, edited while this page is open, and
    // a browser will happily keep the module record it already has.
    import(/* @vite-ignore */ `http://localhost:7787/kit.js?v=${Date.now()}`)
      .then((m) => {
        if (cancelled) return;
        unbind = m.bindMove(TweakStore, {
          functions: MoveFunctions,
          modulation: ModulationStore,
          color: MoveColorStore,
          // The curve maths a knob needs to hold one of a transfer's points:
          // read the shape, and move the point it is holding. Without it the
          // kit shows that slot but cannot turn it.
          transfer: { sample: sampleTransfer, move: movePoint },
        });
      })
      .catch((error) => { if (!cancelled) console.warn('Move bridge could not connect', error); });
    return () => { cancelled = true; unbind?.(); };
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MoveBridge />
    <Library />
  </StrictMode>
);
