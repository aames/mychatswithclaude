'use client';

import type { ReactNode } from 'react';

// A retro CRT television bezel that wraps the player content. Pure CSS: a chunky
// moulded-plastic shell, an inset curved-glass screen with vignette + scanlines,
// a power LED, and a little brand plate. The children (the pixel canvas) sit
// inside the "glass".
export function CrtFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative" style={{ perspective: '1400px' }}>
      {/* Plastic shell */}
      <div
        className="relative rounded-[2.5rem] p-5 sm:p-8"
        style={{
          background:
            'linear-gradient(145deg, #4a4036 0%, #2e2823 45%, #1c1813 100%)',
          boxShadow:
            '0 40px 90px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -6px 18px rgba(0,0,0,0.6)',
          border: '2px solid #0c0a08',
        }}
      >
        {/* Screen bezel (dark inner frame around the glass) */}
        <div
          className="relative rounded-[1.6rem] p-3 sm:p-4"
          style={{
            background:
              'linear-gradient(160deg, #15120e, #06060a 60%, #000 100%)',
            boxShadow:
              'inset 0 0 30px rgba(0,0,0,0.9), inset 0 0 6px rgba(0,0,0,1)',
          }}
        >
          {/* The curved glass: content + overlays clipped to a rounded rect */}
          <div
            className="relative overflow-hidden rounded-[1.1rem] bg-black flex items-center justify-center"
            style={{
              boxShadow:
                'inset 0 0 120px 30px rgba(0,0,0,0.95), inset 0 0 30px rgba(0,0,0,0.9)',
            }}
          >
            {/* Slight barrel-curve on the picture */}
            <div
              style={{
                transform: 'scale(1.01)',
                filter: 'saturate(1.15) contrast(1.05)',
              }}
            >
              {children}
            </div>

            {/* Scanlines */}
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-25 mix-blend-multiply"
              style={{
                background:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.55) 3px, rgba(0,0,0,0) 4px)',
              }}
            />
            {/* Aperture-grille RGB shimmer */}
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-10"
              style={{
                background:
                  'repeating-linear-gradient(90deg, rgba(255,0,0,0.6) 0px, rgba(0,255,0,0.6) 1px, rgba(0,0,255,0.6) 2px, rgba(0,0,0,0) 3px)',
              }}
            />
            {/* Glass glare highlight */}
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                background:
                  'radial-gradient(120% 80% at 25% 10%, rgba(255,255,255,0.10), rgba(255,255,255,0) 45%)',
              }}
            />
            {/* Screen-edge vignette */}
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                boxShadow: 'inset 0 0 140px 50px rgba(0,0,0,0.85)',
              }}
            />
          </div>
        </div>

        {/* Control strip: brand plate, power LED, faux knobs */}
        <div className="mt-4 flex items-center justify-between px-2">
          <span
            className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-amber-200/60 select-none"
            style={{ textShadow: '0 1px 0 rgba(0,0,0,0.8)' }}
          >
            FRIDAY-TRON 2600
          </span>
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #b6ff8a, #2bd40e 60%, #0a5e02)',
                boxShadow: '0 0 8px 2px rgba(60,255,60,0.7)',
              }}
            />
            <span className="hidden sm:flex gap-2">
              <Knob />
              <Knob />
            </span>
          </div>
        </div>
      </div>

      {/* Stand / feet */}
      <div className="mx-auto h-3 w-1/3 rounded-b-xl bg-[#14110d] shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function Knob() {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full"
      style={{
        background: 'radial-gradient(circle at 35% 30%, #6b5d4c, #2a241d 70%)',
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.8)',
      }}
    />
  );
}
