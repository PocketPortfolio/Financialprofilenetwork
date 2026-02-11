#!/usr/bin/env node
/**
 * Generate Universal-LLM-Import-Book.pdf from the manuscript.
 * Run from repo root: npm run book:pdf
 * Output: docs/book/Universal-LLM-Import-Book.pdf
 *
 * Pipeline: prepare markdown (figures→PNG via resvg, chapter headers→data URI),
 * convert to HTML with marked, write HTML with file:// base so img src resolve from disk,
 * Puppeteer loads HTML file and prints to PDF (no md-to-pdf server).
 */
const path = require('path');
const fs = require('fs');

const bookDir = path.join(__dirname);
const mdPath = path.join(bookDir, 'UNIVERSAL-LLM-IMPORT-BOOK.md');
const outPath = path.join(bookDir, 'Universal-LLM-Import-Book.pdf');
const cssPath = path.join(bookDir, 'book-styles.css');

if (!fs.existsSync(mdPath)) {
  console.error('Missing:', mdPath);
  process.exit(1);
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

/** 1x1 transparent PNG for missing chapter headers. */
const PLACEHOLDER_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const TEMP_MD_FILENAME = '_pdf-input.md';
const PDF_FIGURES_DIR = '_pdf-figures';

function ensureChapterHeaderPlaceholders() {
  const dir = path.join(bookDir, 'assets', 'chapter-headers');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buf = Buffer.from(PLACEHOLDER_PNG_BASE64, 'base64');
  for (let n = 1; n <= 11; n++) {
    const name = `chapter-${String(n).padStart(2, '0')}-header.png`;
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) fs.writeFileSync(file, buf);
  }
}

/**
 * Convert figure SVGs to PNGs for PDF using @resvg/resvg-js only (Chromium causes dark artifacts).
 * Writes to bookDir/_pdf-figures/*.png and returns markdown with figures/xxx.svg -> _pdf-figures/xxx.png.
 */
async function prepareFiguresForPdf(md, chromePath) {
  const figuresDir = path.join(bookDir, 'figures');
  const outDir = path.join(bookDir, PDF_FIGURES_DIR);
  if (!fs.existsSync(figuresDir)) return md;
  const svgFiles = fs.readdirSync(figuresDir).filter((f) => f.endsWith('.svg'));
  if (svgFiles.length === 0) return md;
  // Always regenerate (avoid stale Chromium PNGs with dark shapes)
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
    // #region agent log
    const pngList = fs.readdirSync(outDir).filter((f) => f.endsWith('.png'));
    const pngSizes = pngList.map((f) => ({ name: f, size: fs.statSync(path.join(outDir, f)).size }));
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:prepareFiguresForPdf',message:'resvg success',data:{usedResvg,svgCount:svgFiles.length,pngCount:pngList.length,pngSizes},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
  } catch (resvgErr) {
    const msg = resvgErr && (resvgErr.message || String(resvgErr));
    console.error('Figures: resvg is required (Puppeteer fallback causes dark artifacts in PNGs).');
    console.error('Install/rebuild: npm install @resvg/resvg-js');
    if (process.platform === 'win32') {
      console.error('On Windows you may need: npm install @resvg/resvg-js-win32-x64-msvc');
    }
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:prepareFiguresForPdf',message:'resvg failed no fallback',data:{error:msg},timestamp:Date.now(),hypothesisId:'H7'})}).catch(()=>{});
    throw new Error(`Figure conversion failed: ${msg}`);
  }
  fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:prepareFiguresForPdf',message:'figure renderer used',data:{usedResvg},timestamp:Date.now(),hypothesisId:'H7'})}).catch(()=>{});

  let out = md;
  for (const name of svgFiles) {
    const pngName = name.replace(/\.svg$/i, '.png');
    const svgRef = 'figures/' + name;
    const pngRef = PDF_FIGURES_DIR + '/' + pngName;
    out = out.replace(new RegExp('\\]\\((' + svgRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\)', 'g'), '](' + pngRef + ')');
  }
  return out;
}

(async function run() {
  const tempMdPath = path.join(bookDir, TEMP_MD_FILENAME);
  try {
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'entry',data:{mdPath,tempMdPath,usePathAndBasedir:true},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    ensureChapterHeaderPlaceholders();
    const chromePath = getChromePath();
    let rawMd = fs.readFileSync(mdPath, 'utf8');
    rawMd = await prepareFiguresForPdf(rawMd, chromePath);
    // #region agent log
    const figDir = path.join(bookDir, PDF_FIGURES_DIR);
    const pngCountAfter = fs.existsSync(figDir) ? fs.readdirSync(figDir).filter((f) => f.endsWith('.png')).length : 0;
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'after prepareFigures',data:{pngCountAfter},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    // Embed all images as data URIs. When chapter header is tiny (<500b) render "Chapter N" SVG to PNG via resvg so PDF gets PNG (Chromium may omit SVG data URIs in PDF).
    const PLACEHOLDER_SIZE_THRESHOLD = 500;
    let visiblePlaceholderCount = 0;
    const { Resvg: ResvgClass } = require('@resvg/resvg-js');
    rawMd = rawMd.replace(
      /!\[([^\]]*)\]\((assets\/chapter-headers\/chapter-(\d+)-header\.png)\)/g,
      (_, alt, relPath, numStr) => {
        const file = path.join(bookDir, relPath);
        const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
        const useVisiblePlaceholder = size < PLACEHOLDER_SIZE_THRESHOLD;
        if (useVisiblePlaceholder) {
          visiblePlaceholderCount++;
          // Decorative bar only (no chapter number) to avoid duplicating the H2 title per technical-writing best practice.
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 24"><defs><linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#64748b"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient></defs><rect width="320" height="8" y="8" rx="4" fill="url(#bar)"/></svg>`;
          try {
            const resvg = new ResvgClass(svg, { background: '#ffffff', fitTo: { mode: 'width', value: 320 } });
            const png = resvg.render().asPng();
            const b64 = Buffer.from(png).toString('base64');
            return `![${alt}](data:image/png;base64,${b64})`;
          } catch (err) {
            return `![${alt}](data:image/png;base64,${PLACEHOLDER_PNG_BASE64})`;
          }
        }
        const b64 = fs.readFileSync(file).toString('base64');
        return `![${alt}](data:image/png;base64,${b64})`;
      }
    );
    const pdfFiguresDir = path.join(bookDir, PDF_FIGURES_DIR);
    if (fs.existsSync(pdfFiguresDir)) {
      rawMd = rawMd.replace(
        /!\[(.*?)\]\((_pdf-figures\/([^)]+\.png))\)/g,
        (_, alt, _path, name) => {
          const file = path.join(pdfFiguresDir, name);
          if (!fs.existsSync(file)) return `![${alt}](${_path})`;
          const b64 = fs.readFileSync(file).toString('base64');
          return `![${alt}](data:image/png;base64,${b64})`;
        }
      );
    }
    // #region agent log
    const dataUriCountPng = (rawMd.match(/data:image\/png;base64,/g) || []).length;
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'prepared md',data:{rawLen:rawMd.length,dataUriCountPng,visiblePlaceholderCount,allPng:dataUriCountPng===15},timestamp:Date.now(),hypothesisId:'H3',runId:'post-fix'})}).catch(()=>{});
    // #endregion

    const { marked, Renderer } = require('marked');
    const renderer = new Renderer();
    const escapeAttr = (s) => (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    renderer.image = function (href, title, text) {
      const alt = escapeAttr(text || '');
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${href}" alt="${alt}"${titleAttr} />`;
    };
    const bodyHtml = marked.parse(rawMd, { gfm: true, renderer });
    const defaultCss = path.join(path.dirname(require.resolve('md-to-pdf')), '..', 'markdown.css');
    const defaultCssContent = fs.existsSync(defaultCss) ? fs.readFileSync(defaultCss, 'utf8') : '';
    const bookCssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${defaultCssContent}</style><style>${bookCssContent}</style></head><body class="book-body">${bodyHtml}</body></html>`;

    // #region agent log
    const imgCount = (bodyHtml.match(/src="data:image\/png;base64,/g) || []).length;
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'body html',data:{bodyLen:bodyHtml.length,imgCount},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion

    const puppeteer = require('puppeteer');
    const launchOpts = chromePath ? { executablePath: chromePath } : {};
    const browser = await puppeteer.launch({ headless: true, ...launchOpts });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })
        )
      )
    );
    // #region agent log
    const imgStats = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return { total: imgs.length, withWidth: imgs.filter((i) => i.naturalWidth > 0).length };
    });
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'images in page',data:imgStats,timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    await page.emulateMediaType('print');
    await page.pdf({
      path: outPath,
      format: 'A4',
      margin: { top: '24mm', right: '24mm', bottom: '24mm', left: '24mm' },
      printBackground: true,
    });
    await browser.close();
    // #region agent log
    const outExists = fs.existsSync(outPath);
    const outSize = outExists ? fs.statSync(outPath).size : 0;
    let pdfImageRefCount = 0;
    if (outExists && outSize > 0) {
      const pdfBuf = fs.readFileSync(outPath);
      const pdfText = pdfBuf.toString('latin1');
      pdfImageRefCount = (pdfText.match(/\/Subtype\s*\/Image/g) || []).length;
    }
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'pdf written',data:{outPath,outExists,outSize,pdfImageRefCount,expectedImages:15},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
    if (outExists && pdfImageRefCount === 15) {
      const verifyPath = outPath + '.generated.txt';
      fs.writeFileSync(verifyPath, `Generated: ${new Date().toISOString()}\nPDF image objects: ${pdfImageRefCount}\nOpen this PDF: ${outPath}\n`, 'utf8');
    }
    // #endregion
    console.log('Created:', outPath);
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:43110/ingest/d533f77b-679d-4262-93fb-10488bb36bd8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'run-pdf.js:run',message:'catch',data:{error:e.message||String(e),code:e.code},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error('Install once (from repo root): npm install');
      console.error('Then run: npm run book:pdf');
      process.exit(1);
    }
    console.error(e.message || e);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempMdPath)) {
      try { fs.unlinkSync(tempMdPath); } catch (_) {}
    }
  }
})();
