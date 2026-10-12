import { type Tool } from "@/types/stackTypes";

/**
 * Logos for the technologies shown on project cards.
 * Reference these from `projectConstants.ts` via `tools.<key>`.
 */
export const tools = {
  nextjs: { name: "Next.js", image: "/logos/nextjs-logo.png" },
  react: { name: "React", image: "/logos/react-logo.svg" },
  typescript: { name: "TypeScript", image: "/logos/typescript-logo.png" },
  tailwind: { name: "Tailwind CSS", image: "/logos/tailwind-logo.png" },
  tanstackQuery: { name: "TanStack Query", image: "/logos/tanstack-logo.jpeg" },
  trpc: { name: "tRPC", image: "/logos/trpc-logo.png" },
  laravel: { name: "Laravel", image: "/logos/laravel-logo.jpg" },
  hono: { name: "Hono", image: "/logos/hono-logo.png" },
  drizzle: { name: "Drizzle ORM", image: "/logos/drizzle-logo.png" },
  neon: { name: "Neon", image: "/logos/neon-logo.png" },
  mastra: { name: "Mastra", image: "/logos/mastra-logo.png" },
  vercel: { name: "Vercel", image: "/logos/vercel-logo.png" },
  vite: { name: "Vite", image: "/logos/vite-logo.png" },
  radix: { name: "Radix UI", image: "/logos/radix-logo.png" },
  postgresql: { name: "PostgreSQL", image: "/logos/postgresql-logo.png" },
  prisma: { name: "Prisma", image: "/logos/prisma-logo.jpg" },
  turborepo: { name: "Turborepo", image: "/logos/turborepo-logo.png" },
  docker: { name: "Docker", image: "/logos/docker-logo.png" },
  render: { name: "Render", image: "/logos/render-logo.jpg" },
  s3: { name: "Amazon S3", image: "/logos/s3-logo.png" },
  stripe: { name: "Stripe", image: "/logos/stripe-logo.png" },
  resend: { name: "Resend", image: "/logos/resend-logo.png", bgWhite: true },
  segment: { name: "Segment", image: "/logos/segment-logo.png" },
} satisfies Record<string, Tool>;
