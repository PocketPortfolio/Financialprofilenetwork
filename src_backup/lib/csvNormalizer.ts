/**
 * CSV Import & Normalization
 * Handles multiple broker formats with auto-detection
 */
import Papa from 'papaparse';
import { csvRowSchema, type CsvRow } from '@/types/schemas';

export interface CsvParseResult {
  rows: CsvRow[];
  errors: string[];
  warnings: string[];
  metadata: {
    totalRows: number;
    successRows: number;
    detectedFormat: string;
    encoding: string;
    delimiter: string;
  };
}

export interface HeaderMapping {
  symbol: string[];
  quantity: string[];
  price: string[];
  timestamp: string[];
  type?: string[];
  fees?: string[];
  currency?: string[];
}

const DEFAULT_HEADER_MAPPING: HeaderMapping = {
  symbol: ['symbol', 'ticker', 'stock', 'instrument', 'asset'],
  quantity: ['quantity', 'qty', 'amount', 'shares', 'units'],
  price: ['price', 'rate', 'cost', 'value'],
  timestamp: ['date', 'time', 'datetime', 'timestamp', 'executed'],
  type: ['type', 'action', 'side', 'transaction'],
  fees: ['fee', 'fees', 'commission', 'charges'],
  currency: ['currency', 'ccy', 'cur'],
};

/**
 * Detect CSV delimiter
 */
function detectDelimiter(sample: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map(d => ({
    delimiter: d,
    count: (sample.match(new RegExp(`\\${d}`, 'g')) || []).length,
  }));
  
  counts.sort((a, b) => b.count - a.count);
  return counts[0]?.delimiter || ',';
}

/**
 * Detect encoding (simplified - real detection needs buffer analysis)
 */
function detectEncoding(text: string): string {
  // Check for BOM
  if (text.charCodeAt(0) === 0xfeff) return 'UTF-8-BOM';
  if (text.includes('\ufffd')) return 'unknown';
  
  // Heuristic: check for common UTF-8 chars
  if (/[^\x00-\x7F]/.test(text)) return 'UTF-8';
  
  return 'ASCII';
}

/**
 * Find matching header column
 */
function findColumn(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map(h => h.toLowerCase().trim());
  
  for (const candidate of candidates) {
    const idx = normalized.findIndex(h => h.includes(candidate) || candidate.includes(h));
    if (idx !== -1) return headers[idx];
  }
  
  return null;
}

/**
 * Map row data to normalized format
 */
function mapRow(
  row: Record<string, string>,
  mapping: HeaderMapping
): Partial<CsvRow> | null {
  const symbolCol = findColumn(Object.keys(row), mapping.symbol);
  const quantityCol = findColumn(Object.keys(row), mapping.quantity);
  const priceCol = findColumn(Object.keys(row), mapping.price);
  const timestampCol = findColumn(Object.keys(row), mapping.timestamp);
  
  if (!symbolCol || !quantityCol || !priceCol || !timestampCol) {
    return null;
  }
  
  const symbol = row[symbolCol]?.trim().toUpperCase();
  const quantity = parseFloat(row[quantityCol]?.replace(/[,\s]/g, '') || '0');
  const price = parseFloat(row[priceCol]?.replace(/[,\s]/g, '') || '0');
  const timestamp = row[timestampCol]?.trim();
  
  if (!symbol || !Number.isFinite(quantity) || !Number.isFinite(price) || !timestamp) {
    return null;
  }
  
  const mapped: Partial<CsvRow> = {
    symbol,
    quantity,
    price,
    timestamp: new Date(timestamp).toISOString(),
  };
  
  // Optional fields
  const typeCol = findColumn(Object.keys(row), mapping.type || []);
  if (typeCol) mapped.type = normalizeTradeType(row[typeCol]);
  
  const feesCol = findColumn(Object.keys(row), mapping.fees || []);
  if (feesCol) mapped.fees = parseFloat(row[feesCol]?.replace(/[,\s]/g, '') || '0');
  
  const currencyCol = findColumn(Object.keys(row), mapping.currency || []);
  if (currencyCol) mapped.currency = row[currencyCol]?.trim().toUpperCase();
  
  return mapped;
}

/**
 * Normalize trade type from various broker formats
 */
function normalizeTradeType(type: string): 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' {
  const normalized = type.toLowerCase().trim();
  
  if (normalized.includes('buy') || normalized.includes('purchase')) return 'buy';
  if (normalized.includes('sell') || normalized.includes('sale')) return 'sell';
  if (normalized.includes('div')) return 'dividend';
  if (normalized.includes('split')) return 'split';
  if (normalized.includes('transfer')) return 'transfer';
  
  return 'buy'; // Default
}

/**
 * Detect duplicates
 */
function detectDuplicates(rows: CsvRow[]): number[] {
  const seen = new Set<string>();
  const duplicateIndices: number[] = [];
  
  rows.forEach((row, idx) => {
    const key = `${row.symbol}-${row.quantity}-${row.price}-${row.timestamp}`;
    if (seen.has(key)) {
      duplicateIndices.push(idx);
    } else {
      seen.add(key);
    }
  });
  
  return duplicateIndices;
}

/**
 * Parse and normalize CSV
 */
export async function parseCsv(
  file: File | string,
  customMapping?: Partial<HeaderMapping>
): Promise<CsvParseResult> {
  const mapping = { ...DEFAULT_HEADER_MAPPING, ...customMapping };
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalizedRows: CsvRow[] = [];
  
  // Read file content
  const content = typeof file === 'string' 
    ? file 
    : await file.text();
  
  const encoding = detectEncoding(content);
  const delimiter = detectDelimiter(content.split('\n')[0] || '');
  
  return new Promise((resolve) => {
    Papa.parse(content, {
      header: true,
      delimiter,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        let successCount = 0;
        
        results.data.forEach((row, idx) => {
          const mapped = mapRow(row as Record<string, string>, mapping);
          
          if (!mapped) {
            errors.push(`Row ${idx + 2}: Unable to map required fields`);
            return;
          }
          
          // Validate with Zod
          const validated = csvRowSchema.safeParse(mapped);
          
          if (!validated.success) {
            errors.push(`Row ${idx + 2}: ${validated.error.message}`);
            return;
          }
          
          normalizedRows.push(validated.data);
          successCount++;
        });
        
        // Detect duplicates
        const duplicates = detectDuplicates(normalizedRows);
        if (duplicates.length > 0) {
          warnings.push(
            `${duplicates.length} duplicate(s) detected at rows: ${duplicates.map(i => i + 2).join(', ')}`
          );
        }
        
        resolve({
          rows: normalizedRows,
          errors,
          warnings,
          metadata: {
            totalRows: results.data.length,
            successRows: successCount,
            detectedFormat: 'auto',
            encoding,
            delimiter,
          },
        });
      },
      error: (err) => {
        errors.push(`Parse error: ${err.message}`);
        resolve({
          rows: [],
          errors,
          warnings,
          metadata: {
            totalRows: 0,
            successRows: 0,
            detectedFormat: 'unknown',
            encoding,
            delimiter,
          },
        });
      },
    });
  });
}

/**
 * Export trades to CSV
 */
export function exportToCsv(rows: CsvRow[], filename = 'trades.csv'): void {
  const csv = Papa.unparse(rows, {
    header: true,
    columns: ['symbol', 'quantity', 'price', 'timestamp', 'type', 'fees', 'currency'],
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

