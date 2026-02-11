#!/usr/bin/env node
/**
 * Generate Universal-LLM-Import-Book.docx (Word) with embedded images.
 * Run from repo root: npm run book:docx
 * Output: docs/book/Universal-LLM-Import-Book.docx
 *
 * Pipeline: prepare figures (SVG→PNG in _pdf-figures), keep chapter headers and
 * figures as file paths in markdown, run Pandoc from book dir so images embed.
 * Fallback: @mohtasham/md-to-docx (may not embed images from paths).
 */
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const bookDir = path.join(__dirname);
const mdPath = path.join(bookDir, 'UNIVERSAL-LLM-IMPORT-BOOK.md');
const outPath = path.join(bookDir, 'Universal-LLM-Import-Book.docx');
const TEMP_MD = '_word-input.md';

const { ensureChapterHeaderPlaceholders, getChromePath, prepareFigures, PLACEHOLDER_PNG_BASE64, PDF_FIGURES_DIR } = require('./book-build-shared.js');

if (!fs.existsSync(mdPath)) {
  console.error('Missing:', mdPath);
  process.exit(1);
}

/** Embed chapter headers and figure PNGs as data URIs so md-to-docx can embed without fetching. */
function embedImagesAsDataUris(md, bookDir) {
  let out = md;
  out = out.replace(
    /!\[([^\]]*)\]\((assets\/chapter-headers\/chapter-\d+-header\.png)\)/g,
    (_, alt, relPath) => {
      const file = path.join(bookDir, relPath);
      const b64 = fs.existsSync(file) ? fs.readFileSync(file).toString('base64') : PLACEHOLDER_PNG_BASE64;
      return `![${alt}](data:image/png;base64,${b64})`;
    }
  );
  const figuresDir = path.join(bookDir, PDF_FIGURES_DIR);
  if (fs.existsSync(figuresDir)) {
    out = out.replace(
      /!\[(.*?)\]\((_pdf-figures\/([^)]+\.png))\)/g,
      (_, alt, _path, name) => {
        const file = path.join(figuresDir, name);
        if (!fs.existsSync(file)) return `![${alt}](${_path})`;
        const b64 = fs.readFileSync(file).toString('base64');
        return `![${alt}](data:image/png;base64,${b64})`;
      }
    );
  }
  return out;
}

(async function run() {
  const tempMdPath = path.join(bookDir, TEMP_MD);
  try {
    ensureChapterHeaderPlaceholders(bookDir);
    const chromePath = getChromePath();
    let rawMd = fs.readFileSync(mdPath, 'utf8');
    rawMd = await prepareFigures(rawMd, bookDir, chromePath);
    fs.writeFileSync(tempMdPath, rawMd, 'utf8');

    const pandocCmd = `pandoc "${tempMdPath}" -o "${outPath}" --toc --toc-depth=3`;
    execSync(pandocCmd, { stdio: 'inherit', cwd: bookDir });
    console.log('Created (Pandoc):', outPath);
  } catch (e) {
    const notFound = e.message && (e.message.includes('pandoc') || e.message.includes('not recognized'));
    if (notFound || e.status === 1) {
      console.log('Pandoc not found, using md-to-docx with embedded images...');
      try {
        const { convertMarkdownToDocx } = require('@mohtasham/md-to-docx');
        const preparedMd = fs.existsSync(tempMdPath) ? fs.readFileSync(tempMdPath, 'utf8') : fs.readFileSync(mdPath, 'utf8');
        const mdWithDataUris = embedImagesAsDataUris(preparedMd, bookDir);
        const result = await convertMarkdownToDocx(mdWithDataUris);
        if (Buffer.isBuffer(result)) {
          fs.writeFileSync(outPath, result);
        } else if (result && typeof result.arrayBuffer === 'function') {
          const ab = await result.arrayBuffer();
          fs.writeFileSync(outPath, Buffer.from(ab));
        } else {
          fs.writeFileSync(outPath, Buffer.from(result));
        }
        console.log('Created (md-to-docx):', outPath);
      } catch (requireErr) {
        if (requireErr.code === 'MODULE_NOT_FOUND') {
          console.error('Install Pandoc for best results: winget install Pandoc.Pandoc');
          console.error('Or install fallback: npm install @mohtasham/md-to-docx');
          process.exit(1);
        }
        console.error(requireErr.message);
        process.exit(1);
      }
    } else {
      console.error(e.message || e);
      process.exit(1);
    }
  } finally {
    if (fs.existsSync(tempMdPath)) {
      try { fs.unlinkSync(tempMdPath); } catch (_) {}
    }
  }
})();
