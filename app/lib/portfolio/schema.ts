/**
 * Pocket Portfolio DB JSON schema (Drive export + local bundle).
 * v1.1.0 adds Decision Journal notes (client + Drive in v1).
 */

export const PORTFOLIO_DB_SCHEMA_VERSION = '1.1.0';

export interface PortfolioNoteEntry {
  body: string;
  updatedAt: string;
}

export type OrphanedNoteEntry = PortfolioNoteEntry & { tickerHint?: string };

export interface PortfolioNotesState {
  byTicker: Record<string, PortfolioNoteEntry>;
  byTradeId: Record<string, PortfolioNoteEntry>;
  orphanedByTradeId: Record<string, OrphanedNoteEntry>;
}

export function emptyPortfolioNotes(): PortfolioNotesState {
  return {
    byTicker: {},
    byTradeId: {},
    orphanedByTradeId: {},
  };
}

function coerceEntry(v: unknown): PortfolioNoteEntry | null {
  if (typeof v === 'string') {
    return { body: v, updatedAt: new Date(0).toISOString() };
  }
  if (v && typeof v === 'object' && typeof (v as { body?: unknown }).body === 'string') {
    const body = (v as { body: string }).body;
    const u = (v as { updatedAt?: unknown }).updatedAt;
    const updatedAt = typeof u === 'string' ? u : new Date().toISOString();
    return { body, updatedAt };
  }
  return null;
}

function coerceOrphanMap(raw: unknown): Record<string, OrphanedNoteEntry> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, OrphanedNoteEntry> = {};
  for (const [k, val] of Object.entries(raw as Record<string, unknown>)) {
    const e = coerceEntry(val);
    if (!e || !k) continue;
    const th =
      val && typeof val === 'object' && typeof (val as { tickerHint?: unknown }).tickerHint === 'string'
        ? (val as { tickerHint: string }).tickerHint
        : undefined;
    out[k] = { ...e, tickerHint: th };
  }
  return out;
}

function coerceFlatMap(raw: unknown): Record<string, PortfolioNoteEntry> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, PortfolioNoteEntry> = {};
  for (const [k, val] of Object.entries(raw as Record<string, unknown>)) {
    const e = coerceEntry(val);
    if (!e || !k) continue;
    out[k] = e;
  }
  return out;
}

/** Accepts loose JSON from Drive or older shapes. */
export function parsePortfolioNotes(raw: unknown): PortfolioNotesState {
  if (!raw || typeof raw !== 'object') return emptyPortfolioNotes();
  const o = raw as Record<string, unknown>;
  return {
    byTicker: coerceFlatMap(o.byTicker),
    byTradeId: coerceFlatMap(o.byTradeId),
    orphanedByTradeId: coerceOrphanMap(o.orphanedByTradeId),
  };
}

function newer(a: PortfolioNoteEntry, b: PortfolioNoteEntry): PortfolioNoteEntry {
  return a.updatedAt >= b.updatedAt ? a : b;
}

/** Last-writer-wins per key using ISO timestamps on each entry. */
export function mergePortfolioNotes(
  local: PortfolioNotesState,
  remote: PortfolioNotesState
): PortfolioNotesState {
  const mergeFlat = <T extends PortfolioNoteEntry>(
    A: Record<string, T>,
    B: Record<string, T>
  ): Record<string, T> => {
    const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
    const out: Record<string, T> = {};
    for (const k of keys) {
      const a = A[k];
      const b = B[k];
      if (!a) out[k] = b;
      else if (!b) out[k] = a;
      else out[k] = newer(a, b) as T;
    }
    return out;
  };

  return {
    byTicker: mergeFlat(local.byTicker, remote.byTicker),
    byTradeId: mergeFlat(local.byTradeId, remote.byTradeId),
    orphanedByTradeId: mergeFlat(local.orphanedByTradeId, remote.orphanedByTradeId),
  };
}
