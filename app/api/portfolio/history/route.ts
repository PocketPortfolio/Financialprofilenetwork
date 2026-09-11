/**
 * Portfolio History API
 * GET /api/portfolio/history?userId={id}&startDate={date}&endDate={date}
 */

import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireUserRequest } from '@/lib/auth/require-user-request';
import { getHistoricalData } from '@/app/lib/portfolio/snapshot';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  let uid: string;
  try {
    ({ uid } = await requireUserRequest(request));
  } catch (e) {
    return authErrorResponse(e);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get('userId');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    if (queryUserId && queryUserId !== uid) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const userId = uid;

    // Validate date format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: 'startDate must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return NextResponse.json(
        { error: 'endDate must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const snapshots = await getHistoricalData(userId, startDate, endDate);

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio history' },
      { status: 500 }
    );
  }
}











