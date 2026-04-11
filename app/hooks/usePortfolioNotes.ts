'use client';

import { useCallback, useEffect, useState } from 'react';
import { emptyPortfolioNotes, type PortfolioNotesState } from '@/app/lib/portfolio/schema';
import {
  loadPortfolioNotes,
  savePortfolioNotes,
  notifyPortfolioNotesChanged,
} from '@/app/lib/store/localPortfolioStore';

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
      notifyPortfolioNotesChanged();
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
      notifyPortfolioNotesChanged();
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
      notifyPortfolioNotesChanged();
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
