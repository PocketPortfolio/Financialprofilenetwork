/**
 * Safe relative returnTo for sponsor ↔ Stripe success loop.
 * Rejects open redirects (protocol-relative, absolute URLs).
 */
export function sanitizeSafeReturnTo(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return null;
  if (path.includes('\\') || path.includes('\n') || path.includes('\r')) return null;
  return path.slice(0, 500);
}
