/**
 * Live npm aggregate for deck build — mirrors app/api/npm-stats/route.ts package list.
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
] as const;

async function fetchPackageTotal(packageName: string): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const endDateStr = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/2010-01-01:${endDateStr}/${encodeURIComponent(packageName)}`,
      { headers: { Accept: 'application/json' }, signal: controller.signal }
    );
    if (!response.ok) return 0;
    const data = (await response.json()) as { downloads?: number };
    return data.downloads ?? 0;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchLiveNpmAggregate(): Promise<{
  totalDownloads: number;
  fetchedAt: string;
  packageCount: number;
}> {
  const results = await Promise.all(
    NPM_PACKAGES.map(async (name) => ({ name, total: await fetchPackageTotal(name) }))
  );
  const totalDownloads = results.reduce((sum, r) => sum + r.total, 0);
  return {
    totalDownloads,
    fetchedAt: new Date().toISOString(),
    packageCount: NPM_PACKAGES.length,
  };
}
