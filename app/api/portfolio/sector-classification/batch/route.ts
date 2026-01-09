import { NextRequest, NextResponse } from 'next/server';
import { getBatchSectorClassification } from '@/app/lib/portfolio/sectorService';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/portfolio/sector-classification/batch
 * Body: { tickers: ['AAPL', 'MSFT', 'GOOGL'] }
 * Get sector classifications for multiple tickers
 */
export async function POST(request: NextRequest) {
  try {
    // Safely parse JSON body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { tickers } = body;

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'Tickers array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const limitedTickers = tickers.slice(0, 100);
    
    const classifications = await getBatchSectorClassification(limitedTickers, {
      useApi: true,
      useCache: true,
    });

    // Convert Map to object for JSON response
    const result: Record<string, any> = {};
    classifications.forEach((classification, ticker) => {
      result[ticker] = classification;
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching batch sector classification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch sector classification' },
      { status: 500 }
    );
  }
}

