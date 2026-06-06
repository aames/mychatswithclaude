'use client';

import type { ReactNode } from 'react';

// Uses the supplied real photo (public/birthday/sp.png) as the surround and
// drops the retro screen onto the back cargo tray. The screen position is given
// as percentages of the image so it can be dialled in; override via
// NEXT_PUBLIC_BIRTHDAY_SCREEN = "top,left,width,height".
// Screen placement on sp.png. top/left/width are percentages of the image;
// HEIGHT IS NOT SET — the box uses the video's aspect ratio (256/209) so the
// clip is never cropped or letterboxed. Override top,left,width via
// NEXT_PUBLIC_BIRTHDAY_SCREEN = "top,left,width".
const DEFAULT_SCREEN = { top: 1, left: 44, width: 42 };
const VIDEO_ASPECT = '256 / 209';

// The truck surround photo, hosted on the CDN. Override via env for dev.
const TRUCK_IMG =
  process.env.NEXT_PUBLIC_BIRTHDAY_TRUCK_IMG || 'https://kool.b-cdn.net/sp.png';

// To make the video look like it sits IN the cargo bed, a second copy of the
// same photo is layered on top, clipped to only its lower strip (the near bed
// wall). Because it's the identical, pixel-aligned image, the wall lines up and
// occludes the bottom of the screen. FG_CLIP_TOP = % down the image where that
// foreground strip begins; override via NEXT_PUBLIC_BIRTHDAY_FG.
const FG_CLIP_TOP = Number(process.env.NEXT_PUBLIC_BIRTHDAY_FG) || 62;

function parseScreen(s: string | undefined) {
  if (!s) return DEFAULT_SCREEN;
  const [top, left, width] = s.split(',').map((n) => Number(n.trim()));
  return {
    top: top || DEFAULT_SCREEN.top,
    left: left || DEFAULT_SCREEN.left,
    width: width || DEFAULT_SCREEN.width,
  };
}

const SCREEN = parseScreen(process.env.NEXT_PUBLIC_BIRTHDAY_SCREEN);

export function HaflingerFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full">
      {/* Banner */}
      <div className="relative z-30 mx-auto mb-2 w-fit">
        <span
          className="block rounded-full px-6 py-2 font-serif text-xl sm:text-3xl text-white"
          style={{
            background: 'linear-gradient(180deg,#74824a,#454f29)',
            boxShadow:
              '0 4px 0 #2f3619, 0 6px 14px rgba(0,0,0,0.45), inset 0 2px 2px rgba(255,255,255,0.25)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          🎉 HAPPY 40<sup>th</sup> 🎉
        </span>
      </div>

      <div className="relative">
        {/* Layer 1: the full photo (background). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TRUCK_IMG}
          alt="Birthday truck"
          className="block w-full select-none rounded-xl"
          draggable={false}
        />

        {/* Layer 2: the retro screen, sitting on top of the background photo. */}
        <div
          className="absolute overflow-hidden bg-black [&>*]:h-full [&>*]:w-full [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:object-fill"
          style={{
            top: `${SCREEN.top}%`,
            left: `${SCREEN.left}%`,
            width: `${SCREEN.width}%`,
            aspectRatio: VIDEO_ASPECT,
            borderRadius: '4px',
            border: '3px solid #1a1a12',
            boxShadow:
              'inset 0 0 26px 8px rgba(0,0,0,0.85), 0 6px 16px rgba(0,0,0,0.6)',
          }}
        >
          {children}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 80% at 25% 10%, rgba(255,255,255,0.12), rgba(255,255,255,0) 45%)',
            }}
          />
        </div>

        {/* Layer 3 (foreground): the SAME photo again, pixel-aligned, but clipped
            to only its lower strip. This near bed-wall sits OVER the screen so
            the video appears tucked down inside the cargo bed. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TRUCK_IMG}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 block w-full select-none rounded-xl"
          draggable={false}
          style={{
            clipPath: `inset(${FG_CLIP_TOP}% 0 0 0)`,
            WebkitClipPath: `inset(${FG_CLIP_TOP}% 0 0 0)`,
          }}
        />
      </div>
    </div>
  );
}
