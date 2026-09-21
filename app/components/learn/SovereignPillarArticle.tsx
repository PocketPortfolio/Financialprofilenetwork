/**
 * Shared institutional pillar page shell for Open Portfolio architecture briefs.
 * TechArticle JSON-LD + AEO passage kit for search and citation agents.
 */
import Link from 'next/link';
import OpenProcurementFaq from '@/app/components/open/OpenProcurementFaq';
import { OPEN_AEO_PROCUREMENT_FAQS, OPEN_URLS, SURFACE_ORG } from '@/lib/canonical-claims';

export type AeoPassageKit = {
  /** One-sentence definition answer engines can quote. */
  definition: string;
  /** Explicit limitation / non-claim. */
  limitation: string;
  /** Public source or code receipt (URLs, packages — no internal docs paths). */
  sourceReceipt: string;
  /** ISO date last reviewed. */
  lastReviewed: string;
  /** Short comparison rows (honest concessions welcome). */
  comparisonRows?: ReadonlyArray<{ approach: string; fitsWhen: string; failsWhen: string }>;
  /** Sibling cluster links for the internal linking law. */
  siblingLinks?: ReadonlyArray<{ href: string; label: string }>;
};

export type SovereignPillarProps = {
  title: string;
  subtitle: string;
  body: string[];
  ctaHref: string;
  ctaLabel: string;
  breadcrumbLabel: string;
  /** URL slug under /learn/ — used for JSON-LD canonical */
  articleSlug: string;
  /** Optional procurement FAQ indices into OPEN_AEO_PROCUREMENT_FAQS (default: first 3). */
  procurementFaqIndices?: readonly number[];
  /** AEO passage kit — definition, limitation, receipt, comparison. */
  aeo?: AeoPassageKit;
};

const DEFAULT_PILLAR_FAQ_INDICES = [0, 1, 4] as const;

function pillarFaqs(indices: readonly number[]) {
  return indices.map((i) => OPEN_AEO_PROCUREMENT_FAQS[i]).filter(Boolean);
}

function buildTechArticleJsonLd(props: SovereignPillarProps) {
  const pageUrl = `${OPEN_URLS.home}/learn/${props.articleSlug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: props.title,
    description: props.subtitle,
    dateModified: props.aeo?.lastReviewed,
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
  const {
    title,
    subtitle,
    body,
    ctaHref,
    ctaLabel,
    breadcrumbLabel,
    articleSlug,
    procurementFaqIndices = DEFAULT_PILLAR_FAQ_INDICES,
    aeo,
  } = props;
  const pageUrl = `${OPEN_URLS.home}/learn/${articleSlug}`;
  const jsonLd = buildTechArticleJsonLd(props);
  const faqs = pillarFaqs(procurementFaqIndices);

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

        {aeo && (
          <aside
            style={{
              marginBottom: 28,
              padding: '16px 18px',
              border: '1px solid var(--border-subtle)',
              borderLeft: '3px solid var(--accent-warm)',
              borderRadius: 8,
              background: 'var(--surface)',
            }}
          >
            <p style={{ margin: 0, fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>
              <strong>Definition:</strong> {aeo.definition}
            </p>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: 'var(--text)' }}>Limitation:</strong> {aeo.limitation}
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 12,
                color: 'var(--text-secondary)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              Source: {aeo.sourceReceipt} · Last reviewed {aeo.lastReviewed}
            </p>
          </aside>
        )}

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

        {aeo?.comparisonRows && aeo.comparisonRows.length > 0 && (
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
              Honest comparison
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                }}
              >
                <thead>
                  <tr>
                    {['Approach', 'Fits when', 'Fails when'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text)',
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aeo.comparisonRows.map((row) => (
                    <tr key={row.approach}>
                      <td
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text)',
                          fontWeight: 600,
                          verticalAlign: 'top',
                        }}
                      >
                        {row.approach}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--border-subtle)',
                          verticalAlign: 'top',
                        }}
                      >
                        {row.fitsWhen}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--border-subtle)',
                          verticalAlign: 'top',
                        }}
                      >
                        {row.failsWhen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
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
          <Link
            href="/architecture"
            style={{
              display: 'inline-block',
              padding: '12px 18px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text)',
            }}
          >
            Architecture brief
          </Link>
          <Link
            href="/#contact"
            style={{
              display: 'inline-block',
              padding: '12px 18px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text)',
            }}
          >
            Book a diligence call
          </Link>
        </div>

        {aeo?.siblingLinks && aeo.siblingLinks.length > 0 && (
          <nav style={{ marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>Related clusters: </span>
            {aeo.siblingLinks.map((sib, i) => (
              <span key={sib.href}>
                {i > 0 && ' · '}
                <Link href={sib.href} style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
                  {sib.label}
                </Link>
              </span>
            ))}
          </nav>
        )}

        <OpenProcurementFaq pageUrl={pageUrl} faqs={faqs} heading="Diligence FAQ" />
      </div>
    </>
  );
}
