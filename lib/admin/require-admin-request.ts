import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';

export function ensureFirebaseAdmin(): void {
  if (getApps().length) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function requireAdminRequest(request: NextRequest): Promise<{ email?: string }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    throw Object.assign(new Error('Unauthorized'), { status: 401, code: 'UNAUTHORIZED' });
  }

  ensureFirebaseAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  const tokenEmail = (decoded as { email?: string }).email?.toLowerCase?.();
  const adminAllowlist = (process.env.ADMIN_EMAIL_OVERRIDE ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowedByClaim =
    (decoded as { admin?: boolean }).admin === true ||
    (decoded as { claims?: { admin?: boolean } }).claims?.admin === true;
  const allowedByEmail = Boolean(tokenEmail && adminAllowlist.includes(tokenEmail));
  if (!allowedByClaim && !allowedByEmail) {
    throw Object.assign(new Error('Forbidden'), { status: 403, code: 'ADMIN_CLAIM_REQUIRED' });
  }
  return { email: tokenEmail };
}
