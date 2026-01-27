/**
 * Sync Entitlements Utility
 * Determines Google Drive "Sovereign Sync" access based on subscription tier
 */

export type Tier = 'codeSupporter' | 'featureVoter' | 'corporateSponsor' | 'foundersClub' | null;

export interface SyncEntitlements {
  allowed: boolean;
  seats: number;
  overagePrice: string | null;
  currency: 'USD' | 'GBP' | null;
}

/**
 * Get sync entitlements for a given tier
 * 
 * Business Rules:
 * - Corporate Ecosystem ($1,000/yr): 2 seats included, $50/month/seat for overage
 * - Founder's Club (£100 lifetime): 1 seat included, £50/month/seat for overage
 * - All other tiers: No access
 */
export function getSyncEntitlements(tier: Tier): SyncEntitlements {
  switch (tier) {
    case 'corporateSponsor':
      return {
        allowed: true,
        seats: 2,
        overagePrice: '$50',
        currency: 'USD',
      };
    case 'foundersClub':
      return {
        allowed: true,
        seats: 1,
        overagePrice: '£50',
        currency: 'GBP',
      };
    default:
      return {
        allowed: false,
        seats: 0,
        overagePrice: null,
        currency: null,
      };
  }
}

/**
 * Get the tier display name for upgrade messaging
 */
export function getTierDisplayName(tier: Tier): string {
  switch (tier) {
    case 'corporateSponsor':
      return 'Corporate Ecosystem';
    case 'foundersClub':
      return "Founder's Club";
    case 'featureVoter':
      return 'Developer Utility';
    default:
      return 'Premium Tier';
  }
}







