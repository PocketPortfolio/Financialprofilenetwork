import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import {
  botGatePaywallUrl,
  extractApiKeyFromRequest,
  isAllowedSearchCrawler,
  isLikelyAutomatedClient,
  isMeteredDataApiPath,
  isSymbolFarmPath,
  RATE_BUDGET_EXHAUSTED_HEADER,
  resolveBotGateClientIp,
  shouldApplyBotGate,
  wantsJsonResponse,
} from '@/lib/bot-gate';

const SURFACE_PAGE_LIMIT = 24;
const SURFACE_WINDOW_SECONDS = 3600;

async function withinSurfacePageBudget(ip: string): Promise<boolean> {
  const key = `ratelimit:surface:html:${ip}`;
  try {
    const count = (await kv.get<number>(key)) || 0;
    if (count >= SURFACE_PAGE_LIMIT) return false;
    const next = count + 1;
    if (count === 0) {
      await kv.set(key, next, { ex: SURFACE_WINDOW_SECONDS });
    } else {
      await kv.set(key, next);
    }
    return true;
  } catch (error) {
    console.error('[bot-gate-middleware] KV surface limit failed:', error);
    return true;
  }
}

/**
 * Edge paywall for symbol-farm HTML and automated clients on metered surfaces.
 * Enterprise: ONLY Googlebot + Bingbot may crawl; all other bots → 307/401.
 * Humans (real Sec-Fetch browser signals) get a page budget before upsell.
 */
export async function applyBotGateMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  if (!shouldApplyBotGate(pathname)) return null;

  const apiKey = extractApiKeyFromRequest(request);
  if (apiKey && apiKey.startsWith('pp_')) {
    return null;
  }

  const searchCrawler = isAllowedSearchCrawler(request);
  const automated = isLikelyAutomatedClient(request);

  if (automated && !searchCrawler) {
    if (wantsJsonResponse(request) || isMeteredDataApiPath(pathname)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message:
            'Automated access requires a Developer Utility API key. Upgrade to continue.',
          checkout_url: botGatePaywallUrl(request, 'automated_api'),
        },
        {
          status: 401,
          headers: {
            'X-Robots-Tag': 'noindex, nofollow',
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    return NextResponse.redirect(
      botGatePaywallUrl(request, 'automated_symbol_farm'),
      307,
    );
  }

  if (isSymbolFarmPath(pathname) && !searchCrawler) {
    const ip = resolveBotGateClientIp(request);
    const allowed = await withinSurfacePageBudget(ip);
    if (!allowed) {
      // Humans: rewrite onto the same path with a lock flag (in-page teaser, not 307).
      // Keeps ISR for under-budget visits; only exhausted IPs hit the dynamic teaser.
      const url = request.nextUrl.clone();
      url.searchParams.set('pp_rate_lock', '1');
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(RATE_BUDGET_EXHAUSTED_HEADER, '1');
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }
  }

  return null;
}
