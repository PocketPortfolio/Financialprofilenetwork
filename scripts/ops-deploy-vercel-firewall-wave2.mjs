#!/usr/bin/env node
/**
 * Wave 2 — Deploy Vercel Firewall ASN challenge BEFORE serverless invocations.
 *
 * WHY THIS EXISTS (not Cloudflare-first):
 *   DNS for pocketportfolio.app currently resolves to Vercel IPs (216.150.*) with
 *   Server: Vercel and no cf-ray. Cloudflare WAF Custom Rules cannot intercept
 *   traffic that never hits Cloudflare. Until DNS is orange-cloud proxied,
 *   Vercel Firewall is the only edge that can drop datacenter scrapers before
 *   Edge Middleware / serverless billing.
 *
 * Usage:
 *   VERCEL_TOKEN=… node scripts/ops-deploy-vercel-firewall-wave2.mjs
 *   VERCEL_TOKEN=… node scripts/ops-deploy-vercel-firewall-wave2.mjs --publish
 *
 * Default: insert rule as draft (log-safe). Pass --publish to activate.
 *
 * Docs: https://vercel.com/docs/vercel-firewall/firewall-api
 * ASN list aligned with lib/bot-gate.ts + docs/command/cloudflare-waf-wave2-rules.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ID = 'prj_xmupQQfumETKPAmKooDEPMjeAfz2';
const TEAM_ID = 'team_xEo3S3FB1aFM2xV5gxZY36Gj';
const RULE_NAME = 'Wave2 — Challenge datacenter ASNs on metered APIs';

/** Same ASN set as lib/bot-gate.ts isLikelyDatacenterRequest */
const DATACENTER_ASNS = [
  '16509', // Amazon AWS
  '14618', // Amazon
  '15169', // Google
  '396982', // Google Cloud
  '8075', // Microsoft Azure
  '14061', // DigitalOcean
  '20473', // Vultr
  '24940', // Hetzner
  '16276', // OVH
  '63949', // Linode / Akamai
];

const METERED_PATH_RE =
  '^/(api/tickers/|api/quote$|api/quote\\?|api/price/|api/dividend)';

function resolveToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  // Optional local override file (never commit)
  const p = resolve(process.cwd(), '.vercel-firewall-token');
  if (existsSync(p)) return readFileSync(p, 'utf8').trim();
  return null;
}

function buildRule({ active }) {
  return {
    active,
    name: RULE_NAME,
    description:
      'Wave 2 cost gate: Managed Challenge datacenter ASN clients hitting ticker/quote/price/dividend APIs before serverless invocation. Exempts Googlebot/OAI-SearchBot via separate allow conditions not required — challenge passes humans.',
    conditionGroup: [
      {
        conditions: [
          {
            type: 'path',
            op: 're',
            value: METERED_PATH_RE,
          },
          {
            type: 'geo_as_number',
            op: 'inc',
            value: DATACENTER_ASNS,
          },
        ],
      },
    ],
    action: {
      mitigate: {
        action: 'challenge',
        rateLimit: null,
        redirect: null,
        actionDuration: null,
      },
    },
  };
}

async function api(token, method, path, body) {
  const url = new URL(`https://api.vercel.com${path}`);
  url.searchParams.set('projectId', PROJECT_ID);
  url.searchParams.set('teamId', TEAM_ID);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const publish = process.argv.includes('--publish');
  const token = resolveToken();
  if (!token) {
    console.error(`
ERROR: VERCEL_TOKEN not set.

Create a token at https://vercel.com/account/tokens (scope: Firewall + Project)
then:

  $env:VERCEL_TOKEN = "vercel_…"
  node scripts/ops-deploy-vercel-firewall-wave2.mjs --publish

This is a SHIP GATE — bots currently bill Vercel because DNS is Vercel-direct
(no Cloudflare proxy). This script is the immediate cost cut.
`);
    process.exit(1);
  }

  console.log(`[wave2-firewall] Inserting rule (active=${publish})…`);
  const insert = await api(token, 'PATCH', '/v1/security/firewall/config', {
    action: 'rules.insert',
    id: null,
    value: buildRule({ active: true }),
  });

  if (!insert.ok) {
    console.error('[wave2-firewall] rules.insert failed:', insert.status, insert.json);
    process.exit(1);
  }
  console.log('[wave2-firewall] Rule inserted OK');

  if (publish) {
    console.log('[wave2-firewall] Publishing firewall config…');
    const pub = await api(token, 'PUT', '/v1/security/firewall/config/active', {});
    // Some API versions use PATCH action: config.publish — try both semantics
    if (!pub.ok) {
      const alt = await api(token, 'PATCH', '/v1/security/firewall/config', {
        action: 'config.publish',
        id: null,
        value: null,
      });
      if (!alt.ok) {
        console.error(
          '[wave2-firewall] Publish failed. Rule may be staged as draft.',
          '\n  Insert:',
          insert.status,
          '\n  PUT active:',
          pub.status,
          pub.json,
          '\n  PATCH publish:',
          alt.status,
          alt.json,
          '\nPublish manually: Vercel Dashboard → Project → Firewall → Publish',
        );
        process.exit(2);
      }
      console.log('[wave2-firewall] Published via config.publish');
    } else {
      console.log('[wave2-firewall] Published via /active');
    }
  } else {
    console.log(
      '[wave2-firewall] Draft only. Re-run with --publish to activate, or publish in Dashboard.',
    );
  }

  console.log(`
Done. Verify:
  Vercel → pocket-portfolio-app → Firewall → Custom Rules
  Rule: "${RULE_NAME}"
  Action: challenge on datacenter ASN + metered API paths
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
