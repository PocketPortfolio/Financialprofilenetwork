/**
 * scripts/check-reciprocity.ts
 *
 * Phase 2 · Pillar B-1: sameAs reciprocity probe.
 *
 * Fetches every URL in ORG.sameAs and PERSON_ABBA.sameAs (from canonical-claims.ts)
 * and asserts presence of a "pocketportfolio.app" back-link in the rendered HTML
 * — except for hosts whose public HTML is auth-walled (LinkedIn), where we degrade
 * to a reachability check and flag the URL for B-3 manual audit.
 *
 * Exits non-zero on any FAIL row so CI surfaces drift loudly.
 *
 * Usage:   npx tsx scripts/check-reciprocity.ts
 *          (also invoked from .github/workflows/sameAs-reciprocity.yml)
 */

import { ORG, PERSON_ABBA } from '../lib/canonical-claims';

interface ProbeResult {
  url: string;
  ownerType: 'ORG' | 'PERSON_ABBA';
  status: 'PASS' | 'FAIL' | 'MANUAL';
  httpStatus?: number;
  reason: string;
}

const BACKLINK_NEEDLE = 'pocketportfolio.app';
const TIMEOUT_MS = 15_000;

/**
 * Hosts whose public HTML does not reliably expose profile content
 * (auth-wall, JS-rendered, or anti-bot cloaking). For these, the reciprocity
 * check degrades to "URL reachable" — back-link verification is manual per B-3.
 */
const MANUAL_AUDIT_HOSTS = new Set([
  'www.linkedin.com',
  'linkedin.com',
]);

async function probe(
  url: string,
  ownerType: 'ORG' | 'PERSON_ABBA',
): Promise<ProbeResult> {
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    return {
      url,
      ownerType,
      status: 'FAIL',
      reason: 'Malformed URL',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'PocketPortfolio-ReciprocityProbe/1.0 (+https://www.pocketportfolio.app/press)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (MANUAL_AUDIT_HOSTS.has(host)) {
      // LinkedIn (and similar auth-walled hosts) commonly return HTTP 999 or
      // 403 to non-browser User-Agents as anti-bot defence. Network-level
      // reachability is the strongest signal we can extract automatically;
      // back-link content is by-definition unverifiable here, so we always
      // classify as MANUAL when we receive ANY HTTP response. Only a true
      // network error (caught below) should fail the probe for these hosts.
      return {
        url,
        ownerType,
        status: 'MANUAL',
        httpStatus: res.status,
        reason: `Reachable (HTTP ${res.status}); back-link verification deferred to B-3 manual audit (auth-walled host)`,
      };
    }

    if (!res.ok) {
      return {
        url,
        ownerType,
        status: 'FAIL',
        httpStatus: res.status,
        reason: `Non-2xx HTTP ${res.status}`,
      };
    }

    const bodyText = await res.text();
    const hasBacklink = bodyText.toLowerCase().includes(BACKLINK_NEEDLE);

    return {
      url,
      ownerType,
      status: hasBacklink ? 'PASS' : 'FAIL',
      httpStatus: res.status,
      reason: hasBacklink
        ? `Back-link "${BACKLINK_NEEDLE}" present in body`
        : `Back-link "${BACKLINK_NEEDLE}" NOT found in body (size: ${bodyText.length}b)`,
    };
  } catch (err) {
    return {
      url,
      ownerType,
      status: 'FAIL',
      reason: `Probe error: ${(err as Error).message}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

function formatRow(r: ProbeResult): string {
  const icon = r.status === 'PASS' ? '[+]' : r.status === 'MANUAL' ? '[~]' : '[X]';
  const owner = r.ownerType.padEnd(11, ' ');
  const status = r.status.padEnd(6, ' ');
  return `  ${icon} [${owner}] ${status} ${r.url}\n      ${r.reason}`;
}

async function main(): Promise<void> {
  console.log('Phase 2 · Pillar B-1 — sameAs reciprocity probe');
  console.log('================================================\n');

  const targets: Array<{ url: string; ownerType: 'ORG' | 'PERSON_ABBA' }> = [
    ...ORG.sameAs.map((url) => ({ url, ownerType: 'ORG' as const })),
    ...PERSON_ABBA.sameAs.map((url) => ({ url, ownerType: 'PERSON_ABBA' as const })),
  ];

  const results = await Promise.all(targets.map((t) => probe(t.url, t.ownerType)));

  for (const r of results) console.log(formatRow(r));

  const counts = {
    pass: results.filter((r) => r.status === 'PASS').length,
    manual: results.filter((r) => r.status === 'MANUAL').length,
    fail: results.filter((r) => r.status === 'FAIL').length,
  };

  console.log('\n------------------------------------------------');
  console.log(
    `Summary · ${results.length} probes · PASS=${counts.pass} MANUAL=${counts.manual} FAIL=${counts.fail}`,
  );

  if (counts.fail > 0) {
    console.error('\n[FAIL] At least one sameAs URL failed the reciprocity probe.');
    process.exit(1);
  }
  console.log('\n[OK] No reciprocity failures.');
}

main().catch((err) => {
  console.error('Unhandled error in reciprocity probe:', err);
  process.exit(2);
});