'use client';

import React, { useEffect, useState } from 'react';
import StructuredData from './StructuredData';
import type { NewsroomPayload } from '@/lib/newsroom/types';
import NewsRoomBriefingCard from './newsroom/NewsRoomBriefingCard';
import NewsRoomConversionStrip from './newsroom/NewsRoomConversionStrip';

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
};

export default function CommunityContent() {
  const [payload, setPayload] = useState<NewsroomPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/newsroom', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: NewsroomPayload | null) => {
        if (data?.briefings?.length) setPayload(data);
      })
      .catch(() => {
        /* empty — API seed fallback only if RSS fully unavailable */
      })
      .finally(() => setLoading(false));
  }, []);

  const briefings = payload?.briefings ?? [];
  const updatedAt = payload?.updatedAt ?? new Date().toISOString();

  return (
    <>
      {!loading &&
        briefings.slice(0, 6).map((briefing) => (
        <StructuredData
          key={`newsroom-${briefing.id}`}
          type="Article"
          data={{
            headline: briefing.title,
            description: briefing.snippet,
            url: briefing.href.startsWith('http')
              ? briefing.href
              : `https://www.pocketportfolio.app${briefing.href}`,
            datePublished: briefing.publishedAt,
            dateModified: briefing.publishedAt,
            author: { '@type': 'Organization', name: briefing.source },
            publisher: {
              '@type': 'Organization',
              name: 'Pocket Portfolio',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.pocketportfolio.app/brand/pp-monogram-amber.png',
              },
            },
          }}
        />
        ))}
      <section
        id="news-room"
        className="brand-surface"
        style={{
          padding: '48px 24px',
          background: 'linear-gradient(165deg, var(--surface) 0%, var(--warm-bg, var(--surface)) 100%)',
          borderTop: '1px solid var(--border-warm)',
          borderBottom: '1px solid var(--border-warm)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                margin: '0 0 14px',
                color: 'var(--text-warm, var(--text))',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                ...MONO,
              }}
            >
              News Room
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                color: 'var(--text-secondary, var(--muted))',
                maxWidth: '720px',
                margin: '0 auto 8px',
                lineHeight: 1.6,
              }}
            >
              Distributed, Local-First Wealth-Tech &amp; Financial Market Briefings.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', ...MONO }}>
              {loading
                ? 'Loading market briefings…'
                : briefings.length === 0
                  ? 'Briefings updating — no live feed yet'
                  : `Updated ${new Date(updatedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })} · live RSS`}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '36px',
            }}
          >
            {!loading && briefings.length === 0 ? (
              <p
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: '14px',
                  padding: '32px 16px',
                  ...MONO,
                }}
              >
                Briefings are updating — we only show live publisher headlines, not placeholder copy.
              </p>
            ) : null}
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    style={{
                      minHeight: '320px',
                      borderRadius: '12px',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      background: 'var(--surface)',
                      opacity: 0.6,
                    }}
                  />
                ))
              : briefings.map((briefing) => (
                  <NewsRoomBriefingCard key={briefing.id} briefing={briefing} />
                ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <NewsRoomConversionStrip surface="home" />
          </div>
        </div>
      </section>
    </>
  );
}
