'use client';

import React, { useState } from 'react';
import { trackCSVImportSuccess, trackCSVImportStart, trackCSVImportError } from '../lib/analytics/events';

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

  // Flexible CSV format validation - handles multiple real-world formats
  const validateCSV = (csvContent: string): { valid: boolean; errors: string[] } => {
    const lines = csvContent.trim().split('\n');
    const errors: string[] = [];

    if (lines.length < 2) {
      errors.push('CSV must have at least a header row and one data row');
      return { valid: false, errors };
    }

    const header = parseCSVLine(lines[0].toLowerCase());
    
    console.log('CSV Header:', header);
    
    // Check for essential columns (flexible naming)
    const hasDate = header.some(h => h.includes('date') || h.includes('timestamp') || h.includes('opentime') || h.includes('time'));
    const hasTicker = header.some(h => h === 'ticker' || h.includes('symbol') || h.includes('asset'));
    const hasType = header.some(h => h.includes('type') || h.includes('action') || h.includes('side'));
    const hasQuantity = header.some(h => h.includes('quantity') || h.includes('units') || h.includes('amount') || h.includes('transacted'));
    const hasPrice = header.some(h => h === 'spot price at transaction' || h.includes('price') || h.includes('rate') || h.includes('openrate') || h.includes('share'));
    
    console.log('Column detection:', { hasDate, hasTicker, hasType, hasQuantity, hasPrice });
    
    const missingColumns = [];
    if (!hasDate) missingColumns.push('date/timestamp');
    if (!hasTicker) missingColumns.push('ticker/symbol');
    if (!hasType) missingColumns.push('type/action/side');
    if (!hasQuantity) missingColumns.push('quantity/units');
    if (!hasPrice) missingColumns.push('price/rate');
    
    if (missingColumns.length > 0) {
      console.error('Validation failed - missing columns:', missingColumns);
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      errors.push(`Found columns: ${header.slice(0, 10).join(', ')}${header.length > 10 ? '...' : ''}`);
      return { valid: false, errors };
    }

    console.log('Validation passed');
    return { valid: true, errors: [] };
  };

  // Parse CSV with flexible column mapping
  const parseCSV = (csvContent: string): { trades: Trade[], broker: string } => {
    const lines = csvContent.trim().split('\n');
    const header = parseCSVLine(lines[0].toLowerCase());
    const trades: Trade[] = [];
    
    console.log('CSV Header:', header);

    // Find column indices with flexible matching - truly broker-agnostic
    const dateIndex = header.findIndex(h => h.includes('date') || h.includes('timestamp') || h.includes('opentime') || h.includes('time'));
    
    // Smart ticker detection - prioritize exact matches, then partial matches
    let tickerIndex = -1;
    if (header.includes('ticker')) {
      tickerIndex = header.findIndex(h => h === 'ticker');
    } else if (header.includes('symbol')) {
      tickerIndex = header.findIndex(h => h === 'symbol');
    } else {
      // Look for any column that might contain tickers
      tickerIndex = header.findIndex(h => h.includes('ticker') || h.includes('symbol') || h.includes('asset') || h.includes('instrument'));
    }
    
    // Smart action/type detection
    const typeIndex = header.findIndex(h => h.includes('action') || h.includes('type') || h.includes('side') || h.includes('transaction type'));
    
    // Smart quantity detection - check for various broker formats (prioritize exact matches)
    let quantityIndex = -1;
    const quantityKeywords = ['no. of shares', 'shares', 'quantity', 'units', 'quantity transacted', 'transacted', 'amount'];
    for (const keyword of quantityKeywords) {
      const index = header.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));
      if (index !== -1) {
        quantityIndex = index;
        break;
      }
    }
    
    // Smart price detection - check for various broker formats (prioritize exact matches)
    let priceIndex = -1;
    const priceKeywords = ['price / share', 'share price', 'price', 'rate', 'openrate', 'spot price', 'open rate'];
    for (const keyword of priceKeywords) {
      const index = header.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));
      if (index !== -1) {
        priceIndex = index;
        break;
      }
    }
    
    // Final fallback if still not found (avoid generic 'amount' and 'price' that might match wrong columns)
    const fallbackQuantityIndex = quantityIndex === -1 ? header.findIndex(h => h.includes('shares') || h.includes('quantity') || h.includes('units')) : quantityIndex;
    const fallbackPriceIndex = priceIndex === -1 ? header.findIndex(h => h.includes('price') || h.includes('rate')) : priceIndex;
    
    // Detect broker format - enhanced detection
    let brokerFormat = 'Unknown';
    if (header.includes('units') && header.includes('openrate')) {
      brokerFormat = 'eToro';
    } else if (header.includes('quantity transacted') && header.includes('spot price at transaction')) {
      brokerFormat = 'Coinbase';
    } else if (header.includes('action') && (header.includes('ticker') || header.includes('isin'))) {
      brokerFormat = 'Trading212';
    } else if (header.includes('t.price') && header.includes('proceeds')) {
      brokerFormat = 'InteractiveBrokers';
    } else if (header.includes('stock') && header.includes('total')) {
      brokerFormat = 'Freetrade';
    } else if (header.includes('side') && header.includes('amount')) {
      brokerFormat = 'Webull';
    } else if (header.includes('quantity') && header.includes('price')) {
      brokerFormat = 'Generic';
    } else if (header.includes('no. of shares') && header.includes('price / share')) {
      brokerFormat = 'Trading212';
    }
    
    // Debug: Log the actual column names and indices
    console.log(`🔍 Detected broker format: ${brokerFormat}`);
    console.log('CSV Column mapping:', {
      brokerFormat,
      dateIndex: dateIndex >= 0 ? header[dateIndex] : 'NOT FOUND',
      tickerIndex: tickerIndex >= 0 ? header[tickerIndex] : 'NOT FOUND', 
      typeIndex: typeIndex >= 0 ? header[typeIndex] : 'NOT FOUND',
      quantityIndex: quantityIndex >= 0 ? header[quantityIndex] : 'NOT FOUND',
      priceIndex: priceIndex >= 0 ? header[priceIndex] : 'NOT FOUND',
      fallbackQuantityIndex: fallbackQuantityIndex >= 0 ? header[fallbackQuantityIndex] : 'NOT FOUND',
      fallbackPriceIndex: fallbackPriceIndex >= 0 ? header[fallbackPriceIndex] : 'NOT FOUND'
    });
    
    // Find currency column if it exists
    const currencyIndex = header.findIndex(h => h.includes('currency') || h.includes('spot price currency'));
    
    console.log('Column indices:', { dateIndex, tickerIndex, typeIndex, quantityIndex, priceIndex, currencyIndex });

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length < header.length) continue;

      try {
        // Extract ticker from the correct column
        let ticker = row[tickerIndex]?.trim().toUpperCase() || '';
        let companyName = '';
        
        // Debug: Check if we're getting the right column
        if (i <= 3) {
          console.log(`Ticker extraction for row ${i}:`, {
            tickerIndex,
            rawTickerValue: row[tickerIndex],
            extractedTicker: ticker,
            isTickerColumn: header[tickerIndex] === 'ticker',
            allColumns: header,
            fullRow: row
          });
        }
        
        // Fallback: If ticker is empty or looks like a company name, try to find a better column
        if (!ticker || ticker.length > 10 || ticker.includes(' ')) {
          // Look for a column that contains short ticker symbols
          for (let j = 0; j < row.length; j++) {
            const value = row[j]?.trim().toUpperCase() || '';
            if (value && value.length <= 10 && !value.includes(' ') && 
                !['BUY', 'SELL', 'USD', 'EUR', 'GBP'].includes(value) &&
                /^[A-Z0-9]+$/.test(value)) {
              console.log(`Found better ticker in column ${j} (${header[j]}): ${value}`);
              ticker = value;
              break;
            }
          }
        }
        
        // If ticker field contains date + company + ticker, extract the ticker (last word)
        if (ticker.includes(' ') && ticker.length > 10) {
          const parts = ticker.split(' ');
          companyName = parts.slice(1, -1).join(' ').trim();
          ticker = parts[parts.length - 1].trim();
        }
        
        const type = row[typeIndex]?.trim().toUpperCase() || '';
        const qty = parseFloat(row[fallbackQuantityIndex]?.trim() || '0');
        // Remove "X1" suffix and other suffixes from price
        const price = parseFloat(row[fallbackPriceIndex]?.trim().replace(/[$,\s]/g, '').replace(/X\d+$/, '') || '0');
        
        // Debug: Log the actual values being parsed
        if (i <= 3) {
          console.log(`Parsed values for row ${i}:`, {
            rawQuantity: row[fallbackQuantityIndex],
            parsedQty: qty,
            rawPrice: row[fallbackPriceIndex], 
            parsedPrice: price,
            quantityColumn: header[fallbackQuantityIndex],
            priceColumn: header[fallbackPriceIndex]
          });
        }
        
        // Get currency from row or default to USD
        const currency = currencyIndex >= 0 ? row[currencyIndex]?.trim().toUpperCase() || 'USD' : 'USD';
        
        // Debug first few rows
        if (i <= 3) {
          console.log(`Row ${i}:`, { 
            rawTicker: row[tickerIndex], 
            extractedTicker: ticker, 
            type, 
            qty, 
            price, 
            currency, 
            fullRow: row 
          });
        }
        
        // Skip cash transactions and withdrawals
        if (!ticker || type.includes('CASH') || type.includes('WITHDRAWAL') || type.includes('DIVIDEND')) {
          if (i <= 3) console.log(`Skipping row ${i}:`, { reason: 'cash/withdrawal/dividend', ticker, type });
          continue;
        }

        // Only process BUY/SELL transactions (handle various formats including Trading212)
        const normalizedType = type.toUpperCase();
        const isBuyTransaction = normalizedType.includes('BUY') || normalizedType.includes('MARKET BUY') || normalizedType.includes('LIMIT BUY');
        const isSellTransaction = normalizedType.includes('SELL') || normalizedType.includes('MARKET SELL') || normalizedType.includes('LIMIT SELL');
        
        if (isBuyTransaction || isSellTransaction) {
          const trade = {
            id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: row[dateIndex]?.trim() || new Date().toISOString().split('T')[0],
            ticker: ticker, // Now properly extracted ticker (e.g., "AAPL" instead of "Apple Inc. AAPL")
            type: (isBuyTransaction ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
            currency: currency,
            qty: qty,
            price: price,
            mock: false
          };

          // Validate trade data
          if (trade.ticker && trade.qty > 0 && trade.price > 0) {
            trades.push(trade);
            if (i <= 3) console.log(`Added trade:`, trade);
          } else {
            if (i <= 3) console.log(`Invalid trade data:`, trade);
          }
        }
      } catch (error) {
        console.warn(`Error parsing row ${i + 1}:`, error);
      }
    }

    console.log(`Total trades parsed: ${trades.length}`);
    return { trades, broker: brokerFormat };
  };

  const handleFileUpload = async (file: File) => {
    console.log('CSV upload started:', file.name);
    
    // Track CSV import start
    trackCSVImportStart({
      source: 'dashboard_upload'
    });
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a valid CSV file.');
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
      
      // Validate CSV format
      const validation = validateCSV(csvContent);
      
      if (!validation.valid) {
        trackCSVImportError({
          errorType: 'validation_failed',
          errorMessage: validation.errors.join('; ')
        });
        alert(`Invalid CSV format:\n\n${validation.errors.join('\n')}\n\nPlease ensure your CSV has the required columns:\n• Date/Timestamp\n• Ticker/Symbol\n• Type/Action\n• Quantity/Units\n• Price/Rate`);
        setProcessing(false);
        return;
      }

      // Parse CSV
      const { trades, broker } = parseCSV(csvContent);
      console.log('Parsing complete:', trades.length, 'trades found');
      
      if (trades.length === 0) {
        trackCSVImportError({
          errorType: 'no_trades_found',
          errorMessage: 'No valid trades found in CSV',
          broker
        });
        alert('No valid trades found in the CSV file. Please check that:\n• Your CSV contains BUY or SELL transactions\n• Quantity and price values are valid numbers\n• The file format matches the supported formats');
        setProcessing(false);
        return;
      }

      // Import trades
      onImport(trades);
      
      // Track successful CSV import
      trackCSVImportSuccess({
        broker,
        rowCount: trades.length,
        fileSize: file.size
      });
      
      alert(`✓ Successfully imported ${trades.length} trade${trades.length === 1 ? '' : 's'} from ${file.name}`);
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      trackCSVImportError({
        errorType: 'parse_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      alert('Error processing CSV file. Please check the format and try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
  );
}
