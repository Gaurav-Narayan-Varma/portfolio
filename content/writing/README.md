# Writing

Each `.md` file in this folder becomes an article on `/writing`.
The filename is the URL: `my-first-post.md` -> `/writing/my-first-post`.

## Add an article

Create `content/writing/your-slug.md`:

```md
---
title: "Your article title"
description: "One or two sentences shown in the list and in link previews."
date: 2026-10-12
category: Engineering
image: /writing/your-slug.jpg
---

Your article body in markdown...
```

| Field         | Required | Notes                                                       |
| ------------- | -------- | ----------------------------------------------------------- |
| `title`       | yes      |                                                             |
| `description` | yes      | Subtitle, meta description and social cards. Inline markdown like `_italic_` works in the subtitle (stripped for meta tags) |
| `date`        | yes      | `YYYY-MM-DD`. Articles are sorted newest first              |
| `category`    | no       | Shown as a tag once `SHOW_CATEGORIES` is turned on in `src/lib/writing.ts` (hidden for now). Defaults to `General` |
| `image`       | no       | Cover image path, e.g. `/writing/cover.jpg` (file in `public/writing/`). 16:9 works best. Falls back to a placeholder |
| `imageCaption`| no       | Caption shown below the cover image on the article page (e.g. a photo credit) |
| `proof`       | no       | Link (YouTube, Twitch VOD, etc.) to an unedited recording of you writing it. Adds a "Written live" badge |
| `externalUrl` | no       | Card links straight to this URL (e.g. a piece published elsewhere) and no page is created; the body can be empty |
| `source`      | no       | Publication name shown on an external card, e.g. `Financial Times` |
| `draft`       | no       | `true` hides the article from the site, list and sitemap    |

Supported markdown: headings (`##`, `###`), lists, links, images (put files in
`public/` and reference them as `/writing/my-image.png`), blockquotes, code
blocks, tables and other GitHub-flavored markdown. Use `##` for section
headings; the article title is already rendered as the page heading.

This file is ignored by the site. After publishing, run `pnpm pc:index` so
GauravGPT learns about the new article.

## Fetch a cover photo automatically

Instead of sourcing an image by hand, pull a free stock photo:

```sh
pnpm writing:cover my-slug "laptop on wooden desk" --list   # preview matches
pnpm writing:cover my-slug "laptop on wooden desk" --pick 3 # use match #3
pnpm writing:cover my-slug "laptop on wooden desk"          # use the best match
```

This saves `public/writing/my-slug.jpg` and sets `image:` in the article's
frontmatter. Commit both. The photo is downloaded once, so the site never calls
an image API at build or run time.

Add a free API key to `.env` (if both are set, Unsplash is used; force
one with `--provider pixabay`):

| Provider | Env var                | Get a key                          | Notes                          |
| -------- | ---------------------- | ---------------------------------- | ------------------------------ |
| Unsplash | `UNSPLASH_ACCESS_KEY`  | https://unsplash.com/developers    | Best quality, editorial look   |
| Pixabay  | `PIXABAY_API_KEY`      | https://pixabay.com/api/docs/      | Key is issued instantly        |
