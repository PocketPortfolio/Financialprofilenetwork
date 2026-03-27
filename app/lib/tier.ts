/**
 * Single source of truth for "paid" product access (Founders Club + Corporate).
 * codeSupporter / featureVoter / null = free for dashboard analytics & AI entitlements.
 */
export type PaidTier = 'foundersClub' | 'corporateSponsor';

export function isPaidTier(tier: string | null | undefined): tier is PaidTier {
  return tier === 'foundersClub' || tier === 'corporateSponsor';
}
