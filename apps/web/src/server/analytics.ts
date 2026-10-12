import { createHash } from "node:crypto";
import { after } from "next/server";
import { PostHog } from "posthog-node";

/**
 * Server-side PostHog capture for GauravGPT.
 *
 * - Enabled only when POSTHOG_API_KEY (the project key, `phc_...`) is set;
 *   otherwise every call is a no-op, so local dev needs no configuration.
 * - Events are sent from the server, so ad blockers can't drop them.
 * - Visitors are anonymous: no person profiles, no GeoIP, and the distinct id
 *   is a salted hash of the IP that rotates daily (good for counting unique
 *   visitors per day, useless for tracking anyone across days).
 */

let client: PostHog | null | undefined;

function getClient() {
  if (client !== undefined) return client;
  const key = process.env.POSTHOG_API_KEY;
  client = key
    ? new PostHog(key, {
        host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
        // Serverless: don't batch, we send each event explicitly.
        flushAt: 1,
        flushInterval: 0,
      })
    : null;
  return client;
}

/** Anonymous per-day visitor id derived from the IP. */
export function visitorId(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${day}:${ip}:${process.env.POSTHOG_API_KEY ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Fire-and-forget. The send starts immediately (so it still goes out when the
 * visitor has already disconnected); `after()` just keeps the serverless
 * function alive until it settles.
 */
export function track(
  event: string,
  distinctId: string,
  properties: Record<string, unknown>
) {
  const posthog = getClient();
  if (!posthog) return;

  const pending = posthog
    .captureImmediate({
      distinctId,
      event,
      properties: { ...properties, $process_person_profile: false },
      disableGeoip: true,
    })
    .catch((error) => {
      console.error("[analytics] PostHog capture failed:", error);
    });

  try {
    after(() => pending);
  } catch {
    // Outside a request scope: the promise above is already running.
  }
}
