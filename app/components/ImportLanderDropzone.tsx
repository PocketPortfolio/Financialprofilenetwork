'use client';

import { useState } from 'react';
import Link from 'next/link';
import CSVImporter from '@/app/components/CSVImporter';
import { useTrades } from '@/app/hooks/useTrades';

interface Trade {
  id: string;
  date: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  currency: string;
  qty: number;
  price: number;
  mock: boolean;
  portfolioId?: string;
}

type Props = {
  brokerSlug: string;
  brokerDisplayName: string;
};

/**
 * Above-the-fold CSV dropzone for /import/[broker] SERP landers.
 * Local-first: parses in-browser and persists via useTrades (IndexedDB/local without upload).
 */
export default function ImportLanderDropzone({ brokerSlug, brokerDisplayName }: Props) {
  const { importTrades } = useTrades();
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  const handleImport = async (trades: Trade[]) => {
    try {
      await importTrades(trades);
      setStatus('ok');
      setMessage(
        `Imported ${trades.length} ${brokerDisplayName} trades locally. Open the terminal to chart P&L.`,
      );
    } catch (e) {
      setStatus('err');
      setMessage(e instanceof Error ? e.message : 'Import failed. Check CSV columns and try again.');
    }
  };

  return (
    <section
      id="import-now"
      aria-label={`Import ${brokerDisplayName} CSV`}
      style={{
        marginBottom: 32,
        padding: '24px',
        border: '1px solid var(--border-subtle, var(--border))',
        background: 'var(--surface)',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          margin: '0 0 8px',
          color: 'var(--text)',
        }}
      >
        Drop your {brokerDisplayName} CSV here
      </h2>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          margin: '0 0 16px',
          lineHeight: 1.5,
        }}
      >
        Parsed on-device. No server upload of your ledger. Sign-in optional for Drive sync later.
      </p>

      <CSVImporter onImport={handleImport} />

      {status !== 'idle' && (
        <p
          role="status"
          style={{
            marginTop: 16,
            fontSize: 14,
            color: status === 'ok' ? 'var(--text)' : '#b91c1c',
          }}
        >
          {message}{' '}
          {status === 'ok' && (
            <Link
              href={`/dashboard?utm_source=import_page&utm_medium=dropzone&utm_campaign=activation&utm_content=${encodeURIComponent(brokerSlug)}`}
              style={{ color: 'var(--accent-warm)', fontWeight: 600 }}
            >
              Open terminal →
            </Link>
          )}
        </p>
      )}
    </section>
  );
}
