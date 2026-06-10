import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
  LANDING_VARIANT_TEST_ID,
  type LandingPageVariant,
  parseLandingVariantParam,
} from '@/lib/landing-retail-variant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const ALLOWED_EVENT_TYPES = [
  'exposure',
  'bounce',
  'csv_aha',
  'checkout_start',
] as const;

type LandingAbEventType = (typeof ALLOWED_EVENT_TYPES)[number];

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
 * POST /api/analytics/landing-ab-event
 * Cohort telemetry for retail landing A/B (admin dashboard).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = body.eventType as LandingAbEventType;
    const landingVariant = parseLandingVariantParam(body.landingVariant) as LandingPageVariant | null;

    if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'invalid eventType' }, { status: 400 });
    }
    if (!landingVariant) {
      return NextResponse.json({ error: 'landingVariant required' }, { status: 400 });
    }

    const path = typeof body.path === 'string' ? body.path.trim().slice(0, 200) : '/';
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim().slice(0, 120) : null;
    const utmSource = typeof body.utm_source === 'string' ? body.utm_source.slice(0, 120) : null;
    const utmMedium = typeof body.utm_medium === 'string' ? body.utm_medium.slice(0, 120) : null;
    const utmCampaign = typeof body.utm_campaign === 'string' ? body.utm_campaign.slice(0, 120) : null;

    const db = getDb();
    await db.collection('landingAbEvents').add({
      testId: LANDING_VARIANT_TEST_ID,
      eventType,
      landingVariant,
      path,
      sessionId,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('[landing-ab-event]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
