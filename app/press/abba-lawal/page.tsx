/**
 * /press/abba-lawal — single-entity Person page (Phase 2 · Pillar C-1).
 *
 * Purpose: provide a clean rel="me" target for off-platform profiles
 * (LinkedIn, CoderLegion, dev.to, GitHub) so external entity-disambiguation
 * crawlers resolve to a SINGLE Person URL rather than the multi-entity
 * /press kit.
 *
 * Single source of truth: ../../../lib/canonical-claims.ts.
 * The Person @id deliberately matches the founder fragment used elsewhere
 * (`${ORG.url}/press#abba-lawal`) so this page is treated as an additional
 * facet of the same entity, not a duplicate.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import {
  LAST_HUMAN_VERIFIED,
  MOAT_CLAIMS,
  ORG,
  PERSON_ABBA,
  POSITIONING,
  URLS,
} from '@/lib/canonical-claims';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_URL = URLS.personAbba;
const PERSON_ID = `${URLS.press}#abba-lawal`;

// Panel photo (UK Black Business Show): source + responsive variants under public/press/abba/.
// Rebuild from IMG_9086-original.png: `node scripts/build-press-image-variants.mjs`
const PORTRAIT_STEM = '/press/abba/abba-uk-black-business-show';
const PORTRAIT_SIZES = '340px';
const PORTRAIT_SRC_SET_AVIF = `${PORTRAIT_STEM}-820.avif 820w, ${PORTRAIT_STEM}-1640.avif 1640w, ${PORTRAIT_STEM}-3072.avif 3072w`;
const PORTRAIT_SRC_SET_WEBP = `${PORTRAIT_STEM}-820.webp 820w, ${PORTRAIT_STEM}-1640.webp 1640w, ${PORTRAIT_STEM}-3072.webp 3072w`;
const PORTRAIT_SRC_SET_JPG = `${PORTRAIT_STEM}-820.jpg 820w, ${PORTRAIT_STEM}-1640.jpg 1640w, ${PORTRAIT_STEM}-3072.jpg 3072w`;
/** Canonical still for crawlers — same path as production press kit. */
const PORTRAIT_CANONICAL_URL = `${ORG.url}/press/abba/IMG_9086-original.png`;
const PORTRAIT_CAPTION =
  'Abba Lawal speaking on a panel at the UK Black Business Show 2024 (JPMorgan Chase / Moody\u2019s stage).';
const PORTRAIT_CREDIT = 'UK Black Business Show 2024';

export const metadata: Metadata = genMeta({
  title: `${PERSON_ABBA.name} · Founder · Pocket Portfolio`,
  description: PERSON_ABBA.description,
  path: '/press/abba-lawal',
});

function LdBlock({ data, id }: { data: unknown; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** CoderLegion has no bundled brand SVG; this mark reads as a dev-community glyph (not the GitHub octocat). */
function CoderLegionGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8.5 9.5 6 12l2.5 2.5M15.5 9.5 18 12l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function profileLinkMeta(url: string): {
  label: string;
  icon: 'linkedin' | 'github' | 'coderlegion';
} {
  const u = url.toLowerCase();
  if (u.includes('linkedin.com')) {
    return { label: `${PERSON_ABBA.name} on LinkedIn`, icon: 'linkedin' };
  }
  if (u.includes('github.com')) {
    return { label: 'Pocket Portfolio on GitHub', icon: 'github' };
  }
  return { label: 'Pocket Portfolio on CoderLegion', icon: 'coderlegion' };
}

export default function AbbaLawalPersonPage() {
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    mainEntityOfPage: PAGE_URL,
    url: PAGE_URL,
    name: PERSON_ABBA.name,
    jobTitle: PERSON_ABBA.jobTitle,
    description: PERSON_ABBA.description,
    image: { '@id': `${PAGE_URL}#portrait` },
    worksFor: {
      '@type': 'Organization',
      '@id': `${ORG.url}#organization`,
      name: ORG.name,
      url: ORG.url,
    },
    alumniOf: PERSON_ABBA.alumniOf,
    knowsAbout: PERSON_ABBA.knowsAbout,
    award: PERSON_ABBA.award,
    sameAs: PERSON_ABBA.sameAs,
  };

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: `${PERSON_ABBA.name} · Founder · Pocket Portfolio`,
    description: PERSON_ABBA.description,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${ORG.url}#website`,
      url: ORG.url,
      name: ORG.name,
    },
    mainEntity: { '@id': PERSON_ID },
    primaryImageOfPage: ORG.logo,
    dateModified: LAST_HUMAN_VERIFIED,
    lastReviewed: LAST_HUMAN_VERIFIED,
  };

  // ImageObject for the founder portrait (deck slide export; committed under public/press/abba).
  const portraitLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${PAGE_URL}#portrait`,
    contentUrl: PORTRAIT_CANONICAL_URL,
    url: PORTRAIT_CANONICAL_URL,
    encodingFormat: 'image/png',
    width: 1024,
    height: 459,
    caption: PORTRAIT_CAPTION,
    creditText: PORTRAIT_CREDIT,
    representativeOfPage: true,
    about: { '@id': PERSON_ID },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORG.url },
      { '@type': 'ListItem', position: 2, name: 'Press Kit', item: URLS.press },
      { '@type': 'ListItem', position: 3, name: PERSON_ABBA.name, item: PAGE_URL },
    ],
  };

  const moat = MOAT_CLAIMS.limitedScopeProcessor;

  return (
    <>
      <ProductionNavbar />

      <LdBlock id="ld-profile-webpage" data={webPageLd} />
      <LdBlock id="ld-profile-breadcrumb" data={breadcrumbLd} />
      <LdBlock id="ld-profile-person" data={personLd} />
      <LdBlock id="ld-profile-portrait" data={portraitLd} />

      <main
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
          color: 'var(--text)',
        }}
      >
        <nav aria-label="Breadcrumb" style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>/</span>
          <Link href="/press" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Press Kit
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>{PERSON_ABBA.name}</span>
        </nav>

        <figure
          style={{
            margin: '0 0 24px',
            maxWidth: '340px',
            border: '1px solid var(--accent-warm)',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'var(--surface)',
          }}
        >
          <picture>
            <source type="image/avif" srcSet={PORTRAIT_SRC_SET_AVIF} sizes={PORTRAIT_SIZES} />
            <source type="image/webp" srcSet={PORTRAIT_SRC_SET_WEBP} sizes={PORTRAIT_SIZES} />
            <img
              src={`${PORTRAIT_STEM}-820.jpg`}
              srcSet={PORTRAIT_SRC_SET_JPG}
              sizes={PORTRAIT_SIZES}
              alt={PORTRAIT_CAPTION}
              width={820}
              height={1024}
              loading="eager"
              decoding="async"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </picture>
          <figcaption
            style={{
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--accent-warm)',
              fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
              lineHeight: 1.45,
            }}
          >
            {PORTRAIT_CAPTION}
            {' \u00b7 '}
            <span style={{ opacity: 0.75 }}>Credit: {PORTRAIT_CREDIT}</span>
          </figcaption>
        </figure>

        <header style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
              color: 'var(--accent-warm)',
              fontSize: '12px',
              letterSpacing: '0.12em',
              margin: '0 0 12px',
              textTransform: 'uppercase',
            }}
          >
            Founder · Last human-reviewed {LAST_HUMAN_VERIFIED}
          </p>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 800,
              lineHeight: 1.12,
              margin: '0 0 8px',
            }}
          >
            {PERSON_ABBA.name}
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              margin: '0 0 14px',
              fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
            }}
          >
            {PERSON_ABBA.jobTitle}
          </p>
          <p style={{ fontSize: '16px', lineHeight: 1.65, margin: 0 }}>
            {PERSON_ABBA.description}
          </p>
        </header>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }}>
            What I work on
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '15px', lineHeight: 1.65 }}>
            <strong>Pocket Portfolio</strong> — {POSITIONING.primary}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            Architecture: <strong>{moat.phrase}</strong>. {moat.longForm}
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }}>
            Institutional receipts
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {PERSON_ABBA.award.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }}>
            Education
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {PERSON_ABBA.alumniOf.map((school) => (
              <li key={school.name}>
                <a
                  href={school.url}
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {school.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }}>
            Find me
          </h2>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {PERSON_ABBA.sameAs.map((url) => {
              const { label, icon } = profileLinkMeta(url);
              return (
                <li key={url}>
                  <a
                    href={url}
                    rel="me noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-warm)] bg-[var(--surface)] text-[var(--text-primary)] no-underline transition-[box-shadow] hover:shadow-[0_4px_14px_-4px_color-mix(in_srgb,var(--accent-warm)_45%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-warm)]"
                  >
                    {icon === 'linkedin' ? (
                      <Linkedin size={22} strokeWidth={1.75} aria-hidden />
                    ) : icon === 'github' ? (
                      <Github size={22} strokeWidth={1.75} aria-hidden />
                    ) : (
                      <CoderLegionGlyph size={22} />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <footer
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid var(--accent-warm)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: 0 }}>
            Canonical Person URI: <code style={{ fontSize: '12px' }}>{PERSON_ID}</code>. This page
            and{' '}
            <Link href="/press" style={{ color: 'var(--text-secondary)' }}>
              the Press Kit
            </Link>{' '}
            are two facets of the same entity.
          </p>
        </footer>
      </main>
    </>
  );
}