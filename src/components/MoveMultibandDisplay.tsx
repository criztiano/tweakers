import { drawMoveMultiband, MoveMultibandMeter, type MoveMultibandReading } from '../move-multiband';
import { MoveLiveCanvas } from './MoveLiveCanvas';

/**
 * The multiband face's live picture: the bands' curve over what each band is
 * doing at the playhead, read from the panel's attached meter once a frame.
 * A still `reading` draws once instead.
 */
export function MoveMultibandDisplay({ panelId, bands, reading }: {
  panelId?: string;
  /** Each band's setting (0..1), top of the spectrum first. */
  bands: { position: number; active?: boolean }[];
  reading?: MoveMultibandReading;
}) {
  return (
    <MoveLiveCanvas
      className="tweakers-move-multiband-canvas"
      still={reading !== undefined}
      deps={[panelId, reading, JSON.stringify(bands)]}
      paint={(g, w, h, dpr, token) => drawMoveMultiband(g, w, h, dpr, reading ?? (panelId ? MoveMultibandMeter.read(panelId) : null), bands, {
        text: token('--move-text'),
        amount: token('--move-multiband-amount'),
      }, 3 * dpr)}
    />
  );
}
