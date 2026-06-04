// A procedural pixel-art animation used when no captured clip is present yet,
// so /friday works end-to-end today. A scrolling retro plasma with a pulsing
// "FRIDAY" banner, rendered in the retro palette. No source media.

import { RETRO_PALETTE, PALETTE_HEX } from './retro';
import type { FrameSource, ResolvedFrame } from './types';

const BANNER = 'FRIDAY';

export function createPlaceholderSource(
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
            // Cycle bright palette colors through the letters.
            const idx = 8 + (Math.floor(t * 6 + x * 0.2) % 8);
            colors[i] = PALETTE_HEX[idx];
            continue;
          }
          const v =
            Math.sin(x * 0.10 + t * 2) +
            Math.sin(y * 0.16 - t * 1.6) +
            Math.sin((x + y) * 0.07 + t * 2.4) +
            Math.sin(Math.hypot(x - cols / 2, y - rows / 2) * 0.12 - t * 3);
          const lum = (v + 4) / 8; // 0..1
          const idx = pickRamp(lum, pulse);
          colors[i] = PALETTE_HEX[idx];
        }
      }
      return { cols, rows, colors };
    },
  };
}

// A pleasing ramp through the retro palette for the plasma background.
const RAMP_INDICES = [0, 1, 26, 2, 24, 4, 9, 10];
function pickRamp(lum: number, pulse: number): number {
  const shifted = Math.min(0.999, Math.max(0, lum * (0.8 + pulse * 0.2)));
  return RAMP_INDICES[Math.floor(shifted * RAMP_INDICES.length)];
}

// Build the set of lit cell indices spelling the banner, centered & scaled.
function stampBanner(word: string, cols: number, rows: number): Set<number> {
  const lit = new Set<number>();
  const glyphs = word.toUpperCase().split('').map((c) => FONT[c] ?? FONT[' ']);
  const scale = 2;
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

// 3×5 pixel font for the banner letters.
const FONT: Record<string, string[]> = {
  F: ['111', '100', '111', '100', '100'],
  R: ['111', '101', '111', '110', '101'],
  I: ['111', '010', '010', '010', '111'],
  D: ['110', '101', '101', '101', '110'],
  A: ['111', '101', '111', '101', '101'],
  Y: ['101', '101', '111', '010', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};

export { RETRO_PALETTE };
