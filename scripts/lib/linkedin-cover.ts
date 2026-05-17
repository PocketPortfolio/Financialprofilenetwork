/**
 * LinkedIn article / link preview style cover — 1200×627 (Open Graph / LinkedIn).
 * Composites UK BBS press photo + Figure 2 hybrid architecture + headline overlay.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const W = 1200;
const H = 627;

function resvgFontFiles(): string[] {
  const candidates = [
    path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'arial.ttf'),
    path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'calibri.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  return candidates.filter((p) => fs.existsSync(p));
}

function svgToPngExact(svg: string | Buffer): Buffer {
  const fontFiles = resvgFontFiles();
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
      ...(fontFiles.length ? { fontFiles } : {}),
    },
  });
  return Buffer.from(resvg.render().asPng());
}

function bufferToDataUrl(buf: Buffer, mime: 'image/jpeg' | 'image/png'): string {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function resolveUkBbsPortraitPath(root: string): string | null {
  const base = path.join(root, 'public', 'press', 'abba');
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

function loadArchitecturePngForCover(root: string): Buffer {
  const archSvgPath = path.join(
    root,
    'public',
    'book-assets',
    'figures',
    'si-figure-02-hybrid-architecture.svg'
  );
  let raw = fs.readFileSync(archSvgPath, 'utf8');
  raw = raw.replace(/font-family="[^"]*"/g, 'font-family="Arial, Helvetica, sans-serif"');
  const fontFiles = resvgFontFiles();
  const resvg = new Resvg(Buffer.from(raw, 'utf8'), {
    fitTo: { mode: 'width', value: 640 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
      ...(fontFiles.length ? { fontFiles } : {}),
    },
  });
  return Buffer.from(resvg.render().asPng());
}

function loadMonogramPng(root: string): Buffer {
  const logoSvg = path.join(root, 'public', 'brand', 'pp-monogram-email.svg');
  const raw = fs.readFileSync(logoSvg, 'utf8');
  const themed = raw
    .replace(/fill="#0d2818"/g, 'fill="#000000"')
    .replace(/fill="#ffffff"/g, 'fill="#ffffff"')
    .replace(/<rect width="256"/, '<rect width="256" stroke="#00AA44" stroke-width="3"');
  const fontFiles = resvgFontFiles();
  const resvg = new Resvg(Buffer.from(themed, 'utf8'), {
    fitTo: { mode: 'width', value: 56 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
      ...(fontFiles.length ? { fontFiles } : {}),
    },
  });
  return Buffer.from(resvg.render().asPng());
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export type LinkedinCoverPreset =
  /** CT1: gradient receipt + Figure 2 + diversity/sovereign headline band */
  | 'ct1-receipt-architecture'
  /** CT2 “V5”: sovereign green radial glow, mono panel, split layout, insight/infrastructure ribbon */
  | 'ct2-sovereign-v5';

export interface GenerateLinkedinCoverOptions {
  root: string;
  /** Absolute path for output PNG */
  outPath: string;
  preset?: LinkedinCoverPreset;
}

function loadPhotoDataUrl(root: string): { photoUrl: string } {
  const portraitPath = resolveUkBbsPortraitPath(root);
  let photoMime: 'image/jpeg' | 'image/png' = 'image/jpeg';
  let photoBuf: Buffer;
  if (portraitPath) {
    photoBuf = fs.readFileSync(portraitPath);
    photoMime = path.extname(portraitPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  } else {
    const placeholder = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="480" viewBox="0 0 520 480">
  <rect width="520" height="480" fill="#111827"/>
  <text x="260" y="240" text-anchor="middle" fill="#9CA3AF" font-family="Arial" font-size="14">Add UK Black Business Show photo under public/press/abba/</text>
</svg>`;
    photoBuf = svgToPngExact(placeholder);
    photoMime = 'image/png';
  }
  return { photoUrl: bufferToDataUrl(photoBuf, photoMime) };
}

function compositeCt1(photoUrl: string, archUrl: string, logoUrl: string): string {
  const title = 'From Diversity of Thought to Sovereign Engineering';
  const subtitle = 'Unlocking the Agentic Economy | 2024–2026 Evolution.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#0a1f0a"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="15%" r="55%">
      <stop offset="0%" stop-color="#00AA44" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="photoClip">
      <rect x="36" y="56" width="520" height="420" rx="14"/>
    </clipPath>
    <clipPath id="archClip">
      <rect x="580" y="72" width="584" height="404" rx="14"/>
    </clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <image xlink:href="${photoUrl}" href="${photoUrl}" x="-20" y="40" width="640" height="480" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>
  <rect x="36" y="56" width="520" height="420" rx="14" fill="none" stroke="#00AA44" stroke-width="2" opacity="0.9"/>
  <rect x="560" y="56" width="620" height="480" rx="18" fill="rgba(15,23,42,0.55)" stroke="rgba(0,255,65,0.35)" stroke-width="1"/>
  <rect x="576" y="68" width="592" height="412" rx="12" fill="#f8fafc"/>
  <image xlink:href="${archUrl}" href="${archUrl}" x="580" y="72" width="584" height="404" preserveAspectRatio="xMidYMid meet" clip-path="url(#archClip)"/>
  <rect x="580" y="72" width="584" height="404" rx="14" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.85"/>
  <rect x="0" y="458" width="${W}" height="169" fill="#000000" opacity="0.62"/>
  <text x="600" y="508" text-anchor="middle" font-family="Inter, Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#F8FAFC">${xmlEscape(title)}</text>
  <text x="600" y="546" text-anchor="middle" font-family="Inter, Arial, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#F59E0B">${xmlEscape(subtitle)}</text>
  <image xlink:href="${logoUrl}" href="${logoUrl}" x="36" y="566" width="40" height="40"/>
  <text x="86" y="592" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#9CA3AF">Pocket Portfolio · Salford HQ</text>
</svg>`;
}

function compositeCt2SovereignV5(photoUrl: string, archUrl: string, logoUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="v5Glow" cx="52%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#00FF41" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="monoPanel" x="-5%" y="-5%" width="110%" height="110%">
      <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"/>
    </filter>
    <clipPath id="photoClipV5">
      <rect x="28" y="48" width="460" height="440" rx="12"/>
    </clipPath>
    <clipPath id="archClipV5">
      <rect x="720" y="72" width="452" height="404" rx="14"/>
    </clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#000000"/>
  <rect width="${W}" height="${H}" fill="url(#v5Glow)"/>
  <g filter="url(#monoPanel)">
    <image xlink:href="${photoUrl}" href="${photoUrl}" x="-24" y="36" width="560" height="480" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClipV5)"/>
  </g>
  <rect x="28" y="48" width="460" height="440" rx="12" fill="none" stroke="#00FF41" stroke-width="1.5" opacity="0.9"/>
  <rect x="498" y="132" width="204" height="212" rx="12" fill="rgba(0,0,0,0.78)" stroke="#00FF41" stroke-width="1" opacity="0.95"/>
  <text x="600" y="178" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#F8FAFC">2024: THE INSIGHT</text>
  <text x="600" y="228" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#00FF41">↔</text>
  <text x="600" y="278" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#F8FAFC">2026: THE INFRASTRUCTURE</text>
  <text x="600" y="318" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">Hybrid architecture (Fig. 2) · Sovereign stack</text>
  <rect x="712" y="68" width="460" height="412" rx="14" fill="#f8fafc"/>
  <image xlink:href="${archUrl}" href="${archUrl}" x="720" y="72" width="452" height="404" preserveAspectRatio="xMidYMid meet" clip-path="url(#archClipV5)"/>
  <rect x="720" y="72" width="452" height="404" rx="14" fill="none" stroke="#0a1f0a" stroke-width="1" opacity="0.35"/>
  <rect x="0" y="458" width="${W}" height="169" fill="#000000" opacity="0.72"/>
  <image xlink:href="${logoUrl}" href="${logoUrl}" x="36" y="566" width="40" height="40"/>
  <text x="86" y="592" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#9CA3AF">Pocket Portfolio · Salford HQ</text>
</svg>`;
}

/**
 * Renders 1200×627 cover. Inter is requested in brief; Resvg uses Arial (see font stack) for deterministic output.
 */
export function generateLinkedinCoverPng(opts: GenerateLinkedinCoverOptions): void {
  const { root, outPath, preset = 'ct1-receipt-architecture' } = opts;
  const { photoUrl } = loadPhotoDataUrl(root);
  const archBuf = loadArchitecturePngForCover(root);
  const archUrl = bufferToDataUrl(archBuf, 'image/png');
  const logoBuf = loadMonogramPng(root);
  const logoUrl = bufferToDataUrl(logoBuf, 'image/png');

  const composite =
    preset === 'ct2-sovereign-v5'
      ? compositeCt2SovereignV5(photoUrl, archUrl, logoUrl)
      : compositeCt1(photoUrl, archUrl, logoUrl);

  const png = svgToPngExact(composite);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
}
