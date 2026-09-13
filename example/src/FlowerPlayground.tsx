import { useMemo, useState } from 'react';
import {
  DEFAULT_FLOWER_SETTINGS,
  FLOWER_PALETTES,
  FLOWER_PATTERNS,
  flowerSvg,
  type FlowerSettings,
} from './flower-generator';
import './flower-playground.css';

type ShapeKey = Exclude<keyof FlowerSettings, 'palette' | 'pattern'>;
const CONTROLS: { key: ShapeKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'centerSize', label: 'Center size', min: .5, max: 3.5, step: .05, unit: '×' },
  { key: 'chaos', label: 'Chaos', min: 0, max: 1, step: .01, unit: '%' },
  { key: 'petals', label: 'Petals', min: 3, max: 16, step: 1 },
  { key: 'layers', label: 'Layers', min: 1, max: 5, step: 1 },
  { key: 'petalLength', label: 'Petal length', min: 60, max: 180, step: 1 },
  { key: 'petalWidth', label: 'Petal width', min: 20, max: 100, step: 1 },
  { key: 'roundness', label: 'Roundness', min: 0, max: 1, step: .01, unit: '%' },
  { key: 'irregularity', label: 'Irregularity', min: 0, max: 1, step: .01, unit: '%' },
  { key: 'twist', label: 'Layer twist', min: -90, max: 90, step: 1, unit: '°' },
  { key: 'spread', label: 'Spread', min: 0, max: 1, step: .01, unit: '%' },
];
const INITIAL_SEEDS = Array.from({ length: 8 }, (_, i) => `bloom-${String(i + 1).padStart(3, '0')}`);

/** A standalone design study; it never changes the instrument or its presets. */
export default function FlowerPlayground() {
  const [settings, setSettings] = useState<FlowerSettings>({ ...DEFAULT_FLOWER_SETTINGS });
  const [seed, setSeed] = useState(INITIAL_SEEDS[0]);
  const [seeds, setSeeds] = useState(INITIAL_SEEDS);
  const [notice, setNotice] = useState('');
  const svg = useMemo(() => flowerSvg(seed, settings), [seed, settings]);
  const thumbnails = useMemo(() => seeds.map(value => flowerSvg(value, settings)), [seeds, settings]);
  const palette = FLOWER_PALETTES.find(item => item.id === settings.palette) ?? FLOWER_PALETTES[0];
  const patternPreviews = useMemo(() => FLOWER_PATTERNS.map(pattern => flowerSvg(seed, { ...settings, pattern: pattern.id })), [seed, settings]);
  const selectedIndex = seeds.indexOf(seed);

  function newSeed() {
    const id = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    const batch = Array.from({ length: 8 }, (_, i) => `${id}-${String(i + 1).padStart(2, '0')}`);
    setSeeds(batch);
    setSeed(batch[0]);
    setNotice('A new set of eight variations is ready.');
  }

  function download() {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `flower-${seed.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64) || 'untitled'}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('SVG exported. It stays crisp at any size.');
  }

  return (
    <main className="flower-page">
      <div className="flower-shell">
        <header className="flower-header">
          <div>
            <a className="flower-back" href="/">← Move kit</a>
            <div className="flower-title-line"><h1>Preset garden</h1><span className="flower-tag">Design study</span></div>
            <p>A little visual DNA for every sound. Shape a flower, then explore its variations.</p>
          </div>
          <button type="button" className="flower-button" onClick={download}>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 3v9m-4-4 4 4 4-4M4 13v4h12v-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Export SVG
          </button>
        </header>

        <div className="flower-studio">
          <section className="flower-art-column" aria-label="Flower preview and variations">
            <figure className="flower-specimen" style={{ backgroundColor: palette.background }}>
              <div className="flower-specimen-top"><span>Specimen {selectedIndex < 0 ? '—' : String(selectedIndex + 1).padStart(2, '0')}</span><span>{palette.name} / 4 colors</span></div>
              <div className="flower-art" role="img" aria-label={`Procedural flower for seed ${seed || 'empty'}, ${settings.pattern} pattern based on ${settings.petals} petals in ${settings.layers} layers, ${Math.round(settings.chaos * 100)} percent chaos, ${palette.name} palette`} dangerouslySetInnerHTML={{ __html: svg }} />
              <figcaption><span className="flower-seed-caption" title={seed}>Seed <b>{seed || '(empty)'}</b></span><span>Same seed, same flower</span></figcaption>
            </figure>
            <div className="flower-gallery-heading"><h2>Same recipe, different seeds</h2><span>Select a flower to explore</span></div>
            <div className="flower-gallery" aria-label="Seed variations">
              {seeds.map((value, index) => (
                <button key={value} type="button" className="flower-thumbnail" aria-label={`Select variation ${index + 1}, seed ${value}`} aria-pressed={seed === value} onClick={() => { setSeed(value); setNotice(''); }}>
                  <span className="flower-thumb-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: thumbnails[index] }} />
                  <span className="flower-thumb-label"><span>{String(index + 1).padStart(2, '0')}</span><span aria-hidden="true">{seed === value ? '●' : ''}</span></span>
                </button>
              ))}
            </div>
            <p className="flower-footnote">Generated from a seed, with layered organic shapes and four colors from the kit palette. No two seeds grow quite alike.</p>
          </section>

          <aside className="flower-controls" aria-label="Generation controls">
            <section className="flower-control-section flower-seed-section">
              <label className="flower-section-label" htmlFor="flower-seed">Seed</label>
              <div className="flower-seed-row">
                <input id="flower-seed" type="text" value={seed} spellCheck={false} autoComplete="off" onChange={event => { setSeed(event.target.value); setNotice(''); }} aria-describedby="flower-seed-help" />
                <button type="button" className="flower-button flower-primary" onClick={newSeed}>New seed <span aria-hidden="true">↗</span></button>
              </div>
              <p id="flower-seed-help">Any word or number becomes a flower.</p>
            </section>

            <fieldset className="flower-control-section flower-patterns">
              <legend className="flower-section-label">Flower pattern</legend>
              <div className="flower-palette-list">
                {FLOWER_PATTERNS.map((item, index) => (
                  <button type="button" key={item.id} className="flower-palette flower-pattern" title={item.description} aria-pressed={settings.pattern === item.id} onClick={() => { setSettings(current => ({ ...current, pattern: item.id })); setNotice(item.description); }}>
                    <span className="flower-pattern-preview" aria-hidden="true" dangerouslySetInnerHTML={{ __html: patternPreviews[index] }} />
                    <span>{item.name}</span><span className="flower-palette-check" aria-hidden="true">{settings.pattern === item.id ? '✓' : ''}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flower-control-section flower-palettes">
              <legend className="flower-section-label">Color palette</legend>
              <div className="flower-palette-list">
                {FLOWER_PALETTES.map(item => (
                  <button type="button" key={item.id} className="flower-palette" aria-pressed={settings.palette === item.id} onClick={() => { setSettings(current => ({ ...current, palette: item.id })); setNotice(''); }}>
                    <span className="flower-swatches" aria-hidden="true">{item.colors.map(color => <i key={color} style={{ backgroundColor: color }} />)}</span>
                    <span>{item.name}</span><span className="flower-palette-check" aria-hidden="true">{settings.palette === item.id ? '✓' : ''}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <section className="flower-control-section flower-shape-section" aria-labelledby="flower-shape-heading">
              <div className="flower-shape-heading"><h2 id="flower-shape-heading">Flower form</h2><button type="button" className="flower-reset" onClick={() => { setSettings({ ...DEFAULT_FLOWER_SETTINGS }); setNotice('Design controls reset. Your seed is unchanged.'); }}>Reset design</button></div>
              <div className="flower-sliders">
                {CONTROLS.map(control => {
                  const value = settings[control.key];
                  const formatted = `${control.unit === '%' ? Math.round(value * 100) : value}${control.unit ?? ''}`;
                  return (
                    <div className="flower-slider" key={control.key}>
                      <label htmlFor={`flower-${control.key}`}>{control.label}</label>
                      <output htmlFor={`flower-${control.key}`}>{formatted}</output>
                      <input id={`flower-${control.key}`} type="range" min={control.min} max={control.max} step={control.step} value={value} aria-valuetext={formatted} onChange={event => { const next = Number(event.target.value); setSettings(current => ({ ...current, [control.key]: next })); setNotice(''); }} />
                    </div>
                  );
                })}
              </div>
            </section>
            <p className="flower-status" role="status">{notice || 'Changes appear in every flower, instantly.'}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
