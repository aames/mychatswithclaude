'use client';

import { useEffect, useRef } from 'react';
import type { FrameSource } from '@/lib/friday/types';

// Renders a FrameSource as chunky colored pixel-blocks — the videogame look.
// Two passes: a soft bloom (blurred, additive) under crisp blocks, plus a
// scanline overlay. `clock()` returns playback time (seconds), driven by audio.
export function PixelCanvas({
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
    // Integer upscale factor → crisp pixels. Aim for ~1000px tall output.
    const scale = Math.max(2, Math.round(1000 / rows));
    canvas.width = cols * scale;
    canvas.height = rows * scale;

    // Offscreen 1:1 buffer (one pixel per cell).
    const buf = document.createElement('canvas');
    buf.width = cols;
    buf.height = rows;
    const bctx = buf.getContext('2d')!;
    const imgData = bctx.createImageData(cols, rows);

    // Pre-parse hex → rgb so we don't re-parse every cell every frame.
    const rgbCache = new Map<string, [number, number, number]>();
    const toRgb = (hex: string): [number, number, number] => {
      let v = rgbCache.get(hex);
      if (!v) {
        v = [
          parseInt(hex.slice(1, 3), 16),
          parseInt(hex.slice(3, 5), 16),
          parseInt(hex.slice(5, 7), 16),
        ];
        rgbCache.set(hex, v);
      }
      return v;
    };

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

      // Fill the 1:1 buffer from resolved colors.
      const d = imgData.data;
      for (let i = 0; i < cols * rows; i++) {
        const [r, g, b] = toRgb(frame.colors[i] || '#000000');
        const o = i * 4;
        d[o] = r;
        d[o + 1] = g;
        d[o + 2] = b;
        d[o + 3] = 255;
      }
      bctx.putImageData(imgData, 0, 0);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Crisp nearest-neighbour upscale = solid pixel blocks (emulator look).
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);

      // Subtle phosphor bloom on top (light, so pixels stay crisp).
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.18;
      ctx.imageSmoothingEnabled = true;
      ctx.filter = 'blur(4px)';
      ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [source, clock, playing, loop]);

  return (
    <canvas
      ref={canvasRef}
      className="block max-w-full max-h-[80vh]"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
