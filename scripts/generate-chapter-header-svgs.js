#!/usr/bin/env node
'use strict';
/**
 * Generate 11 chapter header SVG files for the book (web app).
 * Writes to docs/book/assets/chapter-headers/chapter-NN-header.svg.
 * Run: node scripts/generate-chapter-header-svgs.js
 * Then: npm run book:copy-assets
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'docs', 'book', 'assets', 'chapter-headers');

const titles = [
  'Chapter 1 — What Is Universal LLM Import',
  'Chapter 2 — Why CSV Over APIs',
  'Chapter 3 — Local-First Architecture',
  'Chapter 4 — Universal LLM Import Pipeline',
  'Chapter 5 — Tech Stack & Model Choices',
  'Chapter 6 — Sovereign Data & Google Drive Sync',
  'Chapter 7 — Benefits of Universal LLM Import',
  'Chapter 8 — Universal Import vs API Integrations',
  'Chapter 9 — Security, Privacy & Threat Modeling',
  'Chapter 10 — Use Cases & Extension Paths',
  'Chapter 11 — Why This Matters for the Future of Finance',
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgContent(title) {
  const safe = escapeXml(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" font-family="system-ui, -apple-system, Segoe UI, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#334155"/>
    </linearGradient>
  </defs>
  <rect width="800" height="200" fill="url(#bg)" rx="8"/>
  <text x="400" y="110" text-anchor="middle" fill="#f8fafc" font-size="28" font-weight="600">${safe}</text>
</svg>`;
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (let n = 1; n <= 11; n++) {
  const nn = String(n).padStart(2, '0');
  const name = `chapter-${nn}-header.svg`;
  const filePath = path.join(outDir, name);
  const title = titles[n - 1];
  fs.writeFileSync(filePath, svgContent(title), 'utf8');
  console.log('Wrote', name);
}

console.log('Done. Run: npm run book:copy-assets');
