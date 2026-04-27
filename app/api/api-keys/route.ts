import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
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
/** Per-email cap; 10/min was too low for SPA remounts + React Strict Mode (dev) and multi-tab. */
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
 * GET /api/api-keys?email=user@example.com
 * Retrieve API key and corporate license for a customer email
 * Alternative to /api/api-keys/[email] that uses query parameters
 * This route is more reliable as it avoids Next.js routing issues with @ in path segments
 */
export async function GET(request: NextRequest) {
  let emailForDegraded: string | null = null;
  try {
    initializeFirebaseAdmin();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email);
    emailForDegraded = decodedEmail || null;
    if (!decodedEmail || !decodedEmail.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // In local dev, do not hit production Firestore for tiers by default.
    const useFirestoreInDev = process.env.NEXT_PUBLIC_DEV_USE_FIRESTORE_TIERS === 'true';
    if (process.env.NODE_ENV === 'development' && !useFirestoreInDev) {
      let stripeTier = { tier: null as string | null, themeAccess: null as string | null };
      try {
        const s = await resolvePaidTierFromStripeEmail(decodedEmail);
        stripeTier = { tier: s.tier, themeAccess: s.themeAccess };
      } catch {
        /* ignore */
      }
      return NextResponse.json({
        email: decodedEmail,
        apiKey: null,
        corporateLicense: null,
        tier: stripeTier.tier,
        themeAccess: stripeTier.themeAccess,
        degraded: true,
        degradedReason: 'dev_no_firestore',
        degradedFallback: stripeTier.tier ? 'stripe_subscription' : null,
      });
    }

    if (shouldDegradeFirestoreReads()) {
      let stripeTier = { tier: null as string | null, themeAccess: null as string | null };
      try {
        const s = await resolvePaidTierFromStripeEmail(decodedEmail);
        stripeTier = { tier: s.tier, themeAccess: s.themeAccess };
      } catch {
        /* ignore */
      }
      return NextResponse.json({
        email: decodedEmail,
        apiKey: null,
        corporateLicense: null,
        tier: stripeTier.tier,
        themeAccess: stripeTier.themeAccess,
        degraded: true,
        degradedReason: 'firestore_circuit_open',
        degradedFallback: stripeTier.tier ? 'stripe_subscription' : null,
      });
    }
    
    // Rate limiting check
    const now = Date.now();
    const limitKey = `email:${decodedEmail}`;
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
      // First request for this email
      rateLimitMap.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
    
    const db = getDb();

    // Get API key
    const apiKeyDoc = await db.collection('apiKeysByEmail').doc(decodedEmail).get();
    const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;

    // Get corporate license
    const licenseDoc = await db.collection('corporateLicenses').doc(decodedEmail).get();
    const licenseData = licenseDoc.exists ? licenseDoc.data() : null;

    return NextResponse.json({
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: apiKeyData?.tier || null,
      themeAccess: apiKeyData?.themeAccess || null,
    });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    
    // Handle quota exceeded errors specifically
    if (isFirestoreResourceExhausted(error)) {
      markFirestoreReadsDegraded();
      let stripeTier = { tier: null as string | null, themeAccess: null as string | null };
      if (emailForDegraded) {
        try {
          const s = await resolvePaidTierFromStripeEmail(emailForDegraded);
          stripeTier = { tier: s.tier, themeAccess: s.themeAccess };
        } catch {
          /* ignore */
        }
      }
      return NextResponse.json(
        {
          email: emailForDegraded,
          apiKey: null,
          corporateLicense: null,
          tier: stripeTier.tier,
          themeAccess: stripeTier.themeAccess,
          degraded: true,
          degradedReason: 'firestore_quota_exceeded',
          degradedFallback: stripeTier.tier ? 'stripe_subscription' : null,
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch API keys',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}







