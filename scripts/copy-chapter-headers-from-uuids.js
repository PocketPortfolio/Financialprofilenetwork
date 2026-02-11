#!/usr/bin/env node
'use strict';
/**
 * Copy chapter header PNGs from a folder of UUID-named files into the names
 * the book expects (chapter-01-header.png … chapter-11-header.png).
 *
 * Usage:
 *   node scripts/copy-chapter-headers-from-uuids.js [sourceDir]
 *
 * Source dir: folder containing files like chapter-01-header-<uuid>.png.
 * If omitted, uses docs/book/assets/chapter-headers (in-place rename/sanity check).
 *
 * Target: docs/book/assets/chapter-headers/chapter-NN-header.png (NN = 01..11).
 * After running, execute: npm run book:copy-assets
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targetDir = path.join(root, 'docs', 'book', 'assets', 'chapter-headers');
const sourceDir = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : targetDir;

if (!fs.existsSync(sourceDir)) {
  console.error('Source directory not found:', sourceDir);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

const chapterPattern = /^chapter-(\d{1,2})-header/i;
const files = fs.readdirSync(sourceDir).filter((name) => /\.png$/i.test(name));

function isPlaceholderPng(filePath) {
  try {
    const buf = fs.readFileSync(filePath, { start: 0, end: 24 });
    if (buf.length < 24 || buf[0] !== 0x89 || buf.toString('ascii', 1, 4) !== 'PNG') return false;
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    return w === 1 && h === 1;
  } catch (_) {
    return false;
  }
}

for (let n = 1; n <= 11; n++) {
  const nn = String(n).padStart(2, '0');
  const expectedName = `chapter-${nn}-header.png`;
  const targetPath = path.join(targetDir, expectedName);

  // Prefer: (1) non-placeholder exact name, (2) any chapter-NN-header*.png (e.g. UUID), (3) exact name (placeholder)
  let sourcePath = null;
  const exact = path.join(sourceDir, expectedName);
  const exactExists = fs.existsSync(exact);
  const exactIsPlaceholder = exactExists && isPlaceholderPng(exact);

  const uuidMatch = files.find((f) => {
    const m = f.match(chapterPattern);
    return m && parseInt(m[1], 10) === n && f !== expectedName;
  });

  if (uuidMatch) {
    sourcePath = path.join(sourceDir, uuidMatch);
  } else if (exactExists && !exactIsPlaceholder) {
    sourcePath = exact;
  } else if (exactExists) {
    sourcePath = exact;
  }

  if (sourcePath) {
    fs.copyFileSync(sourcePath, targetPath);
    const isReal = !isPlaceholderPng(sourcePath);
    console.log(isReal ? 'OK' : 'COPY', path.basename(sourcePath), '->', expectedName, isReal ? '(real image)' : '');
  } else {
    console.warn('Skip', expectedName, '(no source file for chapter', n + ')');
  }
}

console.log('Done. Run: npm run book:copy-assets');
