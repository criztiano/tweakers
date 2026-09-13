import { TweakStore, type PresetExplorationAdapter } from './store/TweakStore';
import { MoveFunctions } from './move-functions';
import { breedDNA, chooseParents, clamp, geneBounds, cloneDNA, collectGenes, morphDNA, newDNAId, reconcileDNA, seedDNA,
  type ExplorationChild, type ExplorationTree, type GeneParameter, type GeneticsSettings, type MorphState, type PresetDNA } from './preset-genetics';
export type { ExplorationChild, ExplorationTree, GeneParameter, GeneticsSettings, MorphState } from './preset-genetics';
export type ExplorationView = 'evolution' | 'morph' | 'parameters';
export interface ExplorationState {
  panelId: string; view: ExplorationView; treeView: boolean; trees: ExplorationTree[]; treeId: string;
  generation: number; activeId: string | null; parameters: GeneParameter[]; settings: GeneticsSettings; morph: MorphState;
  omitTrouble: boolean; busy: boolean; error: string | null; message: string | null; saving: boolean; assigning: boolean; persistent: boolean;
}
export interface ExplorationSlot { label: string; value: number; min: number; max: number; step: number; display: string }
const settings: GeneticsSettings = { mutation: .05, mutationMode: 'random', breedWindow: 0, seedMode: 'current', spread: .2, seedCount: 1 };
const emptyMorph = (): MorphState => ({ corners: Array(8).fill(null), ax: .5, ay: .5, bx: .5, by: .5, blend: .5, corner: 0 });
const tree = (n: number): ExplorationTree => ({ id: newDNAId(), name: `Tree ${n}`, generations: [{ id: newDNAId(), children: [] }] });
const child = (values: PresetDNA, parents: string[] = []): ExplorationChild => ({ id: newDNAId(), values, parents, rating: 3, marked: false });
const views: ExplorationView[] = ['evolution', 'morph', 'parameters'];

class ExplorationStore {
  private state: ExplorationState | null = null;
  private version = 0;
  private listeners = new Set<() => void>();
  private original: PresetDNA | null = null;
  private live: PresetDNA | null = null;
  private activePreset: string | null = null;
  private initialAdapter: PresetExplorationAdapter | undefined;
  private hostOwned = false;
  private get adapter(): PresetExplorationAdapter | undefined {
    if (!this.hostOwned) return undefined;
    const adapter = this.state ? TweakStore.getPresetProvider(this.state.panelId)?.exploration : this.initialAdapter;
    return adapter ?? this.initialAdapter;
  }
  private history: ExplorationTree[][] = [];
  private cache = new Map<string, ExplorationState>();
  private tail: Promise<void> = Promise.resolve();
  private previewRevision = 0;
  private closing = false;
  private operation: Promise<void> = Promise.resolve();
  private unsubscribePanel: (() => void) | null = null;
  private releaseButtons: (() => void)[] = [];
  private parameterIndex = 0;
  private storageKey: string | null = null;
  private storageName: 'localStorage' | 'sessionStorage' = 'localStorage';
  reportError(message: string) { if (this.state && this.state.error !== message) { this.state.error = message; this.notify(false); } }
  getState = () => this.state;
  getVersion = () => this.version;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private notify(persist = true) {
    this.version++;
    if (persist && this.state) {
      this.cache.set(this.state.panelId, cloneDNA(this.state));
      if (this.storageKey && typeof window !== 'undefined') try {
        window[this.storageName].setItem(this.storageKey, JSON.stringify({ version: 1, state: this.state }));
      } catch { this.state.persistent = false; this.state.message = 'History is available for this session only.'; }
    }
    for (const fn of this.listeners) fn();
  }
  private async run(action: () => void | Promise<void>) {
    const s = this.state;
    if (!s || s.busy || this.closing) return;
    let finish!: () => void;
    this.operation = new Promise<void>(resolve => { finish = resolve; });
    s.busy = true; s.error = null; this.notify(false);
    try { await this.tail; await action(); }
    catch (e) { s.error = e instanceof Error ? e.message : String(e); }
    finally { finish(); if (this.state === s) { s.busy = this.closing; this.notify(); } }
  }
  private currentTree() { return this.state!.trees.find(t => t.id === this.state!.treeId)!; }
  private allChildren() { return this.currentTree().generations.flatMap(g => g.children); }
  private active() { return this.state ? this.allChildren().find(c => c.id === this.state!.activeId) : undefined; }
  private checkpoint() { this.history.push(cloneDNA(this.state!.trees)); if (this.history.length > 32) this.history.shift(); }
  private baseline() { return cloneDNA(this.adapter ? this.live ?? this.original ?? {} : TweakStore.getValues(this.state!.panelId)); }
  private async capture() { return cloneDNA(this.adapter ? await this.adapter.capture() : this.baseline()); }
  private preview(values: PresetDNA) {
    const revision = ++this.previewRevision, s = this.state;
    this.tail = this.tail.then(async () => {
      if (!s || this.state !== s || revision !== this.previewRevision || this.closing) return;
      try {
        if (this.adapter) await this.adapter.preview(cloneDNA(values));
        else TweakStore.previewValues(s.panelId, cloneDNA(values));
        this.live = cloneDNA(values);
      } catch (e) { s.error = `Preview failed: ${e instanceof Error ? e.message : e}`; this.notify(false); }
    });
  }
  async open(panelId: string) {
    if (this.state) return;
    const provider = TweakStore.getPresetProvider(panelId);
    this.initialAdapter = provider?.exploration; this.hostOwned = !!provider;
    const first = tree(1);
    const parameters = cloneDNA(this.adapter?.parameters ?? collectGenes(TweakStore.getPanel(panelId)?.controls ?? []));
    const target = TweakStore.getPresetPersistenceTarget(panelId);
    this.storageKey = target ? `${target.key}:exploration:v1` : null;
    this.storageName = target?.storage ?? 'localStorage';
    let previous = this.cache.get(panelId);
    if (!previous && this.storageKey && typeof window !== 'undefined') try {
      const saved = JSON.parse(window[this.storageName].getItem(this.storageKey) ?? 'null');
      if (saved?.version === 1 && this.validSaved(saved.state)) previous = saved.state;
    } catch { /* A corrupt tree is ignored; entry values are never loaded from it. */ }
    this.state = { panelId, view: 'evolution', treeView: false, trees: [first], treeId: first.id, generation: 0,
      activeId: null, parameters, settings: { ...settings }, morph: emptyMorph(), busy: false, error: null,
      omitTrouble: true, message: target ? null : 'History is available for this session only.', saving: false, assigning: false, persistent: !!target };
    if (previous) {
      this.state.trees = cloneDNA(previous.trees);
      this.state.treeId = previous.trees.some(t => t.id === previous!.treeId) ? previous.treeId : previous.trees[0].id;
      this.state.omitTrouble = previous.omitTrouble ?? true;
      this.state.settings = { ...settings, ...previous.settings };
      this.state.morph = { ...emptyMorph(), ...previous.morph };
      for (const p of parameters) {
        const old = previous.parameters.find(q => q.id === p.id && q.kind === p.kind);
        if (old) { p.enabled = old.enabled; if (p.kind === 'number') { p.low = clamp(old.low ?? p.min!, p.min!, p.max!); p.high = clamp(old.high ?? p.max!, p.low!, p.max!); } }
      }
    }
    this.history = []; this.parameterIndex = 0; this.closing = false; this.original = null; this.live = null;
    this.activePreset = provider?.activeId ?? TweakStore.getActivePresetId(panelId);
    this.bindButtons();
    this.unsubscribePanel = TweakStore.subscribeGlobal(() => { if (!TweakStore.getPanel(panelId)) { this.cancelSave(); void this.close(); } else this.refreshParameters(); });
    this.notify(false);
    await this.run(async () => {
      if (provider && !this.adapter) throw new Error('This host must provide an exploration adapter before presets can be explored.');
      if (this.adapter && !['capture', 'preview', 'restore', 'save'].every(k => typeof this.adapter![k as keyof PresetExplorationAdapter] === 'function')) throw new Error('The host exploration adapter is incomplete.');
      this.original = await this.capture();
      this.live = cloneDNA(this.original);
      TweakStore.beginPresetPreview(panelId);
      const s = this.state!;
      if (!s.trees.some(t => t.generations.some(g => g.children.length))) {
        const seeds = [child(cloneDNA(this.original)), ...Array.from({ length: 31 }, () =>
          child(seedDNA(this.original!, s.parameters, { ...s.settings, seedMode: 'current', spread: .2 })))];
        this.currentTree().generations[0].children = seeds;
        s.activeId = seeds[0].id;
        s.message = 'Pad 1 is your original sound. Audition the variations and mark two parents.';
      }
    });
  }
  private validSaved(s: unknown): s is ExplorationState {
    if (!s || typeof s !== 'object') return false;
    const v = s as ExplorationState;
    return Array.isArray(v.parameters) && v.parameters.every(p => p && typeof p.id === 'string' && typeof p.path === 'string' && ['number','category'].includes(p.kind)
      && (p.kind !== 'number' || [p.min,p.max,p.low ?? p.min,p.high ?? p.max].every(Number.isFinite))) && Array.isArray(v.trees) && v.trees.length > 0 && v.trees.every(t => typeof t.id === 'string' && Array.isArray(t.generations) && t.generations.length > 0
      && t.generations.every(g => Array.isArray(g.children) && g.children.length <= 32 && g.children.every(c => typeof c.id === 'string' && c.values && typeof c.values === 'object' && Array.isArray(c.parents) && Number.isFinite(c.rating))))
      && !!v.settings && [v.settings.mutation,v.settings.spread,v.settings.seedCount,v.settings.breedWindow].every(Number.isFinite)
      && ['random','copy-error'].includes(v.settings.mutationMode) && ['current','random'].includes(v.settings.seedMode)
      && !!v.morph && ['ax','ay','bx','by','blend','corner'].every(k => Number.isFinite(v.morph[k as keyof MorphState]))
      && Array.isArray(v.morph.corners) && v.morph.corners.length === 8 && v.morph.corners.every(c => c === null || typeof c === 'string');
  }
  async close() {
    const s = this.state;
    if (!s || this.closing) return;
    if (s.saving) { this.cancelSave(); return; }
    this.closing = true; ++this.previewRevision; s.busy = true; this.notify(false);
    await this.operation;
    await this.tail;
    try {
      if (this.original && this.adapter) await this.adapter.restore(cloneDNA(this.original), this.activePreset);
      TweakStore.endPresetPreview(s.panelId);
    } catch (e) { s.busy = false; s.error = `Could not restore the original sound: ${e instanceof Error ? e.message : e}. Press Back to retry.`; this.closing = false; this.notify(false); return; }
    this.notify(); this.state = null; this.original = null; this.initialAdapter = undefined; this.hostOwned = false;
    for (const release of this.releaseButtons.reverse()) release();
    this.releaseButtons = []; this.unsubscribePanel?.(); this.unsubscribePanel = null; this.closing = false; this.notify(false);
  }
  private bindButtons() {
    const bind = (name: Parameters<typeof MoveFunctions.push>[0], label: string, fn: Parameters<typeof MoveFunctions.push>[1]) => this.releaseButtons.push(MoveFunctions.push(name, fn, { label }));
    bind('back', 'Exit exploration', () => { void this.close(); });
    bind('menu', 'Tree / save', ({ shift }) => shift ? this.beginSave() : this.toggleTree());
    bind('sample', 'Mark parent', () => this.state?.view === 'morph' ? this.beginAssign() : this.toggleParent());
    bind('loop', 'Generate', () => this.generate()); bind('capture', 'Add / randomize seeds', ({ shift }) => { void (shift ? this.randomizeSeeds() : this.addSeeds()); });
    bind('copy', 'Remix / overwrite', ({ shift }) => shift ? void this.overwrite() : this.remix());
    bind('undo', 'Undo', () => this.undo());
    bind('left', 'Previous generation', () => this.setGeneration((this.state?.generation ?? 0) - 1));
    bind('right', 'Next generation', () => this.setGeneration((this.state?.generation ?? 0) + 1));
    for (const [name, step] of [['up', -1], ['down', 1]] as const) bind(name, 'Change view', () => this.setView(views[(views.indexOf(this.state!.view) + step + 3) % 3]));
    bind('jog_click', 'Mark parent', () => this.toggleParent());
  }
  private refreshParameters() {
    if (!this.state) return;
    const fresh = cloneDNA(this.adapter?.parameters ?? collectGenes(TweakStore.getPanel(this.state.panelId)?.controls ?? []));
    for (const p of fresh) {
      const old = this.state.parameters.find(q => q.id === p.id && q.kind === p.kind);
      if (old) { p.enabled = old.enabled; if (p.kind === 'number') { p.low = clamp(old.low ?? p.min!,p.min!,p.max!); p.high = clamp(old.high ?? p.max!,p.low,p.max!); try { geneBounds(p); } catch { p.low = p.min; p.high = p.max; } } }
    }
    if (JSON.stringify(fresh) !== JSON.stringify(this.state.parameters)) this.state.parameters = fresh;
  }
  private ready() { this.refreshParameters(); return !!this.state && !!this.original && !this.state.busy && !this.closing; }
  setView(view: ExplorationView) { if (!this.state) return; this.state.view = view; this.state.treeView = false; this.state.assigning = false; this.notify(); }
  toggleTree() { if (!this.state) return; this.state.view = 'evolution'; this.state.treeView = !this.state.treeView; this.notify(); }
  setGeneration(index: number) { if (!this.state) return; this.state.generation = clamp(Math.round(index), 0, this.currentTree().generations.length - 1); this.notify(); }
  selectTree(id: string) { if (!this.ready() || !this.state!.trees.some(t => t.id === id)) return; this.state!.treeId = id; this.state!.generation = 0; this.state!.activeId = null; this.state!.morph = emptyMorph(); this.history = []; this.notify(); }
  select(id: string) {
    if (!this.ready()) return;
    const s = this.state!, c = this.allChildren().find(c => c.id === id); if (!c) return;
    s.activeId = id;
    if (s.assigning) { s.morph.corners[s.morph.corner] = id; s.assigning = false; s.view = 'morph'; this.setMorph({}); return; }
    try { this.preview(reconcileDNA(c.values, this.baseline(), s.parameters)); }
    catch (e) { s.error = e instanceof Error ? e.message : String(e); }
    this.notify();
  }
  pressPad(x: number, y: number) {
    if (!this.state || x < 0 || x > 7 || y < 0 || y > 3) return;
    const c = this.currentTree().generations[this.state.generation].children[(3-y)*8+x];
    if (c) this.select(c.id);
  }
  jog(delta: number) {
    if (!this.ready()) return;
    if (this.state!.view === 'parameters') { this.parameterIndex = clamp(this.parameterIndex + Math.sign(delta), 0, this.state!.parameters.length - 1); this.notify(false); return; }
    const children = this.currentTree().generations[this.state!.generation].children;
    const index = children.findIndex(c => c.id === this.state!.activeId);
    const c = children[clamp(index + Math.sign(delta), 0, children.length - 1)]; if (c) this.select(c.id);
  }
  toggleParent() { if (!this.ready()) return; const c = this.active(); if (c) { c.marked = !c.marked; this.notify(); } }
  rate(rating: number) { if (!this.ready()) return; const c = this.active(); if (c) { c.rating = clamp(Math.round(rating), 1, 5); this.notify(); } }
  setSettings(patch: Partial<GeneticsSettings>) {
    if (!this.state) return;
    const s = this.state.settings;
    Object.assign(s, patch);
    if (!Number.isFinite(s.mutation)) s.mutation = .05;
    if (!Number.isFinite(s.spread)) s.spread = 0;
    if (!Number.isFinite(s.seedCount)) s.seedCount = 1;
    if (!Number.isFinite(s.breedWindow)) s.breedWindow = 0;
    s.mutation = clamp(s.mutation); s.spread = clamp(s.spread); s.seedCount = clamp(Math.round(s.seedCount), 1, 32); s.breedWindow = Math.max(0, Math.round(s.breedWindow)); this.notify();
  }
  generate() {
    if (!this.ready()) return;
    const s = this.state!, t = this.currentTree();
    if (!s.parameters.some(p => p.enabled)) { s.error = 'Enable at least one parameter.'; this.notify(false); return; }
    const pool = (s.settings.breedWindow ? t.generations.slice(-s.settings.breedWindow) : t.generations).flatMap(g => g.children).filter(c => c.marked);
    if (pool.length < 2) { s.error = 'Mark at least two parents in the breeding window.'; this.notify(false); return; }
    this.checkpoint(); const baseline = this.baseline();
    t.generations.push({ id: newDNAId(), children: Array.from({ length: 32 }, () => {
      const [a,b] = chooseParents(pool); return child(breedDNA(a.values,b.values,baseline,s.parameters,s.settings),[a.id,b.id]);
    }) }); s.generation = t.generations.length - 1; s.treeView = false; s.activeId = null; s.error = null; this.notify();
  }
  async randomizeSeeds() { if (!this.ready()) return; await this.run(async () => {
    const s = this.state!;
    if (!s.parameters.some(p => p.enabled)) throw new Error('Enable at least one parameter.');
    const baseline = await this.capture();
    const t = tree(s.trees.length + 1);
    t.generations[0].children = Array.from({ length: 32 }, () =>
      child(seedDNA(baseline, s.parameters, { ...s.settings, seedMode: 'random' })));
    s.trees.push(t); s.treeId = t.id; s.generation = 0; s.activeId = null;
    s.view = 'evolution'; s.treeView = false; s.assigning = false; s.morph = emptyMorph();
    this.history = [];
    s.message = '32 randomized seeds. Audition them and mark two parents. Previous trees are kept.';
  }); }
  async addSeeds() { if (!this.ready()) return; await this.run(async () => {
    const s = this.state!, seeds = this.currentTree().generations[0].children;
    if (seeds.length >= 32) throw new Error('This seed generation is full. Start a new tree from marked presets.');
    const baseline = await this.capture(); this.checkpoint();
    for (let i = 0, n = Math.min(s.settings.seedCount, 32-seeds.length); i < n; i++) seeds.push(child(seedDNA(baseline,s.parameters,s.settings)));
    s.generation = 0; s.view = 'evolution'; s.treeView = false;
  }); }
  getPresetItems() {
    if (!this.state) return [];
    const provider = TweakStore.getPresetProvider(this.state.panelId);
    return provider ? (this.adapter?.readPreset ? provider.presets.map(p => ({ id: p.id, label: p.label })) : [])
      : TweakStore.getPresets(this.state.panelId).map(p => ({ id: p.id, label: p.name }));
  }
  async addPresetSeed(id: string) { if (!this.ready()) return; await this.run(async () => {
    const s = this.state!, seeds = this.currentTree().generations[0].children;
    if (seeds.length >= 32) throw new Error('This seed generation is full.');
    const dna = this.adapter ? await this.adapter.readPreset?.(id) : TweakStore.getPresets(s.panelId).find(p => p.id === id)?.values;
    if (!dna) throw new Error('This preset is unavailable.');
    this.checkpoint(); seeds.push(child(reconcileDNA(dna,await this.capture(),s.parameters))); s.generation = 0;
  }); }
  remix() { if (!this.ready()) return; const c = this.active(); if (!c) return;
    const s = this.state!, parents = c.parents.map(id => this.allChildren().find(p => p.id === id)); this.checkpoint();
    c.values = parents.length === 2 && parents.every(Boolean) ? breedDNA(parents[0]!.values,parents[1]!.values,this.baseline(),s.parameters,s.settings) : seedDNA(this.baseline(),s.parameters,s.settings);
    this.select(c.id);
  }
  async overwrite() { if (!this.ready() || !this.active()) return; await this.run(async () => { const values = await this.capture(); this.checkpoint(); this.active()!.values = values; this.state!.message = 'DNA updated. Undo restores the previous version.'; }); }
  undo() {
    if (!this.ready() || !this.history.length) return;
    this.state!.trees = this.history.pop()!;
    this.state!.generation = Math.min(this.state!.generation,this.currentTree().generations.length-1);
    const available = new Set(this.allChildren().map(c => c.id));
    this.state!.morph.corners = this.state!.morph.corners.map(id => id && available.has(id) ? id : null);
    const active = this.active();
    if (active) this.select(active.id);
    else { this.state!.activeId = null; this.preview(cloneDNA(this.original!)); }
    this.notify();
  }
  newTree() { if (!this.ready()) return; const seeds = this.allChildren().filter(c => c.marked).map(c => child(cloneDNA(c.values)));
    if (!seeds.length || seeds.length > 32) { this.state!.error = 'Mark between 1 and 32 presets for the new tree.'; this.notify(false); return; }
    const t = tree(this.state!.trees.length + 1); t.generations[0].children = seeds; this.state!.trees.push(t); this.selectTree(t.id);
  }
  beginSave() { if (!this.ready()) return; this.state!.saving = true; this.notify(false); }
  cancelSave() { if (!this.state) return; this.state.saving = false; this.notify(false); }
  async save(name: string) { if (!this.ready()) return; await this.run(async () => {
    const s = this.state!, values = await this.capture(), label = name.trim() || 'Exploration preset';
    if (this.adapter) await this.adapter.save(label,values); else TweakStore.savePresetSnapshot(s.panelId,label,values);
    s.saving = false; s.message = `Saved “${label}”. Keep exploring.`;
  }); }
  setParameter(id: string, patch: Partial<GeneParameter>) {
    if (!this.ready()) return; const p = this.state!.parameters.find(p => p.id === id); if (!p) return;
    if (p.kind === 'number' && ((patch.low !== undefined && !Number.isFinite(patch.low)) || (patch.high !== undefined && !Number.isFinite(patch.high)))) return;
    const candidate = { ...p };
    if (typeof patch.enabled === 'boolean') candidate.enabled = patch.enabled;
    if (p.kind === 'number') {
      candidate.low = clamp(patch.low ?? p.low ?? p.min!,p.min!,p.max!);
      candidate.high = clamp(patch.high ?? p.high ?? p.max!,candidate.low,p.max!);
      try {
        const [lo,hi] = geneBounds(candidate);
        const other = this.state!.parameters.find(q => q.path === p.path && q.id !== p.id && ['min','max'].includes(q.component ?? ''));
        if (other) {
          const value = this.baseline()[p.path] as unknown as {min:number;max:number};
          if (p.component === 'min' && lo > (other.enabled ? geneBounds(other)[1] : value.max)) throw new Error('Minimum range must allow a value below the maximum endpoint.');
          if (p.component === 'max' && hi < (other.enabled ? geneBounds(other)[0] : value.min)) throw new Error('Maximum range must allow a value above the minimum endpoint.');
        }
      } catch (e) { this.state!.error = e instanceof Error ? e.message : String(e); this.notify(false); return; }
    }
    Object.assign(p,candidate); this.state!.error = null;
    if (p.trouble && p.enabled) this.state!.omitTrouble = false;
    this.notify();
  }
  setOmitTrouble(on: boolean) { if (!this.ready()) return; this.state!.omitTrouble = on; for (const p of this.state!.parameters) if (p.trouble) p.enabled = !on; this.notify(); }
  setAllParameters(enabled: boolean, group?: string) { if (!this.ready()) return; for (const p of this.state!.parameters) if (group === undefined || p.group === group) p.enabled = enabled && !(this.state!.omitTrouble && p.trouble); this.notify(); }
  setMorph(patch: Partial<MorphState>) { if (!this.ready()) return; const s = this.state!; Object.assign(s.morph,patch);
    for (const key of ['ax','ay','bx','by','blend'] as const) s.morph[key] = Number.isFinite(s.morph[key]) ? clamp(s.morph[key]) : .5; s.morph.corner = clamp(Math.round(s.morph.corner),0,7);
    this.preview(morphDNA(this.allChildren(),s.morph,this.baseline(),s.parameters)); this.notify();
  }
  beginAssign() { if (!this.ready()) return; this.state!.assigning = true; this.state!.view = 'evolution'; this.state!.treeView = false; this.notify(false); }
  slots(): ExplorationSlot[] {
    const s = this.state; if (!s) return [];
    const slot = (label: string,value: number,min: number,max: number,step=1,display=String(value)): ExplorationSlot => ({label,value,min,max,step,display});
    if (s.view === 'morph') return [...(['ax','ay','bx','by','blend'] as const).map((k,i) => slot(['A · X','A · Y','B · X','B · Y','Blend'][i],s.morph[k],0,1,.01)),slot('Corner',s.morph.corner,0,7,1,String(s.morph.corner+1))];
    if (s.view === 'parameters') {
      const p = s.parameters[this.parameterIndex];
      return [slot('Parameter',this.parameterIndex,0,Math.max(0,s.parameters.length-1),1,p?.label ?? 'None'),slot('Included',p?.enabled ? 1 : 0,0,1),slot('Minimum',p?.low ?? 0,p?.min ?? 0,p?.max ?? 1,p?.step ?? .01),slot('Maximum',p?.high ?? 1,p?.min ?? 0,p?.max ?? 1,p?.step ?? .01),slot('Omit enable/bypass',s.omitTrouble ? 1 : 0,0,1)];
    }
    return [slot('Generation',s.generation,0,this.currentTree().generations.length-1,1,String(s.generation+1)),slot('Rating',this.active()?.rating ?? 3,1,5),slot('Mutation',s.settings.mutation,0,1,.01),slot('Mutation mode',s.settings.mutationMode === 'random' ? 0 : 1,0,1,1,s.settings.mutationMode),slot('Breed window',s.settings.breedWindow,0,this.currentTree().generations.length,1,s.settings.breedWindow ? `Last ${s.settings.breedWindow}` : 'All'),slot('Seed mode',s.settings.seedMode === 'current' ? 0 : 1,0,1,1,s.settings.seedMode),slot('Spread',s.settings.spread,0,1,.01),slot('Seed count',s.settings.seedCount,1,32)];
  }
  turnSlot(index: number, value: number) {
    if (!this.ready()) return; const s = this.state!, slot = this.slots()[index]; if (!slot || !Number.isFinite(value)) return;
    value = clamp(value,slot.min,slot.max); if (slot.step === 1) value = Math.round(value);
    if (s.view === 'morph') { const key = (['ax','ay','bx','by','blend','corner'] as const)[index]; if (key) this.setMorph({[key]:value}); return; }
    if (s.view === 'parameters') { if (index === 4) { this.setOmitTrouble(!!value); return; } const p = s.parameters[this.parameterIndex]; if (!index) { this.parameterIndex = Math.round(value); this.notify(false); } else if (p) this.setParameter(p.id,index === 1 ? {enabled:!!value} : index === 2 ? {low:value} : {high:value}); return; }
    if (index === 0) this.setGeneration(value); else if (index === 1) this.rate(value); else this.setSettings(index === 2 ? {mutation:value} : index === 3 ? {mutationMode:value ? 'copy-error':'random'} : index === 4 ? {breedWindow:value} : index === 5 ? {seedMode:value ? 'random':'current'} : index === 6 ? {spread:value} : {seedCount:value});
  }
}
export const PresetExplorationStore = new ExplorationStore();
