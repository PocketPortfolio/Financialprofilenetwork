#!/usr/bin/env node
/**
 * Wave 2 ship gate — publish Vercel Firewall ASN challenge BEFORE serverless billing.
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

const RULE = {
  name: 'Wave2 Challenge datacenter ASN metered APIs',
  active: true,
  conditionGroup: [
    {
      conditions: [
        {
          type: 'path',
          op: 're',
          value: '^/api/(tickers/|quote|price/|dividend)',
        },
        {
          type: 'geo_as_number',
          op: 'inc',
          value: [
            '16509',
            '14618',
            '15169',
            '396982',
            '8075',
            '14061',
            '20473',
            '24940',
            '16276',
            '63949',
          ],
        },
      ],
    },
  ],
  action: {
    mitigate: {
      action: 'challenge',
    },
  },
};

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

function ruleIsActive(cfg) {
  const rules = cfg?.active?.rules || [];
  return rules.some(
    (r) =>
      r.active &&
      String(r.name || '').includes('Wave2 Challenge datacenter ASN') &&
      r.action?.mitigate?.action === 'challenge',
  );
}

async function main() {
  writeFileSync(
    join(process.cwd(), 'scripts', 'wave2-vercel-firewall-rule.json'),
    JSON.stringify(RULE, null, 2) + '\n',
  );

  const token = resolveToken();
  if (!token) {
    console.error('RED: No VERCEL_TOKEN / CLI auth. Run: npx vercel@latest login');
    process.exit(1);
  }

  const before = await api(token);
  if (!before.ok) {
    console.error('RED: Cannot read firewall config', before.status, before.json);
    process.exit(1);
  }

  if (ruleIsActive(before.json)) {
    console.log('GREEN: Wave2 ASN challenge already active on production firewall');
    process.exit(0);
  }

  console.log('Inserting Wave2 ASN challenge rule…');
  const insert = await api(token, {
    action: 'rules.insert',
    id: null,
    value: RULE,
  });
  if (!insert.ok) {
    console.error('RED: rules.insert failed', insert.status, insert.json);
    process.exit(1);
  }

  // Some API versions insert directly into active; verify.
  const after = await api(token);
  if (ruleIsActive(after.json)) {
    console.log('GREEN: Wave2 ASN challenge is LIVE (active.rules)');
    console.log('  Paths: ^/api/(tickers/|quote|price/|dividend)');
    console.log('  ASNs: AWS/GCP/Azure/DO/Hetzner/OVH/Vultr/Linode');
    console.log('  Action: challenge (before serverless invocation)');
    process.exit(0);
  }

  console.error('RED: Rule inserted but not found in active config', after.status, after.json);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
