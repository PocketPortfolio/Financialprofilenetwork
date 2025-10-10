// /api/_health.js — shared provider health store (Edge-safe, Redis optional)
export const config = { runtime: "edge" };

const KEY = "pp:health:price:v1";
const PROVIDERS = ["yahoo", "chart", "stooq"];
const ACTIVE_MS_DEFAULT = 60_000;   // fallback considered active for this window
const PROBE_COOLDOWN_MS = 15_000;   // throttle probing in /api/health-price

// In-memory fallback (per-edge/process)
let mem = null;
function freshMem() {
  const now = Date.now();
  return {
    updatedAt: now,
    lastProbeAt: 0,
    providers: Object.fromEntries(
      PROVIDERS.map((p) => [
        p,
        {
          provider: p,
          lastSuccess: null,
          lastFailure: null,
          failureCount: 0,
          // internal; used to derive activeFallback at read-time
          activeUntil: 0,
        },
      ])
    ),
  };
}

// ------------ Minimal Upstash Redis REST client (optional)
function redisConfigured() {
  return (
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
async function redisGet() {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(
    KEY
  )}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  const raw = j?.result;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function redisSet(obj) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(
    KEY
  )}`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(obj) }),
  }).catch(() => {});
}

// ------------ Load/save
async function load() {
  if (redisConfigured()) {
    const got = await redisGet();
    if (got && got.providers) return got;
  }
  if (!mem) mem = freshMem();
  return mem;
}
async function save(state) {
  state.updatedAt = Date.now();
  if (redisConfigured()) await redisSet(state);
  else mem = state;
}

// ------------ Public API
export async function recordProviderResult(provider, ok) {
  if (!PROVIDERS.includes(provider)) return;
  const st = await load();
  const rec = st.providers[provider] || {
    provider,
    lastSuccess: null,
    lastFailure: null,
    failureCount: 0,
    activeUntil: 0,
  };
  const now = Date.now();
  if (ok) rec.lastSuccess = now;
  else {
    rec.lastFailure = now;
    rec.failureCount = (rec.failureCount || 0) + 1;
  }
  st.providers[provider] = rec;
  await save(st);
}

export async function setActiveFallback(provider, active, activeMs = ACTIVE_MS_DEFAULT) {
  if (!PROVIDERS.includes(provider)) return;
  const st = await load();
  const rec = st.providers[provider] || {
    provider,
    lastSuccess: null,
    lastFailure: null,
    failureCount: 0,
    activeUntil: 0,
  };
  const now = Date.now();
  rec.activeUntil = active ? now + Math.max(1, activeMs) : 0;
  st.providers[provider] = rec;
  await save(st);
}

export async function getPriceHealth() {
  const st = await load();
  const now = Date.now();
  const providers = PROVIDERS.map((p) => {
    const r = st.providers[p] || {};
    return {
      provider: p,
      lastSuccess: r.lastSuccess ?? null,
      lastFailure: r.lastFailure ?? null,
      failureCount: r.failureCount ?? 0,
      activeFallback: Number(r.activeUntil || 0) > now,
    };
  });
  return { providers };
}

// ------------ Probe/throttle helpers (for /api/health-price)
export async function shouldProbe(freshWindowMs = 30_000) {
  const st = await load();
  const now = Date.now();
  const allStaleOrEmpty = Object.values(st.providers).every((r) => {
    const ls = r?.lastSuccess;
    return !ls || now - ls > freshWindowMs;
  });
  const cooledDown = now - (st.lastProbeAt || 0) > PROBE_COOLDOWN_MS;
  return allStaleOrEmpty && cooledDown;
}

export async function markProbed() {
  const st = await load();
  st.lastProbeAt = Date.now();
  await save(st);
}
