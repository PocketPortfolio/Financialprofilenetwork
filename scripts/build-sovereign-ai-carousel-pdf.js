#!/usr/bin/env node
'use strict';
/**
 * Build the 6-slide Sovereign AI (Finance, Energy, Defense) PDF carousel for LinkedIn.
 * Renders the live /carousel route and prints to PDF.
 *
 * Prerequisite: dev server running. From repo root:
 *   npm run dev
 * Then in another terminal:
 *   node scripts/build-sovereign-ai-carousel-pdf.js
 *
 * Output: docs/marketing/Sovereign-AI-Architecture-Finance-Energy.pdf
 */

const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const marketingDir = path.join(root, 'docs', 'marketing');
const outPdf = path.join(marketingDir, 'Sovereign-AI-Architecture-Finance-Energy.pdf');

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;
const CAROUSEL_URL = process.env.CAROUSEL_URL || 'http://localhost:3001/carousel';

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

async function main() {
  fs.mkdirSync(marketingDir, { recursive: true });

  const puppeteer = require('puppeteer');
  const chromePath = getChromePath();
  const launchOpts = chromePath ? { executablePath: chromePath, headless: true } : { headless: true };

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, deviceScaleFactor: 2 });
  await page.goto(CAROUSEL_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  });
  await new Promise((r) => setTimeout(r, 500));
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
  console.log('Upload this file to LinkedIn as Sovereign-AI-Architecture-Finance-Energy.pdf for SEO.');
}

main().catch((e) => {
  console.error(e);
  console.error('\nEnsure the dev server is running first: npm run dev');
  console.error('Then run: node scripts/build-sovereign-ai-carousel-pdf.js');
  process.exit(1);
});
