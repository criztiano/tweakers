import { LUCIDE_ICONS } from './icons';
import { TweakStore, type PanelConfig, type TweakValue } from './store/TweakStore';

/**
 * How the track row names its pages.
 *
 * A page can wear a picture beside its name (`icon` on its registration).
 * Once any page on the row does, the kit's own **Panel** page in the settings
 * room decides how the row reads: the name alone, the picture and the name,
 * or the picture alone. With no picture on the row there is nothing to
 * choose, so the choice stands greyed out and the row shows names.
 */

/** The kit's own settings page that holds the track row's look. */
export const MOVE_PANEL_SETTINGS = 'move-panel';

export type MoveTrackLabelStyle = 'name' | 'both' | 'icon';

export const MOVE_TRACK_LABEL_STYLES: MoveTrackLabelStyle[] = ['name', 'both', 'icon'];

const STYLE_LABELS: Record<MoveTrackLabelStyle, string> = {
  name: 'Name',
  both: 'Icon + name',
  icon: 'Icon',
};

/** The picture a page wears on the track row, or `undefined` for none — an
 *  unknown name draws nothing, so it counts as none. */
export function moveTrackIcon(panel: Pick<PanelConfig, 'icon'>): string | undefined {
  return panel.icon && LUCIDE_ICONS[panel.icon] ? panel.icon : undefined;
}

/** The look the row actually shows: names, whatever the setting says, while
 *  no page on it carries a picture. */
export function moveTrackLabelStyle(values: Record<string, TweakValue> | undefined, hasIcons: boolean): MoveTrackLabelStyle {
  if (!hasIcons) return 'name';
  return MOVE_TRACK_LABEL_STYLES.find((s) => s === values?.trackLabels) ?? 'both';
}

export const MoveTrackLabels = {
  /**
   * Put the Panel page in the settings room. Idempotent; the panel calls it
   * on mount, so the room holds its pages from the start.
   */
  ensureSettings(): void {
    if (TweakStore.getPanel(MOVE_PANEL_SETTINGS)) return;
    TweakStore.registerPanel(
      MOVE_PANEL_SETTINGS,
      'Panel',
      {
        trackLabels: {
          type: 'select',
          default: 'both',
          options: MOVE_TRACK_LABEL_STYLES.map((s) => ({ value: s, label: STYLE_LABELS[s] })),
        },
      },
      undefined,
      { kind: 'kit', persist: true, labels: { trackLabels: 'Track labels' } }
    );
  },

  /** Grey the choice out while no page on the row carries a picture. */
  setIconsAvailable(available: boolean): void {
    TweakStore.setDisabled(MOVE_PANEL_SETTINGS, 'trackLabels', !available);
  },
};
