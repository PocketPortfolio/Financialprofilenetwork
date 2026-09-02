import {
  classifyGscPage,
  classifyGscQuery,
  classifyOpenGscPage,
  clickShareByBucket,
  openPageClickShare,
  type GscQueryBucket,
} from './classify-gsc-query';
import { getGrowthGoogleAccessToken } from './google-sa-token';

export interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  bucket: GscQueryBucket;
}

export interface GscTelemetry {
  siteUrl: string;
  startDate: string;
  endDate: string;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  topQueries: GscQueryRow[];
  signalQueries: GscQueryRow[];
  clickShare: ReturnType<typeof clickShareByBucket>;
}

export interface GscOpenPageMix {
  blogFarmPageShare: number;
  pillarPageShare: number;
  /** Pillar URLs with impressions > 0 and clicks === 0 (AEO CTR gap signal). */
  pillarZeroClick: Array<{ page: string; impressions: number; position: number }>;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dateWindow(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  return { startDate: ymd(start), endDate: ymd(end) };
}

export function gscPocketSiteUrl(): string {
  return process.env.GSC_SITE_URL?.trim() || 'sc-domain:pocketportfolio.app';
}

export function gscOpenSiteUrl(): string {
  return process.env.GSC_OPEN_SITE_URL?.trim() || 'sc-domain:openportfolio.co.uk';
}

async function listGscSiteEntries(token: string): Promise<{
  http: number;
  entries: Array<{ siteUrl?: string; permissionLevel?: string }>;
}> {
  const res = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as {
    siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }>;
  };
  return { http: res.status, entries: json.siteEntry ?? [] };
}

async function gscAnalyticsQuery(
  token: string,
  siteUrl: string,
  body: Record<string, unknown>,
): Promise<{ rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }>; error?: { message?: string } }> {
  const encodedSite = encodeURIComponent(siteUrl);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }>;
    error?: { message?: string };
  };
  if (!res.ok) {
    const sites = await listGscSiteEntries(token);
    const seen = sites.entries.length
      ? sites.entries.map((e) => e.siteUrl).filter(Boolean).join(', ')
      : 'none';
    throw Object.assign(
      new Error(
        `[${siteUrl}] ${json.error?.message || `GSC ${res.status}`} (SA sees ${sites.entries.length} properties: ${seen})`,
      ),
      { code: 'GSC_QUERY_FAILED', status: res.status, siteUrl },
    );
  }
  return json;
}

export async function fetchGscTelemetryForSite(siteUrl: string, days = 28): Promise<GscTelemetry> {
  const token = await getGrowthGoogleAccessToken();
  const { startDate, endDate } = dateWindow(days);

  const json = await gscAnalyticsQuery(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 250,
    dataState: 'all',
  });

  const classified = (json.rows ?? []).map((row) => {
    const query = row.keys?.[0] ?? '';
    const clicks = row.clicks ?? 0;
    const impressions = row.impressions ?? 0;
    return {
      query,
      clicks,
      impressions,
      ctr: row.ctr ?? (impressions > 0 ? clicks / impressions : 0),
      position: row.position ?? 0,
      bucket: classifyGscQuery(query),
    } satisfies GscQueryRow;
  });

  const totalsClicks = classified.reduce((s, r) => s + r.clicks, 0);
  const totalsImpr = classified.reduce((s, r) => s + r.impressions, 0);
  const weightedPos =
    totalsImpr > 0 ? classified.reduce((s, r) => s + r.position * r.impressions, 0) / totalsImpr : 0;

  const byClicks = [...classified].sort((a, b) => b.clicks - a.clicks);
  const signalQueries = classified
    .filter((r) => r.bucket === 'import' || r.bucket === 'enterprise' || r.bucket === 'wm_advisor' || r.bucket === 'brand')
    .sort((a, b) => b.clicks - a.clicks || b.ctr - a.ctr)
    .slice(0, 10);

  return {
    siteUrl,
    startDate,
    endDate,
    totals: {
      clicks: totalsClicks,
      impressions: totalsImpr,
      ctr: totalsImpr > 0 ? totalsClicks / totalsImpr : 0,
      position: weightedPos,
    },
    topQueries: byClicks.slice(0, 10),
    signalQueries,
    clickShare: clickShareByBucket(classified),
  };
}

/** Pocket Portfolio GSC (default property). */
export async function fetchGscTelemetry(days = 28): Promise<GscTelemetry> {
  return fetchGscTelemetryForSite(gscPocketSiteUrl(), days);
}

/** Open Portfolio B2B GSC property. */
export async function fetchGscOpenTelemetry(days = 28): Promise<GscTelemetry> {
  return fetchGscTelemetryForSite(gscOpenSiteUrl(), days);
}

export async function fetchGscPageMix(days = 28): Promise<{ farmPageShare: number; importPageShare: number }> {
  const token = await getGrowthGoogleAccessToken();
  const siteUrl = gscPocketSiteUrl();
  const { startDate, endDate } = dateWindow(days);

  const json = await gscAnalyticsQuery(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 250,
    dataState: 'all',
  });

  const rows = (json.rows ?? []).map((row) => ({
    clicks: row.clicks ?? 0,
    impressions: 0,
    bucket: classifyGscPage(row.keys?.[0] ?? ''),
  }));
  const share = clickShareByBucket(rows);
  return { farmPageShare: share.farm.share, importPageShare: share.import.share };
}

export async function fetchGscOpenPageMix(days = 28): Promise<GscOpenPageMix> {
  const token = await getGrowthGoogleAccessToken();
  const siteUrl = gscOpenSiteUrl();
  const { startDate, endDate } = dateWindow(days);

  const json = await gscAnalyticsQuery(token, siteUrl, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 250,
    dataState: 'all',
  });

  const rows = (json.rows ?? []).map((row) => ({
    page: row.keys?.[0] ?? '',
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    position: row.position ?? 0,
    bucket: classifyOpenGscPage(row.keys?.[0] ?? ''),
  }));

  const share = openPageClickShare(rows.map((r) => ({ clicks: r.clicks, bucket: r.bucket })));

  const pillarZeroClick = rows
    .filter((r) => r.bucket === 'pillar' && r.impressions > 0 && r.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8)
    .map((r) => ({
      page: r.page.replace(/^https?:\/\/[^/]+/, '') || r.page,
      impressions: r.impressions,
      position: r.position,
    }));

  return {
    blogFarmPageShare: share.blog_farm.share,
    pillarPageShare: share.pillar.share,
    pillarZeroClick,
  };
}
