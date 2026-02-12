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
  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribe=missing`);
  }

  const uid = verifyUnsubscribeToken(token);
  if (!uid) {
    return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribe=invalid`);
  }

  try {
    const db = getDb();
    const docRef = db.collection('users').doc(uid);
    const snap = await docRef.get();
    if (snap.exists) {
      await docRef.update({
        marketingOptIn: false,
        unsubscribedAt: Timestamp.now(),
      });
    } else {
      await docRef.set({
        marketingOptIn: false,
        unsubscribedAt: Timestamp.now(),
      });
    }
  } catch (e) {
    console.error('[Unsubscribe]', e);
    return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribe=error`);
  }

  return NextResponse.redirect(`${BASE_URL}/stack-reveal?unsubscribed=1`);
}
