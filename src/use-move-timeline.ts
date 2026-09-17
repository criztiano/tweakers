import { useCallback, useEffect, useId, useMemo, useRef, useSyncExternalStore } from 'react';
import { TweakStore } from './store/TweakStore';
import { TimelineStore } from './store/TimelineStore';
import { computeStaticTimeline, parseTimelineConfig, type TimelineConfig, type TweakTimelineValues } from './timeline-core';
import { buildTimelineMeta, buildTimelineValues, type TweakTimelineOptions } from './timeline/adapter';

export type UseMoveTimelineOptions = TweakTimelineOptions;

/** The frame values, plus the id that names this timeline to `MoveTimeline`. */
export type MoveTimelineValues<T extends TimelineConfig> = TweakTimelineValues<T> & { id: string };

/**
 * A timeline, defined in code: clips that animate values over time, and a
 * transport that plays, loops and scrubs them.
 *
 * Every clip's timing and values live in the shared store under the timeline's
 * id, so presets, persistence and the timeline card's drags work on them like
 * any control. The hook returns each clip's current values for this frame —
 * bind them straight to what they animate — and the transport (`time`,
 * `playing`, `play`, `pause`, `replay`, `seek`). Hand the returned `id` to
 * `MoveTimeline` to put it on the surface.
 *
 * The config may change shape between renders (a clip added, a duration
 * grown): values on surviving paths are kept, and the playhead stays put.
 */
export function useMoveTimeline<T extends TimelineConfig>(
  name: string,
  config: T,
  options?: UseMoveTimelineOptions
): MoveTimelineValues<T> {
  const serialized = JSON.stringify(config);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parsed = useMemo(() => parseTimelineConfig(config), [serialized]);

  const instance = useId();
  const id = options?.id ?? `${name}-${instance}`;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // The clips' values: a `timeline` panel, never a page on the Move panel.
  const panelOptions = () => ({ persist: optionsRef.current?.persist, kind: 'timeline' as const, retainOnUnmount: options?.id !== undefined });
  const parsedRef = useRef(parsed);
  parsedRef.current = parsed;
  useEffect(() => {
    TweakStore.registerPanel(id, name, parsedRef.current.tweakConfig, undefined, panelOptions());
    return () => TweakStore.unregisterPanel(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name]);
  const shaped = useRef(false);
  useEffect(() => {
    if (!shaped.current) {
      shaped.current = true;
      return;
    }
    TweakStore.updatePanel(id, name, parsed.tweakConfig, undefined, panelOptions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name, parsed]);

  const values = useSyncExternalStore(
    useCallback((cb) => TweakStore.subscribe(id, cb), [id]),
    () => TweakStore.getValues(id),
    () => TweakStore.getValues(id)
  );

  // Edit-time pass: only when a value changes, never per tick.
  const statics = useMemo(() => computeStaticTimeline(parsed, values), [parsed, values]);
  const duration = statics.duration;

  const buildMeta = useCallback(
    () => buildTimelineMeta(id, name, duration, parsedRef.current, optionsRef.current?.loop),
    [id, name, duration]
  );
  const buildMetaRef = useRef(buildMeta);
  buildMetaRef.current = buildMeta;

  // The transport follows the panel's lifecycle; a structure change goes
  // through update so the playhead is not reset by a re-register.
  useEffect(() => {
    TimelineStore.register(buildMetaRef.current(), {
      autoplay: optionsRef.current?.autoplay ?? true,
      persist: optionsRef.current?.persist,
    });
    return () => TimelineStore.unregister(id);
  }, [id, name]);
  const registered = useRef(false);
  useEffect(() => {
    if (!registered.current) {
      registered.current = true;
      return;
    }
    TimelineStore.update(buildMeta());
  }, [buildMeta, parsed]);

  const subscribeTransport = useCallback((cb: () => void) => TimelineStore.subscribe(id, cb), [id]);
  const transport = useSyncExternalStore(
    subscribeTransport,
    () => TimelineStore.getTransport(id),
    () => TimelineStore.getTransport(id)
  );
  const region = useSyncExternalStore(
    subscribeTransport,
    () => TimelineStore.getLoopRegion(id),
    () => TimelineStore.getLoopRegion(id)
  );

  const play = useCallback(() => TimelineStore.play(id), [id]);
  const pause = useCallback(() => TimelineStore.pause(id), [id]);
  const replay = useCallback(() => TimelineStore.replay(id), [id]);
  const seek = useCallback((time: number) => TimelineStore.seek(id, time), [id]);

  return useMemo(() => {
    const frame = buildTimelineValues<T>(statics.clips, transport, duration, region?.start ?? 0, region?.end ?? duration, {
      play,
      pause,
      replay,
      seek,
    });
    return Object.assign(frame, { id });
  }, [statics.clips, transport, duration, region, play, pause, replay, seek, id]);
}
