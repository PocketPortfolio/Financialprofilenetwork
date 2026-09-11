import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h after session creation
const redeemRateLimit = new Map<string, { count: number; resetTime: number }>();
const REDEEM_WINDOW_MS = 60_000;
const REDEEM_MAX = 10;

function getDb() {
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
  return getFirestore();
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

/**
 * GET /api/api-keys/session/[sessionId]
 * Checkout success redeem path. Hardened (H7):
 * - session must be paid
 * - session age ≤ 24h
 * - IP rate limit
 * - one-time full secret redeem (subsequent calls return tier only, no apiKey)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = decodeURIComponent(resolvedParams.sessionId);

    if (!sessionId || sessionId.length < 10) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const now = Date.now();
    const bucket = redeemRateLimit.get(ip);
    if (bucket && now < bucket.resetTime) {
      if (bucket.count >= REDEEM_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      bucket.count += 1;
    } else {
      redeemRateLimit.set(ip, { count: 1, resetTime: now + REDEEM_WINDOW_MS });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err: any) {
      const missing =
        err?.statusCode === 404 ||
        err?.code === 'resource_missing' ||
        /no such checkout\.session/i.test(String(err?.message || ''));
      if (missing) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      throw err;
    }
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'not_paid', payment_status: session.payment_status },
        { status: 402 }
      );
    }

    const createdMs = (session.created || 0) * 1000;
    if (!createdMs || now - createdMs > SESSION_MAX_AGE_MS) {
      return NextResponse.json(
        { error: 'Session redeem window expired. Sign in and use Settings / Retrieve API Key.' },
        { status: 410 }
      );
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (!customerEmail) {
      return NextResponse.json({ error: 'No email found in session' }, { status: 404 });
    }

    const db = getDb();
    const redeemRef = db.collection('sessionKeyRedeems').doc(sessionId);
    const redeemSnap = await redeemRef.get();
    const alreadyRedeemed = redeemSnap.exists && Boolean(redeemSnap.data()?.redeemedAt);

    const apiKeyDoc = await db.collection('apiKeysByEmail').doc(customerEmail).get();
    const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
    const licenseDoc = await db.collection('corporateLicenses').doc(customerEmail).get();
    const licenseData = licenseDoc.exists ? licenseDoc.data() : null;

    if (alreadyRedeemed) {
      // Secrets already delivered once — return non-secret tier metadata only.
      return NextResponse.json({
        email: customerEmail,
        apiKey: null,
        corporateLicense: null,
        tier: apiKeyData?.tier || null,
        themeAccess: apiKeyData?.themeAccess || null,
        redeemed: true,
        message: 'Secrets already redeemed for this session. Sign in to view keys in Settings.',
      });
    }

    await redeemRef.set(
      {
        redeemedAt: FieldValue.serverTimestamp(),
        email: customerEmail.toLowerCase(),
        ip,
      },
      { merge: true }
    );

    return NextResponse.json({
      email: customerEmail,
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: apiKeyData?.tier || null,
      themeAccess: apiKeyData?.themeAccess || null,
      redeemed: false,
    });
  } catch (error: any) {
    console.error('Error fetching API keys by session:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}
