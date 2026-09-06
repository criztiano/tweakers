type AnalyserScale = 'log' | 'linear';
/** `true` enables the default spring; an object overrides stiffness/damping. */
type AnalyserSpring = boolean | {
    stiffness?: number;
    damping?: number;
};
/** Byte frequency magnitude (0..255, the analyser's minDecibels..maxDecibels window) → 0..1. */
declare function byteFreqToUnit(v: number): number;
/** Byte time-domain sample (0..255, 128 = silence) → signed amplitude −1..1. */
declare function byteTimeToUnit(v: number): number;
declare function binRange(point: number, points: number, bins: number, scale: AnalyserScale, loBin?: number, hiBin?: number): {
    start: number;
    end: number;
};
declare function hzWindowToBins(rangeHz: readonly [number, number], nyquistHz: number, bins: number): {
    loBin: number;
    hiBin: number;
} | null;
declare function markerT(bin: number, scale: AnalyserScale, loBin: number, hiBin: number): number | null;
declare function fillFrequencyTargets(data: Uint8Array, out: Float32Array, scale: AnalyserScale, loBin?: number, hiBin?: number): void;
declare function fillWaveformMinMax(data: Uint8Array, cols: number, min: Float32Array, max: Float32Array): void;
declare function resampleWaveform(data: Uint8Array, out: Float32Array): void;
declare function risingZeroCross(data: Uint8Array): number;
/** Rectified peak of a time-domain byte window → 0..1 (the EKG pen's level). */
declare function peakLevel(data: Uint8Array): number;
declare function advanceSweep(history: Float32Array, head: number, prevLevel: number, level: number, dtCols: number): number;
declare function stepSprings(pos: Float32Array, vel: Float32Array, targets: Float32Array, stiffness: number, damping: number, dt: number): void;
declare const SPRING_DEFAULT_STIFFNESS = 120;
declare const SPRING_DEFAULT_DAMPING = 14;
declare function normalizeSpring(spring: AnalyserSpring | undefined): {
    stiffness: number;
    damping: number;
} | null;
declare function columnWidth(dpr: number, pixelSize: number): number;
/** Snap a device-pixel coordinate onto the pixel-mode block grid. */
declare function quantizeToGrid(v: number, colW: number): number;

export { type AnalyserScale, type AnalyserSpring, SPRING_DEFAULT_DAMPING, SPRING_DEFAULT_STIFFNESS, advanceSweep, binRange, byteFreqToUnit, byteTimeToUnit, columnWidth, fillFrequencyTargets, fillWaveformMinMax, hzWindowToBins, markerT, normalizeSpring, peakLevel, quantizeToGrid, resampleWaveform, risingZeroCross, stepSprings };
