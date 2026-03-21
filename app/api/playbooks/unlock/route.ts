import { NextResponse } from 'next/server';

/**
 * Sets an httpOnly cookie after validating PLAYBOOK_GATE_SECRET.
 * When PLAYBOOK_GATE_SECRET is unset, returns 400 (gate should not be shown).
 */
export async function POST(request: Request) {
  const expected = process.env.PLAYBOOK_GATE_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: 'Playbook gate is not configured on this deployment.' },
      { status: 400 }
    );
  }

  let body: { secret?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const provided = typeof body.secret === 'string' ? body.secret.trim() : '';
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('pp_playbook_gate', 'verified', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
