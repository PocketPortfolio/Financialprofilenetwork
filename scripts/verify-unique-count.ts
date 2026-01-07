/**
 * Verify Actual Unique Ticker Count
 * This script imports the ticker generator and checks the actual unique count
 * after Set deduplication
 */

import { getAllTickersExpanded, getTickerCount } from '../app/lib/pseo/ticker-generator';

console.log('=== ACTUAL UNIQUE TICKER COUNT VERIFICATION ===\n');

try {
  const uniqueCount = getTickerCount();
  const allTickers = getAllTickersExpanded();
  
  console.log(`✅ Actual unique ticker count: ${uniqueCount.toLocaleString()}`);
  console.log(`✅ Target: 15,000+`);
  console.log(`✅ Status: ${uniqueCount >= 15000 ? '✅ EXCEEDED' : '❌ BELOW TARGET'}`);
  console.log(`\nSample tickers (first 20):`);
  allTickers.slice(0, 20).forEach((ticker, i) => {
    console.log(`  ${i + 1}. ${ticker}`);
  });
  
  // Check for duplicates
  const tickerSet = new Set(allTickers);
  if (tickerSet.size !== allTickers.length) {
    console.log(`\n⚠️  WARNING: Found ${allTickers.length - tickerSet.size} duplicates in array`);
  } else {
    console.log(`\n✅ No duplicates found - all tickers are unique`);
  }
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

