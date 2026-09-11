import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { SocialScheduler } from '@/lib/social/scheduler';

// Next.js route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * ONE-TIME TEST: 12:30 UK Today
 * Test autonomous tweet posting
 * 
 * Schedule: "30 12 * * *" (12:30 UTC = 12:30 UK in winter/GMT)
 * 
 * This is a test route to verify the system works before full deployment
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
      message: 'One-time test tweet posted at 12:30 UK',
    });
  } catch (error: any) {
    console.error('[CRON] One-time test error:', error);
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

