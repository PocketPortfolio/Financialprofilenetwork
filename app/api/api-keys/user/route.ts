import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { applySeatGrant, type InheritedTier } from '@/app/lib/seats/applySeatGrant';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';
import { referralCodeFromUid } from '@/app/lib/viral/referralCodeServer';
import {
  clearFirestoreReadsDegraded,
  isFirestoreResourceExhausted,
  markFirestoreReadsDegraded,
  shouldDegradeFirestoreReads,
} from '@/app/lib/server/firestore-quota-circuit';
import { resolvePaidTierFromStripeEmail } from '@/app/lib/server/stripe-paid-tier';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Rate limiting storage (in-memory, resets on serverless cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
/** Aligned with /api/api-keys email route — 10/min was too low for SPA remounts and dev. */
const MAX_REQUESTS_PER_WINDOW = 60;

/**
 * Users with Firebase Auth custom claim `admin: true` (see `npm run set-admin`) get Founder's Club
 * for Sovereign Sync when Firestore/Stripe/env omit tier — avoids CEO lockout on quota or missing docs.
 */
function applyAdminClaimFoundersOverride(
  hasAdminClaim: boolean,
  tier: string | null,
  themeAccess: string | null
): { tier: string | null; themeAccess: string | null } {
  if (!hasAdminClaim) return { tier, themeAccess };
  if (tier === 'corporateSponsor' || tier === 'foundersClub') {
    return { tier, themeAccess };
  }
  return {
    tier: 'foundersClub',
    themeAccess: themeAccess || 'founder',
  };
}

function applyFounderEmailOverride(
  email: string | null | undefined,
  tier: string | null,
  themeAccess: string | null
): { tier: string | null; themeAccess: string | null } {
  if (tier || !email) return { tier, themeAccess };
  const allow = (process.env.ADMIN_EMAIL_OVERRIDE ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allow.length) return { tier, themeAccess };
  const em = email.trim().toLowerCase();
  if (allow.includes(em)) {
    return { tier: 'foundersClub', themeAccess: 'founder' };
  }
  return { tier, themeAccess };
}

// Shared Firebase Admin initialization function
function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }
}

// Lazy Firebase initialization function
function getDb() {
  initializeFirebaseAdmin();
  return getFirestore();
}

/**
 * GET /api/api-keys/user
 * Retrieve API key and corporate license for authenticated Firebase user
 * Requires Firebase ID token in Authorization header
 */
export async function GET(request: NextRequest) {
  let userEmailForDegraded: string | null = null;
  /** Set after auth so Stripe/Firestore catch paths always use canonical email (try/catch cannot see inner `const`). */
  let userEmailCanonicalForDegraded: string | null = null;
  /** Declared outside `try` so the `catch` quota path can apply the admin tier boost. */
  let idTokenAdminClaim = false;

  try {
    // Dev-only Manchester proof: force a quota-like failure to verify client fallbacks.
    if (process.env.NODE_ENV === 'development') {
      const simulate = request.headers.get('x-simulate-quota');
      if (simulate && simulate.toLowerCase() === 'true') {
        const statusHeader = request.headers.get('x-simulate-quota-status');
        const status = statusHeader === '429' ? 429 : 503;
        return NextResponse.json(
          { error: 'Simulated quota exhaustion (dev only)' },
          { status }
        );
      }
    }

    // In local dev, do not hit production Firestore for tiers by default.
    const useFirestoreInDev = process.env.NEXT_PUBLIC_DEV_USE_FIRESTORE_TIERS === 'true';
    if (process.env.NODE_ENV === 'development' && !useFirestoreInDev) {
      // Still allow Stripe-derived tier so premium doesn't disappear in dev.
      // (This avoids any Firestore reads while preserving paid access.)
      let devAdminClaim = false;
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          initializeFirebaseAdmin();
          const idToken = authHeader.split('Bearer ')[1];
          const { getAuth } = await import('firebase-admin/auth');
          const decodedToken = await getAuth().verifyIdToken(idToken);
          userEmailForDegraded = decodedToken.email ?? null;
          devAdminClaim = decodedToken.admin === true;
        } catch {
          // ignore
        }
      }
      let stripeTier: { tier: string | null; themeAccess: string | null } = { tier: null, themeAccess: null };
      if (userEmailForDegraded) {
        try {
          const s = await resolvePaidTierFromStripeEmail(userEmailForDegraded);
          stripeTier = { tier: s.tier, themeAccess: s.themeAccess };
        } catch {
          // ignore
        }
      }
      let fo = applyFounderEmailOverride(userEmailForDegraded, stripeTier.tier, stripeTier.themeAccess);
      fo = applyAdminClaimFoundersOverride(devAdminClaim, fo.tier, fo.themeAccess);
      return NextResponse.json({
        email: userEmailForDegraded,
        apiKey: null,
        corporateLicense: null,
        tier: fo.tier,
        themeAccess: fo.themeAccess,
        degraded: true,
        degradedReason: 'dev_no_firestore',
        degradedFallback: fo.tier
          ? stripeTier.tier
            ? 'stripe_subscription'
            : devAdminClaim
              ? 'admin_claim'
              : 'admin_email_override'
          : null,
      });
    }

    const circuitOpen = shouldDegradeFirestoreReads();
    // Initialize Firebase Admin first (required for both getAuth and getDb)
    initializeFirebaseAdmin();
    
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify token and get user email
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    idTokenAdminClaim = decodedToken.admin === true;
    const userEmail = decodedToken.email;
    userEmailForDegraded = userEmail ?? null;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No email in token' },
        { status: 401 }
      );
    }

    // Canonical email for Firestore doc IDs (case-insensitive so claim and revoke use same key)
    const userEmailCanonical = userEmail.trim().toLowerCase();
    userEmailCanonicalForDegraded = userEmailCanonical;

    // Circuit blocks heavy reads elsewhere, but tier must stay aligned with production:
    // try one apiKeysByEmail document read (1 read) before Stripe-only fallback.
    if (circuitOpen) {
      try {
        const db = getDb();
        const apiKeyDoc = await db.collection('apiKeysByEmail').doc(userEmailCanonical).get();
        if (apiKeyDoc.exists) {
          clearFirestoreReadsDegraded();
          const apiKeyData = apiKeyDoc.data();
          const effective = getEffectivePaidTier(apiKeyData);
          const responseTier = effective.isPaid ? effective.tier : null;
          const responseTheme =
            effective.isPaid && responseTier
              ? (apiKeyData?.themeAccess as string | null) ||
                (responseTier === 'foundersClub'
                  ? 'founder'
                  : responseTier === 'corporateSponsor'
                    ? 'corporate'
                    : null)
              : null;
          let fo = applyFounderEmailOverride(userEmail, responseTier, responseTheme);
          fo = applyAdminClaimFoundersOverride(idTokenAdminClaim, fo.tier, fo.themeAccess);
          return NextResponse.json({
            email: userEmail,
            apiKey: (apiKeyData?.apiKey as string | undefined) || null,
            corporateLicense: null,
            tier: fo.tier,
            themeAccess: fo.themeAccess,
            degraded: true,
            degradedReason: 'firestore_circuit_open',
            degradedFallback: fo.tier
              ? effective.isPaid
                ? 'firestore_tier_doc'
                : idTokenAdminClaim
                  ? 'admin_claim'
                  : 'admin_email_override'
              : null,
          });
        }
      } catch (e) {
        if (isFirestoreResourceExhausted(e)) {
          markFirestoreReadsDegraded();
        }
      }
      let stripeTier: { tier: string | null; themeAccess: string | null } = { tier: null, themeAccess: null };
      try {
        const s = await resolvePaidTierFromStripeEmail(userEmailCanonical);
        stripeTier = { tier: s.tier, themeAccess: s.themeAccess };
      } catch {
        // ignore Stripe fallback errors
      }
      let fo = applyFounderEmailOverride(userEmail, stripeTier.tier, stripeTier.themeAccess);
      fo = applyAdminClaimFoundersOverride(idTokenAdminClaim, fo.tier, fo.themeAccess);
      return NextResponse.json({
        email: userEmail,
        apiKey: null,
        corporateLicense: null,
        tier: fo.tier,
        themeAccess: fo.themeAccess,
        degraded: true,
        degradedReason: 'firestore_circuit_open',
        degradedFallback: fo.tier
          ? stripeTier.tier
            ? 'stripe_subscription'
            : idTokenAdminClaim
              ? 'admin_claim'
              : 'admin_email_override'
          : null,
      });
    }

    // Rate limiting check
    const now = Date.now();
    const limitKey = `user:${userEmailCanonical}`;
    const limit = rateLimitMap.get(limitKey);
    
    if (limit) {
      if (now > limit.resetTime) {
        // Window expired, reset counter
        rateLimitMap.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else {
        if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            { 
              error: 'Too many requests. Please wait a moment and try again.',
              retryAfter: Math.ceil((limit.resetTime - now) / 1000)
            },
            { status: 429 }
          );
        }
        // Increment counter
        limit.count++;
        rateLimitMap.set(limitKey, limit);
      }
    } else {
      // First request from this user
      rateLimitMap.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Get API key from Firestore (use canonical email so revoke can find same doc)
    const db = getDb();
    let apiKeyDoc = await db.collection('apiKeysByEmail').doc(userEmailCanonical).get();
    let apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
    // Successful read: help the process recover from earlier quota-driven circuit state.
    clearFirestoreReadsDegraded();

    // Claim-on-sign-in (shadow user): if user has no tier but has a pending/active seat allocation, grant tier
    if (!apiKeyData?.tier) {
      try {
        const allocationSnapshot = await db
          .collection('seatAllocations')
          .where('memberEmail', '==', userEmailCanonical)
          .where('status', 'in', ['pending', 'active'])
          .limit(1)
          .get();

        if (!allocationSnapshot.empty) {
          const allocationDoc = allocationSnapshot.docs[0];
          const allocation = allocationDoc.data();
          const inheritedTier = allocation.inheritedTier as InheritedTier;
          const ownerId = allocation.ownerId as string;
          await applySeatGrant(db, userEmailCanonical, inheritedTier, ownerId);
          await allocationDoc.ref.update({
            status: 'active',
            memberUserId: decodedToken.uid,
          });
          apiKeyDoc = await db.collection('apiKeysByEmail').doc(userEmailCanonical).get();
          apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
        }
      } catch (e) {
        console.warn('[api-keys/user] seat allocation branch skipped:', e);
      }
    }

    // Lazy downgrade: time-bound FC/Corporate (referral trial, one-time, etc.) after expiresAt
    let effective = getEffectivePaidTier(apiKeyData);
    const hadStalePaidDoc =
      !effective.isPaid &&
      (apiKeyData?.tier === 'foundersClub' || apiKeyData?.tier === 'corporateSponsor');
    if (hadStalePaidDoc) {
      try {
        await db.collection('apiKeysByEmail').doc(userEmailCanonical).set(
          {
            tier: null,
            expiresAt: null,
            manuallyGranted: false,
            themeAccess: null,
            // Keep referralViralRewardCampaign / referralViralRewardGrantedAt so one trial per campaign stays enforced
          },
          { merge: true }
        );
        apiKeyDoc = await db.collection('apiKeysByEmail').doc(userEmailCanonical).get();
        apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
        effective = getEffectivePaidTier(apiKeyData);
      } catch (e) {
        console.warn('[api-keys/user] lazy downgrade branch skipped:', e);
      }
    }

    // Referral link resolution: map REF-* → this user (for /api/referral/complete)
    try {
      const refCode = referralCodeFromUid(decodedToken.uid);
      await db.collection('referralIndex').doc(refCode).set(
        {
          referrerUid: decodedToken.uid,
          referrerEmail: userEmailCanonical,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[api-keys/user] referralIndex upsert skipped:', e);
    }

    // Corporate license is optional for tier; a quota error here must not drop Founders/Corporate tier.
    let licenseData: { licenseKey?: string } | null = null;
    try {
      const licenseDoc = await db.collection('corporateLicenses').doc(userEmailCanonical).get();
      licenseData = licenseDoc.exists ? (licenseDoc.data() as { licenseKey?: string }) : null;
    } catch (e) {
      console.warn('[api-keys/user] corporateLicenses read skipped:', e);
    }

    const responseTier = effective.isPaid ? effective.tier : null;
    const responseTheme =
      effective.isPaid && responseTier
        ? (apiKeyData?.themeAccess as string | null) ||
          (responseTier === 'foundersClub'
            ? 'founder'
            : responseTier === 'corporateSponsor'
              ? 'corporate'
              : null)
        : null;

    let fo = applyFounderEmailOverride(userEmail, responseTier, responseTheme);
    fo = applyAdminClaimFoundersOverride(idTokenAdminClaim, fo.tier, fo.themeAccess);
    return NextResponse.json({
      email: userEmail,
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: fo.tier,
      themeAccess: fo.themeAccess,
    });
  } catch (error: any) {
    console.error('Error fetching API keys for user:', error);
    
    // Handle quota exceeded errors specifically
    if (isFirestoreResourceExhausted(error)) {
      markFirestoreReadsDegraded();
      // Stripe fallback so premium doesn't disappear when Firestore is out of quota.
      const emailForStripe =
        userEmailCanonicalForDegraded ??
        (typeof userEmailForDegraded === 'string'
          ? userEmailForDegraded.trim().toLowerCase()
          : null);
      let stripeTier: { tier: string | null; themeAccess: string | null } = { tier: null, themeAccess: null };
      if (emailForStripe?.includes('@')) {
        try {
          const s = await resolvePaidTierFromStripeEmail(emailForStripe);
          stripeTier = { tier: s.tier, themeAccess: s.themeAccess };
        } catch {
          // ignore Stripe fallback errors
        }
      }
      let fo = applyFounderEmailOverride(emailForStripe, stripeTier.tier, stripeTier.themeAccess);
      fo = applyAdminClaimFoundersOverride(idTokenAdminClaim, fo.tier, fo.themeAccess);
      return NextResponse.json(
        {
          // Preserve identity so client-side caching keyed by email can still work.
          email: userEmailForDegraded,
          apiKey: null,
          corporateLicense: null,
          tier: fo.tier,
          themeAccess: fo.themeAccess,
          degraded: true,
          degradedReason: 'firestore_quota_exceeded',
          degradedFallback: fo.tier
            ? stripeTier.tier
              ? 'stripe_subscription'
              : idTokenAdminClaim
                ? 'admin_claim'
                : 'admin_email_override'
            : null,
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}


