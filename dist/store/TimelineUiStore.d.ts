type Listener = () => void;
type VisibilityController = {
    visible?: boolean;
    defaultVisible: boolean;
    onVisibilityChange?: (visible: boolean) => void;
};
/**
 * UI-only state shared by the toolkit root and the timeline portal.
 * Playback deliberately lives elsewhere: hiding the editor must never pause
 * or otherwise change the animation it is inspecting.
 */
declare class TimelineUiStoreClass {
    private visible;
    private initialized;
    private controllers;
    private listeners;
    getVisible(): boolean;
    registerController(id: symbol, controller: VisibilityController): () => void;
    updateController(id: symbol, controller: VisibilityController): void;
    requestVisible(visible: boolean): void;
    toggle(): void;
    subscribe(listener: Listener): () => void;
    private notify;
}
declare const TimelineUiStore: TimelineUiStoreClass;

export { TimelineUiStore };
