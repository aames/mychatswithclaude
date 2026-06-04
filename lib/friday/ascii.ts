// Pixel → color-ASCII conversion, shared by the capture tool (to build frames)
// and usable for live preview. Content-agnostic image processing.

import { ASCII_RAMP, luminanceToChar } from './types';
import type { ResolvedFrame } from './types';

export type RGB = { r: number; g: number; b: number };

/**
 * Convert an ImageData (already downscaled to cols×rows) into a resolved
 * color-ASCII frame: one character per cell (by luminance) tinted with the
 * cell's color (slightly boosted so dark video still shows color on black).
 */
export function imageDataToAscii(
  img: ImageData,
  cols: number,
  rows: number,
): ResolvedFrame {
  const { data, width } = img;
  const chars: string[] = [];
  const colors: string[] = new Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const px = (y * width + x) * 4;
      const r = data[px];
      const g = data[px + 1];
      const b = data[px + 2];
      // Rec. 601 luma.
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      line += luminanceToChar(lum);
      colors[y * cols + x] = boostColor(r, g, b);
    }
    chars.push(line);
  }

  return { cols, rows, chars: chars.join('\n'), colors };
}

// Push colors brighter/more saturated so they read as glowing terminal text.
function boostColor(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b, 1);
  const scale = Math.min(255, max * 1.6) / max;
  const rr = Math.min(255, Math.round(r * scale));
  const gg = Math.min(255, Math.round(g * scale));
  const bb = Math.min(255, Math.round(b * scale));
  return '#' + hex(rr) + hex(gg) + hex(bb);
}

function hex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

export { ASCII_RAMP };
