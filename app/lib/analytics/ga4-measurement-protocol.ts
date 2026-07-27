/**
 * Server-side GA4 Measurement Protocol helper for Stripe webhook conversions.
 * Silent no-op when GA id or API secret missing (local/dev safe).
 */

type MpEventParams = Record<string, string | number | boolean | undefined | null>;

export async function sendGa4MeasurementProtocolEvent(opts: {
  name: string;
  params?: MpEventParams;
  clientId?: string;
}): Promise<{ ok: boolean; skipped?: boolean; status?: number }> {
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    process.env.GA_MEASUREMENT_ID?.trim();
  const apiSecret = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET?.trim();

  if (!measurementId || !apiSecret) {
    console.warn(
      '[GA4 MP] Skipped — set NEXT_PUBLIC_GA_MEASUREMENT_ID and GA4_MEASUREMENT_PROTOCOL_SECRET',
    );
    return { ok: false, skipped: true };
  }

  const clientId = opts.clientId || `stripe.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;

  const cleanParams: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(opts.params || {})) {
    if (v === undefined || v === null) continue;
    cleanParams[k] = v;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      events: [
        {
          name: opts.name,
          params: {
            engagement_time_msec: 1,
            ...cleanParams,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error('[GA4 MP] Failed', res.status, await res.text().catch(() => ''));
    return { ok: false, status: res.status };
  }

  return { ok: true, status: res.status };
}
