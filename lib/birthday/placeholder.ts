// Procedural pixel-art fallback for /birthday when no captured clip is present
// yet. A warm confetti sparkle with a pulsing "40" banner, rendered in the
// retro palette. No source media.

import { PALETTE_HEX } from '@/lib/friday/retro';
import type { FrameSource, ResolvedFrame } from '@/lib/friday/types';

const BANNER = '40';

export function createBirthdaySource(
  cols = 120,
  rows = 68,
  durationSec = 8,
): FrameSource {
  const bannerCells = stampBanner(BANNER, cols, rows);

  return {
    mode: 'pixel',
    cols,
    rows,
    durationSec,
    frameAt(t: number): ResolvedFrame {
      const colors: string[] = new Array(cols * rows);
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          if (bannerCells.has(i)) {
            // Cycle bright palette colors through the digits.
            const idx = 8 + (Math.floor(t * 6 + x * 0.2) % 8);
            colors[i] = PALETTE_HEX[idx];
            continue;
          }
          // Confetti: pseudo-random sparkles drifting down.
          const sparkle =
            (Math.sin(x * 12.9898 + y * 78.233 + Math.floor(t * 4)) * 43758.5453) %
            1;
          const lit = Math.abs(sparkle) > 0.93;
          if (lit) {
            const idx = 8 + (Math.floor(Math.abs(sparkle) * 1000) % 8);
            colors[i] = PALETTE_HEX[idx];
          } else {
            // Soft warm gradient backdrop.
            const v = (Math.sin(y * 0.12 - t) + 2) / 4;
            colors[i] = PALETTE_HEX[v * pulse > 0.4 ? 26 : 0];
          }
        }
      }
      return { cols, rows, colors };
    },
  };
}

// Build the set of lit cell indices spelling the banner, centered & scaled.
function stampBanner(word: string, cols: number, rows: number): Set<number> {
  const lit = new Set<number>();
  const glyphs = word.split('').map((c) => FONT[c] ?? FONT[' ']);
  const scale = 3;
  const glyphW = 4 * scale;
  const glyphH = 5 * scale;
  const totalW = glyphs.length * glyphW;
  const startX = Math.floor((cols - totalW) / 2);
  const startY = Math.floor((rows - glyphH) / 2);

  glyphs.forEach((g, gi) => {
    for (let ry = 0; ry < 5; ry++) {
      for (let rx = 0; rx < 3; rx++) {
        if (g[ry][rx] === '1') {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = startX + gi * glyphW + rx * scale + sx;
              const py = startY + ry * scale + sy;
              if (px >= 0 && px < cols && py >= 0 && py < rows) {
                lit.add(py * cols + px);
              }
            }
          }
        }
      }
    }
  });
  return lit;
}

// 3×5 pixel font for the digits we need.
const FONT: Record<string, string[]> = {
  '4': ['101', '101', '111', '001', '001'],
  '0': ['111', '101', '101', '101', '111'],
  ' ': ['000', '000', '000', '000', '000'],
};
