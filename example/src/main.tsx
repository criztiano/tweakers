import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TweakRoot, TweakStore, MovePanel, MoveFunctions } from 'tweakers';
import 'tweakers/styles.css';
import { PhotoStack } from './PhotoStack';
import { Release } from './Release';
import { Library } from './Library';

// A Move xy-pad demo page (track 2 on the panel): drag the pad in the dial
// slot, or on the hardware turn its knob for X and the volume knob for Y
// while that knob is touched.
TweakStore.registerPanel('move-xy', 'XY Demo', {
  spot: { type: 'xy', x: { min: -1, max: 1, bipolar: true }, y: { min: 0, max: 10 }, default: { x: 0, y: 5 } },
  amount: [0.5, 0, 1],
});

// Function buttons: the Move's Copy puts every panel's current values on the
// clipboard as JSON. Unattached buttons keep the surface built-ins.
MoveFunctions.attach('copy', () => {
  const all = Object.fromEntries(TweakStore.getPanels().map(p => [p.id, TweakStore.getValues(p.id)]));
  navigator.clipboard?.writeText(JSON.stringify(all, null, 2)).catch(() => {});
});

// Physical controls: bind the Ableton Move bridge when it's running (no-op otherwise).
// @ts-ignore — remote module, no types
import(/* @vite-ignore */ 'http://localhost:7787/kit.js')
  .then(m => m.bindMove(TweakStore, { functions: MoveFunctions }))
  .catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><PhotoStack /><TweakRoot position="top-right" /><MovePanel /></>} />
        <Route path="/release-1.2" element={<Release />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
