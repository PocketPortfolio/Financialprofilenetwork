'use client';

import { useEffect, useState } from 'react';

/** Live npm aggregate downloads (TRAC-01) via /api/npm-stats — same source as Pocket. */
export default function OpenLiveNpmStat({
  fallback,
  citation,
}: {
  fallback: string;
  citation: string;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/npm-stats?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('npm-stats failed');
        const data = (await res.json()) as { totalDownloads?: number };
        if (!cancelled && typeof data.totalDownloads === 'number' && data.totalDownloads > 0) {
          setValue(data.totalDownloads.toLocaleString('en-GB'));
        }
      } catch {
        if (!cancelled) setValue(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const display = loading ? '…' : (value ?? fallback);

  return (
    <>
      <div
        style={{
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          fontWeight: 800,
          color: 'var(--accent-warm)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {display}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px' }}>
        npm downloads (all-time)
        {value && !loading && (
          <span
            style={{
              marginLeft: '6px',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            live
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--text-secondary)',
          marginTop: '6px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        {citation}
      </div>
    </>
  );
}
