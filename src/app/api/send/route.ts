import { Resend } from "resend";
import { consume, getClientIp } from "@/server/rate-limit";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Each call sends an email (the contact forms), so cap how many one visitor
// can trigger. Chat questions are covered by the visitor summary email
// instead (src/server/visitor-digest.ts).
const SENDS_PER_HOUR = 20;

export async function POST(req: Request) {
  const limit = await consume(
    `send:${getClientIp(req.headers)}`,
    1,
    SENDS_PER_HOUR,
    60 * 60
  );
  if (!limit.ok) {
    return Response.json(
      { error: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }
    const resend = new Resend(apiKey);

    const { name, email, message } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "gaurav <gaurav@gaurav-v.com>",
      to: ["gaurav.narayan.varma@gmail.com"],
      subject: `New message from ${String(name ?? "").replace(/[\r\n]+/g, " ")}`,
      html: `<p>Name: ${escapeHtml(name)}</p>
      <p>Email: ${escapeHtml(email)}</p>
      <p>Message: ${escapeHtml(message)}</p>`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
