#!/usr/bin/env node
/**
 * Wave 2.1 ship gate — Vercel Firewall BEFORE serverless billing.
 *
 * Rules:
 *   1) Challenge datacenter ASNs on metered APIs
 *   2) Challenge datacenter ASNs on /s/* (exempt Googlebot + Bingbot)
 *   3) Deny known automation UAs on /s/* and metered APIs (exempt Google/Bing)
 *
 * Uses VERCEL_TOKEN env, or falls back to Vercel CLI auth at:
 *   %APPDATA%/com.vercel.cli/Data/auth.json
 *
 * Usage:
 *   node scripts/ops-publish-vercel-firewall-wave2.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_ID = 'prj_xmupQQfumETKPAmKooDEPMjeAfz2';
const TEAM_ID = 'team_xEo3S3FB1aFM2xV5gxZY36Gj';

const DATACENTER_ASNS = [
  '16509', // AWS
  '14618', // Amazon
  '15169', // Google
  '396982', // Google Cloud
  '8075', // Microsoft
  '14061', // DigitalOcean
  '20473', // Vultr
  '24940', // Hetzner
  '16276', // OVH
  '63949', // Linode
];

const METERED_API_PATH = '^/api/(tickers/|quote|price/|dividend)';
const SYMBOL_FARM_PATH = '^/s(/|$)';

/** Enterprise: Google + Bing only — negate these so verified crawlers are not challenged/denied. */
const GOOGLE_BING_EXEMPT = [
  { type: 'user_agent', op: 'sub', value: 'Googlebot', neg: true },
  { type: 'user_agent', op: 'sub', value: 'Google-InspectionTool', neg: true },
  { type: 'user_agent', op: 'sub', value: 'AdsBot-Google', neg: true },
  { type: 'user_agent', op: 'sub', value: 'bingbot', neg: true },
  { type: 'user_agent', op: 'sub', value: 'BingPreview', neg: true },
  { type: 'user_agent', op: 'sub', value: 'msnbot', neg: true },
];

const RULES = [
  {
    name: 'Wave2 Challenge datacenter ASN metered APIs',
    active: true,
    conditionGroup: [
      {
        conditions: [
          { type: 'path', op: 're', value: METERED_API_PATH },
          { type: 'geo_as_number', op: 'inc', value: DATACENTER_ASNS },
          ...GOOGLE_BING_EXEMPT,
        ],
      },
    ],
    action: { mitigate: { action: 'challenge' } },
  },
  {
    name: 'Wave2.1 Challenge datacenter ASN symbol farm',
    active: true,
    conditionGroup: [
      {
        conditions: [
          { type: 'path', op: 're', value: SYMBOL_FARM_PATH },
          { type: 'geo_as_number', op: 'inc', value: DATACENTER_ASNS },
          ...GOOGLE_BING_EXEMPT,
        ],
      },
    ],
    action: { mitigate: { action: 'challenge' } },
  },
  {
    name: 'Wave2.1 Deny automation UA on farm and APIs',
    active: true,
    conditionGroup: [
      {
        conditions: [
          {
            type: 'path',
            op: 're',
            value: '^/(s(/|$)|api/(tickers/|quote|price/|dividend))',
          },
          {
            type: 'user_agent',
            op: 're',
            value:
              '(python-requests|curl/|wget/|scrapy|HeadlessChrome|Playwright|puppeteer|GPTBot|ClaudeBot|Bytespider|SemrushBot|AhrefsBot|PetalBot|CCBot|PerplexityBot|DuckDuckBot|YandexBot|Applebot|facebookexternalhit)',
          },
          ...GOOGLE_BING_EXEMPT,
        ],
      },
    ],
    action: { mitigate: { action: 'deny' } },
  },
];

function resolveToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  const authPath = join(process.env.APPDATA || '', 'com.vercel.cli', 'Data', 'auth.json');
  if (existsSync(authPath)) {
    const auth = JSON.parse(readFileSync(authPath, 'utf8'));
    const token = auth.token || auth.accessToken;
    if (token) return token;
  }
  return null;
}

async function api(token, body) {
  const url = `https://api.vercel.com/v1/security/firewall/config?projectId=${PROJECT_ID}&teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method: body ? 'PATCH' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
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

function activeRuleNames(cfg) {
  return (cfg?.active?.rules || [])
    .filter((r) => r.active)
    .map((r) => String(r.name || ''));
}

function rulePresent(names, needle) {
  return names.some((n) => n.includes(needle));
}

async function ensureRule(token, rule) {
  const before = await api(token);
  if (!before.ok) {
    console.error('RED: Cannot read firewall config', before.status, before.json);
    process.exit(1);
  }
  const names = activeRuleNames(before.json);
  if (rulePresent(names, rule.name)) {
    console.log(`GREEN: already active — ${rule.name}`);
    return;
  }
  console.log(`Inserting — ${rule.name}`);
  const insert = await api(token, {
    action: 'rules.insert',
    id: null,
    value: rule,
  });
  if (!insert.ok) {
    console.error('RED: rules.insert failed', insert.status, insert.json);
    process.exit(1);
  }
  const after = await api(token);
  const afterNames = activeRuleNames(after.json);
  if (!rulePresent(afterNames, rule.name)) {
    console.error('RED: inserted but not active', rule.name, after.json);
    process.exit(1);
  }
  console.log(`GREEN: LIVE — ${rule.name}`);
}

async function main() {
  writeFileSync(
    join(process.cwd(), 'scripts', 'wave2-vercel-firewall-rule.json'),
    JSON.stringify(RULES, null, 2) + '\n',
  );

  const token = resolveToken();
  if (!token) {
    console.error('RED: No VERCEL_TOKEN / CLI auth. Run: npx vercel@latest login');
    process.exit(1);
  }

  for (const rule of RULES) {
    await ensureRule(token, rule);
  }

  console.log('');
  console.log('GREEN: Wave 2.1 enterprise bot posture published');
  console.log('  Allow crawlers: Googlebot + Bingbot only');
  console.log('  /s/* + metered APIs: datacenter ASN → challenge');
  console.log('  Known automation UAs → deny');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
