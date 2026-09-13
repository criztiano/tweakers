import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { WaveformVisualization } from './WaveformVisualization';
import type { WaveformMode, WaveformLoop } from '../waveform-engine';
import { MoveWaveformStore, MOVE_WAVE_MAX_DISPLAY, MOVE_WAVEFORM_STEPS, type MoveWaveformVariant } from '../move-waveform';
import { MoveFunctions } from '../move-functions';
import { MoveSurfaceStore } from '../move-surface-store';
import { isDevDefault } from '../env';
import type { TweakTheme } from '../theme';

/** Slot geometry, so a slot-placed waveform lines up with the dial row. */
const SLOT_HEIGHT = 140;
/** The card's display, to the mockup: 728×128 inside the 12px frame. */
const DISPLAY_HEIGHT = 128;
/** The sample on the light display, and the frame's own dark. */
const WAVE_INK = '#1e1e1e';
/** The playhead, the loop band and the lit steps when the host names no colour. */
const DEFAULT_ACCENT = '#3d9bff';
/**
 * A slot-placed waveform is a tape head: the playhead holds the centre and the
 * sample runs past it. That is what the engine already does whenever the view
 * is magnified, so the slot simply starts magnified — the wheel takes over
 * from there.
 */
const SLOT_ZOOM = 4;
/** How far a docked waveform floats above the panel. */
const DOCK_GAP = 14;

export interface MoveWaveformProps {
  /** Decoded sample. */
  buffer?: AudioBuffer | null;
  /**
   * Where it sits. `page` is a card on the app's own surface, `slot` is
   * dial-sized with the playhead pinned at the centre, `dock` floats above
   * the Move panel.
   */
  variant?: MoveWaveformVariant;
  /** Read every frame for the playhead, exactly as WaveformVisualization takes it. */
  getProgress?: () => number;
  progress?: number;
  /** Reports a new play position — from a click, the volume knob, or the wheel. */
  onSeek?: (position: number) => void;
  /** Reports the loop the step row (or a drag) set, or null when it is cleared. */
  onLoopChange?: (loop: WaveformLoop | null) => void;
  /**
   * The host's transport. With it the waveform takes the Move's Play and
   * Loop keys for as long as it is mounted — Play runs the host's tape, Loop
   * arms its brackets — and the panel's clock wears both states. Without
   * it the keys stay the app's and the clock shows the time alone.
   */
  transport?: {
    playing: boolean;
    loopOn: boolean;
    onPlay: () => void;
    onLoop: () => void;
  };
  /** The colour of the playhead, the loop band and the lit steps — the host's signature on the card. */
  accent?: string;
  mode?: WaveformMode;
  pixelSize?: number;
  grid?: boolean;
  bands?: boolean;
  waveColor?: string;
  playheadColor?: string;
  /** The faint horizontal centre line behind the waveform (default on). */
  baseline?: boolean;
  /** Smooth mode: points the envelope simplifies to — more points, less smoothing. */
  smoothPoints?: number;
  /** Vertical inset (CSS px) the wave keeps from the canvas edges; the playhead and loop still run full height. */
  waveInset?: number;
  height?: number;
  /** Anything the app draws over the waveform — grain ticks, markers. */
  children?: React.ReactNode;
  theme?: TweakTheme;
  productionEnabled?: boolean;
  className?: string;
}

/**
 * The sample the Move's knobs are acting on, drawn on the same surface as the
 * panel and driven by the same hardware: the wheel zooms, the volume knob
 * scrubs, the step row marks the loop.
 *
 * Rendering one claims those controls for as long as it is mounted — there is
 * one wheel, so there is one waveform. The app keeps its own state; this
 * reports moves through `onSeek` / `onLoopChange` like any control.
 */
export function MoveWaveform({
  buffer = null,
  variant = 'page',
  getProgress,
  progress,
  onSeek,
  onLoopChange,
  transport,
  accent = DEFAULT_ACCENT,
  mode = 'smooth',
  pixelSize = 2,
  grid = false,
  bands = false,
  waveColor = WAVE_INK,
  playheadColor,
  baseline = false,
  smoothPoints = 200,
  waveInset,
  height,
  children,
  theme = 'system',
  productionEnabled = isDevDefault,
  className,
}: MoveWaveformProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [dockBottom, setDockBottom] = useState(0);
  const [mounted, setMounted] = useState(false);

  const seekRef = useRef(onSeek);
  seekRef.current = onSeek;
  const loopRef = useRef(onLoopChange);
  loopRef.current = onLoopChange;

  // Claim the hardware for as long as this is on screen.
  useEffect(() => {
    if (!productionEnabled) return;
    setMounted(true);
    return MoveWaveformStore.register();
  }, [productionEnabled]);

  // The transport, when the host runs one: Play and Loop are its keys while
  // the card is up (pushed, so whatever the app had on them comes back), and
  // the clock reads their state.
  const transportRef = useRef(transport);
  transportRef.current = transport;
  const hasTransport = !!transport;
  useEffect(() => {
    if (!productionEnabled || !hasTransport) return;
    const releases = [
      MoveFunctions.push('play', () => transportRef.current?.onPlay(), { label: 'Play', chip: false }),
      MoveFunctions.push('loop', () => transportRef.current?.onLoop(), { label: 'Loop', chip: false }),
    ];
    return () => releases.forEach((release) => release());
  }, [productionEnabled, hasTransport]);
  const playing = transport?.playing ?? false;
  const loopOn = transport?.loopOn ?? false;
  useEffect(() => {
    if (!productionEnabled) return;
    MoveWaveformStore.setTransport(hasTransport ? { playing, loopOn } : null);
  }, [productionEnabled, hasTransport, playing, loopOn]);

  // The step circles mirror the loop bar the hardware lights, in the card's
  // accent, for as long as the card is up; whatever the app had on the steps
  // comes back with it.
  useEffect(() => {
    if (!productionEnabled) return;
    const prev = MoveSurfaceStore.getState().steps;
    const paint = () => {
      const lit = new Set(MoveWaveformStore.loopSteps());
      MoveSurfaceStore.setSteps(
        Array.from({ length: MOVE_WAVEFORM_STEPS }, (_, step) => ({ step, color: accent, lit: lit.has(step) }))
      );
    };
    paint();
    const off = MoveWaveformStore.subscribe(paint);
    return () => {
      off();
      MoveSurfaceStore.setSteps(prev);
    };
  }, [productionEnabled, accent]);

  // The sample's length, so the volume readout counts seconds rather than
  // percent — it follows the buffer, which an app can swap under us.
  useEffect(() => {
    MoveWaveformStore.setDuration(buffer?.duration ?? null);
  }, [buffer]);

  const view = useSyncExternalStore(
    useCallback((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  const state = MoveWaveformStore.getView();

  // Hardware moves are the app's moves: report them the way a click does, so a
  // host that already handles onSeek needs no second code path.
  const lastSent = useRef({ position: state.position, loop: state.loop });
  useEffect(() => {
    if (state.position !== lastSent.current.position) {
      lastSent.current.position = state.position;
      seekRef.current?.(state.position);
    }
    if (state.loop !== lastSent.current.loop) {
      lastSent.current.loop = state.loop;
      loopRef.current?.(state.loop);
    }
  }, [view, state.position, state.loop]);

  // The canvas wants pixels; the layout wants to be fluid.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      setWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [mounted, variant]);

  // A docked waveform rides above whatever height the panel happens to be.
  useEffect(() => {
    if (variant !== 'dock' || typeof window === 'undefined') return;
    const measure = () => {
      const panel = document.querySelector('.tweakers-move-root .tweakers-move');
      const h = panel ? panel.getBoundingClientRect().height : 0;
      setDockBottom(h > 0 ? h + DOCK_GAP : DOCK_GAP);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const panel = document.querySelector('.tweakers-move-root .tweakers-move');
    if (panel) ro.observe(panel);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [variant, mounted]);

  if (!productionEnabled) return null;

  // The card has one height budget, whatever a host asks for: the mockup's
  // display by default, never past the cap.
  const boxHeight = Math.min(MOVE_WAVE_MAX_DISPLAY, height ?? (variant === 'slot' ? SLOT_HEIGHT : DISPLAY_HEIGHT));

  const wave = (
    <WaveformVisualization
      buffer={buffer}
      // The host's playhead for the drawing — except mid-turn, when the
      // knob's own landing leads and the host's seek trails it.
      {...(getProgress
        ? { getProgress: () => (MoveWaveformStore.isScrubbing() ? MoveWaveformStore.getView().position : getProgress()) }
        : { progress: progress ?? state.position })}
      mode={mode}
      pixelSize={pixelSize}
      grid={grid}
      bands={bands}
      waveColor={waveColor}
      playheadColor={playheadColor ?? accent}
      baseline={baseline}
      {...(smoothPoints != null ? { smoothPoints } : {})}
      {...(waveInset != null ? { waveInset } : {})}
      loop={state.loop}
      zoom={variant === 'slot' ? Math.max(SLOT_ZOOM, state.zoom) : state.zoom}
      onSeek={(p) => MoveWaveformStore.setView({ position: p })}
      onLoopChange={(l) => MoveWaveformStore.setView({ loop: l, loopAnchor: null })}
      width={Math.max(1, width)}
      height={boxHeight}
    />
  );

  const body = (
    <div
      ref={hostRef}
      className={`tweakers-move-wave${className ? ` ${className}` : ''}`}
      data-variant={variant}
      style={variant === 'dock' ? { bottom: `${dockBottom}px` } : undefined}
    >
      <div className="tweakers-move-wave-canvas" style={{ height: `${boxHeight}px` }}>
        {width > 0 && wave}
        {children}
      </div>
    </div>
  );

  if (variant !== 'dock') return body;
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div className="tweakers-root tweakers-move-root" data-theme={theme} data-wave-dock="true">
      {body}
    </div>,
    document.body
  );
}
