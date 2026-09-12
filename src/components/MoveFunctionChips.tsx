import { useEffect, useRef, useState } from 'react';
import { MoveFunctions, type MoveFunctionChip } from '../move-functions';
import { MOVE_PALETTE } from '../move-palette';
import { MOVE_FUNCTION_ICONS, type MoveFunctionGlyph } from '../icons';

/** How long a chip stays lit after a press (screen or hardware). */
const PRESS_FLASH_MS = 160;

/** One glyph, drawn as the icon map says: stroked prints, filled marks, dots. */
function ChipGlyph({ glyph }: { glyph: MoveFunctionGlyph }) {
  return (
    <svg className="tweakers-move-chip-icon" width={glyph.size} height={glyph.size} viewBox={glyph.viewBox} fill="none">
      {glyph.paths?.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {glyph.fills?.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
      {glyph.circles?.map((c) => (
        <circle key={`${c.cx},${c.cy}`} {...c} fill="currentColor" />
      ))}
    </svg>
  );
}

function Chip({ chip }: { chip: MoveFunctionChip }) {
  const [pressed, setPressed] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Hardware presses arrive as runs; screen clicks go through run() too, so
  // one listener flashes the chip for both — the same beat the hardware key
  // lights to.
  useEffect(() => {
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran !== chip.name) return;
      setPressed(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [chip.name]);

  return (
    <button
      type="button"
      className="tweakers-move-chip"
      data-name={chip.name}
      data-variant={chip.variant}
      data-color={chip.color}
      data-pressed={pressed || undefined}
      // A colour is only ever a kit palette name — chips() has already
      // checked it against MOVE_PALETTE, so this lookup never invents a hue.
      style={chip.color ? { background: MOVE_PALETTE[chip.color] } : undefined}
      onClick={() => MoveFunctions.run(chip.name, { shift: false })}
    >
      <ChipGlyph glyph={MOVE_FUNCTION_ICONS[chip.name]} />
      {chip.label}
    </button>
  );
}

export interface MoveFunctionChipsProps {
  className?: string;
}

/**
 * The attached functions, as on-screen chips — the panel header's mirror of
 * the hardware's lit buttons, for the keys whose meaning is the app's to
 * give (`MOVE_CHIP_BUTTONS`: the Sampling key, Capture, Mute, Loop). An app
 * that attaches one with a `label` gets its chip for free: the key's
 * canonical icon (`icons.ts`), the label saying what it does here, and a
 * click that runs the very handler the hardware key runs. No label, no chip
 * — a chip never wears a hardware name. Detach removes it; a `push`
 * overlay's chip stands in while it holds the button; `chip: false` hides
 * one; `chip: { variant, color }` dresses one — see MoveFunctionChipStyle.
 *
 * `MovePanel` mounts this by its `functionChips` placement option; a host
 * with its own chrome may also place it directly.
 */
export function MoveFunctionChips({ className }: MoveFunctionChipsProps) {
  const [chips, setChips] = useState(() => MoveFunctions.chips());
  useEffect(() => {
    setChips(MoveFunctions.chips());
    return MoveFunctions.subscribe(() => setChips(MoveFunctions.chips()));
  }, []);
  if (!chips.length) return null;
  return (
    <div className={className ? `tweakers-move-chips ${className}` : 'tweakers-move-chips'}>
      {chips.map((chip) => (
        <Chip key={chip.name} chip={chip} />
      ))}
    </div>
  );
}
