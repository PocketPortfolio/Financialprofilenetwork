/**
 * Fix sitemap-tickers-9 through 16 files
 */

import fs from 'fs';
import path from 'path';

const sitemapDir = path.join(process.cwd(), 'app');

const fixes = [
  { num: 9, ordinal: 'ninth', slice: 'slice(sixteenth * 8, sixteenth * 9)' },
  { num: 10, ordinal: 'tenth', slice: 'slice(sixteenth * 9, sixteenth * 10)' },
  { num: 11, ordinal: 'eleventh', slice: 'slice(sixteenth * 10, sixteenth * 11)' },
  { num: 12, ordinal: 'twelfth', slice: 'slice(sixteenth * 11, sixteenth * 12)' },
  { num: 13, ordinal: 'thirteenth', slice: 'slice(sixteenth * 12, sixteenth * 13)' },
  { num: 14, ordinal: 'fourteenth', slice: 'slice(sixteenth * 13, sixteenth * 14)' },
  { num: 15, ordinal: 'fifteenth', slice: 'slice(sixteenth * 14, sixteenth * 15)' },
  { num: 16, ordinal: 'sixteenth', slice: 'slice(sixteenth * 15)' },
];

fixes.forEach(({ num, ordinal, slice }) => {
  const filePath = path.join(sitemapDir, `sitemap-tickers-${num}.ts`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix header
  content = content.replace(
    /(\*\* Sitemap: Ticker Pages \(Part \d+\)\s*\*\s*)(.*?)(\s*\*\s*Max 50,000)/s,
    `$1${ordinal} sixteenth of ticker pages + data intent routes$3`
  );
  
  // Fix split logic
  content = content.replace(
    /\/\/ Split tickers: .*? goes to sitemap-\d+\s*const sixteenth = Math\.floor\(uniqueTickers\.length \/ 16\);\s*const \w+Sixteenth = uniqueTickers\.slice\([^)]+\);/s,
    `// Split tickers: ${ordinal} sixteenth goes to sitemap-${num}\n    const sixteenth = Math.floor(uniqueTickers.length / 16);\n    const ${ordinal}Sixteenth = uniqueTickers.${slice};`
  );
  
  // Fix forEach variable
  const oldVarMatch = content.match(/const (\w+Sixteenth) = uniqueTickers/);
  if (oldVarMatch && oldVarMatch[1] !== `${ordinal}Sixteenth`) {
    content = content.replace(new RegExp(oldVarMatch[1], 'g'), `${ordinal}Sixteenth`);
  }
  
  // Fix log message
  content = content.replace(
    /\(.*?sixteenth\)/,
    `(${ordinal} sixteenth)`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Fixed sitemap-tickers-${num}.ts`);
});

console.log('\n✅ All files fixed!');

