/**
 * Generate Pocket Portfolio: Sovereign Financial AI pitch deck (10 slides) as PPTX.
 *
 * Output:
 *  - docs/marketing/Pocket-Portfolio-Sovereign-Financial-AI.pptx
 *
 * Inputs:
 *  - docs/marketing/deck-metrics-2026-03-27.json
 *  - docs/marketing/_tmp-hybrid-arch.png (rendered from public/book-assets/figures/si-figure-02-hybrid-architecture.svg)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import PptxGenJS from 'pptxgenjs';

const OUT = path.join('docs', 'marketing', 'Pocket-Portfolio-Sovereign-Financial-AI.pptx');
const METRICS = path.join('docs', 'marketing', 'deck-metrics-2026-03-27.json');
const ARCH_PNG = path.join('docs', 'marketing', '_tmp-hybrid-arch.png');
const ARCH_CROP_PNG = path.join('docs', 'marketing', '_tmp-hybrid-arch-crop.png');
const LOGO_SRC = path.join('public', 'brand', 'pp-monogram-email.svg');
const LOGO_PNG = path.join('docs', 'marketing', '_tmp-pp-monogram.png');

// Brand / theme (no generic blue; amber accent)
const COLORS = {
  bg: '0B0B0D',
  surface: '111114',
  border: '2A2A2F',
  text: 'F4F4F5',
  muted: 'B3B3BA',
  accent: 'F59E0B'
};

function ensureFile(p) {
  if (!fs.existsSync(p)) throw new Error(`Missing required file: ${p}`);
}

async function ensureBrandAssets() {
  // Render a brand-safe monogram (no blues/greens) from the email-safe SVG.
  // We rewrite the SVG fills to match the deck palette before rasterizing.
  if (!fs.existsSync(LOGO_PNG)) {
    ensureFile(LOGO_SRC);
    const svg = fs.readFileSync(LOGO_SRC, 'utf8')
      .replace(/fill=\"#0d2818\"/g, `fill=\"#${COLORS.bg}\"`)
      .replace(/fill=\"#ffffff\"/g, `fill=\"#${COLORS.text}\"`);
    const buf = Buffer.from(svg, 'utf8');
    await sharp(buf, { density: 600 }).png().toFile(LOGO_PNG);
  }

  // Create a cropped version of the architecture diagram to avoid dead space on the slide.
  if (!fs.existsSync(ARCH_CROP_PNG)) {
    ensureFile(ARCH_PNG);
    const img = sharp(ARCH_PNG);
    const meta = await img.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (!w || !h) throw new Error('Could not read architecture PNG dimensions.');
    // Crop ~7% off top and bottom to remove slide padding from source asset.
    const top = Math.round(h * 0.07);
    const bottom = Math.round(h * 0.07);
    const cropH = Math.max(1, h - top - bottom);
    await img.extract({ left: 0, top, width: w, height: cropH }).png().toFile(ARCH_CROP_PNG);
  }
}

function addHeader(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: COLORS.bg } });
  slide.addText(title, {
    x: 0.8, y: 0.55, w: 11.8, h: 0.6,
    fontFace: 'Calibri',
    fontSize: 34,
    bold: true,
    color: COLORS.text
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.25, w: 11.8, h: 0.4,
      fontFace: 'Consolas',
      fontSize: 14,
      color: COLORS.muted
    });
  }
  // Accent rule
  slide.addShape('rect', { x: 0.8, y: 1.75, w: 11.8, h: 0.04, fill: { color: COLORS.accent } });

  // Pocket Portfolio monogram (top-right)
  slide.addImage({ path: LOGO_PNG, x: 12.15, y: 0.48, w: 0.7, h: 0.7 });
}

function addFooter(slide, leftText) {
  slide.addText(leftText, {
    x: 0.8, y: 7.15, w: 11.8, h: 0.25,
    fontFace: 'Consolas',
    fontSize: 10,
    color: '8A8A92'
  });
}

function addBullets(slide, bullets, opts) {
  const { x, y, w, h, fontSize = 18 } = opts;
  const runs = bullets.map((t) => ({ text: t, options: { bullet: { indent: 18 }, hanging: 6 } }));
  slide.addText(runs, {
    x, y, w, h,
    fontFace: 'Calibri',
    fontSize,
    color: COLORS.text,
    paraSpaceAfter: fontSize * 0.6
  });
}

function main() {
  ensureFile(METRICS);
  ensureFile(ARCH_PNG);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const metrics = JSON.parse(fs.readFileSync(METRICS, 'utf8'));
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pocket Portfolio';
  pptx.company = 'Pocket Portfolio';
  pptx.subject = 'Sovereign Financial AI pitch deck';
  pptx.theme = {
    headFontFace: 'Calibri',
    bodyFontFace: 'Calibri',
    lang: 'en-US'
  };

  // Slide 1: Title
  {
    const s = pptx.addSlide();
    addHeader(s, 'Pocket Portfolio', 'Building the Global Security Layer for Financial Intelligence.');
    s.addText('Abba Lawal — immigrant founder. UK regulatory edge → global scalability (US, EU, Asia).', {
      x: 0.8, y: 2.05, w: 11.8, h: 0.45, fontFace: 'Consolas', fontSize: 14, color: COLORS.muted
    });
    s.addText('Split-Brain architecture: deterministic edge compilation + stateless frontier reasoning', {
      x: 0.8, y: 2.5, w: 11.8, h: 0.55, fontFace: 'Calibri', fontSize: 20, color: COLORS.text
    });
    // Visual blocks
    s.addShape('roundRect', { x: 0.8, y: 3.55, w: 3.9, h: 2.55, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addShape('roundRect', { x: 4.95, y: 3.55, w: 3.9, h: 2.55, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addShape('roundRect', { x: 9.1, y: 3.55, w: 3.5, h: 2.55, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addText('BROWSER', { x: 0.8, y: 3.7, w: 3.9, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('AIR GAP', { x: 4.95, y: 3.7, w: 3.9, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('LLM', { x: 9.1, y: 3.7, w: 3.5, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });

    // Fill blocks (no empty panels tolerated)
    s.addText('IndexedDB (raw ledger)\nContext Builder\nLocal CSV import', {
      x: 1.1, y: 4.25, w: 3.3, h: 1.6, fontFace: 'Consolas', fontSize: 13, color: COLORS.text, align: 'center'
    });
    s.addText('Stateless API\n/api/ai/chat\nQuota + tier gate', {
      x: 5.25, y: 4.25, w: 3.4, h: 1.0, fontFace: 'Consolas', fontSize: 13, color: COLORS.text, align: 'center'
    });
    s.addText('Sanitized context only', { x: 4.95, y: 5.35, w: 3.9, h: 0.4, fontFace: 'Calibri', fontSize: 16, color: COLORS.accent, align: 'center' });
    s.addText('Gemini (primary)\nOpenAI (fallback)\nStreaming response', {
      x: 9.35, y: 4.25, w: 3.0, h: 1.2, fontFace: 'Consolas', fontSize: 13, color: COLORS.text, align: 'center'
    });
    addFooter(s, 'Pocket Portfolio | Confidential');
  }

  // Slide 2: Problem
  {
    const s = pptx.addSlide();
    addHeader(s, 'The Villain: Sovereignty Lockout', 'A ~$100T AUM industry is locked out of the AI revolution');
    addBullets(s, [
      'Global wealth cannot adopt frontier reasoning if raw ledgers must cross borders.',
      'Data residency + retention risk turns AI features into a regulatory liability.',
      'Result: incumbents stall — and the market waits for an infrastructure breakthrough.'
    ], { x: 0.95, y: 2.25, w: 12.0, h: 4.6, fontSize: 20 });
    addFooter(s, 'Pocket Portfolio | Problem');
  }

  // Slide 3: Why Now
  {
    const s = pptx.addSlide();
    addHeader(s, 'Why Now', 'Frontier reasoning matured. Compliance tightened. The gateway market is opening.');
    addBullets(s, [
      'LLMs now deliver analyst-grade reasoning — but regulated firms cannot export raw portfolios.',
      'Mid-market WealthTech needs an “AI layer” without becoming a raw-ledger data processor.',
      'Winning pattern: minimize egress, prove boundary, keep inference stateless.'
    ], { x: 0.95, y: 2.25, w: 12.0, h: 4.6, fontSize: 20 });
    addFooter(s, 'Pocket Portfolio | Timing');
  }

  // Slide 4: Solution
  {
    const s = pptx.addSlide();
    addHeader(s, 'The Solution: Stateless AI Gateway', 'Privacy without the utility trade-off');
    // Flow boxes
    s.addShape('roundRect', { x: 0.9, y: 2.4, w: 3.95, h: 1.7, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addShape('roundRect', { x: 4.95, y: 2.4, w: 3.95, h: 1.7, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addShape('roundRect', { x: 9.0, y: 2.4, w: 3.95, h: 1.7, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addText('Edge compiler', { x: 0.9, y: 2.55, w: 3.95, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('Stateless boundary', { x: 4.95, y: 2.55, w: 3.95, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('Frontier reasoning', { x: 9.0, y: 2.55, w: 3.95, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('PII-free aggregate context', { x: 0.9, y: 3.15, w: 3.95, h: 0.4, fontFace: 'Calibri', fontSize: 16, color: COLORS.accent, align: 'center' });
    s.addText('/api/ai/chat (no payload DB)', { x: 4.95, y: 3.15, w: 3.95, h: 0.4, fontFace: 'Calibri', fontSize: 16, color: COLORS.accent, align: 'center' });
    s.addText('Gemini / OpenAI fallback', { x: 9.0, y: 3.15, w: 3.95, h: 0.4, fontFace: 'Calibri', fontSize: 16, color: COLORS.accent, align: 'center' });
    // Arrows (simple chevrons)
    s.addText('›', { x: 4.55, y: 2.75, w: 0.3, h: 0.8, fontFace: 'Consolas', fontSize: 42, color: COLORS.muted, align: 'center' });
    s.addText('›', { x: 8.6, y: 2.75, w: 0.3, h: 0.8, fontFace: 'Consolas', fontSize: 42, color: COLORS.muted, align: 'center' });
    addBullets(s, [
      'Default mode: raw ledger stays local; only aggregates cross the boundary.',
      'Server is stateless: (context, question) → streaming answer.',
      'Audit narrative is built into architecture, not bolted on.'
    ], { x: 0.95, y: 4.6, w: 12.0, h: 2.4, fontSize: 18 });
    addFooter(s, 'Pocket Portfolio | Solution');
  }

  // Slide 5: Truth slide (diagram)
  {
    const s = pptx.addSlide();
    addHeader(s, 'The Proprietary Moat: Structural Compliance', 'A UK company can serve banks globally without data residency headaches');
    // Use cropped version to fill space and maximize readability.
    s.addImage({ path: ARCH_CROP_PNG, x: 0.7, y: 2.05, w: 12.2, h: 4.95 });
    s.addText('Edge compiles PII-free aggregates locally. Stateless API streams answers — no payload database.', {
      x: 0.85, y: 6.9, w: 11.9, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted
    });
    addFooter(s, 'Pocket Portfolio | Architecture');
  }

  // Slide 6: Traction
  {
    const s = pptx.addSlide();
    addHeader(s, 'Velocity: Global Demand Signal', 'Not a local project — a global platform with a Salford HQ');
    const { ga4, gsc } = metrics;
    // Metric tiles
    const tiles = [
      { label: 'New users (28d)', value: String(ga4.newUsers) },
      { label: 'Active users (28d)', value: String(ga4.activeUsers) },
      { label: 'Sessions', value: String(ga4.sessions) },
      { label: 'ChatGPT sessions', value: String(ga4.aiNativeReferralsEvidence.chatgptSessions) }
    ];
    const startX = 0.9, startY = 2.25, tileW = 3.05, tileH = 1.2, gap = 0.2;
    tiles.forEach((t, i) => {
      const x = startX + i * (tileW + gap);
      s.addShape('roundRect', { x, y: startY, w: tileW, h: tileH, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
      s.addText(t.label, { x: x + 0.15, y: startY + 0.15, w: tileW - 0.3, h: 0.25, fontFace: 'Consolas', fontSize: 10, color: COLORS.muted });
      s.addText(t.value, { x: x + 0.15, y: startY + 0.48, w: tileW - 0.3, h: 0.55, fontFace: 'Calibri', fontSize: 30, bold: true, color: COLORS.accent });
    });
    // Sources + GSC highlights
    s.addText('Acquisition sources (sessions):', { x: 0.95, y: 3.8, w: 6.1, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted });
    const srcLines = metrics.ga4.topSessionSources.slice(0, 6).map((r) => `${r.sourceMedium}: ${r.sessions}`);
    s.addText(srcLines.join('\n'), { x: 0.95, y: 4.15, w: 6.1, h: 2.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.text });
    s.addText('Global footprint (GSC clicks):', { x: 7.25, y: 3.8, w: 5.4, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted });
    const q = gsc.selectedHighIntentQueries;
    const qLines = [
      `${q[0].query}: pos ${q[0].position} (${q[0].clicks} clicks)`,
      `${q[1].query}: pos ${q[1].position} (${q[1].clicks} clicks)`,
      `${q[2].query}: pos ${q[2].position} (${q[2].clicks} clicks)`
    ];
    const c = gsc.topCountriesByClicks;
    const cLines = [
      `Top countries: ${c[0].country} · ${c[2].country} · ${c[4].country}`,
      `Also present: ${c[3].country} · ${c[1].country}`
    ];
    s.addText(cLines.concat([''], qLines).join('\n'), { x: 7.25, y: 4.15, w: 5.4, h: 2.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.text });
    s.addText('Note: rankings are directional; positions in export are ~6–8 for Trade Republic CSV terms.', { x: 0.95, y: 6.85, w: 12.0, h: 0.3, fontFace: 'Consolas', fontSize: 10, color: '8A8A92' });
    addFooter(s, 'Pocket Portfolio | Traction');
  }

  // Slide 7: Market / ICP
  {
    const s = pptx.addSlide();
    addHeader(s, 'Market Opportunity', 'Compliance-constrained AI in WealthTech is an infrastructure wedge');
    addBullets(s, [
      'The world’s wealth industry is primed for AI — but sovereignty blocks adoption.',
      'ICP: WealthTech platforms and banks that need “AI features” without becoming a data exporter.',
      'A compliance-first gateway is the fastest path to global rollout.'
    ], { x: 0.95, y: 2.25, w: 12.0, h: 4.6, fontSize: 20 });
    addFooter(s, 'Pocket Portfolio | Market');
  }

  // Slide 8: Moat
  {
    const s = pptx.addSlide();
    addHeader(s, 'The Moat: Architecture-Based Compliance', 'Structurally incapable of leaking raw ledgers (by default)');
    addBullets(s, [
      'Sanitization by construction: edge compiler outputs aggregates only (no raw rows).',
      'Stateless boundary: no server-side portfolio DB to breach.',
      'Auditable payload minimization: network tab shows bounded context size.',
      'Optional attachments are opt-in and tier-gated (speaker note).'
    ], { x: 0.95, y: 2.25, w: 12.0, h: 4.6, fontSize: 20 });
    addFooter(s, 'Pocket Portfolio | Moat');
  }

  // Slide 9: Business model
  {
    const s = pptx.addSlide();
    addHeader(s, 'Business Model', 'B2B Enterprise API — with a B2C lab as our unfair advantage');
    s.addShape('roundRect', { x: 0.9, y: 2.35, w: 5.9, h: 2.0, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addShape('roundRect', { x: 7.0, y: 2.35, w: 5.6, h: 2.0, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addText('B2C App = Data & Testing Lab', { x: 0.9, y: 2.5, w: 5.9, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('Founders Club: GBP 12/mo', { x: 0.9, y: 3.0, w: 5.9, h: 0.5, fontFace: 'Calibri', fontSize: 26, bold: true, color: COLORS.accent, align: 'center' });
    s.addText('Refines sanitization algorithms with real-world edge cases', { x: 1.15, y: 3.55, w: 5.4, h: 0.6, fontFace: 'Calibri', fontSize: 16, color: COLORS.text, align: 'center' });
    s.addText('B2B Enterprise API', { x: 7.0, y: 2.5, w: 5.6, h: 0.3, fontFace: 'Consolas', fontSize: 12, color: COLORS.muted, align: 'center' });
    s.addText('Usage-based gateway', { x: 7.0, y: 3.0, w: 5.6, h: 0.4, fontFace: 'Calibri', fontSize: 24, bold: true, color: COLORS.accent, align: 'center' });
    s.addText('Stateless Financial AI API for banks + WealthTech', { x: 7.2, y: 3.5, w: 5.2, h: 0.6, fontFace: 'Calibri', fontSize: 16, color: COLORS.text, align: 'center' });
    s.addText('Monetization engine live; first conversion secured; 4,700+ users in the high-intent pipeline.', { x: 0.95, y: 4.75, w: 12.0, h: 0.4, fontFace: 'Consolas', fontSize: 14, color: COLORS.muted });
    s.addText('Revenue reporting: track separately from GA exports (GA snapshot total revenue = 0).', { x: 0.95, y: 5.15, w: 12.0, h: 0.3, fontFace: 'Consolas', fontSize: 10, color: '8A8A92' });
    addFooter(s, 'Pocket Portfolio | Business Model');
  }

  // Slide 10: Team + Ask
  {
    const s = pptx.addSlide();
    addHeader(s, 'Team + Ask', 'Partner with Tech Nation’s iconic founders to scale globally');
    addBullets(s, [
      'Abba Lawal — immigrant founder building the global security layer for financial intelligence.',
      'Ask: introductions to iconic immigrant founders + early design partners in banks / WealthTech.',
      'Goal: scale Pocket Portfolio into the global standard for Stateless Financial AI.'
    ], { x: 0.95, y: 2.25, w: 12.0, h: 4.6, fontSize: 20 });
    s.addShape('roundRect', { x: 0.95, y: 5.95, w: 11.7, h: 1.0, fill: { color: COLORS.surface }, line: { color: COLORS.border } });
    s.addText('Next 90 days: 1) Convert global demand into B2B pilots  2) Ship “audit-ready boundary pack”  3) Expand provider partnerships', {
      x: 1.1, y: 6.2, w: 11.4, h: 0.6, fontFace: 'Consolas', fontSize: 12, color: COLORS.text
    });
    addFooter(s, 'Pocket Portfolio | Ask');
  }

  pptx.writeFile({ fileName: OUT });
  console.log(`WROTE ${OUT}`);
}

await ensureBrandAssets();
main();

