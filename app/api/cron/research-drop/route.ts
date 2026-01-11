import { NextResponse } from 'next/server';
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
  // Verify this is a Vercel Cron request
  // Vercel sends: Authorization: Bearer ${CRON_SECRET}
  // Also check for x-vercel-cron header as backup
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  // Verify authentication - Vercel sends Bearer token OR x-vercel-cron header
  const isAuthorized = 
    authHeader === `Bearer ${cronSecret}` || 
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1'; // Vercel sometimes sends '1' as a signal

  if (!isAuthorized) {
    console.warn('[CRON] Unauthorized request:', {
      hasAuthHeader: !!authHeader,
      hasVercelCron: !!vercelCronHeader,
      userAgent: request.headers.get('user-agent'),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

