import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { SocialScheduler } from '@/lib/social/scheduler';

// Next.js route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * MANUAL TEST ENDPOINT
 * Test autonomous tweet posting manually
 * 
 * Usage: Call this endpoint with CRON_SECRET to test immediately
 * curl -X GET "https://www.pocketportfolio.app/api/cron/test-manual" \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const scheduler = new SocialScheduler();
    
    // Post War Mode update as test
    const result = await scheduler.postWarModeUpdate();

    return NextResponse.json({
      success: result.success,
      tweetId: result.tweetId,
      error: result.error,
      timestamp: new Date().toISOString(),
      message: 'Manual test tweet posted',
      tweetUrl: result.tweetId ? `https://x.com/P0cketP0rtf0li0/status/${result.tweetId}` : null,
    });
  } catch (error: any) {
    console.error('[CRON] Manual test error:', error);
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

