/**
 * User preferences API (server-only user doc: users/{uid}).
 * GET: return allowed preference fields (e.g. weekly_snapshot_enabled).
 * PATCH: merge allowed preference fields.
 * Requires Authorization: Bearer <firebaseIdToken>.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function getUidFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return Promise.resolve(null);
  return getAuth()
    .verifyIdToken(token)
    .then((decoded) => decoded.uid)
    .catch(() => null);
}

/**
 * GET /api/user/preferences
 * Returns preference fields for the authenticated user. Defaults: weekly_snapshot_enabled = true.
 */
export async function GET(request: NextRequest) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const docRef = db.collection('users').doc(uid);
  const snap = await docRef.get();
  const data = snap.data();

  const weekly_snapshot_enabled = data?.weekly_snapshot_enabled !== false;

  return NextResponse.json({
    weekly_snapshot_enabled,
  });
}

/**
 * PATCH /api/user/preferences
 * Body: { weekly_snapshot_enabled?: boolean }
 * Merges allowed fields into users/{uid}.
 */
export async function PATCH(request: NextRequest) {
  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.weekly_snapshot_enabled === 'boolean') {
    updates.weekly_snapshot_enabled = body.weekly_snapshot_enabled;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, message: 'No updates' });
  }

  const db = getDb();
  const docRef = db.collection('users').doc(uid);
  await docRef.set({ ...updates, updatedAt: Timestamp.now() }, { merge: true });

  return NextResponse.json({ ok: true, updated: Object.keys(updates) });
}
