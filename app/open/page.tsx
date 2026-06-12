import type { Metadata } from 'next';
import OpenLandingClient from './_components/OpenLandingClient';
import {
  NUMBERS_SNAPSHOT,
  OPEN_LANDING_COPY,
  OPEN_URLS,
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
 * Narrative arc (CEO mandate 2026-06):
 *   1. Hook — enterprise problem + discovery-call CTA.
 *   2. Proof — Split-Brain architecture video.
 *   3. Integration — developer experience (adapters, SDK).
 *   4. Board moat — regulatory liability + design-partnership credibility.
 *   5. Contact form → Firestore → /admin/analytics.
 */

export const metadata: Metadata = {
  title: 'The BYOC Inference Boundary for Regulated Finance',
  description: OPEN_LANDING_COPY.heroBody,
  alternates: { canonical: OPEN_URLS.home },
  openGraph: {
    title: 'Open Portfolio — The BYOC Inference Boundary for Regulated Finance',
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
  const gdprFine = findSnapshot('REG-01');
  const euAiActFine = findSnapshot('REG-03');
  const breachCost = findSnapshot('CODB-01');

  return (
    <OpenLandingClient
      copy={OPEN_LANDING_COPY}
      sdk={{ brokerAdapterCount: SDK.brokerAdapterCount }}
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
