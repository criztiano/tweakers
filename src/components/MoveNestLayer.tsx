import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { ControlMeta } from '../store/TweakStore';
import { dialSpan } from '../move-layout';
import { MoveFunctions } from '../move-functions';
import { ICON_CHEVRON_LEFT } from '../icons';
import { MoveSlot } from './MoveSlot';

/** What the layer shows: the dial it belongs to, its children, and the screen
 *  column the dial stands in (where the sheet grows from). */
export interface MoveNestView {
  parent: ControlMeta;
  children: ControlMeta[];
  origin: number;
}

export interface MoveNestLayerProps {
  panelId: string;
  /** The open layer, or null — closing plays out before the sheet goes. */
  view: MoveNestView | null;
  /** The dial row the sheet lifts off: its cells sit on that row's columns. */
  row: RefObject<HTMLElement | null>;
  /** The dial to hand focus back to once the sheet goes, asked as it opens. */
  returnFocus: () => HTMLElement | null;
  /** The value-first face, as the page's own dials choose it. */
  valueFirst: (meta: ControlMeta) => boolean;
  onClose: () => void;
}

type Box = { left: number; top: number; width: number; height: number };

const sameBox = (a: Box | null, b: Box) =>
  !!a && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;

const editable = (t: EventTarget | null) =>
  typeof HTMLElement !== 'undefined' && t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * A dial's nested layer (`moveNest`): a lifted sheet of the same instrument,
 * floating over the dial row — not a dialog. Its cells are `MoveSlot`s, the
 * very faces and drag rules the page's dials wear, and they stand exactly on
 * the dial row's columns: child k on column k, the sheet's padding bleeding
 * outside them. The box is measured off the live row, and a cell is the
 * row's own share of it (`--move-cols`, `--move-gap`), so it holds for both
 * docks and through every resize.
 *
 * It opens on the ease-out and closes faster; a close can be taken back
 * mid-way. While it stands, everything else in the panel's inside is inert,
 * and Escape, the back tab and the Move's Back key close it.
 */
export function MoveNestLayer({ panelId, view, row, returnFocus, valueFirst, onClose }: MoveNestLayerProps) {
  const open = view !== null;
  // The last view stays on show while the sheet closes.
  const last = useRef<MoveNestView | null>(null);
  if (view) last.current = view;
  const shown = view ?? last.current;
  // In the DOM at all, and wearing its open look — two steps, so a sheet
  // arriving starts from its closed look and moves.
  const [present, setPresent] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const back = useRef(returnFocus);
  back.current = returnFocus;

  // Where the row stands in the panel's inside, measured off the live DOM.
  const measure = () => {
    const el = anchor.current;
    const frame = el?.offsetParent as HTMLElement | null;
    const r = row.current;
    if (!el || !frame || !r) return;
    const f = frame.getBoundingClientRect();
    const b = r.getBoundingClientRect();
    // The frame may be mid-zoom; read it at its own scale.
    const s = frame.offsetWidth ? f.width / frame.offsetWidth : 1;
    const next = { left: (b.left - f.left) / s, top: (b.top - f.top) / s, width: b.width / s, height: b.height / s };
    setBox((prev) => (sameBox(prev, next) ? prev : next));
  };

  useLayoutEffect(() => {
    if (open && !present) setPresent(true);
  }, [open, present]);

  // Every commit while the sheet stands: the row may have moved under it.
  useLayoutEffect(() => {
    if (present) measure();
  });

  useLayoutEffect(() => {
    if (!present) return;
    const el = anchor.current;
    const frame = el?.offsetParent;
    if (!el || !frame || typeof ResizeObserver === 'undefined') return;
    const watch = new ResizeObserver(() => measure());
    watch.observe(frame);
    if (row.current) watch.observe(row.current);
    return () => watch.disconnect();
  }, [present]);

  // Opening: the sheet first lands and paints in its closed look — its slots
  // mounted, its layers made — and lifts on a later frame, so all of that
  // work stays out of the movement's first frame. Closing: drop the look; the
  // sheet leaves once its fade ends (or at once, when nothing is moving).
  useEffect(() => {
    if (!present || !open || lifted) return;
    // No frames to wait for (a server, a test): lift at once.
    if (typeof requestAnimationFrame === 'undefined') {
      setLifted(true);
      return;
    }
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setLifted(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open, present, lifted]);

  useLayoutEffect(() => {
    if (!present) return;
    if (!open && lifted) {
      setLifted(false);
    } else if (!open && !lifted) {
      const moving = sheet.current?.getAnimations?.().length ?? 0;
      if (!moving) setPresent(false);
    }
  }, [open, present, lifted]);

  // The everything-else of the panel's inside goes inert while the sheet
  // stands: the header, the page's own slots and pads.
  useLayoutEffect(() => {
    if (!open || !present) return;
    const el = anchor.current;
    const behind = Array.from(el?.parentElement?.children ?? []).filter((c): c is HTMLElement => c !== el && 'inert' in c);
    for (const b of behind) b.inert = true;
    return () => { for (const b of behind) b.inert = false; };
  }, [open, present]);

  // Focus moves into the sheet on its way in, and back to its dial on the way
  // out — unless it has gone somewhere else meanwhile.
  useEffect(() => {
    if (!lifted) return;
    const home = back.current();
    const s = sheet.current;
    s?.querySelector<HTMLElement>('[tabindex="0"], button:not([disabled])')?.focus({ preventScroll: true });
    return () => {
      if (typeof document === 'undefined') return;
      const at = document.activeElement;
      if (at && at !== document.body && !s?.contains(at)) return;
      if (home?.isConnected) home.focus({ preventScroll: true });
    };
  }, [lifted]);

  // Escape and the Move's Back close it, the way every lifted thing closes.
  useEffect(() => {
    if (!open) return;
    const release = MoveFunctions.push('back', () => close.current(), { label: 'Close', chip: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || editable(e.target)) return;
      e.preventDefault();
      close.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      release();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!present || !shown) return null;
  const { parent, children, origin } = shown;
  const cols = children.reduce((n, c) => n + dialSpan(c), 0);
  return (
    <div
      ref={anchor}
      className="tweakers-move-nest"
      data-open={lifted || undefined}
      style={{
        ...(box ? { left: box.left, top: box.top, width: box.width, height: box.height } : { visibility: 'hidden' as const }),
        ['--move-nest-origin' as string]: origin,
        ['--move-nest-span' as string]: cols,
      } as CSSProperties}
    >
      <div
        ref={sheet}
        className="tweakers-move-nest-sheet"
        role="group"
        aria-label={`${parent.label}, more controls`}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'opacity' && !open) setPresent(false);
        }}
      >
        <div className="tweakers-move-nest-row">
          {children.map((c) => (
            <MoveSlot
              key={c.path}
              panel={panelId}
              path={c.path}
              valueFirst={valueFirst(c)}
              style={dialSpan(c) > 1 ? { gridColumn: `span ${dialSpan(c)}` } : undefined}
            />
          ))}
        </div>
        <button type="button" className="tweakers-move-nest-back" onClick={() => close.current()}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={ICON_CHEVRON_LEFT} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{parent.label}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * The quiet mark on a dial that has a nested layer: a small "+" in its top
 * right corner, laid on the dial row's grid in the dial's column, so it
 * touches nothing of the slot itself. One piece — drop its line in MovePanel
 * and its rule in theme.css and it is gone.
 */
export function MoveNestMark({ column }: { column: number }) {
  return <span className="tweakers-move-nest-mark" aria-hidden="true" style={{ gridColumn: `${column + 1} / span 1`, gridRow: 1 }}>+</span>;
}
