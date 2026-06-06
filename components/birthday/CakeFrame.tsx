'use client';

import type { ReactNode } from 'react';

// A round-style Aussie chocolate-biscuit cake that wraps the player (the
// /birthday analogue of CrtFrame): a "fence" of chocolate-biscuit fingers
// standing up around the screen (alternating milk/dark coating), a whipped-cream
// top strewn with chocolate shards, a piped "HAPPY 40th" banner and number
// candles. Pure CSS/emoji — a generic choc-biscuit look, not any brand's trade
// dress.
export function CakeFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative z-30 mx-auto mb-1 w-fit">
        <span
          className="block rounded-full px-6 py-2 font-serif text-xl sm:text-3xl text-white"
          style={{
            background: 'linear-gradient(180deg,#7b4a2b,#5a3420)',
            boxShadow:
              '0 4px 0 #3d2316, 0 6px 14px rgba(0,0,0,0.45), inset 0 2px 2px rgba(255,255,255,0.25)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          🎉 HAPPY 40<sup>th</sup> 🎉
        </span>
      </div>

      {/* Candles poking out of the cream */}
      <div className="relative z-30 flex items-end justify-center gap-10 sm:gap-16">
        <Candle digit="4" />
        <Candle digit="0" />
      </div>

      {/* Cream top with chocolate shards */}
      <div
        className="relative z-20 -mb-3 mx-1 h-7 sm:h-9 rounded-t-[1.2rem]"
        style={{
          background:
            'linear-gradient(180deg,#fffaf2 0%,#f3e7d6 65%,#e7d4bd 100%)',
          boxShadow:
            'inset 0 3px 4px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.2)',
        }}
      >
        {/* mounded cream blobs */}
        <div
          className="absolute inset-x-2 -top-2 flex justify-between"
          aria-hidden
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="h-4 w-5 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 40% 30%,#fffaf2,#ecddc8)',
              }}
            />
          ))}
        </div>
        {/* scattered choc shards */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs sm:text-sm select-none">
          <span>🍫</span>
          <span className="rotate-12">🍫</span>
          <span className="-rotate-6">🍫</span>
          <span className="rotate-3">🍫</span>
        </div>
      </div>

      {/* Screen framed by a fence of biscuit fingers */}
      <div
        className="relative flex items-stretch gap-1 rounded-b-[0.8rem] px-1 pb-1"
        style={{
          background: 'linear-gradient(180deg,#3a2113,#2a1810)',
          boxShadow: '0 28px 60px rgba(0,0,0,0.55)',
        }}
      >
        <FingerColumn count={3} />

        <div className="relative my-1 flex-1">
          <div
            className="relative overflow-hidden rounded-[0.5rem] bg-black flex items-center justify-center"
            style={{
              boxShadow:
                'inset 0 0 60px 14px rgba(0,0,0,0.9), 0 0 0 3px #1c1009',
            }}
          >
            <div style={{ filter: 'saturate(1.12) contrast(1.04)' }}>
              {children}
            </div>
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                background:
                  'radial-gradient(120% 80% at 25% 10%, rgba(255,255,255,0.10), rgba(255,255,255,0) 45%)',
              }}
            />
          </div>
        </div>

        <FingerColumn count={3} />
      </div>

      {/* Front row of biscuit fingers (the cake's near edge) */}
      <div
        className="relative z-10 -mt-1 flex justify-center gap-1 rounded-b-[0.6rem] px-2 pb-1"
        style={{ background: 'linear-gradient(180deg,#2a1810,#21130b)' }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <Finger key={i} dark={i % 2 === 0} short />
        ))}
      </div>

      {/* Aussie fauna */}
      <div className="relative z-10 mt-3 flex items-end justify-between px-2 text-2xl sm:text-3xl select-none">
        <span title="kangaroo">🦘</span>
        <span title="koala">🐨</span>
        <span className="font-serif text-sm sm:text-base text-[#d9b38c]">
          G&rsquo;DAY MATE
        </span>
        <span title="crocodile">🐊</span>
        <span title="emu">🦤</span>
      </div>

      {/* Plate */}
      <div className="mx-auto mt-1 h-3 w-[112%] -ml-[6%] rounded-[2rem] bg-gradient-to-b from-[#23242a] to-[#0e0f12] shadow-[0_16px_26px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

// A vertical stack that fills the screen height with side-wall fingers.
function FingerColumn({ count }: { count: number }) {
  return (
    <div className="flex flex-col justify-stretch gap-1 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <Finger key={i} dark={i % 2 === 1} grow />
      ))}
    </div>
  );
}

// A single chocolate-coated biscuit finger.
function Finger({
  dark,
  grow,
  short,
}: {
  dark?: boolean;
  grow?: boolean;
  short?: boolean;
}) {
  const milk = 'linear-gradient(90deg,#8a5a32 0%,#a06c3f 45%,#7a4a28 100%)';
  const darkChoc = 'linear-gradient(90deg,#3a2415 0%,#4a2f1c 45%,#2c1a0f 100%)';
  return (
    <div
      className={[
        'rounded-[3px]',
        grow ? 'flex-1' : '',
        short ? 'h-7 sm:h-9' : '',
      ].join(' ')}
      style={{
        width: short ? '1.15rem' : '1.35rem',
        minHeight: grow ? '2.2rem' : undefined,
        background: dark ? darkChoc : milk,
        // hammered/glazed sheen + ridges
        boxShadow:
          'inset 0 0 0 1px rgba(0,0,0,0.35), inset 2px 0 3px rgba(255,255,255,0.18), inset -2px 0 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
        backgroundBlendMode: 'overlay',
      }}
      aria-hidden
    />
  );
}

function Candle({ digit }: { digit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="mb-0.5 h-4 w-3 rounded-full animate-pulse"
        style={{
          background:
            'radial-gradient(circle at 50% 70%, #fff6a8 0%, #ffb000 45%, #ff5a00 80%)',
          boxShadow: '0 0 12px 4px rgba(255,160,0,0.7)',
        }}
      />
      <span
        className="flex h-9 w-6 items-center justify-center rounded-sm font-bold text-white sm:h-11 sm:w-7"
        style={{
          background:
            'repeating-linear-gradient(180deg,#ffd23f 0 5px,#ffb703 5px 10px)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        }}
      >
        {digit}
      </span>
    </div>
  );
}
