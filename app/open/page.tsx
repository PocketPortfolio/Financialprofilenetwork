import type { Metadata } from 'next';
import OpenLandingClient from './_components/OpenLandingClient';
import {
  NUMBERS_SNAPSHOT,
  OPEN_LANDING_COPY,
  OPEN_URLS,
  PACKAGES,
  SDK,
  SURFACE_ORG,
} from '../../lib/canonical-claims';

/**
 * app/open/page.tsx — Open Portfolio (O.) landing
 *
 * Server entry point. Resolves NUMBERS_SNAPSHOT receipts at build/request time
 * so Sovereign Threshold #3 catches drift before deploy, then hands the
 * resolved props to the client component for motion/interactivity.
 *
 * Narrative arc (CEO mandate 2026-05-15):
 *   1. Hero — substrate positioning.
 *   2. Sub-hero — AI + privacy as an architecture decision.
 *   3. Threat — REG-01 / REG-03 / CODB-01 as the scare.
 *   4. Pocket Portfolio bridge — adversarial test harness as live proof.
 *   5. Pillars + tracks + packages.
 *   6. Contact form -> /admin/analytics.
 */

export const metadata: Metadata = {
  title: 'The Sovereign Ingestion & Inference Layer',
  description: OPEN_LANDING_COPY.heroBody,
  alternates: { canonical: OPEN_URLS.home },
  openGraph: {
    title: 'Open Portfolio — The Sovereign Ingestion & Inference Layer',
    description: OPEN_LANDING_COPY.heroBody,
    url: OPEN_URLS.home,
    siteName: SURFACE_ORG.open.name,
    type: 'website',
  },
};

function findSnapshot(numbersPackRowId: string) {
  return NUMBERS_SNAPSHOT.find((r) => r.numbersPackRowId === numbersPackRowId) ?? null;
}

function formatValue(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return v.toLocaleString('en-GB');
  return String(v);
}

export default function OpenPortfolioLandingPage() {
  const mau = findSnapshot('TRAC-07');
  const allTimeDownloads = findSnapshot('TRAC-01');
  const scImpressions = findSnapshot('TRAC-09');
  const adapterFloor = findSnapshot('SDK-04');
  const gdprFine = findSnapshot('REG-01');
  const euAiActFine = findSnapshot('REG-03');
  const breachCost = findSnapshot('CODB-01');

  return (
    <OpenLandingClient
      copy={OPEN_LANDING_COPY}
      sdk={{
        name: SDK.name,
        license: SDK.license,
        brokerAdapterCount: SDK.brokerAdapterCount,
      }}
      packages={PACKAGES.map((p) => ({
        name: p.name,
        description: p.description,
        category: p.category,
      }))}
      receipts={{
        mau: {
          value: formatValue(mau?.value),
          label: 'MAU (GA4, 28-day)',
          citation: 'TRAC-07',
        },
        allTimeDownloads: {
          value: formatValue(allTimeDownloads?.value),
          label: 'npm downloads (all-time)',
          citation: 'TRAC-01',
        },
        scImpressions: {
          value: formatValue(scImpressions?.value),
          label: 'Search Console impressions',
          citation: 'TRAC-09 (3-mo)',
        },
        adapterFloor: {
          value: `${formatValue(adapterFloor?.value)}+`,
          label: 'Broker adapter floor',
          citation: 'SDK-04',
        },
      }}
      threats={{
        gdpr: {
          headline: 'GDPR Art. 83(5)',
          value: formatValue(gdprFine?.value),
          citation: 'REG-01',
          context: 'Maximum administrative fine — what your DPO already weighs against every new data store.',
        },
        euAiAct: {
          headline: 'EU AI Act Art. 99 · Tier 1',
          value: formatValue(euAiActFine?.value),
          citation: 'REG-03',
          context: 'The legislation enterprises will be audited against from 2026 onward.',
        },
        breach: {
          headline: 'Avg. financial-services breach · 2025',
          value: formatValue(breachCost?.value),
          citation: 'CODB-01',
          context: 'IBM Cost-of-a-Data-Breach 2025. The cheque, not the headline.',
        },
      }}
    />
  );
}
