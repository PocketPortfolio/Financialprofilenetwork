#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bookDir = path.join(root, 'docs', 'book');
const outDir = path.join(root, 'public', 'book-assets');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(bookDir)) {
  console.warn('docs/book not found, skipping book-assets copy');
  process.exit(0);
}
fs.mkdirSync(outDir, { recursive: true });
copyRecursive(path.join(bookDir, 'figures'), path.join(outDir, 'figures'));
copyRecursive(path.join(bookDir, 'assets'), path.join(outDir, 'assets'));
console.log('Book assets copied to public/book-assets');
