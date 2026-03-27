import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function initAdmin() {
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

/**
 * POST /api/user/monetization-intent
 * Authenticated: writes users/{uid} intent timestamps for lifecycle email (cron).
 * Body: { kind: 'paywall_impression' | 'checkout_start', triggerSource?: string }
 */
export async function POST(request: NextRequest) {
  try {
    initAdmin();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice(7);
    const auth = getAuth();
    let uid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const kind = body.kind === 'checkout_start' ? 'checkout_start' : 'paywall_impression';
    const triggerSource =
      typeof body.triggerSource === 'string' ? body.triggerSource.trim().slice(0, 200) : '';

    const db = getFirestore();
    const now = Timestamp.now();
    const ref = db.collection('users').doc(uid);

    if (kind === 'checkout_start') {
      await ref.set(
        {
          lastCheckoutStartAt: now,
          lastIntentTriggerSource: triggerSource || null,
        },
        { merge: true }
      );
    } else {
      await ref.set(
        {
          lastPaywallImpressionAt: now,
          lastIntentTriggerSource: triggerSource || null,
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[monetization-intent]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}
