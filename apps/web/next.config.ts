import type { NextConfig } from "next";

/**
 * PostHog is called through our own domain (/ingest) instead of
 * us.i.posthog.com, so ad blockers that match on PostHog hostnames don't drop
 * the events. The browser SDK is configured in src/instrumentation-client.ts.
 */
const POSTHOG_HOST = (
  process.env.POSTHOG_HOST ?? "https://us.i.posthog.com"
).replace(/\/$/, "");
// us.i.posthog.com -> us-assets.i.posthog.com (static SDK files)
const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(
  /^(https?:\/\/)([\w-]+)\.i\./,
  "$1$2-assets.i."
);

const nextConfig: NextConfig = {
  env: {
    // Reuse the server's project key (`phc_...`, safe to expose) for the
    // browser. Unset locally, which keeps analytics off in development.
    NEXT_PUBLIC_POSTHOG_KEY: process.env.POSTHOG_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_HOST}/:path*`,
      },
    ];
  },
  // PostHog API requests have trailing slashes; don't redirect them away.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
