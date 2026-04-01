import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FREE_TIER_MONTHLY_LIMIT = 20;
const PERIOD_DAYS = 30;

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

/**
 * GET /api/ai/usage
 * Returns { used, limit } for the authenticated user (free tier). Paid tier returns unlimited.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.slice(7);

  let uid: string;
  let email: string;
  try {
    initializeFirebaseAdmin();
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
    email = (decoded.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const db = getDb();
  const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
  const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
  const effective = getEffectivePaidTier(apiKeyData);
  const isPaid = effective.isPaid;

  if (isPaid) {
    return NextResponse.json({ used: 0, limit: null, unlimited: true });
  }

  const usageRef = db.collection('aiUsage').doc(uid);
  const usageSnap = await usageRef.get();
  const data = usageSnap.exists ? usageSnap.data() : null;
  let used = typeof data?.usageCount === 'number' ? data.usageCount : 0;
  const periodStart = data?.periodStart;

  if (periodStart?.toDate) {
    const start = periodStart.toDate();
    const daysSince = (Date.now() - start.getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince >= PERIOD_DAYS) {
      used = 0;
    }
  }

  return NextResponse.json({
    used,
    limit: FREE_TIER_MONTHLY_LIMIT,
    unlimited: false,
  });
}
