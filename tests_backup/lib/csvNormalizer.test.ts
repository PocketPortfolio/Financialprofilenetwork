import { describe, it, expect } from 'vitest';
import { parseCsv } from '../../src/lib/csvNormalizer';

describe('CSV Normalizer', () => {
  it('should parse valid CSV with standard headers', async () => {
    const csv = `Date,Symbol,Quantity,Price,Type
2024-01-15,AAPL,10,150.25,buy
2024-01-20,GOOGL,5,135.80,sell`;

    const result = await parseCsv(csv);

    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0]?.symbol).toBe('AAPL');
    expect(result.rows[0]?.quantity).toBe(10);
    expect(result.rows[0]?.price).toBe(150.25);
  });

  it('should detect delimiter automatically', async () => {
    const csvSemicolon = `Date;Symbol;Quantity;Price
2024-01-15;AAPL;10;150.25`;

    const result = await parseCsv(csvSemicolon);

    expect(result.metadata.delimiter).toBe(';');
    expect(result.rows).toHaveLength(1);
  });

  it('should normalize symbol to uppercase', async () => {
    const csv = `Date,Symbol,Quantity,Price
2024-01-15,aapl,10,150.25`;

    const result = await parseCsv(csv);

    expect(result.rows[0]?.symbol).toBe('AAPL');
  });

  it('should detect duplicates', async () => {
    const csv = `Date,Symbol,Quantity,Price
2024-01-15,AAPL,10,150.25
2024-01-15,AAPL,10,150.25`;

    const result = await parseCsv(csv);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('duplicate');
  });

  it('should handle missing required fields', async () => {
    const csv = `Date,Symbol,Quantity
2024-01-15,AAPL,10`;

    const result = await parseCsv(csv);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toHaveLength(0);
  });

  it('should handle various date formats', async () => {
    const csv = `Date,Symbol,Quantity,Price
2024-01-15T10:30:00Z,AAPL,10,150.25
01/15/2024,GOOGL,5,135.80`;

    const result = await parseCsv(csv);

    expect(result.rows).toHaveLength(2);
    result.rows.forEach(row => {
      expect(row.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  it('should sanitize fees and currency fields', async () => {
    const csv = `Date,Symbol,Quantity,Price,Fees,Currency
2024-01-15,AAPL,10,150.25,2.50,USD`;

    const result = await parseCsv(csv);

    expect(result.rows[0]?.fees).toBe(2.50);
    expect(result.rows[0]?.currency).toBe('USD');
  });
});

