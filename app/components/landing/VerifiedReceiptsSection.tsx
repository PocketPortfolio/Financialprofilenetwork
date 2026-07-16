'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { FeedbackSurface } from '@/app/lib/feedback/types';

type FeaturedReceipt = {
  id: string;
  surface: FeedbackSurface;
  quote: string;
  rating: number | null;
  tagline: string | null;
  featuredAt: string | null;
  lastEditedAt: string | null;
  expiresAt: string | null;
};

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
};

export function VerifiedReceiptsSection(props: { surface: FeedbackSurface; title?: string; subtitle?: string }) {
  const { surface } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<FeaturedReceipt[]>([]);

  const copy = useMemo(() => {
    if (surface === 'open') {
      return {
        title: props.title ?? 'Verified receipts',
        subtitle:
          props.subtitle ??
          'Curated operator feedback from the live harness — published deliberately (no raw submissions).',
      };
    }
    return {
      title: props.title ?? 'Verified receipts',
      subtitle:
        props.subtitle ??
        'Curated feedback from high-frequency dashboard users — published deliberately (no raw submissions).',
    };
  }, [props.subtitle, props.title, surface]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/feedback/featured?surface=${surface}&_=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json().then((j) => ({ ok: res.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) throw new Error(j?.error ?? 'Failed to load receipts');
        const list = Array.isArray(j?.receipts) ? (j.receipts as FeaturedReceipt[]) : [];
        setReceipts(list.slice(0, 12));
      })
      .catch((e: any) => setError(e?.message ?? 'Failed to load receipts'))
      .finally(() => setLoading(false));
  }, [surface]);

  const isSingle = receipts.length === 1;

  const sectionShellStyle: React.CSSProperties = {
    margin: '0 auto clamp(48px, 8vw, 96px)',
    maxWidth: '1200px',
    padding: '0 clamp(12px, 3vw, 24px)',
  };

  const panelStyle: React.CSSProperties = {
    border: '1px solid var(--border-subtle)',
    borderRadius: '14px',
    background: 'var(--surface)',
    padding: 'clamp(24px, 4vw, 32px)',
    borderLeft: '3px solid var(--accent-warm)',
  };

  if (loading) {
    return (
      <section style={sectionShellStyle}>
        <div style={panelStyle}>
          <div style={{ ...MONO, fontWeight: 900, fontSize: '18px' }}>{copy.title}</div>
          <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>{copy.subtitle}</div>
          <div style={{ marginTop: '18px', color: 'var(--text-secondary)', fontSize: '13px', ...MONO }}>
            Loading receipts…
          </div>
        </div>
      </section>
    );
  }

  if (error || receipts.length === 0) {
    return null;
  }

  return (
    <section style={sectionShellStyle}>
      <div style={panelStyle}>
        <div
          style={{
            display: 'grid',
            gap: '8px',
            marginBottom: '20px',
            textAlign: isSingle ? 'center' : 'left',
            maxWidth: isSingle ? '640px' : 'none',
            marginInline: isSingle ? 'auto' : undefined,
          }}
        >
          <div style={{ ...MONO, fontWeight: 900, fontSize: '18px' }}>{copy.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{copy.subtitle}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isSingle
              ? 'minmax(0, 1fr)'
              : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            justifyItems: isSingle ? 'center' : 'stretch',
            alignItems: 'start',
          }}
        >
          {receipts.map((r) => (
            <div
              key={r.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                background: 'color-mix(in srgb, var(--surface) 88%, black)',
                padding: '16px',
                width: '100%',
                maxWidth: isSingle ? '560px' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', ...MONO }}>
                  {r.tagline ?? (surface === 'open' ? 'infrastructure' : 'dashboard')}
                </div>
                {typeof r.rating === 'number' && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', ...MONO }}>
                    {r.rating}/5
                  </div>
                )}
              </div>
              <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                “{r.quote}”
              </div>
              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)', ...MONO }}>
                Verified receipt · curated
              </div>
            </div>
          ))}
        </div>

        {!isSingle && receipts.length > 1 && (
          <p
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              ...MONO,
            }}
          >
            {receipts.length} verified receipts · curated for {surface === 'open' ? 'Open' : 'Pocket'}
          </p>
        )}
      </div>
    </section>
  );
}

