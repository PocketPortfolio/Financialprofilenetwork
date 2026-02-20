#!/usr/bin/env node
'use strict';
/**
 * Verify that public/book-assets has the files needed for both books to load images on Vercel.
 * Run after: npm run build:book-assets (or full npm run build).
 * Usage: node scripts/verify-book-assets-for-deploy.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pub = path.join(root, 'public', 'book-assets');

const required = [
  'assets/covers/sovereign-intelligence-cover.svg',
  'assets/covers/universal-llm-import-cover.svg',
  'figures/si-figure-01-data-chasm.svg',
  'figures/figure-02-local-first-flow.svg',
  'assets/chapter-headers/chapter-01-header.svg',
];

let failed = [];
for (const rel of required) {
  const full = path.join(pub, rel);
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    failed.push(rel);
  }
}

if (failed.length) {
  console.error('Missing book assets (run: npm run build:book-assets):', failed);
  process.exit(1);
}
console.log('OK: public/book-assets has all required files for both books (' + required.length + ' checked).');
