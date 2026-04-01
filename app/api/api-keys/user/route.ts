import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { applySeatGrant, type InheritedTier } from '@/app/lib/seats/applySeatGrant';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';
import { referralCodeFromUid } from '@/app/lib/viral/referralCodeServer';

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
  try {
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
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No email in token' },
        { status: 401 }
      );
    }

    // Canonical email for Firestore doc IDs (case-insensitive so claim and revoke use same key)
    const userEmailCanonical = userEmail.trim().toLowerCase();

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

    // Claim-on-sign-in (shadow user): if user has no tier but has a pending/active seat allocation, grant tier
    if (!apiKeyData?.tier) {
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
    }

    // Lazy downgrade: time-bound FC/Corporate (referral trial, one-time, etc.) after expiresAt
    let effective = getEffectivePaidTier(apiKeyData);
    const hadStalePaidDoc =
      !effective.isPaid &&
      (apiKeyData?.tier === 'foundersClub' || apiKeyData?.tier === 'corporateSponsor');
    if (hadStalePaidDoc) {
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

    // Get corporate license
    const licenseDoc = await db.collection('corporateLicenses').doc(userEmailCanonical).get();
    const licenseData = licenseDoc.exists ? licenseDoc.data() : null;

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

    return NextResponse.json({
      email: userEmail,
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: responseTier,
      themeAccess: responseTheme,
    });
  } catch (error: any) {
    console.error('Error fetching API keys for user:', error);
    
    // Handle quota exceeded errors specifically
    if (error?.code === 8 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Quota exceeded')) {
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable due to high demand',
          code: 'QUOTA_EXCEEDED',
          retryAfter: 60 // Suggest retrying after 60 seconds
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}


