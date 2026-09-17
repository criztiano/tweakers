import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOVE_SLOT_LIBRARY, MoveSlotMultibandBody, MoveSlotNumericBody, MoveSlotXYBody, moveSlotKind } from '../src/components/move-slots';
import type { ControlMeta } from '../src/store/TweakStore';

describe('shared XY slot face', () => {
  const props = { label: 'Position', value: '25·75', position: { x: 0.25, y: 0.25 }, gridN: 5 };

  it('exposes the same face used by the panel and renders normalized screen coordinates', () => {
    expect(MOVE_SLOT_LIBRARY.xy.component).toBe(MoveSlotXYBody);
    const html = renderToStaticMarkup(createElement(MoveSlotXYBody, props));
    expect(html).toContain('--tweak-xy-grid-step-x:20%');
    expect(html).toContain('left:25%;top:25%');
    expect(html).toContain('25·75');
    expect(html).not.toContain('tweakers-move-xy-curve');
  });

  it('replaces the grid and crosshair with the supplied live preview', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotXYBody, {
      ...props, shape: 'M0 100L100 0', value: 'Rise',
    }));
    expect(html).toContain('d="M0 100L100 0"');
    expect(html).toContain('Rise');
    expect(html).not.toContain('tweakers-move-xy-grid');
    expect(html).not.toContain('tweakers-move-xy-dot');
  });
});

describe('the standalone speed gauge', () => {
  const speed = { type: 'slider', path: 'speed', label: 'Speed', min: 0.25, max: 4, moveVisual: { kind: 'gauge' } } as ControlMeta;

  it('is a numeric face of the library, named by its metadata', () => {
    expect(MOVE_SLOT_LIBRARY.gauge.component).toBe(MoveSlotNumericBody);
    expect(moveSlotKind(speed, { value: 1 })).toBe('gauge');
    // invalid metadata keeps the ordinary face
    expect(moveSlotKind({ ...speed, max: 0.25 }, { value: 0.25 })).toBe('default');
  });

  it('draws the multiband cleaner’s gauge between its name and its reading', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotNumericBody, {
      label: 'Speed', value: '2.13×', drawing: { kind: 'gauge', position: 0.5 },
    }));
    expect(html).toMatch(/^<span class="tweakers-move-dial-tag">Speed<\/span><svg class="tweakers-move-visual" viewBox="-43 -37 86 56"/);
    expect(html).toMatch(/<span class="tweakers-move-dial-option tweakers-move-visual-value">2\.13×<\/span>$/);
    // straight up at the middle of the range, half the ticks lit
    expect(html).toContain('class="tweakers-move-multiband-gauge-needle" x1="0" y1="0" x2="0"');
    expect(html.match(/data-lit="true"/g)).toHaveLength(6);
    // a slot of its own is read by the ordinary dial drag, not the dome
    expect(html).not.toContain('data-track');
  });

  it('keeps the multiband face’s gauge where its speed drag reads it', () => {
    const dial = (label: string, position: number) => ({ label, value: '', position });
    const html = renderToStaticMarkup(createElement(MoveSlotMultibandBody, {
      amount: dial('Clean', 0.5), speed: dial('Speed', 1), bands: [dial('Hi', 1)],
    }));
    expect(html).toContain('<svg class="tweakers-move-multiband-gauge" data-track="speed" viewBox="-43 -37 86 56"');
  });
});
