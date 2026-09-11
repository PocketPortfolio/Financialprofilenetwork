import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { ensureFirebaseAdmin } from '@/lib/admin/require-admin-request';

export type AuthedUser = {
  uid: string;
  email?: string;
  admin: boolean;
};

function authError(status: number, code: string, message: string): Error {
  return Object.assign(new Error(message), { status, code });
}

function isAdminDecoded(
  decoded: { admin?: boolean; claims?: { admin?: boolean }; email?: string },
  tokenEmail?: string
): boolean {
  const adminAllowlist = (process.env.ADMIN_EMAIL_OVERRIDE ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowedByClaim =
    decoded.admin === true || decoded.claims?.admin === true;
  const allowedByEmail = Boolean(tokenEmail && adminAllowlist.includes(tokenEmail));
  return allowedByClaim || allowedByEmail;
}

/** Require a valid Firebase ID token (Bearer). */
export async function requireUserRequest(request: NextRequest): Promise<AuthedUser> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    throw authError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  ensureFirebaseAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  const email = (decoded as { email?: string }).email?.toLowerCase?.();
  return {
    uid: decoded.uid,
    email,
    admin: isAdminDecoded(decoded as { admin?: boolean; claims?: { admin?: boolean } }, email),
  };
}

/**
 * Require Bearer auth and that the token email matches `requestedEmail`
 * (or the caller is an admin via claim / ADMIN_EMAIL_OVERRIDE).
 */
export async function requireEmailOwnerOrAdmin(
  request: NextRequest,
  requestedEmail: string
): Promise<AuthedUser> {
  const user = await requireUserRequest(request);
  const target = requestedEmail.trim().toLowerCase();
  if (!target || !target.includes('@')) {
    throw authError(400, 'INVALID_EMAIL', 'Invalid email format');
  }

  if (user.email === target || user.admin) {
    return user;
  }

  throw authError(403, 'FORBIDDEN', 'Forbidden');
}

export function authErrorResponse(error: unknown): Response {
  const err = error as { status?: number; code?: string; message?: string };
  const status = err.status ?? 401;
  return Response.json(
    { error: err.message ?? 'Unauthorized', code: err.code },
    { status }
  );
}
