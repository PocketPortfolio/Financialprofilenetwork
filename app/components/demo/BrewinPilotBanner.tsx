'use client';

import Link from 'next/link';
import { BREWIN_DESK_PROMPT, BREWIN_PILOT_CLIENT_LABEL } from '@/app/lib/demo/brewin-manchester-pilot';
import { useBrewinPilot } from './BrewinPilotProvider';

export function BrewinPilotBanner() {
  const { active } = useBrewinPilot();
  if (!active) return null;

  return (
    <div
      role="status"
      style={{
        margin: '0 16px 12px',
        padding: '12px 16px',
        borderRadius: '4px',
        border: '1px solid var(--accent-warm)',
        background: 'var(--surface-elevated)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
          marginBottom: '6px',
        }}
      >
        Open Portfolio · Manchester design-partner replica · not a client
      </div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
        {BREWIN_PILOT_CLIENT_LABEL}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
        Overlay on Avaloq / Databricks — live desk reasoning, bounded Ask AI. Synthetic book only.
      </p>
      <p
        style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: '8px 0 0',
          lineHeight: 1.45,
          fontFamily: 'var(--font-mono)',
        }}
      >
        Desk prompt: {BREWIN_DESK_PROMPT}
      </p>
      <p style={{ margin: '10px 0 0', fontSize: 12 }}>
        <Link href="/dashboard" style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
          Exit replica → your portfolio
        </Link>
      </p>
    </div>
  );
}
