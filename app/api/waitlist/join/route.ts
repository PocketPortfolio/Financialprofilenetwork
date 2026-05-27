import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { checkKvRateLimit, clientIpFromRequest } from '@/app/lib/server/kv-rate-limit';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_SOURCES = new Set(['web:join', 'web:footer', 'web:header']);
const WINDOW_SECONDS = 3600;
const MAX_PER_IP = 10;
const MAX_PER_EMAIL = 5;

function getAdminDb() {
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

function hashId(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 100) : '';
  const region = typeof b.region === 'string' ? b.region.trim().slice(0, 50) : '';
  const role = typeof b.role === 'string' ? b.role.trim().slice(0, 50) : '';
  const source = typeof b.source === 'string' ? b.source.trim() : '';
  const userAgent =
    typeof b.userAgent === 'string'
      ? b.userAgent.trim().slice(0, 512)
      : (request.headers.get('user-agent') || '').slice(0, 512);

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!VALID_SOURCES.has(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const ip = clientIpFromRequest(request);
  const ipHash = hashId(ip);
  const emailHash = hashId(email);

  const [ipLimit, emailLimit] = await Promise.all([
    checkKvRateLimit('waitlist:join:ip', ipHash, MAX_PER_IP, WINDOW_SECONDS),
    checkKvRateLimit('waitlist:join:email', emailHash, MAX_PER_EMAIL, WINDOW_SECONDS),
  ]);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(WINDOW_SECONDS) } },
    );
  }

  try {
    const db = getAdminDb();
    const now = Timestamp.now();
    const docRef = await db.collection('waitlist').add({
      email,
      name,
      region,
      role,
      source,
      userAgent,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      duplicate: false,
      id: docRef.id,
    });
  } catch (e) {
    console.error('[waitlist/join] persist failed:', e);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again later.' },
      { status: 500 },
    );
  }
}
