/**
 * Overlay live npm Downloads API values onto NUMBERS_SNAPSHOT rows for press /
 * citation surfaces so TRAC-01 / TRAC-02 never contradict the live hero signal.
 */

import type { SnapshotRow } from '@/lib/canonical-claims';

export type NpmLiveOverlay = {
  totalDownloads: number;
  last30DaysDownloads?: number;
  lastUpdated: string;
  source: 'live' | 'snapshot';
};

/** YYYY-MM-DD from ISO timestamp or date string. */
export function asOfDate(isoOrDate: string): string {
  return isoOrDate.slice(0, 10);
}

/**
 * When `source === 'live'`, replace TRAC-01 (all-time) and TRAC-02 (last 30d)
 * with the live totals. Other rows stay frozen artifact receipts.
 */
export function withLiveNpmReceipts(
  rows: ReadonlyArray<SnapshotRow>,
  live: NpmLiveOverlay,
): SnapshotRow[] {
  if (live.source !== 'live' || live.totalDownloads <= 0) {
    return rows.map((r) => ({ ...r }));
  }

  const asOf = asOfDate(live.lastUpdated);
  const last30 =
    typeof live.last30DaysDownloads === 'number' && live.last30DaysDownloads > 0
      ? live.last30DaysDownloads
      : null;

  return rows.map((row) => {
    if (row.numbersPackRowId === 'TRAC-01') {
      return { ...row, value: live.totalDownloads, asOf };
    }
    if (row.numbersPackRowId === 'TRAC-02' && last30 !== null) {
      return { ...row, value: last30, asOf };
    }
    return { ...row };
  });
}
