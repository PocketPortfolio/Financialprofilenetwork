/**
 * Portfolio Export Utilities
 * Functions for exporting portfolio data and charts
 */

import type { Position } from '../utils/portfolioCalculations';
import type { PortfolioSnapshot } from './types';

/**
 * Export positions to CSV
 */
export function exportToCSV(
  positions: Position[],
  filename: string = 'portfolio.csv'
): void {
  const headers = [
    'Ticker',
    'Shares',
    'Avg Cost',
    'Current Price',
    'Current Value',
    'Cost Basis',
    'Unrealized P/L',
    'Unrealized P/L %',
    'Currency',
  ];

  const rows = positions.map((pos) => [
    pos.ticker,
    pos.shares.toFixed(4),
    pos.avgCost.toFixed(2),
    pos.currentPrice.toFixed(2),
    pos.currentValue.toFixed(2),
    (pos.avgCost * pos.shares).toFixed(2),
    pos.unrealizedPL.toFixed(2),
    pos.unrealizedPLPercent.toFixed(2),
    pos.currency || 'USD',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export performance history to CSV
 */
export function exportPerformanceToCSV(
  snapshots: PortfolioSnapshot[],
  filename: string = 'portfolio-performance.csv'
): void {
  const headers = ['Date', 'Total Value', 'Total Invested', 'Return', 'Return %'];

  const rows = snapshots.map((snapshot) => {
    const returnAmount = snapshot.totalValue - snapshot.totalInvested;
    const returnPercent =
      snapshot.totalInvested > 0
        ? (returnAmount / snapshot.totalInvested) * 100
        : 0;

    return [
      snapshot.date,
      snapshot.totalValue.toFixed(2),
      snapshot.totalInvested.toFixed(2),
      returnAmount.toFixed(2),
      returnPercent.toFixed(2),
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export chart as PNG
 * Note: Requires html2canvas to be installed. Falls back to SVG if not available.
 * This function uses a runtime check to prevent webpack from trying to resolve html2canvas at build time.
 */
export async function exportChartAsPNG(
  chartElement: HTMLElement | null,
  filename: string = 'portfolio-chart.png'
): Promise<void> {
  if (!chartElement) {
    console.error('Chart element not found');
    return;
  }

  // Check if html2canvas is available at runtime
  // Use a string-based import that webpack won't analyze at build time
  let html2canvas: any = null;
  
  try {
    // Use Function constructor to prevent webpack static analysis
    // This makes the import truly optional and won't cause build errors
    const importModule = new Function('moduleName', 'return import(moduleName)');
    const html2canvasModule = await importModule('html2canvas');
    html2canvas = html2canvasModule.default;
  } catch (error) {
    // html2canvas not available - this is expected if not installed
    console.warn('html2canvas not installed. Install it with: npm install html2canvas');
    console.warn('Falling back to SVG export');
    exportChartAsSVG(chartElement, filename.replace('.png', '.svg'));
    return;
  }

  if (!html2canvas) {
    exportChartAsSVG(chartElement, filename.replace('.png', '.svg'));
    return;
  }

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: null,
      scale: 2, // Higher quality
    });

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) return;

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    // Fallback: try SVG export
    exportChartAsSVG(chartElement, filename.replace('.png', '.svg'));
  }
}

/**
 * Export chart as SVG
 */
export function exportChartAsSVG(
  chartElement: HTMLElement | null,
  filename: string = 'portfolio-chart.svg'
): void {
  if (!chartElement) {
    console.error('Chart element not found');
    return;
  }

  // Find SVG element within chart
  const svgElement = chartElement.querySelector('svg');

  if (!svgElement) {
    console.error('SVG element not found in chart');
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const link = document.createElement('a');
  link.setAttribute('href', svgUrl);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

