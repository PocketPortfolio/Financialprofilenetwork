/**
 * One-page Gantt chart PDF for Innovate UK / 6-month WP programme.
 * Output: docs/marketing/Gantt-Chart-Innovate-UK-Project.pdf
 */
import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';

const OUT = path.join('docs', 'marketing', 'Gantt-Chart-Innovate-UK-Project.pdf');

const AMBER = [245, 158, 11];
const AMBER_DARK = [180, 100, 8];
const TEXT = [30, 30, 32];
const MUTED = [55, 55, 60];

/** jsPDF built-in fonts use WinAnsi; strip/replace Unicode so viewers never show garbled spacing. */
function ascii(s) {
  return String(s)
    .replace(/\u00a3/g, 'GBP ') // pound
    .replace(/\u2014/g, '-') // em dash
    .replace(/\u2013/g, '-') // en dash
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"');
}

function main() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 36;
  const labelW = 128;
  const months = 6;
  const chartW = pageW - m * 2 - labelW;
  const cellW = chartW / months;
  const textW = pageW - m * 2;
  /** Last line baseline for footer (above bottom margin). */
  const footerBaseline = pageH - m - 2;

  let y = m;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  const titleLines = doc.splitTextToSize(
    ascii('Project Management Approach & Work Package Gantt'),
    textW
  );
  const titleLineH = 19;
  doc.text(titleLines, m, y + 14);
  y += 14 + titleLines.length * titleLineH + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const pmStr =
    ascii(
      'Agile/Scrum, 2-week sprints. Jira (sprints), GitHub (CI/CD, version control), Notion (technical docs). ' +
        'Lean SME: flat reporting. Abba Lawal (Head of AI): Principal Investigator and Lead Architect; accountable for all WPs. '
    ) +
    ascii(
      'PI reports monthly to Innovate UK Monitoring Officer (milestones, budget burn, risks, R&D progress).'
    );
  const pmWrapped = doc.splitTextToSize(pmStr, textW);
  const pmLineH = 11;
  doc.text(pmWrapped, m, y);
  y += pmWrapped.length * pmLineH + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  const progLines = doc.splitTextToSize(ascii('GBP 150k programme - four dependent work packages'), textW);
  doc.text(progLines, m, y);
  y += progLines.length * 13 + 10;

  const gridTop = y;
  const rowH = 44;
  const headerH = 28;

  // Month header row
  doc.setDrawColor(200, 200, 205);
  doc.setLineWidth(0.5);
  doc.setFillColor(248, 248, 250);
  doc.rect(m + labelW, gridTop, chartW, headerH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  for (let i = 0; i < months; i++) {
    const x = m + labelW + i * cellW;
    doc.line(x, gridTop, x, gridTop + headerH + rowH * 4);
    doc.text(`Month ${i + 1}`, x + cellW / 2, gridTop + 18, { align: 'center' });
  }
  doc.line(m + labelW + chartW, gridTop, m + labelW + chartW, gridTop + headerH + rowH * 4);

  const wps = [
    {
      id: 'WP1',
      title: ascii('Edge-Sanitization Engine & Local Architecture'),
      cost: ascii('GBP 60,000'),
      startM: 0,
      endM: 2,
      note: 'Prototype before WP2',
    },
    {
      id: 'WP2',
      title: ascii('Stateless API & Frontier AI Integration'),
      cost: ascii('GBP 40,000'),
      startM: 2,
      endM: 4,
      note: 'Depends on WP1 context',
    },
    {
      id: 'WP3',
      title: ascii('Validation, Benchmarking & Testing'),
      cost: ascii('GBP 30,000'),
      startM: 3,
      endM: 5,
      note: 'Needs WP1+2 integrated',
    },
    {
      id: 'WP4',
      title: ascii('Commercial Readiness & Phase 2 Plan'),
      cost: ascii('GBP 20,000'),
      startM: 5,
      endM: 6,
      note: 'Final whitepaper & roadmap',
    },
  ];

  let rowY = gridTop + headerH;
  wps.forEach((wp, idx) => {
    doc.setDrawColor(220, 220, 225);
    doc.line(m, rowY + rowH, m + labelW + chartW, rowY + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    doc.text(wp.id, m + 4, rowY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const titleLines = doc.splitTextToSize(wp.title, labelW - 8);
    doc.text(titleLines, m + 4, rowY + 26);
    doc.setFontSize(7);
    doc.setTextColor(...AMBER_DARK);
    doc.text(wp.cost, m + 4, rowY + 26 + titleLines.length * 9);

    const bx = m + labelW + wp.startM * cellW + 2;
    const bw = (wp.endM - wp.startM) * cellW - 4;
    doc.setFillColor(...AMBER);
    doc.setDrawColor(...AMBER_DARK);
    doc.setLineWidth(0.6);
    doc.roundedRect(bx, rowY + 8, bw, 26, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`${wp.id} active`, bx + bw / 2, rowY + 24, { align: 'center' });

    rowY += rowH;
  });

  doc.line(m + labelW, gridTop, m + labelW, gridTop + headerH + rowH * 4);

  y = rowY + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const depHeading = doc.splitTextToSize(ascii('Dependencies and outcomes (summary)'), textW);
  doc.text(depHeading, m, y);
  y += depHeading.length * 11 + 8;

  const depStr =
    ascii(
      'WP1 completes before WP2. Integrated WP1+2 system required for WP3 (metrics: zero-PII leakage, edge latency, AI parity on synthetic data). '
    ) +
    ascii(
      'WP4: benchmark synthesis, regulatory review (DORA/FCA framing), Innovate UK technical whitepaper, IP and commercial roadmap. '
    ) +
    ascii(
      'Risks front-loaded in WP1 and WP2; final two months emphasise validation and commercial translation.'
    );

  const footFontSize = 7;
  doc.setFontSize(footFontSize);
  doc.setFont('helvetica', 'normal');
  const footLines = doc.splitTextToSize(
    ascii('Pocket Portfolio - single lead applicant | Confidential'),
    textW
  );
  const footLineH = footFontSize * 1.2;
  const footFirstBaseline = footerBaseline - (footLines.length - 1) * footLineH;
  const maxDepBottom = footFirstBaseline - 10;

  doc.setFont('helvetica', 'normal');
  let depFs = 8;
  doc.setFontSize(depFs);
  doc.setTextColor(...MUTED);
  let depWrapped = doc.splitTextToSize(depStr, textW);
  const depLineH = () => depFs * 1.25;
  while (y + depWrapped.length * depLineH() > maxDepBottom && depFs > 6.5) {
    depFs -= 0.5;
    doc.setFontSize(depFs);
    depWrapped = doc.splitTextToSize(depStr, textW);
  }
  doc.text(depWrapped, m, y);

  doc.setFontSize(footFontSize);
  doc.setTextColor(130, 130, 135);
  doc.text(footLines, m, footFirstBaseline);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(doc.output('arraybuffer')));
  console.log('WROTE', OUT);
}

main();
