/**
 * Export docs/marketing/RISK-REGISTER-Innovate-UK-Sovereign-Financial-AI.md to PDF (landscape A4).
 * Run: node scripts/export-risk-register-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const MD = path.join(root, 'docs', 'marketing', 'RISK-REGISTER-Innovate-UK-Sovereign-Financial-AI.md');
const OUT = path.join(root, 'docs', 'marketing', 'RISK-REGISTER-Innovate-UK-Sovereign-Financial-AI.pdf');

const CSS = `
  @page { size: A4 landscape; margin: 10mm 8mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 9pt;
    color: #1e1e1e;
    line-height: 1.35;
    margin: 0;
    padding: 0;
  }
  h1 {
    font-size: 14pt;
    margin: 0 0 8pt 0;
    padding-bottom: 6pt;
    border-bottom: 2pt solid #f59e0b;
    color: #111;
  }
  p { margin: 4pt 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 8pt 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 7pt;
    table-layout: fixed;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 4px 5px;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  th {
    background: #f5f5f5;
    font-weight: 700;
  }
  code {
    font-family: ui-monospace, Consolas, monospace;
    font-size: 7pt;
    background: #f4f4f5;
    padding: 0 2px;
  }
  em { font-size: 8pt; color: #444; }
`;

async function main() {
  const md = fs.readFileSync(MD, 'utf8');
  const bodyHtml = marked.parse(md, { gfm: true, breaks: false });
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Risk Register</title>
    <style>${CSS}</style></head><body>${bodyHtml}</body></html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: OUT,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', right: '8mm', bottom: '10mm', left: '8mm' },
    });
  } finally {
    await browser.close();
  }
  console.log('WROTE', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
