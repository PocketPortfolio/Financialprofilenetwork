'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { WeeklySnapshotSummary } from '../hooks/useWeeklySnapshotToast';

interface WeeklySnapshotToastProps {
  show: boolean;
  onDismiss: () => void;
  summary?: WeeklySnapshotSummary | null;
}

/**
 * Local-only "Weekly Portfolio Snapshot" toast. P&L is computed client-side;
 * no data is sent to the server. Includes a subtle CTA to Founder's Club.
 */
export function WeeklySnapshotToast({ show, onDismiss, summary }: WeeklySnapshotToastProps) {
  if (!show) return null;

  const hasPL = summary && typeof summary.unrealizedPL === 'number';
  const plSign = hasPL && summary!.unrealizedPL! >= 0 ? '+' : '';
  const plFormatted = hasPL
    ? `${plSign}${summary!.unrealizedPL!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(400px, calc(100vw - 32px))',
        padding: '14px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
          Weekly Portfolio Snapshot
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {plFormatted != null ? (
            <>Unrealized P&L: <strong style={{ color: plFormatted.startsWith('+') ? 'var(--signal)' : 'var(--danger)' }}>{plFormatted}</strong></>
          ) : (
            <>Welcome back. Add trades to see your snapshot here.</>
          )}
        </p>
        <Link
          href="/sponsor?utm_source=weekly_snapshot&utm_medium=toast&utm_campaign=founders_club"
          style={{
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--accent-warm)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Explore Founder's Club →
        </Link>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          padding: '4px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}
