import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, create } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOVE_PAD_LIBRARY, MOVE_SLOT_LIBRARY, MovePadIconBody, MovePadIconLabelBody, MoveSlotMetronomeBody, MoveSlotToggleBody, moveSlotKind } from '../src/components/move-slots';
import { LUCIDE_ICONS } from '../src/icons';
import { ICON_BADGE_OFF, ICON_BADGE_ON } from '../src/icons';
import { TweakStore, type ControlMeta } from '../src/store/TweakStore';
import { buildMovePages, isToggleDial } from '../src/move-layout';

const meta = (extra: Partial<ControlMeta>): ControlMeta =>
  ({ type: 'toggle', path: 'loop', label: 'Loop', ...extra } as ControlMeta);

describe('the switch that draws itself', () => {
  it('is a face of the library, and the kind a switch with a picture wears', () => {
    expect(MOVE_SLOT_LIBRARY['toggle-icon'].component).toBe(MoveSlotToggleBody);
    expect(moveSlotKind(meta({}))).toBe('toggle');
    expect(moveSlotKind(meta({ icon: 'repeat' }))).toBe('toggle-icon');
  });

  it('draws its picture, and badges it with a check or a ban', () => {
    const on = renderToStaticMarkup(createElement(MoveSlotToggleBody, { label: 'Loop', checked: true, icon: 'repeat' }));
    expect(on).toContain('tweakers-move-toggle-icon');
    expect(on).toContain(ICON_BADGE_ON);
    expect(on).not.toContain(ICON_BADGE_OFF);

    const off = renderToStaticMarkup(createElement(MoveSlotToggleBody, { label: 'Loop', checked: false, icon: 'repeat' }));
    expect(off).toContain(ICON_BADGE_OFF);
    expect(off).toContain('Loop');
  });

  it('takes the host’s own badges where it ships a pair', () => {
    const off = renderToStaticMarkup(createElement(MoveSlotToggleBody, {
      label: 'Polish', checked: false, icon: '/brush.svg', onIcon: '/check.svg', offIcon: '/ban.svg',
    }));
    expect(off).not.toContain(ICON_BADGE_OFF);
    expect(off).toContain('url(&quot;/ban.svg&quot;)');   // the badge, as a mask
    expect(off).toContain('url(&quot;/brush.svg&quot;)'); // and the app's own picture
  });

  it('keeps the plain switch for a boolean with nothing to draw', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotToggleBody, { label: 'Hold', checked: true }));
    expect(html).toContain('tweakers-move-dial-toggle-indicator');
    expect(html).not.toContain('tweakers-move-toggle-picture');
  });
});

describe('the switch drawn as a metronome', () => {
  const swing = () => 0.5;

  it('is a face of the library, and wins over the switch’s other faces', () => {
    expect(MOVE_SLOT_LIBRARY.metronome.component).toBe(MoveSlotMetronomeBody);
    expect(moveSlotKind(meta({ moveVisual: { kind: 'metronome', swing } }))).toBe('metronome');
    // A picture named beside it does not turn it back into a glyph.
    expect(moveSlotKind(meta({ icon: 'repeat', moveVisual: { kind: 'metronome' } }))).toBe('metronome');
  });

  it('stands dim and upright while it is off', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotMetronomeBody, { label: '120.0 BPM', checked: false, swing }));
    expect(html).toContain('tweakers-move-metronome');
    expect(html).not.toContain('data-on');
    expect(html).toContain('transform="rotate(0)"');
    expect(html).toContain('120.0 BPM');
    expect(html).not.toContain('tweakers-move-toggle-badge');
  });

  it('is lit while it is on, and cuts its arm out of the body', () => {
    const html = renderToStaticMarkup(createElement(MoveSlotMetronomeBody, { label: '120.0 BPM', checked: true, swing }));
    expect(html).toMatch(/class="tweakers-move-metronome" data-on="true"/);
    expect(html).toContain('tweakers-move-metronome-cut');
    // The swing is the host's to run in the browser; on the server the arm
    // starts upright.
    expect(html).toContain('transform="rotate(0)"');
  });

  describe('in the browser', () => {
    afterEach(() => vi.unstubAllGlobals());

    /** Mounts the face with the arm's element stood in, and a frame clock the
     *  test turns by hand. */
    function mount(props: { checked: boolean; swing?: () => number | null }, reduce = false) {
      const frames: (() => void)[] = [];
      vi.stubGlobal('window', {
        matchMedia: () => ({ matches: reduce }),
        requestAnimationFrame: (cb: () => void) => frames.push(cb),
        cancelAnimationFrame: () => { frames.length = 0; },
      });
      const leans: string[] = [];
      const node = { setAttribute: (_: string, v: string) => leans.push(v) };
      let renderer!: ReturnType<typeof create>;
      act(() => {
        renderer = create(createElement(MoveSlotMetronomeBody, { label: '120.0 BPM', ...props }), {
          createNodeMock: (el) => (el.type === 'g' ? node : null),
        });
      });
      const step = () => { const next = frames.splice(0); next.forEach((f) => f()); };
      return { renderer, leans, frames, step };
    }

    it('swings the arm to the host’s position every frame, without a render', () => {
      let at: number | null = 1;
      const { renderer, leans, step } = mount({ checked: true, swing: () => at });
      expect(leans.at(-1)).toBe('rotate(45.00)');
      at = -0.5;
      step();
      expect(leans.at(-1)).toBe('rotate(-22.50)');
      at = null;
      step();
      expect(leans.at(-1)).toBe('rotate(0.00)');
      at = 3;
      step();
      expect(leans.at(-1)).toBe('rotate(45.00)');
      act(() => renderer.unmount());
    });

    it('stops and stands upright when it is switched off', () => {
      const { renderer, leans, frames } = mount({ checked: true, swing: () => 1 });
      act(() => renderer.update(createElement(MoveSlotMetronomeBody, { label: '120.0 BPM', checked: false, swing: () => 1 })));
      expect(frames).toHaveLength(0);
      expect(leans.at(-1)).toBe('rotate(0.00)');
      act(() => renderer.unmount());
    });

    it('stands still, lit, for a reader who asked for less motion', () => {
      const { renderer, leans, frames } = mount({ checked: true, swing: () => 1 }, true);
      expect(frames).toHaveLength(0);
      expect(leans).toEqual(['rotate(0.00)']);
      act(() => renderer.unmount());
    });
  });

  it('carries the host’s swing off the config into its slot', () => {
    TweakStore.registerPanel('metronome-face', 'Metronome face', {
      click: { type: 'toggle', default: false, label: '120.0 BPM', moveSlot: true, moveVisual: { kind: 'metronome', swing } },
    } as never);
    const click = TweakStore.getPanel('metronome-face')!.controls.find((c) => c.path === 'click')!;
    expect(click.moveVisual).toEqual({ kind: 'metronome', swing });
    expect(moveSlotKind(click)).toBe('metronome');
    expect(isToggleDial(click)).toBe(true);
    TweakStore.unregisterPanel('metronome-face');
  });
});

describe('a switch that claims a slot', () => {
  it('carries its name, picture and slot claim off the config', () => {
    TweakStore.registerPanel('toggle-face', 'Toggle face', {
      polish: { type: 'toggle', default: true, label: 'MP3 repair', icon: 'repeat', moveSlot: true },
      hold: false,
    } as never);
    const panel = TweakStore.getPanel('toggle-face')!;
    const polish = panel.controls.find((c) => c.path === 'polish')!;
    expect(polish.label).toBe('MP3 repair');
    expect(polish.icon).toBe('repeat');
    expect(TweakStore.getValue('toggle-face', 'polish')).toBe(true);
    expect(isToggleDial(polish)).toBe(true);
    expect(isToggleDial(panel.controls.find((c) => c.path === 'hold')!)).toBe(false);

    // The claim is what puts it in the dial row; every other switch is a pad.
    const [page] = buildMovePages([panel]);
    expect(page.dials.map((c) => c?.path)).toEqual(['polish']);
    expect(page.toggles.filter(Boolean).map((c) => c.path)).toEqual(['hold']);
    TweakStore.unregisterPanel('toggle-face');
  });
});

describe('a column the page is holding open', () => {
  it('keeps its place in the row while its mode is away', () => {
    TweakStore.registerPanel('blank-face', 'Blank face', {
      polish: { type: 'toggle', default: true, moveSlot: true, icon: 'repeat' },
      restore: { type: 'toggle', default: false, moveSlot: true, moveBlank: true },
    } as never);
    const panel = TweakStore.getPanel('blank-face')!;
    const restore = panel.controls.find((c) => c.path === 'restore')!;
    expect(restore.moveBlank).toBe(true);
    // Blank is a way of drawing, not a way of leaving: the switch keeps its
    // column, its value and its place on the hardware.
    const [page] = buildMovePages([panel]);
    expect(page.dials.map((c) => c?.path)).toEqual(['polish', 'restore']);
    expect(TweakStore.getValue('blank-face', 'restore')).toBe(false);
    TweakStore.unregisterPanel('blank-face');
  });
});

describe('a switch held rather than thrown', () => {
  it('keeps its pad under its dial and says it is held, off the config', () => {
    TweakStore.registerPanel('hold-pad', 'Hold pad', {
      level: { type: 'slider', default: 50, min: 0, max: 100 },
      solo: { type: 'toggle', default: false, moveHold: true },
      mute: { type: 'toggle', default: false },
    } as never, undefined, { movePads: { solo: 0, mute: 1 } });
    const panel = TweakStore.getPanel('hold-pad')!;
    const [page] = buildMovePages([panel]);
    expect(page.toggles[0]?.path).toBe('solo');
    expect(page.toggles[0]?.moveHold).toBe(true);
    expect(page.toggles[1]?.moveHold).toBeUndefined();
    TweakStore.unregisterPanel('hold-pad');
  });
});

describe('a pad switch drawn as its picture alone', () => {
  it('is a small slot of the library', () => {
    expect(MOVE_PAD_LIBRARY.icon.component).toBe(MovePadIconBody);
  });

  it('draws the glyph and no name', () => {
    const html = renderToStaticMarkup(createElement(MovePadIconBody, { icon: 'headphones' }));
    expect(html).toContain('tweakers-move-pad-icon');
    expect(html).toContain(LUCIDE_ICONS.headphones[0]);
    expect(html).not.toContain('tweakers-move-pad-title');
  });

  it('masks a host asset in the pad’s colour', () => {
    const html = renderToStaticMarkup(createElement(MovePadIconBody, { icon: '/solo.svg' }));
    expect(html).toContain('url(&quot;/solo.svg&quot;)');
  });
});

describe('a pad button wearing its picture beside its name', () => {
  it('is a small slot of the library', () => {
    expect(MOVE_PAD_LIBRARY['icon-label'].component).toBe(MovePadIconLabelBody);
  });

  it('draws the glyph, then the name', () => {
    const html = renderToStaticMarkup(createElement(MovePadIconLabelBody, { icon: 'download', label: 'Export' }));
    expect(html).toContain(LUCIDE_ICONS.download[0]);
    expect(html.indexOf('tweakers-move-pad-icon')).toBeLessThan(html.indexOf('Export'));
  });

  it('carries an action’s icon from its config', () => {
    TweakStore.registerPanel('icon-action', 'Icon action', {
      save: { type: 'action', label: 'Export', icon: 'download' },
      clear: { type: 'action', label: 'Clear' },
    } as never);
    const controls = TweakStore.getPanel('icon-action')!.controls;
    expect(controls.find((c) => c.path === 'save')?.icon).toBe('download');
    expect(controls.find((c) => c.path === 'clear')?.icon).toBeUndefined();
    TweakStore.unregisterPanel('icon-action');
  });
});
