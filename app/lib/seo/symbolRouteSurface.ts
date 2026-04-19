/**
 * Path segment under /s/[symbol]/… for GA4 `bridge_surface` (path-aware vs ticker-only `bridge_hook`).
 */

export type BridgeSurface =
  | 'hub'
  | 'json_api'
  | 'dividend_history'
  | 'insider_trading'
  | 'other';

/** Expect pathname like `/s/aapl`, `/s/aapl/json-api`, `/s/aapl/dividend-history`. */
export function bridgeSurfaceFromPathname(pathname: string): BridgeSurface {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 's' || parts.length < 2) return 'other';
  if (parts.length === 2) return 'hub';
  const seg = (parts[2] || '').toLowerCase();
  if (seg === 'json-api') return 'json_api';
  if (seg === 'dividend-history') return 'dividend_history';
  if (seg === 'insider-trading') return 'insider_trading';
  return 'other';
}
