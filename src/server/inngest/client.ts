import { Inngest } from "inngest";

/**
 * Inngest runs this site's scheduled jobs (see ./functions.ts). It calls back
 * into the app over HTTP at /api/inngest, so there is no cron secret to manage.
 *
 * Production needs INNGEST_SIGNING_KEY (and INNGEST_EVENT_KEY if events are ever
 * sent from code); the Inngest Vercel integration sets both. Locally, set
 * INNGEST_DEV=1 and run `npx inngest-cli@latest dev`; without INNGEST_DEV the
 * /api/inngest route answers 500 ("no signing key"), which is harmless unless
 * you are testing the job.
 */
export const inngest = new Inngest({ id: "portfolio" });
