/** A seed is a stable visual identity; settings change its rendering, not its randomness. */
interface FlowerSettings {
    petals: number;
    layers: number;
    petalLength: number;
    petalWidth: number;
    roundness: number;
    irregularity: number;
    twist: number;
    spread: number;
    chaos: number;
    centerSize: number;
    palette: string;
    pattern: string;
}
declare const FLOWER_PALETTES: {
    id: string;
    name: string;
    background: "#ffffff";
    colors: ("#fd3c57" | "#fd6b59" | "#f2cf43" | "#a3f243" | "#00ed95" | "#698eff" | "#8660c3" | "#fe92d5")[];
}[];
declare const FLOWER_PATTERNS: {
    id: string;
    name: string;
    description: string;
}[];
declare const DEFAULT_FLOWER_SETTINGS: FlowerSettings;
declare function flowerSvg(seed: string, input: FlowerSettings, options?: {
    background?: boolean;
}): string;
/** Sorted object keys make artwork independent of preset serialization order. */
declare function presetFlowerSeed(values: Record<string, unknown>): string;
declare function presetFlowerSvg(values: Record<string, unknown>): string;

export { DEFAULT_FLOWER_SETTINGS, FLOWER_PALETTES, FLOWER_PATTERNS, type FlowerSettings, flowerSvg, presetFlowerSeed, presetFlowerSvg };
