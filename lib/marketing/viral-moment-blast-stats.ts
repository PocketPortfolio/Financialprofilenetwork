/**
 * Firestore aggregates for /api/cron/viral-moment-blast (admin reporting).
 * Written by Admin SDK only; clients default-deny in firebase/firestore.rules.
 */

import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export const VIRAL_BLAST_STATS_COLLECTION = 'adminStats';
export const VIRAL_BLAST_STATS_DOC_ID = 'viralMomentBlast';

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function eachUtcDayKey(from: Date, to: Date, out: string[]) {
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  while (cursor <= end) {
    out.push(utcDayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

/** Persist one cron execution (skip for ?test=1 runs). */
export async function recordViralMomentBlastRun(
  db: Firestore,
  opts: {
    sent: number;
    suppressed: number;
    totalEvaluated: number;
    skippedRecentWindow: number;
  }
): Promise<void> {
  const summaryRef = db.collection(VIRAL_BLAST_STATS_COLLECTION).doc(VIRAL_BLAST_STATS_DOC_ID);
  const dayKey = utcDayKey(new Date());
  const dailyRef = summaryRef.collection('daily').doc(dayKey);
  const batch = db.batch();
  batch.set(
    summaryRef,
    {
      totalSentAllTime: FieldValue.increment(opts.sent),
      lastRunAt: Timestamp.now(),
      lastRunSent: opts.sent,
      lastRunEvaluated: opts.totalEvaluated,
      lastRunSuppressed: opts.suppressed,
      lastRunSkippedRecentWindow: opts.skippedRecentWindow,
    },
    { merge: true }
  );
  batch.set(
    dailyRef,
    {
      sent: FieldValue.increment(opts.sent),
      cronRuns: FieldValue.increment(1),
    },
    { merge: true }
  );
  await batch.commit();
}

export type ViralMomentBlastMetrics = {
  totalSentAllTime: number;
  /** Sum of daily `sent` for UTC days overlapping the analytics range (see startDate). */
  emailsSentInSelectedRange: number;
  /** Last 7 rolling days from daily buckets (UTC calendar days). */
  emailsSentLast7Days: number;
  lastCronRunAt: string | null;
  lastCronRunSent: number;
  lastCronRunEvaluated: number;
  lastCronRunSuppressed: number;
};

export async function getViralMomentBlastMetrics(
  db: Firestore,
  startDate: Date
): Promise<ViralMomentBlastMetrics> {
  const summaryRef = db.collection(VIRAL_BLAST_STATS_COLLECTION).doc(VIRAL_BLAST_STATS_DOC_ID);
  const summarySnap = await summaryRef.get();
  const s = summarySnap.exists ? summarySnap.data() : null;
  const totalSentAllTime = Number(s?.totalSentAllTime ?? 0);
  const lr = s?.lastRunAt as { toDate?: () => Date } | undefined;
  const lastRunDate = lr && typeof lr.toDate === 'function' ? lr.toDate() : null;
  const lastCronRunAt =
    lastRunDate instanceof Date && !Number.isNaN(lastRunDate.getTime())
      ? lastRunDate.toISOString()
      : null;
  const lastCronRunSent = Number(s?.lastRunSent ?? 0);
  const lastCronRunEvaluated = Number(s?.lastRunEvaluated ?? 0);
  const lastCronRunSuppressed = Number(s?.lastRunSuppressed ?? 0);

  const now = new Date();
  const allTime = startDate.getTime() === 0;

  let emailsSentInSelectedRange = 0;
  if (allTime) {
    emailsSentInSelectedRange = totalSentAllTime;
  } else {
    const keys: string[] = [];
    eachUtcDayKey(startDate, now, keys);
    if (keys.length > 0) {
      const snaps = await Promise.all(keys.map((k) => summaryRef.collection('daily').doc(k).get()));
      for (const doc of snaps) {
        emailsSentInSelectedRange += Number(doc.data()?.sent ?? 0);
      }
    }
  }

  const sevenAgo = new Date(now.getTime() - 7 * 86_400_000);
  const keys7: string[] = [];
  eachUtcDayKey(sevenAgo, now, keys7);
  let emailsSentLast7Days = 0;
  if (keys7.length > 0) {
    const snaps7 = await Promise.all(keys7.map((k) => summaryRef.collection('daily').doc(k).get()));
    for (const doc of snaps7) {
      emailsSentLast7Days += Number(doc.data()?.sent ?? 0);
    }
  }

  return {
    totalSentAllTime,
    emailsSentInSelectedRange,
    emailsSentLast7Days,
    lastCronRunAt,
    lastCronRunSent,
    lastCronRunEvaluated,
    lastCronRunSuppressed,
  };
}
