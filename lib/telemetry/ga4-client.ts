import { getGrowthGoogleAccessToken } from './google-sa-token';

export interface Ga4SourceRow {
  sourceMedium: string;
  sessions: number;
  engagedSessions: number;
  avgEngagementSec: number;
}

export interface Ga4EventRow {
  eventName: string;
  eventCount: number;
}

export interface Ga4LandingRow {
  landingPage: string;
  sessions: number;
  avgEngagementSec: number;
}

export interface Ga4Telemetry {
  propertyId: string;
  sources: Ga4SourceRow[];
  conversionEvents: Ga4EventRow[];
  enterpriseLandings: Ga4LandingRow[];
}

function ga4PropertyId(): string {
  const raw = process.env.GA4_PROPERTY_ID?.trim() || '501238770';
  return raw.replace(/^properties\//, '');
}

function dateRangeDays(days: number) {
  return { startDate: `${days}daysAgo`, endDate: 'today' };
}

async function runReport(token: string, propertyId: string, body: unknown): Promise<unknown> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );
  const json = (await res.json()) as { rows?: unknown[]; error?: { message?: string } };
  if (!res.ok) {
    throw Object.assign(new Error(json.error?.message || `GA4 ${res.status}`), {
      code: 'GA4_QUERY_FAILED',
      status: res.status,
    });
  }
  return json;
}

export async function fetchGa4Telemetry(days = 28): Promise<Ga4Telemetry> {
  const token = await getGrowthGoogleAccessToken();
  const propertyId = ga4PropertyId();
  const range = dateRangeDays(days);

  const [sourceJson, eventJson, landingJson] = await Promise.all([
    runReport(token, propertyId, {
      dateRanges: [range],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 12,
    }),
    runReport(token, propertyId, {
      dateRanges: [range],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: [
              'developer_utility_conversion',
              'csv_import_success',
              'newsroom_cta_click',
              'newsroom_briefing_click',
              'advisor_tool',
            ],
          },
        },
      },
      limit: 20,
    }),
    runReport(token, propertyId, {
      dateRanges: [range],
      dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'averageSessionDuration' }],
      dimensionFilter: {
        orGroup: {
          expressions: [
            '/tier1designpartner',
            '/architecture',
            '/for/advisors',
            '/import/',
            '/learn/',
            '/newsroom',
          ].map((value) => ({
            filter: {
              fieldName: 'landingPagePlusQueryString',
              stringFilter: { matchType: 'CONTAINS', value, caseSensitive: false },
            },
          })),
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    }),
  ]);

  const sources = rowsOf(sourceJson).map((row) => ({
    sourceMedium: dim(row, 0),
    sessions: num(row, 0),
    engagedSessions: num(row, 1),
    avgEngagementSec: num(row, 2),
  }));

  const conversionEvents = rowsOf(eventJson).map((row) => ({
    eventName: dim(row, 0),
    eventCount: num(row, 0),
  }));

  const ENTERPRISE_PATHS = [
    '/tier1designpartner',
    '/architecture',
    '/for/advisors',
    '/import/',
    '/learn/',
    '/newsroom',
  ];
  const enterpriseLandings = rowsOf(landingJson)
    .map((row) => ({
      landingPage: dim(row, 0),
      sessions: num(row, 0),
      avgEngagementSec: num(row, 1),
    }))
    .filter((row) => ENTERPRISE_PATHS.some((p) => row.landingPage.toLowerCase().includes(p)))
    .slice(0, 8);

  return { propertyId, sources, conversionEvents, enterpriseLandings };
}

type Ga4Row = { dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> };

function rowsOf(json: unknown): Ga4Row[] {
  return ((json as { rows?: Ga4Row[] })?.rows ?? []) as Ga4Row[];
}
function dim(row: Ga4Row, i: number): string {
  return row.dimensionValues?.[i]?.value ?? '(not set)';
}
function num(row: Ga4Row, i: number): number {
  return Number(row.metricValues?.[i]?.value ?? 0);
}
