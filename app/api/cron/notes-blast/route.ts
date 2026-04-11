/**
 * Portfolio Notes launch email (Resend). Vercel cron: Wednesday 08:00 UTC (see vercel.json).
 * UK local time tracks that as ~09:00 during BST and ~08:00 during GMT—adjust schedule if winter alignment matters.
 * Paid-tier users are included by default; set NOTES_BLAST_EXCLUDE_PAID=1 to mirror viral blast paid skip.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Resend } from 'resend';
import {
  buildNotesLaunchHtml,
  getNotesLaunchFrom,
  NOTES_LAUNCH_SUBJECT,
} from '@/lib/marketing/notes-launch-email';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const maxDuration = 300;

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

async function sendNotesLaunchEmail(opts: { resend: Resend; to: string; firstName: string }) {
  return opts.resend.emails.send({
    from: getNotesLaunchFrom(),
    to: opts.to,
    subject: NOTES_LAUNCH_SUBJECT,
    html: buildNotesLaunchHtml(opts.firstName),
    tags: [{ name: 'campaign', value: 'notes_launch_v1' }],
  } as any);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Notes Blast] CRON_SECRET not configured');
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

  const searchParams = new URL(request.url).searchParams;
  const testEmail = (searchParams.get('email') || '').trim();
  const isTestRun = searchParams.get('test') === '1' && !!testEmail;

  const limitParam = searchParams.get('limit');
  const maxSendsFromQuery = limitParam != null && limitParam !== '' ? Number(limitParam) : NaN;
  const maxSends = Number.isFinite(maxSendsFromQuery)
    ? Math.max(0, Math.floor(maxSendsFromQuery))
    : Number(process.env.NOTES_BLAST_MAX_SENDS || 50);

  const maxEvaluatedParam = searchParams.get('maxEvaluated');
  const maxEvalFromQuery =
    maxEvaluatedParam != null && maxEvaluatedParam !== '' ? Number(maxEvaluatedParam) : NaN;
  const maxEvaluated = Number.isFinite(maxEvalFromQuery)
    ? Math.max(1, Math.floor(maxEvalFromQuery))
    : Number(process.env.NOTES_BLAST_MAX_EVALUATED || 5000);

  /** When "1", mirror viral blast: skip users with an active paid API key. Default: include paid. */
  const excludePaid = process.env.NOTES_BLAST_EXCLUDE_PAID === '1';

  const db = getDb();
  const auth = getAuth();
  const resend = new Resend(resendApiKey);
  const usersRef = db.collection('users');

  let totalEvaluated = 0;
  let suppressed = 0;
  let sent = 0;

  const maxPages = 50;
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

        if (isTestRun && email !== testEmail.toLowerCase()) continue;

        totalEvaluated++;

        const docRef = usersRef.doc(u.uid);
        const snap = await docRef.get();
        const data = snap.exists ? snap.data() : null;

        const marketingOptIn = data?.marketingOptIn !== false;
        const alreadySent = !!data?.notesLaunchV1EmailSentAt;
        const alreadyClaimed = !!data?.notesLaunchV1EmailClaimAt;

        if (!marketingOptIn || alreadySent || alreadyClaimed) {
          suppressed++;
          continue;
        }

        if (excludePaid) {
          const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
          const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
          if (getEffectivePaidTier(apiKeyData).isPaid) {
            suppressed++;
            continue;
          }
        }

        const claimed = await db.runTransaction(async (tx) => {
          const fresh = await tx.get(docRef);
          const freshData = fresh.exists ? fresh.data() : {};

          const freshSentAt = freshData?.notesLaunchV1EmailSentAt;
          const freshClaimedAt = freshData?.notesLaunchV1EmailClaimAt;

          if (freshSentAt || freshClaimedAt) return false;

          tx.set(
            docRef,
            {
              notesLaunchV1EmailClaimAt: Timestamp.now(),
            },
            { merge: true }
          );

          return true;
        });

        if (!claimed) {
          suppressed++;
          continue;
        }

        try {
          const displayName = typeof u.displayName === 'string' ? u.displayName : '';
          const firstName = displayName.trim() ? displayName.trim().split(/\s+/)[0] : '';

          const result = await sendNotesLaunchEmail({ resend, to: email, firstName });
          if ((result as any)?.error) {
            throw new Error((result as any).error.message || 'Resend send failed');
          }

          await docRef.set(
            {
              notesLaunchV1EmailSentAt: Timestamp.now(),
              notesLaunchV1EmailClaimAt: null,
            },
            { merge: true }
          );

          sent++;
          await new Promise((r) => setTimeout(r, 600));
        } catch (sendErr) {
          console.error('[Notes Blast] Send failed for', email, sendErr);
          await docRef.set({ notesLaunchV1EmailClaimAt: null }, { merge: true });
        }
      }
    } while (nextPageToken && sent < maxSends && totalEvaluated < maxEvaluated);

    const payload = {
      success: true,
      totalEvaluated,
      suppressed,
      sent,
      maxSends,
      maxEvaluated,
      isTestRun,
      excludePaid,
      timestamp: new Date().toISOString(),
    };

    console.log('[Notes Blast] Evaluated:', totalEvaluated);
    console.log('[Notes Blast] Suppressed:', suppressed);
    console.log('[Notes Blast] Sent:', sent);

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('[Notes Blast] Fatal error:', err);
    return NextResponse.json(
      { error: err?.message || 'Notes blast cron failed' },
      { status: 500 }
    );
  }
}
