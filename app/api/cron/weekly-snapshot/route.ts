/**
 * Weekly Snapshot cron: value-first email (portfolio % change or "Markets this week") + referral CTA.
 *
 * Auth listUsers is quota-sensitive (Identity Toolkit RESOURCE_EXHAUSTED). This route NEVER
 * sweeps the full user base in one invocation — one Auth page per run, cursor in Firestore,
 * Vercel crons drain Fri evening + Sat morning.
 *
 * Auth: CRON_SECRET or x-vercel-cron.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { verifyCronTestMode } from '@/lib/cron/verify-cron-test-email';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getGreeting } from '@/lib/stack-reveal/email-templates';
import {
  buildWeeklySnapshotHtml,
  getWeeklySnapshotSubject,
  getWeeklySnapshotUnsubscribeUrl,
  type WeeklySnapshotData,
} from '@/lib/weekly-snapshot/email-templates';
import { sendWeeklySnapshotEmail } from '@/lib/stack-reveal/resend';
import { generateReferralCode, getReferralLinkServer } from '@/app/lib/viral/referral';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
/** Fluid / Pro: enough for one Auth page + Resend pacing. */
export const maxDuration = 300;

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
/** Identity Toolkit listUsers page size — keep modest to avoid RESOURCE_EXHAUSTED. */
const AUTH_PAGE_SIZE = 200;
/** Soft cap on Resend sends per invocation (600ms pacing ≈ 2 min for 200). */
const MAX_SENDS_PER_RUN = 200;
const CRON_STATE_DOC = 'cron_state/weekly_snapshot';

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

function weekKeyUtc(d = new Date()): string {
  // ISO week-ish key: YYYY-Www (UTC) so Friday + Saturday drain share one cohort
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getSnapshotData(
  snapshots: Array<{ date: string; totalValue: number; positions?: Array<{ ticker: string; value: number }> }>
): WeeklySnapshotData {
  if (snapshots.length < 2) {
    return { hasData: false, isGreen: false };
  }
  const now = snapshots[0];
  const latestDate = new Date(now.date + 'T12:00:00Z');
  latestDate.setUTCDate(latestDate.getUTCDate() - 7);
  const weekAgoDateStr = latestDate.toISOString().split('T')[0];
  const weekAgo = snapshots.find((s) => s.date <= weekAgoDateStr) ?? snapshots[snapshots.length - 1];
  const prevValue = weekAgo.totalValue;
  if (prevValue <= 0) return { hasData: false, isGreen: false };
  const percentChange = ((now.totalValue - prevValue) / prevValue) * 100;
  const isGreen = percentChange > 0;

  let topGainer: { ticker: string; pct: number } | undefined;
  if (now.positions?.length && weekAgo.positions?.length) {
    const prevByTicker = new Map(weekAgo.positions.map((p) => [p.ticker, p.value]));
    let maxPct = -Infinity;
    let maxTicker = '';
    for (const pos of now.positions) {
      const prevVal = prevByTicker.get(pos.ticker) ?? 0;
      if (prevVal <= 0) continue;
      const pct = ((pos.value - prevVal) / prevVal) * 100;
      if (pct > maxPct) {
        maxPct = pct;
        maxTicker = pos.ticker;
      }
    }
    if (maxTicker) topGainer = { ticker: maxTicker, pct: maxPct };
  }

  return {
    hasData: true,
    percentChange,
    topGainer,
    isGreen,
  };
}

function isResourceExhausted(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  return (
    code === '8' ||
    /RESOURCE_EXHAUSTED/i.test(msg) ||
    /Quota exceeded/i.test(msg)
  );
}

export async function GET(request: NextRequest) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const searchParams = new URL(request.url).searchParams;
  const testMode = verifyCronTestMode(
    searchParams,
    searchParams.get('email') || process.env.STACK_REVEAL_TEST_EMAIL || undefined,
  );
  if (!testMode.ok) {
    return NextResponse.json({ error: testMode.error }, { status: testMode.status });
  }

  const testEmail = testMode.testEmail || searchParams.get('email') || process.env.STACK_REVEAL_TEST_EMAIL;
  const isTestRun = testMode.isTestRun;

  try {
    const db = getDb();
    const firebaseAuth = getAuth();
    const usersRef = db.collection('users');
    const snapshotsRef = db.collection('portfolio_snapshots');
    const stateRef = db.doc(CRON_STATE_DOC);

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    if (isTestRun && testEmail) {
      const greeting = getGreeting('Test', 'Test', true);
      const referralLink = getReferralLinkServer(
        generateReferralCode('test-uid'),
        'weekly_snapshot',
        process.env.EMAIL_ASSET_ORIGIN
      );
      const data: WeeklySnapshotData = {
        hasData: true,
        percentChange: 2.5,
        topGainer: { ticker: 'AAPL', pct: 5.2 },
        isGreen: true,
      };
      const subject = getWeeklySnapshotSubject(data);
      const html = buildWeeklySnapshotHtml({
        greeting,
        uid: 'test-uid',
        referralLink,
        data,
      });
      const unsubUrl = getWeeklySnapshotUnsubscribeUrl('test-uid');
      const result = await sendWeeklySnapshotEmail(testEmail, subject, html, unsubUrl);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        testMode: true,
        sent: 1,
        message: `Sent test Weekly Snapshot to ${testEmail}`,
        timestamp: new Date().toISOString(),
      });
    }

    const currentWeek = weekKeyUtc();
    const stateSnap = await stateRef.get();
    const state = stateSnap.data() || {};
    let pageToken: string | undefined =
      state.weekKey === currentWeek && typeof state.pageToken === 'string'
        ? state.pageToken
        : undefined;
    // Fresh week → start from beginning (undefined token)
    if (state.weekKey !== currentWeek) {
      pageToken = undefined;
    }

    let listResult;
    try {
      listResult = await firebaseAuth.listUsers(AUTH_PAGE_SIZE, pageToken);
    } catch (err: unknown) {
      if (isResourceExhausted(err)) {
        console.error('[Weekly Snapshot Cron] Auth quota exhausted on listUsers', err);
        return NextResponse.json(
          {
            success: false,
            error: 'RESOURCE_EXHAUSTED',
            message:
              'Firebase Auth listUsers quota exceeded. Cursor preserved; next drain slot will retry.',
            weekKey: currentWeek,
            pageToken: pageToken ?? null,
            timestamp: new Date().toISOString(),
          },
          { status: 503 },
        );
      }
      throw err;
    }

    const toProcess: Array<{
      uid: string;
      email: string;
      displayName: string | null;
      firstName: string | null;
      isGoogle: boolean;
    }> = [];

    for (const user of listResult.users) {
      if (!user.email) continue;
      const displayName = user.displayName || null;
      const firstName = displayName?.trim() ? displayName.trim().split(/\s+/)[0] || null : null;
      const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com') ?? false;
      toProcess.push({
        uid: user.uid,
        email: user.email,
        displayName,
        firstName,
        isGoogle,
      });
    }

    const now = Date.now();
    const sendBudget = Math.min(MAX_SENDS_PER_RUN, toProcess.length);

    for (let i = 0; i < toProcess.length && sent < sendBudget; i++) {
      const u = toProcess[i];
      const docRef = usersRef.doc(u.uid);
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

      let snapshots: Array<{
        date: string;
        totalValue: number;
        positions?: Array<{ ticker: string; value: number }>;
      }> = [];
      try {
        const snapQuery = await snapshotsRef
          .where('userId', '==', u.uid)
          .orderBy('date', 'desc')
          .limit(14)
          .get();
        snapQuery.docs.forEach((d) => {
          const dta = d.data();
          snapshots.push({
            date: dta.date,
            totalValue: dta.totalValue ?? 0,
            positions: dta.positions,
          });
        });
      } catch {
        // No index or error: proceed with no data (Markets this week)
      }

      const data = getSnapshotData(snapshots);
      const greeting = getGreeting(u.displayName, u.firstName, u.isGoogle);
      const referralCode = generateReferralCode(u.uid);
      const referralLink = getReferralLinkServer(
        referralCode,
        'weekly_snapshot',
        process.env.EMAIL_ASSET_ORIGIN
      );
      const subject = getWeeklySnapshotSubject(data);
      const html = buildWeeklySnapshotHtml({
        greeting,
        uid: u.uid,
        referralLink,
        data,
      });
      const unsubUrl = getWeeklySnapshotUnsubscribeUrl(u.uid);

      const result = await sendWeeklySnapshotEmail(u.email, subject, html, unsubUrl);
      if (result.error) {
        errors.push(`${u.uid}: ${result.error}`);
        continue;
      }
      await docRef.set(
        { lastWeeklySnapshotSentAt: Timestamp.now(), updatedAt: Timestamp.now() },
        { merge: true }
      );
      sent++;
      await new Promise((r) => setTimeout(r, 600));
    }

    const nextToken = listResult.pageToken || null;
    const complete = !nextToken;
    await stateRef.set(
      {
        weekKey: currentWeek,
        pageToken: nextToken,
        complete,
        lastRunAt: Timestamp.now(),
        lastSent: sent,
        lastSkipped: skipped,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      evaluated: toProcess.length,
      weekKey: currentWeek,
      complete,
      nextPageToken: nextToken,
      errors: errors.length ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('[Weekly Snapshot Cron]', err);
    const exhausted = isResourceExhausted(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cron failed' },
      { status: exhausted ? 503 : 500 }
    );
  }
}
