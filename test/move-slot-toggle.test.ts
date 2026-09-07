import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOVE_SLOT_LIBRARY, MoveSlotToggleBody, moveSlotKind } from '../src/components/move-slots';
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
