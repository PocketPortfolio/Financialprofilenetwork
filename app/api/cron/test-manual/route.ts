import { NextResponse } from 'next/server';
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
  // Verify this is an authorized request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  // Verify authentication
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

