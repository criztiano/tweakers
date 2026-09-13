import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from '@base-ui/react/toast';
import { ICON_CLOSE } from '../icons';
import {
  MOVE_FLOAT_SELECTOR,
  MOVE_NOTIFY_GAP,
  notifyDockBottom,
  type MoveNotifyKind,
} from '../move-notify';

type BaseManager = ReturnType<typeof Toast.createToastManager>;

/**
 * The manager as Base UI wants it — only the provider below sees this one. The
 * kit hands callers the narrower view underneath.
 */
const manager = Toast.createToastManager();

/**
 * What one notification says. `type` is the kit's four kinds rather than a free
 * string: a fifth kind would be a fifth meaning for colour, and that is not a
 * decision a caller makes in passing.
 */
export interface MoveNotifyOptions
  extends Omit<Parameters<BaseManager['add']>[0], 'type'> {
  /** What the message is: news, a success, a caution, a failure. Defaults to `info`. */
  type?: MoveNotifyKind;
}

/**
 * The one manager the whole app talks to. It is a module singleton, like
 * `MoveWaveformStore` and `MoveSurfaceStore`: there is one instrument, so
 * there is one place notifications come from, and any file can say something
 * without being handed a hook.
 *
 * ```ts
 * moveNotify.add({ type: 'success', title: 'Preset saved', description: 'Bass 03' });
 * ```
 */
export const moveNotify: Omit<BaseManager, 'add'> & {
  add: (options: MoveNotifyOptions) => string;
} = manager;

export interface MoveNotificationsProps {
  /**
   * How many notifications stand at once. Older ones stay in the stack and
   * fade rather than vanishing, so the run of events is still readable.
   */
  limit?: number;
  /** How long one stays up, in ms. `0` keeps it until it is dismissed. */
  timeout?: number;
  /** Extra classes on the stack itself. */
  className?: string;
}

/** How often the stack re-reads the floor, in ms — see `useDockBottom`. */
const MEASURE_MS = 100;

/**
 * How high the stack has to stand right now.
 *
 * The floor moves: a modulator's curve comes up, the audio waveform docks, the
 * panel grows a row. Rather than subscribing to each of those — half of them
 * are app-drawn and none of them report their height — the stack measures the
 * floor for as long as it has something to say, and not one frame longer. A
 * notification lives for a few seconds; ten reads a second over those seconds
 * is cheaper than the bookkeeping of watching every float in the kit.
 */
function useDockBottom(active: boolean): number {
  const [bottom, setBottom] = useState(MOVE_NOTIFY_GAP);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    let frame = 0;
    let last = 0;
    const measure = () => {
      const tops: number[] = [];
      document.querySelectorAll(MOVE_FLOAT_SELECTOR).forEach((el) => {
        const rect = el.getBoundingClientRect();
        // A float that draws nothing is not standing on the floor.
        if (rect.width > 0 && rect.height > 0) tops.push(rect.top);
      });
      const next = notifyDockBottom(tops, window.innerHeight);
      setBottom((prev) => (prev === next ? prev : next));
    };
    const tick = (now: number) => {
      if (now - last >= MEASURE_MS) {
        last = now;
        measure();
      }
      frame = window.requestAnimationFrame(tick);
    };
    measure();
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  return bottom;
}

/**
 * The stack itself. Kept apart from the mount below so it can read the toast
 * list — `useToastManager` only answers inside the provider.
 */
function NotifyStack({ className }: { className?: string }) {
  const { toasts } = Toast.useToastManager();
  const bottom = useDockBottom(toasts.length > 0);

  return (
    <Toast.Viewport
      className={`tweakers-move-notify${className ? ` ${className}` : ''}`}
      style={{ bottom: `${bottom}px` }}
    >
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast} className="tweakers-move-notify-card">
          <Toast.Content className="tweakers-move-notify-body">
            <div className="tweakers-move-notify-text">
              {toast.type && toast.type !== 'info' && (
                <span className="tweakers-move-notify-kind">
                  <span className="tweakers-move-notify-dot" aria-hidden="true" />
                  {toast.type}
                </span>
              )}
              {toast.title != null && <Toast.Title className="tweakers-move-notify-title" />}
              {toast.description != null && (
                <Toast.Description className="tweakers-move-notify-description" />
              )}
            </div>
            <Toast.Action className="tweakers-move-notify-action" />
            <Toast.Close className="tweakers-move-notify-close" aria-label="Dismiss">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d={ICON_CLOSE} />
              </svg>
            </Toast.Close>
          </Toast.Content>
        </Toast.Root>
      ))}
    </Toast.Viewport>
  );
}

/**
 * The app's notifications, in the instrument's own air.
 *
 * Mount one of these beside the panel and every `moveNotify.add` in the app
 * lands here: centred over the Move, just above whatever is currently floating
 * there. When a display comes up — a modulator's curve, the audio waveform —
 * the stack rises over it rather than being buried by it, and settles back
 * when the display goes.
 *
 * Reading the stack is the same gesture as the hardware's: the newest card is
 * in front, the ones behind peek out under it, and hovering or focusing the
 * stack fans the whole run open. A card is dismissed by its close key, by a
 * swipe, or by waiting.
 */
export function MoveNotifications({
  limit = 3,
  timeout = 5000,
  className,
}: MoveNotificationsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="tweakers-root tweakers-move-surface tweakers-move-notify-root">
      <Toast.Provider toastManager={manager} limit={limit} timeout={timeout}>
        <NotifyStack {...(className ? { className } : {})} />
      </Toast.Provider>
    </div>,
    document.body
  );
}
