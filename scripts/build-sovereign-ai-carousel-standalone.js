#!/usr/bin/env node
'use strict';
/**
 * Build the 6-slide Sovereign AI (Finance, Energy, Defense) PDF carousel for LinkedIn.
 * Uses the SAME pattern and styling as Sovereign_Intelligence_Architecture.pdf (our standard).
 * Standalone HTML + Puppeteer — no Next.js, no dev server.
 *
 * Run from repo root: node scripts/build-sovereign-ai-carousel-standalone.js
 * Output: docs/marketing/Sovereign-AI-Architecture-Finance-Energy.pdf
 */

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..');
const marketingDir = path.join(root, 'docs', 'marketing');
const outPdf = path.join(marketingDir, 'Sovereign-AI-Architecture-Finance-Energy.pdf');
const outHtml = path.join(marketingDir, '_carousel-sovereign-ai.html');

const GRANT_URL = 'https://pocketportfolio.app/sovereign-ai-grant';

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

function buildHtml() {
  const logo = '../../public/brand/pp-monogram-email.svg';
  const footerWithLogo = `<span class="footer-with-logo"><img src="${logo}" alt="" class="footer-logo" />Pocket Portfolio Technical Press</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sovereign AI: Finance, Energy, Defense</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', 'Helvetica Neue', system-ui, sans-serif; background: #0b1220; color: #f8fafc; }
    .slide { width: ${SLIDE_WIDTH}px; height: ${SLIDE_HEIGHT}px; padding: 72px 56px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
    .slide:last-child { page-break-after: auto; }
    .slide h1 { font-size: 42px; font-weight: 700; margin: 0 0 16px; line-height: 1.2; }
    .slide h2 { font-size: 28px; font-weight: 600; margin: 0 0 24px; color: #cbd5e1; }
    .slide .body { font-size: 22px; line-height: 1.5; color: #e2e8f0; max-width: 90%; }
    .slide .footer { font-size: 14px; color: #94a3b8; }
    .slide .visual { flex: 1; display: flex; align-items: center; justify-content: center; margin: 24px 0; min-height: 200px; flex-direction: column; gap: 16px; }
    .slide .highlight { color: #f59e0b; font-weight: 600; }
    .cta-button { display: inline-block; margin-top: 16px; padding: 16px 32px; background: #34d399; color: #0f172a; font-size: 22px; font-weight: 600; text-decoration: none; border-radius: 8px; }
    .cta-url { font-size: 18px; color: #94a3b8; margin-top: 12px; }
    .slide-logo { width: 56px; height: 56px; display: block; margin-bottom: 24px; }
    .footer-with-logo { display: inline-flex; align-items: center; gap: 10px; }
    .footer-logo { width: 28px; height: 28px; vertical-align: middle; }
    .steps { list-style: none; padding: 0; margin: 16px 0 0; }
    .steps li { font-size: 20px; color: #e2e8f0; margin-bottom: 12px; padding-left: 28px; position: relative; }
    .steps li::before { content: ''; position: absolute; left: 0; top: 6px; width: 12px; height: 12px; background: #34d399; border-radius: 50%; }
  </style>
</head>
<body>
  <!-- Slide 1: The Hook -->
  <div class="slide">
    <div>
      <img src="${logo}" alt="Pocket Portfolio" class="slide-logo" />
      <h2>Finance, Energy &amp; Defense</h2>
      <h1>The Sovereign AI Imperative.</h1>
      <p class="body">Why critical industries must rethink the cloud. Move the AI to the data, not the data to the AI.</p>
    </div>
    <div></div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 2: The Villain -->
  <div class="slide">
    <div>
      <h1>The Centralization Trap.</h1>
      <p class="body">Legacy AI architecture requires siphoning critical national data—grid telemetry, financial ledgers, and defense logistics—into centralized cloud databases. <span class="highlight">This creates massive security honeypots and total dependency on foreign tech monopolies.</span></p>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 3: The Paradigm Shift -->
  <div class="slide">
    <div>
      <h1>Sovereign Architecture.</h1>
      <p class="body">Move the AI to the data, not the data to the AI. Total intelligence. <span class="highlight">Zero data surrender.</span></p>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 4: The Blueprint -->
  <div class="slide">
    <div>
      <h1>The Blueprint.</h1>
      <p class="body">Three steps that enforce the boundary:</p>
      <ul class="steps">
        <li><strong>Local-First Boundaries</strong> — Process at the edge.</li>
        <li><strong>Sanitized Context</strong> — Compress to anomaly flags &amp; aggregates.</li>
        <li><strong>Stateless Cloud API</strong> — Execute inference with zero retention.</li>
      </ul>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 5: The Golden Rules -->
  <div class="slide">
    <div>
      <h1>The Rules of Sovereign Build.</h1>
      <ul class="steps">
        <li>Audit every byte of data egress.</li>
        <li>Ensure all endpoints are pure functions (Zero Storage).</li>
        <li>Decouple your revenue model from data exploitation.</li>
      </ul>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>

  <!-- Slide 6: CTA -->
  <div class="slide">
    <div>
      <h1>See the Blueprint in Action.</h1>
      <p class="body">We built the working model. No theory—production architecture you can inspect.</p>
    </div>
    <div class="visual">
      <a href="${GRANT_URL}" class="cta-button">View Sovereign AI Grant</a>
      <p class="cta-url">pocketportfolio.app/sovereign-ai-grant</p>
    </div>
    <div class="footer">${footerWithLogo}</div>
  </div>
</body>
</html>`;
}

async function main() {
  fs.mkdirSync(marketingDir, { recursive: true });

  const html = buildHtml();
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
  console.log('Upload as Sovereign-AI-Architecture-Finance-Energy.pdf for LinkedIn.');
}

main().catch((e) => {
  console.error(e);
  console.error('Run from repo root: node scripts/build-sovereign-ai-carousel-standalone.js');
  process.exit(1);
});
