import { Redis } from "@upstash/redis";

/**
 * Fixed-window counters used to cap abuse and LLM spend.
 *
 * - With UPSTASH_REDIS_REST_URL/TOKEN (or Vercel's KV_REST_API_URL/TOKEN) set,
 *   counters live in Redis and are shared by every serverless instance.
 * - Without them (local dev), or if Redis is unreachable, we fall back to an
 *   in-memory store. That is only per-instance on serverless, so production
 *   should configure Redis for the limits to be reliable.
 */

type Store = {
  incr(key: string, amount: number, ttlSeconds: number): Promise<number>;
};

const memory = new Map<string, { value: number; expiresAt: number }>();

const memoryStore: Store = {
  async incr(key, amount, ttlSeconds) {
    const now = Date.now();

    if (memory.size > 5000) {
      for (const [k, entry] of memory) {
        if (entry.expiresAt <= now) memory.delete(k);
      }
    }

    const entry = memory.get(key);
    const value = (entry && entry.expiresAt > now ? entry.value : 0) + amount;
    memory.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
    return value;
  },
};

let redis: Redis | null | undefined;

function getRedis() {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
  } else {
    redis = null;
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rate-limit] No Redis configured - using in-memory limits, which are only per-instance. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
      );
    }
  }
  return redis;
}

const redisStore: Store = {
  async incr(key, amount, ttlSeconds) {
    const client = getRedis();
    if (!client) return memoryStore.incr(key, amount, ttlSeconds);

    try {
      const pipeline = client.pipeline();
      pipeline.incrby(key, amount);
      pipeline.expire(key, ttlSeconds);
      const [value] = await pipeline.exec<[number, number]>();
      return value;
    } catch (error) {
      console.error("[rate-limit] Redis failed, using in-memory fallback", error);
      return memoryStore.incr(key, amount, ttlSeconds);
    }
  },
};

export type LimitResult = {
  ok: boolean;
  /** Seconds until the current window resets. */
  retryAfter: number;
};

/**
 * Adds `amount` to the counter for the current `windowSeconds` window and
 * reports whether the total is still within `limit`. The attempt counts even
 * when it is rejected, so hammering a limit never gets you more headroom.
 */
export async function consume(
  key: string,
  amount: number,
  limit: number,
  windowSeconds: number
): Promise<LimitResult> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const window = Math.floor(nowSeconds / windowSeconds);
  const retryAfter = (window + 1) * windowSeconds - nowSeconds;

  const total = await redisStore.incr(
    `${key}:${window}`,
    amount,
    windowSeconds + 60
  );

  return { ok: total <= limit, retryAfter };
}

/**
 * Atomically claims `key` for `ttlSeconds`. Returns true for the first caller
 * and false for everyone after, so "do this once" jobs (like emailing a visit
 * summary) can't double-fire. Needs real Redis: an in-memory fallback would
 * be per-instance on serverless and quietly allow duplicates, so this throws.
 */
export async function claimOnce(key: string, ttlSeconds: number) {
  const client = getRedis();
  if (!client) {
    throw new Error("claimOnce needs Redis (UPSTASH_REDIS_REST_URL/TOKEN)");
  }
  const result = await client.set(key, "1", { nx: true, ex: ttlSeconds });
  return result === "OK";
}

/** Undoes `claimOnce`, e.g. when the work it guarded failed and should retry. */
export async function releaseClaim(key: string) {
  await getRedis()?.del(key);
}

/** Best-effort client IP. On Vercel these headers are set by the platform. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
