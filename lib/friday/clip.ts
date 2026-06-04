// Turns a committed FridayClip (frames + palette) into a FrameSource the player
// can scrub by time. Content-agnostic: it just replays whatever was captured.

import type { FridayClip, FrameSource, ResolvedFrame, ClipMode } from './types';

export function clipToSource(clip: FridayClip): FrameSource {
  const { cols, rows, fps, palette, frames } = clip;
  const mode: ClipMode = clip.mode ?? 'ascii';
  const durationSec = frames.length / fps;

  // Pre-decode palette-index buffers once.
  const decoded = frames.map((f) => ({
    chars: f.c,
    keys: base64ToBytes(f.k),
  }));

  return {
    mode,
    cols,
    rows,
    durationSec,
    frameAt(t: number): ResolvedFrame {
      const idx = Math.min(
        frames.length - 1,
        Math.max(0, Math.floor(t * fps)),
      );
      const fr = decoded[idx];
      const colors = new Array(cols * rows);
      for (let i = 0; i < fr.keys.length; i++) {
        colors[i] = palette[fr.keys[i]] ?? '#000000';
      }
      return { cols, rows, colors, chars: fr.chars };
    },
  };
}

export async function loadClip(url: string): Promise<FridayClip | null> {
  try {
    // Cache-bust so a freshly captured clip.json is always picked up rather
    // than a stale browser-cached copy.
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as FridayClip;
  } catch {
    return null;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
