// Shared format between the capture tool (/friday/capture) and the player
// (/friday).
//
// Two render modes:
//   • "pixel" — each cell is a colored block (palette index per cell). This is
//     the videogame/pixel-art look. No characters.
//   • "ascii" — legacy: each cell is a character + color (kept for the
//     procedural placeholder and back-compat with old clips).
//
// To keep the committed data file small, colors are quantized to a small
// palette and each frame stores one palette index per cell (base64-packed).

export type ClipMode = 'pixel' | 'ascii';

export type FridayClip = {
  /** Defaults to "ascii" when absent (old clips). */
  mode?: ClipMode;
  cols: number;
  rows: number;
  fps: number;
  /** Hex colors like "#rrggbb"; cell color = palette[index]. */
  palette: string[];
  frames: FridayFrame[];
};

export type FridayFrame = {
  /** ascii mode only: rows joined by "\n". Omitted/empty in pixel mode. */
  c?: string;
  /** base64 of a Uint8Array of length cols*rows; each byte is a palette index */
  k: string;
};

/** A frame resolved to a drawable grid. */
export type ResolvedFrame = {
  cols: number;
  rows: number;
  /** length cols*rows, hex colors per cell. */
  colors: string[];
  /** ascii mode only: rows joined by "\n" (undefined in pixel mode). */
  chars?: string;
};

/** Anything the player can render: procedural placeholder or a loaded clip. */
export interface FrameSource {
  mode: ClipMode;
  cols: number;
  rows: number;
  durationSec: number;
  /** Resolve the frame to show at playback time `t` (seconds). */
  frameAt(t: number): ResolvedFrame;
}

// The ramp of luminance → character. Index 0 = darkest.
export const ASCII_RAMP = ' .,:;i1tfLCG08@';

export function luminanceToChar(lum: number): string {
  const i = Math.min(
    ASCII_RAMP.length - 1,
    Math.max(0, Math.round(lum * (ASCII_RAMP.length - 1))),
  );
  return ASCII_RAMP[i];
}
