/**
 * Browser analytics (PostHog), loaded by Next.js before the app hydrates.
 *
 * - Off unless the project key is set (prod only), so local dev stays clean.
 * - Requests go through our own domain (/ingest, see next.config.ts), so ad
 *   blockers don't drop them.
 * - Page views (incl. client-side navigations), referrer and UTM params are
 *   captured automatically. Autocapture is off; instead, any element with a
 *   `data-track="event_name"` attribute reports a click, e.g.
 *   <a data-track="book_call_clicked" data-track-location="hero">.
 * - Server-side GauravGPT events (src/server/analytics.ts) use a different,
 *   anonymous id, so they aren't linked to these sessions.
 */
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  let lastPageview: string | undefined;

  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24", // page views on history changes (Next.js routing)
    autocapture: false,
    person_profiles: "identified_only", // anonymous events, no profile per visitor
    before_send: (event) => {
      if (!event) return null;

      const url = event.properties?.$current_url;
      if (typeof url === "string") {
        try {
          // The home page composer hands off questions as /chat?q=...
          // Keep them out of page-view URLs (GauravGPT logs them separately).
          const parsed = new URL(url);
          if (parsed.searchParams.has("q")) {
            parsed.searchParams.delete("q");
            parsed.searchParams.delete("model");
            event.properties.$current_url = parsed.toString();
          }
        } catch {
          // leave the URL untouched
        }
      }

      // /chat?q=... is rewritten to /chat right after load, which would
      // otherwise count as a second page view of the same page.
      if (event.event === "$pageview") {
        const current = event.properties?.$current_url;
        if (current === lastPageview) return null;
        lastPageview = current;
      }
      return event;
    },
  });

  document.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-track]"
      );
      const name = el?.dataset.track;
      if (!el || !name) return;
      posthog.capture(name, {
        location: el.dataset.trackLocation,
        label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 80),
      });
    },
    { capture: true }
  );
}
