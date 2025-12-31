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
 * GET /api/api-keys?email=user@example.com
 * Retrieve API key and corporate license for a customer email
 * Alternative to /api/api-keys/[email] that uses query parameters
 * This route is more reliable as it avoids Next.js routing issues with @ in path segments
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Firebase Admin first
    initializeFirebaseAdmin();
    
    // Get email from query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }
    
    // Decode and validate email format
    const decodedEmail = decodeURIComponent(email);
    if (!decodedEmail || !decodedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
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
    return NextResponse.json(
      { 
        error: 'Failed to fetch API keys',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}






