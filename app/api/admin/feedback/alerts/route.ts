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
    const snap = await db.collection('feedbackAlertDeliveries').orderBy('createdAt', 'desc').limit(limit).get();
    const alerts = snap.docs.map((doc) => {
      const d = doc.data() as any;
      return {
        id: doc.id,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
        submissionId: d.submissionId ?? null,
        surface: d.surface ?? null,
        category: d.category ?? null,
        anonUserHash: d.anonUserHash ?? null,
        email: d.email ?? null,
        webhook: d.webhook ?? null,
      };
    });
    return NextResponse.json({ ok: true, alerts });
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500;
    if (status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (status === 403)
      return NextResponse.json(
        { error: 'Forbidden', code: e?.code ?? 'ADMIN_CLAIM_REQUIRED' },
        { status: 403 }
      );
    console.error('[admin feedback alerts] error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

