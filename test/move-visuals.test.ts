import { afterEach, describe, expect, it } from 'vitest';
import { TweakStore, type ControlMeta, type MoveVisual } from '../src/store/TweakStore';
import { buildMovePages, denormalizeDial, normalizeDial } from '../src/move-layout';
import { moveGrainPicture, moveGrainRole, moveGrainSpan, moveKeyboardValue, moveLanes, moveNumericDrawing, movePlaybackMode, moveVectorAxes, moveVectorStage, moveVisualReading, MOVE_GRAIN, MOVE_STAGE } from '../src/move-visual-core';

const numeric = (moveVisual: MoveVisual, min = 0, max = 1): ControlMeta => ({
  type: 'slider', path: 'value', label: 'Unrelated label', min, max, step: 0.01, moveVisual,
});
afterEach(() => TweakStore.unregisterPanel('visual-test'));

describe('semantic Move metadata', () => {
  it('survives parsing and panel updates without altering values or hardware normalization', () => {
    const config = {
      value: { type: 'slider' as const, default: 0.4, min: 0, max: 1, moveVisual: { kind: 'opacity' as const } },
      mode: { type: 'select' as const, options: ['fwd', 'rev'], moveVisual: { kind: 'playback' as const, modes: { fwd: 'forward' as const, rev: 'reverse' as const } } },
    };
    TweakStore.registerPanel('visual-test', 'Visual', config);
    const panel = TweakStore.getPanel('visual-test')!;
    const [page] = buildMovePages([panel]);
    expect(page.dials[0].moveVisual).toEqual({ kind: 'opacity' });
    expect(movePlaybackMode(page.dials[1], 'rev')).toBe('reverse');
    expect(denormalizeDial(page.dials[0], normalizeDial(page.dials[0], 0.4))).toBe(0.4);
    TweakStore.updateValue('visual-test', 'value', 0.8);
    TweakStore.updatePanel('visual-test', 'Visual', { ...config, value: { ...config.value, moveVisual: { kind: 'blur' } } });
    expect(TweakStore.getValues('visual-test').value).toBe(0.8);
    expect(TweakStore.getPanel('visual-test')!.controls[0].moveVisual).toEqual({ kind: 'blur' });
  });

  it('never derives a drawing from a label', () => {
    expect(moveNumericDrawing({ type: 'slider', path: 'opacity', label: 'Opacity', min: 0, max: 1 }, 0.5)).toBeNull();
  });
});

describe('value geometry and references', () => {
  it('trim fills the kept part from the far end to the edge, and reads in seconds', () => {
    expect(moveNumericDrawing(numeric({ kind: 'trim', edge: 'start' }, 0, 8), 2)).toEqual({ kind: 'trim', edge: 'start', position: 0.25 });
    expect(moveNumericDrawing(numeric({ kind: 'trim', edge: 'end' }, 0, 8), 6)).toEqual({ kind: 'trim', edge: 'end', position: 0.75 });
    expect(moveNumericDrawing(numeric({ kind: 'trim', edge: 'middle' as never }, 0, 8), 6)).toBeNull();
    expect(moveVisualReading(numeric({ kind: 'trim', edge: 'end' }, 0, 8), 6)).toBe('6 s');
  });

  it('offset carries the pin half its room per full turn, and offers only the ways that exist', () => {
    const bar = (origin: number, min = -25, max = 25) => numeric({ kind: 'offset', origin }, min, max);
    // Pushed back off a place three quarters along: a full turn covers half the room.
    expect(moveNumericDrawing(bar(0.75), -25)).toEqual({ kind: 'offset', origin: 0.75, position: 0.25, back: true, forward: true });
    expect(moveNumericDrawing(bar(0.25), 25)).toEqual({ kind: 'offset', origin: 0.25, position: 0.75, back: true, forward: true });
    expect(moveNumericDrawing(bar(0.5), 0)).toEqual({ kind: 'offset', origin: 0.5, position: 0.5, back: true, forward: true });
    // Parked against the end of its room: nowhere forward to go.
    expect(moveNumericDrawing(bar(1), 0)).toEqual({ kind: 'offset', origin: 1, position: 1, back: true, forward: false });
    // A dial that never crosses zero cannot go back, wherever it sits.
    expect(moveNumericDrawing(bar(0.5, 0, 50), 0)).toEqual({ kind: 'offset', origin: 0.5, position: 0.5, back: false, forward: true });
    // A pin driven past the wall stops at it rather than leaving the room.
    expect(moveNumericDrawing(bar(0.1), -25)).toEqual({ kind: 'offset', origin: 0.1, position: 0, back: true, forward: true });
    // The offset reads as the signed number it is, with no unit invented.
    expect(moveVisualReading(bar(0.75), -25)).toBe('-25');
    // An origin outside the room is not an origin.
    expect(moveNumericDrawing(numeric({ kind: 'offset', origin: 1.4 }, -25, 25), 0)).toBeNull();
    expect(moveNumericDrawing(numeric({ kind: 'offset', origin: Number.NaN }, -25, 25), 0)).toBeNull();
  });

  it('opacity uses actual alpha, including partial and percentage domains', () => {
    expect(moveNumericDrawing(numeric({ kind: 'opacity' }, 0.2, 0.8), 0.5)).toEqual({ kind: 'opacity', alpha: 0.5 });
    expect(moveNumericDrawing(numeric({ kind: 'opacity', opaqueValue: 100 }, 0, 100), 25)).toEqual({ kind: 'opacity', alpha: 0.25 });
    expect(moveNumericDrawing(numeric({ kind: 'opacity' }, 0, 100), 25)).toBeNull();
  });

  it('preserves pixel blur independently of configured maximum', () => {
    expect(moveNumericDrawing(numeric({ kind: 'blur' }, 0, 20), 3)).toEqual({ kind: 'blur', radius: 3 });
    expect(moveNumericDrawing(numeric({ kind: 'blur' }, 0, 100), 3)).toEqual({ kind: 'blur', radius: 3 });
  });

  it('keeps pan C at the specified centre in asymmetric and cropped domains', () => {
    const pan = numeric({ kind: 'pan', left: -100, center: 0, right: 50 }, -100, 50);
    expect(moveNumericDrawing(pan, -100)).toEqual({ kind: 'pan', position: 0 });
    expect(moveNumericDrawing(pan, 0)).toEqual({ kind: 'pan', position: 0.5 });
    expect(moveNumericDrawing(pan, 50)).toEqual({ kind: 'pan', position: 1 });
    expect(moveNumericDrawing({ ...pan, min: -50 }, -50)).toEqual({ kind: 'pan', position: 0.25 });
  });

  it('distinguishes mono, unity and wider stereo; omits out-of-range unity references', () => {
    const width = numeric({ kind: 'stereo-width' }, 0, 2);
    expect(moveNumericDrawing(width, 0)).toEqual({ kind: 'stereo-width', separation: 0, unity: 0.5 });
    expect(moveNumericDrawing(width, 1)).toEqual({ kind: 'stereo-width', separation: 0.5, unity: 0.5 });
    expect(moveNumericDrawing(width, 2)).toEqual({ kind: 'stereo-width', separation: 1, unity: 0.5 });
    expect(moveNumericDrawing({ ...width, max: 0.5 }, 0.25)).toEqual({ kind: 'stereo-width', separation: 0.5, unity: null });
  });

  it('turns a speed gauge across the range the dial turns, and reads it as a multiple', () => {
    const speed = numeric({ kind: 'gauge' }, 0.25, 4);
    expect(moveNumericDrawing(speed, 0.25)).toEqual({ kind: 'gauge', position: 0 });
    expect(moveNumericDrawing(speed, 1)).toEqual({ kind: 'gauge', position: 0.2 });
    expect(moveNumericDrawing(speed, 4)).toEqual({ kind: 'gauge', position: 1 });
    expect(moveNumericDrawing(speed, 9)).toEqual({ kind: 'gauge', position: 1 });
    expect(moveVisualReading(speed, 1.5)).toBe('1.5×');
    expect(moveVisualReading({ ...speed, unit: ' BPM' }, 120)).toBe('120 BPM');
    expect(moveVisualReading({ ...speed, formatValue: (v) => `${v * 100}%` }, 1.5)).toBe('150%');
    // no drawing without a range to turn across, nor off a slider
    expect(moveNumericDrawing(numeric({ kind: 'gauge' }, 2, 2), 2)).toBeNull();
    expect(moveNumericDrawing({ ...speed, type: 'number' }, 1)).toBeNull();
    expect(moveNumericDrawing(speed, NaN)).toBeNull();
  });

  it('places pitch zero correctly on asymmetric ranges and omits an unavailable zero', () => {
    expect(moveNumericDrawing(numeric({ kind: 'pitch' }, -12, 24), 0)).toEqual({ kind: 'pitch', position: 1 / 3, zero: 1 / 3 });
    expect(moveNumericDrawing(numeric({ kind: 'pitch' }, 12, 24), 18)).toEqual({ kind: 'pitch', position: 0.5, zero: null });
  });

  it('falls back for invalid runtime config or non-finite values', () => {
    for (const value of [NaN, Infinity, '0.5']) expect(moveNumericDrawing(numeric({ kind: 'opacity' }), value)).toBeNull();
    for (const visual of [{ kind: 'unknown' }, { kind: 'opacity', opaqueValue: 0 }, { kind: 'stereo-width', unity: 0 }, { kind: 'pan', center: -2 }]) {
      expect(moveNumericDrawing(numeric(visual as MoveVisual), 0.5)).toBeNull();
    }
    expect(moveNumericDrawing(numeric({ kind: 'blur' }, 0, 0), 0)).toBeNull();
  });

  it('keeps host formatting and units, otherwise gives semantic units', () => {
    expect(moveVisualReading(numeric({ kind: 'opacity' }), 0.25)).toBe('25%');
    expect(moveVisualReading(numeric({ kind: 'stereo-width' }, 0, 2), 0)).toBe('Mono');
    expect(moveVisualReading(numeric({ kind: 'pitch' }, -24, 24), 7)).toBe('+7 st');
    expect(moveVisualReading({ ...numeric({ kind: 'opacity' }), formatValue: () => 'Quarter' }, 0.25)).toBe('Quarter');
    expect(moveVisualReading({ ...numeric({ kind: 'opacity' }), unit: ' alpha' }, 0.25)).toBe('0.25 alpha');
  });
});

describe('playback mapping and editing', () => {
  it('only draws known modes for current, configured option values', () => {
    const meta: ControlMeta = { type: 'select', path: 'mode', label: 'Mode', options: ['f', 'r', 'x'], moveVisual: { kind: 'playback', modes: { f: 'forward', r: 'reverse' } } };
    expect(movePlaybackMode(meta, 'f')).toBe('forward');
    expect(movePlaybackMode(meta, 'r')).toBe('reverse');
    expect(movePlaybackMode(meta, 'x')).toBeNull();
    expect(movePlaybackMode(meta, 'forward')).toBeNull();
    expect(movePlaybackMode({ ...meta, moveVisual: { kind: 'playback', modes: 42 } as never }, 'f')).toBeNull();
  });

  it('uses bounds, stepped precision and continuous fine adjustment', () => {
    const meta = { ...numeric({ kind: 'blur' }, 0, 100), step: 0.1 };
    expect(moveKeyboardValue(meta, 50, 'ArrowRight')).toBe(51);
    expect(moveKeyboardValue(meta, 50, 'ArrowRight', true)).toBe(50.1);
    expect(moveKeyboardValue(meta, 99, 'PageUp')).toBe(100);
    expect(moveKeyboardValue(meta, 50, 'Home')).toBe(0);
    expect(moveKeyboardValue(meta, 50, 'End')).toBe(100);
    expect(moveKeyboardValue({ ...meta, step: 0 }, 50, 'ArrowRight', true)).toBe(50.1);
    expect(moveKeyboardValue(meta, 50, 'Tab')).toBeNull();
  });

  it('steps and clamps options without changing app values', () => {
    const meta: ControlMeta = { type: 'select', path: 'mode', label: 'Mode', options: [{ value: 'f', label: 'Forward' }, { value: 'r', label: 'Reverse' }] };
    expect(moveKeyboardValue(meta, 'f', 'ArrowRight')).toBe('r');
    expect(moveKeyboardValue(meta, 'r', 'ArrowRight')).toBe('r');
    expect(moveKeyboardValue(meta, 'r', 'Home')).toBe('f');
  });
});

describe('the vector stage', () => {
  const axis = (a: 'x' | 'y' | 'z', min = 0, max = 100, down?: boolean): ControlMeta => ({
    type: 'slider', path: a, label: a.toUpperCase(), min, max, step: 1, moveVisual: { kind: 'axis', axis: a, down },
  });

  it('reads x, y and z in that order only, each across its own range', () => {
    expect(moveVectorAxes([[axis('x'), 25], [axis('y', 0, 200), 50], [axis('z', -100, 100), 0]]))
      .toEqual({ x: 0.25, y: 0.25, z: 0.5, down: false });
    expect(moveVectorAxes([[axis('y'), 0], [axis('x'), 0], [axis('z'), 0]])).toBeNull();
    expect(moveVectorAxes([[axis('x'), 0], [axis('y'), 0]])).toBeNull();
    // a non-axis slider between two axes is not a place
    expect(moveVectorAxes([[axis('x'), 0], [numeric({ kind: 'opacity' }), 0], [axis('z'), 0]])).toBeNull();
    // down rides on the y axis
    expect(moveVectorAxes([[axis('x'), 0], [axis('y', 0, 100, true), 0], [axis('z'), 0]])?.down).toBe(true);
  });

  it('keeps an axis alone on the ordinary face', () => {
    expect(moveNumericDrawing(axis('x'), 50)).toBeNull();
  });

  it('draws depth as place and size: far is higher on the floor and smaller', () => {
    const near = moveVectorStage(0.5, 0, 0);
    const far = moveVectorStage(0.5, 0, 1);
    expect(far.foot.y).toBeLessThan(near.foot.y);
    expect(far.mark.r).toBeLessThan(near.mark.r);
    // x stays on the floor at every depth: the far edge is narrower
    const farLeft = moveVectorStage(0, 0, 1).foot.x;
    const nearLeft = moveVectorStage(0, 0, 0).foot.x;
    expect(farLeft).toBeGreaterThan(nearLeft);
    expect(moveVectorStage(0.5, 0, 0).foot.x).toBe(MOVE_STAGE.width / 2);
  });

  it('parks the mark on its shadow at zero height, and raises it with y', () => {
    const ground = moveVectorStage(0.5, 0, 0.5);
    expect(ground.mark.y).toBe(ground.foot.y);
    const raised = moveVectorStage(0.5, 1, 0.5);
    expect(raised.mark.y).toBeLessThan(ground.mark.y);
    // a downward y is the other way up: its zero is the top
    expect(moveVectorStage(0.5, 0, 0.5, true).mark.y).toBe(raised.mark.y);
    // never clipped: the top of the mark stays inside the stage
    expect(raised.mark.y - raised.mark.r).toBeGreaterThanOrEqual(0);
  });

  it('clamps out-of-range inputs onto the stage', () => {
    expect(moveVectorStage(-1, 2, 5)).toEqual(moveVectorStage(0, 1, 1));
  });
});

describe('the playback faces', () => {
  it('stands a pitch up as a diaphragm, reading as the pitch it is', () => {
    const throat = numeric({ kind: 'pitch', look: 'diaphragm' }, -24, 24);
    expect(moveNumericDrawing(throat, 12)).toEqual({ kind: 'diaphragm', position: 0.75, zero: 0.5 });
    expect(moveVisualReading(throat, 12)).toBe('+12 st');
    // No look is the ruler it always was.
    expect(moveNumericDrawing(numeric({ kind: 'pitch' }, -24, 24), 12)?.kind).toBe('pitch');
  });

  it('draws a streaking speed where the gauge asks for it, and the dome otherwise', () => {
    expect(moveNumericDrawing(numeric({ kind: 'gauge', look: 'streak' }, 0, 4), 1)).toEqual({ kind: 'streak', position: 0.25 });
    expect(moveNumericDrawing(numeric({ kind: 'gauge' }, 0, 4), 1)).toEqual({ kind: 'gauge', position: 0.25 });
  });

  it('freezes the clock at its minimum and shows the beat only when there is one', () => {
    const hand = () => 0.5;
    const clock = numeric({ kind: 'clock', tempo: 120, hand }, 0, 2);
    expect(moveNumericDrawing(clock, 0)).toEqual({ kind: 'clock', rate: 0, frozen: true, tempo: 120, hand });
    expect(moveNumericDrawing(clock, 1.5)).toMatchObject({ rate: 1.5, frozen: false });
    expect(moveVisualReading(clock, 1.5)).toBe('1.5×');
    // No tempo, or a nonsense one, is no beat.
    expect(moveNumericDrawing(numeric({ kind: 'clock' }, 0, 2), 1)).toMatchObject({ tempo: null });
    expect(moveNumericDrawing(numeric({ kind: 'clock', tempo: -3 }, 0, 2), 1)).toMatchObject({ tempo: null });
  });

  it('lays out lanes in option order, the chosen one and the silent ones', () => {
    const voices: ControlMeta = {
      type: 'select', path: 'voice', label: 'Voice', options: ['a', { value: 'b', label: 'B' }, 'c'],
      moveVisual: { kind: 'lanes', silent: ['c'] },
    };
    expect(moveLanes(voices, 'b')).toEqual({ chosen: 1, silent: [false, false, true] });
    expect(moveLanes({ ...voices, moveVisual: undefined }, 'b')).toBeNull();
    expect(moveLanes({ ...voices, moveVisual: { kind: 'lanes' } }, 'a')).toEqual({ chosen: 0, silent: [false, false, false] });
  });

  it('plays bounce as a playback mode of its own', () => {
    const mode: ControlMeta = { type: 'select', path: 'm', label: 'M', options: ['bounce'], moveVisual: { kind: 'playback' } };
    expect(movePlaybackMode(mode, 'bounce')).toBe('bounce');
  });
});

describe('the grain cloud', () => {
  const bell = (t: number) => Math.sin(Math.PI * t);
  const length: ControlMeta = { type: 'slider', path: 'size', label: 'Size', min: 0, max: 1, moveVisual: { kind: 'grain', role: 'length' } };
  const shape: ControlMeta = { type: 'select', path: 'curve', label: 'Curve', options: ['bell', 'flat'], preview: (v) => (v === 'bell' ? bell : null), moveVisual: { kind: 'grain', role: 'shape' } };
  const density = (overlap?: () => number): ControlMeta => ({ type: 'slider', path: 'density', label: 'Density', min: 0, max: 1, moveVisual: { kind: 'grain', role: 'density', overlap } });
  const offset = (lag?: () => number): ControlMeta => ({ type: 'slider', path: 'offset', label: 'Offset', min: 0, max: 1, moveVisual: { kind: 'grain', role: 'offset', lag } });
  const direction: ControlMeta = {
    type: 'select', path: 'mode', label: 'Direction', options: ['fwd', 'rev', 'pp'],
    moveVisual: { kind: 'grain', role: 'direction', modes: { fwd: 'forward', rev: 'reverse', pp: 'ping-pong' } },
  };
  const cloud = (trail: ControlMeta, mode = 'fwd', amount = 0.5) =>
    moveGrainSpan([[length, 0.5], [shape, 'bell'], [trail, amount], [direction, mode]]);

  it('reads four dials in order as one cloud, and nothing else', () => {
    const span = cloud(density(() => 4))!;
    expect(span).toMatchObject({ length: 0.5, direction: 'forward', trail: { role: 'density', spacing: 0.25 }, positions: [0.5, 0, 0.5, 0] });
    expect(span.shape).toBe(bell);
    expect(moveGrainSpan([[shape, 'bell'], [length, 0.5], [density(), 0.5], [direction, 'fwd']])).toBeNull();
    expect(moveGrainSpan([[length, 0.5], [shape, 'bell'], [density(), 0.5]])).toBeNull();
    // A dial wearing a grain role alone keeps its ordinary face.
    expect(moveNumericDrawing(length, 0.5)).toBeNull();
    expect(moveGrainRole(shape)).toBe('shape');
    expect(moveGrainRole({ ...shape, type: 'slider' })).toBeNull();
  });

  it('stacks by the host’s overlap, and by the dial alone without one', () => {
    expect(cloud(density(() => 10))!.trail).toEqual({ role: 'density', spacing: 0.1 });
    // Past a thin stack the copies stop packing.
    expect((cloud(density(() => 1e6))!.trail as { spacing: number }).spacing).toBeGreaterThan(0.01);
    const thin = (cloud(density(), 'fwd', 0)!.trail as { spacing: number }).spacing;
    const thick = (cloud(density(), 'fwd', 1)!.trail as { spacing: number }).spacing;
    expect(thick).toBeLessThan(thin);
    // A host that throws or answers nonsense falls back to the dial.
    expect(cloud(density(() => Number.NaN))!.trail).toEqual(cloud(density())!.trail);
  });

  it('trails one copy by an offset, in window lengths', () => {
    expect(cloud(offset(() => 0.5))!.trail).toEqual({ role: 'offset', lag: 0.5 });
    expect(cloud(offset(), 'fwd', 0.25)!.trail).toEqual({ role: 'offset', lag: 0.25 });
    const picture = moveGrainPicture(cloud(offset(() => 0.5))!);
    expect(picture.copies).toHaveLength(1);
  });

  it('never cuts off the lit grain or its nearest copy — a sparse cloud draws smaller instead', () => {
    const xs = (d: string) => [...d.matchAll(/(-?[\d.]+) -?[\d.]+/g)].map((m) => Number(m[1]));
    const inside = (d: string) => xs(d).every((x) => x >= 0 && x <= MOVE_GRAIN.width);
    for (const mode of ['fwd', 'rev', 'pp']) {
      for (const trail of [density(() => 0.05), density(() => 0.5), offset(() => 4)]) {
        const picture = moveGrainPicture(cloud(trail, mode)!);
        expect(inside(picture.hero)).toBe(true);
        for (const near of picture.copies.filter((c) => c.rank === 1)) expect(inside(near.d)).toBe(true);
      }
    }
    // A dense cloud keeps the size the length asks for.
    const dense = moveGrainPicture(cloud(density(() => 8))!);
    const sparse = moveGrainPicture(cloud(density(() => 0.05))!);
    expect(sparse.span.to - sparse.span.from).toBeLessThan(dense.span.to - dense.span.from);
    // ...but never to a speck: the sparsest cloud keeps a readable grain.
    const sparsest = moveGrainPicture(cloud(density(() => 1e-4))!);
    expect(sparsest.span.to - sparsest.span.from).toBeGreaterThan(MOVE_GRAIN.width / 5);
  });

  it('trails the copies where the grains come from, and mirrors a reversed cloud', () => {
    const lead = (d: string) => Number(/^M(-?[\d.]+)/.exec(d)![1]);
    const forward = moveGrainPicture(cloud(density(() => 4))!);
    const reverse = moveGrainPicture(cloud(density(() => 4), 'rev')!);
    const both = moveGrainPicture(cloud(density(() => 4), 'pp')!);
    // Forward: every copy sits to the right of the lit grain.
    expect(forward.copies.every((c) => lead(c.d) > lead(forward.hero))).toBe(true);
    // Reversed: the same picture, mirrored — the lit grain's run included.
    expect(reverse.span.from).toBeCloseTo(MOVE_GRAIN.width - forward.span.to);
    expect(reverse.copies.every((c) => lead(c.d) < lead(reverse.hero))).toBe(true);
    // Both ways: copies either side.
    expect(both.copies.some((c) => lead(c.d) > lead(both.hero))).toBe(true);
    expect(both.copies.some((c) => lead(c.d) < lead(both.hero))).toBe(true);
    // Farthest first, so the nearest lands on top of the stack.
    expect(forward.copies[forward.copies.length - 1].rank).toBe(1);
  });
});
