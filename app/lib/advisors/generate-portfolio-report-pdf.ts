/**
 * Tier-1 institutional portfolio report PDF — vector jsPDF (sovereign terminal aesthetic).
 */
import { jsPDF } from 'jspdf';
import {
  SOVEREIGN_REPORT_RGB as C,
  formatReportCurrency,
  formatReportDate,
} from './sovereign-report-theme';
import { fitDimensionsInBox, type ImageNaturalSize } from './logo-fit';

export interface PortfolioReportPosition {
  ticker: string;
  shares: number;
  value: number;
  allocation: number;
  currency?: string;
}

export interface PortfolioReportInput {
  clientName: string;
  reportDate?: string;
  totalValue: number;
  primaryCurrency: string;
  positions: PortfolioReportPosition[];
  firmLogoDataUrl?: string | null;
  /** Intrinsic pixel size — required for correct logo aspect ratio in PDF. */
  firmLogoNaturalSize?: ImageNaturalSize | null;
  showWatermark?: boolean;
}

const LOGO_MAX_W_MM = 42;
const LOGO_MAX_H_MM = 18;

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

function paintPageBackground(pdf: jsPDF) {
  pdf.setFillColor(...C.bg);
  pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');
}

function drawPageFooter(pdf: jsPDF, pageNum: number, totalPages: number) {
  const y = PAGE_H - 10;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(...C.muted);
  pdf.text(
    'Pocket Portfolio · Stateless edge reporting · Confidential client intelligence',
    MARGIN,
    y
  );
  pdf.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
}

function detectImageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  return dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')
    ? 'JPEG'
    : 'PNG';
}

function formatShares(shares: number): string {
  return shares % 1 === 0 ? shares.toLocaleString('en-GB') : shares.toFixed(2);
}

export function generatePortfolioReportPdf(input: PortfolioReportInput): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const reportDate = input.reportDate ?? formatReportDate();
  const currency = input.primaryCurrency || 'GBP';

  const rowHeight = 7;
  const headerBlockH = 32;
  const summaryH = 22;
  const tableHeaderH = 8;
  const firstPageTableStart = MARGIN + headerBlockH + summaryH + tableHeaderH;
  const rowsPerFirstPage = Math.floor((PAGE_H - firstPageTableStart - 16) / rowHeight);
  const rowsPerNextPage = Math.floor((PAGE_H - MARGIN - tableHeaderH - 16) / rowHeight);

  const positions = input.positions;
  let rowIndex = 0;
  let pageNum = 1;

  const estimatePages = () => {
    if (positions.length <= rowsPerFirstPage) return 1;
    return 1 + Math.ceil((positions.length - rowsPerFirstPage) / rowsPerNextPage);
  };
  const totalPages = estimatePages();

  const drawReportHeader = (yStart: number) => {
    pdf.setFillColor(...C.amber);
    pdf.rect(MARGIN, yStart, 1.4, 24, 'F');

    const textX = MARGIN + 5;
    if (input.firmLogoDataUrl) {
      try {
        const fmt = detectImageFormat(input.firmLogoDataUrl);
        const nat = input.firmLogoNaturalSize;
        const fit =
          nat && nat.width > 0 && nat.height > 0
            ? fitDimensionsInBox(nat.width, nat.height, LOGO_MAX_W_MM, LOGO_MAX_H_MM)
            : { w: LOGO_MAX_W_MM, h: LOGO_MAX_H_MM };
        const logoX = PAGE_W - MARGIN - fit.w;
        const logoY = yStart + (20 - fit.h) / 2;
        pdf.addImage(input.firmLogoDataUrl, fmt, logoX, logoY, fit.w, fit.h, undefined, 'FAST');
      } catch {
        /* logo optional */
      }
    }

    pdf.setFont('courier', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(...C.amber);
    pdf.text('POCKET PORTFOLIO · CLIENT INTELLIGENCE REPORT', textX, yStart + 5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.setTextColor(...C.text);
    pdf.text('Portfolio Report', textX, yStart + 13);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...C.muted);
    pdf.text(`${input.clientName} · ${reportDate}`, textX, yStart + 19);

    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.25);
    pdf.line(MARGIN, yStart + 26, PAGE_W - MARGIN, yStart + 26);
  };

  const drawSummary = (yStart: number) => {
    const boxW = (CONTENT_W - 4) / 2;
    const boxes: Array<{ label: string; value: string }> = [
      { label: 'TOTAL PORTFOLIO VALUE', value: formatReportCurrency(input.totalValue, currency) },
      { label: 'POSITIONS', value: String(positions.length) },
    ];
    boxes.forEach((box, i) => {
      const x = MARGIN + i * (boxW + 4);
      pdf.setFillColor(...C.surface);
      pdf.setDrawColor(...C.border);
      pdf.roundedRect(x, yStart, boxW, 16, 1.5, 1.5, 'FD');
      pdf.setFillColor(...C.amber);
      pdf.rect(x, yStart, 0.8, 16, 'F');
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(...C.amber);
      pdf.text(box.label, x + 3, yStart + 5);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...C.text);
      pdf.text(box.value, x + 3, yStart + 12);
    });
  };

  const drawTableHeader = (y: number) => {
    pdf.setFillColor(...C.surface);
    pdf.rect(MARGIN, y - 5, CONTENT_W, 7, 'F');
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(...C.amber);
    const cols = [
      { label: 'TICKER', x: MARGIN + 2, align: 'left' as const },
      { label: 'SHARES', x: MARGIN + 52, align: 'right' as const },
      { label: 'VALUE', x: MARGIN + 92, align: 'right' as const },
      { label: 'ALLOC %', x: PAGE_W - MARGIN - 2, align: 'right' as const },
    ];
    cols.forEach((col) => {
      pdf.text(col.label, col.x, y, { align: col.align });
    });
    pdf.setDrawColor(...C.amber);
    pdf.setLineWidth(0.35);
    pdf.line(MARGIN, y + 1.5, PAGE_W - MARGIN, y + 1.5);
  };

  const drawTableRow = (y: number, pos: PortfolioReportPosition, zebra: boolean) => {
    if (zebra) {
      pdf.setFillColor(...C.surface);
      pdf.rect(MARGIN, y - 4.5, CONTENT_W, rowHeight, 'F');
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...C.text);
    pdf.text(pos.ticker, MARGIN + 2, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...C.text);
    pdf.text(formatShares(pos.shares), MARGIN + 52, y, { align: 'right' });
    pdf.text(
      formatReportCurrency(pos.value, pos.currency || currency),
      MARGIN + 92,
      y,
      { align: 'right' }
    );
    pdf.setTextColor(...C.amber);
    pdf.text(`${pos.allocation}%`, PAGE_W - MARGIN - 2, y, { align: 'right' });
  };

  paintPageBackground(pdf);
  let y = MARGIN;
  drawReportHeader(y);
  y += headerBlockH;
  drawSummary(y);
  y += summaryH;
  drawTableHeader(y);
  y += 6;

  while (rowIndex < positions.length) {
    const limit =
      pageNum === 1 ? rowsPerFirstPage : rowsPerNextPage;
    let drawn = 0;
    while (rowIndex < positions.length && drawn < limit) {
      drawTableRow(y, positions[rowIndex]!, rowIndex % 2 === 1);
      y += rowHeight;
      rowIndex += 1;
      drawn += 1;
    }
    if (rowIndex < positions.length) {
      pdf.addPage();
      pageNum += 1;
      paintPageBackground(pdf);
      y = MARGIN + 6;
      drawTableHeader(y);
      y += 6;
    }
  }

  if (input.showWatermark) {
    pdf.setTextColor(63, 63, 70);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(42);
    pdf.text('PREVIEW ONLY', PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: 35 });
  }

  const complianceY = PAGE_H - 18;
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(...C.muted);
  pdf.text(
    pdf.splitTextToSize(
      'Generated via stateless edge architecture. Portfolio aggregates computed client-side; raw ledger rows are not persisted on the inference path.',
      CONTENT_W
    ),
    MARGIN,
    complianceY
  );

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    drawPageFooter(pdf, p, totalPages);
  }

  return pdf;
}

export async function downloadPortfolioReportPdf(
  input: PortfolioReportInput,
  filename: string
): Promise<void> {
  const pdf = generatePortfolioReportPdf(input);
  pdf.save(filename);
}
