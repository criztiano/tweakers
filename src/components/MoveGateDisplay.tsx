import { drawMoveGate, MoveGateMeter, type MoveGateReading } from '../move-gate';
import { MoveLiveCanvas } from './MoveLiveCanvas';

/** The trace's inset from the display's edges, so the threshold line meets the bar's marker. */
const GATE_TRACE_PAD = 1;

/**
 * The gate face's live picture: reads the panel's attached gate once a frame
 * while it is mounted. A still `reading` draws once instead — the library
 * page's specimen.
 */
export function MoveGateDisplay({ panelId, threshold, reading }: { panelId?: string; threshold: number; reading?: MoveGateReading }) {
  return (
    <MoveLiveCanvas
      className="tweakers-move-gate-canvas"
      still={reading !== undefined}
      deps={[panelId, reading, threshold]}
      paint={(g, w, h, dpr, token) => drawMoveGate(g, w, h, dpr, reading ?? (panelId ? MoveGateMeter.read(panelId) : null), threshold, {
        text: token('--move-text'),
        threshold: token('--move-gate-threshold'),
        lookahead: token('--move-gate-lookahead'),
        release: token('--move-gate-release'),
      }, GATE_TRACE_PAD * dpr)}
    />
  );
}
