import { NextResponse } from 'next/server';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// NPM packages to track
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
];

export async function GET() {
  try {
    // Fetch total downloads (all-time) for all packages
    const packageStats = await Promise.all(
      NPM_PACKAGES.map(async (packageName) => {
        try {
          // Create timeout controller
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          // Fetch total downloads from a very early date to today
          // npm API typically stores data from around 2010, so we use that as start date
          const endDate = new Date();
          const startDate = new Date('2010-01-01'); // Very early date to capture all downloads
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];

          const response = await fetch(
            `https://api.npmjs.org/downloads/point/${startDateStr}:${endDateStr}/${encodeURIComponent(packageName)}`,
            {
              headers: { 'Accept': 'application/json' },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          let totalDownloads = 0;

          if (response.ok) {
            const data = await response.json();
            totalDownloads = data.downloads || 0;
          } else {
            console.warn(`Failed to fetch total downloads for ${packageName}: ${response.status}`);
          }

          return {
            name: packageName,
            totalDownloads,
            error: false,
          };
        } catch (error: any) {
          // Handle timeout and other errors
          if (error.name === 'AbortError') {
            console.error(`Timeout fetching ${packageName}`);
          } else {
            console.error(`Error fetching ${packageName}:`, error.message || error);
          }
          return {
            name: packageName,
            totalDownloads: 0,
            error: true,
          };
        }
      })
    );

    // Calculate total across all packages
    const grandTotal = packageStats.reduce(
      (sum, pkg) => sum + pkg.totalDownloads,
      0
    );

    console.log('NPM Total Downloads:', {
      grandTotal,
      packageStats: packageStats.map(p => ({ name: p.name, total: p.totalDownloads }))
    });

    // Add cache-busting headers to ensure fresh data
    return NextResponse.json({
      totalDownloads: grandTotal,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('NPM stats fetch error:', error);
    return NextResponse.json(
      {
        totalDownloads: 0,
        error: true,
      },
      { status: 500 }
    );
  }
}

