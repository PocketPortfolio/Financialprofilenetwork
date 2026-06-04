/** Branded landing-page product videos (3840px wide, web-optimized H.264). */

export const DASHBOARD_DEMO_FALLBACK = '/dashboard-demo-4k.mp4';
export const DASHBOARD_DEMO_POSTER = '/dashboard-demo-4k-poster.jpg';
export const DASHBOARD_DEMO_BRANDED_VERSION = 'v1780002518';
/** Short stamp for query-string cache busting (no `v` prefix). */
export const DASHBOARD_DEMO_CACHE_BUST = '1780002518';
export const DASHBOARD_DEMO_CDN_DEFAULT = `https://res.cloudinary.com/dknmhvm7a/video/upload/${DASHBOARD_DEMO_BRANDED_VERSION}/pocket-portfolio/dashboard-demo-4k.mp4`;
/** 3840×2098 */
export const DASHBOARD_DEMO_ASPECT_RATIO = '3840 / 2098';

export const POCKET_ANALYST_FALLBACK = '/pocket-analyst-demo.mp4';
export const POCKET_ANALYST_POSTER = '/pocket-analyst-demo-poster.jpg';
/** Action-first trim (~28s). Re-encoded 2026-06-04; Cloudinary v1780578282. */
export const POCKET_ANALYST_BRANDED_VERSION = 'v1780578282';
export const POCKET_ANALYST_CACHE_BUST = '1780578282';
export const POCKET_ANALYST_CDN_DEFAULT = `https://res.cloudinary.com/dknmhvm7a/video/upload/${POCKET_ANALYST_BRANDED_VERSION}/pocket-portfolio/pocket-analyst-demo.mp4`;
/** 3840×2110 */
export const POCKET_ANALYST_ASPECT_RATIO = '3840 / 2110';

/** Prefer env only when it matches the branded Cloudinary version stamp (avoids stale .env.*.local overrides). */
export function resolveBrandedCloudinaryVideoSrc(
  envUrl: string | undefined,
  brandedVersion: string,
  cdnDefault: string,
): string {
  const trimmed = envUrl?.trim();
  if (trimmed && trimmed.includes(brandedVersion)) return trimmed;
  return cdnDefault;
}

/** CDN URL for production (ignores stale env unless version stamp matches). */
export function resolveDashboardDemoCdnSrc(): string {
  return resolveBrandedCloudinaryVideoSrc(
    process.env.NEXT_PUBLIC_DASHBOARD_DEMO_VIDEO_URL,
    DASHBOARD_DEMO_BRANDED_VERSION,
    DASHBOARD_DEMO_CDN_DEFAULT,
  );
}

/** Cache-busted same-origin path — use in dev so `public/dashboard-demo-4k.mp4` is always authoritative. */
export function dashboardDemoLocalSrc(): string {
  return `${DASHBOARD_DEMO_FALLBACK}?v=${DASHBOARD_DEMO_CACHE_BUST}`;
}

/** True for local smoke tests (`npm start` on localhost) as well as `npm run dev`. */
export function isLocalPreviewHost(hostname?: string): boolean {
  const h = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  return h === 'localhost' || h === '127.0.0.1';
}

/**
 * Primary hero video URL.
 * - Development: always serves committed `public/dashboard-demo-4k.mp4` (WYSIWYG with encode).
 * - Production: Cloudinary CDN with version-stamped fallback.
 */
export function getDashboardDemoVideoSrc(hostname?: string): string {
  const useLocal =
    process.env.NODE_ENV === 'development' || isLocalPreviewHost(hostname);
  return useLocal ? dashboardDemoLocalSrc() : resolveDashboardDemoCdnSrc();
}

/** @deprecated Use getDashboardDemoVideoSrc() — kept for imports that expect a string at module scope. */
export const DASHBOARD_DEMO_VIDEO_SRC = resolveDashboardDemoCdnSrc();

export function resolvePocketAnalystVideoSrc(): string {
  return resolveBrandedCloudinaryVideoSrc(
    process.env.NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL,
    POCKET_ANALYST_BRANDED_VERSION,
    POCKET_ANALYST_CDN_DEFAULT,
  );
}

/** Cache-busted same-origin path — authoritative in local preview after encode. */
export function pocketAnalystLocalSrc(): string {
  return `${POCKET_ANALYST_FALLBACK}?v=${POCKET_ANALYST_CACHE_BUST}`;
}

export function pocketAnalystPosterSrc(): string {
  return `${POCKET_ANALYST_POSTER}?v=${POCKET_ANALYST_CACHE_BUST}`;
}

/** Open Portfolio hosts always load harness video from Cloudinary (not same-origin). */
export function isOpenPortfolioHost(hostname: string): boolean {
  return hostname.includes('openportfolio') || hostname.includes('open.localhost');
}

/**
 * Bridge harness on Open — production CDN even in dev (WYSIWYG with live Open host).
 * Pocket home section uses getPocketAnalystVideoSrc() (local file in dev).
 */
export function getPocketAnalystHarnessVideoSrc(hostname?: string): string {
  const h = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  if (isOpenPortfolioHost(h)) {
    return resolvePocketAnalystVideoSrc();
  }
  return getPocketAnalystVideoSrc(h);
}

/**
 * Pocket Analyst landing section video.
 * - Development / localhost: committed `public/pocket-analyst-demo.mp4` (trimmed encode).
 * - Production: Cloudinary CDN (re-upload after encode; bump branded version).
 */
export function getPocketAnalystVideoSrc(hostname?: string): string {
  const useLocal =
    process.env.NODE_ENV === 'development' || isLocalPreviewHost(hostname);
  return useLocal ? pocketAnalystLocalSrc() : resolvePocketAnalystVideoSrc();
}
