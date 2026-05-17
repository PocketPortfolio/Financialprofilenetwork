import { NextResponse } from 'next/server';
import { NEWSROOM_CACHE_SECONDS } from '@/lib/newsroom/constants';
import { getNewsroomPayload } from '@/lib/newsroom/store';

export const runtime = 'nodejs';
export const revalidate = NEWSROOM_CACHE_SECONDS;

export async function GET() {
  try {
    const payload = await getNewsroomPayload();
    const stale = Math.floor(NEWSROOM_CACHE_SECONDS / 2);
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': `public, s-maxage=${NEWSROOM_CACHE_SECONDS}, stale-while-revalidate=${stale}`,
        'X-Newsroom-Source': payload.source,
        'X-Newsroom-Updated': payload.updatedAt,
      },
    });
  } catch (error) {
    console.error('[newsroom] GET failed:', error);
    return NextResponse.json(
      { error: 'Failed to load newsroom briefings' },
      { status: 500 },
    );
  }
}
