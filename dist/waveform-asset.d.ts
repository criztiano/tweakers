/** One rung of the ladder: the min and max of every `bucket` samples. */
type WaveformLevel = {
    bucket: number;
    min: Float32Array;
    max: Float32Array;
};
/**
 * An immutable sample for the waveform. The peaks cover the whole mono mix;
 * `samples`, when there is one, reads the mix itself for zooms finer than the
 * finest rung — a short window, so reading it per frame stays cheap.
 */
interface WaveformAsset {
    sampleRate: number;
    /** Frames in the sample. */
    length: number;
    /** Seconds. */
    duration: number;
    /** Finest first; each rung's bucket is twice the one before. */
    levels: WaveformLevel[];
    /** The mono mix over frames [start, end), or null when only the peaks are kept. */
    samples?: (start: number, end: number) => Float32Array | null;
}
/** A retained stretch of the source, in its seconds. The waveform plays the stretches back to back. */
type WaveformRange = {
    start: number;
    end: number;
};
/** The finest rung. Below it, the samples are read directly. */
declare const WAVEFORM_BASE_BUCKET = 64;
/**
 * The peak ladder of the channels' mono mix. Nothing full-length is allocated
 * beyond the finest rung: the mix is folded into buckets as it is read.
 */
declare function buildWaveformLevels(channels: Float32Array[], base?: number): WaveformLevel[];
/** The mono mix of `channels` over [start, end). */
declare function mixRange(channels: Float32Array[], start: number, end: number): Float32Array;
/** An asset over an AudioBuffer (or anything shaped like one): peaks built here, samples read from it. */
declare function waveformAssetFromBuffer(buffer: AudioBuffer): WaveformAsset;
/** An asset from peaks built elsewhere (a worker), reading fine detail from `channels` when given. */
declare function waveformAsset(levels: WaveformLevel[], sampleRate: number, length: number, channels?: Float32Array[] | null): WaveformAsset;
/** The ranges' total, in seconds — the length of the sample as it plays. */
declare function rangesDuration(ranges: WaveformRange[]): number;
/** The ranges an asset plays: the given ones, or the whole of it. */
declare function playedRanges(asset: WaveformAsset, ranges?: WaveformRange[] | null): WaveformRange[];
/**
 * Per-column peaks over the played time [t0, t1) seconds, where played time
 * runs through `ranges` back to back. Columns with nothing under them read
 * as silence. The cost follows the columns, never the samples on screen.
 */
declare function fillRangePeaks(asset: WaveformAsset, ranges: WaveformRange[], t0: number, t1: number, cols: number, min: Float32Array, max: Float32Array): void;

export { WAVEFORM_BASE_BUCKET, type WaveformAsset, type WaveformLevel, type WaveformRange, buildWaveformLevels, fillRangePeaks, mixRange, playedRanges, rangesDuration, waveformAsset, waveformAssetFromBuffer };
