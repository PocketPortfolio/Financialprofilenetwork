/**
 * Emergency local drain for Weekly Snapshot when Vercel Auth quota is hot.
 * Usage: npx ts-node --project scripts/tsconfig.json scripts/drain-weekly-snapshot.ts
 * Env: .env.local (FIREBASE_* , RESEND_API_KEY, MAIL_FROM, EMAIL_ASSET_ORIGIN)
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getGreeting } from '../lib/stack-reveal/email-templates';
import {
  buildWeeklySnapshotHtml,
  getWeeklySnapshotSubject,
  getWeeklySnapshotUnsubscribeUrl,
  type WeeklySnapshotData,
} from '../lib/weekly-snapshot/email-templates';
import { sendWeeklySnapshotEmail } from '../lib/stack-reveal/resend';
import { generateReferralCode, getReferralLinkServer } from '../app/lib/viral/referral';

const AUTH_PAGE_SIZE = 200;
const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
const CRON_STATE_DOC = 'cron_state/weekly_snapshot';
const MAX_PASSES = 40;

function weekKeyUtc(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getSnapshotData(
  snapshots: Array<{ date: string; totalValue: number; positions?: Array<{ ticker: string; value: number }> }>,
): WeeklySnapshotData {
  if (snapshots.length < 2) return { hasData: false, isGreen: false };
  const now = snapshots[0];
  const latestDate = new Date(now.date + 'T12:00:00Z');
  latestDate.setUTCDate(latestDate.getUTCDate() - 7);
  const weekAgoDateStr = latestDate.toISOString().split('T')[0];
  const weekAgo = snapshots.find((s) => s.date <= weekAgoDateStr) ?? snapshots[snapshots.length - 1];
  const prevValue = weekAgo.totalValue;
  if (prevValue <= 0) return { hasData: false, isGreen: false };
  const percentChange = ((now.totalValue - prevValue) / prevValue) * 100;
  return { hasData: true, percentChange, isGreen: percentChange > 0 };
}

async function main() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    });
  }
  const db = getFirestore();
  const auth = getAuth();
  const usersRef = db.collection('users');
  const snapshotsRef = db.collection('portfolio_snapshots');
  const stateRef = db.doc(CRON_STATE_DOC);
  const currentWeek = weekKeyUtc();

  let totalSent = 0;
  let totalSkipped = 0;
  let complete = false;

  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    const stateSnap = await stateRef.get();
    const state = stateSnap.data() || {};
    let pageToken: string | undefined =
      state.weekKey === currentWeek && typeof state.pageToken === 'string' ? state.pageToken : undefined;

    console.log(`pass=${pass} week=${currentWeek} token=${pageToken ? 'yes' : 'start'}`);

    const listResult = await auth.listUsers(AUTH_PAGE_SIZE, pageToken);
    const now = Date.now();
    let sent = 0;
    let skipped = 0;

    for (const user of listResult.users) {
      if (!user.email) continue;
      const docRef = usersRef.doc(user.uid);
      const userSnap = await docRef.get();
      const userData = userSnap.data();
      if (userData?.weekly_snapshot_enabled === false) {
        skipped++;
        continue;
      }
      const lastSent = userData?.lastWeeklySnapshotSentAt?.toMillis?.() ?? 0;
      if (lastSent && now - lastSent < SIX_DAYS_MS) {
        skipped++;
        continue;
      }

      let snapshots: Array<{ date: string; totalValue: number }> = [];
      try {
        const snapQuery = await snapshotsRef
          .where('userId', '==', user.uid)
          .orderBy('date', 'desc')
          .limit(14)
          .get();
        snapQuery.docs.forEach((d) => {
          const dta = d.data();
          snapshots.push({ date: dta.date, totalValue: dta.totalValue ?? 0 });
        });
      } catch {
        /* markets fallback */
      }

      const data = getSnapshotData(snapshots);
      const displayName = user.displayName || null;
      const firstName = displayName?.trim() ? displayName.trim().split(/\s+/)[0] || null : null;
      const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com') ?? false;
      const greeting = getGreeting(displayName, firstName, isGoogle);
      const referralLink = getReferralLinkServer(
        generateReferralCode(user.uid),
        'weekly_snapshot',
        process.env.EMAIL_ASSET_ORIGIN,
      );
      const subject = getWeeklySnapshotSubject(data);
      const html = buildWeeklySnapshotHtml({
        greeting,
        uid: user.uid,
        referralLink,
        data,
      });
      const result = await sendWeeklySnapshotEmail(
        user.email,
        subject,
        html,
        getWeeklySnapshotUnsubscribeUrl(user.uid),
      );
      if (result.error) {
        console.warn('send_fail', user.uid.slice(0, 6), result.error);
        continue;
      }
      await docRef.set(
        { lastWeeklySnapshotSentAt: Timestamp.now(), updatedAt: Timestamp.now() },
        { merge: true },
      );
      sent++;
      await new Promise((r) => setTimeout(r, 600));
    }

    const nextToken = listResult.pageToken || null;
    complete = !nextToken;
    await stateRef.set(
      {
        weekKey: currentWeek,
        pageToken: nextToken,
        complete,
        lastRunAt: Timestamp.now(),
        lastSent: sent,
        lastSkipped: skipped,
        updatedAt: Timestamp.now(),
        drainSource: 'local-emergency',
      },
      { merge: true },
    );

    totalSent += sent;
    totalSkipped += skipped;
    console.log(`pass_done sent=${sent} skipped=${skipped} complete=${complete}`);
    if (complete) break;
  }

  console.log(JSON.stringify({ ok: true, totalSent, totalSkipped, complete, weekKey: currentWeek }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
