import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TweakRoot, TweakStore } from 'tweakers';
import 'tweakers/styles.css';
import { PhotoStack } from './PhotoStack';
import { Release } from './Release';
import { Library } from './Library';

// Physical controls: bind the Ableton Move bridge when it's running (no-op otherwise).
// @ts-ignore — remote module, no types
import(/* @vite-ignore */ 'http://localhost:7787/kit.js')
  .then(m => m.bindMove(TweakStore))
  .catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><PhotoStack /><TweakRoot position="top-right" /></>} />
        <Route path="/release-1.2" element={<Release />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
