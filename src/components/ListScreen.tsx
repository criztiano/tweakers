import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react';
import { ICON_CHECK, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT, ICON_ELLIPSIS } from '../icons';

/** Where a row goes when it is taken, drawn at its end. `page` is a chevron —
 * the list is replaced by the one this row leads to, so the same mark reads
 * as one level of nesting; `back` is that chevron turned around, and sits at
 * the left end where the eye looks to leave. `dialog` is an ellipsis:
 * something opens over the list and the list is still there behind it. A row
 * without a detail settles a value where it stands. */
export type ListScreenDetail = 'page' | 'dialog' | 'back';

/** A row: a plain string, or a value with a separate display label, an
 * optional inline tag pinned to the row's right end, and an optional detail
 * marking where it leads. `muted` marks a row the host has nothing to act on
 * — it still walks and selects, it just never brightens, so a list can carry
 * information alongside its choices.
 *
 * `checked` is the other axis: where the cursor is, and what is switched on,
 * are different questions. A list can answer both at once — the cursor rides
 * the highlight, every switched-on row reads bright and wears a tick — so a
 * run of choices can be built up without losing your place in it. */
export type ListScreenItem =
  | string
  | {
      value: string;
      label?: string;
      tag?: string;
      muted?: boolean;
      detail?: ListScreenDetail;
      checked?: boolean;
    };

export interface ListScreenProps {
  /** Rows in display order. */
  items: ListScreenItem[];
  /** The selected item's value. */
  value?: string;
  /** Called with a row's value when it is clicked. */
  onSelect?: (value: string) => void;
  /** 400px with left-aligned rows, instead of the 200px centered default. */
  wide?: boolean;
  /**
   * How the view follows the selection. `nearest` (the default) scrolls only
   * far enough to bring the row into view; `center` holds the selection in
   * the middle of the screen, so a long list runs past a still row and only
   * the two ends of it can push the selection off centre.
   */
  follow?: 'nearest' | 'center';
  className?: string;
  style?: CSSProperties;
}

function itemValue(item: ListScreenItem): string {
  return typeof item === 'string' ? item : item.value;
}

function itemLabel(item: ListScreenItem): string {
  return typeof item === 'string' ? item : item.label ?? item.value;
}

function itemTag(item: ListScreenItem): string | undefined {
  return typeof item === 'string' ? undefined : item.tag;
}

function itemMuted(item: ListScreenItem): boolean {
  return typeof item === 'string' ? false : Boolean(item.muted);
}

function itemDetail(item: ListScreenItem): ListScreenDetail | undefined {
  return typeof item === 'string' ? undefined : item.detail;
}

function itemChecked(item: ListScreenItem): boolean | undefined {
  return typeof item === 'string' ? undefined : item.checked;
}

/** The row's mark, pinned to an edge rather than laid out beside the label,
 * so a centred row's name stays exactly where it was. Where a row leads
 * outranks whether it is switched on: a row that goes somewhere is not a
 * thing you switch, so the two never really compete. */
function ListScreenMark({ detail, checked }: { detail?: ListScreenDetail; checked?: boolean }) {
  const stroke = { stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <span className="tweakers-list-screen-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {detail === 'page' || detail === 'back'
          ? <path d={detail === 'back' ? ICON_CHEVRON_LEFT : ICON_CHEVRON_RIGHT} strokeWidth="2" {...stroke} />
          : detail === 'dialog'
          ? ICON_ELLIPSIS.map((c) => <circle key={c.cx} cx={c.cx} cy={c.cy} r="1.75" fill="currentColor" />)
          : checked
          ? <path d={ICON_CHECK} strokeWidth="2.5" {...stroke} />
          : null}
      </svg>
    </span>
  );
}

/**
 * The Move's dark list screen (Figma node "list screen"): a column of
 * single-line rows on the display surface. Unselected rows sit dim at 22%
 * text opacity; the selected row reads at full brightness on a soft
 * highlight. Ten and a half rows show before the screen scrolls — the cut
 * row is the hint that there's more below — and the view follows the
 * selection as it moves. A `muted` row stays dim even when it is the
 * selection: it is information the list carries, not a choice. Purely
 * presentational: the host owns the selection state and any wheel or
 * arrow-key stepping.
 */
export function ListScreen({
  items,
  value,
  onSelect,
  wide,
  follow = 'nearest',
  className,
  style,
}: ListScreenProps): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // `data-over-top` / `data-over-bottom` mark rows scrolled out of sight,
    // for hosts that soften the edge they went behind: an edge hiding
    // nothing must stay crisp, or the end of a list reads as damage.
    const syncEdges = () => {
      const end = root.scrollHeight - root.clientHeight;
      root.toggleAttribute?.('data-over-top', root.scrollTop > 1);
      root.toggleAttribute?.('data-over-bottom', root.scrollTop < end - 1);
    };
    const sync = () => {
      const selected = root.querySelector<HTMLElement>('[data-selected]');
      if (selected) {
        const row = selected.getBoundingClientRect();
        const box = root.getBoundingClientRect();
        const top = row.top - box.top + root.scrollTop;
        const bottom = top + row.height;
        // Scroll only this display: scrollIntoView also moves the host page,
        // and a list on the panel is not a reason to move what is behind it.
        const next = follow === 'center' ? top - (root.clientHeight - row.height) / 2
          : top < root.scrollTop ? top
          : bottom > root.scrollTop + root.clientHeight ? bottom - root.clientHeight
          : root.scrollTop;
        root.scrollTop = Math.max(0, Math.min(next, root.scrollHeight - root.clientHeight));
      }
      syncEdges();
    };
    sync();
    root.addEventListener('scroll', syncEdges, { passive: true });

    // A host can resize the screen under the list — the Move slot grows one
    // to the whole list while it is touched — which changes both what is
    // hidden and where the middle is.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    observer?.observe(root);
    return () => {
      observer?.disconnect();
      root.removeEventListener('scroll', syncEdges);
    };
  }, [value, follow, items.length]);

  const rootClassName = ['tweakers-list-screen', className].filter(Boolean).join(' ');

  // The keyboard walks the rows the way the wheel does: arrows move focus,
  // and Enter or Space presses the focused row — which on a multi-select
  // list is a toggle, because the host's onSelect is the toggle.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const rows = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('.tweakers-list-screen-row')
    );
    if (!rows.length) return;
    const active = document.activeElement as HTMLButtonElement | null;
    const at = active ? rows.indexOf(active) : -1;
    const fallback = rows.findIndex((row) => row.hasAttribute('data-selected'));
    const from = at !== -1 ? at : fallback;
    const next = rows[(from === -1 ? (event.key === 'ArrowDown' ? -1 : rows.length) : from) + (event.key === 'ArrowDown' ? 1 : -1)];
    if (!next) return;
    event.preventDefault();
    next.focus();
  };

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      style={style}
      data-wide={wide || undefined}
      role="listbox"
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const rowValue = itemValue(item);
        const selected = rowValue === value;
        const tag = itemTag(item);
        const detail = itemDetail(item);
        const checked = itemChecked(item);
        return (
          <button
            key={rowValue}
            type="button"
            role="option"
            aria-selected={selected}
            className="tweakers-list-screen-row"
            data-selected={selected || undefined}
            data-tagged={tag ? true : undefined}
            data-detail={detail}
            data-checked={checked}
            aria-checked={checked}
            data-muted={itemMuted(item) || undefined}
            onClick={() => onSelect?.(rowValue)}
          >
            <span className="tweakers-list-screen-label">{itemLabel(item)}</span>
            {tag && <span className="tweakers-list-screen-tag">{tag}</span>}
            {(detail || checked) && <ListScreenMark detail={detail} checked={checked} />}
          </button>
        );
      })}
    </div>
  );
}
