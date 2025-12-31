import { NextRequest, NextResponse } from 'next/server';
import { getSectorClassification } from '@/app/lib/portfolio/sectorService';

/**
 * GET /api/portfolio/sector-classification?ticker=AAPL
 * Get sector classification for a single ticker
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      );
    }

    const classification = await getSectorClassification(ticker, {
      useApi: true,
      useCache: true,
    });

    return NextResponse.json(classification, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600', // Cache for 24 hours
        'X-Data-Source': classification.source,
      },
    });
  } catch (error) {
    console.error('Error fetching sector classification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sector classification' },
      { status: 500 }
    );
  }
}











