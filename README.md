# mychatswithclaude.com

An unofficial fan archive of conversations with Claude, styled like claude.ai.

## Adding a new chat

1. Create a new file in `chats/` named `your-slug.md` (kebab-case — this becomes the URL).
2. Add frontmatter and message blocks:

```markdown
---
title: "Title of the chat"
date: "2026-05-29T20:45:00"
summary: "One-line teaser shown on the home page and chat header."
---

## User

Whatever I said to Claude.

## Assistant

Whatever Claude said back. Markdown is supported — **bold**, lists, `code`, etc.

## User

Follow-up message.

## Assistant

Follow-up reply.
```

3. Commit and push — Vercel will redeploy automatically.

The site sorts chats by `date` (newest first).

## Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at https://vercel.com/new.
3. In the Vercel project's Domains settings, add `mychatswithclaude.com` and follow their DNS instructions at your registrar.

The site is configured for static export (`output: 'export'` in `next.config.js`), so it also works on Netlify, GitHub Pages, Cloudflare Pages, or anywhere that serves static files (`npm run build` → output in `out/`).

## Disclaimer

This site is not affiliated with or endorsed by Anthropic. "Claude" is a trademark of Anthropic, PBC.
