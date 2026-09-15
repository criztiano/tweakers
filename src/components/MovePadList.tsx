import { useEffect, useRef } from 'react';
import { MovePadListStore, type MovePadListView } from '../move-pad-list';
import { MoveFunctions } from '../move-functions';
import { MoveFunctionChipButton } from './MoveFunctionChips';
import { MovePadActionBody, MovePadListBody } from './move-slots';

/** The action pad anchors its list; the shared list body supplies every row. */
export function MovePadList({ panelId, path, label, view, disabled }: {
  panelId: string; path: string; label: string; view: MovePadListView | null; disabled: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const open = view?.panelId === panelId && view.path === path;
  useEffect(() => () => {
    const current = MovePadListStore.getView();
    if (current?.panelId === panelId && current.path === path) MovePadListStore.close();
  }, [panelId, path]);
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) return;
      if (['Enter', ' '].includes(event.key) && (event.target as Element).closest?.('.tweakers-move-chip[data-name="capture"]')) return;
      if (!['Escape', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'x', 'X'].includes(event.key)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (event.repeat && ['Enter', ' '].includes(event.key)) return;
      if (event.key.toLowerCase() === 'x') void MovePadListStore.submit();
      else if (event.key === 'Escape') { MovePadListStore.close(); root.current?.querySelector('button')?.focus(); }
      else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') MovePadListStore.move(event.key === 'ArrowUp' ? -1 : 1);
      else MovePadListStore.toggleCursor();
    };
    const outside = (event: PointerEvent) => { if (!(event.target as Element).closest?.('.tweakers-move-chip[data-name="capture"], .tweakers-move-chip[data-name="sample"], [data-pad-list-dial]') && !root.current?.contains(event.target as Node)) MovePadListStore.close(); };
    const jogClick = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); MovePadListStore.toggleCursor(); };
    window.addEventListener('keydown', key, true);
    window.addEventListener('pointerdown', outside);
    window.addEventListener('move-tweakers:jog-click', jogClick, true);
    return () => {
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('pointerdown', outside);
      window.removeEventListener('move-tweakers:jog-click', jogClick, true);
    };
  }, [open]);
  return <div className="tweakers-move-pad-list-anchor" ref={root}>
    <button type="button" className="tweakers-move-pad" data-kind="list" data-latched={open || undefined}
      aria-expanded={open} aria-haspopup="listbox" disabled={disabled}
      onClick={() => MovePadListStore.toggle(panelId, path)}>
      <MovePadActionBody label={label} />
    </button>
    {open && <div className="tweakers-move-dial-screen tweakers-move-pad-list-overlay" onWheel={event => { event.stopPropagation(); MovePadListStore.move(event.deltaY); }}>
      <MovePadListBody view={view} onCursor={index => MovePadListStore.setCursor(index)} onToggle={() => MovePadListStore.toggleCursor()} />
      <div className="tweakers-move-pad-list-submit">
        {MoveFunctions.chips().filter(chip => chip.name === 'capture').map(chip => <MoveFunctionChipButton key={chip.name} chip={{ ...chip, color: 'lime' }} disabled={view.pending} />)}
      </div>
    </div>}
  </div>;
}
