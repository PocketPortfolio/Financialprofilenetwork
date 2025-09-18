// /api/_cors.js
// Hardened CORS for Node (used by /api/search.js, /api/fx.js, etc.)
// + simple in-memory token bucket per IP (dev-friendly; replace with Redis in prod if desired)

const ALLOWED = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
// always include same-origin dev URLs to keep DX smooth
const DEV_DEFAULTS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];
const ALLOWLIST = new Set([...DEV_DEFAULTS, ...ALLOWED]);

// very small in-memory limiter (per minute)
const BUCKETS = new Map(); // key -> { start:number, count:number }
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const MAX_REQS   = parseInt(process.env.RATE_LIMIT_MAX_PER_MIN || '60', 10);

function pickOrigin(req) {
  const o = req.headers.origin || req.headers.Origin;
  if (o && ALLOWLIST.has(o)) return o;
  // If no Origin (same-origin fetch) we allow no CORS header
  return null;
}

function checkRate(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '0.0.0.0';
  const now = Date.now();
  const b = BUCKETS.get(ip) || { start: now, count: 0 };
  if (now - b.start > WINDOW_MS) { b.start = now; b.count = 0; }
  b.count += 1;
  BUCKETS.set(ip, b);
  const limited = b.count > MAX_REQS;
  const reset = b.start + WINDOW_MS;
  return { limited, remaining: Math.max(0, MAX_REQS - b.count), reset };
}

export function withCors(handler) {
  return async (req, res) => {
    const origin = pickOrigin(req);
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const { limited, remaining, reset } = checkRate(req);
    res.setHeader('X-RateLimit-Limit', String(MAX_REQS));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(reset / 1000)));
    if (limited) return res.status(429).json({ error: 'rate_limited' });

    try {
      return await handler(req, res);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'server_error' });
    }
  };
}
