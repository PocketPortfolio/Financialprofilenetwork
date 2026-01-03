import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ ticker: string }> | { ticker: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // Handle both Next.js 14 (Promise) and Next.js 13 (direct) params
  const resolvedParams = params && typeof (params as any).then === 'function' 
    ? await (params as Promise<{ ticker: string }>)
    : params as { ticker: string };
  
  const ticker = resolvedParams?.ticker?.toUpperCase() || 'UNKNOWN';
  
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











