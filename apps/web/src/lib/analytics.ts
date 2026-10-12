"use client";

import posthog from "posthog-js";

/**
 * Sends a custom event to PostHog from client code. A no-op when analytics is
 * off (no key, e.g. local dev). For plain clicks prefer a `data-track`
 * attribute, see src/instrumentation-client.ts.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (posthog.__loaded) posthog.capture(event, properties);
}
