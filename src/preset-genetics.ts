import type { ControlMeta, TweakValue } from './store/TweakStore';

export type PresetDNA = Record<string, TweakValue>;
export interface GeneParameter {
  id: string; path: string; label: string; group?: string;
  component?: string; kind: 'number' | 'category';
  min?: number; max?: number; step?: number; options?: (string | boolean)[];
  enabled: boolean; trouble?: boolean; low?: number; high?: number;
}
export interface ExplorationChild {
  id: string; values: PresetDNA; parents: string[]; rating: number; marked: boolean;
}
export interface ExplorationTree {
  id: string; name: string; generations: { id: string; children: ExplorationChild[] }[];
}
export interface GeneticsSettings {
  mutation: number; mutationMode: 'random' | 'copy-error'; breedWindow: number;
  seedMode: 'current' | 'random'; spread: number; seedCount: number;
}
export const cloneDNA = <T>(value: T): T => structuredClone(value);
export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const newDNAId = () => `dna-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;

export function collectGenes(controls: ControlMeta[], group = ''): GeneParameter[] {
  return controls.flatMap((c): GeneParameter[] => {
    if (c.type === 'folder') return collectGenes(c.children ?? [], group ? `${group} / ${c.label}` : c.label);
    if (c.tabBar || c.path === '_tab') return [];
    const trouble = c.path.endsWith('_enabled') || /^(device on|bypass)$/i.test(c.label);
    const base = { id: c.path, path: c.path, label: c.label, group, trouble, enabled: !trouble };
    const number = (component: string | undefined, min: number, max: number, step?: number): GeneParameter[] =>
      Number.isFinite(min) && Number.isFinite(max) && max > min ? [{ ...base, id: component ? `${c.path}:${component}` : c.path,
        label: component ? `${c.label} · ${component}` : c.label, component, kind: 'number', min, max, low: min, high: max, step }] : [];
    if (c.type === 'slider' || c.type === 'number') return number(undefined, c.min!, c.max!, c.stepInferred ? undefined : c.step);
    if (c.type === 'toggle') return [{ ...base, kind: 'category', options: [false, true] }];
    if (c.type === 'select') return [{ ...base, kind: 'category', options: (c.options ?? []).map(o => typeof o === 'string' ? o : o.value) }];
    if (c.type === 'xy') return ['x', 'y'].flatMap(k => {
      const a = k === 'x' ? c.xAxis : c.yAxis;
      return number(k, a?.min ?? 0, a?.max ?? 1, c.snap ? a?.step ?? .01 : undefined);
    });
    if (c.type === 'range') return ['min', 'max'].flatMap(k => number(k, c.min ?? 0, c.max ?? 1, c.step));
    if (c.type === 'filter') return ['cutoff', 'resonance'].flatMap(k => {
      const a = k === 'cutoff' ? c.cutoffAxis : c.resonanceAxis;
      return number(k, a?.min ?? 0, a?.max ?? 1, a?.step);
    });
    return [];
  });
}
function read(dna: PresetDNA, p: GeneParameter): unknown {
  const value = dna[p.path];
  return p.component && value && typeof value === 'object' ? (value as unknown as Record<string, unknown>)[p.component] : value;
}
function write(dna: PresetDNA, p: GeneParameter, value: unknown) {
  if (p.component) dna[p.path] = { ...(dna[p.path] as object), [p.component]: value } as TweakValue;
  else dna[p.path] = value as TweakValue;
}
export function geneBounds(p: GeneParameter): [number, number] {
  let lo = p.low ?? p.min ?? 0, hi = p.high ?? p.max ?? 1;
  if (p.step && p.step > 0) {
    const origin = p.min ?? 0;
    lo = origin + Math.ceil((lo-origin)/p.step - 1e-10)*p.step;
    hi = origin + Math.floor((hi-origin)/p.step + 1e-10)*p.step;
  }
  if (lo > hi) throw new Error(`${p.label}: the range must contain a valid step.`);
  return [lo,hi];
}
function numeric(value: number, p: GeneParameter) {
  const [lo,hi] = geneBounds(p);
  const clipped = clamp(value,lo,hi);
  return p.step && p.step > 0 ? clamp((p.min ?? 0) + Math.round((clipped-(p.min ?? 0))/p.step)*p.step,lo,hi) : clipped;
}
function valid(value: unknown, p: GeneParameter): boolean {
  return p.kind === 'number' ? typeof value === 'number' && Number.isFinite(value) : !!p.options?.includes(value as string | boolean);
}
function randomGene(p: GeneParameter, random: () => number): unknown {
  return p.kind === 'number' ? numeric((p.low ?? p.min ?? 0) + random() * ((p.high ?? p.max ?? 1) - (p.low ?? p.min ?? 0)), p)
    : p.options?.[Math.floor(random() * p.options.length)];
}
function repairRanges(dna: PresetDNA, parameters: GeneParameter[]) {
  for (const p of parameters) if (p.component === 'min') {
    const v = dna[p.path] as unknown as { min: number; max: number };
    if (v && v.min > v.max) {
      const high = parameters.find(g => g.path === p.path && g.component === 'max');
      if (p.enabled && high?.enabled) {
        const [lo] = geneBounds(p), [,hi] = geneBounds(high);
        if (lo > hi) throw new Error(`${p.label}: endpoint ranges do not overlap in a valid order.`);
        v.min = numeric(Math.max(lo, Math.min(v.min,v.max)),p); v.max = numeric(Math.max(v.max,v.min),high);
      } else if (p.enabled) {
        v.min = numeric(v.max,{...p,high:Math.min(p.high ?? p.max!,v.max)});
      } else if (high?.enabled) {
        v.max = numeric(v.min,{...high,low:Math.max(high.low ?? high.min!,v.min)});
      }
    }
  }
  return dna;
}
/** Merge only enabled, compatible genes into a fresh live baseline. */
export function reconcileDNA(source: PresetDNA, baseline: PresetDNA, parameters: GeneParameter[]): PresetDNA {
  const result = cloneDNA(baseline);
  for (const p of parameters) {
    const value = read(source, p);
    if (p.enabled && Object.prototype.hasOwnProperty.call(baseline, p.path) && valid(value, p)) write(result, p, p.kind === 'number' ? numeric(value as number, p) : value);
  }
  return repairRanges(result, parameters);
}
export function seedDNA(baseline: PresetDNA, parameters: GeneParameter[], settings: GeneticsSettings, random = Math.random): PresetDNA {
  const result = cloneDNA(baseline);
  for (const p of parameters.filter(p => p.enabled)) {
    const current = read(baseline, p);
    if (settings.seedMode === 'random' || !valid(current, p)) write(result, p, randomGene(p, random));
    else if (settings.spread > 0) write(result, p, p.kind === 'number'
      ? numeric((current as number) + (random() * 2 - 1) * settings.spread * ((p.high ?? p.max ?? 1) - (p.low ?? p.min ?? 0)), p)
      : random() < settings.spread ? randomGene(p, random) : current);
  }
  return repairRanges(result, parameters);
}
export function breedDNA(a: PresetDNA, b: PresetDNA, baseline: PresetDNA, parameters: GeneParameter[], settings: GeneticsSettings, random = Math.random): PresetDNA {
  const inherited = cloneDNA(baseline);
  const genes = parameters.filter(p => p.enabled);
  for (const p of genes) {
    const first = random() < .5 ? a : b, second = first === a ? b : a;
    const value = valid(read(first, p), p) ? read(first, p) : read(second, p);
    if (valid(value, p)) write(inherited, p, value);
  }
  const result = reconcileDNA(inherited, baseline, parameters);
  for (let i = 0; i < genes.length; i++) {
    const p = genes[i];
    if (random() >= settings.mutation) continue;
    if (settings.mutationMode === 'random') write(result, p, randomGene(p, random));
    else {
      const adjacent = [genes[i - 1], genes[i + 1]].filter(q => q && q.kind === p.kind && valid(read(inherited, q), q)
        && (p.kind === 'number' || valid(read(inherited, q), p)));
      const neighbor = adjacent[Math.floor(random() * adjacent.length)];
      if (!neighbor) continue;
      const value = read(inherited, neighbor);
      write(result, p, p.kind === 'number' ? numeric((p.low ?? p.min ?? 0) + clamp(((value as number) - neighbor.min!) / (neighbor.max! - neighbor.min!))
        * ((p.high ?? p.max ?? 1) - (p.low ?? p.min ?? 0)), p) : value);
    }
  }
  return repairRanges(result, parameters);
}
export function chooseParents(pool: ExplorationChild[], random = Math.random): [ExplorationChild, ExplorationChild] {
  if (pool.length < 2) throw new Error('Mark at least two parents in the breeding window.');
  const pick = (list: ExplorationChild[]) => {
    let ticket = random() * list.reduce((n, p) => n + clamp(p.rating, 1, 5), 0);
    return list.find(p => (ticket -= clamp(p.rating, 1, 5)) < 0) ?? list[list.length - 1];
  };
  const a = pick(pool); return [a, pick(pool.filter(p => p.id !== a.id))];
}
export interface MorphState { corners: (string | null)[]; ax: number; ay: number; bx: number; by: number; blend: number; corner: number }
export function morphDNA(children: ExplorationChild[], morph: MorphState, baseline: PresetDNA, parameters: GeneParameter[]): PresetDNA {
  const quad = (x: number, y: number) => [(1-x)*(1-y), x*(1-y), (1-x)*y, x*y];
  const groups = [quad(morph.ax, morph.ay), quad(morph.bx, morph.by)].map((weights, g) => {
    const entries = weights.map((weight, i) => ({ weight, child: children.find(c => c.id === morph.corners[g*4+i]) })).filter(e => e.child);
    const total = entries.reduce((s, e) => s + e.weight, 0);
    return entries.map(e => ({ child: e.child!, weight: total ? e.weight / total : 1 / entries.length }));
  });
  const weighted = groups.flatMap((entries, g) => entries.map(e => ({ ...e, weight: e.weight * (groups[1-g].length ? g ? morph.blend : 1-morph.blend : 1) })));
  const result = cloneDNA(baseline);
  for (const p of parameters.filter(p => p.enabled)) {
    const entries = weighted.filter(e => e.weight > 0 && valid(read(e.child.values, p), p));
    const total = entries.reduce((s,e) => s + e.weight, 0);
    if (!total) continue;
    write(result, p, p.kind === 'number' ? numeric(entries.reduce((s,e) => s + (read(e.child.values,p) as number) * e.weight, 0) / total, p)
      : read(entries.reduce((a,b) => a.weight >= b.weight ? a : b).child.values, p));
  }
  return repairRanges(result, parameters);
}
