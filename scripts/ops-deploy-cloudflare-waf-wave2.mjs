#!/usr/bin/env node
/**
 * Wave 2 — Deploy Cloudflare WAF Custom Rules (ONLY after DNS is orange-cloud).
 *
 * PRECONDITION: nslookup www.pocketportfolio.app must resolve to Cloudflare anycast
 * (NOT Vercel 216.150.*) and HTTPS responses must include cf-ray.
 *
 * As of 2026-07-28 prod audit: DNS is Vercel-direct → use
 * scripts/ops-deploy-vercel-firewall-wave2.mjs first.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ZONE_ID=… node scripts/ops-deploy-cloudflare-waf-wave2.mjs
 */
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID?.trim();
const TOKEN = process.env.CLOUDFLARE_API_TOKEN?.trim();

const EXPRESSION = `(http.request.uri.path contains "/api/tickers/" or http.request.uri.path eq "/api/quote" or http.request.uri.path contains "/api/price/" or http.request.uri.path contains "/api/dividend") and ip.geoip.asnum in {16509 14618 15169 396982 8075 14061 20473 24940 16276 63949} and not http.user_agent contains "Googlebot" and not http.user_agent contains "bingbot" and not http.user_agent contains "OAI-SearchBot" and not http.user_agent contains "ChatGPT-User"`;

async function main() {
  if (!TOKEN || !ZONE_ID) {
    console.error(`
ERROR: Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID.

Also confirm DNS is Cloudflare-proxied:
  curl -sI https://www.pocketportfolio.app | findstr /i cf-ray

If no cf-ray, Cloudflare WAF cannot cut Vercel cost — run:
  node scripts/ops-deploy-vercel-firewall-wave2.mjs --publish
`);
    process.exit(1);
  }

  // Create/update custom ruleset for http_request_firewall_custom
  const listRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets/phases/http_request_firewall_custom/entrypoint`,
    { headers: { Authorization: `Bearer ${TOKEN}` } },
  );
  const listJson = await listRes.json();
  if (!listRes.ok) {
    console.error('Failed to read ruleset entrypoint:', listJson);
    process.exit(1);
  }

  const rulesetId = listJson.result?.id;
  const existingRules = listJson.result?.rules || [];
  const rule = {
    action: 'managed_challenge',
    expression: EXPRESSION,
    description: 'Wave2 — Challenge datacenter ASNs on metered APIs',
    enabled: true,
  };

  const withoutOld = existingRules.filter(
    (r) => !String(r.description || '').includes('Wave2 — Challenge datacenter'),
  );
  const nextRules = [...withoutOld, rule];

  const putRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets/${rulesetId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rules: nextRules }),
    },
  );
  const putJson = await putRes.json();
  if (!putRes.ok) {
    console.error('Failed to update ruleset:', putJson);
    process.exit(1);
  }
  console.log('Cloudflare Wave2 WAF rule deployed (managed_challenge).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
