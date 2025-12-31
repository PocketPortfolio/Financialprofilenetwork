import { NextResponse } from 'next/server';

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
    // Fetch current week and previous week stats for comparison
    const packageStats = await Promise.all(
      NPM_PACKAGES.map(async (packageName) => {
        try {
          // Create timeout controllers
          const currentController = new AbortController();
          const previousController = new AbortController();
          const currentTimeoutId = setTimeout(() => currentController.abort(), 10000);
          const previousTimeoutId = setTimeout(() => previousController.abort(), 10000);

          // Fetch current week (last 7 days)
          const currentResponse = await fetch(
            `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`,
            {
              headers: { 'Accept': 'application/json' },
              signal: currentController.signal,
            }
          );
          clearTimeout(currentTimeoutId);

          // Fetch previous week (7-14 days ago)
          // Calculate dates for previous week (last complete week before current week)
          const today = new Date();
          const lastWeekEnd = new Date(today);
          lastWeekEnd.setDate(lastWeekEnd.getDate() - 7); // 7 days ago
          const lastWeekStart = new Date(lastWeekEnd);
          lastWeekStart.setDate(lastWeekStart.getDate() - 6); // 6 more days back (7 days total)
          
          const startDateStr = lastWeekStart.toISOString().split('T')[0];
          const endDateStr = lastWeekEnd.toISOString().split('T')[0];

          let currentWeek = 0;
          let previousWeek = 0;

          if (currentResponse.ok) {
            const currentData = await currentResponse.json();
            currentWeek = currentData.downloads || 0;
          } else {
            console.warn(`Failed to fetch current week for ${packageName}: ${currentResponse.status}`);
          }

          const previousResponse = await fetch(
            `https://api.npmjs.org/downloads/range/${startDateStr}:${endDateStr}/${encodeURIComponent(packageName)}`,
            {
              headers: { 'Accept': 'application/json' },
              signal: previousController.signal,
            }
          );
          clearTimeout(previousTimeoutId);

          if (previousResponse.ok) {
            const previousData = await previousResponse.json();
            // npmjs.org API returns: { downloads: [{ day: "YYYY-MM-DD", downloads: number }, ...] }
            if (previousData.downloads && Array.isArray(previousData.downloads)) {
              previousWeek = previousData.downloads.reduce(
                (sum: number, day: { downloads: number }) => sum + (day.downloads || 0),
                0
              );
            }
          } else {
            console.warn(`Failed to fetch previous week for ${packageName}: ${previousResponse.status} (${startDateStr} to ${endDateStr})`);
          }

          return {
            name: packageName,
            currentWeek,
            previousWeek,
            error: false,
          };
        } catch (error: any) {
          // Handle timeout and other errors (matching admin analytics error handling)
          if (error.name === 'AbortError') {
            console.error(`Timeout fetching ${packageName}`);
          } else {
            console.error(`Error fetching ${packageName}:`, error.message || error);
          }
          return {
            name: packageName,
            currentWeek: 0,
            previousWeek: 0,
            error: true,
          };
        }
      })
    );

    // Calculate totals
    const totalCurrentWeek = packageStats.reduce(
      (sum, pkg) => sum + pkg.currentWeek,
      0
    );
    const totalPreviousWeek = packageStats.reduce(
      (sum, pkg) => sum + pkg.previousWeek,
      0
    );

    // Calculate percentage change
    let change = 0;
    let hasValidComparison = false;
    
    if (totalPreviousWeek > 0 && totalCurrentWeek > 0) {
      // Only calculate change if we have valid data for both weeks
      change = ((totalCurrentWeek - totalPreviousWeek) / totalPreviousWeek) * 100;
      hasValidComparison = true;
    }
    // If previous week is 0, don't show a percentage (will be handled in UI)

    console.log('NPM Stats Calculation:', {
      totalCurrentWeek,
      totalPreviousWeek,
      change,
      hasValidComparison,
      packageStats: packageStats.map(p => ({ name: p.name, current: p.currentWeek, previous: p.previousWeek }))
    });

    // Add cache-busting headers to ensure fresh data
    return NextResponse.json({
      totalDownloads: totalCurrentWeek,
      previousWeekDownloads: totalPreviousWeek,
      change: Math.round(change * 10) / 10, // Round to 1 decimal
      isIncrease: change > 0,
      hasValidComparison, // Flag to indicate if comparison is valid
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
        previousWeekDownloads: 0,
        change: 0,
        isIncrease: false,
        error: true,
      },
      { status: 500 }
    );
  }
}

