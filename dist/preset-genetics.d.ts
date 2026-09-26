import { T as TweakValue, C as ControlMeta } from './TweakStore-Cvn1eGaH.js';
import './gradient-core.js';
import './color-core.js';
import './xy-pad-core.js';
import './transfer-core.js';
import './filter-core.js';
import './range-slider-core.js';

type PresetDNA = Record<string, TweakValue>;
interface GeneParameter {
    id: string;
    path: string;
    label: string;
    group?: string;
    component?: string;
    kind: 'number' | 'category';
    min?: number;
    max?: number;
    step?: number;
    options?: (string | boolean)[];
    enabled: boolean;
    trouble?: boolean;
    low?: number;
    high?: number;
}
interface ExplorationChild {
    id: string;
    values: PresetDNA;
    parents: string[];
    rating: number;
    marked: boolean;
}
interface ExplorationTree {
    id: string;
    name: string;
    generations: {
        id: string;
        children: ExplorationChild[];
    }[];
}
interface GeneticsSettings {
    mutation: number;
    mutationMode: 'random' | 'copy-error';
    breedWindow: number;
    seedMode: 'current' | 'random';
    spread: number;
    seedCount: number;
}
declare const cloneDNA: <T>(value: T) => T;
declare const clamp: (v: number, min?: number, max?: number) => number;
declare const newDNAId: () => string;
declare function collectGenes(controls: ControlMeta[], group?: string): GeneParameter[];
declare function geneBounds(p: GeneParameter): [number, number];
/** Merge only enabled, compatible genes into a fresh live baseline. */
declare function reconcileDNA(source: PresetDNA, baseline: PresetDNA, parameters: GeneParameter[]): PresetDNA;
declare function seedDNA(baseline: PresetDNA, parameters: GeneParameter[], settings: GeneticsSettings, random?: () => number): PresetDNA;
declare function breedDNA(a: PresetDNA, b: PresetDNA, baseline: PresetDNA, parameters: GeneParameter[], settings: GeneticsSettings, random?: () => number): PresetDNA;
declare function chooseParents(pool: ExplorationChild[], random?: () => number): [ExplorationChild, ExplorationChild];
interface MorphState {
    corners: (string | null)[];
    ax: number;
    ay: number;
    bx: number;
    by: number;
    blend: number;
    corner: number;
}
declare function morphDNA(children: ExplorationChild[], morph: MorphState, baseline: PresetDNA, parameters: GeneParameter[]): PresetDNA;

export { type ExplorationChild, type ExplorationTree, type GeneParameter, type GeneticsSettings, type MorphState, type PresetDNA, breedDNA, chooseParents, clamp, cloneDNA, collectGenes, geneBounds, morphDNA, newDNAId, reconcileDNA, seedDNA };
