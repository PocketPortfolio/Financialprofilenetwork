/**
 * Excel Export for Google Drive Sync
 * Generates a read-only Excel file that users can open in Google Sheets
 */

import * as XLSX from 'xlsx';
import type { PortfolioData } from './types';

/**
 * Generate Excel file from portfolio data
 * Creates a user-friendly spreadsheet that can be opened in Google Sheets
 */
export function generateExcelFromPortfolio(data: PortfolioData): Blob {
  const workbook = XLSX.utils.book_new();
  
  // Create Trades sheet with formatted columns
  const tradesData = data.trades.map(trade => ({
    'Date': trade.date || '',
    'Ticker': trade.ticker || '',
    'Type': trade.type || '',
    'Quantity': (trade as any).qty || (trade as any).quantity || 0, // Support both qty and quantity
    'Price': trade.price || 0,
    'Fees': (trade as any).fees || 0,
    'Currency': trade.currency || 'USD',
    'Notes': (trade as any).notes || '',
  }));
  
  const tradesSheet = XLSX.utils.json_to_sheet(tradesData);
  
  // Set column widths for better readability
  tradesSheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Ticker
    { wch: 8 },  // Type
    { wch: 12 }, // Quantity
    { wch: 12 }, // Price
    { wch: 10 }, // Fees
    { wch: 8 },  // Currency
    { wch: 30 }, // Notes
  ];
  
  XLSX.utils.book_append_sheet(workbook, tradesSheet, 'Trades');
  
  // Create Summary sheet
  const summaryData = [
    {
      'Metric': 'Total Trades',
      'Value': data.metadata.tradeCount,
    },
    {
      'Metric': 'Created',
      'Value': new Date(data.metadata.createdAt).toLocaleString(),
    },
    {
      'Metric': 'Last Updated',
      'Value': new Date(data.metadata.lastUpdated).toLocaleString(),
    },
    {
      'Metric': 'Version',
      'Value': data.metadata.version,
    },
    {
      'Metric': 'Data Size (bytes)',
      'Value': data.metadata.dataSize,
    },
  ];
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 20 }, // Metric
    { wch: 30 }, // Value
  ];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Convert to blob
  const excelBuffer = XLSX.write(workbook, { 
    type: 'array', 
    bookType: 'xlsx',
    cellStyles: true,
  });
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

