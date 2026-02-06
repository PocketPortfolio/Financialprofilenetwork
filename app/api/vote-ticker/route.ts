import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { tickerVotes } from '@/db/sales/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const searchQuery = typeof body.searchQuery === 'string' ? body.searchQuery.trim().slice(0, 200) : null;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null;

    if (!searchQuery || !email) {
      return NextResponse.json(
        { error: 'searchQuery and email are required' },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    await db.insert(tickerVotes).values({
      searchQuery,
      email,
    });

    return NextResponse.json({ ok: true, message: 'Thanks! We’ll consider adding this ticker.' });
  } catch (error) {
    console.error('[vote-ticker] Error:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
