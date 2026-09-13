import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { rampCss, type GradientValue } from '../gradient-core';
import { MoveColorStore, MOVE_COLOR_PALETTES, MOVE_COLOR_STEPS, MOVE_OPACITY_PADS, type MoveColorPalette } from '../move-color';
import { TweakStore, type ControlMeta } from '../store/TweakStore';
import { parseHex, rgbToHsl, rgbToOklch, displayHex, type HSLA } from '../color-core';
import type { TweakTheme } from '../theme';
import { MoveSlotColorBody } from './move-slots';
import { ICON_MOVE_COPY } from '../icons';

export function MoveColorSlot({ panelId, meta, active, open }: {
  panelId: string; meta: ControlMeta; active: boolean; open: boolean;
}) {
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const disabled = TweakStore.isDisabled(panelId, meta.path);
  const color = MoveColorStore.read(panelId, meta.path);
  return <button
    type="button" className="tweakers-move-dial" data-kind="color"
    data-active={active || open || undefined} data-disabled={disabled || undefined}
    aria-label={`${meta.label}, hue ${Math.round(color.h)} degrees. Open color editor`}
    aria-expanded={open} aria-haspopup="dialog" disabled={disabled}
    onClick={() => {
      if (suppressClick.current) { suppressClick.current = false; return; }
      MoveColorStore.toggle(panelId, meta.path);
    }}
    onKeyDown={(e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || disabled) return;
      const direction = ['ArrowRight', 'ArrowUp'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(e.key) ? -1 : 0;
      if (!direction && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      e.stopPropagation();
      if (direction) MoveColorStore.turn(panelId, meta.path, direction, e.shiftKey);
      else MoveColorStore.update(panelId, meta.path, { h: e.key === 'Home' ? 0 : 359 });
    }}
    onPointerDown={(e) => {
      if (disabled || e.button > 0) return;
      suppressClick.current = false;
      gesture.current = { x: e.clientX, y: e.clientY, moved: false };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    }}
    onPointerMove={(e) => {
      const g = gesture.current;
      if (!g || disabled) return;
      if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 3) return;
      g.moved = true;
      const width = e.currentTarget.getBoundingClientRect().width || 1;
      MoveColorStore.update(panelId, meta.path, {
        h: MoveColorStore.read(panelId, meta.path).h + (e.clientX - g.x) / width * 360 * (e.shiftKey ? 0.1 : 1),
      });
      g.x = e.clientX;
      g.y = e.clientY;
    }}
    onPointerUp={() => { suppressClick.current = !!gesture.current?.moved; gesture.current = null; }}
    onPointerCancel={() => { suppressClick.current = true; gesture.current = null; }}
    onLostPointerCapture={() => { gesture.current = null; }}
  ><MoveSlotColorBody label={meta.label} color={String(TweakStore.getValue(panelId, meta.path))} hue={color.h} /></button>;
}

/**
 * The pad rows while the colour editor is open: only the first row works,
 * and it is an opacity bar — pad N sets the level, and the pads up to the
 * level light progressively so the row reads as a meter.
 */
export function MoveOpacityPads({ color, disabled = false }: { color: HSLA; disabled?: boolean }) {
  const level = Math.round(color.a * (MOVE_OPACITY_PADS - 1));
  return <div className="tweakers-move-pads" role="group" aria-label="Opacity pads" data-opacity>
    {Array.from({ length: MOVE_OPACITY_PADS }, (_, pad) => <button key={pad} type="button"
      className="tweakers-move-pad" data-kind="opacity" data-on={pad <= level || undefined}
      aria-label={`Opacity ${Math.round(pad / (MOVE_OPACITY_PADS - 1) * 100)}%`} aria-pressed={pad === level}
      disabled={disabled} onClick={() => MoveColorStore.setOpacity(pad / (MOVE_OPACITY_PADS - 1))} />)}
  </div>;
}

export function MoveColorSteps({ color, disabled = false }: { color: HSLA; disabled?: boolean }) {
  const selected = Math.round(color.a * (MOVE_COLOR_STEPS - 1));
  return <div className="tweakers-move-color-steps" role="group" aria-label="Color opacity sequencer">
    {Array.from({ length: MOVE_COLOR_STEPS }, (_, step) => <button key={step} type="button"
      className="tweakers-move-color-step" aria-label={`Opacity ${Math.round(step / (MOVE_COLOR_STEPS - 1) * 100)}%`}
      aria-pressed={step === selected} disabled={disabled} onClick={() => MoveColorStore.setOpacity(step / (MOVE_COLOR_STEPS - 1))}>
      <span style={{ opacity: 0.15 + step / (MOVE_COLOR_STEPS - 1) * 0.85 }} />
    </button>)}
  </div>;
}

/** The header readouts: rounded, compact, the way the display shows them. */
const readingHsl = (c: HSLA) => `${Math.round(c.h)} ${Math.round(c.s * 100)} ${Math.round(c.l * 100)}`;
export const copyHsl = (c: HSLA) => `hsl(${Math.round(c.h)} ${Math.round(c.s * 100)}% ${Math.round(c.l * 100)}%${c.a < 1 ? ` / ${Math.round(c.a * 100)}%` : ''})`;
export const copyHslOfHex = (hex: string) => copyHsl(rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }));
const readingOklch = (hex: string) => {
  const rgba = parseHex(hex);
  if (!rgba) return '0 0 0';
  const ok = rgbToOklch(rgba);
  return `${Math.round(ok.l * 100)} ${ok.c.toFixed(2)} ${Math.round(ok.h)}`;
};
export const copyOklch = (hex: string) => {
  const rgba = parseHex(hex);
  if (!rgba) return 'oklch(0% 0 0)';
  const ok = rgbToOklch(rgba);
  return `oklch(${Math.round(ok.l * 100)}% ${ok.c.toFixed(3)} ${Math.round(ok.h)}${ok.a < 1 ? ` / ${Math.round(ok.a * 100)}%` : ''})`;
};

/** One copiable reading: dim label, live value, and a copy glyph that turns
 *  into a tick for a beat once the value is on the clipboard. */
function MoveColorCopy({ label, reading, copy }: { label: string; reading: string; copy: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return <button type="button" className="tweakers-move-color-copy" aria-label={`Copy ${label} value`}
    onClick={() => {
      void navigator.clipboard?.writeText(copy);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1000);
    }}>
    <span className="tweakers-move-color-copy-label">{label}:</span>
    <span className="tweakers-move-color-copy-value">{reading}</span>
    <svg viewBox={ICON_MOVE_COPY.viewBox} aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      {copied ? <path d="M2.5 7.5L6 11L11.5 3.5" strokeWidth="1.75" /> : ICON_MOVE_COPY.paths.map((d) => <path key={d} d={d} />)}
    </svg>
  </button>;
}

/** The locked palette drawn as a strip of its colours — the panel's body
 *  while a palette is selected. The colour the dial sits on wears a ring,
 *  and each segment is a jump straight to its colour. */
function MoveColorPaletteStrip({ palette, selected, disabled }: { palette: MoveColorPalette; selected: number | null; disabled: boolean }) {
  return <div className="tweakers-move-color-palette">
    <span className="tweakers-move-palette-name">{palette.name}</span>
    <div className="tweakers-move-palette-strip" role="group" aria-label={`${palette.name} colors`}>
      {palette.colors.map((hex, index) => <button key={index} type="button" className="tweakers-move-palette-color"
        style={{ background: hex }} disabled={disabled} aria-label={`Color ${hex}`}
        aria-pressed={index === selected} data-selected={index === selected || undefined}
        onClick={() => MoveColorStore.setPaletteColor(index)} />)}
    </div>
  </div>;
}

/**
 * The gradient under the editor, drawn as its ramp with one handle per stop
 * — the screen's own pair of hands for the hardware's track buttons: a tap
 * selects a stop (the dials then edit its colour), a drag slides it along
 * the ramp, clamped between its neighbours exactly as the dial does.
 */
function MoveGradientRamp({ panelId, path, gradient, disabled }: {
  panelId: string; path: string; gradient: GradientValue; disabled: boolean;
}) {
  const drag = useRef<{ index: number } | null>(null);
  const selected = Math.min(MoveColorStore.getStop(), gradient.stops.length - 1);
  const positionFrom = (e: React.PointerEvent<HTMLElement>) => {
    const rect = (e.currentTarget.closest('.tweakers-move-color-ramp') ?? e.currentTarget).getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / (rect.width || 1)));
  };
  return <div className="tweakers-move-color-ramp" role="group" aria-label="Gradient stops"
    style={{ background: rampCss(gradient.stops) }}>
    {gradient.stops.map((stop, index) => <button key={index} type="button"
      className="tweakers-move-color-stop" disabled={disabled}
      data-selected={index === selected || undefined}
      aria-label={`Stop ${index + 1}, ${Math.round(stop.position * 100)}%`}
      aria-pressed={index === selected}
      style={{ left: `${stop.position * 100}%`, background: stop.color }}
      onPointerDown={(e) => {
        if (disabled || e.button > 0) return;
        MoveColorStore.selectStop(index);
        drag.current = { index };
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
      }}
      onPointerMove={(e) => {
        if (!drag.current || disabled) return;
        MoveColorStore.moveStop(panelId, path, drag.current.index, positionFrom(e));
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
    />)}
  </div>;
}

export function MoveColorDisplay({ panelId, meta, anchor, theme }: {
  panelId: string; meta: ControlMeta; anchor: RefObject<HTMLDivElement>; theme: TweakTheme;
}) {
  const display = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const color = MoveColorStore.read(panelId, meta.path);
  const disabled = TweakStore.isDisabled(panelId, meta.path);
  const close = () => {
    if (display.current?.contains(document.activeElement)) {
      // Whatever face opened the editor — the colour dial, the gradient's
      // ramp slot, or the small colour pad — takes focus back on close.
      anchor.current?.querySelector<HTMLButtonElement>('[data-kind][aria-expanded="true"]')?.focus();
    }
    MoveColorStore.close();
  };
  useLayoutEffect(() => {
    const place = () => {
      if (!anchor.current || !display.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const popup = display.current.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(display.current).getPropertyValue('--move-color-gap')) || 8;
      setPosition({
        left: Math.max(gap, Math.min(window.innerWidth - popup.width - gap, rect.left + (rect.width - popup.width) / 2)),
        top: Math.max(gap, rect.top - popup.height - gap),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null;
    if (anchor.current) observer?.observe(anchor.current);
    if (display.current) observer?.observe(display.current);
    const dismiss = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!display.current?.contains(target) && !anchor.current?.contains(target)) MoveColorStore.close();
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close();
    };
    window.addEventListener('pointerdown', dismiss);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', escape);
      observer?.disconnect();
    };
  }, [anchor]);
  // A gradient's editor speaks for its SELECTED stop — the readouts, the
  // sliders and the pads all edit that one colour, exactly as they edit a
  // plain colour control. The ramp above them is where stops are chosen
  // (the track buttons' job) and slid (the hold-a-track gesture's).
  const gradient = MoveColorStore.gradient(panelId, meta.path);
  const hex = MoveColorStore.hex(panelId, meta.path);
  const palette = MoveColorStore.getPalette();
  // With a palette locked the dial's hue is a wheel position, not a colour —
  // the readouts speak for the painted hex instead.
  const shown = palette ? rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }) : color;
  const content = <div ref={display} className="tweakers-root tweakers-move tweakers-move-color-display" data-theme={theme}
    role="dialog" aria-label={`${meta.label} color editor`} style={position}>
    <div className="tweakers-move-color-copies">
      <MoveColorCopy label="HSL" reading={readingHsl(shown)} copy={copyHsl(shown)} />
      <MoveColorCopy label="HEX" reading={displayHex(hex)} copy={hex} />
      <MoveColorCopy label="OKLCH" reading={readingOklch(hex)} copy={copyOklch(hex)} />
    </div>
    {gradient && <MoveGradientRamp panelId={panelId} path={meta.path} gradient={gradient} disabled={disabled} />}
    {palette
      ? <MoveColorPaletteStrip palette={palette} selected={MoveColorStore.paletteIndex(panelId, meta.path)} disabled={disabled} />
      : <>
        <div className="tweakers-move-color-slider" data-kind="hue">
          <input type="range" min="0" max="360" step="1" value={Math.round(color.h) % 360} disabled={disabled}
            aria-label="Hue" aria-valuetext={`${Math.round(color.h)} degrees`}
            style={{ '--move-slider-thumb': `hsl(${Math.round(color.h)} 100% 50%)` } as React.CSSProperties}
            onChange={(e) => MoveColorStore.setHue(Number(e.target.value))} />
        </div>
        <div className="tweakers-move-color-slider" data-kind="lightness">
          <input type="range" min="0" max="1" step="0.01" value={color.l} disabled={disabled}
            aria-label="Lightness" aria-valuetext={`${Math.round(color.l * 100)}%`}
            style={{ '--move-slider-thumb': `hsl(0 0% ${Math.round(color.l * 100)}%)` } as React.CSSProperties}
            onChange={(e) => MoveColorStore.setLuminosity(Number(e.target.value))} />
        </div>
      </>}
  </div>;
  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}

/**
 * The palette navigator, behind Menu while the colour editor is open: the
 * preset screen's spot at the grid's left edge, but its rows carry a strip
 * of each palette's colours. The first row — "All colors", a hue gradient —
 * is the way back to the whole wheel.
 */
export function MovePaletteScreen({ kept = null, children }: { kept?: number[] | null; children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const cursor = MoveColorStore.getPickerCursor();
  // A running search (`kept`, the row indices its query keeps) narrows the
  // rows and hands the wheel to the panel; its line rides in as children.
  const rows: { name: string; colors: string[] | null; index: number }[] = [
    { name: 'All colors', colors: null, index: 0 },
    ...MOVE_COLOR_PALETTES.map((p, i) => ({ name: p.name, colors: p.colors, index: i + 1 })),
  ].filter((row) => !kept || kept.includes(row.index));
  // The view follows the cursor the way the list screen does: scroll only
  // this screen, and only far enough to bring the row into sight.
  useEffect(() => {
    const el = root.current;
    const selected = el?.querySelector<HTMLElement>('[data-selected]');
    if (!el || !selected) return;
    const row = selected.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const top = row.top - box.top + el.scrollTop;
    const bottom = top + row.height;
    const next = top < el.scrollTop ? top
      : bottom > el.scrollTop + el.clientHeight ? bottom - el.clientHeight
      : el.scrollTop;
    el.scrollTop = Math.max(0, Math.min(next, el.scrollHeight - el.clientHeight));
  }, [cursor]);
  return <div ref={root} className="tweakers-move-preset-screen tweakers-move-palette-screen" data-open
    data-search={kept ? true : undefined}
    role="listbox" aria-label="Color palettes"
    onWheel={(e) => { e.preventDefault(); if (!kept) MoveColorStore.movePickerCursor(e.deltaY > 0 ? 1 : -1); }}>
    {children}
    {kept && !rows.length && <span className="tweakers-move-palette-empty">No matches</span>}
    {rows.map((row) => <button key={row.name} type="button" role="option"
      className="tweakers-move-palette-row" aria-selected={row.index === cursor}
      data-selected={row.index === cursor || undefined}
      onClick={() => MoveColorStore.choosePicker(row.index)}>
      <span className="tweakers-move-palette-name">{row.name}</span>
      <span className="tweakers-move-palette-strip" aria-hidden="true">
        {row.colors
          ? row.colors.map((hex, i) => <span key={i} className="tweakers-move-palette-color" style={{ background: hex }} />)
          : <span className="tweakers-move-palette-color" data-gradient />}
      </span>
    </button>)}
  </div>;
}
