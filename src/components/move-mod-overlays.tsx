import type { ComponentType } from 'react';
import { automationSlotAt } from '../automation-slot';
import type { ModulationType } from '../modulation-core';
import type { TweakTheme } from '../theme';
import { MoveAutomationLanes } from './MoveAutomationLanes';

/**
 * What a modulator's page floats above the panel while it is open — the
 * display the page's dials are working on. The panel asks this registry by
 * the open slot's type, so a page that brings its own display is one entry
 * here, not another branch in the panel.
 */
export interface MoveModOverlayProps {
  /** The open slot. */
  index: number;
  theme: TweakTheme;
}

export type MoveModOverlay = ComponentType<MoveModOverlayProps>;

const overlays = new Map<ModulationType, MoveModOverlay>();

/** Float `overlay` over the panel while a page of `type` is open; returns the unregister. */
export function registerMoveModOverlay(type: ModulationType, overlay: MoveModOverlay): () => void {
  overlays.set(type, overlay);
  return () => {
    if (overlays.get(type) === overlay) overlays.delete(type);
  };
}

/** The overlay a page of `type` floats, if it has one. */
export const moveModOverlay = (type: ModulationType): MoveModOverlay | undefined => overlays.get(type);

/**
 * Timeline control mode's display: the lanes the slot belongs to, on the
 * card, floating where the curve composer floats. The hardware works it
 * through the page; the pointer works it here.
 */
function MoveAutomationSlotCard({ index, theme }: MoveModOverlayProps) {
  const slot = automationSlotAt(index);
  if (!slot) return null;
  const { store, onSeek, accent, title } = slot.card();
  return (
    <div className="tweakers-move-automation-float">
      <MoveAutomationLanes store={store} variant="page" onSeek={onSeek} accent={accent} title={title} theme={theme} productionEnabled />
    </div>
  );
}

registerMoveModOverlay('automation', MoveAutomationSlotCard);
