/** Branded landing-page product videos (3840px wide, web-optimized H.264). */

export const DASHBOARD_DEMO_FALLBACK = '/dashboard-demo-4k.mp4';
export const DASHBOARD_DEMO_BRANDED_VERSION = 'v1779906039';
export const DASHBOARD_DEMO_CDN_DEFAULT = `https://res.cloudinary.com/dknmhvm7a/video/upload/${DASHBOARD_DEMO_BRANDED_VERSION}/pocket-portfolio/dashboard-demo-4k.mp4`;
/** 3840×2098 */
export const DASHBOARD_DEMO_ASPECT_RATIO = '3840 / 2098';

export const POCKET_ANALYST_FALLBACK = '/pocket-analyst-demo.mp4';
export const POCKET_ANALYST_BRANDED_VERSION = 'v1779906828';
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

export const DASHBOARD_DEMO_VIDEO_SRC = resolveBrandedCloudinaryVideoSrc(
  process.env.NEXT_PUBLIC_DASHBOARD_DEMO_VIDEO_URL,
  DASHBOARD_DEMO_BRANDED_VERSION,
  DASHBOARD_DEMO_CDN_DEFAULT,
);

export function resolvePocketAnalystVideoSrc(): string {
  return resolveBrandedCloudinaryVideoSrc(
    process.env.NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL,
    POCKET_ANALYST_BRANDED_VERSION,
    POCKET_ANALYST_CDN_DEFAULT,
  );
}
