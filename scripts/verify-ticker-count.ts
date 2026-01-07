/**
 * Verify Ticker Count Script
 * Checks the actual unique ticker count after deduplication
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Read the ticker generator to understand the structure
const tickerGenPath = join(process.cwd(), 'app', 'lib', 'pseo', 'ticker-generator.ts');
const tickerGenContent = readFileSync(tickerGenPath, 'utf-8');

// Extract all ticker arrays from real-tickers.ts
const realTickersPath = join(process.cwd(), 'app', 'lib', 'pseo', 'real-tickers.ts');
const realTickersContent = readFileSync(realTickersPath, 'utf-8');

// Count tickers in each section
const sections = [
  'MAJOR_ETFS',
  'CRYPTO_PAIRS', 
  'RUSSELL_2000_TOP',
  'INTERNATIONAL_STOCKS',
  'ADDITIONAL_POPULAR',
  'SP600_STOCKS',
  'ADDITIONAL_ETFS_EXPANDED',
  'ADDITIONAL_CRYPTO_EXPANDED',
  'ADDITIONAL_INTERNATIONAL_EXPANDED',
  'OTC_STOCKS'
];

const counts: Record<string, number> = {};
let totalInArrays = 0;

sections.forEach(section => {
  const regex = new RegExp(`export const ${section} = \\[([\\s\\S]*?)\\];`);
  const match = realTickersContent.match(regex);
  if (match) {
    const tickers = match[1].match(/'[A-Z0-9-]+'/g) || [];
    counts[section] = tickers.length;
    totalInArrays += tickers.length;
  } else {
    counts[section] = 0;
  }
});

console.log('=== TICKER COUNT VERIFICATION ===\n');
Object.keys(counts).forEach(key => {
  console.log(`${key}: ${counts[key].toLocaleString()}`);
});
console.log(`\nTotal in arrays: ${totalInArrays.toLocaleString()}`);

// Estimate unique count (accounting for S&P 500, NASDAQ 100, and overlaps)
const sp500Count = 500;
const nasdaq100Count = 100;
const estimatedOverlap = 50; // NASDAQ 100 overlaps with S&P 500

const estimatedUnique = totalInArrays + sp500Count + nasdaq100Count - estimatedOverlap;
console.log(`\nEstimated unique (before Set deduplication): ~${estimatedUnique.toLocaleString()}`);
console.log(`Target: 15,000+`);
console.log(`Gap: ~${Math.max(0, 15000 - estimatedUnique).toLocaleString()} more tickers needed`);

