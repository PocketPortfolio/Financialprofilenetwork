/**
 * Persist /challenge email captures for admin analytics (Firestore).
 * Collection is server-written only (Firebase Admin).
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const ARCHITECTURE_CHALLENGE_LEADS_COLLECTION = 'architecture_challenge_leads';

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

/** Call after email validation succeeds. Best-effort: failures are logged, not thrown. */
export async function recordArchitectureChallengeLead(email: string): Promise<void> {
  const db = getDb();
  await db.collection(ARCHITECTURE_CHALLENGE_LEADS_COLLECTION).add({
    email: email.toLowerCase().trim(),
    createdAt: Timestamp.now(),
    source: 'zero_trust_architecture_challenge',
    path: '/challenge',
  });
}

export type ChallengeLeadRow = {
  id: string;
  email: string;
  createdAt: string;
  source?: string;
};

/**
 * Aggregates for /admin/analytics (time range matches dashboard selector).
 */
export async function getArchitectureChallengeLeadsAnalytics(startDate: Date): Promise<{
  total: number;
  last7Days: number;
  signups: ChallengeLeadRow[];
  error?: string;
}> {
  try {
    const db = getDb();
    const startTs = Timestamp.fromDate(startDate);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7Start = new Date(Math.max(startDate.getTime(), sevenDaysAgo.getTime()));
    const last7Ts = Timestamp.fromDate(last7Start);

    const col = db.collection(ARCHITECTURE_CHALLENGE_LEADS_COLLECTION);

    const [totalAgg, last7Agg, listSnap] = await Promise.all([
      col.where('createdAt', '>=', startTs).count().get(),
      col.where('createdAt', '>=', last7Ts).count().get(),
      col.where('createdAt', '>=', startTs).orderBy('createdAt', 'desc').limit(100).get(),
    ]);

    const signups: ChallengeLeadRow[] = listSnap.docs.map((d) => {
      const data = d.data();
      const created = data.createdAt as Timestamp | undefined;
      return {
        id: d.id,
        email: typeof data.email === 'string' ? data.email : '',
        createdAt: created?.toDate?.()?.toISOString() ?? '',
        source: typeof data.source === 'string' ? data.source : undefined,
      };
    });

    return {
      total: totalAgg.data().count,
      last7Days: last7Agg.data().count,
      signups,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[challenge-leads-firestore] getArchitectureChallengeLeadsAnalytics:', message);
    return {
      total: 0,
      last7Days: 0,
      signups: [],
      error: message,
    };
  }
}
