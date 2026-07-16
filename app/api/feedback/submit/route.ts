import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { createHash, createHmac } from 'crypto';
import { scrubFeedbackText } from '@/app/lib/feedback/scrub';
import type {
  FeedbackCategory,
  FeedbackFriction,
  FeedbackSeverityClass,
  FeedbackSurface,
  FeedbackTierBand,
} from '@/app/lib/feedback/types';
import { checkKvRateLimit } from '@/app/lib/server/kv-rate-limit';
import { sendFeedbackP0AlertEmail } from '@/lib/stack-reveal/resend';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';
import { resolvePaidTierFromStripeEmail } from '@/app/lib/server/stripe-paid-tier';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
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

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === 'number' ? n : Number.parseInt(String(n ?? ''), 10);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

function isValidFriction(v: unknown): v is FeedbackFriction {
  return v === 'frictionless' || v === 'broken';
}

function isValidSurface(v: unknown): v is FeedbackSurface {
  return v === 'pocket' || v === 'open';
}

function inferSeverity(params: {
  rating: number;
  friction: FeedbackFriction;
  category: FeedbackCategory;
  comment: string;
}): FeedbackSeverityClass {
  const breakCats = new Set<FeedbackCategory>([
    'break_parser_failure',
    'break_context_missed_data',
    'break_quotes_or_market_data',
    'break_auth_or_sync',
  ]);
  if (params.friction === 'broken') return 'P0';
  if (params.rating <= 2 && breakCats.has(params.category)) return 'P0';
  // Lexical safety net. Intentionally small & non-exhaustive.
  const t = params.comment.toLowerCase();
  const parserLex = ['parser failed', 'import failed', 'column mapping', 'unknown column', 'invalid header', 'csv failed'];
  if (breakCats.has(params.category) && parserLex.some((p) => t.includes(p))) return 'P0';
  if (params.rating <= 3 && breakCats.has(params.category)) return 'P1';
  return 'P2';
}

function anonUserHashFromUid(uid: string): string {
  const pepper =
    process.env.FEEDBACK_ANON_PEPPER?.trim() ||
    process.env.ENCRYPTION_SECRET?.trim() ||
    '';
  if (pepper.length >= 16) {
    return createHmac('sha256', pepper).update(uid).digest('hex').slice(0, 48);
  }
  return createHash('sha256').update(uid).digest('hex').slice(0, 48);
}

function tierBandFromTier(tier: string | null | undefined): FeedbackTierBand {
  if (tier === 'foundersClub') return 'foundersClub';
  if (tier === 'corporateSponsor') return 'corporateSponsor';
  if (tier == null) return 'free';
  return 'unknown';
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function postWebhook(url: string, payload: unknown): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, status: res.status, error: `webhook_non_2xx_${res.status}` };
    return { ok: true, status: res.status };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'webhook_failed' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = (decoded as { email?: string }).email ?? null;

    const body = await request.json().catch(() => ({}));
    const surfaceRaw = body?.surface;
    const surface: FeedbackSurface = isValidSurface(surfaceRaw) ? surfaceRaw : 'pocket';

    const rating = clampInt(body?.rating, 1, 5, 5);
    const friction: FeedbackFriction = isValidFriction(body?.friction) ? body.friction : 'frictionless';
    const category = typeof body?.category === 'string' ? (body.category as FeedbackCategory) : 'other';
    const commentRaw = typeof body?.comment === 'string' ? body.comment : '';
    const dashboardVisitCount =
      typeof body?.dashboardVisitCount === 'number' && Number.isFinite(body.dashboardVisitCount)
        ? Math.max(0, Math.trunc(body.dashboardVisitCount))
        : null;

    if (!commentRaw.trim()) {
      return NextResponse.json({ error: 'comment is required' }, { status: 400 });
    }

    const scrubbed = scrubFeedbackText(commentRaw, { maxChars: 4000 });
    const severityClass = inferSeverity({
      rating,
      friction,
      category,
      comment: scrubbed.text,
    });

    let tier: string | null = null;
    try {
      if (email) {
        const paid = await resolvePaidTierFromStripeEmail(email);
        const effective = getEffectivePaidTier(paid);
        tier = effective.tier;
      }
    } catch {
      // tier resolution is best-effort
    }
    const tierBand = tierBandFromTier(tier);

    const anonUserHash = anonUserHashFromUid(uid);
    const db = getDb();
    const createdAt = Timestamp.now();

    const submissionDoc = await db.collection('feedbackSubmissions').add({
      createdAt,
      surface,
      rating,
      friction,
      category,
      commentScrubbed: scrubbed.text,
      commentScrubMeta: scrubbed.meta,
      anonUserHash,
      tierBand,
      dashboardVisitWindow: dashboardVisitCount == null ? null : { windowDays: 7, count: dashboardVisitCount },
      appVersion: request.headers.get('x-app-version') || null,
    });

    // Dedup gate for P0 alerts: allow 1 per (anonHash, category) per 24h
    let dedupedAlert = false;
    if (severityClass === 'P0') {
      const rl = await checkKvRateLimit(
        'feedback:p0',
        `${anonUserHash}:${category}`,
        1,
        24 * 60 * 60
      );
      dedupedAlert = !rl.allowed;
    }

    await db.collection('feedbackEvents').add({
      createdAt,
      surface,
      rating,
      friction,
      category,
      severityClass,
      tierBand,
      dedupedAlert,
    });

    if (severityClass === 'P0' && !dedupedAlert) {
      const inbox = (process.env.FEEDBACK_ENGINEERING_EMAIL ?? 'ai@pocketportfolio.app')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const subject = `[P0 Feedback] ${category} · rating ${rating}/5 · ${friction}`;
      const excerpt = scrubbed.text.slice(0, 380);
      const html = `
        <p><strong>Severity:</strong> P0</p>
        <p><strong>Surface:</strong> ${escapeHtml(surface)}</p>
        <p><strong>Category:</strong> ${escapeHtml(category)}</p>
        <p><strong>Rating:</strong> ${rating}/5</p>
        <p><strong>Outcome:</strong> ${escapeHtml(friction)}</p>
        <p><strong>Tier band:</strong> ${escapeHtml(tierBand)}</p>
        <p><strong>Anon hash:</strong> <code>${escapeHtml(anonUserHash)}</code></p>
        <p><strong>Submission:</strong> <code>${escapeHtml(submissionDoc.id)}</code></p>
        <hr/>
        <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;">${escapeHtml(excerpt)}</pre>
        <p style="margin-top:14px;color:#6b7280;font-size:12px;">Scrubbed excerpt only. Full triage in admin.</p>
      `;

      const deliveryRef = db.collection('feedbackAlertDeliveries').doc();
      const webhookUrl = process.env.FEEDBACK_P0_WEBHOOK_URL?.trim() || '';

      const emailResult = await sendFeedbackP0AlertEmail({
        to: inbox,
        subject,
        html,
        replyTo: email ?? undefined,
      });

      const webhookResult = webhookUrl
        ? await postWebhook(webhookUrl, {
            kind: 'feedback_p0',
            surface,
            category,
            rating,
            friction,
            tierBand,
            anonUserHash,
            submissionId: submissionDoc.id,
            createdAt: new Date().toISOString(),
            excerpt,
          })
        : { ok: false, error: 'webhook_not_configured' };

      await deliveryRef.set({
        createdAt,
        submissionId: submissionDoc.id,
        surface,
        category,
        anonUserHash,
        email: {
          to: inbox,
          ok: !emailResult.error,
          id: emailResult.id ?? null,
          error: emailResult.error ?? null,
        },
        webhook: {
          ok: webhookResult.ok,
          status: webhookResult.status ?? null,
          error: webhookResult.error ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true, id: submissionDoc.id, severityClass, dedupedAlert });
  } catch (e: any) {
    console.error('[feedback submit] error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to submit feedback' }, { status: 500 });
  }
}

