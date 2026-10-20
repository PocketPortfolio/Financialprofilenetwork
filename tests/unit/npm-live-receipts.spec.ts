import { describe, expect, test } from 'vitest';

import { NUMBERS_SNAPSHOT } from '../../lib/canonical-claims';
import { asOfDate, withLiveNpmReceipts } from '../../lib/npm-live-receipts';

describe('withLiveNpmReceipts', () => {
  test('overlays TRAC-01 and TRAC-02 when source is live', () => {
    const rows = withLiveNpmReceipts(NUMBERS_SNAPSHOT, {
      totalDownloads: 20000,
      last30DaysDownloads: 300,
      lastUpdated: '2026-10-20T12:00:00.000Z',
      source: 'live',
    });

    const trac01 = rows.find((r) => r.numbersPackRowId === 'TRAC-01');
    const trac02 = rows.find((r) => r.numbersPackRowId === 'TRAC-02');
    const mau = rows.find((r) => r.numbersPackRowId === 'TRAC-07');

    expect(trac01?.value).toBe(20000);
    expect(trac01?.asOf).toBe('2026-10-20');
    expect(trac02?.value).toBe(300);
    expect(trac02?.asOf).toBe('2026-10-20');
    expect(mau?.value).toBe(NUMBERS_SNAPSHOT.find((r) => r.numbersPackRowId === 'TRAC-07')?.value);
    expect(mau?.asOf).toBe(NUMBERS_SNAPSHOT.find((r) => r.numbersPackRowId === 'TRAC-07')?.asOf);
  });

  test('leaves snapshot rows unchanged when source is snapshot', () => {
    const rows = withLiveNpmReceipts(NUMBERS_SNAPSHOT, {
      totalDownloads: 20000,
      last30DaysDownloads: 300,
      lastUpdated: '2026-10-20T12:00:00.000Z',
      source: 'snapshot',
    });

    expect(rows.find((r) => r.numbersPackRowId === 'TRAC-01')?.value).toBe(
      NUMBERS_SNAPSHOT.find((r) => r.numbersPackRowId === 'TRAC-01')?.value,
    );
  });

  test('asOfDate truncates ISO timestamps', () => {
    expect(asOfDate('2026-10-20T11:58:54.051Z')).toBe('2026-10-20');
  });
});
