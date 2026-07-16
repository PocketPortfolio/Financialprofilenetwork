import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

async function requireAdmin(request: NextRequest): Promise<{ uid: string; email?: string }> {
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
  return { uid: decoded.uid, email: tokenEmail };
}

function clampStr(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => ({}));

    const action = clampStr(body?.action, 32);
    const surface = clampStr(body?.surface, 16);
    const receiptId = clampStr(body?.receiptId, 120);

    const db = getDb();

    if (action === 'unfeature') {
      if (!receiptId) return NextResponse.json({ error: 'receiptId required' }, { status: 400 });
      const receiptRef = db.collection('featuredReceipts').doc(receiptId);
      const receiptSnap = await receiptRef.get();
      const receiptData = receiptSnap.data() as { sourceSubmissionId?: string; surface?: string } | undefined;
      await receiptRef.delete();

      const linkedSubmissionId = receiptData?.sourceSubmissionId;
      const linkedSurface = receiptData?.surface;
      if (linkedSubmissionId && (linkedSurface === 'pocket' || linkedSurface === 'open')) {
        const subRef = db.collection('feedbackSubmissions').doc(linkedSubmissionId);
        const subSnap = await subRef.get();
        if (subSnap.exists) {
          const sub = subSnap.data() as { featuredReceiptIds?: Record<string, string | null> } | undefined;
          const featuredReceiptIds = { ...(sub?.featuredReceiptIds ?? {}) };
          if (featuredReceiptIds[linkedSurface] === receiptId) {
            featuredReceiptIds[linkedSurface] = null;
          }
          await subRef.set({ featuredReceiptIds, lastCuratedAt: Timestamp.now() }, { merge: true });
        }
      }

      return NextResponse.json({ ok: true });
    }

    const quote = clampStr(body?.quote, 600);
    const tagline = clampStr(body?.tagline, 120) || null;
    const rating = typeof body?.rating === 'number' && Number.isFinite(body.rating) ? body.rating : null;
    const expiresAtIso = clampStr(body?.expiresAt, 64) || null;
    const submissionId = clampStr(body?.submissionId, 120) || null;

    if (surface !== 'pocket' && surface !== 'open') {
      return NextResponse.json({ error: 'surface must be pocket or open' }, { status: 400 });
    }
    if (!quote) return NextResponse.json({ error: 'quote required' }, { status: 400 });

    const now = Timestamp.now();
    const expiresAt = expiresAtIso ? Timestamp.fromDate(new Date(expiresAtIso)) : null;
    if (expiresAtIso && Number.isNaN(expiresAt?.toDate?.().getTime?.() ?? NaN)) {
      return NextResponse.json({ error: 'expiresAt must be ISO date string' }, { status: 400 });
    }

    if (action === 'create') {
      if (submissionId) {
        const subRef = db.collection('feedbackSubmissions').doc(submissionId);
        const subSnap = await subRef.get();
        if (subSnap.exists) {
          const sub = subSnap.data() as { featuredReceiptIds?: Record<string, string | null> } | undefined;
          const existingId = sub?.featuredReceiptIds?.[surface];
          if (existingId) {
            return NextResponse.json(
              { error: `Submission already featured on ${surface}` },
              { status: 409 }
            );
          }
        }
      }

      const doc = await db.collection('featuredReceipts').add({
        surface,
        quote,
        tagline,
        rating,
        featuredAt: now,
        lastEditedAt: now,
        expiresAt,
        ...(submissionId ? { sourceSubmissionId: submissionId } : {}),
      });

      if (submissionId) {
        const subRef = db.collection('feedbackSubmissions').doc(submissionId);
        const subSnap = await subRef.get();
        if (subSnap.exists) {
          const sub = subSnap.data() as { featuredReceiptIds?: Record<string, string | null> } | undefined;
          const featuredReceiptIds = { ...(sub?.featuredReceiptIds ?? {}) };
          featuredReceiptIds[surface] = doc.id;
          await subRef.set({ featuredReceiptIds, lastCuratedAt: now }, { merge: true });
        }
      }

      return NextResponse.json({ ok: true, id: doc.id });
    }

    if (action === 'update') {
      if (!receiptId) return NextResponse.json({ error: 'receiptId required' }, { status: 400 });
      await db.collection('featuredReceipts').doc(receiptId).set(
        {
          surface,
          quote,
          tagline,
          rating,
          lastEditedAt: now,
          expiresAt,
        },
        { merge: true }
      );
      return NextResponse.json({ ok: true, id: receiptId });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500;
    if (status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (status === 403)
      return NextResponse.json(
        { error: 'Forbidden', code: e?.code ?? 'ADMIN_CLAIM_REQUIRED' },
        { status: 403 }
      );
    console.error('[admin feedback curate] error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

