---
name: add-chat
description: Add a new chat to the "My Chats With Claude" archive. Use whenever the user wants to save, add, or publish a conversation/chat to this site (e.g. "new chat: ...", "add this as a chat", "save this chat"). Creates a single Markdown file in chats/ in the exact required format — NEVER HTML.
---

# Add a chat

This site stores every chat as **one Markdown file** in `chats/`. Your job is to
create that file correctly. Do not create HTML, folders, or `index.html` — see
[CLAUDE.md](../../../CLAUDE.md).

## Steps

1. **Pick a slug.** Kebab-case, short, descriptive. It becomes the filename and
   the URL: `chats/<slug>.md` → `/chats/<slug>`. Check it isn't already taken
   (`ls chats/`).

2. **Write `chats/<slug>.md`** in exactly this format:

   ```markdown
   ---
   title: "Human-readable title — usually the question"
   date: "<ISO timestamp, e.g. 2026-05-30T17:30:00>"
   summary: "One-line teaser. Mention Claude naturally — it's the meta description."
   ---

   ## User

   What the user asked.

   ## Assistant

   Claude's reply. Markdown supported: **bold**, lists, `code`, links.
   ```

   - Only `title`, `date`, `summary` go in frontmatter. No `slug`/`excerpt`/etc.
   - Use today's date (an ISO timestamp with a time — sorting is by `date`).
   - Delimit turns with lines that are exactly `## User` / `## Assistant`,
     alternating. The parser ([lib/chats.ts](../../../lib/chats.ts)) relies on this.

3. **Verify it builds:** run `npm run build` and confirm
   `out/chats/<slug>.html` was generated (the build turns the `.md` into HTML —
   you never write HTML yourself).

4. **Commit** (only if the user wants): `add <slug> chat`.

## Hard rules

- ✅ One `.md` file in `chats/`, frontmatter + `## User`/`## Assistant` blocks.
- ❌ No `.html` files, no `chats/<slug>/index.html`, no hand-written markup.
- ❌ Don't add frontmatter keys the parser ignores.
- SEO (metadata, JSON-LD, sitemap, OG image) is automatic — adding the `.md`
  file is all that's needed.
