import { Fragment, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import {
  MovePanel,
  MovePresetStore,
  MOVE_JOG_EVENT,
  MOVE_STRIP_EVENT,
  TweakStore,
  buildMoveStrip,
  stripOffsets,
} from 'tweakers';
import { PANEL_ID, PANEL_NAME } from './panel';
import { BIG_SLOTS, SMALL_SLOTS, SMALL_SLOT_STATES, MOD_FACES, type Specimen } from './specimens';
import { KEYS, openPresets, savePreset } from './hardware';

/**
 * The kit's library: every face a Move slot can wear, live in one
 * instrument, and drawn again on its own card. The page is longer than the
 * hardware on purpose — the strip scrolls under the eight dials, so a
 * dictionary of twenty slots is still one panel and every entry can be
 * turned.
 *
 * The order is the argument: the slots that fit almost any number first,
 * the ones that mean exactly one thing last.
 */

export function Library() {
  // Where the strip's window sits, straight from the panel — the same event
  // the bridge kit reads to point the hardware's knobs at these eight.
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onStrip = (e: Event) => setOffset(Number((e as CustomEvent).detail?.offset) || 0);
    window.addEventListener(MOVE_STRIP_EVENT, onStrip);
    return () => window.removeEventListener(MOVE_STRIP_EVENT, onStrip);
  }, []);

  // Bring a control under the first dial: the wheel counts controls, so the
  // jump is the distance between two stops on the strip.
  const show = (path: string) => {
    const panel = TweakStore.getPanel(PANEL_ID);
    if (!panel) return;
    const strip = buildMoveStrip(panel);
    const stops = stripOffsets(strip);
    const column = strip.dials.findIndex((meta) => meta.path === path);
    if (column < 0) return;
    const stopAt = (col: number) => {
      let i = 0;
      while (i + 1 < stops.length && stops[i + 1] <= col) i++;
      return i;
    };
    window.dispatchEvent(new CustomEvent(MOVE_JOG_EVENT, {
      detail: { delta: stopAt(column) - stopAt(offset) },
    }));
  };

  return (
    <main className="kit-page">
      <style>{CSS}</style>

      <header className="kit-header">
        <h1>Move kit</h1>
        <p className="kit-lede">
          Every face a dial slot can wear, in one instrument. The page carries more
          slots than the Move has dials, so the row scrolls: turn the big wheel — or
          the mouse wheel over the panel, or drag the rail under it — and the whole
          set comes past. The Move’s arrows jump a whole screen of eight. Whatever is
          on screen is what the eight knobs are holding, pads and all.
        </p>
        <p className="kit-lede">
          Left to right the slots run from general to specific: a plain value first,
          a stereo width in semitones last.
        </p>
      </header>

      {/* The instrument sits where it sits in a real app: pinned to the
          bottom edge, over the page, with the reading matter running under
          it. `viewport` docking portals it out of this tree — the page only
          has to keep its own bottom clear. */}
      <MovePanel panels={PANEL_NAME} theme="dark" scroll productionEnabled />

      <Section
        id="big"
        title="Big slots"
        lede="One column of the dial row — two for the filter, four for the envelope. Every body is a pure drawing of computed props, so a face is written once and reused everywhere; the gestures stay with the panel."
      >
        <ul className="kit-cards">
          {BIG_SLOTS.map((item) => (
            <Card key={item.kind} item={item} onShow={show} tall />
          ))}
        </ul>
      </Section>

      <Section
        id="presets"
        title="Presets"
        lede="A whole page, saved and walked through on the wheel. The navigator lives behind the Move’s Menu button: it opens a list beside the slots, and every row you rest on plays right away — the slots move under it. Keep one with the wheel press, put your old settings back with Back, or hold Mute to hear where you came from."
      >
        <PresetPanel />
      </Section>

      <Section
        id="small"
        title="Small slots"
        lede="The pad row under the dials — on the instrument above, too: Sync and Drive ride under Amount, Glide under Bias, Reset under Shape, and they travel with their slots when the wheel moves them. Hold a value chip to peek at it in the dial above; tap to latch it in."
      >
        <ul className="kit-cards">
          {SMALL_SLOTS.map((item) => (
            <Card key={item.kind} item={item} onShow={show} />
          ))}
        </ul>
        <h3 className="kit-sub">and their states</h3>
        <div className="kit-pad-states">
          {SMALL_SLOT_STATES.map((state) => (
            <div key={state.label} className="kit-pad-state">
              <div className="kit-tile kit-tile-pad">
                <div className="tweakers-move">
                  <button type="button" className="tweakers-move-pad" {...state.props}>
                    {state.render()}
                  </button>
                </div>
              </div>
              <span>{state.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="mod"
        title="Modulation"
        lede="What a wired control and a running modulator look like. These are the library’s own slots — the ring, the composer and the scope above are all moving on real signals."
      >
        <ul className="kit-cards">
          {MOD_FACES.map((item) => (
            <li key={item.kind} className="kit-card kit-card-wide">
              <div className="kit-card-head"><code>{item.kind}</code></div>
              <div className="kit-tile kit-tile-free">
                <div className="tweakers-move">{item.render()}</div>
              </div>
              <p>{item.description}</p>
              {item.note && <p className="kit-card-note">{item.note}</p>}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="reading" title="Reading the instrument">
        <dl className="kit-notes">
          <dt>The wheel</dt>
          <dd>
            One detent, one control. The window always starts on a whole control, so
            a two-column filter is never cut in half at the edge.
          </dd>
          <dt>The arrows</dt>
          <dd>
            A whole screen of eight at a time. On this side of the glass: shift with
            the arrow keys, or the page keys, once the rail has focus.
          </dd>
          <dt>The pads</dt>
          <dd>
            The small slots ride under the slots they belong to, and scroll with
            them. Hold a value chip to peek at it in the dial above; tap to latch it
            in.
          </dd>
          <dt>The rail</dt>
          <dd>
            Under the strip: how far along the whole set the window sits. Drag it to
            move the window.
          </dd>
          <dt>The circles</dt>
          <dd>
            The modulation slots, in the header. Touch a control then tap a circle to
            wire it; hold one to open the modulator’s own page.
          </dd>
          <dt>Menu</dt>
          <dd>
            The preset navigator — the whole page, saved and walked through on the
            wheel. While one is loaded, turning a slot edits it.
          </dd>
          <dt>The hardware</dt>
          <dd>
            Run the bridge (<code>move</code> repo, port 7787) and the panel mirrors
            the device: the wheel scrolls this strip, the arrows page it, and the
            eight knobs turn the eight slots on screen.
          </dd>
        </dl>
      </Section>
    </main>
  );
}

/**
 * The preset navigator, from this side of the glass. The Move opens it with
 * Menu; a page with no Menu button needs one on screen, and the same two
 * gestures — open, and save what is on the slots now — are all it takes.
 * The rows and the state come straight from the store, so this reads the
 * navigator rather than describing it.
 */
function PresetPanel() {
  useSyncExternalStore(MovePresetStore.subscribe, MovePresetStore.getVersion, () => 0);
  // The active preset lives in the panel's own channel, and loading one
  // rewrites every value on it — so this row follows both.
  useSyncExternalStore(
    useCallback((cb: () => void) => TweakStore.subscribe(PANEL_ID, cb), []),
    () => TweakStore.getActivePresetId(PANEL_ID),
    () => null
  );
  const open = MovePresetStore.getView();
  const items = MovePresetStore.items(PANEL_ID);
  const active = TweakStore.getActivePresetId(PANEL_ID);
  return (
    <div className="kit-presets">
      <div className="kit-preset-actions">
        <button type="button" onClick={() => openPresets(PANEL_ID)}>
          {open && open.phase !== 'closing' ? 'Close the navigator' : 'Open the navigator'}
        </button>
        <button type="button" onClick={() => savePreset(PANEL_ID)}>Save what is on the slots</button>
        <span className="kit-preset-state">
          {open && open.phase !== 'closing'
            ? open.comparing
              ? 'comparing — the settings you came in with'
              : `browsing — ${items.find((i) => i.id === open.cursor)?.label ?? 'nothing'}`
            : active
              ? `on ${items.find((i) => i.id === active)?.label ?? 'a preset'}`
              : 'no preset loaded'}
        </span>
      </div>
      <ul className="kit-preset-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              data-active={item.id === active || undefined}
              data-cursor={open && open.phase !== 'closing' && item.id === open.cursor ? true : undefined}
              onClick={() => TweakStore.loadPreset(PANEL_ID, item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
        {!items.length && <li className="kit-preset-empty">nothing saved yet</li>}
      </ul>
      <p className="kit-card-note">
        The same list the Move shows. Clicking a row here loads it outright;
        on the navigator, resting on a row only previews it — nothing is
        written until you keep it.
      </p>
      <h3 className="kit-sub">The hardware, on a keyboard</h3>
      <dl className="kit-notes">
        {KEYS.map((k) => (
          <Fragment key={k.keys}>
            <dt><kbd>{k.keys}</kbd></dt>
            <dd><b>{k.button}</b> — {k.what}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

function Section({ id, title, lede, children }: {
  id: string; title: string; lede?: string; children: ReactNode;
}) {
  return (
    <section className="kit-section" aria-labelledby={`kit-${id}-title`}>
      <h2 id={`kit-${id}-title`}>{title}</h2>
      {lede && <p>{lede}</p>}
      {children}
    </section>
  );
}

/** A dictionary entry: the face itself, its name, what it says, and a way to
 *  bring the live one under the first dial. */
function Card({ item, onShow, tall }: { item: Specimen; onShow: (path: string) => void; tall?: boolean }) {
  return (
    <li className="kit-card" style={item.span && item.span > 1 ? { gridColumn: `span ${Math.min(2, item.span)}` } : undefined}>
      <div className="kit-card-head">
        <code>{item.kind}</code>
        {item.path && <button type="button" onClick={() => onShow(item.path!)}>Show</button>}
      </div>
      <div className={tall ? 'kit-tile' : 'kit-tile kit-tile-pad'}>
        <div className="tweakers-move">
          {tall ? (
            <div
              className="tweakers-move-dial"
              data-kind={DIAL_KIND[item.kind]}
              data-on={item.kind === 'toggle' || undefined}
              data-sub={item.kind === 'value' || undefined}
              data-visual={NUMERIC_KINDS.includes(item.kind) ? item.kind : undefined}
              data-shape={item.kind === 'curve' || undefined}
              style={item.span && item.span > 1 ? { width: `calc(${item.span} * var(--kit-slot-w) + ${(item.span - 1) * 4}px)` } : undefined}
            >
              {item.render()}
            </div>
          ) : (
            <button type="button" className="tweakers-move-pad" data-kind={item.kind === 'bend' ? 'bend' : item.kind}>
              {item.render()}
            </button>
          )}
        </div>
      </div>
      <p>{item.description}</p>
      {item.note && <p className="kit-card-note">{item.note}</p>}
    </li>
  );
}

/** The `data-kind` each face needs on its slot for the stylesheet to place it. */
const DIAL_KIND: Record<string, string | undefined> = {
  color: 'color', filter: 'filter', xy: 'xy', range: 'range', enum: 'enum',
  icon: 'enum', curve: 'enum', playback: 'enum', toggle: 'toggle', transfer: 'transfer',
  ramp: 'ramp', dial: 'dial', scope: 'scope', env: 'env',
};

const NUMERIC_KINDS = ['opacity', 'blur', 'pan', 'stereo-width', 'pitch'];

const CSS = `
.kit-page {
  --kit-bg: #141414;
  --kit-fg: #e8e6e1;
  --kit-dim: #9a9791;
  --kit-line: #2a2a2a;
  --kit-space: 16px;
  --kit-space-lg: 32px;
  --kit-space-xl: 56px;
  --kit-width: 1120px;
  /* one dial slot, at the width the panel gives it in an 8-wide cluster */
  --kit-slot-w: 128px;
  /* the docked panel's own height, kept clear so the last card is readable
     rather than parked behind the instrument */
  --kit-dock: 340px;
  min-height: 100vh;
  padding: var(--kit-space-xl) var(--kit-space-lg) calc(var(--kit-dock) + var(--kit-space-xl));
  background: var(--kit-bg);
  color: var(--kit-fg);
  font-family: 'Ableton Sans Small', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}
.kit-page *, .kit-page *::before, .kit-page *::after { box-sizing: border-box; }
.kit-header, .kit-section { max-width: var(--kit-width); margin-inline: auto; }
.kit-page h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 400; line-height: 1.15; margin: 0 0 var(--kit-space); }
.kit-page h2 { font-size: 18px; font-weight: 500; margin: 0 0 8px; }
.kit-sub { font-size: 13px; font-weight: 400; color: var(--kit-dim); margin: var(--kit-space-lg) 0 var(--kit-space); }
.kit-page p { max-width: 640px; margin: 0 0 var(--kit-space); color: var(--kit-dim); }
.kit-lede { font-size: 15px; }
.kit-section { margin: var(--kit-space-xl) 0; }

.kit-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--kit-space); list-style: none; margin: var(--kit-space) 0 0; padding: 0; }
.kit-card { display: flex; flex-direction: column; padding: var(--kit-space); border: 1px solid var(--kit-line); border-radius: 12px; }
.kit-card-wide { grid-column: span 2; }
.kit-card p { margin: 0; font-size: 13px; }
.kit-card-note { margin-top: 8px !important; color: #7d7a75; }
.kit-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: var(--kit-space); }
.kit-card code, .kit-notes code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--kit-fg); }
.kit-card button { padding: 4px 10px; color: var(--kit-dim); font: inherit; font-size: 12px; background: none; border: 1px solid var(--kit-line); border-radius: 999px; cursor: pointer; }
.kit-card button:hover { color: var(--kit-fg); border-color: var(--kit-fg); }
.kit-page :focus-visible { outline: 2px solid var(--kit-fg); outline-offset: 2px; }

/* A specimen tile: the kit's own surface, with the panel's chrome taken off
   so only the face is left. The tokens still come from .tweakers-move. */
.kit-tile { margin-bottom: var(--kit-space); overflow-x: auto; }
.kit-tile .tweakers-move { display: block; padding: 0; background: none; }
.kit-tile .tweakers-move-dial { width: var(--kit-slot-w); height: 140px; cursor: default; }
.kit-tile-pad .tweakers-move-pad { width: var(--kit-slot-w); cursor: default; }
.kit-tile-free .tweakers-move { color: var(--move-text, #dee3c9); }
.kit-tile-free .tweakers-move-curve { position: static; }

.kit-preset-actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--kit-space); margin-bottom: var(--kit-space); }
.kit-presets button { min-height: 32px; padding: 4px 12px; color: var(--kit-fg); font: inherit; font-size: 13px; background: none; border: 1px solid var(--kit-line); border-radius: 999px; cursor: pointer; }
.kit-presets button:hover { border-color: var(--kit-fg); }
.kit-preset-state { font-size: 13px; color: var(--kit-dim); font-variant-numeric: tabular-nums; }
.kit-preset-list { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0 0 var(--kit-space); padding: 0; }
.kit-preset-list button[data-active] { color: var(--kit-bg); background: var(--kit-fg); border-color: var(--kit-fg); }
.kit-preset-list button[data-cursor] { border-color: var(--kit-fg); box-shadow: inset 0 0 0 1px var(--kit-fg); }
.kit-preset-empty { font-size: 13px; color: var(--kit-dim); }
.kit-presets kbd { display: inline-block; min-width: 24px; padding: 2px 7px; font: inherit; font-size: 12px; text-align: center; color: var(--kit-fg); background: #222; border: 1px solid var(--kit-line); border-radius: 5px; }
.kit-presets dd b { font-weight: 500; color: var(--kit-fg); }

.kit-pad-states { display: flex; flex-wrap: wrap; gap: var(--kit-space-lg); }
.kit-pad-state { display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: var(--kit-dim); }
.kit-pad-state .kit-tile { margin-bottom: 0; }

.kit-notes { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 8px var(--kit-space); margin: 0; max-width: 780px; }
.kit-notes dt { font-weight: 500; }
.kit-notes dd { margin: 0; color: var(--kit-dim); }
@media (max-width: 700px) {
  .kit-page { padding: var(--kit-space-lg) var(--kit-space); }
  .kit-notes { grid-template-columns: minmax(0, 1fr); }
  .kit-notes dd { margin-bottom: 8px; }
  .kit-card-wide { grid-column: span 1; }
}
`;
