import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { appRouter } from "@/server";
import { chatRoutes } from "@/server/routes/chat";
import { createTRPCContext } from "@/server/trpc";

// Streaming chat shouldn't be cut short.
export const runtime = "nodejs";
export const maxDuration = 60;

const app = new Hono().basePath("/api");

app.route("/chat", chatRoutes);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createTRPCContext(c.req.raw.headers),
  })
);

export const GET = handle(app);
export const POST = handle(app);
