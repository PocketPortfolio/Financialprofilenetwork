#!/usr/bin/env node
/**
 * Verify book assets: list chapter-header PNGs and figures, report PNG dimensions.
 * Run: node scripts/verify-book-assets.js
 * Use this to confirm which files are 1×1 placeholders vs real artwork.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sources = [
  { name: 'docs/book/assets/chapter-headers', dir: path.join(root, 'docs', 'book', 'assets', 'chapter-headers') },
  { name: 'docs/book/figures', dir: path.join(root, 'docs', 'book', 'figures') },
  { name: 'public/book-assets (copied)', dir: path.join(root, 'public', 'book-assets') },
];

function readPngSize(filePath) {
  try {
    const buf = fs.readFileSync(filePath, { start: 0, end: 24 });
    if (buf.length < 24 || buf[0] !== 0x89 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch (_) {
    return null;
  }
}

function walk(dir, baseDir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(baseDir, full);
    if (fs.statSync(full).isDirectory()) walk(full, baseDir, list);
    else list.push(rel.replace(/\\/g, '/'));
  }
  return list;
}

console.log('Book assets verification\n');

for (const { name, dir } of sources) {
  console.log(`\n--- ${name} ---`);
  if (!fs.existsSync(dir)) {
    console.log('  (directory not found)');
    continue;
  }
  const files = walk(dir, dir).sort();
  for (const f of files) {
    const full = path.join(dir, f);
    const ext = path.extname(f).toLowerCase();
    const stat = fs.statSync(full);
    const size = stat.size;
    if (ext === '.png') {
      const dim = readPngSize(full);
      const dimStr = dim ? `${dim.w}×${dim.h}` : '?';
      const note = dim && dim.w === 1 && dim.h === 1 ? ' (PLACEHOLDER – replace with real art)' : '';
      console.log(`  ${f}  ${dimStr}  ${size} bytes${note}`);
    } else {
      console.log(`  ${f}  ${size} bytes`);
    }
  }
}

console.log('\nDone. Chapter headers should be PNGs; 1×1 = placeholder from book:pdf.');
