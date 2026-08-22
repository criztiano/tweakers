import type { Snippet } from 'svelte';
type $$ComponentProps = {
    title: string;
    defaultOpen?: boolean;
    /** `false` renders a plain section header: no caret, no click-to-collapse, body always open. */
    collapsible?: boolean;
    isRoot?: boolean;
    inline?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    toolbar?: Snippet;
    children?: Snippet;
    /** One line of help for the section, revealed on hover over the header. */
    hint?: string;
    hintId?: string;
    /**
     * Root only — the panel declared `_enabled`, so the whole panel is a
     * module: the title carries the switch and the body goes away when it is
     * off. Same idiom as ModuleFolder, one level up.
     */
    enabled?: boolean;
    onEnabledChange?: (enabled: boolean) => void;
};
declare const Folder: import("svelte").Component<$$ComponentProps, {}, "">;
type Folder = ReturnType<typeof Folder>;
export default Folder;
//# sourceMappingURL=Folder.svelte.d.ts.map