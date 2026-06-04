// Retro-console color treatment for the pixel renderer. Maps arbitrary video
// pixels onto a limited fixed palette using ordered (Bayer) dithering, which
// produces the characteristic banded/dithered shading of 8/16-bit games rather
// than a smooth gradient. Content-agnostic image processing.

export type RGB = [number, number, number];

// A 32-color retro palette: punchy primaries, skin/earth tones, and a clean
// grey ramp. Tuned to look game-like across typical video content.
export const RETRO_PALETTE: RGB[] = [
  [0, 0, 0],
  [29, 43, 83],
  [126, 37, 83],
  [0, 135, 81],
  [171, 82, 54],
  [95, 87, 79],
  [194, 195, 199],
  [255, 241, 232],
  [255, 0, 77],
  [255, 163, 0],
  [255, 236, 39],
  [0, 228, 54],
  [41, 173, 255],
  [131, 118, 156],
  [255, 119, 168],
  [255, 204, 170],
  [13, 13, 13],
  [40, 40, 40],
  [77, 77, 77],
  [115, 115, 115],
  [153, 153, 153],
  [191, 191, 191],
  [230, 230, 230],
  [255, 255, 255],
  [122, 9, 24],
  [201, 100, 66], // clay-ish (site accent neighborhood)
  [56, 24, 74],
  [24, 82, 122],
  [16, 120, 96],
  [180, 32, 42],
  [248, 180, 70],
  [60, 200, 160],
];

export const PALETTE_HEX: string[] = RETRO_PALETTE.map(
  ([r, g, b]) =>
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0'),
);

// 4×4 Bayer matrix, normalized to [-0.5, 0.5] for dither offset.
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const BAYER_NORM: number[][] = BAYER4.map((row) =>
  row.map((v) => v / 16 - 0.5),
);

// Cache of quantized lookups keyed by 5-bit-per-channel RGB.
const cache = new Int16Array(32768).fill(-1);

function nearest(r: number, g: number, b: number): number {
  const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
  const c = cache[key];
  if (c >= 0) return c;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < RETRO_PALETTE.length; i++) {
    const [pr, pg, pb] = RETRO_PALETTE[i];
    const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  cache[key] = best;
  return best;
}

/**
 * Quantize one pixel to a retro palette index, applying ordered dithering based
 * on its (x,y) so flat regions get game-like dither texture.
 * `strength` scales the dither (0 = none, ~48 = strong banding break-up).
 */
export function quantizePixel(
  r: number,
  g: number,
  b: number,
  x: number,
  y: number,
  strength = 40,
): number {
  const d = BAYER_NORM[y & 3][x & 3] * strength;
  const rr = clamp(r + d);
  const gg = clamp(g + d);
  const bb = clamp(b + d);
  return nearest(rr, gg, bb);
}

function clamp(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n;
}
