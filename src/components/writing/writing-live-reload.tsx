"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Dev-only: refreshes the page when an article or cover image changes on disk.
 * Renders nothing and is a no-op in production builds.
 */
export default function WritingLiveReload() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const source = new EventSource("/dev/writing-watch");
    source.onmessage = () => router.refresh();
    return () => source.close();
  }, [router]);

  return null;
}
