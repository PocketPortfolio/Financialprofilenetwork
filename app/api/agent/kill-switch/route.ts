import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorizedResponse, requireAdminRequest } from '@/lib/admin/require-admin-request';
import { db } from '@/db/sales/client';
import { auditLogs } from '@/db/sales/schema';
import { setEmergencyStop, clearEmergencyStopCache } from '@/lib/sales/emergency-stop';

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
  let adminEmail: string | undefined;
  try {
    ({ email: adminEmail } = await requireAdminRequest(request));
  } catch (e) {
    return adminUnauthorizedResponse(e);
  }

  try {
    const { action } = await request.json();

    if (action !== 'activate' && action !== 'deactivate') {
      return NextResponse.json(
        { error: 'action must be "activate" or "deactivate"' },
        { status: 400 }
      );
    }

    const isActive = action === 'activate';
    const updatedBy = adminEmail || 'admin_ui';

    // Update database
    await setEmergencyStop(isActive, updatedBy);
    clearEmergencyStopCache();

    // Log the action
    await db.insert(auditLogs).values({
      action: 'KILL_SWITCH_ACTIVATED',
      aiReasoning: `Emergency stop ${action}d via admin UI`,
      metadata: { action, updatedBy },
      humanOverride: true,
    });

    return NextResponse.json({
      success: true,
      message: `Emergency stop ${action}d`,
      active: isActive,
    });
  } catch (error: any) {
    console.error('Error toggling kill switch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle kill switch' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/kill-switch
 * Get current emergency stop status
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request);
  } catch (e) {
    return adminUnauthorizedResponse(e);
  }

  try {
    const { isEmergencyStopActive } = await import('@/lib/sales/emergency-stop');
    const isActive = await isEmergencyStopActive();
    
    return NextResponse.json({
      active: isActive,
    });
  } catch (error: any) {
    console.error('Error checking kill switch status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check kill switch status' },
      { status: 500 }
    );
  }
}






