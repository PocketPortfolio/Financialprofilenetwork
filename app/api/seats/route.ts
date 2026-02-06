import { NextRequest, NextResponse } from 'next/server';
import { verifySeatAuth, getDb } from '@/app/lib/seats/verifyAuth';
import { getSyncEntitlements } from '@/app/lib/utils/syncEntitlements';
import type { Tier } from '@/app/lib/utils/syncEntitlements';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seats
 * List seat allocations for the authenticated owner. Returns maxSeats, usedSeats, allocations.
 */
export async function GET(request: NextRequest) {
  const auth = await verifySeatAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  const db = getDb();
  const ownerTierDoc = await db.collection('apiKeysByEmail').doc(auth.email).get();
  const tier = (ownerTierDoc.exists ? ownerTierDoc.data()?.tier : null) as Tier | undefined;
  const entitlements = getSyncEntitlements(tier ?? null);
  const maxSeats = entitlements.seats;

  if (maxSeats === 0) {
    return NextResponse.json({
      maxSeats: 0,
      usedSeats: 0,
      allocations: [],
    });
  }

  const snapshot = await db
    .collection('seatAllocations')
    .where('ownerId', '==', auth.uid)
    .get();

  const allocations = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      memberEmail: d.memberEmail,
      status: d.status,
      createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
      memberUserId: d.memberUserId ?? null,
    };
  });

  return NextResponse.json({
    maxSeats,
    usedSeats: allocations.length,
    allocations,
  });
}
