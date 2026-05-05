/**
 * Fuzzy / synonym header normalization for the first CSV row only.
 * Keeps all body rows unchanged. Pairs with @pocket-portfolio/importer SYNONYMS.
 */

import type { RawFile } from '@pocket-portfolio/importer';
import type { StandardField } from '@pocket-portfolio/importer';
import { SYNONYMS, normalizeHeader, headerMatchesSynonym } from '@pocket-portfolio/importer';

/** Same quote-aware split as CSVImporter.parseCSVLine (first row only). */
export function parseCsvHeaderCells(line: string): string[] {
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
}

function escapeCsvField(f: string): string {
  if (/[,"\n\r]/.test(f)) return `"${f.replace(/"/g, '""')}"`;
  return f;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

type SynTarget = { norm: string; display: string };

function buildSynonymTargets(): SynTarget[] {
  const out: SynTarget[] = [];
  const seen = new Set<string>();
  for (const field of Object.keys(SYNONYMS) as StandardField[]) {
    for (const syn of SYNONYMS[field]) {
      const norm = normalizeHeader(syn);
      if (seen.has(norm)) continue;
      seen.add(norm);
      out.push({ norm, display: syn });
    }
  }
  return out;
}

const SYN_TARGETS: SynTarget[] = buildSynonymTargets();

/**
 * Normalized header -> canonical column label (broker-friendly).
 * Applied before SYNONYMS / fuzzy pass.
 */
const EXACT_REDIRECTS: Record<string, string> = {
  sym: 'Ticker',
  tickersymbol: 'Ticker',
  tsticker: 'Ticker',
  stk: 'Ticker',
  qty: 'Quantity',
  vol: 'Quantity',
  noshares: 'No. of shares',
  numshares: 'No. of shares',
  pricepershare: 'Price / share',
  shareprice: 'Price / share',
};

function resolveHeaderCell(original: string): { next: string; changed: boolean } {
  const trimmed = (original || '').replace(/^\uFEFF/, '').trim();
  if (!trimmed) return { next: original, changed: false };

  const n = normalizeHeader(trimmed);
  const redirected = EXACT_REDIRECTS[n];
  if (redirected && redirected !== trimmed) {
    return { next: redirected, changed: true };
  }

  for (const { display } of SYN_TARGETS) {
    if (headerMatchesSynonym(trimmed, display)) {
      if (trimmed === display) return { next: original, changed: false };
      return { next: display, changed: true };
    }
  }

  if (n.length < 3) return { next: original, changed: false };

  const maxDist = n.length <= 5 ? 1 : 2;
  let best: SynTarget | null = null;
  let bestDist = 99;
  for (const t of SYN_TARGETS) {
    if (t.norm.length < 3) continue;
    const d = levenshtein(n, t.norm);
    if (d > maxDist || d >= bestDist) continue;
    if (d === bestDist && best && t.display.length >= best.display.length) continue;
    bestDist = d;
    best = t;
  }
  if (best && best.display !== trimmed) {
    return { next: best.display, changed: true };
  }
  return { next: original, changed: false };
}

export interface NormalizeCsvHeadersResult {
  csvText: string;
  fixesApplied: string[];
}

/**
 * Rewrites the first CSV row so column names match known broker / universal synonyms.
 */
export function normalizeCsvHeadersFirstRow(csvText: string): NormalizeCsvHeadersResult {
  const fixesApplied: string[] = [];
  const eol = csvText.includes('\r\n') ? '\r\n' : '\n';
  const firstNl = csvText.indexOf('\n');
  const firstLine =
    firstNl === -1 ? csvText.replace(/\r$/, '') : csvText.slice(0, firstNl).replace(/\r$/, '');
  const rest = firstNl === -1 ? '' : csvText.slice(firstNl + 1);

  if (!firstLine.trim()) {
    return { csvText, fixesApplied };
  }

  const cells = parseCsvHeaderCells(firstLine);
  let any = false;
  const nextCells = cells.map((cell) => {
    const { next, changed } = resolveHeaderCell(cell);
    if (changed) {
      any = true;
      fixesApplied.push(`${cell}→${next}`);
    }
    return next;
  });

  if (!any) {
    return { csvText, fixesApplied };
  }

  const newFirst = nextCells.map(escapeCsvField).join(',');
  const newText = rest.length ? `${newFirst}${eol}${rest}` : newFirst;
  return { csvText: newText, fixesApplied };
}

function stripCsvPreamble(csvText: string): { csvText: string; fixesApplied: string[] } {
  const fixesApplied: string[] = [];
  if (!csvText) return { csvText, fixesApplied };

  const eol = csvText.includes('\r\n') ? '\r\n' : '\n';
  const lines = csvText.split(/\n/);

  // Remove leading blank lines (often appear as a lone '\r' first line on Windows exports).
  while (lines.length && !lines[0].replace(/\r/g, '').trim()) {
    lines.shift();
    fixesApplied.push('drop:leading_blank');
  }

  // Coinbase "Transactions" export prelude:
  // Transactions
  // User,<name>,<id>
  // ID,Timestamp,Transaction Type,...
  if (lines.length >= 2) {
    const l0 = (lines[0] ?? '').replace(/\r/g, '').trim();
    const l1 = (lines[1] ?? '').replace(/\r/g, '').trim();
    if (/^Transactions$/i.test(l0) && /^User,/i.test(l1)) {
      lines.shift();
      lines.shift();
      fixesApplied.push('drop:coinbase_transactions_prelude');
    }
  }

  const next = lines.join('\n');
  return { csvText: next, fixesApplied };
}

export function rawFileFromCsvText(csvText: string, filename: string): RawFile {
  const enc = new TextEncoder().encode(csvText);
  const copy = new Uint8Array(enc.byteLength);
  copy.set(enc);
  return {
    name: /\.csv$/i.test(filename) ? filename : `${filename.replace(/\.[^.]+$/, '')}.csv`,
    mime: 'text/csv',
    size: copy.byteLength,
    arrayBuffer: async () => copy.buffer as ArrayBuffer,
  };
}

export function isCsvFuzzyHeadersEnabled(): boolean {
  return typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CSV_FUZZY_HEADERS !== 'false';
}

export function prepareCsvForImport(csvText: string, filename: string): {
  csvText: string;
  fixesApplied: string[];
  rawFile: RawFile;
} {
  if (!isCsvFuzzyHeadersEnabled()) {
    return {
      csvText,
      fixesApplied: [],
      rawFile: rawFileFromCsvText(csvText, filename),
    };
  }
  const stripped = stripCsvPreamble(csvText);
  const normalized = normalizeCsvHeadersFirstRow(stripped.csvText);
  const fixesApplied = [...stripped.fixesApplied, ...normalized.fixesApplied];
  return {
    csvText: normalized.csvText,
    fixesApplied,
    rawFile: rawFileFromCsvText(normalized.csvText, filename),
  };
}
