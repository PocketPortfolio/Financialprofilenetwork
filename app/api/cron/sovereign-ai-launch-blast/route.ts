/**
 * Sovereign AI Ask AI launch blast (Resend).
 * Audience: Auth users + waitlist + waitlistLeads + identityGateLeads (+ optional mobileLeads).
 * One-shot: campaign lock campaigns/sovereign_ai_launch_20260810.
 *
 * Vercel cron: Monday 13:00 UTC (= 14:00 BST) — see vercel.json.
 * Test: ?test=1&email=you@example.com
 * Dry-run: ?dryRun=1 (no send; returns deduped count)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp, FieldValue, type Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Resend } from 'resend';
import {
  buildSovereignAiLaunchHtml,
  getSovereignAiLaunchFrom,
  SOVEREIGN_AI_LAUNCH_CAMPAIGN,
  SOVEREIGN_AI_LAUNCH_SUBJECT,
} from '@/lib/marketing/sovereign-ai-launch-email';
import { createUnsubscribeToken } from '@/lib/stack-reveal/unsubscribe-token';
import { EMAIL_ASSET_ORIGIN } from '@/lib/stack-reveal/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const maxDuration = 300;

const CAMPAIGN_DOC = 'campaigns/sovereign_ai_launch_20260810';
const SENT_FIELD = 'sovereignAiLaunchV1EmailSentAt';
const CLAIM_FIELD = 'sovereignAiLaunchV1EmailClaimAt';

type Recipient = {
  email: string;
  firstName: string;
  source: 'users' | 'waitlist' | 'waitlistLeads' | 'identityGateLeads' | 'mobileLeads';
  uid?: string;
  docPath?: string;
};

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

function normalizeEmail(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

function firstNameFrom(rawName: unknown, displayName?: unknown): string {
  const n =
    (typeof rawName === 'string' && rawName.trim()) ||
    (typeof displayName === 'string' && displayName.trim()) ||
    '';
  if (!n) return '';
  return n.split(/\s+/)[0] || '';
}

function unsubscribeUrlForUid(uid: string): string {
  const token = createUnsubscribeToken(uid);
  const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || EMAIL_ASSET_ORIGIN || 'https://www.pocketportfolio.app';
  return `${origin.replace(/\/$/, '')}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

async function collectLeadEmails(
  db: Firestore,
  collectionName: Recipient['source'],
  nameFields: string[],
): Promise<Recipient[]> {
  const out: Recipient[] = [];
  const snap = await db.collection(collectionName).get();
  for (const doc of snap.docs) {
    const data = doc.data() || {};
    if (data[SENT_FIELD] || data.unsubscribed === true || data.status === 'bounced') continue;
    const email = normalizeEmail(data.email);
    if (!email || !email.includes('@')) continue;
    let name: unknown = data.name;
    for (const f of nameFields) {
      if (typeof data[f] === 'string' && data[f].trim()) {
        name = data[f];
        break;
      }
    }
    out.push({
      email,
      firstName: firstNameFrom(name),
      source: collectionName,
      docPath: `${collectionName}/${doc.id}`,
    });
  }
  return out;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Sovereign AI Launch Blast] CRON_SECRET not configured');
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
  const testEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const isTestRun = searchParams.get('test') === '1' && !!testEmail;
  const dryRun = searchParams.get('dryRun') === '1';
  const includeMobile = searchParams.get('includeMobile') !== '0';

  const limitParam = searchParams.get('limit');
  const maxSendsFromQuery = limitParam != null && limitParam !== '' ? Number(limitParam) : NaN;
  const maxSends = Number.isFinite(maxSendsFromQuery)
    ? Math.max(0, Math.floor(maxSendsFromQuery))
    : Number(process.env.SOVEREIGN_AI_LAUNCH_MAX_SENDS || 500);

  const batchSleepMs = Number(process.env.SOVEREIGN_AI_LAUNCH_BATCH_SLEEP_MS || 400);

  const db = getDb();
  const auth = getAuth();

  // Campaign lock (skip for test / dry-run)
  // COMPLETED → abort. IN_PROGRESS → resume (batched maxSends across invocations).
  const campaignRef = db.doc(CAMPAIGN_DOC);
  if (!isTestRun && !dryRun) {
    const lock = await db.runTransaction(async (tx) => {
      const snap = await tx.get(campaignRef);
      const status = snap.exists ? snap.data()?.status : null;
      if (status === 'COMPLETED') {
        return { ok: false as const, status: 'COMPLETED' as string };
      }
      tx.set(
        campaignRef,
        {
          status: 'IN_PROGRESS',
          startedAt: snap.exists ? (snap.data()?.startedAt ?? Timestamp.now()) : Timestamp.now(),
          lastStartedAt: Timestamp.now(),
          campaign: SOVEREIGN_AI_LAUNCH_CAMPAIGN,
        },
        { merge: true },
      );
      return { ok: true as const };
    });
    if (!lock.ok) {
      return NextResponse.json(
        {
          success: false,
          aborted: true,
          reason: `Campaign already ${lock.status}`,
          campaignDoc: CAMPAIGN_DOC,
        },
        { status: 409 },
      );
    }
  }

  const byEmail = new Map<string, Recipient>();

  try {
    // 1) Auth / users
    let nextPageToken: string | undefined;
    let page = 0;
    do {
      page++;
      if (page > 50) break;
      const listResult = await auth.listUsers(1000, nextPageToken);
      nextPageToken = listResult.pageToken;
      for (const u of listResult.users) {
        const email = normalizeEmail(u.email);
        if (!email) continue;
        const docRef = db.collection('users').doc(u.uid);
        const snap = await docRef.get();
        const data = snap.exists ? snap.data() : null;
        if (data?.marketingOptIn === false) continue;
        if (data?.unsubscribed === true || data?.status === 'bounced') continue;
        if (data?.[SENT_FIELD]) continue;
        byEmail.set(email, {
          email,
          firstName: firstNameFrom(data?.firstName, u.displayName),
          source: 'users',
          uid: u.uid,
          docPath: `users/${u.uid}`,
        });
      }
    } while (nextPageToken);

    // 2–4) Funnel collections (CMD names map here)
    const leadBatches = await Promise.all([
      collectLeadEmails(db, 'waitlist', ['name', 'firstName']),
      collectLeadEmails(db, 'waitlistLeads', ['name', 'firstName']),
      collectLeadEmails(db, 'identityGateLeads', ['name', 'firstName']),
      includeMobile
        ? collectLeadEmails(db, 'mobileLeads', ['name', 'firstName'])
        : Promise.resolve([] as Recipient[]),
    ]);

    for (const batch of leadBatches) {
      for (const r of batch) {
        if (!byEmail.has(r.email)) byEmail.set(r.email, r);
      }
    }

    let recipients = Array.from(byEmail.values());
    if (isTestRun) {
      recipients = recipients.filter((r) => r.email === testEmail);
      if (recipients.length === 0) {
        recipients = [
          {
            email: testEmail,
            firstName: firstNameFrom(searchParams.get('firstName') || 'Abba'),
            source: 'users',
          },
        ];
      }
    }

    const sourceCounts = recipients.reduce(
      (acc, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    if (dryRun) {
      if (!isTestRun) {
        await campaignRef.set(
          { status: 'DRY_RUN', dryRunAt: Timestamp.now(), recipientCount: recipients.length, sourceCounts },
          { merge: true },
        );
      }
      return NextResponse.json({
        success: true,
        dryRun: true,
        deduplicatedCount: recipients.length,
        sourceCounts,
        maxSends,
        campaignDoc: CAMPAIGN_DOC,
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 503 });
    }
    const resend = new Resend(resendApiKey);
    const from = getSovereignAiLaunchFrom();

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const r of recipients) {
      if (sent >= maxSends) break;

      // Claim on user / lead doc when present
      if (r.docPath && !isTestRun) {
        const docRef = db.doc(r.docPath);
        const claimed = await db.runTransaction(async (tx) => {
          const fresh = await tx.get(docRef);
          const d = fresh.exists ? fresh.data() : {};
          if (d?.[SENT_FIELD] || d?.[CLAIM_FIELD]) return false;
          tx.set(docRef, { [CLAIM_FIELD]: Timestamp.now() }, { merge: true });
          return true;
        });
        if (!claimed) {
          skipped++;
          continue;
        }
      }

      try {
        const unsub = r.uid ? unsubscribeUrlForUid(r.uid) : undefined;
        const { error } = await resend.emails.send({
          from,
          to: r.email,
          subject: SOVEREIGN_AI_LAUNCH_SUBJECT,
          html: buildSovereignAiLaunchHtml(r.firstName, unsub),
          tags: [{ name: 'campaign', value: SOVEREIGN_AI_LAUNCH_CAMPAIGN }],
          ...(unsub
            ? {
                headers: {
                  'List-Unsubscribe': `<${unsub}>`,
                  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
              }
            : {}),
        } as any);

        if (error) throw new Error(error.message || 'Resend send failed');

        if (r.docPath && !isTestRun) {
          await db.doc(r.docPath).set(
            { [SENT_FIELD]: Timestamp.now(), [CLAIM_FIELD]: FieldValue.delete() },
            { merge: true },
          );
        }

        sent++;
        if (sent % 50 === 0) {
          await campaignRef.set(
            { lastBatchAt: Timestamp.now(), sentSoFar: sent, failedSoFar: failed },
            { merge: true },
          );
        }
        await new Promise((resolve) => setTimeout(resolve, batchSleepMs));
      } catch (e) {
        failed++;
        console.error('[Sovereign AI Launch Blast] send failed', r.email, e);
        if (r.docPath && !isTestRun) {
          await db.doc(r.docPath).set({ [CLAIM_FIELD]: FieldValue.delete() }, { merge: true });
        }
        await campaignRef.collection('logs').add({
          email: r.email,
          source: r.source,
          error: e instanceof Error ? e.message : String(e),
          at: Timestamp.now(),
        });
      }
    }

    if (!isTestRun) {
      // Complete when this run exhausted the eligible list (sent+skipped+failed covered all,
      // or we sent fewer than max because the queue emptied).
      const queueExhausted = sent + failed + skipped >= recipients.length || sent < maxSends;
      await campaignRef.set(
        {
          status: queueExhausted ? 'COMPLETED' : 'IN_PROGRESS',
          completedAt: queueExhausted ? Timestamp.now() : null,
          sent,
          failed,
          skipped,
          deduplicatedCount: recipients.length,
          sourceCounts,
          lastRunAt: Timestamp.now(),
        },
        { merge: true },
      );
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      skipped,
      deduplicatedCount: recipients.length,
      sourceCounts,
      maxSends,
      isTestRun,
      dryRun: false,
      campaignDoc: CAMPAIGN_DOC,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sovereign AI launch blast failed';
    console.error('[Sovereign AI Launch Blast] Fatal:', err);
    if (!isTestRun && !dryRun) {
      try {
        await campaignRef.set(
          { status: 'FAILED', lastError: message, failedAt: Timestamp.now() },
          { merge: true },
        );
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
