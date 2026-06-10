import { Timestamp, type Firestore } from 'firebase-admin/firestore';
import type { LandingPageVariant } from '@/lib/landing-retail-variant';
import { LANDING_VARIANT_TEST_ID } from '@/lib/landing-retail-variant';

export type LandingAbCohortRow = {
  variant: LandingPageVariant;
  pageViews: number;
  bounces: number;
  bounceRatePercent: number | null;
  csvAhaCount: number;
  heroDropzoneCheckoutStarts: number;
  conversionRatePercent: number | null;
};

export type LandingAbCohortPerformance = {
  testId: string;
  control: LandingAbCohortRow;
  retail: LandingAbCohortRow;
  degraded?: boolean;
  degradedReason?: string;
  firestoreScan?: { docsRead: number; maxDocs: number };
};

const HERO_DROPZONE_UTM = {
  source: 'landing',
  medium: 'hero_dropzone',
} as const;

function emptyRow(variant: LandingPageVariant): LandingAbCohortRow {
  return {
    variant,
    pageViews: 0,
    bounces: 0,
    bounceRatePercent: null,
    csvAhaCount: 0,
    heroDropzoneCheckoutStarts: 0,
    conversionRatePercent: null,
  };
}

function finalizeRow(row: LandingAbCohortRow): LandingAbCohortRow {
  const bounceRatePercent =
    row.pageViews > 0 ? Math.round((row.bounces / row.pageViews) * 1000) / 10 : null;
  const conversionRatePercent =
    row.pageViews > 0
      ? Math.round((row.heroDropzoneCheckoutStarts / row.pageViews) * 10000) / 100
      : null;
  return { ...row, bounceRatePercent, conversionRatePercent };
}

export async function getLandingAbCohortPerformance(
  db: Firestore,
  startDate: Date,
  scanLimit: number
): Promise<LandingAbCohortPerformance> {
  const startTimestamp = Timestamp.fromDate(startDate);
  const rows: Record<LandingPageVariant, LandingAbCohortRow> = {
    control: emptyRow('control'),
    retail: emptyRow('retail'),
  };

  try {
    const abSnap = await db
      .collection('landingAbEvents')
      .where('timestamp', '>=', startTimestamp)
      .orderBy('timestamp', 'desc')
      .limit(scanLimit)
      .get();

    abSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.testId !== LANDING_VARIANT_TEST_ID) return;
      const variant = data.landingVariant as LandingPageVariant;
      if (variant !== 'control' && variant !== 'retail') return;
      const eventType = data.eventType as string;
      if (eventType === 'exposure') rows[variant].pageViews++;
      else if (eventType === 'bounce') rows[variant].bounces++;
      else if (eventType === 'csv_aha') rows[variant].csvAhaCount++;
    });

    // Single-field timestamp query only — filter eventType/UTM in memory (no composite index).
    // Matches getMonetizationFunnelBoardData pattern in admin analytics route.
    const checkoutSnap = await db
      .collection('monetizationFunnelEvents')
      .where('timestamp', '>=', startTimestamp)
      .orderBy('timestamp', 'desc')
      .limit(scanLimit)
      .get();

    checkoutSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.eventType !== 'checkout_start') return;
      if (data.utm_source !== HERO_DROPZONE_UTM.source) return;
      if (data.utm_medium !== HERO_DROPZONE_UTM.medium) return;
      const variant = data.landing_variant as LandingPageVariant;
      if (variant !== 'control' && variant !== 'retail') return;
      rows[variant].heroDropzoneCheckoutStarts++;
    });

    return {
      testId: LANDING_VARIANT_TEST_ID,
      control: finalizeRow(rows.control),
      retail: finalizeRow(rows.retail),
      firestoreScan: {
        docsRead: abSnap.size + checkoutSnap.size,
        maxDocs: scanLimit * 2,
      },
    };
  } catch (error) {
    console.error('[landing-ab-cohort]', error);
    return {
      testId: LANDING_VARIANT_TEST_ID,
      control: emptyRow('control'),
      retail: emptyRow('retail'),
      degraded: true,
      degradedReason: error instanceof Error ? error.message : 'unknown',
    };
  }
}
