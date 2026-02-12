'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductionNavbar from '../components/marketing/ProductionNavbar';

function StackRevealContent() {
  const searchParams = useSearchParams();
  const unsubscribed = searchParams.get('unsubscribed') === '1';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';
  const utm = '?utm_source=weekly_stack_reveal&utm_medium=portal&utm_campaign=stack_reveal';

  return (
    <>
      <ProductionNavbar />
      <main style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 var(--space-6)' }}>
          {unsubscribed && (
            <div style={{
              marginBottom: 'var(--space-6)',
              padding: 'var(--space-4)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text)',
              fontSize: '15px',
            }}>
              You’re unsubscribed. We won’t send you more Stack Reveal emails. You can still use the app and this portal anytime.
            </div>
          )}
          <header style={{ marginBottom: 'var(--space-10)' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: '700',
              lineHeight: '1.2',
              color: 'var(--text)',
              marginBottom: 'var(--space-3)',
            }}>
              Stack Reveal: Your data, your stack
            </h1>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
            }}>
              A short guide to how Pocket Portfolio is built—Universal Import, local-first architecture, and the Founder's Club. No fluff; just the stack and why it matters.
            </p>
          </header>

          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--text)' }}>
              1. The problem: fragmented data
            </h2>
            <p style={{ marginBottom: 'var(--space-3)', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              Every broker has a different CSV. "Deal Date" vs "Trade Date." "Epic" vs "Symbol." We built <strong>Universal Import</strong> so you can bring any CSV that carries the right semantic content—we infer the columns, you get a normalized portfolio. No more "unsupported broker" walls.
            </p>
            <Link
              href={`/import${utm}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--signal)',
                color: 'var(--text-inverse)',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '15px',
              }}
            >
              Try Universal Import →
            </Link>
          </section>

          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--text)' }}>
              2. Why we don't want your data
            </h2>
            <p style={{ marginBottom: 'var(--space-3)', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              Your trades and portfolios stay <strong>local-first</strong>. We help you import, normalize, and analyze—without taking custody of your history. That's the Universal Data Engine: one place to bring broker CSVs, one normalized view, full control on your side.
            </p>
            <Link
              href={`/dashboard${utm}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '15px',
              }}
            >
              Open dashboard →
            </Link>
          </section>

          <section style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--text)' }}>
              3. Founder's Club: stop paying monthly
            </h2>
            <p style={{ marginBottom: 'var(--space-3)', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              One lifetime unlock. No recurring fees—just the full stack (Universal Import, themes, API, Sovereign Sync) for good. We've capped spots so it stays meaningful.
            </p>
            <Link
              href={`/sponsor${utm}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--accent-warm)',
                color: 'var(--text)',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '15px',
              }}
            >
              Explore Founder's Club →
            </Link>
          </section>

          <section style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--space-6)',
            marginTop: 'var(--space-8)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--text)' }}>
              Deep dives
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <Link href={`${baseUrl}/book/universal-llm-import${utm}`} style={{ color: 'var(--signal)', textDecoration: 'underline', fontSize: '15px' }}>
                  Universal LLM Import (book) — Building local-first, sovereign CSV ingestion
                </Link>
              </li>
              <li style={{ marginBottom: 'var(--space-2)' }}>
                <Link href={`${baseUrl}/import${utm}`} style={{ color: 'var(--signal)', textDecoration: 'underline', fontSize: '15px' }}>
                  CSV Import — Try the Universal Importer
                </Link>
              </li>
              <li>
                <Link href={`${baseUrl}/sponsor${utm}`} style={{ color: 'var(--signal)', textDecoration: 'underline', fontSize: '15px' }}>
                  Sponsor & Founder's Club — Lifetime access
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

export default function StackRevealPortalPage() {
  return (
    <Suspense fallback={null}>
      <StackRevealContent />
    </Suspense>
  );
}
