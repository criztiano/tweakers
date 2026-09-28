import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModDot } from '../src/components/ModRing';
import { ModulationStore } from '../src/store/ModulationStore';
import { modColor, modGlyph, modRingArc, type ModulationSlot } from '../src/modulation-core';

const slot = (index: number, type: ModulationSlot['type'], params = {}): ModulationSlot => ({ index, type, params });

describe('the mark a modulation slot wears', () => {
  it('names one mark per modulator type', () => {
    expect(modGlyph(slot(0, 'lfo'))).toBe('lfo');
    expect(modGlyph(slot(0, 'sh'))).toBe('sh');
    expect(modGlyph(slot(0, 'adsr'))).toBe('adsr');
    expect(modGlyph(slot(0, 'curve'))).toBe('curve');
    expect(modGlyph(slot(0, 'audio'))).toBe('audio');
  });

  it('gives the envelope the keys when the played keys strike it', () => {
    expect(modGlyph(slot(0, 'adsr', { trigger: 'keys' }))).toBe('keys');
    expect(modGlyph(slot(0, 'adsr', { trigger: 'loop' }))).toBe('adsr');
  });

  it('leaves a type that names no mark as a plain dot', () => {
    expect(modGlyph(slot(0, 'sequencer'))).toBeNull();
  });
});

describe('the ring on a bigger circle', () => {
  it('sweeps the same knob angles at its own circumference', () => {
    const c = 2 * Math.PI * 10.5;
    expect(modRingArc(0, 1, c).length).toBeCloseTo(c * 0.75);
    expect(modRingArc(0.5, 1, c).length).toBeCloseTo(c * 0.375);
    expect(modRingArc(0.5, 1, c).offset / c).toBeCloseTo(modRingArc(0.5, 1).offset / (2 * Math.PI * 6));
  });
});

describe('the step row circle (React)', () => {
  let renderer: ReactTestRenderer | undefined;
  let frame: (() => void) | undefined;
  const written = new Map<string, string>();

  beforeEach(() => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.spyOn(ModulationStore, 'subscribeFrames').mockImplementation((cb: () => void) => {
      frame = cb;
      return () => { frame = undefined; };
    });
  });
  afterEach(() => {
    written.clear();
    act(() => renderer?.unmount());
    renderer = undefined;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const mount = (s: ModulationSlot) => {
    act(() => {
      renderer = create(createElement(ModDot, { slot: s }), {
        createNodeMock: () => ({ setAttribute: (k: string, v: string) => written.set(k, v) }),
      });
    });
    return renderer!.root;
  };

  it('cuts its type’s mark out of a dot in the slot’s colour', () => {
    const root = mount(slot(3, 'sh'));
    const dot = root.findByProps({ className: 'tweakers-move-mod-dot' });
    expect(dot.props.fill).toBe(modColor(3));
    const mask = root.findByType('mask');
    expect(dot.props.mask).toBe(`url(#${mask.props.id})`);
    expect(mask.findAllByType('circle')).toHaveLength(1 + 5); // the dot, then the die's five pips
    expect(root.findByType('svg').props['data-glyph']).toBe('sh');
  });

  it('says whether its page is the one open', () => {
    expect(mount(slot(0, 'lfo')).findByType('svg').props['data-state']).toBeUndefined();
    act(() => renderer!.update(createElement(ModDot, { slot: slot(0, 'lfo'), state: 'inactive' })));
    expect(renderer!.root.findByType('svg').props['data-state']).toBe('inactive');
  });

  it('draws a one-way ring up from the bottom-left', () => {
    mount(slot(2, 'adsr', { range: 'positive' }));
    vi.spyOn(ModulationStore, 'getSignal').mockReturnValue(0.5);
    frame!();
    expect(Number(written.get('stroke-dashoffset'))).toBeCloseTo(modRingArc(0, 0.5, 2 * Math.PI * 10.5).offset, 1);
  });

  it('lays its ring line over the whole sweep, wrapping past the circle\'s start', () => {
    const track = mount(slot(0, 'lfo')).findByProps({ className: 'tweakers-move-mod-track' });
    const [dash, gap] = String(track.props.strokeDasharray).split(' ').map(Number);
    const c = 2 * Math.PI * 10.5;
    expect(dash).toBeCloseTo(c * 0.75, 1);
    // One dash per turn: the part past 3 o'clock wraps on instead of being cut.
    expect(dash + gap).toBeCloseTo(c, 1);
  });

  it('draws a plain dot for a type with no mark', () => {
    const root = mount(slot(2, 'sequencer'));
    expect(root.findAllByType('mask')).toHaveLength(0);
    expect(root.findByProps({ className: 'tweakers-move-mod-dot' }).props.mask).toBeUndefined();
  });

  it('swings its ring with the live signal, out from the top', () => {
    const root = mount(slot(1, 'lfo'));
    const arc = root.findByProps({ className: 'tweakers-mod-ring-arc tweakers-move-mod-arc' });
    expect(arc.props.stroke).toBe(modColor(1));

    const c = 2 * Math.PI * 10.5;
    const signal = vi.spyOn(ModulationStore, 'getSignal');
    const dash = () => Number(written.get('stroke-dasharray')!.split(' ')[0]);

    signal.mockReturnValue(1);
    frame!();
    expect(dash()).toBeCloseTo(c * 0.375, 1);   // full swing: half the sweep

    signal.mockReturnValue(-0.5);
    frame!();
    expect(dash()).toBeCloseTo(c * 0.1875, 1);  // back the other way, a quarter

    signal.mockReturnValue(0);
    frame!();
    expect(dash()).toBe(0);                     // at rest, no arc
  });
});
