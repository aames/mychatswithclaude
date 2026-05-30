// Generator for the social share card (public/og.png).
//
// This file is intentionally OUTSIDE app/ (and excluded from tsconfig) so it is
// not treated as a Next.js route — a live `app/opengraph-image.tsx` route would
// add a second, duplicate og:image tag to the home page. The card is shipped as
// a static asset instead (public/og.png), referenced from metadata.
//
// To regenerate after changing the logo/wording:
//   1. cp scripts/og-image.tsx app/opengraph-image.tsx
//   2. npm run build
//   3. cp out/opengraph-image public/og.png
//   4. rm app/opengraph-image.tsx
//
// Note: it loads Georgia from the local macOS font path; adjust GEORGIA if you
// run this elsewhere.

import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { SITE_NAME } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE_NAME} — real conversations with Claude`;
export const dynamic = 'force-static';

const PAPER = '#FAF9F5';
const INK = '#1F1E1D';
const CLAY = '#C96442';
const MUTED = '#8C8A82';

// Georgia is the site's serif fallback (Source Serif Pro → ui-serif → Georgia).
const GEORGIA = '/System/Library/Fonts/Supplemental/Georgia.ttf';

// The site logo (see components/ClaudeLogo.tsx): a bare clay sunburst, 11 rays
// of slightly varying length — no background tile, matching the page header.
const RAYS = [44, 40, 44, 42, 45, 41, 44, 43, 45, 40, 44];
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">${RAYS.map(
  (len, i) =>
    `<rect x="-2.4" y="${-len}" width="4.8" height="${len - 6}" rx="2.4" fill="${CLAY}" transform="rotate(${(i * 360) / RAYS.length})"/>`,
).join('')}</svg>`;

export default function OpengraphImage() {
  const logo = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString('base64')}`;
  const georgia = readFileSync(GEORGIA);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: PAPER,
          fontFamily: 'Georgia',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={96} height={96} alt="" />
          <div style={{ fontSize: 84, color: INK, letterSpacing: '-0.01em' }}>
            {SITE_NAME}
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: MUTED }}>
          Real conversations with Claude, Anthropic’s AI assistant
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            fontSize: 26,
            color: CLAY,
          }}
        >
          mychatswithclaude.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Georgia', data: georgia, weight: 400, style: 'normal' }],
    },
  );
}
