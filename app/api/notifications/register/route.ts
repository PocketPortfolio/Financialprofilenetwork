import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
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
  }
}

/**
 * POST /api/notifications/register
 * Register FCM token for push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    // Get user ID from Firebase Auth token
    // Note: In a real implementation, you'd verify the auth token from the request
    // For now, we'll store tokens anonymously and associate them later
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Verify token and get user ID
        // This would require Firebase Admin Auth verification
        // For now, we'll store with a placeholder and update when user logs in
      } catch (error) {
        console.error('Auth token verification error:', error);
      }
    }

    const db = getFirestore();
    
    // Store FCM token
    // If user is authenticated, associate with user ID
    // Otherwise, store as anonymous (can be associated later)
    const tokenData = {
      fcmToken,
      userId: userId || 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
          request.headers.get('x-real-ip') || 
          'unknown',
    };

    // Use FCM token as document ID to prevent duplicates
    await db.collection('fcmTokens').doc(fcmToken).set(tokenData, { merge: true });

    return NextResponse.json({ 
      success: true,
      message: 'FCM token registered successfully'
    });
  } catch (error: any) {
    console.error('FCM token registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register FCM token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/register
 * Unregister FCM token
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    await db.collection('fcmTokens').doc(fcmToken).delete();

    return NextResponse.json({ 
      success: true,
      message: 'FCM token unregistered successfully'
    });
  } catch (error: any) {
    console.error('FCM token unregistration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unregister FCM token' },
      { status: 500 }
    );
  }
}

