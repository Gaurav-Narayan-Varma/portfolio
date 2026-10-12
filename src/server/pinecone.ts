import { Pinecone } from "@pinecone-database/pinecone";

let client: Pinecone | undefined;

/**
 * Lazily constructed so that importing this module (e.g. while Next.js
 * collects route data at build time) doesn't require the env vars.
 */
export function getPinecone() {
  client ??= new Pinecone({ apiKey: process.env.API_PINECONE_API_KEY! });
  return client;
}

export function getIndex() {
  return getPinecone()
    .index(process.env.API_PINECONE_INDEX_NAME!)
    .namespace(process.env.API_PINECONE_NAMESPACE ?? "ns1");
}
