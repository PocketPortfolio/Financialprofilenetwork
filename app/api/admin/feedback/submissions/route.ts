import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

async function requireAdmin(request: NextRequest): Promise<void> {
  getDb(); // must init Admin SDK before getAuth()
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  const decoded = await getAuth().verifyIdToken(token);
  const tokenEmail = (decoded as { email?: string }).email?.toLowerCase?.();
  const adminAllowlist = (process.env.ADMIN_EMAIL_OVERRIDE ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowedByClaim = !!decoded.claims?.admin;
  const allowedByEmail = tokenEmail && adminAllowlist.includes(tokenEmail);
  if (!allowedByClaim && !allowedByEmail) {
    throw Object.assign(new Error('Forbidden'), { status: 403, code: 'ADMIN_CLAIM_REQUIRED' });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const db = getDb();
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = Math.max(10, Math.min(500, Number.parseInt(String(limitParam ?? ''), 10) || 200));
    const snap = await db.collection('feedbackSubmissions').orderBy('createdAt', 'desc').limit(limit).get();
    let featuredBySubmission = new Map<string, { pocket: string | null; open: string | null }>();
    try {
      const featuredSnap = await db.collection('featuredReceipts').limit(200).get();
      for (const doc of featuredSnap.docs) {
        const data = doc.data() as { sourceSubmissionId?: string; surface?: string; quote?: string };
        const submissionId = data.sourceSubmissionId;
        const surface = data.surface;
        if (!submissionId || (surface !== 'pocket' && surface !== 'open')) continue;
        const entry = featuredBySubmission.get(submissionId) ?? { pocket: null, open: null };
        entry[surface] = doc.id;
        featuredBySubmission.set(submissionId, entry);
      }
      // Legacy receipts promoted before submission linking — match by quote prefix.
      for (const doc of featuredSnap.docs) {
        const data = doc.data() as { sourceSubmissionId?: string; surface?: string; quote?: string };
        if (data.sourceSubmissionId) continue;
        const surface = data.surface;
        if (surface !== 'pocket' && surface !== 'open') continue;
        const quoteKey = String(data.quote ?? '').slice(0, 120);
        if (!quoteKey) continue;
        for (const subDoc of snap.docs) {
          const subComment = String(subDoc.data().commentScrubbed ?? '').slice(0, 120);
          if (quoteKey !== subComment) continue;
          const entry = featuredBySubmission.get(subDoc.id) ?? { pocket: null, open: null };
          if (!entry[surface]) {
            entry[surface] = doc.id;
            featuredBySubmission.set(subDoc.id, entry);
          }
        }
      }
    } catch {
      // featured index optional during bootstrap
    }

    const submissions = snap.docs.map((doc) => {
      const d = doc.data() as any;
      const storedIds = {
        pocket: d.featuredReceiptIds?.pocket ?? null,
        open: d.featuredReceiptIds?.open ?? null,
      };
      const linkedIds = featuredBySubmission.get(doc.id);
      const featuredReceiptIds = {
        pocket: storedIds.pocket ?? linkedIds?.pocket ?? null,
        open: storedIds.open ?? linkedIds?.open ?? null,
      };
      return {
        id: doc.id,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        surface: d.surface ?? null,
        rating: typeof d.rating === 'number' ? d.rating : null,
        friction: d.friction ?? null,
        category: d.category ?? null,
        commentScrubbed: d.commentScrubbed ?? '',
        anonUserHash: d.anonUserHash ?? null,
        tierBand: d.tierBand ?? null,
        dashboardVisitWindow: d.dashboardVisitWindow ?? null,
        featuredReceiptIds,
        lastCuratedAt: d.lastCuratedAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    return NextResponse.json({ ok: true, submissions });
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500;
    if (status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (status === 403)
      return NextResponse.json(
        { error: 'Forbidden', code: e?.code ?? 'ADMIN_CLAIM_REQUIRED' },
        { status: 403 }
      );
    console.error('[admin feedback submissions] error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

