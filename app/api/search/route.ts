import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}






