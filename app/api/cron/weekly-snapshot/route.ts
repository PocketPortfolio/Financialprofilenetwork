/**
 * Weekly Snapshot cron: send value-first email (portfolio % change or "Markets this week") with referral CTA.
 * Runs weekly (e.g. Sunday 09:00 UTC). Auth: CRON_SECRET or x-vercel-cron.
 */

import { NextRequest, NextResponse } from 'next/server';
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

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[Weekly Snapshot Cron] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1';
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const testEmail = searchParams.get('email') || process.env.STACK_REVEAL_TEST_EMAIL;
  const isTestRun = searchParams.get('test') === '1' && !!testEmail;

  try {
    const db = getDb();
    const auth = getAuth();
    const usersRef = db.collection('users');
    const snapshotsRef = db.collection('portfolio_snapshots');

    let toProcess: Array<{
      uid: string;
      email: string;
      displayName: string | null;
      firstName: string | null;
      isGoogle: boolean;
    }> = [];
    let nextPageToken: string | undefined;

    do {
      const listResult = await auth.listUsers(1000, nextPageToken);
      nextPageToken = listResult.pageToken;
      for (const user of listResult.users) {
        const displayName = user.displayName || null;
        const firstName = displayName?.trim() ? displayName.trim().split(/\s+/)[0] || null : null;
        const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com');
        if (!user.email) continue;
        toProcess.push({
          uid: user.uid,
          email: user.email,
          displayName,
          firstName,
          isGoogle,
        });
      }
    } while (nextPageToken);

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

    const now = Date.now();

    for (const u of toProcess) {
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

      let snapshots: Array<{ date: string; totalValue: number; positions?: Array<{ ticker: string; value: number }> }> = [];
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
      } catch (e) {
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

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      errors: errors.length ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('[Weekly Snapshot Cron]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cron failed' },
      { status: 500 }
    );
  }
}
