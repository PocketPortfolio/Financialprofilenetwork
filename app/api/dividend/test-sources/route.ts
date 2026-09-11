import { NextRequest, NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';
import { sanitizeTickerForUrl } from '@/app/lib/utils/sanitizeTicker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dividend/test-sources — cron/admin only (M11).
 * Live-probes upstream dividend APIs; must not be public.
 */
export async function GET(request: NextRequest) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const ticker = sanitizeTickerForUrl(searchParams.get('ticker') || 'AAPL') ?? 'AAPL';

  const results: Record<string, unknown> = {
    ticker,
    timestamp: new Date().toISOString(),
    sources: {} as Record<string, unknown>,
  };

  const sources = results.sources as Record<string, unknown>;
  const EODHD_API_KEY = process.env.EODHD_API_KEY || '';
  sources.eodhd = {
    hasKey: Boolean(EODHD_API_KEY),
    status: 'not_configured',
    error: null as string | null,
  };

  if (EODHD_API_KEY) {
    try {
      const url = `https://eodhistoricaldata.com/api/splits-dividends/${ticker}.US?api_token=${EODHD_API_KEY}&from=2023-01-01&to=2024-12-31`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
        },
        cache: 'no-store',
      });
      const entry = sources.eodhd as { status: string; error: string | null; dividendCount?: number };
      entry.status = response.ok ? 'success' : `http_${response.status}`;
      if (response.ok) {
        const data = await response.json();
        entry.dividendCount = Array.isArray(data) ? data.length : 0;
      } else {
        entry.error = await response.text().catch(() => 'error');
      }
    } catch (e: any) {
      (sources.eodhd as { status: string; error: string | null }).status = 'error';
      (sources.eodhd as { status: string; error: string | null }).error = e?.message || 'fetch failed';
    }
  }

  return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
}
