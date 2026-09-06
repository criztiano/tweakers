import { a as TweakConfig, b as TransitionConfig, R as ResolvedValues, T as TweakValue } from './TweakStore-D-U-7qQl.js';
import { SpringParams } from './transition-math.js';
import { TimelineClipMeta } from './store/TimelineStore.js';
import './gradient-core.js';
import './color-core.js';
import './xy-pad-core.js';
import './transfer-core.js';
import './filter-core.js';
import './range-slider-core.js';

type TimelineClipLoop = 'off' | 'repeat';
type TimelineStepValues = {
    [key: string]: TweakConfig[string] | undefined;
};
type TimelineStepConfig = {
    duration?: number;
    to?: TimelineStepValues;
    transition?: TransitionConfig;
};
type TimelinePropStepConfig = {
    duration?: number;
    to?: number | string;
    transition?: TransitionConfig;
};
type TimelinePropConfig = {
    from?: number | string;
    to?: number | string;
    duration?: number;
    /** Offset from the clip's `at` in seconds. */
    delay?: number;
    transition?: TransitionConfig;
    steps?: TimelinePropStepConfig[];
};
type TimelineClipBase = {
    at: number;
    duration?: number;
    transition?: TransitionConfig;
    loop?: boolean | TimelineClipLoop;
};
type TimelineClipConfig = TimelineClipBase & ({
    from?: TweakConfig;
    to?: TweakConfig;
    steps?: never;
    props?: never;
} | {
    from?: TweakConfig;
    to?: never;
    /** Sequential legs on one row — a segmented bar; boundaries retime legs. */
    steps: TimelineStepConfig[];
    props?: never;
} | {
    from?: never;
    to?: never;
    steps?: never;
    /** Independent per-property tracks — mutually exclusive with from/to/steps. */
    props: {
        [prop: string]: TimelinePropConfig;
    };
});
/** Nested keys group clips into a collapsible layer — purely presentational. */
type TimelineGroupConfig = {
    [key: string]: TimelineClipConfig;
};
type TimelineConfig = {
    /** Total timeline length in seconds. Inferred from the last clip when omitted. */
    duration?: number;
} & {
    [key: string]: TimelineClipConfig | TimelineGroupConfig | number | undefined;
};
/** CSS-friendly output for consumers not using Motion — spread into a style. */
type TimelineClipCss = {
    transitionDuration: string;
    transitionTimingFunction: string;
};
type TimelineClipValues<C extends TimelineClipConfig = TimelineClipConfig> = {
    at: number;
    duration: number;
    /** Effective code-defined loop mode. */
    loop: TimelineClipLoop;
    /** Playhead is at or past the clip start. */
    started: boolean;
    /** Playhead is inside the clip — for looping clips, inside any cycle. */
    active: boolean;
    /** Playhead is past the clip end (for looping clips, past the timeline end). */
    done: boolean;
    /**
     * 0–1 position of the playhead within the clip — cycle progress (a
     * sawtooth) for looping clips, sequence progress for steps clips.
     */
    progress: number;
    /** Index of the leg under the playhead, for sequence clips. */
    step: C['steps'] extends TimelineStepConfig[] ? number : undefined;
    from: C['props'] extends Record<string, TimelinePropConfig> ? {
        [K in keyof C['props']]: number | string;
    } : C['from'] extends TweakConfig ? ResolvedValues<C['from']> : undefined;
    to: C['props'] extends Record<string, TimelinePropConfig> ? {
        [K in keyof C['props']]: number | string;
    } : C['steps'] extends TimelineStepConfig[] ? C['from'] extends TweakConfig ? ResolvedValues<C['from']> : Record<string, number | string> : C['to'] extends TweakConfig ? ResolvedValues<C['to']> : undefined;
    /** `to` once the clip has started, `from` before — hand it to Motion's animate.
     * For sequences this is the final merged state; for props clips, per-track
     * endpoint records. */
    animate: C['props'] extends Record<string, TimelinePropConfig> ? {
        [K in keyof C['props']]: number | string;
    } : C['steps'] extends TimelineStepConfig[] ? C['from'] extends TweakConfig ? ResolvedValues<C['from']> : Record<string, number | string> | undefined : C['to'] extends TweakConfig ? C['from'] extends TweakConfig ? ResolvedValues<C['from']> | ResolvedValues<C['to']> : ResolvedValues<C['to']> | undefined : undefined;
    /** The clip's editable curve — single-curve clips only. */
    transition: C['props'] extends Record<string, TimelinePropConfig> ? undefined : C['steps'] extends TimelineStepConfig[] ? undefined : C extends {
        transition: TransitionConfig;
    } | {
        from: TweakConfig;
    } | {
        to: TweakConfig;
    } ? TransitionConfig : undefined;
    /** Duration + timing-function for native CSS transitions — single-curve clips only. */
    css: C['props'] extends Record<string, TimelinePropConfig> ? undefined : C['steps'] extends TimelineStepConfig[] ? undefined : C extends {
        transition: TransitionConfig;
    } | {
        from: TweakConfig;
    } | {
        to: TweakConfig;
    } ? TimelineClipCss : undefined;
    /**
     * Values interpolated through the clip's curves at the current playhead —
     * bind to style for true scrubbing: the element is exactly at this point
     * in time whether playing, paused, or scrubbing. Sequence clips report the
     * merged state of all legs (declare every animated property in `from`);
     * props clips report every track's value.
     */
    current: C['props'] extends Record<string, TimelinePropConfig> ? {
        [K in keyof C['props']]: number | string;
    } : C['steps'] extends TimelineStepConfig[] ? C['from'] extends TweakConfig ? ResolvedValues<C['from']> : Record<string, number | string> : C['to'] extends TweakConfig ? C['from'] extends TweakConfig ? ResolvedValues<C['from']> | ResolvedValues<C['to']> : undefined : undefined;
};
type TimelineGroupValues<G extends TimelineGroupConfig> = {
    [K in keyof G as G[K] extends TimelineClipConfig ? K : never]: TimelineClipValues<Extract<G[K], TimelineClipConfig>>;
};
type TweakTimelineValues<T extends TimelineConfig> = {
    time: number;
    playing: boolean;
    duration: number;
    play: () => void;
    pause: () => void;
    replay: () => void;
    seek: (time: number) => void;
} & {
    [K in keyof T as T[K] extends TimelineClipConfig ? K : never]: TimelineClipValues<Extract<T[K], TimelineClipConfig>>;
} & {
    [K in keyof T as T[K] extends TimelineClipConfig ? never : T[K] extends TimelineGroupConfig ? K : never]: TimelineGroupValues<Extract<T[K], TimelineGroupConfig>>;
};
declare const CLIP_VALUE_STEP = 0.01;
declare const TIMELINE_MIN_CLIP_DURATION = 0.05;
type ParsedTimeline = {
    duration: number;
    tweakConfig: TweakConfig;
    clips: TimelineClipMeta[];
};
declare function normalizeLoopMode(value: unknown): TimelineClipLoop;
declare function parseTimelineConfig(config: TimelineConfig): ParsedTimeline;
type CurveStatic = {
    duration: number;
    spring?: SpringParams;
    settle?: number;
    ease?: [number, number, number, number];
};
type TimelineStepStatic = {
    key: string | null;
    offset: number;
    duration: number;
    isPhysics: boolean;
    /** Full property state at step start — the hold rule made concrete. */
    start: Record<string, unknown>;
    /** Targets this step animates; untouched properties hold `start`. */
    to: Record<string, unknown>;
    curve: CurveStatic;
};
/**
 * One track: a step chain with its own cycle length and phase offset from
 * the clip's `at`. This is the unified runtime model — a shared-timing clip
 * is exactly one track (prop unset, delay 0) whose steps carry the full
 * property record; a props clip is one single-property track per entry.
 */
type TimelineTrackStatic = {
    /** Set for a props clip's single-property tracks; unset for the shared track. */
    prop?: string;
    delay: number;
    duration: number;
    steps: TimelineStepStatic[];
};
type TimelineClipStatic = {
    key: string;
    childKey: string;
    group?: string;
    at: number;
    /** Effective total duration — the bar length (one cycle for looping clips;
     * the widest track extent for props clips). */
    duration: number;
    loop: TimelineClipLoop;
    /** Where the clip stops affecting values: at + duration, or the timeline end when looping. */
    end: number;
    isPhysics: boolean;
    /** Motion-ready transition, its duration injected from the bar — single-curve clips only. */
    transition?: TransitionConfig;
    css?: TimelineClipCss;
    from?: Record<string, unknown>;
    /** Final merged state (the last leg's landing values for sequences). */
    to?: Record<string, unknown>;
    /** Every animating clip is tracks; empty for markers. */
    tracks: TimelineTrackStatic[];
    explicitSteps: boolean;
    /** Union of every property the clip touches. */
    props?: string[];
};
declare function computeStaticClips(parsed: ParsedTimeline, flatValues: Record<string, TweakValue>): TimelineClipStatic[];
type TimelineStaticState = {
    duration: number;
    clips: TimelineClipStatic[];
};
/**
 * Resolves the editable clip model and grows the timeline when a live value
 * creates content beyond its authored window. This is most important for
 * physics springs: changing stiffness/damping changes their emergent length.
 * The parsed duration remains the minimum, so shortening a clip never removes
 * the original editing room.
 */
declare function computeStaticTimeline(parsed: ParsedTimeline, flatValues: Record<string, TweakValue>): TimelineStaticState;
/** The dock's resolver: the same static model the hook animates with,
 * rebuilt from flat stored values — bars, popovers, and playback can never
 * disagree about geometry. */
declare function computeClipStaticFromValues(values: Record<string, TweakValue>, clip: TimelineClipMeta, timelineDuration: number): TimelineClipStatic;
/**
 * `time` is the playhead (what the dock shows); `cycleTime` is continuous
 * time across timeline wraps (wraps × duration + time). Looping clips fold
 * against `cycleTime`, so a looping timeline never snaps their phase — the
 * window is a viewport onto animations that repeat forever. Scrubbing seeks
 * with cycleTime === time, which is the deterministic first-pass state.
 */
declare function computeClipState(clip: TimelineClipStatic, time: number, cycleTime?: number): Record<string, unknown>;
declare function interpolateResolved(from: unknown, to: unknown, p: number): unknown;
declare function transitionToCss(transition: TransitionConfig | undefined): TimelineClipCss | undefined;
/** Popover display values: swap stored shape-only transitions for their
 * effective configs (duration injected from the bar/segment) so the curve
 * editor shows the transition as it actually runs. */
declare function timelinePopoverDisplayValues(values: Record<string, TweakValue>, clipKey: string, stepKeys?: string[], stepKey?: string): Record<string, TweakValue>;
/** Dragging a track bar edits the property's phase offset. */
declare function clampTrackDelay(delay: number, at: number, trackDuration: number, timelineDuration: number): number;
declare function clampClipMove(at: number, duration: number, timelineDuration: number): number;
declare function clampClipResizeEnd(duration: number, at: number, timelineDuration: number): number;
declare function clampClipResizeStart(newAt: number, at: number, duration: number): {
    at: number;
    duration: number;
};
/** Resizing one leg of a sequence: the other legs keep their length, the
 * whole bar must still fit the timeline. */
declare function clampStepResize(duration: number, at: number, otherStepsTotal: number, timelineDuration: number): number;
/** Copy-for-agent export: strip editor-only state, normalize shape-only
 * transitions, resolve physics durations, and drop zero-value defaults. */
declare function normalizeTimelineValuesForCopy(values: Record<string, TweakValue>, clips: TimelineClipMeta[]): Record<string, TweakValue>;
declare function formatClock(time: number, tenths?: boolean): string;
declare function formatSeconds(value: number): string;
declare function formatStepLabel(stepKey: string): string;

export { CLIP_VALUE_STEP, type ParsedTimeline, TIMELINE_MIN_CLIP_DURATION, type TimelineClipConfig, type TimelineClipCss, type TimelineClipLoop, type TimelineClipStatic, type TimelineClipValues, type TimelineConfig, type TimelineGroupConfig, type TimelineGroupValues, type TimelinePropConfig, type TimelinePropStepConfig, type TimelineStaticState, type TimelineStepConfig, type TimelineStepStatic, type TimelineStepValues, type TimelineTrackStatic, type TweakTimelineValues, clampClipMove, clampClipResizeEnd, clampClipResizeStart, clampStepResize, clampTrackDelay, computeClipState, computeClipStaticFromValues, computeStaticClips, computeStaticTimeline, formatClock, formatSeconds, formatStepLabel, interpolateResolved, normalizeLoopMode, normalizeTimelineValuesForCopy, parseTimelineConfig, timelinePopoverDisplayValues, transitionToCss };
