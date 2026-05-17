/** Briefings older than this are dropped at ingest (freshness gate). */
export const MAX_BRIEFING_AGE_HOURS = 72;

/** KV / edge payload older than this triggers a live re-ingest on read. */
export const STALE_PAYLOAD_MAX_AGE_HOURS = 4;

/**
 * API + Next cache TTL (seconds) — keep in sync with cron cadence.
 * Route/page `export const revalidate` must use literal `1800` (Next.js build constraint).
 */
export const NEWSROOM_CACHE_SECONDS = 1800;

/** Vercel KV TTL (seconds) — slightly longer than cron interval. */
export const NEWSROOM_KV_TTL_SECONDS = 60 * 60 * 5;
