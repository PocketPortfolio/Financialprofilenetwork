/**
 * ≤1h telemetry smoke: GA4 Measurement Protocol.
 * Expect HTTP 204 when secrets are set + registered in GA4 Admin.
 *
 * Usage: node --env-file=.env.local scripts/ops-ga4-mp-smoke.mjs
 */
const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
  process.env.GA_MEASUREMENT_ID?.trim();
const apiSecret = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET?.trim();

if (!measurementId || !apiSecret) {
  console.error('SKIPPED — set NEXT_PUBLIC_GA_MEASUREMENT_ID and GA4_MEASUREMENT_PROTOCOL_SECRET');
  process.exit(2);
}

const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: `smoke.${Date.now()}`,
    events: [
      {
        name: 'developer_utility_conversion',
        params: {
          engagement_time_msec: 1,
          tier: 'featureVoter',
          value: 0,
          currency: 'USD',
          transaction_id: `smoke_${Date.now()}`,
          source: 'ops_mp_smoke',
        },
      },
    ],
  }),
});

console.log(JSON.stringify({ ok: res.ok, status: res.status }, null, 2));
if (!res.ok) {
  console.error(await res.text().catch(() => ''));
  process.exit(1);
}
console.log('OK — GA4 MP accepted event (expect 204)');
