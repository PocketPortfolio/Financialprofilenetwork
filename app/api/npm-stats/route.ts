import { NextResponse } from 'next/server';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Order MUST match `PACKAGES` in lib/canonical-claims.ts so press / AEO
 * aggregates stay consistent with the substrate table.
 */
const NPM_PACKAGES = [
  '@pocket-portfolio/importer',
  '@pocket-portfolio/fidelity-csv-export',
  '@pocket-portfolio/coinbase-transaction-parser',
  '@pocket-portfolio/etoro-history-importer',
  '@pocket-portfolio/robinhood-csv-parser',
  '@pocket-portfolio/trading212-to-json',
  '@pocket-portfolio/koinly-csv-parser',
  '@pocket-portfolio/turbotax-csv-parser',
  '@pocket-portfolio/ghostfolio-csv-parser',
  '@pocket-portfolio/sharesight-csv-parser',
  '@pocket-portfolio/universal-csv-importer',
];

async function fetchPoint(
  packageName: string,
  range: string,
  signal: AbortSignal,
): Promise<number> {
  const response = await fetch(
    `https://api.npmjs.org/downloads/point/${range}/${encodeURIComponent(packageName)}`,
    {
      headers: { Accept: 'application/json' },
      signal,
    },
  );
  if (!response.ok) {
    console.warn(`Failed to fetch ${range} downloads for ${packageName}: ${response.status}`);
    return 0;
  }
  const data = (await response.json()) as { downloads?: number };
  return data.downloads || 0;
}

export async function GET() {
  try {
    const endDate = new Date();
    const startDate = new Date('2010-01-01');
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const allTimeRange = `${startDateStr}:${endDateStr}`;

    const packageStats = await Promise.all(
      NPM_PACKAGES.map(async (packageName) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          try {
            const [totalDownloads, last30DaysDownloads] = await Promise.all([
              fetchPoint(packageName, allTimeRange, controller.signal),
              fetchPoint(packageName, 'last-month', controller.signal),
            ]);
            return {
              name: packageName,
              totalDownloads,
              last30DaysDownloads,
              error: false,
            };
          } finally {
            clearTimeout(timeoutId);
          }
        } catch (error: unknown) {
          const err = error as { name?: string; message?: string };
          if (err.name === 'AbortError') {
            console.error(`Timeout fetching ${packageName}`);
          } else {
            console.error(`Error fetching ${packageName}:`, err.message || error);
          }
          return {
            name: packageName,
            totalDownloads: 0,
            last30DaysDownloads: 0,
            error: true,
          };
        }
      }),
    );

    const totalDownloads = packageStats.reduce((sum, pkg) => sum + pkg.totalDownloads, 0);
    const last30DaysDownloads = packageStats.reduce(
      (sum, pkg) => sum + pkg.last30DaysDownloads,
      0,
    );

    return NextResponse.json(
      {
        totalDownloads,
        last30DaysDownloads,
        lastUpdated: new Date().toISOString(),
        packages: packageStats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  } catch (error) {
    console.error('NPM stats fetch error:', error);
    return NextResponse.json(
      {
        totalDownloads: 0,
        last30DaysDownloads: 0,
        error: true,
      },
      { status: 500 },
    );
  }
}
