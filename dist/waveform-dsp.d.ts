/** Per-column minimum and maximum sample amplitudes, packed into parallel arrays. */
type Peaks = {
    min: Float32Array;
    max: Float32Array;
};
/** Down-mix every channel to a single mono track (channel average). Mono passes through. */
declare function mixToMono(buffer: AudioBuffer): Float32Array;
declare function fillPeaks(data: Float32Array, cols: number, min: Float32Array, max: Float32Array): void;
declare function envelope(p: Peaks, cols: number, n: number): number[];

export { type Peaks, envelope, fillPeaks, mixToMono };
