/**
 * Daily viral announcement email (Resend). Vercel cron: 10:15 UTC (staggered from marketing-drip at 10:00).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Resend } from 'resend';
import {
  buildViralMomentAnnounceHtml,
  getViralMomentAnnounceFrom,
  VIRAL_MOMENT_ANNOUNCE_SUBJECT,
} from '@/lib/marketing/viral-moment-announce-email';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';
import { recordViralMomentBlastRun } from '@/lib/marketing/viral-moment-blast-stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
/** Large backfills: raise on Vercel Pro if needed. */
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

async function sendViralMomentEmail(opts: { resend: Resend; to: string; firstName: string }) {
  return opts.resend.emails.send({
    from: getViralMomentAnnounceFrom(),
    to: opts.to,
    subject: VIRAL_MOMENT_ANNOUNCE_SUBJECT,
    html: buildViralMomentAnnounceHtml(opts.firstName),
    tags: [{ name: 'campaign', value: 'viral_moment_v1_cron' }],
  } as any);
}

function parseAuthCreationMs(u: { metadata?: { creationTime?: string } }): number | null {
  const raw = u.metadata?.creationTime;
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : t;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Viral Moment Blast] CRON_SECRET not configured');
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
    : Number(process.env.VIRAL_MOMENT_BLAST_MAX_SENDS || 50);

  const maxEvaluatedParam = searchParams.get('maxEvaluated');
  const maxEvalFromQuery =
    maxEvaluatedParam != null && maxEvaluatedParam !== '' ? Number(maxEvaluatedParam) : NaN;
  const maxEvaluated = Number.isFinite(maxEvalFromQuery)
    ? Math.max(1, Math.floor(maxEvalFromQuery))
    : Number(process.env.VIRAL_MOMENT_BLAST_MAX_EVALUATED || 5000);

  const recentDaysParam = searchParams.get('recentDays');
  const recentDays =
    recentDaysParam != null && recentDaysParam !== '' ? Number(recentDaysParam) : NaN;
  const recentCutoffMs =
    Number.isFinite(recentDays) && recentDays > 0
      ? Date.now() - Math.floor(recentDays) * 86_400_000
      : null;

  const db = getDb();
  const auth = getAuth();
  const resend = new Resend(resendApiKey);
  const usersRef = db.collection('users');

  let totalEvaluated = 0;
  let suppressed = 0;
  let sent = 0;
  let skippedRecentWindow = 0;

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

        if (recentCutoffMs != null) {
          const createdMs = parseAuthCreationMs(u);
          if (createdMs != null && createdMs < recentCutoffMs) {
            skippedRecentWindow++;
            continue;
          }
        }

        totalEvaluated++;

        const docRef = usersRef.doc(u.uid);
        const snap = await docRef.get();
        const data = snap.exists ? snap.data() : null;

        const marketingOptIn = data?.marketingOptIn !== false;
        const alreadySent = !!data?.viralMomentV1AnnounceEmailSentAt;
        const alreadyClaimed = !!data?.viralMomentV1AnnounceEmailClaimAt;

        if (!marketingOptIn || alreadySent || alreadyClaimed) {
          suppressed++;
          continue;
        }

        const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
        const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
        if (getEffectivePaidTier(apiKeyData).isPaid) {
          suppressed++;
          continue;
        }

        const claimed = await db.runTransaction(async (tx) => {
          const fresh = await tx.get(docRef);
          const freshData = fresh.exists ? fresh.data() : {};

          const freshSentAt = freshData?.viralMomentV1AnnounceEmailSentAt;
          const freshClaimedAt = freshData?.viralMomentV1AnnounceEmailClaimAt;

          if (freshSentAt || freshClaimedAt) return false;

          tx.set(
            docRef,
            {
              viralMomentV1AnnounceEmailClaimAt: Timestamp.now(),
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

          const result = await sendViralMomentEmail({ resend, to: email, firstName });
          if ((result as any)?.error) {
            throw new Error((result as any).error.message || 'Resend send failed');
          }

          await docRef.set(
            {
              viralMomentV1AnnounceEmailSentAt: Timestamp.now(),
              viralMomentV1AnnounceEmailClaimAt: null,
            },
            { merge: true }
          );

          sent++;
          await new Promise((r) => setTimeout(r, 600));
        } catch (sendErr) {
          console.error('[Viral Moment Blast] Send failed for', email, sendErr);
          await docRef.set({ viralMomentV1AnnounceEmailClaimAt: null }, { merge: true });
        }
      }
    } while (nextPageToken && sent < maxSends && totalEvaluated < maxEvaluated);

    const payload = {
      success: true,
      totalEvaluated,
      suppressed,
      skippedRecentWindow,
      sent,
      maxSends,
      maxEvaluated,
      recentDaysFilter:
        Number.isFinite(recentDays) && recentDays > 0 ? Math.floor(recentDays) : null,
      isTestRun,
      timestamp: new Date().toISOString(),
    };

    console.log('[Viral Moment Blast] Evaluated:', totalEvaluated);
    console.log('[Viral Moment Blast] Suppressed (opt-out / sent / claim / paid):', suppressed);
    console.log('[Viral Moment Blast] Skipped (outside recentDays window):', skippedRecentWindow);
    console.log('[Viral Moment Blast] Sent:', sent);

    if (!isTestRun) {
      try {
        await recordViralMomentBlastRun(db, {
          sent,
          suppressed,
          totalEvaluated,
          skippedRecentWindow,
        });
      } catch (aggErr) {
        console.error('[Viral Moment Blast] Failed to record admin stats:', aggErr);
      }
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('[Viral Moment Blast] Fatal error:', err);
    return NextResponse.json(
      { error: err?.message || 'Viral moment blast cron failed' },
      { status: 500 }
    );
  }
}
