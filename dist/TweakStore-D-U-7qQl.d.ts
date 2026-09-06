import { GradientValue } from './gradient-core.js';
import { XYValue } from './xy-pad-core.js';
import { TransferValue } from './transfer-core.js';
import { FilterAxisConfig, FilterValue } from './filter-core.js';
import { RangeValue } from './range-slider-core.js';

/** Opt-in meanings for numeric Move faces. Values keep the host's units. */
type MoveSliderVisual = {
    kind: 'opacity';
    opaqueValue?: number;
} | {
    kind: 'blur';
} | {
    kind: 'pan';
    left?: number;
    center?: number;
    right?: number;
} | {
    kind: 'stereo-width';
    mono?: number;
    unity?: number;
} | {
    kind: 'pitch';
    unit?: 'semitones' | 'cents';
};
type MovePlaybackMode = 'forward' | 'reverse' | 'ping-pong' | 'scissors';
type MoveSelectVisual = {
    kind: 'playback';
    /** Map host option values to drawings. Omit when values are mode names. */
    modes?: Record<string, MovePlaybackMode>;
};
type MoveVisual = MoveSliderVisual | MoveSelectVisual;
type MoveNumericDrawing = {
    kind: 'opacity';
    alpha: number;
} | {
    kind: 'blur';
    radius: number;
} | {
    kind: 'pan';
    position: number;
} | {
    kind: 'stereo-width';
    separation: number;
    unity: number | null;
} | {
    kind: 'pitch';
    position: number;
    zero: number | null;
};
/** Invalid or incompatible metadata falls back to the ordinary face. No label inference. */
declare function moveNumericDrawing(meta: ControlMeta, value: unknown): MoveNumericDrawing | null;
declare function movePlaybackMode(meta: ControlMeta, value: unknown): MovePlaybackMode | null;
/** Semantic formatting is a fallback; a host formatter or unit always wins. */
declare function moveVisualReading(meta: ControlMeta, value: number): string;
/** Returns a new value only for editing keys. Shift uses the configured smallest step. */
declare function moveKeyboardValue(meta: ControlMeta, value: unknown, key: string, fine?: boolean): number | string | null;

/**
 * One axis of an XY pad control. Partial — every field falls back through
 * `resolveAxis` (min 0, max 1, step 0.01). `origin`/`bipolar` mirror the
 * Slider's names/semantics, resolved independently per axis.
 */
type XYAxis = {
    min?: number;
    max?: number;
    step?: number;
    origin?: number;
    bipolar?: boolean;
    label?: string;
};
type SpringConfig = {
    type: 'spring';
    stiffness?: number;
    damping?: number;
    mass?: number;
    visualDuration?: number;
    bounce?: number;
};
type EasingConfig = {
    type: 'easing';
    duration: number;
    ease: [number, number, number, number];
};
type TransitionConfig = SpringConfig | EasingConfig;
type ActionConfig = {
    type: 'action';
    /** The button's own text. */
    label?: string;
    /**
     * Text at the left of the row, with the button pushed to the right — the
     * same shape as every other control row. Use it when the button acts ON
     * something the row should name ("kick … [Load]"). Without it the button
     * fills the row and carries the meaning alone.
     */
    caption?: string;
};
type SelectConfig = {
    type: 'select';
    /** Optional semantic drawing for the Move surface. */
    moveVisual?: MoveSelectVisual;
    /**
     * An option may name an `icon` from `LUCIDE_ICONS` — the Move slot draws it
     * instead of making you read the mode name off a controller.
     */
    options: (string | {
        value: string;
        label: string;
        icon?: string;
    })[];
    default?: string;
    /** 'segmented' renders the options as an inline segmented control instead of a dropdown. Suits 2–4 short options. */
    display?: 'dropdown' | 'segmented';
    /**
     * The shape an option stands for: `t` in [0,1] → y, auto-fitted and drawn
     * in the Move slot in place of the option's name, which moves to a small
     * tag at the top. Return `null` for options that have no shape.
     *
     * A closure, so — like a curve row's `sample` — it is invisible to the
     * serialized config diff and is refreshed through `syncCurveConfigs`. That
     * is what lets the drawing follow the app's other controls: a pitch arc's
     * preview tracks its bell and flip while the picker stays a picker.
     */
    preview?: (value: string) => ((t: number) => number) | null | undefined;
};
type ColorConfig = {
    type: 'color';
    default?: string;
    /** Enables the alpha slider; the emitted value becomes #rrggbbaa. Default false. */
    alpha?: boolean;
    /** Shows the shared saved-swatches row (persisted per machine). Default false. */
    palette?: boolean;
};
type GradientConfig = {
    type: 'gradient';
    default?: GradientValue;
    /**
     * `ramp` opens the editor without the fill-shape chrome (no linear/radial/
     * conic switcher, no transform pad) — for gradients read along one axis,
     * like a colour scale or a shader lookup, where a shape would do nothing.
     */
    form?: 'fill' | 'ramp';
};
type XYConfig = {
    type: 'xy';
    /** Starting point. Missing/out-of-range components clamp to each axis's origin. */
    default?: XYValue;
    /** Per-axis range/step/origin. Each resolves through `resolveAxis`. */
    x?: XYAxis;
    y?: XYAxis;
    /** Grid overlay — on by default as a 5×5 grid (faint at rest, stronger on interaction). `false` to hide, or a number for a uniform N×N count. */
    grid?: boolean | number;
    /** Multiplies both grid axis subdivision counts (default 1). E.g. 2 on the 5×5 default → 10×10. */
    density?: number;
    /** Snap the emitted value to each axis's step (default continuous). */
    snap?: boolean;
    /** Spring the thumb back to centre on release (joystick feel). Default hold. */
    returnToCenter?: boolean;
    /** Show the live value next to each axis label (default false = label only). */
    showValues?: boolean;
};
type TextConfig = {
    type: 'text';
    default?: string;
    placeholder?: string;
};
/**
 * The 2-slot filter control: one value, two hands — cutoff on the left,
 * resonance on the right. On the Move it claims two dial slots and draws
 * its magnitude response across both; inline it is one row for the same
 * pair. `response` is a closure like a curve row's `sample` (refreshed
 * through `syncCurveConfigs`); without one the kit draws its own lowpass.
 */
type FilterConfig = {
    type: 'filter';
    /** Starting point. Missing hands open the filter: cutoff max, resonance min. */
    default?: Partial<FilterValue>;
    cutoff?: FilterAxisConfig;
    resonance?: FilterAxisConfig;
    /** The drawn magnitude response, from each hand's 0..1 position. */
    response?: (cutoff01: number, resonance01: number) => (t: number) => number;
    /**
     * `false` draws the control bypassed — the curve still shows (so the slot
     * reads as a filter, not an empty display) but greyed out, the way a
     * disabled module dims. Defaults to on.
     */
    enabled?: boolean;
};
/**
 * An editable transfer curve — input on x, output on y, both 0..1. For the
 * parameters that are really the shape of a response (a gamma, a depth
 * falloff, an edge ramp) and that a row of sliders can only approximate.
 * The value is the control points; read the shape with `sampleTransfer`, or
 * bake it for a shader with `transferLut`.
 */
type TransferConfig = {
    type: 'transfer';
    /** Starting shape. Repaired through `normalizeTransfer`; absent = straight through. */
    default?: TransferValue;
    /** Surface height in px, clamped 64–200. Default 104. */
    height?: number;
    /** Grid divisions behind the curve (default 4). 0 hides it. */
    grid?: number;
    /** Names for the two axes, shown small at the edges. */
    axisLabels?: {
        x?: string;
        y?: string;
    };
};
type RangeConfig = {
    type: 'range';
    min: number;
    max: number;
    /** Falls back to the full span { min, max } when omitted. */
    default?: RangeValue;
    /** Falls back to inferStep(min, max) when omitted. */
    step?: number;
};
/**
 * Explicit slider form for what the `[default, min, max, step?]` tuple can't
 * express: a display unit, a custom value formatter, or a bipolar fill.
 */
type SliderConfig = {
    type: 'slider';
    /** Optional semantic drawing for the Move surface; never inferred from labels. */
    moveVisual?: MoveSliderVisual;
    default: number;
    min: number;
    max: number;
    /** Falls back to inferStep(min, max) when omitted. */
    step?: number;
    /** Appended to the displayed value, e.g. ' dB', ' ms', '×'. */
    unit?: string;
    /**
     * Override the displayed value text entirely; `unit` is not auto-appended.
     * A function, so it is invisible to the JSON structure diff — changing only
     * the formatter does not re-register the panel.
     */
    formatValue?: (value: number) => string;
    /** Anchor the fill at this value instead of `min` (see Slider). */
    origin?: number;
    /** Convenience for `origin: 0` on a symmetric range. */
    bipolar?: boolean;
    /** `vertical` renders the column card (fill grows bottom-up, label at base). */
    orientation?: 'horizontal' | 'vertical';
    /**
     * `dial` draws the value as a rotary needle instead of a track — for the
     * parameters whose two ends are the same place (a heading, a sun position,
     * a tilt). It stays a slider everywhere else, so a hardware knob and a
     * preset see no difference; only the drawing changes.
     */
    display?: 'track' | 'dial';
    /**
     * Past the end, come back around instead of stopping. Dial only; defaults
     * to true when the range covers a full turn (360, or -180..180).
     */
    wrap?: boolean;
};
/**
 * Scrub-anywhere numeric readout. Unlike a slider it has no track — drag the
 * card to nudge the value, click to type — and bounds are optional, so it is
 * the control for open-ended quantities (dB trims, sample offsets, seeds).
 */
type NumberConfig = {
    type: 'number';
    default: number;
    min?: number;
    max?: number;
    /** Falls back to a step inferred from `default`'s precision when omitted. */
    step?: number;
    /** Appended to the displayed value, e.g. ' dB', ' ms', '×'. */
    unit?: string;
    /** Override the displayed value text entirely; `unit` is not auto-appended. */
    formatValue?: (value: number) => string;
    /** `vertical` stacks the label above a centered value (column card). */
    orientation?: 'horizontal' | 'vertical';
};
/**
 * A read-only curve preview row. Draws the shape the host's own parameters
 * produce (e.g. a pitch arc from a shape select plus modifier sliders); it
 * holds no value of its own, so nothing lands in ResolvedValues, presets, or
 * persistence. `sample` is a function and therefore invisible to the
 * serialized config diff (like `formatValue`); adapters push replacements
 * through `TweakStore.syncCurveConfigs` so the drawing tracks the host.
 */
type CurveConfig = {
    type: 'curve';
    /** t in [0,1] → y. Non-finite results are skipped (the stroke breaks there). */
    sample: (t: number) => number;
    /** Fixed y-range to fit. Default: auto-fit each draw with a little headroom. */
    domain?: [number, number];
    /** Vertical reference lines at these x positions in [0,1]; invalid entries are skipped. */
    markers?: readonly number[];
    /** Surface height in px, clamped to 32–160. Default 64. Ignored when `aspect` is set. */
    height?: number;
    /**
     * Width ÷ height. Sizes the surface from its own width instead of `height`,
     * so the plot holds its proportions at any column width — what a transfer
     * curve wants, since its two axes share a scale. `1` is square, `4 / 3` a
     * little wider than tall.
     */
    aspect?: number;
    /** `false` = full-bleed row without the label line; a string overrides the key-derived label. */
    label?: false | string;
};
/**
 * A read-only live-analyser row: the panel-embedded form of the standalone
 * `AnalyserVisualization`. Like the curve row it holds no value — nothing
 * lands in ResolvedValues, presets, or persistence — and its function-valued
 * fields (`analyser`, `marker`) are invisible to the serialized config diff,
 * so adapters keep them fresh through `TweakStore.syncCurveConfigs`.
 */
type AnalyserConfig = {
    type: 'analyser';
    /** The live AnalyserNode, read at render — a getter so the host can hand it over late (audio contexts start on gesture). */
    analyser: () => AnalyserNode | null;
    /** 'frequency' (default) — live spectrum. 'waveform' — oscilloscope. */
    source?: 'frequency' | 'waveform';
    variant?: 'line' | 'area';
    /** 'pixelated' (default here — the panel's block language) or 'smooth'. */
    mode?: 'smooth' | 'pixelated';
    pixelSize?: number;
    scale?: 'log' | 'linear';
    spring?: boolean | {
        stiffness?: number;
        damping?: number;
    };
    /** Spectrum only: confine the display to this frequency window in Hz. */
    rangeHz?: readonly [number, number];
    /** Spectrum only: a live vertical reference in Hz, read every frame. */
    marker?: () => number | null;
    /** Surface height in px, clamped like the curve row's. Default 56. */
    height?: number;
    /** `false` = full-bleed row without the label line; a string overrides the key-derived label. */
    label?: false | string;
};
type FileConfig = {
    type: 'file';
    /** Native input `accept` filter, e.g. 'image/*' or '.svg,image/svg+xml'. */
    accept?: string;
    multiple?: boolean;
};
type SwatchOption = {
    value: string;
    label: string;
    /** One color renders a chip; many render a thin strip preview. */
    colors: string[];
};
type SwatchConfig = {
    type: 'swatch';
    options: SwatchOption[];
    default?: string;
};
type ChipOption = {
    value: string;
    label: string;
    /** Removable chips show an ✕ and emit a `remove` event (curated stay; saved go). */
    removable?: boolean;
};
type ChipsConfig = {
    type: 'chips';
    options: ChipOption[];
    default?: string;
};
type MultiSelectOption = {
    value: string;
    label: string;
    /** One quiet line under the label — e.g. what the option contains. */
    hint?: string;
    /** Tiny uppercase badge next to the label — e.g. 'local' / 'cloud'. */
    tag?: string;
};
/** Checkbox rows resolving to the checked values, in option order. */
type MultiSelectConfig = {
    type: 'multiselect';
    options: MultiSelectOption[];
    default?: string[];
};
type GalleryItem = {
    id: string;
    src?: string;
    alt?: string;
    /** Width / height hint used to size custom (non-image) content in the masonry. */
    aspect?: number;
    render?: () => unknown;
};
type GalleryConfig = {
    type: 'gallery';
    items: GalleryItem[];
    default?: string;
    columns?: number;
};
/**
 * One row in a list control — a chosen item type plus its sub-control values.
 * Stays JSON-serializable: `params` holds only scalars, never live objects.
 */
type ListItemValue = {
    type: string;
    params: Record<string, number | boolean | string>;
    /**
     * Row-level name, shown in place of the item type's label and renamable in
     * place. Absent (never empty) when the row has no name of its own.
     */
    title?: string;
};
/**
 * A sub-control field inside a list item type's schema. Uses the same shorthand
 * as a panel config, but scalar-only (no nested folders or non-value controls).
 */
type ListItemField = [number, number, number, number?] | number | boolean | string | SelectConfig | ColorConfig | SwatchConfig | TextConfig;
type ListItemType = {
    /** Shown in the add menu, and as a row's title when the row has none of its own. */
    label: string;
    /** Sub-controls for this item type, keyed by param name. */
    schema: Record<string, ListItemField>;
    /**
     * Help text per field, keyed by the same param name. Keyed rather than inline
     * because a schema field is often bare shorthand (`mass: [1, 0, 10]`) with
     * nowhere to hang a property.
     */
    hints?: Record<string, string>;
    /**
     * Section per field, keyed by param name, for rows too deep to read flat.
     * Ungrouped fields stay at the top of the row; each named section becomes a
     * collapsible folder below them, in the order its first field is declared.
     * Keyed for the same reason as `hints`.
     */
    groups?: Record<string, string>;
};
type ListConfig = {
    type: 'list';
    /** The palette of item types a user can add. */
    itemTypes: Record<string, ListItemType>;
    /** Initial rows. Each item's params backfill from its type's schema defaults. */
    default?: ListItemValue[];
    /** Optional cap on the number of rows. */
    max?: number;
    /** Label for the add affordance. Defaults to 'Add'. */
    addLabel?: string;
};
type TweakValue = number | boolean | string | string[] | XYValue | SpringConfig | EasingConfig | ActionConfig | SelectConfig | SliderConfig | NumberConfig | ColorConfig | GradientConfig | GradientValue | XYConfig | TextConfig | GalleryConfig | FileConfig | SwatchConfig | ChipsConfig | MultiSelectConfig | ListConfig | ListItemValue[] | RangeConfig | RangeValue | FilterConfig | FilterValue | TransferConfig | TransferValue;
type TweakConfig = {
    [key: string]: TweakValue | [number, number, number, number?] | CurveConfig | AnalyserConfig | TweakConfig;
};
/** UI-only reserved keys: they shape the panel, never resolve to a value. */
type ReservedKey = '_collapsed' | '_collapsible' | '_tabs';
type ResolvedValues<T extends TweakConfig> = {
    [K in keyof T as T[K] extends CurveConfig ? never : T[K] extends AnalyserConfig ? never : K extends ReservedKey ? never : K]: T[K] extends [number, number, number, number?] ? number : T[K] extends SliderConfig ? number : T[K] extends NumberConfig ? number : T[K] extends MultiSelectConfig ? string[] : T[K] extends SpringConfig ? TransitionConfig : T[K] extends EasingConfig ? TransitionConfig : T[K] extends SelectConfig ? string : T[K] extends ColorConfig ? string : T[K] extends GradientConfig ? GradientValue : T[K] extends XYConfig ? XYValue : T[K] extends TextConfig ? string : T[K] extends RangeConfig ? RangeValue : T[K] extends FilterConfig ? FilterValue : T[K] extends TransferConfig ? TransferValue : T[K] extends GalleryConfig ? string : T[K] extends FileConfig ? string : T[K] extends SwatchConfig ? string : T[K] extends ChipsConfig ? string : T[K] extends ListConfig ? ListItemValue[] : T[K] extends TweakConfig ? ResolvedValues<T[K]> : T[K];
};
type ShortcutMode = 'fine' | 'normal' | 'coarse';
type ShortcutInteraction = 'scroll' | 'drag' | 'move' | 'scroll-only';
type ShortcutConfig = {
    key?: string;
    modifier?: 'alt' | 'shift' | 'meta';
    mode?: ShortcutMode;
    interaction?: ShortcutInteraction;
};
/**
 * How lit the affordance dot is. The app pushes this — tweakers owns only how
 * each state looks, never when it applies.
 */
type AffordanceStatus = 'off' | 'armed' | 'active';
/** What tweakers hands a popover so it doesn't have to resolve any of it itself. */
type AffordanceContext = {
    panelId: string;
    path: string;
    status: AffordanceStatus;
    /** Shorthand for `TweakStore.setAffordanceStatus(panelId, path, …)`. */
    setStatus: (status: AffordanceStatus) => void;
};
/**
 * A companion control hung off a control's corner: a barely-there dot that opens
 * a popover the host app fills.
 *
 * `content` is a component — a React/Solid/Vue component or a Svelte snippet —
 * receiving the context as its props/argument. Not a pre-built node: it is
 * captured once at registration and would never see current state. Not called
 * directly by the renderer either, so a stateful popover keeps its own identity
 * and its own hooks. This is also why affordances travel as a panel option
 * rather than in the config: the config is JSON-serialized on every render to
 * detect structure changes, and view code would not survive that.
 */
type AffordanceConfig = {
    content: (ctx: AffordanceContext) => unknown;
    /** Accessible name for the dot and its popover. Defaults to 'Options'. */
    label?: string;
};
type ControlMeta = {
    moveVisual?: MoveVisual;
    type: 'slider' | 'number' | 'toggle' | 'spring' | 'transition' | 'folder' | 'action' | 'select' | 'color' | 'gradient' | 'xy' | 'text' | 'range' | 'gallery' | 'file' | 'swatch' | 'chips' | 'multiselect' | 'list' | 'curve' | 'analyser' | 'filter' | 'transfer';
    path: string;
    label: string;
    /** One line of help, revealed on hover or when focus lands inside the control. */
    hint?: string;
    /** Companion control reachable from a dot in the control's bottom-right corner. */
    affordance?: AffordanceConfig;
    min?: number;
    max?: number;
    step?: number;
    /** Range control's configured reset target — its `default`, else the full {min,max} span. */
    rangeDefault?: RangeValue;
    /** Gradient's editor form — `ramp` drops the fill-shape chrome. */
    gradientForm?: 'fill' | 'ramp';
    /** Transfer curve's surface height, grid divisions and axis names. */
    curveHeight?: number;
    gridDivisions?: number;
    axisLabels?: {
        x?: string;
        y?: string;
    };
    children?: ControlMeta[];
    defaultOpen?: boolean;
    /** Folder declared `_enabled` — renders as a module whose header switch drives `<path>._enabled`. */
    module?: boolean;
    /** Folder declared `_collapsible: false` — plain section header, no caret, body always open. */
    collapsible?: boolean;
    /** Action declared a `caption` — the row names what the button acts on. */
    caption?: string;
    /** Top-level folder under a `_tabs` root — it is a tab, and its children are that tab's page. */
    tab?: boolean;
    /** The synthetic segmented select driving `_tab` — it renders as the panel's tab bar, never as a row. */
    tabBar?: boolean;
    options?: (string | {
        value: string;
        label: string;
        icon?: string;
    })[];
    /** Select's per-option shape sampler — swapped in place by syncCurveConfigs. */
    preview?: (value: string) => ((t: number) => number) | null | undefined;
    /** Select's rendering mode, or a slider's `dial` form. */
    display?: 'dropdown' | 'segmented' | 'track' | 'dial';
    /** Dial slider: wrap past the ends instead of stopping. */
    wrap?: boolean;
    placeholder?: string;
    items?: GalleryItem[];
    columns?: number;
    accept?: string;
    multiple?: boolean;
    swatchOptions?: SwatchOption[];
    chipOptions?: ChipOption[];
    multiSelectOptions?: MultiSelectOption[];
    /** Slider display unit, from the explicit SliderConfig form. */
    unit?: string;
    /** Slider display formatter, from the explicit SliderConfig form. */
    formatValue?: (value: number) => string;
    /** Slider fill anchor, from the explicit SliderConfig form. */
    origin?: number;
    bipolar?: boolean;
    /** Slider/number layout, from the explicit config forms. */
    orientation?: 'horizontal' | 'vertical';
    itemTypes?: Record<string, ListItemType>;
    addLabel?: string;
    maxItems?: number;
    alpha?: boolean;
    palette?: boolean;
    /** XY pad axes/options — carried through to the XYControl. */
    xAxis?: XYAxis;
    yAxis?: XYAxis;
    grid?: boolean | number;
    density?: number;
    snap?: boolean;
    returnToCenter?: boolean;
    showValues?: boolean;
    /** Filter control's per-hand range/step/label/format. */
    cutoffAxis?: FilterAxisConfig;
    resonanceAxis?: FilterAxisConfig;
    /** Filter control's drawn magnitude response — swapped in place by syncCurveConfigs. */
    response?: (cutoff01: number, resonance01: number) => (t: number) => number;
    /** Filter control declared `enabled: false` — the slot draws bypassed (dimmed). */
    filterEnabled?: boolean;
    /** Curve preview's host-supplied sampler — swapped in place by syncCurveConfigs. */
    sample?: (t: number) => number;
    /** Curve preview's fixed y-range; absent = auto-fit per draw. */
    domain?: [number, number];
    /** Curve preview's vertical reference marker positions — kept fresh by syncCurveConfigs. */
    markers?: readonly number[];
    /** Curve preview's surface height in px (renderers clamp via clampCurveHeight). */
    height?: number;
    /** Curve preview's width ÷ height — the surface follows its own width. */
    aspect?: number;
    /** Curve preview declared `label: false` — full-bleed row without the label line. */
    hideLabel?: boolean;
    /** Analyser row's whole config — swapped in place by syncCurveConfigs, like `sample`. */
    analyserRow?: AnalyserConfig;
    shortcut?: ShortcutConfig;
};
type PanelConfig = {
    id: string;
    name: string;
    controls: ControlMeta[];
    values: Record<string, TweakValue>;
    shortcuts: Record<string, ShortcutConfig>;
    /** Help text by control path, retained so a later updatePanel can restate it. */
    hints?: Record<string, string>;
    /** Affordances by control path, retained on the same terms as `hints`. */
    affordances?: Record<string, AffordanceConfig>;
    /** Label overrides by control path, retained on the same terms as `hints`. */
    labels?: Record<string, string>;
    /** Move pad columns by control path, retained on the same terms as `hints`. */
    movePads?: Record<string, number>;
    /**
     * Config declared `_enabled` at its root — the whole panel is a module, and
     * its title carries the switch. Same idiom as a module folder, one level up.
     */
    module?: boolean;
    kind?: 'timeline' | 'modulation';
};

export { type ControlMeta as C, type MoveNumericDrawing as M, type PanelConfig as P, type ResolvedValues as R, type ShortcutConfig as S, type TweakValue as T, type TweakConfig as a, type TransitionConfig as b, type SpringConfig as c, type MovePlaybackMode as d, type MoveSelectVisual as e, type MoveSliderVisual as f, type MoveVisual as g, moveNumericDrawing as h, movePlaybackMode as i, moveVisualReading as j, moveKeyboardValue as m };
