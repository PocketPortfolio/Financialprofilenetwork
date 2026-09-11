import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function ensureAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

async function requireUid(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  ensureAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}

/**
 * POST /api/notifications/register
 * Register FCM token for push notifications (auth required — M13).
 */
export async function POST(request: NextRequest) {
  try {
    let uid: string;
    try {
      uid = await requireUid(request);
    } catch (e: any) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: e?.status || 401 });
    }

    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.length > 4096) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    const db = getFirestore();
    await db.collection('fcmTokens').doc(fcmToken).set(
      {
        fcmToken,
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        userAgent: (request.headers.get('user-agent') || 'unknown').slice(0, 500),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error: any) {
    console.error('FCM token registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register FCM token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/register
 * Unregister FCM token (auth required; owner only).
 */
export async function DELETE(request: NextRequest) {
  try {
    let uid: string;
    try {
      uid = await requireUid(request);
    } catch (e: any) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: e?.status || 401 });
    }

    const body = await request.json();
    const { fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    const db = getFirestore();
    const ref = db.collection('fcmTokens').doc(fcmToken);
    const snap = await ref.get();
    if (snap.exists && snap.data()?.userId && snap.data()?.userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await ref.delete();

    return NextResponse.json({
      success: true,
      message: 'FCM token unregistered successfully',
    });
  } catch (error: any) {
    console.error('FCM token unregistration error:', error);
    return NextResponse.json(
      { error: 'Failed to unregister FCM token' },
      { status: 500 }
    );
  }
}
