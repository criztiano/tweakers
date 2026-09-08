import { b as TransitionConfig, c as SpringConfig } from './TweakStore-DAd_7fkv.js';
import './gradient-core.js';
import './color-core.js';
import './xy-pad-core.js';
import './transfer-core.js';
import './filter-core.js';
import './range-slider-core.js';

type SpringParams = {
    stiffness: number;
    damping: number;
    mass: number;
};
declare function round2(value: number): number;
declare function clamp(value: number, min: number, max: number): number;
declare function isTransitionConfig(value: unknown): value is TransitionConfig;
declare function isPhysicsSpring(transition: TransitionConfig): boolean;
declare function springParams(spring: SpringConfig): SpringParams;
/** Normalized spring position 0 → 1 (may overshoot), starting at rest. */
declare function springProgress(t: number, { stiffness, damping, mass }: SpringParams): number;
/** Estimated time for a spring to visually settle (within 0.5% of target). */
declare function springSettleDuration(params: SpringParams): number;
/** Eased progress of a cubic-bezier easing at linear progress p (0–1). */
declare function cubicBezierProgress(p: number, [x1, y1, x2, y2]: [number, number, number, number]): number;
type ResolvedClipTransition = {
    /** Motion-ready transition with its duration driven by the clip length. */
    transition: TransitionConfig;
    /** Effective clip duration — the bar length. Derived for physics springs. */
    duration: number;
    /** Physics springs have emergent duration; the bar is derived, not resizable. */
    isPhysics: boolean;
};
declare function resolveClipTransition(raw: TransitionConfig, clipDuration: number): ResolvedClipTransition;
/**
 * Eased progress of a clip's transition at `elapsed` seconds after its start.
 * Springs keep evolving past the bar (bounce tail) and converge to 1;
 * easings clamp at 1. May overshoot 1 for bouncy curves.
 */
declare function transitionProgress(elapsed: number, duration: number, transition: TransitionConfig | undefined): number;

export { type ResolvedClipTransition, type SpringParams, clamp, cubicBezierProgress, isPhysicsSpring, isTransitionConfig, resolveClipTransition, round2, springParams, springProgress, springSettleDuration, transitionProgress };
