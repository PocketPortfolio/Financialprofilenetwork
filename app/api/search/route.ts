import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { searchMissLog } from '@/db/sales/schema';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Mock search results for now
    const results = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' }
    ].filter(item =>
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    // Data gap audit: log zero-result searches for product roadmap
    if (results.length === 0) {
      try {
        const userAgent = request.headers.get('user-agent') ?? undefined;
        await db.insert(searchMissLog).values({
          searchQuery: query.trim().slice(0, 500),
          resultCount: 0,
          userAgent: userAgent?.slice(0, 1000),
        });
      } catch (logError) {
        console.error('[search] Miss log insert failed:', logError);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}






