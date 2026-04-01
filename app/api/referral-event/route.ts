import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

const MAX_METADATA_KEYS = 12;
const MAX_METADATA_STRLEN = 200;

function sanitizeMetadata(raw: unknown): Record<string, string> | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  const entries = Object.entries(raw as Record<string, unknown>).slice(0, MAX_METADATA_KEYS);
  for (const [k, v] of entries) {
    const key = String(k).replace(/[^\w.-]/g, '_').slice(0, 64);
    if (!key) continue;
    const s = typeof v === 'string' ? v : v != null ? JSON.stringify(v) : '';
    out[key] = s.slice(0, MAX_METADATA_STRLEN);
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, referralCode, source, campaign, metadata } = body;

    if (!action || !referralCode) {
      return NextResponse.json(
        { error: 'action and referralCode are required' },
        { status: 400 }
      );
    }
    if (action !== 'click' && action !== 'conversion') {
      return NextResponse.json(
        { error: 'action must be "click" or "conversion"' },
        { status: 400 }
      );
    }

    const campaignStr =
      typeof campaign === 'string' && campaign.trim()
        ? campaign.trim().slice(0, 128)
        : undefined;
    const meta = sanitizeMetadata(metadata);

    const db = getDb();
    await db.collection('referralEvents').add({
      action,
      referralCode: String(referralCode).slice(0, 64),
      source: source || 'unknown',
      ...(campaignStr ? { campaign: campaignStr } : {}),
      ...(meta ? { metadata: meta } : {}),
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Referral Event]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track referral event' },
      { status: 500 }
    );
  }
}
