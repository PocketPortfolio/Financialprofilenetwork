import { NextRequest, NextResponse } from 'next/server';
import { getCachedMarketContext } from '@/app/lib/portfolio/marketContext';

/**
 * GET /api/portfolio/market-context
 * Get current market context (VIX, sector performance, market regime)
 * Cached for 15 minutes
 */
export async function GET(request: NextRequest) {
  try {
    const marketContext = await getCachedMarketContext();

    return NextResponse.json(marketContext, {
      headers: {
        'Cache-Control': 's-maxage=900, stale-while-revalidate=300', // 15 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching market context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market context' },
      { status: 500 }
    );
  }
}











