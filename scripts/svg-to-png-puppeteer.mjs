/**
 * Convert email-safe logo SVG to public/brand/pp-monogram.png for Stack Reveal header.
 * Uses pp-monogram-email.svg (real "P" shape, #0d2818 bg, white mark).
 * Run: node scripts/svg-to-png-puppeteer.mjs
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public/brand/pp-monogram-email.svg');
const outPath = path.join(root, 'public/brand/pp-monogram.png');

const svgContent = fs.readFileSync(svgPath, 'utf-8');
const html = `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:transparent;} img{width:80px;height:80px;}</style></head><body><img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" /></body></html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 80, height: 80, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
const el = await page.$('img');
await el.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log('Written', outPath);
