/**
 * How the sample is drawn. `smooth` is the simplified envelope; `pixelated`
 * is one chunky min/max bar per column; `striped` is the pixelated bar with
 * a gap the same width after it — each bar then stands for twice the
 * samples, so the wave keeps every transient and loses only resolution;
 * `spaced` keeps the pixelated bar exactly as it is and puts the gap after
 * it, so the wave is twice as long and the same zoom shows half as much.
 */
type WaveformMode = 'smooth' | 'pixelated' | 'striped' | 'spaced';
declare const WAVEFORM_MODES: WaveformMode[];
/** A loop region over the sample, as normalized 0..1 positions. */
type WaveformLoop = {
    start: number;
    end: number;
};
/** Everything the engine reads each frame. Wrappers supply a getter for the live values. */
interface WaveformRuntime {
    buffer: AudioBuffer | null;
    progress: number;
    getProgress?: () => number;
    mode: WaveformMode;
    border: boolean;
    bands: boolean;
    pixelSize: number;
    grid: boolean;
    gridSubdivisions: number;
    waveColor?: string;
    playheadColor?: string;
    /** The faint horizontal centre line behind the waveform. */
    baseline: boolean;
    /** Smooth mode: points the envelope simplifies to — more points, less smoothing. */
    smoothPoints: number;
    /**
     * Vertical inset (CSS px) the wave keeps from the canvas edges. The
     * playhead, loop band and grid still run the full height — a frame for
     * the drawing, not for the instrument.
     */
    waveInset: number;
    autoZoomOnLoop: boolean;
    loop: WaveformLoop | null;
    /** Manual zoom level (the wrapper owns the +/− buttons). */
    zoom: number;
    width: number;
    height: number;
    onSeek?: (progress: number) => void;
    onLoopChange?: (loop: WaveformLoop | null) => void;
}
interface WaveformEngine {
    destroy(): void;
}
declare const WAVEFORM_MAX_ZOOM = 1024;
declare const WAVEFORM_SMOOTH_POINTS = 46;
/**
 * Mount the renderer on `canvas`, reading the current props from `get()` every
 * frame. Returns a handle whose `destroy()` stops the loop and detaches listeners.
 */
declare function createWaveformEngine(canvas: HTMLCanvasElement, get: () => WaveformRuntime): WaveformEngine;

export { WAVEFORM_MAX_ZOOM, WAVEFORM_MODES, WAVEFORM_SMOOTH_POINTS, type WaveformEngine, type WaveformLoop, type WaveformMode, type WaveformRuntime, createWaveformEngine };
