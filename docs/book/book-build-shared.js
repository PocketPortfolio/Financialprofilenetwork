/**
 * Shared helpers for book PDF and Word builds: chapter header placeholders, SVG→PNG figure conversion.
 * Used by run-pdf.js and run-option-a.js.
 */
const path = require('path');
const fs = require('fs');

const PLACEHOLDER_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PDF_FIGURES_DIR = '_pdf-figures';

function ensureChapterHeaderPlaceholders(bookDir) {
  const dir = path.join(bookDir, 'assets', 'chapter-headers');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buf = Buffer.from(PLACEHOLDER_PNG_BASE64, 'base64');
  for (let n = 1; n <= 11; n++) {
    const name = `chapter-${String(n).padStart(2, '0')}-header.png`;
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) fs.writeFileSync(file, buf);
  }
}

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

/**
 * Convert figure SVGs to PNGs. Prefers @resvg/resvg-js. Fallback: Puppeteer.
 * Returns markdown with figures/xxx.svg replaced by _pdf-figures/xxx.png.
 */
async function prepareFigures(md, bookDir, chromePath) {
  const figuresDir = path.join(bookDir, 'figures');
  const outDir = path.join(bookDir, PDF_FIGURES_DIR);
  if (!fs.existsSync(figuresDir)) return md;
  const svgFiles = fs.readdirSync(figuresDir).filter((f) => f.endsWith('.svg'));
  if (svgFiles.length === 0) return md;

  if (fs.existsSync(outDir)) {
    for (const f of fs.readdirSync(outDir)) {
      if (f.endsWith('.png')) fs.unlinkSync(path.join(outDir, f));
    }
  } else {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let usedResvg = false;
  try {
    const { Resvg } = require('@resvg/resvg-js');
    const opts = { background: '#ffffff', fitTo: { mode: 'width', value: 1160 } };
    for (const name of svgFiles) {
      const svgPath = path.join(figuresDir, name);
      const pngPath = path.join(outDir, name.replace(/\.svg$/i, '.png'));
      const svgContent = fs.readFileSync(svgPath, 'utf8');
      const resvg = new Resvg(svgContent, opts);
      const pngData = resvg.render();
      fs.writeFileSync(pngPath, pngData.asPng());
    }
    usedResvg = true;
    console.log('Figures: converted with resvg (artifact-free)');
  } catch (err) {
    const msg = err && (err.message || String(err));
    console.error('Figures: resvg is required (Puppeteer fallback causes dark artifacts in PNGs).');
    console.error('Install/rebuild: npm install @resvg/resvg-js');
    if (process.platform === 'win32') {
      console.error('On Windows you may need: npm install @resvg/resvg-js-win32-x64-msvc');
    }
    throw new Error(`Figure conversion failed: ${msg}`);
  }

  let out = md;
  for (const name of svgFiles) {
    const pngName = name.replace(/\.svg$/i, '.png');
    const svgRef = 'figures/' + name;
    const pngRef = PDF_FIGURES_DIR + '/' + pngName;
    out = out.replace(new RegExp('\\]\\((' + svgRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\)', 'g'), '](' + pngRef + ')');
  }
  return out;
}

module.exports = {
  PLACEHOLDER_PNG_BASE64,
  PDF_FIGURES_DIR,
  ensureChapterHeaderPlaceholders,
  getChromePath,
  prepareFigures,
};
