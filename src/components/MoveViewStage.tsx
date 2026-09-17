import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { ICON_CHEVRON_LEFT } from '../icons';
import { MoveViews, type MoveViewWait } from '../move-views';

export interface MoveViewStageProps {
  /** The view on show — whatever the app renders for where it is now. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Eight lights, the width of the pad grid: the wait's sweep. */
const LIGHTS = Array.from({ length: 8 }, (_, i) => i);

/**
 * A wait, standing where the view was: what is happening, a sweep of eight
 * lights running under it, and what it is happening to. The sweep steps like
 * LEDs rather than gliding — the same light the hardware can make.
 */
function MoveViewWaitScreen({ wait }: { wait: MoveViewWait }) {
  return (
    // wears the instrument tokens itself: it stands outside whatever view
    // carried them
    <div className="tweakers-move-surface tweakers-move-view-wait" role="status" aria-live="polite">
      <span className="tweakers-move-view-wait-title">{wait.title}</span>
      <span className="tweakers-move-view-wait-lights" aria-hidden="true">
        {LIGHTS.map((i) => (
          <span key={i} className="tweakers-move-view-wait-light" style={{ '--i': i } as CSSProperties} />
        ))}
      </span>
      {wait.detail && <span className="tweakers-move-view-wait-detail">{wait.detail}</span>}
      {wait.cancelable && (
        <button type="button" className="tweakers-move-view-wait-cancel" onClick={() => MoveViews.cancel()}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={ICON_CHEVRON_LEFT} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Cancel</span>
        </button>
      )}
    </div>
  );
}

/**
 * The one place an app's views change: wrap whatever the app renders for
 * where it is now, and every `MoveViews.go` / `MoveViews.load` moves inside
 * it. What is inside the stage is the picture a change moves — the page
 * around it updates in place, and the stage's own ground holds still — so it
 * fills its parent by default; give it a class to size it otherwise.
 *
 * While work runs the view underneath goes inert, and once the work outlasts
 * the delay its wait stands in its place, the view kept alive and hidden
 * beneath so a failure or a cancel hands it back exactly as it was.
 */
export function MoveViewStage({ children, className, style }: MoveViewStageProps) {
  const { busy, wait } = useSyncExternalStore(MoveViews.subscribe, MoveViews.getState, MoveViews.getState);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => MoveViews.mountStage(), []);

  // Set on the element rather than as a prop: React 18 does not know
  // `inert`, and 19 reads an empty string as false. A layout effect, so a
  // change committed inside a transition is inert before its picture is taken.
  useLayoutEffect(() => {
    if (content.current) content.current.inert = busy;
  }, [busy]);

  // The stage keeps the ground; the frame inside it is the picture a change
  // moves. A frame with no ground of its own means a fade shows the stage's
  // ground between two views, never the page behind the stage.
  return (
    <div
      className={className ? `tweakers-move-view-stage ${className}` : 'tweakers-move-view-stage'}
      style={style}
      data-busy={busy || undefined}
      data-waiting={wait ? true : undefined}
    >
      <div className="tweakers-move-view-frame" data-move-view-frame="">
        <div ref={content} className="tweakers-move-view-content">
          {children}
        </div>
        {wait && <MoveViewWaitScreen wait={wait} />}
      </div>
    </div>
  );
}
