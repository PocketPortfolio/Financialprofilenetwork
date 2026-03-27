import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Resend } from 'resend';
import { ABANDONED_CART_SUBJECT, buildAbandonedCartHtml } from '@/lib/lifecycle-monetization/email-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const ABANDON_AFTER_MS = 24 * 60 * 60 * 1000;

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

function getFrom() {
  return process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';
}

function intentHintFromSource(src: string | undefined): string {
  const s = (src || '').toLowerCase();
  if (s.includes('ai') || s.includes('attachment')) return 'your AI insights';
  if (s.includes('risk') || s.includes('csv')) return 'your advanced risk metrics';
  return 'your advanced risk metrics or AI insights';
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[lifecycle-monetization] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1';

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 503 });
  }

  const searchParams = request.nextUrl.searchParams;
  const testEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const isTestRun = searchParams.get('test') === '1' && !!testEmail;

  const maxEvaluated = Number(process.env.LIFECYCLE_MONETIZATION_MAX_EVALUATED || 400);
  const maxSends = Number(process.env.LIFECYCLE_MONETIZATION_MAX_SENDS || 40);

  const db = getDb();
  const auth = getAuth();
  const resend = new Resend(resendApiKey);
  const usersRef = db.collection('users');

  let totalEvaluated = 0;
  let skipped = 0;
  let sent = 0;

  const now = Date.now();
  const cutoff = now - ABANDON_AFTER_MS;

  const maxPages = 30;
  let nextPageToken: string | undefined;
  let page = 0;

  try {
    do {
      page++;
      if (page > maxPages) break;
      if (sent >= maxSends) break;
      if (totalEvaluated >= maxEvaluated) break;

      const listResult = await auth.listUsers(1000, nextPageToken);
      nextPageToken = listResult.pageToken;

      for (const u of listResult.users) {
        if (sent >= maxSends) break;
        if (totalEvaluated >= maxEvaluated) break;

        const emailRaw = typeof u.email === 'string' ? u.email : '';
        const email = emailRaw.trim().toLowerCase();
        if (!email) continue;

        if (isTestRun && email !== testEmail) continue;

        totalEvaluated++;

        const docRef = usersRef.doc(u.uid);
        const snap = await docRef.get();
        const data = snap.exists ? snap.data() : null;

        const marketingOptIn = data?.marketingOptIn !== false;
        if (!marketingOptIn) {
          skipped++;
          continue;
        }

        if (data?.abandonedCartEmailSentAt) {
          skipped++;
          continue;
        }

        const paywallMs = (data?.lastPaywallImpressionAt as Timestamp | undefined)?.toMillis?.() ?? 0;
        const checkoutMs = (data?.lastCheckoutStartAt as Timestamp | undefined)?.toMillis?.() ?? 0;
        const lastIntentMs = Math.max(paywallMs, checkoutMs);
        if (!lastIntentMs || lastIntentMs > cutoff) {
          skipped++;
          continue;
        }

        const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
        const tier = apiKeyDoc.exists ? (apiKeyDoc.data()?.tier as string | undefined) : undefined;
        if (tier === 'foundersClub' || tier === 'corporateSponsor') {
          skipped++;
          continue;
        }

        const triggerSrc = typeof data?.lastIntentTriggerSource === 'string' ? data.lastIntentTriggerSource : '';
        const intentHint = intentHintFromSource(triggerSrc);

        const displayName = typeof u.displayName === 'string' ? u.displayName : '';
        const firstName = displayName.trim() ? displayName.trim().split(/\s+/)[0] : '';

        try {
          const html = buildAbandonedCartHtml({ firstName, intentHint });
          const result = await resend.emails.send({
            from: getFrom(),
            to: email,
            subject: ABANDONED_CART_SUBJECT,
            html,
            tags: [{ name: 'campaign', value: 'abandoned_cart_24h' }],
          } as any);

          if ((result as any)?.error) {
            throw new Error((result as any).error.message || 'Resend send failed');
          }

          await docRef.set({ abandonedCartEmailSentAt: Timestamp.now() }, { merge: true });

          sent++;
          await new Promise((r) => setTimeout(r, 600));
        } catch (sendErr) {
          console.error('[lifecycle-monetization] Send failed for', email, sendErr);
        }
      }
    } while (nextPageToken && sent < maxSends && totalEvaluated < maxEvaluated);

    const payload = {
      success: true,
      totalEvaluated,
      skipped,
      sent,
      timestamp: new Date().toISOString(),
    };
    console.log('[lifecycle-monetization]', payload);
    return NextResponse.json(payload);
  } catch (err: unknown) {
    console.error('[lifecycle-monetization] Fatal', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cron failed' },
      { status: 500 }
    );
  }
}
