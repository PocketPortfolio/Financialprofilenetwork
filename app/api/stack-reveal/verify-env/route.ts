/**
 * Verify Vercel Production env for Stack Reveal (no secret values returned).
 * GET with Authorization: Bearer <CRON_SECRET>
 * Returns which required vars are set (true/false only).
 */

import { NextResponse } from 'next/server';

const STACK_REVEAL_VARS = [
  'CRON_SECRET',
  'RESEND_API_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'ENCRYPTION_SECRET',
] as const;

const RECOMMENDED_VARS = ['MAIL_FROM'] as const;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured', verified: false },
      { status: 500 }
    );
  }

  const isAuthorized = authHeader === `Bearer ${cronSecret}`;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized', verified: false },
      { status: 401 }
    );
  }

  const required: Record<string, boolean> = {};
  let requiredOk = true;
  for (const key of STACK_REVEAL_VARS) {
    const set = !!process.env[key];
    required[key] = set;
    if (!set) requiredOk = false;
  }

  const recommended: Record<string, boolean> = {};
  for (const key of RECOMMENDED_VARS) {
    recommended[key] = !!process.env[key];
  }

  const ready = requiredOk;
  return NextResponse.json({
    verified: true,
    ready,
    required,
    recommended,
    note: ready
      ? 'All required Stack Reveal env vars are set. Ensure STACK_REVEAL_TEST_EMAIL is empty in Production to send to real cohort.'
      : 'Set missing required vars in Vercel → Project → Settings → Environment Variables (Production).',
  });
}
