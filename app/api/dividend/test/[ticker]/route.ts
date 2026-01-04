import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();
  
  return NextResponse.json(
    { 
      message: 'Test route working',
      ticker,
      pathname: request.nextUrl.pathname,
      timestamp: new Date().toISOString()
    },
    {
      headers: {
        'X-Test-Route': 'called',
        'X-Test-Ticker': ticker
      }
    }
  );
}











