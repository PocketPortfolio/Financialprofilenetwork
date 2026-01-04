import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// Lazy Firebase initialization function
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

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set. Cannot fetch session details.');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

/**
 * GET /api/api-keys/session/[sessionId]
 * Retrieve API key and corporate license using Stripe session ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Next.js 15: params is always a Promise
    const resolvedParams = await params;
    const sessionId = decodeURIComponent(resolvedParams.sessionId);

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Fetch session from Stripe to get customer email
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail = session.customer_email || session.customer_details?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No email found in session' },
        { status: 404 }
      );
    }

    // Get API key from Firestore
    const db = getDb();
    const apiKeyDoc = await db.collection('apiKeysByEmail').doc(customerEmail).get();
    const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;

    // Get corporate license
    const licenseDoc = await db.collection('corporateLicenses').doc(customerEmail).get();
    const licenseData = licenseDoc.exists ? licenseDoc.data() : null;

    return NextResponse.json({
      email: customerEmail,
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: apiKeyData?.tier || null,
      themeAccess: apiKeyData?.themeAccess || null, // Premium theme access
    });
  } catch (error: any) {
    console.error('Error fetching API keys by session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}


