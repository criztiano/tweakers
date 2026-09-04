import type { ControlMeta, ShortcutConfig } from './store/TweakStore';
export declare function decimalsForStep(step: number): number;
export declare function roundValue(val: number, step: number): number;
export declare function getEffectiveStep(control: ControlMeta, shortcut: ShortcutConfig): number;
export declare function applySliderDelta(panelId: string, path: string, control: ControlMeta, effectiveStep: number, direction: number): void;
export declare function snapToDecile(rawValue: number, min: number, max: number): number;
export declare function isInputFocused(): boolean;
export declare function getActiveModifier(e: KeyboardEvent | WheelEvent | MouseEvent): 'alt' | 'shift' | 'meta' | undefined;
export declare function findControl(controls: ControlMeta[], path: string): ControlMeta | null;
export declare const DRAG_SENSITIVITY = 4;
/**
 * Fine-tuning while a pointer drag is in progress: pointer travel applies at
 * `factor` (default 0.1×) as a RELATIVE delta from `startValue` — the value at
 * the moment shift went down — so the handle stops tracking the cursor
 * absolutely and creeps precisely. Callers rebase `startValue`/`startPos` on
 * every shift transition (press mid-drag, release mid-drag) so the value never
 * jumps; releasing shift continues at factor 1 from the release point.
 * Positions are px along the drag axis; `extentPx` is the track's full travel.
 */
export declare function fineDragValue(opts: {
    startValue: number;
    startPos: number;
    pos: number;
    extentPx: number;
    min: number;
    max: number;
    factor?: number;
}): number;
export declare function formatInteractionLabel(interaction: string): string;
export declare function formatSliderShortcut(sc: ShortcutConfig): string;
export declare function formatToggleShortcut(sc: ShortcutConfig): string;
//# sourceMappingURL=shortcut-utils.d.ts.map