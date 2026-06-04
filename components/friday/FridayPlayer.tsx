'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AsciiCanvas } from './AsciiCanvas';
import { createPlaceholderSource } from '@/lib/friday/placeholder';
import { clipToSource, loadClip } from '@/lib/friday/clip';
import type { FrameSource } from '@/lib/friday/types';

const CLIP_URL = '/friday/clip.json';
const AUDIO_URL = '/friday/audio.webm';

type Phase = 'boot' | 'playing';

export function FridayPlayer() {
  const [phase, setPhase] = useState<Phase>('boot');
  const [source, setSource] = useState<FrameSource>(() =>
    createPlaceholderSource(),
  );
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef<number>(0);

  // Try to load a committed clip; fall back to the procedural placeholder.
  useEffect(() => {
    let cancelled = false;
    loadClip(CLIP_URL).then((clip) => {
      if (!cancelled && clip) setSource(clipToSource(clip));
    });
    // Probe for captured audio.
    fetch(AUDIO_URL, { method: 'HEAD' })
      .then((r) => !cancelled && setHasAudio(r.ok))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Clock: audio time if we have audio, otherwise wall-clock since start.
  const clock = useCallback(() => {
    if (hasAudio && audioRef.current) return audioRef.current.currentTime;
    return (performance.now() - startRef.current) / 1000;
  }, [hasAudio]);

  const begin = useCallback(async () => {
    startRef.current = performance.now();
    if (hasAudio) {
      const el = new Audio(AUDIO_URL);
      el.loop = true;
      audioRef.current = el;
      try {
        await el.play();
      } catch {
        // ignore; visuals still run
      }
    }
    setPhase('playing');
  }, [hasAudio]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.6) 3px, rgba(0,0,0,0) 4px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          boxShadow: 'inset 0 0 180px 40px rgba(0,0,0,0.9)',
        }}
      />

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
        <AsciiCanvas source={source} clock={clock} playing loop />
      )}
    </div>
  );
}
