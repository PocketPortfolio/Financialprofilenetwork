#!/usr/bin/env node
/**
 * Converts UNIVERSAL-LLM-IMPORT-BOOK.md to a single .docx file.
 * Run: node docs/book/convert-to-docx.js
 * Requires: npm install @mohtasham/md-to-docx (or use pandoc if available)
 */
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'UNIVERSAL-LLM-IMPORT-BOOK.md');
const outPath = path.join(__dirname, 'Universal-LLM-Import-Book.docx');

// Strip YAML front matter for packages that don't support it
let md = fs.readFileSync(mdPath, 'utf8');
if (md.startsWith('---')) {
  const end = md.indexOf('---', 4);
  if (end !== -1) md = md.slice(end + 3).replace(/^\n+/, '');
}

// Try @mohtasham/md-to-docx (accepts path or content)
try {
  const mdToDocx = require('@mohtasham/md-to-docx');
  const input = mdPath; // package reads file from path
  mdToDocx({ path: input })
    .then((buffer) => {
      fs.writeFileSync(outPath, Buffer.from(buffer));
      console.log('Written:', outPath);
    })
    .catch((err) => {
      console.error('md-to-docx failed:', err.message);
      process.exit(1);
    });
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.error('Install with: npm install @mohtasham/md-to-docx');
    console.error('Then from repo root run: node docs/book/convert-to-docx.js');
    process.exit(1);
  }
  throw e;
}
