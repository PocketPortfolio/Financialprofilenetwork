/**
 * Edge-compatible sliding-window rate limit via Vercel KV (REST API).
 * Used by unauthenticated public API routes (waitlist, analytics adjacency).
 */

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

export type KvRateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
};

async function kvIncrWithTtl(key: string, ttlSeconds: number): Promise<number | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  const res = await fetch(`${KV_REST_API_URL}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { result?: number };
  const count = typeof body.result === 'number' ? body.result : null;
  if (count === 1) {
    await fetch(`${KV_REST_API_URL}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
      cache: 'no-store',
    }).catch(() => {});
  }
  return count;
}

/**
 * @param bucket - Namespaced key prefix (e.g. waitlist:join:ip)
 * @param identifier - Hashed IP or email fingerprint
 * @param maxAttempts - Allowed hits within window
 * @param windowSeconds - TTL / window length
 */
export async function checkKvRateLimit(
  bucket: string,
  identifier: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<KvRateLimitResult> {
  if (!identifier) {
    return { allowed: true, remaining: maxAttempts, resetSeconds: windowSeconds };
  }

  const key = `rl:${bucket}:${identifier}`;

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    // Fail open when KV not configured (local dev); production should set KV vars.
    return { allowed: true, remaining: maxAttempts, resetSeconds: windowSeconds };
  }

  const count = await kvIncrWithTtl(key, windowSeconds);
  if (count === null) {
    return { allowed: true, remaining: maxAttempts, resetSeconds: windowSeconds };
  }

  const allowed = count <= maxAttempts;
  return {
    allowed,
    remaining: Math.max(0, maxAttempts - count),
    resetSeconds: windowSeconds,
  };
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
