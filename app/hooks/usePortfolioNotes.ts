'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  emptyPortfolioNotes,
  parsePortfolioNotes,
  type PortfolioNotesState,
} from '@/app/lib/portfolio/schema';
import {
  STORAGE_KEY_NOTES,
  loadPortfolioNotes,
  savePortfolioNotes,
  notifyPortfolioNotesChanged,
} from '@/app/lib/store/localPortfolioStore';
import { readMirroredPortfolioNotesJson } from '@/app/lib/store/portfolioNotesMirror';

export function usePortfolioNotes() {
  const [notes, setNotes] = useState<PortfolioNotesState>(() =>
    typeof window !== 'undefined' ? loadPortfolioNotes() : emptyPortfolioNotes()
  );

  const refresh = useCallback(() => {
    setNotes(loadPortfolioNotes());
  }, []);

  useEffect(() => {
    const onDrive = () => refresh();
    const onNotes = () => refresh();
    window.addEventListener('drive-sync-complete', onDrive);
    window.addEventListener('portfolio-notes-changed', onNotes);
    return () => {
      window.removeEventListener('drive-sync-complete', onDrive);
      window.removeEventListener('portfolio-notes-changed', onNotes);
    };
  }, [refresh]);

  /** Other tabs / windows: localStorage updates do not emit events in the same tab. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_NOTES) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  /** If localStorage was cleared but IndexedDB mirror still has notes, restore (sovereign local fallback). */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem(STORAGE_KEY_NOTES)) return;
      const idbJson = await readMirroredPortfolioNotesJson();
      if (cancelled || !idbJson) return;
      try {
        const parsed = parsePortfolioNotes(JSON.parse(idbJson));
        if (localStorage.getItem(STORAGE_KEY_NOTES)) return;
        savePortfolioNotes(parsed);
        setNotes(parsed);
        notifyPortfolioNotesChanged({ source: 'user' });
      } catch (e) {
        console.warn('[usePortfolioNotes] IDB hydrate failed:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setHoldingNote = useCallback((ticker: string, body: string) => {
    const t = ticker.trim().toUpperCase();
    setNotes((prev) => {
      const next: PortfolioNotesState = {
        byTicker: { ...prev.byTicker },
        byTradeId: { ...prev.byTradeId },
        orphanedByTradeId: { ...prev.orphanedByTradeId },
      };
      if (!body.trim()) {
        delete next.byTicker[t];
      } else {
        next.byTicker[t] = { body, updatedAt: new Date().toISOString() };
      }
      savePortfolioNotes(next);
      notifyPortfolioNotesChanged({ source: 'user' });
      return next;
    });
  }, []);

  const setTradeNote = useCallback((tradeId: string, body: string) => {
    setNotes((prev) => {
      const next: PortfolioNotesState = {
        byTicker: { ...prev.byTicker },
        byTradeId: { ...prev.byTradeId },
        orphanedByTradeId: { ...prev.orphanedByTradeId },
      };
      if (!body.trim()) {
        delete next.byTradeId[tradeId];
      } else {
        next.byTradeId[tradeId] = { body, updatedAt: new Date().toISOString() };
      }
      savePortfolioNotes(next);
      notifyPortfolioNotesChanged({ source: 'user' });
      return next;
    });
  }, []);

  const removeOrphan = useCallback((tradeId: string) => {
    setNotes((prev) => {
      const next: PortfolioNotesState = {
        byTicker: { ...prev.byTicker },
        byTradeId: { ...prev.byTradeId },
        orphanedByTradeId: { ...prev.orphanedByTradeId },
      };
      delete next.orphanedByTradeId[tradeId];
      savePortfolioNotes(next);
      notifyPortfolioNotesChanged({ source: 'user' });
      return next;
    });
  }, []);

  return {
    notes,
    refresh,
    setHoldingNote,
    setTradeNote,
    removeOrphan,
  };
}
