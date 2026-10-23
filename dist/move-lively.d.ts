/** A duration-based Motion spring. */
interface LivelySpring {
    readonly type: 'spring';
    /** Seconds the spring takes to visually arrive. */
    readonly visualDuration: number;
    readonly bounce: number;
}
/** A Motion tween with a cubic Bézier. */
interface LivelyTween {
    readonly type: 'tween';
    /** Seconds. */
    readonly duration: number;
    readonly ease: readonly [number, number, number, number];
}
/** A press going in and coming back out. */
declare const LIVELY_PRESS: LivelySpring;
/** Toggles, the selection highlight, menus, popovers, list rows, a value following its source. */
declare const LIVELY_UI: LivelySpring;
/** Panels, sheets, view switches. */
declare const LIVELY_SURFACE: LivelySpring;
/** Anything leaving: quick and accelerating, out of the way. */
declare const LIVELY_EXIT: LivelyTween;
/** How far a pressed control sinks. */
declare const LIVELY_PRESS_SCALE = 0.97;
/** Seconds between one child and the next in a staggered entrance. */
declare const LIVELY_STAGGER = 0.035;
/** The most a whole stagger may take, first child to last, in seconds. */
declare const LIVELY_STAGGER_MAX = 0.2;
/**
 * The delay, in seconds, for child `index` of `count`. The step shrinks for a
 * long run so the last child still starts within `LIVELY_STAGGER_MAX`.
 */
declare function livelyStagger(index: number, count: number): number;
/** A spring as CSS: its settle time and its `linear()` easing. */
interface LivelyCss {
    /** CSS time, e.g. `300ms`. */
    readonly duration: string;
    /** A CSS `linear()` easing. */
    readonly easing: string;
}
/**
 * The springs as CSS — Motion's `spring(visualDuration, bounce).toString()`,
 * split into duration and easing. theme.css carries the same strings as
 * `--move-spring-press`, `--move-spring-ui` and `--move-spring-surface`.
 */
declare const LIVELY_CSS: {
    readonly press: LivelyCss;
    readonly ui: LivelyCss;
    readonly surface: LivelyCss;
    readonly exit: LivelyCss;
};

export { LIVELY_CSS, LIVELY_EXIT, LIVELY_PRESS, LIVELY_PRESS_SCALE, LIVELY_STAGGER, LIVELY_STAGGER_MAX, LIVELY_SURFACE, LIVELY_UI, type LivelyCss, type LivelySpring, type LivelyTween, livelyStagger };
