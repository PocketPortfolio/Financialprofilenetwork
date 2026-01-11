import { NextResponse } from 'next/server';
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
  // Verify this is a Vercel Cron request
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

