'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { useTrades } from '@/app/hooks/useTrades';
import { postImportDeveloperUtilityHref } from '@/lib/bot-gate';

/** Defer heavy importer chunk so SERP landers paint guide content first (IBKR P0 bounce fix). */
const CSVImporter = dynamic(() => import('@/app/components/CSVImporter'), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      style={{
        padding: 24,
        border: '1px dashed var(--border-subtle, var(--border))',
        color: 'var(--text-secondary)',
        fontSize: 14,
        textAlign: 'center',
      }}
    >
      Loading local CSV importer…
    </div>
  ),
});

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

      <CSVImporter onImport={handleImport} upsellReturnTo={`/import/${brokerSlug}`} />

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
            <>
              <Link
                href={`/dashboard?utm_source=import_page&utm_medium=dropzone&utm_campaign=activation&utm_content=${encodeURIComponent(brokerSlug)}`}
                style={{ color: 'var(--accent-warm)', fontWeight: 600 }}
              >
                Open terminal →
              </Link>
              {' · '}
              <Link
                href={postImportDeveloperUtilityHref(`/import/${brokerSlug}`)}
                style={{ color: 'var(--accent-warm)', fontWeight: 600 }}
              >
                Get Developer Utility key →
              </Link>
            </>
          )}
        </p>
      )}
    </section>
  );
}
