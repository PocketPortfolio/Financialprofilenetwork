import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

/**
 * POST /api/analytics/monetization-event
 * Fire-and-forget funnel logging for admin dashboard (Ticket E).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = body.eventType === 'checkout_start' ? 'checkout_start' : 'paywall_impression';
    const triggerSource =
      typeof body.trigger_source === 'string' ? body.trigger_source.trim().slice(0, 200) : 'unknown';
    const pagePath =
      typeof body.page_path === 'string' ? body.page_path.trim().slice(0, 500) : '';
    const sessionId =
      typeof body.session_id === 'string' ? body.session_id.trim().slice(0, 120) : '';

    const db = getDb();
    await db.collection('monetizationFunnelEvents').add({
      eventType,
      trigger_source: triggerSource,
      page_path: pagePath || null,
      session_id: sessionId || null,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('[monetization-event]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
