import fs from 'node:fs';
import path from 'node:path';
import { ORG, PERSON_ABBA, URLS } from '@/lib/canonical-claims';

type LinkKind = 'ORG.sameAs' | 'PERSON_ABBA.sameAs';
type ReciprocityStatus = 'FOUND' | 'MISSING' | 'MANUAL' | 'ERROR';

const AUTH_WALLED_HOSTS = new Set([
  'www.linkedin.com',
  'linkedin.com',
  'x.com',
  'twitter.com',
]);

function yyyymmdd(d: Date) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function safeHost(inputUrl: string) {
  try {
    return new URL(inputUrl).host;
  } catch {
    return '';
  }
}

async function fetchHtml(url: string, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent': 'pocket-portfolio-reciprocity-audit/1.0 (+https://www.pocketportfolio.app/press)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const contentType = res.headers.get('content-type') ?? '';
    const body = contentType.includes('text/html') ? await res.text() : '';
    return { ok: res.ok, status: res.status, contentType, body };
  } finally {
    clearTimeout(t);
  }
}

async function checkReciprocity(args: {
  kind: LinkKind;
  url: string;
  expectedBacklink: string;
}) {
  const host = safeHost(args.url);
  if (!host) {
    return { ...args, status: 'ERROR' as const, detail: 'Invalid URL' };
  }

  if (AUTH_WALLED_HOSTS.has(host)) {
    return { ...args, status: 'MANUAL' as const, detail: 'Auth-walled platform' };
  }

  try {
    const { ok, status, body } = await fetchHtml(args.url, 15_000);
    if (status === 401 || status === 403) {
      return { ...args, status: 'MANUAL' as const, detail: `HTTP ${status} (auth/blocked)` };
    }
    if (!ok) {
      return { ...args, status: 'ERROR' as const, detail: `HTTP ${status}` };
    }

    const needle = args.expectedBacklink.toLowerCase();
    const found = body.toLowerCase().includes(needle);
    return {
      ...args,
      status: (found ? 'FOUND' : 'MISSING') as ReciprocityStatus,
      detail: found ? 'Backlink detected in HTML' : 'Backlink not found in HTML',
    };
  } catch (err: any) {
    const msg =
      err?.name === 'AbortError' ? 'Timeout' : (err?.message ? String(err.message) : 'Fetch failed');
    return { ...args, status: 'ERROR' as const, detail: msg };
  }
}

async function main() {
  const now = new Date();
  const outPath = path.join(
    process.cwd(),
    'docs',
    'seed',
    'phase2-evidence',
    `reciprocity-audit-${yyyymmdd(now)}.md`,
  );

  const orgLinks = ORG.sameAs.map((url) => ({
    kind: 'ORG.sameAs' as const,
    url,
    expectedBacklink: URLS.press,
  }));

  const personLinks = PERSON_ABBA.sameAs.map((url) => ({
    kind: 'PERSON_ABBA.sameAs' as const,
    url,
    expectedBacklink: URLS.personAbba,
  }));

  const checks = [...orgLinks, ...personLinks];
  const results = await Promise.all(checks.map((c) => checkReciprocity(c)));

  const lines: string[] = [];
  lines.push(`# Reciprocity Audit`);
  lines.push('');
  lines.push(`- Generated: ${now.toISOString()}`);
  lines.push(`- Backlink target (ORG): \`${URLS.press}\``);
  lines.push(`- Backlink target (PERSON_ABBA): \`${URLS.personAbba}\``);
  lines.push('');
  lines.push(`## Results`);
  lines.push('');
  lines.push(`| Kind | URL | Expected backlink | Status | Detail |`);
  lines.push(`|---|---|---|---|---|`);
  for (const r of results) {
    lines.push(
      `| \`${r.kind}\` | \`${r.url}\` | \`${r.expectedBacklink}\` | **${r.status}** | ${r.detail} |`,
    );
  }
  lines.push('');
  lines.push(`## Summary`);
  lines.push('');
  const counts = results.reduce<Record<ReciprocityStatus, number>>(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { FOUND: 0, MISSING: 0, MANUAL: 0, ERROR: 0 },
  );
  lines.push(`- **FOUND**: ${counts.FOUND}`);
  lines.push(`- **MISSING**: ${counts.MISSING}`);
  lines.push(`- **MANUAL**: ${counts.MANUAL}`);
  lines.push(`- **ERROR**: ${counts.ERROR}`);
  lines.push('');
  lines.push(`## Notes`);
  lines.push('');
  lines.push(`- Platforms that block unauthenticated crawling are marked **MANUAL** by policy.`);
  lines.push(`- This audit is intentionally conservative: it only counts a backlink if it appears in fetched HTML.`);
  lines.push('');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  process.stdout.write(outPath + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

