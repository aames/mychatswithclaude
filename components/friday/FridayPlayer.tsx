'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AsciiCanvas } from './AsciiCanvas';
import { PixelCanvas } from './PixelCanvas';
import { CrtFrame } from './CrtFrame';
import { createPlaceholderSource } from '@/lib/friday/placeholder';
import { clipToSource, loadClip } from '@/lib/friday/clip';
import type { FrameSource } from '@/lib/friday/types';

// The clip/audio are large, so they're hosted on a CDN (Bunny). Override via
// NEXT_PUBLIC_* env vars if needed. NOTE: clip.json must be served with CORS
// (access-control-allow-origin) or the cross-origin fetch will be blocked.
const CLIP_URL =
  process.env.NEXT_PUBLIC_FRIDAY_CLIP_URL ||
  'https://itsfriday.b-cdn.net/clip.json';
const AUDIO_URL =
  process.env.NEXT_PUBLIC_FRIDAY_AUDIO_URL ||
  'https://itsfriday.b-cdn.net/audio.webm';

type Phase = 'boot' | 'playing' | 'ended';

export function FridayPlayer() {
  const [phase, setPhase] = useState<Phase>('boot');
  const [paused, setPaused] = useState(false);
  const [source, setSource] = useState<FrameSource>(() =>
    createPlaceholderSource(),
  );
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pausable wall-clock (used when there's no audio to act as the clock).
  const accumRef = useRef(0); // seconds elapsed before the current run segment
  const baseRef = useRef(0); // performance.now() when the current segment began
  const runningRef = useRef(false);

  // Try to load the clip; fall back to the procedural placeholder.
  useEffect(() => {
    let cancelled = false;
    loadClip(CLIP_URL).then((clip) => {
      if (!cancelled && clip) setSource(clipToSource(clip));
    });
    // Probe for audio. A cross-origin HEAD (CDN) can fail even when the file is
    // fine, so we let the <audio> element be the real arbiter and just assume
    // audio exists when a URL is configured / locally present.
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
        // pausing: bank elapsed time, freeze
        accumRef.current = clock();
        runningRef.current = false;
        audioRef.current?.pause();
      } else {
        // resuming
        baseRef.current = performance.now();
        runningRef.current = true;
        audioRef.current?.play().catch(() => {});
      }
      return next;
    });
  }, [clock]);

  // End-after-one-play when there's no audio to emit an 'ended' event: poll the
  // wall-clock against the clip duration.
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
          'radial-gradient(circle at 50% 40%, #1a1a20 0%, #050507 70%, #000 100%)',
      }}
    >
      {phase === 'boot' ? (
        <button
          onClick={begin}
          className="z-20 group flex flex-col items-center gap-6 font-mono text-green-400"
        >
          <span className="text-5xl sm:text-7xl tracking-widest animate-pulse">
            ▶ PRESS PLAY
          </span>
          <span className="text-sm sm:text-base text-green-500/70 tracking-[0.3em]">
            [ TAP TO BEGIN ]
          </span>
          <span className="mt-8 text-[10px] text-green-700 tracking-widest">
            {hasAudio ? 'AUDIO: READY' : 'AUDIO: SILENT — visuals only'}
          </span>
        </button>
      ) : (
        <div className="w-full max-w-4xl">
          <CrtFrame>
            <div className="relative">
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

              {/* End screen: stopped after one play, with a replay button. */}
              {phase === 'ended' && (
                <button
                  onClick={begin}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 font-mono text-green-400"
                >
                  <span className="text-3xl sm:text-5xl tracking-widest">
                    ↻ REPLAY
                  </span>
                  <span className="text-xs text-green-500/70 tracking-[0.3em]">
                    THAT&rsquo;S ALL — HAPPY FRIDAY
                  </span>
                </button>
              )}
            </div>
          </CrtFrame>

          {/* Transport controls */}
          {phase === 'playing' && (
            <div className="mt-4 flex items-center justify-center gap-4 font-mono">
              <button
                onClick={togglePause}
                aria-label={paused ? 'Play' : 'Pause'}
                className="px-5 py-2 border border-green-600 text-green-400 hover:bg-green-500 hover:text-black transition-colors tracking-widest"
              >
                {paused ? '▶ PLAY' : '❚❚ PAUSE'}
              </button>
              <button
                onClick={finish}
                aria-label="Stop"
                className="px-5 py-2 border border-green-800 text-green-600 hover:bg-green-700 hover:text-black transition-colors tracking-widest"
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
