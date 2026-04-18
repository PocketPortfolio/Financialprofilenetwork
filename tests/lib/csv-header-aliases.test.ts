import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCSV } from '@pocket-portfolio/importer';
import {
  normalizeCsvHeadersFirstRow,
  prepareCsvForImport,
  parseCsvHeaderCells,
} from '@/app/lib/csv/headerAliases';

describe('csv header aliases', () => {
  it('parseCsvHeaderCells handles quoted commas', () => {
    expect(parseCsvHeaderCells('"a,b",c,d')).toEqual(['a,b', 'c', 'd']);
  });

  it('rewrites Sym and Qty for Trading 212 style header', () => {
    const raw = readFileSync(join(__dirname, '../fixtures/csv/trading212-typos.csv'), 'utf8');
    const { csvText, fixesApplied } = normalizeCsvHeadersFirstRow(raw);
    expect(fixesApplied.some((f) => f.includes('Sym'))).toBe(true);
    expect(fixesApplied.some((f) => f.includes('Qty'))).toBe(true);
    const first = csvText.split(/\r?\n/)[0];
    expect(first).toContain('Ticker');
    expect(first).toContain('Quantity');
  });

  it('parses typo header file via importer after prepare', async () => {
    const raw = readFileSync(join(__dirname, '../fixtures/csv/trading212-typos.csv'), 'utf8');
    const prep = prepareCsvForImport(raw, 't212.csv');
    const result = await parseCSV(prep.rawFile, 'en-US', 'trading212');
    expect(result.trades.length).toBeGreaterThanOrEqual(2);
    expect(result.trades[0]?.ticker).toBeTruthy();
  });
});
