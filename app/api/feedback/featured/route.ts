import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { FeedbackSurface } from '@/app/lib/feedback/types';

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

function isSurface(v: string | null): v is FeedbackSurface {
  return v === 'pocket' || v === 'open';
}

export async function GET(request: NextRequest) {
  try {
    const surfaceParam = request.nextUrl.searchParams.get('surface');
    const surface: FeedbackSurface = isSurface(surfaceParam) ? surfaceParam : 'pocket';

    const db = getDb();
    let snap;
    try {
      snap = await db.collection('featuredReceipts').orderBy('featuredAt', 'desc').limit(120).get();
    } catch {
      // Collection empty or index not yet provisioned — unfiltered read still works.
      snap = await db.collection('featuredReceipts').limit(120).get();
    }

    const receipts = snap.docs
      .map((d) => {
      const data = d.data() as any;
        return {
          id: d.id,
          surface: data.surface,
          quote: data.quote,
          rating: typeof data.rating === 'number' ? data.rating : null,
          tagline: typeof data.tagline === 'string' ? data.tagline : null,
          featuredAt: data.featuredAt?.toDate?.()?.toISOString?.() ?? null,
          lastEditedAt: data.lastEditedAt?.toDate?.()?.toISOString?.() ?? null,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString?.() ?? null,
        };
      })
      .filter((r) => r.surface === surface)
      .sort((a, b) => {
        const ta = a.featuredAt ? Date.parse(a.featuredAt) : 0;
        const tb = b.featuredAt ? Date.parse(b.featuredAt) : 0;
        return tb - ta;
      })
      .slice(0, 24);

    // Filter expired on the server (so public clients never see stale receipts).
    const now = Date.now();
    const fresh = receipts.filter((r) => {
      if (!r.expiresAt) return true;
      const t = Date.parse(r.expiresAt);
      return Number.isFinite(t) ? t > now : true;
    });

    return NextResponse.json({ ok: true, surface, receipts: fresh });
  } catch (e: any) {
    console.error('[feedback featured] error', e);
    return NextResponse.json({ ok: false, error: e?.message ?? 'Failed' }, { status: 500 });
  }
}

