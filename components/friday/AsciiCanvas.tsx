'use client';

import { useEffect, useRef } from 'react';
import type { FrameSource } from '@/lib/friday/types';

// Renders a FrameSource to a canvas as glowing monospace color-ASCII. The
// `clock()` callback returns the current playback time (seconds) — we drive it
// from the audio so picture and sound stay in sync.
export function AsciiCanvas({
  source,
  clock,
  playing,
  loop = true,
}: {
  source: FrameSource;
  clock: () => number;
  playing: boolean;
  loop?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cols, rows } = source;
    const cell = 14; // px per character cell
    const charW = cell * 0.6;
    canvas.width = cols * charW;
    canvas.height = rows * cell;

    ctx.font = `${cell}px "Courier New", monospace`;
    ctx.textBaseline = 'top';

    const render = () => {
      // The clock freezes itself when paused, so always read it. Loop wraps;
      // otherwise clamp to the last frame so it holds on the final image.
      let t = clock();
      if (source.durationSec > 0) {
        t = loop
          ? t % source.durationSec
          : Math.min(t, source.durationSec - 1e-3);
      }

      const frame = source.frameAt(t);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lines = (frame.chars ?? '').split('\n');
      for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        for (let x = 0; x < line.length; x++) {
          const chr = line[x];
          if (chr === ' ') continue;
          ctx.fillStyle = frame.colors[y * cols + x] || '#0f0';
          ctx.fillText(chr, x * charW, y * cell);
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [source, clock, playing, loop]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full max-h-full"
      style={{ imageRendering: 'pixelated', filter: 'saturate(1.2)' }}
    />
  );
}
