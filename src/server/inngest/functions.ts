import { inngest } from "./client";
import { sendVisitorDigests } from "@/server/visitor-digest";

/**
 * Emails a summary of each finished site visit (src/server/visitor-digest.ts).
 * Runs every 15 minutes. Safe to retry or run twice: each visit is claimed in
 * Redis before its email goes out, so nothing is ever sent twice, and the 6 hour
 * lookback means a missed run is caught up by the next one.
 *
 * To run it on demand, use "Invoke" on the function in the Inngest dashboard.
 */
export const visitorDigest = inngest.createFunction(
  {
    id: "visitor-digest",
    triggers: [{ cron: "*/15 * * * *" }],
    retries: 2,
  },
  async ({ step }) => {
    return step.run("send-visitor-digests", () => sendVisitorDigests());
  }
);

export const functions = [visitorDigest];
