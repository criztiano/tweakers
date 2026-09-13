import { useEffect, useMemo, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent, type CSSProperties, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PresetExplorationStore as store } from '../preset-exploration';
import { MoveSlotDefaultBody } from './move-slots';
import { flowerSvg, presetFlowerSeed, DEFAULT_FLOWER_SETTINGS } from '../preset-flower';
import type { PresetDNA } from '../preset-genetics';
import { TweakStore } from '../store/TweakStore';

type ExplorationState = NonNullable<ReturnType<typeof store.getState>>;
const SHELL_MOTION = { duration: 0.15, ease: [0.2, 0, 0, 1] as const };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function PresetArtwork({ values }: { values: PresetDNA }) {
  const seed = presetFlowerSeed(values);
  const src = useMemo(() => `data:image/svg+xml,${encodeURIComponent(flowerSvg(seed, DEFAULT_FLOWER_SETTINGS, { background: false }))}`, [seed]);
  return <img className="tweakers-exploration-artwork" src={src} alt="" aria-hidden="true" draggable={false} />;
}

export function PresetExploration() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const state = store.getState();
  const reducedMotion = useReducedMotion();
  const shell = useRef<HTMLElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  useBrowserLayoutEffect(() => {
    const anchor = shell.current?.closest('.tweakers-move');
    if (!state || !anchor) return;
    const measure = () => setAvailableHeight(Math.max(160, anchor.getBoundingClientRect().top - 20));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [state?.panelId]);
  return <AnimatePresence>
    {state && <motion.section key={state.panelId} className="tweakers-exploration"
      style={availableHeight == null ? undefined : { '--explore-available-height': `${availableHeight}px` } as CSSProperties}
      aria-label="Preset exploration" initial={{ opacity: 0, y: reducedMotion ? 0 : 12, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: reducedMotion ? 0 : 6, x: '-50%' }}
      transition={reducedMotion ? { duration: 0 } : SHELL_MOTION}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); store.close(); }
      }}>
      <ExplorationContent state={state} anchorRef={shell} />
    </motion.section>}
  </AnimatePresence>;
}

export function PresetExplorationSlots() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const state = store.getState();
  if (!state) return null;
  const slots = store.slots();
  const unsupported = !!TweakStore.getPresetProvider(state.panelId) && !TweakStore.getPresetProvider(state.panelId)?.exploration;
  return <div className="tweakers-move-grid tweakers-exploration-dock" role="group" aria-label="Eight Move encoder properties">
    <div className="tweakers-move-dials">
      {Array.from({ length: 8 }, (_, index) => {
        const slot = slots[index];
        if (!slot) return <div key={index} className="tweakers-move-dial" data-empty aria-hidden="true" />;
        return <label key={index} className="tweakers-move-dial tweakers-exploration-dock-slot" title={`${slot.label}: ${slot.display}`}
          data-disabled={state.busy || unsupported || slot.min === slot.max || undefined}>
          <MoveSlotDefaultBody label={slot.label} value={slot.display} pct={slot.max > slot.min ? (slot.value - slot.min) / (slot.max - slot.min) * 100 : 0} originPct={null} />
          <input type="range" aria-label={slot.label} aria-valuetext={slot.display} min={slot.min} max={slot.max} step={slot.step} value={slot.value}
            disabled={state.busy || unsupported || slot.min === slot.max} onChange={(event) => store.turnSlot(index, Number(event.target.value))} />
        </label>;
      })}
    </div>
  </div>;
}

function ExplorationContent({ state, anchorRef }: { state: ExplorationState; anchorRef: RefObject<HTMLElement> }) {
  const [name, setName] = useState('');
  const [seedId, setSeedId] = useState('');
  useEffect(() => { if (state.saving) setName(''); }, [state.saving]);
  const [parameterGroup, setParameterGroup] = useState('*');
  const provider = TweakStore.getPresetProvider(state.panelId);
  const unsupported = !!provider && !provider.exploration;
  const blocked = state.busy || unsupported;
  const tree = state.trees.find((item) => item.id === state.treeId);
  const generation = tree?.generations[state.generation];
  const allChildren = tree?.generations.flatMap((gen) => gen.children) ?? [];
  const active = allChildren.find((child) => child.id === state.activeId);
  const presets = store.getPresetItems();
  const enabledCount = state.parameters.filter((parameter) => parameter.enabled).length;
  const parents = (state.settings.breedWindow ? tree?.generations.slice(-state.settings.breedWindow) : tree?.generations)
    ?.flatMap((gen) => gen.children).filter((child) => child.marked) ?? [];
  const childLabel = (id: string) => {
    for (const candidate of state.trees) {
      for (let gen = 0; gen < candidate.generations.length; gen++) {
        const index = candidate.generations[gen].children.findIndex((child) => child.id === id);
        if (index >= 0) return `${candidate.id === state.treeId ? '' : `${candidate.name} · `}G${gen + 1} / ${String(index + 1).padStart(2, '0')}`;
      }
    }
    return 'Unknown child';
  };

  return <>
    <header ref={anchorRef} className="tweakers-exploration-header">
      <div><strong>Preset exploration</strong><span className="tweakers-exploration-caption">{state.persistent ? 'Family tree' : 'Session tree'}</span></div>
      <nav className="tweakers-exploration-nav" aria-label="Exploration views">
        {(['evolution', 'morph', 'parameters'] as const).map((view) => <button key={view} type="button"
          disabled={blocked} aria-pressed={state.view === view} onClick={() => store.setView(view)}>
          {view === 'evolution' ? 'Evolve' : view === 'morph' ? 'Morph' : 'Parameters'}
        </button>)}
      </nav>
      <button type="button" onClick={() => store.close()} title={state.saving ? "Cancel naming and return to exploration" : "Exit and restore the original sound"}>Back ↩</button>
    </header>

    <div className="tweakers-exploration-body">
    <fieldset className="tweakers-exploration-workspace" disabled={blocked}>
    {state.view === 'evolution' && <>
      <div className="tweakers-exploration-toolbar">
        <label className="tweakers-exploration-inline">Tree <select aria-label="Family tree" value={state.treeId} onChange={(event) => store.selectTree(event.target.value)}>
          {state.trees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select></label>
        <div className="tweakers-exploration-generation">
          <button type="button" aria-label="Previous generation" disabled={state.generation === 0} onClick={() => store.setGeneration(state.generation - 1)}>←</button>
          <span>Generation {state.generation + 1} / {tree?.generations.length ?? 0}</span>
          <button type="button" aria-label="Next generation" disabled={state.generation >= (tree?.generations.length ?? 0) - 1} onClick={() => store.setGeneration(state.generation + 1)}>→</button>
        </div>
        <button type="button" aria-pressed={state.treeView} onClick={() => store.toggleTree()}>Family tree</button>
      </div>
      {state.treeView && <div className="tweakers-exploration-tree" aria-label="Generation history">
        {tree?.generations.map((gen, index) => <button key={gen.id} type="button" aria-pressed={index === state.generation}
          onClick={() => store.setGeneration(index)}>G{index + 1}<span>{gen.children.length} children · {gen.children.filter((child) => child.marked).length} parents</span></button>)}
      </div>}
      <div className="tweakers-exploration-pads" role="group" aria-label="Generation presets, four rows of eight pads">
        {Array.from({ length: 32 }, (_, index) => {
          const child = generation?.children[index];
          return <button key={child?.id ?? index} type="button" className="tweakers-exploration-pad"
            disabled={!child || state.busy} aria-pressed={!!child && state.activeId === child.id}
            data-parent={child?.marked || undefined}
            aria-label={child ? `Preset ${index + 1}, rating ${child.rating}${child.marked ? ', marked parent' : ''}` : `Empty pad ${index + 1}`}
            onClick={() => child && store.select(child.id)}
            onKeyDown={(event) => {
              const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[event.key];
              if (offset === undefined) return;
              event.preventDefault();
              const next = event.currentTarget.parentElement?.children[index + offset];
              if (next instanceof HTMLButtonElement && !next.disabled) next.focus();
            }}>
            {child && <PresetArtwork values={child.values} />}
            {child?.marked && <span className="tweakers-exploration-parent" aria-hidden="true">◆</span>}
          </button>;
        })}
      </div>
      <div className="tweakers-exploration-toolbar tweakers-exploration-generation-actions">
        <span className="tweakers-exploration-caption" id="exploration-generation-hint">
          {enabledCount === 0 ? 'Enable parameters first.' : parents.length < 2 ? 'Mark two parents to breed.' : `${parents.length} parents · ★ biases breeding`}
        </span>
        <button type="button" disabled={blocked || enabledCount === 0} title="Start a new tree with 32 random seeds; keep previous trees" onClick={() => void store.randomizeSeeds()}>Randomize seeds</button>
        <button type="button" className="tweakers-exploration-primary" disabled={state.busy || parents.length < 2 || enabledCount === 0}
          aria-describedby="exploration-generation-hint" onClick={() => store.generate()}>Generate 32 children</button>
      </div>

    </>}

    {state.view === 'morph' && <div className="tweakers-exploration-morph">
      <p className="tweakers-exploration-hint">Choose a corner, then assign a child. Drag either surface to blend its four presets.</p>
      <div className="tweakers-exploration-morph-pair">
        {(['A', 'B'] as const).map((label, quadrant) => <div key={label}>
          <XYSurface label={label} x={quadrant === 0 ? state.morph.ax : state.morph.bx} y={quadrant === 0 ? state.morph.ay : state.morph.by}
            disabled={!state.morph.corners.slice(quadrant * 4, quadrant * 4 + 4).some(Boolean)}
            onChange={(x, y) => store.setMorph(quadrant === 0 ? { ax: x, ay: y } : { bx: x, by: y })} />
          <div className="tweakers-exploration-corners" role="group" aria-label={`Quadrant ${label} presets`}>
            {state.morph.corners.slice(quadrant * 4, quadrant * 4 + 4).map((id, corner) => {
              const index = quadrant * 4 + corner;
              const assigned = allChildren.find(child => child.id === id);
              return <button type="button" key={index} aria-pressed={state.morph.corner === index} onClick={() => store.setMorph({ corner: index })}
                title={id ? childLabel(id) : 'Unassigned corner'}>{assigned && <PresetArtwork values={assigned.values} />}{label}{corner + 1}<span>{id ? childLabel(id) : 'Empty'}</span></button>;
            })}
          </div>
        </div>)}
      </div>
      <label className="tweakers-exploration-blend">A <input type="range" aria-label="Blend between quadrants A and B" min={0} max={1} step={0.01}
        value={state.morph.blend} disabled={!state.morph.corners.some(Boolean)} onChange={(event) => store.setMorph({ blend: Number(event.target.value) })} /> B
        <output>{Math.round(state.morph.blend * 100)}%</output></label>
      <button type="button" onClick={() => store.beginAssign()}>{state.assigning ? 'Choose a child in Evolve' : 'Assign child to selected corner'}</button>
    </div>}

    {state.view === 'parameters' && <div className="tweakers-exploration-parameters">
      <div className="tweakers-exploration-toolbar">
        <label className="tweakers-exploration-inline">Group <select value={parameterGroup} onChange={(event) => setParameterGroup(event.target.value)}>
          <option value="*">All groups</option>
          {[...new Set(state.parameters.map((parameter) => parameter.group ?? ''))].map((group) => <option key={group} value={group}>{group || 'Parameters'}</option>)}
        </select></label>
        <label className="tweakers-exploration-inline"><input type="checkbox" checked={state.omitTrouble} onChange={(event) => store.setOmitTrouble(event.target.checked)} />Omit enable / bypass</label>
        <span>{enabledCount} / {state.parameters.length} parameters included</span>
        <button type="button" onClick={() => store.setAllParameters(true)}>Select all</button>
        <button type="button" onClick={() => store.setAllParameters(false)}>Deselect all</button></div>
      <p className="tweakers-exploration-hint">Included parameters evolve and morph within their chosen range. Other values stay unchanged.</p>
      {[...new Set(state.parameters.map((parameter) => parameter.group ?? ''))].filter((group) => parameterGroup === '*' || parameterGroup === group).map((group) => <fieldset key={group} className="tweakers-exploration-parameter-group">
        <legend>{group || 'Parameters'}</legend>
        <div className="tweakers-exploration-group-actions"><button type="button" onClick={() => store.setAllParameters(true, group)}>Select group</button>
          <button type="button" onClick={() => store.setAllParameters(false, group)}>Deselect group</button></div>
        {state.parameters.filter((parameter) => (parameter.group ?? '') === group).map((parameter) => <div key={parameter.id} className="tweakers-exploration-parameter">
          <label title={parameter.path}><input type="checkbox" checked={parameter.enabled} onChange={(event) => store.setParameter(parameter.id, { enabled: event.target.checked })} />{parameter.label}</label>
          {parameter.kind === 'number' ? <div className="tweakers-exploration-range">
            <label>Min <input type="number" aria-label={`${parameter.label} minimum`} value={parameter.low ?? parameter.min ?? 0} min={parameter.min} max={parameter.high ?? parameter.max}
              step={parameter.step ?? 'any'} disabled={!parameter.enabled} onChange={(event) => { if (Number.isFinite(event.target.valueAsNumber)) store.setParameter(parameter.id, { low: event.target.valueAsNumber }); }} /></label>
            <label>Max <input type="number" aria-label={`${parameter.label} maximum`} value={parameter.high ?? parameter.max ?? 1} min={parameter.low ?? parameter.min} max={parameter.max}
              step={parameter.step ?? 'any'} disabled={!parameter.enabled} onChange={(event) => { if (Number.isFinite(event.target.valueAsNumber)) store.setParameter(parameter.id, { high: event.target.valueAsNumber }); }} /></label>
          </div> : <span className="tweakers-exploration-caption" title={parameter.options?.join(', ')}>{parameter.options?.length ?? 0} choices</span>}
        </div>)}
      </fieldset>)}
    </div>}

    {state.view !== 'parameters' && <details className="tweakers-exploration-advanced">
      <summary>{active ? childLabel(active.id) : 'Child actions'} · mark, rate, save & seed settings</summary>
      <div className="tweakers-exploration-active">
        <span>{active ? childLabel(active.id) : 'Select a child'}{active?.parents.length ? <small>From {active.parents.map(childLabel).join(' + ')}</small> : null}</span>
        <div className="tweakers-exploration-actions">
          <button type="button" disabled={!active} aria-pressed={active?.marked ?? false} onClick={() => store.toggleParent()}>{active?.marked ? '◆ Parent marked' : 'Mark Parent'}</button>
          <label className="tweakers-exploration-inline">Rating <select aria-label="Active child rating" disabled={!active} value={active?.rating ?? 3} onChange={(event) => store.rate(Number(event.target.value))}>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
          </select></label>
          <button type="button" disabled={!active || state.busy} onClick={() => store.remix()}>Remix</button>
          <button type="button" disabled={!active || state.busy} onClick={() => store.overwrite()}>Overwrite DNA</button>
          <button type="button" disabled={blocked || (!active && !(state.view === 'morph' && state.morph.corners.some(Boolean)))} onClick={() => store.beginSave()}>Save Preset</button>
        </div>
      </div>
      <details className="tweakers-exploration-seeds"><summary>Seeds & breeding</summary>
        <div className="tweakers-exploration-settings">
          <label>Seed source<select value={state.settings.seedMode} onChange={(event) => store.setSettings({ seedMode: event.target.value as 'current' | 'random' })}>
            <option value="current">Current sound</option><option value="random">Randomized</option></select></label>
          <label>Seed count<input type="number" min={1} max={32} value={state.settings.seedCount} onChange={(event) => store.setSettings({ seedCount: Number(event.target.value) })} /></label>
          <label>Spread<input type="range" min={0} max={1} step={0.01} value={state.settings.spread} onChange={(event) => store.setSettings({ spread: Number(event.target.value) })} /></label>
          <label>Mutation mode<select value={state.settings.mutationMode} onChange={(event) => store.setSettings({ mutationMode: event.target.value as 'random' | 'copy-error' })}>
            <option value="random">Random replacement</option><option value="copy-error">Copy error</option></select></label>
          <label>Breeding window (0 = all)<input type="number" min={0} max={tree?.generations.length ?? 1} value={state.settings.breedWindow} onChange={(event) => store.setSettings({ breedWindow: Number(event.target.value) })} /></label>
        </div>
        <div className="tweakers-exploration-actions"><button type="button" disabled={state.busy || enabledCount === 0 || (tree?.generations[0].children.length ?? 0) >= 32} onClick={() => store.addSeeds()}>Add Seeds</button>
          <button type="button" disabled={!allChildren.some((child) => child.marked) || state.busy} onClick={() => store.newTree()}>New Tree from Parents</button>
          <label className="tweakers-exploration-inline">Preset seed <select value={seedId} onChange={(event) => setSeedId(event.target.value)}>
            <option value="">Choose preset…</option>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select></label><button type="button" disabled={!seedId || state.busy} onClick={() => store.addPresetSeed(seedId)}>Add Preset Seed</button></div>
      </details>
    </details>}
    </fieldset>

    {state.saving && <form className="tweakers-exploration-save" onSubmit={(event) => { event.preventDefault(); if (name.trim()) void store.save(name.trim()); }}>
      <label>Preset name<input type="text" value={name} maxLength={120} placeholder="Name this sound" onChange={(event) => setName(event.target.value)} /></label>
      <button type="submit" disabled={!name.trim() || state.busy}>Save</button><button type="button" disabled={state.busy} onClick={() => store.cancelSave()}>Cancel</button>
    </form>}
    <footer className="tweakers-exploration-footer">
      <span role="status">{state.message ?? (state.assigning ? 'Select a child to assign it to the morph corner.' : 'Back restores your original sound.')}</span>
      <button type="button" disabled={blocked} onClick={() => store.undo()}>Undo</button>
      {state.busy && <span role="status">Working…</span>}
    </footer>
    {state.error && <p role="alert" className="tweakers-exploration-error">{state.error}</p>}
    </div>
  </>;
}

function XYSurface({ label, x, y, disabled, onChange }: {
  label: string; x: number; y: number; disabled: boolean; onChange: (x: number, y: number) => void;
}) {
  const pointer = useRef<number | null>(null);
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange(clamp((event.clientX - rect.left) / Math.max(1, rect.width)), clamp((event.clientY - rect.top) / Math.max(1, rect.height)));
  };
  return <div role="group" aria-label={`Morph quadrant ${label}`}>
    <div className="tweakers-exploration-xy" data-disabled={disabled || undefined} aria-hidden="true"
      onPointerDown={(event) => { if (disabled || event.button !== 0) return; pointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); update(event); }}
      onPointerMove={(event) => { if (pointer.current === event.pointerId) update(event); }}
      onPointerUp={(event) => { if (pointer.current !== event.pointerId) return; pointer.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { pointer.current = null; }} onLostPointerCapture={() => { pointer.current = null; }}>
      <span className="tweakers-exploration-xy-label">{label}</span>
      <span className="tweakers-exploration-xy-point" style={{ left: `${x * 100}%`, top: `${y * 100}%` }} />
    </div>
    <div className="tweakers-exploration-xy-controls">
      <label>X <input type="range" aria-label={`Quadrant ${label} X`} min={0} max={1} step={0.01} disabled={disabled} value={x} onChange={(event) => onChange(Number(event.target.value), y)} /></label>
      <label>Y <input type="range" aria-label={`Quadrant ${label} Y`} min={0} max={1} step={0.01} disabled={disabled} value={y} onChange={(event) => onChange(x, Number(event.target.value))} /></label>
    </div>
  </div>;
}
