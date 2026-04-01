/**
 * Cross-subdomain referral persistence: sessionStorage is per-origin, so
 * pocketportfolio.app vs www.pocketportfolio.app drops ?ref= without this.
 * Cookie uses Domain=.pocketportfolio.app (prod only).
 */
const COOKIE_NAME = 'pp_referral_code';
const MAX_AGE_SEC = 14 * 24 * 60 * 60; // 14 days — covers signup funnel

function prodReferralDomain(hostname: string): string | null {
  if (hostname === 'pocketportfolio.app' || hostname === 'www.pocketportfolio.app') {
    return '.pocketportfolio.app';
  }
  return null;
}

export function setReferralCodeCookie(code: string): void {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const value = encodeURIComponent(code);
  const base = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
  const domain = prodReferralDomain(host);
  if (domain) {
    document.cookie = `${base}; domain=${domain}`;
  }
  document.cookie = base;
}

export function getReferralCodeCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function clearReferralCodeCookie(): void {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const domain = prodReferralDomain(host);
  const expired = `; max-age=0; path=/${secure}`;
  if (domain) {
    document.cookie = `${COOKIE_NAME}=; domain=${domain}${expired}`;
  }
  document.cookie = `${COOKIE_NAME}=${expired}`;
}
