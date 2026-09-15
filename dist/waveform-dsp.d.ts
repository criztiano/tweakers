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
 * min/max of its whole pitch, so no column's sample is left out of the bar
 * that stands for it.
 */
declare function barPeaks(p: Peaks, cols: number, pitch: number): Bar[];
/**
 * A simplified symmetric envelope pinned to the sample rather than the view:
 * point `k` sits at sample `k * seg` and reads the peak amplitude over the
 * `seg` samples centred on it. The points covering samples `from`..`to` come
 * back with their sample positions, so a window sliding across the sample
 * shows the same shape moving, never a reshaped one.
 */
declare function sampleEnvelope(data: Float32Array, from: number, to: number, seg: number): {
    pos: number;
    amp: number;
}[];
declare function envelope(p: Peaks, cols: number, n: number): number[];

export { type Bar, type Peaks, barPeaks, envelope, fillPeaks, mixToMono, sampleEnvelope };
