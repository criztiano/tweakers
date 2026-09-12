import { defineConfig } from 'tsup';

// Rewrite the shared TweakStore import to the `tweakers/store` package subpath so
// framework-neutral bundles reference the single shared store instead of
// inlining a second, desynced copy.
const externalizeTweakStore = {
  name: 'externalize-tweakstore',
  setup(build: { onResolve: (o: { filter: RegExp }, cb: () => { path: string; external: boolean }) => void }) {
    build.onResolve({ filter: /store\/TweakStore$/ }, () => ({
      path: 'tweakers/store',
      external: true,
    }));
  },
};

export default defineConfig([
  // Store build (shared across all consumers)
  {
    entry: { index: 'src/store/TweakStore.ts' },
    outDir: 'dist/store',
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
  },
  // Framework-neutral timeline runtime, consumed via the `tweakers/timeline`
  // subpath. Externalizes the shared store; bundles the timeline-only modules.
  {
    entry: { index: 'src/timeline/index.ts' },
    outDir: 'dist/timeline',
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    esbuildPlugins: [externalizeTweakStore],
  },
  // React build (the Move surface)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    // Base UI carries the notification stack. It stays external: the toast
    // manager is a module singleton, and a second inlined copy is a second
    // world where half the app's messages never reach the screen.
    external: ['react', 'react-dom', 'motion', /^@base-ui\/react/],
    // The Move surface must live on the same shared stores the sidebar
    // package (dialkit) uses — an inlined copy is a second, desynced world
    // where the panel sees no panels and presets land nowhere.
    esbuildPlugins: [
      {
        name: 'externalize-shared-stores',
        setup(build) {
          build.onResolve({ filter: /store\/TweakStore$/ }, () => ({
            path: 'tweakers/store',
            external: true,
          }));
          build.onResolve({ filter: /store\/ModulationStore$/ }, () => ({
            path: 'tweakers/modulation-store',
            external: true,
          }));
        },
      },
    ],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
    onSuccess: 'cp src/styles/theme.css dist/styles.css && mkdir -p dist/fonts && cp src/styles/fonts/* dist/fonts/',
  },
  // Framework-neutral leaf modules that keep their own subpath exports.
  // Externalize the shared store rather than inlining a second, desynced copy.
  {
    entry: {
      'curve-composer-core': 'src/curve-composer-core.ts',
      'modulation-core': 'src/modulation-core.ts',
      // ModulationStore sits in src/store, so its TweakStore import is the
      // bare sibling './TweakStore' — the widened filter below catches it.
      'modulation-store': 'src/store/ModulationStore.ts',
      // Leaf modules the dialkit sidebar package consumes via `tweakers/<name>`.
      'affordance-core': 'src/affordance-core.ts',
      'analyser-core': 'src/analyser-core.ts',
      'analyser-engine': 'src/analyser-engine.ts',
      'angle-core': 'src/angle-core.ts',
      'color-core': 'src/color-core.ts',
      'color-palette-store': 'src/color-palette-store.ts',
      'copy-instruction': 'src/copy-instruction.ts',
      'curve-preview-core': 'src/curve-preview-core.ts',
      'env': 'src/env.ts',
      'filter-core': 'src/filter-core.ts',
      'gradient-core': 'src/gradient-core.ts',
      'icons': 'src/icons.ts',
      'move-layout': 'src/move-layout.ts',
      'move-strip': 'src/move-strip.ts',
      'move-visual-core': 'src/move-visual-core.ts',
      'range-slider-core': 'src/range-slider-core.ts',
      'shortcut-utils': 'src/shortcut-utils.ts',
      'timeline-core': 'src/timeline-core.ts',
      'transfer-core': 'src/transfer-core.ts',
      'transition-math': 'src/transition-math.ts',
      'waveform-dsp': 'src/waveform-dsp.ts',
      'waveform-engine': 'src/waveform-engine.ts',
      'xy-pad-core': 'src/xy-pad-core.ts',
      'store/TimelineStore': 'src/store/TimelineStore.ts',
      'store/TimelineUiStore': 'src/store/TimelineUiStore.ts',
    },
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    esbuildPlugins: [
      {
        name: 'externalize-tweakstore',
        setup(build) {
          build.onResolve({ filter: /(store\/TweakStore|^\.\/TweakStore)$/ }, () => ({
            path: 'tweakers/store',
            external: true,
          }));
        },
      },
    ],
  },
]);
