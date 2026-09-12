declare const ICON_CHEVRON = "M6 9.5L12 15.5L18 9.5";
declare const ICON_CHEVRON_RIGHT = "M9.5 6L15.5 12L9.5 18";
declare const ICON_CHEVRON_LEFT = "M14.5 6L8.5 12L14.5 18";
declare const ICON_ELLIPSIS: {
    cx: string;
    cy: string;
}[];
declare const ICON_CHECK = "M5 12.75L10 19L19 5";
declare const ICON_PAUSE: string[];
declare const ICON_PLAY = "M9.24394 2.36758C7.41419 1.18362 5 2.49701 5 4.67639V19.3238C5 21.5032 7.41419 22.8166 9.24394 21.6326L20.5624 14.3089C22.2371 13.2253 22.2372 10.775 20.5624 9.69129L9.24394 2.36758Z";
declare const ICON_REPLAY: string[];
declare const ICON_LOOP: string[];
declare const ICON_TIMELINE: string[];
declare const ICON_CLOSE = "M6 6L18 18M6 18L18 6";
declare const ICON_PLUS = "M12 5V19M5 12H19";
declare const ICON_PENCIL: string[];
declare const ICON_GRIP: {
    cx: string;
    cy: string;
}[];
declare const ICON_FILE = "M13 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9M13 3L19 9M13 3V8C13 8.55228 13.4477 9 14 9H19";
declare const ICON_CLIPBOARD: {
    board: string;
    sparkle: string;
    body: string;
};
declare const ICON_ADD_PRESET: string[];
declare const ICON_TRASH: string[];
declare const ICON_MOVE_CAPTURE: {
    viewBox: string;
    path: string;
};
declare const ICON_MOVE_ENTER: {
    viewBox: string;
    circle: {
        cx: string;
        cy: string;
        r: string;
    };
};
declare const ICON_MOVE_LOOP: {
    viewBox: string;
    paths: string[];
};
declare const ICON_MOVE_COPY: {
    viewBox: string;
    paths: string[];
};
/**
 * A function chip's glyph. `paths` are stroked, like the hardware's printed
 * marks; `fills` are the filled marks (the capture corners); `circles` are
 * filled circles (the enter dot, rec's core). All share one viewBox and the
 * size the chip draws them at.
 */
interface MoveFunctionGlyph {
    viewBox: string;
    size: number;
    paths?: string[];
    fills?: string[];
    circles?: {
        cx: string;
        cy: string;
        r: string;
    }[];
}
/**
 * The canonical glyph per Move function button — every app shows the same
 * icon for the same hardware key, so the chips read like the instrument.
 * Drawn on the capture glyph's 14px grid (dots on the enter dot's 12px),
 * stroked like the printed marks unless the hardware fills them.
 */
declare const MOVE_FUNCTION_ICONS: Record<string, MoveFunctionGlyph>;
declare const ICON_PANEL: {
    path: string;
    circles: {
        cx: string;
        cy: string;
        r: string;
    }[];
};
/**
 * Option glyphs — a small [lucide](https://lucide.dev) subset (ISC), drawn as
 * stroked 24×24 paths so they read at slot size. An enum option names one of
 * these in its `icon` field and the Move slot shows it, which beats reading
 * four mode names off a controller at arm's length.
 *
 * Keep this a subset, not a mirror: an icon earns its place by being clearer
 * than the word it stands next to.
 */
declare const LUCIDE_ICONS: Record<string, string[]>;
/**
 * The badge a switch wears on the corner of its picture: a ban while it is
 * off, a check while it is on. Filled rather than stroked, because at badge
 * size (24px) a solid mark reads as a state and an outline reads as clutter —
 * and a host that ships its own pair (`onIcon` / `offIcon`) is drawing the
 * same two things. Both fill a 24×24 box, like every glyph here.
 */
declare const ICON_BADGE_OFF = "M17.203 19.3594L4.6875 6.7969C3.6094 8.25 3 10.0781 3 12C3 16.9688 7.031 21 12 21C13.969 21 15.75 20.3906 17.203 19.3594ZM19.359 17.2031C20.391 15.75 21 13.9219 21 12C21 7.0312 16.969 3 12 3C10.078 3 8.25 3.6094 6.797 4.6875L19.359 17.2031ZM0 12C0 5.3906 5.391 0 12 0C18.609 0 24 5.3906 24 12C24 18.6094 18.609 24 12 24C5.391 24 0 18.6094 0 12Z";
declare const ICON_BADGE_ON = "M12 24C5.391 24 0 18.6094 0 12C0 5.3906 5.391 0 12 0C18.609 0 24 5.3906 24 12C24 18.6094 18.609 24 12 24ZM17.531 6.8438C17.016 6.4688 16.313 6.5625 15.984 7.0781L10.359 14.7656L7.922 12.3281C7.5 11.9062 6.75 11.9062 6.328 12.3281C5.906 12.7969 5.906 13.5 6.328 13.9219L9.703 17.2969C9.937 17.5312 10.266 17.6719 10.594 17.625C10.922 17.625 11.203 17.4375 11.391 17.1562L17.766 8.3906C18.141 7.9219 18.047 7.2188 17.531 6.8438Z";

export { ICON_ADD_PRESET, ICON_BADGE_OFF, ICON_BADGE_ON, ICON_CHECK, ICON_CHEVRON, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT, ICON_CLIPBOARD, ICON_CLOSE, ICON_ELLIPSIS, ICON_FILE, ICON_GRIP, ICON_LOOP, ICON_MOVE_CAPTURE, ICON_MOVE_COPY, ICON_MOVE_ENTER, ICON_MOVE_LOOP, ICON_PANEL, ICON_PAUSE, ICON_PENCIL, ICON_PLAY, ICON_PLUS, ICON_REPLAY, ICON_TIMELINE, ICON_TRASH, LUCIDE_ICONS, MOVE_FUNCTION_ICONS, type MoveFunctionGlyph };
