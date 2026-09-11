/**
 * Optional monthly cron: reset AI usage counts for free-tier users.
 * Schedule: 1st of month 00:00 UTC ("0 0 1 * *").
 * Reset logic also runs on each request when period has expired; this cron is for consistency.
 */

import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = getDb();
  const snapshot = await db.collection('aiUsage').limit(500).get();
  const now = Timestamp.now();
  const batch = db.batch();
  let count = 0;
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { usageCount: 0, periodStart: now, updatedAt: now });
    count++;
  });
  if (count > 0) {
    await batch.commit();
  }
  return NextResponse.json({ ok: true, resetCount: count });
}
