# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**My Chats With Claude** — a parody/fan archive of conversations with Claude,
styled to look like claude.ai. It is a **Next.js (App Router) static site**
(`output: 'export'`), deployed on **Vercel** at **mychatswithclaude.com**.

It is not affiliated with Anthropic (see the disclaimer in the README/footer).

## ⚠️ The one rule that matters most: chats are MARKDOWN, never HTML

Every chat is a single **Markdown file** in [chats/](chats/). They are parsed at
build time by [lib/chats.ts](lib/chats.ts) and rendered by React components.

**Do NOT create `.html` files, `chats/<slug>/index.html`, or hand-written
markup for a chat.** There is no per-chat HTML — the HTML in `out/` is generated
by the build. Adding a chat means adding *one `.md` file* in the exact format
below. Nothing else.

When the user asks to "add a new chat", use the [add-chat](.claude/skills/add-chat/SKILL.md)
skill (`/add-chat`).

## Chat file format

Filename: `chats/<slug>.md` where `<slug>` is **kebab-case** and becomes the
URL (`/chats/<slug>`). Match the existing files for tone/structure.

```markdown
---
title: "A human-readable title — usually the question"
date: "2026-05-30T17:30:00"
summary: "One-line teaser shown on the home page and used as the meta description."
---

## User

What the user said to Claude.

## Assistant

Claude's reply. Markdown is supported — **bold**, lists, `code`, etc.

## User

Optional follow-up.

## Assistant

Optional follow-up reply.
```

Rules enforced by the parser ([lib/chats.ts](lib/chats.ts)) and conventions:

- Frontmatter keys: `title`, `date`, `summary`. `date` is an **ISO timestamp**
  (include the time — chats sort newest-first by `date`, with a title tiebreaker).
- Messages are delimited by lines that are exactly `## User` or `## Assistant`
  (case-insensitive). Anything else is body content. Keep the alternating order.
- `slug`/`excerpt`/other keys are **not** read — don't invent fields.
- For SEO, it helps to mention "Claude" naturally in the `summary`.

## SEO (already wired — keep it intact when adding chats)

Adding a correctly-formatted `.md` file is enough; SEO is automatic:

- [lib/site.ts](lib/site.ts) — site URL, name, keywords, `OG_IMAGE`, `absoluteUrl()`.
- [app/layout.tsx](app/layout.tsx) — site-wide metadata (title, OG/Twitter, robots).
- [app/chats/[slug]/page.tsx](app/chats/%5Bslug%5D/page.tsx) — per-chat
  `generateMetadata` (title/description/canonical/OG/Twitter) + JSON-LD
  (`QAPage` + `Article`).
- [app/sitemap.ts](app/sitemap.ts) / [app/robots.ts](app/robots.ts) — crawlability.
- Canonical/sitemap URLs have **no trailing slash** (matches the export).

### Social share image

The share card is a **static** file: [public/og.png](public/og.png) (1200×630,
based on the site's clay sunburst logo). To regenerate it, restore a temporary
`app/opengraph-image.tsx` route (see git history of commit `ac77bc2` for the
generator), run `npm run build`, then `cp out/opengraph-image public/og.png` and
delete the route again.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → out/
```

## Conventions

- Commit message for a new chat: `add <slug> chat`.
- Only commit/push when asked. Don't commit build artifacts (`out/`, `.next/`
  are gitignored).
- After adding a chat, a quick `npm run build` confirms it parses and exports.

## Tech stack

Next.js 15 (App Router, static export) · React · TypeScript · Tailwind
(palette in [tailwind.config.ts](tailwind.config.ts): `clay #C96442` accent,
`paper`/`cream`/`ink`) · `gray-matter` for frontmatter.
