'use client';

import React, { useEffect, useState } from 'react';
import type { NewsroomBriefing, NewsroomCategory } from '@/lib/newsroom/types';
import { CATEGORY_ART_URL } from '@/lib/newsroom/category-art';
import { trackNewsroomBriefingClick } from '@/app/lib/analytics/events';

const CARD_BORDER = '1px solid rgba(245, 158, 11, 0.42)';
const CARD_BORDER_COLOR = 'rgba(245, 158, 11, 0.42)';
const CARD_SHADOW = '0 4px 18px rgba(245, 158, 11, 0.07)';

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
};

function resolveCategoryArt(briefing: NewsroomBriefing): string {
  return briefing.categoryArtUrl ?? CATEGORY_ART_URL[briefing.category as NewsroomCategory];
}

function MediaCanvas({ briefing }: { briefing: NewsroomBriefing }) {
  const categoryArt = resolveCategoryArt(briefing);
  const heroSrc = briefing.imageUrl || categoryArt;
  const [displaySrc, setDisplaySrc] = useState(heroSrc);

  const showPublisherLogo = Boolean(briefing.publisherLogoUrl);

  useEffect(() => {
    setDisplaySrc(briefing.imageUrl || categoryArt);
  }, [briefing.imageUrl, categoryArt]);

  return (
    <div
      className="aspect-video"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: briefing.mediaBackground,
        borderBottom: '1px solid var(--border-subtle, var(--border-warm))',
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- RSS thumbnails + local SVG art */}
      <img
        src={displaySrc}
        alt=""
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={() => {
          if (displaySrc !== categoryArt) setDisplaySrc(categoryArt);
        }}
      />
      {showPublisherLogo && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            background: 'rgba(15, 18, 22, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={briefing.publisherLogoUrl!}
            alt=""
            width={32}
            height={32}
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: '16px',
          bottom: '14px',
          ...MONO,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--accent-warm)',
          textTransform: 'uppercase',
          textShadow: '0 1px 8px rgba(0,0,0,0.85)',
        }}
      >
        Briefing
      </div>
    </div>
  );
}

export default function NewsRoomBriefingCard({ briefing }: { briefing: NewsroomBriefing }) {
  const isExternal = briefing.href.startsWith('http');

  return (
    <a
      href={briefing.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="newsroom-briefing-card"
      onClick={() => trackNewsroomBriefingClick(briefing.title, briefing.category, briefing.href)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: CARD_BORDER,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: CARD_SHADOW,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.14)';
        e.currentTarget.style.borderColor = 'var(--accent-warm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = CARD_SHADOW;
        e.currentTarget.style.borderColor = CARD_BORDER_COLOR;
      }}
    >
      <MediaCanvas briefing={briefing} />
      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            display: 'inline-block',
            marginBottom: '12px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            borderRadius: '4px',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'rgba(245, 158, 11, 0.08)',
            color: 'var(--accent-warm)',
            ...MONO,
          }}
        >
          {briefing.category}
        </span>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: '0 0 8px',
            lineHeight: 1.35,
            color: 'var(--text-warm, var(--text))',
            letterSpacing: '-0.02em',
          }}
        >
          {briefing.title}
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--accent-warm)',
            margin: '0 0 8px',
            ...MONO,
          }}
        >
          {briefing.source}
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary, var(--muted))',
            lineHeight: 1.6,
            margin: '0 0 16px',
            flex: 1,
          }}
        >
          {briefing.snippet}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {briefing.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                background: 'rgba(245, 158, 11, 0.06)',
                color: 'var(--accent-warm)',
                ...MONO,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
