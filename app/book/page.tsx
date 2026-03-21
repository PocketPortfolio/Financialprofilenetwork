import Link from 'next/link';
import type { Metadata } from 'next';
import { PUBLISHED_BOOKS } from '@/app/lib/books/catalog';

const baseUrl = 'https://www.pocketportfolio.app';
const indexUrl = `${baseUrl}/book`;

export const metadata: Metadata = {
  title: 'Books — Technical Press | Pocket Portfolio',
  description:
    'Long-form technical books from Pocket Portfolio: local-first finance, sovereign data, CSV ingestion, and AI architecture.',
  robots: 'index,follow,max-image-preview:large',
  alternates: { canonical: indexUrl },
  openGraph: {
    title: 'Books — Pocket Portfolio Technical Press',
    description: 'Published technical books on local-first finance and sovereign AI.',
    type: 'website',
    url: indexUrl,
    siteName: 'Pocket Portfolio',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Books — Pocket Portfolio Technical Press',
    description: 'Published technical books on local-first finance and sovereign AI.',
  },
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList' as const,
  name: 'Pocket Portfolio Technical Press',
  description: 'Published technical books',
  numberOfItems: PUBLISHED_BOOKS.length,
  itemListElement: PUBLISHED_BOOKS.map((book, i) => ({
    '@type': 'ListItem' as const,
    position: i + 1,
    url: `${baseUrl}/book/${book.slug}`,
    name: `${book.title}: ${book.subtitle}`,
  })),
};

export default function BookIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="book-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <header
          className="book-hero"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '3.5rem 1.5rem',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 50%, var(--surface) 100%)',
            color: 'var(--text)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              position: 'relative',
              margin: '0 auto',
              maxWidth: '48rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                marginBottom: '0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--text-secondary)',
              }}
            >
              Technical Press
            </p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Books
            </h1>
            <p
              style={{
                margin: '1rem auto 0',
                maxWidth: '36rem',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}
            >
              Long-form guides on local-first finance, data sovereignty, and how we build Pocket Portfolio—evidence
              first, no vendor lock-in.
            </p>
          </div>
        </header>

        <main
          style={{
            margin: '0 auto',
            maxWidth: '48rem',
            padding: '3rem 1.5rem 4rem',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {PUBLISHED_BOOKS.map((book) => (
              <li key={book.slug}>
                <Link
                  href={`/book/${book.slug}`}
                  style={{
                    display: 'block',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)',
                    padding: '1.5rem',
                    background: 'var(--surface-elevated)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700 }}>{book.title}</h2>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-warm)' }}>
                    {book.subtitle}
                  </p>
                  <p
                    style={{
                      marginTop: '1rem',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {book.description}
                  </p>
                  <span style={{ marginTop: '1.25rem', display: 'inline-flex', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-warm)' }}>
                    Read book →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Public architecture challenge
            </h2>
            <Link
              href="/challenge"
              style={{
                display: 'block',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.35rem)', fontWeight: 700 }}>
                Zero-Trust Architecture Challenge
              </h3>
              <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-warm)' }}>
                For CTOs &amp; lead engineers
              </p>
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                }}
              >
                Three levels: truncated CSV ingest, fixed-schema aggregates vs. cloud RAG, and stateless inference.
                Finish to unlock email with technical reading and join links.
              </p>
              <span
                style={{
                  marginTop: '1.25rem',
                  display: 'inline-flex',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--accent-warm)',
                }}
              >
                Start challenge →
              </span>
            </Link>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Sales enablement
            </h2>
            <Link
              href="/playbooks/sovereign-strike"
              style={{
                display: 'block',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <h3 style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.35rem)', fontWeight: 700 }}>The Sovereign Strike</h3>
              <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-warm)' }}>
                Enterprise Objection Matrix
              </p>
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                }}
              >
                Interactive training: C-suite objections and strategic reframes for local-first and sovereign AI—timed
                choices, XP, and badges.
              </p>
              <span style={{ marginTop: '1.25rem', display: 'inline-flex', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-warm)' }}>
                Open playbook →
              </span>
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
