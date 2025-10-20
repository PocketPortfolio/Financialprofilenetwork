import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Math.max(1, Math.min(parseInt(searchParams.get('count') || '50', 10), 100));
    const region = searchParams.get('region') || 'US';
    
    // Direct call to Yahoo Finance Screener API
    const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives&count=${count}&start=0&lang=en-US&region=${encodeURIComponent(region)}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance Screener API error: ${response.status}`);
    }

    const data = await response.json();
    const quotes = data?.finance?.result?.[0]?.quotes || data?.quotes || [];
    
    const result = quotes.slice(0, count).map((q: any, i: number) => ({
      rank: i + 1,
      symbol: q.symbol,
      price: q.regularMarketPrice ?? null,
      changePct: q.regularMarketChangePercent ?? null,
      volume: q.regularMarketVolume ?? q.volume ?? null,
      marketCap: q.marketCap ?? null,
      currency: q.currency ?? null,
      source: 'yahoo_finance',
    }));
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=30',
        'X-Data-Source': 'yahoo-finance-screener-direct',
        'X-Data-Timestamp': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching most traded data from Yahoo Finance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch most traded data from Yahoo Finance' }, 
      { status: 500 }
    );
  }
}
