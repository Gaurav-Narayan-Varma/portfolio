---
title: "Hello, world: how this blog works"
description: "A sample post showing how articles are written in markdown and published from the codebase."
date: 2026-10-12
category: Meta
image: /writing/hello-world.jpg
draft: true
---

This is a sample post. Every article on this site is a plain markdown file that lives in the repo, so publishing is just a commit.

## How it works

Each file in `content/writing/` becomes a page. The filename is the URL, so this post lives at `/writing/hello-world`. The block at the very top of the file (the frontmatter) holds the title, description, date and category.

## What you can write

Standard markdown works, including **bold**, _italic_, `inline code` and [links](https://nextjs.org).

- Bullet lists for quick points
- Numbered lists for steps
- Tables, quotes and code blocks

> Quotes get a subtle left border, handy for callouts or pulling out a key idea.

### Code blocks

```ts
type Article = {
  title: string;
  date: string;
};

export function latest(articles: Article[]) {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date))[0];
}
```

### Tables

| Field         | Required | Purpose                          |
| ------------- | -------- | -------------------------------- |
| `title`       | yes      | Heading and browser tab title    |
| `description` | yes      | List page and link previews      |
| `date`        | yes      | Sorting, shown as `YYYY-MM-DD`   |
| `category`    | no       | Tag shown next to the date       |
| `draft`       | no       | Set to `true` to hide the post   |

## Next steps

Delete this file, or copy it to `content/writing/my-first-post.md` and replace the content with your own.
