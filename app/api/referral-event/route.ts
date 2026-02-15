import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, referralCode, source } = body;

    if (!action || !referralCode) {
      return NextResponse.json(
        { error: 'action and referralCode are required' },
        { status: 400 }
      );
    }
    if (action !== 'click' && action !== 'conversion') {
      return NextResponse.json(
        { error: 'action must be "click" or "conversion"' },
        { status: 400 }
      );
    }

    const db = getDb();
    await db.collection('referralEvents').add({
      action,
      referralCode: String(referralCode).slice(0, 64),
      source: source || 'unknown',
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Referral Event]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track referral event' },
      { status: 500 }
    );
  }
}
