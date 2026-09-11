/**
 * The Move's colours, on screen.
 *
 * The hardware has one 128-entry LED palette and the index-to-colour map is
 * not guessable — every colour the instrument lights was picked by eye on the
 * device (see `HUE` in the move repo's surface engine, and its
 * `scripts/palette.mjs`). These are the screen's answer to those colours, so a
 * thing that is lime in the hand is the same lime on the glass.
 *
 * The hardware index each one matches is noted beside it. Keep the two lists
 * in step: a colour added here without a hue on the device, or the other way
 * round, is a colour the two surfaces cannot agree on.
 *
 * `purple` (hardware 101) and `rose` (hardware 1) have no screen counterpart
 * yet — the reserved row rests at rose on the device.
 */
export const MOVE_PALETTE = {
  /* the hues, in the order a colour wheel runs */
  red: '#fd3c57',      // hardware 2
  orange: '#fd6b59',   // hardware 4
  yellow: '#f2cf43',   // hardware 29
  lime: '#a3f243',     // hardware 31
  emerald: '#00ed95',  // hardware 32
  blue: '#698eff',     // hardware 125
  indigo: '#8660c3',   // hardware 19
  pink: '#fe92d5',     // hardware 25

  /* the neutrals, which the hardware has no use for — its unlit state is
     darkness, and its dimmed colours are the hues' own twins */
  white: '#ffffff',
  grayLight: '#cac5cc',
  gray: '#555162',
  black: '#0e0e16',
  brown: '#856643',
} as const;

export type MovePaletteName = keyof typeof MOVE_PALETTE;

/**
 * The four track buttons, screen side — the same four hues the hardware
 * lights, in the same order, so the track row reads alike in the hand and on
 * the glass.
 */
export const MOVE_TRACK_COLORS: string[] = [
  MOVE_PALETTE.blue,
  MOVE_PALETTE.pink,
  MOVE_PALETTE.orange,
  MOVE_PALETTE.lime,
];
