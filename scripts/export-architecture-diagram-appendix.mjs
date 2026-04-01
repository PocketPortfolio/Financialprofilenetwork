/**
 * Export the Sovereign Intelligence architecture diagram as a standalone PDF
 * with a header for marketing appendix usage.
 *
 * Output:
 *   docs/marketing/Split-Brain-System-Architecture-Appendix.pdf
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { jsPDF } from 'jspdf';

const HEADER = "Appendix: Pocket Portfolio 'Split-Brain' System Architecture";
const SVG_PATH = path.join('public', 'book-assets', 'figures', 'si-figure-02-hybrid-architecture.svg');
const OUT_PDF = path.join('docs', 'marketing', 'Split-Brain-System-Architecture-Appendix.pdf');

function bufferToDataUrlJpeg(buf) {
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

async function main() {
  // Tune for <32MB while staying legible at 100% zoom.
  // JPEG-in-PDF compresses far better than PNG for embedded raster.
  const jpg = await sharp(SVG_PATH, { density: 360 })
    // Force a white canvas behind the diagram to maximize label contrast
    // when viewed inside PDF viewers that may add page backgrounds.
    .flatten({ background: '#ffffff' })
    // Slight sharpening helps tiny diagram text survive rasterization.
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 0.4, x1: 2.0, y2: 10.0, y3: 20.0 })
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toBuffer();
  const meta = await sharp(jpg).metadata();
  const imgW = meta.width ?? 0;
  const imgH = meta.height ?? 0;
  if (!imgW || !imgH) throw new Error('Could not read rendered image dimensions.');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const margin = 36;
  const headerBlockH = 52;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(HEADER, margin, margin + 18);

  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.line(margin, margin + 30, pageW - margin, margin + 30);

  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2 - headerBlockH;
  const scale = Math.min(availW / imgW, availH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const x = margin + (availW - drawW) / 2;
  const y = margin + headerBlockH + (availH - drawH) / 2;

  doc.addImage(bufferToDataUrlJpeg(jpg), 'JPEG', x, y, drawW, drawH);

  fs.mkdirSync(path.dirname(OUT_PDF), { recursive: true });
  fs.writeFileSync(OUT_PDF, Buffer.from(doc.output('arraybuffer')));
  // eslint-disable-next-line no-console
  console.log(`WROTE ${OUT_PDF}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

