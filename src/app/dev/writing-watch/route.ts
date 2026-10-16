import fs from "node:fs";
import path from "node:path";

/**
 * Dev-only server-sent events stream that fires whenever an article or its
 * cover image changes on disk. Articles are read with `fs` rather than
 * imported, so the bundler's HMR doesn't see them; `<WritingLiveReload />`
 * listens to this stream and refreshes the page instead.
 */
export const dynamic = "force-dynamic";

const WATCHED_DIRS = ["content/writing", "public/writing"].map((dir) =>
  path.join(process.cwd(), dir)
);

export function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const watchers: fs.FSWatcher[] = [];
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const cleanup = () => {
    watchers.forEach((watcher) => watcher.close());
    watchers.length = 0;
    if (heartbeat) clearInterval(heartbeat);
  };

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      let debounce: ReturnType<typeof setTimeout> | undefined;
      const onChange = () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => send("data: change\n\n"), 100);
      };

      for (const dir of WATCHED_DIRS) {
        if (!fs.existsSync(dir)) continue;
        watchers.push(fs.watch(dir, onChange));
      }

      send("retry: 1000\n\n");
      heartbeat = setInterval(() => send(": keep-alive\n\n"), 15_000);

      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {}
      });
    },
    cancel: cleanup,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
