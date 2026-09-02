/**
 * GSC query / page signal classification for the live growth HUD.
 * Farm heuristics match Day-14 calibration — do not train on volume.
 */

export type GscQueryBucket =
  | 'farm'
  | 'import'
  | 'brand'
  | 'enterprise'
  | 'wm_advisor'
  | 'other';

const FARM_TOKEN = /^(x[a-z]{2,6}xx|[a-z]{1,4}xx)$/i;
const FARM_EMBEDDED = /\b(xinxx|xvlxx|[a-z]{1,4}xx)\b/i;

const IMPORT_RE =
  /\b(ghostfolio|trading\s*212|t212|interactive\s*brokers|ibkr|trade\s*republic|moomoo|etoro|e-?toro|revolut|freetrade|wealthsimple|openbrokercsv|import)\b/i;

const BRAND_RE =
  /\bpocket\s*(port?folio|folio)\b|\bpocketfolio\b|\bpocketportfolio\b|\bopen\s*portfolio\b|\bopenportfolio\b/i;

const ENTERPRISE_RE =
  /\b(sovereign\s*ai|design\s*partner|databricks|dora|eu ai act|wealth-?tech|local-first|stateless\s*(edge|inference)|open\s*portfolio)\b/i;

const WM_RE =
  /\b(wealth\s*manager|ifa|financial\s*advisor|adviser|portfolio\s*report|white.?label)\b/i;

export function classifyGscQuery(query: string): GscQueryBucket {
  const q = query.trim();
  if (!q) return 'other';
  if (FARM_TOKEN.test(q) || FARM_EMBEDDED.test(q)) return 'farm';
  if (IMPORT_RE.test(q)) return 'import';
  if (BRAND_RE.test(q)) return 'brand';
  if (ENTERPRISE_RE.test(q)) return 'enterprise';
  if (WM_RE.test(q)) return 'wm_advisor';
  return 'other';
}

/** Open Portfolio page buckets for HUD blog-farm vs pillar mix. */
export type OpenGscPageBucket = 'blog_farm' | 'pillar' | 'other';

export function classifyOpenGscPage(pageUrl: string): OpenGscPageBucket {
  const p = pageUrl.toLowerCase();
  if (p.includes('/blog/how-to-') || p.includes('/blog/research-')) return 'blog_farm';
  if (
    p.includes('/architecture') ||
    p.includes('/learn/') ||
    p.includes('/tier1designpartner') ||
    p.includes('/openbrokercsv') ||
    p.includes('/designchallenge') ||
    p.includes('/sovereign-ai-grant') ||
    p.includes('/board-of-investors')
  ) {
    return 'pillar';
  }
  return 'other';
}

export function openPageClickShare(
  rows: Array<{ clicks: number; bucket: OpenGscPageBucket }>,
): Record<OpenGscPageBucket, { clicks: number; share: number }> {
  const totals: Record<OpenGscPageBucket, number> = { blog_farm: 0, pillar: 0, other: 0 };
  let all = 0;
  for (const row of rows) {
    totals[row.bucket] += row.clicks;
    all += row.clicks;
  }
  const out = {} as Record<OpenGscPageBucket, { clicks: number; share: number }>;
  (Object.keys(totals) as OpenGscPageBucket[]).forEach((bucket) => {
    out[bucket] = { clicks: totals[bucket], share: all > 0 ? totals[bucket] / all : 0 };
  });
  return out;
}

export function classifyGscPage(pageUrl: string): GscQueryBucket {
  const p = pageUrl.toLowerCase();
  if (p.includes('/import/') || p.includes('/openbrokercsv')) return 'import';
  if (p.includes('/for/advisors') || p.includes('/newsroom')) return 'wm_advisor';
  if (p.includes('/learn/') || p.includes('openportfolio.co.uk')) return 'enterprise';
  if (/\/s\/[a-z0-9-]+/.test(p) && !/\/s\/(aapl|msft|nvda|googl|amzn|meta|tsla|spy|qqq)\b/.test(p)) {
    const symbol = p.match(/\/s\/([a-z0-9-]+)/)?.[1] ?? '';
    if (FARM_TOKEN.test(symbol)) return 'farm';
  }
  if (p.includes('/s/')) {
    const symbol = p.match(/\/s\/([a-z0-9-]+)/)?.[1] ?? '';
    if (FARM_TOKEN.test(symbol) || FARM_EMBEDDED.test(symbol)) return 'farm';
  }
  return 'other';
}

export interface ClickShareRow {
  clicks: number;
  impressions: number;
  bucket: GscQueryBucket;
}

export function clickShareByBucket(rows: ClickShareRow[]): Record<GscQueryBucket, { clicks: number; share: number }> {
  const totals: Record<GscQueryBucket, number> = {
    farm: 0,
    import: 0,
    brand: 0,
    enterprise: 0,
    wm_advisor: 0,
    other: 0,
  };
  let all = 0;
  for (const row of rows) {
    totals[row.bucket] += row.clicks;
    all += row.clicks;
  }
  const out = {} as Record<GscQueryBucket, { clicks: number; share: number }>;
  (Object.keys(totals) as GscQueryBucket[]).forEach((bucket) => {
    out[bucket] = {
      clicks: totals[bucket],
      share: all > 0 ? totals[bucket] / all : 0,
    };
  });
  return out;
}
