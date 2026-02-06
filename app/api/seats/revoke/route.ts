import { NextRequest, NextResponse } from 'next/server';
import { verifySeatAuth, getDb } from '@/app/lib/seats/verifyAuth';
import { revokeSeatGrant } from '@/app/lib/seats/applySeatGrant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/seats/revoke
 * Revoke a seat allocation. Body: { "email": string }. Only the owner can revoke.
 */
export async function POST(request: NextRequest) {
  const auth = await verifySeatAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawEmail = body.email;
  if (typeof rawEmail !== 'string' || !rawEmail.trim()) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const memberEmail = rawEmail.trim().toLowerCase();
  const db = getDb();

  const snapshot = await db
    .collection('seatAllocations')
    .where('ownerId', '==', auth.uid)
    .where('memberEmail', '==', memberEmail)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
  }

  const doc = snapshot.docs[0];
  await doc.ref.delete();
  await revokeSeatGrant(db, memberEmail, auth.uid);

  return new NextResponse(null, { status: 204 });
}
