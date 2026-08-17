import { classifyGscPage, classifyGscQuery, clickShareByBucket, type GscQueryBucket } from './classify-gsc-query';
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

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function gscSiteUrl(): string {
  return process.env.GSC_SITE_URL?.trim() || 'sc-domain:pocketportfolio.app';
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

export async function fetchGscTelemetry(days = 28): Promise<GscTelemetry> {
  const token = await getGrowthGoogleAccessToken();
  const siteUrl = gscSiteUrl();
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  const startDate = ymd(start);
  const endDate = ymd(end);

  const encodedSite = encodeURIComponent(siteUrl);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 250,
      dataState: 'all',
    }),
  });

  const json = (await res.json()) as {
    rows?: Array<{
      keys?: string[];
      clicks?: number;
      impressions?: number;
      ctr?: number;
      position?: number;
    }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    const sites = await listGscSiteEntries(token);
    const seen = sites.entries.length
      ? sites.entries.map((e) => e.siteUrl).filter(Boolean).join(', ')
      : 'none';
    throw Object.assign(
      new Error(
        `${json.error?.message || `GSC ${res.status}`} (this service account sees ${sites.entries.length} GSC properties: ${seen})`,
      ),
      { code: 'GSC_QUERY_FAILED', status: res.status },
    );
  }

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

export async function fetchGscPageMix(days = 28): Promise<{ farmPageShare: number; importPageShare: number }> {
  const token = await getGrowthGoogleAccessToken();
  const siteUrl = gscSiteUrl();
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);

  const encodedSite = encodeURIComponent(siteUrl);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: ymd(start),
      endDate: ymd(end),
      dimensions: ['page'],
      rowLimit: 250,
      dataState: 'all',
    }),
  });
  const json = (await res.json()) as {
    rows?: Array<{ keys?: string[]; clicks?: number }>;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw Object.assign(new Error(json.error?.message || `GSC pages ${res.status}`), {
      code: 'GSC_PAGES_FAILED',
      status: res.status,
    });
  }

  const rows = (json.rows ?? []).map((row) => ({
    clicks: row.clicks ?? 0,
    impressions: 0,
    bucket: classifyGscPage(row.keys?.[0] ?? ''),
  }));
  const share = clickShareByBucket(rows);
  return { farmPageShare: share.farm.share, importPageShare: share.import.share };
}
