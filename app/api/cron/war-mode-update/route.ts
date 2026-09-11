import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { SocialScheduler } from '@/lib/social/scheduler';

// Next.js route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Vercel Cron: 09:00 UK Daily (08:00 UTC in winter, 09:00 UTC in summer)
 * WAR MODE Update - Real-time stats
 * 
 * Schedule: "0 8 * * *" (8:00 UTC = 9:00 UK in winter)
 * 
 * Note: UK timezone changes between GMT (UTC+0) and BST (UTC+1)
 * - Winter (GMT): 09:00 UK = 08:00 UTC
 * - Summer (BST): 09:00 UK = 08:00 UTC (cron runs at 08:00 UTC = 09:00 BST)
 * 
 * For true 09:00 UK year-round, you may need to adjust cron schedule seasonally
 * or use a timezone-aware scheduler.
 */
export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const scheduler = new SocialScheduler();
    const result = await scheduler.postWarModeUpdate();

    return NextResponse.json({
      success: result.success,
      tweetId: result.tweetId,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON] War Mode update error:', error);
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

