import { presetFlowerSeed, presetFlowerSvg } from '../src/preset-flower';
import { MOVE_PALETTE } from '../src/move-palette';
import { describe, expect, it } from 'vitest';
import { flowerSvg, DEFAULT_FLOWER_SETTINGS as defaults, FLOWER_PALETTES, FLOWER_PATTERNS } from '../example/src/flower-generator';

describe('procedural preset artwork', () => {
  it('keeps preset artwork stable across serialization and changes it with DNA', () => {
    const a={gain:.5,xy:{x:.2,y:.8},steps:[1,2,3]};
    const b={steps:[1,2,3],xy:{y:.8,x:.2},gain:.5};
    expect(presetFlowerSeed(a)).toBe(presetFlowerSeed(b));
    expect(presetFlowerSvg(a)).toBe(presetFlowerSvg(JSON.parse(JSON.stringify(b))));
    expect(presetFlowerSvg({...a,gain:.6})).not.toBe(presetFlowerSvg(a));
    expect(presetFlowerSvg(a)).toBe(flowerSvg(presetFlowerSeed(a),defaults));
  });
  it('uses the approved Wildflower recipe and shared kit palette', () => {
    expect(defaults).toEqual({pattern:'wild',palette:'kit',centerSize:2.75,chaos:1,petals:16,layers:2,petalLength:60,petalWidth:20,roundness:.5,irregularity:1,twist:-90,spread:0});
    const svg=flowerSvg('approved-recipe',defaults);
    const fills=[...svg.matchAll(/<path[^>]+fill="([^"]+)"/g)].map(m=>m[1]);
    expect(new Set(fills).size).toBeLessThanOrEqual(4);
    for(const fill of fills) expect(Object.values(MOVE_PALETTE)).toContain(fill);
    expect(FLOWER_PALETTES[0].background).toBe(MOVE_PALETTE.white);
  });
  it('keeps each seed reproducible, independent of other renders', () => {
    const first = flowerSvg('preset-dna-42', defaults);
    flowerSvg('another preset', { ...defaults, petals: 12 });
    expect(flowerSvg('preset-dna-42', defaults)).toBe(first);
    expect(flowerSvg('preset-dna-43', defaults)).not.toBe(first);
  });
  it('changes growth structure across seeds while zero chaos retains a regular flower', () => {
    const count = (svg: string) => [...svg.matchAll(/<path /g)].length;
    const calm = Array.from({length:8}, (_,i)=>flowerSvg(`bloom-${i}`, {...defaults,chaos:0}));
    expect(calm.every(svg=>count(svg)===defaults.petals*defaults.layers+1)).toBe(true);
    const wild = Array.from({length:8}, (_,i)=>flowerSvg(`bloom-${i}`, {...defaults,chaos:1}));
    expect(new Set(wild.map(count)).size).toBeGreaterThan(1);
    expect(wild.some(svg=>count(svg)>defaults.petals*defaults.layers+1)).toBe(true);
    expect(flowerSvg('bloom-0', {...defaults,chaos:0})).toBe(calm[0]);
  });
  it('offers distinct reproducible pattern geometry and retains palette limits', () => {
    const outputs = FLOWER_PATTERNS.map(pattern => {
      const settings = {...defaults,pattern:pattern.id};
      const svg = flowerSvg('pattern-comparison', settings);
      expect(flowerSvg('pattern-comparison',settings)).toBe(svg);
      expect(svg).not.toMatch(/NaN|Infinity|undefined/);
      const allowed = [FLOWER_PALETTES[0].background,...FLOWER_PALETTES[0].colors];
      for (const [,color] of svg.matchAll(/fill="([^"]+)"/g)) expect(allowed).toContain(color);
      return svg;
    });
    expect(new Set(outputs).size).toBe(FLOWER_PATTERNS.length);
  });
  it('enlarges only the foreground center without rerolling the other blobs', () => {
    const paths = (size:number) => [...flowerSvg('center-check',{...defaults,centerSize:size}).matchAll(/<path d="([^"]+)"/g)].map(m=>m[1]);
    const small=paths(1), large=paths(1.8);
    expect(large.slice(0,-1)).toEqual(small.slice(0,-1));
    expect(large[large.length-1]).not.toBe(small[small.length-1]);
  });
  it('uses only the selected limited palette and exports standalone SVG', () => {
    for (const palette of FLOWER_PALETTES) {
      const svg = flowerSvg('garden', { ...defaults, palette: palette.id });
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      const allowed = [palette.background, ...palette.colors];
      for (const [, color] of svg.matchAll(/fill="([^"]+)"/g)) expect(allowed).toContain(color);
    }
  });
  it('handles extreme or invalid settings without invalid geometry or interpolating seed markup', () => {
    for (const value of [NaN, Infinity, -999, 999]) {
      const svg = flowerSvg('<script>alert(1)</script>', { petals:value,layers:value,petalLength:value,petalWidth:value,roundness:value,irregularity:value,twist:value,spread:value,chaos:value,centerSize:value,pattern:'unknown',palette:'unknown' });
      expect(svg).not.toMatch(/NaN|Infinity|script|undefined/);
      expect(svg.endsWith('</svg>')).toBe(true);
    }
  });
});
