'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AsciiCanvas } from '@/components/friday/AsciiCanvas';
import { PixelCanvas } from '@/components/friday/PixelCanvas';
import { CakeFrame } from './CakeFrame';
import { createBirthdaySource } from '@/lib/birthday/placeholder';
import { clipToSource, loadClip } from '@/lib/friday/clip';
import type { FrameSource } from '@/lib/friday/types';

// Clip/audio are large, so hosted on a CDN. Override via NEXT_PUBLIC_* env vars;
// falls back to local files under public/birthday/ for dev. NOTE: clip.json must
// be served with CORS or the cross-origin fetch will be blocked.
const CLIP_URL =
  process.env.NEXT_PUBLIC_BIRTHDAY_CLIP_URL || '/birthday/clip.json';
const AUDIO_URL =
  process.env.NEXT_PUBLIC_BIRTHDAY_AUDIO_URL || '/birthday/audio.webm';

type Phase = 'boot' | 'playing' | 'ended';

export function BirthdayPlayer() {
  const [phase, setPhase] = useState<Phase>('boot');
  const [paused, setPaused] = useState(false);
  const [source, setSource] = useState<FrameSource>(() =>
    createBirthdaySource(),
  );
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pausable wall-clock (used when there's no audio to act as the clock).
  const accumRef = useRef(0);
  const baseRef = useRef(0);
  const runningRef = useRef(false);

  // Try to load the clip; fall back to the procedural placeholder.
  useEffect(() => {
    let cancelled = false;
    loadClip(CLIP_URL).then((clip) => {
      if (!cancelled && clip) setSource(clipToSource(clip));
    });
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = AUDIO_URL;
    probe.addEventListener('loadedmetadata', () => !cancelled && setHasAudio(true));
    probe.addEventListener('error', () => !cancelled && setHasAudio(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Clock: audio time if we have audio, else the pausable wall-clock.
  const clock = useCallback(() => {
    if (hasAudio && audioRef.current) return audioRef.current.currentTime;
    return (
      accumRef.current +
      (runningRef.current ? (performance.now() - baseRef.current) / 1000 : 0)
    );
  }, [hasAudio]);

  const finish = useCallback(() => {
    runningRef.current = false;
    audioRef.current?.pause();
    setPhase('ended');
  }, []);

  const begin = useCallback(async () => {
    accumRef.current = 0;
    baseRef.current = performance.now();
    runningRef.current = true;
    setPaused(false);
    if (hasAudio) {
      const el = new Audio(AUDIO_URL);
      el.loop = false; // play once, then stop
      el.addEventListener('ended', finish);
      audioRef.current = el;
      try {
        await el.play();
      } catch {
        // ignore; visuals still run
      }
    }
    setPhase('playing');
  }, [hasAudio, finish]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      if (next) {
        accumRef.current = clock();
        runningRef.current = false;
        audioRef.current?.pause();
      } else {
        baseRef.current = performance.now();
        runningRef.current = true;
        audioRef.current?.play().catch(() => {});
      }
      return next;
    });
  }, [clock]);

  // End-after-one-play when there's no audio event: poll wall-clock vs duration.
  useEffect(() => {
    if (phase !== 'playing' || hasAudio) return;
    const id = window.setInterval(() => {
      if (runningRef.current && clock() >= source.durationSec) finish();
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, hasAudio, source, clock, finish]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden p-4 sm:p-8"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, #2a1622 0%, #140a10 70%, #000 100%)',
      }}
    >
      {phase === 'boot' ? (
        <button
          onClick={begin}
          className="z-20 flex flex-col items-center gap-6 font-serif text-amber-300"
        >
          <span className="text-5xl sm:text-7xl tracking-widest animate-pulse">
            🎂 PRESS PLAY
          </span>
          <span className="text-sm sm:text-base text-amber-400/70 tracking-[0.3em]">
            [ MAKE A WISH ]
          </span>
          <span className="mt-8 text-[10px] text-amber-200/40 tracking-widest font-mono">
            {hasAudio ? 'AUDIO: READY' : 'AUDIO: SILENT — visuals only'}
          </span>
        </button>
      ) : (
        <div className="w-full max-w-4xl">
          <CakeFrame>
            {/* Fixed-size screen so the cake never reflows when the clip (a
                different aspect ratio to the placeholder) swaps in. Box is ~5:4
                to match the captured clip; the canvas fills it edge-to-edge. */}
            <div className="relative aspect-[5/4] w-full [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:object-cover">
              {source.mode === 'pixel' ? (
                <PixelCanvas
                  source={source}
                  clock={clock}
                  playing={phase === 'playing' && !paused}
                  loop={false}
                />
              ) : (
                <AsciiCanvas
                  source={source}
                  clock={clock}
                  playing={phase === 'playing' && !paused}
                  loop={false}
                />
              )}

              {phase === 'ended' && (
                <button
                  onClick={begin}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 font-serif text-amber-200"
                >
                  <span className="text-3xl sm:text-5xl tracking-widest">
                    ↻ REPLAY
                  </span>
                  <span className="text-xs text-amber-300/80 tracking-[0.3em]">
                    HAPPY 40th — MANY HAPPY RETURNS
                  </span>
                </button>
              )}
            </div>
          </CakeFrame>

          {phase === 'playing' && (
            <div className="mt-6 flex items-center justify-center gap-4 font-serif">
              <button
                onClick={togglePause}
                aria-label={paused ? 'Play' : 'Pause'}
                className="px-5 py-2 rounded-full border border-amber-400 text-amber-200 hover:bg-amber-400 hover:text-black transition-colors tracking-widest"
              >
                {paused ? '▶ PLAY' : '❚❚ PAUSE'}
              </button>
              <button
                onClick={finish}
                aria-label="Stop"
                className="px-5 py-2 rounded-full border border-amber-800 text-amber-500 hover:bg-amber-800 hover:text-black transition-colors tracking-widest"
              >
                ■ STOP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
