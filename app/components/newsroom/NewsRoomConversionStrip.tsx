'use client';

import Link from 'next/link';
import { SURFACE_CROSS_LINKS } from '@/lib/canonical-claims';
import { NEWSROOM_STRIP_CTA } from '@/lib/newsroom/conversion-wedges';
import { trackNewsroomCtaClick } from '@/app/lib/analytics/events';

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
};

const primaryStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '8px',
  background: 'var(--accent-warm)',
  color: '#0f1216',
  textDecoration: 'none',
  display: 'inline-block',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: '1px solid var(--accent-warm)',
  ...MONO,
};

const secondaryStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '8px',
  background: 'transparent',
  color: 'var(--text-warm, var(--text))',
  textDecoration: 'none',
  display: 'inline-block',
  transition: 'all 0.2s ease',
  border: '1px solid var(--border-warm)',
  ...MONO,
};

const wmAccentStyle: React.CSSProperties = {
  ...secondaryStyle,
  border: '1px solid rgba(245, 158, 11, 0.55)',
  background: 'rgba(245, 158, 11, 0.06)',
};

type NewsRoomConversionSurface = 'home' | 'index';

interface NewsRoomConversionStripProps {
  surface: NewsRoomConversionSurface;
}

function trackAndNavigate(target: string) {
  trackNewsroomCtaClick(target);
}

export default function NewsRoomConversionStrip({ surface }: NewsRoomConversionStripProps) {
  const openLink = SURFACE_CROSS_LINKS.pocket;

  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <Link
        href="/dashboard"
        style={primaryStyle}
        onClick={() => trackAndNavigate('dashboard')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {surface === 'home' ? 'Access B2C Wealth Dashboard →' : 'Access Wealth Dashboard →'}
      </Link>

      <Link
        href={NEWSROOM_STRIP_CTA.advisors.href}
        style={wmAccentStyle}
        onClick={() => trackAndNavigate(NEWSROOM_STRIP_CTA.advisors.target)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
          e.currentTarget.style.color = 'var(--accent-warm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.55)';
          e.currentTarget.style.color = 'var(--text-warm, var(--text))';
        }}
      >
        {NEWSROOM_STRIP_CTA.advisors.label}
      </Link>

      <Link
        href={NEWSROOM_STRIP_CTA.importGhostfolio.href}
        style={wmAccentStyle}
        onClick={() => trackAndNavigate(NEWSROOM_STRIP_CTA.importGhostfolio.target)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
          e.currentTarget.style.color = 'var(--accent-warm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.55)';
          e.currentTarget.style.color = 'var(--text-warm, var(--text))';
        }}
      >
        {NEWSROOM_STRIP_CTA.importGhostfolio.label}
      </Link>

      {surface === 'index' ? (
        <Link
          href={NEWSROOM_STRIP_CTA.importHub.href}
          style={secondaryStyle}
          onClick={() => trackAndNavigate(NEWSROOM_STRIP_CTA.importHub.target)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
            e.currentTarget.style.color = 'var(--accent-warm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-warm)';
            e.currentTarget.style.color = 'var(--text-warm, var(--text))';
          }}
        >
          {NEWSROOM_STRIP_CTA.importHub.label}
        </Link>
      ) : null}

      {surface === 'home' ? (
        <Link
          href="/newsroom"
          style={secondaryStyle}
          onClick={() => trackAndNavigate('newsroom_index')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
            e.currentTarget.style.color = 'var(--accent-warm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-warm)';
            e.currentTarget.style.color = 'var(--text-warm, var(--text))';
          }}
        >
          View All Industry News →
        </Link>
      ) : (
        <Link
          href="/blog"
          style={secondaryStyle}
          onClick={() => trackAndNavigate('engineering_blog')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
            e.currentTarget.style.color = 'var(--accent-warm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-warm)';
            e.currentTarget.style.color = 'var(--text-warm, var(--text))';
          }}
        >
          Engineering blog →
        </Link>
      )}

      <a
        href={openLink.href}
        target="_blank"
        rel="noopener noreferrer"
        style={secondaryStyle}
        onClick={() => trackAndNavigate('open_surface')}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
          e.currentTarget.style.color = 'var(--accent-warm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-warm)';
          e.currentTarget.style.color = 'var(--text-warm, var(--text))';
        }}
      >
        {openLink.label}
      </a>
    </div>
  );
}
