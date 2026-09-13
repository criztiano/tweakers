/** Per-column minimum and maximum sample amplitudes, packed into parallel arrays. */
type Peaks = {
    min: Float32Array;
    max: Float32Array;
};
/** Down-mix every channel to a single mono track (channel average). Mono passes through. */
declare function mixToMono(buffer: AudioBuffer): Float32Array;
declare function fillPeaks(data: Float32Array, cols: number, min: Float32Array, max: Float32Array): void;
/**
 * One drawn bar of the pixelated waveform: where it starts, and the min/max
 * over every source column it stands for.
 */
type Bar = {
    x: number;
    min: number;
    max: number;
};
/**
 * Group per-pixel peaks into bars `pitch` pixels apart. Each bar reads the
 * min/max of its WHOLE pitch, so a bar drawn narrower than its pitch (the
 * striped style: a bar, then a gap the same width) still stands for every
 * sample under the gap. The gap costs resolution, never data — a transient
 * that lands in the gap still lifts the bar beside it.
 */
declare function barPeaks(p: Peaks, cols: number, pitch: number): Bar[];
declare function envelope(p: Peaks, cols: number, n: number): number[];

export { type Bar, type Peaks, barPeaks, envelope, fillPeaks, mixToMono };
