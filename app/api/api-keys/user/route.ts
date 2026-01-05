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

    // Get API key from Firestore
    const db = getDb();
    const apiKeyDoc = await db.collection('apiKeysByEmail').doc(userEmail).get();
    const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;

    // Get corporate license
    const licenseDoc = await db.collection('corporateLicenses').doc(userEmail).get();
    const licenseData = licenseDoc.exists ? licenseDoc.data() : null;

    return NextResponse.json({
      email: userEmail,
      apiKey: apiKeyData?.apiKey || null,
      corporateLicense: licenseData?.licenseKey || null,
      tier: apiKeyData?.tier || null,
      themeAccess: apiKeyData?.themeAccess || null, // Premium theme access
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


