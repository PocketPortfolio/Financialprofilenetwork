import { NextRequest, NextResponse } from 'next/server';
import { verifySeatAuth, getDb } from '@/app/lib/seats/verifyAuth';
import { getSyncEntitlements } from '@/app/lib/utils/syncEntitlements';
import { applySeatGrant, type InheritedTier } from '@/app/lib/seats/applySeatGrant';
import type { Tier } from '@/app/lib/utils/syncEntitlements';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_INVITES_PER_WINDOW = 10;

/**
 * POST /api/seats/invite
 * Invite a member by email. Owner must have corporateSponsor or foundersClub tier.
 */
export async function POST(request: NextRequest) {
  const auth = await verifySeatAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  const now = Date.now();
  const limitKey = `invite:${auth.uid}`;
  const limit = rateLimitMap.get(limitKey);
  if (limit) {
    if (now > limit.resetTime) {
      rateLimitMap.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      if (limit.count >= MAX_INVITES_PER_WINDOW) {
        return NextResponse.json(
          { error: 'Too many invites. Please try again later.' },
          { status: 429 }
        );
      }
      limit.count++;
      rateLimitMap.set(limitKey, limit);
    }
  } else {
    rateLimitMap.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
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
  if (!memberEmail.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const db = getDb();
  const ownerTierDoc = await db.collection('apiKeysByEmail').doc(auth.email).get();
  const tier = (ownerTierDoc.exists ? ownerTierDoc.data()?.tier : null) as Tier | undefined;

  if (tier !== 'corporateSponsor' && tier !== 'foundersClub') {
    return NextResponse.json(
      { error: 'Only Corporate or Founders Club members can invite seats' },
      { status: 403 }
    );
  }

  const entitlements = getSyncEntitlements(tier as Tier);
  const maxSeats = entitlements.seats;
  if (maxSeats === 0) {
    return NextResponse.json({ error: 'No seats available for your tier' }, { status: 403 });
  }

  const existingSnapshot = await db
    .collection('seatAllocations')
    .where('ownerId', '==', auth.uid)
    .get();

  if (existingSnapshot.size >= maxSeats) {
    return NextResponse.json(
      { error: 'Seat limit reached. You cannot add more members.' },
      { status: 403 }
    );
  }

  const duplicate = existingSnapshot.docs.find(
    (doc) => (doc.data().memberEmail as string).toLowerCase() === memberEmail
  );
  if (duplicate) {
    return NextResponse.json(
      { error: 'This email is already invited', allocationId: duplicate.id },
      { status: 409 }
    );
  }

  const createdAt = new Date();
  const docRef = await db.collection('seatAllocations').add({
    ownerId: auth.uid,
    ownerEmail: auth.email,
    memberEmail,
    memberUserId: null,
    status: 'pending',
    inheritedTier: tier,
    createdAt,
  });

  const inviteeDoc = await db.collection('apiKeysByEmail').doc(memberEmail).get();
  if (inviteeDoc.exists) {
    await applySeatGrant(db, memberEmail, tier as InheritedTier, auth.uid);
    await docRef.update({ status: 'active' });
  }

  return NextResponse.json(
    {
      allocationId: docRef.id,
      memberEmail,
      status: inviteeDoc.exists ? 'active' : 'pending',
    },
    { status: 201 }
  );
}
