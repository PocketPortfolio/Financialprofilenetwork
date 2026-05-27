/**
 * Gated dividend observability — never log API key material or query secrets.
 * Preserves HTTP status codes and latency-friendly metadata for ops.
 */

export function isDividendDebugEnabled(): boolean {
  return process.env.DIVIDEND_DEBUG === '1';
}

/** Strip apikey/token query params before logging URLs. */
export function redactUrlForLog(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of ['apikey', 'api_key', 'token', 'key']) {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, '****');
      }
    }
    return parsed.toString();
  } catch {
    return url.replace(/apikey=[^&]+/gi, 'apikey=****').replace(/token=[^&]+/gi, 'token=****');
  }
}

export function logDividendDebug(
  message: string,
  meta?: Record<string, string | number | boolean>,
): void {
  if (!isDividendDebugEnabled()) return;
  if (meta && Object.keys(meta).length > 0) {
    console.warn('[DIVIDEND_DEBUG]', message, meta);
  } else {
    console.warn('[DIVIDEND_DEBUG]', message);
  }
}
