'use client';

import React, { useState } from 'react';
import { trackCSVImportSuccess, trackCSVImportStart, trackCSVImportError } from '../lib/analytics/events';
import { parseCSV as parseCSVAdapter, detectBrokerFromSample } from '@pocket-portfolio/importer';
import { detectBroker } from '@pocket-portfolio/importer';
import type { BrokerId, NormalizedTrade } from '@pocket-portfolio/importer';
import AlertModal from './modals/AlertModal';

interface Trade {
  id: string;
  date: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  currency: string;
  qty: number;
  price: number;
  mock: boolean;
  portfolioId?: string;
}

interface CSVImporterProps {
  onImport: (trades: Trade[]) => void;
}

export default function CSVImporter({ onImport }: CSVImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<{title: string; message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  // Helper function to show alerts
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertModalData({ title, message, type });
    setShowAlertModal(true);
  };

  // Helper to convert File to RawFile format for adapter system
  const fileToRawFile = (file: File): import('@pocket-portfolio/importer').RawFile => {
    return {
      name: file.name,
      mime: file.type as 'text/csv' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: file.size,
      arrayBuffer: () => file.arrayBuffer()
    };
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  };

  // Direct Koinly parser (fallback when package adapter is cached)
  const parseKoinlyDirectly = async (csvContent: string): Promise<{
    broker: 'koinly';
    trades: Array<{
      date: string;
      ticker: string;
      type: 'BUY' | 'SELL';
      qty: number;
      price: number;
      currency?: string;
      fees?: number;
      source: 'koinly';
    }>;
    warnings: string[];
    meta: { rows: number; invalid: number; durationMs: number; version: string };
  }> => {
    const t0 = performance.now();
    
    
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }
    
    const header = parseCSVLine(lines[0]);
    
    
    const headerMap: Record<string, number> = {};
    header.forEach((h, i) => {
      headerMap[h.toLowerCase()] = i;
    });
    
    const trades: Array<{
      date: string;
      ticker: string;
      type: 'BUY' | 'SELL';
      qty: number;
      price: number;
      currency?: string;
      fees?: number;
      source: 'koinly';
    }> = [];
    const warnings: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length < header.length) continue;
      
      try {
        const getValue = (key: string) => {
          const idx = headerMap[key.toLowerCase()];
          return idx !== undefined ? row[idx]?.trim() : '';
        };
        
        const label = (getValue('Label') || '').toUpperCase();
        if (!label || label.includes('DEPOSIT') || label.includes('WITHDRAWAL') || label.includes('TRANSFER') || (label !== 'TRADE' && !label.includes('TRADE'))) {
          continue;
        }
        
        const sentAmount = parseFloat(getValue('Sent Amount') || '0');
        const receivedAmount = parseFloat(getValue('Received Amount') || '0');
        const sentCurrency = getValue('Sent Currency');
        const receivedCurrency = getValue('Received Currency');
        const pair = getValue('Pair');
        const feeAmount = parseFloat(getValue('Fee Amount') || '0');
        
        // Extract ticker from pair (e.g., "BTC-USD" -> "BTC")
        let ticker = '';
        if (pair) {
          const pairParts = pair.split('-');
          ticker = pairParts[0] || '';
        }
        
        // Determine trade direction
        let type: 'BUY' | 'SELL' = 'BUY';
        let qty = 0;
        let price = 0;
        let currency = 'USD';
        
        if (sentAmount > 0 && receivedAmount > 0) {
          // Exchange
          if (pair) {
            const pairParts = pair.split('-');
            const baseCurrency = pairParts[0] || sentCurrency;
            if (sentCurrency === baseCurrency || !sentCurrency) {
              type = 'SELL';
              ticker = ticker || baseCurrency;
              qty = sentAmount;
              price = receivedAmount / sentAmount;
              currency = receivedCurrency || 'USD';
            } else {
              type = 'BUY';
              ticker = ticker || baseCurrency;
              qty = receivedAmount;
              price = sentAmount / receivedAmount;
              currency = sentCurrency || 'USD';
            }
          } else {
            type = 'SELL';
            ticker = ticker || sentCurrency;
            qty = sentAmount;
            price = receivedAmount / sentAmount;
            currency = receivedCurrency || 'USD';
          }
        } else if (sentAmount > 0) {
          type = 'SELL';
          ticker = ticker || sentCurrency || (pair ? pair.split('-')[0] : '');
          qty = sentAmount;
          price = receivedAmount > 0 ? receivedAmount / sentAmount : 1;
          currency = receivedCurrency || sentCurrency || 'USD';
        } else if (receivedAmount > 0) {
          type = 'BUY';
          ticker = ticker || receivedCurrency || (pair ? pair.split('-')[0] : '');
          qty = receivedAmount;
          price = sentAmount > 0 ? sentAmount / receivedAmount : 1;
          currency = sentCurrency || receivedCurrency || 'USD';
        } else {
          continue;
        }
        
        if (!price || price <= 0) price = 1;
        if (!ticker || qty <= 0) continue;
        
        // Parse date
        const dateStr = getValue('Koinly Date') || getValue('Date') || '';
        let date = new Date().toISOString();
        if (dateStr) {
          try {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              date = parsed.toISOString();
            }
          } catch (e) {
            // Use current date if parsing fails
          }
        }
        
        trades.push({
          date,
          ticker: ticker.toUpperCase(),
          type,
          qty,
          price,
          currency: currency.toUpperCase(),
          fees: feeAmount || 0,
          source: 'koinly'
        });
      } catch (e: any) {
        warnings.push(`row ${i + 1}: ${e.message}`);
      }
    }
    
    const result = {
      broker: 'koinly' as const,
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct Freetrade parser (fallback for cached package issues)
  const parseFreetradeDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        const action = (row['Action'] || row['Type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('CASH TOP UP') || action.includes('CASH WITHDRAWAL') || action.includes('STOCK SPLIT')) {
          continue;
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = row['Date'] || '';
        // Freetrade uses DD/MM/YYYY format
        const dateParts = dateStr.split('/');
        const isoDate = dateParts.length === 3 
          ? `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}T00:00:00.000Z`
          : dateStr;
        
        const ticker = (row['Stock'] || row['Symbol'] || '').trim().toUpperCase();
        const qty = parseFloat(row['Quantity'] || '0');
        const price = parseFloat(row['Price'] || row['Price (native)'] || '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['Currency (native)'] || 'GBP',
          fees: row['Fee (GBP)'] ? parseFloat(row['Fee (GBP)']) : 0,
          source: 'freetrade',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'freetrade',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct Ghostfolio parser (fallback for cached package issues)
  const parseGhostfolioDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        // Ghostfolio uses lowercase column names
        const action = (row['type'] ?? row['Type'] ?? '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = row['date'] ?? row['Date'] ?? '';
        // Ghostfolio dates are already in ISO format
        const isoDate = dateStr || '';
        
        const ticker = (row['symbol'] ?? row['Symbol'] ?? '').trim().toUpperCase();
        const qty = parseFloat(row['quantity'] ?? row['Quantity'] ?? '0');
        const price = parseFloat(row['unitPrice'] ?? row['Unit Price'] ?? row['unitprice'] ?? '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['currency'] ?? row['Currency'] ?? 'USD',
          fees: (row['fee'] ?? row['Fee'] ?? '0') ? parseFloat(row['fee'] ?? row['Fee'] ?? '0') : 0,
          source: 'ghostfolio',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'ghostfolio',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct Kraken parser (fallback for cached package issues)
  const parseKrakenDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        const action = (row['Type'] ?? row['Action'] ?? '').toUpperCase();
        if (!action || action.includes('DEPOSIT') || action.includes('WITHDRAWAL') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = row['Date'] ?? row['Time'] ?? row['Timestamp'] ?? '';
        // Kraken dates are in ISO format
        let isoDate = dateStr;
        if (dateStr && !dateStr.includes('T')) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            isoDate = date.toISOString();
          }
        }
        
        const ticker = (row['Asset'] ?? row['Symbol'] ?? row['Ticker'] ?? '').trim().toUpperCase();
        const qty = parseFloat(row['Amount'] ?? row['Quantity'] ?? row['Qty'] ?? '0');
        const price = parseFloat(row['Price'] ?? row['Trade Price'] ?? row['Execution Price'] ?? '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['Currency'] ?? 'USD',
          fees: (row['Fee'] ?? '0') ? parseFloat(row['Fee']) : 0,
          source: 'kraken',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'kraken',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct Degiro parser (fallback for cached package issues)
  const parseDegiroDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        const action = (row['Action'] ?? row['Type'] ?? '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = row['Date'] ?? row['Time'] ?? row['Trade Date'] ?? '';
        // Degiro dates are typically DD-MM-YYYY format
        let isoDate = dateStr;
        if (dateStr && !dateStr.includes('T')) {
          // Try to parse DD-MM-YYYY format
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              isoDate = date.toISOString();
            }
          } else {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              isoDate = date.toISOString();
            }
          }
        }
        
        // Extract ticker from Product column (e.g., "Apple Inc" -> "AAPL")
        // Map common company names to tickers
        const productName = (row['Product'] ?? row['Symbol'] ?? row['Ticker'] ?? '').trim();
        const COMPANY_TICKER_MAP: Record<string, string> = {
          'APPLE INC': 'AAPL',
          'APPLE INC.': 'AAPL',
          'TESLA INC': 'TSLA',
          'TESLA, INC.': 'TSLA',
          'NVIDIA CORP': 'NVDA',
          'NVIDIA CORPORATION': 'NVDA',
          'MICROSOFT CORPORATION': 'MSFT',
          'AMAZON.COM, INC.': 'AMZN',
          'META PLATFORMS, INC.': 'META',
          'ALPHABET INC.': 'GOOGL',
          'GOOGLE': 'GOOGL',
        };
        let ticker = productName.toUpperCase();
        // Check if it's a company name that needs mapping
        if (COMPANY_TICKER_MAP[ticker]) {
          ticker = COMPANY_TICKER_MAP[ticker];
        } else if (ticker.includes(' ')) {
          // If it's a company name without a mapping, try to extract a ticker-like pattern
          // For names like "Apple Inc", try common patterns
          const parts = ticker.split(/\s+/);
          // If last part is a common suffix (INC, CORP, etc.), try to find ticker in the name
          const lastPart = parts[parts.length - 1];
          if (['INC', 'INC.', 'CORP', 'CORPORATION', 'LTD', 'LLC'].includes(lastPart) && parts.length > 1) {
            // Try to use first word as ticker (works for some like "Apple" -> "AAPL" but not perfect)
            // For now, keep the full name and let the system handle it
            ticker = productName.toUpperCase();
          }
        }
        const qty = parseFloat(row['Quantity'] ?? row['Qty'] ?? row['Shares'] ?? '0');
        const price = parseFloat(row['Price'] ?? row['Trade Price'] ?? row['Execution Price'] ?? '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['Currency'] ?? 'EUR',
          fees: (row['Commission'] ?? '0') ? parseFloat(row['Commission']) : 0,
          source: 'degiro',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'degiro',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct Binance parser (fallback for cached package issues)
  const parseBinanceDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        const action = (row['Type'] ?? row['Action'] ?? '').toUpperCase();
        if (!action || action.includes('DEPOSIT') || action.includes('WITHDRAWAL') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = row['Date'] ?? row['Time'] ?? row['Timestamp'] ?? '';
        // Binance dates are in ISO format
        let isoDate = dateStr;
        if (dateStr && !dateStr.includes('T')) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            isoDate = date.toISOString();
          }
        }
        
        // Extract ticker from Market column (e.g., "BTC/USDT" -> "BTC")
        const marketValue = row['Market'] ?? row['Symbol'] ?? row['Ticker'] ?? '';
        const ticker = marketValue.split('/')[0].trim().toUpperCase();
        const qty = parseFloat(row['Amount'] ?? row['Quantity'] ?? row['Qty'] ?? '0');
        const price = parseFloat(row['Price'] ?? row['Trade Price'] ?? row['Execution Price'] ?? '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['Currency'] ?? 'USD',
          fees: (row['Fee'] ?? '0') ? parseFloat(row['Fee']) : 0,
          source: 'binance',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'binance',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct IBKR Flex parser (fallback for cached package issues)
  const parseIBKRFlexDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        // IBKR Flex may not have Action column - infer from quantity sign or proceeds
        let action = (row['Action'] || row['Type'] || '').toUpperCase();
        let qty = parseFloat(row['Quantity'] ?? '0');
        const proceeds = parseFloat(row['Proceeds'] ?? '0');
        
        
        
        // If no Action column, infer from quantity sign (negative = sell) or proceeds sign
        if (!action) {
          if (qty < 0) {
            action = 'SELL';
            qty = Math.abs(qty); // Make positive
          } else if (proceeds < 0) {
            action = 'BUY'; // Negative proceeds = buy (money out)
            qty = Math.abs(qty);
          } else if (proceeds > 0 && qty > 0) {
            action = 'SELL'; // Positive proceeds = sell (money in)
          } else {
            action = 'BUY'; // Default
          }
        }
        
        if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        
        // Ensure quantity is positive
        if (qty < 0) qty = Math.abs(qty);
        
        const dateStr = row['Date'] ?? '';
        // IBKR Flex uses MM/DD/YYYY format
        const dateParts = dateStr.split('/');
        const isoDate = dateParts.length === 3 
          ? `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}T00:00:00.000Z`
          : dateStr;
        
        const ticker = (row['Symbol'] ?? '').trim().toUpperCase();
        const price = parseFloat(row['T.Price'] ?? row['Price'] ?? '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['Currency'] ?? 'USD',
          fees: 0,
          source: 'ibkr_flex',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'ibkr_flex',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct IG parser (fallback for cached package issues)
  const parseSharesightDirectly = async (csvContent: string): Promise<{
    trades: any[];
    warnings: string[];
    broker: string;
  }> => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { trades: [], warnings: ['CSV file is empty or has no data rows'], broker: 'sharesight' };
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const result: any[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      
      
      
      try {
        const action = (row['Transaction Type'] || row['transaction type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('SPLIT')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const ticker = (row['Instrument Code'] || row['instrument code'] || '').trim().toUpperCase();
        const qty = parseFloat(row['Quantity'] || row['quantity'] || '0');
        const price = parseFloat(row['Price in Dollars'] || row['price in dollars'] || '0');
        const dateStr = row['Trade Date'] || row['trade date'] || '';
        const currency = row['Brokerage Currency'] || row['brokerage currency'] || 'USD';
        
        // Parse date (YYYY-MM-DD format)
        let isoDate = '';
        if (dateStr) {
          const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            const [, year, month, day] = dateMatch;
            isoDate = `${year}-${month}-${day}T00:00:00.000Z`;
          } else {
            // Try other formats
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              isoDate = date.toISOString();
            }
          }
        }
        
        if (!ticker || !(qty > 0) || !(price > 0) || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${isoDate})`);
          continue;
        }
        
        
        
        result.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency,
          fees: 0,
          source: 'sharesight',
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message || 'Unknown error'}`);
        
      }
    }
    
    
    
    return { trades: result, warnings, broker: 'sharesight' };
  };

  const parseIGDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        
        
        const action = (row['Action'] || row['Type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = row['Date'] || '';
        // IG uses DD/MM/YYYY format
        const dateParts = dateStr.split('/');
        const isoDate = dateParts.length === 3 
          ? `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}T00:00:00.000Z`
          : dateStr;
        
        // IG uses "Instrument" column which may contain full names like "Apple Inc (AAPL)" or "US Tech 100"
        // Extract ticker from Instrument - try to find ticker in parentheses, otherwise use the full name
        const instrument = (row['Instrument'] || '').trim();
        let ticker = instrument;
        const tickerMatch = instrument.match(/\(([A-Z0-9]+)\)/);
        if (tickerMatch) {
          ticker = tickerMatch[1]; // Extract ticker from parentheses
        } else {
          // If no parentheses, use the full instrument name (e.g., "US Tech 100" -> "US Tech 100")
          ticker = instrument.toUpperCase();
        }
        
        const qty = parseFloat(row['Quantity'] ?? '0');
        const price = parseFloat(row['Price'] ?? '0');
        
        
        
        if (!ticker || qty <= 0 || price <= 0 || !isoDate) {
          warnings.push(`Row ${i + 1}: Invalid data (ticker: ${ticker}, qty: ${qty}, price: ${price}, date: ${dateStr})`);
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: row['Currency'] ?? 'GBP',
          fees: 0,
          source: 'ig',
          rawHash: `${ticker}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message}`);
        
      }
    }
    
    const result = {
      broker: 'ig',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    return result;
  };

  // Direct Revolut parser (fallback for cached package issues)
  const parseRevolutDirectly = async (csvContent: string): Promise<{
    broker: string;
    trades: NormalizedTrade[];
    warnings: string[];
    meta: any;
  }> => {
    const t0 = performance.now();
    const lines = csvContent.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    // Use proper CSV parsing to handle quoted values and commas within fields
    const header = parseCSVLine(lines[0]);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];
    
    // Create case-insensitive header map for easier lookup
    const headerMap: Record<string, string> = {};
    header.forEach(h => {
      const normalized = h.trim();
      headerMap[normalized.toLowerCase()] = normalized;
    });
    
    // Helper function to get column value (case-insensitive)
    const getColumn = (possibleNames: string[]): string => {
      for (const name of possibleNames) {
        const normalized = name.toLowerCase();
        if (headerMap[normalized]) {
          return headerMap[normalized];
        }
      }
      return '';
    };
    
    
    
    for (let i = 1; i < lines.length; i++) {
      try {
        // Skip empty lines
        if (!lines[i] || lines[i].trim() === '') {
          continue;
        }
        
        // Use proper CSV parsing to handle quoted values
        const values = parseCSVLine(lines[i]);
        
        // Skip rows with no values or all empty values
        if (!values || values.length === 0 || values.every(v => !v || v.trim() === '')) {
          continue;
        }
        
        const row: Record<string, string> = {};
        header.forEach((h, idx) => {
          row[h] = (values[idx] || '').trim();
        });
        
        
        
        // Handle both Action and Type columns (case-insensitive), strip suffixes like "BUY - MARKET" -> "BUY"
        const actionCol = getColumn(['Action', 'Type', 'Transaction Type', 'Trade Type']);
        const rawAction = actionCol ? (row[actionCol] || '') : (row['Action'] || row['Type'] || row['action'] || row['type'] || '');
        let action = rawAction.toUpperCase();
        
        if (!action) {
          
          continue;
        }
        
        // Extract base action from suffixes (e.g., "BUY - MARKET" -> "BUY")
        action = action.split(/\s*-\s*/)[0].trim();
        
        // Skip non-trade rows
        const isNonTrade = action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER') || 
            action.includes('CASH TOP-UP') || action.includes('CASH WITHDRAWAL') || action.includes('TOP-UP') || 
            action.includes('WITHDRAWAL') || !action;
        
        if (isNonTrade) {
          continue;
        }
        
        // Skip rows without ticker/stock (case-insensitive)
        const tickerCol = getColumn(['Stock', 'Ticker', 'Symbol', 'Instrument', 'Security']);
        const tickerValue = tickerCol ? (row[tickerCol] || '') : (row['Stock'] ?? row['Ticker'] ?? row['Symbol'] ?? row['stock'] ?? row['ticker'] ?? row['symbol'] ?? '');
        
        if (!tickerValue || tickerValue.trim() === '') {
          
          continue;
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        
        // Handle both "Price" and "Price per share" columns (case-insensitive), strip currency prefix/symbol
        const priceCol = getColumn(['Price', 'Price per share', 'Trade Price', 'Execution Price', 'Unit Price', 'Price Per Share']);
        const rawPriceValue = priceCol ? (row[priceCol] || '0') : (row['Price'] ?? row['Price per share'] ?? row['Trade Price'] ?? row['Execution Price'] ?? row['price'] ?? row['price per share'] ?? '0');
        // Strip currency prefix (e.g., "USD 111.97" -> "111.97") or currency symbol (e.g., "$111.97" -> "111.97") and remove any quotes and commas
        let priceValue = rawPriceValue.toString()
          .replace(/^[A-Z]{3}\s+/i, '') // Remove "USD " prefix
          .replace(/^[$£€¥₹]/, '') // Remove currency symbols ($, £, €, ¥, ₹)
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/,/g, '') // Remove commas (e.g., "1,234.56" -> "1234.56")
          .trim();
        
        
        // Handle date columns (case-insensitive)
        const dateCol = getColumn(['Date', 'Trade Date', 'Transaction Date', 'Execution Date', 'Settlement Date']);
        const dateStr = dateCol ? (row[dateCol] || '').toString().replace(/^["']|["']$/g, '').trim() : (row['Date'] ?? row['Trade Date'] ?? row['Transaction Date'] ?? row['date'] ?? '').toString().replace(/^["']|["']$/g, '').trim();
        // Revolut uses ISO timestamp format (e.g., "2025-04-15T17:28:56.993Z")
        let isoDate = dateStr;
        if (dateStr) {
          // Remove quotes if present
          const cleanDateStr = dateStr.replace(/^["']|["']$/g, '');
          if (cleanDateStr.includes('T') || cleanDateStr.includes('Z')) {
            // ISO format - validate and convert
            const date = new Date(cleanDateStr);
            if (!isNaN(date.getTime())) {
              isoDate = date.toISOString();
            } else {
              warnings.push(`Row ${i + 1}: Invalid ISO date format: ${cleanDateStr}`);
              continue;
            }
          } else {
            // Try to parse as regular date
            const date = new Date(cleanDateStr);
            if (!isNaN(date.getTime())) {
              isoDate = date.toISOString();
            } else {
              warnings.push(`Row ${i + 1}: Invalid date format: ${cleanDateStr}`);
              continue;
            }
          }
        }
        
        // Parse quantity and price, handling quoted values and removing currency symbols (case-insensitive)
        const qtyCol = getColumn(['Quantity', 'Qty', 'Shares', 'Amount', 'Units']);
        const rawQty = qtyCol ? (row[qtyCol] || '0') : (row['Quantity'] ?? row['Qty'] ?? row['Shares'] ?? row['quantity'] ?? row['qty'] ?? row['shares'] ?? '0');
        const qtyStr = rawQty.toString().replace(/^["']|["']$/g, '').trim().replace(/,/g, '').replace(/\s+/g, ''); // Remove commas and whitespace (e.g., "1,234.56" or "1 234.56")
        const priceStr = priceValue.toString().replace(/^["']|["']$/g, '').trim().replace(/,/g, '').replace(/\s+/g, ''); // Remove commas and whitespace
        const qty = parseFloat(qtyStr);
        const price = parseFloat(priceStr);
        // Handle currency column (case-insensitive)
        const currencyCol = getColumn(['Currency', 'CCY', 'Base Currency']);
        const currency = (currencyCol ? (row[currencyCol] || 'USD') : (row['Currency'] ?? row['currency'] ?? 'USD')).toString().replace(/^["']|["']$/g, '').trim().toUpperCase();
        
        
        
        // More lenient validation: allow very small positive numbers (>= 0.000001) and check for NaN
        const isValid = tickerValue && !isNaN(qty) && !isNaN(price) && qty >= 0.000001 && price >= 0.000001 && isoDate;
        
        if (!isValid) {
          const warningMsg = `Row ${i + 1}: Invalid data (ticker: ${tickerValue}, qty: ${qty}, price: ${price}, date: ${isoDate})`;
          warnings.push(warningMsg);
          
          continue;
        }
        
        trades.push({
          date: isoDate,
          ticker: tickerValue.trim().toUpperCase(),
          type: tradeType,
          qty,
          price,
          currency: currency.toUpperCase(),
          fees: 0,
          source: 'revolut',
          rawHash: `${tickerValue}-${dateStr}-${qty}-${price}`
        });
      } catch (e: any) {
        warnings.push(`Row ${i + 1}: ${e.message || 'Unknown error'}`);
        
      }
    }
    
    const result = {
      broker: 'revolut',
      trades,
      warnings,
      meta: {
        rows: lines.length - 1,
        invalid: warnings.length,
        durationMs: Math.round(performance.now() - t0),
        version: '1.0.5-direct'
      }
    };
    
    
    
    
    
    return result;
  };

  // Helper to get broker display name
  const getBrokerDisplayName = (brokerId: BrokerId | 'unknown'): string => {
    const names: Record<BrokerId | 'unknown', string> = {
      'schwab': 'Charles Schwab',
      'vanguard': 'Vanguard',
      'etrade': 'E*TRADE',
      'fidelity': 'Fidelity',
      'trading212': 'Trading212',
      'freetrade': 'Freetrade',
      'degiro': 'DEGIRO',
      'ig': 'IG',
      'saxo': 'Saxo',
      'interactive_investor': 'Interactive Investor',
      'revolut': 'Revolut',
      'ibkr_flex': 'Interactive Brokers',
      'kraken': 'Kraken',
      'binance': 'Binance',
      'coinbase': 'Coinbase',
      'koinly': 'Koinly',
      'turbotax': 'TurboTax',
      'ghostfolio': 'Ghostfolio',
      'sharesight': 'Sharesight',
      'unknown': 'Unknown'
    };
    return names[brokerId] || brokerId;
  };

  const handleFileUpload = async (file: File) => {
    console.log('CSV upload started:', file.name);
    
    // Track CSV import start
    trackCSVImportStart({
      source: 'dashboard_upload'
    });
    
    // Track funnel stage: first import start
    const { trackFunnelStage } = require('@/app/lib/analytics/conversion');
    trackFunnelStage('first_import_start', 'user_onboarding', {
      source: 'dashboard_upload',
      fileName: file.name,
      fileSize: file.size
    });
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showAlert('Invalid File Type', 'Please select a valid CSV file.', 'error');
      trackCSVImportError({
        errorType: 'invalid_file_type',
        errorMessage: 'File is not a CSV'
      });
      return;
    }

    setProcessing(true);

    try {
      const csvContent = await file.text();
      console.log('CSV content read successfully');
      
      // Convert File to RawFile format for adapter system
      const rawFile = fileToRawFile(file);
      
      // Auto-detect broker from CSV sample
      const sample = csvContent.slice(0, 2048);
      
      
      
      let detectedBroker: BrokerId | 'unknown' = 'unknown';
      try {
        console.log('[CSVImporter] About to call detection', { 
          sampleLength: sample.length, 
          firstLine: sample.split('\n')[0],
          hasDetectBrokerFromSample: typeof detectBrokerFromSample,
          hasDetectBroker: typeof detectBroker
        });
        
        
        // Try direct call to detectBroker as fallback
        let result: BrokerId | 'unknown' = 'unknown';
        try {
          result = detectBrokerFromSample(sample);
          console.log('[CSVImporter] detectBrokerFromSample returned', { result, type: typeof result });
          
        } catch (e1) {
          console.warn('[CSVImporter] detectBrokerFromSample failed, trying detectBroker directly', e1);
          
          try {
            result = detectBroker(sample);
            console.log('[CSVImporter] detectBroker returned', { result, type: typeof result });
            
          } catch (e2) {
            console.error('[CSVImporter] Both detection methods failed', { e1, e2 });
            
          }
        }
        
        // Manual detection fallbacks (for cached package issues)
        const firstLine = sample.split('\n')[0] || '';
        
        // Common column checks (define all before using in detection logic)
        const hasMarket = /\bMarket\b/i.test(firstLine);
        const hasType = /\bType\b/i.test(firstLine);
        const hasDate = /\bDate\b/i.test(firstLine);
        const hasAmount = /\bAmount\b/i.test(firstLine);
        const hasPrice = /\bPrice\b/i.test(firstLine);
        const hasQuantity = /\bQuantity\b/i.test(firstLine);
        const hasStock = /^Stock,|,Stock,|,Stock$/i.test(firstLine) || /^Stock$/i.test(firstLine);
        const hasAction = /^Action,|,Action,|,Action$/i.test(firstLine) || /^Action$/i.test(firstLine);
        const hasProduct = /^Product,|,Product,|,Product$/i.test(firstLine) || /^Product$/i.test(firstLine);
        
        // Manual Binance detection (has unique "Market" column)
        // Binance format: Date,Type,Market,Amount,Price
        const manualBinanceDetect = hasMarket && hasType && (hasDate || hasAmount || hasPrice);
        
        // Manual Koinly detection
        const hasKoinlyDate = /Koinly Date/i.test(firstLine);
        const hasPair = /Pair/i.test(firstLine);
        const hasSentAmount = /Sent Amount/i.test(firstLine);
        const hasReceivedAmount = /Received Amount/i.test(firstLine);
        const hasKoinly = /Koinly/i.test(sample);
        const manualKoinlyDetect = hasKoinlyDate || (hasPair && hasSentAmount && hasReceivedAmount) || hasKoinly;
        
        // Manual Coinbase detection (has unique "Transaction Type" + "Spot Price at Transaction" + "Asset")
        const hasTransactionType = /Transaction Type/i.test(firstLine);
        const hasSpotPriceAtTransaction = /Spot Price at Transaction/i.test(firstLine);
        const hasAsset = /Asset/i.test(firstLine);
        // Coinbase has Transaction Type + Spot Price at Transaction + Asset, but NOT Action or Product (which Degiro has)
        const manualCoinbaseDetect = hasTransactionType && hasSpotPriceAtTransaction && hasAsset && !hasAction && !hasProduct;
        
        
        
        // Manual Freetrade detection (has unique "Date,Stock,Action,Quantity,Price" format)
        const manualFreetradeDetect = hasStock && hasAction && hasDate && hasQuantity && hasPrice;
        
        // Manual Ghostfolio detection (has unique "accountId" + "unitPrice" + "symbol" combination)
        const hasAccountId = /accountId/i.test(firstLine);
        const hasUnitPrice = /unitPrice/i.test(firstLine);
        const hasSymbol = /^symbol,|,symbol,|,symbol$/i.test(firstLine) || /^symbol$/i.test(firstLine);
        const manualGhostfolioDetect = hasAccountId && hasUnitPrice && hasSymbol && hasDate;
        
        // Manual IG detection (has unique "Instrument" + "Action" + "Quantity" + "Price" combination)
        const hasInstrument = /^Instrument,|,Instrument,|,Instrument$/i.test(firstLine) || /^Instrument$/i.test(firstLine);
        const manualIGDetect = hasInstrument && hasAction && hasDate && hasQuantity && hasPrice;
        
        // Manual Kraken detection (has unique "Type" + "Asset" + "Amount" + "Price" combination)
        // Kraken format: Date,Type,Asset,Amount,Price (different from Degiro which has "Action" not "Type", and "Product" not "Asset")
        // Reuse hasAsset from Coinbase detection above (both check for "Asset" column)
        const hasKrakenType = /^Type,|,Type,|,Type$/i.test(firstLine) || /^Type$/i.test(firstLine);
        const manualKrakenDetect = hasAsset && hasKrakenType && hasDate && hasAmount && hasPrice && !hasAction; // "Type" not "Action", "Asset" not "Product"
        
        // Manual Saxo detection (has unique "Trade Date" + "Instrument" combination, different from eTrade which has "Symbol" not "Instrument")
        // Reuse hasSymbol from Ghostfolio detection above (both check for "Symbol" column)
        const hasTradeDate = /Trade Date/i.test(firstLine);
        const hasSaxoInstrument = /^Instrument,|,Instrument,|,Instrument$/i.test(firstLine) || /^Instrument$/i.test(firstLine);
        const manualSaxoDetect = hasTradeDate && hasSaxoInstrument && hasAction && hasQuantity && hasPrice && !hasSymbol; // "Instrument" not "Symbol", "Trade Date" not just "Date"
        
        // Manual Sharesight detection (has unique "Trade Date" + "Instrument Code" + "Price in Dollars" + "Transaction Type" combination)
        const hasInstrumentCode = /Instrument Code/i.test(firstLine);
        const hasPriceInDollars = /Price in Dollars/i.test(firstLine);
        const hasSharesightTransactionType = /Transaction Type/i.test(firstLine);
        const hasBrokerageCurrency = /Brokerage Currency/i.test(firstLine);
        const manualSharesightDetect = hasTradeDate && hasInstrumentCode && hasPriceInDollars && hasSharesightTransactionType && hasQuantity && !hasSymbol; // "Instrument Code" not "Symbol", "Price in Dollars" not just "Price", "Transaction Type" not "Action"
        
        // Manual TurboTax detection (has unique "Currency Name" + "Purchase Date" + "Cost Basis" + "Date Sold" + "Proceeds" combination)
        const hasCurrencyName = /Currency Name/i.test(firstLine);
        const hasPurchaseDate = /Purchase Date/i.test(firstLine);
        const hasCostBasis = /Cost Basis/i.test(firstLine);
        const hasDateSold = /Date Sold/i.test(firstLine);
        const hasProceeds = /Proceeds/i.test(firstLine);
        const manualTurboTaxDetect = hasCurrencyName && hasPurchaseDate && hasCostBasis && hasDateSold && hasProceeds && !hasQuantity && !hasPrice; // TurboTax Universal Gains format doesn't have Quantity or Price columns
        
        // Manual Degiro detection (has unique "Product" + "Action" + "Date" + "Quantity" + "Price" combination)
        // Degiro format: Date,Product,Action,Quantity,Price (different from IG which has "Instrument" not "Product")
        const manualDegiroDetect = hasProduct && hasAction && hasDate && hasQuantity && hasPrice && !hasInstrument; // "Product" not "Instrument", has "Action"
        
        // Manual Revolut detection (has unique "Price per share" + "Ticker" + "Type" combination, different from Degiro which has "Product" not "Ticker")
        // More flexible detection: check if these key columns exist anywhere in the header
        const hasPricePerShare = /\bPrice per share\b/i.test(firstLine);
        const hasRevolutTicker = /\bTicker\b/i.test(firstLine);
        const hasRevolutType = /\bType\b/i.test(firstLine);
        const hasTotalAmount = /\bTotal Amount\b/i.test(firstLine);
        const hasFXRate = /\bFX Rate\b/i.test(firstLine);
        // More lenient: if we have Price per share + Ticker + Type, it's likely Revolut (even if other brokers might match)
        const manualRevolutDetect = hasPricePerShare && hasRevolutTicker && hasRevolutType && hasDate && hasQuantity && !hasAction; // "Price per share" not "Price", "Ticker" not "Product" or "Stock", "Type" not "Action"
        
        
        
        // Override degiro/ig/unknown with binance if Market column detected
        if (manualBinanceDetect && (result === 'degiro' || result === 'unknown' || result === 'ig')) {
          const originalDetected = result;
          result = 'binance';
          console.log('[CSVImporter] Manual Binance detection succeeded, overriding', originalDetected);
          
        } else if (manualCoinbaseDetect && (result === 'degiro' || result === 'unknown')) {
          // Override degiro with coinbase if Coinbase-specific columns detected
          const originalDetected = result;
          result = 'coinbase';
          console.log('[CSVImporter] Manual Coinbase detection succeeded, overriding', originalDetected);
          
        } else if (manualFreetradeDetect && (result === 'degiro' || result === 'unknown')) {
          // Override degiro with freetrade if Freetrade-specific columns detected
          const originalDetected = result;
          result = 'freetrade';
          console.log('[CSVImporter] Manual Freetrade detection succeeded, overriding', originalDetected);
          
        } else if (manualDegiroDetect && (result === 'ig' || result === 'unknown')) {
          // Override ig/unknown with degiro if Degiro-specific columns detected (Product + Action, not Instrument)
          const originalDetected = result;
          result = 'degiro';
          console.log('[CSVImporter] Manual Degiro detection succeeded, overriding', originalDetected);
          
        } else if (manualGhostfolioDetect && (result === 'degiro' || result === 'unknown' || result === 'ig')) {
          // Override degiro/ig/unknown with ghostfolio if Ghostfolio-specific columns detected
          const originalDetected = result;
          result = 'ghostfolio';
          console.log('[CSVImporter] Manual Ghostfolio detection succeeded, overriding', originalDetected);
          
        } else if (manualIGDetect && (result === 'degiro' || result === 'unknown')) {
          // Override degiro with ig if IG-specific columns detected
          const originalDetected = result;
          result = 'ig';
          console.log('[CSVImporter] Manual IG detection succeeded, overriding', originalDetected);
          
        } else if (manualKrakenDetect && (result === 'degiro' || result === 'unknown' || result === 'ig')) {
          // Override degiro/ig/unknown with kraken if Kraken-specific columns detected (Type + Asset, not Action + Product)
          const originalDetected = result;
          result = 'kraken';
          console.log('[CSVImporter] Manual Kraken detection succeeded, overriding', originalDetected);
          
        } else if (manualSaxoDetect && (result === 'etrade' || result === 'unknown')) {
          // Override etrade with saxo if Saxo-specific columns detected (Trade Date + Instrument, not Symbol)
          const originalDetected = result;
          result = 'saxo';
          console.log('[CSVImporter] Manual Saxo detection succeeded, overriding', originalDetected);
          
        } else if (manualSharesightDetect && (result === 'etrade' || result === 'unknown')) {
          // Override etrade with sharesight if Sharesight-specific columns detected (Trade Date + Instrument Code + Price in Dollars + Transaction Type)
          const originalDetected = result;
          result = 'sharesight';
          console.log('[CSVImporter] Manual Sharesight detection succeeded, overriding', originalDetected);
          
        } else if (manualTurboTaxDetect && (result === 'unknown' || result === 'etrade')) {
          // Override unknown/etrade with turbotax if TurboTax-specific columns detected (Currency Name + Purchase Date + Cost Basis + Date Sold + Proceeds)
          const originalDetected = result;
          result = 'turbotax';
          console.log('[CSVImporter] Manual TurboTax detection succeeded, overriding', originalDetected);
          
        } else if (manualRevolutDetect && (result === 'degiro' || result === 'unknown' || result === 'ig')) {
          // Override degiro/unknown/ig with revolut if Revolut-specific columns detected (Price per share + Ticker + Type)
          // Note: IG detection can incorrectly match Revolut CSVs, so we override it here
          const originalDetected = result;
          result = 'revolut';
          console.log('[CSVImporter] Manual Revolut detection succeeded, overriding', originalDetected);
          
        }
        
        
        
        if (manualKoinlyDetect && result === 'unknown') {
          result = 'koinly';
          console.log('[CSVImporter] Manual Koinly detection succeeded, using koinly');
          
          
        }
        
        detectedBroker = result;
        console.log('[CSVImporter] After detection', { detectedBroker, sampleLength: sample.length });
        
      } catch (error) {
        console.error('[CSVImporter] Detection error', error);
        
      }
      
      
      
      console.log('🔍 Detected broker:', detectedBroker);
      
      
      
      if (detectedBroker === 'unknown') {
        trackCSVImportError({
          errorType: 'broker_detection_failed',
          errorMessage: 'Could not detect broker from CSV format'
        });
        showAlert(
          'Broker Not Detected',
          'Could not detect the broker format from your CSV file. Please ensure your CSV matches one of the supported broker formats.',
          'warning'
        );
        setProcessing(false);
        return;
      }

      // Parse CSV using adapter system
      let result;
      try {
        
        result = await parseCSVAdapter(rawFile, 'en-US', detectedBroker);
        
        console.log('Parsing complete:', result.trades.length, 'trades found');
        console.log('Broker:', result.broker);
        console.log('Warnings:', result.warnings);
      } catch (parseError: any) {
        console.error('[CSVImporter] parseCSVAdapter error', parseError);
        
        
        // If adapter not found, implement parser directly for specific brokers
        if (parseError?.message?.includes('Broker adapter not found')) {
          if (detectedBroker === 'ghostfolio') {
            console.warn('[CSVImporter] Adapter not found in package, using direct Ghostfolio parser');
            
            
            try {
              result = await parseGhostfolioDirectly(csvContent);
              console.log('Parsing complete (direct Ghostfolio):', result.trades.length, 'trades found');
              
            } catch (directParseError: any) {
              console.error('[CSVImporter] Direct Ghostfolio parser also failed', directParseError);
              
              throw directParseError; // Re-throw to show error to user
            }
          } else if (detectedBroker === 'koinly') {
            console.warn('[CSVImporter] Adapter not found in package, using direct Koinly parser');
            
            
            try {
              result = await parseKoinlyDirectly(csvContent);
              console.log('Parsing complete (direct Koinly):', result.trades.length, 'trades found');
              
            } catch (directParseError: any) {
              console.error('[CSVImporter] Direct parser also failed', directParseError);
              
              throw directParseError; // Re-throw to show error to user
            }
          } else if (detectedBroker === 'freetrade') {
            console.warn('[CSVImporter] Adapter not found in package, using direct Freetrade parser');
            
            
            try {
              result = await parseFreetradeDirectly(csvContent);
              console.log('Parsing complete (direct Freetrade):', result.trades.length, 'trades found');
              
            } catch (directParseError: any) {
              console.error('[CSVImporter] Direct Freetrade parser also failed', directParseError);
              
              throw directParseError; // Re-throw to show error to user
            }
          } else if (detectedBroker === 'sharesight') {
            console.warn('[CSVImporter] Adapter not found in package, using direct Sharesight parser');
            
            
            try {
              result = await parseSharesightDirectly(csvContent);
              console.log('Parsing complete (direct Sharesight):', result.trades.length, 'trades found');
              
            } catch (directParseError: any) {
              console.error('[CSVImporter] Direct Sharesight parser also failed', directParseError);
              
              throw directParseError; // Re-throw to show error to user
            }
          } else if (detectedBroker === 'turbotax') {
            console.warn('[CSVImporter] Adapter not found in package, using direct TurboTax parser');
            
            
            try {
              // TurboTax Universal Gains format: Currency Name, Purchase Date, Cost Basis, Date Sold, Proceeds
              const lines = csvContent.split('\n').filter(line => line.trim());
              if (lines.length < 2) {
                throw new Error('CSV file is empty or has no data rows');
              }
              
              const header = lines[0].split(',').map(h => h.trim());
              const trades: any[] = [];
              const warnings: string[] = [];
              
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(',').map(v => v.trim());
                const row: Record<string, string> = {};
                header.forEach((h, idx) => {
                  row[h] = values[idx] || '';
                });
                
                try {
                  const currencyName = row['Currency Name'] || row['currency name'] || '';
                  if (!currencyName) continue;
                  
                  const purchaseDate = row['Purchase Date'] || row['purchase date'] || '';
                  const costBasis = parseFloat(row['Cost Basis'] || row['cost basis'] || '0');
                  const dateSold = row['Date Sold'] || row['date sold'] || '';
                  const proceeds = parseFloat(row['Proceeds'] || row['proceeds'] || '0');
                  
                  if (!purchaseDate || !dateSold || costBasis <= 0 || proceeds <= 0) {
                    continue;
                  }
                  
                  // Parse dates (MM/DD/YYYY format)
                  const parseDate = (dateStr: string): string => {
                    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                    if (match) {
                      const [, month, day, year] = match;
                      return `${year}-${month}-${day}T00:00:00.000Z`;
                    }
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                      return date.toISOString();
                    }
                    return '';
                  };
                  
                  // Normalize currency names to ticker symbols
                  const normalizeCurrencyToTicker = (currency: string): string => {
                    const normalized = currency.trim().toUpperCase();
                    const currencyMap: Record<string, string> = {
                      'BITCOIN': 'BTC',
                      'ETHEREUM': 'ETH',
                      'SOLANA': 'SOL',
                      'CARDANO': 'ADA',
                      'POLKADOT': 'DOT',
                      'POLYGON': 'MATIC',
                      'AVALANCHE': 'AVAX',
                      'CHAINLINK': 'LINK',
                      'UNISWAP': 'UNI',
                      'COSMOS': 'ATOM',
                      'ALGORAND': 'ALGO',
                      'RIPPLE': 'XRP',
                      'DOGECOIN': 'DOGE',
                      'LITECOIN': 'LTC',
                      'BITCOIN CASH': 'BCH',
                      'ETHEREUM CLASSIC': 'ETC',
                      'STELLAR': 'XLM',
                      'TRON': 'TRX',
                      'EOS': 'EOS',
                    };
                    return currencyMap[normalized] || normalized;
                  };
                  
                  const ticker = normalizeCurrencyToTicker(currencyName);
                  const avgPrice = (costBasis + proceeds) / 2;
                  const estimatedQty = avgPrice > 0 ? Math.max(1, Math.round(costBasis / avgPrice)) : 1;
                  const buyPricePerUnit = estimatedQty > 0 ? costBasis / estimatedQty : costBasis;
                  const sellPricePerUnit = estimatedQty > 0 ? proceeds / estimatedQty : proceeds;
                  
                  // Create BUY transaction
                  trades.push({
                    date: parseDate(purchaseDate),
                    ticker,
                    type: 'BUY',
                    qty: estimatedQty,
                    price: buyPricePerUnit,
                    currency: 'USD',
                    fees: 0,
                    source: 'turbotax',
                  });
                  
                  // Create SELL transaction
                  trades.push({
                    date: parseDate(dateSold),
                    ticker,
                    type: 'SELL',
                    qty: estimatedQty,
                    price: sellPricePerUnit,
                    currency: 'USD',
                    fees: 0,
                    source: 'turbotax',
                  });
                } catch (e: any) {
                  warnings.push(`Row ${i + 1}: ${e.message || 'Unknown error'}`);
                }
              }
              
              result = { trades, warnings, broker: 'turbotax' };
              console.log('Parsing complete (direct TurboTax):', result.trades.length, 'trades found');
              
            } catch (directParseError: any) {
              console.error('[CSVImporter] Direct TurboTax parser also failed', directParseError);
              
              throw directParseError; // Re-throw to show error to user
            }
          } else {
            throw parseError; // Re-throw if not ghostfolio/koinly/freetrade/sharesight/turbotax
          }
        } else {
          throw parseError; // Re-throw if different error
        }
      }
      
      // If parsing succeeded but returned 0 trades for freetrade, ghostfolio, ibkr_flex, ig, sharesight, revolut, kraken, degiro, or binance, try direct parser
      // For Degiro, also trigger fallback if suspiciously few trades with many warnings (suggests company name parsing issues)
      const shouldUseDirectParser = result && (
        (result.trades.length === 0 && (detectedBroker === 'freetrade' || detectedBroker === 'ghostfolio' || detectedBroker === 'ibkr_flex' || detectedBroker === 'ig' || detectedBroker === 'sharesight' || detectedBroker === 'revolut' || detectedBroker === 'kraken' || detectedBroker === 'degiro' || detectedBroker === 'binance')) ||
        (detectedBroker === 'degiro' && result.trades.length < 3 && result.warnings.length >= 2)
      );
      
      if (shouldUseDirectParser) {
        if (detectedBroker === 'freetrade') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct Freetrade parser');
          
          try {
            result = await parseFreetradeDirectly(csvContent);
            console.log('Parsing complete (direct Freetrade):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Freetrade parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'ghostfolio') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct Ghostfolio parser');
          
          try {
            result = await parseGhostfolioDirectly(csvContent);
            console.log('Parsing complete (direct Ghostfolio):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Ghostfolio parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'ibkr_flex') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct IBKR Flex parser');
          
          try {
            result = await parseIBKRFlexDirectly(csvContent);
            console.log('Parsing complete (direct IBKR Flex):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct IBKR Flex parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'ig') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct IG parser');
          
          try {
            result = await parseIGDirectly(csvContent);
            console.log('Parsing complete (direct IG):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct IG parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'sharesight') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct Sharesight parser');
          
          try {
            result = await parseSharesightDirectly(csvContent);
            console.log('Parsing complete (direct Sharesight):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Sharesight parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'revolut') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct Revolut parser');
          
          try {
            result = await parseRevolutDirectly(csvContent);
            console.log('Parsing complete (direct Revolut):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Revolut parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'kraken') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct Kraken parser');
          
          try {
            result = await parseKrakenDirectly(csvContent);
            console.log('Parsing complete (direct Kraken):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Kraken parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'degiro') {
          // Use direct parser if package parser returns 0 trades OR if it returns suspiciously few trades with many warnings
          // (This suggests the package parser is having issues with company name to ticker conversion)
          // Note: The outer condition already checks for trades.length === 0 OR (degiro && trades.length < 3 && warnings.length >= 2)
          console.warn(`[CSVImporter] Package parser returned ${result.trades.length} trades with ${result.warnings.length} warnings, using direct Degiro parser`);
          
          try {
            result = await parseDegiroDirectly(csvContent);
            console.log('Parsing complete (direct Degiro):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Degiro parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        } else if (detectedBroker === 'binance') {
          console.warn('[CSVImporter] Package parser returned 0 trades, using direct Binance parser');
          
          try {
            result = await parseBinanceDirectly(csvContent);
            console.log('Parsing complete (direct Binance):', result.trades.length, 'trades found');
            
          } catch (directParseError: any) {
            console.error('[CSVImporter] Direct Binance parser also failed', directParseError);
            
            // Don't throw - use the original result (0 trades) so user sees the error message
          }
        }
      }
      
      
      
      // Convert NormalizedTrade[] to Trade[] format
      // CRITICAL: Filter out invalid trades with NaN, zero, or missing values BEFORE import
      const trades: Trade[] = result.trades
        .map((t, idx) => ({
          id: `csv-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          date: t.date,
          ticker: t.ticker,
          type: t.type,
          currency: t.currency || 'USD',
          qty: t.qty,
          price: t.price,
          mock: false
        }))
        .filter(t => {
          // Validate all required fields are valid
          const isValid = 
            Number.isFinite(t.qty) && 
            Number.isFinite(t.price) && 
            t.qty > 0 && 
            t.price > 0 &&
            typeof t.ticker === 'string' &&
            t.ticker.trim().length > 0 &&
            (t.type === 'BUY' || t.type === 'SELL') &&
            typeof t.date === 'string' &&
            t.date.trim().length > 0;
          
          if (!isValid) {
            console.warn(`[CSVImporter] Filtering out invalid trade:`, {
              ticker: t.ticker,
              qty: t.qty,
              price: t.price,
              type: t.type,
              date: t.date,
              reason: !Number.isFinite(t.qty) ? 'Invalid qty (NaN/Infinity)' :
                      !Number.isFinite(t.price) ? 'Invalid price (NaN/Infinity)' :
                      t.qty <= 0 ? 'qty <= 0' :
                      t.price <= 0 ? 'price <= 0' :
                      !t.ticker || t.ticker.trim().length === 0 ? 'Missing/invalid ticker' :
                      t.type !== 'BUY' && t.type !== 'SELL' ? 'Invalid type' :
                      !t.date || t.date.trim().length === 0 ? 'Missing date' :
                      'Unknown'
            });
          }
          return isValid;
        });
      
      
      
      const broker = getBrokerDisplayName(result.broker as BrokerId | 'unknown');
      
      if (trades.length === 0) {
        trackCSVImportError({
          errorType: 'no_trades_found',
          errorMessage: 'No valid trades found in CSV',
          broker
        });
        showAlert(
          'No Trades Found',
          'No valid trades found in the CSV file. Please check that:\n• Your CSV contains BUY or SELL transactions\n• Quantity and price values are valid numbers\n• The file format matches the supported formats',
          'warning'
        );
        setProcessing(false);
        return;
      }

      
      
      // Import trades
      onImport(trades);
      
      
      
      // Track successful CSV import (wrap in try-catch to prevent errors from blocking success)
      try {
        trackCSVImportSuccess({
          broker,
          rowCount: trades.length,
          fileSize: file.size
        });
      } catch (trackError) {
        console.warn('[CSVImporter] Tracking error (non-fatal):', trackError);
      }
      
      // Track funnel stage: first import complete
      try {
        const { trackFunnelStage, trackConversion } = require('@/app/lib/analytics/conversion');
        trackFunnelStage('first_import_complete', 'user_onboarding', {
          broker,
          tradeCount: trades.length,
          fileSize: file.size
        });
        
        // Track conversion: first import
        trackConversion('first_import_complete', trades.length, 'USD', {
          broker,
          tradeCount: trades.length
        });
      } catch (trackError) {
        console.warn('[CSVImporter] Funnel tracking error (non-fatal):', trackError);
      }
      
      
      
      showAlert(
        'Import Successful',
        `Successfully imported ${trades.length} trade${trades.length === 1 ? '' : 's'} from ${file.name}`,
        'success'
      );
      
      
      
      
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      
      
      
      trackCSVImportError({
        errorType: 'parse_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      showAlert(
        'Import Error',
        `Error processing CSV file. Please check the format and try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <>
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragActive ? 'var(--brand)' : 'var(--card-border)'}`,
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        background: dragActive ? 'var(--chrome)' : 'var(--card)',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="csv-upload"
        disabled={processing}
      />
      
      <label htmlFor="csv-upload" style={{ cursor: processing ? 'not-allowed' : 'pointer' }}>
        {processing ? (
          <div>
            <div className="skeleton-loader" style={{
              height: '40px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}></div>
            <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Processing CSV file...</p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--brand)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white',
              fontSize: '24px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="var(--accent-warm)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="var(--accent-warm)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18L12 12" stroke="var(--accent-warm)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15L12 12L15 15" stroke="var(--accent-warm)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
              Drop CSV file here or click to browse
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
              Supports multiple CSV formats: Trading212, eToro, Coinbase, OpenBrokerCSV, and more
            </p>
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '12px',
              color: 'var(--muted)',
              textAlign: 'left'
            }}>
              <strong>Supported formats:</strong><br/>
              • Trading212: Action, Time, Ticker, No. of shares, Price / share...<br/>
              • eToro: PositionID, OrderID, Action, Ticker, Units, OpenRate...<br/>
              • Coinbase: Timestamp, Transaction Type, Asset, Quantity, Spot Price...<br/>
              • OpenBrokerCSV: Date, Ticker, Type, Currency, Quantity, Price<br/>
              <br/>
              <strong>Required columns:</strong> Date, Ticker/Symbol, Type/Action, Quantity/Units, Price/Rate
            </div>
          </div>
        )}
      </label>
    </div>

    {/* Alert Modal */}
    {alertModalData && (
      <AlertModal
        isOpen={showAlertModal}
        title={alertModalData.title}
        message={alertModalData.message}
        type={alertModalData.type}
        onClose={() => setShowAlertModal(false)}
      />
    )}
    </>
  );
}
