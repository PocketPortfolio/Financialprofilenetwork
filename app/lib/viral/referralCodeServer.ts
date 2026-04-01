/**
 * Server-side referral code from Firebase uid — must match client `generateReferralCode(userId)`.
 */
export function referralCodeFromUid(uid: string): string {
  const hash = uid.slice(0, 8).toUpperCase();
  return `REF-${hash}`;
}

export const VIRAL_REFERRAL_CAMPAIGN_DEFAULT = 'viral_moment_v1';

/** Max age of Firebase Auth account for referee to qualify (anti-abuse). */
export const REFEREE_MAX_ACCOUNT_AGE_MS = 48 * 60 * 60 * 1000;

export const REFERRAL_TRIAL_DAYS = 7;
