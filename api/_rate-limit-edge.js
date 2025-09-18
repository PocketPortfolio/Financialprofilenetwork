// /api/_rate-limit-edge.js
// Minimal, Edge-runtime friendly token bucket in memory per IP.
// For real production scale, wire Upstash Redis. This works immediately.

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const MAX_REQS  = parseInt(process.env.RATE_LIMIT_MAX_PER_MIN || '120', 10);

// Edge functions can keep some memory per region
const buckets = new Map(); // key -> { start:number, count:number }

export function clientIpFromRequest(req) {
  const xf = req.headers.get('x-forwarded-for') || '';
  return xf.split(',')[0].trim() || '0.0.0.0';
}

export function rateLimit(req, bucket = 'global') {
  const ip = clientIpFromRequest(req);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const b = buckets.get(key) || { start: now, count: 0 };
  if (now - b.start > WINDOW_MS) { b.start = now; b.count = 0; }
  b.count += 1;
  buckets.set(key, b);
  const limited = b.count > MAX_REQS;
  const remaining = Math.max(0, MAX_REQS - b.count);
  const reset = b.start + WINDOW_MS;
  return { limited, remaining, reset, limit: MAX_REQS };
}
