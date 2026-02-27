import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { sendStackRevealEmail } from '@/lib/stack-reveal/resend';
import {
  DAY2_SUBJECT,
  getDay2Html,
  DAY4_SUBJECT,
  getDay4Html,
} from '@/lib/marketing-drip/email-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getDb() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (e) {
      console.error('[marketing-drip] Firebase init error:', e);
    }
  }
  return getFirestore();
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * GET /api/cron/marketing-drip
 * Sends Day 2 (48h) and Day 4 (96h) drip emails to mobile setup-link leads.
 * Auth: Authorization: Bearer CRON_SECRET or x-vercel-cron.
 * Test: ?test=1 + MARKETING_DRIP_TEST_EMAIL set → send both emails to that address only.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[marketing-drip] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1';
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const testEmail = process.env.MARKETING_DRIP_TEST_EMAIL?.trim();
  const searchParams = new URL(request.url).searchParams;
  const isTest = searchParams.get('test') === '1';

  if (isTest && testEmail) {
    const day2Result = await sendStackRevealEmail(testEmail, DAY2_SUBJECT, getDay2Html());
    await delay(600);
    const day4Result = await sendStackRevealEmail(testEmail, DAY4_SUBJECT, getDay4Html());
    return NextResponse.json({
      test: true,
      to: testEmail,
      day2: day2Result.error ? { error: day2Result.error } : { id: day2Result.id },
      day4: day4Result.error ? { error: day4Result.error } : { id: day4Result.id },
    });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 503 });
  }

  const db = getDb();
  const now = Date.now();
  const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000);
  const ninetySixHoursAgo = new Date(now - 96 * 60 * 60 * 1000);
  const ts48 = Timestamp.fromDate(fortyEightHoursAgo);
  const ts96 = Timestamp.fromDate(ninetySixHoursAgo);

  let day2Sent = 0;
  let day4Sent = 0;

  const ref = db.collection('mobileLeads');

  // Day 2: createdAt <= 48h ago, day2EmailSent === false
  const day2Snap = await ref.where('createdAt', '<=', ts48).get();
  for (const doc of day2Snap.docs) {
    const data = doc.data();
    if (data?.day2EmailSent === true) continue;
    const email = data?.email;
    if (!email || typeof email !== 'string') continue;
    const result = await sendStackRevealEmail(email, DAY2_SUBJECT, getDay2Html());
    if (result.error) {
      console.warn('[marketing-drip] Day 2 failed for', email, result.error);
      continue;
    }
    await doc.ref.update({ day2EmailSent: true });
    day2Sent++;
    await delay(600);
  }

  // Day 4: createdAt <= 96h ago, day4EmailSent === false
  const day4Snap = await ref.where('createdAt', '<=', ts96).get();
  for (const doc of day4Snap.docs) {
    const data = doc.data();
    if (data?.day4EmailSent === true) continue;
    const email = data?.email;
    if (!email || typeof email !== 'string') continue;
    const result = await sendStackRevealEmail(email, DAY4_SUBJECT, getDay4Html());
    if (result.error) {
      console.warn('[marketing-drip] Day 4 failed for', email, result.error);
      continue;
    }
    await doc.ref.update({ day4EmailSent: true });
    day4Sent++;
    await delay(600);
  }

  return NextResponse.json({
    day2Sent,
    day4Sent,
    summary: `Day 2: ${day2Sent}, Day 4: ${day4Sent}`,
  });
}
