import { serve } from "inngest/next";
import { inngest } from "@/server/inngest/client";
import { functions } from "@/server/inngest/functions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The digest queries PostHog and sends several emails in one run.
export const maxDuration = 60;

// Inngest calls this endpoint to register the functions and to run them; the
// SDK verifies each request's signature (INNGEST_SIGNING_KEY) in production.
export const { GET, POST, PUT } = serve({ client: inngest, functions });
