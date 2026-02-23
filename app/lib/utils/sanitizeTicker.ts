/**
 * Sanitize ticker for safe use in URLs (SSRF mitigation).
 * Only allows characters that cannot change the host or path when interpolated
 * into a known base URL (e.g. query1.finance.yahoo.com/.../TICKER).
 */
const TICKER_ALLOWLIST = /^[A-Za-z0-9.]{1,12}$/;

export function sanitizeTickerForUrl(ticker: string | null | undefined): string | null {
  if (ticker == null || typeof ticker !== 'string') return null;
  const trimmed = ticker.trim().toUpperCase();
  if (!trimmed || !TICKER_ALLOWLIST.test(trimmed)) return null;
  return trimmed;
}
