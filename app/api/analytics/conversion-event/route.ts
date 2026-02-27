import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const ALLOWED_EVENTS = ['lead_magnet_clicked', 'mobile_setup_requested', 'quota_upgrade_initiated'] as const;

function getDb() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (e) {
      console.error('[conversion-event] Firebase init error:', e);
    }
  }
  return getFirestore();
}

/**
 * POST /api/analytics/conversion-event
 * Logs funnel events for /admin/analytics (in addition to GA4).
 * Body: { event: 'lead_magnet_clicked' | 'mobile_setup_requested' | 'quota_upgrade_initiated', ticker?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const event = typeof body.event === 'string' ? body.event.trim() : '';
    const ticker = typeof body.ticker === 'string' ? body.ticker.trim().toUpperCase().slice(0, 20) : undefined;

    if (!event || !ALLOWED_EVENTS.includes(event as (typeof ALLOWED_EVENTS)[number])) {
      return NextResponse.json(
        { error: 'event must be one of: lead_magnet_clicked, mobile_setup_requested, quota_upgrade_initiated' },
        { status: 400 }
      );
    }

    const db = getDb();
    await db.collection('conversionEvents').add({
      event,
      ...(ticker ? { ticker } : {}),
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[conversion-event]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track conversion event' },
      { status: 500 }
    );
  }
}
