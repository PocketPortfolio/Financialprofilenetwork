import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { COHORT_DATE } from '@/lib/stack-reveal/constants';
import { getSubject, buildHtmlForWeek, getGreeting, getUnsubscribeUrl } from '@/lib/stack-reveal/email-templates';
import { sendStackRevealEmail } from '@/lib/stack-reveal/resend';
import type { StackRevealWeek } from '@/lib/stack-reveal/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[Stack Reveal Cron] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1';
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const testEmail = process.env.STACK_REVEAL_TEST_EMAIL;
  const searchParams = new URL(request.url).searchParams;
  const isTestRun = searchParams.get('test') === '1' || !!testEmail;

  try {
    const db = getDb();
    const auth = getAuth();
    const usersRef = db.collection('users');

    let nextPageToken: string | undefined;
    const toProcess: Array<{
      uid: string;
      email: string;
      displayName: string | null;
      firstName: string | null;
      createdAt: string;
      isGoogle: boolean;
    }> = [];

    do {
      const listResult = await auth.listUsers(1000, nextPageToken);
      nextPageToken = listResult.pageToken;
      for (const user of listResult.users) {
        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : null;
        if (!creationTime || creationTime < COHORT_DATE) continue;
        const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com');
        if (!isGoogle) continue;
        const displayName = user.displayName || null;
        const firstName = displayName?.trim() ? displayName.trim().split(/\s+/)[0] || null : null;
        toProcess.push({
          uid: user.uid,
          email: user.email || '',
          displayName,
          firstName,
          createdAt: user.metadata.creationTime || '',
          isGoogle: true,
        });
      }
    } while (nextPageToken);

    let sent = 0;
    let skipped = 0;

    if (isTestRun && testEmail) {
      for (let week = 1; week <= 4; week++) {
        const subject = getSubject(week as StackRevealWeek);
        const html = buildHtmlForWeek(week as StackRevealWeek, {
          greeting: 'Hi there,',
          uid: 'test',
          isGoogleUser: true,
        });
        const result = await sendStackRevealEmail(testEmail, subject, html, getUnsubscribeUrl('test'));
        if (result.error) {
          console.error('[Stack Reveal] Test email week', week, result.error);
        } else {
          sent++;
        }
      }
      return NextResponse.json({
        success: true,
        testMode: true,
        sent,
        message: `Sent ${sent} test emails to ${testEmail}`,
        timestamp: new Date().toISOString(),
      });
    }

    for (const u of toProcess) {
      const docRef = usersRef.doc(u.uid);
      const snap = await docRef.get();
      let marketingOptIn = true;
      let stackRevealWeek = 0;

      if (snap.exists) {
        const data = snap.data();
        marketingOptIn = data?.marketingOptIn !== false;
        stackRevealWeek = typeof data?.stackRevealWeek === 'number' ? data.stackRevealWeek : 0;
      } else {
        await docRef.set({
          email: u.email,
          displayName: u.displayName,
          createdAt: Timestamp.fromDate(new Date(u.createdAt)),
          marketingOptIn: true,
          stackRevealWeek: 0,
          authProvider: 'google.com',
        });
      }

      if (!marketingOptIn || stackRevealWeek >= 4) {
        skipped++;
        continue;
      }

      const nextWeek = (stackRevealWeek + 1) as StackRevealWeek;
      const greeting = getGreeting(u.displayName, u.firstName, u.isGoogle);
      const html = buildHtmlForWeek(nextWeek, {
        greeting,
        uid: u.uid,
        hasUploadedCsv: false,
        isGoogleUser: u.isGoogle,
      });
      const subject = getSubject(nextWeek);
      const to = u.email;
      const result = await sendStackRevealEmail(to, subject, html, getUnsubscribeUrl(u.uid));
      if (result.error) {
        console.error('[Stack Reveal] Send failed', u.uid, result.error);
        continue;
      }
      await new Promise((r) => setTimeout(r, 600)); // Resend: 2 req/s
      await docRef.update({
        stackRevealWeek: nextWeek,
        lastStackRevealSentAt: Timestamp.now(),
      });
      sent++;
    }

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      cohortSize: toProcess.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Stack Reveal Cron]', err);
    return NextResponse.json(
      { error: err?.message || 'Stack Reveal cron failed' },
      { status: 500 }
    );
  }
}
