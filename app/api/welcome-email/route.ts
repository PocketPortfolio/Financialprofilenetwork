/**
 * Welcome Email (Week 0): triggered after signup.
 * POST with Authorization: Bearer <firebaseIdToken>.
 * Idempotent: only sends once per UID (welcomeEmailSentAt).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
  buildWelcomeEmailHtml,
  getGreeting,
  getUnsubscribeUrl,
  WELCOME_SUBJECT,
} from '@/lib/stack-reveal/email-templates';
import { sendStackRevealEmail } from '@/lib/stack-reveal/resend';
import { markFirestoreReadsDegraded } from '@/app/lib/server/firestore-quota-circuit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isResourceExhausted(error: any) {
  return (
    error?.code === 8 ||
    (typeof error?.message === 'string' &&
      (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('Quota exceeded')))
  );
}

function initializeFirebaseAdmin() {
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

function getDb() {
  initializeFirebaseAdmin();
  return getFirestore();
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization: Bearer <token>' }, { status: 401 });
  }

  let uid: string;
  let email: string;
  let displayName: string | null;
  try {
    initializeFirebaseAdmin();
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email || '';
    displayName = (decoded.name as string) || null;
  } catch (e) {
    console.error('[Welcome Email] Invalid token:', e);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'No email on account' }, { status: 400 });
  }

  const db = getDb();
  const usersRef = db.collection('users');
  const docRef = usersRef.doc(uid);

  // Claim the send in a transaction so concurrent requests only result in one send
  const ALREADY_SENT = 'WELCOME_EMAIL_ALREADY_SENT';
  let claimed = false;
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const data = snap.data();
      if (data?.welcomeEmailSentAt) {
        throw new Error(ALREADY_SENT);
      }
      tx.set(docRef, {
        welcomeEmailSentAt: Timestamp.now(),
        email,
        displayName,
        createdAt: snap.exists ? undefined : Timestamp.now(),
        marketingOptIn: true,
        stackRevealWeek: 0,
        authProvider: 'google.com',
      }, { merge: true });
      claimed = true;
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === ALREADY_SENT) {
      return NextResponse.json({ sent: false, alreadySent: true });
    }
    if (isResourceExhausted(e)) {
      markFirestoreReadsDegraded();
      // Do not block the app when Firestore is throttling.
      return NextResponse.json(
        { sent: false, degraded: true, degradedReason: 'firestore_quota_exceeded' },
        { status: 202 }
      );
    }
    throw e;
  }

  if (!claimed) {
    return NextResponse.json({ sent: false, alreadySent: true });
  }

  const firstName = displayName?.trim() ? displayName.trim().split(/\s+/)[0] || null : null;
  const greeting = getGreeting(displayName, firstName, true);
  const unsubscribeUrl = getUnsubscribeUrl(uid);
  const html = buildWelcomeEmailHtml({ greeting, unsubscribeUrl });

  const result = await sendStackRevealEmail(email, WELCOME_SUBJECT, html, unsubscribeUrl);
  if (result.error) {
    console.error('[Welcome Email] Send failed:', result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
