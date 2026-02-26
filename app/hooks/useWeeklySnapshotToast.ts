'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pocket_portfolio_last_seen_ts';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface WeeklySnapshotSummary {
  totalValue?: number;
  totalInvested?: number;
  unrealizedPL?: number;
}

/**
 * Client-side retention hook: show "Weekly Portfolio Snapshot" toast when user
 * returns after 7+ days of inactivity. All logic and P&L stay in the browser.
 */
export function useWeeklySnapshotToast(
  isAuthenticated: boolean,
  _summary?: WeeklySnapshotSummary | null
): { showToast: boolean; dismiss: () => void } {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const lastSeenTs = lastSeen ? parseInt(lastSeen, 10) : 0;
    const shouldShow = !lastSeen || Date.now() - lastSeenTs > SEVEN_DAYS_MS;
    if (shouldShow) setShowToast(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, [isAuthenticated]);

  return { showToast, dismiss: () => setShowToast(false) };
}
