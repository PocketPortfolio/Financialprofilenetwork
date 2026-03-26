import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Resend } from 'resend';
import { buildSovereignCampaignHtml, SOVEREIGN_CAMPAIGN_SUBJECT } from '@/lib/sovereign-campaign/email-templates';

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

const COLLISION_WINDOW_MS = 172_800_000; // 48 hours

function getFrom() {
  return process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';
}

async function sendOneEmail(opts: {
  resend: Resend;
  to: string;
  firstName: string;
}) {
  return opts.resend.emails.send({
    from: getFrom(),
    to: opts.to,
    subject: SOVEREIGN_CAMPAIGN_SUBJECT,
    html: buildSovereignCampaignHtml(opts.firstName),
    tags: [{ name: 'campaign', value: 'zero_trust_founders' }],
  } as any);
}

export async function GET(request: NextRequest) {
  // Match existing cron auth behavior (case sensitive header key access).
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Sovereign Campaign Cron] CRON_SECRET not configured');
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
  const testEmail = (searchParams.get('email') || process.env.SOVEREIGN_CAMPAIGN_TEST_EMAIL || '').trim();
  const isTestRun = searchParams.get('test') === '1' && !!testEmail;

  const maxEvaluated = Number(process.env.SOVEREIGN_CAMPAIGN_MAX_EVALUATED || 200);
  const maxSends = Number(process.env.SOVEREIGN_CAMPAIGN_MAX_SENDS || 25);

  const db = getDb();
  const auth = getAuth();

  const resend = new Resend(resendApiKey);
  const usersRef = db.collection('users');

  let totalEvaluated = 0;
  let hardSuppressed = 0;
  let softSuppressed = 0;
  let sent = 0;

  const maxPages = 25; // hard stop to avoid pathological loops
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

        // Prefetch doc to compute opt-in/idempotency + soft suppression.
        const snap = await docRef.get();
        const data = snap.exists ? snap.data() : null;

        const marketingOptIn = data?.marketingOptIn !== false;
        const alreadySent = !!data?.zeroTrustCampaignSentAt;
        const alreadyClaimed = !!data?.zeroTrustCampaignClaimedAt;

        if (!marketingOptIn || alreadySent || alreadyClaimed) {
          hardSuppressed++;
          continue;
        }

        // Hard suppression via paid tier.
        const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
        const tier = apiKeyDoc.exists ? (apiKeyDoc.data()?.tier as string | undefined) : undefined;
        const isPaid = tier === 'foundersClub' || tier === 'corporateSponsor';
        if (isPaid) {
          hardSuppressed++;
          continue;
        }

        // Soft suppression via 48h collision check.
        const lastStackMs = (data?.lastStackRevealSentAt as any)?.toMillis?.() ?? 0;
        const lastWeeklyMs = (data?.lastWeeklySnapshotSentAt as any)?.toMillis?.() ?? 0;
        const now = Date.now();
        const collides =
          (!!lastStackMs && now - lastStackMs < COLLISION_WINDOW_MS) ||
          (!!lastWeeklyMs && now - lastWeeklyMs < COLLISION_WINDOW_MS);

        if (collides) {
          softSuppressed++;
          continue;
        }

        // Transactional claim to prevent concurrent sends.
        const claimed = await db.runTransaction(async (tx) => {
          const fresh = await tx.get(docRef);
          const freshData = fresh.exists ? fresh.data() : {};

          const freshSentAt = freshData?.zeroTrustCampaignSentAt;
          const freshClaimedAt = freshData?.zeroTrustCampaignClaimedAt;

          if (freshSentAt || freshClaimedAt) return false;

          tx.set(
            docRef,
            {
              zeroTrustCampaignClaimedAt: Timestamp.now(),
            },
            { merge: true }
          );

          return true;
        });

        if (!claimed) {
          hardSuppressed++;
          continue;
        }

        try {
          const displayName = typeof u.displayName === 'string' ? u.displayName : '';
          const firstName = displayName.trim() ? displayName.trim().split(/\s+/)[0] : '';

          const result = await sendOneEmail({ resend, to: email, firstName });
          if ((result as any)?.error) {
            throw new Error((result as any).error.message || 'Resend send failed');
          }

          // Receipt: mark as sent and clear claim.
          await docRef.set(
            {
              zeroTrustCampaignSentAt: Timestamp.now(),
              zeroTrustCampaignClaimedAt: null,
            },
            { merge: true }
          );

          sent++;
          await new Promise((r) => setTimeout(r, 600));
        } catch (sendErr) {
          console.error('[Sovereign Campaign Cron] Send failed for', email, sendErr);
          // Allow retry on next cron run.
          await docRef.set({ zeroTrustCampaignClaimedAt: null }, { merge: true });
        }
      }
    } while (nextPageToken && sent < maxSends && totalEvaluated < maxEvaluated);

    const responsePayload = {
      success: true,
      totalEvaluated,
      hardSuppressed,
      softSuppressed,
      sent,
      timestamp: new Date().toISOString(),
    };

    // Telemetry (required by the sovereign campaign cron spec).
    console.log('[Sovereign Campaign Cron] Total Users Evaluated:', totalEvaluated);
    console.log('[Sovereign Campaign Cron] Hard Suppressed (Paid/Idempotent):', hardSuppressed);
    console.log('[Sovereign Campaign Cron] Soft Suppressed (Saved for Batch 2):', softSuppressed);
    console.log('[Sovereign Campaign Cron] Successfully Sent & Tagged:', sent);

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('[Sovereign Campaign Cron] Fatal error:', err);
    return NextResponse.json({ error: err?.message || 'Sovereign campaign cron failed' }, { status: 500 });
  }
}

