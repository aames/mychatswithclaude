// Single source of truth for the deployed site URL.
// Custom domain configured via Vercel (see README).
export const SITE_URL = 'https://mychatswithclaude.com';

export const SITE_NAME = 'My Chats With Claude';

export const SITE_DESCRIPTION =
  'A growing collection of real conversations with Claude, Anthropic’s AI assistant — answers, explanations and deep dives across cooking, science, trivia and more.';

// Keywords that help these pages surface when people search for Claude.
export const SITE_KEYWORDS = [
  'Claude',
  'Claude AI',
  'Claude Anthropic',
  'Anthropic',
  'chats with Claude',
  'Claude conversations',
  'Claude AI examples',
  'ask Claude',
];

// Social share card (1200x630). A static PNG in public/, based on the site
// logo. Regenerate with the generator in scripts/og-image.tsx (instructions at
// the top of that file).
export const OG_IMAGE = {
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — real conversations with Claude`,
};

// Build an absolute URL for a given path. The site exports without trailing
// slashes (next.config.js has no `trailingSlash`), so match that here.
export function absoluteUrl(path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `${SITE_URL}/${clean}` : `${SITE_URL}/`;
}
