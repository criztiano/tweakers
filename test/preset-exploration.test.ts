import { afterEach, describe, expect, it, vi } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { PresetExplorationStore as store } from '../src/preset-exploration';
import { breedDNA, chooseParents, collectGenes, morphDNA, reconcileDNA, type ExplorationChild, type GeneParameter, type GeneticsSettings } from '../src/preset-genetics';
const genes: GeneParameter[] = [ {id:'a',path:'a',label:'A',kind:'number',min:0,max:10,enabled:true}, {id:'b',path:'b',label:'B',kind:'number',min:100,max:200,enabled:true} ];
const settings: GeneticsSettings = { mutation:0,mutationMode:'random',breedWindow:0,seedMode:'current',spread:0,seedCount:1 };
let sequence = 0;
const ids: string[] = [];
const register = () => { const id = `exploration-test-${++sequence}`; ids.push(id); TweakStore.registerPanel(id,id,{a:[2,0,10],b:[150,100,200],range:{type:'range',min:0,max:10,default:{min:2,max:8}}}); return id; };
afterEach(async () => { store.cancelSave(); await store.close(); ids.forEach(id => TweakStore.unregisterPanel(id)); ids.length=0; vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('genetics', () => {
  it('inherits discrete genes, never averages the parents', () => {
    let n=0; const dna=breedDNA({a:0,b:100},{a:10,b:200},{a:5,b:150},genes,settings,() => n++%2 ? .9 : .1);
    expect(dna).toEqual({a:0,b:200});
  });
  it('copy errors normalize different units and preserve excluded values', () => {
    expect(breedDNA({a:5,b:200},{a:5,b:200},{a:0,b:100,untouched:'hi'},genes,{...settings,mutation:1,mutationMode:'copy-error'},()=>0)).toEqual({a:10,b:150,untouched:'hi'});
  });
  it('snaps mutations and clamps previewed values', () => {
    const p={...genes[0],low:2,high:6,step:2};
    expect(breedDNA({a:0},{a:10},{a:2},[p],{...settings,mutation:1},()=>.75).a).toBe(6);
    expect(reconcileDNA({a:100},{a:1},[p]).a).toBe(6);
  });
  it('maps actual range components and keeps endpoints ordered', () => {
    const id=register(); const p=collectGenes(TweakStore.getPanel(id)!.controls);
    expect(p.filter(p=>p.path==='range').map(p=>p.component)).toEqual(['min','max']);
    expect(reconcileDNA({range:{min:9,max:1}},TweakStore.getValues(id),p).range).toEqual({min:1,max:1});
  });
  it('chooses distinct parents with rating-weighted probability', () => {
    const pool=[1,5,1].map((rating,i):ExplorationChild=>({id:String(i),rating,values:{},marked:true,parents:[]}));
    expect(chooseParents(pool,()=>.4).map(p=>p.id)).toEqual(['1','0']);
  });
  it('morphs occupied corners and preserves excluded and unsupported values', () => {
    const children=[0,10].map((a,i):ExplorationChild=>({id:String(i),values:{a},rating:3,marked:false,parents:[]}));
    const morph={corners:['0','1',null,null,null,null,null,null],ax:.25,ay:.5,bx:.5,by:.5,blend:1,corner:0};
    expect(morphDNA(children,morph,{a:9,b:123},[genes[0]])).toEqual({a:2.5,b:123});
  });
});
describe('exploration lifecycle', () => {
  it('opens with the exact original and 31 bounded variations without auditioning', async () => {
    vi.spyOn(Math,'random').mockReturnValue(.75);
    const id=register(); TweakStore.updateValue(id,'a',2.123456789);
    const original=structuredClone(TweakStore.getValues(id));
    await store.open(id);
    const seeds=store.getState()!.trees[0].generations[0].children;
    expect(seeds).toHaveLength(32);
    expect(seeds[0].values).toEqual(original);
    expect(seeds.slice(1).every(c=>c.values.a !== original.a && Math.abs(Number(c.values.a)-Number(original.a)) <= 2)).toBe(true);
    expect(seeds.every(c=>!c.marked && c.parents.length===0)).toBe(true);
    expect(store.getState()!.activeId).toBe(seeds[0].id);
    expect(TweakStore.getValues(id)).toEqual(original);
    store.select(seeds[1].id); store.toggleParent(); store.rate(5);
    await store.close(); await store.open(id);
    expect(store.getState()!.trees[0].generations[0].children).toEqual(seeds);
    expect(TweakStore.getValues(id)).toEqual(original);
  });
  it('creates a fresh random tree without overwriting history or changing the sound', async () => {
    const id=register(); await store.open(id);
    const initial=structuredClone(store.getState()!.trees[0]);
    const values=structuredClone(TweakStore.getValues(id));
    vi.spyOn(Math,'random').mockReturnValue(.75);
    store.setParameter('b',{enabled:false});
    await store.randomizeSeeds();
    const s=store.getState()!;
    expect(s.trees).toHaveLength(2); expect(s.trees[0]).toEqual(initial);
    expect(s.treeId).toBe(s.trees[1].id);
    expect(s.trees[1].generations[0].children).toHaveLength(32);
    expect(s.trees[1].generations[0].children.every(c=>c.values.a===7.5 && c.values.b===values.b)).toBe(true);
    expect(TweakStore.getValues(id)).toEqual(values);
    store.select(s.trees[1].generations[0].children[0].id); await store.close();
    expect(TweakStore.getValues(id)).toEqual(values);
  });
  it('fills legacy empty history on reopening', async () => {
    const id=register(); await store.open(id);
    store.getState()!.trees[0].generations[0].children=[];
    await store.close(); await store.open(id);
    expect(store.getState()!.trees[0].generations[0].children).toHaveLength(32);
  });
  it('can save multiple discoveries and restores entry values and active preset on Back', async () => {
    const id=register(); const original=TweakStore.savePreset(id,'Original'); await store.open(id);
    TweakStore.updateValues(id,{a:8}); await store.save('Discovery 1');
    TweakStore.updateValue(id,'a',9); await store.save('Discovery 2');
    expect(store.getState()).not.toBeNull();
    expect(TweakStore.getPresets(id).map(p=>p.values.a)).toEqual([2,8,9]);
    expect(TweakStore.getActivePresetId(id)).toBe(original);
    await store.close(); expect(TweakStore.getValue(id,'a')).toBe(2); expect(TweakStore.getActivePresetId(id)).toBe(original);
  });
  it('requires marked parents, creates 32 children, and supports generation undo', async () => {
    const id=register(); await store.open(id); store.generate(); expect(store.getState()!.error).toContain('two parents');
    const seeds=store.getState()!.trees[0].generations[0].children;
    for(const c of seeds){ store.select(c.id); store.toggleParent(); }
    store.generate(); expect(store.getState()!.trees[0].generations[1].children).toHaveLength(32);
    expect(store.getState()!.trees[0].generations[1].children.every(c=>c.parents.length===2 && c.parents[0]!==c.parents[1])).toBe(true);
    store.undo(); expect(store.getState()!.trees[0].generations).toHaveLength(1);
  });
  it('maps upper-left and lower-right hardware pads to the matching child', async () => {
    const id=register(); await store.open(id);
    const children=store.getState()!.trees[0].generations[0].children;
    store.pressPad(0,3); expect(store.getState()!.activeId).toBe(children[0].id);
    store.pressPad(7,0); expect(store.getState()!.activeId).toBe(children[31].id);
  });
  it('serializes slow host previews and restores after pending preview completion', async () => {
    const id=register(); let values={a:2,b:150}; const calls:string[]=[]; let release:()=>void=()=>{};
    TweakStore.setPresetProvider(id,{presets:[],activeId:'host',onSelect(){},onCreate(){},exploration:{parameters:genes,capture:()=>values,
      async preview(v){calls.push('preview'); await new Promise<void>(r=>{release=r;});values=v as typeof values;},
      restore(v,active){calls.push('restore');values=v as typeof values;expect(active).toBe('host');},save:vi.fn()}});
    await store.open(id); store.select(store.getState()!.trees[0].generations[0].children[0].id);
    await Promise.resolve(); const closing=store.close(); release(); await closing;
    expect(calls).toEqual(['preview','restore']);expect(values.a).toBe(2);
  });
  it('keeps the mode open with an error if host restoration fails so Back can retry', async()=>{
    const id=register(); let fail=true;
    TweakStore.setPresetProvider(id,{presets:[],onSelect(){},onCreate(){},exploration:{parameters:genes,capture:()=>({a:2,b:150}),preview(){},save(){},restore(){if(fail)throw Error('offline');}}});
    await store.open(id);await store.close();expect(store.getState()?.error).toContain('offline');fail=false;await store.close();expect(store.getState()).toBeNull();
  });
  it('keeps a host without an adapter compatible and explains unavailable exploration', async()=>{
    const id=register();TweakStore.setPresetProvider(id,{presets:[],onSelect(){},onCreate(){}});await store.open(id);expect(store.getState()?.error).toContain('adapter');await store.close();
  });
});

describe('review regressions', () => {
  it('keeps automatic trouble filtering consistent with bulk and explicit selection', async () => {
    const id=register();
    TweakStore.setPresetProvider(id,{presets:[],onSelect(){},onCreate(){},exploration:{parameters:[...genes,{id:'bypass',path:'bypass',label:'Bypass',kind:'category',options:[false,true],enabled:false,trouble:true}],capture:()=>({a:2,b:150,bypass:false}),preview(){},save(){},restore(){}}});
    await store.open(id); store.setAllParameters(true);
    expect(store.getState()!.parameters.find(p=>p.id==='bypass')!.enabled).toBe(false);
    store.setParameter('bypass',{enabled:true});
    expect(store.getState()!.omitTrouble).toBe(false);
    expect(store.getState()!.parameters.find(p=>p.id==='bypass')!.enabled).toBe(true);
  });
  it('restores fractional entry values exactly when the schema did not change', async () => {
    const id=register(); TweakStore.updateValue(id,'a',2.123456789); await store.open(id);
    TweakStore.updateValue(id,'a',9); await store.close(); expect(TweakStore.getValue(id,'a')).toBe(2.123456789);
  });
  it('uses refreshed host callbacks when capturing a saved discovery', async () => {
    const id=register(); const save=vi.fn(); const make=(a:number)=>({presets:[],onSelect(){},onCreate(){},exploration:{parameters:genes,capture:()=>({a,b:150}),preview(){},restore(){},save}});
    TweakStore.setPresetProvider(id,make(2)); await store.open(id); TweakStore.setPresetProvider(id,make(8)); await store.save('Fresh');
    expect(save).toHaveBeenCalledWith('Fresh',{a:8,b:150});
  });
  it('reconciles current schema before previewing old DNA', async () => {
    const id=register(); await store.open(id);const seed=store.getState()!.trees[0].generations[0].children[0];
    TweakStore.updatePanel(id,id,{a:false,b:[150,100,200]});store.select(seed.id);await Promise.resolve();await Promise.resolve();
    expect(TweakStore.getValue(id,'a')).toBe(false);
  });
  it('uses only valid steps inside custom limits and rejects empty intervals', () => {
    const p={...genes[0],step:2,low:3,high:5};
    expect(reconcileDNA({a:5},{a:0},[p]).a).toBe(4);
    expect(()=>reconcileDNA({a:5},{a:0},[{...p,low:4.1,high:5.9}])).toThrow('valid step');
  });
  it('rejects targeting ranges whose endpoints cannot remain ordered',async()=>{
    const id=register();await store.open(id);
    store.setParameter('range:min',{low:8});store.setParameter('range:max',{high:2});
    expect(store.getState()!.error).toContain('endpoint');expect(store.getState()!.parameters.find(p=>p.id==='range:max')!.high).toBe(10);
  });
  it('closes after an in-flight save and retains the saved result',async()=>{
    const id=register();let release:()=>void=()=>{};let started!:()=>void;const began=new Promise<void>(r=>started=r);
    TweakStore.setPresetProvider(id,{presets:[],onSelect(){},onCreate(){},exploration:{parameters:genes,capture:()=>({a:2,b:150}),preview(){},restore(){},save:()=>{started();return new Promise<void>(r=>release=r);}}});
    await store.open(id);const saving=store.save('Slow');await began;const closing=store.close();release();await saving;await closing;expect(store.getState()).toBeNull();
  });
  it('reloads history and saved snapshots without restoring audition values',async()=>{
    const data=new Map<string,string>();const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)};
    vi.stubGlobal('window',{localStorage:storage});
    const id=register();TweakStore.registerPanel(id,id,{a:[2,0,10]},undefined,{persist:true});await store.open(id);TweakStore.updateValue(id,'a',8);await store.save('Saved');await store.close();
    vi.resetModules(); const freshT=(await import('../src/store/TweakStore')).TweakStore; const freshS=(await import('../src/preset-exploration')).PresetExplorationStore;
    freshT.registerPanel(id,id,{a:[2,0,10]},undefined,{persist:true});expect(freshT.getPresets(id).find(p=>p.name==='Saved')!.values.a).toBe(8);expect(freshT.getValue(id,'a')).toBe(2);
    await freshS.open(id);expect(freshS.getState()!.trees[0].generations[0].children).toHaveLength(32);await freshS.close();freshT.unregisterPanel(id);
  });
  it('ignores malformed persisted parameter metadata without crashing',async()=>{
    const id=register();TweakStore.registerPanel(id,id,{a:[2,0,10]},undefined,{persist:true});
    vi.stubGlobal('window',{localStorage:{getItem:()=>JSON.stringify({version:1,state:{parameters:[null],trees:[]}}),setItem(){}}});
    await expect(store.open(id)).resolves.toBeUndefined();expect(store.getState()?.parameters[0].path).toBe('a');
  });
});
