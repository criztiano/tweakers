import { useEffect, useId, useRef } from 'react';
import { TweakStore } from '../store/TweakStore';
import { ModulationStore } from '../store/ModulationStore';
import {
  modColor,
  modGlyph,
  modRingArc,
  MOD_RING_RADIUS,
  MOD_RING_CIRCUMFERENCE,
  type ModulationAssignment,
  type ModulationSlot,
} from '../modulation-core';
import { MOD_GLYPHS } from '../icons';

/**
 * The modulation ring: a control wired to a slot wears a small dial in the
 * slot's palette colour, and an arc running from the control's own value to
 * where the modulation is holding it right now. The arc dances at the
 * modulator's rate — the value the app reads, shown where it is edited,
 * while the control itself keeps the base the user set.
 *
 * One ring for every surface the kit draws a control on — the dock's rows and
 * the Move panel's slots — so "this one is wired" reads the same wherever you
 * meet it. `className` is what each surface uses to place it.
 *
 * Drawn straight to the arc's dash attributes per frame, the MovePanel
 * circle's pattern, so the panel never re-renders for it. Under reduced
 * motion it holds still at the modulation's full reach instead, which says
 * the same thing about depth without the movement.
 */
export function ModRing({
  panelId,
  path,
  assignment,
  className,
}: {
  panelId: string;
  path: string;
  assignment: ModulationAssignment;
  className?: string;
}) {
  const arcRef = useRef<SVGCircleElement>(null);
  const color = modColor(assignment.slot);

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;

    // Anchored on the base and the live value, both as fractions of the
    // control's span — the arc is the gap between them.
    const draw = (from: number, to: number) => {
      const { length, offset } = modRingArc(from, to);
      el.setAttribute('stroke-dasharray', `${length.toFixed(2)} ${MOD_RING_CIRCUMFERENCE.toFixed(2)}`);
      el.setAttribute('stroke-dashoffset', offset.toFixed(2));
    };

    const bounds = ModulationStore.getBounds(panelId, path);
    const span = bounds ? bounds.max - bounds.min : 0;
    const base01 = () =>
      span ? (Number(TweakStore.getValue(panelId, path)) - bounds!.min) / span : 0;

    if (!span) return;

    const still =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      // The reach: half the span each way at full amount, the same geometry
      // applyModulation sweeps through. It follows the base the user drags,
      // just not the signal.
      const reach = assignment.amount / 2;
      const drawReach = () => draw(base01() - reach, base01() + reach);
      drawReach();
      return TweakStore.subscribe(panelId, drawReach);
    }

    return ModulationStore.subscribeFrames(() => {
      const b = base01();
      draw(b, b + (ModulationStore.getOffset(panelId, path) / span));
    });
  }, [panelId, path, assignment.slot, assignment.amount]);

  return (
    <svg
      className={['tweakers-mod-ring', className].filter(Boolean).join(' ')}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle className="tweakers-mod-ring-track" cx="8" cy="8" r={MOD_RING_RADIUS} />
      <circle
        ref={arcRef}
        className="tweakers-mod-ring-arc"
        cx="8"
        cy="8"
        r={MOD_RING_RADIUS}
        stroke={color}
        strokeDasharray={`0 ${MOD_RING_CIRCUMFERENCE}`}
      />
    </svg>
  );
}

/** The step circle's face, on a 24px grid: the value ring, and the dot inside it. */
const DOT_RING_RADIUS = 10.5;
const DOT_RING_CIRCUMFERENCE = 2 * Math.PI * DOT_RING_RADIUS;
const DOT_RADIUS = 8;

/**
 * A modulation slot's face in the step row: a dot in the slot's colour with
 * its type's mark cut out of it — the wave, the die, the envelope, the keys,
 * the arch, the note — so a row of circles says which modulator is which.
 * A ring around it swings with the slot's live signal on a knob's sweep,
 * out from the top the way the signal pushes a control from its base: an
 * LFO rocks either side, an envelope climbs one way and falls back to rest.
 *
 * The arc is written straight to its dash attributes per frame, the ring's
 * own pattern, so the panel never re-renders for it. Under reduced motion
 * the ring stays empty and the dot and its mark still say which slot it is.
 */
export function ModDot({ slot }: { slot: ModulationSlot }) {
  const arcRef = useRef<SVGCircleElement>(null);
  const maskId = `tweakers-mod-dot-${useId().replace(/:/g, '')}`;
  const color = modColor(slot.index);
  const glyph = modGlyph(slot);
  const mark = glyph ? MOD_GLYPHS[glyph] : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    return ModulationStore.subscribeFrames(() => {
      const el = arcRef.current;
      if (!el) return;
      const { length, offset } = modRingArc(0.5, (ModulationStore.getSignal(slot.index) + 1) / 2, DOT_RING_CIRCUMFERENCE);
      el.setAttribute('stroke-dasharray', `${length.toFixed(2)} ${DOT_RING_CIRCUMFERENCE.toFixed(2)}`);
      el.setAttribute('stroke-dashoffset', offset.toFixed(2));
    });
  }, [slot.index]);

  return (
    <svg className="tweakers-move-mod-face" viewBox="0 0 24 24" aria-hidden="true" data-glyph={glyph ?? undefined}>
      {mark && (
        <mask id={maskId}>
          <circle cx="12" cy="12" r={DOT_RADIUS} fill="white" />
          {/* Black in a mask is a cut: the marks are holes, not paint. */}
          <g fill="none" stroke="black" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {mark.paths?.map((d) => <path key={d} d={d} />)}
          </g>
          <g fill="black">
            {mark.fills?.map((d) => <path key={d} d={d} />)}
            {mark.circles?.map((c) => <circle key={`${c.cx},${c.cy}`} {...c} />)}
          </g>
        </mask>
      )}
      <circle className="tweakers-mod-ring-track tweakers-move-mod-track" cx="12" cy="12" r={DOT_RING_RADIUS} />
      <circle
        ref={arcRef}
        className="tweakers-mod-ring-arc tweakers-move-mod-arc"
        cx="12"
        cy="12"
        r={DOT_RING_RADIUS}
        stroke={color}
        strokeDasharray={`0 ${DOT_RING_CIRCUMFERENCE}`}
      />
      <circle
        className="tweakers-move-mod-dot"
        cx="12"
        cy="12"
        r={DOT_RADIUS}
        fill={color}
        mask={mark ? `url(#${maskId})` : undefined}
      />
    </svg>
  );
}

/**
 * A wired control's ring, on this surface: the dock panel's own ring — slot
 * colour, live arc — placed in a dial slot's corner, or inline on a pad chip.
 * Module scope, not a closure inside the panel: the arc subscribes per frame,
 * and a component re-declared on every render would tear that down and build
 * it again on every value the panel draws.
 */
export function MoveModRing({ panelId, path, pad }: { panelId: string; path: string; pad?: boolean }) {
  const assignment = ModulationStore.getAssignment(panelId, path);
  if (!assignment || !ModulationStore.getSlot(assignment.slot)) return null;
  return (
    <ModRing
      panelId={panelId}
      path={path}
      assignment={assignment}
      className={pad ? 'tweakers-move-pad-mod' : 'tweakers-move-dial-mod'}
    />
  );
}
