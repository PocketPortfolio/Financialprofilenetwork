import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { SocialScheduler } from '@/lib/social/scheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Manual trigger to post the current research post
 * Use this to fix the timing issue and post the correct current research
 */
export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    console.log('[METRONOME] Manually triggering Research Drop for current post...');
    const scheduler = new SocialScheduler();
    const result = await scheduler.postResearchDrop();

    return NextResponse.json({
      success: result.success,
      tweetId: result.tweetId,
      error: result.error,
      timestamp: new Date().toISOString(),
      testType: 'manual-research-drop-current',
    });
  } catch (error: any) {
    console.error('[CRON] Manual Research Drop error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

