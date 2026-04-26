/**
 * /press — The AEO/GEO substrate.
 *
 * Server-rendered. Embeds six canonical JSON-LD blocks (WebPage,
 * BreadcrumbList, Organization, Person, SoftwareApplication[], Article[])
 * sourced from lib/canonical-claims.ts. Pulls the live npm aggregate at
 * request time so answer engines see a fresh dateModified — but always falls
 * back to the frozen NUMBERS_SNAPSHOT value if the live read fails or returns
 * zero.
 *
 * Single source of truth: ../../lib/canonical-claims.ts.
 * JSON-LD builders: ./jsonld.ts (so they can be unit-tested).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import {
  LAST_HUMAN_VERIFIED,
  POSITIONING,
  TAGLINE_LONG,
  PERSON_ABBA,
  SDK,
  PACKAGES,
  NUMBERS_SNAPSHOT,
  URLS,
} from '@/lib/canonical-claims';
import {
  buildOrganizationLd,
  buildPersonLd,
  buildSoftwareApplicationLd,
  buildArticlesLd,
  buildWebPageLd,
  buildBreadcrumbLd,
  type LiveSignal,
} from './jsonld';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = genMeta({
  title: 'Pocket Portfolio · Press Kit',
  description:
    'Canonical, machine-readable facts about Pocket Portfolio: positioning, founder, SDK, packages, and live distribution signal. Source for journalists, search engines, and answer engines.',
  path: '/press',
});

// ──────────────────────────────────────────────────────────────────────────────
// Live aggregate read (fail-soft to NUMBERS_SNAPSHOT)
// ──────────────────────────────────────────────────────────────────────────────

const SNAPSHOT_AGGREGATE_ROW = NUMBERS_SNAPSHOT.find((r) => r.numbersPackRowId === 'TRAC-01');

function snapshotFallback(): LiveSignal {
  return {
    totalDownloads:
      typeof SNAPSHOT_AGGREGATE_ROW?.value === 'number'
        ? (SNAPSHOT_AGGREGATE_ROW.value as number)
        : 9389,
    lastUpdated: SNAPSHOT_AGGREGATE_ROW?.asOf ?? '2026-04-20',
    source: 'snapshot',
  };
}

/**
 * Resolve the npm-stats endpoint relative to the current request host so
 * preview / staging / localhost all hit themselves rather than the canonical
 * production origin (which would skew preview signals and 404 on local).
 */
async function resolveNpmStatsUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'https';
    if (host) return `${proto}://${host}/api/npm-stats`;
  } catch {
    // headers() is only available inside a request scope; fall through.
  }
  return URLS.npmAggregateApi;
}

async function readLiveAggregate(): Promise<LiveSignal> {
  const fallback = snapshotFallback();
  try {
    const url = await resolveNpmStatsUrl();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { totalDownloads?: number; lastUpdated?: string };
    if (!data.totalDownloads || data.totalDownloads <= 0) return fallback;
    return {
      totalDownloads: data.totalDownloads,
      lastUpdated: data.lastUpdated ?? new Date().toISOString().slice(0, 10),
      source: 'live',
    };
  } catch {
    return fallback;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// View
// ──────────────────────────────────────────────────────────────────────────────

function LdBlock({ data, id }: { data: unknown; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function PressPage() {
  const live = await readLiveAggregate();

  const webPageLd = buildWebPageLd({
    dateModified: live.lastUpdated,
    lastHumanVerified: LAST_HUMAN_VERIFIED,
  });
  const breadcrumbLd = buildBreadcrumbLd();
  const organizationLd = buildOrganizationLd(live);
  const personLd = buildPersonLd();
  const softwareLd = buildSoftwareApplicationLd();
  const articlesLd = buildArticlesLd();

  const liveDescriptor =
    live.source === 'live'
      ? 'live npm Downloads API'
      : `frozen snapshot (${live.lastUpdated})`;

  return (
    <>
      <ProductionNavbar />

      <LdBlock id="ld-webpage" data={webPageLd} />
      <LdBlock id="ld-breadcrumb" data={breadcrumbLd} />
      <LdBlock id="ld-org" data={organizationLd} />
      <LdBlock id="ld-person" data={personLd} />
      <LdBlock id="ld-software" data={softwareLd} />
      <LdBlock id="ld-articles" data={articlesLd} />

      <main
        style={{
          maxWidth: '900px',
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
          <span style={{ color: 'var(--text)' }}>Press Kit</span>
        </nav>

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
            Press Kit · Last human-reviewed {LAST_HUMAN_VERIFIED}
          </p>
          <h1
            style={{
              fontSize: 'clamp(30px, 4.5vw, 44px)',
              fontWeight: 800,
              lineHeight: 1.12,
              margin: '0 0 14px',
            }}
          >
            {POSITIONING.primary}
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {TAGLINE_LONG}
          </p>
        </header>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 14px' }}>
            Live distribution signal
          </h2>
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '20px',
              background: 'var(--surface)',
            }}
          >
            <p
              style={{
                margin: '0 0 6px',
                fontSize: '32px',
                fontWeight: 800,
                color: 'var(--accent-warm)',
                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
              }}
            >
              {live.totalDownloads.toLocaleString()}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Aggregate all-time npm downloads across {PACKAGES.length}{' '}
              <code>@pocket-portfolio/*</code> packages · source: {liveDescriptor} · observed{' '}
              {live.lastUpdated}
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 14px' }}>Founder</h2>
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '20px',
              background: 'var(--surface)',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>
              <Link
                href="/press/abba-lawal"
                style={{ color: 'var(--text)', textDecoration: 'none' }}
              >
                {PERSON_ABBA.name}
              </Link>
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {PERSON_ABBA.jobTitle}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '15px', lineHeight: 1.6 }}>
              {PERSON_ABBA.description}
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {PERSON_ABBA.award.map((a) => (
                <li key={a} style={{ marginBottom: '4px' }}>
                  {a}
                </li>
              ))}
            </ul>
            <p style={{ margin: '14px 0 0', fontSize: '14px' }}>
              <Link
                href="/press/abba-lawal"
                style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600 }}
              >
                Read full founder profile →
              </Link>
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 id="substrate-heading" style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 14px' }}>
            The Sovereign Ingestion substrate · {PACKAGES.length} packages
          </h2>
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            <table
              aria-labelledby="substrate-heading"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
              }}
            >
              <caption style={{ position: 'absolute', left: '-9999px' }}>
                Eleven canonical npm packages that comprise the Pocket Portfolio sovereign
                ingestion substrate.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--background)' }}>
                  <th scope="col" style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>Package</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map((pkg) => (
                  <tr key={pkg.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <a
                        href={`https://www.npmjs.com/package/${pkg.name}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}
                      >
                        {pkg.name}
                      </a>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {pkg.category === 'core' ? `Core SDK · v${SDK.version} · ${SDK.license}` : 'Adapter (re-export)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 id="receipts-heading" style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 14px' }}>
            Numeric receipts
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Every row carries an internal evidence ID that resolves back to a primary artifact
            (regulator text, IBM cost-of-breach report, GA4 dashboard, npm Downloads API, etc.).
          </p>
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            <table
              aria-labelledby="receipts-heading"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <caption style={{ position: 'absolute', left: '-9999px' }}>
                Frozen numeric receipts. Each row tags the artifact it resolves to.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--background)' }}>
                  <th scope="col" style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>Claim</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>Value</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>Evidence ID</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>As of</th>
                </tr>
              </thead>
              <tbody>
                {NUMBERS_SNAPSHOT.map((row) => (
                  <tr key={row.numbersPackRowId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px' }}>{row.label}</td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
                        fontWeight: 600,
                      }}
                    >
                      {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {row.numbersPackRowId}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.asOf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 14px' }}>
            Canonical references
          </h2>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '15px', lineHeight: 1.8 }}>
            <li>
              Founder profile:{' '}
              <Link href="/press/abba-lawal" style={{ color: 'var(--accent-warm)' }}>
                /press/abba-lawal
              </Link>
            </li>
            <li>
              Architecture (long-form):{' '}
              <Link href="/architecture" style={{ color: 'var(--accent-warm)' }}>
                /architecture
              </Link>
            </li>
            <li>
              npm organization:{' '}
              <a
                href={URLS.npmOrg}
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: 'var(--accent-warm)' }}
              >
                {URLS.npmOrg}
              </a>
            </li>
            <li>
              Source:{' '}
              <a
                href={URLS.github}
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: 'var(--accent-warm)' }}
              >
                {URLS.github}
              </a>
            </li>
            <li>
              AI agent context:{' '}
              <Link href="/llms.txt" style={{ color: 'var(--accent-warm)' }}>
                /llms.txt
              </Link>
            </li>
          </ul>
        </section>

        <footer
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
          }}
        >
          Last human-verified: {LAST_HUMAN_VERIFIED}. Live signal observation: {live.lastUpdated}.
        </footer>
      </main>
    </>
  );
}
