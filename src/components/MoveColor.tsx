import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { MoveColorStore, MOVE_COLOR_WHEEL, MOVE_COLOR_STEPS, moveWheelSlot } from '../move-color';
import { TweakStore, type ControlMeta } from '../store/TweakStore';
import type { HSLA } from '../color-core';
import type { TweakTheme } from '../theme';
import { MoveSlotColorBody } from './move-slots';

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

export function MoveHueGrid({ color, disabled = false, mirror = false }: { color: HSLA; disabled?: boolean; mirror?: boolean }) {
  const selected = moveWheelSlot(color.h);
  return <div className="tweakers-move-hues" role="group" aria-label={mirror ? 'Move hue grid' : 'Hue'} data-mirror={mirror || undefined}>
    {MOVE_COLOR_WHEEL.map((h, index) => {
      return <button key={index} type="button" className="tweakers-move-hue"
        style={{ background: `hsl(${h} 100% 50%)` }} disabled={disabled}
        aria-label={`Hue ${Number(h.toFixed(2))} degrees`} aria-pressed={selected === index}
        onClick={() => MoveColorStore.setHue(h)}>
        {selected === index && <span className="tweakers-move-color-marker" aria-hidden="true" />}
      </button>;
    })}
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

export function MoveColorDisplay({ panelId, meta, anchor, theme }: {
  panelId: string; meta: ControlMeta; anchor: RefObject<HTMLDivElement>; theme: TweakTheme;
}) {
  const display = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const color = MoveColorStore.read(panelId, meta.path);
  const disabled = TweakStore.isDisabled(panelId, meta.path);
  const close = () => {
    if (display.current?.contains(document.activeElement)) {
      anchor.current?.querySelector<HTMLButtonElement>('[data-kind="color"][aria-expanded="true"]')?.focus();
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
  const content = <div ref={display} className="tweakers-root tweakers-move tweakers-move-color-display" data-theme={theme}
    role="dialog" aria-label={`${meta.label} color editor`} style={position}>
    <div className="tweakers-move-color-heading">
      <span className="tweakers-move-color-preview" aria-hidden="true"><span style={{ background: String(TweakStore.getValue(panelId, meta.path)) }} /></span>
      <span className="tweakers-move-color-name">{meta.label}</span>
      <output>{Math.round(color.h)}°</output>
      <button type="button" className="tweakers-move-color-close" aria-label="Close color editor" onClick={close}>×</button>
    </div>
    <MoveHueGrid color={color} disabled={disabled} />
    <label className="tweakers-move-color-range"><span>Luminosity</span><input type="range" min="0" max="1" step="0.01" value={color.l} disabled={disabled}
      aria-label="Luminosity" aria-valuetext={`${Math.round(color.l * 100)}%`} onChange={(e) => MoveColorStore.setLuminosity(Number(e.target.value))} /><output>{Math.round(color.l * 100)}%</output></label>
    <label className="tweakers-move-color-range"><span>Opacity</span><input type="range" min="0" max="1" step="0.01" value={color.a} disabled={disabled}
      aria-label="Opacity" aria-valuetext={`${Math.round(color.a * 100)}%`} onChange={(e) => MoveColorStore.setOpacity(Number(e.target.value))} /><output>{Math.round(color.a * 100)}%</output></label>
  </div>;
  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}
