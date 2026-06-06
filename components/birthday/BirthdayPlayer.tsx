'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AsciiCanvas } from '@/components/friday/AsciiCanvas';
import { PixelCanvas } from '@/components/friday/PixelCanvas';
import { HaflingerFrame } from './HaflingerFrame';
import { createBirthdaySource } from '@/lib/birthday/placeholder';
import { clipToSource, loadClip } from '@/lib/friday/clip';
import type { FrameSource } from '@/lib/friday/types';

// Clip/audio are large, so hosted on a CDN (Bunny). Override via NEXT_PUBLIC_*
// env vars (e.g. point at local /birthday/* files for dev). The CDN files are
// served with CORS, which the cross-origin fetch requires.
const CLIP_URL =
  process.env.NEXT_PUBLIC_BIRTHDAY_CLIP_URL || 'https://kool.b-cdn.net/clip.json';
const AUDIO_URL =
  process.env.NEXT_PUBLIC_BIRTHDAY_AUDIO_URL ||
  'https://kool.b-cdn.net/audio.webm';

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

  // The screen (canvas + end overlay), placed inside whichever frame is active.
  // Fixed ~5:4 box so the surround never reflows when the clip swaps in; the
  // canvas fills it edge-to-edge.
  const screenContent = (
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
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 font-serif text-[#d8d98a]"
        >
          <span className="text-3xl sm:text-5xl tracking-widest">↻ REPLAY</span>
          <span className="text-xs text-[#a7ad6a] tracking-[0.3em]">
            HAPPY 40th — KEEP ON TRUCKIN&rsquo;
          </span>
        </button>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden p-4 sm:p-8"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, #3a3f27 0%, #20240f 65%, #0c0d06 100%)',
      }}
    >
      {phase === 'boot' ? (
        <button
          onClick={begin}
          className="z-20 flex flex-col items-center gap-6 font-mono text-[#c9c94e]"
        >
          <span className="font-serif text-5xl sm:text-7xl tracking-widest animate-pulse text-[#d8d98a]">
            🛻 PRESS PLAY
          </span>
          <span className="text-sm sm:text-base text-[#a7ad6a] tracking-[0.4em]">
            [ START ENGINE ]
          </span>
          <span className="mt-8 text-[10px] text-[#7c8150] tracking-widest">
            {hasAudio ? 'SYSTEMS: GO' : 'AUDIO: SILENT — visuals only'}
          </span>
        </button>
      ) : (
        <div className="w-full max-w-4xl">
          <HaflingerFrame>{screenContent}</HaflingerFrame>

          {phase === 'playing' && (
            <div className="mt-6 flex items-center justify-center gap-4 font-serif">
              <button
                onClick={togglePause}
                aria-label={paused ? 'Play' : 'Pause'}
                className="px-5 py-2 rounded-full border border-[#a7ad6a] text-[#d8d98a] hover:bg-[#a7ad6a] hover:text-black transition-colors tracking-widest"
              >
                {paused ? '▶ PLAY' : '❚❚ PAUSE'}
              </button>
              <button
                onClick={finish}
                aria-label="Stop"
                className="px-5 py-2 rounded-full border border-[#5e6b3a] text-[#7c8150] hover:bg-[#5e6b3a] hover:text-black transition-colors tracking-widest"
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
