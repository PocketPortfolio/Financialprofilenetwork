'use client';

import Link from 'next/link';
import {
  OPEN_INSTITUTIONAL_PILLARS,
  OPEN_LEARN_HUB_COPY,
  OPEN_LEARN_PHILOSOPHY,
} from '@/lib/canonical-claims';

type BriefCard = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  url: string;
};

function BriefCardLink({ brief, featured }: { brief: BriefCard; featured?: boolean }) {
  return (
    <Link
      href={`/learn/${brief.slug}`}
      style={{
        background: 'var(--surface)',
        border: featured ? '2px solid var(--accent-warm)' : '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: featured ? '26px' : '22px',
        textDecoration: 'none',
        color: 'var(--text)',
        transition: 'border-color 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        minHeight: featured ? '220px' : '180px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-warm)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = featured
          ? 'var(--accent-warm)'
          : 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span
        style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'color-mix(in srgb, var(--accent-warm) 12%, transparent)',
          color: 'var(--accent-warm)',
          marginBottom: '12px',
          width: 'fit-content',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {brief.category}
      </span>
      <h2
        style={{
          fontSize: featured ? '21px' : '18px',
          fontWeight: 700,
          marginBottom: '10px',
          lineHeight: 1.3,
        }}
      >
        {brief.title}
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: 0,
          flexGrow: 1,
        }}
      >
        {brief.summary}
      </p>
      <span
        style={{
          marginTop: '16px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--accent-warm)',
        }}
      >
        Read brief →
      </span>
    </Link>
  );
}

export default function OpenLearnHub() {
  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
      }}
    >
      <header style={{ marginBottom: '40px', maxWidth: '760px' }}>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent-warm)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          Open Portfolio · Learn
        </p>
        <h1
          style={{
            fontSize: 'clamp(30px, 5vw, 44px)',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: '14px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {OPEN_LEARN_HUB_COPY.title}
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {OPEN_LEARN_HUB_COPY.subtitle}
        </p>
      </header>

      <section aria-labelledby="institutional-pillars-heading" style={{ marginBottom: '48px' }}>
        <h2
          id="institutional-pillars-heading"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '18px',
          }}
        >
          Primary briefs
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {OPEN_INSTITUTIONAL_PILLARS.map((brief) => (
            <BriefCardLink key={brief.slug} brief={brief} featured />
          ))}
        </div>
      </section>

      <section aria-labelledby="philosophy-heading" style={{ marginBottom: '48px' }}>
        <h2
          id="philosophy-heading"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '18px',
          }}
        >
          {OPEN_LEARN_HUB_COPY.philosophyHeading}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {OPEN_LEARN_PHILOSOPHY.map((brief) => (
            <BriefCardLink key={brief.slug} brief={brief} />
          ))}
        </div>
      </section>

      <section
        style={{
          border: '1px solid color-mix(in srgb, var(--accent-warm) 35%, transparent)',
          borderRadius: '12px',
          padding: '32px',
          background: 'color-mix(in srgb, var(--accent-warm) 6%, var(--surface))',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
          {OPEN_LEARN_HUB_COPY.ctaTitle}
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            marginBottom: '22px',
            lineHeight: 1.6,
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {OPEN_LEARN_HUB_COPY.ctaBody}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href={OPEN_LEARN_HUB_COPY.ctaPrimaryHref}
            style={{
              display: 'inline-block',
              background: 'var(--accent-warm)',
              color: 'var(--text-warm, #1a1208)',
              padding: '12px 22px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {OPEN_LEARN_HUB_COPY.ctaPrimaryLabel}
          </Link>
          <Link
            href={OPEN_LEARN_HUB_COPY.ctaSecondaryHref}
            style={{
              display: 'inline-block',
              border: '2px solid var(--accent-warm)',
              color: 'var(--accent-warm)',
              padding: '12px 22px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              background: 'transparent',
            }}
          >
            {OPEN_LEARN_HUB_COPY.ctaSecondaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
