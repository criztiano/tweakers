import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MovePanel } from '../src/components/MovePanel';
import { MoveTimeline } from '../src/components/MoveTimeline';
import { TweakStore } from '../src/store/TweakStore';
import { ModulationStore } from '../src/store/ModulationStore';
import { TimelineStore } from '../src/store/TimelineStore';
import { MoveFunctions } from '../src/move-functions';
import { moveKitOptions } from '../src/move-kit';
import { MOVE_FLOAT_SELECTOR, notifyDockBottom } from '../src/move-notify';
import { useMoveTimeline } from '../src/use-move-timeline';
import type { TimelineClipConfig } from '../src/timeline-core';
import '../src/styles/theme.css';

/*
 * A video on the Move: the timeline drives it, the panel grades it.
 *
 * The timeline is the clock — Play runs it, the volume knob scrubs it, and
 * the video follows. Its clips animate what sits over the picture (a title,
 * a slow push-in, a vignette, a pulse), and Rec lays a take down on its own
 * row. The panel's one page grades the picture, every dial modulatable.
 */

// The picture: real units, the page the knobs hold.
TweakStore.registerPanel('picture', 'Picture', {
  exposure: { type: 'slider', default: 0, min: -2, max: 2, step: 0.1, formatValue: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)} EV` },
  contrast: { type: 'slider', default: 100, min: 50, max: 200, step: 1, formatValue: (v: number) => `${Math.round(v)}%` },
  saturation: { type: 'slider', default: 100, min: 0, max: 200, step: 1, formatValue: (v: number) => `${Math.round(v)}%` },
  hue: { type: 'slider', default: 0, min: -180, max: 180, step: 1, formatValue: (v: number) => `${Math.round(v)}°` },
  softness: { type: 'slider', default: 0, min: 0, max: 12, step: 0.5, formatValue: (v: number) => `${v.toFixed(1)} px` },
  mono: false,
}, undefined, { movePads: { mono: 2 } });

const SAMPLE = './media/timeline-sample.mp4';

type Take = { at: number; duration: number };

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(SAMPLE);
  const [missing, setMissing] = useState(false);
  const [length, setLength] = useState(24);
  const [takes, setTakes] = useState<Take[]>([]);

  const config = useMemo(() => ({
    duration: length,
    title: {
      at: 0.6,
      from: { opacity: 0, y: 28 },
      steps: [
        { duration: 1.2, to: { opacity: 1, y: 0 }, transition: { type: 'easing' as const, duration: 1.2, ease: [0.2, 0, 0, 1] as [number, number, number, number] } },
        { duration: 3, to: { opacity: 1 } },
        { duration: 0.8, to: { opacity: 0, y: -12 }, transition: { type: 'easing' as const, duration: 0.8, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
      ],
    },
    push: {
      at: Math.min(6, length * 0.25),
      duration: Math.min(8, length * 0.35),
      from: { scale: 1 },
      to: { scale: 1.18 },
      transition: { type: 'easing' as const, duration: 8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
    vignette: {
      at: Math.min(12, length * 0.5),
      duration: Math.min(4, length * 0.2),
      from: { amount: 0 },
      to: { amount: 0.85 },
      transition: { type: 'easing' as const, duration: 4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
    pulse: {
      at: Math.min(16, length * 0.66),
      loop: true,
      from: { glow: 0 },
      steps: [
        { duration: 0.5, to: { glow: 1 }, transition: { type: 'easing' as const, duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
        { duration: 0.5, to: { glow: 0 }, transition: { type: 'easing' as const, duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
      ],
    },
    // Every take is a marker on one row — a layer packs into as few rows as it needs.
    ...(takes.length
      ? { takes: Object.fromEntries(takes.map((take, i) => [`take${i + 1}`, take satisfies TimelineClipConfig])) }
      : {}),
  }), [length, takes]);

  const tl = useMoveTimeline('Edit', config, { id: 'video-edit', autoplay: false });
  const id = tl.id;

  // The video follows the timeline's clock: a running transport plays it and
  // pulls it back when the two drift apart; a standing one parks it on the
  // playhead, frame for frame, so every scrub shows its picture.
  useEffect(() => {
    const sync = () => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      const { time, playing } = TimelineStore.getTransport(id);
      if (playing) {
        if (video.paused) video.play().catch(() => {});
        if (Math.abs(video.currentTime - time) > 0.25) video.currentTime = time;
      } else {
        if (!video.paused) video.pause();
        if (Math.abs(video.currentTime - time) > 0.01) video.currentTime = time;
      }
    };
    sync();
    return TimelineStore.subscribe(id, sync);
  }, [id, src]);

  // Rec: a take runs from where recording started to where it stopped.
  const takeFrom = useRef(0);
  const onRecord = (recording: boolean) => {
    const { time, duration } = TimelineStore.getTransport(id);
    if (recording) {
      takeFrom.current = time;
      return;
    }
    // A take that crossed the loop's wrap ends where the loop does.
    const end = time > takeFrom.current ? time : TimelineStore.getLoopRegion(id)?.end ?? duration;
    const take = { at: Number(takeFrom.current.toFixed(2)), duration: Number(Math.max(0.1, end - takeFrom.current).toFixed(2)) };
    setTakes((all) => [...all, take]);
  };

  // The Sampling key loads a video — a chip in the header, a key on the Move.
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => MoveFunctions.attach('sample', () => fileRef.current?.click(), { label: 'Load video' }), []);

  // The picture's grade, with any modulation on it, every frame.
  const [grade, setGrade] = useState('none');
  useEffect(() => {
    let raf = requestAnimationFrame(function tick() {
      const v = ModulationStore.getValues('picture');
      const next = [
        `brightness(${Math.pow(2, Number(v.exposure) || 0).toFixed(3)})`,
        `contrast(${(Number(v.contrast) || 0).toFixed(0)}%)`,
        `saturate(${v.mono ? 0 : (Number(v.saturation) || 0).toFixed(0)}%)`,
        `hue-rotate(${(Number(v.hue) || 0).toFixed(0)}deg)`,
        `blur(${(Number(v.softness) || 0).toFixed(1)}px)`,
      ].join(' ');
      setGrade((prev) => (prev === next ? prev : next));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // The stage keeps clear of the timeline and the panel floating under it.
  const [reserve, setReserve] = useState(420);
  useEffect(() => {
    const measure = () => {
      const tops = [...document.querySelectorAll(MOVE_FLOAT_SELECTOR)].map((el) => el.getBoundingClientRect().top);
      setReserve(notifyDockBottom(tops, window.innerHeight, 24));
    };
    measure();
    const timer = setInterval(measure, 250);
    return () => clearInterval(timer);
  }, []);

  const title = tl.title.current;
  const push = tl.push.current;
  const vignette = tl.vignette.current;
  const pulse = tl.pulse.current;

  return (
    <>
      <main style={{ position: 'fixed', inset: `0 0 ${reserve}px 0`, display: 'grid', placeItems: 'center', padding: '84px 24px 0', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', height: '100%', maxWidth: '100%', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', background: '#1e1e1e' }}>
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              setMissing(false);
              const seconds = e.currentTarget.duration;
              if (Number.isFinite(seconds) && seconds > 0) setLength(Number(seconds.toFixed(2)));
            }}
            onError={() => setMissing(src === SAMPLE)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: grade, transform: `scale(${Number(push.scale)})` }}
          />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 45%, #000 100%)', opacity: Number(vignette.amount) }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: '14%', textAlign: 'center', pointerEvents: 'none', fontFamily: "'Geist Pixel', system-ui", fontSize: 'clamp(24px, 5vw, 56px)', color: '#fff', opacity: Number(title.opacity), transform: `translateY(${Number(title.y)}px)` }}>
            Twenty-four seconds
          </div>
          <div style={{ position: 'absolute', top: 18, right: 18, width: 14, height: 14, borderRadius: 7, background: '#fd3c57', pointerEvents: 'none', opacity: 0.25 + 0.75 * Number(pulse.glow), boxShadow: `0 0 ${Math.round(24 * Number(pulse.glow))}px #fd3c57` }} />
          {missing && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, fontSize: 15, lineHeight: 1.6 }}>
              <div>No sample video yet — run <code>sh scripts/demo-video.sh</code>,<br />or press <b>O</b> (the Sampling key) to load one.</div>
            </div>
          )}
        </div>
      </main>

      <aside style={{ position: 'fixed', top: 16, left: 16, fontSize: 12, lineHeight: 1.7, opacity: 0.6, pointerEvents: 'none' }}>
        <b>Space</b> play · <b>L</b> loop (Shift lets the loop go) · <b>R</b> record<br />
        <b>← →</b> volume knob scrub (Shift fine, Alt fast) · <b>↑ ↓</b> wheel zoom · <b>Enter</b> show all<br />
        <b>O</b> load a video · on the card: click the ruler, drag it to loop, drag clips and their edges
      </aside>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = '';
          if (!file) return;
          TimelineStore.pause(id);
          TimelineStore.seek(id, 0);
          setTakes([]);
          setSrc(URL.createObjectURL(file));
        }}
      />

      <MoveTimeline id={id} onRecord={onRecord} theme="dark" productionEnabled />
      <MovePanel productionEnabled theme="dark" />
    </>
  );
}

// Keyboard stand-ins for the hardware, dispatched exactly as the kit does:
// the transport keys run through MoveFunctions, the knob and the wheel go
// out as the kit's own cancelable events.
const kit = (type: string, detail: Record<string, unknown>) =>
  window.dispatchEvent(new CustomEvent(type, { detail, cancelable: true }));
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  const key = e.key.toLowerCase();
  if (e.key === ' ') MoveFunctions.run('play', {});
  else if (key === 'l') MoveFunctions.run('loop', { shift: e.shiftKey });
  else if (key === 'r' && !e.metaKey && !e.ctrlKey) MoveFunctions.run('rec', {});
  else if (key === 'o') MoveFunctions.run('sample', {});
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const sign = e.key === 'ArrowRight' ? 1 : -1;
    kit('move-tweakers:volume', { delta: sign * (e.altKey ? 8 : 1), shift: e.shiftKey });
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') kit('move-tweakers:jog', { delta: e.key === 'ArrowUp' ? 1 : -1, shift: e.shiftKey });
  else if (e.key === 'Enter') kit('move-tweakers:jog-click', { shift: e.shiftKey });
  else return;
  e.preventDefault();
});

// The hardware, when the bridge is up. `?bridge=` points at another one — a
// private local-engine bridge for checks nobody is sitting at.
const bridge = (new URLSearchParams(location.search).get('bridge') || 'http://localhost:7787').replace(/\/+$/, '');
// @ts-ignore — remote module, no types
import(/* @vite-ignore */ `${bridge}/kit.js?v=${Date.now()}`)
  .then((m) => m.bindMove(TweakStore, moveKitOptions({ url: bridge })))
  .catch(() => {});

(window as unknown as Record<string, unknown>).__tweakers = { TweakStore, TimelineStore, ModulationStore, MoveFunctions };

createRoot(document.getElementById('root')!).render(<App />);
