/**
 * Shared institutional pillar page shell for Open Portfolio Wave 1 doctrine.
 * Wave 2: TechArticle JSON-LD for LLM citation.
 */
import Link from 'next/link';
import { OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export type SovereignPillarProps = {
  title: string;
  subtitle: string;
  body: string[];
  ctaHref: string;
  ctaLabel: string;
  breadcrumbLabel: string;
  /** URL slug under /learn/ — used for JSON-LD canonical */
  articleSlug: string;
};

function buildTechArticleJsonLd(props: SovereignPillarProps) {
  const pageUrl = `${OPEN_URLS.home}/learn/${props.articleSlug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: props.title,
    description: props.subtitle,
    author: {
      '@type': 'Organization',
      name: SURFACE_ORG.open.name,
      url: OPEN_URLS.home,
    },
    publisher: {
      '@type': 'Organization',
      name: SURFACE_ORG.open.name,
      logo: {
        '@type': 'ImageObject',
        url: SURFACE_ORG.open.logo,
      },
    },
    mainEntityOfPage: pageUrl,
    url: pageUrl,
  };
}

export default function SovereignPillarArticle(props: SovereignPillarProps) {
  const { title, subtitle, body, ctaHref, ctaLabel, breadcrumbLabel } = props;
  const jsonLd = buildTechArticleJsonLd(props);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
        }}
      >
        <nav style={{ marginBottom: 24, fontSize: 14 }}>
          <Link href="/learn" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Learn
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>{breadcrumbLabel}</span>
        </nav>

        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 16,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(17px, 2vw, 19px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        </header>

        <article style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {body.map((para) => (
            <p
              key={para.slice(0, 48)}
              style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}
            >
              {para}
            </p>
          ))}
        </article>

        <div style={{ marginTop: 40 }}>
          <Link
            href={ctaHref}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: 'var(--accent-warm)',
              color: 'var(--text-warm)',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
