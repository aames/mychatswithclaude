// Shared format between the capture tool (/friday/capture) and the player
// (/friday). A clip is a sequence of color-ASCII frames.
//
// To keep the committed data file small, colors are quantized to a small
// palette and each frame stores one palette index per cell (base64-packed),
// alongside the raw characters. A ~10s clip at 80×45 / 15fps is a few hundred
// KB of text and gzips very well.

export type FridayClip = {
  cols: number;
  rows: number;
  fps: number;
  /** Hex colors like "#rrggbb"; cell color = palette[index]. */
  palette: string[];
  frames: FridayFrame[];
};

export type FridayFrame = {
  /** rows joined by "\n"; length === rows, each row length === cols */
  c: string;
  /** base64 of a Uint8Array of length cols*rows; each byte is a palette index */
  k: string;
};

/** A frame resolved to per-cell character + color, ready to draw. */
export type ResolvedFrame = {
  cols: number;
  rows: number;
  chars: string; // rows joined by "\n"
  colors: string[]; // length cols*rows, hex strings
};

/** Anything the player can render: procedural placeholder or a loaded clip. */
export interface FrameSource {
  cols: number;
  rows: number;
  durationSec: number;
  /** Resolve the frame to show at playback time `t` (seconds). */
  frameAt(t: number): ResolvedFrame;
}

// The ramp of luminance → character. Index 0 = darkest.
export const ASCII_RAMP = ' .,:;i1tfLCG08@';

export function luminanceToChar(lum: number): string {
  // lum in [0,1]
  const i = Math.min(
    ASCII_RAMP.length - 1,
    Math.max(0, Math.round(lum * (ASCII_RAMP.length - 1))),
  );
  return ASCII_RAMP[i];
}
