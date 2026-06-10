/**
 * Landing page A/B variant resolution — retail educational funnel vs control.
 * Canonical `/` SEO unchanged; variant via ?variant=retail|control + cookie persistence.
 */

export const LANDING_VARIANT_COOKIE = 'pp_landing_variant';
export const LANDING_VARIANT_TEST_ID = 'landing_retail_ia_2026';

export type LandingPageVariant = 'control' | 'retail';

const VALID_VARIANTS: ReadonlySet<string> = new Set(['control', 'retail']);

export function isLandingPageVariant(value: string | null | undefined): value is LandingPageVariant {
  return value === 'control' || value === 'retail';
}

export function parseLandingVariantParam(
  param: string | null | undefined
): LandingPageVariant | null {
  if (!param || !VALID_VARIANTS.has(param)) return null;
  return param as LandingPageVariant;
}

/** Cookie max-age: 30 days — matches typical A/B assignment windows. */
export const LANDING_VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const LANDING_VISITOR_COOKIE = 'pp_visitor_id';

/** Command Team activated 2026-06-10 — 50/50 control vs retail on `/`. */
export const LANDING_AB_IS_ACTIVE = true;

/** Percent of un-cookied `/` traffic enrolled in the experiment (100 = everyone split 50/50). */
export const LANDING_AB_TRAFFIC_SPLIT_PERCENT = 100;

export const LANDING_AB_PATHS = ['/', '/landing'] as const;

export function isLandingAbPath(pathname: string): boolean {
  return (LANDING_AB_PATHS as readonly string[]).includes(pathname);
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Stable 50/50 assignment from visitor seed (middleware + edge-safe). */
export function assignLandingVariantFromSeed(seed: string): LandingPageVariant {
  return hashSeed(seed) % 2 === 0 ? 'retail' : 'control';
}

/** 0–99 bucket for traffic-split enrollment gates. */
export function landingAbEnrollmentBucket(seed: string): number {
  return hashSeed(seed) % 100;
}

export const POCKET_HOME_CANONICAL_URL = 'https://www.pocketportfolio.app/';
