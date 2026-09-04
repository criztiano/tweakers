import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { WaveformVisualization } from './WaveformVisualization';
import type { WaveformMode, WaveformLoop } from '../waveform-engine';
import { MoveWaveformStore, type MoveWaveformVariant } from '../move-waveform';
import { isDevDefault } from '../env';
import type { TweakTheme } from './TweakRoot';

/** Slot geometry, so a slot-placed waveform lines up with the dial row. */
const SLOT_HEIGHT = 140;
/**
 * A slot-placed waveform is a tape head: the playhead holds the centre and the
 * sample runs past it. That is what the engine already does whenever the view
 * is magnified, so the slot simply starts magnified — the wheel takes over
 * from there.
 */
const SLOT_ZOOM = 4;
/** How far a docked waveform floats above the panel. */
const DOCK_GAP = 10;

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
  mode?: WaveformMode;
  pixelSize?: number;
  grid?: boolean;
  bands?: boolean;
  waveColor?: string;
  playheadColor?: string;
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
  mode = 'pixelated',
  pixelSize = 2,
  grid = false,
  bands = false,
  waveColor,
  playheadColor,
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

  const boxHeight = height ?? (variant === 'slot' ? SLOT_HEIGHT : 180);

  const wave = (
    <WaveformVisualization
      buffer={buffer}
      {...(getProgress ? { getProgress } : { progress: progress ?? state.position })}
      mode={mode}
      pixelSize={pixelSize}
      grid={grid}
      bands={bands}
      {...(waveColor ? { waveColor } : {})}
      {...(playheadColor ? { playheadColor } : {})}
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
