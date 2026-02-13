/**
 * Operation Stack Reveal: cohort and UTM constants
 */

export const COHORT_DATE = new Date('2025-10-27T00:00:00Z');
export const UTM_SOURCE = 'weekly_stack_reveal';
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';

/** Origin for email links and logo. Default production. For local testing, set to your tunnel (e.g. ngrok) so the email img points at your dev server. */
export const EMAIL_ASSET_ORIGIN =
  process.env.EMAIL_ASSET_ORIGIN || 'https://www.pocketportfolio.app';

/** Logo URL for Stack Reveal emails. Prefer a CDN (e.g. Cloudinary) for reliable rendering across clients. */
export const EMAIL_LOGO_URL =
  process.env.EMAIL_LOGO_URL || `${EMAIL_ASSET_ORIGIN}/brand/pp-monogram.png`;

/** Short URL used in email HTML so the img line is ≤76 chars (QP-safe). Proxy returns image; ?v=3 forces fresh fetch after cache issues. */
export const EMAIL_LOGO_SRC = `${EMAIL_ASSET_ORIGIN}/api/email-logo?v=3`;

export function appendUtm(path: string): string {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}utm_source=${UTM_SOURCE}&utm_medium=email&utm_campaign=stack_reveal`;
}

/** Same as appendUtm but with a given origin (for email so links always point to production). */
export function appendUtmWithOrigin(origin: string, path: string): string {
  const url = path.startsWith('http') ? path : `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}utm_source=${UTM_SOURCE}&utm_medium=email&utm_campaign=stack_reveal`;
}
