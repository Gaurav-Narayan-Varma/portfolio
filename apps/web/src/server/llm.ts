import OpenAI from "openai";

let client: OpenAI | undefined;

/**
 * Vercel AI Gateway exposes an OpenAI-compatible API, so we reuse the OpenAI
 * SDK pointed at the gateway and authenticated with AI_GATEWAY_API_KEY.
 * Which models can be used is decided by the allowlist in `lib/chat-models.ts`.
 *
 * Lazily constructed so that importing this module (e.g. while Next.js
 * collects route data at build time) doesn't require the env var.
 */
export function getLLM() {
  client ??= new OpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: "https://ai-gateway.vercel.sh/v1",
  });
  return client;
}
