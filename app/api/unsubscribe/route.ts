import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { verifyUnsubscribeToken } from '@/lib/stack-reveal/unsubscribe-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const type = request.nextUrl.searchParams.get('type');
  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribe=missing`);
  }

  const uid = verifyUnsubscribeToken(token);
  if (!uid) {
    return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribe=invalid`);
  }

  const isWeeklySnapshot = type === 'weekly_snapshot';

  try {
    const db = getDb();
    const docRef = db.collection('users').doc(uid);
    const snap = await docRef.get();
    const updates: Record<string, unknown> = {
      unsubscribedAt: Timestamp.now(),
    };
    if (isWeeklySnapshot) {
      updates.weekly_snapshot_enabled = false;
    } else {
      updates.marketingOptIn = false;
    }
    if (snap.exists) {
      await docRef.update(updates);
    } else {
      await docRef.set(updates);
    }
  } catch (e) {
    console.error('[Unsubscribe]', e);
    return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribe=error`);
  }

  const redirectQuery = isWeeklySnapshot ? 'unsubscribed=1&from=weekly_snapshot' : 'unsubscribed=1';
  return NextResponse.redirect(`${BASE_URL}/stack-reveal?${redirectQuery}`);
}
