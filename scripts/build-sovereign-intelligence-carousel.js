#!/usr/bin/env node
'use strict';
/**
 * Build the 5-slide "Sovereign Intelligence" PDF carousel for LinkedIn.
 * Uses SI cover, Hybrid RAG figure, and SI-themed copy. Same pattern as Universal LLM Import carousel.
 *
 * Run from repo root: node scripts/build-sovereign-intelligence-carousel.js
 * Output: docs/marketing/Sovereign_Intelligence_Architecture.pdf
 *
 * Requires: puppeteer, qrcode (npm install qrcode)
 */

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..');
const marketingDir = path.join(root, 'docs', 'marketing');
const bookDir = path.join(root, 'docs', 'book');
const bookCovers = path.join(bookDir, 'assets', 'covers');
const bookFigures = path.join(bookDir, 'figures');

const outPdf = path.join(marketingDir, 'Sovereign_Intelligence_Architecture.pdf');
const outHtml = path.join(marketingDir, '_carousel-si.html');

const BOOK_URL = 'https://www.pocketportfolio.app/book/sovereign-intelligence';

function getChromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const winPaths = [
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ];
  for (const p of winPaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;
const QR_PNG_FILENAME = '_qr_si.png';

async function generateQrPng() {
  try {
    const QR = require('qrcode');
    const qrPath = path.join(marketingDir, QR_PNG_FILENAME);
    const buffer = await QR.toBuffer(BOOK_URL, { type: 'png', width: 220, margin: 1 });
    fs.writeFileSync(qrPath, buffer);
    return QR_PNG_FILENAME;
  } catch (e) {
    return null;
  }
}

function buildHtml(qrRelativePath) {
  const cover = '../book/assets/covers/sovereign-intelligence-cover.svg';
  const figureHybrid = '../book/figures/si-figure-02-hybrid-architecture.svg';
  const logo = '../../public/brand/pp-monogram-email.svg';

  const footerWithLogo = `<span class="footer-with-logo"><img src="${logo}" alt="" class="footer-logo" />Pocket Portfolio Technical Press</span>`;
  const qrImg = qrRelativePath
    ? `<img src="${qrRelativePath}" alt="QR Code" class="qr-code" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sovereign Intelligence: Local-First RAG for Finance</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', 'Helvetica Neue', system-ui, sans-serif; background: #0b1220; color: #f8fafc; }
    .slide { width: ${SLIDE_WIDTH}px; height: ${SLIDE_HEIGHT}px; padding: 72px 56px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
    .slide:last-child { page-break-after: auto; }
    .slide h1 { font-size: 42px; font-weight: 700; margin: 0 0 16px; line-height: 1.2; }
    .slide h2 { font-size: 28px; font-weight: 600; margin: 0 0 24px; color: #cbd5e1; }
    .slide .body { font-size: 22px; line-height: 1.5; color: #e2e8f0; max-width: 90%; }
    .slide .footer { font-size: 14px; color: #94a3b8; }
    .slide .visual { flex: 1; display: flex; align-items: center; justify-content: center; margin: 24px 0; min-height: 280px; }
    .slide .visual img { max-width: 100%; max-height: 420px; object-fit: contain; }
    .slide .qr-code { width: 220px; height: 220px; }
    table.data-boundaries { width: 100%; border-collapse: collapse; font-size: 18px; margin: 16px 0; }
    table.data-boundaries th, table.data-boundaries td { border: 1px solid #475569; padding: 14px 18px; text-align: left; }
    table.data-boundaries th { background: #1e293b; color: #f8fafc; }
    table.data-boundaries tr:nth-child(2) { background: #134e3a; }
    table.data-boundaries td { color: #e2e8f0; }
    .cta-button { display: inline-block; margin-top: 24px; padding: 16px 32px; background: #34d399; color: #0f172a; font-size: 22px; font-weight: 600; text-decoration: none; border-radius: 8px; }
    .slide-logo { width: 56px; height: 56px; display: block; margin-bottom: 24px; }
    .footer-with-logo { display: inline-flex; align-items: center; gap: 10px; }
    .footer-logo { width: 28px; height: 28px; vertical-align: middle; }
  </style>
</head>
<body>
  <!-- Slide 1: Cover -->
  <div class="slide">
    <div>
      <img src="${logo}" alt="Pocket Portfolio" class="slide-logo" />
      <h2>Privacy-First Financial AI</h2>
      <h1>Sovereign Intelligence: Local-First RAG for Finance</h1>
    </div>
    <div class="visual">
      <img src="${cover}" alt="Sovereign Intelligence" style="max-height: 480px;" />
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 2: The Problem -->
  <div class="slide">
    <div>
      <h1>The industry standard is a privacy nightmare</h1>
      <p class="body">"The default for building AI apps is to ship raw user data to the cloud. In fintech, that breaks the fundamental rule of data sovereignty. Your ledger should not live in someone else's training set."</p>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 3: Hybrid RAG -->
  <div class="slide">
    <div>
      <h1>We move the AI to your data, not your data to the AI</h1>
      <p class="body">Memory (trades, positions) stays in the browser. Only a sanitized context crosses the wire. The API is stateless: (context, message) → stream.</p>
    </div>
    <div class="visual">
      <img src="${figureHybrid}" alt="Hybrid RAG Architecture" />
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 4: Data boundaries -->
  <div class="slide">
    <div>
      <h1>Local-First Data Boundaries</h1>
      <p class="body">"IndexedDB holds the raw ledger. The context builder compresses 10,000 trades into a token-efficient summary. Only that summary and the user message go to the LLM."</p>
    </div>
    <div class="visual">
      <table class="data-boundaries">
        <tr><th>Boundary</th><th>Contents</th></tr>
        <tr><td><strong>Browser</strong></td><td>IndexedDB, Redux, full trade history, context builder, CSV parse (transient)</td></tr>
        <tr><td><strong>Server</strong></td><td>Sanitized context string + user message → Gemini; no storage of ledger or PII</td></tr>
      </table>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 5: CTA -->
  <div class="slide">
    <div>
      <h1>Read the complete blueprint</h1>
      <p class="body">"We published the exact architecture running in production at Pocket Portfolio. 25,000 words. Free."</p>
    </div>
    <div class="visual">
      ${qrImg}
      <p style="margin-top: 20px;"><a href="${BOOK_URL}" class="cta-button">Read Sovereign Intelligence</a></p>
      <p style="font-size: 18px; color: #94a3b8; margin-top: 16px;">pocketportfolio.app/book/sovereign-intelligence</p>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(path.join(bookCovers, 'sovereign-intelligence-cover.svg'))) {
    console.error('Missing docs/book/assets/covers/sovereign-intelligence-cover.svg');
    process.exit(1);
  }
  if (!fs.existsSync(path.join(bookFigures, 'si-figure-02-hybrid-architecture.svg'))) {
    console.error('Missing docs/book/figures/si-figure-02-hybrid-architecture.svg');
    process.exit(1);
  }

  fs.mkdirSync(marketingDir, { recursive: true });

  const qrPath = await generateQrPng();
  if (!qrPath) console.warn('Optional: npm install qrcode for QR on slide 5');

  const html = buildHtml(qrPath);
  fs.writeFileSync(outHtml, html, 'utf8');

  const puppeteer = require('puppeteer');
  const fileUrl = pathToFileURL(outHtml).href;
  const chromePath = getChromePath();
  const launchOpts = chromePath ? { executablePath: chromePath, headless: true } : { headless: true };

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.emulateMediaType('print');
  await page.pdf({
    path: outPdf,
    width: `${SLIDE_WIDTH}px`,
    height: `${SLIDE_HEIGHT}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();

  console.log('Created:', outPdf);
  try { fs.unlinkSync(outHtml); } catch (_) {}
  if (qrPath) {
    try { fs.unlinkSync(path.join(marketingDir, QR_PNG_FILENAME)); } catch (_) {}
  }
}

main().catch((e) => {
  console.error(e);
  console.error('If Puppeteer fails (e.g. sandbox), run locally: node scripts/build-sovereign-intelligence-carousel.js');
  console.error('Or open docs/marketing/_carousel-si.html in Chrome and Print → Save as PDF (1080x1350).');
  process.exit(1);
});
