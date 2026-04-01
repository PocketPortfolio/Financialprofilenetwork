/**
 * Resolve paid entitlements from apiKeysByEmail-shaped data.
 * Subscriptions keep expiresAt null → still paid. Time-bound grants expire when expiresAt is in the past.
 */

export type ApiKeysByEmailLike = {
  tier?: string | null;
  expiresAt?: { toDate?: () => Date } | null;
} | null | undefined;

export function expiresAtIsInPast(
  expiresAt: unknown,
  nowMs: number = Date.now()
): boolean {
  if (expiresAt == null || typeof expiresAt !== 'object') return false;
  const d = (expiresAt as { toDate?: () => Date }).toDate?.();
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return false;
  return d.getTime() < nowMs;
}

export function getEffectivePaidTier(
  apiKeyData: ApiKeysByEmailLike,
  nowMs: number = Date.now()
): { tier: string | null; isPaid: boolean } {
  const tier = apiKeyData?.tier ?? null;
  if (tier !== 'foundersClub' && tier !== 'corporateSponsor') {
    return { tier: null, isPaid: false };
  }
  const exp = apiKeyData?.expiresAt;
  if (exp == null) {
    return { tier, isPaid: true };
  }
  if (expiresAtIsInPast(exp, nowMs)) {
    return { tier: null, isPaid: false };
  }
  return { tier, isPaid: true };
}
