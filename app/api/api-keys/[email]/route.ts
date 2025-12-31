import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

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
 * GET /api/api-keys/[email]
 * Retrieve API key and corporate license for a customer email
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } | Promise<{ email: string }> }
) {
  try {
    // Initialize Firebase Admin first
    initializeFirebaseAdmin();
    
    // Handle both Next.js 14 (Promise) and Next.js 13 (direct) params
    const resolvedParams = params && typeof (params as any).then === 'function' 
      ? await (params as Promise<{ email: string }>)
      : params as { email: string };
    
    const email = decodeURIComponent(resolvedParams.email);
    
    // Validate email format
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    const db = getDb();

    // Get API key
    const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
    const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;

    // Get corporate license
    const licenseDoc = await db.collection('corporateLicenses').doc(email).get();
    const licenseData = licenseDoc.exists ? licenseDoc.data() : null;

    return NextResponse.json({
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: apiKeyData?.tier || null,
      themeAccess: apiKeyData?.themeAccess || null, // Include theme access
    });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    // Log more details for debugging
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch API keys',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

