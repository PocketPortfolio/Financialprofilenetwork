import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  VIRAL_REFERRAL_CAMPAIGN_DEFAULT,
  REFEREE_MAX_ACCOUNT_AGE_MS,
  REFERRAL_TRIAL_DAYS,
} from '@/app/lib/viral/referralCodeServer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

function sanitizeCampaignId(campaign: string): string {
  return campaign.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

function isValidReferralCode(code: string): boolean {
  if (code.length < 5 || code.length > 64) return false;
  if (!code.startsWith('REF-')) return false;
  return /^REF-[A-Z0-9]+$/i.test(code);
}

/**
 * POST /api/referral/complete
 * Idempotent: one claim per (campaign, referee uid). Grants referrer 7d FC trial when eligible.
 */
export async function POST(request: NextRequest) {
  try {
    getDb();

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.slice(7);
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const refereeUid = decoded.uid;
    const refereeEmail = (decoded.email ?? '').trim().toLowerCase();
    if (!refereeEmail) {
      return NextResponse.json({ error: 'No email on account' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const referralCode = String(body.referralCode ?? '').trim().toUpperCase();
    const campaign =
      typeof body.campaign === 'string' && body.campaign.trim()
        ? body.campaign.trim()
        : VIRAL_REFERRAL_CAMPAIGN_DEFAULT;

    if (!isValidReferralCode(referralCode)) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    const userRecord = await auth.getUser(refereeUid);
    const createdAt = new Date(userRecord.metadata.creationTime);
    if (Date.now() - createdAt.getTime() > REFEREE_MAX_ACCOUNT_AGE_MS) {
      return NextResponse.json(
        { error: 'Referral reward only applies to new accounts', code: 'REFEREE_NOT_NEW' },
        { status: 403 }
      );
    }

    const db = getDb();
    const indexSnap = await db.collection('referralIndex').doc(referralCode).get();
    if (!indexSnap.exists) {
      return NextResponse.json(
        { error: 'Unknown referral code', code: 'INDEX_MISS' },
        { status: 404 }
      );
    }

    const index = indexSnap.data()!;
    const referrerUid = index.referrerUid as string;
    const referrerEmail = (index.referrerEmail as string).trim().toLowerCase();

    if (!referrerUid || !referrerEmail) {
      return NextResponse.json({ error: 'Invalid referral index' }, { status: 500 });
    }

    if (referrerUid === refereeUid || referrerEmail === refereeEmail) {
      return NextResponse.json({ error: 'Self-referral is not allowed' }, { status: 400 });
    }

    const claimId = `${sanitizeCampaignId(campaign)}__${refereeUid}`;
    const claimRef = db.collection('referralRewardClaims').doc(claimId);
    const referrerRef = db.collection('apiKeysByEmail').doc(referrerEmail);

    const outcome = await db.runTransaction(async (tx) => {
      const claimSnap = await tx.get(claimRef);
      if (claimSnap.exists) {
        return { firstClaim: false, granted: false };
      }

      const refSnap = await tx.get(referrerRef);
      const refData = refSnap.exists ? refSnap.data() : null;

      let shouldGrant = true;
      if (refData?.referralViralRewardCampaign === campaign) {
        shouldGrant = false;
      }
      if (refData?.tier === 'corporateSponsor') {
        shouldGrant = false;
      }
      if (refData?.tier === 'foundersClub' && refData.expiresAt == null) {
        shouldGrant = false;
      }

      const trialEnd = Timestamp.fromMillis(
        Date.now() + REFERRAL_TRIAL_DAYS * 24 * 60 * 60 * 1000
      );

      tx.set(claimRef, {
        referralCode,
        referrerEmail,
        referrerUid,
        refereeUid,
        refereeEmail,
        campaign,
        createdAt: Timestamp.now(),
      });

      if (shouldGrant) {
        tx.set(
          referrerRef,
          {
            tier: 'foundersClub',
            // Not manuallyGranted — Stripe checkout must be able to replace this trial with a subscription
            manuallyGranted: false,
            expiresAt: trialEnd,
            themeAccess: 'founder',
            referralViralRewardCampaign: campaign,
            referralViralRewardGrantedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      return { firstClaim: true, granted: shouldGrant };
    });

    const { firstClaim, granted } = outcome;

    if (firstClaim) {
      await db.collection('referralEvents').add({
        action: 'conversion',
        referralCode,
        source: 'signup',
        campaign,
        metadata: { campaign },
        timestamp: Timestamp.now(),
      });
    }

    return NextResponse.json({
      ok: true,
      granted,
      alreadyCompleted: !firstClaim,
    });
  } catch (e: unknown) {
    console.error('[referral/complete]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to complete referral' },
      { status: 500 }
    );
  }
}
