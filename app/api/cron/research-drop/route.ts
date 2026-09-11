import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { SocialScheduler } from '@/lib/social/scheduler';

// Next.js route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Vercel Cron: 19:30 UK Daily (18:30 UTC)
 * RESEARCH Drop - Latest research post
 * 
 * Schedule: "30 18 * * *" (18:30 UTC = 19:30 UK in winter)
 * 
 * IMPORTANT: Runs AFTER blog generation (18:00 UTC) to ensure new research post is available
 * - Blog generation: 18:00 UTC
 * - Twitter post: 18:30 UTC (30 min buffer for generation + deployment)
 * - UK Time: 19:30 UK in winter (GMT), 19:30 BST in summer
 */
export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const scheduler = new SocialScheduler();
    const result = await scheduler.postResearchDrop();

    return NextResponse.json({
      success: result.success,
      tweetId: result.tweetId,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON] Research drop error:', error);
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

