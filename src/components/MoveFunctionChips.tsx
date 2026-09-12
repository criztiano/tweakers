import { useEffect, useRef, useState } from 'react';
import { MoveFunctions, type MoveFunctionChip } from '../move-functions';
import { MOVE_FUNCTION_ICONS, type MoveFunctionGlyph } from '../icons';

/** How long a chip stays lit after a press (screen or hardware). */
const PRESS_FLASH_MS = 160;

/**
 * Chip names the manifest spells differently from the print: the jog click
 * is the Enter key in the hand, and a few names carry digits or positions.
 * Everything else derives from the manifest name (`full_velocity` →
 * "Full Velocity"), so an attach without a label still reads as the key.
 */
const CHIP_NAMES: Partial<Record<string, string>> = {
  jog_click: 'Enter',
  pitches_16: '16 Pitches',
  step4: 'Step 4',
  step12: 'Step 12',
  step14: 'Step 14',
};

/** The printed name for a button — the label a chip wears when the attach names none. */
export function moveFunctionChipName(name: string): string {
  return CHIP_NAMES[name]
    ?? name.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

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
      data-pressed={pressed || undefined}
      onClick={() =>
        // A Shift-layer function's press always carries its shift and step —
        // the chip is that gesture on this side of the glass.
        MoveFunctions.run(chip.name, chip.step != null ? { shift: true, step: chip.step } : { shift: false })
      }
    >
      <ChipGlyph glyph={MOVE_FUNCTION_ICONS[chip.name]} />
      {chip.label ?? moveFunctionChipName(chip.name)}
    </button>
  );
}

export interface MoveFunctionChipsProps {
  className?: string;
}

/**
 * The attached functions, as on-screen chips — the panel header's mirror of
 * the hardware's lit buttons. An app that attaches a function through
 * `MoveFunctions.attach` gets its chip here for free: same icon on every
 * app (the canonical map in `icons.ts`), the attach's `label` (or the
 * printed name), and a click that runs the very handler the hardware key
 * runs. Detach removes it; a `push` overlay's chip stands in while it holds
 * the button. Reserved names and `chip: false` attachments never render —
 * see `MoveFunctions.chips()`.
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
