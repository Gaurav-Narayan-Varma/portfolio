# Gaurav Varma's portfolio

Source for [gaurav-v.com](https://gaurav-v.com): case studies, writing, and **GauravGPT**, a chat assistant that answers questions about me from this site and my resume.

**Stack:** Next.js 15, Tailwind 4, Hono, Pinecone (retrieval), Vercel AI Gateway (LLM), PostHog, Resend, Upstash Redis.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3001
```

Create a `.env` with `AI_GATEWAY_API_KEY`, `API_PINECONE_API_KEY`, `API_PINECONE_INDEX_NAME` and `RESEND_API_KEY`. Everything else (Redis, PostHog) is optional locally.

## Handy bits

- **Writing:** add a markdown file to `content/writing/` ([format](content/writing/README.md)).
- **GauravGPT's knowledge:** `pnpm pc:index` re-crawls the site into Pinecone. A GitHub Action does this automatically when you push relevant changes.
- **Visit summaries:** a scheduled Action emails me a summary of each finished visit.
