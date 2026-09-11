import { NextRequest, NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dividend/diagnostic — admin/cron only (M11).
 * Does not expose key material — presence flags only.
 */
export async function GET(request: NextRequest) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const EODHD_API_KEY = process.env.EODHD_API_KEY || '';
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiKeys: {
        eodhd: { configured: Boolean(EODHD_API_KEY) },
        alphaVantage: { configured: Boolean(ALPHA_VANTAGE_API_KEY) },
      },
      routeStatus: { registered: true, path: '/api/dividend/[ticker]', method: 'GET' },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
