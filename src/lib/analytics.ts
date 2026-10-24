"use client";

import posthog from "posthog-js";

/**
 * Sends a custom event to PostHog from client code. A no-op when analytics is
 * off (no key, e.g. local dev). For plain clicks prefer a `data-track`
 * attribute, see src/instrumentation-client.ts.
 */
/**
 * The current PostHog session id, or undefined when analytics is off. Sent
 * with GauravGPT requests so the server-side question events can be grouped
 * with the rest of the visit (see src/server/visitor-digest.ts).
 */
export function getSessionId(): string | undefined {
  return posthog.__loaded ? posthog.get_session_id() : undefined;
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (posthog.__loaded) posthog.capture(event, properties);
}
