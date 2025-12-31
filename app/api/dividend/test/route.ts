import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Dividend API test endpoint working',
    timestamp: new Date().toISOString(),
    path: '/api/dividend/test',
    routeRegistered: true
  }, {
    headers: {
      'X-Test-Endpoint': 'active',
      'Cache-Control': 'no-store'
    }
  });
}
