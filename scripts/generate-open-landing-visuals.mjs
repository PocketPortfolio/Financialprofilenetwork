#!/usr/bin/env node
/**
 * Open Portfolio landing — editorial art boards (SVG → 4K PNG).
 * Split layout: copy left, illustration right — never text inside wireframes.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgDir = path.join(root, 'public/open/landing/svg');
const pngDir = path.join(root, 'public/open/landing');

const PNG_WIDTH = 3840;
const W = 1920;

const AMBER = '#f59e0b';
const AMBER_LIGHT = '#fbbf24';
const AMBER_DIM = '#d97706';
const WHITE = '#f8fafc';
/** Secondary copy on dark boards — brighter than slate-300 for 4K downscale legibility */
const TEXT_BODY = '#e2e8f0';
const WHITE_SOFT = TEXT_BODY;
const BG = '#06080b';
const SURFACE = '#121820';
const SURFACE_LIT = '#1a2430';
const EDGE = '#2d3a4a';

const SAFE = { top: 72, bottom: 120, left: 72, right: 72 };

function aspectHeight(w, rw, rh) {
  return Math.round((w * rh) / rw);
}

function safeBox(w, h) {
  return {
    x: SAFE.left,
    y: SAFE.top,
    width: w - SAFE.left - SAFE.right,
    height: h - SAFE.top - SAFE.bottom,
    cx: w / 2,
    cy: h / 2,
    w,
    h,
  };
}

function defs() {
  return `
  <defs>
    <linearGradient id="bgMesh" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e1218"/>
      <stop offset="50%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="#030508"/>
    </linearGradient>
    <radialGradient id="spotR" cx="78%" cy="42%" r="50%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="${AMBER}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spotL" cx="18%" cy="55%" r="45%">
      <stop offset="0%" stop-color="#3b4a5c" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${SURFACE_LIT}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${SURFACE}" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="shieldFill" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="${SURFACE_LIT}"/>
      <stop offset="40%" stop-color="#151c26"/>
      <stop offset="100%" stop-color="#0a0e14"/>
    </linearGradient>
    <linearGradient id="amberSheen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${AMBER_DIM}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${AMBER_LIGHT}"/>
      <stop offset="100%" stop-color="${AMBER_DIM}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="18" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softShadow" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.65"/>
    </filter>
    <filter id="txt" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="1"/>
    </filter>
    <symbol id="sym-ingest" viewBox="0 0 128 128">
      <rect x="20" y="36" width="88" height="56" rx="12" fill="${SURFACE}" stroke="${AMBER}" stroke-width="4"/>
      <path d="M 40 62 L 58 78 L 92 48" fill="none" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/>
      <path d="M 64 22 L 64 36 M 50 22 L 78 22" stroke="${AMBER_LIGHT}" stroke-width="4" stroke-linecap="round"/>
    </symbol>
    <symbol id="sym-infer" viewBox="0 0 128 128">
      <rect x="24" y="24" width="80" height="80" rx="18" fill="${SURFACE}" stroke="${AMBER}" stroke-width="4"/>
      <path d="M 64 44 C 78 44 88 54 88 64 C 88 78 78 88 64 88 C 50 88 40 78 40 64 C 40 54 50 44 64 44 Z" fill="none" stroke="${WHITE}" stroke-width="3"/>
      <circle cx="64" cy="64" r="8" fill="${AMBER}"/>
      <path d="M 64 52 L 64 76 M 52 64 L 76 64" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    </symbol>
    <symbol id="sym-audit" viewBox="0 0 128 128">
      <path d="M 64 16 L 104 36 V 68 Q 104 100 64 112 Q 24 100 24 68 V 36 Z" fill="${SURFACE}" stroke="${AMBER}" stroke-width="4"/>
      <path d="M 46 64 L 58 78 L 86 50" fill="none" stroke="${WHITE}" stroke-width="5" stroke-linecap="round"/>
    </symbol>
  </defs>`;
}

function kickerBar(text, w, h) {
  const y = h - 44;
  return `
  <rect x="${SAFE.left}" y="${h - SAFE.bottom + 8}" width="${w - SAFE.left - SAFE.right}" height="1" fill="${EDGE}" opacity="0.6"/>
  <rect x="${SAFE.left}" y="${y - 36}" width="${Math.min(520, Math.round(w * 0.35))}" height="3" rx="1.5" fill="${AMBER}"/>
  <text x="${SAFE.left}" y="${y}" fill="${WHITE_SOFT}" font-family="Segoe UI,system-ui,sans-serif" font-size="28" font-weight="700" letter-spacing="0.12em">${text}</text>`;
}

function wrapBoard({ w, h, kicker, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${defs()}
  <rect width="${w}" height="${h}" fill="url(#bgMesh)"/>
  <rect width="${w}" height="${h}" fill="url(#spotL)"/>
  <rect width="${w}" height="${h}" fill="url(#spotR)"/>
  ${body}
  ${kickerBar(kicker, w, h)}
</svg>`;
}

/** Left editorial column — all marketing copy lives here */
function copyColumn(s, { eyebrow, title, subtitle, bullets = [] }) {
  const x = s.x + 8;
  let y = s.y + 16;
  const titleLines = title.split('\n');
  let out = `
  <rect x="${x}" y="${y}" width="4" height="48" rx="2" fill="${AMBER}"/>
  <text x="${x + 20}" y="${y + 36}" fill="${AMBER_LIGHT}" font-family="Segoe UI,system-ui,sans-serif" font-size="22" font-weight="700" letter-spacing="0.14em" filter="url(#txt)">${eyebrow}</text>`;
  y += 72;
  titleLines.forEach((line, i) => {
    const fs = i === 0 ? 58 : 52;
    out += `
  <text x="${x}" y="${y + fs}" fill="${WHITE}" font-family="Segoe UI,system-ui,sans-serif" font-size="${fs}" font-weight="800" letter-spacing="-0.02em" filter="url(#txt)">${line}</text>`;
    y += fs + 8;
  });
  y += 16;
  if (subtitle) {
    const subs = subtitle.split('\n');
    subs.forEach((line) => {
      out += `
  <text x="${x}" y="${y + 30}" fill="${WHITE_SOFT}" font-family="Segoe UI,system-ui,sans-serif" font-size="30" font-weight="600" filter="url(#txt)">${line}</text>`;
      y += 42;
    });
  }
  y += 12;
  bullets.forEach((b, i) => {
    const by = y + i * 52;
    out += `
  <rect x="${x}" y="${by}" width="${s.width * 0.38}" height="44" rx="22" fill="${SURFACE}" stroke="${EDGE}" stroke-width="1"/>
  <circle cx="${x + 22}" cy="${by + 22}" r="6" fill="${AMBER}"/>
  <text x="${x + 40}" y="${by + 30}" fill="${WHITE}" font-family="Segoe UI,system-ui,sans-serif" font-size="24" font-weight="600">${b}</text>`;
  });
  return out;
}

function artZone(s) {
  const split = 0.48;
  return {
    x: s.x + s.width * split,
    y: s.y,
    w: s.width * (1 - split) - 8,
    h: s.height,
    cx: s.x + s.width * split + (s.width * (1 - split)) / 2,
    cy: s.y + s.height / 2,
  };
}

function useSym(id, cx, cy, size) {
  const h = size / 2;
  return `<use href="#${id}" x="${cx - h}" y="${cy - h}" width="${size}" height="${size}"/>`;
}

function boardScene(kicker, hRatio, build) {
  const h = aspectHeight(W, 16, hRatio === 'wide' ? 10 : hRatio === 'tall' ? 12 : 10);
  const s = safeBox(W, h);
  return wrapBoard({
    w: W,
    h,
    kicker,
    body: build(s, artZone(s)),
  });
}

const SCENES = {
  'hero-sovereign-layer': boardScene('OPEN PORTFOLIO · REGULATED ENVIRONMENTS', 'normal', (s, a) => `
  ${copyColumn(s, {
    eyebrow: 'WEALTH TECH PROVEN · VERTICALS NEXT',
    title: 'Privacy layer\nfor deploying AI',
    subtitle: 'Built where finance shipped first.\nBuilt out for every regulated perimeter.',
    bullets: ['On-device broker data', 'Session-forgetful inference'],
  })}
  <g transform="translate(${a.x}, ${a.y})" filter="url(#softShadow)">
    <path d="M ${a.w * 0.5} ${a.h * 0.08} L ${a.w * 0.78} ${a.h * 0.22} L ${a.w * 0.78} ${a.h * 0.58} Q ${a.w * 0.78} ${a.h * 0.88} ${a.w * 0.5} ${a.h * 0.96} Q ${a.w * 0.22} ${a.h * 0.88} ${a.w * 0.22} ${a.h * 0.58} L ${a.w * 0.22} ${a.h * 0.22} Z" fill="url(#shieldFill)" stroke="${AMBER}" stroke-width="6" filter="url(#glow)"/>
    <path d="M ${a.w * 0.5} ${a.h * 0.18} L ${a.w * 0.68} ${a.h * 0.28} L ${a.w * 0.68} ${a.h * 0.55} Q ${a.w * 0.68} ${a.h * 0.78} ${a.w * 0.5} ${a.h * 0.86} Q ${a.w * 0.32} ${a.h * 0.78} ${a.w * 0.32} ${a.h * 0.55} L ${a.w * 0.32} ${a.h * 0.28} Z" fill="none" stroke="${AMBER_LIGHT}" stroke-width="2" opacity="0.45"/>
    <circle cx="${a.w * 0.5}" cy="${a.h * 0.48}" r="${a.w * 0.12}" fill="${AMBER}" opacity="0.12"/>
    <circle cx="${a.w * 0.5}" cy="${a.h * 0.48}" r="${a.w * 0.06}" fill="${AMBER}" opacity="0.35"/>
    ${[0.32, 0.42, 0.58, 0.68].map((px, i) => {
      const py = 0.35 + (i % 2) * 0.25;
      return `<circle cx="${a.w * px}" cy="${a.h * py}" r="5" fill="${AMBER_LIGHT}" opacity="0.7"/>`;
    }).join('')}
    <rect x="${a.w * 0.12}" y="${a.h * 0.72}" width="${a.w * 0.76}" height="4" fill="url(#amberSheen)" rx="2"/>
  </g>`),

  'privacy-architecture': boardScene('NO WAREHOUSE · NO MEMORY PALACE', 'normal', (s, a) => `
  ${copyColumn(s, {
    eyebrow: 'TRUST BY DESIGN',
    title: 'Architecture-\nbound privacy',
    subtitle: 'Inference without\na memory palace',
    bullets: ['No chat archive', 'No embedding store', 'Session-forgetful AI'],
  })}
  <g transform="translate(${a.x}, ${a.y + 20})" filter="url(#softShadow)">
    <rect x="${a.w * 0.15}" y="${a.h * 0.12}" width="${a.w * 0.7}" height="${a.h * 0.76}" rx="28" fill="url(#glass)" stroke="${EDGE}" stroke-width="2"/>
    <rect x="${a.w * 0.22}" y="${a.h * 0.2}" width="${a.w * 0.56}" height="${a.h * 0.55}" rx="20" fill="${BG}" stroke="${AMBER}" stroke-width="4"/>
    <text x="${a.w * 0.5}" y="${a.h * 0.26}" text-anchor="middle" fill="${TEXT_BODY}" font-size="20" font-weight="700" letter-spacing="0.12em" font-family="system-ui,sans-serif" filter="url(#txt)">ON-DEVICE</text>
    <rect x="${a.w * 0.38}" y="${a.h * 0.38}" width="${a.w * 0.24}" height="${a.h * 0.28}" rx="12" fill="${SURFACE_LIT}" stroke="${AMBER}" stroke-width="3"/>
    <circle cx="${a.w * 0.5}" cy="${a.h * 0.52}" r="28" fill="${AMBER}" opacity="0.9"/>
    <path d="M ${a.w * 0.5 - 12} ${a.h * 0.52 + 4} L ${a.w * 0.5 - 2} ${a.h * 0.52 + 16} L ${a.w * 0.5 + 14} ${a.h * 0.52 - 10}" fill="none" stroke="${BG}" stroke-width="4" stroke-linecap="round"/>
    <rect x="${a.w * 0.68}" y="${a.h * 0.14}" width="${a.w * 0.2}" height="${a.h * 0.2}" rx="14" fill="${SURFACE}" stroke="${EDGE}" stroke-width="2" stroke-dasharray="10 8"/>
    <text x="${a.w * 0.78}" y="${a.h * 0.24}" text-anchor="middle" fill="${TEXT_BODY}" font-size="22" font-weight="700" letter-spacing="0.1em" font-family="system-ui,sans-serif" filter="url(#txt)">CLOUD</text>
    <text x="${a.w * 0.78}" y="${a.h * 0.29}" text-anchor="middle" fill="${WHITE}" font-size="16" font-weight="600" font-family="system-ui,sans-serif" filter="url(#txt)">Out of perimeter</text>
    <line x1="${a.w * 0.7}" y1="${a.h * 0.14}" x2="${a.w * 0.86}" y2="${a.h * 0.34}" stroke="${AMBER}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <line x1="${a.w * 0.7}" y1="${a.h * 0.34}" x2="${a.w * 0.86}" y2="${a.h * 0.14}" stroke="${AMBER}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
  </g>`),

  'regulatory-stakes': (() => {
    const h = aspectHeight(W, 21, 9);
    const s = safeBox(W, h);
    const a = artZone(s);
    return wrapBoard({
      w: W,
      h,
      kicker: 'REGULATORY EXPOSURE IS A LINE ITEM NOW',
      body: `
  ${copyColumn(s, {
    eyebrow: 'BOARD RISK',
    title: 'The bill for\nwarehousing PII',
    subtitle: 'GDPR · EU AI Act\nBreach exposure',
    bullets: ['€20M+ supervisory ceiling', 'Reputational drag on top'],
  })}
  <g transform="translate(${a.x + 20}, ${s.y + 10})" filter="url(#softShadow)">
    <rect x="0" y="40" width="200" height="280" rx="14" fill="${SURFACE}" opacity="0.6" transform="rotate(-8 100 180)"/>
    <rect x="${a.w - 220}" y="50" width="200" height="270" rx="14" fill="${SURFACE}" opacity="0.6" transform="rotate(7 ${a.w - 120} 185)"/>
    <rect x="${a.w * 0.12}" y="0" width="${a.w * 0.76}" height="${s.height - 20}" rx="24" fill="url(#glass)" stroke="${AMBER}" stroke-width="5"/>
    <text x="${a.w * 0.5}" y="72" text-anchor="middle" fill="${WHITE}" font-size="24" font-weight="700" letter-spacing="0.1em" font-family="system-ui,sans-serif">EXPOSURE STACK</text>
    <text x="${a.w * 0.5}" y="${s.height * 0.42}" text-anchor="middle" fill="${AMBER}" font-size="108" font-weight="900" font-family="system-ui,sans-serif" filter="url(#glow)">€20M+</text>
    <text x="${a.w * 0.5}" y="${s.height * 0.55}" text-anchor="middle" fill="${WHITE_SOFT}" font-size="26" font-weight="600" font-family="system-ui,sans-serif">Typical supervisory ceiling</text>
  </g>`,
    });
  })(),

  'live-proof-bridge': boardScene('OPEN PORTFOLIO · PROVEN IN PRODUCTION', 'normal', (s, a) => `
  ${copyColumn(s, {
    eyebrow: 'LIVE PROOF',
    title: 'Validated where\nmarkets break first',
    subtitle: 'Production stress-tests\nthe enterprise substrate',
    bullets: ['Messy broker CSVs', 'Hardened before your audit'],
  })}
  <g transform="translate(${a.x}, ${a.y + 30})">
    <path d="M 20 ${a.h * 0.55} Q ${a.w * 0.5} ${a.h * 0.2} ${a.w - 20} ${a.h * 0.55}" fill="none" stroke="${AMBER}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    <rect x="0" y="${a.h * 0.35}" width="${a.w * 0.42}" height="${a.h * 0.5}" rx="20" fill="url(#glass)" stroke="${EDGE}" filter="url(#softShadow)"/>
    <text x="${a.w * 0.21}" y="${a.h * 0.48}" text-anchor="middle" fill="${AMBER_LIGHT}" font-size="20" font-weight="800" letter-spacing="0.1em">FIELD</text>
    <text x="${a.w * 0.21}" y="${a.h * 0.58}" text-anchor="middle" fill="${WHITE}" font-size="28" font-weight="700">Real edge cases</text>
    <rect x="${a.w * 0.52}" y="${a.h * 0.28}" width="${a.w * 0.44}" height="${a.h * 0.58}" rx="20" fill="url(#glass)" stroke="${AMBER}" stroke-width="4" filter="url(#softShadow)"/>
    <text x="${a.w * 0.74}" y="${a.h * 0.45}" text-anchor="middle" fill="${AMBER_LIGHT}" font-size="20" font-weight="800" letter-spacing="0.1em">ENTERPRISE</text>
    <text x="${a.w * 0.74}" y="${a.h * 0.55}" text-anchor="middle" fill="${WHITE}" font-size="28" font-weight="700">Hardened core</text>
  </g>`),

  'substrate-pillars': (() => {
    const h = aspectHeight(W, 4, 3);
    const s = safeBox(W, h);
    const cardW = (s.width - 64) / 3;
    const gap = 32;
    const top = s.y + 100;
    const cardH = s.height - 120;
    const icons = ['sym-ingest', 'sym-infer', 'sym-audit'];
    const labels = ['INGESTION', 'INFERENCE', 'AUDIT'];
    const subs = ['Broker data parsed locally', 'AI without persistent memory', 'Smaller compliance perimeter'];
    return wrapBoard({
      w: W,
      h,
      kicker: 'THREE BOARD-LEVEL GUARANTEES',
      body: `
  <text x="${s.x}" y="${s.y + 48}" fill="${WHITE}" font-size="40" font-weight="800" font-family="system-ui,sans-serif" filter="url(#txt)">One substrate · Three promises</text>
  <text x="${s.x}" y="${s.y + 96}" fill="${TEXT_BODY}" font-size="30" font-weight="600" font-family="system-ui,sans-serif" filter="url(#txt)">Clear for legal · Precise for engineering</text>
  ${labels
    .map((label, i) => {
      const x = s.x + i * (cardW + gap);
      const cx = x + cardW / 2;
      const iconY = top + cardH * 0.32;
      const textY = top + cardH * 0.62;
      return `
  <g filter="url(#softShadow)">
    <rect x="${x}" y="${top}" width="${cardW}" height="${cardH}" rx="24" fill="url(#glass)" stroke="${EDGE}" stroke-width="1"/>
    <rect x="${x + 16}" y="${top + 16}" width="${cardW - 32}" height="${cardH * 0.42}" rx="16" fill="${BG}" fill-opacity="0.6"/>
    ${useSym(icons[i], cx, iconY, 128)}
    <text x="${cx}" y="${textY}" text-anchor="middle" fill="${WHITE}" font-size="34" font-weight="800" letter-spacing="0.06em" font-family="system-ui,sans-serif" filter="url(#txt)">${label}</text>
    <text x="${cx}" y="${textY + 48}" text-anchor="middle" fill="${TEXT_BODY}" font-size="26" font-weight="600" font-family="system-ui,sans-serif" filter="url(#txt)">${subs[i]}</text>
    <rect x="${x + 40}" y="${top + cardH - 36}" width="${cardW - 80}" height="8" rx="4" fill="${AMBER}"/>
  </g>`;
    })
    .join('')}`,
    });
  })(),

  'partner-tracks': boardScene('FOUR ENTRANCES · ONE SUBSTRATE', 'normal', (s, a) => `
  ${copyColumn(s, {
    eyebrow: 'PARTNER PATHS',
    title: 'Choose the track\nthat fits your mandate',
    subtitle: '',
    bullets: ['Engineers', 'Institutions', 'Investors', 'Grant teams'],
  })}
  <g transform="translate(${a.x}, ${a.y})">
    <circle cx="${a.w * 0.5}" cy="${a.h * 0.52}" r="48" fill="${AMBER}" filter="url(#glow)"/>
    <text x="${a.w * 0.5}" y="${a.h * 0.52 + 8}" text-anchor="middle" fill="${BG}" font-size="18" font-weight="900">CORE</text>
    ${[
      [0.5, 0.12],
      [0.18, 0.38],
      [0.82, 0.38],
      [0.5, 0.88],
    ].map(([px, py], i) => {
      const labels = ['Institutions', 'Engineers', 'Investors', 'Grants'];
      const cx = a.w * px;
      const cy = a.h * py;
      return `
    <line x1="${a.w * 0.5}" y1="${a.h * 0.52}" x2="${cx}" y2="${cy}" stroke="${AMBER}" stroke-width="3" opacity="0.4"/>
    <rect x="${cx - 72}" y="${cy - 36}" width="144" height="72" rx="36" fill="url(#glass)" stroke="${AMBER}" stroke-width="3"/>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="${WHITE}" font-size="22" font-weight="700" font-family="system-ui,sans-serif">${labels[i]}</text>`;
    })
    .join('')}
  </g>`),

  'open-packages': boardScene('OPEN CORE · CONTROLLED PERIMETER', 'normal', (s, a) => `
  ${copyColumn(s, {
    eyebrow: 'OPEN CORE',
    title: 'Composable\npackages',
    subtitle: 'MIT-licensed ingestion\nSovereign perimeter',
    bullets: ['Adapter layer', 'Stateless AI API', 'Metering · PPI'],
  })}
  <g transform="translate(${a.x + 10}, ${a.y + 40})" filter="url(#softShadow)">
    <polygon points="${a.w * 0.5},${a.h * 0.15} ${a.w * 0.72},${a.h * 0.32} ${a.w * 0.72},${a.h * 0.58} ${a.w * 0.5},${a.h * 0.75} ${a.w * 0.28},${a.h * 0.58} ${a.w * 0.28},${a.h * 0.32}" fill="${SURFACE}" stroke="${AMBER}" stroke-width="5"/>
    <text x="${a.w * 0.5}" y="${a.h * 0.4}" text-anchor="middle" fill="${WHITE}" font-size="28" font-weight="800" filter="url(#txt)">CORE</text>
    <text x="${a.w * 0.5}" y="${a.h * 0.52}" text-anchor="middle" fill="${TEXT_BODY}" font-size="22" font-weight="600" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" filter="url(#txt)">@pocket-portfolio/importer</text>
    ${[
      ['Adapters', 0.5, 0.05],
      ['AI API', 0.88, 0.4],
      ['Metering', 0.5, 0.92],
      ['Formats', 0.12, 0.4],
    ].map(([lbl, px, py]) => `
    <rect x="${a.w * px - 64}" y="${a.h * py - 28}" width="128" height="56" rx="28" fill="url(#glass)" stroke="${EDGE}"/>
    <text x="${a.w * px}" y="${a.h * py + 8}" text-anchor="middle" fill="${WHITE}" font-size="22" font-weight="700" font-family="system-ui,sans-serif" filter="url(#txt)">${lbl}</text>`).join('')}
  </g>`),

  'briefing-room': boardScene('REQUEST AN EXECUTIVE BRIEFING', 'normal', (s, a) => `
  ${copyColumn(s, {
    eyebrow: 'EXECUTIVE BRIEFING',
    title: 'Clean-room\nconversation',
    subtitle: 'Procurement · Legal\nEngineering · Policy',
    bullets: ['30-minute audit mapping', 'Clear next steps'],
  })}
  <g transform="translate(${a.x}, ${a.y + 16})" filter="url(#softShadow)">
    <rect x="0" y="0" width="${a.w}" height="${a.h}" rx="28" fill="url(#glass)" stroke="${AMBER}" stroke-width="4"/>
    <ellipse cx="${a.w * 0.3}" cy="${a.h * 0.25}" rx="120" ry="80" fill="${AMBER}" opacity="0.1"/>
    <ellipse cx="${a.w * 0.75}" cy="${a.h * 0.7}" rx="140" ry="90" fill="${AMBER}" opacity="0.12"/>
    <rect x="32" y="40" width="${a.w - 64}" height="12" rx="6" fill="url(#amberSheen)"/>
    <rect x="32" y="68" width="280" height="8" rx="4" fill="${EDGE}"/>
    <rect x="32" y="${a.h * 0.45}" width="${a.w - 64}" height="1" fill="${EDGE}" opacity="0.5"/>
    <circle cx="${a.w * 0.35}" cy="${a.h * 0.62}" r="36" fill="${SURFACE_LIT}" stroke="${AMBER}" stroke-width="3"/>
    <circle cx="${a.w * 0.65}" cy="${a.h * 0.62}" r="36" fill="${SURFACE_LIT}" stroke="${AMBER}" stroke-width="3"/>
    <rect x="${a.w * 0.42}" y="${a.h * 0.78}" width="${a.w * 0.16}" height="8" rx="4" fill="${AMBER}" opacity="0.6"/>
  </g>`),
};

fs.mkdirSync(svgDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });

for (const [name, svg] of Object.entries(SCENES)) {
  const svgPath = path.join(svgDir, `${name}.svg`);
  const pngPath = path.join(pngDir, `${name}.png`);
  fs.writeFileSync(svgPath, svg);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: PNG_WIDTH } });
  const png = resvg.render();
  fs.writeFileSync(pngPath, png.asPng());
  console.log(`Written ${name}.svg + ${name}.png (${png.width}x${png.height})`);
}
