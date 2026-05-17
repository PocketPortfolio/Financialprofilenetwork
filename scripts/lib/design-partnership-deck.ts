/**
 * Strategic design partnership decks — PPTX + PDF (parameterized).
 *
 * Partners: `plaid` | `freetrade`. Run via `npm run build:partner-deck -- --partner=freetrade`.
 *
 * SSOT: lib/canonical-claims.ts for founder + moat copy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

import {
  FOUNDER_CREDENTIALS_ABBA,
  MOAT_CLAIMS,
  POSITIONING,
} from '../../lib/canonical-claims';

export type PartnerDeckId = 'plaid' | 'freetrade';

export interface DeckCtx {
  partner: PartnerDeckId;
  ROOT: string;
  /** docs/marketing */
  outDir: string;
  cacheDir: string;
  outPdf: string;
  outPptx: string;
  docTitle: string;
  logoSvg: string;
  archSvg: string;
  pressAbbaDir: string;
  /** Primary partner mark files (Plaid logo paths or optional Freetrade assets). */
  partnerPrimaryCandidates: string[];
}

let deckCtx!: DeckCtx;

function initDeckCtx(partner: PartnerDeckId): void {
  const ROOT = path.join(__dirname, '..', '..');
  const OUT_DIR = path.join(ROOT, 'docs', 'marketing');
  const cacheFolder = partner === 'freetrade' ? '_freetrade-deck-cache' : '_plaid-deck-cache';
  const docTitle =
    partner === 'freetrade'
      ? 'Freetrade_Design_Partnership_2026'
      : 'Pocket_Portfolio_Plaid_Design_Partnership_2026';
  const partnerDir = path.join(ROOT, 'public', 'brand', 'partners');
  const partnerPrimaryCandidates =
    partner === 'plaid'
      ? [path.join(partnerDir, 'plaid-logo.png'), path.join(partnerDir, 'plaid-logo.svg')]
      : [
          path.join(partnerDir, 'freetrade-logo.png'),
          path.join(partnerDir, 'freetrade-logo.svg'),
        ];
  deckCtx = {
    partner,
    ROOT,
    outDir: OUT_DIR,
    cacheDir: path.join(OUT_DIR, cacheFolder),
    outPdf: path.join(OUT_DIR, `${docTitle}.pdf`),
    outPptx: path.join(OUT_DIR, `${docTitle}.pptx`),
    docTitle,
    logoSvg: path.join(ROOT, 'public', 'brand', 'pp-monogram-email.svg'),
    archSvg: path.join(ROOT, 'public', 'book-assets', 'figures', 'si-figure-02-hybrid-architecture.svg'),
    pressAbbaDir: path.join(ROOT, 'public', 'press', 'abba'),
    partnerPrimaryCandidates,
  };
}
const RASTER_ROADMAP_PX = 2600;
const RASTER_WEDGE_PX = 2200;
const RASTER_CALLOUTS_PX = 2400;
const RASTER_BADGE_PX = 900;

/**
 * UK Black Business Show portrait for the executive (final) slide. Prefers committed press variants,
 * then deck-specific PNG (e.g. copied from press pipeline output).
 */
function resolveUkBbsPortraitPath(): string | null {
  const base = deckCtx.pressAbbaDir;
  const candidates = [
    path.join(base, 'abba-uk-black-business-show-1640.jpg'),
    path.join(base, 'abba-uk-black-business-show-3072.jpg'),
    path.join(base, 'abba-uk-black-business-show-820.jpg'),
    path.join(base, 'IMG_9086-original.png'),
    path.join(base, 'abba-uk-black-business-show-deck.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function pdfImageFormat(filePath: string): 'PNG' | 'JPEG' {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.png' ? 'PNG' : 'JPEG';
}

function bufferToDataUrl(buf: Buffer, format: 'PNG' | 'JPEG'): string {
  const mime = format === 'PNG' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

/** IHDR width/height only — avoids extra typings dependency. */
function readPngSize(buf: Buffer): { w: number; h: number } {
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('Invalid PNG buffer');
  }
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** JPEG SOF dimensions (baseline / progressive). */
function readJpegSize(buf: Buffer): { w: number; h: number } {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error('Not a JPEG');
  }
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1]!;
    if (marker === 0xd9 || marker === 0xda) break;
    const segLen = buf.readUInt16BE(offset + 2);
    if (segLen < 2 || offset + 2 + segLen > buf.length) break;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { h: buf.readUInt16BE(offset + 5), w: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + segLen;
  }
  throw new Error('Could not read JPEG dimensions');
}

function readRasterSize(buf: Buffer, filePath: string): { w: number; h: number } {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return readPngSize(buf);
  if (ext === '.jpg' || ext === '.jpeg') return readJpegSize(buf);
  return readPngSize(buf);
}

/** Scale-to-fit inside box without distortion; return top-left and size. */
function fitContain(
  natW: number,
  natH: number,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
): { x: number; y: number; w: number; h: number } {
  if (natW <= 0 || natH <= 0) return { x: boxX, y: boxY, w: boxW, h: boxH };
  const s = Math.min(boxW / natW, boxH / natH);
  const w = natW * s;
  const h = natH * s;
  return { x: boxX + (boxW - w) / 2, y: boxY + (boxH - h) / 2, w, h };
}

/** Raster export widths — higher = sharper PDF embedding. */
const RASTER_ARCH_PX = 3200;
const RASTER_CHART_PX = 2600;

/** 16:9 slide (pt) — matches LAYOUT_WIDE aspect ratio */
const SLIDE_W = 1440;
const SLIDE_H = 810;

/** Left edge of title/subtitle column (logo 48pt + 52pt + gap) — PDF body text aligns here. */
const PDF_TITLE_COL_X = 48 + 52 + 16;

/** Inches: matches `addSlideHeaderPptxFixed` title/subtitle `x`. */
const PPTX_TITLE_COL_X = 1.12;
const PPTX_SUBTITLE_W = 10.85;

const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];
const SOVEREIGN_GREEN: [number, number, number] = [0, 170, 68];
const MUTED: [number, number, number] = [160, 170, 165];

/** PPTX palette (hex without #) */
const COL = {
  bg: '000000',
  text: 'F4F4F5',
  muted: '9CA3AF',
  green: '00AA44',
  /** Freetrade proposal accent (partner wordmark stroke / highlights). */
  partnerPink: 'FF6B9D',
};

/**
 * Illustrative inference index for chart only — not in canonical-claims.
 * Replace with cited metrics when filed in-repo (Salford seed deck Slide 02).
 */
const INFERENCE_NOTE =
  'Illustrative GBP trajectory: frontier-class list → mini-model parity (log scale). Not a vendor quote.';

/** Rendered with native slide text only — never rasterize (avoids Resvg glyph swaps like “wedge” → “wedue”). */
const WEDGE_TITLE = 'Horizontal infrastructure wedge';
const WEDGE_SUBTITLE =
  'Same zero-retention substrate — stress-tested across regulated verticals';

/** Freetrade deck — grounded in `src/import/adapters/freetrade.ts` + `packages/importer` (published as @pocket-portfolio/importer). */
const FREETRADE_VERIFIED_INGESTION =
  'Technical verification: Pocket Portfolio consumer terminal already ingests and normalizes Freetrade CSV exports via MIT-licensed @pocket-portfolio/importer (19+ broker adapters). This design partnership hardens that production path for enterprise-grade wealth-tech scale.';

const FREETRADE_ARCH_VERIFIED_LINE =
  'Verified ingestion: Freetrade CSV export schemas — live parse path in the edge terminal (freetrade adapter in Importer registry).';

function ascii(s: string): string {
  return String(s)
    .replace(/\u00a3/g, 'GBP ')
    .replace(/\u20ac/g, 'EUR ')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"');
}

/** Prefer explicit TTF so Resvg does not substitute wrong glyphs on Windows. */
function resvgFontFiles(): string[] {
  const candidates = [
    path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'arial.ttf'),
    path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'calibri.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  return candidates.filter((p) => fs.existsSync(p));
}

function svgToPng(svgInput: string | Buffer, widthPx: number): Buffer {
  const fontFiles = resvgFontFiles();
  const resvg = new Resvg(svgInput, {
    fitTo: { mode: 'width', value: widthPx },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
      ...(fontFiles.length ? { fontFiles } : {}),
    },
  });
  return Buffer.from(resvg.render().asPng());
}

function loadLogoPng(): Buffer {
  const raw = fs.readFileSync(deckCtx.logoSvg, 'utf8');
  const themed = raw
    .replace(/fill="#0d2818"/g, 'fill="#000000"')
    .replace(/fill="#ffffff"/g, 'fill="#ffffff"')
    .replace(
      /<rect width="256"/,
      '<rect width="256" stroke="#00AA44" stroke-width="4"'
    );
  return svgToPng(Buffer.from(themed, 'utf8'), 160);
}

function loadArchitecturePng(): Buffer {
  let raw = fs.readFileSync(deckCtx.archSvg, 'utf8');
  raw = raw.replace(/font-family="[^"]*"/g, 'font-family="Arial, Helvetica, sans-serif"');
  return svgToPng(Buffer.from(raw, 'utf8'), RASTER_ARCH_PX);
}

function buildInferenceCurveSvg(): string {
  /** Anchor endpoints per V4 audit; intermediate points shape the “elbow” only. */
  const gbp = [48, 14, 3.5, 0.65, 0.12];
  const years = [2022, 2023, 2024, 2025, 2026];
  const plotL = 130;
  const plotR = 800;
  const plotT = 108;
  const plotB = 332;
  const log10 = Math.log10;
  const vmin = 0.1;
  const vmax = 64;
  const n = gbp.length;
  const vx = (i: number) => plotL + (i / (n - 1)) * (plotR - plotL);
  const vy = (v: number) =>
    plotB - ((log10(v) - log10(vmin)) / (log10(vmax) - log10(vmin))) * (plotB - plotT);

  const gridGbp = [50, 10, 1, 0.1];
  let gridEls = '';
  for (const g of gridGbp) {
    const yy = vy(g);
    if (yy >= plotT && yy <= plotB) {
      const label = g === 0.1 ? '£0.10' : `£${g}`;
      gridEls += `<line x1="${plotL}" y1="${yy}" x2="${plotR}" y2="${yy}" stroke="#333333" stroke-dasharray="6 4" stroke-width="1"/>`;
      gridEls += `<text x="${plotL - 10}" y="${yy + 4}" text-anchor="end" fill="#6b7280" font-size="11" font-family="Arial, Helvetica, sans-serif">${label}</text>`;
    }
  }

  const pts = gbp.map((v, i) => `${vx(i).toFixed(1)},${vy(v).toFixed(1)}`).join(' ');
  let nodes = '';
  gbp.forEach((v, i) => {
    const x = vx(i);
    const y = vy(v);
    nodes += `<circle cx="${x}" cy="${y}" r="5" fill="#00AA44" stroke="#ffffff" stroke-width="1.5"/>`;
  });

  let yearLabels = '';
  years.forEach((yr, i) => {
    yearLabels += `<text x="${vx(i)}" y="${plotB + 26}" text-anchor="middle" fill="#d1d5db" font-size="12" font-family="Arial, Helvetica, sans-serif">${yr}</text>`;
  });

  const x0 = vx(0);
  const y0 = vy(gbp[0]!);
  const xL = vx(n - 1);
  const yL = vy(gbp[gbp.length - 1]!);
  const dropPct = Math.round((1 - gbp[gbp.length - 1]! / gbp[0]!) * 100);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 440" width="900" height="440">
  <rect width="900" height="440" fill="#000000"/>
  <text x="450" y="36" text-anchor="middle" fill="#00AA44" font-size="18" font-weight="600" font-family="Arial, Helvetica, sans-serif">Inference unit cost (GBP, log scale)</text>
  <text x="450" y="58" text-anchor="middle" fill="#9ca3af" font-size="11" font-family="Arial, Helvetica, sans-serif">${INFERENCE_NOTE.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
  <text x="450" y="76" text-anchor="middle" fill="#00AA44" font-size="12" font-family="Arial, Helvetica, sans-serif">DaVinci-class £48.00 → GPT-4o-mini £0.12 · ~${dropPct}% reduction (illustrative)</text>
  ${gridEls}
  <polyline fill="none" stroke="#00AA44" stroke-width="3" points="${pts}"/>
  ${nodes}
  ${yearLabels}
  <text x="${x0}" y="${y0 - 14}" text-anchor="middle" fill="#F4F4F5" font-size="10" font-family="Arial, Helvetica, sans-serif">DaVinci-class £48.00</text>
  <text x="${xL}" y="${yL - 14}" text-anchor="middle" fill="#F4F4F5" font-size="10" font-family="Arial, Helvetica, sans-serif">GPT-4o-mini £0.12</text>
  <text x="${plotL}" y="${plotB + 48}" fill="#6b7280" font-size="10" font-family="Arial, Helvetica, sans-serif">Y-axis: GBP per million-token equivalent (logarithmic)</text>
</svg>`;
}

function buildPlaceholderSvg(title: string, subtitle: string): string {
  const safe = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200" width="520" height="200">
  <rect width="520" height="200" fill="#0a0a0a" stroke="#00AA44" stroke-width="3" stroke-dasharray="10 6" rx="8"/>
  <text x="260" y="78" text-anchor="middle" fill="#00AA44" font-size="15" font-weight="600" font-family="Arial, Helvetica, sans-serif">IMAGE PLACEHOLDER</text>
  <text x="260" y="108" text-anchor="middle" fill="#F4F4F5" font-size="14" font-family="Arial, Helvetica, sans-serif">${safe(title)}</text>
  <text x="260" y="134" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">${safe(subtitle)}</text>
</svg>`;
}

/**
 * Commons asset is black-on-transparent; deck slides are black — invert to light fills for contrast.
 */
function preparePlaidLogoSvgForDarkDeck(input: Buffer): Buffer {
  let s = input.toString('utf8');
  s = s.replace(/#111\b/g, '#F4F4F5');
  s = s.replace(/#000000\b/g, '#F4F4F5');
  return Buffer.from(s, 'utf8');
}

/** Last-resort placeholder only if `public/brand/partners/plaid-logo.*` is missing. */
function buildPlaidPartnerWordmarkSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 56" width="260" height="56">
  <rect width="260" height="56" rx="10" fill="#0B0B10" stroke="#00AA44" stroke-width="2"/>
  <text x="130" y="38" text-anchor="middle" fill="#F4F4F5" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">Plaid</text>
</svg>`;
}

/** Styled wordmark until formal partnership marks are approved (Freetrade pink + house green). */
function buildFreetradePartnerWordmarkSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 88" width="420" height="88">
  <rect width="420" height="88" rx="12" fill="#0B0B10" stroke="#FF6B9D" stroke-width="2.5"/>
  <text x="210" y="40" text-anchor="middle" fill="#F4F4F5" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">Freetrade</text>
  <text x="210" y="64" text-anchor="middle" fill="#00AA44" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600">Design Partnership (Proposal)</text>
</svg>`;
}

function loadPartnerMark(
  candidates: string[],
  fallbackSvg: () => string,
  cacheBaseName: string,
  rasterWidth: number
): { buf: Buffer; pptxPath: string; official: boolean } {
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    if (path.extname(p).toLowerCase() === '.svg') {
      const raw: Buffer =
        deckCtx.partner === 'plaid' && path.extname(p).toLowerCase() === '.svg'
          ? preparePlaidLogoSvgForDarkDeck(fs.readFileSync(p))
          : fs.readFileSync(p);
      const buf = svgToPng(raw, rasterWidth);
      const out = path.join(deckCtx.cacheDir, `${cacheBaseName}-raster.png`);
      fs.writeFileSync(out, buf);
      return { buf, pptxPath: out, official: true };
    }
    return { buf: fs.readFileSync(p), pptxPath: p, official: true };
  }
  const buf = svgToPng(Buffer.from(fallbackSvg(), 'utf8'), rasterWidth);
  const out = path.join(deckCtx.cacheDir, `${cacheBaseName}-generated.png`);
  fs.writeFileSync(out, buf);
  return { buf, pptxPath: out, official: false };
}

/** No synthetic “logo” — omit from slide when files are absent (photo may already show the marks). */
function loadPartnerMarkDiskOnly(
  candidates: string[],
  cacheBaseName: string,
  rasterWidth: number
): { buf: Buffer; pptxPath: string } | null {
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    if (path.extname(p).toLowerCase() === '.svg') {
      const buf = svgToPng(fs.readFileSync(p), rasterWidth);
      const out = path.join(deckCtx.cacheDir, `${cacheBaseName}-raster.png`);
      fs.writeFileSync(out, buf);
      return { buf, pptxPath: out };
    }
    return { buf: fs.readFileSync(p), pptxPath: p };
  }
  return null;
}

function buildGmGrowthHubBadgeSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" width="420" height="120">
  <rect width="420" height="120" rx="12" fill="#0A0A0A" stroke="#00AA44" stroke-width="2.5"/>
  <text x="210" y="38" text-anchor="middle" fill="#00AA44" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">REGIONAL PARTNER · UK</text>
  <text x="210" y="68" text-anchor="middle" fill="#F4F4F5" font-size="17" font-weight="600" font-family="Arial, Helvetica, sans-serif">GM Business Growth Hub</text>
  <text x="210" y="92" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">Discovery &amp; advisory precedent (Manchester ecosystem)</text>
</svg>`;
}

/** Schematic only — statutory numbers live in native PDF/PPTX text (not rasterized). */
function buildScopeReductionMapSvg(): string {
  const W = 1100;
  const H = 320;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#000000"/>
  <text x="${W / 2}" y="32" text-anchor="middle" fill="#FF6B9D" font-size="18" font-weight="700" font-family="Arial, Helvetica, sans-serif">Scope reduction (schematic)</text>
  <text x="${W / 2}" y="54" text-anchor="middle" fill="#6B7280" font-size="11" font-family="Arial, Helvetica, sans-serif">Limited-scope processor posture shrinks exportable data surface</text>
  <rect x="60" y="88" width="280" height="72" rx="10" fill="#1F2937" stroke="#F87171" stroke-width="2"/>
  <text x="200" y="118" text-anchor="middle" fill="#F4F4F5" font-size="13" font-weight="600" font-family="Arial, Helvetica, sans-serif">Full-ledger cloud export</text>
  <text x="200" y="138" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">High PII gravity</text>
  <path d="M 200 160 L 200 200 L 550 200 L 550 228" stroke="#FF6B9D" stroke-width="2.5" fill="none"/>
  <polygon points="550,236 544,228 556,228" fill="#FF6B9D"/>
  <rect x="400" y="236" width="300" height="64" rx="12" fill="#052E16" stroke="#00AA44" stroke-width="2.5"/>
  <text x="550" y="264" text-anchor="middle" fill="#F4F4F5" font-size="14" font-weight="700" font-family="Arial, Helvetica, sans-serif">Edge ingest + aggregate egress</text>
  <text x="550" y="284" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">Pocket Portfolio sovereign substrate</text>
  <rect x="760" y="96" width="300" height="56" rx="8" fill="#0A0A0A" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="910" y="120" text-anchor="middle" fill="#F59E0B" font-size="11" font-weight="700" font-family="Arial, Helvetica, sans-serif">Regime hooks</text>
  <text x="910" y="138" text-anchor="middle" fill="#D1D5DB" font-size="10" font-family="Arial, Helvetica, sans-serif">GDPR / EU AI Act / DORA (labels)</text>
</svg>`;
}

function buildRoadmapGanttSvg(): string {
  const W = 1280;
  const axisY = 310;
  const x0 = 108;
  const x180 = W - 108;
  const span = x180 - x0;
  const day = (d: number) => x0 + (d / 180) * span;
  if (deckCtx.partner === 'freetrade') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 360" width="${W}" height="360">
  <rect width="${W}" height="360" fill="#000000"/>
  <text x="${W / 2}" y="36" text-anchor="middle" fill="#FF6B9D" font-size="20" font-weight="700" font-family="Arial, Helvetica, sans-serif">180-Day EU / UK pilot program</text>
  <text x="${W / 2}" y="58" text-anchor="middle" fill="#6B7280" font-size="11" font-family="Arial, Helvetica, sans-serif">Design partnership — dates shift with legal, security, and partner gates</text>
  <text x="${W / 2}" y="78" text-anchor="middle" fill="#6B7280" font-size="10" font-family="Arial, Helvetica, sans-serif">19+ adapters (MIT-licensed importer) — adversarial-tested on real broker CSVs, incl. Freetrade exports</text>
  <line x1="${x0}" y1="${axisY}" x2="${x180}" y2="${axisY}" stroke="#333" stroke-width="2"/>
  <text x="${x0}" y="${axisY + 22}" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">Day 0</text>
  <text x="${day(60)}" y="${axisY + 22}" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">60</text>
  <text x="${day(120)}" y="${axisY + 22}" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">120</text>
  <text x="${x180}" y="${axisY + 22}" text-anchor="end" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">180</text>
  <text x="20" y="118" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Security</text>
  <rect x="${day(0)}" y="95" width="${day(60) - day(0)}" height="36" rx="6" fill="#0D2818" stroke="#00AA44" stroke-width="1.5"/>
  <text x="${day(30)}" y="118" text-anchor="middle" fill="#F4F4F5" font-size="11" font-weight="600" font-family="Arial, Helvetica, sans-serif">Active ingest hardening</text>
  <text x="20" y="198" fill="#D1D5DB" font-size="10" font-family="Arial, Helvetica, sans-serif">Active ingestion</text>
  <text x="20" y="212" fill="#D1D5DB" font-size="10" font-family="Arial, Helvetica, sans-serif">hardening</text>
  <rect x="${day(60)}" y="175" width="${day(120) - day(60)}" height="36" rx="6" fill="#111827" stroke="#FF6B9D" stroke-width="1.5"/>
  <text x="${day(90)}" y="198" text-anchor="middle" fill="#F4F4F5" font-size="11" font-weight="600" font-family="Arial, Helvetica, sans-serif">Sovereign ingest pilot</text>
  <text x="20" y="278" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Scale</text>
  <rect x="${day(120)}" y="255" width="${day(180) - day(120)}" height="36" rx="6" fill="#14532D" stroke="#00AA44" stroke-width="1.5"/>
  <text x="${day(150)}" y="278" text-anchor="middle" fill="#F4F4F5" font-size="11" font-weight="600" font-family="Arial, Helvetica, sans-serif">Prod hardening</text>
  <path d="M ${day(0) + 8} ${axisY - 45} L ${x180 - 8} ${axisY - 45}" stroke="#00AA44" stroke-width="2" stroke-dasharray="6 4" fill="none" opacity="0.7"/>
  <polygon points="${x180 - 4},${axisY - 49} ${x180 + 8},${axisY - 45} ${x180 - 4},${axisY - 41}" fill="#00AA44"/>
</svg>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 360" width="${W}" height="360">
  <rect width="${W}" height="360" fill="#000000"/>
  <text x="${W / 2}" y="36" text-anchor="middle" fill="#00AA44" font-size="20" font-weight="700" font-family="Arial, Helvetica, sans-serif">180-Day North American program</text>
  <text x="${W / 2}" y="58" text-anchor="middle" fill="#6B7280" font-size="11" font-family="Arial, Helvetica, sans-serif">Sandbox to hardened North Star pilots — progressive delivery</text>
  <line x1="${x0}" y1="${axisY}" x2="${x180}" y2="${axisY}" stroke="#333" stroke-width="2"/>
  <text x="${x0}" y="${axisY + 22}" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">Day 0</text>
  <text x="${day(60)}" y="${axisY + 22}" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">60</text>
  <text x="${day(120)}" y="${axisY + 22}" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">120</text>
  <text x="${x180}" y="${axisY + 22}" text-anchor="end" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">180</text>
  <text x="${day(30)}" y="${axisY - 8}" text-anchor="middle" fill="#00AA44" font-size="10" font-weight="600" font-family="Arial, Helvetica, sans-serif">Sandbox</text>
  <text x="${day(150)}" y="${axisY - 8}" text-anchor="middle" fill="#00AA44" font-size="10" font-weight="600" font-family="Arial, Helvetica, sans-serif">Hardened pilots</text>
  <text x="20" y="118" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Security</text>
  <rect x="${day(0)}" y="95" width="${day(60) - day(0)}" height="36" rx="6" fill="#0D2818" stroke="#00AA44" stroke-width="1.5"/>
  <text x="${day(30)}" y="118" text-anchor="middle" fill="#F4F4F5" font-size="11" font-weight="600" font-family="Arial, Helvetica, sans-serif">Guardrails</text>
  <circle cx="${day(50)}" cy="132" r="10" fill="none" stroke="#00AA44" stroke-width="2"/><path d="M ${day(50) - 4} 128 l 4 4 8 -10" stroke="#00AA44" stroke-width="2" fill="none"/>
  <text x="20" y="198" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">US Invest.</text>
  <rect x="${day(60)}" y="175" width="${day(120) - day(60)}" height="36" rx="6" fill="#111827" stroke="#00AA44" stroke-width="1.5"/>
  <text x="${day(90)}" y="198" text-anchor="middle" fill="#F4F4F5" font-size="11" font-weight="600" font-family="Arial, Helvetica, sans-serif">Holdings / Txns</text>
  <text x="20" y="278" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">N. Star</text>
  <rect x="${day(120)}" y="255" width="${day(180) - day(120)}" height="36" rx="6" fill="#14532D" stroke="#00AA44" stroke-width="1.5"/>
  <text x="${day(150)}" y="278" text-anchor="middle" fill="#F4F4F5" font-size="11" font-weight="600" font-family="Arial, Helvetica, sans-serif">Institution cov.</text>
  <rect x="${day(165) - 10}" y="288" width="20" height="16" rx="2" fill="none" stroke="#FBBF24" stroke-width="2"/><line x1="${day(165) - 6}" y1="292" x2="${day(165) + 6}" y2="292" stroke="#FBBF24" stroke-width="1"/>
  <path d="M ${day(0) + 8} ${axisY - 45} L ${x180 - 8} ${axisY - 45}" stroke="#00AA44" stroke-width="2" stroke-dasharray="6 4" fill="none" opacity="0.7"/>
  <polygon points="${x180 - 4},${axisY - 49} ${x180 + 8},${axisY - 45} ${x180 - 4},${axisY - 41}" fill="#00AA44"/>
</svg>`;
}

/** Diagram only — title/subtitle are drawn as native PPTX/PDF text (deterministic spelling). */
function buildHorizontalWedgeSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 184" width="1000" height="184">
  <rect width="1000" height="184" fill="#000000"/>
  <rect x="40" y="20" width="280" height="72" rx="10" fill="#111827" stroke="#374151" stroke-width="1.2"/>
  <text x="180" y="50" text-anchor="middle" fill="#F4F4F5" font-size="14" font-weight="600" font-family="Arial, Helvetica, sans-serif">Energy</text>
  <text x="180" y="70" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">National Grid Ventures scale</text>
  <rect x="360" y="20" width="280" height="72" rx="10" fill="#111827" stroke="#374151" stroke-width="1.2"/>
  <text x="500" y="50" text-anchor="middle" fill="#F4F4F5" font-size="14" font-weight="600" font-family="Arial, Helvetica, sans-serif">Wealth</text>
  <text x="500" y="70" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">Broker &amp; portfolio data</text>
  <rect x="680" y="20" width="280" height="72" rx="10" fill="#111827" stroke="#374151" stroke-width="1.2"/>
  <text x="820" y="50" text-anchor="middle" fill="#F4F4F5" font-size="14" font-weight="600" font-family="Arial, Helvetica, sans-serif">Healthcare</text>
  <text x="820" y="70" text-anchor="middle" fill="#9CA3AF" font-size="11" font-family="Arial, Helvetica, sans-serif">NHS COVID-scale delivery</text>
  <path d="M 180 92 L 500 108 L 820 92" stroke="#00AA44" stroke-width="2" fill="none" opacity="0.75"/>
  <rect x="60" y="118" width="880" height="44" rx="10" fill="#052E16" stroke="#00AA44" stroke-width="2"/>
  <text x="500" y="146" text-anchor="middle" fill="#F4F4F5" font-size="14" font-weight="700" font-family="Arial, Helvetica, sans-serif">Zero-retention layer — Pocket Portfolio (edge ingest + stateless inference)</text>
</svg>`;
}

function buildArchitectureCalloutsSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 140" width="1100" height="140">
  <rect width="1100" height="140" fill="#050505"/>
  <rect x="16" y="16" width="330" height="108" rx="8" fill="#0A0A0A" stroke="#00AA44" stroke-width="1.5" stroke-dasharray="8 4"/>
  <text x="181" y="42" text-anchor="middle" fill="#00AA44" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">Air gap</text>
  <text x="181" y="64" text-anchor="middle" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Data stays user-sovereign</text>
  <text x="181" y="84" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">Sanitized aggregate context only egresses</text>
  <rect x="385" y="16" width="330" height="108" rx="8" fill="#0A0A0A" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="550" y="42" text-anchor="middle" fill="#F59E0B" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">Boundary</text>
  <text x="550" y="64" text-anchor="middle" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Tier / quota gate</text>
  <text x="550" y="84" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">No server-side portfolio warehouse</text>
  <rect x="754" y="16" width="330" height="108" rx="8" fill="#0A0A0A" stroke="#00AA44" stroke-width="1.5"/>
  <text x="919" y="42" text-anchor="middle" fill="#00AA44" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">Stateless API</text>
  <text x="919" y="64" text-anchor="middle" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">/api/ai/chat</text>
  <text x="919" y="84" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">Streaming inference — minimal payload retention</text>
</svg>`;
}

/** Freetrade: banner + Figure 2 callouts — raster text uses Arial for Resvg. */
function buildArchitectureCalloutsSvgFreetrade(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 172" width="1100" height="172">
  <rect width="1100" height="172" fill="#050505"/>
  <rect x="16" y="6" width="1068" height="30" rx="8" fill="#052E16" stroke="#FF6B9D" stroke-width="2"/>
  <text x="550" y="26" text-anchor="middle" fill="#FF6B9D" font-size="12" font-weight="700" font-family="Arial, Helvetica, sans-serif">VERIFIED INGESTION — FREETRADE CSV (PRODUCTION TERMINAL)</text>
  <rect x="16" y="44" width="330" height="116" rx="8" fill="#0A0A0A" stroke="#00AA44" stroke-width="1.5" stroke-dasharray="8 4"/>
  <text x="181" y="72" text-anchor="middle" fill="#00AA44" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">Air gap</text>
  <text x="181" y="94" text-anchor="middle" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Data stays user-sovereign</text>
  <text x="181" y="114" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">Sanitized aggregate context only egresses</text>
  <rect x="385" y="44" width="330" height="116" rx="8" fill="#0A0A0A" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="550" y="72" text-anchor="middle" fill="#F59E0B" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">Boundary</text>
  <text x="550" y="94" text-anchor="middle" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">Tier / quota gate</text>
  <text x="550" y="114" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">No server-side portfolio warehouse</text>
  <rect x="754" y="44" width="330" height="116" rx="8" fill="#0A0A0A" stroke="#00AA44" stroke-width="1.5"/>
  <text x="919" y="72" text-anchor="middle" fill="#00AA44" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif">Stateless API</text>
  <text x="919" y="94" text-anchor="middle" fill="#D1D5DB" font-size="11" font-family="Arial, Helvetica, sans-serif">/api/ai/chat</text>
  <text x="919" y="114" text-anchor="middle" fill="#9CA3AF" font-size="10" font-family="Arial, Helvetica, sans-serif">Streaming inference — minimal payload retention</text>
</svg>`;
}

interface DeckAssets {
  logoPath: string;
  archPath: string;
  chartPath: string;
  phUbbsPath: string;
  partnerPptxPath: string;
  partnerMarkOfficial: boolean;
  gmBadgePath: string;
  gmOfficial: boolean;
  jpmPptxPath: string | null;
  moodysPptxPath: string | null;
  roadmapPath: string;
  wedgePath: string;
  archCalloutsPath: string;
  /** Freetrade slide 3 — scope diagram only (Plaid decks omit). */
  scopeReductionPath?: string;
  /** jsPDF image type for slide 5 UKBBS panel */
  phUbbsPdfFormat: 'PNG' | 'JPEG';
  logoDataUrl: string;
  archDataUrl: string;
  chartDataUrl: string;
  phUbbsDataUrl: string;
  partnerLockupDataUrl: string;
  gmBadgeDataUrl: string;
  jpmDataUrl: string | null;
  moodysDataUrl: string | null;
  roadmapDataUrl: string;
  wedgeDataUrl: string;
  archCalloutsDataUrl: string;
  scopeReductionDataUrl?: string;
  natArch: { w: number; h: number };
  natChart: { w: number; h: number };
  natUbbs: { w: number; h: number };
  natPartner: { w: number; h: number };
  natGm: { w: number; h: number };
  natJpm: { w: number; h: number } | null;
  natMoodys: { w: number; h: number } | null;
  natRoadmap: { w: number; h: number };
  natWedge: { w: number; h: number };
  natArchCallouts: { w: number; h: number };
  natScope?: { w: number; h: number };
}

function readImageBufferDims(buf: Buffer): { w: number; h: number } {
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) return readJpegSize(buf);
  return readPngSize(buf);
}

function writeCache(): DeckAssets {
  fs.mkdirSync(deckCtx.cacheDir, { recursive: true });
  const r = deckCtx.ROOT;
  const gmCandidates = [
    path.join(r, 'public', 'brand', 'partners', 'gm-growth-hub-logo.png'),
    path.join(r, 'public', 'brand', 'partners', 'gm-growth-hub-logo.svg'),
  ];
  const jpmCandidates = [
    path.join(r, 'public', 'brand', 'partners', 'jpmorgan-logo.png'),
    path.join(r, 'public', 'brand', 'partners', 'jpmorgan-logo.svg'),
  ];
  const moodysCandidates = [
    path.join(r, 'public', 'brand', 'partners', 'moodys-logo.png'),
    path.join(r, 'public', 'brand', 'partners', 'moodys-logo.svg'),
  ];

  const logoBuf = loadLogoPng();
  const primaryLoaded = loadPartnerMark(
    deckCtx.partnerPrimaryCandidates,
    deckCtx.partner === 'plaid' ? buildPlaidPartnerWordmarkSvg : buildFreetradePartnerWordmarkSvg,
    deckCtx.partner === 'plaid' ? 'plaid' : 'freetrade',
    deckCtx.partner === 'freetrade' ? 440 : 420
  );
  const natPartner = readImageBufferDims(primaryLoaded.buf);
  const gmLoaded = loadPartnerMark(gmCandidates, buildGmGrowthHubBadgeSvg, 'gm-growth-hub', RASTER_BADGE_PX);
  const gmBuf = gmLoaded.buf;
  const natGm = readImageBufferDims(gmBuf);
  const jpmLoaded = loadPartnerMarkDiskOnly(jpmCandidates, 'jpm', 400);
  const moodysLoaded = loadPartnerMarkDiskOnly(moodysCandidates, 'moodys', 400);

  let scopeReductionPath: string | undefined;
  let scopeReductionDataUrl: string | undefined;
  let natScope: { w: number; h: number } | undefined;
  if (deckCtx.partner === 'freetrade') {
    const scopeBuf = svgToPng(buildScopeReductionMapSvg(), 2400);
    natScope = readPngSize(scopeBuf);
    scopeReductionPath = path.join(deckCtx.cacheDir, 'scope-reduction.png');
    fs.writeFileSync(scopeReductionPath, scopeBuf);
    scopeReductionDataUrl = `data:image/png;base64,${scopeBuf.toString('base64')}`;
  }
  const natJpm = jpmLoaded ? readImageBufferDims(jpmLoaded.buf) : null;
  const natMoodys = moodysLoaded ? readImageBufferDims(moodysLoaded.buf) : null;
  const roadmapBuf = svgToPng(buildRoadmapGanttSvg(), RASTER_ROADMAP_PX);
  const natRoadmap = readPngSize(roadmapBuf);
  const wedgeBuf = svgToPng(buildHorizontalWedgeSvg(), RASTER_WEDGE_PX);
  const natWedge = readPngSize(wedgeBuf);
  const calloutsBuf = svgToPng(
    deckCtx.partner === 'freetrade'
      ? buildArchitectureCalloutsSvgFreetrade()
      : buildArchitectureCalloutsSvg(),
    RASTER_CALLOUTS_PX
  );
  const natArchCallouts = readPngSize(calloutsBuf);

  const archBuf = loadArchitecturePng();
  const natArch = readPngSize(archBuf);
  const chartBuf = svgToPng(buildInferenceCurveSvg(), RASTER_CHART_PX);
  const natChart = readPngSize(chartBuf);

  const ukbbsPortrait = resolveUkBbsPortraitPath();
  let phUbbsPath: string;
  let phUbbsBuf: Buffer;
  let phUbbsPdfFormat: 'PNG' | 'JPEG';
  if (ukbbsPortrait) {
    phUbbsPath = ukbbsPortrait;
    phUbbsBuf = fs.readFileSync(ukbbsPortrait);
    phUbbsPdfFormat = pdfImageFormat(ukbbsPortrait);
  } else {
    phUbbsBuf = svgToPng(
      buildPlaceholderSvg(
        'UK Black Business Show 2024',
        'Insert speaker / programme badge (evidence pack).'
      ),
      520
    );
    phUbbsPath = path.join(deckCtx.cacheDir, 'ph-ubbs.png');
    phUbbsPdfFormat = 'PNG';
    fs.writeFileSync(phUbbsPath, phUbbsBuf);
  }
  const natUbbs = readRasterSize(phUbbsBuf, phUbbsPath);

  const logoPath = path.join(deckCtx.cacheDir, 'logo.png');
  const archPath = path.join(deckCtx.cacheDir, 'hybrid-arch.png');
  const chartPath = path.join(deckCtx.cacheDir, 'inference-curve.png');
  const gmBadgePath = path.join(deckCtx.cacheDir, 'gm-growth-hub-badge.png');
  const roadmapPath = path.join(deckCtx.cacheDir, 'roadmap-gantt.png');
  const wedgePath = path.join(deckCtx.cacheDir, 'horizontal-wedge.png');
  const archCalloutsPath = path.join(deckCtx.cacheDir, 'architecture-callouts.png');
  fs.writeFileSync(logoPath, logoBuf);
  fs.writeFileSync(archPath, archBuf);
  fs.writeFileSync(chartPath, chartBuf);
  fs.writeFileSync(gmBadgePath, gmBuf);
  fs.writeFileSync(roadmapPath, roadmapBuf);
  fs.writeFileSync(wedgePath, wedgeBuf);
  fs.writeFileSync(archCalloutsPath, calloutsBuf);

  const b64png = (b: Buffer) => `data:image/png;base64,${b.toString('base64')}`;
  return {
    logoPath,
    archPath,
    chartPath,
    phUbbsPath,
    partnerPptxPath: primaryLoaded.pptxPath,
    partnerMarkOfficial: primaryLoaded.official,
    gmBadgePath,
    gmOfficial: gmLoaded.official,
    jpmPptxPath: jpmLoaded?.pptxPath ?? null,
    moodysPptxPath: moodysLoaded?.pptxPath ?? null,
    roadmapPath,
    wedgePath,
    archCalloutsPath,
    scopeReductionPath,
    phUbbsPdfFormat,
    logoDataUrl: b64png(logoBuf),
    archDataUrl: b64png(archBuf),
    chartDataUrl: b64png(chartBuf),
    phUbbsDataUrl: bufferToDataUrl(phUbbsBuf, phUbbsPdfFormat),
    partnerLockupDataUrl: b64png(primaryLoaded.buf),
    gmBadgeDataUrl: b64png(gmBuf),
    jpmDataUrl: jpmLoaded ? b64png(jpmLoaded.buf) : null,
    moodysDataUrl: moodysLoaded ? b64png(moodysLoaded.buf) : null,
    roadmapDataUrl: b64png(roadmapBuf),
    wedgeDataUrl: b64png(wedgeBuf),
    archCalloutsDataUrl: b64png(calloutsBuf),
    scopeReductionDataUrl,
    natArch,
    natChart,
    natUbbs,
    natPartner,
    natGm,
    natJpm,
    natMoodys,
    natRoadmap,
    natWedge,
    natArchCallouts,
    natScope,
  };
}

// ─── PDF helpers ───

function partnerFallbackWord(): string {
  return deckCtx.partner === 'freetrade' ? 'FREETRADE' : 'PLAID';
}

function drawFooterPdf(doc: jsPDF, slideName: string, yBottom: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(ascii(`Pocket Portfolio | Confidential | ${slideName}`), 48, yBottom);
  doc.setDrawColor(...SOVEREIGN_GREEN);
  doc.setLineWidth(0.75);
  doc.line(48, yBottom + 4, SLIDE_W - 48, yBottom + 4);
}

function slideBg(doc: jsPDF) {
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, SLIDE_W, SLIDE_H, 'F');
}

function addPartnershipHeaderPdf(doc: jsPDF, assets: DeckAssets, title: string, yStart: number) {
  const lw = 52;
  const ph = 46;
  const pw = assets.partnerMarkOfficial
    ? Math.min(200, (assets.natPartner.w / assets.natPartner.h) * ph)
    : 96;
  doc.addImage(assets.logoDataUrl, 'PNG', 48, yStart, lw, lw);
  if (assets.partnerMarkOfficial) {
    doc.addImage(
      assets.partnerLockupDataUrl,
      'PNG',
      SLIDE_W - 48 - pw,
      yStart + 3,
      pw,
      ph,
      undefined,
      'SLOW'
    );
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(deckCtx.partner === 'freetrade' ? 15 : 17);
    doc.setTextColor(...WHITE);
    doc.text(partnerFallbackWord(), SLIDE_W - 48, yStart + 30, { align: 'right' });
  }
  const tx = 48 + lw + 16;
  const titleMaxW = SLIDE_W - tx - (pw + 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  const lines = doc.splitTextToSize(ascii(title), titleMaxW);
  const lineHeight = 24;
  let lineY = yStart + 28;
  doc.text(lines, tx, lineY);
  const titleBottom = lineY + Math.max(0, lines.length - 1) * lineHeight;
  const ruleY = Math.max(yStart + lw + 10, titleBottom + 14);
  const ruleRgb: [number, number, number] =
    deckCtx.partner === 'freetrade' ? [255, 107, 157] : [...SOVEREIGN_GREEN];
  doc.setDrawColor(...ruleRgb);
  doc.setLineWidth(1.2);
  doc.line(48, ruleY, SLIDE_W - 48, ruleY);
  return ruleY + 16;
}

function dualExchangePdf(doc: jsPDF, y0: number, assets: DeckAssets) {
  const isFt = deckCtx.partner === 'freetrade';
  const pink: [number, number, number] = [255, 107, 157];
  const boxW = 400;
  const boxH = 130;
  const leftX = 72;
  const midX = SLIDE_W / 2;
  const rightX = SLIDE_W - 72 - boxW;
  const y = y0;
  doc.setDrawColor(...(isFt ? pink : SOVEREIGN_GREEN));
  doc.setLineWidth(1.5);
  doc.roundedRect(leftX, y, boxW, boxH, 6, 6, 'S');
  doc.setDrawColor(...SOVEREIGN_GREEN);
  doc.roundedRect(rightX, y, boxW, boxH, 6, 6, 'S');
  const markH = 34;
  if (assets.partnerMarkOfficial) {
    const pw = Math.min(160, (assets.natPartner.w / assets.natPartner.h) * markH);
    doc.addImage(assets.partnerLockupDataUrl, 'PNG', leftX + boxW / 2 - pw / 2, y + 10, pw, markH, undefined, 'SLOW');
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...WHITE);
    doc.text(partnerFallbackWord(), leftX + boxW / 2, y + 28, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  }
  const mon = 34;
  doc.addImage(assets.logoDataUrl, 'PNG', rightX + boxW / 2 - mon / 2, y + 10, mon, mon, undefined, 'SLOW');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  const leftCopy = isFt
    ? 'Zero-cost sovereign layer (design partnership proposal): SDK + stateless AI pathway — subject to executed partner terms and regulatory gates.'
    : 'Zero-cost strategic access (design partnership): US Investments API — Holdings + Transactions — subject to executed partner terms.';
  const rightCopy = isFt
    ? 'High-fidelity product and compliance feedback from a scaled UK retail investing context (ISA / SIPP / JISA journeys); adversarial edge cases for adapter hardening.'
    : 'High-fidelity UX feedback, holdings reconciliation edge cases, regulated-environment stress testing for North American rollout.';
  doc.text(doc.splitTextToSize(ascii(leftCopy), boxW - 24), leftX + 14, y + 52);
  doc.text(doc.splitTextToSize(ascii(rightCopy), boxW - 24), rightX + 14, y + 52);
  const ay = y + boxH / 2 + 4;
  const xL = midX - 100;
  const xR = midX + 100;
  const tip = 10;
  const halfW = 5;
  doc.setDrawColor(...SOVEREIGN_GREEN);
  doc.setLineWidth(2);
  doc.setLineCap('butt');
  /** Shaft between inner bases; tips at xL/xR point outward (toward each partner box). */
  doc.line(xL + tip, ay, xR - tip, ay);
  doc.line(xL, ay, xL + tip, ay - halfW);
  doc.line(xL, ay, xL + tip, ay + halfW);
  doc.line(xR, ay, xR - tip, ay - halfW);
  doc.line(xR, ay, xR - tip, ay + halfW);
}

/** Consultant-aligned monetisation copy — partner-specific emphasis (dual-deck SSOT). */
interface RevenueSlideModel {
  title: string;
  subtitle: string;
  bullets: readonly string[];
}

function getRevenueSlideModel(partner: PartnerDeckId): RevenueSlideModel {
  if (partner === 'plaid') {
    return {
      title: 'Revenue model & path to monetisation',
      subtitle:
        'Consumer subscription (access-gating) monetises premium data connectivity while keeping core packaging simple.',
      bullets: [
        'Founders Club: GBP 12/month or GBP 100/year (published prosumer tier on pocketportfolio.app).',
        'Premium bundle: Plaid-powered US Investments (Holdings + Transactions) where offered, with Pocket Analyst and local-first privacy as tier justification.',
        'Commercial pattern: access-gating — a clean upsell without per-call metering on the base subscription.',
        'Heavy-user balance: optional usage-based add-ons (e.g. higher refresh limits, deeper analytics) to capture marginal value.',
        'Iteration: sharpen what is uniquely in-tier beyond connectivity so price tracks perceived ROI.',
      ],
    };
  }
  return {
    title: 'Revenue model & path to monetisation',
    subtitle:
      'B2B hybrid pricing monetises sovereign ingestion and stateless inference as infrastructure, not a discretionary widget.',
    bullets: [
      'Mechanism: add-on module — Freetrade deploys AI features adjacent to core flows without a full platform rewrite.',
      'Hybrid structure: base platform licence plus usage-aligned fees so partner scale tracks inference and import volumes.',
      'ROI framing (regime context, not penalty prediction): GDPR ceilings up to EUR 20m or 4% turnover; EU AI Act up to EUR 35m or 7%; sovereign edge + stateless boundary shrinks export surface and audit perimeter.',
      'Positioning: integral substrate for safer regulated AI on retail ledger data under EU / UK rules.',
      'IG Group context: enterprise procurement, SLAs, security review gates, and scoped customisation in commercial design.',
    ],
  };
}

function addPdfRevenueSlide(doc: jsPDF, assets: DeckAssets, fy: number): void {
  doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
  slideBg(doc);
  const m = getRevenueSlideModel(deckCtx.partner);
  let y = addPartnershipHeaderPdf(doc, assets, m.title, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  const sub = doc.splitTextToSize(ascii(m.subtitle), SLIDE_W - 96);
  doc.text(sub, PDF_TITLE_COL_X, y);
  y += sub.length * 12 + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  for (const b of m.bullets) {
    const block = doc.splitTextToSize(ascii(`\u2022 ${b}`), SLIDE_W - 96);
    doc.text(block, 48, y);
    y += block.length * 11.5 + 4;
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const disc = doc.splitTextToSize(
    ascii(
      'Illustrative commercial patterns — not an offer; final economics subject to contract, volume forecasts, and legal review.'
    ),
    SLIDE_W - 96
  );
  doc.text(disc, 48, fy - 58);
  const slideLabel =
    deckCtx.partner === 'freetrade' ? 'Slide 6 — Revenue model' : 'Slide 5 — Revenue model';
  drawFooterPdf(doc, slideLabel, fy);
}

function addRevenueSlidePptx(pptx: PptxGenJS, assets: DeckAssets, partner: PartnerDeckId): void {
  const m = getRevenueSlideModel(partner);
  const s = pptx.addSlide();
  addSlideHeaderPptxFixed(s, assets, ascii(m.title), ascii(m.subtitle));
  const bullets = m.bullets.map((text) => ({
    text: ascii(text),
    options: { bullet: true, fontSize: 12, color: COL.text },
  }));
  s.addText(bullets, { x: 0.58, y: 1.78, w: 12.12, h: 4.85, fontFace: 'Calibri' });
  s.addText(
    ascii(
      'Illustrative commercial patterns — not an offer; final economics subject to contract, volume forecasts, and legal review.'
    ),
    {
      x: 0.58,
      y: 6.68,
      w: 12.12,
      h: 0.42,
      fontFace: 'Calibri',
      fontSize: 9,
      italic: true,
      color: COL.muted,
    }
  );
  footerPptxFixed(s, partner === 'freetrade' ? 'Slide 6 — Revenue model' : 'Slide 5 — Revenue model');
}

function buildPdf(assets: DeckAssets) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [SLIDE_W, SLIDE_H],
    compress: true,
  });
  const pdfSubject =
    deckCtx.partner === 'freetrade'
      ? 'Freetrade design partnership (proposal) — sovereign AI layer'
      : 'Strategic design partnership — North American expansion';
  const pdfKeywords =
    deckCtx.partner === 'freetrade'
      ? 'Freetrade, design partnership, sovereign ingestion, GDPR, DORA, EU AI Act'
      : 'Plaid, design partnership, sovereign ingestion, investments API';
  doc.setProperties({
    title: deckCtx.docTitle,
    subject: pdfSubject,
    author: 'Pocket Portfolio',
    keywords: pdfKeywords,
  });
  const fy = SLIDE_H - 36;

  // 1 — Inflection / value exchange
  slideBg(doc);
  let y: number;
  if (deckCtx.partner === 'freetrade') {
    y = addPartnershipHeaderPdf(
      doc,
      assets,
      'You reached GBP 4bn AUM. Now reach frontier AI.',
      40
    );
  } else {
    y = addPartnershipHeaderPdf(
      doc,
      assets,
      'Hunger for Design: A Mutual Strategic Exchange.',
      40
    );
  }
  const gmH = 58;
  const gmW = (assets.natGm.w / assets.natGm.h) * gmH;
  doc.addImage(assets.gmBadgeDataUrl, 'PNG', SLIDE_W - 48 - gmW, 96, gmW, gmH, undefined, 'SLOW');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  const copyW = SLIDE_W - 96 - gmW - 24;
  const slide1Intro =
    deckCtx.partner === 'freetrade'
      ? 'Fact: GBP 4bn+ AUM milestone (public-facing marketing at scale). Hypothesis (ours): local-first ingest + stateless inference can reduce full-ledger cloud export surface for GDPR / DORA / EU AI Act posture. UK precedent: GM Growth Hub discovery validates advisory-led partnership motion.'
      : 'Mirroring the UK advisory model (GM Growth Hub discovery), we offer technical stress-testing in regulated environments for Plaid North American expansion — in exchange for structured design-partnership access to the US Investments surface area.';
  const s1 = doc.splitTextToSize(ascii(slide1Intro), copyW);
  doc.text(s1, 48, y);
  y += s1.length * 14 + (deckCtx.partner === 'freetrade' ? 8 : 16);
  if (deckCtx.partner === 'freetrade') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 107, 157);
    doc.text(ascii('Technical verification'), 48, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    const s1b = doc.splitTextToSize(ascii(FREETRADE_VERIFIED_INGESTION), copyW);
    doc.text(s1b, 48, y);
    y += s1b.length * 13 + 16;
  }
  dualExchangePdf(doc, y, assets);
  drawFooterPdf(
    doc,
    deckCtx.partner === 'freetrade' ? 'Slide 1 — Inflection' : 'Slide 1 — Value Exchange',
    fy
  );

  // 2
  doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
  slideBg(doc);
  y = addPartnershipHeaderPdf(doc, assets, 'Sovereign Ingestion & Stateless Inference.', 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...SOVEREIGN_GREEN);
  doc.text(ascii(POSITIONING.primary), 48, y);
  y += 20;
  const calloutStripH = deckCtx.partner === 'freetrade' ? 108 : 92;
  const bulletReserve = 64;
  const archBoxH = Math.max(168, fy - 24 - y - bulletReserve - calloutStripH - 16);
  const archBoxW = SLIDE_W - 96;
  const archFit = fitContain(assets.natArch.w, assets.natArch.h, 48, y, archBoxW, archBoxH);
  doc.setDrawColor(26, 26, 28);
  doc.setLineWidth(0.6);
  doc.roundedRect(48, y, archBoxW, archBoxH, 4, 4, 'S');
  doc.addImage(assets.archDataUrl, 'PNG', archFit.x, archFit.y, archFit.w, archFit.h, undefined, 'SLOW');
  y = y + archBoxH + 10;
  const cFit = fitContain(
    assets.natArchCallouts.w,
    assets.natArchCallouts.h,
    48,
    y,
    archBoxW,
    calloutStripH
  );
  doc.setDrawColor(...SOVEREIGN_GREEN);
  doc.setLineWidth(0.8);
  doc.roundedRect(48, y, archBoxW, calloutStripH, 4, 4, 'S');
  doc.addImage(
    assets.archCalloutsDataUrl,
    'PNG',
    cFit.x,
    cFit.y,
    cFit.w,
    cFit.h,
    undefined,
    'SLOW'
  );
  y += calloutStripH + 12;
  if (deckCtx.partner === 'freetrade') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 107, 157);
    doc.text(ascii('Verified ingestion (production path)'), 48, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    const vLine = doc.splitTextToSize(ascii(FREETRADE_ARCH_VERIFIED_LINE), SLIDE_W - 96);
    doc.text(vLine, 48, y);
    y += vLine.length * 12 + 10;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  const b2 =
    deckCtx.partner === 'freetrade'
      ? [
          ascii(
            'Data stays user-sovereign: broker data parses in-browser; no server-side portfolio DB as system of record.'
          ),
          ascii(
            'Stateless inference: aggregate context only; no long-term sensitive payload persistence on our servers.'
          ),
          ascii(
            'Pocket Portfolio sovereign substrate (Figure 2): deterministic edge ingest; stateless API as inference boundary.'
          ),
        ]
      : [
          ascii(
            'Data stays user-sovereign: broker data parses in-browser; no server-side portfolio DB as system of record.'
          ),
          ascii(
            'Stateless inference: aggregate context only; no long-term sensitive payload persistence on our servers.'
          ),
        ];
  const b2block = doc.splitTextToSize(b2.join(' '), SLIDE_W - 96);
  doc.text(b2block, 48, y);
  drawFooterPdf(doc, 'Slide 2 — Hybrid architecture (Figure 2)', fy);

  // 3 — Plaid: wedge + economics | Freetrade: compliance scope map
  doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
  slideBg(doc);
  if (deckCtx.partner === 'freetrade') {
    y = addPartnershipHeaderPdf(doc, assets, 'Compliance & Scope Reduction.', 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const head = doc.splitTextToSize(
      ascii(
        'Regulatory exposure context (statutory maxima — not a prediction of penalties for any firm):'
      ),
      SLIDE_W - 96
    );
    doc.text(head, PDF_TITLE_COL_X, y);
    y += head.length * 12 + 6;
    doc.setFontSize(8.5);
    const regLines = [
      ascii(
        'GDPR (UK/EU): for certain infringements, administrative fines up to the higher of EUR 20m or 4% of worldwide annual turnover (Art. 83).'
      ),
      ascii(
        'EU AI Act: for certain serious infringements, fines up to the higher of EUR 35m or 7% of worldwide annual turnover (selected Articles).'
      ),
      ascii(
        'EU DORA: ICT resilience obligations can expand oversight when critical functions depend on third-party technology.'
      ),
    ];
    const regBlock = doc.splitTextToSize(regLines.join(' '), SLIDE_W - 96);
    doc.text(regBlock, PDF_TITLE_COL_X, y);
    y += regBlock.length * 11 + 12;
    const scopeH = fy - 36 - y;
    const scopeW = SLIDE_W - 96;
    if (assets.scopeReductionDataUrl && assets.natScope) {
      const sFit = fitContain(assets.natScope.w, assets.natScope.h, 48, y, scopeW, scopeH);
      doc.setDrawColor(26, 26, 28);
      doc.setLineWidth(0.6);
      doc.roundedRect(48, y, scopeW, scopeH, 4, 4, 'S');
      doc.addImage(
        assets.scopeReductionDataUrl,
        'PNG',
        sFit.x,
        sFit.y,
        sFit.w,
        sFit.h,
        undefined,
        'SLOW'
      );
    }
    drawFooterPdf(doc, 'Slide 3 — Compliance', fy);
  } else {
    y = addPartnershipHeaderPdf(
      doc,
      assets,
      'Deflationary Inference Economics (2020–2026).',
      40
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(
      ascii('Privacy as an engineering choice — partner scope reduction (GDPR / DORA posture).'),
      PDF_TITLE_COL_X,
      y
    );
    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...SOVEREIGN_GREEN);
    doc.text(ascii(WEDGE_TITLE), PDF_TITLE_COL_X, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const wedgeSubMaxW = SLIDE_W - PDF_TITLE_COL_X - 48;
    const wedgeSubLines = doc.splitTextToSize(ascii(WEDGE_SUBTITLE), wedgeSubMaxW);
    doc.text(wedgeSubLines, PDF_TITLE_COL_X, y);
    y += wedgeSubLines.length * 12 + 10;
    const wedgeBoxH = 108;
    const wedgeW = SLIDE_W - 96;
    const wFit = fitContain(assets.natWedge.w, assets.natWedge.h, 48, y, wedgeW, wedgeBoxH);
    doc.setDrawColor(40, 44, 48);
    doc.setLineWidth(0.6);
    doc.roundedRect(48, y, wedgeW, wedgeBoxH, 4, 4, 'S');
    doc.addImage(assets.wedgeDataUrl, 'PNG', wFit.x, wFit.y, wFit.w, wFit.h, undefined, 'SLOW');
    y += wedgeBoxH + 14;
    const chartBoxW = 780;
    const chartBoxH = 278;
    const chartFit = fitContain(assets.natChart.w, assets.natChart.h, 48, y, chartBoxW, chartBoxH);
    doc.setDrawColor(26, 26, 28);
    doc.setLineWidth(0.6);
    doc.roundedRect(48, y, chartBoxW, chartBoxH, 4, 4, 'S');
    doc.addImage(assets.chartDataUrl, 'PNG', chartFit.x, chartFit.y, chartFit.w, chartFit.h, undefined, 'SLOW');
    const colX = 48 + chartBoxW + 24;
    const colW = SLIDE_W - colX - 48;
    let cy = y + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(248, 113, 113);
    doc.text(ascii('Standard cloud-inference parity'), colX, cy);
    cy += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(ascii('High retention / PII gravity; larger SOC 2 perimeter.'), colW), colX, cy);
    cy += 36;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SOVEREIGN_GREEN);
    doc.text(ascii('Sovereign substrate'), colX, cy);
    cy += 16;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...WHITE);
    doc.text(
      doc.splitTextToSize(
        ascii(
          `${MOAT_CLAIMS.limitedScopeProcessor.phrase} by architecture. Deterministic edge ingestion. Reduces partner oversight complexity for EU DORA and UK GDPR posture.`
        ),
        colW
      ),
      colX,
      cy
    );
    drawFooterPdf(doc, 'Slide 3 — Inference economics', fy);
  }

  // 4 — Freetrade: EU program roadmap | Plaid: NA roadmap
  doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
  slideBg(doc);
  if (deckCtx.partner === 'freetrade') {
    y = addPartnershipHeaderPdf(
      doc,
      assets,
      'EU / UK Program: Q2–Q4 2026 (180-day window).',
      40
    );
    const roadmapCapH = fy - 48 - y;
    const rmW = SLIDE_W - 96;
    const rmFit = fitContain(assets.natRoadmap.w, assets.natRoadmap.h, 48, y, rmW, roadmapCapH - 52);
    doc.setDrawColor(26, 26, 28);
    doc.setLineWidth(0.6);
    doc.roundedRect(48, y, rmW, roadmapCapH - 48, 6, 6, 'S');
    doc.addImage(
      assets.roadmapDataUrl,
      'PNG',
      rmFit.x,
      rmFit.y,
      rmFit.w,
      rmFit.h,
      undefined,
      'SLOW'
    );
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(
      doc.splitTextToSize(
        ascii(
          'Days 0–60 emphasise active ingestion hardening (production Freetrade CSV path today). MIT-licensed @pocket-portfolio/importer: 19+ adapters under adversarial test on real broker exports.'
        ),
        rmW
      ),
      48,
      y + roadmapCapH - 44
    );
    drawFooterPdf(doc, 'Slide 4 — Program roadmap', fy);
  } else {
    y = addPartnershipHeaderPdf(
      doc,
      assets,
      'North American Deployment: Q3–Q4 2026 (180-day window).',
      40
    );
    const roadmapCapH = fy - 48 - y;
    const rmW = SLIDE_W - 96;
    const rmFit = fitContain(assets.natRoadmap.w, assets.natRoadmap.h, 48, y, rmW, roadmapCapH - 40);
    doc.setDrawColor(26, 26, 28);
    doc.setLineWidth(0.6);
    doc.roundedRect(48, y, rmW, roadmapCapH - 36, 6, 6, 'S');
    doc.addImage(
      assets.roadmapDataUrl,
      'PNG',
      rmFit.x,
      rmFit.y,
      rmFit.w,
      rmFit.h,
      undefined,
      'SLOW'
    );
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(
      doc.splitTextToSize(
        ascii(
          'Illustrative program map — dates shift with legal, security, and partner gates. Monzo US / Revolut US where Plaid coverage permits.'
        ),
        rmW
      ),
      48,
      y + roadmapCapH - 30
    );
    drawFooterPdf(doc, 'Slide 4 — Roadmap', fy);
    addPdfRevenueSlide(doc, assets, fy);
  }

  // 5 — Freetrade: inference economics | Plaid: authority
  if (deckCtx.partner === 'freetrade') {
    doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
    slideBg(doc);
    y = addPartnershipHeaderPdf(
      doc,
      assets,
      'Deflationary Inference Economics (2020–2026).',
      40
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(
      ascii('Privacy as an engineering choice — partner scope reduction (GDPR / DORA posture).'),
      PDF_TITLE_COL_X,
      y
    );
    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...SOVEREIGN_GREEN);
    doc.text(ascii(WEDGE_TITLE), PDF_TITLE_COL_X, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const wedgeSubMaxFt = SLIDE_W - PDF_TITLE_COL_X - 48;
    const wedgeSubLinesFt = doc.splitTextToSize(ascii(WEDGE_SUBTITLE), wedgeSubMaxFt);
    doc.text(wedgeSubLinesFt, PDF_TITLE_COL_X, y);
    y += wedgeSubLinesFt.length * 12 + 10;
    const chartBoxW = 780;
    const chartBoxH = Math.min(400, fy - 48 - y);
    const chartFit = fitContain(assets.natChart.w, assets.natChart.h, 48, y, chartBoxW, chartBoxH);
    doc.setDrawColor(26, 26, 28);
    doc.setLineWidth(0.6);
    doc.roundedRect(48, y, chartBoxW, chartBoxH, 4, 4, 'S');
    doc.addImage(assets.chartDataUrl, 'PNG', chartFit.x, chartFit.y, chartFit.w, chartFit.h, undefined, 'SLOW');
    const colX = 48 + chartBoxW + 24;
    const colW = SLIDE_W - colX - 48;
    let cy = y + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(248, 113, 113);
    doc.text(ascii('Standard cloud-inference parity'), colX, cy);
    cy += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(ascii('High retention / PII gravity; larger SOC 2 perimeter.'), colW), colX, cy);
    cy += 36;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SOVEREIGN_GREEN);
    doc.text(ascii('Sovereign substrate'), colX, cy);
    cy += 16;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...WHITE);
    doc.text(
      doc.splitTextToSize(
        ascii(
          `${MOAT_CLAIMS.limitedScopeProcessor.phrase} by architecture. Deterministic edge ingestion. Reduces partner oversight complexity for EU DORA and UK GDPR posture.`
        ),
        colW
      ),
      colX,
      cy
    );
    drawFooterPdf(doc, 'Slide 5 — Inference economics', fy);
    addPdfRevenueSlide(doc, assets, fy);
  }

  doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
  slideBg(doc);
  y = addPartnershipHeaderPdf(doc, assets, 'Institutional-Grade Leadership — Abba Lawal.', 40);
  const hl = FOUNDER_CREDENTIALS_ABBA.highlights;
  const credOrder = [hl[0], hl[1], hl[3], hl[2], hl[4], hl[5], hl[6]] as const;
  const leftW = 508;
  const gap = 28;
  const imgBoxX = 48 + leftW + gap;
  const imgBoxW = SLIDE_W - imgBoxX - 48;
  const imgBoxY = y;
  const imgBoxH = fy - 56 - imgBoxY;
  const jpmH = 36;
  const gapL = 14;
  let logoRowH = 8;
  if (
    assets.jpmDataUrl &&
    assets.moodysDataUrl &&
    assets.natJpm &&
    assets.natMoodys
  ) {
    const jpmW = (assets.natJpm.w / assets.natJpm.h) * jpmH;
    const myH = 36;
    const myW = (assets.natMoodys.w / assets.natMoodys.h) * myH;
    const rowW = jpmW + gapL + myW;
    logoRowH = jpmH + 8;
    doc.addImage(assets.jpmDataUrl, 'PNG', 52 + (leftW - rowW) / 2, y, jpmW, jpmH, undefined, 'SLOW');
    doc.addImage(assets.moodysDataUrl, 'PNG', 52 + (leftW - rowW) / 2 + jpmW + gapL, y, myW, myH, undefined, 'SLOW');
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const backdropLines = doc.splitTextToSize(
      ascii(
        'Programme backdrop (photograph): JPMorgan Chase and Moody\u2019s marks appear on-stage alongside other partners.'
      ),
      leftW - 6
    );
    doc.text(backdropLines, 52, y);
    logoRowH = backdropLines.length * 11 + 12;
    doc.setFont('helvetica', 'normal');
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  const cred = credOrder.map((t) => `\u2022 ${ascii(t)}`).join('\n');
  doc.text(doc.splitTextToSize(cred, leftW - 6), 52, y + logoRowH);
  const photoFit = fitContain(assets.natUbbs.w, assets.natUbbs.h, imgBoxX, imgBoxY, imgBoxW, imgBoxH);
  doc.addImage(
    assets.phUbbsDataUrl,
    assets.phUbbsPdfFormat,
    photoFit.x,
    photoFit.y,
    photoFit.w,
    photoFit.h,
    undefined,
    'SLOW'
  );
  doc.setDrawColor(...SOVEREIGN_GREEN);
  doc.setLineWidth(1.5);
  /** Square stroke — rounded rects clip the corners of a rectangular photo. */
  doc.rect(photoFit.x, photoFit.y, photoFit.w, photoFit.h, 'S');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(ascii('UK Black Business Show 2024 — on-stage panel.'), imgBoxX, photoFit.y + photoFit.h + 12);
  drawFooterPdf(
    doc,
    deckCtx.partner === 'freetrade' ? 'Slide 7 — Executive authority' : 'Slide 6 — Executive authority',
    fy
  );

  fs.mkdirSync(deckCtx.outDir, { recursive: true });
  fs.writeFileSync(deckCtx.outPdf, Buffer.from(doc.output('arraybuffer')));
}

// Fix PPTX typing: use `PptxGenJS.Slide` for slide parameter
type PptxSlide = ReturnType<PptxGenJS['addSlide']>;

function addSlideHeaderPptxFixed(
  s: PptxSlide,
  assets: DeckAssets,
  title: string,
  subtitle?: string,
  layout?: { subtitleW?: number }
) {
  s.addShape('rect', { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: COL.bg } });
  s.addImage({ path: path.join(deckCtx.cacheDir, 'logo.png'), x: 0.35, y: 0.38, w: 0.68, h: 0.68 });
  if (assets.partnerMarkOfficial) {
    s.addImage({
      path: assets.partnerPptxPath,
      x: 11.78,
      y: 0.38,
      w: 1.42,
      h: 0.58,
      sizing: { type: 'contain', w: 1.42, h: 0.58 },
    });
  } else {
    s.addText(deckCtx.partner === 'freetrade' ? 'FREETRADE' : 'PLAID', {
      x: 11.52,
      y: 0.48,
      w: 1.68,
      h: 0.48,
      fontFace: 'Calibri',
      fontSize: deckCtx.partner === 'freetrade' ? 18 : 22,
      bold: true,
      color: COL.text,
      align: 'right',
    });
  }
  s.addText(title, {
    x: 1.12,
    y: 0.4,
    w: 10.35,
    h: 1.05,
    fontFace: 'Calibri',
    fontSize: 28,
    bold: true,
    color: COL.text,
  });
  s.addShape('rect', {
    x: 0.55,
    y: 1.36,
    w: 12.2,
    h: 0.035,
    fill: { color: deckCtx.partner === 'freetrade' ? COL.partnerPink : COL.green },
  });
  if (subtitle) {
    const sw = layout?.subtitleW ?? 10.85;
    s.addText(subtitle, {
      x: 1.12,
      y: 1.42,
      w: sw,
      h: 0.55,
      fontFace: 'Calibri',
      fontSize: 14,
      color: COL.muted,
    });
  }
}

function footerPptxFixed(s: PptxSlide, label: string) {
  s.addText(ascii(`Pocket Portfolio | Confidential | ${label}`), {
    x: 0.55,
    y: 7.12,
    w: 12.0,
    h: 0.25,
    fontFace: 'Calibri',
    fontSize: 10,
    color: '6B7280',
  });
}

export async function runDesignPartnershipDeck(partner: PartnerDeckId): Promise<void> {
  initDeckCtx(partner);
  fs.mkdirSync(deckCtx.outDir, { recursive: true });
  const assets = writeCache();

  const pptxSubject =
    partner === 'freetrade'
      ? 'Freetrade design partnership (proposal) — sovereign AI layer'
      : 'Strategic design partnership — North American expansion';

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pocket Portfolio';
  pptx.company = 'Pocket Portfolio';
  pptx.title = deckCtx.docTitle;
  pptx.subject = pptxSubject;
  pptx.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };

  const lineFt = partner === 'freetrade' ? COL.partnerPink : COL.green;
  const linePk = COL.green;

  if (partner === 'freetrade') {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(
      s,
      assets,
      ascii('You reached GBP 4bn AUM. Now reach frontier AI.'),
      ascii('Fact + hypothesis framing; GM Growth Hub UK precedent.'),
      { subtitleW: 8.2 }
    );
    s.addImage({
      path: assets.gmBadgePath,
      x: 9.42,
      y: 1.38,
      w: 3.62,
      h: 0.88,
      sizing: { type: 'contain', w: 3.62, h: 0.88 },
    });
    s.addText(
      ascii(
        'Fact: GBP 4bn+ AUM milestone (public-facing marketing at scale). Hypothesis (ours): local-first ingest + stateless inference can reduce full-ledger cloud export surface for GDPR / DORA / EU AI Act posture.'
      ),
      { x: 1.12, y: 2.05, w: 8.15, h: 0.78, fontFace: 'Calibri', fontSize: 14, color: COL.text }
    );
    s.addText(ascii('Technical verification'), {
      x: 1.12,
      y: 2.78,
      w: 8.15,
      h: 0.22,
      fontFace: 'Calibri',
      fontSize: 12,
      bold: true,
      color: COL.partnerPink,
    });
    s.addText(ascii(FREETRADE_VERIFIED_INGESTION), {
      x: 1.12,
      y: 2.98,
      w: 8.15,
      h: 0.95,
      fontFace: 'Calibri',
      fontSize: 11,
      color: COL.text,
    });
    s.addShape('roundRect', { x: 0.65, y: 3.92, w: 5.5, h: 2.35, fill: { color: '111111' }, line: { color: lineFt, pt: 1 } });
    s.addShape('roundRect', { x: 7.05, y: 3.92, w: 5.65, h: 2.35, fill: { color: '111111' }, line: { color: linePk, pt: 1 } });
    if (assets.partnerMarkOfficial) {
      s.addImage({
        path: assets.partnerPptxPath,
        x: 0.65 + 5.5 / 2 - 0.71,
        y: 4.0,
        w: 1.42,
        h: 0.58,
        sizing: { type: 'contain', w: 1.42, h: 0.58 },
      });
    } else {
      s.addText('FREETRADE', {
        x: 0.65,
        y: 4.06,
        w: 5.5,
        h: 0.45,
        fontFace: 'Calibri',
        fontSize: 16,
        bold: true,
        color: COL.text,
        align: 'center',
      });
    }
    s.addImage({
      path: path.join(deckCtx.cacheDir, 'logo.png'),
      x: 7.05 + 5.65 / 2 - 0.34,
      y: 4.0,
      w: 0.68,
      h: 0.68,
      sizing: { type: 'contain', w: 0.68, h: 0.68 },
    });
    s.addText(
      ascii(
        'Zero-cost sovereign layer (design partnership proposal): SDK + stateless AI pathway — subject to executed partner terms and regulatory gates.'
      ),
      { x: 0.85, y: 4.5, w: 5.1, h: 1.55, fontFace: 'Calibri', fontSize: 13, color: COL.text }
    );
    s.addText(
      ascii(
        'High-fidelity product and compliance feedback from a scaled UK retail investing context (ISA / SIPP / JISA journeys); adversarial edge cases for adapter hardening.'
      ),
      { x: 7.25, y: 4.5, w: 5.25, h: 1.55, fontFace: 'Calibri', fontSize: 13, color: COL.text }
    );
    s.addText('\u2194', {
      x: 6.35,
      y: 4.88,
      w: 0.65,
      h: 0.48,
      fontFace: 'Calibri',
      fontSize: 40,
      bold: true,
      color: COL.partnerPink,
      align: 'center',
    });
    footerPptxFixed(s, 'Slide 1 — Inflection');
  } else {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(
      s,
      assets,
      'Hunger for Design: A Mutual Strategic Exchange.',
      'Mirroring the UK advisory model (GM Growth Hub discovery) for Plaid North American expansion.',
      { subtitleW: 8.05 }
    );
    s.addImage({
      path: assets.gmBadgePath,
      x: 9.42,
      y: 1.38,
      w: 3.62,
      h: 0.88,
      sizing: { type: 'contain', w: 3.62, h: 0.88 },
    });
    s.addText(
      ascii(
        'We offer technical stress-testing in regulated environments in exchange for structured design-partnership access to the US Investments surface area.'
      ),
      { x: 1.12, y: 2.08, w: 8.15, h: 0.95, fontFace: 'Calibri', fontSize: 16, color: COL.text }
    );
    s.addShape('roundRect', { x: 0.65, y: 3.14, w: 5.5, h: 2.35, fill: { color: '111111' }, line: { color: COL.green, pt: 1 } });
    s.addShape('roundRect', { x: 7.05, y: 3.14, w: 5.65, h: 2.35, fill: { color: '111111' }, line: { color: COL.green, pt: 1 } });
    if (assets.partnerMarkOfficial) {
      s.addImage({
        path: assets.partnerPptxPath,
        x: 0.65 + 5.5 / 2 - 0.71,
        y: 3.22,
        w: 1.42,
        h: 0.58,
        sizing: { type: 'contain', w: 1.42, h: 0.58 },
      });
    } else {
      s.addText('PLAID', {
        x: 0.65,
        y: 3.28,
        w: 5.5,
        h: 0.45,
        fontFace: 'Calibri',
        fontSize: 18,
        bold: true,
        color: COL.text,
        align: 'center',
      });
    }
    s.addImage({
      path: path.join(deckCtx.cacheDir, 'logo.png'),
      x: 7.05 + 5.65 / 2 - 0.34,
      y: 3.22,
      w: 0.68,
      h: 0.68,
      sizing: { type: 'contain', w: 0.68, h: 0.68 },
    });
    s.addText(
      ascii(
        'Zero-cost strategic access (design partnership): US Investments API — Holdings + Transactions — subject to executed partner terms.'
      ),
      { x: 0.85, y: 3.72, w: 5.1, h: 1.55, fontFace: 'Calibri', fontSize: 14, color: COL.text }
    );
    s.addText(
      ascii(
        'High-fidelity UX feedback, reconciliation edge cases, and regulated-environment stress testing.'
      ),
      { x: 7.25, y: 3.72, w: 5.25, h: 1.55, fontFace: 'Calibri', fontSize: 14, color: COL.text }
    );
    s.addText('\u2194', {
      x: 6.35,
      y: 4.1,
      w: 0.65,
      h: 0.48,
      fontFace: 'Calibri',
      fontSize: 40,
      bold: true,
      color: COL.green,
      align: 'center',
    });
    footerPptxFixed(s, 'Slide 1 — Value Exchange');
  }

  {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(s, assets, 'Sovereign Ingestion & Stateless Inference.', ascii(POSITIONING.primary));
    const archImgH = partner === 'freetrade' ? 2.52 : 2.68;
    const calloutY = partner === 'freetrade' ? 4.32 : 4.48;
    const calloutH = partner === 'freetrade' ? 1.14 : 0.98;
    s.addImage({
      path: assets.archPath,
      x: 0.55,
      y: 1.72,
      w: 12.2,
      h: archImgH,
      sizing: { type: 'contain', w: 12.2, h: archImgH },
    });
    s.addImage({
      path: assets.archCalloutsPath,
      x: 0.55,
      y: calloutY,
      w: 12.2,
      h: calloutH,
      sizing: { type: 'contain', w: 12.2, h: calloutH },
    });
    const slide2Bullets = [
      {
        text: ascii(
          'Data stays user-sovereign: broker data parses in-browser; server-side portfolio DB is not the system of record.'
        ),
        options: { bullet: true, color: COL.text, fontSize: 14 },
      },
      {
        text: ascii('Limited-scope processor posture by architecture (see Figure 2 + callouts).'),
        options: { bullet: true, color: COL.text, fontSize: 14 },
      },
      {
        text: ascii(
          'Stateless inference: aggregate context egress only; no long-term sensitive payload persistence on our servers.'
        ),
        options: { bullet: true, color: COL.text, fontSize: 14 },
      },
    ];
    if (partner === 'freetrade') {
      slide2Bullets.push({
        text: ascii(
          'Pocket Portfolio sovereign substrate: deterministic edge ingest; stateless API as inference boundary.'
        ),
        options: { bullet: true, color: COL.text, fontSize: 14 },
      });
    }
    const slide2BulletY = partner === 'freetrade' ? 5.42 : 5.58;
    s.addText(slide2Bullets, { x: 0.85, y: slide2BulletY, w: 11.8, h: partner === 'freetrade' ? 1.55 : 1.85, fontFace: 'Calibri' });
    if (partner === 'freetrade') {
      s.addText(ascii('Verified ingestion (production path)'), {
        x: 0.85,
        y: 6.82,
        w: 11.8,
        h: 0.2,
        fontFace: 'Calibri',
        fontSize: 11,
        bold: true,
        color: COL.partnerPink,
      });
      s.addText(ascii(FREETRADE_ARCH_VERIFIED_LINE), {
        x: 0.85,
        y: 6.98,
        w: 11.4,
        h: 0.28,
        fontFace: 'Calibri',
        fontSize: 10,
        color: COL.muted,
      });
    }
    footerPptxFixed(s, 'Slide 2 — Hybrid architecture (Figure 2)');
  }

  if (partner === 'freetrade') {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(
      s,
      assets,
      'Compliance & Scope Reduction.',
      ascii('Statutory maxima are regime context — not a prediction of penalties for any firm.')
    );
    s.addText(
      [
        {
          text: ascii(
            'GDPR (UK/EU): for certain infringements, administrative fines up to the higher of EUR 20m or 4% of worldwide annual turnover (Art. 83).'
          ),
          options: { bullet: true, fontSize: 11, color: COL.text },
        },
        {
          text: ascii(
            'EU AI Act: for certain serious infringements, fines up to the higher of EUR 35m or 7% of worldwide annual turnover (selected Articles).'
          ),
          options: { bullet: true, fontSize: 11, color: COL.text },
        },
        {
          text: ascii(
            'EU DORA: ICT resilience obligations can expand oversight when critical functions depend on third-party technology.'
          ),
          options: { bullet: true, fontSize: 11, color: COL.text },
        },
      ],
      { x: 0.58, y: 1.78, w: 12.12, h: 1.35, fontFace: 'Calibri' }
    );
    if (assets.scopeReductionPath) {
      s.addImage({
        path: assets.scopeReductionPath,
        x: 0.55,
        y: 3.2,
        w: 12.2,
        h: 3.85,
        sizing: { type: 'contain', w: 12.2, h: 3.85 },
      });
    }
    footerPptxFixed(s, 'Slide 3 — Compliance');
  } else {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(
      s,
      assets,
      'Deflationary Inference Economics (2020–2026).',
      'Privacy as an engineering choice — partner scope reduction (GDPR / DORA posture).'
    );
    s.addText(ascii(WEDGE_TITLE), {
      x: PPTX_TITLE_COL_X,
      y: 2.05,
      w: PPTX_SUBTITLE_W,
      h: 0.28,
      fontFace: 'Calibri',
      fontSize: 15,
      bold: true,
      color: COL.green,
    });
    s.addText(ascii(WEDGE_SUBTITLE), {
      x: PPTX_TITLE_COL_X,
      y: 2.32,
      w: PPTX_SUBTITLE_W,
      h: 0.42,
      fontFace: 'Calibri',
      fontSize: 12,
      color: COL.muted,
    });
    s.addImage({
      path: assets.wedgePath,
      x: 0.55,
      y: 2.78,
      w: 12.2,
      h: 0.98,
      sizing: { type: 'contain', w: 12.2, h: 0.98 },
    });
    s.addImage({
      path: assets.chartPath,
      x: 0.55,
      y: 3.88,
      w: 7.35,
      h: 3.05,
      sizing: { type: 'contain', w: 7.35, h: 3.05 },
    });
    s.addText(ascii('Standard cloud-inference parity'), {
      x: 8.15,
      y: 3.92,
      w: 4.6,
      h: 0.35,
      fontFace: 'Calibri',
      fontSize: 14,
      bold: true,
      color: 'F87171',
    });
    s.addText(
      [
        { text: 'High retention / PII gravity in vendor DB', options: { bullet: true, fontSize: 13, color: COL.muted } },
        { text: 'Larger SOC 2 assurance perimeter', options: { bullet: true, fontSize: 13, color: COL.muted } },
      ],
      { x: 8.15, y: 4.22, w: 4.6, h: 1.05, fontFace: 'Calibri' }
    );
    s.addText(ascii('Pocket Portfolio sovereign substrate'), {
      x: 8.15,
      y: 5.35,
      w: 4.6,
      h: 0.35,
      fontFace: 'Calibri',
      fontSize: 14,
      bold: true,
      color: COL.green,
    });
    s.addText(
      [
        {
          text: ascii(`${MOAT_CLAIMS.limitedScopeProcessor.phrase} by architecture`),
          options: { bullet: true, fontSize: 13, color: COL.text },
        },
        {
          text: ascii('Deterministic ingestion at the edge; aggregate context only'),
          options: { bullet: true, fontSize: 13, color: COL.text },
        },
        {
          text: ascii('Reduces partner oversight complexity for EU DORA and UK GDPR posture'),
          options: { bullet: true, fontSize: 13, color: COL.text },
        },
      ],
      { x: 8.15, y: 5.68, w: 4.6, h: 1.25, fontFace: 'Calibri' }
    );
    footerPptxFixed(s, 'Slide 3 — Inference economics');
  }

  if (partner === 'freetrade') {
    const sRm = pptx.addSlide();
    addSlideHeaderPptxFixed(
      sRm,
      assets,
      'EU / UK Program: Q2–Q4 2026 (180-day window).',
      ascii('Days 0–60: active ingestion hardening — Freetrade CSV path already live in production.')
    );
    sRm.addImage({
      path: assets.roadmapPath,
      x: 0.58,
      y: 1.78,
      w: 12.12,
      h: 4.72,
      sizing: { type: 'contain', w: 12.12, h: 4.72 },
    });
    sRm.addText(
      ascii(
        'MIT-licensed @pocket-portfolio/importer: 19+ adapters under adversarial test on real broker CSVs, including Freetrade exports.'
      ),
      { x: 0.58, y: 6.52, w: 12.12, h: 0.52, fontFace: 'Calibri', fontSize: 11, italic: true, color: COL.muted }
    );
    footerPptxFixed(sRm, 'Slide 4 — Program roadmap');
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(
      s,
      assets,
      'Deflationary Inference Economics (2020–2026).',
      'Privacy as an engineering choice — partner scope reduction (GDPR / DORA posture).'
    );
    s.addText(ascii(WEDGE_TITLE), {
      x: PPTX_TITLE_COL_X,
      y: 2.05,
      w: PPTX_SUBTITLE_W,
      h: 0.28,
      fontFace: 'Calibri',
      fontSize: 15,
      bold: true,
      color: COL.green,
    });
    s.addText(ascii(WEDGE_SUBTITLE), {
      x: PPTX_TITLE_COL_X,
      y: 2.32,
      w: PPTX_SUBTITLE_W,
      h: 0.42,
      fontFace: 'Calibri',
      fontSize: 12,
      color: COL.muted,
    });
    s.addImage({
      path: assets.chartPath,
      x: 0.55,
      y: 2.85,
      w: 7.35,
      h: 3.55,
      sizing: { type: 'contain', w: 7.35, h: 3.55 },
    });
    s.addText(ascii('Standard cloud-inference parity'), {
      x: 8.15,
      y: 2.92,
      w: 4.6,
      h: 0.35,
      fontFace: 'Calibri',
      fontSize: 14,
      bold: true,
      color: 'F87171',
    });
    s.addText(
      [
        { text: 'High retention / PII gravity in vendor DB', options: { bullet: true, fontSize: 13, color: COL.muted } },
        { text: 'Larger SOC 2 assurance perimeter', options: { bullet: true, fontSize: 13, color: COL.muted } },
      ],
      { x: 8.15, y: 3.22, w: 4.6, h: 1.05, fontFace: 'Calibri' }
    );
    s.addText(ascii('Pocket Portfolio sovereign substrate'), {
      x: 8.15,
      y: 4.55,
      w: 4.6,
      h: 0.35,
      fontFace: 'Calibri',
      fontSize: 14,
      bold: true,
      color: COL.green,
    });
    s.addText(
      [
        {
          text: ascii(`${MOAT_CLAIMS.limitedScopeProcessor.phrase} by architecture`),
          options: { bullet: true, fontSize: 13, color: COL.text },
        },
        {
          text: ascii('Deterministic ingestion at the edge; aggregate context only'),
          options: { bullet: true, fontSize: 13, color: COL.text },
        },
        {
          text: ascii('Reduces partner oversight complexity for EU DORA and UK GDPR posture'),
          options: { bullet: true, fontSize: 13, color: COL.text },
        },
      ],
      { x: 8.15, y: 4.88, w: 4.6, h: 1.45, fontFace: 'Calibri' }
    );
    footerPptxFixed(s, 'Slide 5 — Inference economics');
    addRevenueSlidePptx(pptx, assets, 'freetrade');
  } else {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(s, assets, 'North American Deployment: Q3–Q4 2026 (180-day window).');
    s.addImage({
      path: assets.roadmapPath,
      x: 0.58,
      y: 1.78,
      w: 12.12,
      h: 4.72,
      sizing: { type: 'contain', w: 12.12, h: 4.72 },
    });
    s.addText(
      ascii(
        'Illustrative program map — dates shift with legal, security, and partner gates. Monzo US / Revolut US where Plaid coverage permits.'
      ),
      { x: 0.58, y: 6.58, w: 12.12, h: 0.45, fontFace: 'Calibri', fontSize: 11, italic: true, color: COL.muted }
    );
    footerPptxFixed(s, 'Slide 4 — Roadmap');
    addRevenueSlidePptx(pptx, assets, 'plaid');
  }

  {
    const s = pptx.addSlide();
    addSlideHeaderPptxFixed(s, assets, 'Institutional-Grade Leadership — Abba Lawal.');
    const h = FOUNDER_CREDENTIALS_ABBA.highlights;
    const credFlow = [h[0], h[1], h[3], h[2], h[4], h[5], h[6]] as const;
    let credY = 1.72;
    if (
      assets.jpmPptxPath &&
      assets.moodysPptxPath &&
      assets.natJpm &&
      assets.natMoodys
    ) {
      const jpmH = 0.5;
      const jpmW = (assets.natJpm.w / assets.natJpm.h) * jpmH;
      const myH = 0.5;
      const myW = (assets.natMoodys.w / assets.natMoodys.h) * myH;
      const rowW = jpmW + 0.2 + myW;
      const leftX = 0.58 + (6.28 - rowW) / 2;
      s.addImage({
        path: assets.jpmPptxPath,
        x: leftX,
        y: 1.72,
        w: jpmW,
        h: jpmH,
        sizing: { type: 'contain', w: jpmW, h: jpmH },
      });
      s.addImage({
        path: assets.moodysPptxPath,
        x: leftX + jpmW + 0.2,
        y: 1.72,
        w: myW,
        h: myH,
        sizing: { type: 'contain', w: myW, h: myH },
      });
      credY = 2.32;
    } else {
      s.addText(
        ascii(
          'Programme backdrop (photograph): JPMorgan Chase and Moody\u2019s marks appear on-stage alongside other partners.'
        ),
        {
          x: 0.58,
          y: 1.72,
          w: 6.28,
          h: 0.52,
          fontFace: 'Calibri',
          fontSize: 10,
          italic: true,
          color: COL.muted,
        }
      );
      credY = 2.32;
    }
    s.addText(
      credFlow.map((line) => ({
        text: ascii(line),
        options: { bullet: { indent: 12 }, fontSize: 11, color: COL.text, paraSpaceAfter: 5 },
      })),
      { x: 0.58, y: credY, w: 6.28, h: 4.72, fontFace: 'Calibri' }
    );
    const ubx = 6.95;
    const uby = 1.68;
    const ubw = 6.38;
    const ubh = 5.18;
    const photoIn = fitContain(assets.natUbbs.w, assets.natUbbs.h, ubx, uby, ubw, ubh);
    s.addImage({
      path: assets.phUbbsPath,
      x: photoIn.x,
      y: photoIn.y,
      w: photoIn.w,
      h: photoIn.h,
    });
    /** Square frame — rounded stroke was clipping photo corners. */
    s.addShape('rect', {
      x: photoIn.x,
      y: photoIn.y,
      w: photoIn.w,
      h: photoIn.h,
      line: { color: COL.green, pt: 1.25 },
    });
    s.addText(ascii('UK Black Business Show 2024 — on-stage panel.'), {
      x: ubx,
      y: photoIn.y + photoIn.h + 0.07,
      w: ubw,
      h: 0.22,
      fontFace: 'Calibri',
      fontSize: 9,
      italic: true,
      color: COL.muted,
    });
    footerPptxFixed(s, partner === 'freetrade' ? 'Slide 7 — Executive authority' : 'Slide 6 — Executive authority');
  }

  await pptx.writeFile({ fileName: deckCtx.outPptx });
  buildPdf(assets);

  if (!assets.partnerMarkOfficial) {
    const hint =
      partner === 'freetrade'
        ? '[partner-deck] Freetrade: optional official mark at public/brand/partners/freetrade-logo.png|svg (header uses styled wordmark fallback).'
        : '[partner-deck] Plaid: add official mark at public/brand/partners/plaid-logo.png (header shows PLAID text fallback).';
    // eslint-disable-next-line no-console
    console.warn(hint);
  }
  if (!assets.gmOfficial) {
    // eslint-disable-next-line no-console
    console.warn(
      '[partner-deck] GM Growth Hub: add public/brand/partners/gm-growth-hub-logo.png for an official regional badge.'
    );
  }
  if (!assets.jpmPptxPath || !assets.moodysPptxPath) {
    // eslint-disable-next-line no-console
    console.warn(
      '[partner-deck] Final slide: JPMC/Moody\u2019s lockups omitted (photograph carries marks). Add jpmorgan-logo.* and moodys-logo.* under public/brand/partners/ if required.'
    );
  }

  // eslint-disable-next-line no-console
  console.log(`WROTE ${deckCtx.outPptx}`);
  // eslint-disable-next-line no-console
  console.log(`WROTE ${deckCtx.outPdf}`);
}
