import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { ingestNewsroomBriefings } from '@/lib/newsroom/ingest';
import { setNewsroomPayload } from '@/lib/newsroom/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Vercel Cron: ingest UK wealth RSS into KV. Schedule: every 4 hours UTC (see vercel.json newsroom-ingest). */
export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const payload = await ingestNewsroomBriefings();
    const persisted = await setNewsroomPayload(payload);
    revalidateTag('newsroom');

    if (payload.briefings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ingest returned zero briefings — KV not updated',
          count: 0,
          source: payload.source,
          persisted: false,
          updatedAt: payload.updatedAt,
          timestamp: new Date().toISOString(),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      count: payload.briefings.length,
      source: payload.source,
      persisted,
      updatedAt: payload.updatedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] newsroom-ingest error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Ingest failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
