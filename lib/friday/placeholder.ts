// A procedural color-ASCII animation used when no captured clip is present yet,
// so /friday works end-to-end today. A scrolling rainbow plasma with a pulsing
// "IT'S FRIDAY" banner — purely generated, no source media.

import { luminanceToChar } from './types';
import type { FrameSource, ResolvedFrame } from './types';

const BANNER = ["IT'S", 'FRIDAY'];

export function createPlaceholderSource(
  cols = 80,
  rows = 45,
  durationSec = 8,
): FrameSource {
  return {
    cols,
    rows,
    durationSec,
    frameAt(t: number): ResolvedFrame {
      const chars: string[] = [];
      const colors: string[] = new Array(cols * rows);
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);

      // Precompute banner cell positions (centered, big letters via spacing).
      const bannerRows = stampBanner(cols, rows);

      for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
          const onBanner = bannerRows.has(`${x},${y}`);
          // Plasma field.
          const v =
            Math.sin(x * 0.12 + t * 2) +
            Math.sin(y * 0.18 - t * 1.7) +
            Math.sin((x + y) * 0.08 + t * 2.5);
          const lum = (v + 3) / 6; // 0..1
          if (onBanner) {
            line += '#';
            const hue = (t * 80 + x * 4) % 360;
            colors[y * cols + x] = hslHex(hue, 100, 50 + pulse * 20);
          } else {
            line += luminanceToChar(lum * 0.7);
            const hue = (lum * 200 + t * 40) % 360;
            colors[y * cols + x] = hslHex(hue, 80, 25 + lum * 35);
          }
        }
        chars.push(line);
      }

      return { cols, rows, chars: chars.join('\n'), colors };
    },
  };
}

// Build the set of "lit" cells spelling the banner, centered.
function stampBanner(cols: number, rows: number): Set<string> {
  const lit = new Set<string>();
  const startY = Math.floor(rows / 2) - BANNER.length * 2;
  BANNER.forEach((word, wi) => {
    const text = renderWord(word);
    const wWidth = text[0].length;
    const startX = Math.floor((cols - wWidth) / 2);
    text.forEach((row, ry) => {
      for (let cx = 0; cx < row.length; cx++) {
        if (row[cx] !== ' ') {
          lit.add(`${startX + cx},${startY + wi * 4 + ry}`);
        }
      }
    });
  });
  return lit;
}

// Minimal 3-row block font for the few letters we need.
const GLYPHS: Record<string, string[]> = {
  I: ['III', ' I ', 'III'],
  T: ['TTT', ' T ', ' T '],
  "'": [' x ', '   ', '   '],
  S: ['SSS', 'SS ', 'SSS'],
  F: ['FFF', 'FF ', 'F  '],
  R: ['RR ', 'RR ', 'R R'],
  D: ['DD ', 'D D', 'DD '],
  A: ['AAA', 'A A', 'A A'],
  Y: ['Y Y', ' Y ', ' Y '],
  ' ': ['   ', '   ', '   '],
};

function renderWord(word: string): string[] {
  const rows = ['', '', ''];
  for (const ch of word.toUpperCase()) {
    const g = GLYPHS[ch] ?? GLYPHS[' '];
    for (let r = 0; r < 3; r++) rows[r] += g[r] + ' ';
  }
  return rows;
}

function hslHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}
