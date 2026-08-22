export type TweakPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type TweakMode = 'popover' | 'inline';
/** `card` is the panel's glass surface; `none` puts the rows straight on the host's ground. */
export type TweakChrome = 'card' | 'none';
export type TweakTheme = 'light' | 'dark' | 'system';
type $$ComponentProps = {
    position?: TweakPosition;
    defaultOpen?: boolean;
    mode?: TweakMode;
    theme?: TweakTheme;
    productionEnabled?: boolean;
    /**
     * Render only the named panels, in the order given. For apps that place
     * more than one panel surface in more than one place — a rack of per-voice
     * columns beside a global panel, say. Omitted, a root renders every
     * registered panel, which is the single-surface default.
     */
    panels?: string | string[];
    /**
     * `none` drops the panel card — no glass, no border, no radius, no padding —
     * so the rows sit directly on the host's own surface. For app chrome that
     * already provides the ground the panel would otherwise float on.
     */
    chrome?: TweakChrome;
};
declare const TweakRoot: import("svelte").Component<$$ComponentProps, {}, "">;
type TweakRoot = ReturnType<typeof TweakRoot>;
export default TweakRoot;
//# sourceMappingURL=TweakRoot.svelte.d.ts.map