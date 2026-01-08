/**
 * Script to update all ticker sitemap files from eighths to sixteenths
 * This reduces file size from ~1.3MB to ~650KB to prevent Googlebot timeouts
 */

import fs from 'fs';
import path from 'path';

const sitemapDir = path.join(process.cwd(), 'app');

// Update pattern for each file (1-8)
const updates = [
  { file: 'sitemap-tickers-1.ts', part: 'first', slice: 'slice(0, sixteenth)' },
  { file: 'sitemap-tickers-2.ts', part: 'second', slice: 'slice(sixteenth, sixteenth * 2)' },
  { file: 'sitemap-tickers-3.ts', part: 'third', slice: 'slice(sixteenth * 2, sixteenth * 3)' },
  { file: 'sitemap-tickers-4.ts', part: 'fourth', slice: 'slice(sixteenth * 3, sixteenth * 4)' },
  { file: 'sitemap-tickers-5.ts', part: 'fifth', slice: 'slice(sixteenth * 4, sixteenth * 5)' },
  { file: 'sitemap-tickers-6.ts', part: 'sixth', slice: 'slice(sixteenth * 5, sixteenth * 6)' },
  { file: 'sitemap-tickers-7.ts', part: 'seventh', slice: 'slice(sixteenth * 6, sixteenth * 7)' },
  { file: 'sitemap-tickers-8.ts', part: 'eighth', slice: 'slice(sixteenth * 7, sixteenth * 8)' },
];

console.log('Updating ticker sitemap files 1-8 to use sixteenths...\n');

updates.forEach(({ file, part, slice }) => {
  const filePath = path.join(sitemapDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update header
  content = content.replace(
    /(\*\* Sitemap: Ticker Pages \(Part \d+\)\s*\*\s*)(.*?eighth.*?)(\s*\*\s*Max 50,000)/s,
    `$1${part} sixteenth of ticker pages + data intent routes$3`
  );
  content = content.replace(
    /Target: ~1MB per sitemap/,
    'Target: ~650KB per sitemap (to prevent Googlebot timeouts)'
  );
  
  // Update split logic
  content = content.replace(
    /\/\/ Split tickers: .*? goes to sitemap-\d+\s*const eighth = Math\.floor\(uniqueTickers\.length \/ 8\);\s*const \w+Eighth = uniqueTickers\.slice\([^)]+\);/s,
    `// Split tickers: ${part} sixteenth goes to sitemap-${file.match(/\d+/)?.[0]}\n    const sixteenth = Math.floor(uniqueTickers.length / 16);\n    const ${part}Sixteenth = uniqueTickers.${slice};`
  );
  
  // Update forEach variable
  const oldVar = `${part}Eighth`;
  const newVar = `${part}Sixteenth`;
  content = content.replace(new RegExp(oldVar, 'g'), newVar);
  
  // Update log message
  content = content.replace(
    /\(${part} eighth\)/,
    `(${part} sixteenth)`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated ${file}`);
});

console.log('\n✅ All files updated!');

