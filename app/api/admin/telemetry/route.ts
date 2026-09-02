import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin/require-admin-request';
import { growthSaConfigured, growthSaEmail } from '@/lib/telemetry/google-sa-token';
import { fetchGa4Telemetry } from '@/lib/telemetry/ga4-client';
import {
  fetchGscOpenPageMix,
  fetchGscOpenTelemetry,
  fetchGscPageMix,
  fetchGscTelemetry,
  gscOpenSiteUrl,
  gscPocketSiteUrl,
} from '@/lib/telemetry/gsc-client';
import { fetchStripePaidKeysPin } from '@/lib/telemetry/stripe-paid-keys';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CacheEntry = { body: unknown; expiresAt: number };
let cache: CacheEntry | null = null;
const TTL_MS = 120_000;

export async function GET(request: NextRequest) {
  try {
    await requireAdminRequest(request);
  } catch (e: unknown) {
    const err = e as { status?: number; code?: string; message?: string };
    return NextResponse.json(
      { error: err.message ?? 'Unauthorized', code: err.code },
      { status: err.status ?? 401 },
    );
  }

  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.body, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    });
  }

  const saReady = growthSaConfigured();
  const warnings: string[] = [];

  const stripe = await fetchStripePaidKeysPin().catch((e: Error) => {
    warnings.push(`Stripe: ${e.message}`);
    return { paidKeys: 0, mrrGbp: 0, day28Pass: false, configured: false };
  });

  let gsc = null;
  let gscOpen = null;
  let pageMix = { farmPageShare: 0, importPageShare: 0 };
  let openPageMix = { blogFarmPageShare: 0, pillarPageShare: 0, pillarZeroClick: [] as Array<{ page: string; impressions: number; position: number }> };
  let ga4 = null;

  if (saReady) {
    const [gscResult, mixResult, gscOpenResult, openMixResult, ga4Result] = await Promise.allSettled([
      fetchGscTelemetry(28),
      fetchGscPageMix(28),
      fetchGscOpenTelemetry(28),
      fetchGscOpenPageMix(28),
      fetchGa4Telemetry(28),
    ]);
    if (gscResult.status === 'fulfilled') gsc = gscResult.value;
    else warnings.push(`GSC Pocket: ${gscResult.reason?.message ?? 'failed'}`);
    if (mixResult.status === 'fulfilled') pageMix = mixResult.value;
    else warnings.push(`GSC Pocket pages: ${mixResult.reason?.message ?? 'failed'}`);
    if (gscOpenResult.status === 'fulfilled') gscOpen = gscOpenResult.value;
    else warnings.push(`GSC Open: ${gscOpenResult.reason?.message ?? 'failed'}`);
    if (openMixResult.status === 'fulfilled') openPageMix = openMixResult.value;
    else warnings.push(`GSC Open pages: ${openMixResult.reason?.message ?? 'failed'}`);
    if (ga4Result.status === 'fulfilled') ga4 = ga4Result.value;
    else warnings.push(`GA4: ${ga4Result.reason?.message ?? 'failed'}`);
  } else {
    warnings.push(
      'Google growth service account not configured (GOOGLE_GROWTH_SA_CLIENT_EMAIL / GOOGLE_GROWTH_SA_PRIVATE_KEY). Stripe pin still live.',
    );
  }

  const body = {
    generatedAt: new Date().toISOString(),
    windowDays: 28,
    auth: { googleSa: saReady, googleSaEmail: growthSaEmail() ?? null, stripe: stripe.configured },
    pin: stripe,
    gsc,
    gscOpen,
    pageMix,
    openPageMix,
    ga4,
    gscSites: { pocket: gscPocketSiteUrl(), open: gscOpenSiteUrl() },
    warnings,
  };

  if (warnings.length === 0) {
    cache = { body, expiresAt: Date.now() + TTL_MS };
  } else {
    cache = null;
  }
  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  });
}
