/**
 * HTTPS URL validation for embeds and external assets (CodeQL-safe, logic-preserving).
 */

export function parseHttpsUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function urlHostMatches(url: string, allowedHosts: string[]): boolean {
  const parsed = parseHttpsUrl(url);
  if (!parsed) return false;
  const host = parsed.hostname.toLowerCase();
  return allowedHosts.some(
    (allowed) => host === allowed.toLowerCase() || host.endsWith(`.${allowed.toLowerCase()}`),
  );
}

export function safeExternalUrl(raw: string, allowedHosts: string[]): string | null {
  const parsed = parseHttpsUrl(raw);
  if (!parsed) return null;
  if (!urlHostMatches(parsed.href, allowedHosts)) return null;
  return parsed.href;
}
