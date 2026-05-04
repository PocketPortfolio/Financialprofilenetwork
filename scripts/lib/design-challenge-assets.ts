/**
 * PNG marketing assets for the Design Partnership Challenge (Resvg).
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

function resvgFontFiles(): string[] {
  const candidates = [
    path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'arial.ttf'),
    path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'calibri.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  return candidates.filter((p) => fs.existsSync(p));
}

function renderSvgToPng(svg: string, fitWidth: number): Buffer {
  const fontFiles = resvgFontFiles();
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: fitWidth },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
      ...(fontFiles.length ? { fontFiles } : {}),
    },
  });
  return Buffer.from(resvg.render().asPng());
}

function bufferToDataUrl(buf: Buffer, mime: 'image/png'): string {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rasterFigure2(root: string, targetWidth: number): string {
  const archSvgPath = path.join(
    root,
    'public',
    'book-assets',
    'figures',
    'si-figure-02-hybrid-architecture.svg'
  );
  let raw = fs.readFileSync(archSvgPath, 'utf8');
  raw = raw.replace(/font-family="[^"]*"/g, 'font-family="Arial, Helvetica, sans-serif"');
  const buf = renderSvgToPng(raw, targetWidth);
  return bufferToDataUrl(buf, 'image/png');
}

function loadMonogramDataUrl(root: string): string {
  const logoSvg = path.join(root, 'public', 'brand', 'pp-monogram-email.svg');
  const raw = fs.readFileSync(logoSvg, 'utf8');
  const themed = raw
    .replace(/fill="#0d2818"/g, 'fill="#000000"')
    .replace(/fill="#ffffff"/g, 'fill="#ffffff"')
    .replace(/<rect width="256"/, '<rect width="256" stroke="#00AA44" stroke-width="3"');
  const buf = renderSvgToPng(themed, 72);
  return bufferToDataUrl(buf, 'image/png');
}

export interface DesignChallengeAssetResult {
  relativePath: string;
  absolutePath: string;
  width: number;
  height: number;
}

/** 1200×400 — sovereign gradient + Design Partner badge. */
export function pngClChallengeHero(root: string): Buffer {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#0a1f0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00AA44" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#g)"/>
  <rect width="1200" height="400" fill="url(#accent)"/>
  <rect x="780" y="36" width="384" height="52" rx="10" fill="rgba(0,0,0,0.55)" stroke="#00AA44" stroke-width="2"/>
  <text x="972" y="70" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#F59E0B">DESIGN PARTNER</text>
  <text x="72" y="120" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#F8FAFC">Design Partnership Challenge</text>
  <text x="72" y="178" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="#94a3b8">Sovereign AI · Regulated verticals · Open submission</text>
  <text x="72" y="330" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#64748b">Pocket Portfolio — privacy layer for the Agentic Economy</text>
</svg>`;
  return renderSvgToPng(svg, 1200);
}

/** 1280×640 — Figure 2 + CoderLegion × Pocket Portfolio lockup (typographic; no external logo file). */
export function pngGithubBanner(root: string): Buffer {
  const archUrl = rasterFigure2(root, 820);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="640" viewBox="0 0 1280 640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="640" fill="url(#bg)"/>
  <rect x="40" y="36" width="860" height="520" rx="16" fill="#f8fafc" stroke="#0f172a" stroke-width="1"/>
  <image xlink:href="${archUrl}" href="${archUrl}" x="56" y="52" width="828" height="488" preserveAspectRatio="xMidYMid meet"/>
  <rect x="920" y="48" width="320" height="544" rx="14" fill="rgba(15,23,42,0.92)" stroke="#00AA44" stroke-width="1.5"/>
  <text x="1080" y="140" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#F59E0B">CODERLEGION</text>
  <text x="1080" y="186" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#94a3b8">×</text>
  <text x="1080" y="232" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#F8FAFC">Pocket Portfolio</text>
  <text x="1080" y="320" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#cbd5e1">Design Partnership</text>
  <text x="1080" y="348" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#cbd5e1">Challenge</text>
  <text x="1080" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#64748b">Figure 2 · Hybrid architecture</text>
  <text x="1080" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#475569">openfi-builders</text>
</svg>`;
  return renderSvgToPng(svg, 1280);
}

function pngCircularBadge(lines: string[], accent: string): Buffer {
  const ys = [168, 232, 298, 352];
  const joined = lines.map((t, i) => {
    const y = ys[i] ?? 200 + i * 48;
    const size = t.length > 18 ? 14 : t.length > 12 ? 17 : 20;
    return `<text x="256" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" fill="#F8FAFC">${xmlEscape(t)}</text>`;
  });
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="ibg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="248" fill="url(#ibg)" stroke="${accent}" stroke-width="6"/>
  <circle cx="256" cy="256" r="220" fill="none" stroke="${accent}" stroke-width="1" opacity="0.5"/>
  ${joined.join('\n  ')}
</svg>`;
  return renderSvgToPng(svg, 512);
}

export function pngBadgeSovereignSubstrateArchitect2026(): Buffer {
  return pngCircularBadge(['SOVEREIGN SUBSTRATE', 'ARCHITECT', '2026'], '#00AA44');
}

export function pngBadgeEarlyDesignPartner2026(): Buffer {
  return pngCircularBadge(['POCKET PORTFOLIO', 'EARLY DESIGN', 'PARTNER', '2026'], '#F59E0B');
}

/** 1500×500 — primary black + sovereign green radial glow. */
export function pngPlatformBanner1500(): Buffer {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="500" viewBox="0 0 1500 500">
  <defs>
    <radialGradient id="rg" cx="45%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#00FF41" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1500" height="500" fill="#000000"/>
  <rect width="1500" height="500" fill="url(#rg)"/>
  <text x="750" y="220" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#F8FAFC">Design Partnership Challenge</text>
  <text x="750" y="278" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#94a3b8">Sovereign substrate · Regulated AI · Open verticals</text>
  <text x="750" y="400" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#64748b">Pocket Portfolio · Salford HQ</text>
</svg>`;
  return renderSvgToPng(svg, 1500);
}

/** 1200×627 — Figure 2 hero + Design Partnership badge + monogram. */
export function pngHeroCardDesignPartnership(root: string): Buffer {
  const archUrl = rasterFigure2(root, 980);
  const logoUrl = loadMonogramDataUrl(root);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="627" viewBox="0 0 1200 627">
  <defs>
    <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#0a1f0a"/>
    </linearGradient>
    <radialGradient id="hglow" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#00AA44" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="627" fill="url(#hg)"/>
  <rect width="1200" height="627" fill="url(#hglow)"/>
  <rect x="48" y="40" width="360" height="56" rx="10" fill="rgba(0,0,0,0.65)" stroke="#F59E0B" stroke-width="2"/>
  <text x="228" y="78" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#F59E0B">DESIGN PARTNERSHIP</text>
  <rect x="80" y="120" width="1040" height="440" rx="16" fill="#f8fafc" stroke="#0f172a" stroke-width="1"/>
  <image xlink:href="${archUrl}" href="${archUrl}" x="100" y="136" width="1000" height="408" preserveAspectRatio="xMidYMid meet"/>
  <rect x="0" y="520" width="1200" height="107" fill="#000000" opacity="0.75"/>
  <image xlink:href="${logoUrl}" href="${logoUrl}" x="48" y="548" width="44" height="44"/>
  <text x="104" y="578" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#F8FAFC">Hybrid architecture (Fig. 2) · Boilerplate verified</text>
  <text x="104" y="602" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#94a3b8">Submit on GitHub Discussions · Recruit on CoderLegion openfi-builders</text>
</svg>`;
  return renderSvgToPng(svg, 1200);
}

export function writeDesignChallengeV1Assets(repoRoot: string, outDir: string): DesignChallengeAssetResult[] {
  fs.mkdirSync(outDir, { recursive: true });
  const heroBuf = pngHeroCardDesignPartnership(repoRoot);
  const specs: { name: string; buf: Buffer; w: number; h: number }[] = [
    { name: 'CL_Challenge_Hero.png', buf: pngClChallengeHero(repoRoot), w: 1200, h: 400 },
    { name: 'GitHub_Banner.png', buf: pngGithubBanner(repoRoot), w: 1280, h: 640 },
    { name: 'Challenge_Badge_Sovereign_Substrate_Architect_2026.png', buf: pngBadgeSovereignSubstrateArchitect2026(), w: 512, h: 512 },
    { name: 'Challenge_Badge_Early_Design_Partner_2026.png', buf: pngBadgeEarlyDesignPartner2026(), w: 512, h: 512 },
    { name: 'Platform_Banner_1500x500.png', buf: pngPlatformBanner1500(), w: 1500, h: 500 },
    { name: 'Hero_Card_Design_Partnership_1200x627.png', buf: heroBuf, w: 1200, h: 627 },
  ];
  const results: DesignChallengeAssetResult[] = [];
  for (const s of specs) {
    const absolutePath = path.join(outDir, s.name);
    fs.writeFileSync(absolutePath, s.buf);
    results.push({ relativePath: s.name, absolutePath, width: s.w, height: s.h });
  }

  /**
   * Mirror the hero card to public/og/designchallenge.png so the /designchallenge
   * landing page can serve a stable, sovereign-green branded OG image without a
   * runtime dependency on /api/og (which uses a different palette).
   */
  const publicOgDir = path.join(repoRoot, 'public', 'og');
  fs.mkdirSync(publicOgDir, { recursive: true });
  const publicOgPath = path.join(publicOgDir, 'designchallenge.png');
  fs.writeFileSync(publicOgPath, heroBuf);
  results.push({
    relativePath: path.relative(outDir, publicOgPath).replace(/\\/g, '/'),
    absolutePath: publicOgPath,
    width: 1200,
    height: 627,
  });

  return results;
}
