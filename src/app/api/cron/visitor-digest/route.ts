import { timingSafeEqual } from "node:crypto";
import { sendVisitorDigests } from "@/server/visitor-digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Called on a schedule (every ~15 min) to email summaries of finished visits.
 * Requires `Authorization: Bearer $CRON_SECRET`; Vercel Cron sends this
 * automatically when CRON_SECRET is set, and the GitHub workflow does too.
 */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json(await sendVisitorDigests());
  } catch (error) {
    console.error("[visitor-digest] run failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
