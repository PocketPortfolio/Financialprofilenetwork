/**
 * Open Portfolio — 3-slide Institutional Tear Sheet (PPTX).
 * SSOT: docs/seed/open-portfolio-institutional-tear-sheet-2026-07-07.md
 *
 * Run: npm run build:open-tear-sheet
 */
import fs from 'node:fs';
import path from 'node:path';
import PptxGenJS from 'pptxgenjs';

import { fetchLiveNpmAggregate } from './fetch-npm-stats';
import { tractionFromSnapshot } from './open-portfolio-seed-visuals';
import { resolveAbbaSpeakingPortrait } from './resolve-abba-portrait';

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'docs', 'seed');
const TEAR_CACHE = path.join(OUT_DIR, '_tear-sheet-cache');
const PLATES_DIR = path.join(OUT_DIR, 'design-plates');
/** Pedigree row geometry (inches) — photo column aspect = 820/1024. */
const PED_X = 0.35;
const PED_Y = 4.72;
const PED_H = 2.28;
const PED_GAP = 0.14;
const PHOTO_W = 1.82;
const PHOTO_H = PED_H;
const PHOTO_X = 13.33 - 0.35 - PHOTO_W;
const PED_TEXT_W = PHOTO_X - PED_GAP - PED_X;
const DOC_TITLE = 'Open_Portfolio_Institutional_Tear_Sheet_2026-07-07';
export const OUT_PPTX = path.join(OUT_DIR, `${DOC_TITLE}.pptx`);

const OP_LOGO_PNG = path.join(ROOT, 'public', 'brand', 'op-monogram-amber.png');
const PP_LOGO_PNG = path.join(ROOT, 'public', 'brand', 'pp-monogram-amber.png');
const OPEN_URL = 'www.openportfolio.co.uk';
const POCKET_URL = 'www.pocketportfolio.app';
const BIP_URL = 'openportfolio.co.uk/board-of-investors';

const COL = {
  bg: '09090b',
  surface: '18181b',
  border: '3F3F46',
  text: 'F4F4F5',
  muted: 'A1A1AA',
  amber: 'F59E0B',
  mono: 'Consolas',
};

export interface TearSheetMetrics {
  npmFormatted: string;
  mauFormatted: string;
  npmAsOf: string;
  mauAsOf: string;
  npmLive: boolean;
}

function ascii(s: string): string {
  return s.replace(/\u2014/g, '-').replace(/\u2013/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}

export async function loadTearSheetMetrics(): Promise<TearSheetMetrics> {
  const snapshot = tractionFromSnapshot();
  try {
    const live = await fetchLiveNpmAggregate();
    if (live.totalDownloads > 0) {
      const asOf = live.fetchedAt.split('T')[0] ?? snapshot.npmAsOf;
      return {
        npmFormatted: live.totalDownloads.toLocaleString('en-GB'),
        mauFormatted: snapshot.mauFormatted,
        npmAsOf: asOf,
        mauAsOf: snapshot.mauAsOf,
        npmLive: true,
      };
    }
  } catch (err) {
    console.warn('Live npm fetch failed — TRAC-01 snapshot', err);
  }
  return {
    npmFormatted: snapshot.npmFormatted,
    mauFormatted: snapshot.mauFormatted,
    npmAsOf: snapshot.npmAsOf,
    mauAsOf: snapshot.mauAsOf,
    npmLive: false,
  };
}

function platePath(name: string): string | null {
  const p = path.join(PLATES_DIR, name);
  return fs.existsSync(p) ? p : null;
}

type PptxSlide = ReturnType<PptxGenJS['addSlide']>;

function slideFill(s: PptxSlide) {
  s.background = { color: COL.bg };
}

function embedPlate(s: PptxSlide, plateFile: string | null) {
  if (!plateFile) return;
  s.addImage({
    path: plateFile,
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    sizing: { type: 'cover', w: 13.33, h: 7.5 },
  });
  s.addShape('rect', {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    fill: { color: COL.bg, transparency: 72 },
  });
}

function headerBar(s: PptxSlide, page: string, title: string) {
  s.addShape('rect', {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.95,
    fill: { color: COL.surface, transparency: 8 },
    line: { color: COL.border, pt: 0.5 },
  });
  s.addShape('rect', { x: 0, y: 0, w: 0.08, h: 0.95, fill: { color: COL.amber } });
  if (fs.existsSync(OP_LOGO_PNG)) {
    s.addImage({ path: OP_LOGO_PNG, x: 0.28, y: 0.18, w: 0.48, h: 0.48 });
  }
  s.addText(ascii('OPEN PORTFOLIO · INSTITUTIONAL TEAR SHEET'), {
    x: 0.88,
    y: 0.14,
    w: 7.5,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 8,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii(title), {
    x: 0.88,
    y: 0.38,
    w: 8.5,
    h: 0.38,
    fontFace: 'Calibri',
    fontSize: 16,
    bold: true,
    color: COL.text,
  });
  s.addText(ascii(`Confidential · ${page} · SovereignAI North-West · 7 Jul 2026`), {
    x: 8.9,
    y: 0.22,
    w: 4.2,
    h: 0.55,
    fontFace: COL.mono,
    fontSize: 7.5,
    color: COL.muted,
    align: 'right',
    valign: 'middle',
  });
}

/** Center-crop speaking photo to 820×1024 for a flush portrait column (no letterboxing). */
export async function prepareTearSheetPortrait(sourcePath: string): Promise<string> {
  fs.mkdirSync(TEAR_CACHE, { recursive: true });
  const outPath = path.join(TEAR_CACHE, 'abba-speaking-portrait-crop.jpg');
  const sharp = (await import('sharp')).default;
  const meta = await sharp(sourcePath).metadata();
  const w = meta.width ?? 1640;
  const h = meta.height ?? 2048;
  const cropW = Math.round(w * 0.58);
  const left = Math.round((w - cropW) / 2);
  const top = Math.round(h * 0.03);
  const cropH = Math.round(h * 0.94);
  await sharp(sourcePath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(820, 1024, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 93, mozjpeg: true })
    .toFile(outPath);
  return outPath;
}

/** Photo column: image edge-to-edge, border and caption aligned to cell bounds. */
function addPhotoColumn(s: PptxSlide, imagePath: string) {
  const x = PHOTO_X;
  const y = PED_Y;
  const w = PHOTO_W;
  const h = PHOTO_H;
  const capH = 0.3;

  s.addImage({
    path: imagePath,
    x,
    y,
    w,
    h,
    sizing: { type: 'cover', w, h },
  });
  s.addShape('rect', {
    x,
    y,
    w,
    h,
    fill: { color: COL.bg, transparency: 100 },
    line: { color: COL.amber, pt: 1.25 },
  });
  s.addShape('rect', {
    x,
    y: y + h - capH,
    w,
    h: capH,
    fill: { color: COL.bg, transparency: 8 },
  });
  s.addText(ascii('Abba Lawal · UK Black Business Show'), {
    x,
    y: y + h - capH + 0.05,
    w,
    h: capH - 0.08,
    fontFace: COL.mono,
    fontSize: 6.5,
    color: COL.text,
    align: 'center',
    valign: 'middle',
  });
}

/** Opaque right column so design-plate baked metrics do not bleed through. */
function rightColumnBackdrop(s: PptxSlide) {
  s.addShape('rect', {
    x: 6.9,
    y: 1.28,
    w: 6.28,
    h: 5.72,
    fill: { color: COL.bg, transparency: 3 },
    line: { color: COL.border, pt: 0.5 },
  });
}

function footerBar(s: PptxSlide, extra: string) {
  s.addShape('rect', {
    x: 0,
    y: 7.12,
    w: 13.33,
    h: 0.38,
    fill: { color: COL.surface, transparency: 15 },
  });
  s.addText(ascii(`Open Portfolio | ${extra}`), {
    x: 0.35,
    y: 7.18,
    w: 12.6,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 7,
    color: COL.muted,
  });
}

function panel(
  s: PptxSlide,
  x: number,
  y: number,
  w: number,
  h: number,
  opts?: { accent?: boolean }
) {
  s.addShape('roundRect', {
    x,
    y,
    w,
    h,
    fill: { color: COL.surface, transparency: 12 },
    line: { color: opts?.accent ? COL.amber : COL.border, pt: opts?.accent ? 1.2 : 0.75 },
    rectRadius: 0.04,
  });
  if (opts?.accent) {
    s.addShape('rect', { x, y, w: 0.06, h, fill: { color: COL.amber } });
  }
}

function buildSlide1(s: PptxSlide, metrics: TearSheetMetrics, portrait: string | null) {
  slideFill(s);
  embedPlate(s, platePath('slide-01-frontier.png'));
  headerBar(s, '1 of 3', 'The Sovereign Mandate');

  panel(s, 0.35, 1.05, 6.35, 3.55, { accent: true });
  s.addText(ascii('THE COMPLIANCE LOCKOUT'), {
    x: 0.55,
    y: 1.12,
    w: 6,
    h: 0.3,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });
  s.addText(
    ascii(
      'Legacy wealth-tech warehouses itemized ledgers in cloud DBs to run GenAI—inheriting maximum regulatory exposure under EU DORA, EU AI Act, and UK GDPR.'
    ),
    {
      x: 0.55,
      y: 1.42,
      w: 5.95,
      h: 0.72,
      fontFace: 'Calibri',
      fontSize: 9.5,
      color: COL.text,
      valign: 'top',
    }
  );

  const exposures: Array<[string, string]> = [
    ['GBP 4.45M', 'Avg breach cost (financial services)'],
    ['EUR 35M or 7%', 'EU AI Act · Art. 99 Tier-1'],
    ['EUR 20M or 4%', 'GDPR · Art. 83(5) higher tier'],
  ];
  exposures.forEach(([metric, label], i) => {
    const y = 2.28 + i * 0.52;
    s.addText(ascii(metric), {
      x: 0.55,
      y,
      w: 1.65,
      h: 0.28,
      fontFace: COL.mono,
      fontSize: 11,
      bold: true,
      color: COL.amber,
    });
    s.addText(ascii(label), {
      x: 2.15,
      y,
      w: 4.35,
      h: 0.35,
      fontFace: 'Calibri',
      fontSize: 8.5,
      color: COL.muted,
    });
  });

  s.addText(
    ascii(
      'Open Portfolio = architectural boundary. Limited-scope processor + stateless reasoning—no raw client PII on the inference path.'
    ),
    {
      x: 0.55,
      y: 3.95,
      w: 5.95,
      h: 0.55,
      fontFace: 'Calibri',
      fontSize: 8.5,
      color: COL.text,
      valign: 'top',
    }
  );

  panel(s, 6.85, 1.05, 6.15, 2.05, { accent: true });
  s.addText(ascii('SEED MANDATE'), {
    x: 7.05,
    y: 1.12,
    w: 5.7,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii('GBP 1.6M'), {
    x: 7.05,
    y: 1.48,
    w: 5.7,
    h: 0.65,
    fontFace: COL.mono,
    fontSize: 36,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii('Target: GBP 500k ARR · 12 partners · 18mo'), {
    x: 7.05,
    y: 2.1,
    w: 5.7,
    h: 0.32,
    fontFace: COL.mono,
    fontSize: 11,
    color: COL.text,
  });
  s.addText(ascii('Mandate not guaranteed · B2B SDK · DPAs · SOC 2 path'), {
    x: 7.05,
    y: 2.42,
    w: 5.7,
    h: 0.35,
    fontFace: 'Calibri',
    fontSize: 8.5,
    color: COL.muted,
  });
  s.addText(ascii('SovereignAI RFF · privacy-preserving infrastructure'), {
    x: 7.05,
    y: 2.72,
    w: 5.7,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 8,
    color: COL.amber,
  });

  panel(s, 6.85, 3.22, 3.55, 1.38);
  s.addText(ascii('BOARD OF INVESTORS'), {
    x: 7.05,
    y: 3.3,
    w: 3.2,
    h: 0.25,
    fontFace: COL.mono,
    fontSize: 8,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii('Five pioneer seats · infrastructure moat alignment'), {
    x: 7.05,
    y: 3.55,
    w: 3.2,
    h: 0.55,
    fontFace: 'Calibri',
    fontSize: 8.5,
    color: COL.text,
    valign: 'top',
  });
  s.addText(ascii(BIP_URL), {
    x: 7.05,
    y: 4.15,
    w: 3.2,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 7.5,
    color: COL.muted,
  });

  panel(s, 10.5, 3.22, 2.5, 1.38);
  s.addText(ascii('TRACTION (live)'), {
    x: 10.65,
    y: 3.3,
    w: 2.2,
    h: 0.25,
    fontFace: COL.mono,
    fontSize: 7.5,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii(metrics.npmFormatted), {
    x: 10.65,
    y: 3.55,
    w: 2.2,
    h: 0.42,
    fontFace: COL.mono,
    fontSize: 18,
    bold: true,
    color: COL.amber,
    align: 'center',
  });
  s.addText(ascii(`npm${metrics.npmLive ? ' · live' : ''}`), {
    x: 10.65,
    y: 3.95,
    w: 2.2,
    h: 0.22,
    fontFace: COL.mono,
    fontSize: 7,
    color: COL.muted,
    align: 'center',
  });

  panel(s, PED_X, PED_Y, PED_TEXT_W, PED_H, { accent: true });
  s.addText(ascii('OPERATOR PEDIGREE — ABBA LAWAL'), {
    x: PED_X + 0.2,
    y: PED_Y + 0.08,
    w: PED_TEXT_W - 0.35,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });
  s.addText(
    [
      {
        text: ascii('Lead PM architecture · National Grid Ventures (2023–2025)'),
        options: { bullet: true, breakLine: true },
      },
      {
        text: ascii('Decision-support platforms · £7B physical energy infrastructure'),
        options: { bullet: true, breakLine: true },
      },
      {
        text: ascii('Whale Watch · 4.7B data points · 2024 DataIQ ESG Data Award'),
        options: { bullet: true, breakLine: true },
      },
      {
        text: ascii('openportfolio.co.uk/press/abba-lawal'),
        options: { bullet: false, breakLine: true, color: COL.muted },
      },
    ],
    {
      x: PED_X + 0.2,
      y: PED_Y + 0.38,
      w: PED_TEXT_W - 0.35,
      h: PED_H - 0.48,
      fontFace: 'Calibri',
      fontSize: 9,
      color: COL.text,
      valign: 'top',
      paraSpaceAfter: 4,
    }
  );
  if (portrait) {
    addPhotoColumn(s, portrait);
  }

  footerBar(
    s,
    `The Sovereign Mandate · npm ${metrics.npmFormatted} as of ${metrics.npmAsOf} · mandate not guaranteed`
  );
}

function buildSlide2(s: PptxSlide, metrics: TearSheetMetrics) {
  slideFill(s);
  embedPlate(s, platePath('slide-02-split-brain.png'));
  headerBar(s, '2 of 3', 'Architecture & Traction');
  rightColumnBackdrop(s);

  s.addText(
    ascii('Directly addressing SovereignAI RFF Pillar 01 & 05 · privacy-preserving infrastructure'),
    {
      x: 0.35,
      y: 1.02,
      w: 12.6,
      h: 0.28,
      fontFace: COL.mono,
      fontSize: 8.5,
      color: COL.amber,
    }
  );

  panel(s, 0.35, 1.35, 6.5, 5.55, { accent: true });
  s.addText(ascii('SANITIZATION BY CONSTRUCTION'), {
    x: 0.55,
    y: 1.42,
    w: 6.1,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });

  const steps: Array<{ n: string; title: string; body: string; code: string }> = [
    {
      n: '1',
      title: 'Ingest @ edge',
      body: '@pocket-portfolio/importer (MIT, 19+ adapters) normalizes broker data client-side.',
      code: 'packages/importer',
    },
    {
      n: '2',
      title: 'Context engine',
      body: 'buildPortfolioContext() → bounded aggregates (totals + top 10 holdings).',
      code: 'app/lib/ai/contextBuilder.ts',
    },
    {
      n: '3',
      title: 'Stateless API',
      body: 'POST /api/ai/chat — sanitized context only; zero portfolio payload persistence.',
      code: 'app/api/ai/chat/route.ts',
    },
  ];
  steps.forEach((step, i) => {
    const y = 1.82 + i * 1.55;
    s.addShape('ellipse', {
      x: 0.55,
      y,
      w: 0.32,
      h: 0.32,
      fill: { color: COL.bg },
      line: { color: COL.amber, pt: 1.25 },
    });
    s.addText(step.n, {
      x: 0.55,
      y: y + 0.02,
      w: 0.32,
      h: 0.3,
      fontFace: COL.mono,
      fontSize: 11,
      bold: true,
      color: COL.amber,
      align: 'center',
    });
    s.addText(ascii(step.title), {
      x: 1.02,
      y,
      w: 5.6,
      h: 0.28,
      fontFace: COL.mono,
      fontSize: 10,
      bold: true,
      color: COL.text,
    });
    s.addText(ascii(step.body), {
      x: 1.02,
      y: y + 0.28,
      w: 5.6,
      h: 0.55,
      fontFace: 'Calibri',
      fontSize: 8.5,
      color: COL.muted,
      valign: 'top',
    });
    s.addText(ascii(step.code), {
      x: 1.02,
      y: y + 0.82,
      w: 5.6,
      h: 0.22,
      fontFace: COL.mono,
      fontSize: 7.5,
      color: COL.amber,
    });
  });

  s.addText(
    ascii(
      'Inference-path rule: raw ledger rows + account IDs are NOT in the designed context string. Hybrid persistence (Firebase) applies for auth users.'
    ),
    {
      x: 0.55,
      y: 6.45,
      w: 6.1,
      h: 0.38,
      fontFace: 'Calibri',
      fontSize: 7.5,
      color: COL.text,
      valign: 'top',
    }
  );

  panel(s, 7.05, 1.35, 6.0, 3.2);
  s.addText(ascii('DUAL-SURFACE · BATTLE-TESTED'), {
    x: 7.25,
    y: 1.42,
    w: 5.6,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii('One monorepo · Pocket breaks first · Open sells procurement'), {
    x: 7.25,
    y: 1.68,
    w: 5.6,
    h: 0.28,
    fontFace: 'Calibri',
    fontSize: 8,
    color: COL.muted,
  });

  if (fs.existsSync(OP_LOGO_PNG)) {
    s.addImage({ path: OP_LOGO_PNG, x: 7.25, y: 2.02, w: 0.34, h: 0.34 });
  }
  s.addText(ascii('Open Portfolio'), {
    x: 7.68,
    y: 2.0,
    w: 3.5,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 11,
    bold: true,
    color: COL.text,
  });
  s.addText(ascii(OPEN_URL), {
    x: 7.68,
    y: 2.24,
    w: 4.5,
    h: 0.2,
    fontFace: COL.mono,
    fontSize: 7.5,
    color: COL.amber,
  });
  s.addText(ascii(metrics.npmFormatted), {
    x: 7.25,
    y: 2.48,
    w: 5.5,
    h: 0.48,
    fontFace: COL.mono,
    fontSize: 28,
    bold: true,
    color: COL.amber,
  });
  s.addText(
    ascii(`all-time npm · TRAC-01${metrics.npmLive ? ' · live' : ''} · ${metrics.npmAsOf}`),
    {
      x: 7.25,
      y: 2.92,
      w: 5.6,
      h: 0.22,
      fontFace: COL.mono,
      fontSize: 7.5,
      color: COL.text,
    }
  );

  s.addShape('rect', {
    x: 7.25,
    y: 3.18,
    w: 5.55,
    h: 0.02,
    fill: { color: COL.border },
  });

  if (fs.existsSync(PP_LOGO_PNG)) {
    s.addImage({ path: PP_LOGO_PNG, x: 7.25, y: 3.28, w: 0.34, h: 0.34 });
  }
  s.addText(ascii('Pocket Portfolio'), {
    x: 7.68,
    y: 3.26,
    w: 3.5,
    h: 0.26,
    fontFace: 'Calibri',
    fontSize: 11,
    bold: true,
    color: COL.text,
  });
  s.addText(ascii(POCKET_URL), {
    x: 7.68,
    y: 3.5,
    w: 4.5,
    h: 0.2,
    fontFace: COL.mono,
    fontSize: 7.5,
    color: COL.amber,
  });
  s.addText(ascii(metrics.mauFormatted), {
    x: 7.25,
    y: 3.74,
    w: 5.5,
    h: 0.48,
    fontFace: COL.mono,
    fontSize: 28,
    bold: true,
    color: COL.amber,
  });
  s.addText(ascii(`MAU · 28-day GA4 · TRAC-07 · ${metrics.mauAsOf}`), {
    x: 7.25,
    y: 4.18,
    w: 5.6,
    h: 0.22,
    fontFace: COL.mono,
    fontSize: 7.5,
    color: COL.text,
  });

  panel(s, 7.05, 4.68, 6.0, 1.55, { accent: true });
  s.addText(ascii('WHY INSTITUTIONS CARE'), {
    x: 7.25,
    y: 4.75,
    w: 5.6,
    h: 0.26,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });
  s.addText(
    [
      {
        text: ascii('Inspectable MIT OSS wedge — diligence without NDA theatre'),
        options: { bullet: true, breakLine: true },
      },
      {
        text: ascii('Production harness de-risks parsers before enterprise ACV'),
        options: { bullet: true, breakLine: true },
      },
      {
        text: ascii('Bounded inference context — reduced AI egress compliance surface'),
        options: { bullet: true, breakLine: true },
      },
    ],
    {
      x: 7.25,
      y: 5.02,
      w: 5.6,
      h: 1.05,
      fontFace: 'Calibri',
      fontSize: 8,
      color: COL.text,
      valign: 'top',
      paraSpaceAfter: 3,
    }
  );

  footerBar(
    s,
    `Architecture & Traction · npm ${metrics.npmFormatted} · MAU ${metrics.mauFormatted} · claims SSOT calibrated`
  );
}

function faqCard(
  s: PptxSlide,
  x: number,
  y: number,
  w: number,
  h: number,
  q: string,
  a: string
) {
  panel(s, x, y, w, h);
  s.addText(ascii(`Q: ${q}`), {
    x: x + 0.12,
    y: y + 0.08,
    w: w - 0.24,
    h: 0.32,
    fontFace: 'Calibri',
    fontSize: 9,
    bold: true,
    color: COL.amber,
    valign: 'top',
  });
  s.addText(ascii(`A: ${a}`), {
    x: x + 0.12,
    y: y + 0.38,
    w: w - 0.24,
    h: h - 0.45,
    fontFace: 'Calibri',
    fontSize: 8,
    color: COL.text,
    valign: 'top',
  });
}

function buildSlide3(s: PptxSlide) {
  slideFill(s);
  embedPlate(s, platePath('slide-05-control-panel.png'));
  headerBar(s, '3 of 3', 'Technical Due Diligence');

  s.addText(ascii('Pre-emptive technical FAQ — diligence-ready answers for HSBC · SovereignAI partners'), {
    x: 0.35,
    y: 1.02,
    w: 12.6,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 8.5,
    color: COL.amber,
  });

  faqCard(
    s,
    0.35,
    1.35,
    4.2,
    1.35,
    'Entirely without the cloud?',
    'No. Hybrid persistence: guests on localStorage; Firebase for auth trade authority. Ledger stays off the LLM path.'
  );
  faqCard(
    s,
    4.65,
    1.35,
    4.2,
    1.35,
    'How does AI read the portfolio?',
    'Sanitization by construction — bounded aggregate to /api/ai/chat. Model sees approved totals, not raw ledger.'
  );
  faqCard(
    s,
    8.95,
    1.35,
    4.05,
    1.35,
    'Open vs Pocket?',
    'Same monorepo. Open = B2B host (app/open). Pocket = live harness. B2B paths 301 to Open.'
  );
  faqCard(
    s,
    0.35,
    2.78,
    6.05,
    1.22,
    'What is open source?',
    '@pocket-portfolio/importer (MIT) + broker aliases on npm. Parsing boundaries are inspectable in the data room.'
  );
  faqCard(
    s,
    6.55,
    2.78,
    6.45,
    1.22,
    'Is GBP 500k ARR guaranteed?',
    'No — target pipeline mandate. Seed funds enterprise sales, DPAs, and SOC 2. B2C de-risks product; B2B converts ACV.'
  );

  panel(s, 0.35, 4.12, 12.65, 2.78, { accent: true });
  s.addText(ascii('DILIGENCE RECEIPTS'), {
    x: 0.55,
    y: 4.2,
    w: 12,
    h: 0.28,
    fontFace: COL.mono,
    fontSize: 9,
    bold: true,
    color: COL.amber,
  });
  s.addText(
    ascii(
      'When your technical team is ready for the data room, these are the exact repository paths where stateless architecture and bounded inference context are enforced.'
    ),
    {
      x: 0.55,
      y: 4.48,
      w: 12.2,
      h: 0.42,
      fontFace: 'Calibri',
      fontSize: 8.5,
      color: COL.text,
      valign: 'top',
    }
  );

  const headerCell = { fill: { color: COL.surface }, color: COL.amber, bold: true, fontFace: COL.mono };
  const bodyCell = { fill: { color: COL.bg }, color: COL.text };
  const pathCell = { fill: { color: COL.bg }, color: COL.muted, fontFace: COL.mono };

  s.addTable(
    [
      [
        { text: ascii('Mechanism'), options: headerCell },
        { text: ascii('Repository path (data room)'), options: headerCell },
      ],
      [
        { text: ascii('Context engine · sanitization by construction'), options: bodyCell },
        { text: ascii('app/lib/ai/contextBuilder.ts'), options: pathCell },
      ],
      [
        { text: ascii('Stateless inference API'), options: bodyCell },
        { text: ascii('app/api/ai/chat/route.ts'), options: pathCell },
      ],
      [
        { text: ascii('IP & architecture engineering record'), options: bodyCell },
        { text: ascii('docs/IP-TECHNICAL-MECHANISMS.md'), options: pathCell },
      ],
      [
        { text: ascii('OSS ingestion wedge (MIT)'), options: bodyCell },
        { text: ascii('packages/importer · SCHEMA.md'), options: pathCell },
      ],
    ],
    {
      x: 0.55,
      y: 4.95,
      w: 12.2,
      h: 1.75,
      colW: [3.35, 8.65],
      fontSize: 8,
      fontFace: 'Calibri',
      border: { type: 'solid', pt: 0.5, color: COL.border },
      margin: 0.04,
    }
  );

  footerBar(s, 'Technical Due Diligence · Open Portfolio confidential · July 2026');
}

export async function runOpenPortfolioTearSheetDeck(): Promise<string> {
  const metrics = await loadTearSheetMetrics();
  const portraitSource = resolveAbbaSpeakingPortrait(ROOT);
  let portraitForSlide: string | null = null;
  if (!portraitSource) {
    console.warn('Abba speaking portrait not found under public/press/abba/');
  } else {
    try {
      portraitForSlide = await prepareTearSheetPortrait(portraitSource);
      console.log(`Portrait: ${path.basename(portraitSource)} → ${path.basename(portraitForSlide)}`);
    } catch (err) {
      console.warn('Portrait crop failed — using source file', err);
      portraitForSlide = portraitSource;
    }
  }
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Open Portfolio';
  pptx.company = 'Open Portfolio';
  pptx.title = DOC_TITLE;
  pptx.subject = 'Institutional tear sheet — SovereignAI North-West · 7 Jul 2026';
  pptx.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };

  buildSlide1(pptx.addSlide(), metrics, portraitForSlide);
  buildSlide2(pptx.addSlide(), metrics);
  buildSlide3(pptx.addSlide());

  fs.mkdirSync(OUT_DIR, { recursive: true });
  try {
    await pptx.writeFile({ fileName: OUT_PPTX });
    console.log(`Wrote ${OUT_PPTX}`);
    console.log(
      `Traction: npm=${metrics.npmFormatted}${metrics.npmLive ? ' (live)' : ''} · MAU=${metrics.mauFormatted} (TRAC-07)`
    );
    return OUT_PPTX;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
      const alt = path.join(OUT_DIR, `${DOC_TITLE}_draft.pptx`);
      await pptx.writeFile({ fileName: alt });
      console.warn(`Primary locked; wrote ${alt}`);
      return alt;
    }
    throw e;
  }
}
