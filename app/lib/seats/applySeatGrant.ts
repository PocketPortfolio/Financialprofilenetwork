import type { Firestore } from 'firebase-admin/firestore';
import { generateApiKey } from '../utils/apiKey';

export type InheritedTier = 'corporateSponsor' | 'foundersClub';

/**
 * Apply seat grant: write tier, API key, and (for corporate) corporate license
 * to apiKeysByEmail and corporateLicenses. Used when owner invites an existing
 * user or when an invited user claims the seat on first sign-in.
 */
export async function applySeatGrant(
  db: Firestore,
  memberEmail: string,
  inheritedTier: InheritedTier,
  ownerId: string
): Promise<void> {
  const emailKey = memberEmail.trim().toLowerCase();
  const apiKey = generateApiKey();
  const themeAccess = inheritedTier === 'corporateSponsor' ? 'corporate' : 'founder';
  const now = new Date();

  await db.collection('apiKeysByEmail').doc(emailKey).set(
    {
      tier: inheritedTier,
      themeAccess,
      apiKey,
      inheritedFrom: ownerId,
      isLifetime: true,
      createdAt: now,
      expiresAt: null,
    },
    { merge: true }
  );

  if (inheritedTier === 'corporateSponsor') {
    const corporateLicense = generateApiKey();
    await db.collection('corporateLicenses').doc(emailKey).set({
      licenseKey: corporateLicense,
      email: emailKey,
      createdAt: now,
    });
  }
}

/**
 * Revoke tier for a member who had access only via seat (inheritedFrom === ownerId).
 * Clears apiKeysByEmail and corporateLicenses for that email. Call after deleting
 * the seat allocation.
 */
export async function revokeSeatGrant(
  db: Firestore,
  memberEmail: string,
  ownerId: string
): Promise<void> {
  const emailKey = memberEmail.trim().toLowerCase();
  const doc = await db.collection('apiKeysByEmail').doc(emailKey).get();
  const data = doc.exists ? doc.data() : null;
  if (data?.inheritedFrom !== ownerId) return;

  await db.collection('apiKeysByEmail').doc(emailKey).update({
    tier: null,
    themeAccess: null,
    apiKey: null,
    inheritedFrom: null,
    isLifetime: false,
  });
  await db.collection('corporateLicenses').doc(emailKey).delete();
}
