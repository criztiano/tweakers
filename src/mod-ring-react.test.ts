import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ControlRenderer } from './components/ControlRenderer';
import { TweakStore } from './store/TweakStore';
import { ModulationStore } from './store/ModulationStore';
import { modColor } from './modulation-core';

// Slider binds pointer handlers and the ring asks about reduced motion; node:test
// has no DOM. `matchMedia` answering "no" keeps the live arc on the frame path,
// and a rAF that never fires back leaves the engine's clock to the test's own
// `tick` calls.
const globals = globalThis as { window?: unknown };
globals.window ??= {
  innerHeight: 800,
  addEventListener() {},
  removeEventListener() {},
  matchMedia: () => ({ matches: false }),
  requestAnimationFrame: () => 1,
  cancelAnimationFrame() {},
};

let panelSeq = 0;

/** A panel with one 0..100 slider, its control wired to a fresh slot. */
function renderModulated(base = 50, amount = 1) {
  const id = `mod-ring-${++panelSeq}`;
  TweakStore.registerPanel(id, id, { amount: [base, 0, 100] });

  const slot = panelSeq % 16;
  ModulationStore.removeSlot(slot);
  ModulationStore.createSlot(slot, 'lfo');
  // A steady signal beats a running LFO: the arc is what's under test.
  ModulationStore.assign(id, 'amount', slot, amount);

  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      createElement(ControlRenderer, {
        panelId: id,
        controls: TweakStore.getPanel(id)?.controls ?? [],
        values: TweakStore.getValues(id),
      })
    );
  });

  const arc = (): ReactTestInstance =>
    renderer.root.findAllByProps({ className: 'tweakers-mod-ring-arc' })[0];

  return {
    id,
    slot,
    root: renderer.root,
    arc,
    /** The arc's drawn length in user units, whatever the dash pattern says. */
    arcLength: () => Number(String(arc().props['stroke-dasharray'] ?? '0').split(' ')[0]),
    dispose: () => {
      ModulationStore.removeSlot(slot);
      TweakStore.unregisterPanel(id);
    },
  };
}

/* Attributes land through setAttribute, not props, so the test renderer's
   snapshot needs the same read the browser does — react-test-renderer has no
   host nodes, so the ring writes are observed through the store instead. */
describe('the modulation ring (React)', () => {
  beforeEach(() => ModulationStore.tick(0));

  it('replaces the flat dot with a ring in the slot colour', () => {
    const panel = renderModulated();
    assert.equal(panel.root.findAllByProps({ className: 'tweakers-mod-dot' }).length, 0);
    assert.equal(panel.root.findAllByProps({ className: 'tweakers-mod-ring' }).length, 1);
    assert.equal(panel.arc().props.stroke, modColor(panel.slot));
    panel.dispose();
  });

  it('rings only the controls that carry a modulation', () => {
    const id = `mod-ring-bare-${++panelSeq}`;
    TweakStore.registerPanel(id, id, { amount: [50, 0, 100] });
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(
        createElement(ControlRenderer, {
          panelId: id,
          controls: TweakStore.getPanel(id)?.controls ?? [],
          values: TweakStore.getValues(id),
        })
      );
    });
    assert.equal(renderer.root.findAllByProps({ className: 'tweakers-mod-ring' }).length, 0);
    TweakStore.unregisterPanel(id);
  });

  it('reports the control bounds the arc is drawn against', () => {
    const panel = renderModulated();
    assert.deepEqual(ModulationStore.getBounds(panel.id, 'amount'), { min: 0, max: 100 });
    assert.equal(ModulationStore.getBounds(panel.id, 'nope'), null);
    panel.dispose();
  });

  it('tracks the live offset, so a moving modulator moves the arc', () => {
    const panel = renderModulated();
    // The engine's own numbers are what the arc reads per frame; a signal that
    // has swung means an arc that has swung.
    ModulationStore.tick(0.25);
    const first = ModulationStore.getOffset(panel.id, 'amount');
    ModulationStore.tick(0.25);
    const second = ModulationStore.getOffset(panel.id, 'amount');
    assert.notEqual(first, second, 'the offset the ring draws never moved');
    assert.ok(Math.abs(second) <= 50, 'the offset outran the control span');
    panel.dispose();
  });

  it('holds the base value still while the modulation moves', () => {
    const panel = renderModulated(50);
    ModulationStore.tick(0.25);
    ModulationStore.tick(0.25);
    assert.equal(TweakStore.getValue(panel.id, 'amount'), 50);
    assert.notEqual(ModulationStore.getValue(panel.id, 'amount'), 50);
    panel.dispose();
  });
});
