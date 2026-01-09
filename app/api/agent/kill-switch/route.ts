import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { auditLogs } from '@/db/sales/schema';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/agent/kill-switch
 * Activate or deactivate the emergency stop
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { action } = await request.json();

    if (action !== 'activate' && action !== 'deactivate') {
      return NextResponse.json(
        { error: 'action must be "activate" or "deactivate"' },
        { status: 400 }
      );
    }

    // Log the action
    await db.insert(auditLogs).values({
      action: 'KILL_SWITCH_ACTIVATED',
      aiReasoning: `Emergency stop ${action}d`,
      metadata: { action },
      humanOverride: true,
    });

    // Note: In production, you'd update an environment variable or database flag
    // For now, this is a placeholder that logs the action
    // The actual kill switch check happens in the send-email route via process.env.EMERGENCY_STOP

    return NextResponse.json({
      success: true,
      message: `Emergency stop ${action}d`,
      note: 'Set EMERGENCY_STOP=true in environment variables to activate',
    });
  } catch (error: any) {
    console.error('Error toggling kill switch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle kill switch' },
      { status: 500 }
    );
  }
}






