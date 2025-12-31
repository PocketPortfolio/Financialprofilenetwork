import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const EODHD_API_KEY = process.env.EODHD_API_KEY || '';
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
  
  // Check circuit breaker state (if accessible)
  const circuitBreakerActive = false; // Will be true if rate limited
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeys: {
      eodhd: {
        configured: !!EODHD_API_KEY,
        length: EODHD_API_KEY?.length || 0,
        prefix: EODHD_API_KEY ? `${EODHD_API_KEY.substring(0, 4)}...` : 'NONE'
      },
      alphaVantage: {
        configured: !!ALPHA_VANTAGE_API_KEY,
        length: ALPHA_VANTAGE_API_KEY?.length || 0,
        prefix: ALPHA_VANTAGE_API_KEY ? `${ALPHA_VANTAGE_API_KEY.substring(0, 4)}...` : 'NONE'
      }
    },
    circuitBreaker: {
      active: circuitBreakerActive,
      note: 'Circuit breaker state is in-memory and not accessible from this endpoint'
    },
    routeStatus: {
      registered: true,
      path: '/api/dividend/[ticker]',
      method: 'GET'
    },
    recommendations: [] as string[]
  };
  
  if (!ALPHA_VANTAGE_API_KEY) {
    diagnostic.recommendations.push('ALPHA_VANTAGE_API_KEY is not configured in Vercel environment variables');
  }
  
  if (!EODHD_API_KEY) {
    diagnostic.recommendations.push('EODHD_API_KEY is not configured (optional, requires paid plan)');
  }
  
  return NextResponse.json(diagnostic, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Diagnostic-Endpoint': 'active'
    }
  });
}

